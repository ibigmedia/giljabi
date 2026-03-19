import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../utils/supabase-server'

// GET /api/portfolio/videos
export async function GET() {
    try {
        const sb = getSupabaseAdmin()
        const { data, error } = await sb
            .from('MusicVideo')
            .select('*')
            .order('publishedAt', { ascending: false })

        if (error) throw error
        return NextResponse.json(data || [])
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// POST /api/portfolio/videos
export async function POST(req: NextRequest) {
    try {
        const sb = getSupabaseAdmin()
        const body = await req.json()
        const { title, youtubeUrl, thumbnailUrl, duration, views, status } = body

        const { data, error } = await sb
            .from('MusicVideo')
            .insert({ title, youtubeUrl, thumbnailUrl, duration: duration || '0:00', views: views || 0, status: status || 'draft' })
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(data, { status: 201 })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
