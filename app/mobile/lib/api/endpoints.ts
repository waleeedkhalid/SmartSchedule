/**
 * API Endpoints Configuration
 * 
 * Centralized endpoint definitions for the mobile client.
 * This makes it easy to update API URLs if the backend changes,
 * and demonstrates that the same endpoints work for any client.
 */

// Get base URL - works in both server and client contexts
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Client-side: use current origin
    return window.location.origin;
  }
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

const API_BASE_URL = getBaseUrl();
const API_VERSION = "v1";

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/${API_VERSION}/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/${API_VERSION}/auth/logout`,
    ME: `${API_BASE_URL}/api/${API_VERSION}/auth/me`,
  },

  // Academic Terms (preferred)
  ACADEMIC_TERMS: {
    LIST: `${API_BASE_URL}/api/${API_VERSION}/academic-terms`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/${API_VERSION}/academic-terms/${id}`,
  },

  // Semesters (backward compatibility - maps to academic-terms)
  SEMESTERS: {
    LIST: `${API_BASE_URL}/api/${API_VERSION}/semesters`,
    CURRENT: `${API_BASE_URL}/api/${API_VERSION}/semesters/current`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/${API_VERSION}/semesters/${id}`,
  },

  // Courses
  COURSES: {
    LIST: `${API_BASE_URL}/api/${API_VERSION}/courses`,
    DETAIL: (code: string) => `${API_BASE_URL}/api/${API_VERSION}/courses/${code}`,
    CREATE: `${API_BASE_URL}/api/${API_VERSION}/courses`,
    UPDATE: (code: string) => `${API_BASE_URL}/api/${API_VERSION}/courses/${code}`,
    DELETE: (code: string) => `${API_BASE_URL}/api/${API_VERSION}/courses/${code}`,
  },

  // Sections
  SECTIONS: {
    LIST: `${API_BASE_URL}/api/${API_VERSION}/sections`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/${API_VERSION}/sections/${id}`,
    CREATE: `${API_BASE_URL}/api/${API_VERSION}/sections`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/${API_VERSION}/sections/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/${API_VERSION}/sections/${id}`,
    CHECK_CONFLICTS: `${API_BASE_URL}/api/${API_VERSION}/sections/check-conflicts`,
  },

  // Enrollments
  ENROLLMENTS: {
    LIST: `${API_BASE_URL}/api/${API_VERSION}/enrollments`,
    CREATE: `${API_BASE_URL}/api/${API_VERSION}/enrollments`,
    DELETE: (id: string) => `${API_BASE_URL}/api/${API_VERSION}/enrollments/${id}`,
  },

  // Schedules
  SCHEDULES: {
    ME: `${API_BASE_URL}/api/${API_VERSION}/schedules/me`,
    LIST: `${API_BASE_URL}/api/${API_VERSION}/schedules`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/${API_VERSION}/schedules/${id}`,
    CREATE: `${API_BASE_URL}/api/${API_VERSION}/schedules`,
    DELETE: (id: string) => `${API_BASE_URL}/api/${API_VERSION}/schedules/${id}`,
    GENERATE: `${API_BASE_URL}/api/${API_VERSION}/schedules/generate`,
    STATUS: `${API_BASE_URL}/api/${API_VERSION}/schedules/status`,
  },

  // Academic Plan
  ACADEMIC_PLAN: {
    LIST: `${API_BASE_URL}/api/${API_VERSION}/academic-plan`,
  },

  // Elective Preferences
  ELECTIVE_PREFERENCES: {
    GET: `${API_BASE_URL}/api/elective-preferences`,
    UPDATE: `${API_BASE_URL}/api/elective-preferences`,
  },

  // Elective Stats (Scheduling role only)
  ELECTIVE_STATS: {
    GET: `${API_BASE_URL}/api/${API_VERSION}/elective-stats`,
  },
} as const;

