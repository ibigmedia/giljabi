'use client'

import React from 'react'
import { YStack, XStack, ScrollView, Avatar, H3, Paragraph, Button, Separator, Tabs, Text, SizableText, Spinner } from '@my/ui'
import { MapPin, Calendar, MessageSquare, Heart } from '@tamagui/lucide-icons'
import { useCurrentUserProfile, useProfile } from '../../hooks/useProfiles'
import { useRouter } from 'solito/navigation'
import { useUserPosts } from '../../hooks/usePosts'
import { useFollowStatus, useFollowUser, useUnfollowUser } from '../../hooks/useFollow'
import { useCreateOrGetChannel } from '../../hooks/useChat'

export function ProfileScreen({ id }: { id?: string }) {
    // 현재 접속 중인 내 프로필 정보
    const { data: currentUserProfile, isLoading: isCurrentUserLoading } = useCurrentUserProfile()
    const router = useRouter()

    // 보고 있는 화면이 내 프로필인지 여부
    const isMe = !id || currentUserProfile?.id === id
    const targetProfileId = id || currentUserProfile?.id

    // 조회 대상 프로필 정보 (내 프로필이면 currentUserProfile 활용)
    const { data: fetchedProfile, isLoading: isTargetProfileLoading } = useProfile(targetProfileId || '')
    const profile = isMe ? currentUserProfile : fetchedProfile

    // 조회 대상 프로필의 포스트
    const { data: posts, isLoading: isPostsLoading } = useUserPosts(targetProfileId || '')

    // 팔로우 상태 및 카운트
    const { data: followStatus, isLoading: isFollowLoading } = useFollowStatus(targetProfileId || '', currentUserProfile?.id)
    const followMutation = useFollowUser()
    const unfollowMutation = useUnfollowUser()

    // 1:1 메시징
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
            <YStack flex={1} bg="$background" alignItems="center" justifyContent="center">
                <Spinner size="large" />
            </YStack>
        )
    }

    if (!profile) {
        return (
            <YStack flex={1} bg="$background" alignItems="center" justifyContent="center">
                <Paragraph>프로필 정보를 불러올 수 없습니다.</Paragraph>
            </YStack>
        )
    }

    const isTogglingFollow = followMutation.isPending || unfollowMutation.isPending

    return (
        <ScrollView flex={1} bg="$background">
            {/* Cover Image */}
            <YStack height={150} width="100%" bg="$gray5">
                <img
                    src={profile.coverUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1000&auto=format&fit=crop'}
                    alt="Cover"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </YStack>

            {/* Profile Info Section */}
            <YStack px="$4" pb="$4" mt={-40}>
                <XStack justifyContent="space-between" alignItems="flex-end">
                    <Avatar circular size="$10" borderWidth={4} borderColor="$background">
                        <Avatar.Image src={profile.avatarUrl || "https://i.pravatar.cc/150"} />
                        <Avatar.Fallback bg="$red10" />
                    </Avatar>

                    <XStack gap="$2" mb="$2">
                        {isMe ? (
                            <Button size="$3" variant="outlined" onPress={() => router.push('/edit-profile')}>프로필 수정</Button>
                        ) : (
                            <XStack gap="$2">
                                <Button
                                    size="$3"
                                    bg="$gray5"
                                    onPress={handleMessageClick}
                                    disabled={isCreatingChannel}
                                    opacity={isCreatingChannel ? 0.7 : 1}
                                    icon={isCreatingChannel ? <Spinner size="small" /> : undefined}
                                >
                                    메시지
                                </Button>
                                <Button
                                    size="$3"
                                    bg={followStatus?.isFollowing ? '$color5' : '$blue10'}
                                    onPress={handleFollowToggle}
                                    disabled={isTogglingFollow}
                                    opacity={isTogglingFollow ? 0.7 : 1}
                                >
                                    <Text color={followStatus?.isFollowing ? '$color12' : 'white'}>
                                        {followStatus?.isFollowing ? '언팔로우' : '팔로우'}
                                    </Text>
                                </Button>
                            </XStack>
                        )}
                    </XStack>
                </XStack>

                <YStack mt="$3" gap="$1">
                    <H3 m={0}>{profile.username}</H3>
                    <Paragraph color="$color10" size="$3">@{profile.username}</Paragraph>
                </YStack>

                <Paragraph mt="$3" size="$4" lineHeight="$5">
                    {profile.bio || '소개글이 없습니다.'}
                </Paragraph>

                {/* Meta Info */}
                <XStack flexWrap="wrap" gap="$3" mt="$3">
                    <XStack gap="$1.5" alignItems="center">
                        <MapPin size={16} color="$color10" />
                        <Paragraph color="$color10" size="$3">Unknown Location</Paragraph>
                    </XStack>
                    <XStack gap="$1.5" alignItems="center">
                        <Calendar size={16} color="$color10" />
                        <Paragraph color="$color10" size="$3">
                            {new Date(profile.createdAt).toLocaleDateString()} 가입
                        </Paragraph>
                    </XStack>
                </XStack>

                {/* Stats */}
                <XStack gap="$4" mt="$4">
                    <XStack gap="$1.5" alignItems="baseline">
                        {isFollowLoading ? <Spinner size="small" /> : <SizableText size="$5" fontWeight="bold">{followStatus?.followingCount || 0}</SizableText>}
                        <Paragraph color="$color10" size="$3">팔로잉</Paragraph>
                    </XStack>
                    <XStack gap="$1.5" alignItems="baseline">
                        {isFollowLoading ? <Spinner size="small" /> : <SizableText size="$5" fontWeight="bold">{followStatus?.followersCount || 0}</SizableText>}
                        <Paragraph color="$color10" size="$3">팔로워</Paragraph>
                    </XStack>
                </XStack>
            </YStack>

            <Separator />

            {/* Tabs */}
            <Tabs defaultValue="posts" flexDirection="column" flex={1}>
                <Tabs.List bg="$background" borderBottomWidth={1} borderColor="$borderColor">
                    <Tabs.Tab value="posts" flex={1}>
                        <SizableText>포스트</SizableText>
                    </Tabs.Tab>
                    <Tabs.Tab value="about" flex={1}>
                        <SizableText>정보</SizableText>
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Content value="posts" p="$0" mt="$2">
                    {/* User Posts Timeline */}
                    {isPostsLoading ? (
                        <YStack padding="$4" alignItems="center">
                            <Spinner size="large" />
                        </YStack>
                    ) : (
                        <YStack gap="$2" bg="$gray2" p="$2">
                            {posts?.length === 0 ? (
                                <YStack padding="$4" alignItems="center" bg="$background" borderRadius="$4">
                                    <Paragraph color="$color10">작성한 포스트가 없습니다.</Paragraph>
                                </YStack>
                            ) : (
                                posts?.map((post) => (
                                    <YStack key={post.id} bg="$background" p="$4" borderRadius="$4" gap="$3">
                                        <XStack gap="$3" alignItems="center">
                                            <Avatar circular size="$4">
                                                <Avatar.Image src={profile.avatarUrl || "https://i.pravatar.cc/150"} />
                                                <Avatar.Fallback bg="$gray5" />
                                            </Avatar>
                                            <YStack>
                                                <Text fontWeight="bold">{profile.username}</Text>
                                                <Paragraph color="$color10" size="$2">
                                                    {new Date(post.createdAt).toLocaleString()}
                                                </Paragraph>
                                            </YStack>
                                        </XStack>

                                        <Paragraph size="$4" lineHeight="$5">
                                            {post.content}
                                        </Paragraph>

                                        <XStack gap="$4" mt="$2">
                                            <XStack gap="$1" alignItems="center" cursor="pointer">
                                                <Heart size={18} color="$color10" />
                                                <Paragraph color="$color10" size="$2">{post.likes?.length || 0}</Paragraph>
                                            </XStack>
                                            <XStack gap="$1" alignItems="center" cursor="pointer">
                                                <MessageSquare size={18} color="$color10" />
                                                <Paragraph color="$color10" size="$2">0</Paragraph>
                                            </XStack>
                                        </XStack>
                                    </YStack>
                                ))
                            )}
                        </YStack>
                    )}
                </Tabs.Content>

                <Tabs.Content value="about" p="$4">
                    <YStack gap="$4">
                        <H3>상세 정보</H3>
                        <Paragraph>프로필 상세 정보 및 소셜 링크 등이 위치할 내용입니다.</Paragraph>
                    </YStack>
                </Tabs.Content>
            </Tabs>
        </ScrollView>
    )
}
