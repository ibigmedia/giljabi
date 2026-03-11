'use client'

import React from 'react'
import { YStack, XStack, SizableText, Button, Avatar } from '@my/ui'
import { usePathname, useRouter } from 'solito/navigation'
import { useCurrentUserProfile } from '../../hooks/useProfiles'
import { Home, Users, MessageSquare, User, Bell, Search, Edit3, LogOut, Shield } from '@tamagui/lucide-icons'
import { supabase } from '../../utils/supabase'

const NAV_ITEMS = [
    { label: '공동체 나눔', path: '/feed', icon: Home },
    { label: '사역 소개', path: '/landing', icon: User },
    { label: '그룹', path: '/groups', icon: Users },
    { label: '블로그', path: '/blog', icon: Edit3 },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { data: userProfile } = useCurrentUserProfile()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (pathname?.startsWith('/admin')) {
        return <YStack flex={1} bg="$backgroundBody" height="100%">{children}</YStack>
    }

    return (
        <YStack flex={1} bg="$backgroundBody" height="100%">
            {/* Desktop GNB - M3 Surface with elevation */}
            <XStack
                display="flex"
                $sm={{ display: 'none' }}
                bg="$surface"
                paddingHorizontal="$6"
                height={64}
                alignItems="center"
                justifyContent="space-between"
                zIndex={100}
                elevation="$1"
            >
                {/* Left: Logo & Nav */}
                <XStack alignItems="center" gap="$5" height="100%">
                    <SizableText
                        size="$6"
                        fontWeight="800"
                        color="$primary"
                        cursor="pointer"
                        onPress={() => router.push('/dashboard')}
                        letterSpacing={-0.5}
                    >
                        Giljabi
                    </SizableText>

                    <XStack gap="$1" ml="$2" height="100%" alignItems="center">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.path
                            const Icon = item.icon
                            return (
                                <XStack
                                    key={item.path}
                                    alignItems="center"
                                    gap="$2"
                                    cursor="pointer"
                                    onPress={() => router.push(item.path)}
                                    bg={isActive ? '$primaryContainer' : 'transparent'}
                                    hoverStyle={{ bg: isActive ? '$primaryContainer' : '$surfaceContainerHigh' }}
                                    pressStyle={{ bg: '$surfaceContainerHighest' }}
                                    borderRadius="$full"
                                    paddingHorizontal="$4"
                                    paddingVertical="$2.5"
                                >
                                    <Icon size={18} color={isActive ? '$onPrimaryContainer' : '$onSurfaceVariant'} />
                                    <SizableText
                                        size="$3"
                                        fontWeight={isActive ? '700' : '500'}
                                        color={isActive ? '$onPrimaryContainer' : '$onSurfaceVariant'}
                                    >
                                        {item.label}
                                    </SizableText>
                                </XStack>
                            )
                        })}
                    </XStack>
                </XStack>

                {/* Right: Actions & User */}
                <XStack alignItems="center" gap="$2">
                    <Button
                        size="$3"
                        circular
                        bg="transparent"
                        hoverStyle={{ bg: '$surfaceContainerHigh' }}
                        icon={<Search size={20} color="$onSurfaceVariant" />}
                    />

                    {userProfile ? (
                        <>
                            {(userProfile.role === 'ADMIN' || userProfile.role === 'EDITOR') && (
                                <Button
                                    size="$3"
                                    bg="$tertiaryContainer"
                                    borderRadius="$full"
                                    hoverStyle={{ opacity: 0.9 }}
                                    icon={<Shield size={16} color="$tertiary" />}
                                    onPress={() => router.push('/admin/dashboard')}
                                >
                                    <SizableText size="$2" color="$tertiary" fontWeight="600">관리자</SizableText>
                                </Button>
                            )}

                            <Button
                                size="$3"
                                circular
                                bg="transparent"
                                hoverStyle={{ bg: '$surfaceContainerHigh' }}
                                icon={<MessageSquare size={20} color="$onSurfaceVariant" />}
                                onPress={() => router.push('/messages')}
                            />

                            <Button
                                size="$3"
                                circular
                                bg="transparent"
                                hoverStyle={{ bg: '$surfaceContainerHigh' }}
                                icon={<Bell size={20} color="$onSurfaceVariant" />}
                                onPress={() => router.push('/notifications')}
                            />

                            <XStack
                                alignItems="center"
                                gap="$2.5"
                                ml="$1"
                                cursor="pointer"
                                onPress={() => router.push('/profile')}
                                bg="$surfaceContainerLow"
                                hoverStyle={{ bg: '$surfaceContainerHigh' }}
                                borderRadius="$full"
                                paddingHorizontal="$3"
                                paddingVertical="$1.5"
                            >
                                <Avatar circular size="$2.5" bg="$primaryContainer">
                                    <Avatar.Image src={userProfile.avatarUrl || undefined} />
                                    <Avatar.Fallback bg="$primaryContainer" />
                                </Avatar>
                                <SizableText size="$3" fontWeight="600" color="$onSurface">
                                    {userProfile.username}
                                </SizableText>
                            </XStack>

                            <Button
                                size="$3"
                                circular
                                bg="transparent"
                                hoverStyle={{ bg: '$errorContainer' }}
                                icon={<LogOut size={16} color="$error" />}
                                onPress={handleLogout}
                            />
                        </>
                    ) : (
                        <Button
                            size="$3"
                            bg="$primary"
                            borderRadius="$full"
                            hoverStyle={{ opacity: 0.9 }}
                            onPress={() => router.push('/login')}
                        >
                            <SizableText color="white" fontWeight="600">로그인</SizableText>
                        </Button>
                    )}
                </XStack>
            </XStack>

            {/* Mobile Header - M3 Surface */}
            <XStack
                display="none"
                $sm={{ display: 'flex' }}
                paddingHorizontal="$4"
                paddingVertical="$3"
                bg="$surface"
                alignItems="center"
                justifyContent="space-between"
                zIndex={100}
                elevation="$1"
            >
                <SizableText size="$6" fontWeight="800" color="$primary" letterSpacing={-0.5}>
                    Giljabi
                </SizableText>
                <XStack gap="$1">
                    <Button size="$3" circular bg="transparent" hoverStyle={{ bg: '$surfaceContainerHigh' }} icon={<Search size={22} color="$onSurfaceVariant" />} />
                    <Button size="$3" circular bg="transparent" hoverStyle={{ bg: '$surfaceContainerHigh' }} icon={<Bell size={22} color="$onSurfaceVariant" />} />
                </XStack>
            </XStack>

            {/* Main Content Area */}
            <YStack flex={1} position="relative" height="100%">
                {children}

                {/* Mobile Bottom Navigation - M3 Navigation Bar */}
                <XStack
                    display="none"
                    $sm={{ display: 'flex' }}
                    bg="$surfaceContainerLow"
                    pt="$2"
                    pb="$4"
                    justifyContent="space-around"
                    alignItems="center"
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    zIndex={100}
                    elevation="$2"
                >
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.path
                        const Icon = item.icon
                        return (
                            <YStack
                                key={item.path}
                                flex={1}
                                alignItems="center"
                                justifyContent="center"
                                cursor="pointer"
                                onPress={() => router.push(item.path)}
                                gap="$1"
                                py="$1"
                            >
                                {/* M3 Active Indicator Pill */}
                                <XStack
                                    bg={isActive ? '$primaryContainer' : 'transparent'}
                                    borderRadius="$full"
                                    paddingHorizontal="$5"
                                    paddingVertical="$1"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Icon size={22} color={isActive ? '$onPrimaryContainer' : '$onSurfaceVariant'} />
                                </XStack>
                                <SizableText
                                    size="$1"
                                    color={isActive ? '$onSurface' : '$onSurfaceVariant'}
                                    fontWeight={isActive ? '700' : '500'}
                                >
                                    {item.label}
                                </SizableText>
                            </YStack>
                        )
                    })}
                </XStack>
            </YStack>
        </YStack>
    )
}
