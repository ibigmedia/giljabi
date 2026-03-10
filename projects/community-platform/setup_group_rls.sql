-- setup_group_rls.sql
-- Group 및 GroupMember 테이블에 대한 RLS 정책 설정

-- 1. RLS 활성화
ALTER TABLE public."Group" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."GroupMember" ENABLE ROW LEVEL SECURITY;

-- 2. Group 테이블 정책
-- 조회: 누구나 모든 그룹을 볼 수 있음 (공개/비공개 상관없이 존재 여부 및 기본 정보는 노출)
-- 비공개 그룹의 상세 내용/게시물은 프론트엔드 또는 Post RLS에서 제어
CREATE POLICY "Anyone can view groups" ON public."Group"
  FOR SELECT USING (true);

-- 생성: 인증된 사용자 누구나 그룹 생성 가능
CREATE POLICY "Authenticated users can create groups" ON public."Group"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 수정: 그룹 관리자(ADMIN)만 수정 가능
CREATE POLICY "Group admins can update groups" ON public."Group"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."GroupMember" gm
      WHERE gm."groupId" = "Group".id
      AND gm."profileId" = (SELECT id FROM public."Profile" WHERE id = auth.uid()::text)
      AND gm.role = 'ADMIN'
    )
  );

-- 삭제: 그룹 관리자(ADMIN)만 삭제 가능
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
-- 조회: 누구나 그룹 멤버 목록을 볼 수 있음
CREATE POLICY "Anyone can view group members" ON public."GroupMember"
  FOR SELECT USING (true);

-- 멤버 추가 (가입 또는 초대):
-- 1) 사용자가 직접 가입하는 경우 (자신의 profileId로 INSERT)
-- 2) 그룹 관리자가 다른 사용자를 추가하는 경우
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

-- 멤버 수정 (역할 변경 등): 그룹 관리자만 가능
CREATE POLICY "Group admins can update members" ON public."GroupMember"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public."GroupMember" gm
      WHERE gm."groupId" = "GroupMember"."groupId"
      AND gm."profileId" = (SELECT id FROM public."Profile" WHERE id = auth.uid()::text)
      AND gm.role = 'ADMIN'
    )
  );

-- 멤버 탈퇴/삭제 (추방):
-- 1) 사용자 본인이 탈퇴하는 경우
-- 2) 그룹 관리자가 다른 멤버를 추방하는 경우
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

-- 4. Post 테이블 그룹 관련 RLS 수정 (옵션 - 필요한 경우)
-- 기본적으로 누구나 볼 수 있지만, 비공개 그룹(isPrivate = true)의 게시물은 멤버만 볼 수 있도록 하려면
-- Post 테이블의 RLS 정책을 변경해야 할 수도 있습니다. 
-- 현재 Post 테이블의 "View posts" 정책이 단순히 USING (true) 이라면, 아래와 같이 보완을 고려할 수 있습니다.
-- (주의: 기존 정책 이름에 맞춰 DROP 후 CREATE 해야 함. 여기서는 주석 처리로 남겨둡니다.)

/*
DROP POLICY IF EXISTS "View posts" ON public."Post";

CREATE POLICY "View posts" ON public."Post"
  FOR SELECT USING (
    "groupId" IS NULL OR -- 그룹에 속하지 않은 일반 포스트
    EXISTS (             -- 그룹 포스트인 경우
      SELECT 1 FROM public."Group" g
      WHERE g.id = "Post"."groupId"
      AND (
        g."isPrivate" = false OR -- 공개 그룹이면 누구나
        EXISTS (                 -- 비공개 그룹이면 멤버만
          SELECT 1 FROM public."GroupMember" gm
          WHERE gm."groupId" = g.id
          AND gm."profileId" = (SELECT id FROM public."Profile" WHERE id = auth.uid()::text)
        )
      )
    )
  );
*/
