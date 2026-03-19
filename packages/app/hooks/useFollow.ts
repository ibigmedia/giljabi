import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../utils/supabase'

export function useFollowStatus(profileId: string, currentUserId?: string) {
    return useQuery({
        queryKey: ['follow-status', profileId],
        queryFn: async () => {
            // 팔로워 수 조회
            const { count: followersCount, error: err1 } = await supabase
                .from('Follow')
                .select('*', { count: 'exact', head: true })
                .eq('followingId', profileId)

            if (err1) throw err1

            // 팔로잉 수 조회
            const { count: followingCount, error: err2 } = await supabase
                .from('Follow')
                .select('*', { count: 'exact', head: true })
                .eq('followerId', profileId)

            if (err2) throw err2

            // 현재 사용자가 이 프로필을 팔로우하는지 여부
            let isFollowing = false
            if (currentUserId) {
                // currentUserId is actually currentProfileId
                const { data, error: err3 } = await supabase
                    .from('Follow')
                    .select('id')
                    .eq('followerId', currentUserId)
                    .eq('followingId', profileId)
                    .single()

                if (!err3 && data) {
                    isFollowing = true
                }
            }

            return {
                followersCount: followersCount || 0,
                followingCount: followingCount || 0,
                isFollowing,
            }
        },
        enabled: !!profileId,
    })
}

export function useFollowUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ followerId, followingId }: { followerId: string; followingId: string }) => {
            const { error } = await supabase
                .from('Follow')
                .insert([{ followerId, followingId }])

            if (error) throw error
        },
        onSuccess: (_, variables) => {
            // Invalidate the follow status query to trigger a refetch
            queryClient.invalidateQueries({ queryKey: ['follow-status', variables.followingId] })
            queryClient.invalidateQueries({ queryKey: ['follow-status', variables.followerId] })
        },
    })
}

export function useUnfollowUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ followerId, followingId }: { followerId: string; followingId: string }) => {
            const { error } = await supabase
                .from('Follow')
                .delete()
                .eq('followerId', followerId)
                .eq('followingId', followingId)

            if (error) throw error
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['follow-status', variables.followingId] })
            queryClient.invalidateQueries({ queryKey: ['follow-status', variables.followerId] })
        },
    })
}
