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
QUEUE_PATH = BASE_DIR / "posting-queue.json"
VIDEO_DIR = BASE_DIR / "videos"
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


MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]


def _click_value_in_picker(driver, value: str) -> bool:
    """Click the first visible element whose text exactly matches value
    or its non-zero-padded form. Used for the time picker's hour/minute
    columns where each cell is a numeric label."""
    forms = {value, value.lstrip("0") or "0"}
    for form in forms:
        for el in driver.find_elements(
            By.XPATH, f"//*[normalize-space(text())='{form}']"
        ):
            try:
                if not el.is_displayed():
                    continue
                driver.execute_script(
                    "arguments[0].scrollIntoView({block: 'center'})", el
                )
                time.sleep(0.3)
                driver.execute_script("arguments[0].click()", el)
                return True
            except Exception:
                continue
    return False


def set_schedule_time(driver, time_str: str) -> None:
    """Open the time picker and click the hour + minute columns.

    time_str is HH:MM (e.g. '07:00', '11:00', '19:00'). The picker is a
    two-column scroller — left column is hours 00-23, right column is
    minutes. We click the hour first, then the minute, then click outside
    to dismiss the popover.
    """
    print(f"Setting time to {time_str}...")
    hh, _, mm = time_str.partition(":")
    hh = (hh or "0").zfill(2)
    mm = (mm or "00").zfill(2)

    # Locate the time field — readonly input or element whose text is HH:MM.
    time_field = None
    for inp in driver.find_elements(By.CSS_SELECTOR, "input"):
        val = (inp.get_attribute("value") or "").strip()
        if (
            len(val) == 5
            and val[2] == ":"
            and val[:2].isdigit()
            and val[3:].isdigit()
        ):
            time_field = inp
            break
    if time_field is None:
        for el in driver.find_elements(By.XPATH, "//*[contains(text(), ':')]"):
            t = (el.text or "").strip()
            if (
                len(t) == 5
                and t[2] == ":"
                and t[:2].isdigit()
                and t[3:].isdigit()
            ):
                try:
                    if el.is_displayed():
                        time_field = el
                        break
                except Exception:
                    continue
    if time_field is None:
        raise NoSuchElementException("Could not find time input showing HH:MM")

    driver.execute_script("arguments[0].click()", time_field)
    time.sleep(2)

    if not _click_value_in_picker(driver, hh):
        print(f"   ⚠️  Could not click hour {hh}")
    time.sleep(1)
    if not _click_value_in_picker(driver, mm):
        print(f"   ⚠️  Could not click minute {mm}")
    time.sleep(1)

    # Click outside (body) to close the time popover.
    try:
        driver.find_element(By.TAG_NAME, "body").click()
    except Exception:
        pass
    time.sleep(1)


def set_schedule_date(driver, date_str: str) -> None:
    """Open the date picker, navigate to the target month, click the day.

    date_str is YYYY-MM-DD. We compute the target month label from it,
    step the calendar forward until the displayed header matches, then
    click the day cell. Finally click outside to close.
    """
    print(f"Setting date to {date_str}...")
    target = datetime.strptime(date_str, "%Y-%m-%d")
    target_month_label = target.strftime("%B %Y")  # "May 2026"
    target_day = str(target.day)

    # Locate the date field — readonly input or element with text YYYY-MM-DD.
    date_field = None
    for inp in driver.find_elements(By.CSS_SELECTOR, "input"):
        val = (inp.get_attribute("value") or "").strip()
        if (
            len(val) == 10
            and val[4] == "-"
            and val[7] == "-"
            and val[:4].isdigit()
        ):
            date_field = inp
            break
    if date_field is None:
        for el in driver.find_elements(By.XPATH, "//*[contains(text(), '-')]"):
            t = (el.text or "").strip()
            if (
                len(t) == 10
                and t[4] == "-"
                and t[7] == "-"
                and t[:4].isdigit()
            ):
                try:
                    if el.is_displayed():
                        date_field = el
                        break
                except Exception:
                    continue
    if date_field is None:
        raise NoSuchElementException(
            "Could not find date input showing YYYY-MM-DD"
        )

    driver.execute_script("arguments[0].click()", date_field)
    time.sleep(2)

    def visible_header_text() -> str:
        for el in driver.find_elements(By.XPATH, "//*[contains(text(), '20')]"):
            try:
                if not el.is_displayed():
                    continue
                t = (el.text or "").strip()
                if any(m in t for m in MONTH_NAMES):
                    return t
            except Exception:
                continue
        return ""

    # Step the calendar forward until the header matches. Bounded safety loop.
    for _ in range(24):
        header = visible_header_text()
        if target_month_label in header:
            break
        next_btn = None
        for xp in [
            "//button[contains(@aria-label,'Next') or contains(@aria-label,'next')]",
            "//*[contains(@class,'arrow-right')]",
            "//*[contains(@class,'next-month')]",
            "//*[contains(@class,'arrow') and contains(@class,'right')]",
        ]:
            els = driver.find_elements(By.XPATH, xp)
            if els:
                next_btn = els[0]
                break
        if next_btn is None:
            print("   ⚠️  Could not find calendar next-month arrow")
            break
        driver.execute_script("arguments[0].click()", next_btn)
        time.sleep(0.6)

    # Click the target day cell. Try cell-like containers first to avoid
    # accidentally matching numbers elsewhere on the page.
    clicked = False
    day_xpath_candidates = [
        f"//td[normalize-space(text())='{target_day}']",
        f"//div[contains(@class,'day') and normalize-space(text())='{target_day}']",
        f"//div[contains(@class,'date') and normalize-space(text())='{target_day}']",
        f"//button[normalize-space(text())='{target_day}']",
        f"//*[normalize-space(text())='{target_day}']",
    ]
    for xp in day_xpath_candidates:
        for el in driver.find_elements(By.XPATH, xp):
            try:
                if not el.is_displayed():
                    continue
                driver.execute_script(
                    "arguments[0].scrollIntoView({block: 'center'})", el
                )
                time.sleep(0.2)
                driver.execute_script("arguments[0].click()", el)
                clicked = True
                break
            except Exception:
                continue
        if clicked:
            break
    if not clicked:
        print(f"   ⚠️  Could not click day {target_day}")

    time.sleep(1)
    try:
        driver.find_element(By.TAG_NAME, "body").click()
    except Exception:
        pass
    time.sleep(1)


def choose_schedule(driver, date_str: str = "", time_str: str = "") -> None:
    """Click the Schedule radio, then drive the time and date pickers."""
    # Bring the "When to post" section into view before interacting.
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
    time.sleep(3)

    if time_str:
        try:
            set_schedule_time(driver, time_str)
        except Exception as e:
            print(f"   ⚠️  set_schedule_time failed: {e.__class__.__name__}: {e}")

    if date_str:
        try:
            set_schedule_date(driver, date_str)
        except Exception as e:
            print(f"   ⚠️  set_schedule_date failed: {e.__class__.__name__}: {e}")

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

    try:
        input(
            f"\nReady to post {len(matched)} matched videos. "
            f"Press Enter to continue or Ctrl+C to cancel."
        )
    except KeyboardInterrupt:
        print("\nCancelled by user.")
        return

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
