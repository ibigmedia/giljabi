import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../utils/supabase'

export interface Comment {
    id: string
    content: string
    postId: string
    authorId: string
    createdAt: string
    author?: {
        id: string
        username: string
        avatarUrl: string | null
    }
}

// 특정 게시물의 모든 댓글 가져오기
export function useComments(postId: string) {
    return useQuery({
        queryKey: ['comments', postId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('Comment')
                .select(`
                    *,
                    author:Profile(id, username, avatarUrl)
                `)
                .eq('postId', postId)
                .order('createdAt', { ascending: true }) // 오래된 순으로 가져오기 (댓글)

            if (error) throw error
            return data as Comment[]
        },
        enabled: !!postId,
    })
}

// 새로운 댓글 생성하기
export function useCreateComment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ postId, content, profileId }: { postId: string; content: string; profileId: string }) => {
            const { data, error } = await supabase
                .from('Comment')
                .insert({ postId, content, authorId: profileId })
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: (_, variables) => {
            // 해당 게시물의 댓글 목록 갱신 및 게시물 데이터 무효화
            queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] })
            queryClient.invalidateQueries({ queryKey: ['post', variables.postId] })
        },
    })
}

// 댓글 삭제하기
export function useDeleteComment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (commentId: string) => {
            const { error, data } = await supabase
                .from('Comment')
                .delete()
                .eq('id', commentId)
                .select('postId')
                .single()

            if (error) throw error
            return data // 돌아온 postId를 onSuccess에서 사용
        },
        onSuccess: (data) => {
            if (data?.postId) {
                queryClient.invalidateQueries({ queryKey: ['comments', data.postId] })
                queryClient.invalidateQueries({ queryKey: ['post', data.postId] })
            }
        },
    })
}
