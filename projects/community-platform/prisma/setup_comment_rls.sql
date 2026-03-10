-- Comment 테이블에 대한 RLS(Row Level Security) 정책 설정

-- 먼저 기존 주입 정책이 있다면 제거 (재실행 가능성 대비)
DROP POLICY IF EXISTS "Anyone can view comments" ON "Comment";
DROP POLICY IF EXISTS "Users can insert their own comments" ON "Comment";
DROP POLICY IF EXISTS "Users can update their own comments" ON "Comment";
DROP POLICY IF EXISTS "Users can delete their own comments" ON "Comment";

-- 1. RLS 활성화
ALTER TABLE "Comment" ENABLE ROW LEVEL SECURITY;

-- 2. 누구나 댓글을 조회할 수 있도록 허용 (SELECT)
CREATE POLICY "Anyone can view comments" 
ON "Comment" FOR SELECT 
USING (true);

-- 3. 로그인한 사용자만 자신의 프로필로 댓글을 작성할 수 있도록 허용 (INSERT)
CREATE POLICY "Users can insert their own comments" 
ON "Comment" FOR INSERT 
WITH CHECK (
  "authorId" IN (
    SELECT id FROM "Profile" WHERE "userId" = auth.uid()::text
  )
);

-- 4. 로그인한 작성자 본인만 자신의 댓글을 삭제할 수 있도록 허용 (DELETE)
CREATE POLICY "Users can delete their own comments" 
ON "Comment" FOR DELETE 
USING (
  "authorId" IN (
    SELECT id FROM "Profile" WHERE "userId" = auth.uid()::text
  )
);
