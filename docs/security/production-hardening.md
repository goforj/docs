---
title: Production Hardening
description: Security checks for deploying generated GoForj Apps with auth, cookies, mail, observability, and infrastructure drivers.
---

# Production Hardening

Production hardening is the deployment policy around generated security defaults.

GoForj provides secure-shaped components, but the deployment still owns secrets, HTTPS, network exposure, retention, and provider credentials.

## Secrets

- Set a strong unique `API_JWT_SECRET_KEY` outside source control.
- Remove local bootstrap credentials or replace them through an explicit operator workflow.
- Inject database, cache, queue, mail, storage, OAuth, Lighthouse, and readiness credentials through the deployment environment.
- Rotate compromised credentials and revoke affected sessions.
- Keep `.env`, debug captures, backups, and CI output out of public artifacts.

Use [Crypt](/crypt) for application encryption and key-rotation primitives. Do not reuse the JWT signing secret as a general encryption key.

## HTTPS and Cookies

- Terminate HTTPS at a trusted proxy or in the App's deployment boundary.
- Set `AUTH_COOKIE_SECURE=true` in production.
- Keep generated auth cookies host-scoped.
- Preserve `HttpOnly` and `SameSite` protections.
- Configure trusted proxy and real-IP behavior so rate limits and audit metadata use the real client boundary.

## Browser Requests

- Keep credentialed CORS origins explicit.
- Apply CSRF middleware to browser-authenticated mutation routes when cross-site request risk exists.
- Never expose mutations through `GET`.
- Validate redirects and return URLs against local policy.
- Keep access and refresh credentials out of local storage and JavaScript-readable cookies.

## Auth Policy

- Review password requirements for the product's threat model.
- Keep login rate limiting and account lockout enabled.
- Require email verification where account ownership depends on email.
- Verify reset and verification tokens are not returned outside controlled local environments.
- Confirm session idle, absolute, and remembered lifetimes match risk.
- Test logout, revoke, password-change, and password-reset session invalidation.

## OAuth

- Register exact HTTPS callback URLs with each provider.
- Store provider client secrets outside source control.
- Keep state, PKCE, nonce, expiry, and single-use checks enabled.
- Require explicit account linking; do not trust email coincidence.
- Review provider scopes and request only what the App uses.

## Mail

- Verify sender domains, SPF, DKIM, and provider authentication.
- Keep local `log` or Mailpit drivers out of real delivery deployments.
- Do not log message bodies, reset links, verification tokens, or provider credentials.
- Monitor bounces, complaints, and rejected sends at the provider.

## Diagnostics and Observability

- Protect detailed readiness responses with a diagnostic token.
- Keep metrics and Lighthouse on trusted networks or behind authentication.
- Redact secrets from logs and inspects.
- Bound request and response capture sizes and retention.
- Use stable operational labels instead of user IDs, emails, tokens, raw paths, or payload values.
- Verify debug logging is appropriate for production retention policy.

## Infrastructure and Runtime Topology

- Use shared drivers when HTTP, workers, schedulers, or replicas must share state.
- Run scheduler replicas only with the required locking and deployment policy.
- Set graceful shutdown timeouts for HTTP, workers, and scheduler processes.
- Restrict database, cache, queue, storage, and broker networks to expected runtimes.
- Back up source-of-truth data and test restoration.

## Release Verification

Before deployment:

```bash
go test ./...
forj build
./bin/app about
./bin/app route:list
```

Then verify in the deployment environment:

- liveness and readiness
- login, refresh, logout, and revoke
- password reset and email verification delivery
- OAuth callbacks when enabled
- worker and scheduler startup
- metrics, logs, inspects, and Lighthouse access policy
- graceful shutdown

## Common Mistakes

::: warning Common mistakes
- Do not deploy generated local secrets or bootstrap passwords.
- Do not expose detailed diagnostics, metrics, or Lighthouse publicly by default.
- Do not assume local process drivers share state across replicas.
- Do not retain auth tokens or sensitive bodies in logs and inspects.
- Do not treat a successful build as a substitute for deployment-environment verification.
:::

## Next Steps

- [Production Checklist](/operations/production-checklist) covers the broader runtime release path.
- [Sessions and Cookies](/security/sessions-cookies) explains browser credential policy.
- [OAuth](/security/oauth) explains provider identity policy.
- [Health and Readiness](/operations/health-readiness) explains protected diagnostics.
