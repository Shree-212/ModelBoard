import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export type DemoType = 
  | 'text-to-text' 
  | 'image-to-text' 
  | 'text-to-image' 
  | 'sentiment-analysis' 
  | 'question-answering';

export type Model = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  preview_image_url: string | null;
  preview_image_path: string | null; // Storage path for deletion
  model_file_url: string | null;
  model_file_path: string | null; // Storage path for deletion
  notebook_url: string | null;
  is_public: boolean;
  demo_type: DemoType;
  api_endpoint: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  downloads_count: number;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};
