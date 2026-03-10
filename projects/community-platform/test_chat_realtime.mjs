import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create two distinct clients to simulate two different users
const client1 = createClient(supabaseUrl, supabaseAnonKey)
const client2 = createClient(supabaseUrl, supabaseAnonKey)

async function runTest() {
  console.log('Logging in test users...')
  const { data: auth1, error: err1 } = await client1.auth.signInWithPassword({
    email: 'testchat1@example.com',
    password: 'TestPassword123!'
  })
  
  const { data: auth2, error: err2 } = await client2.auth.signInWithPassword({
    email: 'testchat2@example.com',
    password: 'TestPassword123!'
  })

  if (err1 || err2) {
    console.error('Login failed', err1, err2)
    return
  }

  const { data: prof1 } = await client1.from('Profile').select('id').eq('userId', auth1.user.id).single()
  const { data: prof2 } = await client2.from('Profile').select('id').eq('userId', auth2.user.id).single()

  const user1 = prof1.id
  const user2 = prof2.id
  console.log('Logged in successfully.', { user1, user2 })

  // 1. Get or Create Channel (simulating what useCreateOrGetChannel does)
  console.log('Finding or creating chat channel...')
  
  // Actually, we can just use client1 to create it directly for this test
  // First, check if a channel with these two already exists
  const { data: participations } = await client1
    .from('ChatParticipant')
    .select('channelId')
    .eq('profileId', user1)

  let channelId = null;
  if (participations && participations.length > 0) {
    const pChannelIds = participations.map(p => p.channelId)
    const { data: intersecting } = await client1
      .from('ChatParticipant')
      .select('channelId')
      .eq('profileId', user2)
      .in('channelId', pChannelIds)

    if (intersecting && intersecting.length > 0) {
      channelId = intersecting[0].channelId
      console.log('Found existing channel:', channelId)
    }
  }

  if (!channelId) {
    console.log('Creating new channel...')
    const { data: newChannel, error: chErr } = await client1
      .from('ChatChannel')
      .insert({ updatedAt: new Date().toISOString() })
      .select()
      .single()
    
    if (chErr) throw chErr;
    channelId = newChannel.id

    // Insert participants
    await client1.from('ChatParticipant').insert([
      { channelId, profileId: user1 },
      { channelId, profileId: user2 }
    ])
    console.log('Created new channel:', channelId)
  }

  // 2. Client 2 subscribes to Realtime for this channel
  console.log('Client 2 subscribing to Realtime...')
  let messageReceived = false;

  const channel = client2
    .channel(`chat_messages:${channelId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'ChatMessage'
      },
      (payload) => {
        console.log('🔔 [Realtime Event Received by Client 2]:', payload.new.content)
        messageReceived = true
      }
    )
    .subscribe((status) => {
      console.log('Realtime Subscription Status:', status)
    })

  // Wait for subscription to be ready
  await new Promise(resolve => setTimeout(resolve, 2000))

  // 3. Client 1 sends a message
  const testMessage = `Hello from Test User 1 at ${new Date().toISOString()}`
  console.log('Client 1 sending message:', testMessage)
  
  const { error: msgErr } = await client1
    .from('ChatMessage')
    .insert({
      channelId,
      senderId: user1,
      content: testMessage
    })

  if (msgErr) {
    console.error('Error sending message:', msgErr)
  } else {
    console.log('Client 1 message inserted to DB successfully.')
  }

  // 4. Wait a few seconds to see if Client 2 receives the Realtime payload
  console.log('Waiting 5 seconds for Realtime payload...')
  await new Promise(resolve => setTimeout(resolve, 5000))

  if (messageReceived) {
    console.log('✅ TEST PASSED: Client 2 successfully received the Realtime message.')
  } else {
    console.error('❌ TEST FAILED: Client 2 did not receive the Realtime message. Check setup_chat_rls.sql and publication.')
  }

  // Cleanup
  await client1.auth.signOut()
  await client2.auth.signOut()
  process.exit(0)
}

runTest().catch(console.error)
