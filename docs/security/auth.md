---
title: Auth
description: Generated GoForj authentication, server-side sessions, cookies, refresh behavior, password reset, email verification, and inspect visibility.
---

# Auth

Generated Auth provides account, credential, session, and browser authentication behavior for a GoForj App.

It is server-authoritative: access tokens are short-lived, refresh tokens are anchored to stored session rows, and session revocation remains controlled by the App.

## What Auth Provides

Generated Auth includes:

- local username/email and password login
- `HttpOnly` browser cookies
- short-lived JWT access tokens
- opaque refresh tokens backed by server-side session rows
- logout, logout-all, session listing, and per-session revoke
- password change with revocation of other sessions
- password reset request and confirm
- email verification request and confirm
- login rate limiting and temporary account lockout
- scheduled cleanup for stale auth rows
- request-scoped debug visibility through inspects when debug logging is enabled

OAuth is an optional component layered on top of Auth. It is not required for local username/email auth.

## Generated Ownership

Auth requires a database and implies Mail. OAuth requires Auth and a database.

Generated account and session behavior lives in:

```text
internal/auth/
app/wire/inject_auth.go
app/routes.go
app/schedules.go
migrations/
```

`internal/auth` owns account, session, credential, reset, verification, login-pressure, and provider-linkage behavior. App route and schedule files expose that behavior through the owning App.

Use generated services and middleware as extension boundaries. Do not copy credential checks into controllers or replace session state with a JWT-only shortcut.

## HTTP Surface

Generated Auth routes include:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/logout-all`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/profile`
- `GET /api/v1/auth/sessions`
- `POST /api/v1/auth/sessions/:id/revoke`
- `POST /api/v1/auth/change-password`
- `POST /api/v1/auth/password-reset/request`
- `POST /api/v1/auth/password-reset/confirm`
- `POST /api/v1/auth/email-verification/request`
- `POST /api/v1/auth/email-verification/confirm`

When OAuth is enabled, additional provider start, callback, and link routes are generated under `/api/v1/auth/oauth/:provider`.

These JSON routes are mounted for API-oriented Apps and the Vue and React starter kits. The templ + htmx starter kit mounts browser routes such as `/login`, `/register`, and `/forgot-password` instead; it does not mount the generated JSON Auth controller.

## Session Model

The access token is a signed JWT stored in the `auth_access` cookie. It is short-lived and includes user and session identity.

The refresh token is opaque to the client and stored in the `auth_refresh` cookie. It is tied to an `auth_sessions` row. The raw refresh secret is not stored; only its hash is persisted.

The session row is the revocation and rotation anchor. It lets the App revoke sessions, reject expired or revoked sessions, rotate refresh secrets, list active sessions, and expose safe session metadata.

## Refresh Behavior

Protected request auth first checks the access cookie.

If access is missing or expired, middleware can attempt refresh fallback so the request can continue. Explicit `POST /api/v1/auth/refresh` remains the path for intentional refresh-secret rotation in Apps that mount the JSON Auth controller.

This separation keeps normal browser request bursts from racing refresh rotation while still making explicit refresh behavior auditable.

See [Sessions and Cookies](/security/sessions-cookies) for expiry, rotation, cookie, and CSRF boundaries.

## Password Reset and Email Verification

Password reset request creates a reset grant without leaking account existence.

Password reset confirm redeems the grant, updates the password, and revokes sessions.

Email verification request creates a verification grant for the authenticated user. Email verification confirm redeems it and marks the user as verified.

Generated local development behavior may expose tokens in controlled environments so flows can be tested. Production delivery should go through generated mail delivery.

## Configuration

Important settings include:

```dotenv
API_JWT_SECRET_KEY=
AUTH_ACCESS_TOKEN_TTL=15m
AUTH_SESSION_IDLE_TTL=2h
AUTH_SESSION_TTL=24h
AUTH_REMEMBER_SESSION_TTL=720h
AUTH_COOKIE_SECURE=auto
AUTH_REGISTER_REQUIRES_EMAIL_VERIFICATION=false
AUTH_LOGIN_LOCKOUT_ATTEMPTS=5
AUTH_LOGIN_LOCKOUT_DURATION=15m
AUTH_LOGIN_RATE_LIMIT_ATTEMPTS=10
AUTH_LOGIN_RATE_LIMIT_DURATION=15m
```

`API_JWT_SECRET_KEY` must be an unpredictable deployment secret outside generated local defaults. `AUTH_COOKIE_SECURE=auto` enables secure cookies for HTTPS while preserving plain-HTTP local development.

Password policy, reset and verification TTLs, bootstrap users, token return behavior, and OAuth providers have additional settings in the generated `internal/auth/README.md` and [Environment Variables](/reference/env-vars).

## Scheduled Cleanup

Auth can register scheduled cleanup for stale auth rows such as expired sessions, reset grants, verification grants, and login attempt records.

The schedule should remain named and visible through scheduler and inspect surfaces.

## Inspect Visibility

When debug logging is enabled, auth failure and recovery paths can attach request-scoped debug events to the request inspect timeline.

Useful inspect fields include auth outcome, auth reason, TTLs, session timestamps, path, method, IP address, and user agent.

Security-sensitive values must not be logged:

- raw access tokens
- raw refresh tokens
- password hashes
- password reset tokens
- email verification tokens
- OAuth provider tokens
- full cookie values
- auth headers

## Testing

Generated Auth includes integration coverage for login, registration, sessions, refresh rotation, revocation, password changes, reset, verification, rate limits, lockout, provider identity policy, cleanup, and concurrent refresh recovery.

Run normal generated App tests first:

```bash
go test ./...
```

Use fake OAuth providers and local or fake mail delivery in automated tests. Do not couple CI to live identity or mail providers.

## Operations

Auth participates in HTTP lifecycle, database readiness, cache-backed session reads, mail delivery, scheduler cleanup, logs, metrics, and request inspects.

Before production, review [Production Hardening](/security/production-hardening), configure HTTPS and cookie policy, provide the JWT secret, remove bootstrap credentials, verify sender delivery, and confirm cleanup schedules are running.

## Common Mistakes

::: warning Common mistakes
- Do not treat the JWT as the only source of truth.
- Do not auto-link provider identities to existing users by email unless the App explicitly owns that policy.
- Do not expose reset or verification tokens outside controlled local flows.
- Do not log raw auth credentials or token material.
- Do not bypass generated auth middleware for protected route groups.
:::

## Next Steps

- [Routes](/applications/routes) explains protected route groups.
- [Sessions and Cookies](/security/sessions-cookies) explains browser session behavior.
- [OAuth](/security/oauth) explains provider sign-in and account linking.
- [Production Hardening](/security/production-hardening) provides a deployment checklist.
- [Inspects](/operations/inspects) explains request diagnostics.
- [Scheduler](/async/scheduler) explains recurring cleanup.
