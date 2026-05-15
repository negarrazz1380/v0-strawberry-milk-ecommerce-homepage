/**
 * Generates a URL-safe slug from a product name and optional device model.
 * This matches the logic used in the SQL backfill migration (006_add_product_slugs.sql).
 *
 * Example:
 *   generateProductSlug('Cherry Bliss Case', 'iPhone 16') => 'cherry-bliss-case-iphone-16'
 *   generateProductSlug('Cherry Bliss Case') => 'cherry-bliss-case'
 */
export function generateProductSlug(name: string, deviceModel?: string | null): string {
  const base = deviceModel ? `${name} ${deviceModel}` : name
  return base
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // strip special chars
    .replace(/\s+/g, '-')          // spaces to hyphens
    .replace(/-+/g, '-')           // collapse multiple hyphens
    .replace(/^-|-$/g, '')         // trim leading/trailing hyphens
}

/**
 * Returns the best URL path for a product. Uses slug if available, falls back to UUID.
 */
export function productUrl(product: { id: string; slug?: string | null }): string {
  return `/product/${product.slug || product.id}`
}

/**
 * Returns true if the given string looks like a UUID (v4).
 */
export function isUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}
