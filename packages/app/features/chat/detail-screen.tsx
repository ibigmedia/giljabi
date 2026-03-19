'use client'

import React, { useState, useRef, useEffect } from 'react'
import { YStack, XStack, ScrollView, SizableText, Paragraph, Avatar, Button, Input, Spinner } from '@my/ui'
import { useChatMessages, useSendMessage } from '../../hooks/useChat'
import { useCurrentUserProfile } from '../../hooks/useProfiles'
import { Send } from '@tamagui/lucide-icons'
import { KeyboardAvoidingView, Platform } from 'react-native'

export function ChatDetailScreen({ id }: { id: string }) {
    const { data: currentUser } = useCurrentUserProfile()
    const { data: messages, isLoading } = useChatMessages(id)
    const { mutateAsync: sendMessage, isPending: isSending } = useSendMessage()
    const [text, setText] = useState('')
    const scrollViewRef = useRef<ScrollView>(null)

    // Scroll to bottom when messages load or change
    useEffect(() => {
        if (scrollViewRef.current && messages) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true })
            }, 100)
        }
    }, [messages])

    const handleSend = async () => {
        if (!text.trim() || !id) return
        try {
            await sendMessage({ channelId: id, content: text.trim() })
            setText('')
        } catch (error) {
            console.error('Failed to send text:', error)
            alert('메시지 전송에 실패했습니다.')
        }
    }

    const hasText = text.trim().length > 0

    if (isLoading || !currentUser) {
        return (
            <YStack flex={1} bg="$backgroundBody" alignItems="center" justifyContent="center">
                <Spinner size="large" color="$primary" />
            </YStack>
        )
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <YStack flex={1} bg="$backgroundBody">
                {/* Message List */}
                <ScrollView
                    ref={scrollViewRef}
                    flex={1}
                >
                    <YStack
                        maxWidth={640}
                        alignSelf="center"
                        width="100%"
                        p="$4"
                        gap="$3"
                    >
                        {messages?.map((message) => {
                            const isMe = message.senderId === currentUser.id
                            return (
                                <XStack
                                    key={message.id}
                                    justifyContent={isMe ? 'flex-end' : 'flex-start'}
                                    alignItems="flex-end"
                                    gap="$2"
                                >
                                    {!isMe && (
                                        <Avatar circular size="$3" mb="$1">
                                            <Avatar.Image
                                                width="100%"
                                                height="100%"
                                                src={message.sender?.avatarUrl || 'https://i.pravatar.cc/150'}
                                            />
                                            <Avatar.Fallback bg="$surfaceContainerHigh" />
                                        </Avatar>
                                    )}
                                    <YStack maxWidth="70%">
                                        {!isMe && (
                                            <SizableText
                                                size="$2"
                                                color="$onSurfaceVariant"
                                                mb="$1"
                                                ml="$1"
                                            >
                                                {message.sender?.username || '사용자'}
                                            </SizableText>
                                        )}
                                        <YStack
                                            bg={isMe ? '$primaryContainer' : '$surfaceContainerHigh'}
                                            px="$3.5"
                                            py="$2.5"
                                            borderRadius="$6"
                                            borderBottomRightRadius={isMe ? '$1' : '$6'}
                                            borderBottomLeftRadius={isMe ? '$6' : '$1'}
                                        >
                                            <Paragraph
                                                color={isMe ? '$onPrimaryContainer' : '$onSurface'}
                                                size="$4"
                                            >
                                                {message.content}
                                            </Paragraph>
                                        </YStack>
                                        <XStack
                                            justifyContent={isMe ? 'flex-end' : 'flex-start'}
                                            mt="$1"
                                            px="$1"
                                        >
                                            <SizableText size="$1" color="$onSurfaceVariant">
                                                {new Date(message.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </SizableText>
                                        </XStack>
                                    </YStack>
                                </XStack>
                            )
                        })}
                    </YStack>
                </ScrollView>

                {/* Input Area */}
                <YStack
                    borderTopWidth={1}
                    borderColor="$outlineVariant"
                    bg="$surface"
                >
                    <XStack
                        maxWidth={640}
                        alignSelf="center"
                        width="100%"
                        p="$3"
                        pb={Platform.OS === 'ios' ? '$6' : '$3'}
                        alignItems="center"
                        gap="$2"
                    >
                        <Input
                            flex={1}
                            placeholder="메시지 입력..."
                            value={text}
                            onChangeText={setText}
                            onSubmitEditing={handleSend}
                            borderWidth={1}
                            borderColor="$outlineVariant"
                            borderRadius={9999}
                            bg="$surfaceContainerLow"
                            px="$4"
                            size="$4"
                        />
                        {hasText && (
                            <Button
                                size="$4"
                                circular
                                bg="$primary"
                                icon={<Send size={18} color="$onPrimary" />}
                                onPress={handleSend}
                                disabled={isSending}
                                hoverStyle={{ bg: '$primaryHover' }}
                                pressStyle={{ bg: '$primaryPress' }}
                            />
                        )}
                    </XStack>
                </YStack>
            </YStack>
        </KeyboardAvoidingView>
    )
}
