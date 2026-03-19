'use client'

import React, { useState } from 'react'
import { YStack, XStack, ScrollView, Avatar, Paragraph, Button, SizableText, Input, Spinner } from '@my/ui'
import { Search, Users } from '@tamagui/lucide-icons'
import { useProfiles } from '../../hooks/useProfiles'

export function DirectoryScreen() {
    const { data: profiles, isLoading } = useProfiles()
    const [searchQuery, setSearchQuery] = useState('')

    const filteredProfiles = profiles?.filter(profile => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
            (profile.username && profile.username.toLowerCase().includes(query)) ||
            (profile.bio && profile.bio.toLowerCase().includes(query))
        )
    }) || []

    return (
        <ScrollView flex={1} bg="$backgroundBody">
            <YStack p="$4" pb="$6" maxWidth={700} alignSelf="center" width="100%" py="$6" gap="$4">
                <XStack justifyContent="space-between" alignItems="center">
                    <YStack>
                        <SizableText size="$8" fontWeight="800" color="$onSurface">멤버 디렉토리</SizableText>
                        <SizableText size="$3" color="$onSurfaceVariant" mt="$1">총 {profiles?.length || 0}명</SizableText>
                    </YStack>
                </XStack>

                {/* Search Bar - M3 */}
                <XStack bg="$surfaceContainerHigh" borderRadius="$full" alignItems="center" px="$4" gap="$2">
                    <Search color="$onSurfaceVariant" size={20} />
                    <Input
                        flex={1}
                        borderWidth={0}
                        bg="transparent"
                        placeholder="이름이나 소개글로 검색..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        color="$onSurface"
                        placeholderTextColor="$onSurfaceVariant"
                    />
                </XStack>

                {isLoading ? (
                    <YStack padding="$6" alignItems="center">
                        <Spinner size="large" color="$primary" />
                    </YStack>
                ) : filteredProfiles.length === 0 ? (
                    <YStack bg="$surface" p="$8" borderRadius="$card" elevation="$0.5" alignItems="center" gap="$2">
                        <Users size={32} color="$onSurfaceVariant" />
                        <SizableText color="$onSurfaceVariant">검색 결과가 없습니다.</SizableText>
                    </YStack>
                ) : (
                    <YStack gap="$2">
                        {filteredProfiles.map((user) => (
                            <XStack
                                key={user.id}
                                bg="$surface"
                                p="$4"
                                borderRadius="$card"
                                elevation="$0.5"
                                gap="$3"
                                alignItems="center"
                                hoverStyle={{ bg: '$surfaceContainerLow' }}
                            >
                                <Avatar circular size="$5" bg="$primaryContainer">
                                    <Avatar.Image width="100%" height="100%" src={user.avatarUrl || "https://i.pravatar.cc/150"} />
                                    <Avatar.Fallback bg="$primaryContainer" />
                                </Avatar>

                                <YStack flex={1}>
                                    <SizableText fontWeight="700" size="$4" color="$onSurface">{user.username}</SizableText>
                                    <SizableText color="$onSurfaceVariant" size="$3">{user.email || '이메일 없음'}</SizableText>
                                </YStack>

                                <XStack bg="$secondaryContainer" px="$2.5" py="$1" borderRadius="$full">
                                    <SizableText size="$2" color="$onSecondaryContainer" fontWeight="600">
                                        {user.role}
                                    </SizableText>
                                </XStack>
                            </XStack>
                        ))}
                    </YStack>
                )}
            </YStack>
        </ScrollView>
    )
}
