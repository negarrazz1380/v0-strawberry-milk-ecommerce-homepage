/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    /**
     * `unoptimized: true` used to be set here.
     *
     * That was a leftover from the v0 template this repo started as — v0's
     * preview environment doesn't run the image optimizer, so it ships with it
     * disabled. Left on, it meant every visitor downloaded the full-resolution
     * originals: the homepage was serving 15.3 MB of images, where the same
     * pictures as resized WebP come to well under 1 MB. On mobile data that is
     * the difference between a page that paints and a page that doesn't.
     *
     * With this removed, Next.js resizes and re-encodes to WebP/AVIF on the
     * fly, per device. The big source files can stay as they are — only what
     * gets served matters.
     *
     * NOTE: image optimization is metered on Vercel's Hobby plan. At this
     * catalogue size we are nowhere near the limits, but that is the reason the
     * template had it switched off in the first place.
     */
    formats: ['image/avif', 'image/webp'],
    // Product images live in Supabase storage, so the optimizer needs explicit
    // permission to fetch and transform them.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jiybdkvylfaabznyqpes.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/iphone',
        destination: '/',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
