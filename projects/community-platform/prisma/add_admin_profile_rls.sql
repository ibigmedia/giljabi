-- ===================================================
-- Admin can update any profile (for approval/role management)
-- Run this in Supabase SQL Editor
-- ===================================================

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
