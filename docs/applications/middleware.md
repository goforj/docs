---
title: Middleware
description: How middleware is applied around HTTP handlers in GoForj Apps.
---

# Middleware

Middleware is execution policy applied around handlers.

In HTTP Apps, middleware belongs near route or router composition. It should be explicit, named when operationally useful, and kept separate from business workflows.

## Where Middleware Applies

Middleware can be applied:

- globally by the HTTP runtime
- to route groups
- to individual routes

The generated HTTP runtime owns framework middleware such as recovery, request IDs, access logging, metrics, inspects, and local error response capture.

Application route groups own application policy such as authentication.

## Route Group Middleware

Protected routes can be grouped with middleware:

```go
groups = append(groups,
	web.NewRouteGroup("/api/v1", protectedRoutes, authService.RequireAuth()).
		WithMiddlewareNames("auth.RequireAuth"),
)
```

Names make middleware visible in route reports and operational views.

## Route Middleware

Individual routes may receive route-specific middleware:

```go
web.NewRoute(http.MethodPost, "/reports", c.Store, RequireToken(c.reportsToken))
```

Use route-specific middleware for route-specific policy. Use group middleware when the policy applies to the entire group.

## Implement Application Middleware

Keep transport policy small and explicit. For example, `internal/reports/middleware.go` can require a configured reports token:

```go
package reports

import (
	"net/http"

	"github.com/goforj/web"
)

// RequireToken rejects requests that do not carry the configured reports token.
func RequireToken(expected string) web.Middleware {
	return func(next web.Handler) web.Handler {
		return func(ctx web.Context) error {
			if expected == "" || ctx.Request().Header.Get("X-Reports-Token") != expected {
				return ctx.JSON(http.StatusUnauthorized, map[string]string{
					"error": "unauthorized",
				})
			}
			return next(ctx)
		}
	}
}
```

Resolve `expected` from App configuration and reject an empty value in its provider. The middleware should receive resolved policy rather than reading environment variables for every request.

## Middleware Responsibilities

Middleware is a good fit for:

- authentication
- authorization gates
- request IDs
- recovery
- CORS
- body size limits
- rate limits
- metrics
- request logging
- timeout policy

Middleware is not a good place for business workflows.

## Testing Middleware

Use the `webtest` helpers from [Web](/web) to prove both the rejected and accepted paths. Create `internal/reports/middleware_test.go`:

```go
package reports

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/goforj/web"
	"github.com/goforj/web/webtest"
)

// TestRequireToken verifies the middleware stops unauthorized requests and continues authorized ones.
func TestRequireToken(t *testing.T) {
	next := func(ctx web.Context) error {
		return ctx.NoContent(http.StatusNoContent)
	}

	tests := []struct {
		name       string
		expected   string
		token      string
		wantStatus int
	}{
		{name: "missing token", expected: "reports-secret", wantStatus: http.StatusUnauthorized},
		{name: "unconfigured policy", wantStatus: http.StatusUnauthorized},
		{name: "valid token", expected: "reports-secret", token: "reports-secret", wantStatus: http.StatusNoContent},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/api/v1/reports", nil)
			req.Header.Set("X-Reports-Token", tt.token)
			rec := httptest.NewRecorder()
			ctx := webtest.NewContext(req, rec, "/api/v1/reports", nil)
			handler := RequireToken(tt.expected)(next)

			if err := handler(ctx); err != nil {
				t.Fatalf("handler returned error: %v", err)
			}
			if rec.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d", rec.Code, tt.wantStatus)
			}
		})
	}
}
```

For full App behavior, also prefer HTTP tests against the generated route surface when route grouping or middleware order is the behavior under test.

Run the App suite from its root:

```bash
go test ./...
```

Expected result: all tests pass. Add a route-level test that asserts the policy's status code and response when changing application middleware; use a direct handler test only when route composition is not the behavior under test.

## Common Mistakes

::: warning Common mistakes
- Do not hide business logic in middleware.
- Do not apply route-specific policy globally just because it is easy.
- Do not duplicate framework middleware in application route registration.
- Do not depend directly on the underlying HTTP engine for normal App middleware.
- Do not leave important middleware unnamed when route visibility matters.
:::

## Next Steps

- [Routes](/applications/routes) explains route grouping.
- [Controllers](/applications/controllers) explains handler boundaries.
- [Web](/web) covers standalone middleware primitives.
