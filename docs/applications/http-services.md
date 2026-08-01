---
title: HTTP Services
description: Orient an HTTP service around its runtime, route composition, controllers, configuration, and operations.
---

# HTTP Services

An HTTP service in GoForj combines an App-owned route registry and controllers with the framework-managed HTTP runtime. Application code owns endpoint behavior; the Framework owns server composition, startup, shutdown, health, readiness, and supported observability.

This page is the map through that system. Follow [JSON API Route](/scenarios/json-api-route) for the canonical runnable implementation.

## Ownership

The generated HTTP capability normally divides responsibility this way:

| Concern | Owner |
| --- | --- |
| Route grouping and exposure | `app/routes.go` or `app/<name>/routes.go` |
| Request translation and responses | Controllers under `internal/...` |
| Business workflows | Application services under `internal/...` |
| HTTP server and runtime policy | Generated `internal/http` code |
| Controller construction | The owning app's Wire graph |

The exact app and provider files depend on selected components. Use the generated files and local READMEs as the ownership map for the Project in front of you.

Keep controllers thin: bind and validate request input, call application services, and shape the HTTP response. Do not move business workflows into route registration, middleware, or server bootstrap.

## Build One Endpoint

Use [JSON API Route](/scenarios/json-api-route) for the complete controller, service, test, build, route-list, startup, and request workflow.

The supporting guides each own one contract:

- [Controllers](/applications/controllers) owns handler structure, constructor injection, request context, and controller generation.
- [Routes](/applications/routes) owns route composition, groups, protection, naming, and route discovery.
- [Requests and Validation](/applications/requests-validation) owns request input boundaries.
- [Responses and Errors](/applications/responses-errors) owns response and error behavior.
- [Middleware](/applications/middleware) owns request policy around handlers and route groups.

These pages link back to the runnable scenario instead of maintaining another end-to-end copy.

## Run the HTTP Runtime

During development from current source, run only HTTP:

```bash
forj api
```

Run all enabled local runtimes together:

```bash
forj app
```

For an additional app:

```bash
forj admin api
```

Deployment and process supervision run the built artifact:

```bash
./bin/app api
```

The HTTP runtime starts the generated server, registers framework and application routes, and participates in the app's graceful-shutdown lifecycle. See [HTTP Server](/operations/http-server) for production startup, shutdown, timeouts, and failure modes.

## Configure the Server

The common local settings are:

```dotenv
API_HTTP_HOST=0.0.0.0
API_HTTP_PORT=3000
HTTP_ACCESS_LOG_ENABLED=true
```

Additional apps can override base settings with their uppercase app prefix, such as `ADMIN_API_HTTP_PORT`.

The [Environment Reference](/reference/env-vars#http-and-openapi) owns the complete HTTP and OpenAPI variable contract. [Configuration](/getting-started/configuration) explains when an environment change needs only a restart and when generated code requires a rebuild.

## Compose and Inspect Routes

Controllers return `web.Route` values. The owning app combines them into route groups, normally under `/api/v1`, and applies shared middleware at the group boundary.

List the complete registered table:

```bash
forj route:list
```

For an additional app:

```bash
forj admin route:list
```

Use this output as the source of truth for route registration. Startup logs may summarize HTTP behavior, but they are not the complete route reference.

The generated server also owns operational endpoints such as health, readiness, API reference, metrics, and Lighthouse routes when their components are enabled. Application route registration should not replace or repurpose them.

## Verify Runtime Health

Check process liveness:

```bash
curl http://localhost:3000/-/health
```

Check dependency readiness:

```bash
curl http://localhost:3000/-/ready
```

Unauthenticated readiness avoids exposing raw infrastructure errors. A request authorized with the configured diagnostic token can receive structured dependency checks:

```text
Authorization: Bearer $APP_DIAG_TOKEN
```

## Observe HTTP Behavior

When the corresponding components and settings are enabled, the HTTP runtime can emit:

- access logs
- request metrics
- Inspect records
- route and API index data
- health and readiness status

Use stable route names and bounded labels. Never put secrets or unbounded user values in logs, metrics, or Inspects.

See [Logging](/operations/logging), [Metrics](/operations/metrics), [Inspects](/operations/inspects), and [Lighthouse](/operations/lighthouse) for their runtime contracts.

## Related Pages

- [JSON API Route](/scenarios/json-api-route) is the canonical runnable HTTP workflow.
- [Routes](/applications/routes) explains route composition.
- [Controllers](/applications/controllers) explains HTTP adapters around services.
- [HTTP Tests](/testing/http-tests) verifies endpoint behavior.
- [HTTP Server](/operations/http-server) covers production operation.
- [Web](/web) is the standalone `web` package reference.
