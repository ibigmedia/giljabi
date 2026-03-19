import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'

export type NotificationType = 'LIKE' | 'COMMENT' | 'FOLLOW'

export type Notification = {
  id: string
  actorId: string
  receiverId: string
  type: NotificationType
  postId: string | null
  commentId: string | null
  isRead: boolean
  createdAt: string
  actor: {
    id: string
    username: string
    avatarUrl: string | null
  }
}

export function useNotifications() {
  const queryClient = useQueryClient()
  const [userId, setUserId] = useState<string | undefined>()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id))
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return []

      const { data, error } = await supabase
        .from('Notification')
        .select(`
          *,
          actor:Profile!Notification_actorId_fkey(id, username, avatarUrl)
        `)
        .eq('receiverId', userId)
        .order('createdAt', { ascending: false })

      if (error) throw error

      // Type assertion because Supabase types might not perfectly match if they aren't generated
      return (data as any) as Notification[]
    },
    enabled: !!userId,
  })

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('Notification')
        .update({ isRead: true })
        .eq('id', notificationId)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      // Optimistically update the cache
      queryClient.setQueryData(['notifications', userId], (oldData: Notification[] | undefined) => {
        if (!oldData) return []
        return oldData.map((notif) =>
          notif.id === variables ? { ...notif, isRead: true } : notif
        )
      })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return

      const { error } = await supabase
        .from('Notification')
        .update({ isRead: true })
        .eq('receiverId', userId)
        .eq('isRead', false)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.setQueryData(['notifications', userId], (oldData: Notification[] | undefined) => {
        if (!oldData) return []
        return oldData.map((notif) => ({ ...notif, isRead: true }))
      })
    },
  })

  return {
    notifications: data || [],
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    unreadCount: data?.filter((n) => !n.isRead).length || 0,
  }
}
