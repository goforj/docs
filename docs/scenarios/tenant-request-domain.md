---
title: "Authenticated Tenant Request Boundary"
description: "Prepare authenticated export and health routes with a named request cache."
---

# Authenticated Tenant Request Boundary

::: info Verified Scenario
This page is generated from an executable spec. An automated suite renders a fresh App from the current GoForj templates, applies every step below in order, and runs every verification command. If any step fails, the page does not ship.
:::

This fixture validates credentials before placing tenant identity in request context. The existing export route has an explicit policy extension point; health remains public.

## Prerequisites

Use the existing Cache and Web components. The root cache module is pinned independently from cachecore and Redis driver modules by the framework dependency catalog. Redis is required when running the full App; deterministic tests use an embedded Redis protocol server.

## Golden Path State

Before this scenario, no tenant export surface exists.

After this scenario, exports require verified identity and borrow the named requests cache through App composition.

## Files

This scenario edits or creates:

```text
internal/requests/auth.go
internal/requests/limiter.go
internal/requests/controller.go
```

## Step 1: Declare the shared request resource

Append to `.env`:

```
CACHE_SUPPORTED_DRIVERS=memory,redis
CACHE_REQUESTS_DRIVER=redis
CACHE_REQUESTS_ADDR=127.0.0.1:6379
CACHE_REQUESTS_PREFIX=tenant-requests
```

## Step 2: Generate the existing named cache accessor

```bash
forj generate --cache
```

## Step 3: Prepare deterministic protocol-level backend tests

```bash
go get github.com/alicebob/miniredis/v2@v2.35.0
```

## Step 4: Validate credentials before assigning tenant identity

Create or replace `internal/requests/auth.go`:

```go
// Package requests owns authenticated request identity and route policy.
package requests

import (
	"context"
	"github.com/goforj/web"
	"net/http"
	"strings"
)

// tenantContextKey keeps caller headers from impersonating an authenticated principal.
type tenantContextKey struct{}

// Tenant returns identity established by authentication, never an asserted tenant header.
func Tenant(ctx context.Context) (string, bool) {
	tenant, ok := ctx.Value(tenantContextKey{}).(string)
	return tenant, ok && tenant != ""
}

// Authenticate is a deterministic credential fixture; production Apps use their verified principal middleware.
func Authenticate(next web.Handler) web.Handler {
	return func(request web.Context) error {
		tenant := map[string]string{"Bearer tenant-a-token": "tenant-a", "Bearer tenant-b-token": "tenant-b"}[strings.TrimSpace(request.Request().Header.Get("Authorization"))]
		if tenant == "" {
			return request.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		}
		request.SetRequest(request.Request().WithContext(context.WithValue(request.Context(), tenantContextKey{}, tenant)))
		return next(request)
	}
}
```

## Step 5: Prepare the policy extension point

Create or replace `internal/requests/limiter.go`:

```go
package requests

import (
	"github.com/goforj/cache"
	"github.com/goforj/web"
	"time"
)

// Limiter owns the route policy and borrows the App cache resource.
type Limiter struct {
	client *cache.Cache
	now    func() time.Time
}

// NewLimiter accepts shared storage and a clock so policy can be tested without sleeps.
func NewLimiter(client *cache.Cache, now func() time.Time) *Limiter {
	return &Limiter{client: client, now: now}
}

// Middleware is the prepared policy extension point around the existing export handler.
func (limiter *Limiter) Middleware(next web.Handler) web.Handler { return next }
```

## Step 6: Register the existing route owner

```bash
forj make:controller requests
```

## Step 7: Separate export policy from health

Create or replace `internal/requests/controller.go`:

```go
package requests

import (
	"github.com/goforj/web"
	"net/http"
)

// Controller keeps the export policy separate from an unrelated health route.
type Controller struct{ limiter *Limiter }

// NewController receives the configured policy from App composition.
func NewController(limiter *Limiter) *Controller { return &Controller{limiter: limiter} }

// Routes applies authentication before tenant policy and leaves health public.
func (controller *Controller) Routes() []web.Route {
	return []web.Route{
		web.NewRoute(http.MethodGet, "/exports", controller.Export, Authenticate, controller.limiter.Middleware),
		web.NewRoute(http.MethodGet, "/health", controller.Health),
	}
}

// Export represents existing expensive application work behind the policy.
func (controller *Controller) Export(request web.Context) error {
	return request.JSON(http.StatusOK, map[string]string{"status": "exported"})
}

// Health remains independent from export policy and cache availability.
func (controller *Controller) Health(request web.Context) error {
	return request.JSON(http.StatusOK, map[string]string{"status": "ok"})
}
```

## Step 8: Import configured resource and clock dependencies

Update `app/wire/inject_http_controllers_app.go` so it includes:

```
import (
	"time"
	"example.com/invoiceeval/internal/caches"
```

## Step 9: Provide the route owner through its named resource

Update `app/wire/inject_http_controllers_app.go` so it includes:

```
	provideRequestController,
```

## Step 10: Resolve the cache and clock once

Append to `app/wire/inject_http_controllers_app.go`:

```
// provideRequestController borrows the shared App resource without constructing a backend in middleware.
func provideRequestController(manager *caches.Manager) *requests.Controller {
        return requests.NewController(requests.NewLimiter(manager.Requests(), time.Now))
}
```

## Build and Verify

```bash
forj build
```

```bash
go test ./internal/requests
```

## Troubleshooting

App startup requires the configured Redis endpoint. Start the shared service before running the App. Building the Project does not require a running Redis service.

## Common Mistakes

::: warning Common mistakes
- Do not use X-Tenant-ID or another caller assertion as authenticated identity.
- Do not turn the fixture's static credentials into a production authentication scheme.
:::

## Next Steps

- Implement the explicit export policy in Tenant Request Rate Limits.
