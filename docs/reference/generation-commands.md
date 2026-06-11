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

## Make Command Removal

Use `--remove` when you need to undo a resource created by a make command:

```bash
forj make:controller reports --remove
forj make:command reports:sync --remove
forj make:job reports:generate --remove
forj make:schedule reports:daily --remove
forj make:event reports:report-generated --remove
forj make:subscriber reports:report-generated --remove
forj make:model reports --package reports --remove
forj make:migration create_reports --remove
forj make:queue reports --remove
```

Pass the same placement or resource options you used during creation, such as `-d`, `--package`, `--connection`, or `--bus`.

Use `--dry-run` to preview removal without writing files:

```bash
forj make:job reports:generate --remove --dry-run
```

After removal, run `forj build` to catch any remaining App references to deleted types or resources.

## Render

`forj render` is mainly a framework/template workflow command. It renders project files from `.goforj.yml` and selected components.

Use it intentionally. Many App changes only need `forj build`.

## When To Regenerate

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
- [Generated Components](/core/generated-components)
- [Make Commands](/core/make-commands)
- [Rendered App Smoke Tests](/testing/rendered-app-smoke-tests)
