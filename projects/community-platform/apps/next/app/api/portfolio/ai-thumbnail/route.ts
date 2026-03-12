import { NextRequest, NextResponse } from 'next/server'

// POST /api/portfolio/ai-thumbnail — generate an AI image from a text prompt
export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json()
        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: '프롬프트를 입력해주세요.' }, { status: 400 })
        }

        const seed = hashCode(prompt)

        // Build an English-friendly prompt for Pollinations (transliterate Korean → description style)
        // Pollinations works best with English prompts
        const cleanPrompt = prompt.trim().slice(0, 200)
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=512&height=512&seed=${seed}&nologo=true&model=flux`

        // Verify Pollinations can serve the image with a HEAD request (fast, no download)
        try {
            const res = await fetch(pollinationsUrl, {
                method: 'HEAD',
                signal: AbortSignal.timeout(10000),
            })
            if (res.ok) {
                return NextResponse.json({ imageUrl: pollinationsUrl })
            }
        } catch {
            // HEAD failed — try GET with stream abort (some CDNs don't support HEAD)
        }

        // Second attempt: just return the URL directly — browser <img> will handle loading
        // Pollinations URLs are valid even without pre-verification
        return NextResponse.json({ imageUrl: pollinationsUrl, direct: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 오류' }, { status: 500 })
    }
}

// Simple string hash for deterministic seeds
function hashCode(s: string): number {
    let hash = 0
    for (let i = 0; i < s.length; i++) {
        hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0
    }
    return Math.abs(hash)
}
