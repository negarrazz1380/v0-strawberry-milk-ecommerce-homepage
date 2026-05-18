import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
// LLM generation can exceed the default 10s function limit.
export const maxDuration = 60

// Strategy fields the client renders. Structured outputs guarantees the model
// returns schema-valid JSON, so we no longer rely on "return ONLY JSON" prompt
// hacks or an assistant prefill (both removed on Opus 4.7).
const STRATEGY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    archetype: { type: 'string' },
    why_works: { type: 'string' },
    caption: { type: 'string' },
    hashtags: { type: 'array', items: { type: 'string' } },
    sound: { type: 'string' },
    best_times: { type: 'string' },
    platform_tips: { type: 'string' },
    alt_spicy: { type: 'string' },
    alt_soft: { type: 'string' },
    engagement_hook: { type: 'string' },
    revenue_angle: { type: 'string' },
  },
  required: [
    'archetype',
    'why_works',
    'caption',
    'hashtags',
    'sound',
    'best_times',
    'platform_tips',
    'alt_spicy',
    'alt_soft',
    'engagement_hook',
    'revenue_angle',
  ],
} as const

// Frozen across every request — no per-request interpolation — so it forms a
// stable cacheable prefix. Per-request inputs go in the user turn, after the
// cache breakpoint.
const SYSTEM_PROMPT = `You are a viral TikTok and Instagram Reels strategist for Case Kisses, a Canadian phone-case brand (cute, girly, coquette aesthetic; ships in CAD across Canada & the USA).

For each request you produce a complete content strategy. Field guidance:
- archetype: the detected content archetype name.
- why_works: one sentence on why this angle works specifically for Case Kisses' audience.
- caption: lowercase, punchy, emoji-friendly hook, 20-25 words max.
- hashtags: 7-8 tags mixing brand, niche, and discovery tags (include #casekisses).
- sound: a specific trending sound/song name or "original sound", plus a brief why.
- best_times: three posting times in EST, pipe-separated.
- platform_tips: one concrete platform-specific hack for the chosen platform.
- alt_spicy: a bolder, more confident variant of the caption.
- alt_soft: a more vulnerable, emotional variant of the caption.
- engagement_hook: what to do in the first hour (comment strategy, etc.).
- revenue_angle: one sentence on how this drives actual sales.

Keep copy authentic to a Gen-Z girly brand voice. Be specific, never generic.`

const MAX_FIELD_LEN = 500

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, MAX_FIELD_LEN) : ''
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const product = clean(body?.product)
    const platform = clean(body?.platform)
    const archetype = clean(body?.archetype)
    const context = clean(body?.context)

    if (!product || !platform || !archetype) {
      return NextResponse.json(
        { error: 'product, platform and archetype are required' },
        { status: 400 }
      )
    }

    // Read the key lazily and construct the client inside the handler. The SDK
    // throws at construction when the key is missing, so a module-level client
    // would break `next build` page-data collection when env is unset.
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('[content-engine] ANTHROPIC_API_KEY is not set')
      return NextResponse.json(
        { error: 'Content engine is not configured' },
        { status: 500 }
      )
    }

    const client = new Anthropic()

    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 16000,
      // Adaptive thinking self-moderates; medium effort keeps this snappy
      // enough for an interactive tool while leaving room for nuance.
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'medium',
        format: { type: 'json_schema', schema: STRATEGY_SCHEMA },
      },
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          // Cache breakpoint on the stable prefix. Note: Opus 4.7's minimum
          // cacheable prefix is ~4096 tokens — this short prompt won't cache
          // yet, but the architecture is correct, so caching kicks in
          // automatically if the system prompt grows (brand voice docs,
          // few-shot examples, etc.).
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Product: ${product}
Platform: ${platform}
Content Type: ${archetype}
Context: ${context || 'None provided'}`,
        },
      ],
    })

    if (response.stop_reason === 'refusal') {
      return NextResponse.json(
        { error: 'The request was declined. Try a different prompt.' },
        { status: 422 }
      )
    }
    if (response.stop_reason === 'max_tokens') {
      return NextResponse.json(
        { error: 'The response was truncated. Please try again.' },
        { status: 502 }
      )
    }

    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json(
        { error: 'No strategy was generated. Please try again.' },
        { status: 502 }
      )
    }

    // Structured outputs guarantees schema-valid JSON in the text block.
    const strategy = JSON.parse(textBlock.text)
    return NextResponse.json(strategy)
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: 'Busy right now — please try again in a moment.' },
        { status: 429 }
      )
    }
    if (error instanceof Anthropic.APIError) {
      console.error('[content-engine] Anthropic API error:', error.status, error.message)
      return NextResponse.json(
        { error: 'Failed to generate strategy. Please try again.' },
        { status: 502 }
      )
    }
    console.error('[content-engine] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate strategy. Please try again.' },
      { status: 500 }
    )
  }
}
