"use server";

import { eq, not } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { todo } from "@/db/schema";
import { z } from "zod";

// Type definitions for action responses
type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// Zod validation schemas
const todoIdSchema = z.string().uuid({
  message: "Todo ID must be a valid UUID",
});

const todoTextSchema = z
  .string()
  .trim()
  .min(1, { message: "Todo text cannot be empty" })
  .max(500, { message: "Todo text must be less than 500 characters" });

const addTodoSchema = z.object({
  text: todoTextSchema,
});

const editTodoSchema = z.object({
  id: todoIdSchema,
  text: todoTextSchema,
});

const todoIdOnlySchema = z.object({
  id: todoIdSchema,
});

// CRUD Operations with comprehensive error handling

export const getData = async (): Promise<ActionResponse<typeof todo.$inferSelect[]>> => {
  try {
    const data = await db.select().from(todo);
    return { success: true, data };
  } catch (error) {
    // Log full error details server-side for debugging
    console.error("Error fetching todos:", error);

    // Return generic error message to client (don't expose internal details)
    return {
      success: false,
      error: "Unable to load todos. Please try again later.",
    };
  }
};

export const addTodo = async (text: string): Promise<ActionResponse<typeof todo.$inferSelect>> => {
  try {
    // Validate input with Zod
    const validation = addTodoSchema.safeParse({ text });

    if (!validation.success) {
      // Validation errors are safe to show (user input issues)
      const errorMessages = validation.error.issues.map((err) => err.message).join(", ");
      return { success: false, error: errorMessages };
    }

    const { text: validText } = validation.data;

    // Insert todo and return the created record with auto-generated UUID
    const [newTodo] = await db.insert(todo).values({
      text: validText,
    }).returning();

    revalidatePath("/");
    return { success: true, data: newTodo };
  } catch (error) {
    // Log full error details server-side for debugging
    console.error("Error adding todo:", error);

    // Return generic error message to client (don't expose database/internal details)
    return {
      success: false,
      error: "Unable to create todo. Please try again.",
    };
  }
};

export const deleteTodo = async (id: string): Promise<ActionResponse> => {
  try {
    // Validate input with Zod
    const validation = todoIdOnlySchema.safeParse({ id });

    if (!validation.success) {
      // Validation errors are safe to show
      const errorMessages = validation.error.issues.map((err) => err.message).join(", ");
      return { success: false, error: errorMessages };
    }

    const { id: validId } = validation.data;

    // Check if todo exists
    const existing = await db
      .select()
      .from(todo)
      .where(eq(todo.id, validId))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Todo not found." };
    }

    // Delete todo
    await db.delete(todo).where(eq(todo.id, validId));

    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (error) {
    // Log full error details server-side for debugging
    console.error("Error deleting todo:", error);

    // Return generic error message to client
    return {
      success: false,
      error: "Unable to delete todo. Please try again.",
    };
  }
};

export const toggleTodo = async (id: string): Promise<ActionResponse> => {
  try {
    // Validate input with Zod
    const validation = todoIdOnlySchema.safeParse({ id });

    if (!validation.success) {
      // Validation errors are safe to show
      const errorMessages = validation.error.issues.map((err) => err.message).join(", ");
      return { success: false, error: errorMessages };
    }

    const { id: validId } = validation.data;

    // Check if todo exists
    const existing = await db
      .select()
      .from(todo)
      .where(eq(todo.id, validId))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Todo not found." };
    }

    // Toggle todo
    await db
      .update(todo)
      .set({ done: not(todo.done) })
      .where(eq(todo.id, validId));

    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (error) {
    // Log full error details server-side for debugging
    console.error("Error toggling todo:", error);

    // Return generic error message to client
    return {
      success: false,
      error: "Unable to update todo. Please try again.",
    };
  }
};

export const editTodo = async (id: string, text: string): Promise<ActionResponse> => {
  try {
    // Validate input with Zod
    const validation = editTodoSchema.safeParse({ id, text });

    if (!validation.success) {
      // Validation errors are safe to show
      const errorMessages = validation.error.issues.map((err) => err.message).join(", ");
      return { success: false, error: errorMessages };
    }

    const { id: validId, text: validText } = validation.data;

    // Check if todo exists
    const existing = await db
      .select()
      .from(todo)
      .where(eq(todo.id, validId))
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Todo not found." };
    }

    // Update todo
    await db.update(todo).set({ text: validText }).where(eq(todo.id, validId));

    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (error) {
    // Log full error details server-side for debugging
    console.error("Error editing todo:", error);

    // Return generic error message to client
    return {
      success: false,
      error: "Unable to update todo. Please try again.",
    };
  }
};
