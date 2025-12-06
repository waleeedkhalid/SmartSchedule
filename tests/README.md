# SmartSchedule Test Suite

Comprehensive test coverage for the SmartSchedule platform, including unit tests, integration tests, and API endpoint tests.

## Test Structure

```
tests/
├── setup.ts                          # Global test configuration
├── helpers/
│   └── test-utils.ts               # Reusable test utilities and mocks
├── lib/
│   ├── api/
│   │   ├── error-handler.test.ts    # Error handling tests
│   │   ├── auth-utils.test.ts       # Authentication utilities tests
│   │   └── endpoints.test.ts        # API endpoint configuration tests
│   └── utils/
│       └── api-cache.test.ts        # Client-side caching tests
├── api/
│   └── requests-responses.test.ts   # API request/response tests
└── integration/
    ├── enrollment.test.ts            # Student enrollment workflows
    ├── schedule-generation.test.ts   # Schedule generation algorithm
    ├── timeline.test.ts              # Timeline and deadline features
    ├── rbac.test.ts                  # Role-based access control
    └── database.test.ts              # Database integration tests
```

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode (re-run on file changes)

```bash
npm run test:watch
```

### Run tests with coverage report

```bash
npm run test:coverage
```

### Run specific test file

```bash
npm test -- error-handler.test.ts
```

### Run tests matching pattern

```bash
npm test -- --testNamePattern="should validate"
```

## Test Categories

### Unit Tests (`lib/api/`, `lib/utils/`)

- **Error Handler** - Centralized error handling and response formatting
- **Auth Utils** - Authentication middleware and role validation
- **API Cache** - Client-side caching implementation
- **API Endpoints** - Endpoint configuration validation

### API Tests (`api/`)

- **Requests/Responses** - Request validation and response formatting
- **CORS and Security** - Security header validation
- **Error Handling** - HTTP error codes and messages

### Integration Tests (`integration/`)

- **Enrollment** - Student registration workflows and constraints
- **Schedule Generation** - Course scheduling algorithm
- **Timeline** - Academic timeline and deadline management
- **RBAC** - Role-based access control across all roles
- **Database** - Database operations and integrity

## Test Utilities

### createMockNextRequest()

Creates a mock NextRequest for testing route handlers.

```typescript
const request = createMockNextRequest("POST", {
  body: { email: "test@example.com" },
  headers: { authorization: "Bearer token" },
});
```

### createMockUser()

Creates a mock user object with optional overrides.

```typescript
const user = createMockUser({ role: "scheduling" });
```

### getResponseData()

Parses response body from NextResponse.

```typescript
const response = await handler(request);
const data = await getResponseData(response);
```

## Coverage Goals

- **Line Coverage**: 80%+
- **Branch Coverage**: 75%+
- **Function Coverage**: 80%+
- **Statement Coverage**: 80%+

Current coverage can be checked with:

```bash
npm run test:coverage
```

## Key Test Scenarios

### Authentication & Authorization

- ✓ Token validation and JWT verification
- ✓ Role-based access control
- ✓ Permission checking across all endpoints
- ⏳ Multi-factor authentication (future)

### Enrollment Management

- ✓ Duplicate enrollment prevention
- ✓ Course conflict detection
- ✓ Prerequisite validation
- ✓ Capacity checking
- ✓ Drop deadline enforcement

### Schedule Generation

- ✓ Room conflict prevention
- ✓ Instructor availability
- ✓ Student load distribution
- ✓ Exam scheduling
- ✓ Constraint satisfaction

### Data Consistency

- ✓ Transaction safety
- ✓ Referential integrity
- ✓ Cascade operations
- ✓ Concurrent update handling

### API Quality

- ✓ Request validation
- ✓ Response formatting consistency
- ✓ Error code standardization
- ✓ Pagination support

## Writing New Tests

1. **Create test file** in appropriate directory:

   ```typescript
   tests / [category] / [feature].test.ts;
   ```

2. **Import test utilities**:

   ```typescript
   import {
     createMockNextRequest,
     createMockUser,
   } from "../helpers/test-utils";
   ```

3. **Write test suite**:

   ```typescript
   describe("Feature Name", () => {
     it("should do something", () => {
       expect(value).toBe(expected);
     });
   });
   ```

4. **Run tests to verify**:
   ```bash
   npm test
   ```

## Mock Strategy

- **API Requests**: Use `createMockNextRequest()` helper
- **Database**: Mock Supabase client with `jest.mock()`
- **External Services**: Mock `fetch()` globally
- **Authentication**: Mock JWT tokens and user sessions

## Continuous Integration

Tests are configured to run:

- On pull requests
- Before merging to main branch
- As part of the build process

See `.github/workflows/test.yml` for CI configuration.

## Debugging Tests

### Run test with debug output

```bash
DEBUG=* npm test
```

### Stop on first failure

```bash
npm test -- --bail
```

### Verbose output

```bash
npm test -- --verbose
```

### Debug specific test

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Performance Considerations

- Tests should complete in < 5 seconds for full suite
- Mocking is used to avoid database calls
- Parallel test execution is enabled by default
- Use `--runInBand` to run sequentially if needed

## Future Test Improvements

- [ ] E2E tests with Cypress/Playwright
- [ ] Performance benchmarking tests
- [ ] Load testing for concurrent operations
- [ ] Visual regression testing
- [ ] Accessibility testing
