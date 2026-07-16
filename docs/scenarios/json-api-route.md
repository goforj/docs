---
title: "JSON API Route"
description: "Build a JSON API route with a controller, service, Wire provider, route registration, and test."
---

# JSON API Route

::: info Verified Scenario
This page is generated from an executable spec. An automated suite renders a fresh App from the current GoForj templates, applies every step below in order, and runs every verification command. If any step fails, the page does not ship.
:::

Scenario 1 of 7 in the [verified path](/scenarios/). Plan on about 15 minutes.

This scenario adds a `GET /api/v1/users/:id` endpoint to a generated GoForj App.

The endpoint is intentionally small. It establishes the normal shape for application features: start from the make command, keep the controller thin, put behavior behind a service, register providers explicitly, and verify the route through the generated runtime.

## What You Will Build

- `internal/users.Service` owns user lookup behavior.
- `internal/users.Controller` translates HTTP into a service call.
- `forj make:controller users` creates the controller wiring and route registration.
- `appSet` in `app/wire` provides the service.
- `forj route:list` shows the registered endpoint.

## Prerequisites

Start from a generated GoForj App with HTTP enabled.

## Golden Path State

Before this scenario, the App has the generated HTTP runtime but no application-owned user feature.

After this scenario, the App has one tested `GET /api/v1/users/:id` route, a thin controller, a service boundary, Wire providers, and route registration that appears in `route:list`.

## Files

This scenario edits or creates:

**Users feature**

```text
internal/users/service.go
internal/users/service_test.go
internal/users/controller.go
```

**HTTP registration**

```text
app/wire/inject_http_controllers_app.go
app/routes.go
```

**App wiring**

```text
app/wire/inject_services_app.go
```

## Step 1: Scaffold the Controller

Start with the real make command. It creates `internal/users/controller.go`, wires the controller constructor into `app/wire/inject_http_controllers_app.go`, and adds the controller routes to `app/routes.go`.

```bash
forj make:controller users
```

## Step 2: Add the Service

Create `internal/users/service.go`.

The service owns application behavior. This first version is intentionally simple and keeps persistence out of the HTTP boundary.

Create or replace `internal/users/service.go`:

```go
// Package users keeps user behavior independent from HTTP and infrastructure details.
package users

import (
	"context"
	"errors"
)

// ErrUserNotFound lets transports handle missing users without depending on repository details.
var ErrUserNotFound = errors.New("user not found")

// User keeps the application response independent from transport and persistence models.
type User struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

// Service keeps user lookup rules outside the HTTP controller.
type Service struct{}

// NewService keeps construction explicit so Wire and tests use the same entry point.
func NewService() *Service {
	return &Service{}
}

// Find centralizes lookup rules so transports do not duplicate input behavior.
func (*Service) Find(_ context.Context, id string) (User, error) {
	if id == "" {
		return User{}, ErrUserNotFound
	}

	return User{
		ID:    id,
		Name:  "Ada Lovelace",
		Email: "ada@example.test",
	}, nil
}
```

## Step 3: Replace the Starter Controller

Replace `internal/users/controller.go`.

Keep the generated controller registration, but replace the starter handler with a service-backed `GET /users/:id` route.

The controller only reads HTTP input, calls the service, and writes the HTTP response. It does not own persistence, cache behavior, queue dispatch, or infrastructure setup.

Create or replace `internal/users/controller.go`:

```go
// Package users keeps HTTP translation separate from user lookup behavior.
package users

import (
	"errors"
	"net/http"

	"github.com/goforj/web"
)

// Controller keeps HTTP translation separate from user lookup behavior.
type Controller struct {
	service *Service
}

// NewController makes the service dependency explicit for Wire and focused tests.
func NewController(service *Service) *Controller {
	return &Controller{service: service}
}

// Routes keeps the users HTTP surface discoverable by the App router.
func (c *Controller) Routes() []web.Route {
	return []web.Route{
		web.NewRoute(http.MethodGet, "/users/:id", c.Show),
	}
}

// Show translates the service result into the public HTTP contract.
func (c *Controller) Show(ctx web.Context) error {
	user, err := c.service.Find(ctx.Context(), ctx.Param("id"))
	if errors.Is(err, ErrUserNotFound) {
		return ctx.JSON(http.StatusNotFound, map[string]string{
			"error": "user not found",
		})
	}
	if err != nil {
		return err
	}

	return ctx.JSON(http.StatusOK, user)
}
```

## Step 4: Provide the Service

Open `app/wire/inject_services_app.go`.

Wire can already construct the controller after the make command, but the controller now needs `*users.Service`. Add the users package to the imports, using your App module path.

Update `app/wire/inject_services_app.go` so it includes:

```go
	"your/module/internal/runtime"
	"your/module/internal/users"
```

## Step 5: Add the Service Provider

Add `users.NewService` to `appSet`.

`Service` is now part of the compiled App dependency graph, and Wire can construct the controller because `appSet` provides `*users.Service`.

Update `app/wire/inject_services_app.go` so it includes:

```go
users.NewService,
app.NewLifecycleRegistry,
```

## Step 6: Add a Service Test

Create `internal/users/service_test.go`.

The service test does not start HTTP. It proves the business behavior directly.

Create or replace `internal/users/service_test.go`:

```go
// Package users keeps lookup behavior testable without starting the HTTP runtime.
package users

import (
	"context"
	"errors"
	"testing"
)

// TestServiceFindsUser protects lookup behavior without involving HTTP wiring.
func TestServiceFindsUser(t *testing.T) {
	service := NewService()
	want := User{
		ID:    "42",
		Name:  "Ada Lovelace",
		Email: "ada@example.test",
	}

	user, err := service.Find(context.Background(), "42")
	if err != nil {
		t.Fatalf("find user: %v", err)
	}
	if user != want {
		t.Fatalf("user = %+v, want %+v", user, want)
	}
}

// TestServiceRejectsEmptyID keeps missing identifiers from becoming valid lookups.
func TestServiceRejectsEmptyID(t *testing.T) {
	service := NewService()

	_, err := service.Find(context.Background(), "")
	if !errors.Is(err, ErrUserNotFound) {
		t.Fatalf("find user error = %v, want %v", err, ErrUserNotFound)
	}
}
```

## Build and Verify

```bash
forj build
```

```bash
go test ./...
```

```bash
forj route:list
```

Expected output includes:

- `/api/v1/users/:id`

## Try the Route

Run the HTTP server:

```bash
forj api
```

Request the endpoint:

```bash
curl http://localhost:3000/api/v1/users/42
```

Expected response:

```json
{"id":"42","name":"Ada Lovelace","email":"ada@example.test"}
```

## Operations

Operational notes:

- `route:list` shows it after registration.
- HTTP request logs include requests to it when access logging is enabled.
- HTTP metrics include it when metrics are enabled.
- HTTP inspects can show request and response details when inspect capture is enabled.
- Lighthouse can display route and runtime information when Lighthouse is enabled.

## Common Mistakes

::: warning Common mistakes
- Do not put user lookup logic in `Show`.
- Do not register routes directly in the HTTP server package.
- Do not edit `app/wire/wire_gen.go` by hand.
- Do not skip `forj build` after changing Wire providers.
- Do not import the underlying HTTP engine in normal App controllers.
:::

## Next Steps

- Next, extend this feature with a repository and named cache resource in [Cached User Profile](/scenarios/cached-user-profile).
- [Controllers](/applications/controllers) explains handler structure.
- [Wiring Recipes](/core/wiring-recipes) shows where providers belong.
