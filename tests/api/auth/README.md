# Authentication API Tests

Comprehensive test suite for the authentication API routes in the Semester Scheduler application.

## Test Coverage

### Sign-In Tests (`sign-in.test.ts`)

**Route:** `/api/auth/sign-in`

Tests cover:

- ✅ Invalid JSON payload handling (400)
- ✅ Invalid email format validation (400)
- ✅ Password minimum length validation (6 characters) (400)
- ✅ Invalid credentials rejection (401)
- ✅ Successful sign-in with valid credentials (200)
- ✅ Default role assignment (student) when no role found
- ✅ Requested role usage when provided
- ✅ User retrieval failure handling (500)
- ✅ User upsert failure handling (400)

**Coverage:** 9 tests

### Sign-Up Tests (`sign-up.test.ts`)

**Route:** `/api/auth/sign-up`

Tests cover:

- ✅ Invalid JSON payload handling (400)
- ✅ Invalid email format validation (400)
- ✅ Password minimum length validation (6 characters) (400)
- ✅ Missing fullName validation (400)
- ✅ fullName minimum length validation (2 characters) (400)
- ✅ fullName maximum length validation (120 characters) (400)
- ✅ Invalid role validation (400)
- ✅ Successful student registration (200)
- ✅ Successful faculty registration (200)
- ✅ Whitespace trimming from fullName
- ✅ Supabase sign-up error handling
- ✅ Origin header fallback to referer header
- ✅ All valid roles support (student, faculty, scheduling_committee, teaching_load_committee, registrar)

**Coverage:** 13 tests

### Sign-Out Tests (`sign-out.test.ts`)

**Route:** `/api/auth/sign-out`

Tests cover:

- ✅ Successful sign-out (200)
- ✅ Sign-out failure handling (400)
- ✅ Network error handling (400)

**Coverage:** 3 tests

### Bootstrap Tests (`bootstrap.test.ts`)

**Route:** `/api/auth/bootstrap`

Tests cover:

- ✅ Unauthenticated user rejection (401)
- ✅ Successful bootstrap with no payload (200)
- ✅ Empty request without content-type header
- ✅ Role from payload usage when provided
- ✅ fullName from payload usage when provided
- ✅ Default role assignment (student) when no role found
- ✅ Role from user_metadata usage when profile is missing
- ✅ Profile role prioritization over metadata role
- ✅ User upsert failure handling (400)
- ✅ All valid role types support

**Coverage:** 10 tests

## Total Test Coverage

- **Total Tests:** 35
- **Test Files:** 4
- **Pass Rate:** 100%

## Running the Tests

### Run all auth tests:

```bash
npm test tests/api/auth
```

### Run specific test file:

```bash
npm test tests/api/auth/sign-in.test.ts
npm test tests/api/auth/sign-up.test.ts
npm test tests/api/auth/sign-out.test.ts
npm test tests/api/auth/bootstrap.test.ts
```

### Run all tests with coverage:

```bash
npm test -- --coverage
```

### Watch mode:

```bash
npm test tests/api/auth -- --watch
```

## Test Structure

All tests follow a consistent structure:

1. **Setup:** Mock Next.js modules and Supabase client
2. **Test Cases:** Each test case focuses on a single scenario
3. **Assertions:** Verify HTTP status codes and response bodies
4. **Mocking:** Comprehensive mocking of Supabase authentication methods

## Mocking Strategy

- **Next.js `cookies()`:** Mocked to return an empty Map
- **Supabase client:** Mocked with custom return values per test
- **`redirectByRole`:** Mocked to return predictable dashboard URLs

## Key Features Tested

### Input Validation

- Email format validation
- Password length requirements
- Full name length constraints
- Role enum validation

### Authentication Flow

- Supabase sign-in/sign-up integration
- Session management
- User profile creation/update
- Role-based redirects

### Error Handling

- Network errors
- Database errors
- Authentication failures
- Invalid input handling

### Edge Cases

- Missing optional fields
- Whitespace trimming
- Header fallback logic
- Role priority resolution

## Dependencies

- **vitest:** Test runner
- **@vitejs/plugin-react:** React support for tests
- **vite-tsconfig-paths:** Path resolution

## Best Practices

1. Each test is isolated with `beforeEach` cleanup
2. Mocks are reset between tests
3. Tests are descriptive and follow AAA pattern (Arrange, Act, Assert)
4. Error messages are validated for specificity
5. All API responses include success/error fields

## Future Enhancements

- Add integration tests with real Supabase test instance
- Add rate limiting tests
- Add CSRF protection tests
- Add session expiry tests
- Add OAuth flow tests
