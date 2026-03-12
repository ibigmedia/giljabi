import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../utils/supabase-server'

// Individual SQL statements — executed one at a time for pgbouncer compatibility
const SQL_STATEMENTS = [
    // Release table
    `CREATE TABLE IF NOT EXISTS "Release" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "title" TEXT NOT NULL,
      "artist" TEXT NOT NULL,
      "year" INTEGER NOT NULL,
      "type" TEXT NOT NULL DEFAULT 'Single',
      "coverUrl" TEXT,
      "status" TEXT NOT NULL DEFAULT 'draft',
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
    )`,
    // Track table
    `CREATE TABLE IF NOT EXISTS "Track" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "title" TEXT NOT NULL,
      "duration" TEXT NOT NULL DEFAULT '0:00',
      "plays" INTEGER NOT NULL DEFAULT 0,
      "audioUrl" TEXT,
      "position" INTEGER NOT NULL DEFAULT 0,
      "releaseId" TEXT NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT "Track_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "Track_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE
    )`,
    // MusicVideo table
    `CREATE TABLE IF NOT EXISTS "MusicVideo" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "title" TEXT NOT NULL,
      "youtubeUrl" TEXT,
      "thumbnailUrl" TEXT,
      "duration" TEXT NOT NULL DEFAULT '0:00',
      "views" INTEGER NOT NULL DEFAULT 0,
      "status" TEXT NOT NULL DEFAULT 'draft',
      "publishedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT "MusicVideo_pkey" PRIMARY KEY ("id")
    )`,
    // Indexes
    `CREATE INDEX IF NOT EXISTS "Release_status_idx" ON "Release"("status")`,
    `CREATE INDEX IF NOT EXISTS "Track_releaseId_idx" ON "Track"("releaseId")`,
    `CREATE INDEX IF NOT EXISTS "MusicVideo_status_idx" ON "MusicVideo"("status")`,
    // RLS
    `ALTER TABLE "Release" ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE "Track" ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE "MusicVideo" ENABLE ROW LEVEL SECURITY`,
    // Drop existing policies (idempotent)
    `DROP POLICY IF EXISTS "Release_public_read" ON "Release"`,
    `DROP POLICY IF EXISTS "Track_public_read" ON "Track"`,
    `DROP POLICY IF EXISTS "MusicVideo_public_read" ON "MusicVideo"`,
    // Public read policies
    `CREATE POLICY "Release_public_read" ON "Release" FOR SELECT USING (true)`,
    `CREATE POLICY "Track_public_read" ON "Track" FOR SELECT USING (true)`,
    `CREATE POLICY "MusicVideo_public_read" ON "MusicVideo" FOR SELECT USING (true)`,
]

// GET /api/setup — creates portfolio tables in Supabase
export async function GET() {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
        return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 })
    }

    try {
        const { Client } = await import('pg')
        const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
        await client.connect()

        const results: string[] = []
        for (const sql of SQL_STATEMENTS) {
            try {
                await client.query(sql)
                results.push('OK')
            } catch (err: any) {
                // Ignore "already exists" type errors
                results.push(`SKIP: ${err.message?.slice(0, 80)}`)
            }
        }

        await client.end()

        // Verify tables via Supabase REST API
        const sb = getSupabaseAdmin()
        const { error: e1 } = await sb.from('Release').select('id').limit(1)
        const { error: e2 } = await sb.from('Track').select('id').limit(1)
        const { error: e3 } = await sb.from('MusicVideo').select('id').limit(1)

        return NextResponse.json({
            success: true,
            message: 'Portfolio tables setup complete!',
            tables: {
                Release: !e1 ? 'OK' : e1.message,
                Track: !e2 ? 'OK' : e2.message,
                MusicVideo: !e3 ? 'OK' : e3.message,
            },
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
