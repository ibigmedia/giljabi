import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const client2 = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  const { data: auth, error: authErr } = await client2.auth.signInWithPassword({
    email: 'testchat2@example.com',
    password: 'TestPassword123!'
  })
  if (authErr) {
    console.error('Auth err', authErr)
    return
  }
  const { data, error } = await client2.from('ChatMessage').select('*').eq('channelId', 'ab4cee63-f1aa-4e13-ae52-f68fc59d0895')
  console.log('Client 2 message fetch result:', data, error)
  await client2.auth.signOut()
}
check()
