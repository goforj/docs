---
title: Generation Commands
description: Lookup reference for GoForj code generation commands.
---

# Generation Commands

This page is a command and flag lookup for refreshing framework-owned code and derived files.

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

During `forj dev`, an app listed in `dev.apps` rebuilds automatically.

Use focused generation when you need to refresh one component without a full build:

```bash
forj build:api-index
forj generate --cache
forj generate --storage
forj generate --queue
forj generate --events
forj generate --db
forj generate --mail
forj generate --observability
```

Running `forj generate` without flags refreshes available generators for the current App.

Availability comes from the selected components in `.goforj.yml`. Cache, Storage, Events, and Queue generation run only when Cache, File Storage, Events, and Background Jobs are enabled. An explicit flag for a disabled component returns an error rather than recreating a package outside that selection.

`forj build:api-index` is the focused API contract command. It publishes the API index, diagnostics, and OpenAPI document together. Use `--strict` in CI and prefix the command with the app name:

```bash
forj admin build:api-index --strict
```

## Creation and Removal Workflows

This reference does not duplicate each make command's files, injected code, and removal behavior:

- [Add Another App](/core/apps#add-another-app) covers `make:app`.
- [Make Commands](/core/make-commands) covers controllers, commands, jobs,
  schedules, events, subscribers, models, migrations, and queues.

## Render

`forj render` is mainly a framework/template workflow command. It renders project files from `.goforj.yml` and selected components.

Use it intentionally. Many App changes only need `forj build`.

## When to Regenerate

Generated code should be refreshed after changing:

- supported driver lists
- named caches, disks, queues, event buses, mailers, or DB connections
- provider sets or Wire inputs
- generated component selection
- app and runtime observability configuration
- `.goforj.yml` render settings

Use `forj build` when unsure.

## Related Pages

- [Code Generation](/core/code-generation)
- [Generated Components](/core/code-generation)
- [Make Commands](/core/make-commands)
- [Rendered App Smoke Tests](/testing/rendered-app-smoke-tests)
