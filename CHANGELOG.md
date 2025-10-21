# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- UUID-based primary keys for todos (replacing integer IDs)
- Database auto-generation of UUIDs using PostgreSQL's `gen_random_uuid()`
- Optimistic UI updates with server-returned data
- State synchronization between parent and child components
- Force dynamic rendering to prevent stale cached data in production
- Comprehensive error handling with security-focused error messages
- Data preservation in database migrations

### Changed
- **Database Schema**: Migrated `todo.id` from `integer` to `uuid` type
- **Server Actions**: Updated `addTodo()` to return created todo with database-generated UUID
- **Server Actions**: All CRUD operations now use `string` (UUID) instead of `number` for IDs
- **Validation**: Updated Zod schemas to validate UUID format instead of positive integers
- **TypeScript Types**: Changed `todoType.id` from `number` to `string`
- **Error Messages**: Replaced detailed technical errors with user-friendly generic messages
- **Page Rendering**: Added `dynamic = 'force-dynamic'` to home page for real-time data

### Fixed
- **Critical**: Fixed duplicate ID race condition when creating todos rapidly
- **Critical**: Fixed state synchronization bug causing checkbox/strikethrough mismatch after page reload
- **Critical**: Fixed production caching issue preventing fresh data from showing across environments
- **Security**: Fixed error message information disclosure (internal errors no longer exposed to client)
- **Data Loss**: Updated migration to preserve existing todos during UUID migration

### Security
- Validation errors (safe user input issues) are shown to users
- Database/internal errors are logged server-side but return generic messages to clients
- Prevents exposure of database structure, connection details, or internal implementation

---

## Migration Details

### Database Migration: Integer ID → UUID

**Migration File**: `drizzle/0002_flat_plazm.sql`

```sql
-- Preserves existing todos by migrating to UUID
ALTER TABLE "todo" RENAME TO "todo_old";

CREATE TABLE "todo" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "text" text NOT NULL,
  "done" boolean DEFAULT false NOT NULL
);

-- Migrate existing data with new auto-generated UUIDs
INSERT INTO "todo" ("text", "done") SELECT "text", "done" FROM "todo_old";

DROP TABLE "todo_old";
```

**Impact**: Existing todos are preserved but receive new UUID identifiers.

---

## Technical Improvements

### Before → After

| Component | Before | After |
|-----------|--------|-------|
| **ID Generation** | Client-side calculation: `(todoItems.at(-1)?.id \|\| 0) + 1` | Database auto-generation: `gen_random_uuid()` |
| **ID Type** | `number` (integer) | `string` (UUID) |
| **Race Conditions** | ❌ Possible when creating multiple todos | ✅ Impossible - UUIDs are globally unique |
| **Optimistic Updates** | ❌ Removed due to ID generation issues | ✅ Works with server-returned UUID |
| **Error Messages** | ❌ Exposed: `error.message` | ✅ Generic: "Unable to create todo" |
| **State Sync** | ❌ Local state not synced with props | ✅ `useEffect` syncs on prop changes |
| **Production Cache** | ❌ Served stale data | ✅ Always fetches fresh data |

---

## Breaking Changes

### API Changes

**`addTodo` Function Signature**
```typescript
// Before
addTodo(id: number, text: string): Promise<ActionResponse>

// After
addTodo(text: string): Promise<ActionResponse<TodoType>>
```

**All CRUD Functions**
```typescript
// Before
deleteTodo(id: number): Promise<ActionResponse>
toggleTodo(id: number): Promise<ActionResponse>
editTodo(id: number, text: string): Promise<ActionResponse>

// After
deleteTodo(id: string): Promise<ActionResponse>
toggleTodo(id: string): Promise<ActionResponse>
editTodo(id: string, text: string): Promise<ActionResponse>
```

### Type Changes

```typescript
// Before
export type todoType = {
  id: number;
  text: string;
  done: boolean;
};

// After
export type todoType = {
  id: string; // UUID represented as string
  text: string;
  done: boolean;
};
```

---

## Performance Improvements

- Eliminated client-side ID collision checks (no longer needed)
- Reduced server action complexity (no manual ID management)
- Optimistic updates provide instant feedback without waiting for server response

---

## Known Issues

### Test Suite
- Test files need updating to reflect UUID changes (not affecting production code)
- ESLint warnings in test files for unused imports

### Future Improvements
- Update test suite to use UUID-based IDs
- Consider implementing WebSocket for real-time updates across clients
- Add server-side pagination for large todo lists

---

## Development Notes

### Environment-Specific Behavior

**Development (`npm run dev`)**
- No page caching
- Fresh data on every request
- Hot module replacement enabled

**Production (Vercel)**
- Page caching disabled via `dynamic = 'force-dynamic'`
- Fresh data on every request (same as dev)
- Optimized builds with Turbopack

### Database Configuration

Both development and production environments use the same Neon PostgreSQL database:
- Connection via `@neondatabase/serverless`
- WebSocket-based connections
- Shared via `DATABASE_URL` environment variable

---

## Contributors

Generated with assistance from Claude Code

---

## References

- [Next.js 15 Caching Documentation](https://nextjs.org/docs/app/building-your-application/caching)
- [Drizzle ORM PostgreSQL UUID](https://orm.drizzle.team/docs/column-types/pg#uuid)
- [PostgreSQL UUID Functions](https://www.postgresql.org/docs/current/functions-uuid.html)
- [OWASP Error Handling Security](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html)
