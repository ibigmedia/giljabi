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
      // Service Role 클라이언트로 RLS 우회하여 Profile 조회/생성
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      const adminClient = serviceRoleKey
        ? createClient(supabaseUrl, serviceRoleKey)
        : supabase

      const { data: existingProfile } = await adminClient
        .from('Profile')
        .select('id, isApproved')
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
    }
  }

  return NextResponse.redirect(new URL('/feed', requestUrl.origin))
}
