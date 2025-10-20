"use client";
import { ChangeEvent, FC, useState } from "react";

interface Props {
  createTodo: (value: string) => Promise<void>;
}

const AddTodo: FC<Props> = ({ createTodo }) => {
  // State for handling input value
  const [input, setInput] = useState("");

  // State for handling loading state
  const [isLoading, setIsLoading] = useState(false);

  // Event handler for input change
  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Event handler for adding a new todo
  const handleAdd = async () => {
    if (isLoading || !input.trim()) return;

    setIsLoading(true);

    try {
      await createTodo(input);
      setInput(""); // Clear input only on success
    } catch (error) {
      console.error("Failed to add todo:", error);
      // Keep input value on error so user can retry
    } finally {
      setIsLoading(false);
    }
  };

  // Event handler for Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading && input.trim()) {
      handleAdd();
    }
  };

  // Rendering the AddTodo component
  return (
    <div className="w-full flex gap-1 mt-2">
      {/* Input field for entering new todo text */}
      <input
        type="text"
        className="w-full px-2 py-1 border border-gray-200 rounded outline-none disabled:opacity-50"
        onChange={handleInput}
        onKeyPress={handleKeyPress}
        value={input}
        disabled={isLoading}
        placeholder="Enter a new todo..."
      />
      {/* Button for adding a new todo */}
      <button
        className="flex items-center justify-center bg-green-600 text-green-50 rounded px-2 h-9 w-14 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleAdd}
        disabled={isLoading || !input.trim()}
      >
        {isLoading ? "..." : "Add"}
      </button>
    </div>
  );
};

export default AddTodo;
