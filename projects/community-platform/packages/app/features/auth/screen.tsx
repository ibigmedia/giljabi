'use client'

import { useState } from 'react'
import { Button, H1, Paragraph, XStack, YStack, Input, Spinner, Separator } from '@my/ui'
import { Platform } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { Github, Chrome } from '@tamagui/lucide-icons'
import { supabase } from '../../utils/supabase'

if (Platform.OS !== 'web') {
    WebBrowser.maybeCompleteAuthSession()
}

export function AuthScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const handleAuth = async () => {
        setLoading(true)
        setErrorMsg('')
        try {
            if (isSignUp) {
                // 회원가입
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (error) setErrorMsg(error.message)
                else setErrorMsg('Confirmation email has been sent.')
            } else {
                // 로그인
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) setErrorMsg(error.message)
            }
        } catch (err: any) {
            setErrorMsg(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleOAuth = async (provider: 'google' | 'github') => {
        setLoading(true)
        setErrorMsg('')
        try {
            const redirectUrl = makeRedirectUri({
                path: '/login',
            })
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
        } catch (err: any) {
            setErrorMsg(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <YStack flex={1} justify="center" items="center" p="$4" bg="$backgroundLight">
            <YStack width="100%" maxWidth={400} gap="$4" bg="$surfaceLight" p="$6" borderRadius="$4" elevation="$4">
                <H1 size="$8" text="center" color="$primaryDark">
                    {isSignUp ? 'Sign Up' : 'Welcome Back'}
                </H1>

                <Paragraph text="center" color="$color10">
                    {isSignUp ? 'Create your new community account' : 'Sign in to your community account'}
                </Paragraph>

                <YStack gap="$3" mt="$4">
                    <Input
                        autoCapitalize="none"
                        placeholder="Email address"
                        value={email}
                        onChangeText={setEmail}
                        bg="$color2"
                    />
                    <Input
                        secureTextEntry
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        bg="$color2"
                    />
                </YStack>

                {errorMsg !== '' && (
                    <Paragraph color="$red10" text="center">
                        {errorMsg}
                    </Paragraph>
                )}

                <Button
                    mt="$2"
                    bg="$primaryLight"
                    onPress={handleAuth}
                    disabled={loading}
                    icon={loading ? <Spinner /> : undefined}
                >
                    {isSignUp ? 'Create Account' : 'Sign In'}
                </Button>

                <XStack justify="center" items="center" gap="$4" my="$4" width="100%">
                    <Separator borderColor="$color5" borderWidth={1} />
                    <Paragraph color="$color10" size="$3">Or connect with</Paragraph>
                    <Separator borderColor="$color5" borderWidth={1} />
                </XStack>

                <YStack gap="$3" width="100%">
                    <Button
                        icon={<Github size={18} />}
                        onPress={() => handleOAuth('github')}
                        disabled={loading}
                        bg="$color2"
                    >
                        Continue with Github
                    </Button>
                    <Button
                        icon={<Chrome size={18} />}
                        onPress={() => handleOAuth('google')}
                        disabled={loading}
                        bg="$color2"
                    >
                        Continue with Google
                    </Button>
                </YStack>

                <XStack justify="center" gap="$2" mt="$4">
                    <Paragraph color="$color10">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    </Paragraph>
                    <Paragraph
                        color="$primaryLight"
                        cursor="pointer"
                        textDecorationLine="underline"
                        onPress={() => setIsSignUp(!isSignUp)}
                    >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </Paragraph>
                </XStack>
            </YStack>
        </YStack>
    )
}
