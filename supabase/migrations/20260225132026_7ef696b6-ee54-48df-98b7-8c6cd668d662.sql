
-- Create user_guides table
CREATE TABLE public.user_guides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  guide_type TEXT NOT NULL DEFAULT 'document',
  file_url TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_guides ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved guides
CREATE POLICY "Anyone can view approved guides"
ON public.user_guides FOR SELECT
USING (status = 'approved');

-- Users can view their own guides (any status)
CREATE POLICY "Users can view own guides"
ON public.user_guides FOR SELECT
USING (auth.uid() = user_id);

-- Users can create guides
CREATE POLICY "Users can create guides"
ON public.user_guides FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending guides
CREATE POLICY "Users can update own pending guides"
ON public.user_guides FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Users can delete their own guides
CREATE POLICY "Users can delete own guides"
ON public.user_guides FOR DELETE
USING (auth.uid() = user_id);

-- Admins can manage all guides
CREATE POLICY "Admins can manage all guides"
ON public.user_guides FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for guide files
INSERT INTO storage.buckets (id, name, public)
VALUES ('guide-files', 'guide-files', true);

-- Storage policies for guide-files bucket
CREATE POLICY "Anyone can view guide files"
ON storage.objects FOR SELECT
USING (bucket_id = 'guide-files');

CREATE POLICY "Authenticated users can upload guide files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'guide-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own guide files"
ON storage.objects FOR DELETE
USING (bucket_id = 'guide-files' AND auth.uid()::text = (storage.foldername(name))[1]);
