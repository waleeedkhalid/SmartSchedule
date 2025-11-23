/**
 * DEMO MODE: Logout API Route
 * 
 * Handles logout by clearing the demo_user_id cookie and redirecting to login
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  
  // Clear the demo_user_id cookie
  cookieStore.delete('demo_user_id');
  
  // Also set it to empty with expired date to ensure it's cleared
  cookieStore.set('demo_user_id', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    path: '/',
  });
  
  // Create response with redirect
  const response = NextResponse.redirect(new URL('/login', request.url));
  
  // Ensure cookie is cleared in response headers
  response.cookies.delete('demo_user_id');
  response.cookies.set('demo_user_id', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  
  return response;
}

