import { NextRequest, NextResponse } from 'next/server'

// POST /api/portfolio/ai-thumbnail — Claude optimizes prompt → multiple image services with fallback
export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json()
        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: '프롬프트를 입력해주세요.' }, { status: 400 })
        }

        // Step 1: Use Claude to translate/optimize the prompt for image generation
        let optimizedPrompt = prompt.trim()
        const anthropicKey = process.env.ANTHROPIC_API_KEY

        if (anthropicKey) {
            try {
                const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': anthropicKey,
                        'anthropic-version': '2023-06-01',
                    },
                    body: JSON.stringify({
                        model: 'claude-haiku-4-5-20251001',
                        max_tokens: 150,
                        messages: [{
                            role: 'user',
                            content: `You are an expert image prompt engineer. Convert the following text into an optimized English prompt for AI image generation. The image should be suitable as an album cover or music thumbnail. Output ONLY the English prompt, nothing else. Keep it under 60 words.

Input: "${prompt.trim()}"`,
                        }],
                    }),
                    signal: AbortSignal.timeout(8000),
                })

                if (claudeRes.ok) {
                    const claudeData = await claudeRes.json()
                    const text = claudeData.content?.[0]?.text?.trim()
                    if (text && text.length > 5) {
                        optimizedPrompt = text
                    }
                }
            } catch (claudeErr: any) {
                console.error('Claude API error:', claudeErr.message)
            }
        }

        // Step 2: Try multiple image generation services with fallback
        const seed = hashCode(prompt)

        // Try Pollinations first (free, no key needed)
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(optimizedPrompt)}?width=512&height=512&seed=${seed}&nologo=true&model=flux`
        const imageUrl = await tryFetchImage(pollinationsUrl, 20000)

        if (imageUrl) {
            return NextResponse.json({
                imageUrl,
                optimizedPrompt,
                originalPrompt: prompt.trim(),
                source: 'pollinations',
            })
        }

        // Fallback 1: Try Pollinations with turbo model
        const pollinationsTurbo = `https://image.pollinations.ai/prompt/${encodeURIComponent(optimizedPrompt)}?width=512&height=512&seed=${seed}&nologo=true&model=turbo`
        const turboUrl = await tryFetchImage(pollinationsTurbo, 15000)

        if (turboUrl) {
            return NextResponse.json({
                imageUrl: turboUrl,
                optimizedPrompt,
                originalPrompt: prompt.trim(),
                source: 'pollinations-turbo',
            })
        }

        // Fallback 2: Use picsum.photos placeholder with deterministic seed
        const picsumUrl = `https://picsum.photos/seed/${seed}/512/512`
        return NextResponse.json({
            imageUrl: picsumUrl,
            optimizedPrompt,
            originalPrompt: prompt.trim(),
            source: 'picsum-fallback',
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 오류' }, { status: 500 })
    }
}

// Actually fetch the image to verify it works, return the URL only if successful
async function tryFetchImage(url: string, timeoutMs: number): Promise<string | null> {
    try {
        const res = await fetch(url, {
            method: 'GET',
            signal: AbortSignal.timeout(timeoutMs),
            redirect: 'follow',
        })
        if (!res.ok) return null
        const contentType = res.headers.get('content-type') || ''
        if (!contentType.startsWith('image/')) return null
        // Consume the body to ensure it's a valid response
        const buffer = await res.arrayBuffer()
        if (buffer.byteLength < 1000) return null // too small = likely error
        // Return the final URL (after redirects)
        return url
    } catch {
        return null
    }
}

function hashCode(s: string): number {
    let hash = 0
    for (let i = 0; i < s.length; i++) {
        hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0
    }
    return Math.abs(hash)
}
