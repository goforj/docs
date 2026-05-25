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
- [Generated Files](/reference/generated-files)

## Runtime Readiness Errors

Likely causes:

- database unavailable
- required cache or storage backend unavailable
- queue backend unavailable
- wrong driver selected for environment
- diagnostic token missing for detailed readiness output

Start with:

- [Health And Readiness](/operations/health-readiness)
- [Driver Selection](/data/driver-selection)
- [Environment Variables](/reference/env-vars)

## API Index And OpenAPI Errors

Likely causes:

- route/controller shape cannot be inferred
- generated output path unavailable
- OpenAPI diagnostics need review
- unusual dynamic route behavior

Start with:

- [API Index](/applications/api-index)
- [OpenAPI](/applications/openapi)
- [Routes](/applications/routes)

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
