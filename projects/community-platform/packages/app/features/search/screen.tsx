'use client'

import { useState } from 'react'
import { YStack, XStack, Input, Paragraph, Avatar, ScrollView, H4, Spinner, Separator, Button, Tabs, SizableText } from '@my/ui'
import { Search as SearchIcon, Heart, MessageCircle } from '@tamagui/lucide-icons'
import { useRouter } from 'solito/navigation'
import { useSearchProfiles, useSearchPosts } from '../../hooks/useSearch'
import { useCurrentUserProfile } from '../../hooks/useProfiles'
import { useToggleLike } from '../../hooks/usePosts'

export function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const router = useRouter()

    // 디바운스 적용 (렌더링 최적화, 실제 앱에서는 useDebounce 훅 사용 권장)
    const handleSearchChange = (text: string) => {
        setSearchQuery(text)
        // 간단한 딜레이 처리
        setTimeout(() => setDebouncedQuery(text), 500)
    }

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
        <YStack flex={1} bg="$backgroundLight">
            <YStack padding="$4" gap="$4" maxWidth={680} alignSelf="center" width="100%" flex={1}>

                {/* 검색 입력 영역 */}
                <XStack bg="$surfaceLight" p="$3" borderRadius="$4" elevation="$2" alignItems="center" gap="$3">
                    <SearchIcon color="$color10" size={20} />
                    <Input
                        flex={1}
                        placeholder="Search users, posts, or keywords..."
                        value={searchQuery}
                        onChangeText={handleSearchChange}
                        bg="transparent"
                        borderWidth={0}
                        focusStyle={{ borderWidth: 0 }}
                    />
                </XStack>

                {/* 검색 결과 탭 영역 */}
                <Tabs defaultValue="users" orientation="horizontal" flexDirection="column" flex={1}>
                    <Tabs.List bg="$surfaceLight" borderRadius="$4" elevation="$1" mb="$4">
                        <Tabs.Tab value="users" flex={1}>
                            <SizableText>Users</SizableText>
                        </Tabs.Tab>
                        <Tabs.Tab value="posts" flex={1}>
                            <SizableText>Posts</SizableText>
                        </Tabs.Tab>
                    </Tabs.List>

                    {/* 유저 검색 탭 */}
                    <Tabs.Content value="users" flex={1}>
                        <ScrollView>
                            {usersLoading ? (
                                <YStack padding="$4" alignItems="center"><Spinner size="large" /></YStack>
                            ) : debouncedQuery && users?.length === 0 ? (
                                <YStack padding="$8" alignItems="center">
                                    <Paragraph color="$color10">No users found.</Paragraph>
                                </YStack>
                            ) : (
                                <YStack gap="$3">
                                    {users?.map(user => (
                                        <XStack
                                            key={user.id}
                                            bg="$surfaceLight"
                                            p="$4"
                                            borderRadius="$4"
                                            elevation="$1"
                                            gap="$4"
                                            alignItems="center"
                                            cursor="pointer"
                                            hoverStyle={{ bg: '$color3' }}
                                            onPress={() => router.push(`/user/${user.id}`)}
                                        >
                                            <Avatar circular size="$5">
                                                <Avatar.Image src={user.avatarUrl || "https://i.pravatar.cc/150"} />
                                                <Avatar.Fallback bg="$color5" />
                                            </Avatar>
                                            <YStack flex={1}>
                                                <H4 fontWeight="bold" color="$color12" margin={0}>
                                                    {user.username}
                                                </H4>
                                                <Paragraph size="$3" color="$color10" numberOfLines={1}>
                                                    {user.bio || 'No bio available'}
                                                </Paragraph>
                                            </YStack>
                                        </XStack>
                                    ))}
                                </YStack>
                            )}
                        </ScrollView>
                    </Tabs.Content>

                    {/* 게시글 검색 탭 */}
                    <Tabs.Content value="posts" flex={1}>
                        <ScrollView>
                            {postsLoading ? (
                                <YStack padding="$4" alignItems="center"><Spinner size="large" /></YStack>
                            ) : debouncedQuery && posts?.length === 0 ? (
                                <YStack padding="$8" alignItems="center">
                                    <Paragraph color="$color10">No posts found.</Paragraph>
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
                                                <XStack gap="$3" alignItems="center">
                                                    <Avatar circular size="$3">
                                                        <Avatar.Image src={post.author?.avatarUrl || "https://i.pravatar.cc/150"} />
                                                        <Avatar.Fallback bg="$color5" />
                                                    </Avatar>
                                                    <YStack>
                                                        <Paragraph fontWeight="bold" color="$color12" size="$3">
                                                            {post.author?.username || 'Unknown User'}
                                                        </Paragraph>
                                                        <Paragraph size="$2" color="$color10">
                                                            {new Date(post.createdAt).toLocaleDateString()}
                                                        </Paragraph>
                                                    </YStack>
                                                </XStack>

                                                <Paragraph color="$color12" mt="$1">
                                                    {post.content}
                                                </Paragraph>

                                                <XStack gap="$4" mt="$2">
                                                    <XStack gap="$1" alignItems="center" cursor="pointer" onPress={() => handleLike(post.id, post.likes)}>
                                                        <Heart size={16} color={hasLiked ? "$red10" : "$color10"} fill={hasLiked ? "red" : "transparent"} />
                                                        <Paragraph color="$color10" size="$2">{likesCount}</Paragraph>
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
