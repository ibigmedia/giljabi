'use client'

import { useState } from 'react'
import { YStack, XStack, SizableText, Button, Input, Separator, Spinner, Avatar, Paragraph } from '@my/ui'
import { Pin, Trash2, Heart, MessageCircle, Eye, Search, Plus, ChevronDown, ChevronUp, Link2, X } from '@tamagui/lucide-icons'
import { usePosts, useDeletePost, useTogglePin, useCreateNotice } from '../../hooks/usePosts'
import { useCurrentUserProfile } from '../../hooks/useProfiles'
import { useRouter } from 'solito/navigation'
import { extractUrls, PostLinkPreviews } from '../feed/link-preview'

export function AdminPostsScreen() {
    const router = useRouter()
    const { data: posts, isLoading } = usePosts()
    const { data: currentUser } = useCurrentUserProfile()
    const { mutate: deletePost } = useDeletePost()
    const { mutate: togglePin } = useTogglePin()
    const { mutate: createNotice, isPending: isCreatingNotice } = useCreateNotice()

    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'pinned' | 'normal'>('all')
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [showNoticeForm, setShowNoticeForm] = useState(false)
    const [noticeText, setNoticeText] = useState('')

    // Sort: pinned first (most recent pinned at top), then normal by date
    const sortedPosts = [...(posts || [])].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    const filteredPosts = sortedPosts.filter(p => {
        if (filter === 'pinned' && !p.isPinned) return false
        if (filter === 'normal' && p.isPinned) return false
        if (search) {
            const q = search.toLowerCase()
            return p.content.toLowerCase().includes(q) ||
                p.author?.username?.toLowerCase().includes(q)
        }
        return true
    })

    const totalLikes = posts?.reduce((sum, p) => sum + (p.likes?.length || 0), 0) || 0
    const totalComments = posts?.reduce((sum, p) => sum + (p.comments?.length || 0), 0) || 0
    const pinnedCount = posts?.filter(p => p.isPinned).length || 0

    const handleDelete = (id: string) => {
        if (deleteConfirm === id) {
            deletePost(id)
            setDeleteConfirm(null)
        } else {
            setDeleteConfirm(id)
            setTimeout(() => setDeleteConfirm(null), 3000)
        }
    }

    const handleCreateNotice = () => {
        if (!noticeText.trim() || !currentUser?.id) return
        createNotice({ content: noticeText, profileId: currentUser.id }, {
            onSuccess: () => { setNoticeText(''); setShowNoticeForm(false) }
        })
    }

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime()
        const minutes = Math.floor(diff / 60000)
        if (minutes < 60) return `${minutes}분 전`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}시간 전`
        const days = Math.floor(hours / 24)
        if (days < 30) return `${days}일 전`
        return new Date(dateStr).toLocaleDateString('ko-KR')
    }

    return (
        <YStack gap="$5" flex={1}>
            {/* Header */}
            <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
                <YStack>
                    <SizableText size="$7" fontWeight="800" color="$textMain">포스트 관리</SizableText>
                    <SizableText size="$3" color="$textMuted">
                        총 {posts?.length || 0}개 · 공지 {pinnedCount}개
                    </SizableText>
                </YStack>
                <Button
                    bg="$primary"
                    borderRadius="$button"
                    icon={<Plus size={16} color="white" />}
                    onPress={() => setShowNoticeForm(!showNoticeForm)}
                >
                    <SizableText color="white" fontWeight="600">공지 작성</SizableText>
                </Button>
            </XStack>

            {/* Stats Row */}
            <XStack gap="$3" flexWrap="wrap">
                {([
                    { label: '전체 포스트', value: posts?.length || 0, color: '$primary' as const },
                    { label: '공지글', value: pinnedCount, color: '$orange10' as const },
                    { label: '총 좋아요', value: totalLikes, color: '$red10' as const },
                    { label: '총 댓글', value: totalComments, color: '$blue10' as const },
                ]).map(stat => (
                    <YStack key={stat.label} flex={1} minWidth={140} bg="$surface" p="$4" borderRadius="$card" borderWidth={1} borderColor="$borderLight" gap="$1">
                        <SizableText size="$2" color="$textMuted" fontWeight="600">{stat.label}</SizableText>
                        <SizableText size="$7" fontWeight="800" color={stat.color}>{stat.value}</SizableText>
                    </YStack>
                ))}
            </XStack>

            {/* Notice Create Form */}
            {showNoticeForm && (
                <YStack bg="$surface" p="$5" borderRadius="$card" borderWidth={2} borderColor="$orange10" gap="$3">
                    <XStack gap="$2" alignItems="center">
                        <Pin size={16} color="$orange10" />
                        <SizableText size="$4" fontWeight="700" color="$textMain">새 공지글 작성</SizableText>
                    </XStack>
                    <Input
                        placeholder="공지 내용을 입력하세요..."
                        value={noticeText}
                        onChangeText={setNoticeText}
                        bg="$surfaceContainerLow"
                        borderWidth={1}
                        borderColor="$borderLight"
                        multiline
                        numberOfLines={3}
                    />
                    <XStack gap="$3" justifyContent="flex-end">
                        <Button size="$3" bg="$surfaceContainerLow" onPress={() => setShowNoticeForm(false)}>
                            <SizableText color="$textMuted">취소</SizableText>
                        </Button>
                        <Button size="$3" bg="$orange10" onPress={handleCreateNotice} disabled={isCreatingNotice || !noticeText.trim()}>
                            {isCreatingNotice ? <Spinner size="small" color="white" /> : <SizableText color="white" fontWeight="600">공지 게시</SizableText>}
                        </Button>
                    </XStack>
                </YStack>
            )}

            {/* Search & Filter */}
            <XStack gap="$3" alignItems="center" flexWrap="wrap">
                <XStack flex={1} minWidth={200} bg="$surface" borderRadius="$button" borderWidth={1} borderColor="$borderLight" alignItems="center" px="$3">
                    <Search size={16} color="$textMuted" />
                    <Input
                        flex={1}
                        placeholder="포스트 또는 작성자 검색..."
                        value={search}
                        onChangeText={setSearch}
                        bg="transparent"
                        borderWidth={0}
                        size="$3"
                    />
                    {search && (
                        <Button size="$2" circular bg="transparent" icon={<X size={14} color="$textMuted" />} onPress={() => setSearch('')} />
                    )}
                </XStack>
                {(['all', 'pinned', 'normal'] as const).map(f => (
                    <Button
                        key={f}
                        size="$3"
                        bg={filter === f ? '$primary' : '$surface'}
                        borderWidth={1}
                        borderColor={filter === f ? '$primary' : '$borderLight'}
                        borderRadius="$button"
                        onPress={() => setFilter(f)}
                    >
                        <SizableText color={filter === f ? 'white' : '$textMain'} size="$3" fontWeight="600">
                            {f === 'all' ? '전체' : f === 'pinned' ? '공지만' : '일반만'}
                        </SizableText>
                    </Button>
                ))}
            </XStack>

            {/* Posts List */}
            {isLoading ? (
                <YStack p="$8" alignItems="center"><Spinner size="large" color="$primary" /></YStack>
            ) : filteredPosts.length === 0 ? (
                <YStack bg="$surface" p="$8" borderRadius="$card" alignItems="center">
                    <SizableText color="$textMuted" size="$4">포스트가 없습니다</SizableText>
                </YStack>
            ) : (
                <YStack gap="$2">
                    {filteredPosts.map(post => {
                        const isExpanded = expandedId === post.id
                        const likesCount = post.likes?.length || 0
                        const commentsCount = post.comments?.length || 0
                        const urls = extractUrls(post.content)
                        const hasLinks = urls.length > 0 || (post.mediaUrl && !(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(post.mediaUrl)))

                        return (
                            <YStack
                                key={post.id}
                                bg="$surface"
                                borderRadius="$card"
                                borderWidth={post.isPinned ? 2 : 1}
                                borderColor={post.isPinned ? '$orange10' : '$borderLight'}
                                overflow="hidden"
                            >
                                {/* Post Row */}
                                <XStack
                                    p="$4"
                                    gap="$3"
                                    alignItems="center"
                                    cursor="pointer"
                                    hoverStyle={{ bg: '$surfaceHover' }}
                                    onPress={() => setExpandedId(isExpanded ? null : post.id)}
                                >
                                    {/* Pin badge */}
                                    {post.isPinned && (
                                        <YStack bg="$orange3" borderRadius="$2" px="$2" py="$1">
                                            <XStack gap="$1" alignItems="center">
                                                <Pin size={12} color="$orange10" />
                                                <SizableText size="$1" color="$orange10" fontWeight="700">공지</SizableText>
                                            </XStack>
                                        </YStack>
                                    )}

                                    {/* Author avatar */}
                                    <Avatar circular size="$3.5" bg="$primaryContainer">
                                        <Avatar.Image width="100%" height="100%" src={post.author?.avatarUrl || `https://i.pravatar.cc/100?u=${post.authorId}`} />
                                        <Avatar.Fallback bg="$primaryContainer" />
                                    </Avatar>

                                    {/* Content preview */}
                                    <YStack flex={1} gap="$1">
                                        <SizableText size="$3" fontWeight="600" color="$textMain" numberOfLines={1}>
                                            {post.content}
                                        </SizableText>
                                        <XStack gap="$3" alignItems="center">
                                            <SizableText size="$2" color="$textMuted">{post.author?.username || '알 수 없음'}</SizableText>
                                            <SizableText size="$2" color="$textMuted">{timeAgo(post.createdAt)}</SizableText>
                                            {hasLinks && <Link2 size={12} color="$blue10" />}
                                        </XStack>
                                    </YStack>

                                    {/* Quick stats */}
                                    <XStack gap="$3" alignItems="center">
                                        <XStack gap="$1" alignItems="center">
                                            <Heart size={14} color={likesCount > 0 ? '$red10' : '$textMuted'} fill={likesCount > 0 ? 'var(--color-red10)' : 'transparent'} />
                                            <SizableText size="$2" color="$textMuted">{likesCount}</SizableText>
                                        </XStack>
                                        <XStack gap="$1" alignItems="center">
                                            <MessageCircle size={14} color={commentsCount > 0 ? '$blue10' : '$textMuted'} />
                                            <SizableText size="$2" color="$textMuted">{commentsCount}</SizableText>
                                        </XStack>
                                    </XStack>

                                    {isExpanded ? <ChevronUp size={16} color="$textMuted" /> : <ChevronDown size={16} color="$textMuted" />}
                                </XStack>

                                {/* Expanded Detail */}
                                {isExpanded && (
                                    <YStack borderTopWidth={1} borderColor="$borderLight">
                                        {/* Full content */}
                                        <YStack p="$4" bg="$surfaceContainerLowest">
                                            <Paragraph color="$textMain" fontSize={14} lineHeight={22}>
                                                {post.content}
                                            </Paragraph>

                                            {/* Link previews + YouTube embeds (compact) */}
                                            <YStack mt="$2" maxWidth={480}>
                                                <PostLinkPreviews content={post.content} mediaUrl={post.mediaUrl} />
                                            </YStack>

                                            {/* Image media */}
                                            {post.mediaUrl && /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(post.mediaUrl) && (
                                                <YStack mt="$2">
                                                    {/* @ts-ignore */}
                                                    <img src={post.mediaUrl} alt="" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, objectFit: 'cover' }} />
                                                </YStack>
                                            )}
                                        </YStack>

                                        {/* Actions bar */}
                                        <XStack p="$3" gap="$2" borderTopWidth={1} borderColor="$borderLight" flexWrap="wrap">
                                            {/* Pin/Unpin */}
                                            <Button
                                                size="$3"
                                                bg={post.isPinned ? '$orange3' : '$surfaceContainerLow'}
                                                borderWidth={1}
                                                borderColor={post.isPinned ? '$orange10' : '$borderLight'}
                                                icon={<Pin size={14} color={post.isPinned ? '$orange10' : '$textMuted'} />}
                                                onPress={() => togglePin({ postId: post.id, isPinned: !post.isPinned })}
                                            >
                                                <SizableText size="$3" color={post.isPinned ? '$orange10' : '$textMuted'} fontWeight="600">
                                                    {post.isPinned ? '고정 해제' : '상단 고정'}
                                                </SizableText>
                                            </Button>

                                            {/* View post */}
                                            <Button
                                                size="$3"
                                                bg="$surfaceContainerLow"
                                                icon={<Eye size={14} color="$primary" />}
                                                onPress={() => router.push(`/post/${post.id}`)}
                                            >
                                                <SizableText size="$3" color="$primary">보기</SizableText>
                                            </Button>

                                            {/* Go to author (user management) */}
                                            <Button
                                                size="$3"
                                                bg="$surfaceContainerLow"
                                                icon={<Avatar circular size="$1.5" bg="$primaryContainer"><Avatar.Image width="100%" height="100%" src={post.author?.avatarUrl || ''} /><Avatar.Fallback bg="$primaryContainer" /></Avatar>}
                                                onPress={() => router.push(`/admin/users?highlight=${post.author?.id || ''}`)}
                                            >
                                                <SizableText size="$3" color="$textMain">{post.author?.username || '작성자'} 관리</SizableText>
                                            </Button>

                                            <XStack flex={1} />

                                            {/* Delete */}
                                            <Button
                                                size="$3"
                                                bg={deleteConfirm === post.id ? '$red10' : '$surfaceContainerLow'}
                                                icon={<Trash2 size={14} color={deleteConfirm === post.id ? 'white' : '$red10'} />}
                                                onPress={() => handleDelete(post.id)}
                                            >
                                                <SizableText size="$3" color={deleteConfirm === post.id ? 'white' : '$red10'} fontWeight="600">
                                                    {deleteConfirm === post.id ? '확인 삭제' : '삭제'}
                                                </SizableText>
                                            </Button>
                                        </XStack>
                                    </YStack>
                                )}
                            </YStack>
                        )
                    })}
                </YStack>
            )}
        </YStack>
    )
}
