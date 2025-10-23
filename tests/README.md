# Test Suite Documentation

This document provides an overview of all tests in the Semester Scheduler application.

## Test Structure

```
tests/
├── api/
│   ├── auth/
│   │   ├── sign-in.test.ts (9 tests)
│   │   ├── sign-up.test.ts (13 tests)
│   │   ├── sign-out.test.ts (3 tests)
│   │   ├── bootstrap.test.ts (10 tests)
│   │   └── README.md
│   └── hello.test.ts (1 test)
├── example.test.tsx
├── utils/
│   └── mock-types.ts
└── validation-examples.txt
```

## Test Coverage Summary

### API Tests

#### Authentication (`/api/auth/*`)

- **Total Tests:** 35
- **Pass Rate:** 100%
- **Coverage:** All auth endpoints
- **Documentation:** See [tests/api/auth/README.md](./api/auth/README.md)

#### Hello Endpoint (`/api/hello`)

- **Total Tests:** 1
- **Pass Rate:** 100%
- **Coverage:** Basic API response

### Overall Statistics

- **Total Test Files:** 5
- **Total Tests:** 36
- **Pass Rate:** 100%
- **Test Framework:** Vitest
- **Environment:** jsdom

## Running Tests

### Run all tests:

```bash
npm test
```

### Run specific test suite:

```bash
npm test tests/api/auth        # Auth tests only
npm test tests/api/hello       # Hello endpoint only
```

### Run with coverage:

```bash
npm test -- --coverage
```

### Run in watch mode:

```bash
npm test -- --watch
```

### Run specific test file:

```bash
npm test tests/api/auth/sign-in.test.ts
```

## Test Configuration

Tests are configured via:

- **vitest.config.ts** - Main Vitest configuration
- **vitest.setup.ts** - Global test setup
- **tsconfig.json** - TypeScript configuration

Key settings:

- Environment: `jsdom` (for React components)
- Globals: `true` (for describe, it, expect)
- Path resolution: Via `vite-tsconfig-paths`

## Writing New Tests

### Test File Naming

- Place tests in `tests/` directory
- Use `.test.ts` or `.test.tsx` suffix
- Mirror the structure of `src/` where applicable

### Example Test Structure

```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(new Map())),
}));

describe("API /api/example", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle valid request", async () => {
    const request = new Request("http://localhost:3000/api/example", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: "test" }),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("should handle invalid request", async () => {
    // Test error cases...
  });
});
```

### Best Practices

1. **Isolation:** Each test should be independent
2. **Cleanup:** Use `beforeEach` to reset mocks
3. **Descriptive:** Use clear test descriptions
4. **Coverage:** Test success paths, error paths, and edge cases
5. **Type Safety:** Use TypeScript types, avoid `any`
6. **Mocking:** Mock external dependencies (Supabase, Next.js)

## Continuous Integration

Tests run automatically on:

- Pull requests
- Main branch commits
- Pre-deployment

CI configuration is in `.github/workflows/` (if configured).

## Test Utilities

### Mock Types (`tests/utils/mock-types.ts`)

Provides type definitions for mocked services:

- `MockSupabaseClient` - Partial Supabase client type

### Common Mocks

#### Next.js Headers

```typescript
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(new Map())),
}));
```

#### Supabase Client

```typescript
vi.mock("@/utils/supabase/server");

const mockSupabase = {
  auth: {
    signIn: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn(),
};

vi.mocked(createServerClient).mockReturnValue(
  mockSupabase as unknown as ReturnType<typeof createServerClient>
);
```

## Debugging Tests

### Run with verbose output:

```bash
npm test -- --reporter=verbose
```

### Run single test:

```bash
npm test -- -t "should handle valid request"
```

### Debug in VS Code:

Add breakpoints and use VS Code's Jest/Vitest runner extension.

## Future Testing Goals

- [ ] Add component tests (React Testing Library)
- [ ] Add E2E tests (Playwright)
- [ ] Increase code coverage to 80%+
- [ ] Add performance tests
- [ ] Add accessibility tests
- [ ] Add visual regression tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Next.js Testing Docs](https://nextjs.org/docs/app/building-your-application/testing)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)

## Maintenance

Tests should be updated when:

- API routes change
- New features are added
- Bugs are fixed (add regression tests)
- Dependencies are updated

Keep test documentation in sync with code changes.
