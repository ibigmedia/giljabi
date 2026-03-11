import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../utils/supabase'

export interface BlogPost {
    id: string
    title: string
    excerpt: string | null
    content: string
    mediaUrl: string | null
    isPublished: boolean
    authorId: string
    createdAt: string
    updatedAt: string
    author?: {
        username: string
        avatarUrl: string | null
    }
}

// UUID 제너레이터 (임시 폴백)
const generateId = () => crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15)

export function useBlogPosts() {
    return useQuery({
        queryKey: ['blogPosts'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('BlogPost')
                .select(`
                    *,
                    author:Profile(username, avatarUrl)
                `)
                .order('createdAt', { ascending: false })

            if (error) throw error
            return (data || []) as BlogPost[]
        },
        retry: 1,
    })
}

export function useBlogPost(id: string) {
    return useQuery({
        queryKey: ['blogPost', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('BlogPost')
                .select(`
                    *,
                    author:Profile(username, avatarUrl)
                `)
                .eq('id', id)
                .single()

            if (error) throw error
            return data as BlogPost
        },
        enabled: !!id
    })
}

export function useCreateBlogPost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (newPost: Partial<BlogPost> & { authorId: string }) => {
            const tempId = generateId()
            const { data, error } = await supabase
                .from('BlogPost')
                .insert({
                    id: tempId,
                    title: newPost.title || '새 블로그 스니펫',
                    content: newPost.content || '',
                    excerpt: newPost.excerpt || '',
                    mediaUrl: newPost.mediaUrl || null,
                    isPublished: newPost.isPublished || false,
                    authorId: newPost.authorId,
                    updatedAt: new Date().toISOString()
                })
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogPosts'] })
        }
    })
}

export function useUpdateBlogPost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (updatedPost: Partial<BlogPost> & { id: string }) => {
            const { data, error } = await supabase
                .from('BlogPost')
                .update({
                    title: updatedPost.title,
                    content: updatedPost.content,
                    excerpt: updatedPost.excerpt,
                    mediaUrl: updatedPost.mediaUrl,
                    isPublished: updatedPost.isPublished,
                    updatedAt: new Date().toISOString()
                })
                .eq('id', updatedPost.id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onMutate: async (newPost) => {
            await queryClient.cancelQueries({ queryKey: ['blogPost', newPost.id] })
            const previousPost = queryClient.getQueryData(['blogPost', newPost.id])
            
            // Optimistic update
            queryClient.setQueryData(['blogPost', newPost.id], (old: BlogPost | undefined) => {
                return { ...old, ...newPost }
            })
            
            return { previousPost }
        },
        onError: (err, newPost, context) => {
            if (context?.previousPost) {
                queryClient.setQueryData(['blogPost', newPost.id], context.previousPost)
            }
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: ['blogPost', variables.id] })
            queryClient.invalidateQueries({ queryKey: ['blogPosts'] })
        }
    })
}

export function useDeleteBlogPost() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('BlogPost')
                .delete()
                .eq('id', id)

            if (error) throw error
            return id
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogPosts'] })
        }
    })
}

// AI 모의 생성 응답 훅 (실제 LLM 연동 전)
export function useGenerateAIBlog() {
    return useMutation({
        mutationFn: async (prompt: string) => {
            // 실제라면 fetch('/api/llm', { body: { prompt }})
            // 여기선 1.5초 대기 후 Mock 텍스트 반환
            await new Promise(resolve => setTimeout(resolve, 1500))
            return {
                title: `AI Generated: ${prompt.slice(0, 10)}...`,
                excerpt: `AI가 작성한 요약문입니다. 주제는 ${prompt} 에 관한 내용입니다.`,
                content: `이 블로그 본문은 사용자의 프롬프트("${prompt}")를 분석하여 LLM이 자동 생성한 모의 텍스트입니다.\n\n디지털 사역과 현대 기술의 만남은 많은 기회를 열어줍니다. 온라인 상에서 생명력을 가진 공동체를 만들기 위해서는 진정성 있는 관계 형성과 도구의 선용이 필수적입니다...`
            }
        }
    })
}
