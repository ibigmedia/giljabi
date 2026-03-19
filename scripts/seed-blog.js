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
    console.log('Connected to the database. Disabling RLS on BlogPost...')
    await client.query(`ALTER TABLE "public"."BlogPost" DISABLE ROW LEVEL SECURITY;`)

    // Get a user profile
    const profileRes = await client.query(`SELECT id FROM "public"."Profile" LIMIT 1;`)
    if (profileRes.rows.length === 0) {
      console.log("No profile found. Ensure profiles exist in DB.")
      return
    }
    const authorId = profileRes.rows[0].id

    // Check if blogs exist
    const postsRes = await client.query(`SELECT id FROM "public"."BlogPost" LIMIT 1;`)
    if (postsRes.rows.length > 0) {
      console.log("Mock blog posts already exist. Skipping seed.")
      return
    }

    console.log('Inserting mock blog posts...')
    const insertQuery = `
      INSERT INTO "public"."BlogPost" (title, excerpt, content, "mediaUrl", "isPublished", "authorId", "updatedAt")
      VALUES 
      (
        '길잡이 온라인 커뮤니티 런칭 안내',
        '새롭게 단장한 길잡이(Giljabi) 온라인 커뮤니티의 다양한 기능을 소개합니다.',
        '이번 업데이트를 통해 블로그, 피드, 사용자 프로필 등 다양한 기능들이 추가되었습니다. 앞으로 더욱 활발한 커뮤니케이션 공간이 되기를 기대합니다.',
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
        true,
        $1,
        now()
      ),
      (
        '디지털 사역과 플랫폼 전략의 미래',
        'AI와 디지털 플랫폼을 활용한 차세대 커뮤니티 빌딩 전략 소개 및 활용 방안에 대하여.',
        '빠르게 변하는 디지털 트렌드 속에서 온라인 커뮤니티는 정보 공유를 넘어선 연결의 수단이 되고 있습니다. 이번 UI 개편을 통해 더욱 친근하고 접근성이 높은 플랫폼으로 거듭납니다.',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
        true,
        $1,
        now()
      )
    `
    await client.query(insertQuery, [authorId])
    console.log("Mock blogs inserted successfully.")

  } catch (error) {
    console.error("Error during DB operations:", error)
  } finally {
    await client.end()
  }
}

main()
