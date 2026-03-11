import React from 'react'
import { YStack, XStack, ScrollView, SizableText, Button, useMedia } from 'tamagui'
import { Home, Users, MessageCircle, Bell, User, Search, Settings } from '@tamagui/lucide-icons'
import { useRouter } from 'solito/navigation'

/**
 * M3 Style App Layout
 * Desktop: Left Navigation Rail + Main Content
 * Mobile: Header + Main Content + Bottom Navigation Bar
 */
export function AppLayout({ children, currentRoute = 'home' }: { children: React.ReactNode, currentRoute?: string }) {
    const media = useMedia()
    const isMobile = media.sm
    const router = useRouter()

    const navItems = [
        { name: '피드', route: '/', icon: Home, id: 'home' },
        { name: '그룹', route: '/groups', icon: Users, id: 'groups' },
        { name: '메시지', route: '/messages', icon: MessageCircle, id: 'messages' },
        { name: '알림', route: '/notifications', icon: Bell, id: 'notifications' },
        { name: '디렉토리', route: '/directory', icon: Search, id: 'directory' },
        { name: '프로필', route: '/profile', icon: User, id: 'profile' },
        { name: '대시보드', route: '/dashboard', icon: Settings, id: 'dashboard' },
    ]

    return (
        <XStack flex={1} backgroundColor="$backgroundBody" height="100%">
            {/* Desktop Navigation Rail - M3 */}
            {!isMobile && (
                <YStack
                    width={88}
                    backgroundColor="$surfaceContainerLow"
                    p="$3"
                    gap="$1"
                    height="100%"
                    alignItems="center"
                    pt="$6"
                >
                    <SizableText size="$4" fontWeight="800" color="$primary" mb="$6" letterSpacing={-0.5}>
                        G
                    </SizableText>

                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = currentRoute === item.id
                        return (
                            <YStack
                                key={item.name}
                                onPress={() => router.push(item.route)}
                                alignItems="center"
                                justifyContent="center"
                                cursor="pointer"
                                gap="$1"
                                py="$1.5"
                                width="100%"
                            >
                                <XStack
                                    bg={isActive ? '$primaryContainer' : 'transparent'}
                                    hoverStyle={{ bg: isActive ? '$primaryContainer' : '$surfaceContainerHigh' }}
                                    borderRadius="$full"
                                    paddingHorizontal="$4"
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
                                    {item.name}
                                </SizableText>
                            </YStack>
                        )
                    })}
                </YStack>
            )}

            {/* Main Content Area */}
            <YStack flex={1} height="100%" position="relative">
                {/* Mobile Header */}
                {isMobile && (
                    <XStack
                        height={56}
                        backgroundColor="$surface"
                        alignItems="center"
                        px="$4"
                        elevation="$1"
                    >
                        <SizableText size="$5" fontWeight="800" color="$primary" letterSpacing={-0.5}>
                            Giljabi
                        </SizableText>
                    </XStack>
                )}

                <ScrollView flex={1} contentContainerStyle={{ pb: isMobile ? 80 : 0 }}>
                    {children}
                </ScrollView>

                {/* Mobile Bottom Navigation - M3 */}
                {isMobile && (
                    <XStack
                        position="absolute"
                        bottom={0}
                        left={0}
                        right={0}
                        height={72}
                        backgroundColor="$surfaceContainerLow"
                        justifyContent="space-around"
                        alignItems="center"
                        pb="$2"
                        elevation="$2"
                    >
                        {navItems.slice(0, 5).map((item) => {
                            const Icon = item.icon
                            const isActive = currentRoute === item.id
                            return (
                                <YStack
                                    key={item.name}
                                    alignItems="center"
                                    justifyContent="center"
                                    onPress={() => router.push(item.route)}
                                    flex={1}
                                    height="100%"
                                    cursor="pointer"
                                    gap="$1"
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
                                        {item.name}
                                    </SizableText>
                                </YStack>
                            )
                        })}
                    </XStack>
                )}
            </YStack>
        </XStack>
    )
}
