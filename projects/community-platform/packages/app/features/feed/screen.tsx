'use client'

import { useState } from 'react'
import { YStack, XStack, Avatar, Paragraph, Input, Button, Separator, ScrollView, H3, H4, Text, Spinner } from '@my/ui'
import { Heart, MessageCircle, MoreHorizontal, Image as ImageIcon } from '@tamagui/lucide-icons'
import { useRouter } from 'solito/navigation'
import { usePosts, useCreatePost, useToggleLike } from '../../hooks/usePosts'
import { useCurrentUserProfile } from '../../hooks/useProfiles'

export function FeedScreen() {
    const [postText, setPostText] = useState('')
    const router = useRouter()

    const { data: currentUserProfile } = useCurrentUserProfile()
    const { data: posts, isLoading } = usePosts()
    const { mutate: createPost, isPending: isCreating } = useCreatePost()
    const { mutate: toggleLike } = useToggleLike()

    const handlePost = () => {
        if (!postText.trim() || !currentUserProfile?.id) return
        createPost({ content: postText, profileId: currentUserProfile.id }, {
            onSuccess: () => setPostText('')
        })
    }

    const handleLike = (postId: string, currentLikes: { profileId: string }[]) => {
        if (!currentUserProfile?.id) return
        const hasLiked = currentLikes.some(like => like.profileId === currentUserProfile.id)
        toggleLike({ postId, hasLiked, profileId: currentUserProfile.id })
    }

    return (
        <ScrollView flex={1} bg="$backgroundLight">
            <YStack padding="$4" gap="$4" maxWidth={680} alignSelf="center" width="100%">

                {/* 포스트 작성 영역 (Compose Box) */}
                <YStack bg="$surfaceLight" p="$4" borderRadius="$4" elevation="$2" gap="$3">
                    <XStack gap="$3" alignItems="center">
                        <Avatar circular size="$4">
                            <Avatar.Image src={currentUserProfile?.avatarUrl || "https://i.pravatar.cc/150?u=me"} />
                            <Avatar.Fallback bg="$color5" />
                        </Avatar>
                        <Input
                            flex={1}
                            placeholder="What's on your mind?"
                            value={postText}
                            onChangeText={setPostText}
                            bg="$color2"
                            borderWidth={0}
                        />
                    </XStack>
                    <Separator />
                    <XStack justifyContent="space-between" alignItems="center">
                        <Button icon={<ImageIcon size={18} color="$color10" />} circular size="$3" bg="transparent" />
                        <Button
                            bg="$primaryLight"
                            size="$3"
                            disabled={!postText.trim() || isCreating || !currentUserProfile}
                            onPress={handlePost}
                        >
                            {isCreating ? <Spinner /> : 'Post Update'}
                        </Button>
                    </XStack>
                </YStack>

                {/* 포스트 리스트 영역 (Timeline) */}
                {isLoading ? (
                    <YStack padding="$4" alignItems="center">
                        <Spinner size="large" />
                    </YStack>
                ) : (
                    <YStack gap="$4">
                        {posts?.map(post => {
                            const likesCount = post.likes.length
                            const hasLiked = currentUserProfile ? post.likes.some(like => like.profileId === currentUserProfile.id) : false

                            return (
                                <YStack
                                    key={post.id}
                                    bg="$surfaceLight"
                                    p="$4"
                                    borderRadius="$4"
                                    elevation="$2"
                                    gap="$3"
                                    cursor="pointer"
                                    hoverStyle={{ bg: '$color3' }}
                                    onPress={() => router.push(`/post/${post.id}`)}
                                >
                                    <XStack justifyContent="space-between" alignItems="center">
                                        <XStack gap="$3" alignItems="center">
                                            <Avatar circular size="$4">
                                                <Avatar.Image src={post.author?.avatarUrl || "https://i.pravatar.cc/150"} />
                                                <Avatar.Fallback bg="$color5" />
                                            </Avatar>
                                            <YStack>
                                                <H4 fontWeight="bold" color="$color12" margin={0} lineHeight="$2">
                                                    {post.author?.username || 'Unknown User'}
                                                </H4>
                                                <XStack gap="$2" alignItems="center">
                                                    <Paragraph size="$2" color="$color10">
                                                        {new Date(post.createdAt).toLocaleString()}
                                                    </Paragraph>
                                                    {post.group && (
                                                        <>
                                                            <Paragraph size="$2" color="$color10">•</Paragraph>
                                                            <Paragraph size="$2" color="$primaryLight" fontWeight="bold" cursor="pointer" onPress={(e) => { e.stopPropagation(); router.push(`/groups/${post.group?.id}`); }}>
                                                                {post.group.name}
                                                            </Paragraph>
                                                        </>
                                                    )}
                                                </XStack>
                                            </YStack>
                                        </XStack>
                                        <Button icon={<MoreHorizontal size={20} color="$color10" />} size="$3" circular bg="transparent" />
                                    </XStack>

                                    <Paragraph color="$color12" mt="$2">
                                        {post.content}
                                    </Paragraph>

                                    <XStack justifyContent="space-between" mt="$2">
                                        <XStack gap="$4">
                                            <XStack gap="$1" alignItems="center" cursor="pointer" onPress={() => handleLike(post.id, post.likes)}>
                                                <Heart size={18} color={hasLiked ? "$red10" : "$color10"} fill={hasLiked ? "red" : "transparent"} />
                                                <Paragraph color="$color10" size="$2">{likesCount}</Paragraph>
                                            </XStack>
                                            <XStack gap="$1" alignItems="center" cursor="pointer">
                                                <MessageCircle size={18} color="$color10" />
                                                <Paragraph color="$color10" size="$2">0</Paragraph>
                                            </XStack>
                                        </XStack>
                                    </XStack>
                                </YStack>
                            )
                        })}
                    </YStack>
                )}
            </YStack>
        </ScrollView>
    )
}
