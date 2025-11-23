/**
 * Authentication and authorization utilities
 * 
 * Provides consistent patterns for:
 * - Getting authenticated user (Supabase Auth + Prisma DB)
 * - Role-based authorization checks
 * 
 * ARCHITECTURE: Supabase Auth (identity) -> Prisma (data)
 * 
 * PERFORMANCE OPTIMIZED:
 * - Accepts optional user parameter to avoid redundant Supabase calls
 * - Uses Prisma include to fetch related data in single query
 */
import { createClient } from '@/supabase/server'
import { db } from '@/lib/db'
import type { User } from '@supabase/supabase-js'

// UserRoleType matches the enum in prisma/schema.prisma
type UserRoleType = 'scheduling' | 'teaching_load' | 'faculty' | 'student' | 'registrar'

export interface AuthenticatedUser {
  authUser: {
    id: string
    email?: string
    [key: string]: any
  }
  dbUser: {
    userId: string
    role: UserRoleType
    name: string
    email: string
    onboardingCompleted: boolean
    [key: string]: any
  }
}

/**
 * Get authenticated user from Supabase session and Prisma DB
 * 
 * PERFORMANCE: Accepts optional user parameter to avoid redundant Supabase API calls.
 * If user is already fetched (e.g., from middleware), pass it to skip auth check.
 * 
 * @param user - Optional Supabase user object (if already fetched)
 * @returns AuthenticatedUser if valid session exists, null otherwise
 */
export async function getAuthenticatedUser(user?: User | null): Promise<AuthenticatedUser | null> {
  // If user is not provided, fetch from Supabase
  let authUser: User | null = user || null
  
  if (!authUser) {
    const supabase = await createClient()
    const { data: { user: fetchedUser }, error } = await supabase.auth.getUser()
    
    if (error || !fetchedUser) {
      return null
    }
    
    authUser = fetchedUser
  }
  
  // Type guard: ensure authUser is not null at this point
  if (!authUser) {
    return null
  }
  
  // Get user role from Prisma (not Supabase DB)
  const dbUser = await db.userRole.findUnique({
    where: { userId: authUser.id }
  })
  
  if (!dbUser) {
    return null
  }
  
  return {
    authUser,
    dbUser
  }
}

/**
 * Require user to be authenticated
 * 
 * @param user - Optional Supabase user object (if already fetched)
 * @throws Error if user is not authenticated
 */
export async function requireAuth(user?: User | null): Promise<AuthenticatedUser> {
  const authUser = await getAuthenticatedUser(user)
  
  if (!authUser) {
    throw new Error('Unauthorized')
  }
  
  return authUser
}

/**
 * Require user to have a specific role
 * 
 * @param role - Required role
 * @param user - Optional Supabase user object (if already fetched)
 * @throws Error if user is not authenticated or doesn't have required role
 */
export async function requireRole(role: UserRoleType, user?: User | null): Promise<AuthenticatedUser> {
  const authUser = await requireAuth(user)
  
  if (authUser.dbUser.role !== role) {
    throw new Error('Forbidden')
  }
  
  return authUser
}

/**
 * Require user to have one of the specified roles
 * 
 * @param roles - Array of allowed roles
 * @param user - Optional Supabase user object (if already fetched)
 * @throws Error if user is not authenticated or doesn't have any of the required roles
 */
export async function requireAnyRole(roles: UserRoleType[], user?: User | null): Promise<AuthenticatedUser> {
  const authUser = await requireAuth(user)
  
  if (!roles.includes(authUser.dbUser.role)) {
    throw new Error('Forbidden')
  }
  
  return authUser
}

/**
 * Check if user has a specific role (non-throwing)
 * 
 * @param role - Role to check
 * @param user - Optional Supabase user object (if already fetched)
 * @returns true if user has the role, false otherwise
 */
export async function hasRole(role: UserRoleType, user?: User | null): Promise<boolean> {
  const authUser = await getAuthenticatedUser(user)
  return authUser?.dbUser.role === role
}

