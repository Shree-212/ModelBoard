-- ============================================
-- Add storage path columns to models table
-- ============================================

-- Add columns to store file paths for deletion
ALTER TABLE models
ADD COLUMN IF NOT EXISTS preview_image_path TEXT,
ADD COLUMN IF NOT EXISTS model_file_path TEXT;

-- These columns will store the internal storage paths
-- allowing us to delete files when models are updated or deleted
