import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../../utils/supabase-server'

// PUT /api/portfolio/releases/:id — update release + replace tracks
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const sb = getSupabaseAdmin()
        const body = await req.json()
        const { title, artist, year, type, coverUrl, status, tracks } = body

        // Update release
        const { error: relErr } = await sb
            .from('Release')
            .update({ title, artist, year: Number(year), type, coverUrl, status })
            .eq('id', id)

        if (relErr) throw relErr

        // Replace tracks: delete existing, insert new
        if (tracks) {
            await sb.from('Track').delete().eq('releaseId', id)
            if (tracks.length > 0) {
                const trackRows = tracks.map((t: any, i: number) => ({
                    title: t.title,
                    duration: t.duration || '0:00',
                    plays: t.plays || 0,
                    audioUrl: t.audioUrl || null,
                    position: i,
                    releaseId: id,
                }))
                const { error: tErr } = await sb.from('Track').insert(trackRows)
                if (tErr) throw tErr
            }
        }

        const { data: full } = await sb
            .from('Release')
            .select('*, tracks:Track(*)')
            .eq('id', id)
            .single()

        return NextResponse.json(full)
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// DELETE /api/portfolio/releases/:id
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const sb = getSupabaseAdmin()
        const { error } = await sb.from('Release').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ ok: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
