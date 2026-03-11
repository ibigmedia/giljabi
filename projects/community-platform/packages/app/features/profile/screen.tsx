'use client'

import React from 'react'
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
                {/* Profile Header Card */}
                <YStack bg="$surface" mt="$4" borderRadius="$xl" overflow="hidden" elevation="$1">
                    {/* Cover Image */}
                    <YStack height={180} width="100%" bg="$surfaceContainerHigh">
                        <img
                            src={profile.coverUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1000&auto=format&fit=crop'}
                            alt="Cover"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </YStack>

                    {/* Profile Info */}
                    <YStack px="$6" pb="$6" mt={-48}>
                        <XStack justifyContent="space-between" alignItems="flex-end">
                            <Avatar circular size="$12" borderWidth={4} borderColor="$surface" elevation="$2" bg="$primaryContainer">
                                <Avatar.Image width="100%" height="100%" src={profile.avatarUrl || "https://i.pravatar.cc/150"} />
                                <Avatar.Fallback bg="$primaryContainer" />
                            </Avatar>

                            <XStack gap="$2" mb="$2">
                                {isMe ? (
                                    <Button
                                        size="$3"
                                        bg="$surfaceContainerLow"
                                        borderRadius="$full"
                                        hoverStyle={{ bg: '$surfaceContainerHigh' }}
                                        icon={<Edit3 size={16} color="$onSurfaceVariant" />}
                                        onPress={() => router.push('/edit-profile')}
                                    >
                                        <SizableText color="$onSurfaceVariant" fontWeight="600">프로필 편집</SizableText>
                                    </Button>
                                ) : (
                                    <XStack gap="$2">
                                        <Button
                                            size="$3"
                                            bg="$surfaceContainerLow"
                                            borderRadius="$full"
                                            hoverStyle={{ bg: '$surfaceContainerHigh' }}
                                            onPress={handleMessageClick}
                                            disabled={isCreatingChannel}
                                            opacity={isCreatingChannel ? 0.7 : 1}
                                            icon={isCreatingChannel ? <Spinner size="small" /> : <MessageSquare size={16} color="$onSurfaceVariant" />}
                                        >
                                            <SizableText color="$onSurfaceVariant" fontWeight="600">메시지</SizableText>
                                        </Button>
                                        <Button
                                            size="$3"
                                            bg={followStatus?.isFollowing ? '$surfaceContainerLow' : '$primary'}
                                            borderRadius="$full"
                                            hoverStyle={{ opacity: 0.9 }}
                                            onPress={handleFollowToggle}
                                            disabled={isTogglingFollow}
                                            opacity={isTogglingFollow ? 0.7 : 1}
                                            icon={followStatus?.isFollowing
                                                ? <UserMinus size={16} color="$onSurfaceVariant" />
                                                : <UserPlus size={16} color="white" />
                                            }
                                        >
                                            <SizableText color={followStatus?.isFollowing ? '$onSurfaceVariant' : 'white'} fontWeight="600">
                                                {followStatus?.isFollowing ? '언팔로우' : '팔로우'}
                                            </SizableText>
                                        </Button>
                                    </XStack>
                                )}
                            </XStack>
                        </XStack>

                        <YStack mt="$4" gap="$1">
                            <H3 m={0} color="$onSurface" fontWeight="800">{profile.username}</H3>
                            <SizableText color="$onSurfaceVariant" size="$3">@{profile.username}</SizableText>
                        </YStack>

                        {profile.bio && (
                            <Paragraph mt="$3" size="$4" lineHeight={24} color="$onSurface">
                                {profile.bio}
                            </Paragraph>
                        )}

                        {/* Meta */}
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

                        {/* Stats - M3 Chip style */}
                        <XStack gap="$4" mt="$5" pt="$4" borderTopWidth={1} borderColor="$outlineVariant">
                            <XStack gap="$1.5" alignItems="baseline">
                                {isFollowLoading ? <Spinner size="small" /> : (
                                    <SizableText size="$5" fontWeight="800" color="$onSurface">{followStatus?.followingCount || 0}</SizableText>
                                )}
                                <SizableText color="$onSurfaceVariant" size="$3">팔로잉</SizableText>
                            </XStack>
                            <XStack gap="$1.5" alignItems="baseline">
                                {isFollowLoading ? <Spinner size="small" /> : (
                                    <SizableText size="$5" fontWeight="800" color="$onSurface">{followStatus?.followersCount || 0}</SizableText>
                                )}
                                <SizableText color="$onSurfaceVariant" size="$3">팔로워</SizableText>
                            </XStack>
                        </XStack>
                    </YStack>
                </YStack>

                {/* Tabs - M3 Segmented */}
                <YStack mt="$4" bg="$surface" borderRadius="$xl" overflow="hidden" elevation="$0.5" flex={1} mb="$4">
                    <Tabs defaultValue="posts" flexDirection="column" flex={1}>
                        <Tabs.List bg="$surfaceContainerLow" px="$2" pt="$1">
                            <Tabs.Tab value="posts" flex={1} bg="transparent" borderRadius="$sm">
                                <SizableText color="$onSurface" fontWeight="700" size="$3">타임라인</SizableText>
                            </Tabs.Tab>
                            <Tabs.Tab value="about" flex={1} bg="transparent" borderRadius="$sm">
                                <SizableText color="$onSurface" fontWeight="700" size="$3">소개</SizableText>
                            </Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Content value="posts" p="$0" bg="$backgroundBody">
                            {isPostsLoading ? (
                                <YStack padding="$6" alignItems="center">
                                    <Spinner size="large" color="$primary" />
                                </YStack>
                            ) : (
                                <YStack gap="$3" p="$4">
                                    {posts?.length === 0 ? (
                                        <YStack padding="$8" alignItems="center" bg="$surface" borderRadius="$card" elevation="$0.5">
                                            <SizableText color="$onSurfaceVariant">아직 게시글이 없습니다.</SizableText>
                                        </YStack>
                                    ) : (
                                        posts?.map((post) => (
                                            <YStack key={post.id} bg="$surface" p="$5" borderRadius="$card" elevation="$0.5" gap="$3">
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

                        <Tabs.Content value="about" p="$6" bg="$surface">
                            <YStack gap="$4">
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
