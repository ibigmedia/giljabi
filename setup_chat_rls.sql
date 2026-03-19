-- Enable RLS for chat tables
ALTER TABLE "ChatChannel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatParticipant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatMessage" ENABLE ROW LEVEL SECURITY;

-- ChatChannel Policies
DROP POLICY IF EXISTS "Users can view their channels" ON "ChatChannel";
CREATE POLICY "Users can view their channels" ON "ChatChannel"
  FOR SELECT
  USING (
    id IN (
      SELECT "channelId" FROM "ChatParticipant" WHERE "profileId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can create channels" ON "ChatChannel";
CREATE POLICY "Users can create channels" ON "ChatChannel"
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ChatParticipant Policies
DROP POLICY IF EXISTS "Users can view participants of their channels" ON "ChatParticipant";
CREATE POLICY "Users can view participants of their channels" ON "ChatParticipant"
  FOR SELECT
  USING (
    "channelId" IN (
      SELECT "channelId" FROM "ChatParticipant" WHERE "profileId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can add participants" ON "ChatParticipant";
CREATE POLICY "Users can add participants" ON "ChatParticipant"
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ChatMessage Policies
DROP POLICY IF EXISTS "Users can view messages in their channels" ON "ChatMessage";
CREATE POLICY "Users can view messages in their channels" ON "ChatMessage"
  FOR SELECT
  USING (
    "channelId" IN (
      SELECT "channelId" FROM "ChatParticipant" WHERE "profileId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can insert messages to their channels" ON "ChatMessage";
CREATE POLICY "Users can insert messages to their channels" ON "ChatMessage"
  FOR INSERT
  WITH CHECK (
    "senderId" = auth.uid()::text AND
    "channelId" IN (
      SELECT "channelId" FROM "ChatParticipant" WHERE "profileId" = auth.uid()::text
    )
  );

-- Enable Realtime for ChatMessage
-- We need to add ChatMessage to the supabase_realtime publication (May fail if already exists)
-- alter publication supabase_realtime add table "ChatMessage";
