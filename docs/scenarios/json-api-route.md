---
title: JSON API Route
description: Build a JSON API route with a controller, service, Wire provider, route registration, and test.
---

# JSON API Route

This scenario adds a `GET /api/v1/users/:id` endpoint to a generated GoForj App.

The endpoint is intentionally small. It establishes the normal shape for application features: route registration, a thin controller, service-owned behavior, explicit Wire wiring, and a fast service test.

## What You Will Build

- `internal/users.Service` owns user lookup behavior.
- `internal/users.Controller` translates HTTP into a service call.
- `wire/appSet` provides the service.
- `wire/httpAppControllerSet` provides the controller.
- `internal/router.ProvideAppRoutes` adds the controller routes.
- `forj run route:list` shows the registered endpoint.

## Prerequisites

Start from a generated GoForj App with HTTP enabled.

From the App root, verify the existing route surface:

```bash
forj run route:list
```

## Golden Path State

Before this scenario, the App has the generated HTTP runtime but no application-owned user feature.

After this scenario, the App has one tested `GET /api/v1/users/:id` route, a thin controller, a service boundary, Wire providers, and route registration that appears in `route:list`.

## Files

This scenario edits or creates:

```text
internal/users/service.go
internal/users/service_test.go
internal/users/controller.go
wire/inject_app_services.go
wire/inject_http_controllers.go
internal/router/routes_registry.go
```

## Step 1: Add The Service

Create `internal/users/service.go`:

```go
package users

import (
	"context"
	"errors"
)

var ErrUserNotFound = errors.New("user not found")

type User struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type Service struct{}

func NewService() *Service {
	return &Service{}
}

func (s *Service) Find(ctx context.Context, id string) (User, error) {
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

This first version has no repository yet. [Cached User Profile](/scenarios/cached-user-profile) introduces a repository and cache boundary.

## Step 2: Add The Controller

Create `internal/users/controller.go`:

```go
package users

import (
	"errors"
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

The controller only reads HTTP input, calls the service, and writes the HTTP response. It does not own persistence, cache behavior, queue dispatch, or infrastructure setup.

## Step 3: Provide The Service

Open `wire/inject_app_services.go`.

Add the users package to the imports, using your App module path:

```go
import (
	// existing imports...

	"your/module/internal/users"
)
```

Add `users.NewService` to `appSet`:

```go
var appSet = wire.NewSet(
	provideCacheManager,
	provideStorageManager,
	provideEventManager,
	provideInspectManager,
	users.NewService,
	// existing providers...
)
```

`Service` is now part of the compiled App dependency graph.

## Step 4: Provide The Controller

Open `wire/inject_http_controllers.go`.

Add the users package to the imports:

```go
import (
	// existing imports...

	"your/module/internal/users"
)
```

Add `users.NewController` to `httpAppControllerSet`:

```go
var httpAppControllerSet = wire.NewSet(
	users.NewController,
	// existing controllers...
)
```

Wire can now construct the controller because `appSet` provides `*users.Service`.

## Step 5: Register The Routes

Open `internal/router/routes_registry.go`.

Add the users package to the imports:

```go
import (
	"github.com/goforj/web"

	"your/module/internal/users"
)
```

Add the controller to `ProvideAppRoutes`:

```go
func ProvideAppRoutes(
	// existing controllers...
	usersController *users.Controller,
) *AppRoutes {
	var publicRoutes []web.Route
	var protectedRoutes []web.Route

	publicRoutes = append(publicRoutes, usersController.Routes()...)

	// existing route registration...

	return &AppRoutes{
		public:    publicRoutes,
		protected: protectedRoutes,
	}
}
```

Generated Apps mount public routes under `/api/v1` by default, so the controller route `/users/:id` becomes `/api/v1/users/:id`.

## Step 6: Build

Run the normal build pipeline:

```bash
forj build
```

`forj build` refreshes generated code, runs Wire, builds API index artifacts, and then builds the App binary.

::: info Dev Loop
During `forj dev`, the generated build watcher normally runs `forj build` for you.
:::

## Verify

List registered routes:

```bash
forj run route:list
```

You should see a `GET` route for:

```text
/api/v1/users/:id
```

Run the HTTP server:

```bash
forj run api
```

Request the endpoint:

```bash
curl http://localhost:3000/api/v1/users/42
```

Expected response:

```json
{"id":"42","name":"Ada Lovelace","email":"ada@example.test"}
```

## Test The Service

Create `internal/users/service_test.go`:

```go
package users

import (
	"context"
	"testing"
)

func TestServiceFindsUser(t *testing.T) {
	service := NewService()

	user, err := service.Find(context.Background(), "42")
	if err != nil {
		t.Fatalf("find user: %v", err)
	}
	if user.ID != "42" {
		t.Fatalf("user id = %q, want %q", user.ID, "42")
	}
}

func TestServiceRejectsEmptyID(t *testing.T) {
	service := NewService()

	_, err := service.Find(context.Background(), "")
	if err == nil {
		t.Fatal("expected error")
	}
}
```

Run:

```bash
go test ./...
```

The service test does not start HTTP. It proves the business behavior directly.

## Operations

This route participates in the normal HTTP runtime:

- `route:list` shows it after registration.
- HTTP request logs include requests to it when access logging is enabled.
- HTTP metrics include it when metrics are enabled.
- HTTP inspects can show request and response details when inspect capture is enabled.
- Lighthouse can display route and runtime information when Lighthouse is enabled.

Do not add route-specific production behavior in the controller. Prefer middleware, services, metrics, and inspects at the appropriate boundary.

## Common Mistakes

::: warning Common mistakes
- Do not put user lookup logic in `Show`.
- Do not register routes directly in the HTTP server package.
- Do not edit `wire/wire_gen.go` by hand.
- Do not skip `forj build` after changing Wire providers.
- Do not import the underlying HTTP engine in normal App controllers.
:::

## Next Step

Next, extend this feature with a repository and named cache resource in [Cached User Profile](/scenarios/cached-user-profile).
