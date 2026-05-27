---
title: Job and Queue Tests
description: How to test queued jobs, handlers, dispatch behavior, and worker boundaries.
---

# Job and Queue Tests

Test job handlers directly first.

Use queue runtime tests only when dispatch, driver behavior, retries, worker lifecycle, or shutdown is the point.

## Payload Tests

```go
package jobs

import (
	"testing"

	"github.com/goforj/queue"
)

const SendWelcomeEmailTypeName = "emails:welcome"

type SendWelcomeEmailPayload struct {
	UserID string `json:"user_id"`
}

func TestSendWelcomeEmailPayload(t *testing.T) {
	job := queue.NewJob(SendWelcomeEmailTypeName).
		Payload(SendWelcomeEmailPayload{UserID: "user_123"}).
		OnQueue("default")

	var payload SendWelcomeEmailPayload
	if err := job.Bind(&payload); err != nil {
		t.Fatalf("bind payload: %v", err)
	}
	if payload.UserID != "user_123" {
		t.Fatalf("unexpected user id: %s", payload.UserID)
	}
}
```

For handler-level tests, either use the queue package test helpers available to your App version or run the job through a local `sync` queue when message construction is intentionally owned by the queue runtime.

## Dispatch Tests

Use `sync`, `workerpool`, or `null` drivers for local tests when possible:

```text
QUEUE_DRIVER=sync
QUEUE_SUPPORTED_DRIVERS=sync,workerpool
```

Use backend integration tests when Redis, SQL, NATS, SQS, or RabbitMQ behavior matters.

## Worker Tests

Test worker lifecycle when you need confidence in:

- handler registration
- worker startup
- shutdown timeout
- backend-specific delivery
- retry behavior
- metrics and inspect recording

Do not use worker tests for ordinary service behavior.

## Common Mistakes

::: warning Common mistakes
- Do not test all job behavior only through a running worker.
- Do not swallow handler errors in tests.
- Do not assume in-process drivers have the same durability as broker-backed drivers.
- Do not make test payloads untyped when production payloads are typed.
:::

## Next Steps

- [Jobs](/async/jobs) explains handler shape.
- [Workers](/async/workers) explains runtime lifecycle.
- [Retries and Idempotency](/async/retries-idempotency) explains retry-safe behavior.
