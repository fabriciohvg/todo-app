# Custom Hooks Guide

## When to Create a Custom Hook

### ✅ CREATE a hook when:
1. **Repetitive state logic** across components
2. **Complex state management** (e.g., optimistic updates)
3. **Multiple related hooks used together** (useState + useEffect + useCallback)
4. **Logic is reused** in 2+ components
5. **Separating concerns** (UI from business logic)

### ❌ DON'T create a hook when:
1. Logic is used only once
2. Wrapping a single hook with no additional logic
3. Logic is too simple (single useState)
4. UI-specific rendering logic

---

## Production-Ready Best Practices

### 1. **Naming Convention**
- Always start with `use` (React requirement)
- Use descriptive names: `useTodos`, not `useTodo` or `todos`
- Be specific: `useFileUpload` not `useUpload`

### 2. **TypeScript**
- Always add type annotations
- Export types if they're reusable
- Use generics for flexible hooks (e.g., `useOptimisticUpdate<T>`)

### 3. **Documentation**
- Add JSDoc comments with:
  - Purpose description
  - Parameter explanations
  - Return value description
  - Usage examples

### 4. **Dependencies**
- Use `useCallback` for functions returned from hooks
- Specify proper dependency arrays
- Avoid unnecessary re-renders

### 5. **Error Handling**
- Always handle errors gracefully
- Provide error callbacks or return error states
- Don't let hooks crash the app

### 6. **Testing**
- Hooks should be testable
- Use `@testing-library/react-hooks` for testing
- Test edge cases and error scenarios

---

## Available Hooks in This Project

### `useError(dismissAfter?: number)`
Manages error messages with auto-dismiss functionality.

**Returns:**
- `error: string | null` - Current error message
- `showError: (message: string) => void` - Show error
- `clearError: () => void` - Clear error manually

**Example:**
\`\`\`tsx
const { error, showError, clearError } = useError(3000);
showError("Something went wrong!");
\`\`\`

---

### `useTodos(initialTodos, onError)`
Manages todo CRUD operations with optimistic updates.

**Parameters:**
- `initialTodos: todoType[]` - Initial todo array
- `onError: (error: string) => void` - Error callback

**Returns:**
- `todos: todoType[]` - Current todos
- `createTodo: (text: string) => Promise<void>`
- `changeTodoText: (id: string, text: string) => Promise<void>`
- `toggleIsTodoDone: (id: string) => Promise<void>`
- `deleteTodoItem: (id: string) => Promise<void>`

**Example:**
\`\`\`tsx
const { todos, createTodo, deleteTodoItem } = useTodos(initialTodos, showError);

await createTodo("Buy groceries");
await deleteTodoItem(todoId);
\`\`\`

---

### `useFileUpload(uploadUrl)`
Handles file uploads with loading and error states.

**Parameters:**
- `uploadUrl: string` - API endpoint for upload

**Returns:**
- `uploadedFile: PutBlobResult | null` - Uploaded file info
- `isUploading: boolean` - Upload in progress
- `error: string | null` - Error message
- `uploadFile: (file: File) => Promise<PutBlobResult | null>`
- `reset: () => void` - Reset state

**Example:**
\`\`\`tsx
const { uploadFile, isUploading, error } = useFileUpload('/api/upload');

const result = await uploadFile(file);
if (result) {
  console.log('Uploaded:', result.url);
}
\`\`\`

---

### `useOptimisticUpdate<T>(initialData, onError?)`
Generic hook for optimistic UI updates with rollback.

**Parameters:**
- `initialData: T` - Initial state
- `onError?: (error: string) => void` - Error callback

**Returns:**
- `data: T` - Current data
- `setData: (data: T) => void` - Set data manually
- `performOptimisticUpdate: (optimistic, serverAction) => Promise<void>`

**Example:**
\`\`\`tsx
const { data, performOptimisticUpdate } = useOptimisticUpdate(todos);

await performOptimisticUpdate(
  (prev) => prev.filter(t => t.id !== id),
  () => deleteTodo(id)
);
\`\`\`

---

## How to Import

\`\`\`tsx
// Import individual hooks
import { useError, useTodos } from "@/hooks";

// Or import all
import * as hooks from "@/hooks";
\`\`\`

---

## Creating Your Own Hook

### Step 1: Identify the Pattern
Look for repeated logic in your components:
- Multiple useState calls
- Similar useEffect patterns
- Repeated API calls
- Common state transformations

### Step 2: Extract to Function
\`\`\`tsx
// hooks/useMyHook.ts
import { useState } from "react";

export function useMyHook(initialValue: string) {
  const [value, setValue] = useState(initialValue);

  const reset = () => setValue(initialValue);

  return { value, setValue, reset };
}
\`\`\`

### Step 3: Add TypeScript & Docs
\`\`\`tsx
/**
 * Description of what this hook does
 *
 * @param initialValue - What this parameter is for
 * @returns Object with value and methods
 */
export function useMyHook(initialValue: string) {
  // ... implementation
}
\`\`\`

### Step 4: Export from index.ts
\`\`\`tsx
// hooks/index.ts
export { useMyHook } from "./useMyHook";
\`\`\`

---

## Common Patterns

### Pattern 1: State + Derived State
\`\`\`tsx
export function useFilteredList<T>(items: T[], filterFn: (item: T) => boolean) {
  const [filter, setFilter] = useState("");
  const filtered = items.filter(filterFn);

  return { filtered, filter, setFilter };
}
\`\`\`

### Pattern 2: Async Data Fetching
\`\`\`tsx
export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await fetch(url);
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetch };
}
\`\`\`

### Pattern 3: Local Storage Sync
\`\`\`tsx
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  const setStoredValue = (newValue: T) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, setStoredValue] as const;
}
\`\`\`

---

## Testing Example

\`\`\`tsx
import { renderHook, act } from '@testing-library/react';
import { useError } from './useError';

describe('useError', () => {
  it('should show and clear error', () => {
    const { result } = renderHook(() => useError(1000));

    act(() => {
      result.current.showError('Test error');
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
\`\`\`

---

## Resources

- [React Hooks Documentation](https://react.dev/reference/react)
- [Custom Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [TypeScript with Hooks](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/hooks)
