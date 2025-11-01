/**
 * Authentication API Service
 *
 * API functions for user authentication and session management
 */

import { apiClient, getApiErrorMessage } from "../client";
import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
} from "@/types/api";

/**
 * Login user with username and password
 */
export async function loginUser(
  credentials: LoginRequest
): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>(
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
): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>(
      "/auth/register/",
      data
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(
  data: PasswordResetRequest
): Promise<{ message: string }> {
  try {
    const response = await apiClient.post<{ message: string }>(
      "/auth/password-reset/",
      data
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/**
 * Confirm password reset with token
 */
export async function confirmPasswordReset(
  data: PasswordResetConfirm
): Promise<{ message: string }> {
  try {
    const response = await apiClient.post<{ message: string }>(
      "/auth/password-reset-confirm/",
      data
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/**
 * Login with Google OAuth2
 * Redirects to backend OAuth2 endpoint
 */
export function loginWithGoogle(): void {
  const backendUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  window.location.href = `${backendUrl}/auth/google/`;
}
