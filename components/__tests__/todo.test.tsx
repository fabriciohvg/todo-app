import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Todo from "../todo";
import { createMockTodo } from "../../tests/utils";

describe("Todo Component", () => {
  const mockChangeTodoText = vi.fn();
  const mockToggleIsTodoDone = vi.fn();
  const mockDeleteTodoItem = vi.fn();

  beforeEach(() => {
    mockChangeTodoText.mockClear().mockResolvedValue(undefined);
    mockToggleIsTodoDone.mockClear().mockResolvedValue(undefined);
    mockDeleteTodoItem.mockClear().mockResolvedValue(undefined);
  });

  it("renders todo item with text", () => {
    const todo = createMockTodo({ text: "Test todo item" });
    render(
      <Todo
        todo={todo}
        changeTodoText={mockChangeTodoText}
        toggleIsTodoDone={mockToggleIsTodoDone}
        deleteTodoItem={mockDeleteTodoItem}
      />
    );

    expect(screen.getByDisplayValue("Test todo item")).toBeInTheDocument();
  });

  it("renders checkbox with correct checked state", () => {
    const todo = createMockTodo({ done: true });
    render(
      <Todo
        todo={todo}
        changeTodoText={mockChangeTodoText}
        toggleIsTodoDone={mockToggleIsTodoDone}
        deleteTodoItem={mockDeleteTodoItem}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("calls toggleIsTodoDone when checkbox is clicked", async () => {
    const user = userEvent.setup();
    const todo = createMockTodo({ id: 1 });
    render(
      <Todo
        todo={todo}
        changeTodoText={mockChangeTodoText}
        toggleIsTodoDone={mockToggleIsTodoDone}
        deleteTodoItem={mockDeleteTodoItem}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    await waitFor(() => {
      expect(mockToggleIsTodoDone).toHaveBeenCalledWith(1);
    });
  });

  it("enables edit mode when Edit button is clicked", async () => {
    const user = userEvent.setup();
    const todo = createMockTodo();
    render(
      <Todo
        todo={todo}
        changeTodoText={mockChangeTodoText}
        toggleIsTodoDone={mockToggleIsTodoDone}
        deleteTodoItem={mockDeleteTodoItem}
      />
    );

    await user.click(screen.getByRole("button", { name: /edit/i }));

    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("calls changeTodoText when Save button is clicked", async () => {
    const user = userEvent.setup();
    const todo = createMockTodo({ id: 1, text: "Original text" });
    render(
      <Todo
        todo={todo}
        changeTodoText={mockChangeTodoText}
        toggleIsTodoDone={mockToggleIsTodoDone}
        deleteTodoItem={mockDeleteTodoItem}
      />
    );

    // Enter edit mode
    await user.click(screen.getByRole("button", { name: /edit/i }));

    // Change text
    const input = screen.getByDisplayValue("Original text");
    await user.clear(input);
    await user.type(input, "Updated text");

    // Save
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockChangeTodoText).toHaveBeenCalledWith(1, "Updated text");
    });
  });

  it("cancels edit and restores original text when Close is clicked", async () => {
    const user = userEvent.setup();
    const todo = createMockTodo({ text: "Original text" });
    render(
      <Todo
        todo={todo}
        changeTodoText={mockChangeTodoText}
        toggleIsTodoDone={mockToggleIsTodoDone}
        deleteTodoItem={mockDeleteTodoItem}
      />
    );

    // Enter edit mode
    await user.click(screen.getByRole("button", { name: /edit/i }));

    // Change text
    const input = screen.getByDisplayValue("Original text");
    await user.clear(input);
    await user.type(input, "Changed text");

    // Cancel
    await user.click(screen.getByRole("button", { name: /close/i }));

    // Text should be restored
    expect(screen.getByDisplayValue("Original text")).toBeInTheDocument();
  });

  it("shows confirmation before deleting", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const todo = createMockTodo({ id: 1 });

    render(
      <Todo
        todo={todo}
        changeTodoText={mockChangeTodoText}
        toggleIsTodoDone={mockToggleIsTodoDone}
        deleteTodoItem={mockDeleteTodoItem}
      />
    );

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(confirmSpy).toHaveBeenCalledWith(
      "Are you sure you want to delete this todo?"
    );

    await waitFor(() => {
      expect(mockDeleteTodoItem).toHaveBeenCalledWith(1);
    });

    confirmSpy.mockRestore();
  });

  it("does not delete if confirmation is cancelled", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    const todo = createMockTodo();

    render(
      <Todo
        todo={todo}
        changeTodoText={mockChangeTodoText}
        toggleIsTodoDone={mockToggleIsTodoDone}
        deleteTodoItem={mockDeleteTodoItem}
      />
    );

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(mockDeleteTodoItem).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it("disables Save button when text is empty", async () => {
    const user = userEvent.setup();
    const todo = createMockTodo({ text: "Original text" });
    render(
      <Todo
        todo={todo}
        changeTodoText={mockChangeTodoText}
        toggleIsTodoDone={mockToggleIsTodoDone}
        deleteTodoItem={mockDeleteTodoItem}
      />
    );

    // Enter edit mode
    await user.click(screen.getByRole("button", { name: /edit/i }));

    // Clear text
    const input = screen.getByDisplayValue("Original text");
    await user.clear(input);

    // Save button should be disabled
    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeDisabled();
  });
});
