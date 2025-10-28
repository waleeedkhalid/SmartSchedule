# Environment Configuration Guide

## Overview

This guide covers all environment variables needed for SmartSchedule V2 deployment.

## Environment Variables

### Required for All Environments

Create a `.env.local` file in the project root with the following variables:

```bash
# ============================================
# Node Environment
# ============================================
# Options: development, production
NODE_ENV=production

# ============================================
# Supabase Configuration
# ============================================
# Get these from: https://app.supabase.com/project/YOUR_PROJECT_ID/settings/api

# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Public anonymous key (safe to expose to clients)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service role key (KEEP SECRET - server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================
# Application Configuration
# ============================================
# The base URL of your application
NEXT_PUBLIC_APP_URL=https://your-domain.com

# ============================================
# Feature Flags
# ============================================
# MUST be false in production
ENABLE_DEMO_MODE=false
```

## Environment-Specific Configurations

### Development Environment

```bash
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENABLE_DEMO_MODE=false
```

### Staging Environment

```bash
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://staging-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging-anon-key
SUPABASE_SERVICE_ROLE_KEY=staging-service-role-key
NEXT_PUBLIC_APP_URL=https://staging.your-domain.com
ENABLE_DEMO_MODE=false
```

### Production Environment

```bash
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://prod-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=prod-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
ENABLE_DEMO_MODE=false
```

## Variable Descriptions

### NODE_ENV

- **Type**: `string`
- **Values**: `development`, `production`
- **Purpose**: Determines the runtime environment
- **Default**: `development`
- **Production Value**: `production`

### NEXT_PUBLIC_SUPABASE_URL

- **Type**: `string` (URL)
- **Purpose**: Supabase project API URL
- **Where to Find**: Supabase Dashboard → Project Settings → API
- **Format**: `https://[project-id].supabase.co`
- **Public**: Yes (safe to expose)

### NEXT_PUBLIC_SUPABASE_ANON_KEY

- **Type**: `string` (JWT)
- **Purpose**: Public API key for client-side requests
- **Where to Find**: Supabase Dashboard → Project Settings → API → anon public
- **Public**: Yes (safe to expose)
- **Usage**: Used in browser for authenticated requests via RLS

### SUPABASE_SERVICE_ROLE_KEY

- **Type**: `string` (JWT)
- **Purpose**: Full database access for server-side operations
- **Where to Find**: Supabase Dashboard → Project Settings → API → service_role secret
- **Public**: ⚠️ **NO - KEEP SECRET**
- **Usage**: Server-side only, bypasses RLS
- **Security**: Never expose in client code or commits

### NEXT_PUBLIC_APP_URL

- **Type**: `string` (URL)
- **Purpose**: Base URL for the application
- **Usage**: Used for redirects, callbacks, and API references
- **Development**: `http://localhost:3000`
- **Production**: Your actual domain

### ENABLE_DEMO_MODE

- **Type**: `string` (boolean)
- **Values**: `true`, `false`
- **Purpose**: Control demo/mock data features
- **Production Value**: `false`
- **Development Value**: `false` (mock data removed)
- **Note**: This flag is for future use; mock data has been removed

## Security Best Practices

### DO ✅

1. **Use `.env.local` for local development**
   - This file is gitignored by default
   - Never commit this file

2. **Store production secrets securely**
   - Use your hosting platform's environment variable management
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Build & Deploy → Environment

3. **Rotate keys regularly**
   - Change service role key periodically
   - Update all environments when rotating

4. **Use different Supabase projects for each environment**
   - Development: Local or development project
   - Staging: Separate staging project
   - Production: Production project only

5. **Verify RLS is enabled**
   - Row Level Security protects against unauthorized access
   - Test with anon key to verify policies work

### DON'T ❌

1. **Never commit `.env.local` or `.env.production`**
   - These contain sensitive keys
   - Always use `.gitignore`

2. **Never expose service role key to clients**
   - Only use in server-side code
   - Never include in client bundles

3. **Never hardcode environment variables**
   - Always use `process.env.VARIABLE_NAME`
   - Never paste keys directly in code

4. **Never share keys in public channels**
   - Use secure key sharing methods
   - Rotate keys if accidentally exposed

5. **Never use production keys in development**
   - Keep environments separate
   - Use local Supabase for development

## Verifying Configuration

### Check Environment Variables Are Set

```bash
# In your terminal
node -p "process.env.NODE_ENV"
node -p "process.env.NEXT_PUBLIC_SUPABASE_URL"
```

### Test Supabase Connection

Create a test API route or run:

```typescript
import { createClient } from '@/supabase/client'

async function testConnection() {
  const supabase = createClient()
  const { data, error } = await supabase.from('courses').select('count')
  
  if (error) {
    console.error('Connection failed:', error)
  } else {
    console.log('Connection successful!')
  }
}
```

### Verify Production Settings

Before deploying to production:

- [ ] `NODE_ENV=production`
- [ ] `ENABLE_DEMO_MODE=false`
- [ ] Service role key is from production Supabase project
- [ ] App URL matches actual domain
- [ ] All required variables are set
- [ ] No development keys in production

## Platform-Specific Setup

### Vercel

1. Go to Project Settings → Environment Variables
2. Add each variable
3. Select environment (Production, Preview, Development)
4. Deploy

### Netlify

1. Go to Site Settings → Build & Deploy → Environment
2. Click "Add variable"
3. Add each variable
4. Deploy

### Railway

1. Go to Project → Variables
2. Add each variable
3. Deploy

### Docker

Create `.env` file for Docker:

```bash
# In your Dockerfile or docker-compose.yml
ENV NODE_ENV=production
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
# etc...
```

## Troubleshooting

### Issue: "Supabase URL not found"

**Cause**: Environment variables not loaded

**Solution**:
- Verify `.env.local` exists in project root
- Restart development server
- Check variable names match exactly

### Issue: "Unauthorized" errors

**Cause**: Using wrong key or RLS blocking access

**Solution**:
- Verify anon key is correct
- Check RLS policies are configured
- Test with service role key (server-side only)

### Issue: Environment variables undefined in production

**Cause**: Not set in hosting platform

**Solution**:
- Add all variables in hosting platform settings
- Redeploy after adding variables
- Verify variables are present in build logs

## Related Documentation

- [PRODUCTION_DEPLOYMENT.md](mdc:src/docs/PRODUCTION_DEPLOYMENT.md) - Deployment guide
- [LOCAL_DEVELOPMENT.md](mdc:src/docs/LOCAL_DEVELOPMENT.md) - Local setup
- [SUPABASE_CLI_GUIDE.md](mdc:SUPABASE_CLI_GUIDE.md) - Supabase CLI usage

---

**Last Updated**: October 28, 2025
**Version**: 1.0

