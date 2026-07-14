---
title: OpenAPI
description: How generated GoForj Apps produce and serve App-scoped OpenAPI 3.0 output.
---

# OpenAPI

GoForj projects the App's indexed HTTP contract into an OpenAPI 3.0.3 document.

The generated HTTP runtime can serve that document through a version-pinned Scalar API reference.

## Generate the Document

Run the complete build:

```bash
forj build
```

Or refresh only the API contract:

```bash
forj build:api-index
```

For a named App:

```bash
forj marketplace build
forj marketplace build:api-index
```

The default App writes `build/openapi.json`. A named App writes `build/<app>/openapi.json`.

The API index, diagnostics, and OpenAPI document are coordinated as one artifact generation. During `build` and `run`, GoForj preserves the last successful generation until the new App compiles or the OS process-start boundary succeeds. Publication does not wait for runtime readiness.

## API Reference Routes

When HTTP and Swagger support are enabled, the generated runtime serves:

```text
GET /swagger
GET /swagger/
GET /swagger/doc.json
```

`/swagger` serves the Scalar UI. `/swagger/doc.json` serves the OpenAPI JSON.

The active App automatically selects its own document:

- default App: `build/openapi.json`
- named App: `build/<app>/openapi.json`

A named App never falls back to the default App document. If its artifact is missing, `/swagger/doc.json` returns a JSON `404` with the exact `forj <app> build:api-index` command needed to create it.

## Configuration

Enable the generated API reference routes with:

```text
API_SWAGGER_ENABLED=true
```

Legacy fallback:

```text
SWAGGER_ENABLED=true
```

`OPENAPI_SPEC_PATH` is an explicit serving override for an arbitrary document path:

```text
OPENAPI_SPEC_PATH=build/contracts/public.json
```

Do not set it merely to select a named App. The generated runtime already uses the active App identity.

## Improve Generated Metadata

GoForj derives operation summaries and descriptions from handler comments. Use `@openapi.*` directives when the prose, tag, or security policy needs an explicit value:

```go
// Show returns an account visible to the current session.
//
// @openapi.summary Get an account
// @openapi.tag Accounts
func (c *Controller) Show(ctx web.Context) error {
    // ...
}
```

Typed request and response schemas come from source-visible handler behavior. GoForj preserves uncertainty instead of inventing required fields, media types, response codes, or authorization guarantees. An `@openapi.security` directive must name a configured scheme, such as `authAccess` in an Auth-enabled App, or `none` for an intentionally public operation.

See [API Index](/applications/api-index) for supported directives, strict diagnostics, and build-tag behavior.

## CI Policy

Fail on warnings as well as errors when API contract completeness is required:

```bash
forj build:api-index --strict
```

For the full compile boundary:

```bash
forj build --api-index-strict
```

GoForj also includes a hidden maintainer command:

```bash
forj test:openapi
```

It validates generated OpenAPI behavior, generates a client with the framework-pinned generator image, and compiles that client. Normal App development and CI should use `build:api-index --strict` or `build --api-index-strict`.

## Current Limits

OpenAPI output is only as specific as the behavior GoForj can justify from source.

Dynamic registration, computed response behavior, and unusual indirection may produce diagnostics or intentionally broad schemas. OpenAPI output does not replace runtime route, validation, authorization, or integration tests.

WebSocket routes are not represented as OpenAPI HTTP operations.

## Common Mistakes

::: warning Common mistakes
- Do not edit `build/openapi.json` by hand.
- Do not set `OPENAPI_SPEC_PATH` just to serve a named App's normal artifact.
- Do not assume generated security metadata proves runtime authorization behavior.
- Do not expose the API reference where deployment policy disables it.
- Do not ignore API index diagnostics when an operation is missing or broad.
:::

## Next Steps

- [API Index](/applications/api-index)
- [HTTP Services](/applications/http-services)
- [Routes](/applications/routes)
- [Generated Files](/reference/generated-files)
