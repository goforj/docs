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

## HTTP Surface

Generated Auth routes include:

- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/logout-all`
- `POST /auth/refresh`
- `GET /auth/me`
- `POST /auth/profile`
- `GET /auth/sessions`
- `POST /auth/sessions/:id/revoke`
- `POST /auth/change-password`
- `POST /auth/password-reset/request`
- `POST /auth/password-reset/confirm`
- `POST /auth/email-verification/request`
- `POST /auth/email-verification/confirm`

When OAuth is enabled, additional provider start, callback, and link routes are generated.

## Session Model

The access token is a signed JWT stored in the `auth_access` cookie. It is short-lived and includes user and session identity.

The refresh token is opaque to the client and stored in the `auth_refresh` cookie. It is tied to an `auth_sessions` row. The raw refresh secret is not stored; only its hash is persisted.

The session row is the revocation and rotation anchor. It lets the App revoke sessions, reject expired or revoked sessions, rotate refresh secrets, list active sessions, and expose safe session metadata.

## Refresh Behavior

Protected request auth first checks the access cookie.

If access is missing or expired, middleware can attempt refresh fallback so the request can continue. Explicit `POST /auth/refresh` remains the path for intentional refresh-secret rotation.

This separation keeps normal browser request bursts from racing refresh rotation while still making explicit refresh behavior auditable.

## Password Reset and Email Verification

Password reset request creates a reset grant without leaking account existence.

Password reset confirm redeems the grant, updates the password, and revokes sessions.

Email verification request creates a verification grant for the authenticated user. Email verification confirm redeems it and marks the user as verified.

Generated local development behavior may expose tokens in controlled environments so flows can be tested. Production delivery should go through generated mail delivery.

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

## Common Mistakes

- Do not treat the JWT as the only source of truth.
- Do not auto-link provider identities to existing users by email unless the App explicitly owns that policy.
- Do not expose reset or verification tokens outside controlled local flows.
- Do not log raw auth credentials or token material.
- Do not bypass generated auth middleware for protected route groups.

## Next Steps

- [Routes](/applications/routes) explains protected route groups.
- [Inspects](/operations/inspects) explains request diagnostics.
- [Scheduler](/async/scheduler) explains recurring cleanup.
