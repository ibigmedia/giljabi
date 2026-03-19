import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { decode } from 'base64-arraybuffer'
import { supabase } from '../utils/supabase'

export interface Profile {
    id: string
    userId: string
    username: string
    email: string | null
    avatarUrl: string | null
    coverUrl: string | null
    bio: string | null
    church: string | null
    churchRole: string | null
    isApproved: boolean
    role: 'MEMBER' | 'EDITOR' | 'ADMIN'
    createdAt: string
    updatedAt: string
}

export type UserRoleType = 'MEMBER' | 'EDITOR' | 'ADMIN'

// 모든 프로필 가져오기 (디렉토리용)
export function useProfiles() {
    return useQuery({
        queryKey: ['profiles'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('Profile')
                .select('*')
                .order('createdAt', { ascending: false })

            if (error) throw error
            return data as Profile[]
        },
    })
}

// 특정 사용자 프로필 가져오기
export function useProfile(profileId: string) {
    return useQuery({
        queryKey: ['profile', profileId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('Profile')
                .select('*')
                .eq('id', profileId)
                .single()

            if (error) throw error
            return data as Profile
        },
        enabled: !!profileId,
    })
}

// 현재 로그인한 사용자의 프로필 가져오기 (임시 처리)
export function useCurrentUserProfile() {
    return useQuery({
        queryKey: ['profile', 'current'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            
            if (!user) {
                return null
            }

            const { data, error } = await supabase
                .from('Profile')
                .select('*')
                .eq('userId', user.id)
                .single()
            if (error) throw error
            return data as Profile
        },
    })
}

export interface UpdateProfileData {
    username?: string
    bio?: string
    avatarBase64?: string
    avatarExt?: string
    coverBase64?: string
    coverExt?: string
}

export function useUpdateProfile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: UpdateProfileData) => {
            const { data: authData } = await supabase.auth.getUser()
            const user = authData.user
            if (!user) throw new Error('Not authenticated')

            let avatarUrl: string | undefined = undefined
            let coverUrl: string | undefined = undefined

            // Upload Avatar if provided
            if (data.avatarBase64 && data.avatarExt) {
                const filePath = `${user.id}/avatar-${Date.now()}.${data.avatarExt}`
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, decode(data.avatarBase64), {
                        contentType: `image/${data.avatarExt}`,
                        upsert: true,
                    })
                if (uploadError) throw uploadError

                const { data: publicUrlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath)
                avatarUrl = publicUrlData.publicUrl
            }

            // Upload Cover if provided
            if (data.coverBase64 && data.coverExt) {
                const filePath = `${user.id}/cover-${Date.now()}.${data.coverExt}`
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, decode(data.coverBase64), {
                        contentType: `image/${data.coverExt}`,
                        upsert: true,
                    })
                if (uploadError) throw uploadError

                const { data: publicUrlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath)
                coverUrl = publicUrlData.publicUrl
            }

            const updates: Partial<Profile> = {
                ...(data.username && { username: data.username }),
                ...(data.bio !== undefined && { bio: data.bio }),
            }

            if (avatarUrl) updates.avatarUrl = avatarUrl
            if (coverUrl) updates.coverUrl = coverUrl

            if (Object.keys(updates).length === 0) return

            const { error: updateError } = await supabase
                .from('Profile')
                .update(updates)
                .eq('userId', user.id)

            if (updateError) throw updateError
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            queryClient.invalidateQueries({ queryKey: ['profiles'] })
        },
    })
}

// 프로필 삭제
export function useDeleteProfile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (profileId: string) => {
            const { error } = await supabase
                .from('Profile')
                .delete()
                .eq('id', profileId)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profiles'] })
        },
    })
}

// User Role 권한 수정 (Admin 전용)
export function useUpdateProfileRole() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ profileId, role }: { profileId: string; role: UserRoleType }) => {
            const { error } = await supabase
                .from('Profile')
                .update({ role })
                .eq('id', profileId)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profiles'] })
            queryClient.invalidateQueries({ queryKey: ['profile'] })
        },
    })
}

export interface AdminUpdateProfileData {
    profileId: string
    username?: string
    email?: string
    bio?: string
    church?: string
    churchRole?: string
    isApproved?: boolean
}

export function useAdminUpdateProfile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: AdminUpdateProfileData) => {
            const updates: Partial<Profile> = {
                ...(data.username !== undefined && { username: data.username }),
                ...(data.email !== undefined && { email: data.email }),
                ...(data.bio !== undefined && { bio: data.bio }),
                ...(data.church !== undefined && { church: data.church }),
                ...(data.churchRole !== undefined && { churchRole: data.churchRole }),
                ...(data.isApproved !== undefined && { isApproved: data.isApproved }),
            }

            if (Object.keys(updates).length === 0) return

            const { error: updateError } = await supabase
                .from('Profile')
                .update(updates)
                .eq('id', data.profileId)

            if (updateError) throw updateError
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profiles'] })
            queryClient.invalidateQueries({ queryKey: ['profile'] })
        },
    })
}
