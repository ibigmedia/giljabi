import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST /api/portfolio/ai-thumbnail — Google Gemini (나노바나나) image generation with fallbacks
export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json()
        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: '프롬프트를 입력해주세요.' }, { status: 400 })
        }

        // Step 1: Optimize prompt with Claude (optional, if key available)
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

        // Step 2: Try Google Gemini (나노바나나) first
        const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
        if (geminiKey) {
            try {
                const imageResult = await generateWithGemini(geminiKey, optimizedPrompt)
                if (imageResult) {
                    // Upload to Supabase Storage for a permanent URL
                    const publicUrl = await uploadToSupabase(imageResult.buffer, imageResult.mimeType)
                    if (publicUrl) {
                        return NextResponse.json({
                            imageUrl: publicUrl,
                            optimizedPrompt,
                            originalPrompt: prompt.trim(),
                            source: 'gemini-nano-banana',
                        })
                    }
                }
            } catch (geminiErr: any) {
                console.error('Gemini API error:', geminiErr.message)
            }
        }

        // Step 3: Fallback — Pollinations
        const seed = hashCode(prompt)
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(optimizedPrompt)}?width=512&height=512&seed=${seed}&nologo=true&model=flux`
        const pollinationsImage = await tryFetchImage(pollinationsUrl, 20000)
        if (pollinationsImage) {
            return NextResponse.json({
                imageUrl: pollinationsUrl,
                optimizedPrompt,
                originalPrompt: prompt.trim(),
                source: 'pollinations',
            })
        }

        // Step 4: Final fallback — picsum.photos placeholder
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

// ─── Google Gemini (나노바나나) Image Generation ────────────────────────
async function generateWithGemini(
    apiKey: string,
    prompt: string,
): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Generate an album cover art image: ${prompt}. Make it visually stunning, artistic, and suitable as a music album thumbnail. Square format.`,
                    }],
                }],
                generationConfig: {
                    responseModalities: ['TEXT', 'IMAGE'],
                },
            }),
            signal: AbortSignal.timeout(30000),
        },
    )

    if (!res.ok) {
        const errText = await res.text()
        console.error('Gemini response error:', res.status, errText)
        return null
    }

    const data = await res.json()
    const parts = data.candidates?.[0]?.content?.parts
    if (!parts) return null

    for (const part of parts) {
        if (part.inlineData?.data) {
            const buffer = Buffer.from(part.inlineData.data, 'base64')
            const mimeType = part.inlineData.mimeType || 'image/png'
            if (buffer.byteLength > 1000) {
                return { buffer, mimeType }
            }
        }
    }
    return null
}

// ─── Upload to Supabase Storage ────────────────────────────────────────
async function uploadToSupabase(
    buffer: Buffer,
    mimeType: string,
): Promise<string | null> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) return null

    const supabase = createClient(supabaseUrl, serviceKey)
    const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg'
    const fileName = `ai-thumbnails/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const { error } = await supabase.storage
        .from('portfolio')
        .upload(fileName, buffer, {
            contentType: mimeType,
            upsert: false,
        })

    if (error) {
        console.error('Supabase upload error:', error.message)
        return null
    }

    const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(fileName)
    return urlData?.publicUrl || null
}

// ─── Helpers ───────────────────────────────────────────────────────────
async function tryFetchImage(url: string, timeoutMs: number): Promise<boolean> {
    try {
        const res = await fetch(url, {
            method: 'GET',
            signal: AbortSignal.timeout(timeoutMs),
            redirect: 'follow',
        })
        if (!res.ok) return false
        const contentType = res.headers.get('content-type') || ''
        if (!contentType.startsWith('image/')) return false
        const buffer = await res.arrayBuffer()
        return buffer.byteLength > 1000
    } catch {
        return false
    }
}

function hashCode(s: string): number {
    let hash = 0
    for (let i = 0; i < s.length; i++) {
        hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0
    }
    return Math.abs(hash)
}
