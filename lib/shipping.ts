export const SHIPPING_RATES = {
  CA: {
    standard: { cost: 0, days: '5–8' },
    express: { cost: 13, days: '1–3' },
  },
  US: {
    standard: { cost: 0, days: '4–6' },
    express: { cost: 13, days: '1–3' },
  },
  INTL: {
    standard: { cost: 14, days: '10–20' },
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
