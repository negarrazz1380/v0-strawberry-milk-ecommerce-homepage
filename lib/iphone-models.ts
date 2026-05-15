// Mapping between URL slugs and display names for iPhone models
// URL slugs: iphone_12, iphone_13, etc.
// Display names: "iPhone 12 series", "iPhone 13 series", etc.

export const IPHONE_MODELS_MAP: Record<string, string> = {
  iphone_12: 'iPhone 12 series',
  iphone_13: 'iPhone 13 series',
  iphone_14: 'iPhone 14 series',
  iphone_15: 'iPhone 15',
  iphone_15_pro: 'iPhone 15 Pro',
  iphone_15_pro_max: 'iPhone 15 Pro Max',
  iphone_16: 'iPhone 16',
  iphone_16_pro: 'iPhone 16 Pro',
  iphone_16_pro_max: 'iPhone 16 Pro Max',
  iphone_17: 'iPhone 17',
  iphone_17_pro: 'iPhone 17 Pro',
  iphone_17_pro_max: 'iPhone 17 Pro Max',
}

// Reverse mapping for product page model selector
export const DISPLAY_TO_SLUG: Record<string, string> = Object.entries(IPHONE_MODELS_MAP).reduce(
  (acc, [slug, display]) => {
    acc[display] = slug
    return acc
  },
  {} as Record<string, string>
)

// Helper to get display name from URL slug
export function getModelDisplayName(slug: string): string {
  return IPHONE_MODELS_MAP[slug] || slug.replace(/_/g, ' ').toUpperCase()
}

// Helper to get all model display names
export function getAllModelDisplayNames(): string[] {
  return Object.values(IPHONE_MODELS_MAP)
}
