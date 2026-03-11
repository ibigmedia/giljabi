'use client'

import React, { useState } from 'react'
import { YStack, XStack, H3, H4, Paragraph, Button, Input, Separator, SizableText } from '@my/ui'
import { Save, Check } from '@tamagui/lucide-icons'

export function AdminSettingsScreen() {
    const [saved, setSaved] = useState(false)

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <YStack flex={1} gap="$6" maxWidth={800}>
            <H3 color="$textMain" fontWeight="bold">Site Settings</H3>
            <Paragraph color="$textMuted" mt="$-4">Configure global settings for Giljabi.com community platform.</Paragraph>
            
            <Separator borderColor="$borderLight" opacity={0.5} />

            <YStack bg="$surface" p="$6" borderRadius="$card" borderWidth={1} borderColor="$borderLight" gap="$5">
                <H4 color="$textMain" fontWeight="bold">General Configuration</H4>

                <YStack gap="$2">
                    <SizableText size="$3" fontWeight="bold" color="$textMain">Site Name</SizableText>
                    <Input defaultValue="Giljabi.com" bg="$backgroundBody" borderColor="$borderLight" color="$textMain" />
                </YStack>

                <YStack gap="$2">
                    <SizableText size="$3" fontWeight="bold" color="$textMain">Admin Contact Email</SizableText>
                    <Input defaultValue="admin@giljabi.com" bg="$backgroundBody" borderColor="$borderLight" color="$textMain" />
                </YStack>

                <YStack gap="$2">
                    <SizableText size="$3" fontWeight="bold" color="$textMain">Maintenance Mode</SizableText>
                    <XStack gap="$4" alignItems="center">
                        <Button size="$3" bg="$surfaceHover"><SizableText color="$textMain">Disabled</SizableText></Button>
                        <Paragraph size="$2" color="$textMuted">When enabled, only administrators can access the site.</Paragraph>
                    </XStack>
                </YStack>

                <Separator borderColor="$borderLight" opacity={0.5} my="$2" />

                <XStack justifyContent="flex-end" alignItems="center" gap="$4">
                    {saved && <XStack gap="$2" alignItems="center"><Check size={16} color="$primary" /><SizableText size="$3" color="$primary">Saved</SizableText></XStack>}
                    <Button bg="$primary" icon={Save} onPress={handleSave}>
                        <SizableText color="white">Save Changes</SizableText>
                    </Button>
                </XStack>
            </YStack>
        </YStack>
    )
}
