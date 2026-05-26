---
title: Vue Starter Kit
description: How the Vue starter kit is generated, owned, built, and served inside a GoForj App.
---

# Vue Starter Kit

The Vue starter kit is a generated frontend scaffold for Apps that enable the Web UI component.

It gives the App a `frontend/` project with Vue, Vite, TypeScript, routing, styling, and an initial build artifact.

## When It Appears

The starter kit selection appears during `forj new` when Web UI is enabled.

If Web UI is disabled, starter kit selection is skipped and the starter kit is cleared.

If the demo App is selected, the demo owns its own frontend and the starter kit is not applied.

## Generated Ownership

The Vue starter kit writes:

```text
frontend/
```

Important files include:

- `frontend/package.json`
- `frontend/vite.config.ts`
- `frontend/src/App.vue`
- `frontend/src/main.ts`
- `frontend/src/router.ts`
- `frontend/src/style.css`
- `frontend/dist/index.html`

The generated frontend is App-owned after it is created. Edit it like normal application code.

## Rendering Behavior

When the Vue starter kit is scaffolded, the existing `frontend/` directory can be replaced.

Do not select the starter kit over an existing custom frontend unless replacing it is intentional.

## Development

Generated dev configuration can add a pre-task:

```bash
cd frontend && npm install
```

and a frontend watcher when Web UI is enabled.

Use:

```bash
forj dev
```

for the generated local watcher workflow.

## Serving Assets

When Web UI is enabled, generated `main.go` embeds `frontend/dist` and registers the SPA with the HTTP runtime.

Build frontend assets before relying on embedded production output:

```bash
cd frontend
npm run build
```

## Common Mistakes

::: warning Common mistakes
- Do not assume starter kit files remain framework-owned after generation.
- Do not rerender over a custom frontend unless replacement is intended.
- Do not depend on `node_modules` being part of the template output.
- Do not confuse Web UI with Web API; they are separate component choices.
:::

## Next Steps

- [Starter Kits](/getting-started/starter-kits)
- [forj dev](/developer-tools/forj-dev)
- [HTTP Server](/operations/http-server)
