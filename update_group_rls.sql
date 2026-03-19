-- update_group_rls.sql
-- Group 및 GroupMember 테이블에 대한 RLS 정책 픽스 (Profile.id -> Profile."userId" 매핑 오류 수정)

-- 1. 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view groups" ON public."Group";
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public."Group";
DROP POLICY IF EXISTS "Group admins can update groups" ON public."Group";
DROP POLICY IF EXISTS "Group admins can delete groups" ON public."Group";

DROP POLICY IF EXISTS "Anyone can view group members" ON public."GroupMember";
DROP POLICY IF EXISTS "Users can join or admins can add members" ON public."GroupMember";
DROP POLICY IF EXISTS "Group admins can update members" ON public."GroupMember";
DROP POLICY IF EXISTS "Users can leave or admins can remove members" ON public."GroupMember";

-- 2. Group 테이블 정책
CREATE POLICY "Anyone can view groups" ON public."Group"
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create groups" ON public."Group"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Group admins can update groups" ON public."Group"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."GroupMember" gm
      WHERE gm."groupId" = "Group".id
      AND gm."profileId" = (SELECT id FROM public."Profile" WHERE "userId" = auth.uid()::text)
      AND gm.role = 'ADMIN'
    )
  );

CREATE POLICY "Group admins can delete groups" ON public."Group"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public."GroupMember" gm
      WHERE gm."groupId" = "Group".id
      AND gm."profileId" = (SELECT id FROM public."Profile" WHERE "userId" = auth.uid()::text)
      AND gm.role = 'ADMIN'
    )
  );

-- 3. GroupMember 테이블 정책
CREATE POLICY "Anyone can view group members" ON public."GroupMember"
  FOR SELECT USING (true);

CREATE POLICY "Users can join or admins can add members" ON public."GroupMember"
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      "profileId" = (SELECT id FROM public."Profile" WHERE "userId" = auth.uid()::text) OR
      EXISTS (
        SELECT 1 FROM public."GroupMember" gm
        WHERE gm."groupId" = "GroupMember"."groupId"
        AND gm."profileId" = (SELECT id FROM public."Profile" WHERE "userId" = auth.uid()::text)
        AND gm.role = 'ADMIN'
      )
    )
  );

CREATE POLICY "Group admins can update members" ON public."GroupMember"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."GroupMember" gm
      WHERE gm."groupId" = "GroupMember"."groupId"
      AND gm."profileId" = (SELECT id FROM public."Profile" WHERE "userId" = auth.uid()::text)
      AND gm.role = 'ADMIN'
    )
  );

CREATE POLICY "Users can leave or admins can remove members" ON public."GroupMember"
  FOR DELETE USING (
    "profileId" = (SELECT id FROM public."Profile" WHERE "userId" = auth.uid()::text) OR
    EXISTS (
      SELECT 1 FROM public."GroupMember" gm
      WHERE gm."groupId" = "GroupMember"."groupId"
      AND gm."profileId" = (SELECT id FROM public."Profile" WHERE "userId" = auth.uid()::text)
      AND gm.role = 'ADMIN'
    )
  );
