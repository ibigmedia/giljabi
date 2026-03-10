import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../utils/supabase'
import { Alert } from 'react-native'

export type Group = {
  id: string
  name: string
  description: string | null
  isPrivate: boolean
  createdAt: string
  updatedAt: string
}

export type GroupMember = {
  id: string
  groupId: string
  profileId: string
  role: string
  createdAt: string
}

// 1. Fetch all groups (public and user's private groups)
export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('Group')
        .select(`
          *,
          members:GroupMember(count)
        `)
        .order('createdAt', { ascending: false })

      if (error) throw error
      return data
    },
  })
}

// 2. Fetch user's joined groups
export function useMyGroups() {
  return useQuery({
    queryKey: ['my_groups'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('Profile')
        .select('id')
        .eq('userId', user.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      const { data, error } = await supabase
        .from('GroupMember')
        .select(`
          groupId,
          group:Group(*)
        `)
        .eq('profileId', profile.id)

      if (error) throw error
      return data.map((membership: any) => membership.group)
    },
  })
}

// 3. Fetch single group details
export function useGroup(groupId: string) {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      if (!groupId) return null
      const { data, error } = await supabase
        .from('Group')
        .select(`
          *,
          members:GroupMember(
            id,
            role,
            createdAt,
            profile:Profile(id, username, avatarUrl)
          )
        `)
        .eq('id', groupId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!groupId,
  })
}

// 4. Create Group
export function useCreateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      name,
      description,
      isPrivate,
    }: {
      name: string
      description: string
      isPrivate: boolean
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('Profile')
        .select('id')
        .eq('userId', user.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      // Insert Group
      const { data: newGroup, error: groupError } = await supabase
        .from('Group')
        .insert({
          name,
          description,
          isPrivate,
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single()

      if (groupError) throw groupError

      // Insert initial admin member
      const { error: memberError } = await supabase
        .from('GroupMember')
        .insert({
          groupId: newGroup.id,
          profileId: profile.id,
          role: 'ADMIN',
        })

      if (memberError) {
        console.error('Failed to add admin user to group', memberError)
        // Ideally should rollback group creation here
      }

      return newGroup
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      queryClient.invalidateQueries({ queryKey: ['my_groups'] })
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to create group')
    },
  })
}

// 5. Join Group
export function useJoinGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (groupId: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('Profile')
        .select('id')
        .eq('userId', user.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      const { error } = await supabase
        .from('GroupMember')
        .insert({
          groupId,
          profileId: profile.id,
          role: 'MEMBER',
        })

      if (error) throw error
    },
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] })
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      queryClient.invalidateQueries({ queryKey: ['my_groups'] })
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to join group')
    },
  })
}

// 6. Leave Group
export function useLeaveGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (groupId: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('Profile')
        .select('id')
        .eq('userId', user.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      const { error } = await supabase
        .from('GroupMember')
        .delete()
        .eq('groupId', groupId)
        .eq('profileId', profile.id)

      if (error) throw error
    },
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] })
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      queryClient.invalidateQueries({ queryKey: ['my_groups'] })
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to leave group')
    },
  })
}

// Check membership status
export function useIsGroupMember(groupId: string) {
  return useQuery({
    queryKey: ['group_membership', groupId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data: profile } = await supabase
        .from('Profile')
        .select('id')
        .eq('userId', user.id)
        .single()

      if (!profile) return false

      const { data, error } = await supabase
        .from('GroupMember')
        .select('id')
        .eq('groupId', groupId)
        .eq('profileId', profile.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error
      return !!data
    },
    enabled: !!groupId,
  })
}
