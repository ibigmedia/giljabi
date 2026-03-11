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

    if (!error && data.session && data.user) {
      // Service Role 클라이언트로 RLS 우회하여 Profile 조회/생성
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      const adminClient = serviceRoleKey
        ? createClient(supabaseUrl, serviceRoleKey)
        : supabase

      const { data: existingProfile } = await adminClient
        .from('Profile')
        .select('id, isApproved, role')
        .eq('userId', data.user.id)
        .single()

      if (!existingProfile) {
        const meta = data.user.user_metadata
        await adminClient.from('Profile').insert({
          userId: data.user.id,
          email: data.user.email,
          username: meta?.full_name || meta?.name || data.user.email?.split('@')[0] || 'user',
          avatarUrl: meta?.avatar_url || meta?.picture || null,
          church: '',
          churchRole: '성도',
          isApproved: false,
          role: 'MEMBER',
        })

        return NextResponse.redirect(new URL('/pending-approval', requestUrl.origin))
      }

      if (existingProfile && !existingProfile.isApproved) {
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/pending-approval', requestUrl.origin))
      }

      // 리다이렉트 경로 결정
      const redirectPath = (existingProfile.role === 'ADMIN' || existingProfile.role === 'EDITOR')
        ? '/admin'
        : '/feed'

      // 세션 토큰을 쿠키에 저장하여 클라이언트에서 복원 가능하도록
      const response = NextResponse.redirect(new URL(redirectPath, requestUrl.origin))

      // Supabase 클라이언트가 자동 감지하는 쿠키 형태로 세션 저장
      const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase/)?.[1] || ''
      const storageKey = `sb-${projectRef}-auth-token`

      response.cookies.set(storageKey, JSON.stringify(data.session), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: false, // 클라이언트 JS에서 접근 가능해야 함
        secure: true,
        sameSite: 'lax',
      })

      return response
    }
  }

  return NextResponse.redirect(new URL('/feed', requestUrl.origin))
}
