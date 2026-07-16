/**
 * Shipping rates and delivery windows.
 *
 * ⚠️ THIS FILE IS THE SOURCE OF TRUTH for what customers are charged and
 * promised at checkout. If you change anything here, update these to match:
 *   - app/shipping/page.tsx   (the public policy page)
 *   - app/faq/page.tsx        (the shipping FAQ answers — these feed FAQ schema
 *                              that Google and AI engines read as fact)
 *
 * They previously disagreed on every single number. Keep them in sync.
 *
 * `days` are BUSINESS days, and are delivery time only — processing time
 * (1–3 business days) is separate and comes before this.
 */
export const SHIPPING_RATES = {
  CA: {
    standard: { cost: 0, days: '5–10' },
    express: { cost: 13, days: '2–3' },
  },
  US: {
    standard: { cost: 0, days: '5–10' },
    express: { cost: 13, days: '2–3' },
  },
  INTL: {
    standard: { cost: 14, days: '7–15' },
    express: { cost: 30, days: '3–4' },
  },
}

export function getShippingRegion(country: string): 'CA' | 'US' | 'INTL' {
  if (country === 'CA' || country === 'Canada') return 'CA'
  if (country === 'US' || country === 'USA' || country === 'United States') return 'US'
  return 'INTL'
}

export function getShippingCost(
  country: string,
  method: 'standard' | 'express'
): number {
  const region = getShippingRegion(country)
  return SHIPPING_RATES[region][method].cost
}

export function getShippingDays(
  country: string,
  method: 'standard' | 'express'
): string {
  const region = getShippingRegion(country)
  return SHIPPING_RATES[region][method].days
}
