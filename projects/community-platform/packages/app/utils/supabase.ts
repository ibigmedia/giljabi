import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

// 모노레포 환경에서 사용할 Supabase URL과 KEY (환경 변수 또는 기본값 처리)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://jwgpjjpqnlgjgpvhhxvz.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8iZdaJXEs7msb1TzJWXZHg_6aV-MSen'

// 플랫폼에 따라 적절한 스토리지 어댑터를 선택
const isNative = Platform.OS === 'ios' || Platform.OS === 'android'

const storageAdapter = isNative ? AsyncStorage : (typeof window !== 'undefined' ? window.localStorage : undefined)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
