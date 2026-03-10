import React, { useState } from 'react'
import { YStack, SizableText, ScrollView, Button, H2, Paragraph, XStack, Avatar, Separator, Tabs } from 'tamagui'
import { useGroup, useJoinGroup, useLeaveGroup, useIsGroupMember } from '../../hooks/useGroup'
import { usePosts, useCreatePost } from '../../hooks/usePosts'
import { useCurrentUserProfile } from '../../hooks/useProfiles'
// Assuming we have a PostCard component from the feed feature
// For now, replacing it with a simple display to see if group posts fetch correctly
import { Card, Input } from 'tamagui'

export function GroupDetailScreen({ id }: { id: string }) {
  const { data: currentUserProfile } = useCurrentUserProfile()
  const { data: group, isLoading, error } = useGroup(id as string)
  const { data: isMember, isLoading: isLoadingMembership } = useIsGroupMember(id as string)
  
  // Need to modify usePosts or create useGroupPosts in useFeed.ts to support group filtering.
  // We'll pass groupId to a custom hook or adjust the existing one. For now, assuming a simple fetch below.
  const { data: posts, isLoading: isPostsLoading } = usePosts(id as string)
  const createPost = useCreatePost()
  const [postContent, setPostContent] = useState('')
  
  const joinGroup = useJoinGroup()
  const leaveGroup = useLeaveGroup()

  const [activeTab, setActiveTab] = useState('posts')

  if (isLoading) return <SizableText p="$4">Loading...</SizableText>
  if (error || !group) return <SizableText p="$4">Group not found.</SizableText>

  const isPrivateAndNotMember = group.isPrivate && !isMember

  return (
    <ScrollView backgroundColor="$background" flex={1}>
      <YStack p="$4" gap="$4">
        {/* Header */}
        <YStack gap="$2">
          <XStack justifyContent="space-between" alignItems="center">
            <H2>{group.name}</H2>
            {!isLoadingMembership && (
              isMember ? (
                <Button 
                  size="$3" 
                  theme="red" 
                  onPress={() => leaveGroup.mutate(group.id)}
                  disabled={leaveGroup.isPending}
                >
                  {leaveGroup.isPending ? 'Leaving...' : 'Leave Group'}
                </Button>
              ) : (
                <Button 
                  size="$3" 
                  onPress={() => joinGroup.mutate(group.id)}
                  disabled={joinGroup.isPending}
                >
                  {joinGroup.isPending ? 'Joining...' : 'Join Group'}
                </Button>
              )
            )}
          </XStack>
          
          <XStack gap="$2" alignItems="center">
            <SizableText size="$3" color="$color10">
              {group.isPrivate ? 'Private Group' : 'Public Group'}
            </SizableText>
            <SizableText size="$3" color="$color10">•</SizableText>
            <SizableText size="$3" color="$color10">
              {group.members?.length || 0} members
            </SizableText>
          </XStack>

          {group.description && (
            <Paragraph mt="$2">{group.description}</Paragraph>
          )}
        </YStack>

        <Separator my="$2" />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} orientation="horizontal" flexDirection="column">
          <Tabs.List>
            <Tabs.Tab value="posts" flex={1}>
              <SizableText>Posts</SizableText>
            </Tabs.Tab>
            <Tabs.Tab value="members" flex={1}>
              <SizableText>Members</SizableText>
            </Tabs.Tab>
          </Tabs.List>

          <Separator />

          <Tabs.Content value="posts" pt="$4">
            {isPrivateAndNotMember ? (
              <YStack alignItems="center" py="$8">
                <SizableText color="$color10">This is a private group.</SizableText>
                <SizableText color="$color11">Join the group to see posts.</SizableText>
              </YStack>
            ) : (
              <YStack gap="$4">
                <XStack gap="$2" alignItems="center">
                  <Input 
                    flex={1} 
                    placeholder="Write a post..." 
                    value={postContent}
                    onChangeText={setPostContent}
                  />
                  <Button 
                    disabled={!postContent.trim() || createPost.isPending}
                    onPress={() => {
                      if (currentUserProfile) {
                        createPost.mutate({ content: postContent, profileId: currentUserProfile.id, groupId: group.id }, {
                          onSuccess: () => setPostContent('')
                        })
                      }
                    }}
                  >
                    Post
                  </Button>
                </XStack>
                {isPostsLoading ? (
                  <SizableText>Loading posts...</SizableText>
                ) : posts?.length === 0 ? (
                  <SizableText color="$color10">No posts yet.</SizableText>
                ) : (
                  posts?.map((post) => (
                    <Card key={post.id} p="$4" borderWidth={1} borderColor="$borderColor">
                      <SizableText fontWeight="bold">{post.author?.username || 'Unknown'}</SizableText>
                      <Paragraph mt="$2">{post.content}</Paragraph>
                    </Card>
                  ))
                )}
              </YStack>
            )}
          </Tabs.Content>

          <Tabs.Content value="members" pt="$4">
            <YStack gap="$3">
              {group.members?.map((member) => (
                <XStack key={member.id} alignItems="center" gap="$3">
                  <Avatar circular size="$4">
                    <Avatar.Image src={member.profile?.avatarUrl || ''} />
                    <Avatar.Fallback backgroundColor="$color5" />
                  </Avatar>
                  <YStack>
                    <SizableText fontWeight="bold">{member.profile?.username}</SizableText>
                    <SizableText size="$3" color="$color10">{member.role}</SizableText>
                  </YStack>
                </XStack>
              ))}
            </YStack>
          </Tabs.Content>
        </Tabs>
      </YStack>
    </ScrollView>
  )
}
