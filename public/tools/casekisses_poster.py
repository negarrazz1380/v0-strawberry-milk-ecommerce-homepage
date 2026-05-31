#!/usr/bin/env python3
"""Case Kisses Poster — local web UI wrapper for tiktok_poster.py.

Spins up an HTTP server on localhost:8765 and opens the default browser.
The single-page UI offers two path inputs (with native macOS file pickers
via `osascript`), Start/Stop buttons, a live SSE log, and a progress bar.

Standard library only — no Flask, no Jinja, no tkinter.
"""

from __future__ import annotations

import http.server
import json
import os
import queue
import re
import subprocess
import sys
import threading
import time
import webbrowser
from pathlib import Path
from urllib.parse import parse_qs, urlparse


PORT = 8765
HOME = Path.home()
BASE_DIR = HOME / "Desktop" / "CaseKisses"
CONFIG_PATH = BASE_DIR / "config.json"
SCRIPT_PATH = Path(__file__).resolve().parent / "tiktok_poster.py"
DEFAULT_VIDEO_DIR = BASE_DIR / "videos"
DEFAULT_QUEUE_PATH = BASE_DIR / "posting-queue.json"

# Module-level state shared by the HTTP handlers and the worker thread.
# `_state_lock` guards every mutation of the lists/process below; numeric
# counters are written only from the worker thread so reads are torn-but-
# harmless.
_state_lock = threading.Lock()
_subscribers: list[queue.Queue] = []  # one queue per live SSE connection
_process: subprocess.Popen | None = None
_worker_thread: threading.Thread | None = None
_posted_count = 0
_total_planned = 0
_stop_requested = False

_ITEM_RE = re.compile(r"^\[(\d+)/(\d+)\]")


# ---------- config ----------
def load_config() -> dict:
    if not CONFIG_PATH.exists():
        return {}
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            return json.load(f) or {}
    except Exception:
        return {}


def save_config(cfg: dict) -> None:
    try:
        BASE_DIR.mkdir(parents=True, exist_ok=True)
        with open(CONFIG_PATH, "w", encoding="utf-8") as f:
            json.dump(cfg, f, indent=2)
    except Exception:
        pass


# ---------- broadcast ----------
def broadcast(event_type: str, data) -> None:
    """Push an event to every currently connected SSE subscriber."""
    payload = json.dumps({"type": event_type, "data": data})
    with _state_lock:
        snapshot = list(_subscribers)
    for q in snapshot:
        try:
            q.put_nowait(payload)
        except Exception:
            pass


# ---------- worker ----------
def _worker(video_dir: str, queue_path: str) -> None:
    """Spawn tiktok_poster.py with the picked paths, stream its stdout
    line by line, broadcast log + progress events to SSE clients."""
    global _process, _posted_count, _total_planned

    env = os.environ.copy()
    env["CK_VIDEO_DIR"] = video_dir
    env["CK_QUEUE_PATH"] = queue_path
    env["PYTHONUNBUFFERED"] = "1"

    try:
        _process = subprocess.Popen(
            [sys.executable, str(SCRIPT_PATH)],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            env=env,
            text=True,
            bufsize=1,
        )
    except Exception as e:
        broadcast("log", f"❌ Failed to start subprocess: {e}")
        broadcast("done", {"rc": -1, "posted": 0, "stopped": False})
        return

    # tiktok_poster.py prints STEP 1-4 instructions then waits on input().
    # The web UI's status banner already told the operator to launch Chrome
    # on port 9222 first; satisfy the prompt automatically.
    try:
        assert _process.stdin is not None
        _process.stdin.write("\n")
        _process.stdin.flush()
    except Exception:
        pass

    assert _process.stdout is not None
    for line in _process.stdout:
        if _stop_requested:
            break
        line = line.rstrip("\n")
        if not line:
            continue
        broadcast("log", line)
        m = _ITEM_RE.match(line)
        if m:
            cur = int(m.group(1))
            total = int(m.group(2))
            _total_planned = total
            broadcast("progress", {"current": cur, "total": total})
            broadcast("status", f"Posting {cur} of {total}…")
        elif "✅ Posted:" in line:
            _posted_count += 1
            broadcast(
                "progress",
                {"current": _posted_count, "total": _total_planned},
            )

    rc = _process.wait() if _process else -1
    broadcast(
        "done",
        {"rc": rc, "posted": _posted_count, "stopped": _stop_requested},
    )


# ---------- native file picker (macOS osascript) ----------
def native_pick(kind: str) -> tuple[bool, str]:
    """Show a native macOS Choose Folder / Choose File dialog and return
    (ok, path_or_error). Cancellation returns (False, ""). `kind` is
    "folder" or "file"."""
    if kind == "folder":
        script = 'POSIX path of (choose folder with prompt "Select videos folder")'
    else:
        script = 'POSIX path of (choose file with prompt "Select queue file")'
    try:
        result = subprocess.run(
            ["osascript", "-e", script],
            capture_output=True,
            text=True,
            timeout=180,
        )
    except FileNotFoundError:
        return False, "osascript not available (macOS-only picker)"
    except Exception as e:
        return False, f"{e.__class__.__name__}: {e}"
    if result.returncode == 0:
        return True, result.stdout.strip()
    # osascript returns 1 on user cancel; treat as silent.
    return False, ""


# ---------- HTML ----------
HTML_PAGE = r"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Case Kisses Poster 🎀</title>
<style>
  :root {
    --pink: #ec4899;
    --pink-dark: #be185d;
    --pink-bg: #fdf2f8;
    --pink-soft: #fce7f3;
    --pink-border: #f9a8d4;
    --ink: #1f2937;
    --muted: #6b7280;
    --red: #ef4444;
    --red-dark: #b91c1c;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--pink-bg);
    color: var(--ink);
    font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
    padding: 24px;
    max-width: 720px;
    margin-left: auto;
    margin-right: auto;
  }
  h1 {
    color: var(--pink-dark);
    margin: 0 0 6px 0;
    font-size: 26px;
  }
  .status {
    margin: 10px 0 6px 0;
    color: var(--ink);
    font-size: 14px;
  }
  .progress-label {
    color: var(--muted);
    font-size: 13px;
    margin: 6px 0 4px 0;
  }
  .progress {
    width: 100%;
    height: 10px;
    background: var(--pink-soft);
    border-radius: 999px;
    overflow: hidden;
  }
  .progress-bar {
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, var(--pink), var(--pink-dark));
    transition: width 0.3s ease;
  }
  .picker-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 10px 0;
  }
  .picker-row label {
    font-weight: 600;
    color: var(--pink-dark);
    width: 110px;
    flex-shrink: 0;
    font-size: 13px;
  }
  .picker-row input[type="text"] {
    flex: 1;
    padding: 8px 12px;
    border: 1.5px solid var(--pink-border);
    border-radius: 8px;
    font-family: ui-monospace, Menlo, monospace;
    font-size: 12px;
    background: #fff;
    min-width: 0;
  }
  .picker-row input[type="text"]:focus {
    outline: none;
    border-color: var(--pink);
    box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.12);
  }
  .browse-btn {
    background: #fff;
    color: var(--pink-dark);
    border: 1.5px solid var(--pink-border);
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 13px;
    cursor: pointer;
    font-weight: 600;
    white-space: nowrap;
  }
  .browse-btn:hover { background: var(--pink-soft); }
  .actions {
    display: flex;
    gap: 10px;
    margin: 18px 0 14px 0;
  }
  .start-btn, .stop-btn {
    padding: 14px 22px;
    border: 0;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    color: #fff;
    transition: transform 0.1s ease, box-shadow 0.15s ease;
  }
  .start-btn {
    background: linear-gradient(135deg, var(--pink), #f43f5e);
  }
  .start-btn:hover:not([disabled]) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(236, 72, 153, 0.3);
  }
  .stop-btn {
    background: linear-gradient(135deg, var(--red), var(--red-dark));
  }
  .stop-btn:hover:not([disabled]) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
  }
  .start-btn[disabled], .stop-btn[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .log-title {
    color: var(--pink-dark);
    font-weight: 700;
    margin-bottom: 6px;
    font-size: 14px;
  }
  .log {
    background: #fff;
    border: 1.5px solid var(--pink-border);
    border-radius: 10px;
    padding: 12px;
    height: 360px;
    overflow-y: auto;
    font-family: ui-monospace, Menlo, monospace;
    font-size: 12px;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .log .line { margin-bottom: 2px; }
  .log .ts { color: var(--muted); margin-right: 4px; }
  .footer {
    margin-top: 14px;
    color: var(--muted);
    font-size: 12px;
    text-align: center;
  }
</style>
</head>
<body>
<h1>Case Kisses Poster 🎀</h1>
<div class="status" id="status">Ready. Pick your queue + videos folder, then click Start.</div>
<div class="progress-label" id="progress-label">0 of 0 posts</div>
<div class="progress"><div class="progress-bar" id="progress-bar"></div></div>

<div class="picker-row">
  <label>Videos folder</label>
  <input type="text" id="video-dir" placeholder="/Users/.../CaseKisses/videos">
  <button class="browse-btn" id="browse-videos">📂 Browse</button>
</div>
<div class="picker-row">
  <label>Queue file</label>
  <input type="text" id="queue-path" placeholder="/Users/.../CaseKisses/posting-queue.json">
  <button class="browse-btn" id="browse-queue">📋 Browse</button>
</div>

<div class="actions">
  <button class="start-btn" id="start-btn">🚀 Start Posting</button>
  <button class="stop-btn" id="stop-btn" disabled>⏹ Stop</button>
</div>

<div class="log-title">Log</div>
<div class="log" id="log"></div>
<div class="footer">Local web UI on port 8765 — close this tab and Ctrl-C the terminal to quit.</div>

<script>
const $ = (id) => document.getElementById(id);
const logEl = $("log");
const statusEl = $("status");
const progressBar = $("progress-bar");
const progressLabel = $("progress-label");
const startBtn = $("start-btn");
const stopBtn = $("stop-btn");
const videoDir = $("video-dir");
const queuePath = $("queue-path");

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

function appendLog(line) {
  const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
  const div = document.createElement("div");
  div.className = "line";
  div.innerHTML = '<span class="ts">[' + ts + ']</span>' + escapeHtml(line);
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
}

function setProgress(current, total) {
  progressLabel.textContent = current + " of " + total + " posts";
  const pct = total > 0 ? (current / total) * 100 : 0;
  progressBar.style.width = pct + "%";
}

function setStatus(text) {
  statusEl.textContent = text;
}

function saveConfig() {
  fetch("/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ video_dir: videoDir.value, queue_path: queuePath.value })
  }).catch(() => {});
}

// Initial config load
fetch("/config")
  .then((r) => r.json())
  .then((cfg) => {
    if (cfg.video_dir) videoDir.value = cfg.video_dir;
    if (cfg.queue_path) queuePath.value = cfg.queue_path;
  })
  .catch(() => {});

videoDir.addEventListener("blur", saveConfig);
queuePath.addEventListener("blur", saveConfig);

$("browse-videos").addEventListener("click", async () => {
  try {
    const r = await fetch("/browse?type=folder").then((r) => r.json());
    if (r && r.ok && r.path) {
      videoDir.value = r.path;
      saveConfig();
    } else if (r && r.error) {
      alert(r.error);
    }
  } catch (e) {
    alert("Browse failed: " + e);
  }
});

$("browse-queue").addEventListener("click", async () => {
  try {
    const r = await fetch("/browse?type=file").then((r) => r.json());
    if (r && r.ok && r.path) {
      queuePath.value = r.path;
      saveConfig();
    } else if (r && r.error) {
      alert(r.error);
    }
  } catch (e) {
    alert("Browse failed: " + e);
  }
});

startBtn.addEventListener("click", async () => {
  startBtn.disabled = true;
  stopBtn.disabled = false;
  setStatus("Launching tiktok_poster.py… make sure Chrome is open on port 9222.");
  appendLog("🚀 Starting tiktok_poster.py");
  try {
    const r = await fetch("/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ video_dir: videoDir.value, queue_path: queuePath.value })
    }).then((r) => r.json());
    if (!r.ok) {
      appendLog("❌ " + (r.error || "failed to start"));
      setStatus("Failed to start.");
      alert(r.error || "Failed to start");
      startBtn.disabled = false;
      stopBtn.disabled = true;
    }
  } catch (e) {
    appendLog("❌ " + e);
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
});

stopBtn.addEventListener("click", async () => {
  stopBtn.disabled = true;
  await fetch("/stop", { method: "POST" }).catch(() => {});
  appendLog("⏹ Stop requested");
});

// Server-Sent Events
const es = new EventSource("/events");
es.onmessage = (ev) => {
  let msg;
  try { msg = JSON.parse(ev.data); } catch { return; }
  if (msg.type === "log") {
    appendLog(msg.data);
  } else if (msg.type === "status") {
    setStatus(msg.data);
  } else if (msg.type === "progress") {
    setProgress(msg.data.current, msg.data.total);
  } else if (msg.type === "hello") {
    if (msg.data && msg.data.total > 0) {
      setProgress(msg.data.posted || 0, msg.data.total);
    }
  } else if (msg.type === "done") {
    startBtn.disabled = false;
    stopBtn.disabled = true;
    const posted = (msg.data && msg.data.posted) || 0;
    if (msg.data && msg.data.stopped) {
      setStatus("Stopped. " + posted + " posted.");
      alert("Posting was stopped.\n" + posted + " video(s) posted.");
    } else if (msg.data && msg.data.rc === 0) {
      setStatus("Done. " + posted + " posted.");
      alert("✅ " + posted + " videos posted successfully");
    } else {
      const rc = (msg.data && msg.data.rc);
      setStatus("Subprocess exited with code " + rc + ".");
      alert("Subprocess exited with code " + rc + ". " + posted + " posted.");
    }
  }
};
es.onerror = () => { /* browser auto-retries */ };
</script>
</body>
</html>
"""


# ---------- HTTP handler ----------
class Handler(http.server.BaseHTTPRequestHandler):
    # Quiet the per-request access log so the terminal stays readable.
    def log_message(self, format, *args):  # noqa: A002
        pass

    # --- response helpers ---
    def _send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _read_json_body(self) -> dict:
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except Exception:
            length = 0
        if length <= 0:
            return {}
        try:
            return json.loads(self.rfile.read(length))
        except Exception:
            return {}

    # --- GET routing ---
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/" or path == "/index.html":
            body = HTML_PAGE.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
            return

        if path == "/config":
            self._send_json(200, load_config())
            return

        if path == "/browse":
            qs = parse_qs(parsed.query)
            kind = (qs.get("type") or ["folder"])[0]
            ok, value = native_pick("folder" if kind == "folder" else "file")
            if ok:
                self._send_json(200, {"ok": True, "path": value})
            elif value:
                self._send_json(200, {"ok": False, "error": value})
            else:
                self._send_json(200, {"ok": False, "cancelled": True})
            return

        if path == "/events":
            self._serve_sse()
            return

        self.send_error(404)

    # --- SSE stream ---
    def _serve_sse(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self.send_header("X-Accel-Buffering", "no")
        self.end_headers()

        q: queue.Queue = queue.Queue()
        with _state_lock:
            _subscribers.append(q)
        try:
            # Initial snapshot so a late-joining tab can sync progress.
            self._sse_write(
                json.dumps({
                    "type": "hello",
                    "data": {"posted": _posted_count, "total": _total_planned},
                })
            )
            while True:
                try:
                    payload = q.get(timeout=15)
                    self._sse_write(payload)
                except queue.Empty:
                    # Keepalive ping. If the client is gone, the write
                    # raises and we break out of the loop.
                    if not self._sse_keepalive():
                        break
        except (BrokenPipeError, ConnectionResetError):
            pass
        finally:
            with _state_lock:
                try:
                    _subscribers.remove(q)
                except ValueError:
                    pass

    def _sse_write(self, payload: str) -> None:
        self.wfile.write(b"data: " + payload.encode("utf-8") + b"\n\n")
        self.wfile.flush()

    def _sse_keepalive(self) -> bool:
        try:
            self.wfile.write(b": keepalive\n\n")
            self.wfile.flush()
            return True
        except (BrokenPipeError, ConnectionResetError):
            return False

    # --- POST routing ---
    def do_POST(self):
        global _worker_thread, _process, _posted_count, _total_planned
        global _stop_requested
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/config":
            payload = self._read_json_body()
            cfg = load_config()
            if isinstance(payload.get("video_dir"), str):
                cfg["video_dir"] = payload["video_dir"]
            if isinstance(payload.get("queue_path"), str):
                cfg["queue_path"] = payload["queue_path"]
            save_config(cfg)
            self._send_json(200, {"ok": True})
            return

        if path == "/start":
            payload = self._read_json_body()
            video_dir = payload.get("video_dir") or str(DEFAULT_VIDEO_DIR)
            queue_path = payload.get("queue_path") or str(DEFAULT_QUEUE_PATH)

            if _worker_thread and _worker_thread.is_alive():
                self._send_json(409, {"ok": False, "error": "Already running"})
                return
            if not Path(queue_path).exists():
                self._send_json(
                    400, {"ok": False, "error": f"Queue not found: {queue_path}"}
                )
                return
            if not Path(video_dir).exists():
                self._send_json(
                    400,
                    {"ok": False, "error": f"Videos folder not found: {video_dir}"},
                )
                return
            if not SCRIPT_PATH.exists():
                self._send_json(
                    500,
                    {
                        "ok": False,
                        "error": f"tiktok_poster.py not found at {SCRIPT_PATH}",
                    },
                )
                return

            # Reset run state + persist picked paths.
            _posted_count = 0
            _total_planned = 0
            _stop_requested = False
            cfg = load_config()
            cfg["video_dir"] = video_dir
            cfg["queue_path"] = queue_path
            save_config(cfg)

            broadcast("status", "Launching tiktok_poster.py…")
            broadcast("progress", {"current": 0, "total": 0})

            _worker_thread = threading.Thread(
                target=_worker, args=(video_dir, queue_path), daemon=True
            )
            _worker_thread.start()
            self._send_json(200, {"ok": True})
            return

        if path == "/stop":
            _stop_requested = True
            if _process and _process.poll() is None:
                try:
                    _process.terminate()
                except Exception:
                    pass
            broadcast("status", "Stop requested.")
            self._send_json(200, {"ok": True})
            return

        self.send_error(404)


class ThreadingServer(http.server.ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def main() -> None:
    server = ThreadingServer(("127.0.0.1", PORT), Handler)
    url = f"http://localhost:{PORT}"
    print(f"🎀 Case Kisses Poster — {url}")
    print("   Press Ctrl+C to quit.")

    # Open the browser shortly after the server is actually ready.
    def _open_browser():
        time.sleep(0.4)
        try:
            webbrowser.open(url)
        except Exception:
            pass

    threading.Thread(target=_open_browser, daemon=True).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down…")
    finally:
        # Terminate any active worker subprocess on exit.
        if _process and _process.poll() is None:
            try:
                _process.terminate()
            except Exception:
                pass
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
