---
title: HTTP Tests
description: How to test controllers, route groups, health checks, readiness, and middleware behavior.
---

# HTTP Tests

HTTP tests verify request handling at the controller, route group, or generated server boundary.

Use the smallest boundary that proves the behavior.

## Controller Tests

Test a controller handler directly when route registration is not the focus:

```go
package users

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/goforj/web/webtest"
)

func TestControllerShow(t *testing.T) {
	controller := NewController(NewService())

	req := httptest.NewRequest(http.MethodGet, "/users/42", nil)
	rec := httptest.NewRecorder()
	ctx := webtest.NewContext(req, rec, "/users/:id", webtest.PathParams{"id": "42"})

	if err := controller.Show(ctx); err != nil {
		t.Fatalf("show user: %v", err)
	}
	if ctx.StatusCode() != http.StatusOK {
		t.Fatalf("status = %d", ctx.StatusCode())
	}
	if !strings.Contains(rec.Body.String(), `"id":"42"`) {
		t.Fatalf("body = %s", rec.Body.String())
	}
}
```

This matches the controller from [JSON API Route](/scenarios/json-api-route). Use [Web](/web) for package-level testing helpers.

## Route Tests

Use route or server-level tests when you need to verify:

- route grouping
- middleware
- path parameters
- framework routes
- route visibility
- readiness behavior
- metrics or inspect integration

## Generated Health Tests

Generated Apps include HTTP tests for framework routes when HTTP is enabled.

Common routes:

- `GET /-/health`
- `GET /-/ready`
- `GET /swagger`
- `GET /swagger/doc.json`
- `GET /metrics` when metrics are enabled

## Readiness

Test readiness failures deliberately. Public readiness should be safe. Authorized readiness can expose structured details when called with `APP_DIAG_TOKEN`.

## Common Mistakes

::: warning Common mistakes
- Do not start a real network listener unless listener behavior matters.
- Do not bypass the `web` abstraction in normal controller tests.
- Do not test business logic only through HTTP when the service can be tested directly.
- Do not expose raw infrastructure errors in public readiness responses.
:::

## Next Steps

- [Controllers](/applications/controllers) explains controller boundaries.
- [Middleware](/applications/middleware) explains route policy.
- [Integration Tests](/testing/integration-tests) covers full boundary tests.
