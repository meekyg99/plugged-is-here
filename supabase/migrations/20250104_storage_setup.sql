-- Storage Setup for Banner Images
-- Create storage bucket for banner images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for banners bucket
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects FOR SELECT 
USING (bucket_id = 'banners');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload banners" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'banners' AND auth.role() = 'authenticated');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update banners" ON storage.objects FOR UPDATE 
USING (bucket_id = 'banners' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete banners" ON storage.objects FOR DELETE 
USING (bucket_id = 'banners' AND auth.role() = 'authenticated');
