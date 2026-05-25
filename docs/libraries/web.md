---
title: Web
repoSlug: web
repoUrl: https://github.com/goforj/web
---

# Web

`github.com/goforj/web` provides app-facing HTTP abstractions, middleware, adapters, testing helpers, route indexing, and Prometheus integration for Go services.

It is the server-side HTTP library used by generated GoForj Apps. It gives application code a small routing and request context contract while allowing the framework and adapters to own lower-level HTTP server concerns.

## Using With GoForj

Generated GoForj Apps use `web` through the generated HTTP runtime, application route registry, and controllers under `internal/http`, `internal/router`, and feature packages such as `internal/hello`.

Use App-level guides first when building a generated App:

- [HTTP Services](/applications/http-services) for controllers, route groups, health checks, readiness, metrics, and `route:list`.
- [Generated Components](/core/generated-components) for how HTTP support is rendered into an App.
- [Dependency Injection](/core/dependency-injection) for how controllers and HTTP services are wired.

Use this page when you need package-level behavior: route types, middleware composition, testing helpers, adapters, route indexing, or direct standalone usage.

## Install

```bash
go get github.com/goforj/web
```

## Standalone Quick Start

```go
package main

import (
	"log"
	"net/http"

	"github.com/goforj/web"
	"github.com/goforj/web/adapter/echoweb"
	"github.com/goforj/web/webmiddleware"
)

func main() {
	adapter := echoweb.New()
	router := adapter.Router()

	router.Use(
		webmiddleware.Recover(),
		webmiddleware.RequestID(),
	)

	router.GET("/healthz", func(c web.Context) error {
		return c.Text(http.StatusOK, "ok")
	})

	log.Fatal(http.ListenAndServe(":8080", adapter))
}
```

## Route Groups

```go
routes := []web.Route{
	web.NewRoute(http.MethodGet, "/users/:id", showUser),
	web.NewRoute(http.MethodPost, "/users", createUser),
}

group := web.NewRouteGroup("/api", routes)

adapter := echoweb.New()
_ = web.RegisterRoutes(adapter.Router(), []web.RouteGroup{group})
```

In generated Apps, route groups are usually registered from feature packages and mounted by the generated router. Standalone users can register route groups directly against an adapter.

## Testing Handlers

```go
req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
ctx := webtest.NewContext(req, nil, "/healthz", nil)

handler := webmiddleware.RequestID()(func(c web.Context) error {
	return c.Text(http.StatusOK, "ok")
})

_ = handler(ctx)

fmt.Println(ctx.StatusCode())
fmt.Println(ctx.Response().Header().Get("X-Request-ID") != "")
```

## Packages

- `web` defines the app-facing interfaces, route registration helpers, and route reporting helpers.
- `adapter/echoweb` provides the Echo-backed adapter and server bootstrap.
- `webmiddleware` provides common HTTP middleware for auth, request lifecycle, payloads, rate limiting, recovery, static files, and security.
- `webprometheus` provides Prometheus middleware and scrape handlers.
- `webindex` provides route manifest and OpenAPI index generation.
- `webtest` provides lightweight handler testing helpers.

## Web And HTTPX

`web` and [HTTPX](/httpx) solve different problems.

Use `web` for server-side routing, controllers, middleware, handler tests, and generated App HTTP integration. Use `httpx` for lower-level HTTP client and HTTP utility behavior.

## API Reference

The package API is available on [pkg.go.dev/github.com/goforj/web](https://pkg.go.dev/github.com/goforj/web).
