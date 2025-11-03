# ModelBoard - AI Portfolio as a Service

![ModelBoard](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-2-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-cyan)

**ModelBoard** is a modern, responsive platform for hosting, showcasing, and sharing AI models — similar to Hugging Face. Built with Next.js 15, TypeScript, Supabase, and Tailwind CSS.

## ✨ Features

- 🏠 **Landing Page**: Beautiful, responsive home page with feature highlights
- 🔍 **Model Discovery**: Browse and search AI models with tag filtering
- 📝 **Model Details**: View comprehensive model information with preview images
- 🧪 **Test Models**: Interactive model testing directly in the browser
- 🔐 **Google SSO**: Secure authentication via Google OAuth
- 👤 **User Dashboard**: Manage your models with full CRUD functionality
- 📱 **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- 🌙 **Dark Mode**: Built-in dark mode support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project
- Google OAuth credentials (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shree-212/ModelBoard.git
   cd ModelBoard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   The `.env.local` file is already configured with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://jjktseggwrqkpegjhpbk.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Set up Supabase**
   
   Follow the comprehensive guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
   - Create the database schema
   - Configure Google OAuth
   - Set up Row Level Security (RLS)
   - Configure storage buckets

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📂 Project Structure

```
ModelBoard/
├── app/                      # Next.js App Router
│   ├── auth/                 # Authentication routes
│   │   └── callback/         # OAuth callback handler
│   ├── models/               # Models listing and detail pages
│   │   ├── [id]/             # Dynamic model detail page
│   │   └── page.tsx          # Models listing page
│   ├── my-account/           # User dashboard with CRUD
│   │   └── page.tsx
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout with AuthProvider
│   └── page.tsx              # Home/landing page
├── components/               # React components
│   └── Navbar.tsx            # Navigation with auth controls
├── contexts/                 # React contexts
│   └── AuthContext.tsx       # Authentication context
├── lib/                      # Utilities and configurations
│   ├── supabase.ts           # Supabase client and types
│   └── utils.ts              # Helper functions
├── public/                   # Static assets
├── .env.local                # Environment variables
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── SUPABASE_SETUP.md         # Supabase configuration guide
└── README.md                 # This file
```

## 🗄️ Database Schema

### Models Table

```sql
CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  preview_image_url TEXT,
  model_file_url TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0
);
```

For complete database setup, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

## 🔐 Authentication

ModelBoard uses **Supabase Authentication** with **Google OAuth**:

1. Users click "Sign In with Google"
2. Google OAuth flow redirects to `/auth/callback`
3. Session is established and persisted
4. Authenticated users gain access to "My Account"

### Setting Up Google OAuth

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
2. Configure Supabase with your Client ID and Secret
3. Add authorized redirect URIs

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

### Features

To add new features:
1. Create new pages in the `app/` directory
2. Add components in `components/`
3. Update Supabase schema if needed
4. Update RLS policies for security

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Update Google OAuth redirect URIs with your production URL
5. Update Supabase Site URL and Redirect URLs

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://jjktseggwrqkpegjhpbk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 📚 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Icons**: [Lucide React](https://lucide.dev/)
- **Authentication**: Google OAuth via Supabase

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

## 📧 Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/Shree-212/ModelBoard/issues)
- Review the [Supabase Setup Guide](./SUPABASE_SETUP.md)

---

**Built with ❤️ by Shree**


