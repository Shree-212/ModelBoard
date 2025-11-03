# File Upload Setup Guide

## Overview
Your ModelBoard now supports direct file uploads to Supabase Storage! Users can upload preview images and model files instead of providing URLs.

## What Changed

### 1. New Features
- ✅ Upload preview images directly (JPG, PNG, GIF, WebP up to 5MB)
- ✅ Upload model files directly (.pt, .pth, .h5, .onnx, etc. up to 500MB)
- ✅ Automatic file deletion when models are updated/deleted
- ✅ File validation (type and size)
- ✅ Upload progress indicator
- ✅ Still supports URL input as alternative

### 2. New Files Created
- `/lib/storage.ts` - Storage utilities (upload, delete, validate)
- `/migrations/add_storage_paths.sql` - Database migration
- `/migrations/create_storage_buckets.sql` - Storage bucket setup

### 3. Updated Files
- `/lib/supabase.ts` - Added `preview_image_path` and `model_file_path` fields
- `/app/my-account/page.tsx` - Added file upload UI and logic
- `/next.config.ts` - Added image domains

## Setup Instructions

### Step 1: Run Database Migration

Go to **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- Add storage path columns
ALTER TABLE models
ADD COLUMN IF NOT EXISTS preview_image_path TEXT,
ADD COLUMN IF NOT EXISTS model_file_path TEXT;
```

### Step 2: Create Storage Buckets

In **Supabase Dashboard** → **SQL Editor**, run:

```sql
-- Create buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('model-previews', 'model-previews', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('model-files', 'model-files', true)
ON CONFLICT (id) DO NOTHING;
```

### Step 3: Set Storage Policies

Run this complete SQL script in **SQL Editor**:

```sql
-- Policies for model-previews bucket
CREATE POLICY IF NOT EXISTS "Public preview images viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'model-previews');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload preview images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'model-previews' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY IF NOT EXISTS "Users can update their own preview images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'model-previews' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY IF NOT EXISTS "Users can delete their own preview images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'model-previews' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policies for model-files bucket
CREATE POLICY IF NOT EXISTS "Public model files viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'model-files');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload model files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'model-files' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY IF NOT EXISTS "Users can update their own model files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'model-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY IF NOT EXISTS "Users can delete their own model files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'model-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### Step 4: Verify Setup

1. Go to **Supabase Dashboard** → **Storage**
2. You should see two buckets:
   - `model-previews` (Public)
   - `model-files` (Public)

## How To Use

### Creating a Model with File Upload

1. Go to **My Account** → **New Model**
2. Fill in title, description, tags
3. For **Preview Image**:
   - Click "Upload Image" button
   - Select an image file (JPG, PNG, GIF, WebP)
   - OR provide a URL
4. For **Model File**:
   - Click "Upload Model File" button
   - Select a model file (.pt, .pth, .h5, etc.)
   - OR provide a URL/HuggingFace ID
5. Select demo type and other options
6. Click **Save Model**

### Upload Process

When you click save:
1. ✅ Preview image uploads (if selected)
2. ✅ Model file uploads (if selected)  
3. ✅ Progress shown: "Uploading preview image..." → "Uploading model file..." → "Saving model..."
4. ✅ Old files automatically deleted when updating
5. ✅ All files deleted when model is deleted

### File Validation

**Preview Images:**
- Allowed types: JPG, JPEG, PNG, GIF, WebP
- Max size: 5MB

**Model Files:**
- Allowed types: .pt, .pth, .bin, .h5, .hdf5, .onnx, .pkl, .safetensors, .zip, .tar, .gz
- Max size: 500MB

## Storage Structure

Files are organized by user ID:

```
model-previews/
  └── {user-id}/
      ├── {timestamp}-{random}.jpg
      ├── {timestamp}-{random}.png
      └── ...

model-files/
  └── {user-id}/
      ├── {timestamp}-{random}.pt
      ├── {timestamp}-{random}.h5
      └── ...
```

## Troubleshooting

### "Upload failed" error
- Check file size (5MB for images, 500MB for models)
- Check file type is allowed
- Verify storage buckets are created
- Check storage policies are set

### "Permission denied" error
- Verify you're logged in
- Check storage policies in Supabase Dashboard
- Make sure RLS is enabled on storage.objects

### Files not deleting
- Check that `preview_image_path` and `model_file_path` are being saved
- Verify delete policies exist

## Cost Considerations

**Supabase Free Tier:**
- 1GB storage
- 2GB bandwidth per month
- 50MB file upload limit

**Recommendations:**
- Keep model files under 50MB or upgrade plan
- Use external hosting (HuggingFace) for large models
- Compress images before upload

## Migration from URL-only

Existing models with URLs will continue to work! The system supports both:
- ✅ Uploaded files (new)
- ✅ External URLs (existing)

No data migration needed.

---

**Setup Complete!** 🎉

Users can now upload files directly to ModelBoard!
