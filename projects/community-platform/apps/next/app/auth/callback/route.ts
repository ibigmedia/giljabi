import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // OAuth 로그인 후 Profile이 없으면 자동 생성
      const { data: existingProfile } = await supabase
        .from('Profile')
        .select('id, isApproved')
        .eq('userId', data.user.id)
        .single()

      if (!existingProfile) {
        const meta = data.user.user_metadata
        await supabase.from('Profile').insert({
          userId: data.user.id,
          email: data.user.email,
          username: meta?.full_name || meta?.name || data.user.email?.split('@')[0] || 'user',
          avatarUrl: meta?.avatar_url || meta?.picture || null,
          church: '',
          churchRole: '성도',
          isApproved: false,
          role: 'MEMBER',
        })

        // 새 가입자는 승인 대기 페이지로
        return NextResponse.redirect(new URL('/pending-approval', requestUrl.origin))
      }

      if (existingProfile && !existingProfile.isApproved) {
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/pending-approval', requestUrl.origin))
      }
    }
  }

  return NextResponse.redirect(new URL('/feed', requestUrl.origin))
}
