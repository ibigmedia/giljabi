'use client'

import React from 'react'
import { YStack, XStack, H3, H4, Paragraph, SizableText, Separator } from '@my/ui'
import { Users, FileText, Settings, Heart } from '@tamagui/lucide-icons'

export function AdminScreen() {
    return (
        <YStack flex={1} gap="$6">
            <XStack justifyContent="space-between" alignItems="center">
                <H3 color="$textMain" fontWeight="bold">Dashboard Overview</H3>
            </XStack>

            {/* Quick Stats */}
            <XStack flexWrap="wrap" gap="$4">
                <YStack flex={1} minWidth={200} bg="$surface" p="$4" borderRadius="$card" borderWidth={1} borderColor="$borderLight" gap="$2">
                    <XStack justifyContent="space-between" alignItems="center">
                        <SizableText size="$3" color="$textMuted" fontWeight="bold">TOTAL USERS</SizableText>
                        <Users size={16} color="$textMuted" />
                    </XStack>
                    <H3 color="$textMain" fontWeight="bold">1,245</H3>
                    <SizableText size="$2" color="$primary">+12% from last month</SizableText>
                </YStack>

                <YStack flex={1} minWidth={200} bg="$surface" p="$4" borderRadius="$card" borderWidth={1} borderColor="$borderLight" gap="$2">
                    <XStack justifyContent="space-between" alignItems="center">
                        <SizableText size="$3" color="$textMuted" fontWeight="bold">ACTIVE POSTS</SizableText>
                        <FileText size={16} color="$textMuted" />
                    </XStack>
                    <H3 color="$textMain" fontWeight="bold">342</H3>
                    <SizableText size="$2" color="$primary">+5% from last month</SizableText>
                </YStack>

                <YStack flex={1} minWidth={200} bg="$surface" p="$4" borderRadius="$card" borderWidth={1} borderColor="$borderLight" gap="$2">
                    <XStack justifyContent="space-between" alignItems="center">
                        <SizableText size="$3" color="$textMuted" fontWeight="bold">ENGAGEMENT RATE</SizableText>
                        <Heart size={16} color="$textMuted" />
                    </XStack>
                    <H3 color="$textMain" fontWeight="bold">24.5%</H3>
                    <SizableText size="$2" color="$textMuted">-1% from last month</SizableText>
                </YStack>
            </XStack>

            {/* Recent Activity */}
            <YStack bg="$surface" p="$4" borderRadius="$card" borderWidth={1} borderColor="$borderLight" gap="$4" mt="$4">
                <H4 color="$textMain" fontWeight="bold">Recent Activity</H4>
                <Separator borderColor="$borderLight" opacity={0.5} />
                
                <XStack gap="$4" alignItems="center" py="$2">
                    <YStack bg="$color5" p="$2" borderRadius={8}><Users size={16} color="$textMain" /></YStack>
                    <YStack flex={1}>
                        <SizableText size="$3" color="$textMain" fontWeight="bold">New user registered</SizableText>
                        <Paragraph size="$2" color="$textMuted">giljabi_newbie joined the community.</Paragraph>
                    </YStack>
                    <SizableText size="$2" color="$textMuted">2 mins ago</SizableText>
                </XStack>

                <XStack gap="$4" alignItems="center" py="$2">
                    <YStack bg="$color5" p="$2" borderRadius={8}><FileText size={16} color="$textMain" /></YStack>
                    <YStack flex={1}>
                        <SizableText size="$3" color="$textMain" fontWeight="bold">New post created</SizableText>
                        <Paragraph size="$2" color="$textMuted">giljabi_guide posted in Feed.</Paragraph>
                    </YStack>
                    <SizableText size="$2" color="$textMuted">1 hour ago</SizableText>
                </XStack>

                <XStack gap="$4" alignItems="center" py="$2">
                    <YStack bg="$color5" p="$2" borderRadius={8}><Settings size={16} color="$textMain" /></YStack>
                    <YStack flex={1}>
                        <SizableText size="$3" color="$textMain" fontWeight="bold">System updated</SizableText>
                        <Paragraph size="$2" color="$textMuted">Admin changed site configuration.</Paragraph>
                    </YStack>
                    <SizableText size="$2" color="$textMuted">1 day ago</SizableText>
                </XStack>
            </YStack>

        </YStack>
    )
}
