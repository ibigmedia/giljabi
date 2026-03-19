import React from 'react'
import { YStack, SizableText, ScrollView, Button, XStack, Paragraph, Separator, Avatar, Spinner } from 'tamagui'
import { Users, Lock, Globe, Plus, ChevronRight } from '@tamagui/lucide-icons'
import { useRouter } from 'solito/navigation'
import { useGroups, useMyGroups } from '../../hooks/useGroup'

function PrivacyBadge({ isPrivate }: { isPrivate: boolean }) {
    return (
        <XStack gap="$1.5" alignItems="center">
            {isPrivate
                ? <Lock size={12} color="$onSurfaceVariant" />
                : <Globe size={12} color="$onSurfaceVariant" />
            }
            <XStack
                bg={isPrivate ? '$errorContainer' : '$primaryContainer'}
                borderRadius="$full"
                px="$2"
                py="$0.5"
            >
                <SizableText
                    size="$1"
                    fontWeight="600"
                    color={isPrivate ? '$onErrorContainer' : '$onPrimaryContainer'}
                >
                    {isPrivate ? '비공개' : '공개'}
                </SizableText>
            </XStack>
        </XStack>
    )
}

export function GroupListScreen() {
    const router = useRouter()
    const { data: allGroups, isLoading: isLoadingAll } = useGroups()
    const { data: myGroups, isLoading: isLoadingMy } = useMyGroups()

    return (
        <ScrollView bg="$backgroundBody" flex={1}>
            <YStack p="$4" gap="$6" maxWidth={800} alignSelf="center" width="100%" py="$6">
                {/* Header */}
                <XStack justifyContent="space-between" alignItems="center">
                    <YStack>
                        <SizableText size="$8" fontWeight="800" color="$onSurface">그룹</SizableText>
                        <SizableText size="$3" color="$onSurfaceVariant" mt="$1">관심 있는 그룹에 참여하세요</SizableText>
                    </YStack>
                    <Button
                        size="$3"
                        bg="$primary"
                        borderRadius="$full"
                        hoverStyle={{ opacity: 0.9 }}
                        pressStyle={{ opacity: 0.85 }}
                        onPress={() => router.push('/groups/create')}
                        icon={<Plus size={16} color="white" />}
                    >
                        <SizableText color="white" fontWeight="600" size="$3">그룹 만들기</SizableText>
                    </Button>
                </XStack>

                {/* My Groups */}
                <YStack gap="$3">
                    <SizableText size="$5" fontWeight="700" color="$onSurface">내 그룹</SizableText>
                    {isLoadingMy ? (
                        <YStack padding="$6" alignItems="center">
                            <Spinner size="large" color="$primary" />
                        </YStack>
                    ) : myGroups?.length === 0 ? (
                        <YStack
                            bg="$surface"
                            p="$8"
                            borderWidth={1}
                            borderColor="$outlineVariant"
                            borderRadius="$card"
                            alignItems="center"
                            gap="$2"
                        >
                            <Users size={32} color="$onSurfaceVariant" />
                            <SizableText color="$onSurfaceVariant">아직 참여한 그룹이 없습니다.</SizableText>
                        </YStack>
                    ) : (
                        <>
                            {/* Mobile: horizontal scroll */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                display="none"
                                $sm={{ display: 'flex' }}
                            >
                                <XStack gap="$3" pr="$2">
                                    {myGroups?.map((group) => (
                                        <YStack
                                            key={group.id}
                                            bg="$surface"
                                            borderWidth={1}
                                            borderColor="$outlineVariant"
                                            borderRadius="$card"
                                            width={200}
                                            cursor="pointer"
                                            hoverStyle={{ borderColor: '$outline' }}
                                            onPress={() => router.push(`/groups/${group.id}`)}
                                            overflow="hidden"
                                        >
                                            <YStack height={60} bg="$surfaceContainerHigh">
                                                <img
                                                    src={`https://picsum.photos/seed/${group.id}/400/100`}
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </YStack>
                                            <YStack p="$3" gap="$1.5" mt={-14}>
                                                <Avatar circular size="$3.5" borderWidth={2} borderColor="$surface" bg="$primaryContainer">
                                                    <Avatar.Image width="100%" height="100%" src={`https://picsum.photos/seed/${group.id}/200`} />
                                                    <Avatar.Fallback bg="$primaryContainer" />
                                                </Avatar>
                                                <SizableText size="$3" fontWeight="700" color="$onSurface" numberOfLines={1}>
                                                    {group.name}
                                                </SizableText>
                                                <PrivacyBadge isPrivate={!!group.isPrivate} />
                                            </YStack>
                                        </YStack>
                                    ))}
                                </XStack>
                            </ScrollView>

                            {/* Desktop: card grid */}
                            <XStack flexWrap="wrap" gap="$3" $sm={{ display: 'none' }}>
                                {myGroups?.map((group) => (
                                    <YStack
                                        key={group.id}
                                        bg="$surface"
                                        borderWidth={1}
                                        borderColor="$outlineVariant"
                                        borderRadius="$card"
                                        width="48%"
                                        cursor="pointer"
                                        hoverStyle={{ borderColor: '$outline' }}
                                        onPress={() => router.push(`/groups/${group.id}`)}
                                        overflow="hidden"
                                    >
                                        <YStack height={72} bg="$surfaceContainerHigh">
                                            <img
                                                src={`https://picsum.photos/seed/${group.id}/400/100`}
                                                alt=""
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </YStack>
                                        <YStack p="$3.5" gap="$2" mt={-18}>
                                            <Avatar circular size="$4" borderWidth={2} borderColor="$surface" bg="$primaryContainer">
                                                <Avatar.Image width="100%" height="100%" src={`https://picsum.photos/seed/${group.id}/200`} />
                                                <Avatar.Fallback bg="$primaryContainer" />
                                            </Avatar>
                                            <SizableText size="$4" fontWeight="700" color="$onSurface" numberOfLines={1}>
                                                {group.name}
                                            </SizableText>
                                            <PrivacyBadge isPrivate={!!group.isPrivate} />
                                            {group.description && (
                                                <Paragraph color="$onSurfaceVariant" numberOfLines={2} fontSize={13} lineHeight={18}>
                                                    {group.description}
                                                </Paragraph>
                                            )}
                                        </YStack>
                                    </YStack>
                                ))}
                            </XStack>
                        </>
                    )}
                </YStack>

                <Separator borderColor="$outlineVariant" opacity={0.5} />

                {/* Discover / All Groups - single column list */}
                <YStack gap="$3">
                    <SizableText size="$5" fontWeight="700" color="$onSurface">그룹 탐색</SizableText>
                    {isLoadingAll ? (
                        <YStack padding="$6" alignItems="center">
                            <Spinner size="large" color="$primary" />
                        </YStack>
                    ) : allGroups?.length === 0 ? (
                        <YStack
                            bg="$surface"
                            p="$8"
                            borderWidth={1}
                            borderColor="$outlineVariant"
                            borderRadius="$card"
                            alignItems="center"
                        >
                            <SizableText color="$onSurfaceVariant">아직 생성된 그룹이 없습니다.</SizableText>
                        </YStack>
                    ) : (
                        <YStack gap="$3">
                            {allGroups?.map((group) => (
                                <XStack
                                    key={group.id}
                                    bg="$surface"
                                    borderWidth={1}
                                    borderColor="$outlineVariant"
                                    borderRadius="$card"
                                    alignItems="center"
                                    cursor="pointer"
                                    hoverStyle={{ borderColor: '$outline' }}
                                    p="$4"
                                    gap="$4"
                                    onPress={() => router.push(`/groups/${group.id}`)}
                                >
                                    <Avatar circular size="$6" bg="$primaryContainer">
                                        <Avatar.Image width="100%" height="100%" src={`https://picsum.photos/seed/${group.id}/200`} />
                                        <Avatar.Fallback bg="$primaryContainer" />
                                    </Avatar>

                                    <YStack flex={1} gap="$1">
                                        <SizableText size="$5" fontWeight="700" color="$onSurface">{group.name}</SizableText>
                                        <XStack gap="$2" alignItems="center">
                                            <PrivacyBadge isPrivate={!!group.isPrivate} />
                                            <SizableText size="$2" color="$onSurfaceVariant">
                                                {group.members?.[0]?.count || 0}명
                                            </SizableText>
                                        </XStack>
                                        {group.description && (
                                            <Paragraph color="$onSurfaceVariant" numberOfLines={1} fontSize={13} mt="$1">
                                                {group.description}
                                            </Paragraph>
                                        )}
                                    </YStack>

                                    <ChevronRight size={20} color="$onSurfaceVariant" />
                                </XStack>
                            ))}
                        </YStack>
                    )}
                </YStack>
            </YStack>
        </ScrollView>
    )
}
