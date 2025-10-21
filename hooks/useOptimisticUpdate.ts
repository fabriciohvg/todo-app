import { useState, useCallback } from "react";

/**
 * Custom hook for optimistic UI updates with automatic rollback on error
 *
 * @param initialData - Initial state data
 * @param onError - Optional callback when an error occurs
 * @returns Object with data state and optimistic update method
 *
 * @example
 * ```tsx
 * const { data, performOptimisticUpdate } = useOptimisticUpdate(todos, showError);
 *
 * // Delete todo optimistically
 * await performOptimisticUpdate(
 *   (prev) => prev.filter(todo => todo.id !== id),
 *   () => deleteTodo(id)
 * );
 * ```
 */
export function useOptimisticUpdate<T>(
  initialData: T,
  onError?: (error: string) => void
) {
  const [data, setData] = useState<T>(initialData);

  const performOptimisticUpdate = useCallback(
    async (
      optimisticUpdate: (prev: T) => T,
      serverAction: () => Promise<{ success: boolean; error?: string }>
    ) => {
      // Store original state for rollback
      const originalData = data;

      // Optimistic update
      setData(optimisticUpdate);

      // Call server action
      const result = await serverAction();

      if (!result.success) {
        // Rollback on error
        setData(originalData);
        if (onError && result.error) {
          onError(result.error);
        }
      }
    },
    [data, onError]
  );

  return {
    data,
    setData,
    performOptimisticUpdate,
  };
}
