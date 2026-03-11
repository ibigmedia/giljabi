'use client'

import React from 'react'
import { YStack, XStack, ScrollView, Paragraph, Avatar, SizableText, Anchor } from '@my/ui'
import { ArrowLeft, Edit3, Save, X, Clock, Image } from '@tamagui/lucide-icons'
import { useRouter } from 'solito/navigation'
import { useBlogPost, useUpdateBlogPost } from '../../hooks/useBlogs'
import { useCurrentUserProfile } from '../../hooks/useProfiles'
import { useState, useEffect } from 'react'
import { Button, Input, Spinner } from 'tamagui'

const renderTextWithLinks = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, i) => {
        if (part.match(urlRegex)) {
            return (
                <Anchor href={part} target="_blank" key={i} color="$primary" textDecorationLine="underline" cursor="pointer">
                    {part}
                </Anchor>
            );
        }
        return part;
    });
};

export function BlogDetailScreen({ id }: { id: string }) {
    const router = useRouter()
    const { data: post, isLoading } = useBlogPost(id)
    const { mutate: updatePost, isPending: isUpdating } = useUpdateBlogPost()
    const { data: currentUserProfile } = useCurrentUserProfile()

    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState('')
    const [editContent, setEditContent] = useState('')

    useEffect(() => {
        if (post) {
            setEditTitle(post.title)
            setEditContent(post.content)
        }
    }, [post])

    if (isLoading) {
        return (
            <YStack flex={1} alignItems="center" justifyContent="center" bg="$backgroundBody">
                <Spinner size="large" color="$primary" />
            </YStack>
        )
    }

    if (!post) {
        return (
            <YStack flex={1} alignItems="center" justifyContent="center" bg="$backgroundBody" gap="$3">
                <SizableText color="$onSurface" size="$5">포스트를 찾을 수 없습니다.</SizableText>
                <Button bg="$primaryContainer" borderRadius="$full" onPress={() => router.back()}>
                    <SizableText color="$onPrimaryContainer" fontWeight="600">뒤로 가기</SizableText>
                </Button>
            </YStack>
        )
    }

    const canEdit = currentUserProfile?.id === post.authorId || currentUserProfile?.role === 'ADMIN' || currentUserProfile?.role === 'EDITOR'

    const handleSave = () => {
        if (!editTitle.trim() || !editContent.trim()) return
        updatePost({ id, title: editTitle, content: editContent }, {
            onSuccess: () => {
                setIsEditing(false)
            }
        })
    }

    return (
        <ScrollView flex={1} bg="$backgroundBody">
            <YStack maxWidth={760} alignSelf="center" width="100%" px="$4" py="$6" gap="$6">
                {/* Back Button */}
                <XStack
                    cursor="pointer"
                    onPress={() => router.back()}
                    alignItems="center"
                    gap="$2"
                    hoverStyle={{ opacity: 0.8 }}
                    alignSelf="flex-start"
                    bg="$surfaceContainerLow"
                    px="$3"
                    py="$2"
                    borderRadius="$full"
                >
                    <ArrowLeft size={18} color="$onSurfaceVariant" />
                    <SizableText color="$onSurfaceVariant" fontWeight="600" size="$3">목록으로</SizableText>
                </XStack>

                {/* Article Card */}
                <YStack bg="$surface" borderRadius="$xl" elevation="$1" overflow="hidden">
                    {/* Hero Image */}
                    {post.mediaUrl && (
                        <YStack width="100%" height={360}>
                            {/* @ts-ignore */}
                            <img
                                src={post.mediaUrl}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </YStack>
                    )}

                    <YStack p="$6" gap="$5">
                        {/* Title & Edit */}
                        {isEditing ? (
                            <YStack gap="$4">
                                <XStack justifyContent="space-between" alignItems="center">
                                    <SizableText color="$onSurface" size="$6" fontWeight="700">블로그 편집</SizableText>
                                    <XStack gap="$2">
                                        <Button
                                            size="$3"
                                            bg="$surfaceContainerHigh"
                                            borderRadius="$full"
                                            icon={<X size={16} color="$onSurfaceVariant" />}
                                            onPress={() => setIsEditing(false)}
                                        >
                                            <SizableText color="$onSurfaceVariant">취소</SizableText>
                                        </Button>
                                        <Button
                                            size="$3"
                                            bg="$primary"
                                            borderRadius="$full"
                                            icon={isUpdating ? <Spinner size="small" color="white" /> : <Save size={16} color="white" />}
                                            onPress={handleSave}
                                        >
                                            <SizableText color="white" fontWeight="600">저장</SizableText>
                                        </Button>
                                    </XStack>
                                </XStack>
                                <Input
                                    size="$5"
                                    value={editTitle}
                                    onChangeText={setEditTitle}
                                    fontWeight="bold"
                                    placeholder="제목"
                                    borderRadius="$md"
                                />
                                <Input
                                    size="$4"
                                    value={editContent}
                                    onChangeText={setEditContent}
                                    multiline
                                    numberOfLines={12}
                                    placeholder="본문 내용"
                                    borderRadius="$md"
                                />
                            </YStack>
                        ) : (
                            <>
                                <XStack justifyContent="space-between" alignItems="flex-start">
                                    <SizableText
                                        color="$onSurface"
                                        flex={1}
                                        size="$9"
                                        fontWeight="800"
                                        lineHeight={42}
                                    >
                                        {post.title}
                                    </SizableText>
                                    {canEdit && (
                                        <Button
                                            size="$3"
                                            bg="$surfaceContainerLow"
                                            borderRadius="$full"
                                            icon={<Edit3 size={16} color="$onSurfaceVariant" />}
                                            onPress={() => setIsEditing(true)}
                                            hoverStyle={{ bg: '$surfaceContainerHigh' }}
                                        >
                                            <SizableText color="$onSurfaceVariant" fontWeight="600">편집</SizableText>
                                        </Button>
                                    )}
                                </XStack>

                                {/* Author & Date */}
                                <XStack gap="$3" alignItems="center" pb="$4" borderBottomWidth={1} borderColor="$outlineVariant">
                                    <Avatar circular size="$4" bg="$primaryContainer">
                                        <Avatar.Image width="100%" height="100%" src={post.author?.avatarUrl || "https://i.pravatar.cc/150"} />
                                        <Avatar.Fallback bg="$primaryContainer" />
                                    </Avatar>
                                    <YStack>
                                        <SizableText size="$4" fontWeight="600" color="$onSurface">
                                            {post.author?.username || '알 수 없음'}
                                        </SizableText>
                                        <XStack gap="$1.5" alignItems="center">
                                            <Clock size={13} color="$onSurfaceVariant" />
                                            <SizableText size="$2" color="$onSurfaceVariant">
                                                {new Date(post.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </SizableText>
                                        </XStack>
                                    </YStack>
                                </XStack>

                                {/* Article Body */}
                                <Paragraph color="$onSurface" size="$5" lineHeight={32} letterSpacing={0.2}>
                                    {renderTextWithLinks(post.content)}
                                </Paragraph>
                            </>
                        )}
                    </YStack>
                </YStack>

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
