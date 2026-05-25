---
title: Generation Commands
description: Lookup reference for GoForj code generation commands.
---

# Generation Commands

Generation refreshes framework-owned App code and derived files.

Use `forj build` when unsure.

## Full Build Pipeline

```bash
forj build
```

Runs:

1. generated component refresh
2. Wire generation
3. API indexing
4. Go build

## Focused Generation

The normal regeneration path is `forj build`.

::: info Dev Loop
During `forj dev`, the generated build watcher normally runs `forj build` for you.
:::

Use focused generation when you intentionally want to refresh one generated surface without a full build:

```bash
forj generate --cache
forj generate --storage
forj generate --queue
forj generate --events
forj generate --db
forj generate --mail
forj generate --observability
```

Running `forj generate` without flags refreshes available generators for the current App.

## Render

`forj render` is mainly a framework/template workflow command. It renders project files from `.goforj.yml` and selected components.

Use it intentionally. Many App changes only need `forj build`.

## When To Regenerate

Generated code should be refreshed after changing:

- supported driver lists
- named caches, disks, queues, event buses, mailers, or DB connections
- provider sets or Wire inputs
- generated component selection
- observability target configuration
- `.goforj.yml` render settings

Use `forj build` when unsure.

## Related Pages

- [Code Generation](/core/code-generation)
- [Generated Components](/core/generated-components)
- [Rendered App Smoke Tests](/testing/rendered-app-smoke-tests)
