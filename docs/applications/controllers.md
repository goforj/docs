---
title: Controllers
description: How to write thin HTTP controllers that translate requests into application service calls.
---

# Controllers

A Controller is an HTTP-facing type that groups related route handlers.

Controllers should translate requests into application service calls and translate service results into responses. Business workflows belong in services, jobs, or domain-owned types.

## Golden Path

The complete Users example lives in [JSON API Route](/scenarios/json-api-route). It starts with `forj make:controller users`, then shows the generated location, service provider, service test, build, route listing, and `curl` result. Reuse that flow rather than copying it into each HTTP page.

## Generate and Implement

Create the controller in its owning package:

```bash
forj make:controller users
```

Replace the starter response with a thin HTTP adapter around an application service:

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

For a redirect response, use the same controller boundary and return `ctx.Redirect(http.StatusFound, target)`. Response status and location belong to the HTTP adapter; deciding where the workflow should send a user can remain service-owned.

Make sure the service constructor is wired from `app/wire/inject_services_app.go`:

```go
var appSet = wire.NewSet(
	// existing framework and app providers...
	users.NewService,
)
```

The make command wires the controller; the service provider still belongs in the App services set.

## Verify the Result

Run the full verification after the implementation and service provider are in place:

```bash
forj build
go test ./...
forj route:list
```

Expected result: `forj build` regenerates the graph, `go test ./...` passes, and `route:list` includes the controller path. Start `forj api` and use the scenario's `curl` command to prove the public response.

For a named App, run `forj marketplace route:list` after the build to verify its routes.

## Generated Internals and Advanced Placement

<MakeCommandTabs name="controller">
<template #usage>

Use grouped names to colocate controllers with their package:

```bash
forj make:controller billing:reports
```

For a named App, prefix the generator:

```bash
forj marketplace make:controller checkout
```

</template>
<template #files>

```text
internal/billing/reports/controller.go       created
app/wire/inject_http_controllers_app.go      provider added
app/routes.go                                routes registered
```

For a named App, the controller remains under `internal/...`; the registration files live under `app/<name>/...`.

</template>
<template #generated>

The generated controller owns its starter handlers and route list:

<CodeFile path="internal/billing/reports/controller.go">

```go
type Controller struct {
	logger *logger.AppLogger
}

func NewController(logger *logger.AppLogger) *Controller {
	return &Controller{logger: logger}
}

func (c *Controller) Routes() []web.Route {
	return []web.Route{
		web.NewRoute(http.MethodGet, "/billing/reports", c.Get),
	}
}

func (c *Controller) Get(r web.Context) error {
	c.logger.Info().Msg("Hello from billing reports controller")
	return r.Text(http.StatusOK, "Hello from billing reports controller")
}
```
</CodeFile>

The generator adds its constructor to the HTTP controller provider set:

<CodeFile path="app/wire/inject_http_controllers_app.go">

```go
var appHttpControllerSet = wire.NewSet(
	billingReports.NewController, // [!code highlight]
)
```
</CodeFile>

It also injects the controller into the App route registry:

<CodeFile path="app/routes.go">

```go
func ProvideRoutes(
	billingReportsController *billingReports.Controller, // [!code highlight]
) []web.RouteGroup {
	publicRoutes := slices.Concat(
		billingReportsController.Routes(), // [!code highlight]
	)
	return []web.RouteGroup{
		web.NewRouteGroup("/api/v1", publicRoutes),
	}
}
```
</CodeFile>

</template>
</MakeCommandTabs>

In the normal flow, you do not hand-edit the controller provider set just to make the new controller constructible. Use `-d` only when you intentionally want to override the package directory.

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

Controllers are constructed through providers and Wire. The implementation above keeps its required service visible in `NewController`; follow that constructor-injection shape instead of reaching through global state. Model optional collaborators explicitly.

## Request Context

Use `ctx.Context()` when passing cancellation and deadlines into services:

```go
report, err := c.service.Generate(ctx.Context(), input)
```

Use `web.Context` for HTTP-specific behavior such as params, binding, response helpers, request metadata, and response writing.

## Next Steps

- [Make Commands](/core/make-commands) explains grouped package placement and generated wiring updates.
- [Wiring Recipes](/core/wiring-recipes) shows the controller wiring flow.
- [Requests and Validation](/applications/requests-validation) explains request input boundaries.
- [Responses and Errors](/applications/responses-errors) explains response shape.
- [Application Services](/applications/services) explains where business behavior belongs.
