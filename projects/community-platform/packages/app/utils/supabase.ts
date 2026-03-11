import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

// 모노레포 환경에서 사용할 Supabase URL과 KEY (환경 변수 필수)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 환경 변수(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)가 설정되지 않았습니다. .env 파일을 확인하세요.')
}

// 플랫폼에 따라 적절한 스토리지 어댑터를 선택
const isNative = Platform.OS === 'ios' || Platform.OS === 'android'

const storageAdapter = isNative ? AsyncStorage : (typeof window !== 'undefined' ? window.localStorage : undefined)

// OAuth 콜백에서 쿠키로 전달된 세션을 localStorage로 복원
if (typeof window !== 'undefined' && !isNative && supabaseUrl) {
  try {
    const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase/)?.[1] || ''
    const storageKey = `sb-${projectRef}-auth-token`
    const cookies = document.cookie.split(';').map(c => c.trim())
    const sessionCookie = cookies.find(c => c.startsWith(`${storageKey}=`))

    if (sessionCookie && !window.localStorage.getItem(storageKey)) {
      const cookieValue = decodeURIComponent(sessionCookie.split('=').slice(1).join('='))
      window.localStorage.setItem(storageKey, cookieValue)
      // 쿠키 제거 (일회성)
      document.cookie = `${storageKey}=; path=/; max-age=0`
    }
  } catch (e) {
    // 무시 - 쿠키 파싱 실패시 정상 로그인 플로우로 폴백
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})
