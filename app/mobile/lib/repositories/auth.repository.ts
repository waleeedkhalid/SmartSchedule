/**
 * Authentication Repository
 * 
 * Handles all authentication-related API calls.
 * This repository abstracts HTTP details from the UI layer.
 * 
 * Why this supports reusability: The same repository interface can be
 * implemented in React Native, iOS (Swift), or Android (Kotlin) with
 * different HTTP clients, but the business logic remains identical.
 */

import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import type {
  LoginRequest,
  LoginResponse,
  UserResponse,
  LogoutResponse,
} from "../api/types";

export class AuthRepository {
  /**
   * Login with email and password
   * 
   * Why: Returns token that can be used by any client platform.
   * The token format (JWT) is standard across all platforms.
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    // Store token in client
    apiClient.setToken(response.token);

    return response;
  }

  /**
   * Logout current user
   * 
   * Why: Simple logout that works identically for all clients.
   */
  async logout(): Promise<LogoutResponse> {
    const response = await apiClient.post<LogoutResponse>(
      API_ENDPOINTS.AUTH.LOGOUT
    );

    // Clear token
    apiClient.setToken(null);

    return response;
  }

  /**
   * Get current authenticated user
   * 
   * Why: Used by clients to check auth status and get user info.
   * Works the same way for PWA, React Native, iOS, and Android.
   */
  async getCurrentUser(): Promise<UserResponse> {
    return apiClient.get<UserResponse>(API_ENDPOINTS.AUTH.ME);
  }

  /**
   * Check if user is authenticated
   * 
   * Why: Helper method that clients can use to determine auth state.
   */
  isAuthenticated(): boolean {
    return apiClient.getToken() !== null;
  }
}

export const authRepository = new AuthRepository();

