-- ===================================================
-- Missing RLS Policies for Notification, BlogPost, Follow
-- Run this in Supabase SQL Editor
-- ===================================================

-- 1. Notification RLS
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON "Notification" FOR SELECT
  USING (
    "receiverId" IN (
      SELECT id FROM "Profile" WHERE "userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can create notifications"
  ON "Notification" FOR INSERT
  WITH CHECK (
    "actorId" IN (
      SELECT id FROM "Profile" WHERE "userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can mark their notifications as read"
  ON "Notification" FOR UPDATE
  USING (
    "receiverId" IN (
      SELECT id FROM "Profile" WHERE "userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their own notifications"
  ON "Notification" FOR DELETE
  USING (
    "receiverId" IN (
      SELECT id FROM "Profile" WHERE "userId" = auth.uid()::text
    )
  );

-- 2. BlogPost RLS
ALTER TABLE "BlogPost" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blogs"
  ON "BlogPost" FOR SELECT
  USING (
    "isPublished" = true
    OR "authorId" IN (
      SELECT id FROM "Profile" WHERE "userId" = auth.uid()::text
    )
  );

CREATE POLICY "Authors can create blog posts"
  ON "BlogPost" FOR INSERT
  WITH CHECK (
    "authorId" IN (
      SELECT id FROM "Profile" WHERE "userId" = auth.uid()::text
    )
  );

CREATE POLICY "Authors can update their blog posts"
  ON "BlogPost" FOR UPDATE
  USING (
    "authorId" IN (
      SELECT id FROM "Profile" WHERE "userId" = auth.uid()::text
    )
  );

CREATE POLICY "Authors can delete their blog posts"
  ON "BlogPost" FOR DELETE
  USING (
    "authorId" IN (
      SELECT id FROM "Profile" WHERE "userId" = auth.uid()::text
    )
  );

-- 3. Follow RLS
ALTER TABLE "Follow" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows"
  ON "Follow" FOR SELECT
  USING (true);

CREATE POLICY "Users can create follows"
  ON "Follow" FOR INSERT
  WITH CHECK (
    "followerId" IN (
      SELECT id FROM "Profile" WHERE "userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their own follows"
  ON "Follow" FOR DELETE
  USING (
    "followerId" IN (
      SELECT id FROM "Profile" WHERE "userId" = auth.uid()::text
    )
  );

-- ===================================================
-- Performance Indexes
-- ===================================================

CREATE INDEX IF NOT EXISTS idx_post_author_id ON "Post"("authorId");
CREATE INDEX IF NOT EXISTS idx_post_group_id ON "Post"("groupId");
CREATE INDEX IF NOT EXISTS idx_post_created_at ON "Post"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_comment_post_id ON "Comment"("postId");
CREATE INDEX IF NOT EXISTS idx_comment_created_at ON "Comment"("createdAt");

CREATE INDEX IF NOT EXISTS idx_notification_receiver_id ON "Notification"("receiverId");
CREATE INDEX IF NOT EXISTS idx_notification_created_at ON "Notification"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_notification_is_read ON "Notification"("isRead");

CREATE INDEX IF NOT EXISTS idx_blogpost_author_id ON "BlogPost"("authorId");
CREATE INDEX IF NOT EXISTS idx_blogpost_is_published ON "BlogPost"("isPublished");
CREATE INDEX IF NOT EXISTS idx_blogpost_created_at ON "BlogPost"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_chatmessage_channel_id ON "ChatMessage"("channelId");
CREATE INDEX IF NOT EXISTS idx_chatmessage_created_at ON "ChatMessage"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_groupmember_profile_id ON "GroupMember"("profileId");
