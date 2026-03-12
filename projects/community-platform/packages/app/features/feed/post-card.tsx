import { useState } from 'react'
import { YStack, XStack, Avatar, Paragraph, Button, Separator, Input, Spinner, Anchor, Image, SizableText } from '@my/ui'
import { Heart, MessageCircle, MoreHorizontal, Send, Share2, Pin } from '@tamagui/lucide-icons'
import { useRouter } from 'solito/navigation'
import { useToggleLike, Post } from '../../hooks/usePosts'
import { useComments, useCreateComment } from '../../hooks/useComments'
import { Profile } from '../../hooks/useProfiles'
import { PostLinkPreviews } from './link-preview'

const renderTextWithLinks = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, i) => {
        if (part.match(urlRegex)) {
            return (
                <Anchor href={part} target="_blank" key={i} color="$primary" textDecorationLine="underline" cursor="pointer" onPress={(e) => e.stopPropagation()}>
                    {part}
                </Anchor>
            );
        }
        return part;
    });
};

export function PostCard({ post, currentUserProfile }: { post: Post; currentUserProfile: Profile | null | undefined }) {
    const router = useRouter()
    const { mutate: toggleLike } = useToggleLike()

    const [showComments, setShowComments] = useState(false)
    const [commentText, setCommentText] = useState('')

    const { data: comments, isLoading: isCommentsLoading } = useComments(post.id)
    const { mutate: createComment, isPending: isCreatingComment } = useCreateComment()

    const likesCount = post.likes?.length || 0
    const commentsCount = post.comments?.length || 0
    const hasLiked = currentUserProfile ? post.likes?.some((like) => like.profileId === currentUserProfile.id) : false

    const handleLike = () => {
        if (!currentUserProfile?.id) return
        toggleLike({ postId: post.id, hasLiked, profileId: currentUserProfile.id })
    }

    const handleCreateComment = () => {
        if (!commentText.trim() || !currentUserProfile?.id) return
        createComment({ postId: post.id, content: commentText, profileId: currentUserProfile.id, authorName: currentUserProfile.username }, {
            onSuccess: () => setCommentText('')
        })
    }

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime()
        const minutes = Math.floor(diff / 60000)
        if (minutes < 60) return `${minutes}분 전`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}시간 전`
        const days = Math.floor(hours / 24)
        if (days < 7) return `${days}일 전`
        return new Date(dateStr).toLocaleDateString('ko-KR')
    }

    return (
        <YStack
            bg="$surface"
            borderRadius="$card"
            elevation="$0.5"
            overflow="hidden"
            borderWidth={post.isPinned ? 2 : 0}
            borderColor={post.isPinned ? '$orange8' : undefined}
        >
            {/* Pinned notice banner */}
            {post.isPinned && (
                <XStack bg="$orange3" px="$4" py="$2" gap="$2" alignItems="center">
                    <Pin size={14} color="$orange10" />
                    <SizableText size="$2" color="$orange10" fontWeight="700">공지글</SizableText>
                </XStack>
            )}

            {/* Header */}
            <XStack justifyContent="space-between" alignItems="center" p="$4" pb="$2">
                <XStack gap="$3" alignItems="center" flex={1} cursor="pointer" onPress={() => router.push(`/post/${post.id}`)}>
                    <Avatar circular size="$4" bg="$primaryContainer">
                        <Avatar.Image width="100%" height="100%" src={post.author?.avatarUrl || "https://i.pravatar.cc/150"} />
                        <Avatar.Fallback bg="$primaryContainer" />
                    </Avatar>
                    <YStack flex={1}>
                        <SizableText fontWeight="700" color="$onSurface" fontSize={15}>
                            {post.author?.username || '알 수 없는 사용자'}
                        </SizableText>
                        <XStack gap="$2" alignItems="center">
                            <SizableText size="$2" color="$onSurfaceVariant">
                                {timeAgo(post.createdAt)}
                            </SizableText>
                            {post.group && (
                                <>
                                    <SizableText size="$2" color="$onSurfaceVariant">·</SizableText>
                                    <SizableText
                                        size="$2"
                                        color="$primary"
                                        fontWeight="600"
                                        cursor="pointer"
                                        onPress={(e) => { e.stopPropagation(); router.push(`/groups/${post.group?.id}`); }}
                                    >
                                        {post.group.name}
                                    </SizableText>
                                </>
                            )}
                        </XStack>
                    </YStack>
                </XStack>
                <Button
                    icon={<MoreHorizontal size={20} color="$onSurfaceVariant" />}
                    size="$3"
                    circular
                    bg="transparent"
                    hoverStyle={{ bg: '$surfaceContainerHigh' }}
                />
            </XStack>

            {/* Content */}
            <YStack px="$4" pb="$3" cursor="pointer" onPress={() => router.push(`/post/${post.id}`)}>
                <Paragraph color="$onSurface" fontSize={15} lineHeight={24}>
                    {renderTextWithLinks(post.content)}
                </Paragraph>
            </YStack>

            {/* Link Previews from content text + mediaUrl field */}
            <YStack px="$4" pb="$1">
                <PostLinkPreviews content={post.content} mediaUrl={post.mediaUrl} />
            </YStack>

            {/* Media (only render as image if it looks like an image URL, not a link preview) */}
            {post.mediaUrl && /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(post.mediaUrl) && (
                <YStack cursor="pointer" onPress={() => router.push(`/post/${post.id}`)}>
                    <Image source={{ uri: post.mediaUrl }} width="100%" height={320} objectFit="cover" />
                </YStack>
            )}

            {/* Like/Comment Count Bar */}
            {(likesCount > 0 || commentsCount > 0) && (
                <XStack px="$4" py="$2" justifyContent="space-between">
                    {likesCount > 0 && (
                        <SizableText size="$2" color="$onSurfaceVariant">
                            좋아요 {likesCount}개
                        </SizableText>
                    )}
                    {commentsCount > 0 && (
                        <SizableText size="$2" color="$onSurfaceVariant" cursor="pointer" onPress={() => setShowComments(!showComments)}>
                            댓글 {commentsCount}개
                        </SizableText>
                    )}
                </XStack>
            )}

            <Separator borderColor="$outlineVariant" opacity={0.3} mx="$4" />

            {/* Action Buttons - M3 Tonal Style */}
            <XStack px="$2" py="$1" justifyContent="space-around">
                <Button
                    flex={1}
                    bg="transparent"
                    hoverStyle={{ bg: hasLiked ? '$primaryContainer' : '$surfaceContainerHigh' }}
                    borderRadius="$sm"
                    gap="$2"
                    onPress={(e) => { e.stopPropagation(); handleLike(); }}
                    icon={<Heart size={20} color={hasLiked ? "$primary" : "$onSurfaceVariant"} fill={hasLiked ? "var(--color-primary)" : "transparent"} />}
                >
                    <SizableText color={hasLiked ? "$primary" : "$onSurfaceVariant"} size="$3" fontWeight={hasLiked ? "700" : "500"}>
                        좋아요
                    </SizableText>
                </Button>
                <Button
                    flex={1}
                    bg="transparent"
                    hoverStyle={{ bg: '$surfaceContainerHigh' }}
                    borderRadius="$sm"
                    gap="$2"
                    onPress={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
                    icon={<MessageCircle size={20} color="$onSurfaceVariant" />}
                >
                    <SizableText color="$onSurfaceVariant" size="$3" fontWeight="500">댓글</SizableText>
                </Button>
                <Button
                    flex={1}
                    bg="transparent"
                    hoverStyle={{ bg: '$surfaceContainerHigh' }}
                    borderRadius="$sm"
                    gap="$2"
                    icon={<Share2 size={20} color="$onSurfaceVariant" />}
                >
                    <SizableText color="$onSurfaceVariant" size="$3" fontWeight="500">공유</SizableText>
                </Button>
            </XStack>

            {/* Inline Comments */}
            {showComments && (
                <YStack px="$4" pb="$4" pt="$2" borderTopWidth={1} borderColor="$outlineVariant" borderTopColor="$outlineVariant" gap="$3" bg="$surfaceContainerLowest">
                    {/* Comment List */}
                    <YStack gap="$3">
                        {isCommentsLoading ? (
                            <Spinner size="small" color="$primary" />
                        ) : (
                            comments?.map(comment => (
                                <XStack key={comment.id} gap="$2.5" alignItems="flex-start">
                                    <Avatar circular size="$2.5" bg="$primaryContainer">
                                        <Avatar.Image width="100%" height="100%" src={comment.author?.avatarUrl || "https://i.pravatar.cc/150"} />
                                        <Avatar.Fallback bg="$primaryContainer" />
                                    </Avatar>
                                    <YStack flex={1} bg="$surfaceContainerLow" p="$3" borderRadius="$lg">
                                        <XStack gap="$2" alignItems="baseline">
                                            <SizableText fontWeight="700" size="$3" color="$onSurface">{comment.author?.username || '알 수 없음'}</SizableText>
                                            <SizableText size="$1" color="$onSurfaceVariant">{timeAgo(comment.createdAt)}</SizableText>
                                        </XStack>
                                        <Paragraph size="$3" color="$onSurface" mt="$1" lineHeight={20}>{renderTextWithLinks(comment.content)}</Paragraph>
                                    </YStack>
                                </XStack>
                            ))
                        )}
                    </YStack>

                    {/* Comment Input */}
                    <XStack gap="$2" alignItems="center">
                        <Avatar circular size="$2.5" bg="$primaryContainer">
                            <Avatar.Image width="100%" height="100%" src={currentUserProfile?.avatarUrl || "https://i.pravatar.cc/150"} />
                            <Avatar.Fallback bg="$primaryContainer" />
                        </Avatar>
                        <Input
                            flex={1}
                            placeholder="댓글을 작성해 주세요..."
                            value={commentText}
                            onChangeText={setCommentText}
                            bg="$surfaceContainerLow"
                            borderWidth={0}
                            borderRadius="$button"
                            size="$3"
                            color="$onSurface"
                            placeholderTextColor="$onSurfaceVariant"
                        />
                        <Button
                            bg="$primary"
                            size="$3"
                            circular
                            disabled={!commentText.trim() || isCreatingComment || !currentUserProfile}
                            opacity={(!commentText.trim() || isCreatingComment || !currentUserProfile) ? 0.4 : 1}
                            icon={<Send size={16} color="white" />}
                            onPress={handleCreateComment}
                        />
                    </XStack>
                </YStack>
            )}
        </YStack>
    )
}
