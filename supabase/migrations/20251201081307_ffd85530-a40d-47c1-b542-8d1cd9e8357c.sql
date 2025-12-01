-- Create tables for marketplace social features
CREATE TABLE IF NOT EXISTS public.marketplace_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketplace_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_comments ENABLE ROW LEVEL SECURITY;

-- Policies for marketplace_likes
CREATE POLICY "Anyone can view likes" ON public.marketplace_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own likes" ON public.marketplace_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.marketplace_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for marketplace_comments
CREATE POLICY "Anyone can view comments" ON public.marketplace_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own comments" ON public.marketplace_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.marketplace_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.marketplace_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_marketplace_likes_listing ON marketplace_likes(listing_id);
CREATE INDEX idx_marketplace_likes_user ON marketplace_likes(user_id);
CREATE INDEX idx_marketplace_comments_listing ON marketplace_comments(listing_id);
CREATE INDEX idx_marketplace_comments_user ON marketplace_comments(user_id);