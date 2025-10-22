## 1. Implementation

- [x] 1.1 Create API route at `src/app/api/demo-accounts/route.ts`
- [x] 1.2 Query Supabase `public.users` selecting `full_name, email, role`
- [x] 1.3 Return JSON array; handle errors with HTTP 500

## 2. Validation

- [x] 2.1 Build project to ensure type correctness
- [ ] 2.2 Hit `GET /api/demo-accounts` locally and verify response shape

## 3. Follow-ups

- [ ] 3.1 Ensure RLS/public policies allow read of `full_name,email,role` for unauthenticated requests (if using RLS)
