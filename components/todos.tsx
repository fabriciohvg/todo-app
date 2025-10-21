"use client";
import React from "react";
import { FC, useState } from "react";
import { todoType } from "@/types/todoType";
import Todo from "./todo";
import AddTodo from "./addTodo";
import {
  addTodo,
  deleteTodo,
  editTodo,
  toggleTodo,
} from "@/actions/todoAction";

interface Props {
  todos: todoType[];
}

const Todos: FC<Props> = ({ todos }) => {
  // State to manage the list of todo items
  const [todoItems, setTodoItems] = useState<todoType[]>(todos);

  // State to manage error messages
  const [error, setError] = useState<string | null>(null);

  // Function to show error message temporarily
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
  };

  // Function to create a new todo item
  const createTodo = async (text: string) => {
    // Call server action to get the database-generated UUID
    const result = await addTodo(text);

    if (result.success) {
      // Optimistic update - immediately add the new todo with real UUID
      setTodoItems((prev) => [...prev, result.data]);
    } else {
      showError(result.error);
    }
  };

  // Function to change the text of a todo item
  const changeTodoText = async (id: string, text: string) => {
    // Store original state for rollback
    const originalTodos = [...todoItems];

    // Optimistic update
    setTodoItems((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, text } : todo))
    );

    // Call server action
    const result = await editTodo(id, text);

    if (!result.success) {
      // Rollback on error
      setTodoItems(originalTodos);
      showError(result.error);
    }
  };

  // Function to toggle the "done" status of a todo item
  const toggleIsTodoDone = async (id: string) => {
    // Store original state for rollback
    const originalTodos = [...todoItems];

    // Optimistic update
    setTodoItems((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );

    // Call server action
    const result = await toggleTodo(id);

    if (!result.success) {
      // Rollback on error
      setTodoItems(originalTodos);
      showError(result.error);
    }
  };

  // Function to delete a todo item
  const deleteTodoItem = async (id: string) => {
    // Store original state for rollback
    const originalTodos = [...todoItems];

    // Optimistic update
    setTodoItems((prev) => prev.filter((todo) => todo.id !== id));

    // Call server action
    const result = await deleteTodo(id);

    if (!result.success) {
      // Rollback on error
      setTodoItems(originalTodos);
      showError(result.error);
    }
  };

  // Rendering the Todo List component
  return (
    <main className="flex mx-auto max-w-xl w-full min-h-screen flex-col items-center p-16">
      <div className="text-5xl font-medium">To-do app</div>

      {/* Error Toast Notification */}
      {error && (
        <div className="w-full mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-4 text-red-700 hover:text-red-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <div className="w-full flex flex-col mt-8 gap-2">
        {/* Mapping through todoItems and rendering Todo component for each */}
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
      {/* Adding Todo component for creating new todos */}
      <AddTodo createTodo={createTodo} />
    </main>
  );
};

export default Todos;
