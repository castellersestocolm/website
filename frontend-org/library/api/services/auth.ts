/**
 * Authentication API Service
 *
 * API functions for user authentication and session management
 */

import { apiClient, getApiErrorMessage } from "../client";
import type {
  User,
  LoginRequest,
  RegisterRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
} from "@/types/api";

/**
 * Login user with email and password
 */
export async function loginUser(
  credentials: LoginRequest
): Promise<User> {
  try {
    const response = await apiClient.post<User>(
      "/user/login/",
      credentials
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/**
 * Logout current user
 */
export async function logoutUser(): Promise<void> {
  try {
    await apiClient.post("/user/logout/");
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const response = await apiClient.get<User>("/user/me/");
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/**
 * Register new user
 */
export async function registerUser(
  data: RegisterRequest
): Promise<void> {
  try {
    await apiClient.post("/user/", data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(
  data: PasswordResetRequest
): Promise<void> {
  try {
    await apiClient.post("/user/request-password/", data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/**
 * Confirm password reset with token and new password
 */
export async function confirmPasswordReset(
  data: PasswordResetConfirm
): Promise<void> {
  try {
    await apiClient.post("/user/password/", data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/**
 * Login with Google OAuth2
 * Redirects to backend's Google OAuth endpoint
 */
export function loginWithGoogle(): void {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/1.0', '') || "http://localhost:8000";
  // Social Django OAuth endpoints are at /api/1.0/user/login/google-oauth2/
  window.location.href = `${apiBaseUrl}/api/1.0/user/login/google-oauth2/`;
}
