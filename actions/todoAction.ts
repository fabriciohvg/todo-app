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
const todoIdSchema = z.number().int().positive({
  message: "Todo ID must be a positive integer",
});

const todoTextSchema = z
  .string()
  .trim()
  .min(1, { message: "Todo text cannot be empty" })
  .max(500, { message: "Todo text must be less than 500 characters" });

const addTodoSchema = z.object({
  id: todoIdSchema,
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
    console.error("Error fetching todos:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch todos",
    };
  }
};

export const addTodo = async (id: number, text: string): Promise<ActionResponse> => {
  try {
    // Validate input with Zod
    const validation = addTodoSchema.safeParse({ id, text });

    if (!validation.success) {
      const errorMessages = validation.error.issues.map((err) => err.message).join(", ");
      return { success: false, error: errorMessages };
    }

    const { id: validId, text: validText } = validation.data;

    // Check if todo with same ID already exists
    const existing = await db
      .select()
      .from(todo)
      .where(eq(todo.id, validId))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: "Todo with this ID already exists" };
    }

    // Insert todo
    await db.insert(todo).values({
      id: validId,
      text: validText,
    });

    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error adding todo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add todo",
    };
  }
};

export const deleteTodo = async (id: number): Promise<ActionResponse> => {
  try {
    // Validate input with Zod
    const validation = todoIdOnlySchema.safeParse({ id });

    if (!validation.success) {
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
      return { success: false, error: "Todo not found" };
    }

    // Delete todo
    await db.delete(todo).where(eq(todo.id, validId));

    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting todo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete todo",
    };
  }
};

export const toggleTodo = async (id: number): Promise<ActionResponse> => {
  try {
    // Validate input with Zod
    const validation = todoIdOnlySchema.safeParse({ id });

    if (!validation.success) {
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
      return { success: false, error: "Todo not found" };
    }

    // Toggle todo
    await db
      .update(todo)
      .set({ done: not(todo.done) })
      .where(eq(todo.id, validId));

    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error toggling todo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle todo",
    };
  }
};

export const editTodo = async (id: number, text: string): Promise<ActionResponse> => {
  try {
    // Validate input with Zod
    const validation = editTodoSchema.safeParse({ id, text });

    if (!validation.success) {
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
      return { success: false, error: "Todo not found" };
    }

    // Update todo
    await db.update(todo).set({ text: validText }).where(eq(todo.id, validId));

    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error editing todo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to edit todo",
    };
  }
};
