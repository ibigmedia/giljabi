-- Add isPinned column to Post table
-- Run this in Supabase SQL Editor
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "isPinned" BOOLEAN NOT NULL DEFAULT false;
