import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../utils/supabase-server'

// POST /api/portfolio/upload — generate a signed upload URL for client-side upload
// This avoids Vercel's 4.5MB body size limit by letting the client upload directly
export async function POST(req: NextRequest) {
    try {
        const { fileName, folder, contentType } = await req.json()

        if (!fileName || typeof fileName !== 'string') {
            return NextResponse.json({ error: '파일 이름이 필요합니다.' }, { status: 400 })
        }

        const sb = getSupabaseAdmin()

        // Ensure bucket exists
        try {
            const { data: buckets } = await sb.storage.listBuckets()
            if (!buckets?.find((b: any) => b.name === 'portfolio')) {
                await sb.storage.createBucket('portfolio', { public: true, fileSizeLimit: 52428800 })
            }
        } catch {
            // Bucket may already exist
        }

        // Generate unique file path
        const timestamp = Date.now()
        const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 50)
        const dir = folder || 'media'
        const filePath = `${dir}/${timestamp}-${safeName}`

        // Create signed upload URL (valid for 10 minutes)
        const { data, error } = await sb.storage
            .from('portfolio')
            .createSignedUploadUrl(filePath)

        if (error) {
            return NextResponse.json({ error: `서명 URL 생성 실패: ${error.message}` }, { status: 500 })
        }

        // Also get the public URL for after upload
        const { data: { publicUrl } } = sb.storage
            .from('portfolio')
            .getPublicUrl(filePath)

        return NextResponse.json({
            signedUrl: data.signedUrl,
            token: data.token,
            path: filePath,
            publicUrl,
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message || '서버 오류' }, { status: 500 })
    }
}
