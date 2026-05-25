---
title: Requests And Validation
description: How controllers bind, normalize, validate, and pass request input into services.
---

# Requests And Validation

Request handling should make invalid input visible at the HTTP boundary before application services perform business behavior.

Controllers own request translation. Services own application behavior.

## Bind Input

Use `web.Context` to bind request payloads:

```go
type CreateUserRequest struct {
	DisplayName string `json:"display_name"`
	Email       string `json:"email"`
	Password    string `json:"password"`
}

func (c *Controller) Store(ctx web.Context) error {
	var req CreateUserRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]any{
			"ok":    false,
			"error": "invalid payload",
		})
	}

	input, err := req.Input()
	if err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]any{
			"ok":    false,
			"error": err.Error(),
		})
	}

	user, err := c.service.Create(ctx.Context(), input)
	if err != nil {
		return err
	}

	return ctx.JSON(http.StatusCreated, user)
}
```

## Normalize Before Validation

Normalize request input before validation:

```go
func (r CreateUserRequest) Input() (CreateUserInput, error) {
	email := strings.TrimSpace(strings.ToLower(r.Email))
	displayName := strings.TrimSpace(r.DisplayName)

	if displayName == "" || email == "" || r.Password == "" {
		return CreateUserInput{}, errors.New("display_name, email, and password are required")
	}

	return CreateUserInput{
		DisplayName: displayName,
		Email:       email,
		Password:    r.Password,
	}, nil
}
```

This keeps controller code readable and gives the service a typed input.

## Validation Boundary

Validate:

- required fields
- basic shape
- allowed values
- path and query parameter presence
- payload size through middleware when relevant

Leave business rules to services when those rules require persistence, permissions, workflows, or domain decisions.

## Context Propagation

Pass `ctx.Context()` into services:

```go
user, err := c.service.Create(ctx.Context(), input)
```

This preserves request cancellation and deadlines across service, repository, queue, cache, storage, and event calls.

## Common Mistakes

- Do not pass raw request structs deep into services when a typed service input is clearer.
- Do not silently accept malformed payloads.
- Do not mix request binding with persistence logic.
- Do not use validation tags as a substitute for clear boundary behavior.
- Do not leak internal validation detail that is not useful to clients.

## Next Steps

- [Controllers](/applications/controllers) explains request handler structure.
- [Responses And Errors](/applications/responses-errors) explains error response policy.
- [Application Services](/applications/services) explains service inputs.
