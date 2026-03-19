'use client'

import React from 'react'
import { YStack, XStack, ScrollView, Paragraph, Avatar, SizableText, Spinner } from '@my/ui'
import { Clock, ChevronRight, BookOpen } from '@tamagui/lucide-icons'
import { useRouter } from 'solito/navigation'
import { useBlogPosts } from '../../hooks/useBlogs'

export function BlogScreen() {
    const router = useRouter()
    const { data: posts, isLoading } = useBlogPosts()

    const publishedPosts = posts?.filter(p => p.isPublished) || []
    const featuredPost = publishedPosts[0]
    const remainingPosts = publishedPosts.slice(1)

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })

    const readingTime = (content: string) => Math.max(1, Math.ceil(content.length / 500))

    return (
        <ScrollView flex={1} bg="$backgroundBody">
            <YStack maxWidth={960} alignSelf="center" width="100%" px="$4" py="$6" gap="$6">
                {/* Header */}
                <YStack gap="$2">
                    <SizableText size="$8" fontWeight="800" color="$onSurface">블로그</SizableText>
                    <SizableText size="$4" color="$onSurfaceVariant">
                        길잡이의 이야기와 사역 소식을 전합니다
                    </SizableText>
                </YStack>

                {isLoading ? (
                    <YStack padding="$10" alignItems="center">
                        <Spinner size="large" color="$primary" />
                    </YStack>
                ) : publishedPosts.length === 0 ? (
                    <YStack bg="$surface" p="$10" borderRadius="$card" borderWidth={1} borderColor="$outlineVariant" alignItems="center" gap="$3">
                        <BookOpen size={40} color="$onSurfaceVariant" />
                        <SizableText color="$onSurfaceVariant" size="$4">아직 작성된 블로그 글이 없습니다.</SizableText>
                    </YStack>
                ) : (
                    <YStack gap="$5">
                        {/* Featured Post (first post - large card) */}
                        {featuredPost && (
                            <YStack
                                bg="$surface"
                                borderRadius="$container"
                                borderWidth={1}
                                borderColor="$outlineVariant"
                                overflow="hidden"
                                cursor="pointer"
                                hoverStyle={{ borderColor: '$primary' }}
                                onPress={() => router.push(`/blog/${featuredPost.id}`)}
                            >
                                {featuredPost.mediaUrl && (
                                    <YStack width="100%" height={280} $sm={{ height: 180 }}>
                                        {/* @ts-ignore */}
                                        <img
                                            src={featuredPost.mediaUrl}
                                            alt=""
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </YStack>
                                )}
                                <YStack p="$5" gap="$3" $sm={{ p: '$4' }}>
                                    <SizableText
                                        color="$onSurface"
                                        size="$8"
                                        fontWeight="800"
                                        lineHeight={36}
                                        $sm={{ size: '$7' }}
                                    >
                                        {featuredPost.title}
                                    </SizableText>
                                    <Paragraph
                                        color="$onSurfaceVariant"
                                        size="$4"
                                        lineHeight={24}
                                        numberOfLines={3}
                                    >
                                        {featuredPost.excerpt || featuredPost.content.slice(0, 200)}
                                    </Paragraph>

                                    <XStack alignItems="center" gap="$3" mt="$1">
                                        <Avatar circular size="$3" bg="$primaryContainer">
                                            <Avatar.Image width="100%" height="100%" src={featuredPost.author?.avatarUrl || undefined} />
                                            <Avatar.Fallback bg="$primaryContainer">
                                                <SizableText size="$1" color="$primary" fontWeight="700">
                                                    {featuredPost.author?.username?.charAt(0)?.toUpperCase() || '?'}
                                                </SizableText>
                                            </Avatar.Fallback>
                                        </Avatar>
                                        <SizableText size="$3" fontWeight="600" color="$onSurface">
                                            {featuredPost.author?.username || '알 수 없음'}
                                        </SizableText>
                                        <SizableText size="$2" color="$onSurfaceVariant">·</SizableText>
                                        <SizableText size="$2" color="$onSurfaceVariant">
                                            {formatDate(featuredPost.createdAt)}
                                        </SizableText>
                                        <SizableText size="$2" color="$onSurfaceVariant">·</SizableText>
                                        <XStack gap="$1" alignItems="center">
                                            <Clock size={12} color="$onSurfaceVariant" />
                                            <SizableText size="$2" color="$onSurfaceVariant">
                                                {readingTime(featuredPost.content)}분
                                            </SizableText>
                                        </XStack>
                                    </XStack>
                                </YStack>
                            </YStack>
                        )}

                        {/* Remaining Posts - 2 column grid on desktop, 1 column on mobile */}
                        {remainingPosts.length > 0 && (
                            <XStack flexWrap="wrap" gap="$4">
                                {remainingPosts.map((post) => (
                                    <YStack
                                        key={post.id}
                                        bg="$surface"
                                        borderRadius="$card"
                                        borderWidth={1}
                                        borderColor="$outlineVariant"
                                        overflow="hidden"
                                        cursor="pointer"
                                        hoverStyle={{ borderColor: '$primary' }}
                                        onPress={() => router.push(`/blog/${post.id}`)}
                                        width="100%"
                                        $md={{ width: '48%' }}
                                    >
                                        {post.mediaUrl && (
                                            <YStack width="100%" height={160}>
                                                {/* @ts-ignore */}
                                                <img
                                                    src={post.mediaUrl}
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </YStack>
                                        )}
                                        <YStack p="$4" gap="$2.5" flex={1}>
                                            <SizableText
                                                color="$onSurface"
                                                size="$6"
                                                fontWeight="700"
                                                lineHeight={26}
                                                numberOfLines={2}
                                            >
                                                {post.title}
                                            </SizableText>
                                            <Paragraph
                                                color="$onSurfaceVariant"
                                                size="$3"
                                                lineHeight={20}
                                                numberOfLines={2}
                                            >
                                                {post.excerpt || post.content.slice(0, 100)}
                                            </Paragraph>

                                            <XStack alignItems="center" gap="$2" mt="auto" pt="$2">
                                                <Avatar circular size="$2.5" bg="$primaryContainer">
                                                    <Avatar.Image width="100%" height="100%" src={post.author?.avatarUrl || undefined} />
                                                    <Avatar.Fallback bg="$primaryContainer">
                                                        <SizableText size="$1" color="$primary" fontWeight="700">
                                                            {post.author?.username?.charAt(0)?.toUpperCase() || '?'}
                                                        </SizableText>
                                                    </Avatar.Fallback>
                                                </Avatar>
                                                <SizableText size="$2" fontWeight="600" color="$onSurface">
                                                    {post.author?.username || '알 수 없음'}
                                                </SizableText>
                                                <YStack flex={1} />
                                                <XStack gap="$1" alignItems="center">
                                                    <Clock size={11} color="$onSurfaceVariant" />
                                                    <SizableText size="$1" color="$onSurfaceVariant">
                                                        {formatDate(post.createdAt)}
                                                    </SizableText>
                                                </XStack>
                                            </XStack>
                                        </YStack>
                                    </YStack>
                                ))}
                            </XStack>
                        )}
                    </YStack>
                )}
            </YStack>
        </ScrollView>
    )
}
