'use client'

import React, { useState, useRef, useEffect } from 'react'
import { YStack, XStack, ScrollView, Text, SizableText, Paragraph, Avatar, Button, Input, Spinner } from '@my/ui'
import { useChatMessages, useSendMessage } from '../../hooks/useChat'
import { useCurrentUserProfile } from '../../hooks/useProfiles'
import { Send } from '@tamagui/lucide-icons'
import { KeyboardAvoidingView, Platform } from 'react-native'

export function ChatDetailScreen({ id }: { id: string }) {
    const { data: currentUser } = useCurrentUserProfile()
    const { data: messages, isLoading } = useChatMessages(id)
    const { mutateAsync: sendMessage, isPending: isSending } = useSendMessage()
    const [text, setText] = useState('')
    const scrollViewRef = useRef<any>(null)

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

    if (isLoading || !currentUser) {
        return (
            <YStack flex={1} bg="$background" alignItems="center" justifyContent="center">
                <Spinner size="large" />
            </YStack>
        )
    }

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // adjust this depending on headers
        >
            <YStack flex={1} bg="$background">
                {/* Message List */}
                <ScrollView 
                    ref={scrollViewRef}
                    flex={1} 
                    contentContainerStyle={{ padding: 16, pb: 24, gap: 12 }}
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
                                        <Avatar.Image src={message.sender?.avatarUrl || "https://i.pravatar.cc/150"} />
                                        <Avatar.Fallback bg="$gray5" />
                                    </Avatar>
                                )}
                                <YStack maxW="70%">
                                    {!isMe && (
                                        <SizableText size="$2" color="$color10" mb="$1" ml="$1">
                                            {message.sender?.username || '사용자'}
                                        </SizableText>
                                    )}
                                    <YStack
                                        bg={isMe ? '$blue9' : '$gray3'}
                                        p="$3"
                                        borderRadius="$4"
                                        borderBottomRightRadius={isMe ? 0 : '$4'}
                                        borderBottomLeftRadius={isMe ? '$4' : 0}
                                    >
                                        <Paragraph color={isMe ? 'white' : '$color12'} size="$4">
                                            {message.content}
                                        </Paragraph>
                                    </YStack>
                                    <XStack justifyContent={isMe ? 'flex-end' : 'flex-start'} mt="$1">
                                        <SizableText size="$1" color="$color9">
                                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </SizableText>
                                    </XStack>
                                </YStack>
                            </XStack>
                        )
                    })}
                </ScrollView>

                {/* Input Area */}
                <XStack p="$3" pb={Platform.OS === 'ios' ? "$6" : "$3"} borderTopWidth={1} borderColor="$borderColor" bg="$background" alignItems="center" gap="$2">
                    <Input
                        flex={1}
                        placeholder="메시지 입력..."
                        value={text}
                        onChangeText={setText}
                        onSubmitEditing={handleSend}
                    />
                    <Button 
                        size="$4" 
                        circular 
                        bg="$blue9" 
                        icon={<Send size={18} color="white" />} 
                        onPress={handleSend} 
                        disabled={isSending || text.trim().length === 0}
                        opacity={text.trim().length === 0 ? 0.5 : 1}
                    />
                </XStack>
            </YStack>
        </KeyboardAvoidingView>
    )
}
