---
title: Routes
description: How routes are registered, grouped, protected, listed, and operated in GoForj Apps.
---

# Routes

Routes connect HTTP methods and paths to handlers through the `web` routing contract.

GoForj Apps keep route registration explicit so HTTP behavior is discoverable through code, `route:list`, and enabled metrics, Inspects, and Lighthouse.

## Where Routes Live

Application route composition usually lives in:

```text
app/routes.go
```

Feature packages expose routes from controllers:

```text
internal/users/controller.go
internal/reports/controller.go
```

The app route file composes those controller routes into route groups. Additional apps use the same pattern under the owning app's directory:

```text
app/admin/routes.go
```

## Follow the Complete Users Route

Use [JSON API Route](/scenarios/json-api-route) as the canonical, runnable Users workflow. It is maintained against the current templates; this page only describes the route-composition contract.

```bash
forj make:controller users
```

The generator creates the controller and adds its constructor to `app/wire/inject_http_controllers_app.go` and its routes to `app/routes.go`. After replacing the generated handler with application behavior, add any service constructors it needs to `app/wire/inject_services_app.go`, then run the scenario's build, test, and endpoint-verification steps. `forj route:list` is the check that the registered route is present.

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
forj route:list
```

For an additional app, prefix the command with the app name:

```bash
forj admin route:list
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

- [JSON API Route](/scenarios/json-api-route) is the complete runnable workflow.
- [Controllers](/applications/controllers) explains handler structure.
- [Middleware](/applications/middleware) explains route and group policy.
- [Naming Conventions](/core/naming-conventions) defines route naming.
- [Web](/web) covers standalone route primitives.
