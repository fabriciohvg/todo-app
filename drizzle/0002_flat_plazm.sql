-- Preserve existing todos by migrating to UUID
-- Since integer IDs cannot be converted to UUIDs, we'll recreate the table
ALTER TABLE "todo" RENAME TO "todo_old";--> statement-breakpoint

-- Create new todo table with UUID
CREATE TABLE "todo" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "text" text NOT NULL,
  "done" boolean DEFAULT false NOT NULL
);--> statement-breakpoint

-- Migrate existing data with new auto-generated UUIDs
INSERT INTO "todo" ("text", "done") SELECT "text", "done" FROM "todo_old";--> statement-breakpoint

-- Drop old table
DROP TABLE "todo_old";