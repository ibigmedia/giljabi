'use client'

import { useState } from 'react'
import { Button, XStack, YStack, Input, Spinner, Separator, SizableText } from '@my/ui'
import { Platform } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { Github, Chrome } from '@tamagui/lucide-icons'
import { supabase } from '../../utils/supabase'

if (Platform.OS !== 'web') {
    WebBrowser.maybeCompleteAuthSession()
}

export function AuthScreen() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [church, setChurch] = useState('')
    const [churchRole, setChurchRole] = useState('성도')
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    const handleAuth = async () => {
        setLoading(true)
        setErrorMsg('')
        setSuccessMsg('')
        try {
            if (isSignUp) {
                if (!username.trim() || !church.trim() || !churchRole.trim()) {
                    throw new Error('이름, 출석교회, 직분을 모두 입력해주세요.')
                }

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username,
                            church,
                            churchRole
                        }
                    }
                })

                if (error) throw error

                if (data.user) {
                    await supabase.from('Profile').insert({
                        userId: data.user.id,
                        email: email,
                        username: username,
                        church: church,
                        churchRole: churchRole,
                        isApproved: false,
                        role: 'MEMBER'
                    }).select().single()
                }

                setSuccessMsg('가입 신청이 완료되었습니다. 이메일 인증 후 관리자 승인이 필요합니다.')
                setIsSignUp(false)
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error

                if (data.user) {
                    if (!data.user.email_confirmed_at) {
                        await supabase.auth.signOut()
                        throw new Error('이메일 인증이 필요합니다. 가입 시 입력한 이메일의 인증 링크를 확인해 주세요.')
                    }

                    const { data: profile } = await supabase.from('Profile').select('isApproved').eq('userId', data.user.id).single()
                    if (profile && !profile.isApproved) {
                        await supabase.auth.signOut()
                        throw new Error('관리자 승인 대기 중인 계정입니다. 승인 완료 후 로그인 가능합니다.')
                    }
                }
            }
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : '오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const handleOAuth = async (provider: 'google' | 'github') => {
        setLoading(true)
        setErrorMsg('')
        try {
            const redirectUrl = Platform.OS === 'web'
                ? `${window.location.origin}/auth/session`
                : makeRedirectUri({ path: '/login' })
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: Platform.OS !== 'web',
                },
            })
            if (error) throw error
            if (Platform.OS !== 'web' && data?.url) {
                await WebBrowser.openAuthSessionAsync(data.url, redirectUrl)
            }
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : '오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <YStack flex={1} justify="center" items="center" p="$4" bg="$backgroundBody">
            <YStack width="100%" maxWidth={420} gap="$4" bg="$surface" p="$7" borderRadius="$xl" elevation="$2">
                {/* Logo */}
                <YStack alignItems="center" gap="$2" mb="$2">
                    <SizableText size="$8" fontWeight="800" color="$primary" letterSpacing={-0.5}>
                        Giljabi
                    </SizableText>
                    <SizableText color="$onSurfaceVariant" size="$3" textAlign="center">
                        {isSignUp ? '새 계정을 만들어 커뮤니티에 참여하세요' : '커뮤니티에 로그인하세요'}
                    </SizableText>
                </YStack>

                <YStack gap="$3">
                    {isSignUp && (
                        <Input
                            placeholder="이름 (Username)"
                            value={username}
                            onChangeText={setUsername}
                            bg="$surfaceContainerLow"
                            borderWidth={1}
                            borderColor="$outlineVariant"
                            borderRadius="$md"
                            color="$onSurface"
                        />
                    )}
                    <Input
                        autoCapitalize="none"
                        placeholder="이메일 주소"
                        value={email}
                        onChangeText={setEmail}
                        bg="$surfaceContainerLow"
                        borderWidth={1}
                        borderColor="$outlineVariant"
                        borderRadius="$md"
                        color="$onSurface"
                    />
                    <Input
                        secureTextEntry
                        placeholder="비밀번호"
                        value={password}
                        onChangeText={setPassword}
                        bg="$surfaceContainerLow"
                        borderWidth={1}
                        borderColor="$outlineVariant"
                        borderRadius="$md"
                        color="$onSurface"
                    />
                    {isSignUp && (
                        <>
                            <Input
                                placeholder="출석교회 (교단포함)"
                                value={church}
                                onChangeText={setChurch}
                                bg="$surfaceContainerLow"
                                borderWidth={1}
                                borderColor="$outlineVariant"
                                borderRadius="$md"
                                color="$onSurface"
                            />
                            <Input
                                placeholder="직분 (목사/전도사/장로/권사/집사/성도)"
                                value={churchRole}
                                onChangeText={setChurchRole}
                                bg="$surfaceContainerLow"
                                borderWidth={1}
                                borderColor="$outlineVariant"
                                borderRadius="$md"
                                color="$onSurface"
                            />
                        </>
                    )}
                </YStack>

                {errorMsg !== '' && (
                    <YStack bg="$errorContainer" p="$3" borderRadius="$md">
                        <SizableText color="$error" textAlign="center" size="$3">
                            {errorMsg}
                        </SizableText>
                    </YStack>
                )}
                {successMsg !== '' && (
                    <YStack bg="$successContainer" p="$3" borderRadius="$md">
                        <SizableText color="$success" textAlign="center" size="$3">
                            {successMsg}
                        </SizableText>
                    </YStack>
                )}

                <Button
                    mt="$2"
                    bg="$primary"
                    borderRadius="$button"
                    onPress={handleAuth}
                    disabled={loading}
                    icon={loading ? <Spinner color="white" /> : undefined}
                    hoverStyle={{ opacity: 0.9 }}
                    size="$5"
                >
                    <SizableText color="white" fontWeight="700">
                        {isSignUp ? '계정 만들기' : '로그인'}
                    </SizableText>
                </Button>

                <XStack justify="center" items="center" gap="$3" my="$3" width="100%">
                    <Separator borderColor="$outlineVariant" flex={1} />
                    <SizableText color="$onSurfaceVariant" size="$2">또는</SizableText>
                    <Separator borderColor="$outlineVariant" flex={1} />
                </XStack>

                <YStack gap="$2.5" width="100%">
                    <Button
                        icon={<Github size={18} color="$onSurface" />}
                        onPress={() => handleOAuth('github')}
                        disabled={loading}
                        bg="$surfaceContainerLow"
                        borderWidth={1}
                        borderColor="$outlineVariant"
                        borderRadius="$button"
                        hoverStyle={{ bg: '$surfaceContainerHigh' }}
                    >
                        <SizableText color="$onSurface" fontWeight="600">Github로 계속하기</SizableText>
                    </Button>
                    <Button
                        icon={<Chrome size={18} color="$onSurface" />}
                        onPress={() => handleOAuth('google')}
                        disabled={loading}
                        bg="$surfaceContainerLow"
                        borderWidth={1}
                        borderColor="$outlineVariant"
                        borderRadius="$button"
                        hoverStyle={{ bg: '$surfaceContainerHigh' }}
                    >
                        <SizableText color="$onSurface" fontWeight="600">Google로 계속하기</SizableText>
                    </Button>
                </YStack>

                <XStack justify="center" gap="$2" mt="$3">
                    <SizableText color="$onSurfaceVariant" size="$3">
                        {isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}
                    </SizableText>
                    <SizableText
                        color="$primary"
                        cursor="pointer"
                        fontWeight="700"
                        size="$3"
                        onPress={() => setIsSignUp(!isSignUp)}
                    >
                        {isSignUp ? '로그인' : '회원가입'}
                    </SizableText>
                </XStack>
            </YStack>
        </YStack>
    )
}
