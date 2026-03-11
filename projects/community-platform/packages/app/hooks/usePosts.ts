import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../utils/supabase'

export interface Post {
    id: string
    content: string
    mediaUrl: string | null
    authorId: string
    createdAt: string
    author?: {
        id: string
        username: string
        avatarUrl: string | null
    }
    group?: {
        id: string
        name: string
    }
    likes: { profileId: string }[]
    comments: { id: string }[]
}

// 피드 포스트 가져오기 (전체 혹은 특정 그룹용)
export function usePosts(groupId?: string) {
    return useQuery({
        queryKey: groupId ? ['posts', 'group', groupId] : ['posts', 'all'],
        queryFn: async () => {
            let query = supabase
                .from('Post')
                .select(`
          *,
          author:"Profile"(id, username, avatarUrl),
          likes:"PostLike"(profileId),
          group:"Group"(id, name),
          comments:"Comment"(id)
        `)
                .order('createdAt', { ascending: false })

            if (groupId) {
                query = query.eq('groupId', groupId)
            }

            const { data, error } = await query

            if (error) throw error
            return data as Post[]
        },
    })
}

// 특정 사용자 포스트 가져오기 (프로필 화면용)
export function useUserPosts(profileId: string) {
    return useQuery({
        queryKey: ['posts', profileId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('Post')
                .select(`
          *,
          author:"Profile"(id, username, avatarUrl),
          likes:"PostLike"(profileId),
          comments:"Comment"(id)
        `)
                .eq('authorId', profileId)
                .order('createdAt', { ascending: false })

            if (error) throw error
            return data as Post[]
        },
        enabled: !!profileId,
    })
}

// 단일 포스트 가져오기 (게시글 상세 화면용)
export function usePost(postId: string) {
    return useQuery({
        queryKey: ['post', postId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('Post')
                .select(`
          *,
          author:"Profile"(id, username, avatarUrl),
          likes:"PostLike"(profileId),
          comments:"Comment"(id)
        `)
                .eq('id', postId)
                .single()

            if (error) throw error
            return data as Post
        },
        enabled: !!postId,
    })
}


// 간단한 UUID 제너레이터 (RN 호환)
const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

// 포스트 생성
export function useCreatePost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ content, profileId, groupId, mediaUrl }: { content: string; profileId: string; groupId?: string, mediaUrl?: string }) => {
            const { data, error } = await supabase
                .from('Post')
                .insert({ 
                    id: generateId(), 
                    content, 
                    authorId: profileId, 
                    groupId: groupId || null,
                    mediaUrl: mediaUrl || null,
                    updatedAt: new Date().toISOString()
                })
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['posts', 'all'] })
            if (variables.groupId) {
                queryClient.invalidateQueries({ queryKey: ['posts', 'group', variables.groupId] })
            }
            queryClient.invalidateQueries({ queryKey: ['posts', variables.profileId] })
        },
    })
}

// 포스트 좋아요 토글
export function useToggleLike() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ postId, hasLiked, profileId }: { postId: string; hasLiked: boolean; profileId: string }) => {
            if (hasLiked) {
                const { error } = await supabase
                    .from('PostLike')
                    .delete()
                    .match({ postId: postId, profileId: profileId })
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('PostLike')
                    .insert({ id: generateId(), postId: postId, profileId: profileId })
                if (error) throw error
            }
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ['posts'] })
            const updatePosts = (old: Post[] | undefined) => {
                if (!old) return old
                return old.map(post => {
                    if (post.id !== variables.postId) return post
                    const newLikes = variables.hasLiked
                        ? post.likes.filter(l => l.profileId !== variables.profileId)
                        : [...post.likes, { profileId: variables.profileId }]
                    return { ...post, likes: newLikes }
                })
            }
            queryClient.setQueriesData({ queryKey: ['posts'] }, updatePosts)
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: ['posts', 'all'] })
            queryClient.invalidateQueries({ queryKey: ['post', variables.postId] })
        },
    })
}
// 포스트 삭제
export function useDeletePost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (postId: string) => {
            const { error } = await supabase
                .from('Post')
                .delete()
                .eq('id', postId)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] })
        },
    })
}
