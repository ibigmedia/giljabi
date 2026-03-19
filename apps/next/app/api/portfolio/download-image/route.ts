import { NextRequest, NextResponse } from 'next/server'

// GET /api/portfolio/download-image?url=...  — proxy download for cross-origin images
export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url')
    if (!url) {
        return NextResponse.json({ error: 'url parameter required' }, { status: 400 })
    }

    try {
        const res = await fetch(url, {
            signal: AbortSignal.timeout(15000),
            redirect: 'follow',
        })

        if (!res.ok) {
            return NextResponse.json({ error: `Failed to fetch image: ${res.status}` }, { status: 502 })
        }

        const contentType = res.headers.get('content-type') || 'image/png'
        const buffer = await res.arrayBuffer()

        const ext = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg'
            : contentType.includes('webp') ? 'webp'
            : 'png'

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="ai-thumbnail-${Date.now()}.${ext}"`,
                'Cache-Control': 'no-store',
            },
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Download failed' }, { status: 500 })
    }
}
