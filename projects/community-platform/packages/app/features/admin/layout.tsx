'use client'

import React from 'react'
import { YStack, XStack, SizableText, Button, ScrollView, Separator } from '@my/ui'
import { Settings, Users, FileText, Activity, LayoutDashboard, LogOut } from '@tamagui/lucide-icons'
import { usePathname, useRouter } from 'solito/navigation'
import { useCurrentUserProfile } from '../../hooks/useProfiles'
import { Spinner } from 'tamagui'

const ADMIN_MENU = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Posts & Feed', path: '/admin/posts', icon: FileText },
    { label: 'Blogs (CMS)', path: '/admin/blogs', icon: FileText },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { data: userProfile, isLoading } = useCurrentUserProfile()

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
                <Activity size={48} color="$red10" />
                <SizableText size="$6" fontWeight="bold" color="$textMain">Access Denied</SizableText>
                <SizableText size="$4" color="$textMuted">You do not have permission to view the Admin Dashboard.</SizableText>
                <Button size="$4" bg="$primary" onPress={() => router.push('/')} mt="$4">
                    <SizableText color="white">Return to Home</SizableText>
                </Button>
            </YStack>
        )
    }

    return (
        <XStack flex={1} bg="$backgroundBody" height="100vh" width="100vw" overflow="hidden">
            {/* Sidebar */}
            <YStack
                width={260}
                bg="$surface"
                borderRightWidth={1}
                borderColor="$borderLight"
                height="100%"
                paddingVertical="$6"
            >
                {/* Brand */}
                <XStack alignItems="center" gap="$3" px="$6" mb="$8" cursor="pointer" onPress={() => router.push('/')}>
                    <YStack bg="$primary" borderRadius={8} p="$2">
                        <Activity size={24} color="white" />
                    </YStack>
                    <SizableText size="$6" fontWeight="bold" color="$textMain">
                        Admin UI
                    </SizableText>
                </XStack>

                {/* Menu */}
                <YStack gap="$2" px="$3" flex={1}>
                    {ADMIN_MENU.map((item) => {
                        const isActive = pathname === item.path
                        const Icon = item.icon
                        return (
                            <Button
                                key={item.path}
                                size="$4"
                                justifyContent="flex-start"
                                bg={isActive ? '$surfaceHover' : 'transparent'}
                                borderRadius="$button"
                                hoverStyle={{ bg: '$surfaceHover' }}
                                p="$3"
                                onPress={() => router.push(item.path)}
                            >
                                <XStack gap="$3" alignItems="center">
                                    <Icon size={20} color={isActive ? '$primary' : '$textMuted'} />
                                    <SizableText
                                        size="$4"
                                        color={isActive ? '$primary' : '$textMain'}
                                        fontWeight={isActive ? 'bold' : '500'}
                                    >
                                        {item.label}
                                    </SizableText>
                                </XStack>
                            </Button>
                        )
                    })}
                </YStack>

                {/* Bottom Logout */}
                <YStack px="$3" mt="auto">
                    <Separator borderColor="$borderLight" mb="$4" />
                    <Button
                        size="$4"
                        justifyContent="flex-start"
                        bg="transparent"
                        hoverStyle={{ bg: '$surfaceHover' }}
                        p="$3"
                        onPress={() => router.push('/')}
                    >
                        <XStack gap="$3" alignItems="center">
                            <LogOut size={20} color="$textMuted" />
                            <SizableText size="$4" color="$textMuted" fontWeight="500">
                                Exit Admin
                            </SizableText>
                        </XStack>
                    </Button>
                </YStack>
            </YStack>

            {/* Main View */}
            <YStack flex={1} height="100%">
                {/* Topbar */}
                <XStack
                    height={70}
                    bg="$surface"
                    borderBottomWidth={1}
                    borderColor="$borderLight"
                    alignItems="center"
                    paddingHorizontal="$6"
                    justifyContent="flex-end"
                >
                    <XStack alignItems="center" gap="$3">
                        <SizableText color="$textMain" fontWeight="bold">{userProfile.username} ({userProfile.role})</SizableText>
                    </XStack>
                </XStack>
                
                {/* Content */}
                <ScrollView flex={1} padding="$6">
                    {children}
                </ScrollView>
            </YStack>
        </XStack>
    )
}
