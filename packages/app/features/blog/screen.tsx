'use client'

import React from 'react'
import { YStack, XStack, ScrollView, Paragraph, Avatar, SizableText, Spinner } from '@my/ui'
import { MessageSquare, Clock, ChevronRight } from '@tamagui/lucide-icons'
import { useRouter } from 'solito/navigation'
import { useBlogPosts } from '../../hooks/useBlogs'

export function BlogScreen() {
    const router = useRouter()
    const { data: posts, isLoading } = useBlogPosts()

    const publishedPosts = posts?.filter(p => p.isPublished) || []

    return (
        <ScrollView flex={1} bg="$backgroundBody">
            <YStack maxWidth={960} alignSelf="center" width="100%" px="$4" py="$6" gap="$6">
                {/* Header */}
                <YStack gap="$1">
                    <SizableText size="$8" fontWeight="800" color="$onSurface">블로그</SizableText>
                    <SizableText size="$3" color="$onSurfaceVariant">길잡이의 이야기와 사역 소식을 전합니다</SizableText>
                </YStack>

                {isLoading ? (
                    <YStack padding="$8" alignItems="center">
                        <Spinner size="large" color="$primary" />
                    </YStack>
                ) : publishedPosts.length === 0 ? (
                    <YStack bg="$surface" p="$10" borderRadius="$card" elevation="$0.5" alignItems="center" gap="$2">
                        <SizableText color="$onSurfaceVariant" size="$4">아직 작성된 블로그 글이 없습니다.</SizableText>
                    </YStack>
                ) : (
                    <YStack gap="$3">
                        {publishedPosts.map((post, idx) => (
                            <XStack
                                key={post.id}
                                bg="$surface"
                                borderRadius="$card"
                                elevation="$0.5"
                                overflow="hidden"
                                cursor="pointer"
                                hoverStyle={{ elevation: '$1' }}
                                onPress={() => router.push(`/blog/${post.id}`)}
                            >
                                {/* Featured image area */}
                                {idx === 0 && post.mediaUrl && (
                                    <YStack width={200} $sm={{ display: 'none' }}>
                                        <img
                                            src={post.mediaUrl}
                                            alt=""
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </YStack>
                                )}
                                <YStack flex={1} p="$5" gap="$3">
                                    <YStack gap="$2">
                                        <SizableText
                                            color="$onSurface"
                                            size={idx === 0 ? "$7" : "$6"}
                                            fontWeight="700"
                                            lineHeight={idx === 0 ? 32 : 28}
                                        >
                                            {post.title}
                                        </SizableText>
                                        <Paragraph
                                            color="$onSurfaceVariant"
                                            size="$4"
                                            lineHeight={22}
                                            numberOfLines={2}
                                        >
                                            {post.excerpt || post.content.slice(0, 120)}
                                        </Paragraph>
                                    </YStack>

                                    <XStack justifyContent="space-between" alignItems="center" mt="$2">
                                        <XStack gap="$3" alignItems="center">
                                            <Avatar circular size="$3" bg="$primaryContainer">
                                                <Avatar.Image width="100%" height="100%" src={post.author?.avatarUrl || "https://i.pravatar.cc/150"} />
                                                <Avatar.Fallback bg="$primaryContainer" />
                                            </Avatar>
                                            <YStack>
                                                <SizableText size="$3" fontWeight="600" color="$onSurface">
                                                    {post.author?.username || '알 수 없음'}
                                                </SizableText>
                                                <XStack gap="$1.5" alignItems="center">
                                                    <Clock size={12} color="$onSurfaceVariant" />
                                                    <SizableText size="$2" color="$onSurfaceVariant">
                                                        {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                                                    </SizableText>
                                                </XStack>
                                            </YStack>
                                        </XStack>

                                        <XStack gap="$1.5" alignItems="center">
                                            <MessageSquare size={14} color="$onSurfaceVariant" />
                                            <SizableText size="$2" color="$onSurfaceVariant">댓글</SizableText>
                                            <ChevronRight size={16} color="$onSurfaceVariant" />
                                        </XStack>
                                    </XStack>
                                </YStack>
                            </XStack>
                        ))}
                    </YStack>
                )}

                {/* Footer */}
                <YStack alignItems="center" py="$6">
                    <SizableText size="$2" color="$onSurfaceVariant">
                        © 2026 - Giljabi.com
                    </SizableText>
                </YStack>
            </YStack>
        </ScrollView>
    )
}
