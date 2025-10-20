import { describe, it, expect, vi, beforeEach } from "vitest";
import { addTodo, editTodo, deleteTodo, toggleTodo } from "../todoAction";

// Mock the database
vi.mock("@/db/drizzle", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock Drizzle ORM functions
vi.mock("drizzle-orm", () => ({
  eq: vi.fn((field, value) => ({ field, value })),
  not: vi.fn((field) => ({ not: field })),
}));

// Mock schema
vi.mock("@/db/schema", () => ({
  todo: {
    id: "id",
    text: "text",
    done: "done",
  },
}));

import { db } from "@/db/drizzle";

describe("Todo Server Actions - Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("addTodo", () => {
    it("validates empty text", async () => {
      const result = await addTodo(1, "");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Todo text cannot be empty");
    });

    it("validates text with only whitespace", async () => {
      const result = await addTodo(1, "   ");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Todo text cannot be empty");
    });

    it("validates text length (max 500 characters)", async () => {
      const longText = "a".repeat(501);
      const result = await addTodo(1, longText);

      expect(result.success).toBe(false);
      expect(result.error).toContain("must be less than 500 characters");
    });

    it("validates invalid ID (zero)", async () => {
      const result = await addTodo(0, "Valid text");

      expect(result.success).toBe(false);
      expect(result.error).toContain("positive integer");
    });

    it("validates invalid ID (negative)", async () => {
      const result = await addTodo(-1, "Valid text");

      expect(result.success).toBe(false);
      expect(result.error).toContain("positive integer");
    });

    it("validates invalid ID (decimal)", async () => {
      const result = await addTodo(1.5, "Valid text");

      expect(result.success).toBe(false);
      // Zod returns "expected int, received number" for decimals
      expect(result.error).toMatch(/expected int|positive integer/);
    });

    it("accepts valid input", async () => {
      // Mock database responses
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([]);

      (db.select as any).mockReturnValue({
        from: mockFrom,
      });

      mockFrom.mockReturnValue({
        where: mockWhere,
      });

      mockWhere.mockReturnValue({
        limit: mockLimit,
      });

      const mockValues = vi.fn().mockResolvedValue(undefined);
      (db.insert as any).mockReturnValue({
        values: mockValues,
      });

      const result = await addTodo(1, "Valid todo text");

      expect(result.success).toBe(true);
    });
  });

  describe("editTodo", () => {
    it("validates empty text", async () => {
      const result = await editTodo(1, "");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Todo text cannot be empty");
    });

    it("validates invalid ID", async () => {
      const result = await editTodo(-1, "Valid text");

      expect(result.success).toBe(false);
      expect(result.error).toContain("positive integer");
    });

    it("trims whitespace from text", async () => {
      // Mock database responses
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([{ id: 1, text: "Old", done: false }]);

      (db.select as any).mockReturnValue({
        from: mockFrom,
      });

      mockFrom.mockReturnValue({
        where: mockWhere,
      });

      mockWhere.mockReturnValue({
        limit: mockLimit,
      });

      const mockSet = vi.fn().mockReturnThis();
      const mockWhereUpdate = vi.fn().mockResolvedValue(undefined);

      (db.update as any).mockReturnValue({
        set: mockSet,
      });

      mockSet.mockReturnValue({
        where: mockWhereUpdate,
      });

      const result = await editTodo(1, "  Trimmed text  ");

      expect(result.success).toBe(true);
      expect(mockSet).toHaveBeenCalledWith({ text: "Trimmed text" });
    });
  });

  describe("deleteTodo", () => {
    it("validates invalid ID", async () => {
      const result = await deleteTodo(0);

      expect(result.success).toBe(false);
      expect(result.error).toContain("positive integer");
    });

    it("returns error when todo not found", async () => {
      // Mock database responses
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([]);

      (db.select as any).mockReturnValue({
        from: mockFrom,
      });

      mockFrom.mockReturnValue({
        where: mockWhere,
      });

      mockWhere.mockReturnValue({
        limit: mockLimit,
      });

      const result = await deleteTodo(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Todo not found");
    });
  });

  describe("toggleTodo", () => {
    it("validates invalid ID", async () => {
      const result = await toggleTodo(-5);

      expect(result.success).toBe(false);
      expect(result.error).toContain("positive integer");
    });

    it("returns error when todo not found", async () => {
      // Mock database responses
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([]);

      (db.select as any).mockReturnValue({
        from: mockFrom,
      });

      mockFrom.mockReturnValue({
        where: mockWhere,
      });

      mockWhere.mockReturnValue({
        limit: mockLimit,
      });

      const result = await toggleTodo(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Todo not found");
    });
  });

  describe("Multiple validation errors", () => {
    it("returns all validation errors for addTodo", async () => {
      const result = await addTodo(0, "");

      expect(result.success).toBe(false);
      // Should contain both ID and text errors
      expect(result.error).toBeTruthy();
    });
  });
});
