import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../utils/supabase-server'

// GET /api/portfolio/releases — list all releases with tracks
export async function GET() {
    try {
        const sb = getSupabaseAdmin()
        const { data, error } = await sb
            .from('Release')
            .select('*, tracks:Track(*)') // join tracks
            .order('year', { ascending: false })
            .order('createdAt', { ascending: false })

        if (error) throw error

        // Sort tracks by position
        const releases = (data || []).map((r: any) => ({
            ...r,
            tracks: (r.tracks || []).sort((a: any, b: any) => a.position - b.position),
        }))

        return NextResponse.json(releases)
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// POST /api/portfolio/releases — create a new release with tracks
export async function POST(req: NextRequest) {
    try {
        const sb = getSupabaseAdmin()
        const body = await req.json()
        const { title, artist, year, type, coverUrl, status, tracks } = body

        // Insert release
        const { data: release, error: relErr } = await sb
            .from('Release')
            .insert({ title, artist, year: Number(year), type: type || 'Single', coverUrl, status: status || 'draft' })
            .select()
            .single()

        if (relErr) throw relErr

        // Insert tracks
        if (tracks && tracks.length > 0) {
            const trackRows = tracks.map((t: any, i: number) => ({
                title: t.title,
                duration: t.duration || '0:00',
                plays: t.plays || 0,
                audioUrl: t.audioUrl || null,
                position: i,
                releaseId: release.id,
            }))
            const { error: tErr } = await sb.from('Track').insert(trackRows)
            if (tErr) throw tErr
        }

        // Return with tracks
        const { data: full } = await sb
            .from('Release')
            .select('*, tracks:Track(*)')
            .eq('id', release.id)
            .single()

        return NextResponse.json(full, { status: 201 })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
