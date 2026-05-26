import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
// LLM generation can exceed the default 10s function limit.
export const maxDuration = 60

// The schema is described in the prompt (no structured-outputs param), and the
// model is told to return ONLY raw JSON matching this exact shape.
const SYSTEM_PROMPT = `You are a viral TikTok and Instagram Reels strategist for Case Kisses, a Canadian phone-case brand (cute, girly, coquette aesthetic; ships in CAD across Canada & the USA).

Generate a complete content strategy for the given product, platform and content type.

Respond with ONLY a single valid JSON object and nothing else — no markdown, no code fences, no commentary before or after. The JSON must match exactly this shape:

{
  "archetype": "the detected content archetype name",
  "why_works": "one sentence on why this angle works for Case Kisses' audience",
  "caption": "lowercase, punchy, emoji-friendly hook, 20-25 words max",
  "hashtags": ["7-8 tags mixing brand, niche and discovery tags; include #casekisses"],
  "sound": "a specific trending sound/song name or 'original sound', plus a brief why",
  "best_times": "three posting times in EST, pipe-separated",
  "platform_tips": "one concrete platform-specific hack for the chosen platform",
  "alt_spicy": "a bolder, more confident variant of the caption",
  "alt_soft": "a more vulnerable, emotional variant of the caption",
  "engagement_hook": "what to do in the first hour (comment strategy, etc.)",
  "revenue_angle": "one sentence on how this drives actual sales",
  "video_prompt": "a complete, ready-to-use Higgsfield / Kling 3.0 video prompt — follow the rules below"
}

"hashtags" must be a JSON array of 7-8 strings.

The "video_prompt" field must be a complete, ready-to-use Higgsfield / Kling 3.0 video prompt:
- Break it into numbered shots (Shot 1, Shot 2, Shot 3, ...).
- Give exact timing: 1.6-1.9s per shot and 0.2s transitions between shots.
- Every shot needs explicit camera directions (angle, movement, lens feel) and one specific physical action.
- The visual style MUST match the content type/archetype: dark, moody, high-contrast and cinematic for "The Heist" and "Dark Girly Aesthetic"; fast, chaotic, handheld energy for "Dog Goes Feral"; soft pink, dreamy, slow-motion and feminine for "Coquette POV"; clean tactile close-up macro for "ASMR Unboxing"; aspirational confident flex for "Collection Haul"; honest and natural for "Honest Review". Adapt sensibly for any other type.
- The entire value MUST always end with exactly this text: no dialogue, vertical 9:16, reproduce case exactly as shown in reference image
- Keep the entire "video_prompt" value under 2500 characters.

All 12 fields above (including "video_prompt") are required and must be present. Keep copy authentic to a Gen-Z girly brand voice. Be specific, never generic.`

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
      model: 'claude-sonnet-4-5',
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Product: ${product}
Platform: ${platform}
Content Type: ${archetype}
Context: ${context || 'None provided'}

Return the content strategy as a single JSON object.`,
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

    // Parse the model's response as JSON. The system prompt asks for raw JSON;
    // strip an accidental ```json fence before parsing just in case.
    const raw = textBlock.text.trim().replace(/^```(?:json)?\s*|\s*```$/g, '')
    let strategy: unknown
    try {
      strategy = JSON.parse(raw)
    } catch {
      console.error('[content-engine] Model did not return valid JSON')
      return NextResponse.json(
        { error: 'Failed to generate strategy. Please try again.' },
        { status: 502 }
      )
    }
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
