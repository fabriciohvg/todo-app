# Custom Hooks Cheatsheet

## Quick Decision Tree

```
Do you have logic repeated in 2+ components?
├─ YES → Create a custom hook
└─ NO → Keep it in the component

Is the logic complex (multiple hooks, async, state management)?
├─ YES → Create a custom hook
└─ NO → Keep it simple

Does extracting improve readability and testing?
├─ YES → Create a custom hook
└─ NO → Keep it in the component
```

---

## Hook Template

```tsx
import { useState, useCallback, useEffect } from "react";

/**
 * Brief description
 *
 * @param param1 - Description
 * @returns Description
 *
 * @example
 * ```tsx
 * const { data, action } = useMyHook(initialValue);
 * ```
 */
export function useMyHook(param1: string) {
  const [state, setState] = useState<string>(param1);

  const action = useCallback(() => {
    // Do something
  }, [/* dependencies */]);

  useEffect(() => {
    // Side effects
  }, [/* dependencies */]);

  return {
    state,
    action,
  };
}
```

---

## Common Patterns

### 1. Simple State Hook
```tsx
export function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = () => setOn(prev => !prev);
  return [on, toggle] as const;
}

// Usage
const [isOpen, toggleOpen] = useToggle();
```

### 2. Async Operation Hook
```tsx
export function useAsync<T>(asyncFn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
}
```

### 3. Form Hook
```tsx
export function useForm<T>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const reset = () => setValues(initialValues);

  return { values, handleChange, reset };
}

// Usage
const { values, handleChange, reset } = useForm({ email: '', password: '' });
```

### 4. Debounce Hook
```tsx
export function useDebounce<T>(value: T, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const searchTerm = useDebounce(input, 500);
```

### 5. Previous Value Hook
```tsx
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
```

---

## TypeScript Tips

### Return Array (Tuple)
```tsx
return [state, setState] as const;
```

### Return Object
```tsx
return { state, setState };
```

### Generic Hook
```tsx
export function useArray<T>(initial: T[]) {
  const [arr, setArr] = useState<T[]>(initial);
  const push = (item: T) => setArr(prev => [...prev, item]);
  return { arr, push };
}
```

---

## Testing Pattern

```tsx
import { renderHook, act } from '@testing-library/react';

it('should work', () => {
  const { result } = renderHook(() => useMyHook('test'));

  expect(result.current.state).toBe('test');

  act(() => {
    result.current.action();
  });

  expect(result.current.state).toBe('updated');
});
```

---

## Common Mistakes

❌ **Don't call hooks conditionally**
```tsx
if (condition) {
  const [state] = useState(); // WRONG!
}
```

✅ **Always call hooks at top level**
```tsx
const [state] = useState();
if (condition) {
  // use state here
}
```

❌ **Don't forget dependencies**
```tsx
useEffect(() => {
  doSomething(value); // value not in deps!
}, []); // WRONG!
```

✅ **Include all dependencies**
```tsx
useEffect(() => {
  doSomething(value);
}, [value]); // CORRECT
```

❌ **Don't create unnecessary hooks**
```tsx
// Just wrapping useState - not useful!
export function useName() {
  return useState('');
}
```

✅ **Add value beyond wrapping**
```tsx
export function useName(validate: (name: string) => boolean) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const setValidatedName = (newName: string) => {
    if (validate(newName)) {
      setName(newName);
      setError('');
    } else {
      setError('Invalid name');
    }
  };

  return { name, error, setName: setValidatedName };
}
```

---

## Performance Tips

1. **Use `useCallback`** for returned functions
2. **Use `useMemo`** for expensive calculations
3. **Avoid creating new objects** in every render
4. **Keep dependency arrays minimal** but correct

---

## File Structure

```
hooks/
├── index.ts              # Export all hooks
├── README.md            # Full documentation
├── CHEATSHEET.md        # This file
├── useError.ts
├── useTodos.ts
├── useFileUpload.ts
└── __tests__/           # Tests
    ├── useError.test.ts
    └── useTodos.test.ts
```
