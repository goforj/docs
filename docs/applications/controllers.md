---
title: Controllers
description: How to write thin HTTP controllers that translate requests into application service calls.
---

# Controllers

A Controller is an HTTP-facing type that groups related route handlers.

Controllers should translate requests into application service calls and translate service results into responses. Business workflows belong in services, jobs, or domain-owned types.

## Generate a Controller

<MakeCommandTabs name="controller">
<template #usage>

Name the controller for the HTTP area it owns:

```bash
forj make:controller reports
```

For an additional app, prefix the generator with the app name:

```bash
forj admin make:controller reports
```

Replace the starter response with a thin HTTP adapter around an application service:

```go
package reports

import (
	"net/http"

	"github.com/goforj/web"
)

// Controller translates report HTTP requests into service calls.
type Controller struct {
	service *Service
}

// NewController constructs the report HTTP adapter.
func NewController(service *Service) *Controller {
	return &Controller{service: service}
}

// Routes declares the report endpoints owned by this controller.
func (c *Controller) Routes() []web.Route {
	return []web.Route{
		web.NewRoute(http.MethodGet, "/reports/:id", c.Show),
	}
}

// Show returns one report by ID.
func (c *Controller) Show(ctx web.Context) error {
	report, err := c.service.Find(ctx.Context(), ctx.Param("id"))
	if err != nil {
		return err
	}
	return ctx.JSON(http.StatusOK, report)
}
```

For a redirect response, use the same controller boundary and return `ctx.Redirect(http.StatusFound, target)`. Response status and location belong to the HTTP adapter; deciding where the workflow should send a user can remain service-owned.

The make command wires the controller constructor. Add the application service to `app/wire/inject_services_app.go`:

```go
// appSet provides application-level services and dependencies.
var appSet = wire.NewSet(
	// existing framework and app providers...
	reports.NewService,
)
```

</template>
<template #files>

```text
internal/reports/controller.go               created
app/wire/inject_http_controllers_app.go      provider added
app/routes.go                                routes registered
```

For an additional app, the controller remains under `internal/...`; the registration files live under the owning app's `app/<name>/...`.

</template>
<template #generated>

The generated controller owns its starter handlers and route list:

<CodeFile path="internal/reports/controller.go">

```go
// Controller handles HTTP requests.
type Controller struct {
	logger *logger.AppLogger
}

// NewController creates a Controller.
func NewController(logger *logger.AppLogger) *Controller {
	return &Controller{logger: logger}
}

// Routes returns the HTTP routes handled by Controller.
func (c *Controller) Routes() []web.Route {
	return []web.Route{
		web.NewRoute(http.MethodGet, "/reports", c.Get),
	}
}

// Get handles the controller's GET route.
func (c *Controller) Get(r web.Context) error {
	c.logger.Info().Msg("Hello from reports controller")
	return r.Text(http.StatusOK, "Hello from reports controller")
}
```
</CodeFile>

The generator adds its constructor to the HTTP controller provider set:

<CodeFile path="app/wire/inject_http_controllers_app.go">

```go
// appHttpControllerSet provides all HTTP route controllers.
var appHttpControllerSet = wire.NewSet(
	reports.NewController, // [!code highlight]
)
```
</CodeFile>

It also injects the controller into the App route registry:

<CodeFile path="app/routes.go">

```go
// ProvideRoutes provides route groups for the HTTP server.
func ProvideRoutes(
	reportsController *reports.Controller, // [!code highlight]
) []web.RouteGroup {
	publicRoutes := slices.Concat(
		reportsController.Routes(), // [!code highlight]
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

## Verify the Result

Run the full verification after the implementation and service provider are in place:

```bash
forj build
go test ./...
forj route:list
```

Expected result: `forj build` regenerates the graph, `go test ./...` passes, and `route:list` includes `/reports/:id`. Start `forj api` and request the route to prove the public response.

For an additional app, run `forj admin route:list` after the build to verify its routes.

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

- [JSON API Route](/scenarios/json-api-route) follows a complete controller, service, test, build, route-list, and request workflow.
- [Make Commands](/core/make-commands) explains grouped package placement and generated wiring updates.
- [Wiring Recipes](/core/wiring-recipes) shows the controller wiring flow.
- [Requests and Validation](/applications/requests-validation) explains request input boundaries.
- [Responses and Errors](/applications/responses-errors) explains response shape.
- [Application Services](/applications/services) explains where business behavior belongs.
