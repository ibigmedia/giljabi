'use client'

import React from 'react'
import { YStack, ScrollView, Paragraph, Card, Separator, SizableText, XStack, Avatar, Button } from '@my/ui'
import { Activity, Users, MessageSquare, TrendingUp } from '@tamagui/lucide-icons'
import { useRouter } from 'solito/navigation'

export function DashboardScreen() {
    const router = useRouter()

    return (
        <ScrollView bg="$backgroundBody" flex={1}>
            <YStack p="$4" gap="$6" maxWidth={1000} alignSelf="center" width="100%" py="$6">

                {/* Header */}
                <YStack>
                    <SizableText size="$8" fontWeight="800" color="$onSurface">대시보드</SizableText>
                    <SizableText size="$3" color="$onSurfaceVariant" mt="$1">
                        커뮤니티 현황을 한눈에 확인하세요.
                    </SizableText>
                </YStack>

                {/* Metrics - M3 Elevated Cards */}
                <XStack flexWrap="wrap" gap="$3">
                    {[
                        { title: '전체 멤버', value: '1,245', icon: Users, color: '$primary' },
                        { title: '활성 게시글', value: '342', icon: MessageSquare, color: '$secondary' },
                        { title: '신규 그룹', value: '12', icon: TrendingUp, color: '$tertiary' },
                        { title: '참여율', value: '68%', icon: Activity, color: '$primary' },
                    ].map((metric, i) => {
                        const Icon = metric.icon
                        return (
                            <YStack
                                key={i}
                                bg="$surface"
                                borderRadius="$card"
                                elevation="$0.5"
                                p="$5"
                                flex={1}
                                minWidth={200}
                                gap="$3"
                                hoverStyle={{ elevation: '$1' }}
                            >
                                <XStack justifyContent="space-between" alignItems="center">
                                    <SizableText size="$3" color="$onSurfaceVariant" fontWeight="500">{metric.title}</SizableText>
                                    <XStack bg="$primaryContainer" p="$2" borderRadius="$lg">
                                        <Icon size={20} color="$primary" />
                                    </XStack>
                                </XStack>
                                <SizableText size="$9" fontWeight="800" color="$onSurface">
                                    {metric.value}
                                </SizableText>
                            </YStack>
                        )
                    })}
                </XStack>

                <Separator borderColor="$outlineVariant" opacity={0.3} />

                {/* Content Grid */}
                <XStack flexWrap="wrap" gap="$4">
                    {/* Recent Activity */}
                    <YStack
                        bg="$surface"
                        borderRadius="$card"
                        elevation="$0.5"
                        flex={2}
                        minWidth={400}
                        p="$5"
                    >
                        <XStack justifyContent="space-between" alignItems="center" mb="$4">
                            <SizableText size="$5" fontWeight="700" color="$onSurface">최근 활동</SizableText>
                            <Button size="$3" bg="transparent" hoverStyle={{ bg: '$surfaceContainerHigh' }} onPress={() => router.push('/feed')}>
                                <SizableText color="$primary" fontWeight="600">전체보기</SizableText>
                            </Button>
                        </XStack>

                        <YStack gap="$4">
                            {[1, 2, 3].map((item) => (
                                <XStack key={item} gap="$3" alignItems="flex-start" py="$2" borderBottomWidth={item === 3 ? 0 : 1} borderColor="$outlineVariant" borderBottomColor="$outlineVariant">
                                    <Avatar circular size="$4" bg="$primaryContainer">
                                        <Avatar.Image width="100%" height="100%" src={`https://i.pravatar.cc/150?u=${item}`} />
                                        <Avatar.Fallback bg="$primaryContainer" />
                                    </Avatar>
                                    <YStack flex={1}>
                                        <XStack gap="$1" flexWrap="wrap">
                                            <SizableText fontWeight="700" color="$onSurface">사용자 {item}</SizableText>
                                            <SizableText color="$onSurfaceVariant">님이</SizableText>
                                            <SizableText fontWeight="600" color="$primary">일반 토론</SizableText>
                                            <SizableText color="$onSurfaceVariant">에 글을 작성했습니다</SizableText>
                                        </XStack>
                                        <SizableText size="$2" color="$onSurfaceVariant" mt="$1">
                                            {item * 2}시간 전
                                        </SizableText>
                                    </YStack>
                                </XStack>
                            ))}
                        </YStack>
                    </YStack>

                    {/* Trending Groups */}
                    <YStack
                        bg="$surface"
                        borderRadius="$card"
                        elevation="$0.5"
                        flex={1}
                        minWidth={260}
                        p="$5"
                    >
                        <SizableText size="$5" fontWeight="700" color="$onSurface" mb="$4">인기 그룹</SizableText>
                        <YStack gap="$4">
                            {['기술 나눔', '창작 예술', '스타트업'].map((group, i) => (
                                <XStack key={i} gap="$3" alignItems="center">
                                    <XStack width={40} height={40} borderRadius="$lg" bg="$surfaceContainerHigh" alignItems="center" justifyContent="center">
                                        <Users size={20} color="$onSurfaceVariant" />
                                    </XStack>
                                    <YStack flex={1}>
                                        <SizableText fontWeight="600" color="$onSurface">{group}</SizableText>
                                        <SizableText size="$2" color="$onSurfaceVariant">{120 - (i * 20)}명 활동중</SizableText>
                                    </YStack>
                                    <Button
                                        size="$2"
                                        bg="$primaryContainer"
                                        borderRadius="$full"
                                        hoverStyle={{ opacity: 0.9 }}
                                    >
                                        <SizableText color="$onPrimaryContainer" fontWeight="600" size="$2">참여</SizableText>
                                    </Button>
                                </XStack>
                            ))}
                        </YStack>
                    </YStack>
                </XStack>
            </YStack>
        </ScrollView>
    )
}
