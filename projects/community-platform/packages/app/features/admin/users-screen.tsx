'use client'

import { useState } from 'react'
import { YStack, XStack, H3, Avatar, SizableText, Button, Separator, Spinner, Input, TextArea } from '@my/ui'
import { Edit3, Trash2, Search, Check, X, MessageCircle, ChevronDown, ChevronUp } from '@tamagui/lucide-icons'
import { useProfiles, useDeleteProfile, useUpdateProfileRole, useAdminUpdateProfile, UserRoleType, Profile } from '../../hooks/useProfiles'
import { useCreateOrGetChannel } from '../../hooks/useChat'
import { useRouter } from 'solito/navigation'

const ROLE_LABELS: Record<string, string> = {
    MEMBER: '멤버',
    EDITOR: '편집자',
    ADMIN: '관리자',
}


export function AdminUsersScreen() {
    const { data: users, isLoading } = useProfiles()
    const { mutate: deleteProfile } = useDeleteProfile()
    const { mutate: updateRole } = useUpdateProfileRole()
    const { mutate: updateProfile } = useAdminUpdateProfile()
    const { mutate: createOrGetChannel } = useCreateOrGetChannel()
    const router = useRouter()

    const [searchQuery, setSearchQuery] = useState('')
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
    const [editingUserId, setEditingUserId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({
        username: '',
        email: '',
        bio: '',
        church: '',
        churchRole: '',
    })
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    const filteredUsers = users?.filter((u) => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase()
        return (
            u.username?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.church?.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q)
        )
    })

    const startEdit = (user: Profile) => {
        setEditingUserId(user.id)
        setEditForm({
            username: user.username || '',
            email: user.email || '',
            bio: user.bio || '',
            church: user.church || '',
            churchRole: user.churchRole || '',
        })
        setExpandedUserId(user.id)
    }

    const saveEdit = (userId: string) => {
        if (!editForm.username.trim()) return
        updateProfile({
            profileId: userId,
            username: editForm.username,
            email: editForm.email,
            bio: editForm.bio,
            church: editForm.church,
            churchRole: editForm.churchRole,
        }, {
            onSuccess: () => setEditingUserId(null)
        })
    }

    const handleRoleChange = (userId: string, newRole: UserRoleType) => {
        updateRole({ profileId: userId, role: newRole })
    }

    const handleToggleApprove = (userId: string, currentStatus: boolean) => {
        updateProfile({ profileId: userId, isApproved: !currentStatus })
    }

    const handleSendMessage = (targetProfileId: string) => {
        createOrGetChannel(targetProfileId, {
            onSuccess: (channel: any) => {
                router.push(`/messages/${channel.id}`)
            }
        })
    }

    const handleDelete = (userId: string) => {
        if (confirmDeleteId === userId) {
            deleteProfile(userId)
            setConfirmDeleteId(null)
        } else {
            setConfirmDeleteId(userId)
            setTimeout(() => setConfirmDeleteId(null), 3000)
        }
    }

    const totalUsers = users?.length || 0
    const approvedCount = users?.filter(u => u.isApproved).length || 0
    const adminCount = users?.filter(u => u.role === 'ADMIN').length || 0
    const editorCount = users?.filter(u => u.role === 'EDITOR').length || 0

    return (
        <YStack flex={1} gap="$5">
            {/* Header */}
            <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
                <YStack>
                    <H3 color="$textMain" fontWeight="bold">사용자 관리</H3>
                    <SizableText size="$2" color="$textMuted">전체 {totalUsers}명 | 승인 {approvedCount}명 | 관리자 {adminCount}명 | 편집자 {editorCount}명</SizableText>
                </YStack>
            </XStack>

            {/* Search */}
            <XStack bg="$surface" borderRadius="$4" borderWidth={1} borderColor="$borderLight" alignItems="center" px="$3">
                <Search size={18} color="$textMuted" />
                <Input
                    flex={1}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="이름, 이메일, 교회로 검색..."
                    size="$4"
                    borderWidth={0}
                    bg="transparent"
                />
                {searchQuery && (
                    <Button size="$2" circular bg="transparent" icon={<X size={14} />} onPress={() => setSearchQuery('')} />
                )}
            </XStack>

            {/* User Cards */}
            {isLoading ? (
                <YStack p="$8" alignItems="center">
                    <Spinner size="large" color="$primary" />
                </YStack>
            ) : filteredUsers?.length === 0 ? (
                <YStack p="$8" alignItems="center" bg="$surface" borderRadius="$4">
                    <SizableText color="$textMuted">검색 결과가 없습니다.</SizableText>
                </YStack>
            ) : (
                <YStack gap="$3">
                    {filteredUsers?.map((user) => {
                        const isExpanded = expandedUserId === user.id
                        const isEditing = editingUserId === user.id
                        const roleBg = user.role === 'ADMIN' ? '$red3' as const : user.role === 'EDITOR' ? '$blue3' as const : '$green3' as const
                        const roleText = user.role === 'ADMIN' ? '$red11' as const : user.role === 'EDITOR' ? '$blue11' as const : '$green11' as const

                        return (
                            <YStack
                                key={user.id}
                                bg="$surface"
                                borderRadius="$5"
                                borderWidth={1}
                                borderColor={isExpanded ? '$primary' : '$borderLight'}
                                overflow="hidden"
                            >
                                {/* User Row - Collapsed */}
                                <XStack
                                    p="$4"
                                    alignItems="center"
                                    gap="$3"
                                    cursor="pointer"
                                    hoverStyle={{ bg: '$surfaceHover' }}
                                    onPress={() => setExpandedUserId(isExpanded ? null : user.id)}
                                >
                                    {/* Avatar */}
                                    <Avatar circular size="$5" bg="$primaryContainer">
                                        {user.avatarUrl ? (
                                            <Avatar.Image width="100%" height="100%" src={user.avatarUrl} />
                                        ) : null}
                                        <Avatar.Fallback bg="$primaryContainer">
                                            <SizableText color="$primary" fontWeight="700">
                                                {(user.username || '?')[0]?.toUpperCase()}
                                            </SizableText>
                                        </Avatar.Fallback>
                                    </Avatar>

                                    {/* Info */}
                                    <YStack flex={1} gap="$0.5">
                                        <XStack alignItems="center" gap="$2">
                                            <SizableText size="$4" fontWeight="700" color="$textMain">
                                                {user.username || '이름 없음'}
                                            </SizableText>
                                            <YStack bg={roleBg} px="$2" py="$0.5" borderRadius="$full">
                                                <SizableText size="$1" fontWeight="700" color={roleText}>
                                                    {ROLE_LABELS[user.role] || user.role}
                                                </SizableText>
                                            </YStack>
                                            {!user.isApproved && (
                                                <YStack bg="$orange3" px="$2" py="$0.5" borderRadius="$full">
                                                    <SizableText size="$1" fontWeight="700" color="$orange11">대기중</SizableText>
                                                </YStack>
                                            )}
                                        </XStack>
                                        <SizableText size="$2" color="$textMuted">
                                            {user.email || '이메일 없음'}
                                            {user.church ? ` · ${user.church}` : ''}
                                            {user.churchRole ? ` (${user.churchRole})` : ''}
                                        </SizableText>
                                    </YStack>

                                    {/* Quick Actions */}
                                    <XStack gap="$2" alignItems="center">
                                        <Button
                                            size="$2"
                                            bg={user.isApproved ? '$green3' : '$orange3'}
                                            borderRadius="$full"
                                            onPress={(e: any) => { e.stopPropagation(); handleToggleApprove(user.id, user.isApproved) }}
                                        >
                                            <SizableText size="$1" fontWeight="600" color={user.isApproved ? '$green11' : '$orange11'}>
                                                {user.isApproved ? '승인됨' : '승인'}
                                            </SizableText>
                                        </Button>
                                        {isExpanded ? <ChevronUp size={18} color="$textMuted" /> : <ChevronDown size={18} color="$textMuted" />}
                                    </XStack>
                                </XStack>

                                {/* Expanded Detail */}
                                {isExpanded && (
                                    <YStack borderTopWidth={1} borderColor="$borderLight">
                                        {isEditing ? (
                                            /* Edit Mode */
                                            <YStack p="$4" gap="$4">
                                                <SizableText size="$4" fontWeight="700" color="$textMain">프로필 편집</SizableText>

                                                <XStack gap="$4" flexWrap="wrap">
                                                    <YStack flex={1} minWidth={200} gap="$1.5">
                                                        <SizableText size="$2" color="$textMuted" fontWeight="600">이름</SizableText>
                                                        <Input
                                                            size="$3"
                                                            value={editForm.username}
                                                            onChangeText={(v: string) => setEditForm(f => ({ ...f, username: v }))}
                                                            placeholder="사용자 이름"
                                                        />
                                                    </YStack>
                                                    <YStack flex={1} minWidth={200} gap="$1.5">
                                                        <SizableText size="$2" color="$textMuted" fontWeight="600">이메일</SizableText>
                                                        <Input
                                                            size="$3"
                                                            value={editForm.email}
                                                            onChangeText={(v: string) => setEditForm(f => ({ ...f, email: v }))}
                                                            placeholder="이메일 주소"
                                                            keyboardType="email-address"
                                                        />
                                                    </YStack>
                                                </XStack>

                                                <XStack gap="$4" flexWrap="wrap">
                                                    <YStack flex={1} minWidth={200} gap="$1.5">
                                                        <SizableText size="$2" color="$textMuted" fontWeight="600">출석교회</SizableText>
                                                        <Input
                                                            size="$3"
                                                            value={editForm.church}
                                                            onChangeText={(v: string) => setEditForm(f => ({ ...f, church: v }))}
                                                            placeholder="출석교회명"
                                                        />
                                                    </YStack>
                                                </XStack>

                                                <XStack gap="$4" flexWrap="wrap">
                                                    <YStack flex={1} minWidth={200} gap="$1.5">
                                                        <SizableText size="$2" color="$textMuted" fontWeight="600">직분 / 교단</SizableText>
                                                        <Input
                                                            size="$3"
                                                            value={editForm.churchRole}
                                                            onChangeText={(v: string) => setEditForm(f => ({ ...f, churchRole: v }))}
                                                            placeholder="직분 (예: 집사, 장로)"
                                                        />
                                                    </YStack>
                                                    <YStack flex={1} minWidth={200} gap="$1.5">
                                                        <SizableText size="$2" color="$textMuted" fontWeight="600">역할 변경</SizableText>
                                                        <XStack gap="$2">
                                                            {(['MEMBER', 'EDITOR', 'ADMIN'] as UserRoleType[]).map(role => {
                                                                const isActive = user.role === role
                                                                const rcBg = role === 'ADMIN' ? '$red3' as const : role === 'EDITOR' ? '$blue3' as const : '$green3' as const
                                                                const rcText = role === 'ADMIN' ? '$red11' as const : role === 'EDITOR' ? '$blue11' as const : '$green11' as const
                                                                return (
                                                                    <Button
                                                                        key={role}
                                                                        size="$3"
                                                                        bg={isActive ? rcBg : '$surfaceHover'}
                                                                        borderWidth={isActive ? 2 : 1}
                                                                        borderColor={isActive ? rcText : '$borderLight'}
                                                                        borderRadius="$3"
                                                                        onPress={() => handleRoleChange(user.id, role)}
                                                                        flex={1}
                                                                    >
                                                                        <SizableText size="$2" fontWeight="600" color={isActive ? rcText : '$textMuted'}>
                                                                            {ROLE_LABELS[role]}
                                                                        </SizableText>
                                                                    </Button>
                                                                )
                                                            })}
                                                        </XStack>
                                                    </YStack>
                                                </XStack>

                                                <YStack gap="$1.5">
                                                    <SizableText size="$2" color="$textMuted" fontWeight="600">자기소개</SizableText>
                                                    <TextArea
                                                        size="$3"
                                                        value={editForm.bio}
                                                        onChangeText={(v: string) => setEditForm(f => ({ ...f, bio: v }))}
                                                        placeholder="자기소개"
                                                        numberOfLines={3}
                                                    />
                                                </YStack>

                                                <XStack justifyContent="flex-end" gap="$2" mt="$2">
                                                    <Button
                                                        size="$3"
                                                        bg="$surfaceHover"
                                                        borderRadius="$full"
                                                        icon={<X size={16} />}
                                                        onPress={() => setEditingUserId(null)}
                                                    >
                                                        <SizableText color="$textMuted">취소</SizableText>
                                                    </Button>
                                                    <Button
                                                        size="$3"
                                                        bg="$primary"
                                                        borderRadius="$full"
                                                        icon={<Check size={16} color="white" />}
                                                        onPress={() => saveEdit(user.id)}
                                                    >
                                                        <SizableText color="white" fontWeight="600">저장</SizableText>
                                                    </Button>
                                                </XStack>
                                            </YStack>
                                        ) : (
                                            /* Detail View */
                                            <YStack p="$4" gap="$4">
                                                {/* Detail Info */}
                                                <XStack gap="$6" flexWrap="wrap">
                                                    <YStack flex={1} minWidth={200} gap="$3">
                                                        <YStack gap="$1">
                                                            <SizableText size="$2" color="$textMuted">이메일</SizableText>
                                                            <SizableText size="$3" color="$textMain">{user.email || '미설정'}</SizableText>
                                                        </YStack>
                                                        <YStack gap="$1">
                                                            <SizableText size="$2" color="$textMuted">출석교회</SizableText>
                                                            <SizableText size="$3" color="$textMain">{user.church || '미설정'}</SizableText>
                                                        </YStack>
                                                        <YStack gap="$1">
                                                            <SizableText size="$2" color="$textMuted">직분</SizableText>
                                                            <SizableText size="$3" color="$textMain">{user.churchRole || '미설정'}</SizableText>
                                                        </YStack>
                                                    </YStack>
                                                    <YStack flex={1} minWidth={200} gap="$3">
                                                        <YStack gap="$1">
                                                            <SizableText size="$2" color="$textMuted">자기소개</SizableText>
                                                            <SizableText size="$3" color="$textMain">{user.bio || '미설정'}</SizableText>
                                                        </YStack>
                                                        <YStack gap="$1">
                                                            <SizableText size="$2" color="$textMuted">가입일</SizableText>
                                                            <SizableText size="$3" color="$textMain">
                                                                {new Date(user.createdAt).toLocaleDateString('ko-KR', {
                                                                    year: 'numeric', month: 'long', day: 'numeric'
                                                                })}
                                                            </SizableText>
                                                        </YStack>
                                                        <YStack gap="$1">
                                                            <SizableText size="$2" color="$textMuted">승인 상태</SizableText>
                                                            <SizableText size="$3" color={user.isApproved ? '$green11' : '$orange11'}>
                                                                {user.isApproved ? '승인됨' : '승인 대기중'}
                                                            </SizableText>
                                                        </YStack>
                                                    </YStack>
                                                </XStack>

                                                <Separator borderColor="$borderLight" />

                                                {/* Action Buttons */}
                                                <XStack gap="$2" flexWrap="wrap">
                                                    <Button
                                                        size="$3"
                                                        bg="$surfaceHover"
                                                        borderRadius="$full"
                                                        icon={<Edit3 size={16} color="$textMain" />}
                                                        onPress={() => startEdit(user)}
                                                    >
                                                        <SizableText color="$textMain" fontWeight="600">편집</SizableText>
                                                    </Button>
                                                    <Button
                                                        size="$3"
                                                        bg="$blue3"
                                                        borderRadius="$full"
                                                        icon={<MessageCircle size={16} color="$blue11" />}
                                                        onPress={() => handleSendMessage(user.id)}
                                                    >
                                                        <SizableText color="$blue11" fontWeight="600">메시지</SizableText>
                                                    </Button>
                                                    <YStack flex={1} />
                                                    <Button
                                                        size="$3"
                                                        bg={confirmDeleteId === user.id ? '$red10' : '$red3'}
                                                        borderRadius="$full"
                                                        icon={<Trash2 size={16} color={confirmDeleteId === user.id ? 'white' : '$red11'} />}
                                                        onPress={() => handleDelete(user.id)}
                                                    >
                                                        <SizableText
                                                            color={confirmDeleteId === user.id ? 'white' : '$red11'}
                                                            fontWeight="600"
                                                        >
                                                            {confirmDeleteId === user.id ? '정말 삭제?' : '계정 삭제'}
                                                        </SizableText>
                                                    </Button>
                                                </XStack>
                                            </YStack>
                                        )}
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
