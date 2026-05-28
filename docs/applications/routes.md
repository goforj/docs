---
title: Routes
description: How routes are registered, grouped, protected, listed, and operated in generated GoForj Apps.
---

# Routes

Routes connect HTTP methods and paths to handlers through the `web` routing contract.

Generated GoForj Apps keep route registration explicit so HTTP behavior is discoverable through code, `route:list`, metrics, inspects, and Lighthouse.

## Where Routes Live

Application route composition usually lives in:

```text
internal/router/routes_registry.go
```

Feature packages expose routes from controllers:

```text
internal/users/controller.go
internal/reports/controller.go
```

The route registry composes those controller routes into route groups.

## Controller Routes

Controllers return `[]web.Route`:

```go
func (c *Controller) Routes() []web.Route {
	return []web.Route{
		web.NewRoute(http.MethodGet, "/users/:id", c.Show),
		web.NewRoute(http.MethodPost, "/users", c.Store),
	}
}
```

Handlers receive `web.Context`, not the underlying HTTP engine context.

## Route Groups

The generated router groups public and protected routes under `/api/v1` by default:

```go
func ProvideRoutes(r *AppRoutes, authService *auth.Service) []web.RouteGroup {
	var groups []web.RouteGroup

	if len(r.public) > 0 {
		groups = append(groups, web.NewRouteGroup("/api/v1", r.public))
	}
	if len(r.protected) > 0 {
		groups = append(groups,
			web.NewRouteGroup("/api/v1", r.protected, authService.RequireAuth()).
				WithMiddlewareNames("auth.RequireAuth"),
		)
	}

	return groups
}
```

Route groups are the right place for shared prefixes and group-level middleware.

## Route Naming

Use REST-ish paths that describe resources. Let HTTP methods carry the action:

```text
GET  /api/v1/users/:id
POST /api/v1/reports
```

Avoid RPC-style paths such as `/api/v1/get-user` for normal resource operations. See [Naming Conventions](/core/naming-conventions) for the full naming map.

## Listing Routes

Use:

```bash
forj run route:list
```

Use `route:list` as the source of truth for what the App registered. Do not rely only on startup logs.

## Framework Routes

The HTTP runtime also registers framework-owned routes such as:

- `/-/health`
- `/-/ready`
- `/swagger`
- `/swagger/doc.json`
- `/metrics` when metrics are enabled
- Lighthouse routes when Lighthouse is enabled

Do not add application behavior by editing framework route registration.

## Common Mistakes

::: warning Common mistakes
- Do not scatter route registration across unrelated packages.
- Do not bypass `web` routes with low-level HTTP setup in normal App code.
- Do not put business logic in route registration.
- Do not make route paths depend on runtime topology.
- Do not treat framework routes as application-owned endpoints.
:::

## Next Steps

- [Controllers](/applications/controllers) explains handler structure.
- [Middleware](/applications/middleware) explains route and group policy.
- [Naming Conventions](/core/naming-conventions) defines route naming.
- [Web](/web) covers standalone route primitives.
