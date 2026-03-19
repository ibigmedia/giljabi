-- enable_supabase_rls_all.sql
-- 이 스크립트는 Supabase Security Advisor에서 검출한 RLS 비활성화 취약점을 해결하기 위해 
-- 프로젝트 내 모든 주요 테이블에 RLS를 활성화하고 기본적인 보안 정책(Policy)을 설정합니다.

-- 1. 모든 주요 테이블 RLS 활성화
ALTER TABLE public."Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Follow" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Comment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PostLike" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Group" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."GroupMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ChatChannel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ChatParticipant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ChatMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BlogPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Release" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Track" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MusicVideo" ENABLE ROW LEVEL SECURITY;

-- 2. 기본 보안 정책 (Postgres 정책 덮어쓰기 방지를 위해 DROP 후 CREATE)

-- [Profile 테이블]
DROP POLICY IF EXISTS "Anyone can view profiles" ON public."Profile";
CREATE POLICY "Anyone can view profiles" ON public."Profile" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public."Profile";
CREATE POLICY "Users can insert their own profile" ON public."Profile" FOR INSERT WITH CHECK (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "Users can update own profile" ON public."Profile";
CREATE POLICY "Users can update own profile" ON public."Profile" FOR UPDATE USING (auth.uid()::text = "userId");

-- [Post 테이블]
DROP POLICY IF EXISTS "Anyone can view posts" ON public."Post";
CREATE POLICY "Anyone can view posts" ON public."Post" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public."Post";
CREATE POLICY "Authenticated users can create posts" ON public."Post" FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update/delete their own posts" ON public."Post";
CREATE POLICY "Users can update/delete their own posts" ON public."Post" FOR ALL USING (
  EXISTS (SELECT 1 FROM public."Profile" WHERE id = "Post"."authorId" AND "userId" = auth.uid()::text)
);

-- [Comment 테이블]
DROP POLICY IF EXISTS "Anyone can view comments" ON public."Comment";
CREATE POLICY "Anyone can view comments" ON public."Comment" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public."Comment";
CREATE POLICY "Authenticated users can create comments" ON public."Comment" FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update/delete their own comments" ON public."Comment";
CREATE POLICY "Users can update/delete their own comments" ON public."Comment" FOR ALL USING (
  EXISTS (SELECT 1 FROM public."Profile" WHERE id = "Comment"."authorId" AND "userId" = auth.uid()::text)
);

-- [PostLike 테이블]
DROP POLICY IF EXISTS "Anyone can view likes" ON public."PostLike";
CREATE POLICY "Anyone can view likes" ON public."PostLike" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their likes" ON public."PostLike";
CREATE POLICY "Users can manage their likes" ON public."PostLike" FOR ALL USING (
  EXISTS (SELECT 1 FROM public."Profile" WHERE id = "PostLike"."profileId" AND "userId" = auth.uid()::text)
);

-- [Follow 테이블]
DROP POLICY IF EXISTS "Anyone can view follows" ON public."Follow";
CREATE POLICY "Anyone can view follows" ON public."Follow" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their follows" ON public."Follow";
CREATE POLICY "Users can manage their follows" ON public."Follow" FOR ALL USING (
  EXISTS (SELECT 1 FROM public."Profile" WHERE id = "Follow"."followerId" AND "userId" = auth.uid()::text)
);

-- [Notification 테이블]
DROP POLICY IF EXISTS "Users can view their own notifications" ON public."Notification";
CREATE POLICY "Users can view their own notifications" ON public."Notification" FOR SELECT USING (
  EXISTS (SELECT 1 FROM public."Profile" WHERE id = "Notification"."receiverId" AND "userId" = auth.uid()::text)
);

DROP POLICY IF EXISTS "Authenticated users can send notifications" ON public."Notification";
CREATE POLICY "Authenticated users can send notifications" ON public."Notification" FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own notifications" ON public."Notification";
CREATE POLICY "Users can update their own notifications" ON public."Notification" FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public."Profile" WHERE id = "Notification"."receiverId" AND "userId" = auth.uid()::text)
);

-- [Portfolio/Blog 테이블 (모두 읽기 가능, 등록/수정은 인증된 사용자 혹은 어드민)]
DROP POLICY IF EXISTS "Anyone can view portfolio and blog" ON public."BlogPost";
CREATE POLICY "Anyone can view portfolio and blog" ON public."BlogPost" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can manage blog" ON public."BlogPost";
CREATE POLICY "Authenticated can manage blog" ON public."BlogPost" FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Anyone can view releases" ON public."Release";
CREATE POLICY "Anyone can view releases" ON public."Release" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated can manage releases" ON public."Release";
CREATE POLICY "Authenticated can manage releases" ON public."Release" FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Anyone can view tracks" ON public."Track";
CREATE POLICY "Anyone can view tracks" ON public."Track" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated can manage tracks" ON public."Track";
CREATE POLICY "Authenticated can manage tracks" ON public."Track" FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Anyone can view music videos" ON public."MusicVideo";
CREATE POLICY "Anyone can view music videos" ON public."MusicVideo" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated can manage music videos" ON public."MusicVideo";
CREATE POLICY "Authenticated can manage music videos" ON public."MusicVideo" FOR ALL USING (auth.role() = 'authenticated');

-- [주의]: Group 및 Chat 관련 정책은 기존에 작성된 setup_group_rls.sql, setup_chat_rls.sql 적용 시 덮어쓰여질 수 있습니다.
-- 기존 스크립트들이 있다면 해당 SQL 파일들도 함께 Supabase 쿼리 에디터에서 실행해야 안전하게 동작합니다.
