'use client'

import React, { useMemo } from 'react'
import { YStack, XStack, ScrollView, Avatar, Paragraph, SizableText, Spinner, Button } from '@my/ui'
import { Heart, MessageSquare, UserPlus, Bell, CheckCheck } from '@tamagui/lucide-icons'
import { useNotifications } from '../../hooks/useNotifications'

function isToday(date: Date): boolean {
    const today = new Date()
    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    )
}

export function NotificationsScreen() {
    const { notifications, isLoading, error, markAsRead, markAllAsRead, unreadCount } = useNotifications()

    const grouped = useMemo(() => {
        if (!notifications || notifications.length === 0) return { today: [], earlier: [] }
        const today: typeof notifications = []
        const earlier: typeof notifications = []
        for (const notif of notifications) {
            if (isToday(new Date(notif.createdAt))) {
                today.push(notif)
            } else {
                earlier.push(notif)
            }
        }
        return { today, earlier }
    }, [notifications])

    if (isLoading) {
        return (
            <YStack flex={1} bg="$backgroundBody" justifyContent="center" alignItems="center" p="$4">
                <Spinner size="large" color="$primary" />
            </YStack>
        )
    }

    if (error) {
        return (
            <YStack flex={1} bg="$backgroundBody" justifyContent="center" alignItems="center" p="$4">
                <Paragraph color="$error">알림을 불러오는데 실패했습니다: {error.message}</Paragraph>
            </YStack>
        )
    }

    return (
        <ScrollView flex={1} bg="$backgroundBody">
            <YStack maxWidth={640} alignSelf="center" width="100%" py="$4" px="$4" gap="$4">
                {/* Header */}
                <XStack justifyContent="space-between" alignItems="center">
                    <XStack alignItems="center" gap="$2">
                        <SizableText size="$8" fontWeight="800" color="$onSurface">
                            알림
                        </SizableText>
                        {unreadCount > 0 && (
                            <YStack
                                bg="$error"
                                borderRadius={9999}
                                px="$2"
                                py="$0.5"
                                minWidth={24}
                                alignItems="center"
                            >
                                <SizableText size="$1" color="$onError" fontWeight="700">
                                    {unreadCount}
                                </SizableText>
                            </YStack>
                        )}
                    </XStack>

                    {unreadCount > 0 && (
                        <Button
                            size="$3"
                            chromeless
                            icon={<CheckCheck size={16} color="$primary" />}
                            onPress={() => markAllAsRead()}
                            hoverStyle={{ bg: '$surfaceContainerLow' }}
                            borderRadius="$4"
                        >
                            <SizableText size="$3" color="$primary" fontWeight="600">
                                모두 읽음
                            </SizableText>
                        </Button>
                    )}
                </XStack>

                {/* Empty State */}
                {notifications.length === 0 ? (
                    <YStack py="$10" alignItems="center" gap="$4">
                        <Bell size={48} color="$onSurfaceVariant" opacity={0.4} />
                        <Paragraph color="$onSurfaceVariant" textAlign="center">
                            아직 받은 알림이 없습니다.
                        </Paragraph>
                    </YStack>
                ) : (
                    <YStack gap="$4">
                        {/* Today Section */}
                        {grouped.today.length > 0 && (
                            <YStack gap="$2">
                                <SizableText
                                    size="$3"
                                    fontWeight="700"
                                    color="$onSurfaceVariant"
                                    px="$1"
                                >
                                    오늘
                                </SizableText>
                                <YStack gap="$2">
                                    {grouped.today.map((notif) => (
                                        <NotificationItem
                                            key={notif.id}
                                            notif={notif}
                                            markAsRead={markAsRead}
                                        />
                                    ))}
                                </YStack>
                            </YStack>
                        )}

                        {/* Earlier Section */}
                        {grouped.earlier.length > 0 && (
                            <YStack gap="$2">
                                <SizableText
                                    size="$3"
                                    fontWeight="700"
                                    color="$onSurfaceVariant"
                                    px="$1"
                                >
                                    이전
                                </SizableText>
                                <YStack gap="$2">
                                    {grouped.earlier.map((notif) => (
                                        <NotificationItem
                                            key={notif.id}
                                            notif={notif}
                                            markAsRead={markAsRead}
                                        />
                                    ))}
                                </YStack>
                            </YStack>
                        )}
                    </YStack>
                )}
            </YStack>
        </ScrollView>
    )
}

function NotificationItem({
    notif,
    markAsRead,
}: {
    notif: any
    markAsRead: (id: string) => void
}) {
    const isRead = notif.isRead
    let Icon = Bell
    let text = ''
    let iconColor = '$onSurfaceVariant'

    switch (notif.type) {
        case 'LIKE':
            Icon = Heart
            text = '회원님의 포스트를 좋아합니다.'
            iconColor = '$error'
            break
        case 'COMMENT':
            Icon = MessageSquare
            text = '회원님의 포스트에 댓글을 남겼습니다.'
            iconColor = '$primary'
            break
        case 'FOLLOW':
            Icon = UserPlus
            text = '회원님을 팔로우하기 시작했습니다.'
            iconColor = '$primary'
            break
    }

    return (
        <XStack
            p="$3.5"
            borderRadius="$card"
            bg="$surface"
            borderWidth={1}
            borderColor="$outlineVariant"
            borderLeftWidth={isRead ? 1 : 4}
            borderLeftColor={isRead ? '$outlineVariant' : '$primary'}
            gap="$3"
            alignItems="center"
            onPress={() => {
                if (!isRead) markAsRead(notif.id)
                // TODO: navigate to post detail or profile
            }}
            cursor="pointer"
            hoverStyle={{ bg: '$surfaceContainerLow' }}
        >
            <Avatar circular size="$4" bg="$primaryContainer">
                <Avatar.Image
                    width="100%"
                    height="100%"
                    src={notif.actor?.avatarUrl || 'https://i.pravatar.cc/150'}
                />
                <Avatar.Fallback bg="$primaryContainer" />
            </Avatar>

            <YStack flex={1} gap="$1">
                <XStack gap="$1" alignItems="center" flexWrap="wrap">
                    <SizableText fontWeight="700" color="$onSurface" size="$3">
                        {notif.actor?.username || '알 수 없는 유저'}
                    </SizableText>
                    <SizableText color="$onSurfaceVariant" size="$3">님이</SizableText>
                    <SizableText color="$onSurface" size="$3">{text}</SizableText>
                </XStack>
                <SizableText size="$2" color="$onSurfaceVariant">
                    {new Date(notif.createdAt).toLocaleDateString('ko-KR')}
                </SizableText>
            </YStack>

            <YStack justifyContent="center" alignItems="center" px="$1">
                <Icon size={18} color={iconColor as any} />
            </YStack>
        </XStack>
    )
}
