---
title: Frontend Integration
description: How app-owned frontend source is built, embedded, and served by a GoForj App.
---

# Frontend Integration

GoForj keeps frontend source inside the app that serves it. The frontend builds to static assets, and the Go binary embeds those assets for the normal deployment path.

Use [Choose a Starter Kit](/getting-started/starter-kits) when deciding between Vue, React, templ + htmx, or your own frontend. This page owns the integration model shared by those choices.

## Source and Build Output

The default app uses:

```text
cmd/app/frontend/       frontend source and package configuration
cmd/app/frontend/dist/  browser assets produced by the frontend build
cmd/app/main.go         embeds and registers the built assets before App launch
```

An additional app uses the same layout under `cmd/<app>/frontend/`. Each app owns its frontend lifecycle and embeds only its own `dist` directory. The framework-managed entrypoint performs this required registration before delegating startup to the App's Wire package; application routes and services still belong under `app/` and `internal/`.

## Development Lifecycle

Starter kits add an App-owned SPA build under `dev.apps.<app>.spas`. Run the normal Project loop:

```bash
forj dev
```

The SPA build runs before the owning Go app is built. Successful frontend changes rebuild the assets, rebuild the binary, and replace the running app. See [forj dev](/developer-tools/forj-dev) for watch ordering and failure behavior.

Run a framework-specific development server only when you need that tool's behavior. Vue and React use relative `/api` requests so a Vite proxy can reach the Go backend during that workflow.

## Build and Deployment

Build the complete Project artifact with one command:

```bash
forj build
```

Before compiling Go, `forj build` checks every SPA configured under `dev.apps`, including SPAs owned by additional Apps. For an npm-based SPA, it installs dependencies and runs the configured SPA build only when the frontend source or its `dist` output has changed. Successful `forj dev` SPA builds satisfy the same check, so the next unchanged `forj build` does not repeat that work. After generation, stale SPA work overlaps independent backend preparation; the final Go compilation waits for all required assets.

Expected result: each configured SPA has current production assets in its `dist` directory, and `bin/app` contains the executable that serves the default App's assets. The normal deployment does not require a separate static-file service.

The freshness check uses file paths and metadata rather than reading frontend source contents. It ignores `node_modules` and treats `dist` as output. A first build, a missing or invalid build receipt, changed source metadata, changed output, or a changed SPA build command causes a rebuild. Each SPA stores one fixed-size receipt under `bin/.forj-build-cache/spas/`; source contents and per-file records are not persisted. This keeps unchanged Go builds fast while making `forj build` the release-build entry point for both frontend and backend code.

## Backend Boundary

Frontend code calls the app through its HTTP routes. Keep business behavior in Go services and keep server-only credentials out of `FRONTEND_` variables, because frontend values become browser-visible build inputs.

Vue and React use the generated JSON API and cookie-based Auth routes. The templ + htmx kit owns server-rendered browser routes and calls the same app services from Go controllers.

## Kit Guides

- [Vue Starter Kit](/frontend/vue-starter-kit)
- [React Starter Kit](/frontend/react-starter-kit)
- [templ + htmx Starter Kit](/frontend/templ-htmx-starter-kit)
