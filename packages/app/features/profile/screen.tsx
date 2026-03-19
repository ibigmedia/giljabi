'use client'

import React, { useState } from 'react'
import { YStack, XStack, ScrollView, Avatar, H3, Paragraph, Button, Separator, Tabs, Text, SizableText, Spinner } from '@my/ui'
import { MapPin, Calendar, MessageSquare, Heart, Edit3, UserPlus, UserMinus } from '@tamagui/lucide-icons'
import { useCurrentUserProfile, useProfile } from '../../hooks/useProfiles'
import { useRouter } from 'solito/navigation'
import { useUserPosts } from '../../hooks/usePosts'
import { useFollowStatus, useFollowUser, useUnfollowUser } from '../../hooks/useFollow'
import { useCreateOrGetChannel } from '../../hooks/useChat'

export function ProfileScreen({ id }: { id?: string }) {
    const { data: currentUserProfile, isLoading: isCurrentUserLoading } = useCurrentUserProfile()
    const router = useRouter()

    const isMe = !id || currentUserProfile?.id === id
    const targetProfileId = id || currentUserProfile?.id

    const { data: fetchedProfile, isLoading: isTargetProfileLoading } = useProfile(targetProfileId || '')
    const profile = isMe ? currentUserProfile : fetchedProfile

    const { data: posts, isLoading: isPostsLoading } = useUserPosts(targetProfileId || '')

    const { data: followStatus, isLoading: isFollowLoading } = useFollowStatus(targetProfileId || '', currentUserProfile?.id)
    const followMutation = useFollowUser()
    const unfollowMutation = useUnfollowUser()

    const { mutateAsync: createOrGetChannel, isPending: isCreatingChannel } = useCreateOrGetChannel()

    const isLoading = (!id && isCurrentUserLoading) || (id && isTargetProfileLoading)

    const [activeTab, setActiveTab] = useState('posts')

    const handleMessageClick = async () => {
        if (!targetProfileId) return;
        try {
            const channelId = await createOrGetChannel(targetProfileId);
            router.push(`/messages/${channelId}`);
        } catch (error) {
            console.error('Failed to start chat', error);
            alert('채팅방을 생성하지 못했습니다.');
        }
    }

    const handleFollowToggle = () => {
        if (!currentUserProfile || !targetProfileId) return
        if (followStatus?.isFollowing) {
            unfollowMutation.mutate({ followerId: currentUserProfile.id, followingId: targetProfileId })
        } else {
            followMutation.mutate({ followerId: currentUserProfile.id, followingId: targetProfileId })
        }
    }

    if (isLoading) {
        return (
            <YStack flex={1} bg="$backgroundBody" alignItems="center" justifyContent="center">
                <Spinner size="large" color="$primary" />
            </YStack>
        )
    }

    if (!profile) {
        return (
            <YStack flex={1} bg="$backgroundBody" alignItems="center" justifyContent="center" gap="$3">
                <SizableText color="$onSurface" size="$5">프로필 정보를 불러올 수 없습니다.</SizableText>
            </YStack>
        )
    }

    const isTogglingFollow = followMutation.isPending || unfollowMutation.isPending

    return (
        <ScrollView flex={1} bg="$backgroundBody">
            <YStack maxWidth={800} alignSelf="center" width="100%">
                {/* Cover Image */}
                <YStack
                    height={220}
                    $sm={{ height: 160 }}
                    width="100%"
                    bg="$surfaceContainerHigh"
                >
                    <img
                        src={profile.coverUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1000&auto=format&fit=crop'}
                        alt="Cover"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </YStack>

                {/* Profile Info Section */}
                <YStack
                    bg="$surface"
                    borderWidth={1}
                    borderColor="$outlineVariant"
                    borderTopWidth={0}
                    px="$5"
                    pb="$5"
                >
                    {/* Avatar + Action Buttons Row */}
                    <XStack justifyContent="space-between" alignItems="flex-end">
                        <Avatar
                            circular
                            size="$12"
                            borderWidth={4}
                            borderColor="$surface"
                            bg="$primaryContainer"
                            mt={-48}
                        >
                            <Avatar.Image width="100%" height="100%" src={profile.avatarUrl || "https://i.pravatar.cc/150"} />
                            <Avatar.Fallback bg="$primaryContainer" />
                        </Avatar>

                        <XStack gap="$2" mb="$2">
                            {isMe ? (
                                <Button
                                    size="$3"
                                    bg="transparent"
                                    borderWidth={1}
                                    borderColor="$outline"
                                    borderRadius="$full"
                                    hoverStyle={{ bg: '$surfaceContainerLow' }}
                                    icon={<Edit3 size={16} color="$onSurfaceVariant" />}
                                    onPress={() => router.push('/edit-profile')}
                                >
                                    <SizableText color="$onSurfaceVariant" fontWeight="600">프로필 편집</SizableText>
                                </Button>
                            ) : (
                                <XStack gap="$2">
                                    <Button
                                        size="$3"
                                        bg="transparent"
                                        borderWidth={1}
                                        borderColor="$outline"
                                        borderRadius="$full"
                                        hoverStyle={{ bg: '$surfaceContainerLow' }}
                                        onPress={handleMessageClick}
                                        disabled={isCreatingChannel}
                                        opacity={isCreatingChannel ? 0.7 : 1}
                                        icon={isCreatingChannel ? <Spinner size="small" /> : <MessageSquare size={16} color="$onSurfaceVariant" />}
                                    >
                                        <SizableText color="$onSurfaceVariant" fontWeight="600">메시지</SizableText>
                                    </Button>
                                    <Button
                                        size="$3"
                                        bg={followStatus?.isFollowing ? 'transparent' : '$secondaryContainer'}
                                        borderWidth={followStatus?.isFollowing ? 1 : 0}
                                        borderColor="$outline"
                                        borderRadius="$full"
                                        hoverStyle={{ opacity: 0.9 }}
                                        onPress={handleFollowToggle}
                                        disabled={isTogglingFollow}
                                        opacity={isTogglingFollow ? 0.7 : 1}
                                        icon={followStatus?.isFollowing
                                            ? <UserMinus size={16} color="$onSurfaceVariant" />
                                            : <UserPlus size={16} color="$onSecondaryContainer" />
                                        }
                                    >
                                        <SizableText
                                            color={followStatus?.isFollowing ? '$onSurfaceVariant' : '$onSecondaryContainer'}
                                            fontWeight="600"
                                        >
                                            {followStatus?.isFollowing ? '언팔로우' : '팔로우'}
                                        </SizableText>
                                    </Button>
                                </XStack>
                            )}
                        </XStack>
                    </XStack>

                    {/* Name and handle */}
                    <YStack mt="$3" gap="$0.5">
                        <H3 m={0} color="$onSurface" fontWeight="800">{profile.username}</H3>
                        <SizableText color="$onSurfaceVariant" size="$3">@{profile.username}</SizableText>
                    </YStack>

                    {/* Bio */}
                    {profile.bio && (
                        <Paragraph mt="$3" size="$4" lineHeight={24} color="$onSurface">
                            {profile.bio}
                        </Paragraph>
                    )}

                    {/* Meta info */}
                    <XStack flexWrap="wrap" gap="$4" mt="$3">
                        <XStack gap="$1.5" alignItems="center">
                            <MapPin size={14} color="$onSurfaceVariant" />
                            <SizableText color="$onSurfaceVariant" size="$3">Global</SizableText>
                        </XStack>
                        <XStack gap="$1.5" alignItems="center">
                            <Calendar size={14} color="$onSurfaceVariant" />
                            <SizableText color="$onSurfaceVariant" size="$3">
                                {new Date(profile.createdAt).toLocaleDateString('ko-KR')} 가입
                            </SizableText>
                        </XStack>
                    </XStack>

                    {/* Stat Chips */}
                    <XStack gap="$3" mt="$4" flexWrap="wrap">
                        <XStack
                            bg="$surfaceContainerLow"
                            borderRadius="$full"
                            px="$3.5"
                            py="$1.5"
                            gap="$1.5"
                            alignItems="center"
                        >
                            <SizableText size="$3" fontWeight="800" color="$onSurface">
                                {posts?.length || 0}
                            </SizableText>
                            <SizableText color="$onSurfaceVariant" size="$2">게시글</SizableText>
                        </XStack>
                        <XStack
                            bg="$surfaceContainerLow"
                            borderRadius="$full"
                            px="$3.5"
                            py="$1.5"
                            gap="$1.5"
                            alignItems="center"
                        >
                            {isFollowLoading ? <Spinner size="small" /> : (
                                <SizableText size="$3" fontWeight="800" color="$onSurface">
                                    {followStatus?.followingCount || 0}
                                </SizableText>
                            )}
                            <SizableText color="$onSurfaceVariant" size="$2">팔로잉</SizableText>
                        </XStack>
                        <XStack
                            bg="$surfaceContainerLow"
                            borderRadius="$full"
                            px="$3.5"
                            py="$1.5"
                            gap="$1.5"
                            alignItems="center"
                        >
                            {isFollowLoading ? <Spinner size="small" /> : (
                                <SizableText size="$3" fontWeight="800" color="$onSurface">
                                    {followStatus?.followersCount || 0}
                                </SizableText>
                            )}
                            <SizableText color="$onSurfaceVariant" size="$2">팔로워</SizableText>
                        </XStack>
                    </XStack>
                </YStack>

                {/* M3 Tabs with underline indicator */}
                <YStack mt="$4" mb="$4" flex={1}>
                    <Tabs
                        defaultValue="posts"
                        flexDirection="column"
                        flex={1}
                        onValueChange={(val) => setActiveTab(val)}
                    >
                        <YStack
                            bg="$surface"
                            borderWidth={1}
                            borderColor="$outlineVariant"
                            borderRadius="$card"
                            overflow="hidden"
                        >
                            <Tabs.List bg="transparent" borderBottomWidth={1} borderColor="$outlineVariant">
                                <Tabs.Tab
                                    value="posts"
                                    flex={1}
                                    bg="transparent"
                                    borderRadius={0}
                                    borderBottomWidth={2}
                                    borderBottomColor={activeTab === 'posts' ? '$primary' : 'transparent'}
                                    py="$3"
                                >
                                    <SizableText
                                        color={activeTab === 'posts' ? '$primary' : '$onSurfaceVariant'}
                                        fontWeight="700"
                                        size="$3"
                                    >
                                        타임라인
                                    </SizableText>
                                </Tabs.Tab>
                                <Tabs.Tab
                                    value="about"
                                    flex={1}
                                    bg="transparent"
                                    borderRadius={0}
                                    borderBottomWidth={2}
                                    borderBottomColor={activeTab === 'about' ? '$primary' : 'transparent'}
                                    py="$3"
                                >
                                    <SizableText
                                        color={activeTab === 'about' ? '$primary' : '$onSurfaceVariant'}
                                        fontWeight="700"
                                        size="$3"
                                    >
                                        소개
                                    </SizableText>
                                </Tabs.Tab>
                            </Tabs.List>
                        </YStack>

                        <Tabs.Content value="posts" p="$0" mt="$3">
                            {isPostsLoading ? (
                                <YStack padding="$6" alignItems="center">
                                    <Spinner size="large" color="$primary" />
                                </YStack>
                            ) : (
                                <YStack gap="$3">
                                    {posts?.length === 0 ? (
                                        <YStack
                                            padding="$8"
                                            alignItems="center"
                                            bg="$surface"
                                            borderWidth={1}
                                            borderColor="$outlineVariant"
                                            borderRadius="$card"
                                        >
                                            <SizableText color="$onSurfaceVariant">아직 게시글이 없습니다.</SizableText>
                                        </YStack>
                                    ) : (
                                        posts?.map((post) => (
                                            <YStack
                                                key={post.id}
                                                bg="$surface"
                                                p="$5"
                                                borderWidth={1}
                                                borderColor="$outlineVariant"
                                                borderRadius="$card"
                                                gap="$3"
                                            >
                                                <XStack gap="$3" alignItems="center">
                                                    <Avatar circular size="$4" bg="$primaryContainer">
                                                        <Avatar.Image width="100%" height="100%" src={profile.avatarUrl || "https://i.pravatar.cc/150"} />
                                                        <Avatar.Fallback bg="$primaryContainer" />
                                                    </Avatar>
                                                    <YStack>
                                                        <SizableText fontWeight="700" fontSize={15} color="$onSurface">{profile.username}</SizableText>
                                                        <SizableText color="$onSurfaceVariant" size="$2">
                                                            {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                                                        </SizableText>
                                                    </YStack>
                                                </XStack>

                                                <Paragraph size="$4" lineHeight={24} color="$onSurface">
                                                    {post.content}
                                                </Paragraph>

                                                <Separator borderColor="$outlineVariant" opacity={0.3} />

                                                <XStack gap="$6">
                                                    <XStack gap="$1.5" alignItems="center" cursor="pointer" opacity={0.8} hoverStyle={{ opacity: 1 }}>
                                                        <Heart size={18} color="$onSurfaceVariant" />
                                                        <SizableText color="$onSurfaceVariant" size="$3">{post.likes?.length || 0}</SizableText>
                                                    </XStack>
                                                    <XStack gap="$1.5" alignItems="center" cursor="pointer" opacity={0.8} hoverStyle={{ opacity: 1 }}>
                                                        <MessageSquare size={18} color="$onSurfaceVariant" />
                                                        <SizableText color="$onSurfaceVariant" size="$3">0</SizableText>
                                                    </XStack>
                                                </XStack>
                                            </YStack>
                                        ))
                                    )}
                                </YStack>
                            )}
                        </Tabs.Content>

                        <Tabs.Content value="about" mt="$3">
                            <YStack
                                bg="$surface"
                                borderWidth={1}
                                borderColor="$outlineVariant"
                                borderRadius="$card"
                                p="$6"
                                gap="$4"
                            >
                                <SizableText color="$onSurface" size="$5" fontWeight="700">{profile.username} 소개</SizableText>
                                <Paragraph color="$onSurfaceVariant" lineHeight={24}>
                                    {profile.bio || '아직 소개글이 작성되지 않았습니다.'}
                                </Paragraph>
                            </YStack>
                        </Tabs.Content>
                    </Tabs>
                </YStack>
            </YStack>
        </ScrollView>
    )
}
