-- ============================================
-- Create Storage Buckets and Policies
-- ============================================

-- Create model-previews bucket (Public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('model-previews', 'model-previews', true)
ON CONFLICT (id) DO NOTHING;

-- Create model-files bucket (Public or Private - your choice)
INSERT INTO storage.buckets (id, name, public)
VALUES ('model-files', 'model-files', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Storage Policies for model-previews
-- ============================================

-- Allow anyone to view preview images
DROP POLICY IF EXISTS "Public preview images viewable by everyone" ON storage.objects;
CREATE POLICY "Public preview images viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'model-previews');

-- Allow authenticated users to upload preview images
DROP POLICY IF EXISTS "Authenticated users can upload preview images" ON storage.objects;
CREATE POLICY "Authenticated users can upload preview images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'model-previews' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to update their own preview images
DROP POLICY IF EXISTS "Users can update their own preview images" ON storage.objects;
CREATE POLICY "Users can update their own preview images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'model-previews' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own preview images
DROP POLICY IF EXISTS "Users can delete their own preview images" ON storage.objects;
CREATE POLICY "Users can delete their own preview images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'model-previews' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- Storage Policies for model-files
-- ============================================

-- Allow anyone to view model files
DROP POLICY IF EXISTS "Public model files viewable by everyone" ON storage.objects;
CREATE POLICY "Public model files viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'model-files');

-- Allow authenticated users to upload model files
DROP POLICY IF EXISTS "Authenticated users can upload model files" ON storage.objects;
CREATE POLICY "Authenticated users can upload model files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'model-files' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to update their own model files
DROP POLICY IF EXISTS "Users can update their own model files" ON storage.objects;
CREATE POLICY "Users can update their own model files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'model-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own model files
DROP POLICY IF EXISTS "Users can delete their own model files" ON storage.objects;
CREATE POLICY "Users can delete their own model files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'model-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
