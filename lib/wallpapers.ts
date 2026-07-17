/**
 * Wallpaper catalogue for the free Cute Kit.
 *
 * ─── ABOUT THE ALT TEXT ───────────────────────────────────────────────────
 * These descriptions are deliberately GENERIC — they name the palette and the
 * style, not the specific motifs, because the motifs weren't verified against
 * each image. That is the safe direction to be vague in: a wrong-but-specific
 * alt ("scattered satin bows") contradicts what an AI's vision model actually
 * sees and costs more than a plain one.
 *
 * If you go through them and want to be precise — "pale pink wallpaper with
 * satin bows and pearls" beats "pale pink coquette wallpaper" every time —
 * just describe what's visible and replace the `alt` values below.
 *
 * ─── ADDING MORE ──────────────────────────────────────────────────────────
 * 1. Export at 1290 x 2796 (iPhone 15/16 Pro Max) if you can — the current set
 *    is 853 x 1844, which iOS upscales. Fine on smaller iPhones, soft on a
 *    Pro Max.
 * 2. Name for what it is: pink-coquette-iphone-wallpaper-5.png
 *    Never spaces or commas — they become %20 and %2C in the URL.
 * 3. Drop it in /public/wallpapers/ and add an entry here.
 */

export interface Wallpaper {
  /** Stable id, used as the React key and in the download filename. */
  id: string
  /** Shown under the preview. */
  name: string
  /** Path under /public. */
  file: string
  /** Describes what is visible in the image. Not keywords. */
  alt: string
}

export const WALLPAPERS: Wallpaper[] = [
  {
    id: 'pink-1',
    name: 'Pink 01',
    file: '/wallpapers/pink-coquette-iphone-wallpaper-1.png',
    alt: 'Pale pink coquette iPhone wallpaper with a soft repeating pattern',
  },
  {
    id: 'pink-2',
    name: 'Pink 02',
    file: '/wallpapers/pink-coquette-iphone-wallpaper-2.png',
    alt: 'Soft blush pink coquette iPhone wallpaper with a delicate repeating pattern',
  },
  {
    id: 'pink-3',
    name: 'Pink 03',
    file: '/wallpapers/pink-coquette-iphone-wallpaper-3.png',
    alt: 'Muted pink coquette iPhone wallpaper with a soft repeating pattern',
  },
  {
    id: 'pink-4',
    name: 'Pink 04',
    file: '/wallpapers/pink-coquette-iphone-wallpaper-4.png',
    alt: 'Light pink coquette iPhone wallpaper with a delicate repeating pattern',
  },
  {
    id: 'cream-1',
    name: 'Cream 01',
    file: '/wallpapers/cream-coquette-iphone-wallpaper-1.png',
    alt: 'Cream coquette iPhone wallpaper with a small repeating pattern',
  },
  {
    id: 'cream-2',
    name: 'Cream 02',
    file: '/wallpapers/cream-coquette-iphone-wallpaper-2.png',
    alt: 'Warm cream coquette iPhone wallpaper with a soft repeating pattern',
  },
  {
    id: 'cream-3',
    name: 'Cream 03',
    file: '/wallpapers/cream-coquette-iphone-wallpaper-3.png',
    alt: 'Off-white coquette iPhone wallpaper with a delicate repeating pattern',
  },
  {
    id: 'pastel-1',
    name: 'Pastel 01',
    file: '/wallpapers/pastel-coquette-iphone-wallpaper-1.png',
    alt: 'Soft pastel coquette iPhone wallpaper with a gentle repeating pattern',
  },
  {
    id: 'pastel-2',
    name: 'Pastel 02',
    file: '/wallpapers/pastel-coquette-iphone-wallpaper-2.png',
    alt: 'Muted pastel coquette iPhone wallpaper with a soft repeating pattern',
  },
]
