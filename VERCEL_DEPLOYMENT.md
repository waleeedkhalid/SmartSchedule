# Vercel Deployment Guide

This guide will help you deploy your Next.js 15 + Supabase application to Vercel.

## Prerequisites

1. ✅ GitHub repository (your code is on the `dev` branch)
2. ✅ Supabase project (for production database)
3. ✅ Vercel account (free tier works)

## Step 1: Prepare Your Supabase Project

### Option A: Use Existing Production Supabase Project
If you already have a production Supabase project:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your production project
3. Navigate to **Settings** → **API**
4. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key**

### Option B: Create New Production Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **New Project**
3. Fill in:
   - Project name
   - Database password (save this!)
   - Region (choose closest to your users)
4. Wait for project to initialize (~2 minutes)
5. Run migrations to set up your database:

```bash
# Link to your remote project
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push
```

6. Get your API keys from **Settings** → **API**

## Step 2: Deploy to Vercel

### Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. **Environment Variables** - Add these:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

6. Click **Deploy**

### Deploy via Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name? (accept default or customize)
# - Directory? ./
# - Want to override settings? N

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

## Step 3: Verify Deployment

After deployment completes:

1. **Check Build Logs**
   - Ensure all 72 pages built successfully
   - No errors in the build output

2. **Test Key Features**
   - Homepage loads
   - Registration works
   - Login works
   - Dashboard is accessible
   - Database queries work

3. **Check Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Verify both variables are set
   - Redeploy if you added variables after initial deployment

## Step 4: Configure Custom Domain (Optional)

1. Go to **Project Settings** → **Domains**
2. Add your custom domain
3. Configure DNS:
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or use Vercel nameservers

## Common Issues & Solutions

### Build Fails with Module Not Found

**Solution**: Already fixed! We migrated to npm and updated `next.config.ts`.

### Environment Variables Not Working

**Solution**:
1. Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access
2. Redeploy after adding environment variables
3. Check variable names match exactly (case-sensitive)

### Database Connection Issues

**Solution**:
1. Verify Supabase project is active
2. Check environment variables are correct
3. Ensure RLS policies are properly configured
4. Check Supabase project isn't paused (free tier pauses after inactivity)

### Pages Not Loading

**Solution**:
1. Check Vercel deployment logs
2. Verify all migrations ran successfully on production database
3. Check browser console for errors
4. Ensure Supabase API keys are for production project (not local)

## Environment Variables Reference

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key | Supabase Dashboard → Settings → API |

## Production Checklist

Before going live:

- [ ] All migrations applied to production database
- [ ] Environment variables configured in Vercel
- [ ] RLS policies enabled on all tables
- [ ] Test user registration and login
- [ ] Test each user role (scheduling, registrar, faculty, student)
- [ ] Verify email confirmation works
- [ ] Test core features in each dashboard
- [ ] Configure custom domain (if applicable)
- [ ] Set up error monitoring (optional: Sentry, LogRocket)
- [ ] Configure analytics (optional: Vercel Analytics)

## Automatic Deployments

Vercel automatically deploys when you push to your repository:

- **Push to `main`/`master`** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment with unique URL

### Configure Branch Deployments

1. Go to **Project Settings** → **Git**
2. Set **Production Branch** to your main branch (e.g., `main` or `dev`)
3. Enable/disable automatic deployments for branches

## Monitoring & Maintenance

### View Logs
```bash
# Install Vercel CLI
npm i -g vercel

# View production logs
vercel logs

# View specific deployment
vercel logs [deployment-url]
```

### Redeploy
```bash
# Redeploy latest commit
vercel --prod

# Or trigger from dashboard:
# Deployments → ⋯ → Redeploy
```

## Database Migrations in Production

When you need to update your database schema:

```bash
# 1. Create migration locally
supabase migration new feature_name

# 2. Write migration SQL
# Edit the created file in supabase/migrations/

# 3. Test locally
supabase db reset

# 4. Apply to production
supabase db push

# 5. Regenerate types and commit
npm run db:types
git add .
git commit -m "feat: add new database feature"
git push

# 6. Vercel will auto-deploy the update
```

## Cost Considerations

### Vercel Free Tier
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions

### Supabase Free Tier
- ✅ 500MB database
- ✅ 1GB file storage
- ✅ 50MB file uploads
- ⚠️  Pauses after 7 days inactivity
- ⚠️  2 active projects max

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js 15 Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Guide](https://supabase.com/docs/guides/platform/going-into-prod)
- [Your Project Documentation](./README.md)

## Quick Deploy Commands

```bash
# Deploy to production
vercel --prod

# View deployment status
vercel ls

# View environment variables
vercel env ls

# Pull environment variables to local
vercel env pull .env.local

# View project info
vercel inspect
```

---

**Ready to Deploy?** Push your code to GitHub and follow Step 2 above! 🚀

