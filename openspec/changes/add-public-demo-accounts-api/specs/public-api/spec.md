## ADDED Requirements

### Requirement: Public Demo Accounts Endpoint

The system SHALL expose a public HTTP GET endpoint at `/api/demo-accounts` that returns a JSON array of demo accounts from `public.users` with fields `full_name`, `email`, and `role`.

#### Scenario: Successful fetch

- WHEN a client sends GET `/api/demo-accounts`
- THEN the response status is 200
- AND the response body is an array of objects each containing `full_name`, `email`, and `role`

#### Scenario: Backend error

- WHEN the Supabase query fails
- THEN the response status is 500
- AND the body contains an `error` message
