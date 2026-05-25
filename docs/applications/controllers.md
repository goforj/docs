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

- Do not put business workflows directly in controllers.
- Do not import backend driver packages into controllers.
- Do not use controllers as service locators.
- Do not hide validation failures behind generic internal errors.
- Do not depend on the underlying HTTP engine in normal App controllers.

## Next Steps

- [Requests And Validation](/applications/requests-validation) explains request input boundaries.
- [Responses And Errors](/applications/responses-errors) explains response shape.
- [Application Services](/applications/services) explains where business behavior belongs.
