import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../utils/supabase-server'

// POST /api/portfolio/upload — upload a file to Supabase Storage
export async function POST(req: NextRequest) {
    try {
        const formData: any = await req.formData()
        const file = formData.get('file') as File | null
        const folder = (formData.get('folder') as string) || 'media'

        if (!file) {
            return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })
        }

        const sb = getSupabaseAdmin()

        // Ensure bucket exists (create if not)
        const { data: buckets } = await sb.storage.listBuckets()
        if (!buckets?.find(b => b.name === 'portfolio')) {
            await sb.storage.createBucket('portfolio', { public: true, fileSizeLimit: 52428800 }) // 50MB limit
        }

        // Generate unique filename
        const ext = file.name.split('.').pop() || 'bin'
        const timestamp = Date.now()
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 50)
        const path = `${folder}/${timestamp}-${safeName}`

        // Upload file
        const arrayBuffer = await file.arrayBuffer()
        const { data, error } = await sb.storage
            .from('portfolio')
            .upload(path, arrayBuffer, {
                contentType: file.type,
                upsert: false,
            })

        if (error) throw error

        // Get public URL
        const { data: { publicUrl } } = sb.storage
            .from('portfolio')
            .getPublicUrl(data.path)

        return NextResponse.json({
            url: publicUrl,
            path: data.path,
            name: file.name,
            size: file.size,
            type: file.type,
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message || '업로드 실패' }, { status: 500 })
    }
}
