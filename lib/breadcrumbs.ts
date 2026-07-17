/**
 * BreadcrumbList structured data.
 *
 * Why this matters beyond pretty Google results: breadcrumbs tell search and AI
 * engines how a page sits inside the site. A product page that declares
 * Home > iPhone Cases > Cute Teddy Bear iPhone Case is making its category
 * membership explicit rather than hoping a crawler infers it from the nav.
 *
 * Keep the crumbs identical to what a user actually sees, and always use
 * absolute URLs — relative ones are silently ignored by some parsers.
 */

const BASE_URL = 'https://www.casekisses.com'

export interface Crumb {
  name: string
  /** Path relative to the site root, e.g. '/shop-all'. Omit for the last crumb. */
  path?: string
}

export function buildBreadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      // The final crumb is the current page, so it carries no item URL —
      // that's what schema.org expects for the terminal node.
      ...(crumb.path ? { item: `${BASE_URL}${crumb.path}` } : {}),
    })),
  }
}
