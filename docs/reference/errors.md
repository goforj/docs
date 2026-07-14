---
title: Errors
description: Common GoForj error categories and where to investigate them.
---

# Errors

This page groups common error categories and where to investigate them.

Use exact error messages from your terminal, logs, readiness output, metrics, and inspects when debugging.

## Generation Errors

Likely causes:

- unsupported driver selected
- named resource environment and generated code are out of sync
- invalid `.goforj.yml`
- generated file cannot be written
- Go module replacement path is invalid

Start with:

- [Generated Components](/core/generated-components)
- [Generation Commands](/reference/generation-commands)
- [Configuration Reference](/reference/configuration)

## Wire Errors

Likely causes:

- missing provider
- duplicate provider
- changed constructor not added to a provider set
- generated component shape changed without regeneration

Start with:

- [Dependency Injection](/core/dependency-injection)
- [Providers](/core/providers)
- [Wiring Recipes](/core/wiring-recipes)
- [Reading Wire Errors](/core/reading-wire-errors)
- [Generated Files](/reference/generated-files)

## Runtime Readiness Errors

Likely causes:

- database unavailable
- required cache or storage backend unavailable
- queue backend unavailable
- wrong driver selected for environment
- diagnostic token missing for detailed readiness output

Start with:

- [Health and Readiness](/operations/health-readiness)
- [Driver Selection](/data/driver-selection)
- [Environment Variables](/reference/env-vars)

## API Index and OpenAPI Errors

Likely causes:

- strict mode promoted an inference warning to a failure
- the selected Web API App has no conventional route composition file
- duplicate operations claim the same method and path
- source or build flags cannot be mirrored safely
- an artifact path or publication lock is unavailable
- unusual dynamic route or response behavior cannot be inferred

Start with:

- [API Index](/applications/api-index)
- [OpenAPI](/applications/openapi)
- [Routes](/applications/routes)

## Backup and Restore Errors

Likely causes:

- native MySQL, MariaDB, or PostgreSQL client tools are missing
- a selected durable resource uses an unsupported driver
- the manifest or an artifact checksum does not verify
- native source and target database drivers differ
- a portable archive does not match the target migrations or schema
- an S3 App storage backup contains metadata only and cannot restore objects
- destructive restore is missing `--confirm restore-production`

Start with:

- [Backup and Restore](/operations/backups)
- [Driver Selection](/data/driver-selection)
- [Environment Variables](/reference/env-vars)

## Dev Watcher Errors

Likely causes:

- watcher command failed
- build failed before runtime restart
- `.env` changed and triggered rebuild
- frontend dependencies missing
- `render.module_replaces` path invalid

Start with:

- [forj dev](/developer-tools/forj-dev)
- [Rendered App Smoke Tests](/testing/rendered-app-smoke-tests)
- [Configuration Reference](/reference/configuration)
