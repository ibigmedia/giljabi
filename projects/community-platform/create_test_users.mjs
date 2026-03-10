import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function createOrUpdateUser(email, password, username) {
  const { data: user, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  let userId;
  if (error && error.message.includes('already registered')) {
     console.log(`${email} already exists.`)
     const { data: usersData } = await supabase.auth.admin.listUsers()
     const existingUser = usersData.users.find(u => u.email === email)
     if (existingUser) {
       userId = existingUser.id
       await supabase.auth.admin.updateUserById(userId, { password })
     }
  } else if (error) {
     console.error(`Error creating ${email}:`, error.message)
     return null
  } else {
     userId = user.user.id
     console.log(`Created ${email} with ID ${userId}`)
  }

  if (userId) {
    // Wait a brief moment for the DB trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));
    await supabase.from('Profile').update({ username }).eq('id', userId)
    console.log(`Profile updated for ${email}`)
  }
  return userId
}

async function run() {
  console.log('Creating test users...')
  await createOrUpdateUser('testchat1@example.com', 'TestPassword123!', 'ChatTester1')
  await createOrUpdateUser('testchat2@example.com', 'TestPassword123!', 'ChatTester2')
  console.log('Test users ready!')
}

run()
