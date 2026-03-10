import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../utils/supabase'
import { useEffect } from 'react'
import { Profile } from './useProfiles'

export interface ChatMessage {
    id: string
    channelId: string
    senderId: string
    content: string
    createdAt: string
    sender?: Partial<Profile>
}

export interface ChatParticipant {
    id: string
    channelId: string
    profileId: string
    createdAt: string
    profile?: Partial<Profile>
}

export interface ChatChannel {
    id: string
    createdAt: string
    updatedAt: string
    participants?: ChatParticipant[]
    messages?: ChatMessage[] // For latest message preview
}

// 1. 현재 사용자가 참여 중인 채팅방 목록 가져오기
export function useChatChannels() {
    return useQuery({
        queryKey: ['chat-channels'],
        queryFn: async () => {
            const { data: authData } = await supabase.auth.getUser()
            if (!authData.user) throw new Error('Not authenticated')

            const { data: myProfile, error: profileError } = await supabase
                .from('Profile')
                .select('id')
                .eq('userId', authData.user.id)
                .single()

            if (profileError || !myProfile) throw new Error('Profile not found')

            // 내가 속한 채널의 ID 목록을 먼저 가져옴
            const { data: participations, error: partError } = await supabase
                .from('ChatParticipant')
                .select('channelId')
                .eq('profileId', myProfile.id)

            if (partError) throw partError
            
            if (!participations || participations.length === 0) return []

            const channelIds = participations.map(p => p.channelId)

            // 해당 채널들의 상세 정보(상대방 프로필, 마지막 메시지 등) 가져오기
            const { data: channels, error: channelError } = await supabase
                .from('ChatChannel')
                .select(`
                    id,
                    createdAt,
                    updatedAt,
                    participants:ChatParticipant(
                        id,
                        profileId,
                        profile:Profile(id, username, avatarUrl)
                    ),
                    messages:ChatMessage(
                        id,
                        content,
                        createdAt,
                        senderId
                    )
                `)
                .in('id', channelIds)
                .order('createdAt', { foreignTable: 'messages', ascending: false })
                // Limit the number of messages to 1 per channel for the preview.
                // Note: PostgREST doesn't support limit on related collections easily without RPC, 
                // so we fetch all and sort/slice in JS for now, or assume small lists. 
                // In production, an RPC or a 'lastMessage' column on ChatChannel is better.

            if (channelError) throw channelError

            return channels as unknown as ChatChannel[]
        },
    })
}

// 2. 특정 채팅방의 메시지 내역 가져오기 + 실시간 구독 (Realtime)
export function useChatMessages(channelId: string) {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: ['chat-messages', channelId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('ChatMessage')
                .select(`
                    id,
                    channelId,
                    senderId,
                    content,
                    createdAt,
                    sender:Profile(id, username, avatarUrl)
                `)
                .eq('channelId', channelId)
                .order('createdAt', { ascending: true })

            if (error) throw error
            return data as unknown as ChatMessage[]
        },
        enabled: !!channelId,
    })

    // Realtime subscription setup
    useEffect(() => {
        if (!channelId) return

        const channel = supabase
            .channel(`public:ChatMessage:channelId=eq.${channelId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'ChatMessage',
                    filter: `channelId=eq.${channelId}`,
                },
                (payload) => {
                    const newMessage = payload.new as ChatMessage
                    
                    // We invalidate the query to refetch, or we can optimistic update.
                    // For simplicity and to get the joined 'sender' profile data, invalidating is reliable.
                    queryClient.invalidateQueries({ queryKey: ['chat-messages', channelId] })
                    queryClient.invalidateQueries({ queryKey: ['chat-channels'] })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [channelId, queryClient])

    return query
}

// 3. 메시지 전송
export function useSendMessage() {
    return useMutation({
        mutationFn: async ({ channelId, content }: { channelId: string; content: string }) => {
            const { data: authData } = await supabase.auth.getUser()
            if (!authData.user) throw new Error('Not authenticated')

            const { data: myProfile } = await supabase
                .from('Profile')
                .select('id')
                .eq('userId', authData.user.id)
                .single()

            if (!myProfile) throw new Error('Profile not found')

            const { data, error } = await supabase
                .from('ChatMessage')
                .insert({
                    channelId,
                    senderId: myProfile.id,
                    content,
                })
                .select()
                .single()

            if (error) throw error
            return data
        },
    })
}

// 4. 기존 1:1 채널 호거나 새로 생성하기
export function useCreateOrGetChannel() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (targetProfileId: string) => {
            const { data: authData } = await supabase.auth.getUser()
            if (!authData.user) throw new Error('Not authenticated')

            const { data: myProfile } = await supabase
                .from('Profile')
                .select('id')
                .eq('userId', authData.user.id)
                .single()

            if (!myProfile) throw new Error('Profile not found')
            
            if (myProfile.id === targetProfileId) {
                throw new Error('Cannot create chat with yourself')
            }

            // Step 1: Check if a channel already exists between these two users.
            // Find channels I am in
            const { data: myParticipations } = await supabase
                .from('ChatParticipant')
                .select('channelId')
                .eq('profileId', myProfile.id)

            if (myParticipations && myParticipations.length > 0) {
                const myChannelIds = myParticipations.map(p => p.channelId)

                // Check if target user is in any of these channels (which would mean a 1:1 channel exists)
                const { data: commonParticipations } = await supabase
                    .from('ChatParticipant')
                    .select('channelId')
                    .in('channelId', myChannelIds)
                    .eq('profileId', targetProfileId)

                if (commonParticipations && commonParticipations.length > 0) {
                    // Return existing channelId
                    return commonParticipations[0]?.channelId
                }
            }

            // Step 2: If no channel exists, create one
            const { data: newChannel, error: channelError } = await supabase
                .from('ChatChannel')
                .insert({ updatedAt: new Date().toISOString() })
                .select()
                .single()

            if (channelError) throw channelError

            // Insert participants
            const { error: partError } = await supabase
                .from('ChatParticipant')
                .insert([
                    { channelId: newChannel.id, profileId: myProfile.id },
                    { channelId: newChannel.id, profileId: targetProfileId }
                ])

            if (partError) throw partError

            return newChannel.id
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chat-channels'] })
        }
    })
}
