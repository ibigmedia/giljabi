'use client'

import React, { useState, useRef, useEffect } from 'react'
import { YStack, XStack, SizableText, Button, ScrollView, Separator } from '@my/ui'
import { Settings, Users, FileText, Activity, LayoutDashboard, LogOut, Music, Menu, X, ArrowLeft } from '@tamagui/lucide-icons'
import { usePathname, useRouter } from 'solito/navigation'
import { useCurrentUserProfile } from '../../hooks/useProfiles'
import { Spinner } from 'tamagui'

const ADMIN_MENU = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Groups', path: '/admin/groups', icon: Users },
    { label: 'Posts & Feed', path: '/admin/posts', icon: FileText },
    { label: 'Blogs (CMS)', path: '/admin/blogs', icon: FileText },
    { label: 'Portfolio', path: '/admin/portfolio', icon: Music },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
]

const ADMIN_RESPONSIVE_CSS = `
  .admin-desktop-only { display: flex !important; }
  .admin-mobile-only { display: none !important; }
  @media (max-width: 860px) {
    .admin-desktop-only { display: none !important; }
    .admin-mobile-only { display: flex !important; }
  }
  .admin-drawer-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.4);
    z-index: 998;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
  }
  .admin-drawer-overlay.open {
    opacity: 1;
    pointer-events: auto;
  }
  .admin-drawer {
    position: fixed;
    top: 0; left: 0; bottom: 0;
    width: 280px;
    z-index: 999;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
    overflow-y: auto;
  }
  .admin-drawer.open {
    transform: translateX(0);
  }
`

function SidebarContent({
    pathname,
    router,
    onItemPress,
}: {
    pathname: string
    router: any
    onItemPress?: () => void
}) {
    return (
        <>
            {/* Brand */}
            <XStack
                alignItems="center"
                gap="$3"
                px="$5"
                mb="$6"
                cursor="pointer"
                onPress={() => {
                    onItemPress?.()
                    router.push('/')
                }}
            >
                <YStack bg="$primary" borderRadius={8} p="$2">
                    <Activity size={22} color="white" />
                </YStack>
                <SizableText size="$6" fontWeight="bold" color="$onSurface">
                    Admin UI
                </SizableText>
            </XStack>

            {/* Menu */}
            <YStack gap="$1" px="$3" flex={1}>
                {ADMIN_MENU.map((item) => {
                    const isActive = pathname === item.path
                    const Icon = item.icon
                    return (
                        <XStack
                            key={item.path}
                            gap="$3"
                            alignItems="center"
                            bg={isActive ? '$primaryContainer' : 'transparent'}
                            borderRadius="$md"
                            hoverStyle={{ bg: isActive ? '$primaryContainer' : '$surfaceContainerLow' }}
                            p="$3"
                            minHeight={44}
                            cursor="pointer"
                            onPress={() => {
                                onItemPress?.()
                                router.push(item.path)
                            }}
                        >
                            <Icon size={20} color={isActive ? '$onPrimaryContainer' : '$onSurfaceVariant'} />
                            <SizableText
                                size="$4"
                                color={isActive ? '$onPrimaryContainer' : '$onSurface'}
                                fontWeight={isActive ? 'bold' : '500'}
                            >
                                {item.label}
                            </SizableText>
                        </XStack>
                    )
                })}
            </YStack>

            {/* Bottom Exit */}
            <YStack px="$3" mt="auto">
                <Separator borderColor="$outlineVariant" mb="$3" />
                <XStack
                    gap="$3"
                    alignItems="center"
                    bg="transparent"
                    hoverStyle={{ bg: '$surfaceContainerLow' }}
                    borderRadius="$md"
                    p="$3"
                    minHeight={44}
                    cursor="pointer"
                    onPress={() => {
                        onItemPress?.()
                        router.push('/')
                    }}
                >
                    <LogOut size={20} color="$onSurfaceVariant" />
                    <SizableText size="$4" color="$onSurfaceVariant" fontWeight="500">
                        Exit Admin
                    </SizableText>
                </XStack>
            </YStack>
        </>
    )
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { data: userProfile, isLoading } = useCurrentUserProfile()
    const [drawerOpen, setDrawerOpen] = useState(false)

    // Close drawer on route change
    useEffect(() => {
        setDrawerOpen(false)
    }, [pathname])

    if (isLoading) {
        return (
            <YStack flex={1} alignItems="center" justifyContent="center" bg="$backgroundBody" height="100vh">
                <Spinner size="large" color="$primary" />
            </YStack>
        )
    }

    if (!userProfile || (userProfile.role !== 'ADMIN' && userProfile.role !== 'EDITOR')) {
        return (
            <YStack flex={1} alignItems="center" justifyContent="center" bg="$backgroundBody" height="100vh" gap="$4">
                <Activity size={48} color="$error" />
                <SizableText size="$6" fontWeight="bold" color="$onSurface">Access Denied</SizableText>
                <SizableText size="$4" color="$onSurfaceVariant">You do not have permission to view the Admin Dashboard.</SizableText>
                <Button size="$4" bg="$primary" onPress={() => router.push('/')} mt="$4">
                    <SizableText color="white">Return to Home</SizableText>
                </Button>
            </YStack>
        )
    }

    return (
        <YStack flex={1} bg="$backgroundBody" height="100vh" width="100vw" overflow="hidden">
            <style dangerouslySetInnerHTML={{ __html: ADMIN_RESPONSIVE_CSS }} />

            {/* ══════ Mobile: Drawer Overlay + Drawer ══════ */}
            <div
                className={`admin-drawer-overlay ${drawerOpen ? 'open' : ''}`}
                onClick={() => setDrawerOpen(false)}
            />
            <div className={`admin-drawer ${drawerOpen ? 'open' : ''}`}>
                <YStack bg="$surface" height="100%" py="$5">
                    {/* Drawer header with close */}
                    <XStack px="$5" mb="$4" alignItems="center" justifyContent="space-between">
                        <SizableText size="$5" fontWeight="700" color="$onSurface">Menu</SizableText>
                        <Button
                            size="$3"
                            circular
                            bg="transparent"
                            icon={<X size={20} color="$onSurfaceVariant" />}
                            onPress={() => setDrawerOpen(false)}
                        />
                    </XStack>
                    <SidebarContent
                        pathname={pathname || ''}
                        router={router}
                        onItemPress={() => setDrawerOpen(false)}
                    />
                </YStack>
            </div>

            {/* ══════ Desktop: Fixed Sidebar ══════ */}
            <XStack flex={1} height="100%">
                <div className="admin-desktop-only" style={{ flexDirection: 'column', height: '100%' }}>
                    <YStack
                        width={260}
                        bg="$surface"
                        borderRightWidth={1}
                        borderColor="$outlineVariant"
                        height="100%"
                        py="$6"
                    >
                        <SidebarContent pathname={pathname || ''} router={router} />
                    </YStack>
                </div>

                {/* ══════ Main Content Area ══════ */}
                <YStack flex={1} height="100%">
                    {/* Mobile Top Bar */}
                    <div className="admin-mobile-only" style={{ flexDirection: 'row' }}>
                        <XStack
                            height={56}
                            bg="$surface"
                            borderBottomWidth={1}
                            borderColor="$outlineVariant"
                            alignItems="center"
                            px="$4"
                            width="100%"
                        >
                            <Button
                                size="$3"
                                circular
                                bg="transparent"
                                icon={<Menu size={22} color="$onSurface" />}
                                onPress={() => setDrawerOpen(true)}
                                minHeight={44}
                                minWidth={44}
                            />
                            <SizableText
                                flex={1}
                                textAlign="center"
                                size="$5"
                                fontWeight="700"
                                color="$onSurface"
                            >
                                관리자
                            </SizableText>
                            <Button
                                size="$3"
                                circular
                                bg="transparent"
                                icon={<ArrowLeft size={22} color="$onSurface" />}
                                onPress={() => router.push('/')}
                                minHeight={44}
                                minWidth={44}
                            />
                        </XStack>
                    </div>

                    {/* Desktop Top Bar */}
                    <div className="admin-desktop-only" style={{ flexDirection: 'row' }}>
                        <XStack
                            height={64}
                            bg="$surface"
                            borderBottomWidth={1}
                            borderColor="$outlineVariant"
                            alignItems="center"
                            paddingHorizontal="$6"
                            justifyContent="flex-end"
                            width="100%"
                        >
                            <XStack alignItems="center" gap="$3">
                                <SizableText color="$onSurface" fontWeight="bold">
                                    {userProfile.username} ({userProfile.role})
                                </SizableText>
                            </XStack>
                        </XStack>
                    </div>

                    {/* Content */}
                    <ScrollView flex={1} padding="$5">
                        {children}
                    </ScrollView>
                </YStack>
            </XStack>
        </YStack>
    )
}
