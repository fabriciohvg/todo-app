import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";

/**
 * Custom render function for testing React components
 * Wraps components with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { ...options });
}

/**
 * Mock server action response helper
 */
export function mockActionResponse<T>(
  success: boolean,
  data?: T,
  error?: string
) {
  if (success && data !== undefined) {
    return { success: true, data };
  }
  return { success: false, error: error || "Mock error" };
}

/**
 * Create mock todo item
 */
export function createMockTodo(overrides = {}) {
  return {
    id: 1,
    text: "Test todo",
    done: false,
    ...overrides,
  };
}
