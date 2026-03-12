'use client'

import { useState, useEffect, useRef } from 'react'
import { YStack, XStack, ScrollView, Avatar, Button, Input, TextArea, H3, SizableText, Spinner, Separator } from '@my/ui'
import { Camera, ArrowLeft, Mail, Shield, User, FileText } from '@tamagui/lucide-icons'
import { useRouter } from 'solito/navigation'
import { useCurrentUserProfile, useUpdateProfile } from '../../hooks/useProfiles'

const ROLE_LABELS: Record<string, string> = {
    MEMBER: '멤버',
    EDITOR: '편집자',
    ADMIN: '관리자',
}

function fileToBase64(file: File): Promise<{ base64: string; ext: string }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result as string
            const base64 = result.split(',')[1] || ''
            const ext = file.name.split('.').pop()?.toLowerCase() || 'jpeg'
            resolve({ base64, ext })
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

export function EditProfileScreen() {
    const router = useRouter()
    const { data: profile, isLoading: isProfileLoading } = useCurrentUserProfile()
    const { mutateAsync: updateProfile, isPending: isUpdating } = useUpdateProfile()

    const [username, setUsername] = useState('')
    const [bio, setBio] = useState('')
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [coverPreview, setCoverPreview] = useState<string | null>(null)
    const [avatarData, setAvatarData] = useState<{ base64: string; ext: string } | null>(null)
    const [coverData, setCoverData] = useState<{ base64: string; ext: string } | null>(null)
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const avatarInputRef = useRef<HTMLInputElement>(null)
    const coverInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (profile) {
            setUsername(profile.username || '')
            setBio(profile.bio || '')
        }
    }, [profile])

    const handleImageSelect = async (file: File, type: 'avatar' | 'cover') => {
        const preview = URL.createObjectURL(file)
        const data = await fileToBase64(file)
        if (type === 'avatar') {
            setAvatarPreview(preview)
            setAvatarData(data)
        } else {
            setCoverPreview(preview)
            setCoverData(data)
        }
    }

    const handleSave = async () => {
        setSaveMessage(null)
        try {
            await updateProfile({
                username: username !== profile?.username ? username : undefined,
                bio: bio !== profile?.bio ? bio : undefined,
                avatarBase64: avatarData?.base64,
                avatarExt: avatarData?.ext,
                coverBase64: coverData?.base64,
                coverExt: coverData?.ext,
            })
            setSaveMessage({ type: 'success', text: '프로필이 성공적으로 업데이트되었습니다.' })
            setTimeout(() => router.back(), 1000)
        } catch (error: any) {
            setSaveMessage({ type: 'error', text: error.message || '프로필 업데이트 중 오류가 발생했습니다.' })
        }
    }

    if (isProfileLoading) {
        return (
            <YStack flex={1} justifyContent="center" alignItems="center" bg="$backgroundBody">
                <Spinner size="large" color="$primary" />
            </YStack>
        )
    }

    if (!profile) {
        return (
            <YStack flex={1} justifyContent="center" alignItems="center" bg="$backgroundBody" gap="$3">
                <SizableText color="$onSurface" size="$5">로그인이 필요합니다.</SizableText>
                <Button bg="$primary" borderRadius="$full" onPress={() => router.push('/login')}>
                    <SizableText color="white">로그인하기</SizableText>
                </Button>
            </YStack>
        )
    }

    return (
        <ScrollView flex={1} bg="$backgroundBody">
            {/* Hidden file inputs */}
            <input
                ref={avatarInputRef as any}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) handleImageSelect(file, 'avatar')
                }}
            />
            <input
                ref={coverInputRef as any}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) handleImageSelect(file, 'cover')
                }}
            />

            <YStack maxWidth={640} alignSelf="center" width="100%" px="$4" py="$6" gap="$6">
                {/* Header */}
                <XStack alignItems="center" justifyContent="space-between">
                    <XStack alignItems="center" gap="$2">
                        <Button
                            icon={<ArrowLeft size={20} color="$onSurfaceVariant" />}
                            circular
                            size="$3"
                            bg="$surfaceContainerLow"
                            onPress={() => router.back()}
                        />
                        <SizableText size="$6" fontWeight="700" color="$onSurface">프로필 편집</SizableText>
                    </XStack>
                    <Button
                        size="$3"
                        bg="$primary"
                        borderRadius="$full"
                        onPress={handleSave}
                        disabled={isUpdating}
                    >
                        {isUpdating ? <Spinner size="small" color="white" /> : <SizableText color="white" fontWeight="600">저장</SizableText>}
                    </Button>
                </XStack>

                {/* Save Message */}
                {saveMessage && (
                    <YStack
                        bg={saveMessage.type === 'success' ? '$green3' : '$red3'}
                        p="$3"
                        borderRadius="$4"
                    >
                        <SizableText color={saveMessage.type === 'success' ? '$green11' : '$red11'} fontWeight="600">
                            {saveMessage.text}
                        </SizableText>
                    </YStack>
                )}

                {/* Cover Image */}
                <YStack bg="$surface" borderRadius="$6" overflow="hidden" elevation="$0.5">
                    <YStack
                        height={180}
                        bg="$color5"
                        justifyContent="center"
                        alignItems="center"
                        cursor="pointer"
                        position="relative"
                        onPress={() => (coverInputRef.current as any)?.click()}
                    >
                        {(coverPreview || profile.coverUrl) && (
                            <YStack position="absolute" top={0} left={0} right={0} bottom={0}>
                                {/* @ts-ignore */}
                                <img
                                    src={coverPreview || profile.coverUrl || ''}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </YStack>
                        )}
                        <YStack bg="rgba(0,0,0,0.5)" p="$2.5" borderRadius="$full" zIndex={10}>
                            <Camera size={20} color="white" />
                        </YStack>
                        <SizableText size="$2" color="white" mt="$1" zIndex={10}>커버 이미지 변경</SizableText>
                    </YStack>

                    {/* Avatar overlay */}
                    <YStack alignItems="center" mt={-50} mb="$4" zIndex={20}>
                        <YStack
                            position="relative"
                            cursor="pointer"
                            onPress={() => (avatarInputRef.current as any)?.click()}
                        >
                            <Avatar circular size="$12" borderWidth={4} borderColor="$surface">
                                <Avatar.Image
                                    width="100%"
                                    height="100%"
                                    src={avatarPreview || profile.avatarUrl || 'https://i.pravatar.cc/150'}
                                />
                                <Avatar.Fallback bg="$primaryContainer" />
                            </Avatar>
                            <YStack
                                position="absolute"
                                bottom={4}
                                right={4}
                                bg="$primary"
                                p="$2"
                                borderRadius="$full"
                                borderWidth={2}
                                borderColor="$surface"
                            >
                                <Camera size={14} color="white" />
                            </YStack>
                        </YStack>
                    </YStack>

                    <YStack px="$5" pb="$5" gap="$5">
                        {/* Username */}
                        <YStack gap="$1.5">
                            <XStack alignItems="center" gap="$1.5">
                                <User size={14} color="$onSurfaceVariant" />
                                <SizableText size="$3" fontWeight="600" color="$onSurfaceVariant">사용자 이름</SizableText>
                            </XStack>
                            <Input
                                value={username}
                                onChangeText={setUsername}
                                placeholder="이름을 입력하세요"
                                size="$4"
                                borderRadius="$4"
                            />
                        </YStack>

                        {/* Bio */}
                        <YStack gap="$1.5">
                            <XStack alignItems="center" gap="$1.5">
                                <FileText size={14} color="$onSurfaceVariant" />
                                <SizableText size="$3" fontWeight="600" color="$onSurfaceVariant">자기소개</SizableText>
                            </XStack>
                            <TextArea
                                value={bio}
                                onChangeText={setBio}
                                placeholder="자신을 소개해주세요"
                                numberOfLines={4}
                                size="$4"
                                borderRadius="$4"
                            />
                        </YStack>

                        <Separator borderColor="$outlineVariant" />

                        {/* Read-only Info */}
                        <YStack gap="$4">
                            <SizableText size="$4" fontWeight="700" color="$onSurface">계정 정보</SizableText>

                            {/* Email */}
                            <XStack alignItems="center" gap="$3">
                                <YStack bg="$surfaceContainerLow" p="$2.5" borderRadius="$full">
                                    <Mail size={18} color="$onSurfaceVariant" />
                                </YStack>
                                <YStack flex={1}>
                                    <SizableText size="$2" color="$onSurfaceVariant">이메일</SizableText>
                                    <SizableText size="$4" color="$onSurface">{profile.email || '미설정'}</SizableText>
                                </YStack>
                            </XStack>

                            {/* Role */}
                            <XStack alignItems="center" gap="$3">
                                <YStack bg="$surfaceContainerLow" p="$2.5" borderRadius="$full">
                                    <Shield size={18} color="$onSurfaceVariant" />
                                </YStack>
                                <YStack flex={1}>
                                    <SizableText size="$2" color="$onSurfaceVariant">권한</SizableText>
                                    <XStack alignItems="center" gap="$2">
                                        <SizableText size="$4" color="$onSurface">
                                            {ROLE_LABELS[profile.role] || profile.role}
                                        </SizableText>
                                        <YStack
                                            bg={profile.role === 'ADMIN' ? '$red3' : profile.role === 'EDITOR' ? '$blue3' : '$green3'}
                                            px="$2"
                                            py="$0.5"
                                            borderRadius="$full"
                                        >
                                            <SizableText
                                                size="$1"
                                                fontWeight="700"
                                                color={profile.role === 'ADMIN' ? '$red11' : profile.role === 'EDITOR' ? '$blue11' : '$green11'}
                                            >
                                                {profile.role}
                                            </SizableText>
                                        </YStack>
                                    </XStack>
                                </YStack>
                            </XStack>

                            {/* Approval Status */}
                            <XStack alignItems="center" gap="$3">
                                <YStack bg="$surfaceContainerLow" p="$2.5" borderRadius="$full">
                                    <Shield size={18} color="$onSurfaceVariant" />
                                </YStack>
                                <YStack flex={1}>
                                    <SizableText size="$2" color="$onSurfaceVariant">승인 상태</SizableText>
                                    <SizableText size="$4" color={profile.isApproved ? '$green11' : '$orange11'}>
                                        {profile.isApproved ? '승인됨' : '승인 대기중'}
                                    </SizableText>
                                </YStack>
                            </XStack>

                            {/* Join Date */}
                            <XStack alignItems="center" gap="$3">
                                <YStack bg="$surfaceContainerLow" p="$2.5" borderRadius="$full">
                                    <User size={18} color="$onSurfaceVariant" />
                                </YStack>
                                <YStack flex={1}>
                                    <SizableText size="$2" color="$onSurfaceVariant">가입일</SizableText>
                                    <SizableText size="$4" color="$onSurface">
                                        {new Date(profile.createdAt).toLocaleDateString('ko-KR', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </SizableText>
                                </YStack>
                            </XStack>
                        </YStack>
                    </YStack>
                </YStack>
            </YStack>
        </ScrollView>
    )
}
