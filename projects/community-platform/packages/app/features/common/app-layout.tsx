'use client'

import React, { useState, useRef, useEffect } from 'react'
import { YStack, XStack, SizableText, Button, Avatar, Separator } from '@my/ui'
import { usePathname, useRouter } from 'solito/navigation'
import { useCurrentUserProfile } from '../../hooks/useProfiles'
import { Home, Users, MessageSquare, User, Bell, Search, Edit3, LogOut, Shield, ChevronDown, Settings } from '@tamagui/lucide-icons'
import { supabase } from '../../utils/supabase'

const NAV_ITEMS = [
    { label: '공동체 나눔', path: '/feed', icon: Home },
    { label: '사역 소개', path: '/landing', icon: User },
    { label: '그룹', path: '/groups', icon: Users },
    { label: '블로그', path: '/blog', icon: Edit3 },
]

function UserDropdown({ userProfile, onLogout, router }: { userProfile: any; onLogout: () => void; router: any }) {
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    return (
        <YStack position="relative" ref={dropdownRef as any}>
            <XStack
                alignItems="center"
                gap="$2"
                cursor="pointer"
                onPress={() => setOpen(!open)}
                bg={open ? '$surfaceContainerHigh' : '$surfaceContainerLow'}
                hoverStyle={{ bg: '$surfaceContainerHigh' }}
                borderRadius="$full"
                paddingHorizontal="$3"
                paddingVertical="$1.5"
            >
                <Avatar circular size="$2.5" bg="$primaryContainer">
                    <Avatar.Image src={userProfile.avatarUrl || undefined} />
                    <Avatar.Fallback bg="$primaryContainer">
                        <SizableText size="$1" color="$primary" fontWeight="700">
                            {userProfile.username?.charAt(0)?.toUpperCase() || 'U'}
                        </SizableText>
                    </Avatar.Fallback>
                </Avatar>
                <SizableText size="$3" fontWeight="600" color="$onSurface">
                    {userProfile.username}
                </SizableText>
                <ChevronDown size={14} color="$onSurfaceVariant" />
            </XStack>

            {open && (
                <YStack
                    position="absolute"
                    top="100%"
                    right={0}
                    mt="$2"
                    bg="$surface"
                    borderRadius="$4"
                    elevation="$4"
                    borderWidth={1}
                    borderColor="$borderLight"
                    minWidth={220}
                    overflow="hidden"
                    zIndex={1000}
                >
                    <YStack p="$3" gap="$1">
                        <SizableText size="$4" fontWeight="700" color="$onSurface">
                            {userProfile.username}
                        </SizableText>
                        <SizableText size="$2" color="$onSurfaceVariant">
                            {userProfile.email || userProfile.role || '회원'}
                        </SizableText>
                    </YStack>

                    <Separator borderColor="$borderLight" />

                    <YStack py="$1">
                        <XStack
                            alignItems="center"
                            gap="$3"
                            px="$3"
                            py="$2.5"
                            cursor="pointer"
                            hoverStyle={{ bg: '$surfaceContainerHigh' }}
                            onPress={() => { setOpen(false); router.push('/profile') }}
                        >
                            <User size={18} color="$onSurfaceVariant" />
                            <SizableText size="$3" color="$onSurface">내 프로필</SizableText>
                        </XStack>

                        <XStack
                            alignItems="center"
                            gap="$3"
                            px="$3"
                            py="$2.5"
                            cursor="pointer"
                            hoverStyle={{ bg: '$surfaceContainerHigh' }}
                            onPress={() => { setOpen(false); router.push('/profile/edit') }}
                        >
                            <Settings size={18} color="$onSurfaceVariant" />
                            <SizableText size="$3" color="$onSurface">프로필 설정</SizableText>
                        </XStack>

                        {(userProfile.role === 'ADMIN' || userProfile.role === 'EDITOR') && (
                            <XStack
                                alignItems="center"
                                gap="$3"
                                px="$3"
                                py="$2.5"
                                cursor="pointer"
                                hoverStyle={{ bg: '$surfaceContainerHigh' }}
                                onPress={() => { setOpen(false); router.push('/admin/dashboard') }}
                            >
                                <Shield size={18} color="$tertiary" />
                                <SizableText size="$3" color="$tertiary" fontWeight="600">관리자 패널</SizableText>
                            </XStack>
                        )}
                    </YStack>

                    <Separator borderColor="$borderLight" />

                    <YStack py="$1">
                        <XStack
                            alignItems="center"
                            gap="$3"
                            px="$3"
                            py="$2.5"
                            cursor="pointer"
                            hoverStyle={{ bg: '$errorContainer' }}
                            onPress={() => { setOpen(false); onLogout() }}
                        >
                            <LogOut size={18} color="$error" />
                            <SizableText size="$3" color="$error">로그아웃</SizableText>
                        </XStack>
                    </YStack>
                </YStack>
            )}
        </YStack>
    )
}

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
            {/* ===== Desktop: Top Header GNB (sm 이상에서만 보임) ===== */}
            <XStack
                display="none"
                $gtSm={{ display: 'flex' }}
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
                        onPress={() => router.push('/landing')}
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
                        onPress={() => router.push('/search')}
                    />

                    {userProfile ? (
                        <>
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

                            <UserDropdown
                                userProfile={userProfile}
                                onLogout={handleLogout}
                                router={router}
                            />
                        </>
                    ) : (
                        <XStack gap="$2" alignItems="center">
                            <Button
                                size="$3"
                                bg="transparent"
                                borderRadius="$full"
                                borderWidth={1}
                                borderColor="$primary"
                                hoverStyle={{ bg: '$primaryContainer' }}
                                onPress={() => router.push('/login')}
                            >
                                <SizableText color="$primary" fontWeight="600" size="$3">로그인</SizableText>
                            </Button>
                            <Button
                                size="$3"
                                bg="$primary"
                                borderRadius="$full"
                                hoverStyle={{ opacity: 0.9 }}
                                onPress={() => router.push('/login')}
                            >
                                <SizableText color="white" fontWeight="600" size="$3">회원가입</SizableText>
                            </Button>
                        </XStack>
                    )}
                </XStack>
            </XStack>

            {/* ===== Mobile: Top Header (sm에서만 보임 - 간단한 로고 + 아이콘) ===== */}
            <XStack
                display="flex"
                $gtSm={{ display: 'none' }}
                paddingHorizontal="$4"
                paddingVertical="$3"
                bg="$surface"
                alignItems="center"
                justifyContent="space-between"
                zIndex={100}
                elevation="$1"
            >
                <SizableText
                    size="$6"
                    fontWeight="800"
                    color="$primary"
                    letterSpacing={-0.5}
                    cursor="pointer"
                    onPress={() => router.push('/landing')}
                >
                    Giljabi
                </SizableText>
                <XStack gap="$1" alignItems="center">
                    {userProfile ? (
                        <>
                            <Button size="$3" circular bg="transparent" hoverStyle={{ bg: '$surfaceContainerHigh' }} icon={<Search size={20} color="$onSurfaceVariant" />} onPress={() => router.push('/search')} />
                            <Button size="$3" circular bg="transparent" hoverStyle={{ bg: '$surfaceContainerHigh' }} icon={<MessageSquare size={20} color="$onSurfaceVariant" />} onPress={() => router.push('/messages')} />
                            <Button size="$3" circular bg="transparent" hoverStyle={{ bg: '$surfaceContainerHigh' }} icon={<Bell size={20} color="$onSurfaceVariant" />} onPress={() => router.push('/notifications')} />
                            <Avatar
                                circular
                                size="$2.5"
                                bg="$primaryContainer"
                                ml="$1"
                                onPress={() => router.push('/profile')}
                                cursor="pointer"
                            >
                                <Avatar.Image src={userProfile.avatarUrl || undefined} />
                                <Avatar.Fallback bg="$primaryContainer">
                                    <SizableText size="$1" color="$primary" fontWeight="700">
                                        {userProfile.username?.charAt(0)?.toUpperCase() || 'U'}
                                    </SizableText>
                                </Avatar.Fallback>
                            </Avatar>
                        </>
                    ) : (
                        <>
                            <Button size="$3" circular bg="transparent" hoverStyle={{ bg: '$surfaceContainerHigh' }} icon={<Search size={22} color="$onSurfaceVariant" />} />
                            <Button
                                size="$2"
                                bg="$primary"
                                borderRadius="$full"
                                onPress={() => router.push('/login')}
                            >
                                <SizableText color="white" fontWeight="600" size="$2">로그인</SizableText>
                            </Button>
                        </>
                    )}
                </XStack>
            </XStack>

            {/* Main Content Area */}
            <YStack flex={1} position="relative" height="100%">
                {children}

                {/* ===== Mobile: Bottom Tab Bar (sm에서만 보임) ===== */}
                <XStack
                    display="flex"
                    $gtSm={{ display: 'none' }}
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
