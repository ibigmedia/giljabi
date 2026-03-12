import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url')
    if (!url) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
    }

    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000)

        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; GiljabiBot/1.0)',
                'Accept': 'text/html',
            },
            signal: controller.signal,
            redirect: 'follow',
        })
        clearTimeout(timeout)

        const contentType = res.headers.get('content-type') || ''
        if (!contentType.includes('text/html')) {
            return NextResponse.json({ title: url, url })
        }

        const html = await res.text()
        const slice = html.slice(0, 30000)

        const getMetaContent = (property: string): string | null => {
            const patterns = [
                new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
                new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
                new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
                new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, 'i'),
            ]
            for (const pattern of patterns) {
                const match = slice.match(pattern)
                if (match) return match[1]!
            }
            return null
        }

        const titleMatch = slice.match(/<title[^>]*>([^<]+)<\/title>/i)

        const data = {
            url,
            title: getMetaContent('og:title') || getMetaContent('twitter:title') || (titleMatch ? titleMatch[1] : null) || url,
            description: getMetaContent('og:description') || getMetaContent('twitter:description') || getMetaContent('description') || null,
            image: getMetaContent('og:image') || getMetaContent('twitter:image') || null,
            siteName: getMetaContent('og:site_name') || null,
            favicon: null as string | null,
        }

        const faviconMatch = slice.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i)
            || slice.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i)
        if (faviconMatch) {
            const fav = faviconMatch[1]!
            if (fav.startsWith('http')) {
                data.favicon = fav
            } else if (fav.startsWith('//')) {
                data.favicon = 'https:' + fav
            } else {
                const origin = new URL(url).origin
                data.favicon = origin + (fav.startsWith('/') ? fav : '/' + fav)
            }
        }

        if (data.image && !data.image.startsWith('http')) {
            if (data.image.startsWith('//')) {
                data.image = 'https:' + data.image
            } else {
                const origin = new URL(url).origin
                data.image = origin + (data.image.startsWith('/') ? data.image : '/' + data.image)
            }
        }

        return NextResponse.json(data, {
            headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' },
        })
    } catch {
        return NextResponse.json({ title: url, url })
    }
}
