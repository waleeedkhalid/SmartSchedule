# Cursor Rules for SmartSchedule

This directory contains Cursor AI rules that help with code generation, data fetching patterns, and maintaining best practices throughout the SmartSchedule codebase.

## Available Rules

### 1. `index.mdc` (Always Applied)
**Quick reference and project overview**
- Applied to: All files
- Contains: Project structure, critical performance rules, quick troubleshooting
- Purpose: Provides context for every AI interaction

### 2. `data-fetching.mdc`
**Data fetching patterns and best practices**
- Applied to: `*.ts`, `*.tsx`, `app/**/*`
- Contains: Server Components, Client Components, custom hooks, parallel fetching
- Key Topics:
  - React.cache() for Server Components
  - useMemo/useCallback for Client Components
  - Optimistic updates
  - Real-time subscriptions

### 3. `supabase-queries.mdc`
**Supabase query optimization**
- Applied to: `*.ts`, `*.tsx`, `lib/**/*`, `app/**/*`
- Contains: Query patterns, performance optimization, common pitfalls
- Key Topics:
  - RLS policy optimization (wrapping auth.uid())
  - Efficient joins and relations
  - Pagination and filtering
  - Avoiding N+1 queries
  - Batch operations

### 4. `authentication-security.mdc`
**Authentication patterns and security**
- Applied to: `*.ts`, `*.tsx`, `lib/auth/**/*`, `app/**/*`
- Contains: Auth setup, RLS patterns, role-based access
- Key Topics:
  - Cached authentication functions
  - Role-based access control (RBAC)
  - RLS policy patterns
  - Session management
  - Security best practices

### 5. `caching-performance.mdc`
**Caching strategies and performance**
- Applied to: `*.ts`, `*.tsx`, `lib/**/*`, `app/**/*`
- Contains: React.cache(), useMemo, Next.js caching, monitoring
- Key Topics:
  - Request-level memoization
  - Component memoization
  - Next.js Full Route Cache
  - Database query optimization
  - Performance monitoring

### 6. `api-error-handling.mdc`
**API routes and error handling**
- Applied to: `app/api/**/*`, `*.ts`, `*.tsx`
- Contains: API patterns, error handling, validation, Server Actions
- Key Topics:
  - Route handlers (GET, POST, etc.)
  - Input validation with Zod
  - Custom error classes
  - Error boundaries
  - HTTP status codes

## How to Use These Rules

### Automatic Application
Rules with `alwaysApply: true` (like `index.mdc`) are automatically included in every AI interaction.

### File-Specific Application
Rules with `globs` patterns are automatically applied when working on matching files:
- Working on `app/api/courses/route.ts` → `api-error-handling.mdc` applies
- Working on `lib/auth/cached-auth.ts` → `authentication-security.mdc` applies

### Manual Application
Reference rules explicitly in your prompts:
```
"Follow the patterns in data-fetching.mdc to create a new dashboard component"
```

## Rule File Format

All rules use `.mdc` (Markdown with Cursor extensions) format:

```markdown
---
description: Brief description for AI to understand when to fetch
globs: *.ts,*.tsx,app/**/*
---

# Rule Title

## Content organized with markdown
...
```

### Metadata Properties
- `alwaysApply: true/false` - Apply to every request
- `description: string` - Helps AI decide when to fetch the rule
- `globs: string` - Comma-separated patterns for file matching

## Quick Reference

### When writing new code:

**Data Fetching?** → Check `data-fetching.mdc`
- Server vs Client Components
- Parallel fetching patterns
- Custom hooks

**Querying Supabase?** → Check `supabase-queries.mdc`
- Query optimization
- RLS performance
- Efficient joins

**Authentication?** → Check `authentication-security.mdc`
- Cached auth functions
- Role checking
- RLS policies

**Need to cache?** → Check `caching-performance.mdc`
- React.cache()
- useMemo/useCallback
- Next.js caching strategies

**API routes?** → Check `api-error-handling.mdc`
- Route handlers
- Error handling
- Input validation

## Critical Patterns (Must Follow)

### 🚨 Performance Critical

1. **Always wrap auth.uid() in subquery**
   ```sql
   -- ✅ CORRECT
   USING (id = (select auth.uid()))
   
   -- ❌ WRONG (10-100x slower)
   USING (id = auth.uid())
   ```

2. **Always use cached auth functions**
   ```typescript
   // ✅ CORRECT
   import { getAuthenticatedUser } from "@/lib/auth/cached-auth";
   const user = await getAuthenticatedUser();
   
   // ❌ WRONG (not cached)
   const { data: { user } } = await supabase.auth.getUser();
   ```

3. **Always use React.cache() for Server Components**
   ```typescript
   // ✅ CORRECT
   import { cache } from "react";
   export const getData = cache(async () => { /* ... */ });
   
   // ❌ WRONG (called multiple times)
   export async function getData() { /* ... */ }
   ```

## Updating Rules

To add or modify rules:

1. Create/edit `.mdc` file in this directory
2. Add appropriate metadata (alwaysApply, description, or globs)
3. Use markdown format with clear examples
4. Reference other files with `[filename](mdc:path/to/file)`
5. Include both ✅ GOOD and ❌ BAD examples

## File References

Use this format to reference files from the codebase:
```markdown
See [lib/auth/cached-auth.ts](mdc:lib/auth/cached-auth.ts) for cached auth functions.
```

This creates a clickable link in Cursor AI responses.

## Testing Rules

After creating/modifying a rule:

1. Test with Cursor AI by asking questions related to the rule
2. Check if the AI applies the patterns correctly
3. Verify file references work
4. Ensure glob patterns match intended files

## Common Issues

### Rule not applying?
- Check `globs` pattern matches your file
- Verify metadata formatting (YAML frontmatter)
- Ensure `.mdc` extension

### File references broken?
- Use `mdc:` prefix: `[file.ts](mdc:path/to/file.ts)`
- Path should be relative to workspace root
- No spaces in paths

### Rule conflicts?
- More specific globs take precedence
- `alwaysApply` rules are always included
- Multiple matching rules are all applied

## Maintenance

Review and update rules when:
- Adding new patterns or best practices
- Discovering common mistakes
- Implementing new features
- Performance optimizations change

---

**Last Updated:** October 25, 2025  
**Total Rules:** 6  
**Coverage:** Data fetching, Supabase, Auth, Caching, APIs, Error handling

