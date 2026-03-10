import { useQuery } from '@tanstack/react-query'
import { supabase } from '../utils/supabase'
import { Post } from './usePosts'

export interface Profile {
    id: string
    username: string
    bio: string | null
    avatarUrl: string | null
}

export function useSearchProfiles(query: string) {
    return useQuery({
        queryKey: ['searchProfiles', query],
        queryFn: async () => {
            if (!query) return []

            const { data, error } = await supabase
                .from('Profile')
                .select('*')
                .or(`username.ilike.%${query}%,bio.ilike.%${query}%`)
                .order('username', { ascending: true })
                .limit(20)

            if (error) throw error
            return data as Profile[]
        },
        enabled: query.length > 0, // 쿼리가 있을 때만 실행
    })
}

export function useSearchPosts(query: string) {
    return useQuery({
        queryKey: ['searchPosts', query],
        queryFn: async () => {
            if (!query) return []

            const { data, error } = await supabase
                .from('Post')
                .select(`
                    *,
                    author:Profile(id, username, avatarUrl),
                    likes:PostLike(profileId)
                `)
                .ilike('content', `%${query}%`)
                .order('createdAt', { ascending: false })
                .limit(20)

            if (error) throw error
            return data as Post[]
        },
        enabled: query.length > 0, // 쿼리가 있을 때만 실행
    })
}
