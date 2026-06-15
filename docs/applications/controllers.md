---
title: Controllers
description: How to write thin HTTP controllers that translate requests into application service calls.
---

# Controllers

A Controller is an HTTP-facing type that groups related route handlers.

Controllers should translate requests into application service calls and translate service results into responses. Business workflows belong in services, jobs, or domain-owned types.

## Controller Shape

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

## Make Commands

Use `forj make:controller` when starting a new controller:

```bash
forj make:controller Users
```

The make command generates the controller and injects it into the generated HTTP wiring surfaces. In the normal flow, you do not hand-edit the controller provider set just to make the new controller constructible.

Use grouped names to place controllers with the package they belong to:

```bash
forj make:controller billing:reports
```

This creates `internal/billing/reports/controller.go`, wires the controller constructor, and registers the controller routes. Use `-d` only when you intentionally want to override the package directory.

Review what the make command created or updated:

- `internal/users/controller.go` owns the controller type, constructor, handlers, and route list.
- `app/wire/inject_http_controllers_app.go` provides the controller constructor.
- `app/routes.go` includes the controller routes in the default app route registry.

If the controller depends on a service, make sure the service constructor is wired from `app/wire/inject_services_app.go`. The make command wires the controller; the service provider still belongs in the app services set.

```go
var appSet = wire.NewSet(
	// existing framework and app providers...
	users.NewService,
)
```

The controller itself belongs in the HTTP controller set. The make command adds this provider for you:

```go
var httpAppControllerSet = wire.NewSet(
	// existing controllers...
	users.NewController,
)
```

Run:

```bash
forj build
forj route:list
```

`forj build` verifies the generated graph. `route:list` verifies the controller routes are registered where the App can serve them.

For a named app, run the make command through that app:

```bash
forj marketplace make:controller checkout
forj marketplace route:list
```

This creates `internal/checkout/controller.go`, then updates `app/marketplace/routes.go` and `app/marketplace/wire/inject_http_controllers_app.go`.

## Responsibilities

Controllers should own:

- path parameters
- query parameters
- request binding
- request validation handoff
- service calls
- response shaping
- HTTP status decisions

Controllers should not own long-running business workflows, persistence details, queue worker behavior, or infrastructure construction.

## Dependency Injection

Controllers are constructed through providers and Wire.

Inject services, not global state:

```go
func NewController(service *Service) *Controller {
	return &Controller{service: service}
}
```

If the service is required, keep it visible in the constructor. Optional collaborators should be modeled explicitly.

## Request Context

Use `ctx.Context()` when passing cancellation and deadlines into services:

```go
report, err := c.service.Generate(ctx.Context(), input)
```

Use `web.Context` for HTTP-specific behavior such as params, binding, response helpers, request metadata, and response writing.

## Common Mistakes

::: warning Common mistakes
- Do not put business workflows directly in controllers.
- Do not import backend driver packages into controllers.
- Do not use controllers as service locators.
- Do not hide validation failures behind generic internal errors.
- Do not depend on the underlying HTTP engine in normal App controllers.
:::

## Next Steps

- [Make Commands](/core/make-commands) explains grouped package placement and generated wiring updates.
- [Wiring Recipes](/core/wiring-recipes) shows the controller wiring flow.
- [Requests and Validation](/applications/requests-validation) explains request input boundaries.
- [Responses and Errors](/applications/responses-errors) explains response shape.
- [Application Services](/applications/services) explains where business behavior belongs.
