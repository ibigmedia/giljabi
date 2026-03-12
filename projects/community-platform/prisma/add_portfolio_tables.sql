-- Portfolio tables: Release, Track, MusicVideo
-- Run this in Supabase SQL Editor

-- Release table
CREATE TABLE IF NOT EXISTS "Release" (
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
);

-- Track table
CREATE TABLE IF NOT EXISTS "Track" (
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
);

-- MusicVideo table
CREATE TABLE IF NOT EXISTS "MusicVideo" (
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
);

-- Indexes
CREATE INDEX IF NOT EXISTS "Release_status_idx" ON "Release"("status");
CREATE INDEX IF NOT EXISTS "Track_releaseId_idx" ON "Track"("releaseId");
CREATE INDEX IF NOT EXISTS "MusicVideo_status_idx" ON "MusicVideo"("status");

-- RLS Policies (public read, authenticated write)
ALTER TABLE "Release" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Track" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MusicVideo" ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Release_public_read" ON "Release" FOR SELECT USING (true);
CREATE POLICY "Track_public_read" ON "Track" FOR SELECT USING (true);
CREATE POLICY "MusicVideo_public_read" ON "MusicVideo" FOR SELECT USING (true);

-- Authenticated write (admin only via service role key in API routes)
CREATE POLICY "Release_auth_write" ON "Release" FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Track_auth_write" ON "Track" FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "MusicVideo_auth_write" ON "MusicVideo" FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Release_updatedAt" BEFORE UPDATE ON "Release" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER "MusicVideo_updatedAt" BEFORE UPDATE ON "MusicVideo" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
