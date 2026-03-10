// verify_group_rls.mjs
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testRLS() {
  console.log('Testing RLS for Group and GroupMember...')
  
  // 1. Log in as a regular user (not service_role)
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'testchat1@example.com',
    password: 'TestPassword123!'
  })
  if (authError) {
    console.error('Login failed:', authError.message)
    process.exit(1)
  }
  
  console.log('Logged in successfully as testchat1@example.com')
  
  const userId = authData.user.id
  
  // Get Profile ID
  const { data: profile, error: profileError } = await supabase
    .from('Profile')
    .select('id')
    .eq('userId', userId)
    .single()
    
  if (profileError || !profile) {
    console.error('Failed to get Profile ID:', profileError)
    process.exit(1)
  }
  console.log('Profile ID:', profile.id)
  
  // 2. Create a Group
  const groupName = `RLS Test Group ${Date.now()}`
  const { data: newGroup, error: groupError } = await supabase
    .from('Group')
    .insert({
      name: groupName,
      description: 'Testing RLS',
      isPrivate: false,
      updatedAt: new Date().toISOString()
    })
    .select()
    .single()
    
  if (groupError) {
    console.error('Failed to create group:', groupError)
    process.exit(1)
  }
  console.log(`Group created successfully: ${newGroup.id}`)
  
  // 3. Insert into GroupMember as ADMIN (This is what failed previously due to RLS)
  const { data: memberData, error: memberError } = await supabase
    .from('GroupMember')
    .insert({
      groupId: newGroup.id,
      profileId: profile.id,
      role: 'ADMIN'
    })
    .select()
    
  if (memberError) {
    console.error('RLS ERROR! Failed to insert GroupMember:', memberError)
    process.exit(1)
  }
  
  console.log('GroupMember inserted successfully. RLS passed for creator as ADMIN.')
  console.log('[Test Passed]')
  process.exit(0)
}

testRLS()
