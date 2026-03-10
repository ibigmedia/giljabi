'use client'

import React from 'react'
import { YStack, XStack, ScrollView, Text, SizableText, Paragraph, Avatar, Separator, Spinner } from '@my/ui'
import { useChatChannels } from '../../hooks/useChat'
import { useRouter } from 'solito/navigation'
import { useCurrentUserProfile } from '../../hooks/useProfiles'

export function ChatListScreen() {
    const { data: channels, isLoading } = useChatChannels()
    const { data: currentUser } = useCurrentUserProfile()
    const router = useRouter()

    if (isLoading || !currentUser) {
        return (
            <YStack flex={1} bg="$background" alignItems="center" justifyContent="center">
                <Spinner size="large" />
            </YStack>
        )
    }

    if (!channels || channels.length === 0) {
        return (
            <YStack flex={1} bg="$background" alignItems="center" justifyContent="center" p="$4">
                <Paragraph color="$color10" textAlign="center">
                    아직 생성된 채팅방이 없습니다.
                </Paragraph>
                <Paragraph color="$color10" textAlign="center" mt="$2">
                    다른 사용자의 프로필에서 '메시지' 버튼을 눌러 대화를 시작해보세요!
                </Paragraph>
            </YStack>
        )
    }

    return (
        <ScrollView flex={1} bg="$background">
            <YStack>
                {channels.map((channel) => {
                    // Find the other participant
                    const otherParticipant = channel.participants?.find(
                        (p) => p.profileId !== currentUser.id
                    )?.profile

                    const latestMessage = channel.messages && channel.messages.length > 0 
                        ? channel.messages[0] 
                        : null

                    return (
                        <XStack
                            key={channel.id}
                            p="$4"
                            gap="$3"
                            alignItems="center"
                            cursor="pointer"
                            hoverStyle={{ bg: '$gray3' }}
                            pressStyle={{ bg: '$gray4' }}
                            onPress={() => router.push(`/messages/${channel.id}`)}
                        >
                            <Avatar circular size="$5">
                                <Avatar.Image src={otherParticipant?.avatarUrl || "https://i.pravatar.cc/150"} />
                                <Avatar.Fallback bg="$gray5" />
                            </Avatar>
                            
                            <YStack flex={1} gap="$1">
                                <XStack justifyContent="space-between" alignItems="center">
                                    <SizableText fontWeight="bold" size="$4">
                                        {otherParticipant?.username || '알 수 없는 사용자'}
                                    </SizableText>
                                    {latestMessage && (
                                        <SizableText color="$color10" size="$2">
                                            {new Date(latestMessage.createdAt).toLocaleDateString()}
                                        </SizableText>
                                    )}
                                </XStack>
                                <Paragraph color="$color11" size="$3" numberOfLines={1}>
                                    {latestMessage?.content || '(메시지 없음)'}
                                </Paragraph>
                            </YStack>
                        </XStack>
                    )
                })}
            </YStack>
        </ScrollView>
    )
}
