'use client'

import React, { useState } from 'react'
import { YStack, XStack, ScrollView, Avatar, H3, Paragraph, Button, SizableText, Input, Spinner } from '@my/ui'
import { Search, MapPin } from '@tamagui/lucide-icons'
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
        <ScrollView flex={1} bg="$gray2">
            <YStack p="$4" pb="$6">
                <XStack mb="$4" justifyContent="space-between" alignItems="center">
                    <H3>멤버 디렉토리</H3>
                    <SizableText color="$color10" size="$3">총 {profiles?.length || 0}명</SizableText>
                </XStack>

                {/* Search Bar */}
                <XStack mb="$4" bg="$background" borderRadius="$4" borderWidth={1} borderColor="$borderColor" alignItems="center" px="$3">
                    <Search color="$color10" size={20} />
                    <Input
                        flex={1}
                        borderWidth={0}
                        bg="transparent"
                        placeholder="이름이나 소개글로 검색..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </XStack>

                {/* Directory List */}
                {isLoading ? (
                    <YStack padding="$4" alignItems="center">
                        <Spinner size="large" />
                    </YStack>
                ) : (
                    <YStack gap="$3">
                        {filteredProfiles.map((user) => (
                            <YStack key={user.id} bg="$background" p="$4" borderRadius="$4" borderWidth={1} borderColor="$borderColor">
                                <XStack gap="$3" alignItems="center">
                                    <Avatar circular size="$6">
                                        <Avatar.Image src={user.avatarUrl || "https://i.pravatar.cc/150"} />
                                        <Avatar.Fallback bg="$gray5" />
                                    </Avatar>

                                    <YStack flex={1}>
                                        <H3 m={0} size="$5">{user.username}</H3>
                                        <Paragraph color="$color10" size="$3">@{user.username}</Paragraph>
                                    </YStack>

                                    <Button size="$3" variant="outlined">팔로우</Button>
                                </XStack>

                                <YStack mt="$3" gap="$2">
                                    <Paragraph size="$3" numberOfLines={2}>
                                        {user.bio || '소개글이 없습니다.'}
                                    </Paragraph>

                                    <XStack gap="$1.5" alignItems="center">
                                        <MapPin size={14} color="$color10" />
                                        <Paragraph color="$color10" size="$2">Unknown Location</Paragraph>
                                    </XStack>
                                </YStack>
                            </YStack>
                        ))}
                    </YStack>
                )}
            </YStack>
        </ScrollView>
    )
}
