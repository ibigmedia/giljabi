-- Drop existing incorrect policies
DROP POLICY IF EXISTS "Users can view their channels" ON "ChatChannel";
DROP POLICY IF EXISTS "Users can create channels" ON "ChatChannel";

DROP POLICY IF EXISTS "Users can view participants of their channels" ON "ChatParticipant";
DROP POLICY IF EXISTS "Users can add participants" ON "ChatParticipant";

DROP POLICY IF EXISTS "Users can view messages in their channels" ON "ChatMessage";
DROP POLICY IF EXISTS "Users can insert messages to their channels" ON "ChatMessage";

-- Re-create ChatChannel Policies with correct Profile ID mapping
CREATE POLICY "Users can view their channels" ON "ChatChannel"
  FOR SELECT
  USING (
    id IN (
      SELECT "channelId" FROM "ChatParticipant" 
      WHERE "profileId" = (SELECT id FROM "Profile" WHERE "userId" = auth.uid()::text)
    )
  );

CREATE POLICY "Users can create channels" ON "ChatChannel"
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Re-create ChatParticipant Policies
CREATE POLICY "Users can view participants of their channels" ON "ChatParticipant"
  FOR SELECT
  USING (
    "channelId" IN (
      SELECT "channelId" FROM "ChatParticipant" 
      WHERE "profileId" = (SELECT id FROM "Profile" WHERE "userId" = auth.uid()::text)
    )
  );

CREATE POLICY "Users can add participants" ON "ChatParticipant"
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Re-create ChatMessage Policies
CREATE POLICY "Users can view messages in their channels" ON "ChatMessage"
  FOR SELECT
  USING (
    "channelId" IN (
      SELECT "channelId" FROM "ChatParticipant" 
      WHERE "profileId" = (SELECT id FROM "Profile" WHERE "userId" = auth.uid()::text)
    )
  );

CREATE POLICY "Users can insert messages to their channels" ON "ChatMessage"
  FOR INSERT
  WITH CHECK (
    "senderId" = (SELECT id FROM "Profile" WHERE "userId" = auth.uid()::text) AND
    "channelId" IN (
      SELECT "channelId" FROM "ChatParticipant" 
      WHERE "profileId" = (SELECT id FROM "Profile" WHERE "userId" = auth.uid()::text)
    )
  );

-- Note: supabase_realtime publication does not need to be dropped or re-added, it remains intact.
