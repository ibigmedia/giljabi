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

// 간단한 UUID 제너레이터 (RN 호환)
const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

// 새로운 댓글 생성하기
export function useCreateComment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ postId, content, profileId }: { postId: string; content: string; profileId: string }) => {
            const { data, error } = await supabase
                .from('Comment')
                .insert({ id: generateId(), postId, content, authorId: profileId, updatedAt: new Date().toISOString() })
                .select()
                .single()

            if (error) throw error
            return data
        },
        onMutate: async (newComment) => {
            await queryClient.cancelQueries({ queryKey: ['comments', newComment.postId] })
            const previousComments = queryClient.getQueryData(['comments', newComment.postId])
            
            // 낙관적 업데이트
            queryClient.setQueryData(['comments', newComment.postId], (old: Comment[] | undefined) => {
                const tempComment = {
                    id: `temp-${Date.now()}`,
                    content: newComment.content,
                    postId: newComment.postId,
                    authorId: newComment.profileId,
                    createdAt: new Date().toISOString(),
                    // 가짜 작성자 정보를 넣어 UI 깨짐 방지
                    author: { id: newComment.profileId, username: '게스트', avatarUrl: null }
                }
                return [...(old || []), tempComment]
            })
            
            return { previousComments }
        },
        onError: (err, newComment, context) => {
            if (context?.previousComments) {
                queryClient.setQueryData(['comments', newComment.postId], context.previousComments)
            }
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] })
            queryClient.invalidateQueries({ queryKey: ['post', variables.postId] })
            queryClient.invalidateQueries({ queryKey: ['posts'] })
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
