---
title: Vue Starter Kit
description: How the Vue starter kit is generated, owned, built, and served inside a GoForj App.
---

# Vue Starter Kit

The Vue starter kit is a generated frontend scaffold for apps that enable the Web UI component.

It gives the app a frontend project with Vue, Vite, TypeScript, routing, and styling. The development lifecycle or an explicit frontend build creates the initial `dist` artifact.

## Select the Kit

Start with the interactive Project wizard:

```bash
forj new
```

Enable Web UI and choose Vue when prompted. The new default app will include the Vue starter kit without requiring you to know component or starter-kit flags up front.

The Vue kit requires Web UI. Starter kits remain optional; choose `none` when the App owns a different frontend.

If you select the demo App, the demo supplies its own frontend and the wizard skips the normal starter-kit selection.

## What the Kit Creates

The Vue starter kit creates:

```text
cmd/app/frontend/
  package.json
  vite.config.ts
  src/
    App.vue
    main.ts
    router.ts
    style.css
```

These files are application source. Edit components, routes, and styles as you would in any Vue project.

## Rendering Behavior

When the Vue starter kit is scaffolded, the existing app frontend directory can be replaced.

Do not select the starter kit over an existing custom frontend unless replacing it is intentional.

## Development

The Vue starter kit adds a frontend dependency setup task:

```bash
cd cmd/app/frontend && npm install
```

It also adds an App-owned SPA build under `dev.apps.<app>.spas`. That lifecycle builds frontend assets before the owning App build and reruns after matching source changes.

Use:

```bash
forj dev
```

for the default local App lifecycle.

## Build for Deployment

The default deployment remains one App binary. Vue compiles into `frontend/dist`, then `forj build` embeds those assets alongside the Go application.

`forj dev` already performs this sequence while you work. In CI or a release build, run it explicitly:

```bash
npm --prefix cmd/app/frontend ci &&
  npm --prefix cmd/app/frontend run build &&
  forj build
```

Expected result: `cmd/app/frontend/dist` contains the production frontend and `bin/app` contains the App that serves it. The default deployment does not need a separate frontend server or static-site release.

## Additional Apps

To create an additional app with the same frontend stack:

```bash
forj make:app admin --components web-api,web-ui --starter-kit vue
```

Its frontend lives in `cmd/admin/frontend/`.

## Next Steps

- [Starter Kit Guide](/getting-started/starter-kits)
- [forj dev](/developer-tools/forj-dev)
- [HTTP Server](/operations/http-server)
