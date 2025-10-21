import { useState } from "react";
import { todoType } from "@/types/todoType";
import { addTodo, deleteTodo, editTodo, toggleTodo } from "@/actions/todoAction";

/**
 * Custom hook for managing todo list operations with optimistic updates
 *
 * @param initialTodos - Initial array of todos
 * @param onError - Callback function to handle errors
 * @returns Object with todos state and CRUD operations
 *
 * @example
 * ```tsx
 * const { todos, createTodo, changeTodoText, toggleIsTodoDone, deleteTodoItem } =
 *   useTodos(initialTodos, showError);
 *
 * // Create a new todo
 * await createTodo("Buy groceries");
 *
 * // Edit a todo
 * await changeTodoText(todoId, "Buy groceries and cook dinner");
 * ```
 */
export function useTodos(
  initialTodos: todoType[],
  onError: (error: string) => void
) {
  const [todos, setTodos] = useState<todoType[]>(initialTodos);

  /**
   * Create a new todo item
   */
  const createTodo = async (text: string) => {
    const result = await addTodo(text);

    if (result.success) {
      // Optimistic update - immediately add the new todo with real UUID
      setTodos((prev) => [...prev, result.data]);
    } else {
      onError(result.error);
    }
  };

  /**
   * Update the text of an existing todo
   */
  const changeTodoText = async (id: string, text: string) => {
    // Store original state for rollback
    const originalTodos = [...todos];

    // Optimistic update
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, text } : todo))
    );

    // Call server action
    const result = await editTodo(id, text);

    if (!result.success) {
      // Rollback on error
      setTodos(originalTodos);
      onError(result.error);
    }
  };

  /**
   * Toggle the "done" status of a todo
   */
  const toggleIsTodoDone = async (id: string) => {
    // Store original state for rollback
    const originalTodos = [...todos];

    // Optimistic update
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );

    // Call server action
    const result = await toggleTodo(id);

    if (!result.success) {
      // Rollback on error
      setTodos(originalTodos);
      onError(result.error);
    }
  };

  /**
   * Delete a todo item
   */
  const deleteTodoItem = async (id: string) => {
    // Store original state for rollback
    const originalTodos = [...todos];

    // Optimistic update
    setTodos((prev) => prev.filter((todo) => todo.id !== id));

    // Call server action
    const result = await deleteTodo(id);

    if (!result.success) {
      // Rollback on error
      setTodos(originalTodos);
      onError(result.error);
    }
  };

  return {
    todos,
    createTodo,
    changeTodoText,
    toggleIsTodoDone,
    deleteTodoItem,
  };
}
