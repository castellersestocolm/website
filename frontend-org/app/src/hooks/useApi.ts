"use client";

/**
 * useApi Hook
 *
 * Generic hook for handling API calls with loading and error states
 */

import { useState, useCallback } from "react";

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseApiReturn<T, P extends unknown[]> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: P) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook for managing API call state
 *
 * @example
 * ```tsx
 * const { data, loading, error, execute } = useApi(getEvents);
 *
 * useEffect(() => {
 *   execute({ page: 1, page_size: 10 });
 * }, []);
 *
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * return <div>{data && renderData(data)}</div>;
 * ```
 */
export function useApi<T, P extends unknown[] = []>(
  apiFunction: (...args: P) => Promise<T>,
  options?: UseApiOptions<T>
): UseApiReturn<T, P> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(...args);
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error("Unknown error");
        setError(errorObj);
        options?.onError?.(errorObj);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

/**
 * Hook for managing mutation state (POST, PUT, PATCH, DELETE)
 * Similar to useApi but optimized for mutations
 */
export function useMutation<T, P extends unknown[] = []>(
  mutationFunction: (...args: P) => Promise<T>,
  options?: UseApiOptions<T>
): UseApiReturn<T, P> {
  return useApi(mutationFunction, options);
}
