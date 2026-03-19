import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../../utils/supabase-server'

// PUT /api/portfolio/videos/:id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const sb = getSupabaseAdmin()
        const body = await req.json()
        const { title, youtubeUrl, thumbnailUrl, duration, views, status } = body

        const { error } = await sb
            .from('MusicVideo')
            .update({ title, youtubeUrl, thumbnailUrl, duration, views, status })
            .eq('id', id)

        if (error) throw error

        const { data } = await sb.from('MusicVideo').select('*').eq('id', id).single()
        return NextResponse.json(data)
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// DELETE /api/portfolio/videos/:id
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const sb = getSupabaseAdmin()
        const { error } = await sb.from('MusicVideo').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ ok: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
