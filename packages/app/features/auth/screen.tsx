'use client'

import { useState } from 'react'
import { Button, XStack, YStack, Input, Spinner, Separator, SizableText } from '@my/ui'
import { Platform } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { Chrome, Eye, EyeOff } from '@tamagui/lucide-icons'
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
    const [showPassword, setShowPassword] = useState(false)
    const [focusedField, setFocusedField] = useState<string | null>(null)

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

    const inputStyle = (fieldName: string) => ({
        bg: '$background' as const,
        borderWidth: 1,
        borderColor: (focusedField === fieldName ? '$primary' : '$outlineVariant') as any,
        borderRadius: '$md' as const,
        color: '$onSurface' as const,
        size: '$4' as const,
        placeholderTextColor: '$onSurfaceVariant' as any,
    })

    return (
        <YStack flex={1} justify="center" items="center" px="$4" bg="$backgroundBody">
            {/* Branding above card */}
            <YStack alignItems="center" gap="$1" mb="$5">
                <SizableText
                    size="$10"
                    fontWeight="900"
                    color="$primary"
                    letterSpacing={-1}
                >
                    Giljabi
                </SizableText>
                <SizableText color="$onSurfaceVariant" size="$3" textAlign="center">
                    디지털 시대의 믿음의 길잡이
                </SizableText>
            </YStack>

            {/* Auth Card */}
            <YStack
                width="100%"
                maxWidth={440}
                bg="$surface"
                p="$5"
                borderRadius="$xl"
                elevation="$3"
                gap="$4"
                $sm={{ px: '$4' }}
            >
                {/* Tab-style toggle */}
                <XStack
                    borderRadius="$md"
                    bg="$surfaceContainerLow"
                    p="$1"
                    gap="$1"
                >
                    <Button
                        flex={1}
                        size="$3"
                        bg={!isSignUp ? '$primary' : 'transparent'}
                        borderRadius="$sm"
                        onPress={() => { setIsSignUp(false); setErrorMsg('') }}
                        pressStyle={{ opacity: 0.8 }}
                    >
                        <SizableText
                            color={!isSignUp ? 'white' : '$onSurfaceVariant'}
                            fontWeight="700"
                            size="$3"
                        >
                            로그인
                        </SizableText>
                    </Button>
                    <Button
                        flex={1}
                        size="$3"
                        bg={isSignUp ? '$primary' : 'transparent'}
                        borderRadius="$sm"
                        onPress={() => { setIsSignUp(true); setErrorMsg('') }}
                        pressStyle={{ opacity: 0.8 }}
                    >
                        <SizableText
                            color={isSignUp ? 'white' : '$onSurfaceVariant'}
                            fontWeight="700"
                            size="$3"
                        >
                            회원가입
                        </SizableText>
                    </Button>
                </XStack>

                {/* Success message */}
                {successMsg !== '' && (
                    <YStack bg="$successContainer" p="$3" borderRadius="$md">
                        <SizableText color="$success" textAlign="center" size="$3">
                            {successMsg}
                        </SizableText>
                    </YStack>
                )}

                {/* Form fields */}
                <YStack gap="$3">
                    {isSignUp && (
                        <YStack gap="$1.5">
                            <SizableText size="$2" color="$onSurfaceVariant" fontWeight="600" pl="$1">
                                이름
                            </SizableText>
                            <Input
                                placeholder="이름을 입력하세요"
                                value={username}
                                onChangeText={setUsername}
                                onFocus={() => setFocusedField('username')}
                                onBlur={() => setFocusedField(null)}
                                {...inputStyle('username')}
                            />
                        </YStack>
                    )}

                    <YStack gap="$1.5">
                        <SizableText size="$2" color="$onSurfaceVariant" fontWeight="600" pl="$1">
                            이메일
                        </SizableText>
                        <Input
                            autoCapitalize="none"
                            placeholder="example@email.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            {...inputStyle('email')}
                        />
                    </YStack>

                    <YStack gap="$1.5">
                        <SizableText size="$2" color="$onSurfaceVariant" fontWeight="600" pl="$1">
                            비밀번호
                        </SizableText>
                        <XStack alignItems="center" position="relative">
                            <Input
                                flex={1}
                                secureTextEntry={!showPassword}
                                placeholder="비밀번호를 입력하세요"
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                pr="$6"
                                {...inputStyle('password')}
                            />
                            <Button
                                position="absolute"
                                right={0}
                                size="$3"
                                bg="transparent"
                                chromeless
                                onPress={() => setShowPassword(!showPassword)}
                                pressStyle={{ opacity: 0.6 }}
                            >
                                {showPassword ? (
                                    <EyeOff size={18} color="$onSurfaceVariant" />
                                ) : (
                                    <Eye size={18} color="$onSurfaceVariant" />
                                )}
                            </Button>
                        </XStack>
                    </YStack>

                    {isSignUp && (
                        <>
                            <YStack gap="$1.5">
                                <SizableText size="$2" color="$onSurfaceVariant" fontWeight="600" pl="$1">
                                    출석교회
                                </SizableText>
                                <Input
                                    placeholder="출석교회 (교단포함)"
                                    value={church}
                                    onChangeText={setChurch}
                                    onFocus={() => setFocusedField('church')}
                                    onBlur={() => setFocusedField(null)}
                                    {...inputStyle('church')}
                                />
                            </YStack>

                            <YStack gap="$1.5">
                                <SizableText size="$2" color="$onSurfaceVariant" fontWeight="600" pl="$1">
                                    직분
                                </SizableText>
                                <Input
                                    placeholder="목사/전도사/장로/권사/집사/성도"
                                    value={churchRole}
                                    onChangeText={setChurchRole}
                                    onFocus={() => setFocusedField('churchRole')}
                                    onBlur={() => setFocusedField(null)}
                                    {...inputStyle('churchRole')}
                                />
                            </YStack>
                        </>
                    )}
                </YStack>

                {/* Error message */}
                {errorMsg !== '' && (
                    <YStack bg="$errorContainer" p="$3" borderRadius="$md">
                        <SizableText color="$error" textAlign="center" size="$3">
                            {errorMsg}
                        </SizableText>
                    </YStack>
                )}

                {/* Submit button */}
                <Button
                    bg="$primary"
                    borderRadius="$button"
                    onPress={handleAuth}
                    disabled={loading}
                    icon={loading ? <Spinner color="white" /> : undefined}
                    hoverStyle={{ opacity: 0.9 }}
                    pressStyle={{ opacity: 0.85 }}
                    size="$4"
                    width="100%"
                >
                    <SizableText color="white" fontWeight="700" size="$4">
                        {isSignUp ? '계정 만들기' : '로그인'}
                    </SizableText>
                </Button>

                {/* Divider */}
                <XStack justify="center" items="center" gap="$3" width="100%">
                    <Separator borderColor="$outlineVariant" flex={1} />
                    <SizableText color="$onSurfaceVariant" size="$2">또는</SizableText>
                    <Separator borderColor="$outlineVariant" flex={1} />
                </XStack>

                {/* Google OAuth */}
                <Button
                    icon={<Chrome size={18} color="$onSurface" />}
                    onPress={() => handleOAuth('google')}
                    disabled={loading}
                    bg="transparent"
                    borderWidth={1}
                    borderColor="$outlineVariant"
                    borderRadius="$button"
                    hoverStyle={{ bg: '$surfaceContainerHigh' }}
                    pressStyle={{ bg: '$surfaceContainerHigh' }}
                    width="100%"
                    size="$4"
                >
                    <SizableText color="$onSurface" fontWeight="600">
                        Google로 계속하기
                    </SizableText>
                </Button>
            </YStack>
        </YStack>
    )
}
