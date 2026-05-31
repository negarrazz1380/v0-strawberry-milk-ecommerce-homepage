#!/usr/bin/env python3
"""Case Kisses Poster — desktop GUI wrapper around tiktok_poster.py.

Spawns tiktok_poster.py as a subprocess, streams its stdout into a
scrolling log, exposes file pickers for the queue + videos folder
(persisted to ~/Desktop/CaseKisses/config.json), and surfaces a Start /
Stop pair plus an X-of-Y progress bar parsed from the worker's output.
"""

from __future__ import annotations

import json
import os
import queue
import re
import subprocess
import sys
import threading
from datetime import datetime
from pathlib import Path

import tkinter as tk
from tkinter import filedialog, messagebox, ttk


HOME = Path.home()
BASE_DIR = HOME / "Desktop" / "CaseKisses"
CONFIG_PATH = BASE_DIR / "config.json"
SCRIPT_PATH = Path(__file__).resolve().parent / "tiktok_poster.py"

DEFAULT_VIDEO_DIR = BASE_DIR / "videos"
DEFAULT_QUEUE_PATH = BASE_DIR / "posting-queue.json"

PINK_BG = "#fdf2f8"
PINK_SOFT = "#fce7f3"
PINK_BORDER = "#f9a8d4"
PINK = "#ec4899"
PINK_DARK = "#be185d"
RED = "#ef4444"
RED_DARK = "#b91c1c"
INK = "#1f2937"
MUTED = "#6b7280"


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


class PosterApp:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("Case Kisses Poster 🎀")
        self.root.configure(bg=PINK_BG)
        self.root.geometry("600x700")
        self.root.minsize(540, 600)

        self.config = load_config()
        self.video_dir = self.config.get("video_dir", str(DEFAULT_VIDEO_DIR))
        self.queue_path = self.config.get("queue_path", str(DEFAULT_QUEUE_PATH))

        self.process: subprocess.Popen | None = None
        self.worker_thread: threading.Thread | None = None
        self.stop_requested = False
        self.posted_so_far = 0
        self.total_planned = 0
        self.log_queue: queue.Queue = queue.Queue()

        self._build_ui()
        # Poll the cross-thread queue from the Tk main loop.
        self.root.after(100, self._drain_log_queue)

    # ---------- UI ----------
    def _build_ui(self) -> None:
        # --- Top: title + status + progress ---
        top = tk.Frame(self.root, bg=PINK_BG)
        top.pack(fill=tk.X, padx=20, pady=(18, 6))

        tk.Label(
            top,
            text="Case Kisses Poster 🎀",
            bg=PINK_BG, fg=PINK_DARK,
            font=("Helvetica", 20, "bold"),
            anchor=tk.W,
        ).pack(fill=tk.X)

        self.status_var = tk.StringVar(
            value="Ready. Pick your queue + videos folder, then click Start."
        )
        tk.Label(
            top, textvariable=self.status_var,
            bg=PINK_BG, fg=INK,
            font=("Helvetica", 12),
            wraplength=560, justify=tk.LEFT, anchor=tk.W,
        ).pack(fill=tk.X, pady=(10, 4))

        self.progress_var = tk.StringVar(value="0 of 0 posts")
        tk.Label(
            top, textvariable=self.progress_var,
            bg=PINK_BG, fg=MUTED,
            font=("Helvetica", 11),
            anchor=tk.W,
        ).pack(fill=tk.X)

        self.progress = ttk.Progressbar(
            top, orient="horizontal", mode="determinate", length=560,
        )
        self.progress.pack(fill=tk.X, pady=(4, 0))

        # --- Middle: file pickers + start/stop ---
        mid = tk.Frame(self.root, bg=PINK_BG)
        mid.pack(fill=tk.X, padx=20, pady=(14, 6))

        self.videos_path_var = tk.StringVar(value=self.video_dir)
        self._build_picker_row(
            mid, "📂 Select Videos Folder", self._pick_videos_dir, self.videos_path_var
        )

        self.queue_path_var = tk.StringVar(value=self.queue_path)
        self._build_picker_row(
            mid, "📋 Select Queue File", self._pick_queue_file, self.queue_path_var
        )

        actions = tk.Frame(mid, bg=PINK_BG)
        actions.pack(fill=tk.X, pady=(14, 4))

        self.start_btn = tk.Button(
            actions, text="🚀 Start Posting",
            command=self._start_posting,
            bg=PINK, fg="#ffffff",
            activebackground=PINK_DARK, activeforeground="#ffffff",
            relief=tk.FLAT, bd=0,
            padx=22, pady=12,
            font=("Helvetica", 14, "bold"),
            cursor="hand2",
        )
        self.start_btn.pack(side=tk.LEFT, padx=(0, 8))

        self.stop_btn = tk.Button(
            actions, text="⏹ Stop",
            command=self._stop_posting,
            bg=RED, fg="#ffffff",
            activebackground=RED_DARK, activeforeground="#ffffff",
            relief=tk.FLAT, bd=0,
            padx=18, pady=12,
            font=("Helvetica", 14, "bold"),
            cursor="hand2",
            state=tk.DISABLED,
        )
        self.stop_btn.pack(side=tk.LEFT)

        # --- Bottom: log area ---
        bottom = tk.Frame(self.root, bg=PINK_BG)
        bottom.pack(fill=tk.BOTH, expand=True, padx=20, pady=(8, 18))

        tk.Label(
            bottom, text="Log",
            bg=PINK_BG, fg=PINK_DARK,
            font=("Helvetica", 12, "bold"),
            anchor=tk.W,
        ).pack(anchor=tk.W)

        log_frame = tk.Frame(bottom, bg=PINK_BORDER, bd=1)
        log_frame.pack(fill=tk.BOTH, expand=True, pady=(4, 0))

        scrollbar = tk.Scrollbar(log_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        self.log_text = tk.Text(
            log_frame,
            bg="#ffffff", fg=INK,
            font=("Menlo", 11),
            wrap=tk.WORD,
            yscrollcommand=scrollbar.set,
            state=tk.DISABLED,
            relief=tk.FLAT, bd=0,
            padx=8, pady=8,
        )
        self.log_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.log_text.yview)

    def _build_picker_row(self, parent, label, command, path_var) -> None:
        row = tk.Frame(parent, bg=PINK_BG)
        row.pack(fill=tk.X, pady=3)
        tk.Button(
            row, text=label,
            command=command,
            bg="#ffffff", fg=PINK_DARK,
            activebackground=PINK_SOFT, activeforeground=PINK_DARK,
            relief=tk.SOLID, bd=1,
            padx=12, pady=6,
            font=("Helvetica", 12),
            cursor="hand2",
        ).pack(side=tk.LEFT)
        tk.Label(
            row, textvariable=path_var,
            bg=PINK_BG, fg=MUTED,
            font=("Helvetica", 10),
            anchor=tk.W, justify=tk.LEFT,
            wraplength=400,
        ).pack(side=tk.LEFT, padx=(10, 0), fill=tk.X, expand=True)

    # ---------- file pickers ----------
    def _pick_videos_dir(self) -> None:
        start = self.video_dir if Path(self.video_dir).exists() else str(HOME)
        path = filedialog.askdirectory(title="Select videos folder", initialdir=start)
        if path:
            self.video_dir = path
            self.videos_path_var.set(path)
            self.config["video_dir"] = path
            save_config(self.config)
            self._log(f"📂 Videos folder: {path}")

    def _pick_queue_file(self) -> None:
        parent = Path(self.queue_path).parent
        start = str(parent) if parent.exists() else str(HOME)
        path = filedialog.askopenfilename(
            title="Select queue file",
            initialdir=start,
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")],
        )
        if path:
            self.queue_path = path
            self.queue_path_var.set(path)
            self.config["queue_path"] = path
            save_config(self.config)
            self._log(f"📋 Queue: {path}")

    # ---------- start / stop ----------
    def _start_posting(self) -> None:
        if self.worker_thread and self.worker_thread.is_alive():
            return
        if not Path(self.queue_path).exists():
            messagebox.showerror(
                "Queue not found", f"Queue file not found:\n{self.queue_path}"
            )
            return
        if not Path(self.video_dir).exists():
            messagebox.showerror(
                "Videos folder not found",
                f"Videos folder not found:\n{self.video_dir}",
            )
            return
        if not SCRIPT_PATH.exists():
            messagebox.showerror(
                "tiktok_poster.py missing", f"Expected at:\n{SCRIPT_PATH}"
            )
            return

        self.stop_requested = False
        self.posted_so_far = 0
        self.total_planned = 0
        self.start_btn.config(state=tk.DISABLED)
        self.stop_btn.config(state=tk.NORMAL)
        self._set_status("Launching tiktok_poster.py… make sure Chrome is open on port 9222.")
        self._set_progress(0, 0)
        self._log("🚀 Starting tiktok_poster.py")

        self.worker_thread = threading.Thread(target=self._worker, daemon=True)
        self.worker_thread.start()

    def _stop_posting(self) -> None:
        self.stop_requested = True
        if self.process and self.process.poll() is None:
            try:
                self.process.terminate()
            except Exception:
                pass
        self._set_status("Stop requested.")
        self.stop_btn.config(state=tk.DISABLED)

    # ---------- worker ----------
    def _worker(self) -> None:
        # tiktok_poster.py reads CK_QUEUE_PATH / CK_VIDEO_DIR so the GUI's
        # picked paths actually drive the run.
        env = os.environ.copy()
        env["CK_VIDEO_DIR"] = self.video_dir
        env["CK_QUEUE_PATH"] = self.queue_path
        env["PYTHONUNBUFFERED"] = "1"

        try:
            self.process = subprocess.Popen(
                [sys.executable, str(SCRIPT_PATH)],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                env=env,
                text=True,
                bufsize=1,
            )
        except Exception as e:
            self._enqueue("log", f"❌ Failed to start subprocess: {e}")
            self._enqueue("done", (-1, 0))
            return

        # tiktok_poster.py prints STEP 1-4 instructions then waits on input()
        # for the operator to confirm Chrome is open. The GUI's status label
        # already told them; satisfy the input() unconditionally.
        try:
            assert self.process.stdin is not None
            self.process.stdin.write("\n")
            self.process.stdin.flush()
        except Exception:
            pass

        assert self.process.stdout is not None
        for line in self.process.stdout:
            if self.stop_requested:
                break
            line = line.rstrip("\n")
            if line:
                self._enqueue("log", line)
                self._parse_progress(line)

        rc = self.process.wait() if self.process else -1
        self._enqueue("done", (rc, self.posted_so_far))

    # Parse the worker's stdout for X-of-Y position and per-post completion.
    _ITEM_RE = re.compile(r"^\[(\d+)/(\d+)\]")

    def _parse_progress(self, line: str) -> None:
        m = self._ITEM_RE.match(line)
        if m:
            cur = int(m.group(1))
            total = int(m.group(2))
            self.total_planned = total
            self._enqueue("progress", (cur, total))
            self._enqueue("status", f"Posting {cur} of {total}…")
            return
        if "✅ Posted:" in line:
            self.posted_so_far += 1
            self._enqueue("progress", (self.posted_so_far, self.total_planned))

    # ---------- queue plumbing ----------
    def _enqueue(self, kind: str, payload) -> None:
        self.log_queue.put((kind, payload))

    def _drain_log_queue(self) -> None:
        try:
            while True:
                kind, payload = self.log_queue.get_nowait()
                if kind == "log":
                    self._log(payload)
                elif kind == "status":
                    self._set_status(payload)
                elif kind == "progress":
                    cur, total = payload
                    self._set_progress(cur, total)
                elif kind == "done":
                    rc, posted = payload
                    self._on_done(rc, posted)
        except queue.Empty:
            pass
        self.root.after(100, self._drain_log_queue)

    # ---------- ui helpers ----------
    def _set_status(self, text: str) -> None:
        self.status_var.set(text)

    def _set_progress(self, current: int, total: int) -> None:
        self.progress_var.set(f"{current} of {total} posts")
        if total > 0:
            self.progress.config(maximum=total)
            self.progress["value"] = current
        else:
            self.progress.config(maximum=1)
            self.progress["value"] = 0

    def _log(self, line: str) -> None:
        ts = datetime.now().strftime("%H:%M:%S")
        self.log_text.config(state=tk.NORMAL)
        self.log_text.insert(tk.END, f"[{ts}] {line}\n")
        self.log_text.see(tk.END)
        self.log_text.config(state=tk.DISABLED)

    def _on_done(self, rc: int, posted_count: int) -> None:
        self.start_btn.config(state=tk.NORMAL)
        self.stop_btn.config(state=tk.DISABLED)
        if self.stop_requested:
            self._set_status(f"Stopped. {posted_count} posted.")
            messagebox.showinfo(
                "Stopped",
                f"Posting was stopped.\n{posted_count} video(s) posted.",
            )
        elif rc == 0:
            self._set_status(f"Done. {posted_count} posted.")
            messagebox.showinfo(
                "Done",
                f"✅ {posted_count} videos posted successfully",
            )
        else:
            self._set_status(f"Subprocess exited with code {rc}.")
            messagebox.showerror(
                "Error",
                f"Subprocess exited with code {rc}.\n{posted_count} video(s) posted before exit.",
            )


def main() -> None:
    root = tk.Tk()
    PosterApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
