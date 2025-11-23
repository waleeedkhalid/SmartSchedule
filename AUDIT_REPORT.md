# Supabase Auth + Prisma Integration Audit Report

**Date:** 2025-01-30  
**Architecture:** Next.js 15 App Router | Supabase Auth | Prisma ORM  
**Status:** ⚠️ **CRITICAL VIOLATIONS FOUND**

---

## 1. Audit Report

### 🔴 Legacy DB Calls (Supabase Database Access)

**VIOLATION COUNT: 50+ files**

#### Critical Files Using `supabase.from()`:
- `lib/db/notifications.ts` - **ALL 12 functions** use Supabase DB
- `lib/db/sections.ts` - **ALL functions** use Supabase DB
- `lib/db/exams.ts` - **ALL functions** use Supabase DB
- `lib/db/timeline.ts` - Uses `supabase.from()` + `supabase.rpc()` (15+ calls)
- `lib/db/semesters.ts` - Uses `supabase.from()` (9+ calls)
- `lib/db/survey-periods.ts` - Uses `supabase.from()` (7+ calls)
- `lib/db/student-schedule.ts` - Uses `supabase.from()` (4+ calls)
- `lib/db/scheduling-stats.ts` - Uses `supabase.from()` (6+ calls)
- `lib/db/level-stats.ts` - Uses `supabase.from()` + `supabase.rpc()`
- `lib/db/irregular-students.ts` - Uses `supabase.from()` (10+ calls)
- `lib/db/course-stats.ts` - Uses `supabase.from()` (4+ calls)
- `lib/db/course-offerings.ts` - Uses `supabase.from()` (8+ calls)
- `lib/db/prerequisites.ts` - Uses `supabase.from()` (6+ calls)
- `lib/db/elective-groups.ts` - Uses `supabase.from()` (6+ calls)
- `lib/db/exams-advanced.ts` - Uses `supabase.from()` (4+ calls)

#### API Routes Using `supabase.from('user_roles')` for Role Checks:
- `app/api/notifications/route.ts` (lines 44, 106)
- `app/api/notifications/[id]/route.ts` (lines 28, 84)
- `app/api/student/enrollments/route.ts` (lines 57, 141)
- `app/api/student/enrollments/[id]/route.ts` (line 61)
- `app/api/registrar/student-enrollments/route.ts` (lines 35, 46, 133, 157, 320)
- `app/api/registrar/irregular-students/route.ts` (lines 26, 74)
- `app/api/registrar/irregular-students/[id]/route.ts` (lines 29, 87, 166)
- `app/api/scheduling/generate/route.ts` (line 21)
- `app/api/scheduling/dashboard-stats/route.ts` (line 35)
- `app/api/schedule-comments/route.ts` (line 62)
- `app/api/timeline/route.ts` (line 130)
- `app/api/timeline/check-deadlines/route.ts` (lines 39, 78, 158, 177)
- `app/api/timeline/[id]/route.ts` (lines 70, 116)
- `app/api/student/exams/route.ts` (line 46)
- `app/api/student/comments/route.ts` (lines 55, 139, 226, 303)
- `app/api/student/available-sections/route.ts` (line 55)
- `app/api/student/schedule/route.ts` (line 51)
- `app/api/faculty/availability/route.ts` (lines 26, 86)
- `app/api/elective-preferences/route.ts` (line 25)
- `app/api/elective-preferences/comments/route.ts` (lines 25, 73)
- `app/api/elective-preferences/comments/[id]/route.ts` (lines 27, 66)
- `app/api/profile/route.ts` (lines 28, 59)
- `app/api/data/import/route.ts` (lines 46, 66, 90, 112, 150, 175)

#### Server Components Using `supabase.from('user_roles')`:
- `app/(dashboard)/dashboard/student/page.tsx` (line 45)
- `app/(dashboard)/dashboard/faculty/page.tsx` (line 21)
- `app/(dashboard)/dashboard/faculty/feedback/page.tsx` (line 27)
- `app/(dashboard)/dashboard/exams/page.tsx` (line 21)
- `app/(auth)/onboarding/page.tsx` (line 50)
- `app/(dashboard)/dashboard/timeline/page.tsx` (line 24)
- `app/(dashboard)/dashboard/teaching-load/page.tsx` (lines 39-40)
- `app/(dashboard)/dashboard/scheduling/page.tsx` (lines 41-51)
- `app/(dashboard)/dashboard/setup-check/page.tsx` (lines 17, 35)

#### Using `supabase.rpc()` (Database Functions):
- `app/api/semesters/[id]/generate-sections/route.ts` (lines 27, 41)
- `app/api/semesters/[id]/conflicts/route.ts` (line 21)
- `app/api/sections/check-conflicts/route.ts` (lines 43, 61, 74)
- `lib/db/timeline.ts` (lines 153, 168, 180, 192, 204, 250)
- `lib/db/level-stats.ts` (line 64)
- `lib/db/irregular-students.ts` (lines 288, 304)

#### Client-Side Hooks (Acceptable but should migrate):
- `hooks/use-client-fetch.ts` - Uses `supabase.from()` (line 17)
- `hooks/use-client-mutation.ts` - Uses `supabase.from()` (lines 19, 22, 28)

#### Scripts (Acceptable for seeding):
- `scripts/seed-external-data.ts` - Uses Supabase for seeding
- `scripts/seed-database.ts` - Uses Supabase for seeding

---

### 🟡 Unsafe Actions (Identity Handoff Issues)

**VIOLATION COUNT: 1 critical, 30+ using wrong pattern**

#### Critical Security Issue:
- **`app/api/notifications/route.ts` (POST handler, lines 119-133)**
  - **VIOLATION:** Accepts `userId` or `userIds` from request body without validation
  - **RISK:** Attacker could create notifications for any user
  - **FIX REQUIRED:** Validate that `userId` exists in Prisma and belongs to valid user

#### Using Supabase for Role Checks Instead of Prisma:
All the API routes and server components listed above use:
```typescript
const { data: userRole } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .maybeSingle()
```

**Should be:**
```typescript
const dbUser = await db.userRole.findUnique({
  where: { userId: user.id },
  select: { role: true }
})
```

**Files affected:** 30+ files (see list above)

---

### 🟠 Type Mismatches (Manual Interfaces vs Prisma)

**VIOLATION COUNT: 15+ files**

#### Files Defining Manual Interfaces:
- `lib/db/student-profiles.ts` - Defines `StudentProfile`, `StudentProfileCreate`, `StudentProfileUpdate` (but imports Prisma type)
- `lib/db/notifications.ts` - Defines `Notification` interface (should use `@prisma/client`)
- `lib/db/timeline.ts` - Defines `UpcomingDeadline`, `OverdueEvent`, `EventNeedingNotification`, `TimelineStatistics`
- `lib/db/semesters.ts` - Defines `Semester`, `SemesterCreate`, `SemesterUpdate`
- `lib/db/survey-periods.ts` - Defines `SurveyPeriod`, `SurveyPeriodCreate`, `SurveyPeriodUpdate`, `SurveyEligibility`
- `lib/db/irregular-students.ts` - Defines `IrregularStudent`, `IrregularStudentView`, `IrregularStudentInput`
- `lib/db/prerequisites.ts` - Defines `Prerequisite`, `CourseWithPrerequisites`
- `lib/db/elective-groups.ts` - Defines `ElectiveGroup`, `ElectiveGroupWithCourses`
- `lib/db/schedule-comments.ts` - Defines `ScheduleCommentView`
- `lib/db/faculty.ts` - Defines `TimeSlot`, `DayAvailability`, `FacultySection`
- `lib/db/enrollments.ts` - Defines `EnrollmentValidation`
- `components/manual-student-registration.tsx` - Defines `Student`, `Section`, `Enrollment` interfaces
- `lib/types/database.ts` - Defines `Course` type (lines 338-354) - should use Prisma

#### Acceptable Manual Types:
- View/DTO types that combine multiple Prisma models (e.g., `ScheduleCommentView`)
- Types for computed/aggregated data (e.g., `TimelineStatistics`)
- Types for request/response payloads that differ from DB schema

---

### ⚠️ Error Handling & Edge Cases

**ISSUES FOUND:**

1. **Missing Upsert Logic:**
   - Most create functions don't use `upsert` - could fail if record exists
   - Example: `lib/db/student-profiles.ts` - `createStudentProfile` should use `upsert`

2. **Orphan Checks:**
   - `app/api/notifications/route.ts` - Creates notifications without verifying `userId` exists in Prisma
   - `lib/db/notifications.ts` - No validation that user exists before creating notification

3. **Missing Transaction Handling:**
   - Complex operations (e.g., enrollment creation) don't use Prisma transactions

---

## 2. Integration Status

**Current Health: 🟡 MEDIUM**

### Breakdown:
- ✅ **Auth Integration:** Good - Most routes properly validate Supabase auth
- 🔴 **Database Access:** Poor - 50+ files still use Supabase DB calls
- 🟡 **Type Safety:** Medium - Many manual interfaces, inconsistent Prisma usage
- 🟡 **Security:** Medium - One critical issue, many suboptimal patterns

### Migration Progress:
- **Estimated:** ~30% migrated to Prisma
- **Remaining:** ~70% still using Supabase DB calls

---

## 3. Remediation Plan

### Priority 1: Critical Security Fix

#### Fix: `app/api/notifications/route.ts` - Unsafe userId Acceptance

**Current Code (INSECURE):**
```typescript
const body = await request.json()
const { userId, userIds, type, payload } = body

if (userIds && Array.isArray(userIds)) {
  data = await createBulkNotifications(userIds, type, payload)
} else if (userId) {
  data = await createNotification(userId, type, payload)
}
```

**Fixed Code:**
```typescript
import { db } from '@/lib/db'

const body = await request.json()
const { userId, userIds, type, payload } = body

// Validate userIds exist in Prisma before creating notifications
if (userIds && Array.isArray(userIds)) {
  // Verify all userIds exist
  const existingUsers = await db.userRole.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true }
  })
  
  const existingIds = new Set(existingUsers.map(u => u.userId))
  const invalidIds = userIds.filter(id => !existingIds.has(id))
  
  if (invalidIds.length > 0) {
    return NextResponse.json(
      { error: `Invalid user IDs: ${invalidIds.join(', ')}` },
      { status: 400 }
    )
  }
  
  data = await createBulkNotifications(userIds, type, payload)
} else if (userId) {
  // Verify userId exists
  const userExists = await db.userRole.findUnique({
    where: { userId },
    select: { userId: true }
  })
  
  if (!userExists) {
    return NextResponse.json(
      { error: 'Invalid user ID' },
      { status: 400 }
    )
  }
  
  data = await createNotification(userId, type, payload)
}
```

---

### Priority 2: Migrate Core DB Files to Prisma

#### Fix: `lib/db/notifications.ts` - Migrate to Prisma

**Current Code (USING SUPABASE):**
```typescript
export async function getUserNotifications(userId: string, limit: number = 50) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('notification')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data as Notification[]
}
```

**Fixed Code:**
```typescript
import { db } from '@/lib/db'
import type { Notification } from '@prisma/client'

export async function getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
  return await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit
  })
}

export async function getUnreadCount(userId: string): Promise<number> {
  return await db.notification.count({
    where: {
      userId,
      readAt: null
    }
  })
}

export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  return await db.notification.findMany({
    where: {
      userId,
      readAt: null
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await db.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() }
  })
}

export async function markAllAsRead(userId: string): Promise<void> {
  await db.notification.updateMany({
    where: {
      userId,
      readAt: null
    },
    data: { readAt: new Date() }
  })
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await db.notification.delete({
    where: { id: notificationId }
  })
}

export async function deleteReadNotifications(userId: string): Promise<void> {
  await db.notification.deleteMany({
    where: {
      userId,
      readAt: { not: null }
    }
  })
}

export async function createNotification(
  userId: string,
  type: string,
  payload: Record<string, any>
): Promise<Notification> {
  // Verify user exists
  const userExists = await db.userRole.findUnique({
    where: { userId },
    select: { userId: true }
  })
  
  if (!userExists) {
    throw new Error(`User ${userId} does not exist`)
  }
  
  return await db.notification.create({
    data: {
      userId,
      type,
      payload
    }
  })
}

export async function createBulkNotifications(
  userIds: string[],
  type: string,
  payload: Record<string, any>
): Promise<Notification[]> {
  // Verify all users exist
  const existingUsers = await db.userRole.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true }
  })
  
  const existingIds = new Set(existingUsers.map(u => u.userId))
  const invalidIds = userIds.filter(id => !existingIds.has(id))
  
  if (invalidIds.length > 0) {
    throw new Error(`Invalid user IDs: ${invalidIds.join(', ')}`)
  }
  
  return await db.notification.createManyAndReturn({
    data: userIds.map(userId => ({
      userId,
      type,
      payload
    }))
  })
}

export async function getNotificationStats() {
  const [total, unread, byTypeData] = await Promise.all([
    db.notification.count(),
    db.notification.count({ where: { readAt: null } }),
    db.notification.findMany({
      select: { type: true }
    })
  ])
  
  const typeCount = byTypeData.reduce((acc, notif) => {
    acc[notif.type] = (acc[notif.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return {
    total,
    unread,
    read: total - unread,
    byType: typeCount
  }
}
```

**Remove manual interface:**
```typescript
// DELETE THIS:
export interface Notification {
  id: string
  user_id: string
  type: string
  payload: Record<string, any>
  read_at: string | null
  created_at: string
}

// USE PRISMA TYPE INSTEAD:
import type { Notification } from '@prisma/client'
```

---

### Priority 3: Fix Role Checks to Use Prisma

#### Fix: Replace `supabase.from('user_roles')` with Prisma

**Current Pattern (WRONG):**
```typescript
const { data: userRole } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .maybeSingle()

if (userRole?.role !== 'scheduling') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

**Fixed Pattern:**
```typescript
import { db } from '@/lib/db'

const dbUser = await db.userRole.findUnique({
  where: { userId: user.id },
  select: { role: true }
})

if (!dbUser || dbUser.role !== 'scheduling') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

**Create utility function:**
```typescript
// lib/utils/auth.ts
import { db } from '@/lib/db'
import { createClient } from '@/supabase/server'

export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  const dbUser = await db.userRole.findUnique({
    where: { userId: user.id }
  })
  
  if (!dbUser) {
    return null
  }
  
  return {
    authUser: user,
    dbUser
  }
}

export async function requireRole(role: string) {
  const user = await getAuthenticatedUser()
  
  if (!user || user.dbUser.role !== role) {
    throw new Error('Forbidden')
  }
  
  return user
}
```

---

## 4. Migration Roadmap

### Phase 1: Critical Security (Week 1)
1. ✅ Fix `app/api/notifications/route.ts` userId validation
2. ✅ Create `getAuthenticatedUser()` utility
3. ✅ Migrate `lib/db/notifications.ts` to Prisma

### Phase 2: Core DB Files (Week 2-3)
1. Migrate `lib/db/sections.ts` to Prisma
2. Migrate `lib/db/exams.ts` to Prisma
3. Migrate `lib/db/timeline.ts` to Prisma (handle RPC functions)
4. Migrate `lib/db/semesters.ts` to Prisma

### Phase 3: API Routes (Week 4-5)
1. Replace all `supabase.from('user_roles')` with Prisma
2. Update all API routes to use Prisma
3. Update server components to use Prisma

### Phase 4: Type Cleanup (Week 6)
1. Remove manual interfaces, use Prisma types
2. Update components to use Prisma types
3. Remove `lib/types/database.ts` manual types

### Phase 5: Client Hooks (Week 7)
1. Migrate `hooks/use-client-fetch.ts` to use API routes
2. Migrate `hooks/use-client-mutation.ts` to use API routes
3. Remove direct Supabase DB access from client

---

## 5. Testing Checklist

After each migration:
- [ ] Verify authentication still works
- [ ] Verify authorization (role checks) still works
- [ ] Test all affected API endpoints
- [ ] Verify no Supabase DB calls remain in migrated files
- [ ] Check TypeScript compilation errors
- [ ] Run integration tests

---

## Summary

**Total Violations:** 100+  
**Critical Issues:** 1 (unsafe userId acceptance)  
**High Priority:** 50+ (Supabase DB calls)  
**Medium Priority:** 30+ (wrong role check pattern)  
**Low Priority:** 15+ (manual type definitions)

**Estimated Migration Time:** 6-7 weeks  
**Recommended Approach:** Incremental, file-by-file migration with thorough testing

