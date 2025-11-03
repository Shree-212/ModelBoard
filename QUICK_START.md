# ModelBoard - Quick Reference

## 🚀 Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📋 Pre-Development Checklist

Before running the application, ensure you have:

- ✅ Node.js 18+ installed
- ✅ Supabase project created
- ✅ `.env.local` file configured
- ✅ Database schema created (see SUPABASE_SETUP.md)
- ✅ Google OAuth configured
- ✅ RLS policies enabled

## 🔧 Common Tasks

### Add a New Page

1. Create file in `app/` directory (e.g., `app/about/page.tsx`)
2. Add link in `components/Navbar.tsx`
3. Style with Tailwind CSS classes

### Modify Model Schema

1. Update SQL in Supabase dashboard
2. Update TypeScript types in `lib/supabase.ts`
3. Update form in `app/my-account/page.tsx`

### Change Styling

- Global styles: `app/globals.css`
- Tailwind config: `tailwind.config.ts`
- Component styles: Use Tailwind utility classes

## 🐛 Troubleshooting

### App won't start
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

### Authentication errors
- Verify Google OAuth credentials in Supabase
- Check redirect URIs match exactly
- Clear browser cache/cookies

### Database errors
- Verify RLS policies are enabled
- Check user permissions
- Review Supabase logs

## 📱 Testing Checklist

### Before Deployment

- [ ] Home page loads correctly
- [ ] Models page displays models
- [ ] Search and filter work
- [ ] Google sign-in functional
- [ ] Can create/edit/delete models
- [ ] Model detail page works
- [ ] Responsive on mobile
- [ ] Dark mode works

## 🌐 URLs

- Development: http://localhost:3000
- Supabase Dashboard: https://supabase.com/dashboard
- Google Cloud Console: https://console.cloud.google.com/

## 📚 Key Files

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout with AuthProvider |
| `contexts/AuthContext.tsx` | Authentication logic |
| `lib/supabase.ts` | Supabase client configuration |
| `components/Navbar.tsx` | Navigation with auth |
| `app/page.tsx` | Landing page |
| `app/models/page.tsx` | Models listing |
| `app/models/[id]/page.tsx` | Model details |
| `app/my-account/page.tsx` | User dashboard (CRUD) |

## 🎯 Next Steps

1. Complete Supabase setup (see SUPABASE_SETUP.md)
2. Test authentication flow
3. Create your first model
4. Customize branding and colors
5. Deploy to production

## 💡 Tips

- Use `npm run dev` for hot reload during development
- Check browser console for errors
- Review Supabase logs for backend issues
- Use React DevTools for debugging
- Test on multiple devices/browsers

---

Need help? Check SUPABASE_SETUP.md or open an issue!
