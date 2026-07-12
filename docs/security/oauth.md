---
title: OAuth
description: Configure generated OAuth provider login and explicit account linking on top of GoForj Auth.
---

# OAuth

OAuth is an optional generated component layered on top of Auth.

It adds provider sign-in and explicit identity linking without replacing GoForj's canonical users and server-authoritative sessions.

## Component Contract

OAuth requires:

- Auth
- a database
- Mail through Auth's component dependency

Provider-specific files, routes, migrations, and environment keys are omitted when OAuth is not selected.

## Built-In Providers

Generated adapters are available for:

- GitHub
- Google
- Microsoft
- Apple

Each provider remains disabled until its required credentials are configured.

Provider environment variables use prefixes such as:

```dotenv
AUTH_OAUTH_GITHUB_CLIENT_ID=
AUTH_OAUTH_GITHUB_CLIENT_SECRET=
AUTH_OAUTH_GOOGLE_CLIENT_ID=
AUTH_OAUTH_GOOGLE_CLIENT_SECRET=
```

Use the generated `internal/auth/README.md` for the exact settings emitted by the selected component version.

## HTTP Flow

Apps that mount the JSON Auth controller expose:

- `GET /api/v1/auth/oauth/:provider/start`
- `GET /api/v1/auth/oauth/:provider/callback`
- `POST /api/v1/auth/oauth/:provider/callback`
- `GET /api/v1/auth/oauth/:provider/link/start`

The start route creates a short-lived persisted state record with a state value, PKCE verifier, nonce, optional link user, safe redirect target, and expiry.

The callback consumes that state once, resolves provider identity, links or creates the canonical user according to policy, and issues the normal GoForj session cookies.

The templ + htmx starter kit currently replaces the JSON Auth controller with its browser controller and does not mount these generated OAuth routes. An App combining that kit with OAuth must add an explicit provider route and UI integration before provider sign-in is reachable.

## Identity Policy

`auth_identities` links a provider and provider subject to one canonical user.

Current policy:

- an exact provider-subject match reuses the linked user
- matching email alone does not silently link an existing account
- linking an identity requires an authenticated explicit flow
- unlinking the last remaining authentication method is rejected
- provider-created users do not receive a usable local password automatically

This prevents account takeover through provider email coincidence.

## Redirect Safety

The optional `next` destination is sanitized before persistence and redirect.

Keep provider callback URLs fixed to the App's public HTTPS origin. Do not accept arbitrary callback hosts or pass raw user-provided redirect URLs to providers.

## Testing

Generated OAuth tests use fake providers and stub HTTP servers. They verify state creation, single use, PKCE and nonce state, login, explicit linking, identity policy, and callback behavior without contacting live providers.

Use that same boundary for App tests. Live provider calls are deployment smoke checks, not normal CI dependencies.

## Operations

OAuth state rows are cleaned up by auth-owned scheduled cleanup. Provider failures and auth outcomes can appear in request logs and inspects, but provider tokens and authorization headers must never be captured.

Monitor callback failures by bounded provider and outcome values. Do not use email addresses, subjects, tokens, or raw callback values as metric labels.

## Common Mistakes

::: warning Common mistakes
- Do not auto-link users only because provider email matches.
- Do not log provider access or refresh tokens.
- Do not skip state, PKCE, nonce, expiry, or single-use validation.
- Do not let arbitrary external `next` URLs become callback redirects.
- Do not couple automated tests to live OAuth providers.
:::

## Next Steps

- [Auth](/security/auth) explains the account and session core.
- [Sessions and Cookies](/security/sessions-cookies) explains issued browser state.
- [Production Hardening](/security/production-hardening) covers secrets and HTTPS.
