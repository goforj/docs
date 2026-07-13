---
title: React Starter Kit
description: How the React starter kit is generated, owned, built, and served inside a GoForj App.
---

# React Starter Kit

The React starter kit is a generated client-side application shell for Apps with Web UI enabled.

It uses React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, and React Router. Its product surface matches the Vue kit so choosing a frontend framework does not create a different GoForj application model.

## Select the Kit

Choose React during `forj new`, or when creating a named App:

```bash
forj make:app marketplace --components web-api,web-ui --starter-kit react
```

The kit requires Web UI. It remains optional; choose `none` when the App owns a different frontend.

## Generated Ownership

The default App receives:

```text
cmd/app/frontend/
  components.json
  goforj.env.ts
  package.json
  vite.config.ts
  src/
    App.tsx
    main.tsx
    style.css
    components/ui/
    lib/
```

A named App uses `cmd/<app>/frontend/`.

These files become App-owned after creation. Edit components, routes, forms, styles, and API calls as normal application source.

## Backend Integration

`goforj.env.ts` resolves the active App and backend URL from Project configuration. Vite proxies `/api` to that backend during development.

Project variables prefixed with `FRONTEND_` become `VITE_` values for the frontend. Named Apps can override them with an app prefix such as `MARKETPLACE_FRONTEND_BACKEND_URL`.

Keep credentials and server-only secrets out of frontend variables.

## Development

Use the normal Project loop:

```bash
forj dev
```

Generated development tasks install frontend dependencies. The App-owned SPA lifecycle builds frontend assets, then rebuilds the Go binary and restarts the selected App after successful changes.

The current generated App lifecycle does not start the Vite development server. Run it directly when you want Vite-specific development behavior; a custom `dev.watches` entry can manage it when needed:

```bash
cd cmd/app/frontend
npm install
npm run dev
```

## Production Build

Build frontend assets before compiling the embedded App binary:

```bash
cd cmd/app/frontend
npm run build
cd ../../..
forj build
```

The HTTP runtime serves the generated `dist` assets through the owning App's embedded frontend.

## Auth-Aware Surfaces

When Auth is enabled, the starter contains login, registration, password reset, settings, and session-aware application patterns. The browser uses the generated `HttpOnly` cookie model; it should not move access or refresh tokens into local storage.

When Auth is disabled, auth-specific behavior should not become a hidden frontend requirement.

## Testing

Use normal React component and route tests for App-owned behavior. Verify backend integration against relative `/api` paths so development proxying and embedded production serving use the same browser contract.

Run a production frontend build before shipping changes that affect routing, assets, or environment resolution.

## Common Mistakes

::: warning Common mistakes
- Do not treat starter files as framework-owned after generation.
- Do not put server secrets in `FRONTEND_*` variables.
- Do not hard-code the default App port when named Apps can resolve different ports.
- Do not store generated auth tokens in browser local storage.
- Do not rerender a starter kit over a custom frontend unless replacement is intentional.
:::

## Next Steps

- [Starter Kits](/getting-started/starter-kits) compares the available choices.
- [HTTP Services](/applications/http-services) explains the backend API boundary.
- [Auth](/security/auth) explains generated browser authentication.
- [forj dev](/developer-tools/forj-dev) explains the coordinated development loop.
