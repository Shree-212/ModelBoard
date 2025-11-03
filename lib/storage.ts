import { supabase } from './supabase';

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  bucket: 'model-previews' | 'model-files',
  userId: string
): Promise<UploadResult> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { url: '', path: '', error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path,
    };
  } catch (error: any) {
    console.error('Upload exception:', error);
    return { url: '', path: '', error: error.message };
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  bucket: 'model-previews' | 'model-files',
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Delete exception:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update file - deletes old and uploads new
 */
export async function updateFile(
  file: File,
  bucket: 'model-previews' | 'model-files',
  userId: string,
  oldPath?: string | null
): Promise<UploadResult> {
  // Delete old file if exists
  if (oldPath) {
    await deleteFile(bucket, oldPath);
  }

  // Upload new file
  return uploadFile(file, bucket, userId);
}

/**
 * Validate file type
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload JPG, PNG, GIF, or WebP.' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File too large. Maximum size is 5MB.' };
  }

  return { valid: true };
}

/**
 * Validate model file
 */
export function validateModelFile(file: File): { valid: boolean; error?: string } {
  const validTypes = [
    'application/octet-stream', // .pt, .pth, .bin
    'application/x-hdf', // .h5, .hdf5
    'application/zip', // .zip
    'application/x-tar', // .tar
    'application/gzip', // .gz
  ];
  const maxSize = 500 * 1024 * 1024; // 500MB

  if (file.size > maxSize) {
    return { valid: false, error: 'File too large. Maximum size is 500MB.' };
  }

  // Allow common model file extensions
  const fileName = file.name.toLowerCase();
  const validExtensions = ['.pt', '.pth', '.bin', '.h5', '.hdf5', '.onnx', '.pkl', '.safetensors', '.zip', '.tar', '.gz'];
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

  if (!hasValidExtension && !validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid model file type.' };
  }

  return { valid: true };
}
