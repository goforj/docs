---
title: Starter Kits
description: How GoForj starter kits relate to generated components, frontend scaffolds, and App ownership.
---

# Starter Kits

Starter kits are optional scaffolds that give an app a working frontend.

They are not separate frameworks. After generation, their files belong to the App.

This page is the implementation guide. For screenshots and complete interface examples, see the [Starter Kit Showcase](/starter-kits).

## When Starter Kits Apply

Starter kit selection appears during `forj new` when the selected components support it.

Current important rule:

- Web UI enabled: starter kit selection can appear.
- Web UI disabled: starter kit selection is skipped.
- Demo App selected: the demo owns its generated frontend, so normal starter kit selection is cleared.

## Supported Starter Kits

The first-party starter kit choices are:

| Starter kit | Stack | Use it when |
| --- | --- | --- |
| [Vue](/frontend/vue-starter-kit) | Vue 3, Vite, TypeScript, Tailwind, shadcn-vue | You want a client-side Vue application shell. |
| [React](/frontend/react-starter-kit) | React 19, Vite, TypeScript, Tailwind, shadcn/ui | You want a client-side React application shell. |
| [templ + htmx](/frontend/templ-htmx-starter-kit) | templ, htmx, Tailwind | You want a Go-first server-rendered UI. |
| None | Web UI placeholder | You want to bring your own frontend. |

Starter kits create app-scoped frontend source for Apps with Web UI enabled, such as `cmd/app/frontend/` for the default app or `cmd/marketplace/frontend/` for an additional app.

## Generated Ownership

Starter kit files are generated into the App and then become App-owned.

Use the generated code as a starting point. Do not treat starter kit files as immutable framework internals.

::: warning Existing frontend code
Rendering a starter kit writes its conventional frontend files. If that location already contains customized application code, review the render before proceeding and preserve or move those changes first.
:::

## Development Tasks

Starter kits can add development setup tasks.

For npm-backed starter kits, generated dev setup can include:

```bash
cd cmd/app/frontend && npm install
```

and an App-owned SPA build under `dev.apps.<app>.spas` for `forj dev`.

## Compatibility

Starter kits compose with selected App components. They should not require unrelated infrastructure just to run the first local path.

When a starter kit requires Web UI, the generator should make that dependency explicit through the wizard and render contract.

## Next Steps

- [Vue Starter Kit](/frontend/vue-starter-kit)
- [React Starter Kit](/frontend/react-starter-kit)
- [templ + htmx Starter Kit](/frontend/templ-htmx-starter-kit)
- [forj dev](/developer-tools/forj-dev)
- [Project Structure](/getting-started/project-structure)
