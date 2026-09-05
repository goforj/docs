---
title: React Starter Kit
description: How the React starter kit is generated, owned, built, and served inside a GoForj App.
---

# React Starter Kit

The React starter kit gives Apps with Web UI enabled an App-owned client-side shell.

It uses React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, and React Router. Its product surface matches the Vue kit so choosing a frontend framework does not create a different GoForj application model.

## Select the Kit

Start with the interactive Project wizard:

```bash
forj new
```

Enable Web UI and choose React when prompted. Leave the component library On for the full dashboard and component showcase, or turn it Off for a smaller shell with an empty dashboard and no showcase routes. The new default app will include the React starter kit without requiring you to know component or starter-kit flags up front.

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

## Load Data Without Flicker

Keep feature-local server data in the route or component that owns it, or in a colocated hook. Global context is appropriate for genuinely application-wide client state; it should not become the default home for every request merely to share loading machinery.

Delay transient skeletons or spinners briefly. If a fast request resolves before that threshold, commit the content directly without flashing a pending state. During refresh or revalidation, retain the current usable content until replacement data is ready instead of clearing the view.

Still model explicit loading, error, empty, and ready states. A slower request should reveal a stable pending layout with the same general dimensions as the result, while a completed request should never be artificially delayed to satisfy an animation.

Route-critical data can load before navigation commits. Predictable modal and detail data can be prefetched so opening the interface does not immediately tear down and replace its contents.

## Build for Deployment

The default deployment remains one App binary. React compiles into `frontend/dist`, then `forj build` embeds those assets alongside the Go application.

`forj dev` already performs this sequence while you work. In CI or a release build, use the same Project build entry point:

```bash
forj build
```

Expected result: GoForj installs npm dependencies and rebuilds React when its source or output is stale, `cmd/app/frontend/dist` contains the production frontend, and `bin/app` contains the App that serves it. An unchanged build skips the npm work. The default deployment does not need a separate frontend server or static-site release.

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
forj make:app admin --components web-api,web-ui --starter-kit react
```

Its frontend lives in `cmd/admin/frontend/`. App-specific frontend variables use the app prefix, such as `ADMIN_FRONTEND_BACKEND_URL`.

## Next Steps

- [Choose a Starter Kit](/getting-started/starter-kits) compares the available choices.
- [HTTP Services](/applications/http-services) explains the backend API boundary.
- [Auth](/security/auth) explains generated browser authentication.
- [forj dev](/developer-tools/forj-dev) explains the coordinated development loop.
- [`make:app` Reference](/reference/make-commands#make-app) lists starter-kit and component options.
