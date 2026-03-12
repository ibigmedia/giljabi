import { NextRequest, NextResponse } from 'next/server'

// POST /api/portfolio/ai-thumbnail — generate an AI image from a text prompt
export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json()
        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: '프롬프트를 입력해주세요.' }, { status: 400 })
        }

        // Extract key words from prompt (keep it short for Pollinations reliability)
        const keywords = prompt.trim().replace(/[^a-zA-Z0-9가-힣\s-]/g, '').split(/\s+/).slice(0, 6).join('-')
        const seed = hashCode(prompt)

        // Try Pollinations.ai first (free AI image generation)
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(keywords)}?width=512&height=512&seed=${seed}`

        try {
            const res = await fetch(pollinationsUrl, {
                method: 'GET',
                signal: AbortSignal.timeout(15000), // 15s timeout
            })
            if (res.ok && res.headers.get('content-type')?.includes('image')) {
                return NextResponse.json({ imageUrl: pollinationsUrl })
            }
        } catch {
            // Pollinations failed, fall through to fallback
        }

        // Fallback: picsum.photos with deterministic seed from prompt
        // Not AI-generated but deterministic per prompt (same prompt = same image)
        const fallbackUrl = `https://picsum.photos/seed/${keywords}-${seed}/512/512`
        return NextResponse.json({ imageUrl: fallbackUrl, fallback: true })
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
