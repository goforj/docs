---
title: Middleware
description: How middleware is applied around HTTP handlers in generated GoForj Apps.
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
web.NewRoute(http.MethodPost, "/reports", c.Store, c.requireReportsAccess())
```

Use route-specific middleware for route-specific policy. Use group middleware when the policy applies to the entire group.

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

Use the `webtest` helpers from [Web](/web) when testing middleware behavior directly.

For full App behavior, prefer HTTP tests against the generated route surface so middleware, routing, and controllers run together.

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
