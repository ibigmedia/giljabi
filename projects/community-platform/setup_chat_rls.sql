-- Enable RLS for chat tables
ALTER TABLE "ChatChannel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatParticipant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatMessage" ENABLE ROW LEVEL SECURITY;

-- ChatChannel Policies
-- Users can view channels they are participants of
CREATE POLICY "Users can view their channels" ON "ChatChannel"
  FOR SELECT
  USING (
    id IN (
      SELECT "channelId" FROM "ChatParticipant" WHERE "profileId" = auth.uid()
    )
  );

-- Users can create channels
CREATE POLICY "Users can create channels" ON "ChatChannel"
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ChatParticipant Policies
-- Users can view participants of their channels
CREATE POLICY "Users can view participants of their channels" ON "ChatParticipant"
  FOR SELECT
  USING (
    "channelId" IN (
      SELECT "channelId" FROM "ChatParticipant" WHERE "profileId" = auth.uid()
    )
  );

-- Users can add themselves or others to channels
CREATE POLICY "Users can add participants" ON "ChatParticipant"
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ChatMessage Policies
-- Users can view messages in their channels
CREATE POLICY "Users can view messages in their channels" ON "ChatMessage"
  FOR SELECT
  USING (
    "channelId" IN (
      SELECT "channelId" FROM "ChatParticipant" WHERE "profileId" = auth.uid()
    )
  );

-- Users can insert messages to their channels
CREATE POLICY "Users can insert messages to their channels" ON "ChatMessage"
  FOR INSERT
  WITH CHECK (
    senderId = auth.uid() AND
    "channelId" IN (
      SELECT "channelId" FROM "ChatParticipant" WHERE "profileId" = auth.uid()
    )
  );

-- Enable Realtime for ChatMessage
-- We need to add ChatMessage to the supabase_realtime publication
alter publication supabase_realtime add table "ChatMessage";
