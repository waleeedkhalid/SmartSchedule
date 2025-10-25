# Performance & Scalability Implementation Guide
## Supabase + Next.js 15 + shadcn/ui

> **Last Updated:** 2025-10-24  
> **Status:** Implementation Guide  
> **Target Architecture:** Next.js 15 App Router + Supabase + PostgreSQL

---

## Table of Contents

1. [Overview](#overview)
2. [Redis Caching Strategy](#redis-caching-strategy)
3. [Memoization Patterns](#memoization-patterns)
4. [Materialized Views](#materialized-views)
5. [Progressive Computation & Streaming](#progressive-computation--streaming)
6. [Scalability Techniques](#scalability-techniques)
7. [Performance Monitoring](#performance-monitoring)
8. [Implementation Checklist](#implementation-checklist)

---

## Overview

This guide provides actionable strategies to optimize performance and scalability in our SmartSchedule application. Each section includes:

- **When to apply** the technique
- **Where in our codebase** to implement it
- **Example code** specific to our architecture
- **Trade-offs and pitfalls** to consider

### Performance Goals

| Metric | Current Target | Optimal Target |
|--------|---------------|----------------|
| Time to First Byte (TTFB) | < 200ms | < 100ms |
| Largest Contentful Paint (LCP) | < 2.5s | < 1.5s |
| Database Query Time | < 100ms | < 50ms |
| API Response Time (p95) | < 300ms | < 150ms |

---

## Redis Caching Strategy

### Overview

Redis provides fast, in-memory caching for frequently accessed data with expiration and invalidation capabilities.

### When to Use

✅ **Good candidates for caching:**
- User session data and authentication tokens
- Course catalog and room listings (rarely change)
- Schedule generation results (computationally expensive)
- Student elective preferences (read-heavy after submission period)
- Aggregated analytics data (committee dashboards)

❌ **Avoid caching:**
- Real-time notifications
- Data that changes frequently (< 1 minute TTL not worth complexity)
- Very large objects (> 1MB) unless using compression

### Setup

#### 1. Install Dependencies

```bash
npm install ioredis
npm install --save-dev @types/ioredis
```

#### 2. Create Redis Client

Create `/src/lib/cache/redis.ts`:

```typescript
import Redis from 'ioredis';

// Singleton pattern for Redis connection
let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      // Connection pooling
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      // Production settings
      lazyConnect: true,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });
  }

  return redisClient;
}

// Graceful shutdown
export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
```

#### 3. Create Cache Helper Utilities

Create `/src/lib/cache/helpers.ts`:

```typescript
import { getRedisClient } from './redis';

type CacheOptions = {
  ttl?: number; // seconds
  tags?: string[]; // for tag-based invalidation
};

/**
 * Get cached value with automatic JSON parsing
 */
export async function getCached<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  const cached = await redis.get(key);
  
  if (!cached) return null;
  
  try {
    return JSON.parse(cached) as T;
  } catch {
    return cached as T;
  }
}

/**
 * Set cache with TTL and tags
 */
export async function setCached<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  const redis = getRedisClient();
  const { ttl = 3600, tags = [] } = options; // Default 1 hour
  
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  
  // Set value with expiration
  await redis.setex(key, ttl, serialized);
  
  // Store tags for batch invalidation
  if (tags.length > 0) {
    const multi = redis.multi();
    tags.forEach(tag => {
      multi.sadd(`tag:${tag}`, key);
      multi.expire(`tag:${tag}`, ttl);
    });
    await multi.exec();
  }
}

/**
 * Delete cache by key
 */
export async function deleteCached(key: string): Promise<void> {
  const redis = getRedisClient();
  await redis.del(key);
}

/**
 * Invalidate all keys with a specific tag
 */
export async function invalidateByTag(tag: string): Promise<void> {
  const redis = getRedisClient();
  const keys = await redis.smembers(`tag:${tag}`);
  
  if (keys.length > 0) {
    const multi = redis.multi();
    keys.forEach(key => multi.del(key));
    multi.del(`tag:${tag}`);
    await multi.exec();
  }
}

/**
 * Cache-aside pattern with automatic fetch
 */
export async function getOrSet<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try to get from cache
  const cached = await getCached<T>(key);
  if (cached !== null) {
    return cached;
  }
  
  // Fetch fresh data
  const fresh = await fetchFn();
  
  // Store in cache
  await setCached(key, fresh, options);
  
  return fresh;
}
```

### Implementation Examples

#### Example 1: Caching Course Catalog

Modify `/src/app/api/courses/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { getOrSet, invalidateByTag } from '@/lib/cache/helpers';

export async function GET() {
  try {
    // Cache for 1 hour with tag for invalidation
    const courses = await getOrSet(
      'courses:all',
      async () => {
        const supabase = createServerClient(await cookies());
        const { data, error } = await supabase
          .from('course')
          .select('*')
          .order('code');
        
        if (error) throw error;
        return data;
      },
      { ttl: 3600, tags: ['courses'] }
    );

    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// When courses are updated, invalidate cache
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServerClient(await cookies());
    
    const { data, error } = await supabase
      .from('course')
      .insert(body)
      .select();
    
    if (error) throw error;
    
    // Invalidate all course-related caches
    await invalidateByTag('courses');
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
```

#### Example 2: Caching User Session Data

Create `/src/lib/cache/session.ts`:

```typescript
import { getOrSet, deleteCached } from './helpers';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

type SessionData = {
  userId: string;
  role: string;
  fullName: string;
  email: string;
};

/**
 * Get user session with caching (5 min TTL)
 */
export async function getCachedSession(): Promise<SessionData | null> {
  const supabase = createServerClient(await cookies());
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) return null;
  
  return getOrSet(
    `session:${session.user.id}`,
    async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, role, full_name, email')
        .eq('id', session.user.id)
        .single();
      
      if (error || !data) throw new Error('User not found');
      
      return {
        userId: data.id,
        role: data.role,
        fullName: data.full_name,
        email: data.email,
      };
    },
    { ttl: 300 } // 5 minutes
  );
}

/**
 * Invalidate session cache on logout
 */
export async function invalidateSession(userId: string): Promise<void> {
  await deleteCached(`session:${userId}`);
}
```

#### Example 3: Caching Schedule Generation Results

Create `/src/lib/cache/schedules.ts`:

```typescript
import { getOrSet, invalidateByTag } from './helpers';
import type { Schedule } from '@/types/schedule';

/**
 * Cache schedule generation (expensive computation)
 */
export async function getCachedSchedule(
  studentId: string,
  level: number
): Promise<Schedule | null> {
  return getOrSet(
    `schedule:${studentId}:${level}`,
    async () => {
      // Import your schedule generation logic
      const { generateSchedule } = await import('@/lib/schedule-generator');
      return generateSchedule(studentId, level);
    },
    { ttl: 86400, tags: ['schedules', `student:${studentId}`] } // 24 hours
  );
}

/**
 * Invalidate schedules when sections or courses change
 */
export async function invalidateSchedules(): Promise<void> {
  await invalidateByTag('schedules');
}
```

### Cache Invalidation Strategies

#### Strategy 1: Time-Based (TTL)

```typescript
// Good for: Relatively static data, analytics
await setCached('dashboard:stats', stats, { ttl: 1800 }); // 30 minutes
```

#### Strategy 2: Event-Based

```typescript
// In your mutation endpoints
await supabase.from('section').insert(newSection);
await invalidateByTag('schedules'); // Invalidate related caches
```

#### Strategy 3: Lazy Refresh (Stale-While-Revalidate)

```typescript
export async function getWithRefresh<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number
): Promise<T> {
  const redis = getRedisClient();
  
  // Get cached value
  const cached = await getCached<T>(key);
  
  // Check if stale (exists but near expiration)
  const remainingTTL = await redis.ttl(key);
  
  if (cached && remainingTTL > 60) {
    // Fresh cache, return immediately
    return cached;
  }
  
  if (cached && remainingTTL > 0) {
    // Stale cache, return but refresh in background
    fetchFn().then(fresh => setCached(key, fresh, { ttl }));
    return cached;
  }
  
  // No cache, fetch and wait
  const fresh = await fetchFn();
  await setCached(key, fresh, { ttl });
  return fresh;
}
```

### Environment Variables

Add to `.env.local`:

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password_here
```

For production (Vercel/Railway):

```bash
# Use Redis Cloud, Upstash, or Railway Redis
REDIS_HOST=redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=your_production_password
```

### Pitfalls and Trade-offs

#### ⚠️ Pitfalls

1. **Cache Stampede**: Multiple requests fetch the same data simultaneously
   - **Solution**: Use distributed locks or request coalescing
   
2. **Stale Data**: Cache not invalidated when data changes
   - **Solution**: Use event-based invalidation and short TTLs for critical data

3. **Memory Bloat**: Caching too much data
   - **Solution**: Monitor Redis memory usage, use maxmemory policies

4. **Cache Key Collisions**: Poor key naming causes overwrites
   - **Solution**: Use structured keys like `entity:id:attribute`

#### 📊 Trade-offs

| Benefit | Cost |
|---------|------|
| Reduced DB load | Additional infrastructure (Redis) |
| Faster response times | Complexity in invalidation logic |
| Lower Supabase costs | Risk of serving stale data |
| Better scalability | Debugging cache issues is harder |

---

## Memoization Patterns

### Overview

Memoization caches function results within a single runtime/request to avoid repeated computations.

### When to Use

✅ **Good candidates:**
- Pure functions with deterministic outputs
- Role/permission checks within a request
- Data transformations (e.g., formatting dates, computing aggregates)
- Validation logic that's called multiple times

❌ **Avoid memoizing:**
- Functions with side effects (API calls, DB writes)
- Functions that depend on time or random values
- Very cheap computations (< 1ms)

### Implementation Examples

#### Example 1: Memoize User Role Checks

Create `/src/lib/auth/permissions.ts`:

```typescript
import { cache } from 'react';
import { getCachedSession } from '@/lib/cache/session';

/**
 * Check if user has permission (memoized per request)
 * Uses React 18+ cache() for automatic deduplication
 */
export const hasPermission = cache(async (permission: string): Promise<boolean> => {
  const session = await getCachedSession();
  if (!session) return false;
  
  const rolePermissions: Record<string, string[]> = {
    student: ['view_own_schedule', 'submit_preferences', 'submit_feedback'],
    faculty: ['view_own_schedule', 'set_availability', 'view_teaching_load'],
    scheduling_committee: ['manage_schedules', 'view_all_data', 'generate_schedules'],
    teaching_load_committee: ['manage_sections', 'assign_instructors', 'view_all_data'],
    registrar: ['manage_exams', 'manage_courses', 'view_all_data'],
  };
  
  return rolePermissions[session.role]?.includes(permission) ?? false;
});

/**
 * Get user role (memoized per request)
 */
export const getUserRole = cache(async (): Promise<string | null> => {
  const session = await getCachedSession();
  return session?.role ?? null;
});

/**
 * Check if user is committee member (memoized)
 */
export const isCommitteeMember = cache(async (): Promise<boolean> => {
  const role = await getUserRole();
  return ['scheduling_committee', 'teaching_load_committee', 'registrar'].includes(role ?? '');
});
```

Usage in Server Components:

```typescript
import { hasPermission } from '@/lib/auth/permissions';

export default async function CommitteeDashboard() {
  // This check is memoized - calling it multiple times in the same request
  // returns the cached result without re-executing
  const canManageSchedules = await hasPermission('manage_schedules');
  
  if (!canManageSchedules) {
    return <div>Access Denied</div>;
  }
  
  // Calling again in the same request returns cached result
  const canViewData = await hasPermission('view_all_data');
  
  return <div>Dashboard content</div>;
}
```

#### Example 2: Memoize Data Transformations

Create `/src/lib/utils/memoize.ts`:

```typescript
/**
 * Simple memoization for synchronous functions
 */
export function memoize<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn
): (...args: TArgs) => TReturn {
  const cache = new Map<string, TReturn>();
  
  return (...args: TArgs): TReturn => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Memoization with TTL for async functions
 */
export function memoizeAsync<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  ttlMs: number = 60000 // 1 minute default
): (...args: TArgs) => Promise<TReturn> {
  const cache = new Map<string, { value: TReturn; expires: number }>();
  
  return async (...args: TArgs): Promise<TReturn> => {
    const key = JSON.stringify(args);
    const now = Date.now();
    
    const cached = cache.get(key);
    if (cached && cached.expires > now) {
      return cached.value;
    }
    
    const result = await fn(...args);
    cache.set(key, { value: result, expires: now + ttlMs });
    
    return result;
  };
}
```

Usage example:

```typescript
import { memoize } from '@/lib/utils/memoize';

// Expensive calculation that's called frequently
const calculateGPA = memoize((grades: number[]): number => {
  // Complex GPA calculation logic
  return grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
});

// Called many times in a component
const gpa1 = calculateGPA([90, 85, 95]); // Computes
const gpa2 = calculateGPA([90, 85, 95]); // Returns cached result
```

#### Example 3: Memoize Supabase Queries in Server Components

Using React `cache()` to deduplicate queries:

```typescript
import { cache } from 'react';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * Get all courses (automatically deduped by React in a single render)
 */
export const getCourses = cache(async () => {
  const supabase = createServerClient(await cookies());
  const { data, error } = await supabase
    .from('course')
    .select('*')
    .order('code');
  
  if (error) throw error;
  return data;
});

/**
 * Get user profile (deduped)
 */
export const getUserProfile = cache(async (userId: string) => {
  const supabase = createServerClient(await cookies());
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
});
```

Now use in multiple Server Components:

```typescript
// app/student/dashboard/page.tsx
export default async function StudentDashboard() {
  const courses = await getCourses(); // Fetches from DB
  // ... use courses
}

// app/student/schedule/page.tsx (rendered in same request)
export default async function StudentSchedule() {
  const courses = await getCourses(); // Returns cached result!
  // ... use courses
}
```

### Client-Side Memoization with React

#### Using `useMemo` Hook

```typescript
'use client';

import { useMemo } from 'react';
import type { Course } from '@/types';

export function CourseList({ courses }: { courses: Course[] }) {
  // Expensive filtering/sorting memoized
  const sortedCourses = useMemo(() => {
    return courses
      .filter(course => course.level >= 4)
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [courses]);
  
  return (
    <div>
      {sortedCourses.map(course => (
        <div key={course.code}>{course.name}</div>
      ))}
    </div>
  );
}
```

#### Using `useCallback` for Functions

```typescript
'use client';

import { useCallback, useState } from 'react';

export function ElectiveSelector() {
  const [preferences, setPreferences] = useState<string[]>([]);
  
  // Memoize callback to prevent re-renders in child components
  const handleAddPreference = useCallback((electiveId: string) => {
    setPreferences(prev => [...prev, electiveId]);
  }, []);
  
  return <ElectiveList onAdd={handleAddPreference} />;
}
```

### Pitfalls and Trade-offs

#### ⚠️ Pitfalls

1. **Over-memoization**: Memoizing cheap functions adds overhead
   - **Solution**: Profile first, memoize only slow operations

2. **Stale Closures**: Memoized functions capture old variable values
   - **Solution**: Include all dependencies in dependency array

3. **Memory Leaks**: Unbounded cache grows indefinitely
   - **Solution**: Use LRU cache or TTL-based expiration

4. **Reference Equality Issues**: Objects/arrays fail shallow comparison
   - **Solution**: Use deep equality or serialize to strings for cache keys

#### 📊 Trade-offs

| Benefit | Cost |
|---------|------|
| Eliminates redundant work | Adds complexity |
| Improves render performance | Memory overhead for cache |
| Reduces API calls | Can serve stale data |

---

## Materialized Views

### Overview

Materialized views are precomputed query results stored as physical tables in PostgreSQL, perfect for expensive aggregations and analytics.

### When to Use

✅ **Good candidates:**
- Dashboard statistics (course enrollment counts, schedule conflicts)
- Analytics reports (department workload, room utilization)
- Complex joins across multiple tables
- Queries with GROUP BY, COUNT, SUM operations

❌ **Avoid for:**
- Real-time data requirements
- Frequently updated source tables
- Simple queries (just use indexes)

### Implementation Examples

#### Example 1: Course Enrollment Statistics

Create a migration `/supabase/migrations/20250124_materialized_views.sql`:

```sql
-- ============================================================================
-- MATERIALIZED VIEW: Course enrollment statistics
-- Refresh: Nightly or after schedule generation
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_course_enrollment_stats AS
SELECT
  c.code,
  c.name,
  c.department,
  c.level,
  c.type,
  COUNT(DISTINCT s.id) as section_count,
  SUM(s.capacity) as total_capacity,
  COALESCE(COUNT(DISTINCT se.student_id), 0) as enrolled_students,
  ROUND(
    COALESCE(COUNT(DISTINCT se.student_id)::numeric / NULLIF(SUM(s.capacity), 0) * 100, 0),
    2
  ) as utilization_percentage
FROM course c
LEFT JOIN section s ON c.code = s.course_code
LEFT JOIN student_electives se ON s.course_code = se.elective_id::text
GROUP BY c.code, c.name, c.department, c.level, c.type;

-- Create indexes on materialized view for fast queries
CREATE UNIQUE INDEX idx_mv_course_enrollment_code ON mv_course_enrollment_stats(code);
CREATE INDEX idx_mv_course_enrollment_dept ON mv_course_enrollment_stats(department);
CREATE INDEX idx_mv_course_enrollment_level ON mv_course_enrollment_stats(level);
CREATE INDEX idx_mv_course_enrollment_util ON mv_course_enrollment_stats(utilization_percentage);

-- Grant access to authenticated users
GRANT SELECT ON mv_course_enrollment_stats TO authenticated;

-- ============================================================================
-- FUNCTION: Refresh enrollment stats
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_course_enrollment_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_course_enrollment_stats;
END;
$$;

-- ============================================================================
-- SCHEDULED REFRESH: Run nightly at 2 AM
-- Requires pg_cron extension (available on Supabase Pro)
-- ============================================================================

-- SELECT cron.schedule(
--   'refresh-enrollment-stats',
--   '0 2 * * *', -- Every day at 2 AM
--   'SELECT refresh_course_enrollment_stats();'
-- );
```

Query the materialized view:

```typescript
// app/api/analytics/enrollment/route.ts
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServerClient(await cookies());
  
  // Query materialized view instead of computing on-the-fly
  const { data, error } = await supabase
    .from('mv_course_enrollment_stats')
    .select('*')
    .order('utilization_percentage', { ascending: false });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}
```

#### Example 2: Faculty Teaching Load Summary

```sql
-- ============================================================================
-- MATERIALIZED VIEW: Faculty teaching load
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_faculty_teaching_load AS
SELECT
  u.id as faculty_id,
  u.full_name,
  u.email,
  COUNT(DISTINCT s.id) as section_count,
  SUM(c.credits) as total_credits,
  COUNT(DISTINCT s.course_code) as unique_courses,
  ARRAY_AGG(DISTINCT c.department) as departments,
  COUNT(DISTINCT st.day) as teaching_days_count
FROM users u
LEFT JOIN section s ON u.id = s.instructor_id
LEFT JOIN course c ON s.course_code = c.code
LEFT JOIN section_time st ON s.id = st.section_id
WHERE u.role = 'faculty'
GROUP BY u.id, u.full_name, u.email;

-- Indexes
CREATE UNIQUE INDEX idx_mv_faculty_load_id ON mv_faculty_teaching_load(faculty_id);
CREATE INDEX idx_mv_faculty_load_credits ON mv_faculty_teaching_load(total_credits);

GRANT SELECT ON mv_faculty_teaching_load TO authenticated;

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_faculty_teaching_load()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_faculty_teaching_load;
END;
$$;
```

#### Example 3: Room Utilization Report

```sql
-- ============================================================================
-- MATERIALIZED VIEW: Room utilization
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_room_utilization AS
SELECT
  r.id as room_id,
  r.number as room_number,
  COUNT(DISTINCT s.id) as section_count,
  COUNT(DISTINCT st.id) as time_slot_count,
  -- Calculate total weekly hours
  COALESCE(
    SUM(
      EXTRACT(EPOCH FROM (st.end_time - st.start_time)) / 3600
    ),
    0
  ) as weekly_hours,
  -- Max possible hours (50 hours/week: 10 hours/day * 5 days)
  ROUND(
    COALESCE(
      SUM(EXTRACT(EPOCH FROM (st.end_time - st.start_time)) / 3600) / 50 * 100,
      0
    ),
    2
  ) as utilization_percentage,
  ARRAY_AGG(DISTINCT c.department) FILTER (WHERE c.department IS NOT NULL) as departments_using
FROM room r
LEFT JOIN section s ON r.id = s.room_id
LEFT JOIN section_time st ON s.id = st.section_id
LEFT JOIN course c ON s.course_code = c.code
GROUP BY r.id, r.number;

CREATE UNIQUE INDEX idx_mv_room_util_id ON mv_room_utilization(room_id);
CREATE INDEX idx_mv_room_util_percentage ON mv_room_utilization(utilization_percentage);

GRANT SELECT ON mv_room_utilization TO authenticated;

CREATE OR REPLACE FUNCTION refresh_room_utilization()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_room_utilization;
END;
$$;
```

### Manual Refresh Triggers

Refresh materialized views when source data changes:

```typescript
// After schedule generation completes
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function refreshAnalytics() {
  const supabase = createServerClient(await cookies());
  
  // Refresh all materialized views
  await supabase.rpc('refresh_course_enrollment_stats');
  await supabase.rpc('refresh_faculty_teaching_load');
  await supabase.rpc('refresh_room_utilization');
}

// Call after schedule generation
await generateSchedules();
await refreshAnalytics();
```

### Automatic Refresh with Triggers

For more frequent updates, use triggers:

```sql
-- Refresh materialized view after section changes
CREATE OR REPLACE FUNCTION trigger_refresh_enrollment()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Refresh in background (non-blocking)
  PERFORM refresh_course_enrollment_stats();
  RETURN NEW;
END;
$$;

CREATE TRIGGER section_changes_refresh
AFTER INSERT OR UPDATE OR DELETE ON section
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_enrollment();
```

### Pitfalls and Trade-offs

#### ⚠️ Pitfalls

1. **Stale Data**: Materialized views aren't automatically updated
   - **Solution**: Schedule refreshes or use triggers

2. **Refresh Locks**: `REFRESH MATERIALIZED VIEW` locks the view
   - **Solution**: Use `REFRESH MATERIALIZED VIEW CONCURRENTLY` (requires UNIQUE index)

3. **Storage Overhead**: Views duplicate data
   - **Solution**: Monitor disk usage, drop unused views

4. **Slow Refreshes**: Large views take time to rebuild
   - **Solution**: Incremental refresh patterns or partitioning

#### 📊 Trade-offs

| Benefit | Cost |
|---------|------|
| Extremely fast queries | Stale data between refreshes |
| Reduced DB load | Additional storage space |
| Predictable performance | Refresh overhead |
| Simple to query | Complexity in keeping fresh |

---

## Progressive Computation & Streaming

### Overview

Progressive computation and streaming allow you to send partial results to the client while continuing to process, improving perceived performance.

### Next.js 15 App Router Streaming

#### Example 1: Streaming Server Component with Suspense

```typescript
// app/committee/dashboard/page.tsx
import { Suspense } from 'react';
import { ScheduleStats } from '@/components/committee/ScheduleStats';
import { ConflictsList } from '@/components/committee/ConflictsList';
import { EnrollmentChart } from '@/components/committee/EnrollmentChart';

export default function CommitteeDashboard() {
  return (
    <div className="space-y-6">
      <h1>Committee Dashboard</h1>
      
      {/* Fast component renders immediately */}
      <Suspense fallback={<StatsSkeleton />}>
        <ScheduleStats />
      </Suspense>
      
      {/* Slower components stream in as they complete */}
      <div className="grid grid-cols-2 gap-6">
        <Suspense fallback={<ChartSkeleton />}>
          <EnrollmentChart />
        </Suspense>
        
        <Suspense fallback={<ListSkeleton />}>
          <ConflictsList />
        </Suspense>
      </div>
    </div>
  );
}
```

Each component fetches its own data:

```typescript
// components/committee/ScheduleStats.tsx
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function ScheduleStats() {
  const supabase = createServerClient(await cookies());
  
  // This query executes independently
  const { data: stats } = await supabase
    .from('mv_course_enrollment_stats')
    .select('*');
  
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Render stats */}
    </div>
  );
}
```

#### Example 2: Streaming API Routes

```typescript
// app/api/schedules/generate/route.ts
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial status
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ status: 'started' })}\n\n`)
        );
        
        // Phase 1: Generate required courses
        const requiredSchedule = await generateRequiredCourses();
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            status: 'progress',
            phase: 'required_courses',
            progress: 33,
            data: requiredSchedule
          })}\n\n`)
        );
        
        // Phase 2: Assign electives
        const electivesSchedule = await assignElectives();
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            status: 'progress',
            phase: 'electives',
            progress: 66,
            data: electivesSchedule
          })}\n\n`)
        );
        
        // Phase 3: Optimize and resolve conflicts
        const finalSchedule = await optimizeSchedule();
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            status: 'completed',
            progress: 100,
            data: finalSchedule
          })}\n\n`)
        );
        
      } catch (error) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            status: 'error',
            error: error.message
          })}\n\n`)
        );
      } finally {
        controller.close();
      }
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

Client-side consumption:

```typescript
'use client';

import { useState } from 'react';

export function ScheduleGenerator() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [schedule, setSchedule] = useState(null);
  
  async function generateSchedule() {
    const response = await fetch('/api/schedules/generate', {
      method: 'POST',
    });
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          setStatus(data.status);
          setProgress(data.progress || 0);
          
          if (data.status === 'completed') {
            setSchedule(data.data);
          }
        }
      }
    }
  }
  
  return (
    <div>
      <button onClick={generateSchedule}>Generate Schedule</button>
      <ProgressBar value={progress} />
      {status === 'completed' && <ScheduleView schedule={schedule} />}
    </div>
  );
}
```

#### Example 3: Incremental Data Loading

```typescript
// components/student/ElectivesList.tsx
'use client';

import { useEffect, useState } from 'react';
import type { Elective } from '@/types';

export function ElectivesList() {
  const [electives, setElectives] = useState<Elective[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  
  useEffect(() => {
    async function loadElectives() {
      const response = await fetch(`/api/electives?page=${page}&limit=20`);
      const data = await response.json();
      
      setElectives(prev => [...prev, ...data]);
      setLoading(false);
    }
    
    loadElectives();
  }, [page]);
  
  return (
    <div>
      {electives.map(elective => (
        <ElectiveCard key={elective.id} elective={elective} />
      ))}
      
      {loading && <Spinner />}
      
      <button onClick={() => setPage(p => p + 1)}>
        Load More
      </button>
    </div>
  );
}
```

### Pitfalls and Trade-offs

#### ⚠️ Pitfalls

1. **Waterfall Loading**: Nested Suspense boundaries load sequentially
   - **Solution**: Move data fetching to parent or use parallel queries

2. **Layout Shift**: Content jumps as components load
   - **Solution**: Use skeleton screens with fixed dimensions

3. **Error Handling**: Errors in streaming can't use standard error boundaries
   - **Solution**: Include error status in stream messages

#### 📊 Trade-offs

| Benefit | Cost |
|---------|------|
| Better perceived performance | More complex error handling |
| Incremental content display | Potential layout shifts |
| Parallel data fetching | Requires streaming infrastructure |

---

## Scalability Techniques

### Overview

Strategies to handle increased load as your application grows from hundreds to thousands of users.

### Vertical Scaling (Scale Up)

Increase resources for a single instance.

#### Database Scaling (Supabase)

```sql
-- Optimize queries with proper indexes
CREATE INDEX CONCURRENTLY idx_section_course ON section(course_code);
CREATE INDEX CONCURRENTLY idx_section_time_day ON section_time(day, start_time);
CREATE INDEX CONCURRENTLY idx_student_electives_student ON student_electives(student_id);

-- Use connection pooling (configured in Supabase dashboard)
-- Set max connections based on instance size:
-- Free tier: 60 connections
-- Pro: 200 connections
-- Team/Enterprise: 400+ connections
```

#### Next.js Server Optimization

Update `next.config.ts`:

```typescript
const nextConfig = {
  // Enable React Compiler (Next.js 15)
  experimental: {
    reactCompiler: true,
  },
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    minimumCacheTTL: 60,
  },
  
  // Enable compression
  compress: true,
  
  // Production optimizations
  swcMinify: true,
  
  // Increase memory limit for builds
  env: {
    NODE_OPTIONS: '--max-old-space-size=4096',
  },
};

export default nextConfig;
```

### Horizontal Scaling (Scale Out)

Add more instances behind a load balancer.

#### Vercel Auto-Scaling

Vercel automatically scales Next.js deployments:

```json
// vercel.json
{
  "regions": ["iad1", "sfo1"], // Multi-region deployment
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30, // Max function duration
      "memory": 1024 // MB per function
    }
  },
  "crons": [
    {
      "path": "/api/cron/refresh-analytics",
      "schedule": "0 2 * * *" // Daily at 2 AM
    }
  ]
}
```

#### Load Balancing with Railway/Render

```yaml
# railway.toml (example for Railway deployment)
[build]
builder = "NIXPACKS"

[deploy]
numReplicas = 3 # Run 3 instances
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"

[healthcheck]
path = "/api/health"
intervalSeconds = 30
timeoutSeconds = 10
```

### Database Connection Pooling

Use Supabase connection pooling (PgBouncer):

```typescript
// .env
# Direct connection (for migrations, admin tasks)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# Pooled connection (for application queries)
DATABASE_POOLED_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true
```

Configure Drizzle ORM or Prisma to use pooled connection:

```typescript
// lib/db/pool.ts
import { createClient } from '@supabase/supabase-js';

export const supabasePooled = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: false, // Important for server-side pooling
    },
  }
);
```

### CDN and Edge Caching

#### Configure Caching Headers

```typescript
// app/api/courses/route.ts
export async function GET() {
  const courses = await fetchCourses();
  
  return new Response(JSON.stringify(courses), {
    headers: {
      'Content-Type': 'application/json',
      // Cache on CDN for 1 hour, stale-while-revalidate for 24 hours
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
```

#### Static Generation for Public Pages

```typescript
// app/about/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default function AboutPage() {
  return <div>About content</div>;
}
```

#### Edge Functions (Vercel Edge Runtime)

```typescript
// app/api/edge-example/route.ts
export const runtime = 'edge'; // Run on Vercel Edge Network

export async function GET(request: Request) {
  // Executes close to user's location
  return new Response('Hello from the edge!');
}
```

### Rate Limiting

Protect your APIs from abuse:

```typescript
// lib/rate-limit.ts
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const redis = Redis.fromEnv();

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
  analytics: true,
});

// Usage in API routes
import { rateLimiter } from '@/lib/rate-limit';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success, limit, remaining, reset } = await rateLimiter.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        }
      }
    );
  }
  
  // Process request
  return NextResponse.json({ success: true });
}
```

### Database Replication (Read Replicas)

For read-heavy workloads, use Supabase read replicas (Enterprise plan):

```typescript
// lib/supabase/replicas.ts
import { createClient } from '@supabase/supabase-js';

// Primary database (writes)
export const supabasePrimary = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Read replica (reads only)
export const supabaseReplica = createClient(
  process.env.SUPABASE_REPLICA_URL!,
  process.env.SUPABASE_KEY!
);

// Usage
export async function getUsers() {
  // Read from replica
  return supabaseReplica.from('users').select('*');
}

export async function createUser(data: any) {
  // Write to primary
  return supabasePrimary.from('users').insert(data);
}
```

### Monitoring and Auto-Scaling Rules

Set up alerts and auto-scaling:

```typescript
// lib/monitoring/metrics.ts
export function recordMetric(name: string, value: number) {
  // Send to monitoring service (Datadog, New Relic, etc.)
  console.log(`[METRIC] ${name}: ${value}`);
  
  // Or use Vercel Analytics
  if (process.env.VERCEL_ANALYTICS_ID) {
    // Track custom metrics
  }
}

// Usage in API routes
import { recordMetric } from '@/lib/monitoring/metrics';

const startTime = Date.now();
const result = await generateSchedule();
const duration = Date.now() - startTime;

recordMetric('schedule_generation_duration', duration);
```

### Pitfalls and Trade-offs

#### ⚠️ Pitfalls

1. **Database Connection Exhaustion**: Too many open connections
   - **Solution**: Use connection pooling, implement connection limits

2. **Session Affinity Issues**: Stateful sessions break with load balancing
   - **Solution**: Use stateless sessions (JWT) or sticky sessions

3. **Cache Invalidation Complexity**: Multiple instances need coordinated cache invalidation
   - **Solution**: Use Redis pub/sub for cache invalidation events

4. **Cost Explosion**: Auto-scaling without limits
   - **Solution**: Set maximum instance counts and budget alerts

#### 📊 Trade-offs

| Benefit | Cost |
|---------|------|
| Handle more users | Higher infrastructure costs |
| Better availability | Increased complexity |
| Geographic distribution | Data consistency challenges |
| Automatic recovery | Debugging distributed systems is hard |

---

## Performance Monitoring

### Overview

Measure performance to identify bottlenecks and validate optimizations.

### Tools and Setup

#### 1. Supabase Query Performance

Enable and monitor slow query logs:

```sql
-- Run in Supabase SQL Editor

-- Enable query logging (requires pgAudit extension)
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1 second
ALTER SYSTEM SET log_statement = 'all'; -- Log all statements
SELECT pg_reload_conf();

-- View slow queries
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100 -- Queries averaging > 100ms
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Find missing indexes
SELECT
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  seq_tup_read / seq_scan as avg_seq_tup_read
FROM pg_stat_user_tables
WHERE seq_scan > 0
  AND schemaname = 'public'
ORDER BY seq_tup_read DESC
LIMIT 10;
```

#### 2. Next.js Performance Monitoring

Add Vercel Speed Insights:

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
```

#### 3. Custom Performance Logging

```typescript
// lib/monitoring/performance.ts
type PerformanceLog = {
  operation: string;
  duration: number;
  timestamp: string;
  metadata?: Record<string, any>;
};

export class PerformanceMonitor {
  private logs: PerformanceLog[] = [];
  
  async measure<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      this.log({
        operation,
        duration,
        timestamp: new Date().toISOString(),
        metadata,
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      this.log({
        operation: `${operation} (ERROR)`,
        duration,
        timestamp: new Date().toISOString(),
        metadata: { ...metadata, error: error.message },
      });
      
      throw error;
    }
  }
  
  private log(entry: PerformanceLog) {
    this.logs.push(entry);
    
    // Warn on slow operations
    if (entry.duration > 1000) {
      console.warn(`[SLOW] ${entry.operation}: ${entry.duration.toFixed(2)}ms`);
    }
    
    // Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to Datadog, Sentry, etc.
    }
  }
  
  getStats() {
    return {
      totalOperations: this.logs.length,
      avgDuration: this.logs.reduce((sum, log) => sum + log.duration, 0) / this.logs.length,
      slowestOperations: this.logs
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10),
    };
  }
}

export const perfMonitor = new PerformanceMonitor();
```

Usage:

```typescript
import { perfMonitor } from '@/lib/monitoring/performance';

export async function generateSchedule(studentId: string) {
  return perfMonitor.measure(
    'schedule_generation',
    async () => {
      // Your schedule generation logic
      const schedule = await computeSchedule(studentId);
      return schedule;
    },
    { studentId }
  );
}
```

#### 4. Google Lighthouse (Manual Audits)

Run Lighthouse audits regularly:

```bash
# Install globally
npm install -g lighthouse

# Run audit
lighthouse https://your-app.vercel.app \
  --output html \
  --output-path ./reports/lighthouse-report.html \
  --view

# Or use Chrome DevTools > Lighthouse tab
```

#### 5. Apache JMeter (Load Testing)

Create a test plan:

```xml
<!-- jmeter-test-plan.jmx -->
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2">
  <hashTree>
    <TestPlan testname="SmartSchedule Load Test">
      <ThreadGroup testname="User Load">
        <stringProp name="ThreadGroup.num_threads">100</stringProp>
        <stringProp name="ThreadGroup.ramp_time">60</stringProp>
        <stringProp name="ThreadGroup.duration">300</stringProp>
      </ThreadGroup>
      
      <HTTPSamplerProxy testname="Login Request">
        <stringProp name="HTTPSampler.domain">your-app.vercel.app</stringProp>
        <stringProp name="HTTPSampler.path">/api/auth/login</stringProp>
        <stringProp name="HTTPSampler.method">POST</stringProp>
      </HTTPSamplerProxy>
      
      <HTTPSamplerProxy testname="Get Courses">
        <stringProp name="HTTPSampler.domain">your-app.vercel.app</stringProp>
        <stringProp name="HTTPSampler.path">/api/courses</stringProp>
        <stringProp name="HTTPSampler.method">GET</stringProp>
      </HTTPSamplerProxy>
    </TestPlan>
  </hashTree>
</jmeterTestPlan>
```

Run JMeter:

```bash
# CLI mode
jmeter -n -t jmeter-test-plan.jmx -l results.jtl -e -o ./reports

# Analyze results
# - Average response time
# - Throughput (requests/second)
# - Error rate
# - 95th percentile response time
```

#### 6. Real User Monitoring (RUM)

Track real user performance:

```typescript
// components/performance/RUMTracker.tsx
'use client';

import { useEffect } from 'react';

export function RUMTracker() {
  useEffect(() => {
    // Report Web Vitals
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      
      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      
      // Cumulative Layout Shift (CLS)
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        }
        console.log('CLS:', clsScore);
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    }
  }, []);
  
  return null;
}
```

### Performance Benchmarking Workflow

#### Before Optimization

1. Run Lighthouse audit: Record baseline scores
2. Run JMeter load test: Record response times and throughput
3. Query Supabase logs: Identify slow queries
4. Monitor production metrics: Collect 1 week of baseline data

#### After Optimization

1. Re-run Lighthouse: Compare scores
2. Re-run JMeter: Compare performance under load
3. Check query performance: Verify improvements
4. Monitor production: Validate real-world impact

#### Example Benchmark Report

```markdown
## Performance Benchmark Report

### Test Date: 2025-10-24
### Changes: Added Redis caching for course catalog

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Lighthouse Performance Score | 72 | 89 | +23.6% |
| LCP | 3.2s | 1.8s | -43.8% |
| API Response Time (p95) | 450ms | 120ms | -73.3% |
| JMeter Throughput | 45 req/s | 180 req/s | +300% |
| Database Query Time | 150ms | 45ms | -70% |
| Error Rate | 1.2% | 0.3% | -75% |

### Observations:
- Redis caching reduced database load by 85%
- Course catalog API now serves from cache with 3ms average response time
- No increase in error rates, indicating stable implementation
```

### Pitfalls and Trade-offs

#### ⚠️ Pitfalls

1. **Monitoring Overhead**: Excessive logging impacts performance
   - **Solution**: Sample logs in production, use async logging

2. **False Positives**: Synthetic tests don't match real usage patterns
   - **Solution**: Combine synthetic and real user monitoring

3. **Vanity Metrics**: Focusing on the wrong metrics
   - **Solution**: Track metrics that impact user experience (LCP, FID, CLS)

#### 📊 Trade-offs

| Benefit | Cost |
|---------|------|
| Data-driven decisions | Monitoring infrastructure costs |
| Early problem detection | Additional complexity |
| Validate optimizations | Time to set up and analyze |

---

## Implementation Checklist

Use this checklist to systematically apply performance optimizations:

### Phase 1: Foundation (Week 1)

- [ ] Set up Redis (local + production)
- [ ] Configure connection pooling in Supabase
- [ ] Add performance monitoring utilities
- [ ] Run baseline Lighthouse audit
- [ ] Run baseline JMeter load test
- [ ] Enable Supabase query logging

### Phase 2: Quick Wins (Week 2)

- [ ] Add Redis caching for course catalog
- [ ] Add Redis caching for room listings
- [ ] Implement React `cache()` for Server Components
- [ ] Add proper indexes to frequently queried columns
- [ ] Configure Next.js image optimization
- [ ] Add Cache-Control headers to API routes

### Phase 3: Advanced Caching (Week 3)

- [ ] Implement cache helpers with tag-based invalidation
- [ ] Cache user session data
- [ ] Cache schedule generation results
- [ ] Add stale-while-revalidate patterns
- [ ] Implement cache invalidation on data mutations

### Phase 4: Database Optimization (Week 4)

- [ ] Create materialized view for enrollment stats
- [ ] Create materialized view for faculty teaching load
- [ ] Create materialized view for room utilization
- [ ] Set up automatic refresh for materialized views
- [ ] Add triggers for cache invalidation on data changes

### Phase 5: Streaming & Progressive Loading (Week 5)

- [ ] Implement Suspense boundaries in dashboard
- [ ] Add skeleton screens for loading states
- [ ] Convert schedule generation to streaming API
- [ ] Implement incremental data loading for large lists
- [ ] Add progress indicators for long-running operations

### Phase 6: Scalability (Week 6)

- [ ] Configure Vercel auto-scaling settings
- [ ] Set up multi-region deployment
- [ ] Implement rate limiting on public APIs
- [ ] Add CDN caching for static assets
- [ ] Configure edge functions for latency-sensitive routes

### Phase 7: Monitoring & Validation (Week 7)

- [ ] Set up Vercel Speed Insights
- [ ] Implement custom performance logging
- [ ] Set up Real User Monitoring (RUM)
- [ ] Configure alerting for slow queries
- [ ] Run post-optimization benchmarks
- [ ] Document performance improvements

### Ongoing Maintenance

- [ ] Weekly: Review slow query logs
- [ ] Monthly: Run Lighthouse audits
- [ ] Quarterly: Load test with JMeter
- [ ] Continuous: Monitor cache hit rates
- [ ] Continuous: Track Web Vitals in production

---

## Recommended Libraries

### Caching & Storage

- **ioredis** - Redis client for Node.js
- **@upstash/redis** - Serverless Redis (edge-compatible)
- **@upstash/ratelimit** - Rate limiting with Redis

### Monitoring & Analytics

- **@vercel/speed-insights** - Real user monitoring
- **@vercel/analytics** - Usage analytics
- **@sentry/nextjs** - Error tracking and performance monitoring

### Performance Testing

- **Apache JMeter** - Load testing
- **Lighthouse CLI** - Automated audits
- **artillery** - Modern load testing alternative

### Database

- **pg-stat-statements** - PostgreSQL query statistics (built-in)
- **pgBouncer** - Connection pooling (included with Supabase)

---

## Additional Resources

### Official Documentation

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Supabase Performance](https://supabase.com/docs/guides/platform/performance)
- [Vercel Edge Network](https://vercel.com/docs/edge-network/overview)

### Learning Resources

- [Web.dev Performance](https://web.dev/performance/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Redis Best Practices](https://redis.io/docs/management/optimization/)

### Tools

- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Apache JMeter](https://jmeter.apache.org/)

---

## Conclusion

Performance and scalability are ongoing processes, not one-time tasks. Start with the quick wins (Redis caching, proper indexes), measure the impact, then progressively implement advanced techniques as your application grows.

**Key Takeaways:**

1. **Measure First**: Always benchmark before and after optimizations
2. **Start Simple**: Implement caching and indexing before complex solutions
3. **Cache Strategically**: Cache expensive operations with appropriate TTLs
4. **Stream When Possible**: Use progressive loading for better UX
5. **Monitor Continuously**: Track performance metrics in production
6. **Scale Proactively**: Plan for growth before hitting limits

Remember: **Premature optimization is the root of all evil, but late optimization is costly.** Find the right balance by measuring real performance impacts and optimizing bottlenecks that affect user experience.

---

*This document should be updated as new performance patterns emerge and as the application's requirements evolve.*

