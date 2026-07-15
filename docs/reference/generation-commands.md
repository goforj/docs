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
When this App is listed in `dev.apps`, its build lifecycle normally runs `forj build` for you.
:::

Use focused generation when you intentionally want to refresh one generated surface without a full build:

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

Availability comes from the component contract in `.goforj.yml`. Cache, Storage, Events, and Queue generation run only when Cache, File Storage, Events, and Background Jobs are enabled. An explicit flag for a disabled component returns an error rather than recreating a package outside that contract.

`forj build:api-index` is the focused API contract command. It publishes the API index, diagnostics, and OpenAPI document together. Use `--strict` in CI and prefix the command for a named App:

```bash
forj marketplace build:api-index --strict
```

## App Generation

Create a named app when the Project needs another runnable boundary:

```bash
forj make:app marketplace
forj make:app billing --components web-api,jobs --dev-run run
forj make:app backstage --components web-api,scheduler --starter-kit vue
forj make:app customer-portal --without web-ui --skip-wire
```

These are alternative creation shapes. Each App name can be created only once.

`make:app` creates the app entrypoint and composition files:

```text
cmd/marketplace/main.go
app/marketplace/
app/marketplace/wire/
```

It also records App component choices under `apps` in `.goforj.yml`, writes App-scoped local env defaults, and refreshes generated runtime App metadata.

The interactive wizard asks whether `forj dev` should run the App. Runtime-capable wizard Apps default to `run`; CLI-only or disabled Apps remain absent from `dev.apps`. For noninteractive creation, pass `--dev-run run` explicitly when the App should participate in the dev lifecycle.

Remove conventional generated app files with:

```bash
forj make:app marketplace --remove
```

Removal is conservative. It removes conventional app files and metadata, but it does not delete app migrations or unknown files inside the command package.

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

## When to regenerate

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
