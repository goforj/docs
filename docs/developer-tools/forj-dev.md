---
title: forj dev
description: How forj dev runs local development watchers, pre-tasks, rebuilds, rerenders, and Lighthouse devwatch output.
---

# forj dev

`forj dev` runs the generated local development workflow from `.goforj.yml`.

It is watcher and orchestration tooling. Runtime behavior still belongs to generated app commands such as `app`, `api`, `worker`, and `scheduler`.

## What It Uses

`forj dev` reads:

```text
.goforj.yml
```

The `dev` section can define:

- pre-tasks
- watcher commands
- auto-migrate behavior
- down-on-exit behavior
- frontend dependency setup
- watcher output behavior

## Typical Generated Watchers

Generated Projects commonly include:

- a build watcher, which runs the app build
- a run watcher, which runs the combined app runtime
- frontend watchers when Web UI or a frontend `npm run dev` script is present

The build watcher excludes generated Wire output to avoid self-trigger loops.

## Multi-App Projects

For a single-app Project, `forj dev` builds and runs the default app.

For a multi-app Project, unqualified `forj dev` orchestrates discovered apps together. This keeps local development close to the deployed shape without requiring manual port edits.

Use an app prefix to focus one app:

```bash
forj billing dev
```

Named apps get deterministic runtime ports from generated app metadata, so the default app and named apps can run together locally.

## Environment Changes

`.env` changes are a dev supervisor concern.

When environment changes require generated code or runtime restart, `forj dev` coordinates rebuild and watcher restart behavior rather than making generated App code discover stale watcher state.

## Lighthouse Devwatch

When Lighthouse/devwatch support is enabled, watcher output can stream into Lighthouse as a devwatch source.

The goal is transcript-first development output: watcher events, command output, rebuilds, restarts, and errors should be visible as a useful development transcript.

## Control Flow

`forj dev` can respond to development controls such as:

- restart watchers
- rebuild apps and restart watchers
- render the Project and restart watchers
- run ad hoc shell commands without interleaving watcher output into unreadable noise

On interrupt, it stops watchers and can run configured down tasks when `dev.down_on_exit` is enabled.

## Common Mistakes

::: warning Common mistakes
- Do not treat `forj dev` as the production process manager.
- Do not put app runtime policy into watcher code.
- Do not assume every change needs a full render; many changes only need build or restart.
- Do not use `~` in `render.module_replaces`; use absolute paths.
- Do not fix generated App issues only in a rendered smoke target if the durable fix belongs in templates or generators.
:::

## Next Steps

- [Quickstart](/getting-started/quickstart)
- [Code Generation](/core/code-generation)
- [Rendered App Smoke Tests](/testing/rendered-app-smoke-tests)
