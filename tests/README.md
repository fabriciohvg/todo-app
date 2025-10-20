# Testing Guide

This project uses **Vitest** and **React Testing Library** for testing.

## Running Tests

```bash
# Run tests in watch mode (recommended during development)
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
my-finance/
├── tests/
│   ├── setup.ts           # Global test setup and mocks
│   ├── utils.tsx          # Test utilities and helpers
│   └── README.md          # This file
├── components/
│   └── __tests__/
│       ├── addTodo.test.tsx
│       └── todo.test.tsx
└── actions/
    └── __tests__/
        └── todoAction.test.ts
```

## Writing Tests

### Component Tests

Component tests are located in `__tests__` folders next to the components they test.

Example:
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyComponent from "../MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("handles user interaction", async () => {
    const user = userEvent.setup();
    const mockFn = vi.fn();

    render(<MyComponent onClick={mockFn} />);

    await user.click(screen.getByRole("button"));
    expect(mockFn).toHaveBeenCalled();
  });
});
```

### Server Action Tests

Server action tests focus on validation and error handling.

Example:
```typescript
import { describe, it, expect } from "vitest";
import { addTodo } from "../todoAction";

describe("addTodo", () => {
  it("validates empty text", async () => {
    const result = await addTodo(1, "");

    expect(result.success).toBe(false);
    expect(result.error).toContain("cannot be empty");
  });
});
```

## Test Utilities

### `renderWithProviders()`
Wraps components with necessary providers (currently just basic render, but can be extended).

### `mockActionResponse()`
Creates mock server action responses.

```typescript
const successResponse = mockActionResponse(true, { id: 1, text: "Test" });
const errorResponse = mockActionResponse(false, undefined, "Error message");
```

### `createMockTodo()`
Creates mock todo items for testing.

```typescript
const todo = createMockTodo({ id: 1, text: "Custom text", done: true });
```

## Mocks

Global mocks are configured in `tests/setup.ts`:

- **Next.js Router** - Mocked navigation functions
- **Next.js Cache** - Mocked `revalidatePath` and `revalidateTag`

## Coverage

Coverage reports are generated in the `coverage/` directory (git-ignored).

View coverage:
```bash
npm run test:coverage
```

Then open `coverage/index.html` in your browser.

## Best Practices

1. **Test user behavior, not implementation details**
   - Use `screen.getByRole()` instead of class names
   - Test what users see and do

2. **Use async utilities for async operations**
   - Always use `userEvent.setup()` for user interactions
   - Use `waitFor()` for async assertions

3. **Clear mocks between tests**
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks();
   });
   ```

4. **Test error states**
   - Test loading states
   - Test error handling
   - Test edge cases

5. **Keep tests focused**
   - One assertion per test (when possible)
   - Clear test descriptions
   - Group related tests with `describe()`

## Common Testing Patterns

### Testing Loading States
```typescript
it("shows loading state", async () => {
  const promise = new Promise(() => {}); // Never resolves
  mockFn.mockReturnValue(promise);

  render(<Component />);
  // Trigger action
  // Assert loading state
});
```

### Testing Error Handling
```typescript
it("handles errors", async () => {
  mockFn.mockRejectedValue(new Error("Failed"));

  render(<Component />);
  // Trigger action
  // Assert error is displayed
});
```

### Testing Forms
```typescript
it("submits form", async () => {
  const user = userEvent.setup();
  const mockSubmit = vi.fn();

  render(<Form onSubmit={mockSubmit} />);

  await user.type(screen.getByLabelText("Name"), "John");
  await user.click(screen.getByRole("button", { name: /submit/i }));

  expect(mockSubmit).toHaveBeenCalledWith({ name: "John" });
});
```

## Troubleshooting

### "Cannot find module" errors
Make sure path aliases are configured in `vitest.config.ts`:
```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./"),
  },
}
```

### Tests timing out
Increase timeout in `vitest.config.ts`:
```typescript
test: {
  testTimeout: 10000,
}
```

### Mock not working
Ensure mocks are defined before imports:
```typescript
vi.mock("module", () => ({ ... }));
import { something } from "module"; // Import after mock
```
