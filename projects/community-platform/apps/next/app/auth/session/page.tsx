'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from 'app/utils/supabase'
import { YStack, SizableText, Spinner } from '@my/ui'

export default function AuthSessionPage() {
    const router = useRouter()
    const [status, setStatus] = useState('로그인 처리 중...')

    useEffect(() => {
        const handleSession = async () => {
            try {
                // Implicit flow: detectSessionInUrl이 hash에서 자동으로 세션 복원
                // onAuthStateChange로 세션 감지
                const { data: { session } } = await supabase.auth.getSession()

                if (!session) {
                    // 세션이 아직 없으면 잠시 대기 (hash 파싱 시간)
                    await new Promise(resolve => setTimeout(resolve, 1500))
                    const { data: { session: retrySession } } = await supabase.auth.getSession()

                    if (!retrySession) {
                        setStatus('로그인 세션을 찾을 수 없습니다.')
                        setTimeout(() => router.replace('/login'), 2000)
                        return
                    }

                    await handleProfile(retrySession.user)
                    return
                }

                await handleProfile(session.user)
            } catch (err: any) {
                console.error('Auth error:', err)
                setStatus(`오류: ${err?.message || '알 수 없는 오류'}`)
                setTimeout(() => router.replace('/login'), 3000)
            }
        }

        const handleProfile = async (user: any) => {
            setStatus('프로필 확인 중...')

            const { data: profile, error: profileError } = await supabase
                .from('Profile')
                .select('id, isApproved, role')
                .eq('userId', user.id)
                .single()

            if (profileError || !profile) {
                const meta = user.user_metadata
                await supabase.from('Profile').insert({
                    userId: user.id,
                    email: user.email,
                    username: meta?.full_name || meta?.name || user.email?.split('@')[0] || 'user',
                    avatarUrl: meta?.avatar_url || meta?.picture || null,
                    church: '',
                    churchRole: '성도',
                    isApproved: false,
                    role: 'MEMBER',
                })

                setStatus('승인 대기 중입니다.')
                router.replace('/pending-approval')
                return
            }

            // 기존 유저인데 이메일이 없으면 업데이트
            if (user.email) {
                await supabase
                    .from('Profile')
                    .update({ email: user.email })
                    .eq('userId', user.id)
                    .is('email', null)
            }

            if (!profile.isApproved) {
                await supabase.auth.signOut()
                setStatus('승인 대기 중입니다.')
                router.replace('/pending-approval')
                return
            }

            setStatus('로그인 성공!')
            if (profile.role === 'ADMIN' || profile.role === 'EDITOR') {
                router.replace('/admin')
            } else {
                router.replace('/feed')
            }
        }

        handleSession()
    }, [router])

    return (
        <YStack flex={1} alignItems="center" justifyContent="center" bg="$backgroundBody" height="100vh" gap="$4">
            <Spinner size="large" color="$primary" />
            <SizableText size="$5" color="$textMain" fontWeight="600">{status}</SizableText>
        </YStack>
    )
}
