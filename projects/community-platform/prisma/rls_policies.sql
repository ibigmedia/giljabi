-- Profile Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public."Profile" (id, "userId", username, "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid()::text,
    NEW.id::text,
    COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.email, 'user_' || substr(NEW.id::text, 1, 8)),
    now(),
    now()
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable RLS
ALTER TABLE public."Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Comment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PostLike" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Group" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."GroupMember" ENABLE ROW LEVEL SECURITY;

-- Policies for Profile
CREATE POLICY "Public profiles are viewable by everyone."
  ON public."Profile" FOR SELECT USING (true);

CREATE POLICY "Users can update own profile."
  ON public."Profile" FOR UPDATE USING (auth.uid()::text = "userId");

-- Policies for Post
CREATE POLICY "Posts are viewable by everyone."
  ON public."Post" FOR SELECT USING (true);

CREATE POLICY "Users can insert their own posts."
  ON public."Post" FOR INSERT WITH CHECK (
    auth.uid()::text = (SELECT "userId" FROM public."Profile" WHERE id = "authorId")
  );

CREATE POLICY "Users can update their own posts."
  ON public."Post" FOR UPDATE USING (
    auth.uid()::text = (SELECT "userId" FROM public."Profile" WHERE id = "authorId")
  );

CREATE POLICY "Users can delete their own posts."
  ON public."Post" FOR DELETE USING (
    auth.uid()::text = (SELECT "userId" FROM public."Profile" WHERE id = "authorId")
  );

-- Policies for Comment
CREATE POLICY "Comments are viewable by everyone."
  ON public."Comment" FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comments."
  ON public."Comment" FOR INSERT WITH CHECK (
    auth.uid()::text = (SELECT "userId" FROM public."Profile" WHERE id = "authorId")
  );

CREATE POLICY "Users can delete their own comments."
  ON public."Comment" FOR DELETE USING (
    auth.uid()::text = (SELECT "userId" FROM public."Profile" WHERE id = "authorId")
  );

-- Policies for PostLike
CREATE POLICY "PostLikes are viewable by everyone."
  ON public."PostLike" FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes."
  ON public."PostLike" FOR INSERT WITH CHECK (
    auth.uid()::text = (SELECT "userId" FROM public."Profile" WHERE id = "profileId")
  );

CREATE POLICY "Users can delete their own likes."
  ON public."PostLike" FOR DELETE USING (
    auth.uid()::text = (SELECT "userId" FROM public."Profile" WHERE id = "profileId")
  );