import React, { useState } from 'react'
import { YStack, SizableText, ScrollView, Button, Input, TextArea, H2, Label, XStack, Switch } from 'tamagui'
import { useRouter } from 'solito/navigation'
import { useCreateGroup } from '../../hooks/useGroup'

export function CreateGroupScreen() {
  const router = useRouter()
  const createGroup = useCreateGroup()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return

    try {
      const group = await createGroup.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        isPrivate,
      })
      
      // Navigate to the newly created group
      router.replace(`/groups/${group.id}`)
    } catch (e) {
      // Error is handled in the hook
    }
  }

  return (
    <ScrollView bg="$background" flex={1}>
      <YStack p="$4" gap="$4">
        <H2>Create Group</H2>

        <YStack gap="$2">
          <Label htmlFor="group-name">Group Name *</Label>
          <Input 
            id="group-name"
            value={name} 
            onChangeText={setName} 
            placeholder="Enter group name" 
          />
        </YStack>

        <YStack gap="$2">
          <Label htmlFor="group-description">Description</Label>
          <TextArea
            id="group-description"
            value={description}
            onChangeText={setDescription}
            placeholder="What is this group about?"
            numberOfLines={4}
          />
        </YStack>

        <XStack alignItems="center" gap="$3" my="$2">
          <Switch id="private-switch" size="$3" checked={isPrivate} onCheckedChange={setIsPrivate}>
            <Switch.Thumb />
          </Switch>
          <Label htmlFor="private-switch">
            Make this group Private
          </Label>
        </XStack>
        {isPrivate && (
          <SizableText size="$3" color="$color10">
            Private groups are visible to everyone, but only members can see ongoing discussions and posts.
          </SizableText>
        )}

        <Button 
          mt="$4" 
          onPress={handleCreate} 
          disabled={!name.trim() || createGroup.isPending}
        >
          {createGroup.isPending ? 'Creating...' : 'Create Group'}
        </Button>
      </YStack>
    </ScrollView>
  )
}
