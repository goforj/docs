---
title: Choose a Starter Kit
description: Choose a frontend starting point and understand what changing it replaces.
---

# Choose a Starter Kit

A starter kit supplies the first frontend for an app with Web UI enabled. Choose it during app creation based on where you want rendering and interaction logic to live.

## Choose the Rendering Model

| Starter kit | Rendering model | Choose it when |
| --- | --- | --- |
| [Vue](/frontend/vue-starter-kit) | Vue 3 client application with Vite, TypeScript, Tailwind, and shadcn-vue | Your team wants Vue components and client-side routing. |
| [React](/frontend/react-starter-kit) | React 19 client application with Vite, TypeScript, Tailwind, and shadcn/ui | Your team wants React components and client-side routing. |
| [templ + htmx](/frontend/templ-htmx-starter-kit) | Server-rendered templ pages with htmx and Tailwind | Your team wants routes, view models, and HTML rendering to remain in Go. |
| None | Plain Web UI placeholder | You already have a frontend or want to build one without starter scaffolding. |

All three first-party kits produce app-owned source. The choice changes the frontend implementation, not GoForj's route, service, configuration, or dependency-injection model.

## Select a Kit

Run the Project wizard:

```bash
forj new
```

Enable **Web UI**, then select one starter kit. The starter-kit step is skipped when Web UI is disabled. Selecting the Demo App also skips this step because the demo provides its own frontend.

The default app receives frontend source under:

```text
cmd/app/frontend/
```

An additional app such as `admin` receives its source under `cmd/admin/frontend/`.

## Run It

For the default app:

```bash
forj dev
```

The generated development configuration installs the kit's frontend dependencies and runs its App-owned SPA build. A successful build writes browser assets to `cmd/app/frontend/dist`, then the Go build embeds them in the app binary.

Open `http://localhost:3000` after `forj dev` reports that the app is ready. The page you see depends on the selected kit and enabled components.

## Change a Kit Deliberately

The kit identity is stored as `render.starter_kit` in `.goforj.yml` for the default app. Changing from one first-party kit to another and running `forj render` replaces the conventional default-app frontend directory with the newly selected kit.

::: warning Preserve application code
Treat a starter-kit change as a frontend migration. Commit or copy customized files from `cmd/app/frontend/` first, change `render.starter_kit`, run `forj render`, then port your product-specific pages and components into the new frontend. Do not use a kit change as an in-place dependency upgrade.
:::

Valid values are:

```yaml
render:
  starter_kit: vue # vue, react, templ_htmx, or none
```

Setting the value to `none` stops starter-kit scaffolding on later renders. It does not delete an existing frontend.

`templ_htmx` also generates Go-owned UI files under `internal/starterui/`, so include that package in the migration review when switching to or from the server-rendered kit.

After the render, verify the replacement before restoring application changes:

```bash
forj dev
```

Confirm that the app starts and that `/` serves the new frontend. Then run the frontend-specific build and test commands documented by the selected kit.

## Understand Ownership

Starter-kit source belongs to the app after it is created. Edit it like normal application code, keep credentials out of browser-visible environment variables, and test frontend changes in the selected framework.

The [Frontend overview](/frontend/) explains how source becomes an embedded deployment artifact. The individual kit guides document their files, development commands, and backend integration.
