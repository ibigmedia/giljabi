'use client'

import { useState, useRef } from 'react'
import { YStack, XStack, Avatar, Paragraph, Input, Button, Separator, ScrollView, H4, Spinner, SizableText } from '@my/ui'
import { Image as ImageIcon } from '@tamagui/lucide-icons'
import { usePosts, useCreatePost, useToggleLike } from '../../hooks/usePosts'
import { useCurrentUserProfile } from '../../hooks/useProfiles'
import { PostCard } from './post-card'
import { ComposeLinkPreviews, extractUrls } from './link-preview'

export function FeedScreen() {
    const [postText, setPostText] = useState('')
    const [mediaUrl, setMediaUrl] = useState('')
    const [showMediaInput, setShowMediaInput] = useState(false)
    const [attachedUrls, setAttachedUrls] = useState<string[]>([])
    const [dismissedUrls, setDismissedUrls] = useState<string[]>([])

    // Detect new URLs as user types and accumulate them
    const handleTextChange = (text: string) => {
        setPostText(text)
        const newUrls = extractUrls(text)
        setAttachedUrls(prev => {
            const combined = [...prev]
            for (const url of newUrls) {
                if (!combined.includes(url) && !dismissedUrls.includes(url)) {
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

    const { data: currentUserProfile } = useCurrentUserProfile()
    const { data: posts, isLoading } = usePosts()
    const { mutate: createPost, isPending: isCreating } = useCreatePost()

    const handlePost = () => {
        if (!postText.trim() || !currentUserProfile?.id) return
        createPost({ content: postText, profileId: currentUserProfile.id, mediaUrl: mediaUrl.trim() ? mediaUrl : undefined }, {
            onSuccess: () => {
                setPostText('')
                setMediaUrl('')
                setShowMediaInput(false)
                setAttachedUrls([])
                setDismissedUrls([])
            }
        })
    }

    return (
        <ScrollView flex={1} bg="$backgroundBody">
            <XStack maxWidth={1100} alignSelf="center" width="100%" px="$4" py="$6" gap="$6" justifyContent="center">

                {/* Left Sidebar (Desktop Only) */}
                <YStack display="none" $md={{ display: 'flex' }} width={280} gap="$4">
                    {/* User Profile Card */}
                    <YStack bg="$surface" p="$5" borderRadius="$card" elevation="$0.5" gap="$4">
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
                                <SizableText size="$5" fontWeight="700" color="$onSurface">12</SizableText>
                                <SizableText size="$1" color="$onSurfaceVariant" fontWeight="500">멤버</SizableText>
                            </YStack>
                            <YStack alignItems="center" gap="$1">
                                <SizableText size="$5" fontWeight="700" color="$onSurface">3</SizableText>
                                <SizableText size="$1" color="$onSurfaceVariant" fontWeight="500">활동중</SizableText>
                            </YStack>
                            <YStack alignItems="center" gap="$1">
                                <SizableText size="$5" fontWeight="700" color="$onSurface">5</SizableText>
                                <SizableText size="$1" color="$onSurfaceVariant" fontWeight="500">인기</SizableText>
                            </YStack>
                        </XStack>
                    </YStack>

                    {/* Recent Posts Widget */}
                    <YStack bg="$surface" p="$5" borderRadius="$card" elevation="$0.5" gap="$3">
                        <SizableText color="$onSurface" size="$4" fontWeight="700">최근 게시글</SizableText>
                        <YStack gap="$2.5">
                            <SizableText color="$primary" size="$3" fontWeight="500" numberOfLines={1}>함께 걷는 길잡이가 되어주세요</SizableText>
                            <SizableText color="$primary" size="$3" fontWeight="500" numberOfLines={1}>디지털 시대, 우리는 '텐트메이커'를 꿈꿉니다</SizableText>
                            <SizableText color="$primary" size="$3" fontWeight="500" numberOfLines={1}>책 야곱연이 음악을 만나 입체적인 예배가...</SizableText>
                        </YStack>
                    </YStack>

                    {/* Groups Widget */}
                    <YStack bg="$surface" p="$5" borderRadius="$card" elevation="$0.5" gap="$3">
                        <SizableText color="$onSurface" size="$4" fontWeight="700">그룹</SizableText>
                        <XStack alignItems="center" gap="$3">
                            <Avatar circular size="$3" borderRadius={8}>
                                <Avatar.Image width="100%" height="100%" src="https://i.pravatar.cc/150?u=g1" />
                                <Avatar.Fallback bg="$primaryContainer" />
                            </Avatar>
                            <YStack flex={1}>
                                <SizableText color="$onSurface" fontWeight="600" size="$3">북콘서트 기획팀</SizableText>
                                <SizableText color="$onSurfaceVariant" size="$2">최근 활동 5주 전</SizableText>
                            </YStack>
                        </XStack>
                    </YStack>
                </YStack>

                {/* Main Feed Column */}
                <YStack flex={1} maxWidth={640} width="100%" gap="$4">
                    {/* Compose Box - M3 Filled Card */}
                    <YStack bg="$surface" p="$5" borderRadius="$card" elevation="$0.5" gap="$3">
                        <XStack gap="$3" alignItems="center">
                            <Avatar circular size="$4" bg="$primaryContainer">
                                <Avatar.Image width="100%" height="100%" src={currentUserProfile?.avatarUrl || "https://i.pravatar.cc/150?u=me"} />
                                <Avatar.Fallback bg="$primaryContainer" />
                            </Avatar>
                            <Input
                                flex={1}
                                placeholder="무슨 생각을 하고 계신가요?"
                                value={postText}
                                onChangeText={handleTextChange}
                                bg="$surfaceContainerLow"
                                borderWidth={0}
                                borderRadius="$button"
                                paddingHorizontal="$4"
                                paddingVertical="$3"
                                color="$onSurface"
                                placeholderTextColor="$onSurfaceVariant"
                                fontSize={15}
                            />
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
                                borderRadius="$sm"
                                size="$3"
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
                                disabled={!postText.trim() || isCreating || !currentUserProfile}
                                opacity={(!postText.trim() || isCreating || !currentUserProfile) ? 0.5 : 1}
                                onPress={handlePost}
                                hoverStyle={{ opacity: 0.9 }}
                                pressStyle={{ opacity: 0.85 }}
                            >
                                {isCreating ? <Spinner color="white" /> : <SizableText color="white" fontWeight="600">게시하기</SizableText>}
                            </Button>
                        </XStack>
                    </YStack>

                    {/* Post Timeline */}
                    {isLoading ? (
                        <YStack padding="$8" alignItems="center">
                            <Spinner size="large" color="$primary" />
                        </YStack>
                    ) : (
                        <YStack gap="$3">
                            {posts?.map(post => (
                                <PostCard key={post.id} post={post} currentUserProfile={currentUserProfile} />
                            ))}
                        </YStack>
                    )}
                </YStack>
            </XStack>
        </ScrollView>
    )
}
