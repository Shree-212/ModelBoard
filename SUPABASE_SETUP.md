# Supabase Setup Guide for ModelBoard

This document provides step-by-step instructions to configure your Supabase backend for the ModelBoard application.

## Table of Contents
1. [Database Schema](#database-schema)
2. [Google OAuth Setup](#google-oauth-setup)
3. [Row Level Security (RLS)](#row-level-security-rls)
4. [Storage Setup](#storage-setup)

---

## Database Schema

### 1. Create the `models` table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create models table
CREATE TABLE models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  preview_image_url TEXT,
  model_file_url TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0
);

-- Create index for better performance
CREATE INDEX idx_models_user_id ON models(user_id);
CREATE INDEX idx_models_created_at ON models(created_at DESC);
CREATE INDEX idx_models_tags ON models USING GIN(tags);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_models_updated_at 
  BEFORE UPDATE ON models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Google OAuth Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if you haven't already
6. Select **Web application** as the application type
7. Add these authorized redirect URIs:
   ```
   https://jjktseggwrqkpegjhpbk.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback (for local development)
   ```
8. Copy your **Client ID** and **Client Secret**

### Step 2: Configure Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Google** and enable it
4. Paste your Google **Client ID** and **Client Secret**
5. Click **Save**

### Step 3: Configure Site URL and Redirect URLs

1. In Supabase Dashboard, go to **Authentication** > **URL Configuration**
2. Set **Site URL** to: `http://localhost:3000` (for development) or your production URL
3. Add **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   https://your-production-domain.com/auth/callback
   ```

---

## Row Level Security (RLS)

Enable RLS and create policies for the `models` table:

```sql
-- Enable Row Level Security
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view models
CREATE POLICY "Models are viewable by everyone" 
  ON models FOR SELECT 
  USING (true);

-- Policy: Users can insert their own models
CREATE POLICY "Users can insert their own models" 
  ON models FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own models
CREATE POLICY "Users can update their own models" 
  ON models FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own models
CREATE POLICY "Users can delete their own models" 
  ON models FOR DELETE 
  USING (auth.uid() = user_id);
```

---

## Storage Setup

### Create Storage Buckets

1. In Supabase Dashboard, go to **Storage**
2. Click **Create a new bucket**
3. Create two buckets:
   - **Name**: `model-previews` (for preview images)
   - **Public**: Yes
   - **Name**: `model-files` (for model files)
   - **Public**: No (or Yes, depending on your requirements)

### Configure Storage Policies

```sql
-- Policy for model-previews bucket
-- Allow anyone to view preview images
CREATE POLICY "Public preview images" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'model-previews');

-- Allow authenticated users to upload preview images
CREATE POLICY "Authenticated users can upload preview images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'model-previews' AND auth.role() = 'authenticated');

-- Allow users to update their own preview images
CREATE POLICY "Users can update their own preview images" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'model-previews' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own preview images
CREATE POLICY "Users can delete their own preview images" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'model-previews' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## Verification Checklist

✅ **Database**
- [ ] `models` table created with all columns
- [ ] Indexes created
- [ ] Triggers configured

✅ **Authentication**
- [ ] Google OAuth provider enabled
- [ ] Client ID and Secret configured
- [ ] Redirect URLs added

✅ **Security**
- [ ] RLS enabled on `models` table
- [ ] All policies created and tested

✅ **Storage**
- [ ] Storage buckets created
- [ ] Storage policies configured

---

## Testing Your Setup

1. **Test Authentication**:
   ```bash
   npm run dev
   ```
   - Click "Sign In with Google"
   - Verify you can sign in and out

2. **Test Database**:
   - Create a new model in "My Account"
   - Verify it appears in the "Models" page
   - Edit and delete the model

3. **Test RLS**:
   - Create a model while logged in
   - Sign out and verify you can still see the model
   - Sign in as a different user and verify you cannot edit/delete others' models

---

## Troubleshooting

### Google OAuth Errors
- **Error**: "redirect_uri_mismatch"
  - **Solution**: Verify redirect URIs in Google Console match exactly with Supabase

### Database Errors
- **Error**: "permission denied for table models"
  - **Solution**: Check that RLS policies are correctly configured

### Authentication Not Persisting
- **Error**: User logged out on page refresh
  - **Solution**: Verify `persistSession: true` in Supabase client configuration

---

## Environment Variables

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jjktseggwrqkpegjhpbk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqa3RzZWdnd3Jxa3BlZ2pocGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwOTE1NzUsImV4cCI6MjA3NzY2NzU3NX0.D-TXTnz-zhJlhteMeUoB6Z-qA-ocLadVyeLEvlX80h8
```

---

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
