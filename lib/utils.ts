import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely extracts a joined relation from Supabase query results.
 * Supabase joins can return either a single object or an array.
 * This utility normalizes the result to always return a single object or null.
 * 
 * @param relation - The joined relation from Supabase (can be object, array, or null)
 * @returns The first item if array, the object if single, or null if missing
 * 
 * @example
 * ```typescript
 * const course = extractJoinedRelation(pref.course);
 * const courseCode = course?.code;
 * ```
 */
export function extractJoinedRelation<T>(
  relation: T | T[] | null | undefined
): T | null {
  if (!relation) return null;
  if (Array.isArray(relation)) {
    return relation.length > 0 ? relation[0] : null;
  }
  return relation;
}
