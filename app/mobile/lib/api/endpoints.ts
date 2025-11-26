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

  // Academic Terms
  ACADEMIC_TERMS: {
    LIST: `${API_BASE_URL}/api/${API_VERSION}/academic-terms`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/${API_VERSION}/academic-terms/${id}`,
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
    CREATE: `${API_BASE_URL}/api/${API_VERSION}/schedules`,
    DELETE: (id: string) => `${API_BASE_URL}/api/${API_VERSION}/schedules/${id}`,
    GENERATE: `${API_BASE_URL}/api/${API_VERSION}/schedules/generate`,
  },
} as const;

