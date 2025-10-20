# My Finance - Todo Application

A modern, production-ready todo application built with Next.js 15, featuring comprehensive error handling, type-safe validation, and full test coverage.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database](#database)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Development](#development)
- [Deployment](#deployment)

## ✨ Features

### Core Functionality
- ✅ **Create** new todo items
- ✅ **Read** all todos from database
- ✅ **Update** todo text and completion status
- ✅ **Delete** todos with confirmation
- ✅ **Toggle** completion status

### User Experience
- 🎯 **Optimistic UI updates** - Instant feedback with automatic rollback on errors
- 🔄 **Loading states** - Visual feedback during operations
- ⚠️ **Error notifications** - Toast-style error messages with auto-dismiss
- 📝 **Inline editing** - Edit todos directly in the list
- ⌨️ **Keyboard support** - Press Enter to add new todos
- 🎨 **Responsive design** - Works on all screen sizes
- ♿ **Accessible** - Semantic HTML and ARIA attributes

### Developer Features
- 🛡️ **Type-safe** - Full TypeScript coverage
- ✅ **Input validation** - Zod schemas for runtime validation
- 🧪 **Test coverage** - 33 tests across components and actions
- 📊 **Error tracking** - Comprehensive error logging
- 🔍 **Code quality** - ESLint configuration
- 🚀 **Performance** - Server-side rendering with ISR

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15.5.6](https://nextjs.org/)** - React framework with App Router
- **[React 19.1.0](https://react.dev/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS

### Backend & Database
- **[Drizzle ORM 0.44.6](https://orm.drizzle.team/)** - TypeScript-first ORM
- **[Neon Database](https://neon.tech/)** - Serverless PostgreSQL
- **[Zod 4.1.12](https://zod.dev/)** - Runtime validation

### Testing
- **[Vitest 3.2.4](https://vitest.dev/)** - Fast unit testing
- **[Testing Library](https://testing-library.com/)** - React component testing
- **[jsdom](https://github.com/jsdom/jsdom)** - DOM simulation

### Development Tools
- **[Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)** - Database migrations
- **[ESLint 9](https://eslint.org/)** - Code linting
- **[Turbopack](https://turbo.build/pack)** - Fast bundler

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm/yarn/pnpm/bun
- PostgreSQL database (Neon recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-finance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
   ```

4. **Run database migrations**
   ```bash
   npx drizzle-kit push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
my-finance/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with fonts & metadata
│   └── page.tsx                 # Home page (server component)
│
├── components/                   # React components
│   ├── __tests__/               # Component tests
│   │   ├── addTodo.test.tsx    # AddTodo component tests (9)
│   │   └── todo.test.tsx       # Todo component tests (9)
│   ├── addTodo.tsx             # New todo input component
│   ├── todo.tsx                # Individual todo item
│   └── todos.tsx               # Todo list container
│
├── actions/                      # Server Actions (Next.js 13+)
│   ├── __tests__/               # Server action tests
│   │   └── todoAction.test.ts  # Validation tests (15)
│   └── todoAction.ts           # CRUD operations with validation
│
├── db/                          # Database layer
│   ├── schema.ts               # Drizzle ORM table definitions
│   └── drizzle.ts              # Database connection
│
├── drizzle/                     # Database migrations
│   ├── 0000_smooth_bulldozer.sql
│   ├── 0001_ancient_iron_man.sql
│   └── meta/                   # Migration metadata
│
├── types/                       # TypeScript type definitions
│   └── todoType.ts             # Todo data model
│
├── tests/                       # Test configuration
│   ├── setup.ts                # Global test setup & mocks
│   ├── utils.tsx               # Test utilities
│   └── README.md               # Testing guide
│
├── public/                      # Static assets
├── vitest.config.ts            # Vitest configuration
├── drizzle.config.ts           # Drizzle ORM configuration
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
└── tailwind.config.js          # Tailwind CSS configuration
```

## 🗄️ Database

### Schema

**Users Table**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE
);
```

**Todo Table**
```sql
CREATE TABLE todo (
  id INTEGER PRIMARY KEY,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT false NOT NULL
);
```

### Database Commands

```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Push schema changes to database
npx drizzle-kit push

# Open Drizzle Studio (database GUI)
npx drizzle-kit studio
```

## 🛡️ Error Handling

### Architecture

The application implements a comprehensive error handling system:

```typescript
type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### Validation

**Zod Schemas:**
- ✅ Todo text: 1-500 characters, trimmed
- ✅ Todo ID: Positive integer
- ✅ Duplicate ID detection
- ✅ Existence checks before operations

### Error Flow

```
User Action
    ↓
Optimistic UI Update (instant feedback)
    ↓
Zod Validation
    ↓
Database Operation
    ↓
Success? ─── YES → Keep optimistic update
    │
    NO
    ↓
Rollback UI + Show Error Toast (5s auto-dismiss)
```

### Error Types Handled

1. **Validation Errors**
   - Empty text
   - Text too long (>500 chars)
   - Invalid ID (zero, negative, decimal)

2. **Database Errors**
   - Connection failures
   - Duplicate entries
   - Record not found

3. **Network Errors**
   - Timeout errors
   - Connection lost

## 🧪 Testing

### Test Coverage

```
✓ 33 tests across 3 files
  ✓ Server Actions - 15 tests
  ✓ Todo Component - 9 tests
  ✓ AddTodo Component - 9 tests
```

### Running Tests

```bash
# Run tests in watch mode (development)
npm test

# Run all tests once (CI/CD)
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Categories

**Unit Tests:**
- ✅ Input validation
- ✅ Error handling
- ✅ Data transformations

**Component Tests:**
- ✅ User interactions
- ✅ Loading states
- ✅ Error states
- ✅ Accessibility

**Integration Tests:**
- ✅ Server action responses
- ✅ Optimistic updates
- ✅ Rollback behavior

See [tests/README.md](./tests/README.md) for detailed testing guide.

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack

# Production
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint

# Testing
npm test                 # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report

# Database
npx drizzle-kit generate # Generate migrations
npx drizzle-kit push     # Push schema to database
npx drizzle-kit studio   # Open database GUI
```

### Development Workflow

1. **Make changes** to components or server actions
2. **Run tests** to ensure nothing breaks
   ```bash
   npm test
   ```
3. **Check types** and lint
   ```bash
   npm run lint
   ```
4. **Test manually** in the browser
   ```bash
   npm run dev
   ```
5. **Commit changes** with descriptive messages

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended rules
- **Formatting**: Follow existing patterns
- **Testing**: Write tests for new features

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Vercel auto-detects Next.js

3. **Set environment variables**
   - Add `DATABASE_URL` in Vercel dashboard
   - Use Neon's connection string

4. **Deploy**
   - Vercel automatically deploys on push

### Environment Variables

Required for production:

```env
DATABASE_URL="postgresql://..."  # Neon PostgreSQL connection string
```

### Database Setup (Production)

1. Create a Neon database at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Run migrations:
   ```bash
   npx drizzle-kit push
   ```

## 📚 Learn More

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

### Database Resources
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)

### Testing Resources
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database by [Neon](https://neon.tech/)
- ORM by [Drizzle](https://orm.drizzle.team/)
- Validation by [Zod](https://zod.dev/)
- Testing by [Vitest](https://vitest.dev/)

---

**Made with ❤️ using modern web technologies**
