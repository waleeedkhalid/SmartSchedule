## MODIFIED Requirements — Testing & TDD with Vitest

### Requirement: Component and API Testing with Vitest

Use Vitest as the unified testing framework for App Router, supporting React component tests (client/server) and API route handlers.

#### Scenario: Component test renders heading

- Given a component under `src/app/**` that renders a heading
- When the component is rendered via React Testing Library in Vitest
- Then the heading is found with `getByRole` and the assertion passes

#### Scenario: API route handler returns JSON

- Given a route handler under `src/app/api/**/route.ts`
- When a `GET` request is simulated in Vitest
- Then the response JSON contains the expected payload and status 200

### Requirement: Tooling and DX

Configure `vitest.config.ts` with `jsdom`, `globals`, tsconfig paths alias, and `.env.local` loading. Provide npm scripts:

- `test`: run vitest
- `test:watch`: watch mode
- `test:ci`: CI-friendly once-off run

#### Scenario: `@/` alias resolves in tests

- Given imports using `@/...`
- When running tests
- Then the modules resolve without path errors

#### Scenario: `.env.local` values available

- Given variables in `.env.local`
- When running tests
- Then `process.env.MY_VAR` is defined in test code
