'use client'

import React from 'react'
import { YStack, XStack, H3, H4, Paragraph, SizableText, Separator } from '@my/ui'
import { Users, FileText, Settings, Heart } from '@tamagui/lucide-icons'

export function AdminScreen() {
    return (
        <YStack flex={1} gap="$6">
            <XStack justifyContent="space-between" alignItems="center">
                <H3 color="$onSurface" fontWeight="bold">Dashboard Overview</H3>
            </XStack>

            {/* Quick Stats */}
            <XStack flexWrap="wrap" gap="$4">
                <YStack flex={1} minWidth={200} bg="$surface" p="$4" borderRadius="$card" borderWidth={1} borderColor="$outlineVariant" gap="$2">
                    <XStack justifyContent="space-between" alignItems="center">
                        <SizableText size="$3" color="$onSurfaceVariant" fontWeight="bold">TOTAL USERS</SizableText>
                        <Users size={16} color="$onSurfaceVariant" />
                    </XStack>
                    <H3 color="$onSurface" fontWeight="bold">1,245</H3>
                    <SizableText size="$2" color="$primary">+12% from last month</SizableText>
                </YStack>

                <YStack flex={1} minWidth={200} bg="$surface" p="$4" borderRadius="$card" borderWidth={1} borderColor="$outlineVariant" gap="$2">
                    <XStack justifyContent="space-between" alignItems="center">
                        <SizableText size="$3" color="$onSurfaceVariant" fontWeight="bold">ACTIVE POSTS</SizableText>
                        <FileText size={16} color="$onSurfaceVariant" />
                    </XStack>
                    <H3 color="$onSurface" fontWeight="bold">342</H3>
                    <SizableText size="$2" color="$primary">+5% from last month</SizableText>
                </YStack>

                <YStack flex={1} minWidth={200} bg="$surface" p="$4" borderRadius="$card" borderWidth={1} borderColor="$outlineVariant" gap="$2">
                    <XStack justifyContent="space-between" alignItems="center">
                        <SizableText size="$3" color="$onSurfaceVariant" fontWeight="bold">ENGAGEMENT RATE</SizableText>
                        <Heart size={16} color="$onSurfaceVariant" />
                    </XStack>
                    <H3 color="$onSurface" fontWeight="bold">24.5%</H3>
                    <SizableText size="$2" color="$onSurfaceVariant">-1% from last month</SizableText>
                </YStack>
            </XStack>

            {/* Recent Activity */}
            <YStack bg="$surface" p="$4" borderRadius="$card" borderWidth={1} borderColor="$outlineVariant" gap="$4" mt="$4">
                <H4 color="$onSurface" fontWeight="bold">Recent Activity</H4>
                <Separator borderColor="$outlineVariant" opacity={0.5} />
                
                <XStack gap="$4" alignItems="center" py="$2">
                    <YStack bg="$color5" p="$2" borderRadius={8}><Users size={16} color="$onSurface" /></YStack>
                    <YStack flex={1}>
                        <SizableText size="$3" color="$onSurface" fontWeight="bold">New user registered</SizableText>
                        <Paragraph size="$2" color="$onSurfaceVariant">giljabi_newbie joined the community.</Paragraph>
                    </YStack>
                    <SizableText size="$2" color="$onSurfaceVariant">2 mins ago</SizableText>
                </XStack>

                <XStack gap="$4" alignItems="center" py="$2">
                    <YStack bg="$color5" p="$2" borderRadius={8}><FileText size={16} color="$onSurface" /></YStack>
                    <YStack flex={1}>
                        <SizableText size="$3" color="$onSurface" fontWeight="bold">New post created</SizableText>
                        <Paragraph size="$2" color="$onSurfaceVariant">giljabi_guide posted in Feed.</Paragraph>
                    </YStack>
                    <SizableText size="$2" color="$onSurfaceVariant">1 hour ago</SizableText>
                </XStack>

                <XStack gap="$4" alignItems="center" py="$2">
                    <YStack bg="$color5" p="$2" borderRadius={8}><Settings size={16} color="$onSurface" /></YStack>
                    <YStack flex={1}>
                        <SizableText size="$3" color="$onSurface" fontWeight="bold">System updated</SizableText>
                        <Paragraph size="$2" color="$onSurfaceVariant">Admin changed site configuration.</Paragraph>
                    </YStack>
                    <SizableText size="$2" color="$onSurfaceVariant">1 day ago</SizableText>
                </XStack>
            </YStack>

        </YStack>
    )
}
