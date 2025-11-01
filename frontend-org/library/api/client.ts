/**
 * API Client Configuration
 *
 * Axios instance configured for backend API communication with:
 * - CSRF token handling
 * - Session cookie support
 * - Error interceptors
 */

import axios, { AxiosError, AxiosInstance } from "axios";

// Get API base URL from environment variable or default to localhost
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/1.0";

/**
 * Get CSRF token from cookies (client-side only)
 */
function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;

  const name = "csrftoken";
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(name + "=")) {
      return decodeURIComponent(trimmed.substring(name.length + 1));
    }
  }

  return null;
}

/**
 * Create axios instance for API calls
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

/**
 * Request interceptor to add CSRF token
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add CSRF token for non-GET requests (client-side only)
    if (
      typeof window !== "undefined" &&
      config.method &&
      config.method.toLowerCase() !== "get"
    ) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers["X-CSRFToken"] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle common error scenarios
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          // Unauthorized - session expired or not authenticated
          console.warn("Authentication required");
          // Could dispatch event or redirect to login here
          break;

        case 403:
          // Forbidden - CSRF token issue or permission denied
          console.error("Access forbidden:", error.response.data);
          break;

        case 404:
          console.error("Resource not found");
          break;

        case 429:
          // Rate limit exceeded
          console.error("Rate limit exceeded. Please try again later.");
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          console.error("Server error. Please try again later.");
          break;
      }
    } else if (error.request) {
      // Request made but no response received
      console.error("Network error. Please check your connection.");
    } else {
      // Something else happened
      console.error("Request error:", error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * API Error type for typed error handling
 */
export interface ApiError {
  status?: number;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Helper to extract error message from API response
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.statusText) {
      return error.response.statusText;
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}
