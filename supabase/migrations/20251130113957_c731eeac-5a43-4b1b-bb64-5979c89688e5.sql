-- Create storage bucket for crop images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('crop-images', 'crop-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for crop images
CREATE POLICY "Anyone can view crop images"
ON storage.objects FOR SELECT
USING (bucket_id = 'crop-images');

CREATE POLICY "Authenticated users can upload crop images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'crop-images' 
  AND auth.role() = 'authenticated'
);