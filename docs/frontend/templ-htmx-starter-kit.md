---
title: templ + htmx Starter Kit
description: How the server-rendered templ and htmx starter kit is generated, built, tested, and owned.
---

# templ + htmx Starter Kit

The templ + htmx starter kit is GoForj's server-rendered Web UI option.

It keeps routing, controllers, view models, and page rendering in Go while using htmx for progressive requests and Tailwind plus Basecoat for the frontend system.

## Select the Kit

Choose templ + htmx during `forj new`, or create a named App explicitly:

```bash
forj make:app backstage --components web-api,web-ui --starter-kit templ_htmx
```

The kit requires Web UI. It complements the Vue and React client-side kits rather than replacing them.

## Generated Ownership

The kit creates server-owned UI code:

```text
internal/starterui/
  controller.go
  controller_test.go
  viewmodels.go
  auth_views.templ
  dashboard.templ
  layout.templ
  settings_views.templ
  components_*.templ
```

It also creates the asset pipeline for the owning App:

```text
cmd/app/frontend/
  package.json
  vite.config.ts
  src/app.ts
  src/style.css
  dist/
```

Named Apps use `cmd/<app>/frontend/` for assets while the shared `internal/starterui` package owns the rendered views and controller behavior.

All generated files become App-owned source.

## Request Model

`internal/starterui.Controller` registers normal `web.Route` values and renders templ components through `web.Context`.

Use full-page responses for normal navigation and small htmx responses when a workflow benefits from partial replacement. Keep domain behavior in services; controllers and view models should translate that behavior for the page.

## Build Pipeline

The normal build detects `templ_htmx` and runs templ generation before Wire and the API index:

```bash
forj build
```

`forj dev` watches `.templ` source, ignores generated `*_templ.go` files to prevent rebuild loops, rebuilds CSS and JavaScript assets, and restarts the App as needed.

To build only frontend assets:

```bash
cd cmd/app/frontend
npm install
npm run build
```

Do not edit generated `*_templ.go` output. Edit `.templ` source and rerun the normal build.

## Auth-Aware Pages

When Auth and a database are enabled, the generated controller includes working login and logout handlers plus protected application pages. It also generates registration, reset, and verification page surfaces for App-owned completion.

The templ + htmx controller replaces the JSON Auth controller, so `/api/v1/auth/*` and generated OAuth routes are not mounted by default for this kit.

Without Auth, the generator omits auth routes and affordances. The starter remains usable as a server-rendered application shell.

## JavaScript Policy

htmx owns server interactions that benefit from partial updates. Small app-local controllers in `src/app.ts` may own presentation behavior such as menus, dialogs, and tables.

Keep business policy on the server. Do not grow the asset bundle into a second application architecture hidden beside the Go controller and view model.

## Testing

Generated controller tests use `webtest` and assert rendered response behavior without starting a real listener.

Run:

```bash
go test ./internal/starterui
forj build
```

Add browser-level coverage only for behavior that depends on htmx swaps, focus management, or client-side interaction.

## Common Mistakes

::: warning Common mistakes
- Do not edit generated `*_templ.go` files.
- Do not put business workflows inside templ components.
- Do not return partial markup to ordinary browser navigation accidentally.
- Do not add a SPA state model beside server-owned page state without a concrete need.
- Do not rerender over customized views unless replacement is intentional.
:::

## Next Steps

- [Starter Kits](/getting-started/starter-kits) compares all first-party kits.
- [Controllers](/applications/controllers) explains the HTTP boundary.
- [Requests and Validation](/applications/requests-validation) covers form input.
- [forj dev](/developer-tools/forj-dev) explains watcher behavior.
