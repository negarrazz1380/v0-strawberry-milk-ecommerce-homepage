#!/usr/bin/env bash
# Case Kisses posting automation — one-time setup.
#
# Creates the folder layout the Python poster expects and installs the
# Python packages it needs. Safe to re-run.

set -euo pipefail

BASE="$HOME/Desktop/CaseKisses"
VIDEOS="$BASE/videos"
POSTED="$BASE/posted"

echo "🎀 Setting up Case Kisses posting automation..."
echo

# ---------- folders ----------
mkdir -p "$VIDEOS" "$POSTED"
echo "📁 Folders ready:"
echo "   $VIDEOS"
echo "   $POSTED"
echo

# ---------- python deps ----------
echo "📦 Installing Python packages (selenium, schedule)..."
if command -v pip3 >/dev/null 2>&1; then
  PIP="pip3"
elif command -v pip >/dev/null 2>&1; then
  PIP="pip"
else
  echo "❌ Neither pip3 nor pip found. Install Python 3 first: brew install python"
  exit 1
fi

# --user keeps us out of the system site-packages on macOS.
"$PIP" install --user --upgrade selenium schedule

echo
echo "✅ Setup complete!"
echo
echo "Next steps:"
echo "  1. Drop your finished video files into:"
echo "       $VIDEOS"
echo "     (the poster searches this folder recursively, so subfolders are fine)"
echo
echo "  2. In the content calendar, fill in each card's Video File + Sound source,"
echo "     then hit 'Confirm for Posting ✅' on every card you want scheduled."
echo
echo "  3. Click '📤 Export for Posting' in the calendar header."
echo "     That downloads posting-queue.json — move it into:"
echo "       $BASE/posting-queue.json"
echo
echo "  4. Make sure Chrome is installed and you're logged into TikTok Studio."
echo
echo "  5. Run the poster:"
echo "       python3 \"$(cd "$(dirname "$0")" && pwd)/tiktok_poster.py\""
echo
echo "The script will pause before each post so you can confirm the upload tab is ready."
echo "Happy scheduling 🎀"
