'use client'

import React, { useState, useRef, useEffect } from 'react'
import { YStack, XStack, SizableText, Button, Avatar, Separator } from '@my/ui'
import { usePathname, useRouter } from 'solito/navigation'
import { useCurrentUserProfile } from '../../hooks/useProfiles'
import { Home, Users, MessageSquare, User, Bell, Search, Edit3, LogOut, Shield, ChevronDown, Settings, BookOpen, Menu, X, Music } from '@tamagui/lucide-icons'
import { supabase } from '../../utils/supabase'

const NAV_ITEMS = [
    { label: '공동체 나눔', path: '/feed', icon: Home },
    { label: '사역 소개', path: '/landing', icon: BookOpen },
    { label: '그룹', path: '/groups', icon: Users },
    { label: '블로그', path: '/blog', icon: Edit3 },
    { label: '멤버', path: '/directory', icon: User },
    { label: '포트폴리오', path: '/portfolio', icon: Music },
]

const RESPONSIVE_CSS = `
  .desktop-only { display: flex !important; }
  .mobile-only { display: none !important; }
  @media (max-width: 860px) {
    .desktop-only { display: none !important; }
    .mobile-only { display: flex !important; }
  }
  .mobile-drawer-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.4);
    z-index: 999;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
  }
  .mobile-drawer-overlay.open {
    opacity: 1;
    pointer-events: auto;
  }
  .mobile-drawer {
    position: fixed;
    top: 0; right: 0; bottom: 0;
    width: 280px;
    max-width: 80vw;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.25s ease;
    overflow-y: auto;
  }
  .mobile-drawer.open {
    transform: translateX(0);
  }
`

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
                                onPress={() => { setOpen(false); router.push('/admin') }}
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setMobileMenuOpen(false)
        router.push('/')
    }

    const navigateMobile = (path: string) => {
        setMobileMenuOpen(false)
        router.push(path)
    }

    if (pathname?.startsWith('/admin')) {
        return <YStack flex={1} bg="$backgroundBody" height="100%">{children}</YStack>
    }

    return (
        <YStack flex={1} bg="$backgroundBody" height="100%">
            <style dangerouslySetInnerHTML={{ __html: RESPONSIVE_CSS }} />

            {/* ===== Desktop: Top Header GNB ===== */}
            <div className="desktop-only" style={{ flexDirection: 'row' }}>
                <XStack
                    bg="$surface"
                    paddingHorizontal="$6"
                    height={64}
                    alignItems="center"
                    justifyContent="space-between"
                    zIndex={100}
                    elevation="$1"
                    width="100%"
                >
                    {/* Left: Logo & Nav */}
                    <XStack alignItems="center" gap="$5" height="100%">
                        <SizableText
                            size="$6"
                            fontWeight="800"
                            color="$primary"
                            cursor="pointer"
                            onPress={() => router.push('/')}
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
            </div>

            {/* ===== Mobile: Top Header ===== */}
            <div className="mobile-only" style={{ flexDirection: 'row' }}>
                <XStack
                    paddingHorizontal="$4"
                    paddingVertical="$3"
                    bg="$surface"
                    alignItems="center"
                    justifyContent="space-between"
                    zIndex={100}
                    elevation="$1"
                    width="100%"
                >
                    <SizableText
                        size="$6"
                        fontWeight="800"
                        color="$primary"
                        letterSpacing={-0.5}
                        cursor="pointer"
                        onPress={() => navigateMobile('/')}
                    >
                        Giljabi
                    </SizableText>
                    <XStack gap="$1" alignItems="center">
                        <Button size="$3" circular bg="transparent" hoverStyle={{ bg: '$surfaceContainerHigh' }} icon={<Search size={20} color="$onSurfaceVariant" />} onPress={() => navigateMobile('/search')} />
                        {userProfile && (
                            <Button size="$3" circular bg="transparent" hoverStyle={{ bg: '$surfaceContainerHigh' }} icon={<Bell size={20} color="$onSurfaceVariant" />} onPress={() => navigateMobile('/notifications')} />
                        )}
                        <Button
                            size="$3"
                            circular
                            bg="transparent"
                            hoverStyle={{ bg: '$surfaceContainerHigh' }}
                            icon={<Menu size={22} color="$onSurface" />}
                            onPress={() => setMobileMenuOpen(true)}
                        />
                    </XStack>
                </XStack>
            </div>

            {/* ===== Mobile: Drawer Menu ===== */}
            <div className={`mobile-drawer-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />
            <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
                <YStack bg="$surface" flex={1} height="100%">
                    {/* Drawer Header */}
                    <XStack px="$4" py="$3" alignItems="center" justifyContent="space-between" borderBottomWidth={1} borderColor="$outlineVariant">
                        <SizableText size="$5" fontWeight="700" color="$primary">메뉴</SizableText>
                        <Button
                            size="$3"
                            circular
                            bg="transparent"
                            icon={<X size={20} color="$onSurfaceVariant" />}
                            onPress={() => setMobileMenuOpen(false)}
                        />
                    </XStack>

                    {/* User Info */}
                    {userProfile ? (
                        <XStack px="$4" py="$4" gap="$3" alignItems="center" bg="$surfaceContainerLow">
                            <Avatar circular size="$4" bg="$primaryContainer">
                                <Avatar.Image src={userProfile.avatarUrl || undefined} />
                                <Avatar.Fallback bg="$primaryContainer">
                                    <SizableText size="$3" color="$primary" fontWeight="700">
                                        {userProfile.username?.charAt(0)?.toUpperCase() || 'U'}
                                    </SizableText>
                                </Avatar.Fallback>
                            </Avatar>
                            <YStack flex={1}>
                                <SizableText size="$4" fontWeight="700" color="$onSurface">{userProfile.username}</SizableText>
                                <SizableText size="$2" color="$onSurfaceVariant">{userProfile.email || userProfile.role}</SizableText>
                            </YStack>
                        </XStack>
                    ) : (
                        <YStack px="$4" py="$4" gap="$2" bg="$surfaceContainerLow">
                            <Button bg="$primary" borderRadius="$4" onPress={() => navigateMobile('/login')}>
                                <SizableText color="white" fontWeight="600">로그인 / 회원가입</SizableText>
                            </Button>
                        </YStack>
                    )}

                    <Separator borderColor="$outlineVariant" />

                    {/* Navigation Links */}
                    <YStack py="$2">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.path
                            const Icon = item.icon
                            return (
                                <XStack
                                    key={item.path}
                                    alignItems="center"
                                    gap="$3"
                                    px="$5"
                                    py="$3"
                                    cursor="pointer"
                                    bg={isActive ? '$primaryContainer' : 'transparent'}
                                    hoverStyle={{ bg: isActive ? '$primaryContainer' : '$surfaceContainerHigh' }}
                                    onPress={() => navigateMobile(item.path)}
                                >
                                    <Icon size={20} color={isActive ? '$onPrimaryContainer' : '$onSurfaceVariant'} />
                                    <SizableText
                                        size="$4"
                                        fontWeight={isActive ? '700' : '500'}
                                        color={isActive ? '$onPrimaryContainer' : '$onSurface'}
                                    >
                                        {item.label}
                                    </SizableText>
                                </XStack>
                            )
                        })}
                    </YStack>

                    <Separator borderColor="$outlineVariant" />

                    {/* User Actions */}
                    {userProfile && (
                        <YStack py="$2">
                            <XStack alignItems="center" gap="$3" px="$5" py="$3" cursor="pointer" hoverStyle={{ bg: '$surfaceContainerHigh' }} onPress={() => navigateMobile('/messages')}>
                                <MessageSquare size={20} color="$onSurfaceVariant" />
                                <SizableText size="$4" color="$onSurface">메시지</SizableText>
                            </XStack>
                            <XStack alignItems="center" gap="$3" px="$5" py="$3" cursor="pointer" hoverStyle={{ bg: '$surfaceContainerHigh' }} onPress={() => navigateMobile('/profile')}>
                                <User size={20} color="$onSurfaceVariant" />
                                <SizableText size="$4" color="$onSurface">내 프로필</SizableText>
                            </XStack>
                            <XStack alignItems="center" gap="$3" px="$5" py="$3" cursor="pointer" hoverStyle={{ bg: '$surfaceContainerHigh' }} onPress={() => navigateMobile('/profile/edit')}>
                                <Settings size={20} color="$onSurfaceVariant" />
                                <SizableText size="$4" color="$onSurface">프로필 설정</SizableText>
                            </XStack>

                            {(userProfile.role === 'ADMIN' || userProfile.role === 'EDITOR') && (
                                <XStack alignItems="center" gap="$3" px="$5" py="$3" cursor="pointer" hoverStyle={{ bg: '$surfaceContainerHigh' }} onPress={() => navigateMobile('/admin')}>
                                    <Shield size={20} color="$tertiary" />
                                    <SizableText size="$4" color="$tertiary" fontWeight="600">관리자 패널</SizableText>
                                </XStack>
                            )}

                            <Separator borderColor="$outlineVariant" my="$1" />

                            <XStack alignItems="center" gap="$3" px="$5" py="$3" cursor="pointer" hoverStyle={{ bg: '$errorContainer' }} onPress={handleLogout}>
                                <LogOut size={20} color="$error" />
                                <SizableText size="$4" color="$error">로그아웃</SizableText>
                            </XStack>
                        </YStack>
                    )}
                </YStack>
            </div>

            {/* Main Content Area */}
            <YStack flex={1} height="100%">
                {children}
            </YStack>
        </YStack>
    )
}
