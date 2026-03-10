'use client'

import React from 'react'
import { YStack, XStack, ScrollView, Avatar, H3, Paragraph, SizableText, Spinner, Separator } from '@my/ui'
import { Heart, MessageSquare, UserPlus, Bell } from '@tamagui/lucide-icons'
import { useNotifications } from '../../hooks/useNotifications'

export function NotificationsScreen() {
  const { notifications, isLoading, error, markAsRead, markAllAsRead, unreadCount } = useNotifications()

  if (isLoading) {
    return (
      <YStack flex={1} justify="center" items="center" p="$4">
        <Spinner size="large" />
      </YStack>
    )
  }

  if (error) {
    return (
      <YStack flex={1} justify="center" items="center" p="$4">
        <Paragraph color="$red10">알림을 불러오는데 실패했습니다: {error.message}</Paragraph>
      </YStack>
    )
  }

  return (
    <ScrollView flex={1} bg="$background">
      <YStack p="$4" gap="$4" maxWidth={600} mx="auto" width="100%">
        <XStack justify="space-between" items="center">
          <XStack items="center" gap="$2">
            <Bell size={24} color="$color12" />
            <H3>알림 {unreadCount > 0 && `(${unreadCount})`}</H3>
          </XStack>
          
          {unreadCount > 0 && (
            <SizableText 
              color="$blue10" 
              cursor="pointer" 
              hoverStyle={{ opacity: 0.7 }}
              onPress={() => markAllAsRead()}
            >
              모두 읽음 처리
            </SizableText>
          )}
        </XStack>

        <Separator />

        {notifications.length === 0 ? (
          <YStack py="$10" items="center" gap="$4">
            <Bell size={48} color="$color8" opacity={0.5} />
            <Paragraph color="$color10" text="center">
              아직 받은 알림이 없습니다.
            </Paragraph>
          </YStack>
        ) : (
          <YStack gap="$2">
            {notifications.map((notif) => {
              const isRead = notif.isRead
              let Icon = Bell
              let text = ''
              let iconColor = '$color10'

              switch (notif.type) {
                case 'LIKE':
                  Icon = Heart
                  text = '회원님의 포스트를 좋아합니다.'
                  iconColor = '$red10'
                  break
                case 'COMMENT':
                  Icon = MessageSquare
                  text = '회원님의 포스트에 댓글을 남겼습니다.'
                  iconColor = '$blue10'
                  break
                case 'FOLLOW':
                  Icon = UserPlus
                  text = '회원님을 팔로우하기 시작했습니다.'
                  iconColor = '$green10'
                  break
              }

              return (
                <XStack
                  key={notif.id}
                  p="$4"
                  borderRadius="$4"
                  bg={isRead ? '$color2' : '$color5'}
                  borderWidth={1}
                  borderColor="$color4"
                  gap="$3"
                  items="center"
                  onPress={() => {
                    if (!isRead) markAsRead(notif.id)
                    // TODO: 라우팅 (포스트 상세 또는 프로필로 이동)
                  }}
                  cursor="pointer"
                  hoverStyle={{ bg: isRead ? '$color3' : '$color6' }}
                >
                  <Avatar circular size="$4">
                    <Avatar.Image src={notif.actor?.avatarUrl || 'https://i.pravatar.cc/150'} />
                    <Avatar.Fallback bg="$color8" />
                  </Avatar>
                  
                  <YStack flex={1}>
                    <XStack gap="$1" items="center" flexWrap="wrap">
                      <SizableText fontWeight="bold" color="$color12">
                        {notif.actor?.username || '알 수 없는 유저'}
                      </SizableText>
                      <SizableText color="$color11">님이</SizableText>
                      <SizableText color="$color12">{text}</SizableText>
                    </XStack>
                    <SizableText size="$2" color="$color10">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </SizableText>
                  </YStack>

                  <YStack justify="center" items="center" px="$2">
                    <Icon size={20} color={iconColor as any} />
                  </YStack>
                  
                  {!isRead && (
                    <YStack width={8} height={8} borderRadius="$4" bg="$blue10" />
                  )}
                </XStack>
              )
            })}
          </YStack>
        )}
      </YStack>
    </ScrollView>
  )
}
