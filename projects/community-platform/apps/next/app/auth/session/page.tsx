'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from 'app/utils/supabase'
import { YStack, SizableText, Spinner } from '@my/ui'

function AuthSessionContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState('로그인 처리 중...')

    useEffect(() => {
        const handleSession = async () => {
            const code = searchParams.get('code')

            if (!code) {
                setStatus('인증 코드가 없습니다.')
                setTimeout(() => router.replace('/login'), 2000)
                return
            }

            try {
                const { data, error } = await supabase.auth.exchangeCodeForSession(code)

                if (error) {
                    console.error('Session exchange error:', error)
                    setStatus(`오류: ${error.message}`)
                    setTimeout(() => router.replace('/login'), 3000)
                    return
                }

                if (data.user) {
                    setStatus('프로필 확인 중...')

                    const { data: profile, error: profileError } = await supabase
                        .from('Profile')
                        .select('id, isApproved, role')
                        .eq('userId', data.user.id)
                        .single()

                    if (profileError || !profile) {
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

                        setStatus('승인 대기 중입니다.')
                        router.replace('/pending-approval')
                        return
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
            } catch (err: any) {
                console.error('Auth error:', err)
                setStatus(`오류: ${err?.message || '알 수 없는 오류'}`)
                setTimeout(() => router.replace('/login'), 3000)
            }
        }

        handleSession()
    }, [searchParams, router])

    return (
        <YStack flex={1} alignItems="center" justifyContent="center" bg="$backgroundBody" height="100vh" gap="$4">
            <Spinner size="large" color="$primary" />
            <SizableText size="$5" color="$textMain" fontWeight="600">{status}</SizableText>
        </YStack>
    )
}

export default function AuthSessionPage() {
    return (
        <Suspense fallback={
            <YStack flex={1} alignItems="center" justifyContent="center" bg="$backgroundBody" height="100vh" gap="$4">
                <Spinner size="large" color="$primary" />
                <SizableText size="$5" color="$textMain" fontWeight="600">로그인 처리 중...</SizableText>
            </YStack>
        }>
            <AuthSessionContent />
        </Suspense>
    )
}
