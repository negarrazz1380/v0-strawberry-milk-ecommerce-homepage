/**
 * Google Analytics 4 (GA4) helper for CaseKisses.
 *
 * The base gtag.js snippet is injected in app/layout.tsx (production only).
 * These helpers fire GA4 recommended ecommerce events. They are safe to call
 * anywhere — on the server, or before gtag has loaded, they simply no-op.
 */
export const GA_MEASUREMENT_ID = 'G-JZNL8GX2J'

type GtagParams = Record<string, unknown>

function gtagFn(): ((...args: unknown[]) => void) | undefined {
  if (typeof window === 'undefined') return undefined
  const fn = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
  return typeof fn === 'function' ? fn : undefined
}

/** Fire a raw GA4 event. No-ops if GA isn't loaded (dev, or before init). */
export function gaEvent(name: string, params: GtagParams = {}): void {
  const gtag = gtagFn()
  if (!gtag) return
  gtag('event', name, params)
}

export interface GaItem {
  item_id: string
  item_name: string
  price?: number
  quantity?: number
  item_variant?: string
}

export function gaViewItem(item: GaItem): void {
  gaEvent('view_item', { currency: 'CAD', value: item.price ?? 0, items: [item] })
}

export function gaAddToCart(item: GaItem): void {
  const quantity = item.quantity ?? 1
  gaEvent('add_to_cart', {
    currency: 'CAD',
    value: (item.price ?? 0) * quantity,
    items: [{ ...item, quantity }],
  })
}

export function gaBeginCheckout(items: GaItem[], value: number): void {
  gaEvent('begin_checkout', { currency: 'CAD', value, items })
}

export function gaPurchase(args: {
  transaction_id: string
  value: number
  items?: GaItem[]
}): void {
  gaEvent('purchase', {
    transaction_id: args.transaction_id,
    currency: 'CAD',
    value: args.value,
    items: args.items ?? [],
  })
}
