/**
 * Per-model fit notes for the /iphone/[model] pages.
 *
 * ─── WHY THIS FILE EXISTS ─────────────────────────────────────────────────
 * The model pages were near-duplicates. Because almost every case fits almost
 * every iPhone, /iphone/iphone_13, /iphone/iphone_14 and /iphone/iphone_15
 * listed exactly the same five products and differed only in the <h1>. Google
 * filed them under "Discovered - currently not indexed": it found the URLs,
 * saw it had already crawled that page, and declined to spend crawl budget.
 *
 * The fix is not more keywords. It's giving each page something true that only
 * belongs on that page. "Will my old case fit?" is the question people actually
 * type before buying, the answer genuinely differs per model, and no competitor
 * in the cute-case space answers it on the model page itself.
 *
 * ─── RULES FOR EDITING ────────────────────────────────────────────────────
 * 1. Every claim must be verifiable. These are physical facts about Apple
 *    hardware, not marketing.
 * 2. Do NOT publish exact millimetre figures unless you've checked them on
 *    apple.com. Third-party sources actively disagree — some say the iPhone 15
 *    is wider than the 14, others say narrower. Qualitative and correct beats
 *    precise and wrong.
 * 3. Keep it short. Two or three real sentences beat a padded paragraph.
 * 4. If a model has no note, the page renders without this section. That is
 *    fine — an empty section is better than an invented one.
 */

export interface ModelNote {
  /** Short heading for the section. */
  heading: string
  /** 2-3 sentences of genuinely model-specific fact. */
  body: string
}

export const MODEL_NOTES: Record<string, ModelNote> = {
  iphone_12: {
    heading: 'Will an iPhone 12 case fit anything else?',
    body:
      'Not reliably. The iPhone 12 and 13 are close in size, but the 13 rearranged its rear cameras into a diagonal layout and made the lenses larger, so a 12 case usually leaves the camera partly covered. Buy for the model you actually have.',
  },
  iphone_13: {
    heading: 'Will an iPhone 13 case fit an iPhone 14?',
    body:
      'Usually, yes — the standard iPhone 13 and iPhone 14 share almost identical dimensions, so most 13 cases fit the 14. The camera module differs slightly between them, so check that the cutout sits clear of the lenses before committing.',
  },
  iphone_14: {
    heading: 'Will an iPhone 14 case fit an iPhone 15?',
    body:
      'No. The iPhone 15 is slightly taller, swapped the 14\u2019s flat edges for contoured ones, and moved to a larger 48MP main camera that changes the cutout shape. Even when a 14 case physically squeezes on, the buttons and camera no longer line up.',
  },
  iphone_15: {
    heading: 'Will an older case fit an iPhone 15?',
    body:
      'No. The iPhone 15 is a little taller than the iPhone 14, has contoured rather than flat edges, and its 48MP main camera needs a different cutout. An iPhone 14 case will sit badly and block part of the lens.',
  },
  iphone_15_pro: {
    heading: 'Will an iPhone 14 Pro case fit an iPhone 15 Pro?',
    body:
      'No — and this one is not subtle. The iPhone 15 Pro replaced the mute switch with the Action Button, so the side cutout is in the wrong place entirely on a 14 Pro case. The 15 Pro also moved to a titanium frame with slightly different proportions.',
  },
  iphone_15_pro_max: {
    heading: 'Will an iPhone 14 Pro Max case fit an iPhone 15 Pro Max?',
    body:
      'No. Like the 15 Pro, the 15 Pro Max swapped the mute switch for the Action Button, so an older case has no cutout in the right spot. The dimensions changed slightly with the titanium frame too, so a 14 Pro Max case fits too tightly.',
  },
  iphone_16: {
    heading: 'Will an iPhone 15 case fit an iPhone 16?',
    body:
      'No. The iPhone 16 added the Camera Control button along the right edge, which no iPhone 15 case has a cutout for, and its rear cameras moved to a vertical arrangement. Buy for the 16 specifically.',
  },
  iphone_16_pro: {
    heading: 'Will an iPhone 15 Pro case fit an iPhone 16 Pro?',
    body:
      'No. The iPhone 16 Pro is slightly larger than the 15 Pro and adds the Camera Control button, so a 15 Pro case is both too small and missing a cutout.',
  },
  iphone_16_pro_max: {
    heading: 'Will an iPhone 15 Pro Max case fit an iPhone 16 Pro Max?',
    body:
      'No. The 16 Pro Max is slightly taller and wider than the 15 Pro Max, and adds the Camera Control button along the right edge. An older case will not seat properly.',
  },
  iphone_17: {
    heading: 'Will an older case fit an iPhone 17?',
    body:
      'No. Cases are cut for a specific model, and even small changes to height, edge shape, camera layout or button placement stop an older case from seating correctly. If a case is not listed as fitting the iPhone 17, assume it does not.',
  },
  iphone_17_pro: {
    heading: 'Will an older case fit an iPhone 17 Pro?',
    body:
      'No. Pro models change most between generations — button layout and camera housing in particular. A case has to be cut for the 17 Pro specifically.',
  },
  iphone_17_pro_max: {
    heading: 'Will an older case fit an iPhone 17 Pro Max?',
    body:
      'No. A Pro Max case has to be cut for its exact model: height, camera housing and button placement all shift between generations, and a case from the previous year will not line up.',
  },
}

export function getModelNote(slug: string): ModelNote | null {
  return MODEL_NOTES[slug] ?? null
}
