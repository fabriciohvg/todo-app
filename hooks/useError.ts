import { useState, useCallback } from "react";

/**
 * Custom hook for managing error messages with auto-dismiss
 *
 * @param dismissAfter - Time in milliseconds before error auto-dismisses (default: 5000)
 * @returns Object with error state and methods to show/clear errors
 *
 * @example
 * ```tsx
 * const { error, showError, clearError } = useError();
 *
 * // Show error
 * showError("Something went wrong!");
 *
 * // Clear error manually
 * clearError();
 * ```
 */
export function useError(dismissAfter: number = 5000) {
  const [error, setError] = useState<string | null>(null);

  const showError = useCallback(
    (message: string) => {
      setError(message);
      setTimeout(() => setError(null), dismissAfter);
    },
    [dismissAfter]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    showError,
    clearError,
  };
}
