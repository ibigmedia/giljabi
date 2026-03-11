-- ===================================================
-- Admin RLS Policies (DROP + CREATE)
-- Run this in Supabase SQL Editor
-- ===================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Admins can update any profile" ON public."Profile";
DROP POLICY IF EXISTS "Admins can delete any post" ON public."Post";
DROP POLICY IF EXISTS "Admins can delete any comment" ON public."Comment";
DROP POLICY IF EXISTS "Admins and editors can manage all blog posts" ON public."BlogPost";

-- Allow ADMIN role users to update any profile
CREATE POLICY "Admins can update any profile"
  ON public."Profile" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public."Profile"
      WHERE "userId" = auth.uid()::text
      AND role = 'ADMIN'
    )
  );

-- Allow ADMIN to delete posts (moderation)
CREATE POLICY "Admins can delete any post"
  ON public."Post" FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public."Profile"
      WHERE "userId" = auth.uid()::text
      AND role = 'ADMIN'
    )
  );

-- Allow ADMIN to delete any comment (moderation)
CREATE POLICY "Admins can delete any comment"
  ON public."Comment" FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public."Profile"
      WHERE "userId" = auth.uid()::text
      AND role = 'ADMIN'
    )
  );

-- Allow ADMIN/EDITOR to manage blog posts
CREATE POLICY "Admins and editors can manage all blog posts"
  ON public."BlogPost" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public."Profile"
      WHERE "userId" = auth.uid()::text
      AND role IN ('ADMIN', 'EDITOR')
    )
  );
