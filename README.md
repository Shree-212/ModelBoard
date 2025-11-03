# ModelBoard - AI Portfolio as a Service

![ModelBoard](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-2-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-cyan)
![HuggingFace](https://img.shields.io/badge/HuggingFace-API-yellow)

**ModelBoard** is a modern, full-featured platform for hosting, showcasing, and testing AI models — similar to Hugging Face. Built with Next.js 15, TypeScript, Supabase, and real ML inference via HuggingFace API.

## ✨ Features

### Core Features
- 🏠 **Landing Page**: Beautiful, responsive home page with feature highlights and call-to-action
- 🔍 **Model Discovery**: Browse and search AI models with advanced tag filtering
- 📝 **Model Details**: Comprehensive model pages with metadata, tags, and statistics
- 🔐 **Google SSO**: Secure authentication via Google OAuth with session persistence
- 👤 **User Dashboard**: Full CRUD functionality for managing your AI models
- 📱 **Fully Responsive**: Optimized experience across desktop, tablet, and mobile
- 🌙 **Dark Mode**: Built-in dark mode support throughout the app

### Advanced Features 🚀
- 🎯 **Interactive Model Demos**: Test models directly in the browser with real-time inference
- 🤖 **HuggingFace Integration**: Real ML model inference (not mocked!)
  - Text-to-Text (Summarization)
  - Image-to-Text (Image Captioning)
  - Text-to-Image (Stable Diffusion)
  - Sentiment Analysis
  - Question Answering
- � **Public Portfolio Pages**: Share your work at `modelboard.app/username`
- 🔒 **Public/Private Models**: Control visibility of your models
- 📤 **File Upload Support**: Upload preview images and model files directly to Supabase Storage
- 🔗 **External URLs**: Alternative option to use external image/file URLs
- 📓 **Notebook Integration**: Link to Google Colab or Jupyter notebooks
- 🎨 **Custom API Endpoints**: Override default models with your own

## 🚢 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `HUGGINGFACE_API_TOKEN`

4. Deploy!

### Important Configuration

Ensure your `next.config.ts` includes image domains:

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'huggingface.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};
```

### Post-Deployment

After deploying to Vercel:

1. Update Google OAuth redirect URI with your Vercel domain
2. Verify Supabase storage buckets are created
3. Test file upload functionality
4. Confirm RLS policies are active

## 🎯 Usage Examples

### Creating a Model with File Upload

1. Sign in with Google
2. Navigate to "My Account"
3. Fill in model details:
   - Title, description, tags
   - Upload preview image (max 5MB) OR paste external URL
   - Upload model file (max 500MB) OR paste external URL
   - Add notebook URL (Google Colab/Jupyter)
   - Select demo type (text-to-text, image-to-text, etc.)
   - Optionally add custom API endpoint
   - Toggle public/private visibility
4. Click "Add Model"

### Testing a Model Demo

1. Navigate to any model detail page
2. Scroll to the "Demo" section
3. Interact based on demo type:
   - **Text-to-Text**: Enter text to summarize
   - **Image-to-Text**: Upload an image for captioning
   - **Text-to-Image**: Enter a prompt to generate an image
   - **Sentiment Analysis**: Enter text to analyze sentiment
   - **Question Answering**: Provide context and ask a question
4. View real-time results

### Sharing Your Portfolio

Your public models are automatically available at:

```text
https://modelboard.app/your-username
```

Share this link to showcase your AI work!

## 📊 Database Schema Reference

The `models` table includes the following fields:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to auth.users |
| `title` | TEXT | Model name |
| `description` | TEXT | Model description |
| `tags` | TEXT[] | Array of tags |
| `preview_image` | TEXT | External image URL |
| `preview_image_path` | TEXT | Supabase Storage path |
| `model_file_path` | TEXT | Supabase Storage path for model files |
| `notebook_url` | TEXT | Link to Google Colab/Jupyter |
| `demo_type` | TEXT | One of: text-to-text, image-to-text, text-to-image, sentiment-analysis, question-answering |
| `api_endpoint` | TEXT | Custom HuggingFace model endpoint |
| `is_public` | BOOLEAN | Public/private visibility |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

## 🗄️ Supabase Storage Buckets

Two storage buckets are required:

1. **model-previews**: For preview images (max 5MB, public access)
2. **model-files**: For model files (max 500MB, authenticated access)

Files are organized in user-specific folders: `{userId}/{filename}`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A Supabase account ([sign up here](https://supabase.com))
- Google OAuth credentials (from Google Cloud Console)
- HuggingFace API token (free at [huggingface.co](https://huggingface.co))

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Shree-212/ModelBoard.git
   cd ModelBoard
   ```

2. **Install dependencies**:

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**:
   
   Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   HUGGINGFACE_API_TOKEN=your-hf-token
   ```

4. **Run database migrations**:

   In your Supabase SQL Editor, run these migrations in order:

   a. Create profiles table:

   ```sql
   -- From migrations/create_profiles_table.sql (if not exists)
   CREATE TABLE IF NOT EXISTS public.profiles (
     id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
     username TEXT UNIQUE,
     full_name TEXT,
     avatar_url TEXT,
     bio TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
   );

   -- Auto-create profile on user signup
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.profiles (id, username, full_name, avatar_url)
     VALUES (
       NEW.id,
       COALESCE(NEW.raw_user_meta_data->>'preferred_username', NEW.email),
       COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
       NEW.raw_user_meta_data->>'avatar_url'
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

   b. Add storage path columns:

   ```sql
   -- From migrations/add_storage_paths.sql
   ALTER TABLE public.models
   ADD COLUMN IF NOT EXISTS preview_image_path TEXT,
   ADD COLUMN IF NOT EXISTS model_file_path TEXT,
   ADD COLUMN IF NOT EXISTS notebook_url TEXT,
   ADD COLUMN IF NOT EXISTS demo_type TEXT,
   ADD COLUMN IF NOT EXISTS api_endpoint TEXT,
   ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
   ```

   c. Create storage buckets:

   ```sql
   -- From migrations/create_storage_buckets.sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES 
     ('model-previews', 'model-previews', true),
     ('model-files', 'model-files', false)
   ON CONFLICT (id) DO NOTHING;

   -- RLS policies for model-previews
   DROP POLICY IF EXISTS "Users can upload preview images" ON storage.objects;
   CREATE POLICY "Users can upload preview images"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'model-previews' AND auth.uid()::text = (storage.foldername(name))[1]);

   DROP POLICY IF EXISTS "Users can update their preview images" ON storage.objects;
   CREATE POLICY "Users can update their preview images"
   ON storage.objects FOR UPDATE
   USING (bucket_id = 'model-previews' AND auth.uid()::text = (storage.foldername(name))[1]);

   DROP POLICY IF EXISTS "Users can delete their preview images" ON storage.objects;
   CREATE POLICY "Users can delete their preview images"
   ON storage.objects FOR DELETE
   USING (bucket_id = 'model-previews' AND auth.uid()::text = (storage.foldername(name))[1]);

   DROP POLICY IF EXISTS "Public preview images are publicly accessible" ON storage.objects;
   CREATE POLICY "Public preview images are publicly accessible"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'model-previews');

   -- RLS policies for model-files
   DROP POLICY IF EXISTS "Users can upload model files" ON storage.objects;
   CREATE POLICY "Users can upload model files"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'model-files' AND auth.uid()::text = (storage.foldername(name))[1]);

   DROP POLICY IF EXISTS "Users can update their model files" ON storage.objects;
   CREATE POLICY "Users can update their model files"
   ON storage.objects FOR UPDATE
   USING (bucket_id = 'model-files' AND auth.uid()::text = (storage.foldername(name))[1]);

   DROP POLICY IF EXISTS "Users can delete their model files" ON storage.objects;
   CREATE POLICY "Users can delete their model files"
   ON storage.objects FOR DELETE
   USING (bucket_id = 'model-files' AND auth.uid()::text = (storage.foldername(name))[1]);

   DROP POLICY IF EXISTS "Authenticated users can download model files" ON storage.objects;
   CREATE POLICY "Authenticated users can download model files"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'model-files' AND auth.role() = 'authenticated');
   ```

5. **Configure Google OAuth**:

   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   - Add credentials to Supabase Dashboard → Authentication → Providers → Google

6. **Start the development server**:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```text
ModelBoard/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout with AuthProvider
│   ├── globals.css               # Global styles
│   ├── models/                   # Model routes
│   │   ├── page.tsx              # Model discovery page
│   │   └── [id]/                 # Dynamic model detail pages
│   │       └── page.tsx
│   ├── my-account/               # User dashboard
│   │   └── page.tsx              # CRUD interface with file uploads
│   ├── [username]/               # Dynamic portfolio pages
│   │   └── page.tsx              # Public user profiles
│   ├── auth/
│   │   └── callback/             # OAuth callback handler
│   │       └── route.ts
│   └── api/
│       └── inference/            # HuggingFace API proxy
│           └── route.ts
├── components/                   # Reusable components
│   ├── Navbar.tsx                # Navigation with auth state
│   └── ModelDemo.tsx             # Interactive demo widget
├── contexts/
│   └── AuthContext.tsx           # Global auth state
├── lib/
│   ├── supabase.ts               # Supabase client setup
│   ├── storage.ts                # File upload utilities
│   └── utils.ts                  # Helper functions
├── migrations/                   # SQL migration scripts
│   ├── add_storage_paths.sql    # Add new columns
│   └── create_storage_buckets.sql # Setup storage
└── next.config.ts                # Next.js config with image domains
```

## 🎨 Key Components

### ModelDemo Component (`/components/ModelDemo.tsx`)

Interactive demo widget that dynamically renders UI based on `demo_type`:

- **text-to-text**: Text input → Summarization output
- **image-to-text**: Image upload → Caption output
- **text-to-image**: Text prompt → Generated image
- **sentiment-analysis**: Text input → Sentiment score/label
- **question-answering**: Context + Question → Answer

Features:
- Real-time inference via HuggingFace API
- Loading states and error handling
- Visual output rendering (images, formatted text)
- Responsive design

### Storage Utilities (`/lib/storage.ts`)

File upload helper functions:

- `uploadFile()`: Upload files to Supabase Storage
- `deleteFile()`: Remove files from storage
- `updateFile()`: Replace existing files
- `validateImageFile()`: Check image type/size (max 5MB)
- `validateModelFile()`: Check model file size (max 500MB)

### Portfolio Pages (`/app/[username]/page.tsx`)

Dynamic routes for public user profiles:

- Display user info (avatar, bio, username)
- Grid of public models only (`is_public = true`)
- Shareable URLs: `modelboard.app/username`
- SEO-friendly with metadata

## � Database Schema Reference

### Models Table

```sql
CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  preview_image TEXT,                  -- External URL
  preview_image_path TEXT,             -- Storage path
  model_file_path TEXT,                -- Storage path for model files
  notebook_url TEXT,                   -- Colab/Jupyter link
  demo_type TEXT,                      -- Demo type identifier
  api_endpoint TEXT,                   -- Custom HuggingFace endpoint
  is_public BOOLEAN DEFAULT true,      -- Visibility control
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0
);
```

For complete database setup, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

## 🔐 Authentication

ModelBoard uses **Supabase Authentication** with **Google OAuth** via `@supabase/ssr`:

1. Users click "Sign In with Google"
2. Google OAuth flow redirects to `/auth/callback`
3. Session is established and persisted using cookies
4. Authenticated users gain access to "My Account" and private features

### Key Authentication Features

- Session persistence across page refreshes
- Server-side and client-side auth utilities
- Automatic profile creation on user signup
- Global scope logout (signs out from all devices)

### Setting Up Google OAuth

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
2. Configure Supabase with your Client ID and Secret
3. Add authorized redirect URIs
4. Add `prompt: 'consent'` in OAuth options for proper logout

Detailed instructions: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md#google-oauth-setup)

## 🎨 Customization

### Styling

ModelBoard uses **Tailwind CSS** for styling. Customize the theme in `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      // Add your custom colors
    },
  },
}
```

### Adding New Features

To add new features:

1. Create new pages in the `app/` directory
2. Add components in `components/`
3. Update Supabase schema if needed
4. Update RLS policies for security
5. Add new demo types in `ModelDemo.tsx` if needed

## 🚢 Deployment (Legacy - See Above for Full Instructions)

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Import the project to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Update Google OAuth redirect URIs with your production URL
5. Update Supabase Site URL and Redirect URLs

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
HUGGINGFACE_API_TOKEN=your_hf_token_here
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Inspired by [Hugging Face](https://huggingface.co/)
- Built with [Supabase](https://supabase.com/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- ML inference powered by [HuggingFace Inference API](https://huggingface.co/inference-api)

## 📧 Support

For issues and questions:

- Open an issue on [GitHub](https://github.com/Shree-212/ModelBoard/issues)
- Review the [Supabase Setup Guide](./SUPABASE_SETUP.md)
- Check the [Quick Start Guide](./QUICK_START.md)

---

Built with ❤️ by Shree


