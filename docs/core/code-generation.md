---
title: Code Generation
description: How GoForj generates framework-owned App code while preserving explicit application ownership.
---

# Code Generation

GoForj uses code generation to keep Apps consistent without introducing runtime reflection or hidden containers.

Generated code is ordinary Go. It can be read, tested, built, and debugged like any other App code.

## Generation Contract

The primary project rendering contract is:

```text
.goforj.yml
```

This file records selected components, starter kit choices, module path, App development lifecycles, custom watches, Wire paths, and module replacements.

Environment variables also influence generation for driver support and named resources.

## Normal Build Path

Use:

```bash
forj build
```

`forj build` runs:

1. generated component refresh
2. Wire generation
3. API indexing
4. Go build

This is the safest command when you want source and binary output to agree.

## Focused Generation

The normal path is `forj build`.

::: info Dev Loop
During `forj dev`, the generated build watcher normally runs `forj build` for you.
:::

Use focused generation only when you intentionally want to refresh one generated component family without running the full build:

```bash
forj generate --cache
forj generate --storage
forj generate --queue
forj generate --events
forj generate --db
forj generate --observability
```

Run `forj generate` without flags to refresh available generators for the current App.

## Generated File Ownership

Generated files are not all owned the same way.

| File Type | How To Treat It |
| --- | --- |
| Files marked `DO NOT EDIT` | Regenerate instead of editing. |
| Render-once files | Edit as App-owned extension points after initial render. |
| Generated READMEs | Use as local ownership guides for emitted packages. |
| `wire_gen.go` | Never edit by hand. Change providers and regenerate. |

This distinction keeps generated App code explicit without making every file disposable.

## What Generation Produces

Depending on selected components, generation can produce:

- managers and named accessors
- driver imports and factories
- environment-backed config structs
- Wire provider sets and injectors
- route indexes
- API indexes
- app and runtime observability metadata
- local component READMEs
- command, job, event, and scheduler surfaces

## Driver Support

Generation separates compile-time support from runtime selection.

Example:

```text
STORAGE_SUPPORTED_DRIVERS=local,s3
STORAGE_DRIVER=local
STORAGE_UPLOADS_DRIVER=s3
```

Generation imports local and S3 support. Runtime configuration selects the default disk and named `uploads` disk.

## When To Regenerate

Generated code should be refreshed after changing:

- `.goforj.yml`
- selected components
- supported driver lists
- named cache, storage, queue, event, mail, or database scopes
- provider sets
- generated Wire inputs
- observability topology

Use `forj build` when unsure.

::: info Dev Loop
During `forj dev`, the generated build watcher normally runs `forj build` for you.
:::

## Common Mistakes

::: warning Common mistakes
- Do not edit generated accessors to add resources manually.
- Do not edit `wire_gen.go`.
- Do not assume all generated files are safe to overwrite.
- Do not put business logic in generated framework glue.
- Do not forget regeneration after changing named resource environment variables.
:::

## Next Steps

- [Generated Components](/core/generated-components) explains component-level generation.
- [Generated Extension Points](/core/generated-extension-points) explains where to add App behavior.
- [Dependency Injection](/core/dependency-injection) explains Wire generation.
