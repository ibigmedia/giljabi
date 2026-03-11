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

// AI 블로그 자동 생성 (Claude API)
export function useGenerateAIBlog() {
    return useMutation({
        mutationFn: async (prompt: string) => {
            const response = await fetch('/api/generate-blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || 'AI 생성 중 오류가 발생했습니다.')
            }

            const data = await response.json()
            return {
                title: data.title as string,
                excerpt: data.excerpt as string,
                content: data.content as string,
            }
        }
    })
}
