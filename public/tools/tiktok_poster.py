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
import re
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Optional

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.action_chains import ActionChains
    from selenium.webdriver.common.by import By
    from selenium.webdriver.common.keys import Keys
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import (
        TimeoutException,
        NoSuchElementException,
        ElementNotInteractableException,
    )
except ImportError:
    print("❌ Selenium is not installed. Run: pip install selenium")
    sys.exit(1)

try:
    import pyperclip
except ImportError:
    print("❌ pyperclip is not installed. Please run: pip3 install pyperclip")
    sys.exit(1)


HOME = Path.home()
BASE_DIR = HOME / "Desktop" / "CaseKisses"
# The GUI wrapper (casekisses_poster.py) sets these env vars to whatever
# paths the operator picked in the file dialogs. Standalone CLI runs fall
# back to the canonical CaseKisses layout under ~/Desktop.
_env_queue = os.environ.get("CK_QUEUE_PATH")
_env_videos = os.environ.get("CK_VIDEO_DIR")
QUEUE_PATH = Path(_env_queue) if _env_queue else BASE_DIR / "posting-queue.json"
VIDEO_DIR = Path(_env_videos) if _env_videos else BASE_DIR / "videos"
ROUND_COMPLETE_PATH = BASE_DIR / "round-complete.json"

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


# Fuzzy aliases for product (case) names and archetypes (concepts).
# Keys are the human label stored in the posting queue; values are the
# substrings we look for inside a video filename (after normalization).
CASE_ALIASES = {
    "Dachshund": ["dachshund", "dachy", "dach"],
    "Hello Kitty Cherry": ["hellokitty", "hello_kitty", "hkc"],
    "Mario": ["mario"],
    "Bow Cherry": ["bowcherry", "bow_cherry", "bcherry"],
    "Cherry": ["cherry"],  # excluded if filename also matches bowcherry/hellokitty
    "Wavy": ["wavy"],
    "Puppy": ["puppy"],
    "Burger": ["burger"],
    "Butter Bear": ["butterbear", "butter_bear", "bbear"],
    "Bow Diamond": ["bowdiamond", "bow_diamond", "bdiamand"],
    "Bow Black": ["bowblack", "bow_black", "blackbow"],
}

CONCEPT_ALIASES = {
    "ASMR Unboxing": ["asmr", "unbox"],
    "Before/After Ugly Case": ["beforeafter", "before_after", "ugly"],
    "POV Outfit Match": ["outfitmatch", "outfit", "pov"],
    "Girl Math Comedy": ["girlmath", "girl_math"],
    "Cases I've Been Gatekeeping": ["gatekeep"],
    "Which One Matches Your Vibe": ["whichone", "which_one", "vibe"],
    "Rate My Phone Setup": ["desksetup", "desk", "setup", "rate"],
    "Stitch Bait": ["stitch"],
    "GRWM Morning Routine": ["grwm", "morning"],
    "Satisfying Loop Click": ["satisfying", "loop", "click"],
    "Small Business BTS": ["bts", "behind", "packing"],
    "Fruit Case Trend": ["fruit", "fruittrend"],
    "My Boyfriend Hates It": ["boyfriend"],
    "IT Girl Phone Check": ["itgirl", "it_girl"],
    "Canadian Small Business": ["canadian"],
    "Compliment Magnet": ["compliment"],
    "Nostalgia Hit": ["nostalgia"],
    "Unboxing Surprise Gift": ["giftunbox", "gift", "surprise"],
    "Hand Covers Camera Transition": ["handtransition", "hand"],
    "Outfit Swap Transition": ["outfitswap", "swap"],
    "Falling Phone Transition": ["fallingphone", "falling", "drop"],
    "PR Package Haul": ["prhaul", "pr_haul"],
    "Influencer Ranking Haul": ["ranking"],
    "Honest Review 2 Weeks": ["honestrev", "honest", "review"],
    "Not Gatekeeping": ["notgatekeep", "not_gate"],
    "Should Be Illegal Hook": ["illegal"],
    "Founder Story": ["founder"],
    "Didn't Know This Existed": ["didntknow", "didnt_know"],
}


def _norm(s: str) -> str:
    """Lowercase and strip underscores/spaces — used for fuzzy filename matching."""
    return s.lower().replace("_", "").replace(" ", "").replace("-", "")


def _filename_matches_alias(norm_name: str, alias: str) -> bool:
    return _norm(alias) in norm_name


def _filename_matches_case(norm_name: str, case_label: str) -> bool:
    aliases = CASE_ALIASES.get(case_label, [])
    if not aliases:
        # Fall back to a normalized contains check on the label itself.
        return _norm(case_label) in norm_name
    if not any(_filename_matches_alias(norm_name, a) for a in aliases):
        return False
    # Special case: bare "Cherry" should not match bowcherry or hellokitty files.
    if case_label == "Cherry":
        for excluded in ("bowcherry", "hellokitty"):
            if excluded in norm_name:
                return False
    return True


def _filename_matches_concept(norm_name: str, concept_label: str) -> bool:
    aliases = CONCEPT_ALIASES.get(concept_label, [])
    if not aliases:
        return _norm(concept_label) in norm_name
    return any(_filename_matches_alias(norm_name, a) for a in aliases)


def list_video_files() -> list[Path]:
    if not VIDEO_DIR.exists():
        return []
    return sorted(p for p in VIDEO_DIR.glob("*.mp4") if p.is_file())


def match_video_for_post(
    case_label: str, concept_label: str, candidates: list[Path]
) -> Path | None:
    """Return the best matching .mp4 for a (case, concept) pair, or None.

    Priority: case + concept > case only > concept only > nothing.
    """
    case_hits: list[Path] = []
    concept_hits: list[Path] = []
    both_hits: list[Path] = []
    for path in candidates:
        norm = _norm(path.name)
        case_ok = _filename_matches_case(norm, case_label) if case_label else False
        concept_ok = _filename_matches_concept(norm, concept_label) if concept_label else False
        if case_ok and concept_ok:
            both_hits.append(path)
        elif case_ok:
            case_hits.append(path)
        elif concept_ok:
            concept_hits.append(path)

    for bucket in (both_hits, case_hits, concept_hits):
        if bucket:
            return bucket[0]
    return None


def save_queue(queue: list) -> None:
    with open(QUEUE_PATH, "w", encoding="utf-8") as f:
        json.dump(queue, f, indent=2, ensure_ascii=False)


def write_round_complete(scheduled: list) -> None:
    """Dump a summary of this round's successful posts.

    The calendar's 'Sync Posted Status' button consumes this file to flip
    matching cards to 'posted'. Each entry carries the original calendar
    `id` so the sync can match unambiguously even if the date moved.
    """
    payload = {
        "completedAt": datetime.now().isoformat(timespec="seconds"),
        "postedCount": len(scheduled),
        "postedSlots": [
            {
                "id": it.get("id"),
                "slotId": it.get("slotId"),
                "dateKey": it.get("dateKey"),
                "timeKey": it.get("timeKey"),
                "platform": it.get("platform"),
                "product": it.get("product"),
                "archetype": it.get("archetype"),
                "scheduleDate": it.get("scheduleDate"),
                "scheduleTime": it.get("scheduleTime"),
            }
            for it in scheduled
        ],
    }
    with open(ROUND_COMPLETE_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    print(f"📝 Wrote round summary → {ROUND_COMPLETE_PATH}")


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
    """Clear TikTok's auto-filled filename, then paste the real caption.

    TikTok pre-fills the description with the uploaded filename. We have
    to explicitly select-all + delete first, then paste the caption from
    the OS clipboard so emojis (non-BMP) bypass ChromeDriver's text
    channel and round-trip cleanly.
    """
    print("   Looking for caption field...")
    caption_el = WebDriverWait(driver, 20).until(
        EC.presence_of_element_located(
            (By.CSS_SELECTOR, "div[contenteditable='true']")
        )
    )

    print("   Clicking caption field to focus...")
    caption_el.click()
    human_pause(0.5, 1.5)

    print("   Selecting all existing text (Cmd+A)...")
    ActionChains(driver).key_down(Keys.COMMAND).send_keys("a").key_up(Keys.COMMAND).perform()

    print("   Deleting selected text...")
    driver.find_element(By.CSS_SELECTOR, "div[contenteditable='true']").send_keys(Keys.DELETE)
    time.sleep(1)

    print("   Pasting caption from clipboard (Cmd+V)...")
    pyperclip.copy(text)
    ActionChains(driver).key_down(Keys.COMMAND).send_keys("v").key_up(Keys.COMMAND).perform()
    time.sleep(1)


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


def set_schedule_datetime(driver, date_str: str, time_str: str) -> bool:
    """Drive TikTok's date and time pickers, end to end.

    Self-contained: opens each picker by locating the TUXTextInputCore
    input whose value already matches the expected format (HH:MM /
    YYYY-MM-DD), navigates the calendar forward by clicking the rightmost
    narrow visible button (the '>' arrow), and clicks hour/minute leaves
    inside the time picker via JS exact-text match.

    Returns True if the inputs were located and driven; False if either
    input was missing. Hour/minute and day clicks log their outcome but
    don't fail the run — TikTok's selectors drift, so logging beats
    raising.
    """
    target_date = datetime.strptime(date_str, "%Y-%m-%d")
    target_year = target_date.year
    target_month = target_date.month
    target_day = target_date.day

    time_parts = time_str.split(":")
    target_hour = int(time_parts[0])
    target_minute = int(time_parts[1])
    # Round minute to nearest 5; cap so we never spill into the next hour.
    target_minute = round(target_minute / 5) * 5
    if target_minute == 60:
        target_minute = 55

    # ---------- STEP 1: open the calendar ----------
    date_inputs = driver.find_elements(By.CSS_SELECTOR, "input.TUXTextInputCore-input")
    date_input = None
    for inp in date_inputs:
        val = inp.get_attribute("value") or ""
        if re.match(r"\d{4}-\d{2}-\d{2}", val):
            date_input = inp
            break

    if not date_input:
        print("   ERROR: Could not find date input")
        return False

    driver.execute_script("arguments[0].click()", date_input)
    time.sleep(2)
    print("   Opened calendar")

    # ---------- STEP 2-3: navigate header to (target_year, target_month) ----------
    # The header reads as "Month / YYYY" inside a near-leaf element (≤2
    # children). Each iteration we re-read it, compare to target, then
    # click forward or backward exactly once depending on which side of
    # target we're on. No scroll-into-view, no React state, just header
    # read + arrow click.
    month_names = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ]
    header_read_js = r"""
        var all = document.querySelectorAll('*');
        for (var i = 0; i < all.length; i++) {
            var el = all[i];
            if (!el.offsetParent) continue;
            if (el.children.length > 2) continue;
            var t = el.textContent.trim();
            if (/^(January|February|March|April|May|June|July|August|September|October|November|December)\s*\/\s*\d{4}$/.test(t)) {
                return t;
            }
        }
        return '';
    """
    # Rightmost narrow visible button near the header = forward arrow.
    click_right_js = """
        var buttons = document.querySelectorAll('button');
        var rightmost = null;
        var maxX = -1;
        for (var i = 0; i < buttons.length; i++) {
            var b = buttons[i];
            if (!b.offsetParent) continue;
            var r = b.getBoundingClientRect();
            if (r.width > 5 && r.width < 50 && r.height > 5 && r.height < 50 && r.x > maxX) {
                maxX = r.x;
                rightmost = b;
            }
        }
        if (rightmost) rightmost.click();
    """
    # Leftmost narrow visible button near the header = back arrow.
    click_left_js = """
        var buttons = document.querySelectorAll('button');
        var leftmost = null;
        var minX = 99999;
        for (var i = 0; i < buttons.length; i++) {
            var b = buttons[i];
            if (!b.offsetParent) continue;
            var r = b.getBoundingClientRect();
            if (r.width > 5 && r.width < 50 && r.height > 5 && r.height < 50 && r.x < minX) {
                minX = r.x;
                leftmost = b;
            }
        }
        if (leftmost) leftmost.click();
    """

    for _ in range(24):
        header_text = driver.execute_script(header_read_js)
        print(f"   Calendar shows: {header_text}")

        if not header_text:
            # Header unreadable — best-effort nudge forward and re-read.
            driver.execute_script(click_right_js)
            print("   Clicked > forward (no header yet)")
            time.sleep(0.5)
            continue

        parts = header_text.replace(" ", "").split("/")
        curr_month = month_names.index(parts[0]) + 1
        curr_year = int(parts[1])

        if (curr_year, curr_month) == (target_year, target_month):
            print("   On correct month!")
            break
        if (curr_year, curr_month) < (target_year, target_month):
            driver.execute_script(click_right_js)
            print("   Clicked > forward")
        else:
            driver.execute_script(click_left_js)
            print("   Clicked < backward")
        time.sleep(0.5)

    # ---------- STEP 5: click the target day ----------
    day_str = str(target_day)
    day_clicked = driver.execute_script(
        """
        var target = arguments[0];
        var cells = document.querySelectorAll('td, [role="gridcell"]');
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            if (!cell.offsetParent) continue;
            var text = cell.textContent.trim();
            if (text === target) {
                var cls = cell.className || '';
                if (cls.indexOf('disabled') >= 0 || cls.indexOf('gray') >= 0 || cls.indexOf('outside') >= 0) continue;
                cell.click();
                return true;
            }
        }
        return false;
        """,
        day_str,
    )
    if day_clicked:
        print(f"   Selected day {day_str}")
    else:
        print(f"   WARNING: Could not click day {day_str}")

    # ---------- STEP 6: wait + Escape to close the calendar ----------
    time.sleep(1)
    driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
    time.sleep(0.5)

    # ---------- STEP 4: open the time picker ----------
    time_inputs = driver.find_elements(By.CSS_SELECTOR, "input.TUXTextInputCore-input")
    time_input = None
    for inp in time_inputs:
        val = inp.get_attribute("value") or ""
        if re.match(r"\d{2}:\d{2}", val):
            time_input = inp
            break

    if not time_input:
        print("   ERROR: Could not find time input")
        return False

    driver.execute_script("arguments[0].click()", time_input)
    time.sleep(2)
    print("   Opened time picker")

    # ---------- STEP 5: scroll columns then click hour + minute ----------
    # Rewind every narrow scrollable column to the top so early hours
    # (e.g. 07) are in the DOM by the time we look for them.
    driver.execute_script(
        """
        var all = document.querySelectorAll('*');
        for (var i = 0; i < all.length; i++) {
            var el = all[i];
            var rect = el.getBoundingClientRect();
            if (el.scrollHeight > el.clientHeight + 5
                && rect.width > 0 && rect.width < 100
                && rect.height > 80 && el.offsetParent !== null) {
                el.scrollTop = 0;
            }
        }
        """
    )
    time.sleep(0.5)

    # Hour: leaf elements with exact text, small footprint (column cell).
    hour_str = f"{target_hour:02d}"
    hour_clicked = driver.execute_script(
        """
        var target = arguments[0];
        var all = document.querySelectorAll('*');
        for (var i = 0; i < all.length; i++) {
            var el = all[i];
            if (el.offsetParent === null) continue;
            if (el.children.length > 0) continue;
            if (el.textContent.trim() !== target) continue;
            var rect = el.getBoundingClientRect();
            if (rect.width < 80 && rect.height < 50) {
                el.scrollIntoView({block: 'center'});
                el.click();
                return 'clicked ' + target;
            }
        }
        return 'not found';
        """,
        hour_str,
    )
    print(f"   Hour result: {hour_clicked}")
    time.sleep(0.5)

    # Minute: same leaf-cell pattern.
    min_str = f"{target_minute:02d}"
    min_clicked = driver.execute_script(
        """
        var target = arguments[0];
        var all = document.querySelectorAll('*');
        for (var i = 0; i < all.length; i++) {
            var el = all[i];
            if (el.offsetParent === null) continue;
            if (el.children.length > 0) continue;
            if (el.textContent.trim() !== target) continue;
            var rect = el.getBoundingClientRect();
            if (rect.width < 80 && rect.height < 50) {
                el.scrollIntoView({block: 'center'});
                el.click();
                return 'clicked ' + target;
            }
        }
        return 'not found';
        """,
        min_str,
    )
    print(f"   Minute result: {min_clicked}")
    time.sleep(0.5)

    # Close time picker.
    driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
    time.sleep(1)

    # Sanity-check: log the current values so the operator can see what
    # the inputs actually contain after we drove them.
    for inp in driver.find_elements(By.CSS_SELECTOR, "input.TUXTextInputCore-input"):
        val = inp.get_attribute("value") or ""
        if val:
            print(f"   Input value: {val}")

    return True


def choose_schedule(driver, date_str: str = "", time_str: str = "") -> None:
    """Click the Schedule radio, wait for the panel to render, then drive
    both pickers via `set_schedule_datetime`."""
    driver.execute_script("window.scrollBy(0, 400)")
    human_pause(1, 2)

    print("   Looking for Schedule radio button...")
    radios = driver.find_elements(By.CSS_SELECTOR, 'input[type="radio"]')
    if len(radios) < 2:
        print(f"   ❌ Expected 2+ radios for Now/Schedule, found {len(radios)}")
        raise NoSuchElementException(
            f"Expected 2+ input[type=radio] elements, found {len(radios)}"
        )
    driver.execute_script("arguments[0].click()", radios[1])
    print("   Clicked Schedule radio.")
    time.sleep(3)

    if date_str or time_str:
        try:
            set_schedule_datetime(driver, date_str, time_str)
        except Exception as e:
            print(f"   ⚠️  set_schedule_datetime failed: {e.__class__.__name__}: {e}")

    time.sleep(2)



def click_post_button(driver) -> None:
    """Click the Schedule/Post button, then handle the 'Continue to post?' popup."""
    print("Clicking Schedule button...")
    for btn in driver.find_elements(By.TAG_NAME, "button"):
        label = (btn.text or "").strip()
        if label in ("Schedule", "Post"):
            driver.execute_script("arguments[0].click()", btn)
            # TikTok sometimes shows a "Continue to post?" interstitial with
            # a "Post now" confirmation button. Give it 5s to appear, then
            # take a short look for the button.
            time.sleep(5)
            try:
                confirm_btn = WebDriverWait(driver, 3).until(
                    EC.element_to_be_clickable(
                        (By.XPATH, "//button[normalize-space()='Post now']")
                    )
                )
                driver.execute_script("arguments[0].click()", confirm_btn)
                print("   Dismissed 'Continue to post?' popup — clicked Post now")
            except (TimeoutException, NoSuchElementException):
                pass
            return
    print("   ❌ Couldn't find Schedule/Post button among page buttons")
    raise NoSuchElementException("No button with text 'Schedule' or 'Post' found")


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

    # Only consider items the user has confirmed in the calendar. `planned`
    # cards are missing videos; `posted` cards are already done — both stay
    # out of this round entirely.
    confirmed_items = [it for it in queue if it.get("status") == "confirmed"]
    if not confirmed_items:
        print("No items in the queue are marked 'confirmed' — nothing to do.")
        return

    # Clear any stale round-complete.json from a previous run so the calendar
    # can't accidentally re-sync an old round.
    if ROUND_COMPLETE_PATH.exists():
        try:
            ROUND_COMPLETE_PATH.unlink()
        except OSError as e:
            print(f"⚠️  Couldn't delete old {ROUND_COMPLETE_PATH.name}: {e}")

    available_videos = list_video_files()
    if not available_videos:
        print(f"❌ No .mp4 files found in {VIDEO_DIR}")
        sys.exit(1)

    # ---------- pre-flight match summary ----------
    print(f"Scanning {len(available_videos)} videos in {VIDEO_DIR}")
    print(f"Matching {len(confirmed_items)} confirmed post(s)...\n")

    matched: list[tuple[dict, Path]] = []
    unmatched: list[dict] = []

    for item in confirmed_items:
        case_label = item.get("product", "")
        concept_label = item.get("archetype", "")
        date = item.get("scheduleDate", "?")
        time_str = item.get("scheduleTime", "?")
        platform = item.get("platform", "?")

        video_path = match_video_for_post(case_label, concept_label, available_videos)
        if video_path:
            print(
                f"✅ MATCHED: {date} {time_str} {platform} → "
                f"{case_label} + {concept_label} → {video_path.name}"
            )
            matched.append((item, video_path))
        else:
            print(
                f"❌ NO MATCH: {date} {time_str} {platform} → "
                f"{case_label} + {concept_label}"
            )
            print(f"NO MATCHING VIDEO FOUND for {case_label} {concept_label}")
            unmatched.append(item)

    print()
    print(f"Matched: {len(matched)} | Unmatched: {len(unmatched)}")
    if not matched:
        print("Nothing to post — exiting.")
        return

    print(f"\nReady to post {len(matched)} matched videos.")

    print(f"\nConnecting to Chrome on port 9222.\n")
    options = Options()
    options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
    driver = webdriver.Chrome(options=options)
    driver.get("https://www.tiktok.com/tiktokstudio/upload?from=creator_center&tab=video")

    scheduled = []
    failed = []

    for idx, (item, video_path) in enumerate(matched, start=1):
        date = item.get("scheduleDate", "?")
        time_str = item.get("scheduleTime", "?")
        platform = item.get("platform", "?")
        archetype = item.get("archetype", "?")
        case_label = item.get("product", "?")

        print(
            f"\n[{idx}/{len(matched)}] {date} {time_str} {platform} — "
            f"{case_label} + {archetype} — {video_path.name}"
        )

        # Always start each item on a fresh upload page.
        try:
            driver.get("https://www.tiktok.com/tiktokstudio/upload?from=creator_center&tab=video")
            human_pause(2, 4)
        except Exception as e:
            print(f"   ⚠️  Couldn't reload upload page: {e}")

        ok = post_one(driver, item, video_path)
        if ok:
            item["status"] = "posted"
            scheduled.append(item)
            # Persist after each success so a crash mid-run still records progress.
            save_queue(queue)
        else:
            failed.append(item)
        human_pause(2, 4)

    # ---------- summary ----------
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"✅ Scheduled: {len(scheduled)}")
    for it in scheduled:
        print(
            f"   - {it.get('scheduleDate')} {it.get('scheduleTime')} "
            f"{it.get('platform')}: {it.get('product')} + {it.get('archetype')}"
        )
    if unmatched:
        print(f"\n⚠️  No matching video: {len(unmatched)}")
        for it in unmatched:
            print(
                f"   - {it.get('scheduleDate')} {it.get('scheduleTime')}: "
                f"{it.get('product')} + {it.get('archetype')}"
            )
    if failed:
        print(f"\n❌ Failed: {len(failed)}")
        for it in failed:
            print(f"   - {it.get('scheduleDate')} {it.get('scheduleTime')}: {it.get('archetype')}")

    if scheduled:
        write_round_complete(scheduled)
        print(
            "\nNext: open the calendar and click '📥 Sync Posted Status', "
            "then select round-complete.json to mark these cards posted."
        )

    print("\nAll done! Check TikTok Studio to confirm your scheduled posts.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nInterrupted — exiting.")
        sys.exit(130)
