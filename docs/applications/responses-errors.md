---
title: Responses and Errors
description: How generated GoForj Apps should shape HTTP responses and error behavior.
---

# Responses and Errors

HTTP responses should be explicit, predictable, and safe to expose.

Controllers choose HTTP status codes and response bodies. Services return application results and errors.

## Response Helpers

Use `web.Context` response helpers:

```go
return ctx.JSON(http.StatusOK, body)
return ctx.Text(http.StatusOK, "ok")
return ctx.NoContent(http.StatusNoContent)
return ctx.Redirect(http.StatusFound, target)
```

Use [Web](/web) for package-level response helper details.

## JSON Shape

Use response shapes that are stable and easy to test.

Example:

```go
return ctx.JSON(http.StatusOK, map[string]any{
	"ok":   true,
	"user": user,
})
```

For application-specific APIs, prefer typed response structs once response shape becomes part of the contract.

## Error Mapping

Map known application errors at the controller boundary:

```go
user, err := c.service.Find(ctx.Context(), ctx.Param("id"))
if err != nil {
	switch {
	case errors.Is(err, ErrUserNotFound):
		return ctx.JSON(http.StatusNotFound, map[string]any{
			"ok":    false,
			"error": "user not found",
		})
	default:
		return err
	}
}
```

Unknown errors can be returned to the framework error path.

## Local Error Detail

Generated Apps can capture local HTTP error response bodies for debugging in local environments.

Do not rely on detailed error bodies as an operational data source in production. Use logs, metrics, inspects, readiness, and Lighthouse surfaces for runtime investigation.

## Readiness Errors

Unauthenticated readiness should avoid leaking raw infrastructure errors.

Authorized readiness can expose structured dependency checks when called with:

```text
Authorization: Bearer $APP_DIAG_TOKEN
```

## Common Mistakes

::: warning Common mistakes
- Do not expose raw infrastructure errors to public clients.
- Do not return `200 OK` for failed operations.
- Do not bury known application errors as generic internal errors.
- Do not make response shape vary unnecessarily between handlers.
- Do not use panics for normal validation or not-found behavior.
:::

## Next Steps

- [Requests and Validation](/applications/requests-validation) explains invalid input handling.
- [Controllers](/applications/controllers) explains where HTTP decisions belong.
- [HTTP Services](/applications/http-services) explains framework health and readiness routes.
