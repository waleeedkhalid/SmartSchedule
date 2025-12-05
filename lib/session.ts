/**
 * Session Management Layer
 *
 * Implements stateless JWT-based session management following Next.js 16+ best practices.
 * Sessions are stored in httpOnly cookies and are signed using the jose library.
 *
 * This layer sits on top of Supabase Auth:
 * - Supabase handles user management, password hashing, and email verification
 * - This module manages application sessions via JWT cookies for SSR compatibility
 *
 * @see https://nextjs.org/docs/app/guides/authentication
 */

import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Session configuration
const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const SESSION_DURATION_STR = "7d";

/**
 * Session payload stored in the JWT
 * Keep this minimal - only include data needed for authorization decisions
 */
export interface SessionPayload {
  userId: string;
  role: string;
  expiresAt: Date;
}

/**
 * Get the encoded secret key for JWT signing
 * Throws if SESSION_SECRET is not configured
 */
function getEncodedKey(): Uint8Array {
  const secretKey = process.env.SESSION_SECRET;

  if (!secretKey) {
    throw new Error(
      "SESSION_SECRET environment variable is not set.\n" +
        "Generate one with: openssl rand -base64 32\n" +
        "Then add it to your .env.local file."
    );
  }

  return new TextEncoder().encode(secretKey);
}

/**
 * Encrypt a session payload into a signed JWT
 *
 * @param payload - The session data to encrypt
 * @returns Signed JWT string
 */
export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    role: payload.role,
    expiresAt: payload.expiresAt.toISOString(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION_STR)
    .sign(getEncodedKey());
}

/**
 * Decrypt and verify a JWT session token
 *
 * @param session - The JWT string to decrypt
 * @returns The session payload if valid, undefined if invalid/expired
 */
export async function decrypt(
  session: string | undefined
): Promise<SessionPayload | undefined> {
  if (!session) {
    return undefined;
  }

  try {
    const { payload } = await jwtVerify(session, getEncodedKey(), {
      algorithms: ["HS256"],
    });

    // Reconstruct the session payload
    return {
      userId: payload.userId as string,
      role: payload.role as string,
      expiresAt: new Date(payload.expiresAt as string),
    };
  } catch (error) {
    // Token is invalid, expired, or tampered with
    // Log for debugging but don't throw - return undefined for graceful handling
    console.log(
      "Failed to verify session:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return undefined;
  }
}

/**
 * Create a new session for an authenticated user
 *
 * This should be called after successful Supabase authentication.
 * Sets an httpOnly cookie with the encrypted session.
 *
 * @param userId - The authenticated user's ID
 * @param role - The user's role for authorization
 */
export async function createSession(
  userId: string,
  role: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const session = await encrypt({ userId, role, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Update (refresh) the current session
 *
 * Extends the session expiration if the session is still valid.
 * Call this from middleware to keep sessions alive for active users.
 *
 * @returns The session payload if refreshed successfully, null if no valid session
 */
export async function updateSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  const payload = await decrypt(sessionCookie);

  if (!payload) {
    return null;
  }

  // Extend the session
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const newPayload: SessionPayload = {
    ...payload,
    expiresAt,
  };

  const session = await encrypt(newPayload);

  cookieStore.set(SESSION_COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });

  return newPayload;
}

/**
 * Delete the current session (logout)
 *
 * Removes the session cookie, effectively logging the user out.
 * Should be called alongside supabase.auth.signOut() for complete logout.
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Get the current session without refreshing it
 *
 * Use this for reading session data without extending the session.
 * Prefer verifySession() from the DAL for most authorization checks.
 *
 * @returns The session payload if valid, undefined otherwise
 */
export async function getSession(): Promise<SessionPayload | undefined> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return decrypt(sessionCookie);
}
