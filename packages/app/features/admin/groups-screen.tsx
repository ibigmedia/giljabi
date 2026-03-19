'use client'

import { useState } from 'react'
import { YStack, XStack, SizableText, Button, Input, Separator, Spinner, Avatar, Paragraph } from '@my/ui'
import { Users, Plus, Trash2, Edit3, ChevronDown, ChevronUp, Lock, Globe, Shield, Crown, User, X } from '@tamagui/lucide-icons'
import { useAdminGroups, useCreateGroup, useUpdateGroup, useDeleteGroup, useRemoveGroupMember, useUpdateMemberRole } from '../../hooks/useGroup'

type EditingGroup = { id: string; name: string; description: string; isPrivate: boolean } | null

export function AdminGroupsScreen() {
    const { data: groups, isLoading } = useAdminGroups()
    const { mutate: createGroup, isPending: isCreating } = useCreateGroup()
    const { mutate: updateGroup } = useUpdateGroup()
    const { mutate: deleteGroup } = useDeleteGroup()
    const { mutate: removeMember } = useRemoveGroupMember()
    const { mutate: updateRole } = useUpdateMemberRole()

    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [editing, setEditing] = useState<EditingGroup>(null)
    const [showCreate, setShowCreate] = useState(false)
    const [newGroup, setNewGroup] = useState({ name: '', description: '', isPrivate: false })
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const handleCreate = () => {
        if (!newGroup.name.trim()) return
        createGroup(newGroup, {
            onSuccess: () => {
                setNewGroup({ name: '', description: '', isPrivate: false })
                setShowCreate(false)
            }
        })
    }

    const handleUpdate = () => {
        if (!editing) return
        updateGroup(editing, { onSuccess: () => setEditing(null) })
    }

    const handleDelete = (id: string) => {
        if (deleteConfirm === id) {
            deleteGroup(id)
            setDeleteConfirm(null)
            setExpandedId(null)
        } else {
            setDeleteConfirm(id)
            setTimeout(() => setDeleteConfirm(null), 3000)
        }
    }

    const totalMembers = groups?.reduce((sum, g) => sum + (g.members?.length || 0), 0) || 0

    return (
        <YStack gap="$5" flex={1}>
            {/* Header */}
            <XStack justifyContent="space-between" alignItems="center">
                <YStack>
                    <SizableText size="$7" fontWeight="800" color="$textMain">그룹 관리</SizableText>
                    <SizableText size="$3" color="$textMuted">
                        {groups?.length || 0}개 그룹 · 총 {totalMembers}명 멤버
                    </SizableText>
                </YStack>
                <Button
                    bg="$primary"
                    borderRadius="$button"
                    icon={<Plus size={16} color="white" />}
                    onPress={() => setShowCreate(!showCreate)}
                >
                    <SizableText color="white" fontWeight="600">새 그룹</SizableText>
                </Button>
            </XStack>

            {/* Create Form */}
            {showCreate && (
                <YStack bg="$surface" p="$5" borderRadius="$card" borderWidth={1} borderColor="$primary" gap="$3">
                    <SizableText size="$4" fontWeight="700" color="$textMain">새 그룹 만들기</SizableText>
                    <Input
                        placeholder="그룹 이름"
                        value={newGroup.name}
                        onChangeText={(t) => setNewGroup(p => ({ ...p, name: t }))}
                        bg="$surfaceContainerLow"
                        borderWidth={1}
                        borderColor="$borderLight"
                    />
                    <Input
                        placeholder="그룹 설명"
                        value={newGroup.description}
                        onChangeText={(t) => setNewGroup(p => ({ ...p, description: t }))}
                        bg="$surfaceContainerLow"
                        borderWidth={1}
                        borderColor="$borderLight"
                    />
                    <XStack gap="$3" alignItems="center">
                        <Button
                            size="$3"
                            bg={newGroup.isPrivate ? '$primary' : '$surfaceContainerLow'}
                            borderWidth={1}
                            borderColor={newGroup.isPrivate ? '$primary' : '$borderLight'}
                            onPress={() => setNewGroup(p => ({ ...p, isPrivate: !p.isPrivate }))}
                            icon={newGroup.isPrivate ? <Lock size={14} color="white" /> : <Globe size={14} color="$textMuted" />}
                        >
                            <SizableText color={newGroup.isPrivate ? 'white' : '$textMuted'} size="$3">
                                {newGroup.isPrivate ? '비공개' : '공개'}
                            </SizableText>
                        </Button>
                    </XStack>
                    <XStack gap="$3" justifyContent="flex-end">
                        <Button size="$3" bg="$surfaceContainerLow" onPress={() => setShowCreate(false)}>
                            <SizableText color="$textMuted">취소</SizableText>
                        </Button>
                        <Button size="$3" bg="$primary" onPress={handleCreate} disabled={isCreating || !newGroup.name.trim()}>
                            {isCreating ? <Spinner size="small" color="white" /> : <SizableText color="white" fontWeight="600">만들기</SizableText>}
                        </Button>
                    </XStack>
                </YStack>
            )}

            {/* Groups List */}
            {isLoading ? (
                <YStack p="$8" alignItems="center"><Spinner size="large" color="$primary" /></YStack>
            ) : !groups?.length ? (
                <YStack bg="$surface" p="$8" borderRadius="$card" alignItems="center" gap="$3">
                    <Users size={40} color="$textMuted" />
                    <SizableText color="$textMuted" size="$4">생성된 그룹이 없습니다</SizableText>
                </YStack>
            ) : (
                <YStack gap="$3">
                    {groups.map(group => {
                        const isExpanded = expandedId === group.id
                        const isEditing = editing?.id === group.id
                        const memberCount = group.members?.length || 0
                        const admins = group.members?.filter(m => m.role === 'ADMIN') || []

                        return (
                            <YStack key={group.id} bg="$surface" borderRadius="$card" borderWidth={1} borderColor="$borderLight" overflow="hidden">
                                {/* Group Header Row */}
                                <XStack
                                    p="$4"
                                    alignItems="center"
                                    gap="$3"
                                    cursor="pointer"
                                    hoverStyle={{ bg: '$surfaceHover' }}
                                    onPress={() => setExpandedId(isExpanded ? null : group.id)}
                                >
                                    <Avatar circular size="$5" bg="$primaryContainer">
                                        <Avatar.Image width="100%" height="100%" src={`https://picsum.photos/seed/${group.id}/200`} />
                                        <Avatar.Fallback bg="$primaryContainer" />
                                    </Avatar>
                                    <YStack flex={1}>
                                        <XStack gap="$2" alignItems="center">
                                            <SizableText size="$5" fontWeight="700" color="$textMain">{group.name}</SizableText>
                                            {group.isPrivate ? <Lock size={14} color="$textMuted" /> : <Globe size={14} color="$textMuted" />}
                                        </XStack>
                                        <SizableText size="$2" color="$textMuted" numberOfLines={1}>
                                            {group.description || '설명 없음'} · {memberCount}명
                                        </SizableText>
                                    </YStack>

                                    {/* Member avatars stack */}
                                    <XStack>
                                        {group.members?.slice(0, 4).map((m, i) => (
                                            <Avatar key={m.id} circular size="$2.5" marginLeft={i > 0 ? -8 : 0} borderWidth={2} borderColor="$surface">
                                                <Avatar.Image width="100%" height="100%" src={m.profile?.avatarUrl || `https://i.pravatar.cc/100?u=${m.id}`} />
                                                <Avatar.Fallback bg="$primaryContainer" />
                                            </Avatar>
                                        ))}
                                        {memberCount > 4 && (
                                            <YStack marginLeft={-8} width={28} height={28} borderRadius={14} bg="$primaryContainer" alignItems="center" justifyContent="center" borderWidth={2} borderColor="$surface">
                                                <SizableText size="$1" fontWeight="700" color="$primary">+{memberCount - 4}</SizableText>
                                            </YStack>
                                        )}
                                    </XStack>

                                    {isExpanded ? <ChevronUp size={20} color="$textMuted" /> : <ChevronDown size={20} color="$textMuted" />}
                                </XStack>

                                {/* Expanded Detail */}
                                {isExpanded && (
                                    <YStack borderTopWidth={1} borderColor="$borderLight">
                                        {/* Edit / Actions */}
                                        <YStack p="$4" gap="$3">
                                            {isEditing ? (
                                                <YStack gap="$3">
                                                    <Input
                                                        value={editing.name}
                                                        onChangeText={(t) => setEditing(p => p ? { ...p, name: t } : p)}
                                                        bg="$surfaceContainerLow"
                                                        borderWidth={1}
                                                        borderColor="$borderLight"
                                                        placeholder="그룹 이름"
                                                    />
                                                    <Input
                                                        value={editing.description}
                                                        onChangeText={(t) => setEditing(p => p ? { ...p, description: t } : p)}
                                                        bg="$surfaceContainerLow"
                                                        borderWidth={1}
                                                        borderColor="$borderLight"
                                                        placeholder="설명"
                                                    />
                                                    <XStack gap="$3">
                                                        <Button
                                                            size="$3"
                                                            bg={editing.isPrivate ? '$primary' : '$surfaceContainerLow'}
                                                            borderWidth={1}
                                                            borderColor={editing.isPrivate ? '$primary' : '$borderLight'}
                                                            onPress={() => setEditing(p => p ? { ...p, isPrivate: !p.isPrivate } : p)}
                                                            icon={editing.isPrivate ? <Lock size={14} color="white" /> : <Globe size={14} color="$textMuted" />}
                                                        >
                                                            <SizableText color={editing.isPrivate ? 'white' : '$textMuted'} size="$3">
                                                                {editing.isPrivate ? '비공개' : '공개'}
                                                            </SizableText>
                                                        </Button>
                                                        <XStack flex={1} />
                                                        <Button size="$3" bg="$surfaceContainerLow" onPress={() => setEditing(null)}>
                                                            <SizableText color="$textMuted">취소</SizableText>
                                                        </Button>
                                                        <Button size="$3" bg="$primary" onPress={handleUpdate}>
                                                            <SizableText color="white" fontWeight="600">저장</SizableText>
                                                        </Button>
                                                    </XStack>
                                                </YStack>
                                            ) : (
                                                <XStack gap="$2">
                                                    <Button
                                                        size="$3"
                                                        bg="$surfaceContainerLow"
                                                        icon={<Edit3 size={14} color="$primary" />}
                                                        onPress={() => setEditing({ id: group.id, name: group.name, description: group.description || '', isPrivate: group.isPrivate })}
                                                    >
                                                        <SizableText color="$primary" size="$3">편집</SizableText>
                                                    </Button>
                                                    <Button
                                                        size="$3"
                                                        bg={deleteConfirm === group.id ? '$red10' : '$surfaceContainerLow'}
                                                        icon={<Trash2 size={14} color={deleteConfirm === group.id ? 'white' : '$red10'} />}
                                                        onPress={() => handleDelete(group.id)}
                                                    >
                                                        <SizableText color={deleteConfirm === group.id ? 'white' : '$red10'} size="$3">
                                                            {deleteConfirm === group.id ? '확인 삭제' : '삭제'}
                                                        </SizableText>
                                                    </Button>
                                                </XStack>
                                            )}
                                        </YStack>

                                        {/* Members */}
                                        <Separator borderColor="$borderLight" />
                                        <YStack p="$4" gap="$3">
                                            <SizableText size="$4" fontWeight="700" color="$textMain">멤버 ({memberCount})</SizableText>
                                            {group.members?.length === 0 ? (
                                                <SizableText color="$textMuted" size="$3">멤버가 없습니다</SizableText>
                                            ) : (
                                                <YStack gap="$2">
                                                    {group.members?.map(member => {
                                                        const RoleIcon = member.role === 'ADMIN' ? Crown : member.role === 'MODERATOR' ? Shield : User
                                                        const roleColor = member.role === 'ADMIN' ? '$orange10' : member.role === 'MODERATOR' ? '$blue10' : '$textMuted'
                                                        const roleLabel = member.role === 'ADMIN' ? '관리자' : member.role === 'MODERATOR' ? '모더레이터' : '멤버'

                                                        return (
                                                            <XStack key={member.id} alignItems="center" gap="$3" p="$2" borderRadius="$3" hoverStyle={{ bg: '$surfaceHover' }}>
                                                                <Avatar circular size="$3.5" bg="$primaryContainer">
                                                                    <Avatar.Image width="100%" height="100%" src={member.profile?.avatarUrl || `https://i.pravatar.cc/100?u=${member.id}`} />
                                                                    <Avatar.Fallback bg="$primaryContainer" />
                                                                </Avatar>
                                                                <YStack flex={1}>
                                                                    <SizableText size="$3" fontWeight="600" color="$textMain">
                                                                        {member.profile?.username || '알 수 없음'}
                                                                    </SizableText>
                                                                    <XStack gap="$1.5" alignItems="center">
                                                                        <RoleIcon size={12} color={roleColor} />
                                                                        <SizableText size="$2" color={roleColor}>{roleLabel}</SizableText>
                                                                    </XStack>
                                                                </YStack>

                                                                {/* Role switcher */}
                                                                <XStack gap="$1">
                                                                    {(['ADMIN', 'MODERATOR', 'MEMBER'] as const).map(role => (
                                                                        <Button
                                                                            key={role}
                                                                            size="$2"
                                                                            bg={member.role === role ? '$primary' : '$surfaceContainerLow'}
                                                                            borderRadius="$2"
                                                                            onPress={() => updateRole({ memberId: member.id, role })}
                                                                            paddingHorizontal="$2"
                                                                        >
                                                                            <SizableText size="$1" color={member.role === role ? 'white' : '$textMuted'}>
                                                                                {role === 'ADMIN' ? 'A' : role === 'MODERATOR' ? 'M' : 'U'}
                                                                            </SizableText>
                                                                        </Button>
                                                                    ))}
                                                                </XStack>

                                                                {/* Remove member */}
                                                                <Button
                                                                    size="$2"
                                                                    bg="transparent"
                                                                    circular
                                                                    icon={<X size={14} color="$red10" />}
                                                                    onPress={() => removeMember({ memberId: member.id, groupId: group.id })}
                                                                />
                                                            </XStack>
                                                        )
                                                    })}
                                                </YStack>
                                            )}
                                        </YStack>
                                    </YStack>
                                )}
                            </YStack>
                        )
                    })}
                </YStack>
            )}
        </YStack>
    )
}
