'use client'

import React, { useState, useEffect } from 'react'
import { YStack, XStack, ScrollView, Avatar, Button, Input, TextArea, H3, SizableText, Spinner, useToastController } from '@my/ui'
import { Camera, ArrowLeft } from '@tamagui/lucide-icons'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'solito/navigation'
import { useCurrentUserProfile, useUpdateProfile } from '../../hooks/useProfiles'
import { Platform } from 'react-native'

export function EditProfileScreen() {
    const router = useRouter()
    const { data: profile, isLoading: isProfileLoading } = useCurrentUserProfile()
    const { mutateAsync: updateProfile, isPending: isUpdating } = useUpdateProfile()
    const toast = useToastController()

    const [username, setUsername] = useState('')
    const [bio, setBio] = useState('')
    const [avatarImage, setAvatarImage] = useState<{ uri: string, base64: string, ext: string } | null>(null)
    const [coverImage, setCoverImage] = useState<{ uri: string, base64: string, ext: string } | null>(null)

    useEffect(() => {
        if (profile) {
            setUsername(profile.username || '')
            setBio(profile.bio || '')
        }
    }, [profile])

    const pickImage = async (type: 'avatar' | 'cover') => {
        // Request permissions
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                toast.show('권한 오류', { message: '카메라 롤 접근 권한이 필요합니다.' });
                return;
            }
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'avatar' ? [1, 1] : [16, 9],
            quality: 0.8,
            base64: true,
        });

        const asset = result.assets?.[0];
        if (!result.canceled && asset && asset.base64) {
            const uriParts = asset.uri.split('.');
            const ext = uriParts[uriParts.length - 1] || 'jpeg';
            
            const imageData = {
                uri: asset.uri,
                base64: asset.base64 as string,
                ext,
            };

            if (type === 'avatar') {
                setAvatarImage(imageData);
            } else {
                setCoverImage(imageData);
            }
        }
    }

    const handleSave = async () => {
        try {
            await updateProfile({
                username: username !== profile?.username ? username : undefined,
                bio: bio !== profile?.bio ? bio : undefined,
                avatarBase64: avatarImage?.base64,
                avatarExt: avatarImage?.ext,
                coverBase64: coverImage?.base64,
                coverExt: coverImage?.ext,
            })
            toast.show('저장 성공', { message: '프로필이 성공적으로 업데이트되었습니다.' })
            router.back()
        } catch (error: any) {
            toast.show('오류', { message: error.message || '프로필 업데이트 중 오류가 발생했습니다.' })
        }
    }

    if (isProfileLoading) {
        return (
            <YStack flex={1} justify="center" items="center">
                <Spinner size="large" />
            </YStack>
        )
    }

    return (
        <ScrollView flex={1} bg="$background">
            <YStack p="$4" gap="$6" maxWidth={600} mx="auto" width="100%">
                
                {/* Header */}
                <XStack items="center" justify="space-between" mb="$4">
                    <Button icon={ArrowLeft} circular size="$3" bg="transparent" onPress={() => router.back()} />
                    <H3>프로필 수정</H3>
                    {isUpdating ? (
                        <Spinner />
                    ) : (
                        <Button size="$3" bg="$blue10" onPress={handleSave}>저장</Button>
                    )}
                </XStack>

                {/* Cover Image */}
                <YStack>
                    <SizableText mb="$2" fontWeight="bold">커버 이미지</SizableText>
                    <YStack 
                        height={150} 
                        bg="$color5" 
                        borderRadius="$4" 
                        overflow="hidden"
                        position="relative"
                        justify="center"
                        items="center"
                        onPress={() => pickImage('cover')}
                        cursor="pointer"
                    >
                        {(coverImage?.uri || profile?.coverUrl) ? (
                            <YStack 
                                position="absolute" 
                                top={0} left={0} right={0} bottom={0}
                                bg={coverImage?.uri ? '$color1' : '$color1'}
                            >
                                <img 
                                    src={coverImage?.uri || profile?.coverUrl || ''} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                            </YStack>
                        ) : null}
                        <YStack bg="rgba(0,0,0,0.5)" p="$2" borderRadius="$4" zIndex={10}>
                            <Camera color="white" />
                        </YStack>
                    </YStack>
                </YStack>

                {/* Avatar Image */}
                <YStack>
                    <SizableText mb="$2" fontWeight="bold">프로필 사진</SizableText>
                    <XStack justify="center">
                        <YStack position="relative" cursor="pointer" onPress={() => pickImage('avatar')}>
                            <Avatar circular size="$10">
                                <Avatar.Image src={avatarImage?.uri || profile?.avatarUrl || 'https://i.pravatar.cc/150'} />
                                <Avatar.Fallback bg="$color8" />
                            </Avatar>
                            <YStack 
                                position="absolute" bottom={0} right={0} 
                                bg="$blue10" p="$2" borderRadius="$10"
                                borderWidth={2} borderColor="$background"
                            >
                                <Camera size={16} color="white" />
                            </YStack>
                        </YStack>
                    </XStack>
                </YStack>

                {/* Form Elements */}
                <YStack gap="$2">
                    <SizableText fontWeight="bold">사용자 이름 (Username)</SizableText>
                    <Input 
                        value={username} 
                        onChangeText={setUsername} 
                        placeholder="이름을 입력하세요" 
                    />
                </YStack>

                <YStack gap="$2">
                    <SizableText fontWeight="bold">자기소개 (Bio)</SizableText>
                    <TextArea 
                        value={bio} 
                        onChangeText={setBio} 
                        placeholder="자신을 소개해주세요" 
                        numberOfLines={4}
                    />
                </YStack>

            </YStack>
        </ScrollView>
    )
}
