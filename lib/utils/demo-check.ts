/**
 * Utility to check if user is in demo mode
 */

import { cookies } from "next/headers";

/**
 * Checks if the current user is in demo mode
 * @returns Promise<boolean> - true if user is in demo mode
 */
export async function isDemoMode(): Promise<boolean> {
  const cookieStore = await cookies();
  const demoUserId = cookieStore.get('demo_user_id')?.value;
  return !!demoUserId;
}

