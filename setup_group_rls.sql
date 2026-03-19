-- setup_group_rls.sql
-- Group 및 GroupMember 테이블에 대한 RLS 정책 설정

-- 1. RLS 활성화
ALTER TABLE public."Group" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."GroupMember" ENABLE ROW LEVEL SECURITY;

-- 2. Group 테이블 정책
DROP POLICY IF EXISTS "Anyone can view groups" ON public."Group";
CREATE POLICY "Anyone can view groups" ON public."Group"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create groups" ON public."Group";
CREATE POLICY "Authenticated users can create groups" ON public."Group"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Group admins can update groups" ON public."Group";
CREATE POLICY "Group admins can update groups" ON public."Group"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."GroupMember" gm
      WHERE gm."groupId" = "Group".id
      AND gm."profileId" = (SELECT id FROM public."Profile" WHERE id = auth.uid()::text)
      AND gm.role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "Group admins can delete groups" ON public."Group";
CREATE POLICY "Group admins can delete groups" ON public."Group"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."GroupMember" gm
      WHERE gm."groupId" = "Group".id
      AND gm."profileId" = (SELECT id FROM public."Profile" WHERE id = auth.uid()::text)
      AND gm.role = 'ADMIN'
    )
  );

-- 3. GroupMember 테이블 정책
DROP POLICY IF EXISTS "Anyone can view group members" ON public."GroupMember";
CREATE POLICY "Anyone can view group members" ON public."GroupMember"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can join or admins can add members" ON public."GroupMember";
CREATE POLICY "Users can join or admins can add members" ON public."GroupMember"
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      "profileId" = (SELECT id FROM public."Profile" WHERE id = auth.uid()::text) OR
      EXISTS (
        SELECT 1 FROM public."GroupMember" gm
        WHERE gm."groupId" = "GroupMember"."groupId"
        AND gm."profileId" = (SELECT id FROM public."Profile" WHERE id = auth.uid()::text)
        AND gm.role = 'ADMIN'
      )
    )
  );

DROP POLICY IF EXISTS "Group admins can update members" ON public."GroupMember";
CREATE POLICY "Group admins can update members" ON public."GroupMember"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."GroupMember" gm
      WHERE gm."groupId" = "GroupMember"."groupId"
      AND gm."profileId" = (SELECT id FROM public."Profile" WHERE id = auth.uid()::text)
      AND gm.role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "Users can leave or admins can remove members" ON public."GroupMember";
CREATE POLICY "Users can leave or admins can remove members" ON public."GroupMember"
  FOR DELETE USING (
    "profileId" = (SELECT id FROM public."Profile" WHERE id = auth.uid()::text) OR
    EXISTS (
      SELECT 1 FROM public."GroupMember" gm
      WHERE gm."groupId" = "GroupMember"."groupId"
      AND gm."profileId" = (SELECT id FROM public."Profile" WHERE id = auth.uid()::text)
      AND gm.role = 'ADMIN'
    )
  );
