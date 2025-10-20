## Why

Expose a simple public endpoint to retrieve demo account credentials for quick onboarding and demos.

## What Changes

- Add a public GET API at `/api/demo-accounts` returning `{ full_name, email, role }[]` from `public.users`.
- No authentication required.

## Impact

- Affected specs: `public-api` capability.
- Affected code: `src/app/api/demo-accounts/route.ts`, Supabase read access to `public.users`.
