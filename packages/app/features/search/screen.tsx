'use client'

import { useState, useEffect, useRef } from 'react'
import { YStack, XStack, Input, Paragraph, Avatar, ScrollView, Spinner, Tabs, SizableText } from '@my/ui'
import { Search as SearchIcon, Heart } from '@tamagui/lucide-icons'
import { useRouter } from 'solito/navigation'
import { useSearchProfiles, useSearchPosts } from '../../hooks/useSearch'
import { useCurrentUserProfile } from '../../hooks/useProfiles'
import { useToggleLike } from '../../hooks/usePosts'

export function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const router = useRouter()

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const handleSearchChange = (text: string) => {
        setSearchQuery(text)
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setDebouncedQuery(text), 400)
    }
    useEffect(() => {
        return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }, [])

    const { data: users, isLoading: usersLoading } = useSearchProfiles(debouncedQuery)
    const { data: posts, isLoading: postsLoading } = useSearchPosts(debouncedQuery)
    const { data: currentUserProfile } = useCurrentUserProfile()
    const { mutate: toggleLike } = useToggleLike()

    const handleLike = (postId: string, currentLikes: { profileId: string }[]) => {
        if (!currentUserProfile?.id) return
        const hasLiked = currentLikes.some(like => like.profileId === currentUserProfile.id)
        toggleLike({ postId, hasLiked, profileId: currentUserProfile.id })
    }

    return (
        <YStack flex={1} bg="$backgroundBody">
            <YStack padding="$4" gap="$4" maxWidth={680} alignSelf="center" width="100%" flex={1} py="$6">

                {/* Search Bar - M3 Style */}
                <XStack bg="$surfaceContainerHigh" p="$3" borderRadius="$full" alignItems="center" gap="$3">
                    <SearchIcon color="$onSurfaceVariant" size={20} />
                    <Input
                        flex={1}
                        placeholder="사용자, 게시글 검색..."
                        value={searchQuery}
                        onChangeText={handleSearchChange}
                        bg="transparent"
                        borderWidth={0}
                        focusStyle={{ borderWidth: 0 }}
                        color="$onSurface"
                        placeholderTextColor="$onSurfaceVariant"
                    />
                </XStack>

                {/* Tabs - M3 */}
                <Tabs defaultValue="users" orientation="horizontal" flexDirection="column" flex={1}>
                    <Tabs.List bg="$surfaceContainerLow" borderRadius="$card" mb="$4">
                        <Tabs.Tab value="users" flex={1} borderRadius="$card">
                            <SizableText fontWeight="600" color="$onSurface">사용자</SizableText>
                        </Tabs.Tab>
                        <Tabs.Tab value="posts" flex={1} borderRadius="$card">
                            <SizableText fontWeight="600" color="$onSurface">게시글</SizableText>
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Content value="users" flex={1}>
                        <ScrollView>
                            {usersLoading ? (
                                <YStack padding="$6" alignItems="center"><Spinner size="large" color="$primary" /></YStack>
                            ) : debouncedQuery && users?.length === 0 ? (
                                <YStack padding="$8" alignItems="center">
                                    <SizableText color="$onSurfaceVariant">검색 결과가 없습니다.</SizableText>
                                </YStack>
                            ) : (
                                <YStack gap="$2">
                                    {users?.map(user => (
                                        <XStack
                                            key={user.id}
                                            bg="$surface"
                                            p="$4"
                                            borderRadius="$card"
                                            elevation="$0.5"
                                            gap="$3"
                                            alignItems="center"
                                            cursor="pointer"
                                            hoverStyle={{ bg: '$surfaceContainerLow' }}
                                            onPress={() => router.push(`/user/${user.id}`)}
                                        >
                                            <Avatar circular size="$5" bg="$primaryContainer">
                                                <Avatar.Image width="100%" height="100%" src={user.avatarUrl || "https://i.pravatar.cc/150"} />
                                                <Avatar.Fallback bg="$primaryContainer" />
                                            </Avatar>
                                            <YStack flex={1}>
                                                <SizableText fontWeight="700" color="$onSurface" size="$4">
                                                    {user.username}
                                                </SizableText>
                                                <SizableText size="$3" color="$onSurfaceVariant" numberOfLines={1}>
                                                    {user.bio || '소개글이 없습니다'}
                                                </SizableText>
                                            </YStack>
                                        </XStack>
                                    ))}
                                </YStack>
                            )}
                        </ScrollView>
                    </Tabs.Content>

                    <Tabs.Content value="posts" flex={1}>
                        <ScrollView>
                            {postsLoading ? (
                                <YStack padding="$6" alignItems="center"><Spinner size="large" color="$primary" /></YStack>
                            ) : debouncedQuery && posts?.length === 0 ? (
                                <YStack padding="$8" alignItems="center">
                                    <SizableText color="$onSurfaceVariant">검색 결과가 없습니다.</SizableText>
                                </YStack>
                            ) : (
                                <YStack gap="$3">
                                    {posts?.map(post => {
                                        const likesCount = post.likes.length
                                        const hasLiked = currentUserProfile ? post.likes.some(like => like.profileId === currentUserProfile.id) : false

                                        return (
                                            <YStack
                                                key={post.id}
                                                bg="$surface"
                                                p="$4"
                                                borderRadius="$card"
                                                elevation="$0.5"
                                                gap="$3"
                                                cursor="pointer"
                                                hoverStyle={{ bg: '$surfaceContainerLow' }}
                                                onPress={() => router.push(`/post/${post.id}`)}
                                            >
                                                <XStack gap="$3" alignItems="center">
                                                    <Avatar circular size="$3" bg="$primaryContainer">
                                                        <Avatar.Image width="100%" height="100%" src={post.author?.avatarUrl || "https://i.pravatar.cc/150"} />
                                                        <Avatar.Fallback bg="$primaryContainer" />
                                                    </Avatar>
                                                    <YStack>
                                                        <SizableText fontWeight="700" color="$onSurface" size="$3">
                                                            {post.author?.username || '알 수 없는 사용자'}
                                                        </SizableText>
                                                        <SizableText size="$2" color="$onSurfaceVariant">
                                                            {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                                                        </SizableText>
                                                    </YStack>
                                                </XStack>

                                                <Paragraph color="$onSurface" lineHeight={22}>
                                                    {post.content}
                                                </Paragraph>

                                                <XStack gap="$4" mt="$1">
                                                    <XStack gap="$1.5" alignItems="center" cursor="pointer" onPress={() => handleLike(post.id, post.likes)}>
                                                        <Heart size={16} color={hasLiked ? "$primary" : "$onSurfaceVariant"} fill={hasLiked ? "var(--color-primary)" : "transparent"} />
                                                        <SizableText color="$onSurfaceVariant" size="$2">{likesCount}</SizableText>
                                                    </XStack>
                                                </XStack>
                                            </YStack>
                                        )
                                    })}
                                </YStack>
                            )}
                        </ScrollView>
                    </Tabs.Content>
                </Tabs>
            </YStack>
        </YStack>
    )
}
