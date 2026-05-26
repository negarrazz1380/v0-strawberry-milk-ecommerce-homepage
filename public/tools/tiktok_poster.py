#!/usr/bin/env python3
"""
TikTok scheduled-post helper for Case Kisses.

Reads ~/Desktop/CaseKisses/posting-queue.json (exported from the content
calendar), then drives the TikTok web upload page with Selenium for each
queued item. The script is deliberately interactive: it pauses before every
post so you can confirm the TikTok upload tab is open and ready.

Usage:
    python3 tiktok_poster.py

Requires:
    pip install selenium

Selectors against TikTok's upload page are best-effort — TikTok updates
its DOM often. If a step fails for a single post the script logs the
error and moves on, so a partial run still gets you most of the way.
"""

# Lets us use `Path | None` annotations on Python 3.9 (string-deferred).
from __future__ import annotations

import json
import os
import random
import sys
import time
from pathlib import Path
from typing import Optional

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.common.keys import Keys
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import (
        TimeoutException,
        NoSuchElementException,
        ElementNotInteractableException,
        WebDriverException,
    )
except ImportError:
    print("❌ Selenium is not installed. Run: pip install selenium")
    sys.exit(1)


HOME = Path.home()
BASE_DIR = HOME / "Desktop" / "CaseKisses"
QUEUE_PATH = BASE_DIR / "posting-queue.json"
VIDEO_DIR = BASE_DIR / "videos"


# ---------- helpers ----------
def human_pause(lo: float = 1.0, hi: float = 4.0) -> None:
    """Sleep a randomized amount so we look less like a bot."""
    time.sleep(random.uniform(lo, hi))


def load_queue() -> list:
    if not QUEUE_PATH.exists():
        print(f"❌ Queue not found at {QUEUE_PATH}")
        print("   Run 'Export for Posting' from the content calendar first.")
        sys.exit(1)
    with open(QUEUE_PATH, "r", encoding="utf-8") as f:
        queue = json.load(f)
    # Already exported in order, but re-sort defensively.
    queue.sort(key=lambda x: (x.get("scheduleDate", ""), x.get("scheduleTime", "")))
    return queue


def find_video(filename: str) -> Path | None:
    """Recursively search VIDEO_DIR for `filename` (basename match)."""
    if not filename:
        return None
    for path in VIDEO_DIR.rglob("*"):
        if path.is_file() and path.name == filename:
            return path
    return None


def combined_caption(item: dict) -> str:
    """Caption + hashtags — `sound` field on the card holds the hashtags."""
    caption = (item.get("caption") or "").strip()
    sound = (item.get("sound") or "").strip()
    # If the sound field carries hashtags (e.g. "#casekisses #fyp"), append.
    tags = " ".join(tok for tok in sound.split() if tok.startswith("#"))
    if tags and tags not in caption:
        return f"{caption} {tags}".strip()
    return caption


# ---------- selenium helpers ----------
def wait_for(driver, by, sel, timeout=20):
    return WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((by, sel))
    )


def wait_clickable(driver, by, sel, timeout=20):
    return WebDriverWait(driver, timeout).until(
        EC.element_to_be_clickable((by, sel))
    )


def upload_video(driver, video_path: Path) -> None:
    """Find the hidden <input type=file> on the upload page and feed it the path."""
    # TikTok renders an invisible file input; sending keys to it triggers upload.
    file_input = WebDriverWait(driver, 30).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="file"]'))
    )
    file_input.send_keys(str(video_path.resolve()))

    # Wait up to 60s for the upload preview / caption area to render.
    end = time.time() + 60
    while time.time() < end:
        try:
            driver.find_element(By.CSS_SELECTOR, '[data-text="true"], [contenteditable="true"]')
            return
        except NoSuchElementException:
            time.sleep(1)
    raise TimeoutException("Video processing didn't surface a caption field within 60s")


def type_caption(driver, text: str) -> None:
    """The TikTok caption field is a contenteditable div, not a textarea."""
    caption_el = WebDriverWait(driver, 20).until(
        EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'div[contenteditable="true"], [data-text="true"]')
        )
    )
    caption_el.click()
    human_pause(0.5, 1.5)
    # Clear what TikTok auto-filled (often the filename).
    caption_el.send_keys(Keys.CONTROL, "a")
    caption_el.send_keys(Keys.DELETE)
    human_pause(0.3, 0.8)
    caption_el.send_keys(text)


def pick_tiktok_sound(driver, sound_name: str) -> None:
    """Click 'Add sound', search by name, take the first result."""
    if not sound_name:
        return
    try:
        add_sound = wait_clickable(driver, By.XPATH, "//*[contains(text(), 'Add sound')]", timeout=10)
        add_sound.click()
        human_pause()
        search = wait_for(driver, By.CSS_SELECTOR, 'input[placeholder*="ound"], input[type="search"]')
        search.click()
        search.send_keys(sound_name)
        human_pause(2, 3)
        first = wait_clickable(driver, By.CSS_SELECTOR, '[data-e2e*="sound"], li[role="option"], div[role="button"]', timeout=10)
        first.click()
        human_pause()
    except (TimeoutException, NoSuchElementException, ElementNotInteractableException) as e:
        print(f"   ⚠️  Couldn't attach sound '{sound_name}': {e.__class__.__name__}")


def dismiss_popups(driver) -> None:
    """Best-effort: click any post-upload popups (Got it / OK / Dismiss)."""
    for label in ("Got it", "OK", "Dismiss"):
        try:
            btn = driver.find_element(
                By.XPATH, f"//button[normalize-space()='{label}']"
            )
            btn.click()
            time.sleep(2)
        except (NoSuchElementException, ElementNotInteractableException):
            pass


def choose_schedule(driver, date_str: str, time_str: str) -> None:
    """Toggle the Schedule radio, then set date + time fields."""
    # Bring the "When to post" section into view before interacting.
    driver.execute_script("window.scrollBy(0, 400)")
    human_pause(1, 2)

    # Click "Schedule" radio
    schedule_radio = wait_clickable(
        driver, By.XPATH, "//*[contains(text(), 'Schedule')]", timeout=15
    )
    schedule_radio.click()
    human_pause(1, 2)

    # Date field — TikTok presents date and time as masked text inputs.
    try:
        date_input = wait_for(
            driver,
            By.XPATH,
            "//input[contains(@placeholder, 'Date') or contains(@placeholder, 'date')]",
            timeout=10,
        )
        date_input.click()
        date_input.send_keys(Keys.CONTROL, "a")
        date_input.send_keys(date_str)  # YYYY-MM-DD
        date_input.send_keys(Keys.ENTER)
        human_pause()
    except (TimeoutException, NoSuchElementException) as e:
        print(f"   ⚠️  Date field issue: {e.__class__.__name__}")

    try:
        time_input = wait_for(
            driver,
            By.XPATH,
            "//input[contains(@placeholder, 'Time') or contains(@placeholder, 'time')]",
            timeout=10,
        )
        time_input.click()
        time_input.send_keys(Keys.CONTROL, "a")
        time_input.send_keys(time_str)  # HH:MM
        time_input.send_keys(Keys.ENTER)
        human_pause()
    except (TimeoutException, NoSuchElementException) as e:
        print(f"   ⚠️  Time field issue: {e.__class__.__name__}")


def click_post_button(driver) -> None:
    """Click the red Post button at the bottom; fall back to JS click."""
    btn = wait_clickable(
        driver,
        By.XPATH,
        "//button[normalize-space()='Post']",
        timeout=15,
    )
    try:
        btn.click()
    except (ElementNotInteractableException, WebDriverException):
        driver.execute_script("arguments[0].click()", btn)


# ---------- per-item driver ----------
def post_one(driver, item: dict, video_path: Path) -> bool:
    caption = combined_caption(item)
    sound = item.get("sound") or ""
    sound_source = item.get("soundSource") or "tiktok"

    try:
        upload_video(driver, video_path)
        human_pause(2, 3)

        dismiss_popups(driver)
        human_pause(2, 3)

        type_caption(driver, caption)
        human_pause(2, 3)

        if sound_source == "tiktok":
            pick_tiktok_sound(driver, sound)
            human_pause(2, 3)
        else:
            print("   ⏭  Sound already in video — skipping sound picker.")

        schedule_date = item.get("scheduleDate", "")
        schedule_time = item.get("scheduleTime", "")
        if schedule_date and schedule_time:
            choose_schedule(driver, schedule_date, schedule_time)
            human_pause(2, 3)

        click_post_button(driver)
        human_pause(2, 3)

        preview = caption[:60] + ("…" if len(caption) > 60 else "")
        print(f"   ✅ Posted: {preview}")
        return True

    except Exception as e:
        print(f"   ❌ Failed: {e.__class__.__name__}: {e}")
        return False


# ---------- main ----------
def main():
    print("🎀 Case Kisses TikTok Scheduler")
    print(f"   Queue:  {QUEUE_PATH}")
    print(f"   Videos: {VIDEO_DIR}")
    print()

    print("STEP 1: Quit Chrome completely (Cmd+Q)")
    print("STEP 2: Open Terminal and run this command:")
    print("/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222")
    print("STEP 3: Chrome will open — log into TikTok Studio (studio.tiktok.com)")
    print("STEP 4: Come back here and press Enter")
    input()

    queue = load_queue()
    if not queue:
        print("Queue is empty — nothing to schedule.")
        return

    if not VIDEO_DIR.exists():
        print(f"❌ Video directory missing: {VIDEO_DIR}")
        print("   Run setup_casekisses.sh first.")
        sys.exit(1)

    print(f"Loaded {len(queue)} item(s). Connecting to Chrome on port 9222.\n")
    options = Options()
    options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
    driver = webdriver.Chrome(options=options)
    driver.get("https://www.tiktok.com/tiktokstudio/upload?from=creator_center&tab=video")

    scheduled = []
    skipped = []
    failed = []

    for idx, item in enumerate(queue, start=1):
        video_name = item.get("videoFile") or ""
        date = item.get("scheduleDate", "?")
        time_str = item.get("scheduleTime", "?")
        platform = item.get("platform", "?")
        archetype = item.get("archetype", "?")

        print(f"\n[{idx}/{len(queue)}] {date} {time_str} {platform} — {archetype} — {video_name}")

        video_path = find_video(video_name)
        if not video_path:
            print(f"   ⚠️  Video '{video_name}' not found under {VIDEO_DIR} — skipping.")
            skipped.append(item)
            continue

        print(f"   📹 Found: {video_path}")
        print(f"   Ready to post: {date} {time_str} {platform} - {archetype} - {video_name}")

        # Always start each item on a fresh upload page.
        try:
            driver.get("https://www.tiktok.com/tiktokstudio/upload?from=creator_center&tab=video")
            human_pause(2, 4)
        except Exception as e:
            print(f"   ⚠️  Couldn't reload upload page: {e}")

        ok = post_one(driver, item, video_path)
        (scheduled if ok else failed).append(item)
        human_pause(2, 4)

    # ---------- summary ----------
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"✅ Scheduled: {len(scheduled)}")
    for it in scheduled:
        print(f"   - {it.get('scheduleDate')} {it.get('scheduleTime')} {it.get('platform')}: {it.get('archetype')}")
    if skipped:
        print(f"\n⚠️  Skipped (video not found): {len(skipped)}")
        for it in skipped:
            print(f"   - {it.get('scheduleDate')} {it.get('scheduleTime')}: {it.get('videoFile')}")
    if failed:
        print(f"\n❌ Failed: {len(failed)}")
        for it in failed:
            print(f"   - {it.get('scheduleDate')} {it.get('scheduleTime')}: {it.get('archetype')}")

    print("\nAll done! Check TikTok Studio to confirm your scheduled posts.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nInterrupted — exiting.")
        sys.exit(130)
