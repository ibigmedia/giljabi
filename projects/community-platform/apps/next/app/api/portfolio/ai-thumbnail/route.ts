import { NextRequest, NextResponse } from 'next/server'

// POST /api/portfolio/ai-thumbnail — generate an AI image from a text prompt
// Uses Pollinations.ai (free, no API key needed)
export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json()
        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: '프롬프트를 입력해주세요.' }, { status: 400 })
        }

        // Build a rich prompt for album art
        const fullPrompt = `album cover art, music, professional, high quality, ${prompt}`
        const encoded = encodeURIComponent(fullPrompt)

        // Pollinations.ai generates images from text prompts via URL
        // Adding a seed based on prompt ensures same prompt = same image
        const seed = hashCode(prompt)
        const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&seed=${seed}&nologo=true`

        // Verify the URL is reachable
        const check = await fetch(imageUrl, { method: 'HEAD' })
        if (!check.ok) {
            return NextResponse.json({ error: 'AI 이미지 생성 실패' }, { status: 502 })
        }

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
