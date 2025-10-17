## Tasks

1. Install dev dependencies: vitest, @vitejs/plugin-react, jsdom, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, vite-tsconfig-paths
2. Add `vitest.config.ts` with jsdom environment, globals, tsconfig paths, and `.env.local` loading
3. Add `vitest.setup.ts` importing `@testing-library/jest-dom/vitest`
4. Create example component test at `tests/example.test.tsx`
5. Create example API route and test at `src/app/api/hello/route.ts` and `tests/api/hello.test.ts`
6. Update `package.json` scripts: `test`, `test:watch`, `test:ci`
7. Run tests locally to confirm pass in watch and CI modes
8. Document TDD workflow in `openspec/specs/testing/spec.md`

Validation:

- `npm run test` passes all example tests
- `npm run test:ci` runs once and exits with success
- Aliases using `@/` resolve in tests
- Env vars from `.env.local` are accessible in tests
