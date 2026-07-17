/**
 * Wallpaper catalogue for the free Cute Kit.
 *
 * ─── HOW TO ADD A WALLPAPER ───────────────────────────────────────────────
 * 1. Export at 1290 x 2796 (iPhone 15/16 Pro Max). It downscales cleanly to
 *    every smaller iPhone; going the other way looks soft.
 * 2. Name the file for what it IS, not what it's called internally:
 *    good  -> pink-bow-coquette-iphone-wallpaper.png
 *    bad   -> wallpaper1.png / IMG_2938.png
 *    Filenames are a real signal for Google Images, and this product is visual.
 * 3. Drop it in /public/wallpapers/
 * 4. Add an entry below. `alt` must describe what is VISIBLE — it is how AI
 *    crawlers understand the image, and a vague or wrong alt is worse than a
 *    plain one.
 *
 * Keep this list honest: every entry here must be a file that actually exists,
 * or the page 404s an image and the download button lies.
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
  // ⬇️ REPLACE THESE with your real wallpapers once the files are in
  //    /public/wallpapers/. They are commented out on purpose: an empty grid
  //    with an honest "coming soon" message is better than broken images.
  //
  // {
  //   id: 'pink-bow',
  //   name: 'Pink Bow',
  //   file: '/wallpapers/pink-bow-coquette-iphone-wallpaper.png',
  //   alt: 'Pastel pink iPhone wallpaper covered in small satin bows',
  // },
  // {
  //   id: 'cherry',
  //   name: 'Cherry',
  //   file: '/wallpapers/cherry-coquette-iphone-wallpaper.png',
  //   alt: 'Cream iPhone wallpaper scattered with small red cherries',
  // },
  // {
  //   id: 'teddy',
  //   name: 'Teddy',
  //   file: '/wallpapers/teddy-bear-iphone-wallpaper.png',
  //   alt: 'Soft brown iPhone wallpaper with a repeating teddy bear pattern',
  // },
]
