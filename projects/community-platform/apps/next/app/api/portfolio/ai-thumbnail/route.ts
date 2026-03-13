import { NextRequest, NextResponse } from 'next/server'

// POST /api/portfolio/ai-thumbnail — Claude optimizes prompt → Pollinations generates image
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
                            content: `You are an expert image prompt engineer. Convert the following text into an optimized English prompt for AI image generation. The image should be suitable as an album cover or music thumbnail. Output ONLY the English prompt, nothing else. Keep it under 100 words.

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
            } catch {
                // Claude failed — use original prompt as fallback
            }
        }

        // Step 2: Generate image URL with Pollinations using the optimized prompt
        const seed = hashCode(prompt) // Use original prompt for consistent seeding
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(optimizedPrompt)}?width=512&height=512&seed=${seed}&nologo=true`

        return NextResponse.json({
            imageUrl,
            optimizedPrompt,
            originalPrompt: prompt.trim(),
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 오류' }, { status: 500 })
    }
}

function hashCode(s: string): number {
    let hash = 0
    for (let i = 0; i < s.length; i++) {
        hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0
    }
    return Math.abs(hash)
}
