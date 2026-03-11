import { NextRequest, NextResponse } from 'next/server'

// PKCE code를 클라이언트 페이지로 전달하여 브라우저에서 세션 교환
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    // 클라이언트 페이지로 code를 전달
    return NextResponse.redirect(
      new URL(`/auth/session?code=${code}`, requestUrl.origin)
    )
  }

  return NextResponse.redirect(new URL('/feed', requestUrl.origin))
}
