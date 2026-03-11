'use client'

import React from 'react'
import { YStack, XStack, H3, SizableText, Button, Separator, Spinner } from '@my/ui'
import { Plus, Search, FileText, Trash2 } from '@tamagui/lucide-icons'
import { usePosts, useDeletePost } from '../../hooks/usePosts'

export function AdminPostsScreen() {
    const { data: posts, isLoading } = usePosts()
    const { mutate: deletePost } = useDeletePost()

    return (
        <YStack flex={1} gap="$6">
            <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$4">
                <H3 color="$textMain" fontWeight="bold">Posts Management</H3>
                <XStack gap="$3">
                    <Button size="$3" bg="$surface" borderWidth={1} borderColor="$borderLight" icon={Search}>
                        <SizableText color="$textMain">Search Posts</SizableText>
                    </Button>
                    <Button size="$3" bg="$primary" icon={Plus}>
                        <SizableText color="white">Create New</SizableText>
                    </Button>
                </XStack>
            </XStack>

            <YStack bg="$surface" borderRadius="$card" borderWidth={1} borderColor="$borderLight" overflow="hidden">
                {/* Table Header */}
                <XStack bg="$surfaceHover" p="$4" borderBottomWidth={1} borderColor="$borderLight" px="$6">
                    <YStack flex={3}><SizableText size="$3" fontWeight="bold" color="$textMuted">CONTENT</SizableText></YStack>
                    <YStack flex={1}><SizableText size="$3" fontWeight="bold" color="$textMuted">AUTHOR</SizableText></YStack>
                    <YStack flex={1}><SizableText size="$3" fontWeight="bold" color="$textMuted">DATE</SizableText></YStack>
                    <YStack flex={1}><SizableText size="$3" fontWeight="bold" color="$textMuted">LIKES</SizableText></YStack>
                    <YStack flex={1} alignItems="flex-end"><SizableText size="$3" fontWeight="bold" color="$textMuted">ACTIONS</SizableText></YStack>
                </XStack>

                {/* Table Body */}
                {isLoading ? (
                    <YStack p="$6" alignItems="center">
                        <Spinner size="large" color="$primary" />
                    </YStack>
                ) : (
                    posts?.map((post, idx) => (
                        <YStack key={post.id}>
                            <XStack p="$4" px="$6" alignItems="center">
                                <XStack flex={3} gap="$3" alignItems="center">
                                    <FileText size={20} color="$textMuted" />
                                    <SizableText size="$3" fontWeight="800" color="$textMain" numberOfLines={1}>{post.content}</SizableText>
                                </XStack>
                                
                                <YStack flex={1} justifyContent="center">
                                    <SizableText size="$3" color="$textMain">{post.author?.username || 'Unknown'}</SizableText>
                                </YStack>

                                <YStack flex={1} justifyContent="center">
                                    <SizableText size="$3" color="$textMuted">{new Date(post.createdAt).toLocaleDateString()}</SizableText>
                                </YStack>

                                <YStack flex={1} justifyContent="center">
                                    <XStack bg="$colorTransparent" px="$2" py="$1" borderRadius={4} alignSelf="flex-start">
                                        <SizableText size="$2" color="$textMain">{post.likes?.length || 0}</SizableText>
                                    </XStack>
                                </YStack>

                                <XStack flex={1} justifyContent="flex-end" gap="$2">
                                    <Button size="$3" circular bg="transparent" hoverStyle={{ bg: '$red4' }} onPress={() => deletePost(post.id)} icon={<Trash2 size={16} color="red" />} />
                                </XStack>
                            </XStack>
                            {idx < posts.length - 1 && <Separator borderColor="$borderLight" opacity={0.3} />}
                        </YStack>
                    ))
                )}
            </YStack>
        </YStack>
    )
}
