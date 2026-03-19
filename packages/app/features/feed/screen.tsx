'use client'

import { useState } from 'react'
import { YStack, XStack, Avatar, TextArea, Input, Button, Separator, ScrollView, Spinner, SizableText } from '@my/ui'
import { Image as ImageIcon, FileText, Users, ChevronRight, Edit3 } from '@tamagui/lucide-icons'
import { usePosts, useCreatePost } from '../../hooks/usePosts'
import { useCurrentUserProfile, useProfiles } from '../../hooks/useProfiles'
import { useBlogPosts } from '../../hooks/useBlogs'
import { useGroups } from '../../hooks/useGroup'
import { PostCard } from './post-card'
import { ComposeLinkPreviews } from './link-preview'
import { useRouter } from 'solito/navigation'

export function FeedScreen() {
    const [postText, setPostText] = useState('')
    const [mediaUrl, setMediaUrl] = useState('')
    const [showMediaInput, setShowMediaInput] = useState(false)
    const [attachedUrls, setAttachedUrls] = useState<string[]>([])
    const [dismissedUrls, setDismissedUrls] = useState<string[]>([])
    const [showMobileCompose, setShowMobileCompose] = useState(false)

    // Only detect URLs that are "complete" (followed by a space/newline, not still being typed)
    const handleTextChange = (text: string) => {
        setPostText(text)
        // Match URLs followed by whitespace — meaning the user finished typing them
        const completeUrlRegex = /(https?:\/\/[^\s]+)(?=\s)/g
        const matches = text.match(completeUrlRegex)
        if (!matches) return
        const newUrls = Array.from(new Set(matches))
        setAttachedUrls(prev => {
            const combined = [...prev]
            for (const url of newUrls) {
                // Skip if dismissed or already attached
                if (dismissedUrls.includes(url)) continue
                // Replace any existing URL that is a prefix of this one (partial -> complete)
                const prefixIdx = combined.findIndex(u => url.startsWith(u) && u !== url)
                if (prefixIdx !== -1) {
                    combined[prefixIdx] = url
                } else if (!combined.includes(url)) {
                    combined.push(url)
                }
            }
            return combined
        })
    }

    const handleDismissUrl = (url: string) => {
        setDismissedUrls(prev => [...prev, url])
        setAttachedUrls(prev => prev.filter(u => u !== url))
    }

    const router = useRouter()
    const { data: currentUserProfile } = useCurrentUserProfile()
    const { data: posts, isLoading } = usePosts()
    const { mutate: createPost, isPending: isCreating } = useCreatePost()
    const { data: blogPosts } = useBlogPosts()
    const { data: groups } = useGroups()
    const { data: allProfiles } = useProfiles()

    const canPost = (postText.trim() || attachedUrls.length > 0) && !!currentUserProfile

    const handlePost = () => {
        if (!canPost || !currentUserProfile?.id) return
        const finalContent = postText.trim()
        // Store attached URLs in mediaUrl field (newline-separated if multiple)
        const finalMediaUrl = attachedUrls.length > 0
            ? attachedUrls.join('\n')
            : (mediaUrl.trim() || undefined)
        createPost({ content: finalContent || ' ', profileId: currentUserProfile.id, mediaUrl: finalMediaUrl }, {
            onSuccess: () => {
                setPostText('')
                setMediaUrl('')
                setShowMediaInput(false)
                setAttachedUrls([])
                setDismissedUrls([])
                setShowMobileCompose(false)
            }
        })
    }

    const composeBox = (
        <YStack
            bg="$surface"
            p="$4"
            borderRadius="$card"
            borderWidth={1}
            borderColor="$outlineVariant"
            gap="$3"
        >
            <XStack gap="$3" alignItems="flex-start">
                <Avatar circular size="$4" bg="$primaryContainer" mt="$1">
                    <Avatar.Image width="100%" height="100%" src={currentUserProfile?.avatarUrl || "https://i.pravatar.cc/150?u=me"} />
                    <Avatar.Fallback bg="$primaryContainer" />
                </Avatar>
                <YStack flex={1}>
                    <TextArea
                        placeholder="무슨 생각을 하고 계신가요?"
                        value={postText}
                        onChangeText={handleTextChange}
                        bg="$surfaceContainerLow"
                        borderWidth={1}
                        borderColor="$outlineVariant"
                        borderRadius="$4"
                        paddingHorizontal="$3"
                        paddingVertical="$3"
                        color="$onSurface"
                        placeholderTextColor="$onSurfaceVariant"
                        fontSize={15}
                        numberOfLines={3}
                        minHeight={80}
                        focusStyle={{ borderColor: '$primary' }}
                    />
                </YStack>
            </XStack>

            {/* Live link preview while composing - persists after URL removed from text */}
            <ComposeLinkPreviews urls={attachedUrls} onDismiss={handleDismissUrl} />

            {showMediaInput && (
                <Input
                    placeholder="이미지 또는 미디어 URL을 입력하세요 (https://...)"
                    value={mediaUrl}
                    onChangeText={setMediaUrl}
                    bg="$surfaceContainerLow"
                    borderWidth={1}
                    borderColor="$outlineVariant"
                    borderRadius="$4"
                    size="$3"
                    color="$onSurface"
                    placeholderTextColor="$onSurfaceVariant"
                />
            )}

            <Separator borderColor="$outlineVariant" opacity={0.3} />
            <XStack justifyContent="space-between" alignItems="center">
                <Button
                    icon={<ImageIcon size={20} color={showMediaInput ? '$primary' : '$onSurfaceVariant'} />}
                    circular
                    size="$3"
                    bg={showMediaInput ? '$primaryContainer' : 'transparent'}
                    hoverStyle={{ bg: '$surfaceContainerHigh' }}
                    onPress={() => setShowMediaInput(!showMediaInput)}
                />
                <Button
                    bg="$primary"
                    size="$3"
                    borderRadius="$button"
                    disabled={!canPost || isCreating}
                    opacity={(!canPost || isCreating) ? 0.5 : 1}
                    onPress={handlePost}
                    hoverStyle={{ opacity: 0.9 }}
                    pressStyle={{ opacity: 0.85 }}
                >
                    {isCreating ? <Spinner color="white" /> : <SizableText color="white" fontWeight="600">게시하기</SizableText>}
                </Button>
            </XStack>
        </YStack>
    )

    return (
        <YStack flex={1} bg="$backgroundBody">
            <ScrollView flex={1}>
                <XStack
                    maxWidth={1100}
                    alignSelf="center"
                    width="100%"
                    px="$4"
                    py="$6"
                    gap="$6"
                    justifyContent="center"
                >
                    {/* Left Sidebar (Desktop Only) */}
                    <YStack display="none" $md={{ display: 'flex' }} width={280} gap="$4">
                        {/* User Profile Card */}
                        <YStack bg="$surface" p="$5" borderRadius="$card" borderWidth={1} borderColor="$outlineVariant" gap="$4">
                            <XStack gap="$3" alignItems="center">
                                <Avatar circular size="$5" bg="$primaryContainer">
                                    <Avatar.Image width="100%" height="100%" src={currentUserProfile?.avatarUrl || "https://i.pravatar.cc/150?u=me"} />
                                    <Avatar.Fallback bg="$primaryContainer" />
                                </Avatar>
                                <YStack flex={1}>
                                    <SizableText size="$4" fontWeight="700" color="$onSurface">
                                        {currentUserProfile?.username || '사용자'}
                                    </SizableText>
                                    <SizableText size="$2" color="$onSurfaceVariant">온라인</SizableText>
                                </YStack>
                            </XStack>
                            <Separator borderColor="$outlineVariant" opacity={0.5} />
                            <XStack width="100%" justifyContent="space-around">
                                <YStack alignItems="center" gap="$1">
                                    <SizableText size="$5" fontWeight="700" color="$onSurface">{allProfiles?.length || 0}</SizableText>
                                    <SizableText size="$1" color="$onSurfaceVariant" fontWeight="500">멤버</SizableText>
                                </YStack>
                                <YStack alignItems="center" gap="$1">
                                    <SizableText size="$5" fontWeight="700" color="$onSurface">{posts?.length || 0}</SizableText>
                                    <SizableText size="$1" color="$onSurfaceVariant" fontWeight="500">게시글</SizableText>
                                </YStack>
                                <YStack alignItems="center" gap="$1">
                                    <SizableText size="$5" fontWeight="700" color="$onSurface">{groups?.length || 0}</SizableText>
                                    <SizableText size="$1" color="$onSurfaceVariant" fontWeight="500">그룹</SizableText>
                                </YStack>
                            </XStack>
                        </YStack>

                        {/* Recent Blog Posts Widget */}
                        <YStack bg="$surface" p="$5" borderRadius="$card" borderWidth={1} borderColor="$outlineVariant" gap="$3">
                            <XStack justifyContent="space-between" alignItems="center">
                                <XStack gap="$2" alignItems="center">
                                    <FileText size={16} color="$onSurface" />
                                    <SizableText color="$onSurface" size="$4" fontWeight="700">최근 블로그</SizableText>
                                </XStack>
                                <Button size="$2" chromeless onPress={() => router.push('/blog')} icon={<ChevronRight size={14} color="$primary" />}>
                                    <SizableText color="$primary" size="$2">전체</SizableText>
                                </Button>
                            </XStack>
                            <YStack gap="$2.5">
                                {blogPosts?.filter(b => b.isPublished).slice(0, 5).map(blog => (
                                    <SizableText
                                        key={blog.id}
                                        color="$primary"
                                        size="$3"
                                        fontWeight="500"
                                        numberOfLines={1}
                                        cursor="pointer"
                                        hoverStyle={{ textDecorationLine: 'underline' }}
                                        onPress={() => router.push(`/blog/${blog.id}`)}
                                    >
                                        {blog.title}
                                    </SizableText>
                                ))}
                                {(!blogPosts || blogPosts.filter(b => b.isPublished).length === 0) && (
                                    <SizableText color="$onSurfaceVariant" size="$2">아직 블로그 글이 없습니다</SizableText>
                                )}
                            </YStack>
                        </YStack>

                        {/* Groups Widget */}
                        <YStack bg="$surface" p="$5" borderRadius="$card" borderWidth={1} borderColor="$outlineVariant" gap="$3">
                            <XStack justifyContent="space-between" alignItems="center">
                                <XStack gap="$2" alignItems="center">
                                    <Users size={16} color="$onSurface" />
                                    <SizableText color="$onSurface" size="$4" fontWeight="700">그룹</SizableText>
                                </XStack>
                                <Button size="$2" chromeless onPress={() => router.push('/groups')} icon={<ChevronRight size={14} color="$primary" />}>
                                    <SizableText color="$primary" size="$2">전체</SizableText>
                                </Button>
                            </XStack>
                            <YStack gap="$2.5">
                                {groups?.slice(0, 5).map(group => (
                                    <XStack
                                        key={group.id}
                                        alignItems="center"
                                        gap="$3"
                                        cursor="pointer"
                                        hoverStyle={{ opacity: 0.8 }}
                                        onPress={() => router.push(`/groups/${group.id}`)}
                                    >
                                        <Avatar circular size="$3" bg="$primaryContainer">
                                            <Avatar.Image width="100%" height="100%" src={`https://picsum.photos/seed/${group.id}/100`} />
                                            <Avatar.Fallback bg="$primaryContainer" />
                                        </Avatar>
                                        <YStack flex={1}>
                                            <SizableText color="$onSurface" fontWeight="600" size="$3" numberOfLines={1}>{group.name}</SizableText>
                                            <SizableText color="$onSurfaceVariant" size="$2">
                                                {(group as any).members?.[0]?.count || 0}명
                                            </SizableText>
                                        </YStack>
                                    </XStack>
                                ))}
                                {(!groups || groups.length === 0) && (
                                    <SizableText color="$onSurfaceVariant" size="$2">아직 그룹이 없습니다</SizableText>
                                )}
                            </YStack>
                        </YStack>
                    </YStack>

                    {/* Main Feed Column */}
                    <YStack flex={1} maxWidth={640} width="100%" gap="$4">
                        {/* Desktop Compose Box */}
                        <YStack display="none" $md={{ display: 'flex' }}>
                            {composeBox}
                        </YStack>

                        {/* Mobile Compose Box (shown when FAB tapped) */}
                        {showMobileCompose && (
                            <YStack display="flex" $md={{ display: 'none' }}>
                                {composeBox}
                            </YStack>
                        )}

                        {/* Post Timeline -- pinned posts first */}
                        {isLoading ? (
                            <YStack padding="$8" alignItems="center">
                                <Spinner size="large" color="$primary" />
                            </YStack>
                        ) : (
                            <YStack gap="$3">
                                {[...(posts || [])]
                                    .sort((a, b) => {
                                        if (a.isPinned && !b.isPinned) return -1
                                        if (!a.isPinned && b.isPinned) return 1
                                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                                    })
                                    .map(post => (
                                        <PostCard key={post.id} post={post} currentUserProfile={currentUserProfile} />
                                    ))}
                            </YStack>
                        )}
                    </YStack>
                </XStack>
            </ScrollView>

            {/* Mobile FAB - Compose Button */}
            <YStack
                display="flex"
                $md={{ display: 'none' }}
                // @ts-ignore - position fixed for web
                position="absolute"
                bottom={96}
                right={20}
                zIndex={100}
            >
                <Button
                    circular
                    size="$5"
                    width={56}
                    height={56}
                    bg="$primary"
                    elevation="$4"
                    icon={<Edit3 size={24} color="white" />}
                    onPress={() => setShowMobileCompose(!showMobileCompose)}
                    hoverStyle={{ opacity: 0.9 }}
                    pressStyle={{ scale: 0.95, opacity: 0.85 }}
                />
            </YStack>
        </YStack>
    )
}
