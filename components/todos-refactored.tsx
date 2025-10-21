"use client";
import React, { FC } from "react";
import { todoType } from "@/types/todoType";
import Todo from "./todo";
import AddTodo from "./addTodo";
import { useError, useTodos } from "@/hooks";

interface Props {
  todos: todoType[];
}

/**
 * Refactored Todos component using custom hooks
 *
 * BEFORE: 140 lines with mixed concerns (UI + state management)
 * AFTER: ~50 lines, focused only on UI rendering
 */
const TodosRefactored: FC<Props> = ({ todos }) => {
  // Custom hook for error handling
  const { error, showError, clearError } = useError();

  // Custom hook for todo operations
  const {
    todos: todoItems,
    createTodo,
    changeTodoText,
    toggleIsTodoDone,
    deleteTodoItem,
  } = useTodos(todos, showError);

  return (
    <main className="flex mx-auto max-w-xl w-full min-h-screen flex-col items-center p-16">
      <div className="text-5xl font-medium">To-do app</div>

      {/* Error Toast Notification */}
      {error && (
        <div className="w-full mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="ml-4 text-red-700 hover:text-red-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <div className="w-full flex flex-col mt-8 gap-2">
        {todoItems.map((todo) => (
          <Todo
            key={todo.id}
            todo={todo}
            changeTodoText={changeTodoText}
            toggleIsTodoDone={toggleIsTodoDone}
            deleteTodoItem={deleteTodoItem}
          />
        ))}
      </div>

      <AddTodo createTodo={createTodo} />
    </main>
  );
};

export default TodosRefactored;
