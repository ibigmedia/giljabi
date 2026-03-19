'use client'

import React from 'react'
import { YStack, XStack, ScrollView, SizableText, Paragraph, Avatar, Spinner } from '@my/ui'
import { MessageCircle } from '@tamagui/lucide-icons'
import { useChatChannels } from '../../hooks/useChat'
import { useRouter } from 'solito/navigation'
import { useCurrentUserProfile } from '../../hooks/useProfiles'

export function ChatListScreen() {
    const { data: channels, isLoading } = useChatChannels()
    const { data: currentUser } = useCurrentUserProfile()
    const router = useRouter()

    if (isLoading || !currentUser) {
        return (
            <YStack flex={1} bg="$backgroundBody" alignItems="center" justifyContent="center">
                <Spinner size="large" color="$primary" />
            </YStack>
        )
    }

    if (!channels || channels.length === 0) {
        return (
            <YStack flex={1} bg="$backgroundBody" alignItems="center" justifyContent="center" p="$4" gap="$3">
                <MessageCircle size={48} color="$onSurfaceVariant" opacity={0.4} />
                <SizableText color="$onSurfaceVariant" textAlign="center" size="$4">
                    아직 생성된 채팅방이 없습니다.
                </SizableText>
                <SizableText color="$onSurfaceVariant" textAlign="center" size="$3">
                    다른 사용자의 프로필에서 '메시지' 버튼을 눌러 대화를 시작해보세요!
                </SizableText>
            </YStack>
        )
    }

    return (
        <ScrollView flex={1} bg="$backgroundBody">
            <YStack maxWidth={600} alignSelf="center" width="100%" py="$4" gap="$2">
                <SizableText size="$7" fontWeight="800" color="$onSurface" px="$4" mb="$2">메시지</SizableText>
                {channels.map((channel) => {
                    const otherParticipant = channel.participants?.find(
                        (p) => p.profileId !== currentUser.id
                    )?.profile

                    const latestMessage = channel.messages && channel.messages.length > 0
                        ? channel.messages[0]
                        : null

                    return (
                        <XStack
                            key={channel.id}
                            px="$4"
                            py="$3"
                            gap="$3"
                            alignItems="center"
                            cursor="pointer"
                            hoverStyle={{ bg: '$surfaceContainerLow' }}
                            pressStyle={{ bg: '$surfaceContainerHigh' }}
                            onPress={() => router.push(`/messages/${channel.id}`)}
                            borderRadius="$lg"
                            mx="$2"
                        >
                            <Avatar circular size="$5" bg="$primaryContainer">
                                <Avatar.Image width="100%" height="100%" src={otherParticipant?.avatarUrl || "https://i.pravatar.cc/150"} />
                                <Avatar.Fallback bg="$primaryContainer" />
                            </Avatar>

                            <YStack flex={1} gap="$0.5">
                                <XStack justifyContent="space-between" alignItems="center">
                                    <SizableText fontWeight="700" size="$4" color="$onSurface">
                                        {otherParticipant?.username || '알 수 없는 사용자'}
                                    </SizableText>
                                    {latestMessage && (
                                        <SizableText color="$onSurfaceVariant" size="$2">
                                            {new Date(latestMessage.createdAt).toLocaleDateString('ko-KR')}
                                        </SizableText>
                                    )}
                                </XStack>
                                <SizableText color="$onSurfaceVariant" size="$3" numberOfLines={1}>
                                    {latestMessage?.content || '(메시지 없음)'}
                                </SizableText>
                            </YStack>
                        </XStack>
                    )
                })}
            </YStack>
        </ScrollView>
    )
}
