'use client'

import React, { useState } from 'react'
import { YStack, XStack, H3, Avatar, SizableText, Button, Separator, Spinner, Input } from '@my/ui'
import { Edit3, Shield, Trash2, Search, ArrowUpCircle, Check, X } from '@tamagui/lucide-icons'
import { useProfiles, useDeleteProfile, useUpdateProfileRole, useAdminUpdateProfile, UserRoleType, Profile } from '../../hooks/useProfiles'

export function AdminUsersScreen() {
    const { data: users, isLoading } = useProfiles()
    const { mutate: deleteProfile } = useDeleteProfile()
    const { mutate: updateRole } = useUpdateProfileRole()
    const { mutate: updateProfile } = useAdminUpdateProfile()

    const [editingUserId, setEditingUserId] = useState<string | null>(null)
    const [editUsername, setEditUsername] = useState('')
    const [editChurch, setEditChurch] = useState('')
    const [editChurchRole, setEditChurchRole] = useState('')

    const handleCycleRole = (id: string, currentRole: UserRoleType) => {
        let nextRole: UserRoleType = 'MEMBER'
        if (currentRole === 'MEMBER') nextRole = 'EDITOR'
        else if (currentRole === 'EDITOR') nextRole = 'ADMIN'
        else nextRole = 'MEMBER'

        updateRole({ profileId: id, role: nextRole })
    }

    const startEdit = (user: Profile) => {
        setEditingUserId(user.id)
        setEditUsername(user.username || '')
        setEditChurch(user.church || '')
        setEditChurchRole(user.churchRole || '')
    }

    const saveEdit = (userId: string) => {
        if (!editUsername.trim()) return
        updateProfile({ profileId: userId, username: editUsername, church: editChurch, churchRole: editChurchRole }, {
            onSuccess: () => setEditingUserId(null)
        })
    }
    
    const handleToggleApprove = (userId: string, currentStatus: boolean) => {
        updateProfile({ profileId: userId, isApproved: !currentStatus })
    }

    return (
        <YStack flex={1} gap="$6">
            <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$4">
                <H3 color="$textMain" fontWeight="bold">User Management</H3>
                <XStack gap="$3">
                    <Button size="$3" bg="$surface" borderWidth={1} borderColor="$borderLight" icon={Search}>
                        <SizableText color="$textMain">Search Users</SizableText>
                    </Button>
                    <Button size="$3" bg="$primary" icon={Shield}>
                        <SizableText color="white">Add New Roles</SizableText>
                    </Button>
                </XStack>
            </XStack>

            <YStack bg="$surface" borderRadius="$card" borderWidth={1} borderColor="$borderLight" overflow="hidden">
                {/* Table Header */}
                <XStack bg="$surfaceHover" p="$4" borderBottomWidth={1} borderColor="$borderLight" px="$6">
                    <YStack flex={2}><SizableText size="$3" fontWeight="bold" color="$textMuted">USER</SizableText></YStack>
                    <YStack flex={1}><SizableText size="$3" fontWeight="bold" color="$textMuted">ROLE</SizableText></YStack>
                    <YStack flex={1}><SizableText size="$3" fontWeight="bold" color="$textMuted">STATUS</SizableText></YStack>
                    <YStack flex={1} alignItems="flex-end"><SizableText size="$3" fontWeight="bold" color="$textMuted">ACTIONS</SizableText></YStack>
                </XStack>

                {/* Table Body */}
                {isLoading ? (
                    <YStack p="$6" alignItems="center">
                        <Spinner size="large" color="$primary" />
                    </YStack>
                ) : (
                    users?.map((user, idx) => (
                        <YStack key={user.id}>
                            {editingUserId === user.id ? (
                                <XStack p="$4" px="$6" alignItems="center" gap="$4">
                                    <XStack flex={2} gap="$3" alignItems="center">
                                        <YStack flex={1} gap="$2">
                                            <Input 
                                                size="$3" 
                                                value={editUsername} 
                                                onChangeText={setEditUsername} 
                                                bg="$backgroundBody"
                                                placeholder="이름"
                                            />
                                            <Input 
                                                size="$3" 
                                                value={editChurch} 
                                                onChangeText={setEditChurch} 
                                                bg="$backgroundBody"
                                                placeholder="출석교회"
                                            />
                                            <Input 
                                                size="$3" 
                                                value={editChurchRole} 
                                                onChangeText={setEditChurchRole} 
                                                bg="$backgroundBody"
                                                placeholder="직분"
                                            />
                                        </YStack>
                                    </XStack>
                                    <YStack flex={1} />
                                    <YStack flex={1} />
                                    <XStack flex={1} justifyContent="flex-end" gap="$2">
                                        <Button size="$3" circular bg="$color5" icon={<X size={16} />} onPress={() => setEditingUserId(null)} />
                                        <Button size="$3" circular bg="$primary" icon={<Check size={16} color="white" />} onPress={() => saveEdit(user.id)} />
                                    </XStack>
                                </XStack>
                            ) : (
                                <XStack p="$4" px="$6" alignItems="center">
                                    <XStack flex={2} gap="$3" alignItems="center">
                                        <Avatar circular size="$4" bg="$color5">
                                            <Avatar.Fallback bg="$color5" />
                                        </Avatar>
                                        <YStack>
                                            <SizableText size="$3" fontWeight="bold" color="$textMain">{user.username}</SizableText>
                                            <SizableText size="$2" color="$textMuted">{user.email || 'No Email'}</SizableText>
                                            <SizableText size="$2" color="$color10" mt="$1">교회: {user.church || '-'} | 직분: {user.churchRole || '-'}</SizableText>
                                        </YStack>
                                    </XStack>
                                    
                                    <YStack flex={1} justifyContent="center" alignItems="flex-start">
                                        <Button 
                                            size="$2" 
                                            bg={user.role === 'ADMIN' ? '$red5' : user.role === 'EDITOR' ? '$blue5' : '$color5'} 
                                            iconAfter={ArrowUpCircle}
                                            onPress={() => handleCycleRole(user.id, user.role)}
                                        >
                                            <SizableText color={user.role === 'MEMBER' ? '$textMain' : 'white'}>{user.role}</SizableText>
                                        </Button>
                                    </YStack>

                                    <YStack flex={1} justifyContent="center" gap="$2">
                                        <XStack bg={user.isApproved ? "$green4" : "$red4"} px="$2" py="$1" borderRadius={4} alignSelf="flex-start">
                                            <SizableText size="$2" color={user.isApproved ? "$green10" : "$red10"}>
                                                {user.isApproved ? 'Approved' : 'Pending'}
                                            </SizableText>
                                        </XStack>
                                        <Button size="$2" bg="$surfaceHover" onPress={() => handleToggleApprove(user.id, user.isApproved)}>
                                            <SizableText size="$2">{user.isApproved ? '권한 회수' : '가입 승인'}</SizableText>
                                        </Button>
                                    </YStack>

                                    <XStack flex={1} justifyContent="flex-end" gap="$2">
                                        <Button size="$3" circular bg="transparent" icon={<Edit3 size={16} color="$textMain" />} onPress={() => startEdit(user)} />
                                        <Button size="$3" circular bg="transparent" hoverStyle={{ bg: '$red4' }} onPress={() => deleteProfile(user.id)} icon={<Trash2 size={16} color="red" />} />
                                    </XStack>
                                </XStack>
                            )}
                            {idx < users.length - 1 && <Separator borderColor="$borderLight" opacity={0.3} />}
                        </YStack>
                    ))
                )}
            </YStack>
        </YStack>
    )
}
