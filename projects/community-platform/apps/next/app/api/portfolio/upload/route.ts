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

        // File size check (50MB max)
        if (file.size > 52428800) {
            return NextResponse.json({ error: '파일 크기가 50MB를 초과합니다.' }, { status: 400 })
        }

        const sb = getSupabaseAdmin()

        // Ensure bucket exists
        try {
            const { data: buckets } = await sb.storage.listBuckets()
            if (!buckets?.find((b: any) => b.name === 'portfolio')) {
                const { error: createErr } = await sb.storage.createBucket('portfolio', {
                    public: true,
                    fileSizeLimit: 52428800,
                })
                if (createErr) {
                    console.error('Bucket creation error:', createErr)
                }
            }
        } catch (bucketErr: any) {
            console.error('Bucket check error:', bucketErr.message)
            // Continue anyway — bucket might already exist
        }

        // Generate unique filename
        const timestamp = Date.now()
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 50)
        const filePath = `${folder}/${timestamp}-${safeName}`

        // Read file as Buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Supabase Storage
        const { data, error } = await sb.storage
            .from('portfolio')
            .upload(filePath, buffer, {
                contentType: file.type || 'application/octet-stream',
                upsert: false,
            })

        if (error) {
            return NextResponse.json({
                error: `업로드 실패: ${error.message}`,
                details: error,
            }, { status: 500 })
        }

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
        console.error('Upload error:', err)
        return NextResponse.json({
            error: err.message || '업로드 실패',
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        }, { status: 500 })
    }
}
