<!-- OPENSPEC:START -->

# Change Proposal: setup-vitest-testing

## Summary

Introduce Vitest as the unified testing framework for the Next.js 15 App Router project, enabling unit/component tests for client and server components and API route handler tests.

## Motivation

Provide a fast, modern, and unified testing workflow aligned with official Next.js Vitest guidance, improving developer velocity and confidence via TDD.

## Scope

- Tooling: Vitest config and setup aligned with Next.js docs
- DX: npm scripts for watch and CI
- Examples: component and API route tests
- Paths/env: support `@/` alias and `.env.local` loading

## Out of Scope

- E2E testing (Playwright/Cypress)
- Coverage reporting

## Validation

- Example tests pass locally and in CI mode
- `@/` alias resolves in tests
- Env vars from `.env.local` available during tests
<!-- OPENSPEC:END -->
