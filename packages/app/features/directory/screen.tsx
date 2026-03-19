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
            <YStack p="$4" pb="$6" maxWidth={800} alignSelf="center" width="100%" py="$6" gap="$5">

                {/* Header */}
                <YStack gap="$1">
                    <SizableText size="$8" fontWeight="800" color="$onSurface">
                        멤버 디렉토리
                    </SizableText>
                    <SizableText size="$3" color="$onSurfaceVariant">
                        총 {profiles?.length || 0}명의 멤버
                    </SizableText>
                </YStack>

                {/* Search Bar */}
                <XStack
                    bg="$surfaceContainerLow"
                    borderRadius="$full"
                    borderWidth={1}
                    borderColor="$outlineVariant"
                    alignItems="center"
                    px="$4"
                    gap="$2.5"
                >
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
                        focusStyle={{ borderWidth: 0 }}
                    />
                </XStack>

                {isLoading ? (
                    <YStack padding="$8" alignItems="center">
                        <Spinner size="large" color="$primary" />
                    </YStack>
                ) : filteredProfiles.length === 0 ? (
                    <YStack
                        bg="$surface"
                        p="$8"
                        borderRadius="$card"
                        borderWidth={1}
                        borderColor="$outlineVariant"
                        alignItems="center"
                        gap="$3"
                    >
                        <Users size={36} color="$onSurfaceVariant" />
                        <SizableText color="$onSurfaceVariant" size="$4">
                            검색 결과가 없습니다.
                        </SizableText>
                    </YStack>
                ) : (
                    <XStack flexWrap="wrap" gap="$3">
                        {filteredProfiles.map((user) => (
                            <YStack
                                key={user.id}
                                bg="$surface"
                                p="$4"
                                borderRadius="$card"
                                borderWidth={1}
                                borderColor="$outlineVariant"
                                gap="$3"
                                width="100%"
                                $md={{ width: '48%' }}
                                hoverStyle={{ bg: '$surfaceContainerLow', borderColor: '$outline' }}
                                cursor="pointer"
                            >
                                <XStack gap="$3" alignItems="center">
                                    <Avatar circular size="$5" bg="$primaryContainer">
                                        <Avatar.Image width="100%" height="100%" src={user.avatarUrl || "https://i.pravatar.cc/150"} />
                                        <Avatar.Fallback bg="$primaryContainer" />
                                    </Avatar>

                                    <YStack flex={1} gap="$1">
                                        <SizableText fontWeight="700" size="$4" color="$onSurface">
                                            {user.username}
                                        </SizableText>
                                        <SizableText color="$onSurfaceVariant" size="$3" numberOfLines={1}>
                                            {user.email || '이메일 없음'}
                                        </SizableText>
                                    </YStack>
                                </XStack>

                                <XStack>
                                    <XStack bg="$secondaryContainer" px="$2.5" py="$1" borderRadius="$full">
                                        <SizableText size="$2" color="$onSecondaryContainer" fontWeight="600">
                                            {user.role}
                                        </SizableText>
                                    </XStack>
                                </XStack>
                            </YStack>
                        ))}
                    </XStack>
                )}
            </YStack>
        </ScrollView>
    )
}
