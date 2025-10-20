import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddTodo from "../addTodo";

describe("AddTodo Component", () => {
  const mockCreateTodo = vi.fn();

  beforeEach(() => {
    mockCreateTodo.mockClear();
  });

  it("renders input and button", () => {
    render(<AddTodo createTodo={mockCreateTodo} />);

    expect(screen.getByPlaceholderText("Enter a new todo...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
  });

  it("updates input value when typing", async () => {
    const user = userEvent.setup();
    render(<AddTodo createTodo={mockCreateTodo} />);

    const input = screen.getByPlaceholderText("Enter a new todo...");
    await user.type(input, "New todo item");

    expect(input).toHaveValue("New todo item");
  });

  it("calls createTodo when Add button is clicked", async () => {
    const user = userEvent.setup();
    mockCreateTodo.mockResolvedValue(undefined);

    render(<AddTodo createTodo={mockCreateTodo} />);

    const input = screen.getByPlaceholderText("Enter a new todo...");
    const button = screen.getByRole("button", { name: /add/i });

    await user.type(input, "New todo item");
    await user.click(button);

    await waitFor(() => {
      expect(mockCreateTodo).toHaveBeenCalledWith("New todo item");
    });
  });

  it("clears input after successful add", async () => {
    const user = userEvent.setup();
    mockCreateTodo.mockResolvedValue(undefined);

    render(<AddTodo createTodo={mockCreateTodo} />);

    const input = screen.getByPlaceholderText("Enter a new todo...");
    await user.type(input, "New todo item");
    await user.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  it("does not call createTodo with empty input", async () => {
    const user = userEvent.setup();
    render(<AddTodo createTodo={mockCreateTodo} />);

    const button = screen.getByRole("button", { name: /add/i });
    await user.click(button);

    expect(mockCreateTodo).not.toHaveBeenCalled();
  });

  it("disables button when input is empty", () => {
    render(<AddTodo createTodo={mockCreateTodo} />);

    const button = screen.getByRole("button", { name: /add/i });
    expect(button).toBeDisabled();
  });

  it("calls createTodo when Enter key is pressed", async () => {
    const user = userEvent.setup();
    mockCreateTodo.mockResolvedValue(undefined);

    render(<AddTodo createTodo={mockCreateTodo} />);

    const input = screen.getByPlaceholderText("Enter a new todo...");
    await user.type(input, "New todo item{Enter}");

    await waitFor(() => {
      expect(mockCreateTodo).toHaveBeenCalledWith("New todo item");
    });
  });

  it("shows loading state during add operation", async () => {
    const user = userEvent.setup();
    let resolvePromise: () => void;
    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockCreateTodo.mockReturnValue(promise);

    render(<AddTodo createTodo={mockCreateTodo} />);

    const input = screen.getByPlaceholderText("Enter a new todo...");
    await user.type(input, "New todo item");
    await user.click(screen.getByRole("button", { name: /add/i }));

    // Should show loading state
    expect(screen.getByRole("button", { name: /\.\.\./i })).toBeInTheDocument();
    expect(input).toBeDisabled();

    // Resolve promise
    resolvePromise!();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    });
  });

  it("keeps input value on error", async () => {
    const user = userEvent.setup();
    mockCreateTodo.mockRejectedValue(new Error("Failed to add"));

    render(<AddTodo createTodo={mockCreateTodo} />);

    const input = screen.getByPlaceholderText("Enter a new todo...");
    await user.type(input, "New todo item");
    await user.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => {
      expect(input).toHaveValue("New todo item");
    });
  });
});
