/**
 * User API Service
 *
 * API functions for user profile and management
 */

import { apiClient, getApiErrorMessage } from "../client";
import type { User } from "@/types/api";

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: number): Promise<User> {
  try {
    const response = await apiClient.get<User>(`/users/${userId}/`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: number,
  data: Partial<User>
): Promise<User> {
  try {
    const response = await apiClient.patch<User>(`/users/${userId}/`, data);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/**
 * Upload user profile picture
 */
export async function uploadProfilePicture(
  userId: number,
  file: File
): Promise<User> {
  try {
    const formData = new FormData();
    formData.append("profile_picture", file);

    const response = await apiClient.patch<User>(
      `/users/${userId}/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

/**
 * Change user password
 */
export async function changePassword(data: {
  old_password: string;
  new_password: string;
}): Promise<{ message: string }> {
  try {
    const response = await apiClient.post<{ message: string }>(
      "/users/change-password/",
      data
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
