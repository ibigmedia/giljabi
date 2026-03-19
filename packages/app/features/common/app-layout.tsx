'use client'

import React, { useState, useRef, useEffect } from 'react'
import { YStack, XStack, SizableText, Button, Avatar, Separator } from '@my/ui'
import { usePathname, useRouter } from 'solito/navigation'
import { useCurrentUserProfile } from '../../hooks/useProfiles'
import {
    Home, Users, MessageSquare, User, Bell, Search,
    Edit3, LogOut, Shield, ChevronDown, Settings,
    BookOpen, Music, MoreHorizontal, X,
} from '@tamagui/lucide-icons'
import { supabase } from '../../utils/supabase'

// ── 네비게이션 아이템 정의 ──

const BOTTOM_NAV_ITEMS = [
    { label: '홈', path: '/', icon: Home },
    { label: '피드', path: '/feed', icon: MessageSquare },
    { label: '블로그', path: '/blog', icon: BookOpen },
    { label: '그룹', path: '/groups', icon: Users },
]

const DESKTOP_NAV_ITEMS = [
    { label: '공동체 나눔', path: '/feed', icon: Home },
    { label: '사역 소개', path: '/landing', icon: BookOpen },
    { label: '그룹', path: '/groups', icon: Users },
    { label: '블로그', path: '/blog', icon: Edit3 },
    { label: '멤버', path: '/directory', icon: User },
    { label: '포트폴리오', path: '/portfolio', icon: Music },
]

const MORE_MENU_ITEMS = [
    { label: '포트폴리오', path: '/portfolio', icon: Music },
    { label: '사역 소개', path: '/landing', icon: BookOpen },
    { label: '멤버', path: '/directory', icon: User },
]

const MORE_USER_ITEMS = [
    { label: '메시지', path: '/messages', icon: MessageSquare },
    { label: '알림', path: '/notifications', icon: Bell },
    { label: '내 프로필', path: '/profile', icon: User },
]

// ── 반응형 CSS ──

const RESPONSIVE_CSS = `
  .desktop-only { display: flex !important; }
  .mobile-only { display: none !important; }
  @media (max-width: 860px) {
    .desktop-only { display: none !important; }
    .mobile-only { display: flex !important; }
  }
  .more-sheet-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.35);
    z-index: 998;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }
  .more-sheet-overlay.open {
    opacity: 1;
    pointer-events: auto;
  }
  .more-sheet {
    position: fixed;
    left: 0; right: 0; bottom: 0;
    z-index: 999;
    transform: translateY(100%);
    transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
    border-radius: 28px 28px 0 0;
    max-height: 70vh;
    overflow-y: auto;
  }
  .more-sheet.open {
    transform: translateY(0);
  }
`

// ── 데스크탑 유저 드롭다운 ──

function UserDropdown({ userProfile, onLogout, router }: { userProfile: any; onLogout: () => void; router: any }) {
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        if (open) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    return (
        <YStack position="relative" ref={dropdownRef as any}>
            <XStack
                alignItems="center"
                gap="$2"
                cursor="pointer"
                onPress={() => setOpen(!open)}
                bg={open ? '$surfaceContainerHigh' : 'transparent'}
                hoverStyle={{ bg: '$surfaceContainerHigh' }}
                borderRadius="$full"
                px="$3"
                py="$2"
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
                    mt="$1"
                    bg="$surface"
                    borderRadius="$md"
                    elevation="$2"
                    borderWidth={1}
                    borderColor="$outlineVariant"
                    minWidth={220}
                    overflow="hidden"
                    zIndex={1000}
                >
                    <YStack p="$3" gap="$1">
                        <SizableText size="$4" fontWeight="700" color="$onSurface">{userProfile.username}</SizableText>
                        <SizableText size="$2" color="$onSurfaceVariant">{userProfile.email || userProfile.role || '회원'}</SizableText>
                    </YStack>
                    <Separator borderColor="$outlineVariant" />
                    <YStack py="$1">
                        {[
                            { icon: User, label: '내 프로필', path: '/profile' },
                            { icon: Settings, label: '프로필 설정', path: '/edit-profile' },
                        ].map((item) => (
                            <XStack
                                key={item.path}
                                alignItems="center" gap="$3" px="$3" py="$2.5"
                                cursor="pointer" hoverStyle={{ bg: '$surfaceContainerLow' }}
                                onPress={() => { setOpen(false); router.push(item.path) }}
                            >
                                <item.icon size={18} color="$onSurfaceVariant" />
                                <SizableText size="$3" color="$onSurface">{item.label}</SizableText>
                            </XStack>
                        ))}
                        {(userProfile.role === 'ADMIN' || userProfile.role === 'EDITOR') && (
                            <XStack
                                alignItems="center" gap="$3" px="$3" py="$2.5"
                                cursor="pointer" hoverStyle={{ bg: '$surfaceContainerLow' }}
                                onPress={() => { setOpen(false); router.push('/admin') }}
                            >
                                <Shield size={18} color="$tertiary" />
                                <SizableText size="$3" color="$tertiary" fontWeight="600">관리자 패널</SizableText>
                            </XStack>
                        )}
                    </YStack>
                    <Separator borderColor="$outlineVariant" />
                    <XStack
                        alignItems="center" gap="$3" px="$3" py="$2.5"
                        cursor="pointer" hoverStyle={{ bg: '$errorContainer' }}
                        onPress={() => { setOpen(false); onLogout() }}
                    >
                        <LogOut size={18} color="$error" />
                        <SizableText size="$3" color="$error">로그아웃</SizableText>
                    </XStack>
                </YStack>
            )}
        </YStack>
    )
}

// ── 메인 AppLayout ──

export function AppLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { data: userProfile } = useCurrentUserProfile()
    const [moreOpen, setMoreOpen] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setMoreOpen(false)
        router.push('/')
    }

    const navigateMore = (path: string) => {
        setMoreOpen(false)
        router.push(path)
    }

    // Admin 페이지는 자체 레이아웃 사용
    if (pathname?.startsWith('/admin')) {
        return <YStack flex={1} bg="$backgroundBody" height="100%">{children}</YStack>
    }

    const isNavActive = (path: string) => {
        if (path === '/') return pathname === '/' || pathname === ''
        return pathname?.startsWith(path)
    }

    return (
        <YStack flex={1} bg="$backgroundBody" height="100%">
            <style dangerouslySetInnerHTML={{ __html: RESPONSIVE_CSS }} />

            {/* ══════ Desktop: Top Header ══════ */}
            <div className="desktop-only" style={{ flexDirection: 'row' }}>
                <XStack
                    bg="$surface"
                    px="$6"
                    height={72}
                    alignItems="center"
                    justifyContent="space-between"
                    zIndex={100}
                    borderBottomWidth={1}
                    borderColor="$outlineVariant"
                    width="100%"
                >
                    {/* Left: Logo & Nav */}
                    <XStack alignItems="center" gap="$4" height="100%">
                        <SizableText
                            size="$7"
                            fontWeight="800"
                            color="$primary"
                            cursor="pointer"
                            onPress={() => router.push('/')}
                            letterSpacing={-0.5}
                        >
                            Giljabi
                        </SizableText>

                        <XStack gap="$1" ml="$3" height="100%" alignItems="center">
                            {DESKTOP_NAV_ITEMS.map((item) => {
                                const active = isNavActive(item.path)
                                const Icon = item.icon
                                return (
                                    <XStack
                                        key={item.path}
                                        alignItems="center"
                                        gap="$2"
                                        cursor="pointer"
                                        onPress={() => router.push(item.path)}
                                        bg={active ? '$primaryContainer' : 'transparent'}
                                        hoverStyle={{ bg: active ? '$primaryContainer' : '$surfaceContainerLow' }}
                                        borderRadius="$full"
                                        px="$3.5"
                                        py="$2"
                                    >
                                        <Icon size={18} color={active ? '$onPrimaryContainer' : '$onSurfaceVariant'} />
                                        <SizableText
                                            size="$3"
                                            fontWeight={active ? '700' : '500'}
                                            color={active ? '$onPrimaryContainer' : '$onSurfaceVariant'}
                                        >
                                            {item.label}
                                        </SizableText>
                                    </XStack>
                                )
                            })}
                        </XStack>
                    </XStack>

                    {/* Right: Actions & User */}
                    <XStack alignItems="center" gap="$1.5">
                        <Button size="$3" circular bg="transparent" hoverStyle={{ bg: '$surfaceContainerLow' }} icon={<Search size={20} color="$onSurfaceVariant" />} onPress={() => router.push('/search')} />
                        {userProfile ? (
                            <>
                                <Button size="$3" circular bg="transparent" hoverStyle={{ bg: '$surfaceContainerLow' }} icon={<MessageSquare size={20} color="$onSurfaceVariant" />} onPress={() => router.push('/messages')} />
                                <Button size="$3" circular bg="transparent" hoverStyle={{ bg: '$surfaceContainerLow' }} icon={<Bell size={20} color="$onSurfaceVariant" />} onPress={() => router.push('/notifications')} />
                                <UserDropdown userProfile={userProfile} onLogout={handleLogout} router={router} />
                            </>
                        ) : (
                            <XStack gap="$2" alignItems="center" ml="$2">
                                <XStack
                                    alignItems="center" justifyContent="center"
                                    borderRadius="$full" borderWidth={1} borderColor="$primary"
                                    hoverStyle={{ bg: '$primaryContainer' }}
                                    px="$4" py="$2" cursor="pointer"
                                    onPress={() => router.push('/login')}
                                >
                                    <SizableText color="$primary" fontWeight="600" size="$3">로그인</SizableText>
                                </XStack>
                                <XStack
                                    alignItems="center" justifyContent="center"
                                    bg="$primary" borderRadius="$full"
                                    hoverStyle={{ opacity: 0.9 }}
                                    px="$4" py="$2" cursor="pointer"
                                    onPress={() => router.push('/login')}
                                >
                                    <SizableText color="white" fontWeight="600" size="$3">회원가입</SizableText>
                                </XStack>
                            </XStack>
                        )}
                    </XStack>
                </XStack>
            </div>

            {/* ══════ Mobile: Top Header (minimal) ══════ */}
            <div className="mobile-only" style={{ flexDirection: 'row' }}>
                <XStack
                    px="$4"
                    height={56}
                    bg="$surface"
                    alignItems="center"
                    justifyContent="space-between"
                    zIndex={100}
                    borderBottomWidth={1}
                    borderColor="$outlineVariant"
                    width="100%"
                >
                    <SizableText
                        size="$6"
                        fontWeight="800"
                        color="$primary"
                        letterSpacing={-0.5}
                        cursor="pointer"
                        onPress={() => router.push('/')}
                    >
                        Giljabi
                    </SizableText>
                    <XStack gap="$1" alignItems="center">
                        <Button size="$3" circular bg="transparent" icon={<Search size={20} color="$onSurfaceVariant" />} onPress={() => router.push('/search')} />
                        {userProfile && (
                            <Button size="$3" circular bg="transparent" icon={<Bell size={20} color="$onSurfaceVariant" />} onPress={() => router.push('/notifications')} />
                        )}
                    </XStack>
                </XStack>
            </div>

            {/* ══════ Main Content ══════ */}
            <YStack flex={1} height="100%">
                {/* 모바일에서 하단 네비바 높이만큼 패딩 */}
                <div className="mobile-only" style={{ display: 'contents' }}>
                    <style dangerouslySetInnerHTML={{ __html: `
                        @media (max-width: 860px) {
                            .main-content-area { padding-bottom: 80px !important; }
                        }
                    `}} />
                </div>
                <div className="main-content-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {children}
                </div>
            </YStack>

            {/* ══════ Mobile: M3 Bottom Navigation Bar ══════ */}
            <div className="mobile-only" style={{ flexDirection: 'column' }}>
                <XStack
                    position="fixed"
                    bottom={0}
                    left={0}
                    right={0}
                    height={80}
                    bg="$surface"
                    borderTopWidth={1}
                    borderColor="$outlineVariant"
                    alignItems="flex-start"
                    justifyContent="space-around"
                    pt="$2"
                    pb="$3"
                    zIndex={100}
                >
                    {BOTTOM_NAV_ITEMS.map((item) => {
                        const active = isNavActive(item.path)
                        const Icon = item.icon
                        return (
                            <YStack
                                key={item.path}
                                alignItems="center"
                                justifyContent="center"
                                gap="$1"
                                flex={1}
                                cursor="pointer"
                                onPress={() => router.push(item.path)}
                                minHeight={48}
                            >
                                <YStack
                                    bg={active ? '$primaryContainer' : 'transparent'}
                                    borderRadius="$full"
                                    px="$5"
                                    py="$1"
                                    alignItems="center"
                                >
                                    <Icon size={22} color={active ? '$onPrimaryContainer' : '$onSurfaceVariant'} />
                                </YStack>
                                <SizableText
                                    size="$1"
                                    fontWeight={active ? '700' : '500'}
                                    color={active ? '$onSurface' : '$onSurfaceVariant'}
                                >
                                    {item.label}
                                </SizableText>
                            </YStack>
                        )
                    })}

                    {/* More Button */}
                    <YStack
                        alignItems="center"
                        justifyContent="center"
                        gap="$1"
                        flex={1}
                        cursor="pointer"
                        onPress={() => setMoreOpen(true)}
                        minHeight={48}
                    >
                        <YStack
                            bg={moreOpen ? '$primaryContainer' : 'transparent'}
                            borderRadius="$full"
                            px="$5"
                            py="$1"
                            alignItems="center"
                        >
                            <MoreHorizontal size={22} color={moreOpen ? '$onPrimaryContainer' : '$onSurfaceVariant'} />
                        </YStack>
                        <SizableText
                            size="$1"
                            fontWeight={moreOpen ? '700' : '500'}
                            color={moreOpen ? '$onSurface' : '$onSurfaceVariant'}
                        >
                            더보기
                        </SizableText>
                    </YStack>
                </XStack>
            </div>

            {/* ══════ Mobile: More Bottom Sheet ══════ */}
            <div className={`more-sheet-overlay ${moreOpen ? 'open' : ''}`} onClick={() => setMoreOpen(false)} />
            <div className={`more-sheet ${moreOpen ? 'open' : ''}`}>
                <YStack bg="$surface" pb="$6">
                    {/* Handle */}
                    <YStack alignItems="center" pt="$3" pb="$2">
                        <YStack width={40} height={4} bg="$outlineVariant" borderRadius="$full" />
                    </YStack>

                    {/* Header */}
                    <XStack px="$5" py="$3" alignItems="center" justifyContent="space-between">
                        <SizableText size="$5" fontWeight="700" color="$onSurface">더보기</SizableText>
                        <Button size="$3" circular bg="transparent" icon={<X size={20} color="$onSurfaceVariant" />} onPress={() => setMoreOpen(false)} />
                    </XStack>

                    {/* User Info */}
                    {userProfile && (
                        <XStack px="$5" py="$3" gap="$3" alignItems="center" onPress={() => navigateMore('/profile')} cursor="pointer">
                            <Avatar circular size="$5" bg="$primaryContainer">
                                <Avatar.Image src={userProfile.avatarUrl || undefined} />
                                <Avatar.Fallback bg="$primaryContainer">
                                    <SizableText size="$4" color="$primary" fontWeight="700">
                                        {userProfile.username?.charAt(0)?.toUpperCase() || 'U'}
                                    </SizableText>
                                </Avatar.Fallback>
                            </Avatar>
                            <YStack flex={1}>
                                <SizableText size="$5" fontWeight="700" color="$onSurface">{userProfile.username}</SizableText>
                                <SizableText size="$2" color="$onSurfaceVariant">{userProfile.email || '프로필 보기'}</SizableText>
                            </YStack>
                        </XStack>
                    )}

                    <Separator borderColor="$outlineVariant" mx="$4" />

                    {/* Menu Items */}
                    <YStack py="$2">
                        {MORE_MENU_ITEMS.map((item) => {
                            const Icon = item.icon
                            const active = isNavActive(item.path)
                            return (
                                <XStack
                                    key={item.path}
                                    alignItems="center" gap="$4" px="$5" py="$3.5"
                                    cursor="pointer"
                                    bg={active ? '$primaryContainer' : 'transparent'}
                                    hoverStyle={{ bg: '$surfaceContainerLow' }}
                                    onPress={() => navigateMore(item.path)}
                                    minHeight={48}
                                >
                                    <Icon size={22} color={active ? '$onPrimaryContainer' : '$onSurfaceVariant'} />
                                    <SizableText size="$4" fontWeight={active ? '700' : '500'} color={active ? '$onPrimaryContainer' : '$onSurface'}>
                                        {item.label}
                                    </SizableText>
                                </XStack>
                            )
                        })}
                    </YStack>

                    {userProfile && (
                        <>
                            <Separator borderColor="$outlineVariant" mx="$4" />
                            <YStack py="$2">
                                {MORE_USER_ITEMS.map((item) => {
                                    const Icon = item.icon
                                    return (
                                        <XStack
                                            key={item.path}
                                            alignItems="center" gap="$4" px="$5" py="$3.5"
                                            cursor="pointer"
                                            hoverStyle={{ bg: '$surfaceContainerLow' }}
                                            onPress={() => navigateMore(item.path)}
                                            minHeight={48}
                                        >
                                            <Icon size={22} color="$onSurfaceVariant" />
                                            <SizableText size="$4" color="$onSurface">{item.label}</SizableText>
                                        </XStack>
                                    )
                                })}

                                {(userProfile.role === 'ADMIN' || userProfile.role === 'EDITOR') && (
                                    <XStack
                                        alignItems="center" gap="$4" px="$5" py="$3.5"
                                        cursor="pointer" hoverStyle={{ bg: '$surfaceContainerLow' }}
                                        onPress={() => navigateMore('/admin')}
                                        minHeight={48}
                                    >
                                        <Shield size={22} color="$tertiary" />
                                        <SizableText size="$4" color="$tertiary" fontWeight="600">관리자 패널</SizableText>
                                    </XStack>
                                )}
                            </YStack>

                            <Separator borderColor="$outlineVariant" mx="$4" />

                            <XStack
                                alignItems="center" gap="$4" px="$5" py="$3.5" mt="$1"
                                cursor="pointer" hoverStyle={{ bg: '$errorContainer' }}
                                onPress={handleLogout}
                                minHeight={48}
                            >
                                <LogOut size={22} color="$error" />
                                <SizableText size="$4" color="$error">로그아웃</SizableText>
                            </XStack>
                        </>
                    )}

                    {!userProfile && (
                        <YStack px="$5" py="$3" gap="$2">
                            <Button
                                bg="$primary"
                                borderRadius="$button"
                                size="$4"
                                onPress={() => navigateMore('/login')}
                            >
                                <SizableText color="white" fontWeight="600">로그인 / 회원가입</SizableText>
                            </Button>
                        </YStack>
                    )}
                </YStack>
            </div>
        </YStack>
    )
}
