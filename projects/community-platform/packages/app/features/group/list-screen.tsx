import React from 'react'
import { YStack, SizableText, ScrollView, Button, H2, Card, XStack, Paragraph } from 'tamagui'
import { useRouter } from 'solito/navigation'
import { useGroups, useMyGroups } from '../../hooks/useGroup'

export function GroupListScreen() {
  const router = useRouter()
  const { data: allGroups, isLoading: isLoadingAll } = useGroups()
  const { data: myGroups, isLoading: isLoadingMy } = useMyGroups()

  return (
    <ScrollView bg="$background" flex={1}>
      <YStack p="$4" gap="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <H2>Groups</H2>
          <Button onPress={() => router.push('/groups/create')}>
            Create Group
          </Button>
        </XStack>

        <SizableText size="$6" fontWeight="bold" mt="$4">My Groups</SizableText>
        {isLoadingMy ? (
          <SizableText>Loading...</SizableText>
        ) : myGroups?.length === 0 ? (
          <SizableText color="$color10">You haven't joined any groups yet.</SizableText>
        ) : (
          <YStack gap="$3">
            {myGroups?.map((group) => (
              <Card
                key={group.id}
                p="$4"
                borderWidth={1}
                borderColor="$borderColor"
                onPress={() => router.push(`/groups/${group.id}`)}
              >
                <YStack gap="$2">
                  <SizableText size="$5" fontWeight="bold">{group.name}</SizableText>
                  {group.description && (
                    <Paragraph color="$color10" numberOfLines={2}>
                      {group.description}
                    </Paragraph>
                  )}
                  <SizableText size="$3" color="$color9">
                    {group.isPrivate ? 'Private' : 'Public'}
                  </SizableText>
                </YStack>
              </Card>
            ))}
          </YStack>
        )}

        <SizableText size="$6" fontWeight="bold" mt="$4">All Groups</SizableText>
        {isLoadingAll ? (
          <SizableText>Loading...</SizableText>
        ) : allGroups?.length === 0 ? (
          <SizableText color="$color10">No groups available.</SizableText>
        ) : (
          <YStack gap="$3">
            {allGroups?.map((group) => (
              <Card
                key={group.id}
                p="$4"
                borderWidth={1}
                borderColor="$borderColor"
                onPress={() => router.push(`/groups/${group.id}`)}
              >
                <YStack gap="$2">
                  <XStack justifyContent="space-between" alignItems="center">
                    <SizableText size="$5" fontWeight="bold">{group.name}</SizableText>
                    <SizableText size="$3" color="$color9">
                      {group.members?.[0]?.count || 0} members
                    </SizableText>
                  </XStack>
                  {group.description && (
                    <Paragraph color="$color10" numberOfLines={2}>
                      {group.description}
                    </Paragraph>
                  )}
                  <SizableText size="$3" color="$color9">
                    {group.isPrivate ? 'Private' : 'Public'}
                  </SizableText>
                </YStack>
              </Card>
            ))}
          </YStack>
        )}
      </YStack>
    </ScrollView>
  )
}
