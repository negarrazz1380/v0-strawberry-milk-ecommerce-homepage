/**
 * IndexNow — tells Bing (and therefore ChatGPT) about changed URLs immediately
 * instead of waiting for a crawl.
 *
 * ChatGPT's search retrieves from Bing's index, so how fast Bing learns about a
 * change is how fast ChatGPT can cite it. IndexNow turns "wait weeks" into
 * "within a day".
 *
 * The key is verified by a text file at:
 *   https://www.casekisses.com/13c8a650040c46b7af094fcf694e1d57.txt
 * which must contain exactly the key below. If you rotate the key, rename that
 * file to match — Bing rejects submissions when the two disagree.
 *
 * Usage — after publishing or changing a page:
 *   await submitToIndexNow(['https://www.casekisses.com/product/new-case'])
 *
 * This is best-effort: failures are logged and swallowed. Never let an IndexNow
 * problem break a page render or an API response.
 */

const INDEX_NOW_KEY = '13c8a650040c46b7af094fcf694e1d57'
const HOST = 'www.casekisses.com'
const ENDPOINT = 'https://api.indexnow.org/IndexNow'

export async function submitToIndexNow(urls: string[]): Promise<boolean> {
  if (urls.length === 0) return true

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: INDEX_NOW_KEY,
        keyLocation: `https://${HOST}/${INDEX_NOW_KEY}.txt`,
        urlList: urls,
      }),
    })

    // 200 = accepted, 202 = accepted but key validation pending.
    if (response.ok || response.status === 202) {
      console.log(`[indexnow] Submitted ${urls.length} URL(s)`)
      return true
    }

    console.error(`[indexnow] Rejected with ${response.status}`)
    return false
  } catch (error) {
    console.error('[indexnow] Request failed:', error)
    return false
  }
}
