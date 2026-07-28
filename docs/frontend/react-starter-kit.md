---
title: React Starter Kit
description: How the React starter kit is generated, owned, built, and served inside a GoForj App.
---

# React Starter Kit

The React starter kit is a generated client-side application shell for Apps with Web UI enabled.

It uses React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, and React Router. Its product surface matches the Vue kit so choosing a frontend framework does not create a different GoForj application model.

## Select the Kit

Start with the interactive Project wizard:

```bash
forj new
```

Enable Web UI and choose React when prompted. The new default app will include the React starter kit without requiring you to know component or starter-kit flags up front.

The React kit requires Web UI. Starter kits remain optional; choose `none` when the App owns a different frontend.

## What the Kit Creates

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

These files are application source. Edit components, routes, forms, styles, and API calls as you would in any React project.

## Backend Integration

`goforj.env.ts` resolves the active App and backend URL from Project configuration. Vite proxies `/api` to that backend during development.

Project variables prefixed with `FRONTEND_` become `VITE_` values for the frontend.

Keep credentials and server-only secrets out of frontend variables.

## Development

Use the normal Project loop:

```bash
forj dev
```

Generated development tasks install frontend dependencies. The App-owned SPA lifecycle builds frontend assets, then rebuilds the Go binary and restarts the selected App after successful changes.

The default App lifecycle does not start the Vite development server. Run it directly when you want Vite-specific development behavior; a custom `dev.watches` entry can manage it when needed:

```bash
cd cmd/app/frontend
npm install
npm run dev
```

## Build for Deployment

The default deployment remains one App binary. React compiles into `frontend/dist`, then `forj build` embeds those assets alongside the Go application.

`forj dev` already performs this sequence while you work. In CI or a release build, run it explicitly:

```bash
npm --prefix cmd/app/frontend ci &&
  npm --prefix cmd/app/frontend run build &&
  forj build
```

Expected result: `cmd/app/frontend/dist` contains the production frontend and `bin/app` contains the App that serves it. The default deployment does not need a separate frontend server or static-site release.

## Auth-Aware Surfaces

When Auth is enabled, the starter contains login, registration, password reset, settings, and session-aware application patterns. The browser uses the generated `HttpOnly` cookie model; it should not move access or refresh tokens into local storage.

When Auth is disabled, auth-specific behavior should not become a hidden frontend requirement.

## Testing

Use normal React component and route tests for App-owned behavior. Verify backend integration against relative `/api` paths so development proxying and embedded production serving use the same browser contract.

Run a production frontend build before shipping changes that affect routing, assets, or environment resolution.

::: warning Rendering again
Rendering the React starter kit writes its conventional frontend files. Review and preserve customized files before rerendering the kit into an existing app.
:::

## Additional Apps

To create an additional app with the same frontend stack:

```bash
forj make:app marketplace --components web-api,web-ui --starter-kit react
```

Its frontend lives in `cmd/marketplace/frontend/`. App-specific frontend variables use the app prefix, such as `MARKETPLACE_FRONTEND_BACKEND_URL`.

## Next Steps

- [Starter Kits](/getting-started/starter-kits) compares the available choices.
- [HTTP Services](/applications/http-services) explains the backend API boundary.
- [Auth](/security/auth) explains generated browser authentication.
- [forj dev](/developer-tools/forj-dev) explains the coordinated development loop.
