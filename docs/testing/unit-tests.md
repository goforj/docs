---
title: Unit Tests
description: How to test GoForj application services and pure behavior without booting the full App.
---

# Unit Tests

Unit tests should be the first test layer for application behavior.

Most service, validation, formatting, and workflow logic should be testable without starting HTTP, queue workers, scheduler, or external infrastructure.

## Command

From the generated App root:

```bash
go test ./...
```

## Service Tests

Test services directly:

```go
package users

import (
	"context"
	"errors"
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
	if !errors.Is(err, ErrUserNotFound) {
		t.Fatalf("error = %v, want %v", err, ErrUserNotFound)
	}
}
```

This matches the service from [JSON API Route](/scenarios/json-api-route). Use fakes, in-memory repositories, or local drivers when they make behavior clear.

## What To Unit Test

Unit tests are a good fit for:

- service behavior
- request normalization helpers
- response mapping helpers
- repository logic with fakes
- job handler logic without a worker runtime
- event subscriber logic without distributed transport
- scheduler target methods

## Avoid Full Runtime Boot

Do not start the full App when the behavior belongs to one service or function.

Full runtime tests are useful, but they are slower and should be reserved for boundaries that need runtime wiring.

## Common Mistakes

::: warning Common mistakes
- Do not use distributed infrastructure for pure service tests.
- Do not make required dependencies look optional in test-only constructors.
- Do not make services depend on HTTP-only types.
- Do not test scheduler timing when the scheduled method can be tested directly.
:::

## Next Steps

- [HTTP Tests](/testing/http-tests) covers controller and route behavior.
- [Job and Queue Tests](/testing/job-queue-tests) covers background work.
- [Integration Tests](/testing/integration-tests) covers backend behavior.
