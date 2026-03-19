require('dotenv').config()
const { Client } = require('pg')

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
  if (!connectionString) {
    console.error("No database URL found in environment.")
    process.exit(1)
  }

  const client = new Client({ connectionString })
  
  try {
    await client.connect()
    console.log('Connected to the database.')

    const email = 'ibigmedia@gmail.com'
    const name = 'Hyunggon Back'
    
    // Check if the user exists in auth.users
    const authUserRes = await client.query(`SELECT id FROM auth.users WHERE email = $1;`, [email])
    let userId = null

    if (authUserRes.rows.length > 0) {
      userId = authUserRes.rows[0].id
      console.log(`Found auth user for ${email} with ID: ${userId}`)
    } else {
      console.log(`Auth user for ${email} not found. Please sign up first.`)
    }

    if (userId) {
      // Check if Profile exists
      const profileRes = await client.query(`SELECT id FROM "public"."Profile" WHERE "userId" = $1;`, [userId])
      if (profileRes.rows.length > 0) {
        // Update existing profile
        await client.query(`UPDATE "public"."Profile" SET role = 'ADMIN', username = $1 WHERE "userId" = $2;`, [name, userId])
        console.log(`Updated Profile for ${email} to ADMIN with name ${name}.`)
      } else {
        // Create new profile
        await client.query(`
          INSERT INTO "public"."Profile" ("userId", username, role, "updatedAt") 
          VALUES ($1, $2, 'ADMIN', now());
        `, [userId, name])
        console.log(`Created new Profile for ${email} as ADMIN and name ${name}.`)
      }
    } else {
      console.log(`Waiting for user to sign up before setting ADMIN role...`)
    }

  } catch (error) {
    console.error("Error during DB operations:", error)
  } finally {
    await client.end()
  }
}

main()
