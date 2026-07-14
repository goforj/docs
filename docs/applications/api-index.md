---
title: API Index
description: How GoForj discovers and safely publishes App-scoped HTTP API metadata.
---

# API Index

The API Index is the source-derived contract for one App's HTTP surface.

It records discovered operations, handler identities, middleware, request inputs, response outputs, typed schemas, human-authored metadata, and deterministic diagnostics. GoForj projects that contract into OpenAPI output.

## Generate the Contract

The normal path is:

```bash
forj build
```

`forj build` refreshes generated components, runs Wire, prepares the API artifacts, compiles the App, and publishes the prepared artifacts only after compilation succeeds.

Use the focused command when you only need the contract artifacts:

```bash
forj build:api-index
```

For a named App, prefix either command:

```bash
forj marketplace build
forj marketplace build:api-index
```

## App-Scoped Outputs

The default App writes:

```text
build/api_index.json
build/api_index.diagnostics.json
build/openapi.json
```

A named App writes:

```text
build/marketplace/api_index.json
build/marketplace/api_index.diagnostics.json
build/marketplace/openapi.json
```

Manifest version 2 keeps operations, typed schemas, metadata, and diagnostics in one canonical API index.

Apps without Web API support do not have an HTTP contract. Indexing a known CLI-only App removes stale App-scoped API artifacts instead of preserving an obsolete contract.

The focused command reports the selected App, whether the generation changed, and operation, schema, and diagnostic counts:

```text
app marketplace, changed, 12 operations, 9 schemas, 0 diagnostics
```

## Diagnostics and Strict Mode

Normal indexing publishes a valid contract when it contains warnings, and writes those warnings to the diagnostics artifact. Errors prevent publication.

Use strict mode in CI when warnings should also fail the command:

```bash
forj build:api-index --strict
forj marketplace build:api-index --strict
```

The complete build and source-run pipelines use a more specific flag:

```bash
forj build --api-index-strict
forj run --api-index-strict
```

A strict failure does not replace the last successfully published artifact set.

Diagnostics include stable codes and source locations when GoForj cannot prove a route, input, response, schema, metadata, or middleware policy from source. Review `api_index.diagnostics.json` when an operation or schema is missing or less specific than expected.

## Build Tags

The focused command accepts a comma-separated tag list:

```bash
forj build:api-index --tags dev,integration
```

For a complete build, pass the normal Go build tag flag:

```bash
forj build --api-index-strict -tags=dev,integration
```

GoForj applies the same tag selection to route discovery and focused Go type loading. It rejects build modes it cannot mirror safely rather than publishing a contract for a different source surface than the binary.

## What GoForj Infers

API indexing follows the App's route composition and conventional GoForj handlers. It can infer:

- HTTP method, path, handler, and middleware
- path, query, header, and cookie inputs
- request bodies bound through conventional `web.Context` handlers
- response status, media type, and body shape
- typed schemas and validation constraints that are statically visible
- handler prose, tags, and explicit OpenAPI metadata

The generated contract contains only behavior justified by source. Unresolved expressions become diagnostics or unconstrained output instead of guessed API claims.

Handler comments can refine human-facing OpenAPI metadata:

```go
// Create provisions an account.
//
// @openapi.summary Register an account
// @openapi.description Creates the primary account record.
// @openapi.tag Accounts
func (c *Controller) Create(ctx web.Context) error {
    // ...
}
```

Supported directives include `@openapi.summary`, `@openapi.description`, `@openapi.tag`, `@openapi.tags`, and `@openapi.security`. Security directives must name a configured scheme, such as `authAccess` in an Auth-enabled App, or `none` for an intentionally public operation. Invalid or contradictory directives produce diagnostics.

## Safe Publication

The three artifacts form one generation:

- `build:api-index` publishes all three files under one coordinated writer operation after indexing succeeds.
- `build` retains the previous generation until the App compiles.
- `run` retains the previous generation until the OS process-start boundary succeeds. It does not wait for runtime readiness.
- identical output is left untouched.
- concurrent publishers cannot interleave artifact generations, and ordinary publication failures roll back files already replaced.

This means a failed compile or process-start attempt cannot replace the last working API contract with candidate output from a broken App.

## Current Limits

API indexing analyzes source. It does not execute the runtime router or record traffic.

Dynamic route registration, computed status codes, indirect response construction, reflection-heavy contracts, and other behavior that is not statically visible can remain unresolved. Keep that behavior explicitly documented and tested.

WebSocket routes are visible to route tooling but are not projected as OpenAPI HTTP operations.

## Common Mistakes

::: warning Common mistakes
- Do not hand-edit generated API artifacts.
- Do not assume API indexing replaces route or authorization tests.
- Do not ignore diagnostics when generated operations are missing or unconstrained.
- Do not index with different build tags than the binary.
:::

## Next Steps

- [OpenAPI](/applications/openapi)
- [Routes](/applications/routes)
- [Generated Files](/reference/generated-files)
- [Web](/web)
