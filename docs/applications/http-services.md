---
title: HTTP Services
description: Build HTTP services in a generated GoForj App using controllers, route groups, and the web abstraction.
---

# HTTP Services

HTTP services in GoForj are built from generated HTTP runtime code, application controllers, route groups, middleware, and the `web` abstraction.

The framework owns server composition and runtime behavior. Application code owns routes, controllers, services, validation, and response decisions.

## When To Use It

Use HTTP services when your App exposes APIs, web endpoints, health checks, readiness probes, frontend assets, Lighthouse, Swagger, or metrics.

Use a controller when a route needs request translation, validation, or a call into application services. Keep business workflows in services rather than in HTTP runtime setup.

## Where It Lives

HTTP-related generated code usually lives in:

```text
internal/http
app/routes.go
```

Application controllers live in application-owned packages, for example:

```text
internal/users
internal/reports
internal/uploads
```

The generated sample controller is:

```text
internal/hello/controller.go
```

## Runtime Commands

Run the HTTP server directly:

```bash
forj api
```

Run all enabled local runtimes together:

```bash
forj app
```

List registered routes:

```bash
forj route:list
```

For a named app, prefix the app name:

```bash
forj billing api
forj billing route:list
```

## Server Configuration

The HTTP runtime reads:

```text
API_HTTP_HOST=0.0.0.0
API_HTTP_PORT=3000
HTTP_ACCESS_LOG_ENABLED=true
```

When metrics are enabled, the dedicated API metrics endpoint can use:

```text
METRICS_API_PORT=9100
```

## Controller Shape

Controllers group related route handlers and translate HTTP requests into service calls.

Example shape:

```go
package users

import (
	"net/http"

	"github.com/goforj/web"
)

type Controller struct {
	service *Service
}

func NewController(service *Service) *Controller {
	return &Controller{service: service}
}

func (c *Controller) Routes() []web.Route {
	return []web.Route{
		web.NewRoute(http.MethodGet, "/users/:id", c.Show),
	}
}

func (c *Controller) Show(ctx web.Context) error {
	user, err := c.service.Find(ctx.Context(), ctx.Param("id"))
	if err != nil {
		return err
	}
	return ctx.JSON(http.StatusOK, user)
}
```

The exact response helpers available come from the `web` package. Use the generated App pattern first, then go to [Web](/web) for server-side primitive details or [HTTPX](/httpx) for lower-level HTTP utility behavior.

## Route Registration

Generated apps collect routes through `app/routes.go`. Named apps use `app/<name>/routes.go`.

The route file builds public and protected route groups and mounts them under `/api/v1` by default.

The generated shape is:

```go
func ProvideAppRoutes(
	helloController *hello.Controller,
) *AppRoutes {
	return &AppRoutes{
		public: helloController.Routes(),
	}
}
```

When auth is enabled, protected route groups are wrapped with auth middleware.

## Framework Routes

The HTTP server also registers framework-owned routes.

Common framework routes include:

- `GET /-/health`
- `GET /-/ready`
- `GET /swagger`
- `GET /swagger/doc.json`
- `GET /metrics` when metrics are enabled
- Lighthouse routes when Lighthouse is enabled

Application route docs should not treat these as user-owned routes.

## Health and Readiness

Use liveness for process health:

```bash
curl http://localhost:3000/-/health
```

Use readiness for dependency readiness:

```bash
curl http://localhost:3000/-/ready
```

Authorized readiness can expose structured dependency checks when called with:

```text
Authorization: Bearer $APP_DIAG_TOKEN
```

Unauthenticated readiness intentionally avoids leaking raw infrastructure errors.

## Observability

The HTTP runtime can record:

- access logs
- route registration summary
- request metrics
- inspect records
- local HTTP error response bodies in local environments

Use `route:list` for the full route table instead of relying on startup logs for complete route visibility.

## Common Mistakes

::: warning Common mistakes
- Do not put business workflows in `internal/http`.
- Do not bypass `web` route registration with scattered low-level HTTP setup.
- Do not edit framework route registration to add application endpoints.
- Do not expose detailed readiness errors without `APP_DIAG_TOKEN`.
- Do not assume `api` is the only runtime shape; `app` can host HTTP with workers and scheduler locally.
:::

## Next Steps

- [Routes](/applications/routes) covers route registration in depth.
- [Controllers](/applications/controllers) covers controller patterns.
- [Runtime Topology](/core/runtime-topology) explains combined and split runtime processes.
- [Web](/web) covers the standalone server-side HTTP package.
