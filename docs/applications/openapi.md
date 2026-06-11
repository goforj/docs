---
title: OpenAPI
description: How generated GoForj Apps produce and serve OpenAPI output.
---

# OpenAPI

GoForj can generate OpenAPI output from the App's indexed HTTP surface.

The generated HTTP runtime can serve the OpenAPI document through a built-in API reference route.

## Generated Output

The default OpenAPI path is:

```text
build/openapi.json
```

Named apps write app-scoped OpenAPI output:

```text
build/billing/openapi.json
```

Run:

```bash
forj build
```

to refresh generated components, Wire, API indexing, OpenAPI output, and the binary.

For a named app, use the app prefix when refreshing that app directly:

```bash
forj billing api-index
```

## Swagger/API Reference Route

When HTTP is enabled, the generated HTTP runtime can serve:

```text
GET /swagger
GET /swagger/
GET /swagger/doc.json
```

`/swagger` serves the API reference UI. `/swagger/doc.json` serves the OpenAPI JSON.

## Configuration

Swagger/API reference serving is controlled by:

```text
API_SWAGGER_ENABLED=true
```

Legacy fallback:

```text
SWAGGER_ENABLED=true
```

The OpenAPI spec path can be overridden:

```text
OPENAPI_SPEC_PATH=build/openapi.json
```

For a named app, point the runtime at that app's output when overriding the path:

```text
OPENAPI_SPEC_PATH=build/billing/openapi.json
```

## Validation

GoForj includes a maintainer validation command for generated OpenAPI behavior:

```bash
forj test:openapi
```

This command is hidden and intended for framework validation rather than normal App development.

## Current Limits

OpenAPI output depends on what API indexing can infer from the source.

Use conventional route/controller patterns when you want strong generated metadata. Keep unusual dynamic behavior documented and tested.

## Common Mistakes

::: warning Common mistakes
- Do not edit `build/openapi.json` by hand.
- Do not assume OpenAPI output proves runtime authorization behavior.
- Do not expose Swagger in environments where your deployment policy disables it.
- Do not ignore diagnostics when generated operations are missing.
:::

## Next Steps

- [API Index](/applications/api-index)
- [HTTP Services](/applications/http-services)
- [Routes](/applications/routes)
