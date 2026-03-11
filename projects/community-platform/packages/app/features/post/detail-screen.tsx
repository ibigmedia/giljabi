'use client'

import { useState } from 'react'
import { YStack, XStack, Avatar, Paragraph, Input, Button, Separator, ScrollView, H4, Spinner, Text } from '@my/ui'
import { Heart, MessageCircle, MoreHorizontal, Send, Trash2 } from '@tamagui/lucide-icons'
import { usePost, useToggleLike } from '../../hooks/usePosts'
import { useComments, useCreateComment, useDeleteComment } from '../../hooks/useComments'
import { useCurrentUserProfile } from '../../hooks/useProfiles'

export function PostDetailScreen({ id }: { id?: string }) {
    const [commentText, setCommentText] = useState('')

    const { data: currentUserProfile } = useCurrentUserProfile()
    const { data: post, isLoading: isPostLoading } = usePost(id || '')
    const { data: comments, isLoading: isCommentsLoading } = useComments(id || '')

    const { mutate: toggleLike } = useToggleLike()
    const { mutate: createComment, isPending: isCreatingComment } = useCreateComment()
    const { mutate: deleteComment } = useDeleteComment()

    if (!id) return <Text>잘못된 접근입니다.</Text>

    if (isPostLoading) {
        return (
            <YStack flex={1} justifyContent="center" alignItems="center" bg="$backgroundBody">
                <Spinner size="large" color="$primary" />
            </YStack>
        )
    }

    if (!post) {
        return (
            <YStack flex={1} justifyContent="center" alignItems="center" bg="$backgroundBody">
                <Paragraph>게시글을 찾을 수 없습니다.</Paragraph>
            </YStack>
        )
    }

    const likesCount = post.likes.length
    const hasLiked = currentUserProfile ? post.likes.some(like => like.profileId === currentUserProfile.id) : false

    const handleLike = () => {
        if (!currentUserProfile?.id) return
        toggleLike({ postId: post.id, hasLiked, profileId: currentUserProfile.id })
    }

    const handleCreateComment = () => {
        if (!commentText.trim() || !currentUserProfile?.id) return
        createComment({ postId: post.id, content: commentText, profileId: currentUserProfile.id }, {
            onSuccess: () => setCommentText('')
        })
    }

    const handleDeleteComment = (commentId: string) => {
        if (confirm('댓글을 삭제하시겠습니까?')) {
            deleteComment(commentId)
        }
    }

    return (
        <YStack flex={1} bg="$backgroundBody">
            <ScrollView flex={1}>
                {/* 메인 게시글 영역 */}
                <YStack padding="$4" gap="$4" maxWidth={680} alignSelf="center" width="100%">
                    <YStack bg="$surface" p="$4" borderRadius="$4" elevation="$2" gap="$3">
                        <XStack justifyContent="space-between" alignItems="center">
                            <XStack gap="$3" alignItems="center">
                                <Avatar circular size="$4">
                                    <Avatar.Image width="100%" height="100%" src={post.author?.avatarUrl || "https://i.pravatar.cc/150"} />
                                    <Avatar.Fallback bg="$color5" />
                                </Avatar>
                                <YStack>
                                    <H4 fontWeight="bold" color="$color12" margin={0} lineHeight="$2">
                                        {post.author?.username || 'Unknown User'}
                                    </H4>
                                    <Paragraph size="$2" color="$color10">
                                        {new Date(post.createdAt).toLocaleString()}
                                    </Paragraph>
                                </YStack>
                            </XStack>
                            <Button icon={<MoreHorizontal size={20} color="$color10" />} size="$3" circular bg="transparent" />
                        </XStack>

                        <Paragraph color="$color12" mt="$2" size="$5">
                            {post.content}
                        </Paragraph>

                        <XStack justifyContent="space-between" mt="$2">
                            <XStack gap="$4">
                                <XStack gap="$1" alignItems="center" cursor="pointer" onPress={handleLike}>
                                    <Heart size={18} color={hasLiked ? "$red10" : "$color10"} fill={hasLiked ? "red" : "transparent"} />
                                    <Paragraph color="$color10" size="$2">{likesCount}</Paragraph>
                                </XStack>
                                <XStack gap="$1" alignItems="center">
                                    <MessageCircle size={18} color="$color10" />
                                    <Paragraph color="$color10" size="$2">{comments?.length || 0}</Paragraph>
                                </XStack>
                            </XStack>
                        </XStack>
                    </YStack>

                    <Separator borderColor="$color5" />

                    {/* 댓글 목록 영역 */}
                    <YStack gap="$4" pb="$8">
                        {isCommentsLoading ? (
                            <Spinner size="large" />
                        ) : comments?.length === 0 ? (
                            <Paragraph textAlign="center" color="$color10" py="$4">첫 번째 댓글을 남겨보세요!</Paragraph>
                        ) : (
                            comments?.map(comment => (
                                <YStack key={comment.id} bg="$color2" p="$3" borderRadius="$4" gap="$2">
                                    <XStack justifyContent="space-between" alignItems="flex-start">
                                        <XStack gap="$2" alignItems="center">
                                            <Avatar circular size="$3">
                                                <Avatar.Image width="100%" height="100%" src={comment.author?.avatarUrl || "https://i.pravatar.cc/150"} />
                                                <Avatar.Fallback bg="$color5" />
                                            </Avatar>
                                            <YStack>
                                                <XStack gap="$2" alignItems="center">
                                                    <Paragraph fontWeight="bold" size="$3" color="$color12">
                                                        {comment.author?.username || 'Unknown'}
                                                    </Paragraph>
                                                    <Paragraph size="$2" color="$color10">
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </Paragraph>
                                                </XStack>
                                                <Paragraph color="$color12" mt="$1">{comment.content}</Paragraph>
                                            </YStack>
                                        </XStack>

                                        {currentUserProfile?.id === comment.authorId && (
                                            <Button
                                                icon={<Trash2 size={16} color="$red10" />}
                                                size="$2"
                                                circular
                                                bg="transparent"
                                                onPress={() => handleDeleteComment(comment.id)}
                                            />
                                        )}
                                    </XStack>
                                </YStack>
                            ))
                        )}
                    </YStack>
                </YStack>
            </ScrollView>

            {/* 댓글 입력 폼 */}
            <YStack bg="$surface" p="$4" borderTopWidth={1} borderTopColor="$color5">
                <YStack maxWidth={680} alignSelf="center" width="100%">
                    <XStack gap="$2" alignItems="center">
                        <Avatar circular size="$3">
                            <Avatar.Image width="100%" height="100%" src={currentUserProfile?.avatarUrl || "https://i.pravatar.cc/150"} />
                            <Avatar.Fallback bg="$color5" />
                        </Avatar>
                        <Input
                            flex={1}
                            placeholder="댓글을 입력하세요..."
                            value={commentText}
                            onChangeText={setCommentText}
                            bg="$color2"
                            borderWidth={0}
                            size="$3"
                        />
                        <Button
                            bg="$primary"
                            size="$3"
                            circular
                            icon={<Send size={16} color="white" />}
                            disabled={!commentText.trim() || isCreatingComment || !currentUserProfile}
                            onPress={handleCreateComment}
                        />
                    </XStack>
                </YStack>
            </YStack>
        </YStack>
    )
}
