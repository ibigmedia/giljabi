import { NextRequest, NextResponse } from 'next/server'

// POST /api/portfolio/ai-thumbnail — generate an AI image from a text prompt
export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json()
        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: '프롬프트를 입력해주세요.' }, { status: 400 })
        }

        const seed = hashCode(prompt)
        const cleanPrompt = prompt.trim().slice(0, 200)

        // Return Pollinations URL directly — no server-side verification needed
        // The browser <img> tag will handle loading the AI-generated image
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=512&height=512&seed=${seed}&nologo=true`

        return NextResponse.json({ imageUrl })
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
