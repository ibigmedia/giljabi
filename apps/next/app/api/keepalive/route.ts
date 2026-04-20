import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../utils/supabase-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Supabase Free 티어 자동 일시정지(7일 비활성) 방지용 keepalive.
// Vercel Cron에서 주기적으로 호출하여 DB에 가벼운 SELECT를 실행한다.
export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET
  if (expected) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${expected}`) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }
  }

  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('Profile').select('id').limit(1)

    return NextResponse.json({
      ok: !error,
      project: 'giljabi',
      ts: new Date().toISOString(),
      error: error?.message,
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        project: 'giljabi',
        ts: new Date().toISOString(),
        error: err?.message ?? String(err),
      },
      { status: 500 }
    )
  }
}
