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

  // Semesters
  SEMESTERS: {
    LIST: `${API_BASE_URL}/api/${API_VERSION}/semesters`,
    CURRENT: `${API_BASE_URL}/api/${API_VERSION}/semesters/current`,
  },

  // Courses
  COURSES: {
    LIST: `${API_BASE_URL}/api/${API_VERSION}/courses`,
    DETAIL: (code: string) => `${API_BASE_URL}/api/${API_VERSION}/courses/${code}`,
  },

  // Sections
  SECTIONS: {
    LIST: `${API_BASE_URL}/api/${API_VERSION}/sections`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/${API_VERSION}/sections/${id}`,
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
  },
} as const;

