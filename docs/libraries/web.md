---
title: Web
repoSlug: web
repoUrl: https://github.com/goforj/web
---

<p align="center">
  <img src="https://raw.githubusercontent.com/goforj/web/main/docs/assets/logo.png" width="300" alt="goforj/web logo">
</p>

<p align="center">
  Minimal app-facing HTTP abstractions, middleware, adapters, and route indexing for GoForj.
</p>

<p align="center">
  <a href="https://pkg.go.dev/github.com/goforj/web"><img src="https://pkg.go.dev/badge/github.com/goforj/web.svg" alt="Go Reference"></a>
  <a href="https://github.com/goforj/web/actions/workflows/ci.yml"><img src="https://github.com/goforj/web/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://golang.org"><img src="https://img.shields.io/badge/go-1.25+-blue?logo=go" alt="Go version"></a>
  <img src="https://img.shields.io/github/v/tag/goforj/web?label=version&sort=semver" alt="Latest tag">
  <a href="https://goreportcard.com/report/github.com/goforj/web"><img src="https://goreportcard.com/badge/github.com/goforj/web" alt="Go Report Card"></a>
  <a href="https://codecov.io/gh/goforj/web"><img src="https://codecov.io/gh/goforj/web/graph/badge.svg?token=Q0S6BVOM7R" alt="Codecov"></a>
<!-- test-count:embed:start -->
<img src="https://img.shields.io/badge/unit_tests-213-brightgreen" alt="Unit tests (executed count)">
<!-- test-count:embed:end -->
<!-- package-coverage:embed:start -->
<p align="center">
<img src="https://img.shields.io/badge/web-94.3%25-4c9a2a" alt="web coverage">
<img src="https://img.shields.io/badge/adapter--echoweb-90.0%25-4c9a2a" alt="adapter/echoweb coverage">
<img src="https://img.shields.io/badge/webindex-90.3%25-4c9a2a" alt="webindex coverage">
<img src="https://img.shields.io/badge/webmiddleware-89.2%25-4c9a2a" alt="webmiddleware coverage">
<img src="https://img.shields.io/badge/webprometheus-91.4%25-4c9a2a" alt="webprometheus coverage">
<img src="https://img.shields.io/badge/webtest-100.0%25-4c9a2a" alt="webtest coverage">
</p>
<!-- package-coverage:embed:end -->
</p>

`web` is built on top of [Echo](https://echo.labstack.com/), which is a fantastic HTTP framework with a fast router, strong middleware story, and a mature ecosystem. GoForj wraps it so applications can code against a smaller app-facing contract while still getting a high-quality underlying engine, reusable middleware packages, testing helpers, route indexing, and framework-owned integration points like Prometheus and generated wiring.

## Installation {#installation}

```bash
go get github.com/goforj/web
```

## Quick Start {#quick-start}

```go
package main

import (
	"fmt"
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
		// GET /healthz -> 200 ok
		return c.Text(200, "ok")
	})

	router.GET("/users/:id", func(c web.Context) error {
		// GET /users/42 -> 200 {"id":"42","name":"user-42"}
		return c.JSON(200, map[string]any{
			"id":   c.Param("id"),
			"name": fmt.Sprintf("user-%s", c.Param("id")),
		})
	})

	// Boot the HTTP server with the adapter as the final handler.
	log.Fatal(http.ListenAndServe(":8080", adapter))
}
```

## Common Patterns {#common-patterns}

### Route Groups {#route-groups}

```go
adapter := echoweb.New()
router := adapter.Router()

routes := []web.Route{
	web.NewRoute(http.MethodGet, "/healthz", func(c web.Context) error {
		// GET /api/healthz -> 204
		return c.NoContent(http.StatusOK)
	}),
	web.NewRoute(http.MethodGet, "/users", func(c web.Context) error {
		// GET /api/users -> 200 [{"id":1}]
		return c.JSON(http.StatusOK, []map[string]any{{"id": 1}})
	}),
}

group := web.NewRouteGroup("/api", routes)

if err := web.RegisterRoutes(router, []web.RouteGroup{group}); err != nil {
	panic(err)
}
```

### Use Middleware {#use-middleware}

```go
adapter := echoweb.New()
router := adapter.Router()

store := webmiddleware.NewRateLimiterMemoryStore(rate.Every(time.Second))

router.Use(
	webmiddleware.Recover(),
	webmiddleware.RequestID(),
	webmiddleware.RateLimiter(store),
)

router.GET("/api/messages", func(c web.Context) error {
	// GET /api/messages -> 200 [{"id":1,"subject":"Welcome"}]
	// Requests over the configured rate limit return 429.
	return c.JSON(200, []map[string]any{
		{"id": 1, "subject": "Welcome"},
	})
})
```

### Test A Route {#test-a-route}

```go
func TestHealthRoute(t *testing.T) {
	adapter := echoweb.New()
	router := adapter.Router()

	router.GET("/healthz", func(c web.Context) error {
		return c.Text(200, "ok")
	})

	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	rec := httptest.NewRecorder()

	adapter.ServeHTTP(rec, req)

	if rec.Code != 200 {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
	if strings.TrimSpace(rec.Body.String()) != "ok" {
		t.Fatalf("expected ok, got %q", rec.Body.String())
	}
	// rec.Code -> 200
	// rec.Body -> ok
}
```

### Expose Prometheus Metrics {#expose-prometheus-metrics}

```go
adapter := echoweb.New()
router := adapter.Router()

metrics := webprometheus.MustNew(webprometheus.Config{Namespace: "app"})

router.Use(metrics.Middleware())

router.GET("/users", func(c web.Context) error {
	// GET /users -> 204
	return c.NoContent(http.StatusOK)
})
router.GET("/metrics", metrics.Handler())
// GET /metrics -> Prometheus text exposition
```

### Generate A Route Index {#generate-a-route-index}

```go
_, err := webindex.Run(context.Background(), webindex.IndexOptions{
	Root:    ".",
	OutPath: "webindex.json",
})
if err != nil {
	panic(err)
}
// Writes webindex.json.
```

## Packages {#packages}

- `web`: app-facing interfaces, route registration, route reporting helpers
- `adapter/echoweb`: Echo-backed adapter and server bootstrap
- `webmiddleware`: grouped HTTP middleware for auth, routing, payloads, rate limiting, and more
- `webprometheus`: Prometheus middleware and scrape handler
- `webindex`: route manifest and OpenAPI index generation
- `webtest`: lightweight handler testing context

## API {#api}

<!-- api:embed:start -->
## API Index {#api-index}

| Group | Functions |
|------:|:-----------|
| **Adapter** | [Adapter.Echo](#echoweb-adapter-echo) [Adapter.Router](#echoweb-adapter-router) [Adapter.ServeHTTP](#echoweb-adapter-servehttp) [New](#echoweb-new) [NewServer](#echoweb-newserver) [Server.Router](#echoweb-server-router) [Server.Serve](#echoweb-server-serve) [Server.ServeHTTP](#echoweb-server-servehttp) [UnwrapContext](#echoweb-unwrapcontext) [UnwrapWebSocketConn](#echoweb-unwrapwebsocketconn) [Wrap](#echoweb-wrap) |
| **Indexing** | [Run](#webindex-run) |
| **Middleware<br>Auth** | [BasicAuth](#webmiddleware-basicauth) [BasicAuthWithConfig](#webmiddleware-basicauthwithconfig) [CSRF](#webmiddleware-csrf) [CSRFWithConfig](#webmiddleware-csrfwithconfig) [CreateExtractors](#webmiddleware-createextractors) [KeyAuth](#webmiddleware-keyauth) [KeyAuthWithConfig](#webmiddleware-keyauthwithconfig) |
| **Middleware<br>Compression** | [Compress](#webmiddleware-compress) [Decompress](#webmiddleware-decompress) [DecompressWithConfig](#webmiddleware-decompresswithconfig) [Gzip](#webmiddleware-gzip) [GzipWithConfig](#webmiddleware-gzipwithconfig) |
| **Middleware<br>Method Override** | [MethodFromForm](#webmiddleware-methodfromform) [MethodFromHeader](#webmiddleware-methodfromheader) [MethodFromQuery](#webmiddleware-methodfromquery) [MethodOverride](#webmiddleware-methodoverride) [MethodOverrideWithConfig](#webmiddleware-methodoverridewithconfig) |
| **Middleware<br>Path Rewriting** | [AddTrailingSlash](#webmiddleware-addtrailingslash) [AddTrailingSlashWithConfig](#webmiddleware-addtrailingslashwithconfig) [RemoveTrailingSlash](#webmiddleware-removetrailingslash) [RemoveTrailingSlashWithConfig](#webmiddleware-removetrailingslashwithconfig) [Rewrite](#webmiddleware-rewrite) [RewriteWithConfig](#webmiddleware-rewritewithconfig) |
| **Middleware<br>Payloads** | [BodyDump](#webmiddleware-bodydump) [BodyDumpWithConfig](#webmiddleware-bodydumpwithconfig) [BodyLimit](#webmiddleware-bodylimit) [BodyLimitWithConfig](#webmiddleware-bodylimitwithconfig) [ErrorBodyDump](#webmiddleware-errorbodydump) [ErrorBodyDumpWithConfig](#webmiddleware-errorbodydumpwithconfig) |
| **Middleware<br>Proxying** | [NewRandomBalancer](#webmiddleware-newrandombalancer) [NewRoundRobinBalancer](#webmiddleware-newroundrobinbalancer) [Proxy](#webmiddleware-proxy) [ProxyWithConfig](#webmiddleware-proxywithconfig) |
| **Middleware<br>Rate Limiting** | [NewRateLimiterMemoryStore](#webmiddleware-newratelimitermemorystore) [NewRateLimiterMemoryStoreWithConfig](#webmiddleware-newratelimitermemorystorewithconfig) [RateLimiter](#webmiddleware-ratelimiter) [RateLimiterMemoryStore.Allow](#webmiddleware-ratelimitermemorystore-allow) [RateLimiterWithConfig](#webmiddleware-ratelimiterwithconfig) |
| **Middleware<br>Redirects** | [HTTPSNonWWWRedirect](#webmiddleware-httpsnonwwwredirect) [HTTPSNonWWWRedirectWithConfig](#webmiddleware-httpsnonwwwredirectwithconfig) [HTTPSRedirect](#webmiddleware-httpsredirect) [HTTPSRedirectWithConfig](#webmiddleware-httpsredirectwithconfig) [HTTPSWWWRedirect](#webmiddleware-httpswwwredirect) [HTTPSWWWRedirectWithConfig](#webmiddleware-httpswwwredirectwithconfig) [NonWWWRedirect](#webmiddleware-nonwwwredirect) [NonWWWRedirectWithConfig](#webmiddleware-nonwwwredirectwithconfig) [WWWRedirect](#webmiddleware-wwwredirect) [WWWRedirectWithConfig](#webmiddleware-wwwredirectwithconfig) |
| **Middleware<br>Reliability** | [Recover](#webmiddleware-recover) [RecoverWithConfig](#webmiddleware-recoverwithconfig) |
| **Middleware<br>Request Lifecycle** | [ContextTimeout](#webmiddleware-contexttimeout) [ContextTimeoutWithConfig](#webmiddleware-contexttimeoutwithconfig) [DefaultSkipper](#webmiddleware-defaultskipper) [RequestID](#webmiddleware-requestid) [RequestIDWithConfig](#webmiddleware-requestidwithconfig) [RequestLoggerWithConfig](#webmiddleware-requestloggerwithconfig) [Timeout](#webmiddleware-timeout) [TimeoutWithConfig](#webmiddleware-timeoutwithconfig) |
| **Middleware<br>Security** | [CORS](#webmiddleware-cors) [CORSWithConfig](#webmiddleware-corswithconfig) [Secure](#webmiddleware-secure) [SecureWithConfig](#webmiddleware-securewithconfig) |
| **Middleware<br>Static Files** | [Static](#webmiddleware-static) [StaticWithConfig](#webmiddleware-staticwithconfig) |
| **Prometheus** | [Default](#webprometheus-default) [Handler](#webprometheus-handler) [Metrics.Handler](#webprometheus-metrics-handler) [Metrics.Middleware](#webprometheus-metrics-middleware) [Middleware](#webprometheus-middleware) [MustNew](#webprometheus-mustnew) [New](#webprometheus-new) [RunPushGatewayGatherer](#webprometheus-runpushgatewaygatherer) [WriteGatheredMetrics](#webprometheus-writegatheredmetrics) |
| **Route Reporting** | [BuildRouteEntries](#buildrouteentries) [RenderRouteTable](#renderroutetable) |
| **Routing** | [MountRouter](#mountrouter) [NewRoute](#newroute) [NewRouteGroup](#newroutegroup) [NewWebSocketRoute](#newwebsocketroute) [RegisterRoutes](#registerroutes) [Route.Handler](#route-handler) [Route.HandlerName](#route-handlername) [Route.IsWebSocket](#route-iswebsocket) [Route.Method](#route-method) [Route.MiddlewareNames](#route-middlewarenames) [Route.Middlewares](#route-middlewares) [Route.Path](#route-path) [Route.WebSocketHandler](#route-websockethandler) [Route.WithMiddlewareNames](#route-withmiddlewarenames) [RouteGroup.MiddlewareNames](#routegroup-middlewarenames) [RouteGroup.Middlewares](#routegroup-middlewares) [RouteGroup.RoutePrefix](#routegroup-routeprefix) [RouteGroup.Routes](#routegroup-routes) [RouteGroup.WithMiddlewareNames](#routegroup-withmiddlewarenames) |
| **Testing** | [NewContext](#webtest-newcontext) |


## API Reference {#api-reference}

_Generated from public API comments and examples._

### Adapter {#adapter}

#### echoweb.Adapter.Echo {#echoweb-adapter-echo}

Echo returns the underlying Echo engine.

```go
adapter := echoweb.New()
fmt.Println(adapter.Echo() != nil)
// true
```

#### echoweb.Adapter.Router {#echoweb-adapter-router}

Router returns the app-facing router contract.

```go
adapter := echoweb.New()
fmt.Println(adapter.Router() != nil)
// true
```

#### echoweb.Adapter.ServeHTTP {#echoweb-adapter-servehttp}

ServeHTTP exposes the adapter as a standard http.Handler.

```go
adapter := echoweb.New()
adapter.Router().GET("/healthz", func(c web.Context) error { return c.NoContent(http.StatusOK) })
rr := httptest.NewRecorder()
req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
adapter.ServeHTTP(rr, req)
fmt.Println(rr.Code)
// 204
```

#### echoweb.New {#echoweb-new}

New creates a new Echo-backed web adapter.

```go
adapter := echoweb.New()
fmt.Println(adapter.Router() != nil, adapter.Echo() != nil)
// true true
```

#### echoweb.NewServer {#echoweb-newserver}

NewServer creates an Echo-backed server from web route groups and mounts.

```go
server, err := echoweb.NewServer(echoweb.ServerConfig{
	RouteGroups: []web.RouteGroup{
		web.NewRouteGroup("/api", []web.Route{
			web.NewRoute(http.MethodGet, "/healthz", func(c web.Context) error { return c.NoContent(http.StatusOK) }),
		}),
	},
})
fmt.Println(err == nil, server.Router() != nil)
// true true
```

#### echoweb.Server.Router {#echoweb-server-router}

Router exposes the app-facing router contract.

```go
server, _ := echoweb.NewServer(echoweb.ServerConfig{})
fmt.Println(server.Router() != nil)
// true
```

#### echoweb.Server.Serve {#echoweb-server-serve}

Serve starts the server and gracefully shuts it down when ctx is cancelled.

```go
server, _ := echoweb.NewServer(echoweb.ServerConfig{Addr: "127.0.0.1:0"})
ctx, cancel := context.WithCancel(context.Background())
cancel()
fmt.Println(server.Serve(ctx) == nil)
// true
```

#### echoweb.Server.ServeHTTP {#echoweb-server-servehttp}

ServeHTTP exposes the server as an http.Handler for tests and local probing.

```go
server, _ := echoweb.NewServer(echoweb.ServerConfig{
	RouteGroups: []web.RouteGroup{
		web.NewRouteGroup("/api", []web.Route{
			web.NewRoute(http.MethodGet, "/healthz", func(c web.Context) error { return c.NoContent(http.StatusOK) }),
		}),
	},
})
rr := httptest.NewRecorder()
req := httptest.NewRequest(http.MethodGet, "/api/healthz", nil)
server.ServeHTTP(rr, req)
fmt.Println(rr.Code)
// 204
```

#### echoweb.UnwrapContext {#echoweb-unwrapcontext}

UnwrapContext returns the underlying Echo context when the web.Context came from this adapter.

```go
adapter := echoweb.New()
adapter.Router().GET("/healthz", func(c web.Context) error {
	_, ok := echoweb.UnwrapContext(c)
	fmt.Println(ok)
	return c.NoContent(http.StatusOK)
})
rr := httptest.NewRecorder()
req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
adapter.ServeHTTP(rr, req)
// true
```

#### echoweb.UnwrapWebSocketConn {#echoweb-unwrapwebsocketconn}

UnwrapWebSocketConn returns the underlying gorilla websocket connection.

```go
_, ok := echoweb.UnwrapWebSocketConn(nil)
fmt.Println(ok)
// false
```

#### echoweb.Wrap {#echoweb-wrap}

Wrap exposes an existing Echo engine through the web.Router contract.

```go
adapter := echoweb.Wrap(nil)
fmt.Println(adapter.Echo() != nil)
// true
```

### Indexing {#indexing}

#### webindex.Run {#webindex-run}

Run indexes API metadata from source and writes artifacts.

```go
manifest, err := webindex.Run(context.Background(), webindex.IndexOptions{
	Root:    ".",
	OutPath: "webindex.json",
})
fmt.Println(err == nil, manifest.Version != "")
// true true
```

### Auth Middleware {#auth-middleware}

#### webmiddleware.BasicAuth {#webmiddleware-basicauth}

BasicAuth returns basic auth middleware.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.BasicAuth(func(user, pass string, c web.Context) (bool, error) {
	return user == "demo" && pass == "secret", nil
}))

router.GET("/admin", func(c web.Context) error {
	return c.Text(200, "welcome")
})
```

#### webmiddleware.BasicAuthWithConfig {#webmiddleware-basicauthwithconfig}

BasicAuthWithConfig returns basic auth middleware with config.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.BasicAuthWithConfig(webmiddleware.BasicAuthConfig{
	Realm: "Admin",
	Validator: func(user, pass string, c web.Context) (bool, error) {
		return user == "demo" && pass == "secret", nil
	},
}))

router.GET("/admin", func(c web.Context) error {
	return c.Text(200, "welcome")
})
```

#### webmiddleware.CSRF {#webmiddleware-csrf}

CSRF enables token-based CSRF protection.

```go
router := echoweb.New().Router()
router.Use(webmiddleware.CSRF())

router.POST("/settings", func(c web.Context) error {
	return c.NoContent(204)
})
```

#### webmiddleware.CSRFWithConfig {#webmiddleware-csrfwithconfig}

CSRFWithConfig enables token-based CSRF protection with config.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.CSRFWithConfig(webmiddleware.CSRFConfig{
	CookieName:  "_csrf",
	TokenLookup: "header:X-CSRF-Token",
}))

router.POST("/settings", func(c web.Context) error {
	return c.NoContent(204)
})
```

#### webmiddleware.CreateExtractors {#webmiddleware-createextractors}

CreateExtractors creates extractors from a lookup definition.

```go
extractors, err := webmiddleware.CreateExtractors("header:X-API-Key,query:token")
fmt.Println(err == nil, len(extractors))
// true 2
```

#### webmiddleware.KeyAuth {#webmiddleware-keyauth}

KeyAuth returns key auth middleware.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.KeyAuth(func(key string, c web.Context) (bool, error) {
	return key == "demo-key", nil
}))

router.GET("/api/reports", func(c web.Context) error {
	return c.JSON(200, map[string]any{"ready": true})
})
```

#### webmiddleware.KeyAuthWithConfig {#webmiddleware-keyauthwithconfig}

KeyAuthWithConfig returns key auth middleware with config.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.KeyAuthWithConfig(webmiddleware.KeyAuthConfig{
	KeyLookup: "query:api_key",
	Validator: func(key string, c web.Context) (bool, error) {
		return key == "demo-key", nil
	},
}))

router.GET("/api/reports", func(c web.Context) error {
	return c.JSON(200, map[string]any{"ready": true})
})
```

### Compression Middleware {#compression-middleware}

#### webmiddleware.Compress {#webmiddleware-compress}

Compress enables gzip response compression for clients that support it.

```go
router := echoweb.New().Router()
router.Use(webmiddleware.Compress())

router.GET("/reports", func(c web.Context) error {
	return c.Text(200, "large report response")
})
```

#### webmiddleware.Decompress {#webmiddleware-decompress}

Decompress inflates gzip-encoded request bodies before handlers read them.

```go
router := echoweb.New().Router()
router.Use(webmiddleware.Decompress())

router.POST("/ingest", func(c web.Context) error {
	data, _ := io.ReadAll(c.Request().Body)
	return c.JSON(200, map[string]int{"bytes": len(data)})
})
```

#### webmiddleware.DecompressWithConfig {#webmiddleware-decompresswithconfig}

DecompressWithConfig inflates gzip-encoded request bodies with custom options.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.DecompressWithConfig(webmiddleware.DecompressConfig{
	Skipper: func(c web.Context) bool {
		return c.Path() == "/webhooks/raw"
	},
}))

router.POST("/ingest", func(c web.Context) error {
	return c.NoContent(202)
})
```

#### webmiddleware.Gzip {#webmiddleware-gzip}

Gzip enables gzip response compression for clients that support it.

```go
router := echoweb.New().Router()

router.GET("/feed", func(c web.Context) error {
	return c.Text(200, "large feed response")
}, webmiddleware.Gzip())
```

#### webmiddleware.GzipWithConfig {#webmiddleware-gzipwithconfig}

GzipWithConfig enables gzip response compression with custom options.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.GzipWithConfig(webmiddleware.GzipConfig{
	MinLength: 1024,
}))
```

### Method Override Middleware {#method-override-middleware}

#### webmiddleware.MethodFromForm {#webmiddleware-methodfromform}

MethodFromForm gets an override method from a form field.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.MethodOverrideWithConfig(webmiddleware.MethodOverrideConfig{
	Getter: webmiddleware.MethodFromForm("_method"),
}))
```

#### webmiddleware.MethodFromHeader {#webmiddleware-methodfromheader}

MethodFromHeader gets an override method from a request header.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.MethodOverrideWithConfig(webmiddleware.MethodOverrideConfig{
	Getter: webmiddleware.MethodFromHeader("X-HTTP-Method-Override"),
}))
```

#### webmiddleware.MethodFromQuery {#webmiddleware-methodfromquery}

MethodFromQuery gets an override method from a query parameter.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.MethodOverrideWithConfig(webmiddleware.MethodOverrideConfig{
	Getter: webmiddleware.MethodFromQuery("_method"),
}))
```

#### webmiddleware.MethodOverride {#webmiddleware-methodoverride}

MethodOverride returns method override middleware.

```go
router := echoweb.New().Router()
router.Use(webmiddleware.MethodOverride())

router.PATCH("/articles/:id", func(c web.Context) error {
	return c.NoContent(204)
})
```

#### webmiddleware.MethodOverrideWithConfig {#webmiddleware-methodoverridewithconfig}

MethodOverrideWithConfig returns method override middleware with config.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.MethodOverrideWithConfig(webmiddleware.MethodOverrideConfig{
	Getter: webmiddleware.MethodFromQuery("_method"),
}))

router.DELETE("/articles/:id", func(c web.Context) error {
	return c.NoContent(204)
})
```

### Path Rewriting Middleware {#path-rewriting-middleware}

#### webmiddleware.AddTrailingSlash {#webmiddleware-addtrailingslash}

AddTrailingSlash adds a trailing slash to the request path.

```go
router := echoweb.New().Router()
router.Use(webmiddleware.AddTrailingSlash())

router.GET("/docs/", func(c web.Context) error {
	return c.Text(200, "docs")
})
```

#### webmiddleware.AddTrailingSlashWithConfig {#webmiddleware-addtrailingslashwithconfig}

AddTrailingSlashWithConfig returns trailing-slash middleware with config.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.AddTrailingSlashWithConfig(webmiddleware.TrailingSlashConfig{
	RedirectCode: 308,
}))

router.GET("/docs/", func(c web.Context) error {
	return c.Text(200, "docs")
})
```

#### webmiddleware.RemoveTrailingSlash {#webmiddleware-removetrailingslash}

RemoveTrailingSlash removes the trailing slash from the request path.

```go
router := echoweb.New().Router()
router.Use(webmiddleware.RemoveTrailingSlash())

router.GET("/docs", func(c web.Context) error {
	return c.Text(200, "docs")
})
```

#### webmiddleware.RemoveTrailingSlashWithConfig {#webmiddleware-removetrailingslashwithconfig}

RemoveTrailingSlashWithConfig returns remove-trailing-slash middleware with config.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.RemoveTrailingSlashWithConfig(webmiddleware.TrailingSlashConfig{
	RedirectCode: 308,
}))

router.GET("/docs", func(c web.Context) error {
	return c.Text(200, "docs")
})
```

#### webmiddleware.Rewrite {#webmiddleware-rewrite}

Rewrite rewrites the request path using wildcard rules.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.Rewrite(map[string]string{
	"/old/*": "/new/$1",
}))

router.GET("/new/:name", func(c web.Context) error {
	return c.Text(200, c.Param("name"))
})
```

#### webmiddleware.RewriteWithConfig {#webmiddleware-rewritewithconfig}

RewriteWithConfig rewrites the request path using wildcard and regex rules.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.RewriteWithConfig(webmiddleware.RewriteConfig{
	Rules: map[string]string{"/old/*": "/v2/$1"},
}))

router.GET("/v2/:name", func(c web.Context) error {
	return c.Text(200, c.Param("name"))
})
```

### Payloads Middleware {#payloads-middleware}

#### webmiddleware.BodyDump {#webmiddleware-bodydump}

BodyDump captures request and response payloads.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.BodyDump(func(c web.Context, reqBody, resBody []byte) {
	log.Printf("%s %s -> %d bytes", c.Method(), c.URI(), len(resBody))
}))

router.POST("/webhooks", func(c web.Context) error {
	return c.JSON(202, map[string]any{"queued": true})
})
```

#### webmiddleware.BodyDumpWithConfig {#webmiddleware-bodydumpwithconfig}

BodyDumpWithConfig captures request and response payloads with config.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.BodyDumpWithConfig(webmiddleware.BodyDumpConfig{
	Skipper: func(c web.Context) bool {
		return c.Path() == "/healthz"
	},
	Handler: func(c web.Context, reqBody, resBody []byte) {
		log.Printf("%s %s -> %d bytes", c.Method(), c.URI(), len(resBody))
	},
}))
```

#### webmiddleware.BodyLimit {#webmiddleware-bodylimit}

BodyLimit returns middleware that limits request body size.

```go
router := echoweb.New().Router()
router.Use(webmiddleware.BodyLimit("2MB"))

router.POST("/uploads", func(c web.Context) error {
	return c.NoContent(204)
})
```

#### webmiddleware.BodyLimitWithConfig {#webmiddleware-bodylimitwithconfig}

BodyLimitWithConfig returns body limit middleware with config.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.BodyLimitWithConfig(webmiddleware.BodyLimitConfig{
	Limit: "10MB",
}))

router.POST("/imports", func(c web.Context) error {
	return c.NoContent(202)
})
```

#### webmiddleware.ErrorBodyDump {#webmiddleware-errorbodydump}

ErrorBodyDump captures response bodies for non-2xx and non-3xx responses.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.ErrorBodyDump(func(c web.Context, status int, body []byte) {
	log.Printf("%s %s failed with %d", c.Method(), c.URI(), status)
}))

router.GET("/reports/:id", func(c web.Context) error {
	return c.Text(404, "report not found")
})
```

#### webmiddleware.ErrorBodyDumpWithConfig {#webmiddleware-errorbodydumpwithconfig}

ErrorBodyDumpWithConfig captures response bodies for non-success responses with config.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.ErrorBodyDumpWithConfig(webmiddleware.ErrorBodyDumpConfig{
	Skipper: func(c web.Context) bool {
		return c.Path() == "/healthz"
	},
	Handler: func(c web.Context, status int, body []byte) {
		log.Printf("%s %s failed with %d", c.Method(), c.URI(), status)
	},
}))
```

### Proxying Middleware {#proxying-middleware}

#### webmiddleware.NewRandomBalancer {#webmiddleware-newrandombalancer}

NewRandomBalancer creates a random proxy balancer.

```go
target, _ := url.Parse("http://localhost:8080")
balancer := webmiddleware.NewRandomBalancer([]*webmiddleware.ProxyTarget{{URL: target}})
fmt.Println(balancer.Next(nil).URL.Host)

// localhost:8080
```

#### webmiddleware.NewRoundRobinBalancer {#webmiddleware-newroundrobinbalancer}

NewRoundRobinBalancer creates a round-robin proxy balancer.

```go
target, _ := url.Parse("http://localhost:8080")
balancer := webmiddleware.NewRoundRobinBalancer([]*webmiddleware.ProxyTarget{{URL: target}})
fmt.Println(balancer.Next(nil).URL.Host)

// localhost:8080
```

#### webmiddleware.Proxy {#webmiddleware-proxy}

Proxy creates a proxy middleware.

```go
target, _ := url.Parse("http://localhost:8080")
balancer := webmiddleware.NewRandomBalancer([]*webmiddleware.ProxyTarget{{URL: target}})

router := echoweb.New().Router()
router.Use(webmiddleware.Proxy(balancer))
```

#### webmiddleware.ProxyWithConfig {#webmiddleware-proxywithconfig}

ProxyWithConfig creates a proxy middleware with config.

```go
target, _ := url.Parse("http://localhost:8080")
balancer := webmiddleware.NewRoundRobinBalancer([]*webmiddleware.ProxyTarget{{URL: target}})

router := echoweb.New().Router()

router.Use(webmiddleware.ProxyWithConfig(webmiddleware.ProxyConfig{
	Balancer: balancer,
	Rewrite: map[string]string{
		"/api/*": "/$1",
	},
}))
```

### Rate Limiting Middleware {#rate-limiting-middleware}

#### webmiddleware.NewRateLimiterMemoryStore {#webmiddleware-newratelimitermemorystore}

NewRateLimiterMemoryStore creates an in-memory rate limiter store.

```go
store := webmiddleware.NewRateLimiterMemoryStore(rate.Every(time.Second))
allowed1, _ := store.Allow("192.0.2.1")
allowed2, _ := store.Allow("192.0.2.1")
fmt.Println(allowed1, allowed2)

// true false
```

#### webmiddleware.NewRateLimiterMemoryStoreWithConfig {#webmiddleware-newratelimitermemorystorewithconfig}

NewRateLimiterMemoryStoreWithConfig creates an in-memory rate limiter store with config.

```go
store := webmiddleware.NewRateLimiterMemoryStoreWithConfig(webmiddleware.RateLimiterMemoryStoreConfig{Rate: rate.Every(time.Second)})
allowed, _ := store.Allow("192.0.2.1")
fmt.Println(allowed)

// true
```

#### webmiddleware.RateLimiter {#webmiddleware-ratelimiter}

RateLimiter creates a rate limiting middleware.

```go
store := webmiddleware.NewRateLimiterMemoryStore(rate.Every(time.Second))

router := echoweb.New().Router()
router.Use(webmiddleware.RateLimiter(store))

router.POST("/api/messages", func(c web.Context) error {
	return c.NoContent(202)
})
```

#### webmiddleware.RateLimiterMemoryStore.Allow {#webmiddleware-ratelimitermemorystore-allow}

Allow checks whether the given identifier is allowed through.

```go
store := webmiddleware.NewRateLimiterMemoryStore(rate.Every(time.Second))
allowed, err := store.Allow("127.0.0.1")
fmt.Println(err == nil, allowed)

// true true
```

#### webmiddleware.RateLimiterWithConfig {#webmiddleware-ratelimiterwithconfig}

RateLimiterWithConfig creates a rate limiting middleware with config.

```go
store := webmiddleware.NewRateLimiterMemoryStore(rate.Every(time.Second))

router := echoweb.New().Router()

router.Use(webmiddleware.RateLimiterWithConfig(webmiddleware.RateLimiterConfig{
	Store: store,
	IdentifierExtractor: func(c web.Context) (string, error) {
		return c.Header("X-Account-ID"), nil
	},
}))
```

### Redirects Middleware {#redirects-middleware}

#### webmiddleware.HTTPSNonWWWRedirect {#webmiddleware-httpsnonwwwredirect}

HTTPSNonWWWRedirect redirects to https without www.

```go
router := echoweb.New().Router()
router.Use(webmiddleware.HTTPSNonWWWRedirect())
```

#### webmiddleware.HTTPSNonWWWRedirectWithConfig {#webmiddleware-httpsnonwwwredirectwithconfig}

HTTPSNonWWWRedirectWithConfig returns HTTPS non-WWW redirect middleware with config.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.HTTPSNonWWWRedirectWithConfig(webmiddleware.RedirectConfig{
	Code: 307,
}))
```

#### webmiddleware.HTTPSRedirect {#webmiddleware-httpsredirect}

HTTPSRedirect redirects http requests to https.

```go
router := echoweb.New().Router()
router.Use(webmiddleware.HTTPSRedirect())

router.GET("/docs", func(c web.Context) error {
	return c.Text(200, "docs")
})
```

#### webmiddleware.HTTPSRedirectWithConfig {#webmiddleware-httpsredirectwithconfig}

HTTPSRedirectWithConfig returns HTTPS redirect middleware with config.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.HTTPSRedirectWithConfig(webmiddleware.RedirectConfig{
	Code: 307,
}))
```

#### webmiddleware.HTTPSWWWRedirect {#webmiddleware-httpswwwredirect}

HTTPSWWWRedirect redirects to https + www.

```go
router := echoweb.New().Router()
router.Use(webmiddleware.HTTPSWWWRedirect())
```

#### webmiddleware.HTTPSWWWRedirectWithConfig {#webmiddleware-httpswwwredirectwithconfig}

HTTPSWWWRedirectWithConfig returns HTTPS+WWW redirect middleware with config.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.HTTPSWWWRedirectWithConfig(webmiddleware.RedirectConfig{
	Code: 307,
}))
```

#### webmiddleware.NonWWWRedirect {#webmiddleware-nonwwwredirect}

NonWWWRedirect redirects to the non-www host.

```go
router := echoweb.New().Router()
router.Use(webmiddleware.NonWWWRedirect())
```

#### webmiddleware.NonWWWRedirectWithConfig {#webmiddleware-nonwwwredirectwithconfig}

NonWWWRedirectWithConfig returns non-WWW redirect middleware with config.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.NonWWWRedirectWithConfig(webmiddleware.RedirectConfig{
	Code: 307,
}))
```

#### webmiddleware.WWWRedirect {#webmiddleware-wwwredirect}

WWWRedirect redirects to the www host.

```go
router := echoweb.New().Router()
router.Use(webmiddleware.WWWRedirect())
```

#### webmiddleware.WWWRedirectWithConfig {#webmiddleware-wwwredirectwithconfig}

WWWRedirectWithConfig returns WWW redirect middleware with config.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.WWWRedirectWithConfig(webmiddleware.RedirectConfig{
	Code: 307,
}))
```

### Reliability Middleware {#reliability-middleware}

#### webmiddleware.Recover {#webmiddleware-recover}

Recover returns middleware that recovers panics from the handler chain.

```go
router := echoweb.New().Router()
router.Use(webmiddleware.Recover())

router.GET("/panic", func(c web.Context) error {
	panic("boom")
})
```

#### webmiddleware.RecoverWithConfig {#webmiddleware-recoverwithconfig}

RecoverWithConfig returns recover middleware with config.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.RecoverWithConfig(webmiddleware.RecoverConfig{
	DisableStack: true,
	HandleError: func(c web.Context, err error, stack []byte) error {
		return c.JSON(500, map[string]any{"error": "internal server error"})
	},
}))
```

### Request Lifecycle Middleware {#request-lifecycle-middleware}

#### webmiddleware.ContextTimeout {#webmiddleware-contexttimeout}

ContextTimeout sets a timeout on the request context.

```go
router := echoweb.New().Router()
router.Use(webmiddleware.ContextTimeout(2 * time.Second))

router.GET("/reports", func(c web.Context) error {
	return c.JSON(200, map[string]any{"ready": true})
})
```

#### webmiddleware.ContextTimeoutWithConfig {#webmiddleware-contexttimeoutwithconfig}

ContextTimeoutWithConfig sets a timeout on the request context with config.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.ContextTimeoutWithConfig(webmiddleware.ContextTimeoutConfig{
	Timeout: time.Second,
}))
```

#### webmiddleware.DefaultSkipper {#webmiddleware-defaultskipper}

DefaultSkipper always runs the middleware.

```go
fmt.Println(webmiddleware.DefaultSkipper(nil))
// false
```

#### webmiddleware.RequestID {#webmiddleware-requestid}

RequestID returns middleware that sets a request id header and context value.

```go
router := echoweb.New().Router()
router.Use(webmiddleware.RequestID())

router.GET("/healthz", func(c web.Context) error {
	return c.JSON(200, map[string]any{
		"request_id": c.Get("request_id"),
	})
})
```

#### webmiddleware.RequestIDWithConfig {#webmiddleware-requestidwithconfig}

RequestIDWithConfig returns RequestID middleware with config.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.RequestIDWithConfig(webmiddleware.RequestIDConfig{
	TargetHeader: "X-Correlation-ID",
	ContextKey:   "correlation_id",
}))
```

#### webmiddleware.RequestLoggerWithConfig {#webmiddleware-requestloggerwithconfig}

RequestLoggerWithConfig returns request logger middleware with config.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.RequestLoggerWithConfig(webmiddleware.RequestLoggerConfig{
	LogValuesFunc: func(c web.Context, values webmiddleware.RequestLoggerValues) error {
		log.Printf("%s %s %d %s", values.Method, values.URI, values.Status, values.Latency)
		return nil
	},
}))

router.GET("/users/:id", func(c web.Context) error {
	return c.NoContent(204)
})
```

#### webmiddleware.Timeout {#webmiddleware-timeout}

Timeout returns a response-timeout middleware.

```go
router := echoweb.New().Router()
router.Use(webmiddleware.Timeout())

router.GET("/healthz", func(c web.Context) error {
	return c.NoContent(204)
})
```

#### webmiddleware.TimeoutWithConfig {#webmiddleware-timeoutwithconfig}

TimeoutWithConfig returns a response-timeout middleware with config.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.TimeoutWithConfig(webmiddleware.TimeoutConfig{
	Timeout:      time.Second,
	ErrorMessage: "request timed out",
}))
```

### Security Middleware {#security-middleware}

#### webmiddleware.CORS {#webmiddleware-cors}

CORS returns Cross-Origin Resource Sharing middleware.

```go
router := echoweb.New().Router()
router.Use(webmiddleware.CORS())

router.GET("/api/healthz", func(c web.Context) error {
	return c.JSON(200, map[string]any{"ok": true})
})
```

#### webmiddleware.CORSWithConfig {#webmiddleware-corswithconfig}

CORSWithConfig returns CORS middleware with config.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.CORSWithConfig(webmiddleware.CORSConfig{
	AllowOrigins: []string{"https://app.example.com"},
	AllowMethods: []string{"GET", "POST", "PATCH"},
}))

router.GET("/api/healthz", func(c web.Context) error {
	return c.JSON(200, map[string]any{"ok": true})
})
```

#### webmiddleware.Secure {#webmiddleware-secure}

Secure sets security-oriented response headers.

```go
router := echoweb.New().Router()
router.Use(webmiddleware.Secure())

router.GET("/", func(c web.Context) error {
	return c.Text(200, "home")
})
```

#### webmiddleware.SecureWithConfig {#webmiddleware-securewithconfig}

SecureWithConfig sets security-oriented response headers with config.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.SecureWithConfig(webmiddleware.SecureConfig{
	ReferrerPolicy:        "same-origin",
	ContentSecurityPolicy: "default-src 'self'",
}))
```

### Static Files Middleware {#static-files-middleware}

#### webmiddleware.Static {#webmiddleware-static}

Static serves static content from the provided root.

```go
router := echoweb.New().Router()
router.Use(webmiddleware.Static("public"))

router.GET("/healthz", func(c web.Context) error {
	return c.NoContent(204)
})
```

#### webmiddleware.StaticWithConfig {#webmiddleware-staticwithconfig}

StaticWithConfig serves static content using config.

```go
router := echoweb.New().Router()

router.Use(webmiddleware.StaticWithConfig(webmiddleware.StaticConfig{
	Root:  "public",
	HTML5: true,
}))
```

### Prometheus {#prometheus}

#### webprometheus.Default {#webprometheus-default}

Default returns the package-level Prometheus metrics instance.

```go
fmt.Println(webprometheus.Default() == webprometheus.Default())
// true
```

#### webprometheus.Handler {#webprometheus-handler}

Handler returns the package-level Prometheus scrape handler.

```go
registry := prometheus.NewRegistry()
counter := prometheus.NewCounter(prometheus.CounterOpts{Name: "demo_total", Help: "demo counter"})
registry.MustRegister(counter)
counter.Inc()
metrics, _ := webprometheus.New(webprometheus.Config{Registerer: prometheus.NewRegistry(), Gatherer: registry})
recorder := httptest.NewRecorder()
ctx := webtest.NewContext(httptest.NewRequest(http.MethodGet, "/metrics", nil), recorder, "/metrics", nil)
_ = metrics.Handler()(ctx)
fmt.Println(strings.Contains(recorder.Body.String(), "demo_total"))
// true
```

#### webprometheus.Metrics.Handler {#webprometheus-metrics-handler}

Handler exposes the configured Prometheus metrics as a web.Handler.

```go
registry := prometheus.NewRegistry()
counter := prometheus.NewCounter(prometheus.CounterOpts{Name: "demo_total", Help: "demo counter"})
registry.MustRegister(counter)
counter.Inc()
metrics, _ := webprometheus.New(webprometheus.Config{Registerer: prometheus.NewRegistry(), Gatherer: registry})
recorder := httptest.NewRecorder()
ctx := webtest.NewContext(httptest.NewRequest(http.MethodGet, "/metrics", nil), recorder, "/metrics", nil)
_ = metrics.Handler()(ctx)
fmt.Println(strings.Contains(recorder.Body.String(), "demo_total"))
// true
```

#### webprometheus.Metrics.Middleware {#webprometheus-metrics-middleware}

Middleware records Prometheus metrics for each request.

```go
registry := prometheus.NewRegistry()
metrics, _ := webprometheus.New(webprometheus.Config{Registerer: registry, Gatherer: registry, Namespace: "example"})
handler := metrics.Middleware()(func(c web.Context) error { return c.NoContent(http.StatusNoContent) })
ctx := webtest.NewContext(httptest.NewRequest(http.MethodGet, "/healthz", nil), nil, "/healthz", nil)
_ = handler(ctx)
out := &bytes.Buffer{}
_ = webprometheus.WriteGatheredMetrics(out, registry)
fmt.Println(strings.Contains(out.String(), "example_requests_total"))
// true
```

#### webprometheus.Middleware {#webprometheus-middleware}

Middleware returns the package-level Prometheus middleware.

```go
registry := prometheus.NewRegistry()
metrics, _ := webprometheus.New(webprometheus.Config{Registerer: registry, Gatherer: registry, Namespace: "example"})
handler := metrics.Middleware()(func(c web.Context) error { return c.NoContent(http.StatusNoContent) })
ctx := webtest.NewContext(httptest.NewRequest(http.MethodGet, "/healthz", nil), nil, "/healthz", nil)
_ = handler(ctx)
out := &bytes.Buffer{}
_ = webprometheus.WriteGatheredMetrics(out, registry)
fmt.Println(strings.Contains(out.String(), "example_requests_total"))
// true
```

#### webprometheus.MustNew {#webprometheus-mustnew}

MustNew creates a Metrics instance and panics on registration errors.

```go
metrics := webprometheus.MustNew(webprometheus.Config{Registerer: prometheus.NewRegistry(), Gatherer: prometheus.NewRegistry()})
fmt.Println(metrics != nil)
// true
```

#### webprometheus.New {#webprometheus-new}

New creates a Metrics instance backed by Prometheus collectors.

```go
metrics, err := webprometheus.New(webprometheus.Config{Namespace: "app"})
_ = metrics
fmt.Println(err == nil)
// true
```

#### webprometheus.RunPushGatewayGatherer {#webprometheus-runpushgatewaygatherer}

RunPushGatewayGatherer starts pushing collected metrics until the context finishes.

```go
err := webprometheus.RunPushGatewayGatherer(context.Background(), webprometheus.PushGatewayConfig{})
fmt.Println(err != nil)
// true
```

#### webprometheus.WriteGatheredMetrics {#webprometheus-writegatheredmetrics}

WriteGatheredMetrics gathers collected metrics and writes them to the given writer.

```go
var buf bytes.Buffer
err := webprometheus.WriteGatheredMetrics(&buf, prometheus.NewRegistry())
fmt.Println(err == nil)
// true
```

### Route Reporting {#route-reporting}

#### BuildRouteEntries {#buildrouteentries}

BuildRouteEntries builds a sorted slice of route entries from registered groups and extra entries.

```go
entries := web.BuildRouteEntries([]web.RouteGroup{
	web.NewRouteGroup("/api", []web.Route{
		web.NewRoute(http.MethodGet, "/healthz", func(c web.Context) error { return nil }),
	}),
})
fmt.Println(entries[0].Path, entries[0].Methods[0])
// /api/healthz GET
```

#### RenderRouteTable {#renderroutetable}

RenderRouteTable renders a route table using simple ASCII borders and ANSI colors.

```go
table := web.RenderRouteTable([]web.RouteEntry{{
	Path:    "/api/healthz",
	Handler: "monitoring.Healthz",
	Methods: []string{"GET"},
}})
fmt.Println(strings.Contains(table, "/api/healthz"))
// true
```

### Routing {#routing}

#### MountRouter {#mountrouter}

MountRouter applies mount-style router configuration in declaration order.

```go
adapter := echoweb.New()
err := web.MountRouter(adapter.Router(), []web.RouterMount{
	func(r web.Router) error {
		r.GET("/healthz", func(c web.Context) error { return nil })
		return nil
	},
})
fmt.Println(err == nil)
// true
```

#### NewRoute {#newroute}

NewRoute creates a new route using the app-facing web handler contract directly.

```go
route := web.NewRoute(http.MethodGet, "/healthz", func(c web.Context) error {
	return c.NoContent(http.StatusOK)
})
fmt.Println(route.Method(), route.Path())
// GET /healthz
```

#### NewRouteGroup {#newroutegroup}

NewRouteGroup wraps routes and their accompanied web middleware.

```go
group := web.NewRouteGroup("/api", []web.Route{
	web.NewRoute(http.MethodGet, "/healthz", func(c web.Context) error { return nil }),
})
fmt.Println(group.RoutePrefix(), len(group.Routes()))
// /api 1
```

#### NewWebSocketRoute {#newwebsocketroute}

NewWebSocketRoute creates a websocket route using the app-facing websocket handler contract.

```go
route := web.NewWebSocketRoute("/ws", func(c web.Context, conn web.WebSocketConn) error {
	return nil
})
fmt.Println(route.IsWebSocket())
// true
```

#### RegisterRoutes {#registerroutes}

RegisterRoutes registers route groups onto a router.

```go
adapter := echoweb.New()
groups := []web.RouteGroup{
	web.NewRouteGroup("/api", []web.Route{
		web.NewRoute(http.MethodGet, "/healthz", func(c web.Context) error { return nil }),
	}),
}
err := web.RegisterRoutes(adapter.Router(), groups)
fmt.Println(err == nil)
// true
```

#### Route.Handler {#route-handler}

Handler returns the route handler.

```go
route := web.NewRoute(http.MethodGet, "/healthz", func(c web.Context) error {
	return c.NoContent(http.StatusCreated)
})
ctx := webtest.NewContext(nil, nil, "/healthz", nil)
_ = route.Handler()(ctx)
fmt.Println(ctx.StatusCode())
// 201
```

#### Route.HandlerName {#route-handlername}

HandlerName returns the original handler name for route reporting.

```go
route := web.NewRoute(http.MethodGet, "/healthz", func(c web.Context) error { return nil })
fmt.Println(route.HandlerName() != "")
// true
```

#### Route.IsWebSocket {#route-iswebsocket}

IsWebSocket reports whether this route upgrades to a websocket connection.

```go
route := web.NewWebSocketRoute("/ws", func(c web.Context, conn web.WebSocketConn) error { return nil })
fmt.Println(route.IsWebSocket())
// true
```

#### Route.Method {#route-method}

Method returns the HTTP method.

```go
route := web.NewRoute(http.MethodPost, "/users", func(c web.Context) error { return nil })
fmt.Println(route.Method())
// POST
```

#### Route.MiddlewareNames {#route-middlewarenames}

MiddlewareNames returns original middleware names for route reporting.

```go
route := web.NewRoute(http.MethodGet, "/healthz", func(c web.Context) error { return nil }).WithMiddlewareNames("auth")
fmt.Println(route.MiddlewareNames()[0])
// auth
```

#### Route.Middlewares {#route-middlewares}

Middlewares returns the route middleware slice.

```go
route := web.NewRoute(
	http.MethodGet,
	"/healthz",
	func(c web.Context) error { return nil },
	func(next web.Handler) web.Handler { return next },
)
fmt.Println(len(route.Middlewares()))
// 1
```

#### Route.Path {#route-path}

Path returns the path of the route.

```go
route := web.NewRoute(http.MethodGet, "/healthz", func(c web.Context) error { return nil })
fmt.Println(route.Path())
// /healthz
```

#### Route.WebSocketHandler {#route-websockethandler}

WebSocketHandler returns the websocket route handler.

```go
route := web.NewWebSocketRoute("/ws", func(c web.Context, conn web.WebSocketConn) error {
	c.Set("ready", true)
	return nil
})
ctx := webtest.NewContext(nil, nil, "/ws", nil)
err := route.WebSocketHandler()(ctx, nil)
fmt.Println(err == nil, ctx.Get("ready"))
// true true
```

#### Route.WithMiddlewareNames {#route-withmiddlewarenames}

WithMiddlewareNames attaches reporting-only middleware names to the route.

```go
route := web.NewRoute(http.MethodGet, "/healthz", func(c web.Context) error { return nil }).WithMiddlewareNames("auth", "trace")
fmt.Println(len(route.MiddlewareNames()))
// 2
```

#### RouteGroup.MiddlewareNames {#routegroup-middlewarenames}

MiddlewareNames returns original middleware names for route reporting.

```go
group := web.NewRouteGroup("/api", nil).WithMiddlewareNames("auth")
fmt.Println(group.MiddlewareNames()[0])
// auth
```

#### RouteGroup.Middlewares {#routegroup-middlewares}

Middlewares returns the middleware slice for the group.

```go
group := web.NewRouteGroup("/api", nil, func(next web.Handler) web.Handler { return next })
fmt.Println(len(group.Middlewares()))
// 1
```

#### RouteGroup.RoutePrefix {#routegroup-routeprefix}

RoutePrefix returns the group prefix.

```go
group := web.NewRouteGroup("/api", nil)
fmt.Println(group.RoutePrefix())
// /api
```

#### RouteGroup.Routes {#routegroup-routes}

Routes returns the routes in the group.

```go
group := web.NewRouteGroup("/api", []web.Route{
	web.NewRoute(http.MethodGet, "/healthz", func(c web.Context) error { return nil }),
})
fmt.Println(len(group.Routes()))
// 1
```

#### RouteGroup.WithMiddlewareNames {#routegroup-withmiddlewarenames}

WithMiddlewareNames attaches reporting-only middleware names to the group.

```go
group := web.NewRouteGroup("/api", nil).WithMiddlewareNames("auth", "trace")
fmt.Println(len(group.MiddlewareNames()))
// 2
```

### Testing {#testing}

#### webtest.NewContext {#webtest-newcontext}

NewContext creates a new test context around the provided request/recorder pair.

```go
req := httptest.NewRequest(http.MethodGet, "/users/42?expand=roles", nil)
ctx := webtest.NewContext(req, nil, "/users/:id", webtest.PathParams{"id": "42"})
fmt.Println(ctx.Param("id"), ctx.Query("expand"))
// 42 roles
```
<!-- api:embed:end -->
