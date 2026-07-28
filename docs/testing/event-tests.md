---
title: Event Tests
description: How to test typed event publication and subscriber behavior.
---

# Event Tests

Event tests should prove publication, subscription, payload shape, and side effects without pretending events are durable job transport.

## Local Driver

Use the in-process driver for local event tests:

```text
EVENTS_DRIVER=inproc
EVENTS_SUPPORTED_DRIVERS=inproc
```

Use distributed event driver tests only when transport behavior matters.

## Publish and Subscribe

Add this test to `internal/events/bus_delivery_test.go`. Keeping the test in the generated package lets it exercise the App-facing bus without inventing another constructor:

```go
package events

import (
	"context"
	"testing"
	"time"
)

// userRegisteredEvent keeps this transport test independent from application examples.
type userRegisteredEvent struct {
	UserID string
}

// Topic keeps the test independent from optional application event examples.
func (userRegisteredEvent) Topic() string {
	return "users.registered"
}

// TestInprocPublishAndSubscribe proves typed delivery without a broker.
func TestInprocPublishAndSubscribe(t *testing.T) {
	t.Setenv("EVENTS_DRIVER", "inproc")

	ctx := context.Background()
	bus := NewBus(ctx)
	t.Cleanup(func() { _ = bus.Close(ctx) })

	received := make(chan userRegisteredEvent, 1)
	sub, err := bus.WithContext(ctx).Subscribe(func(_ context.Context, event userRegisteredEvent) error {
		received <- event
		return nil
	})
	if err != nil {
		t.Fatalf("subscribe: %v", err)
	}
	t.Cleanup(func() { _ = sub.Close() })

	if err := bus.WithContext(ctx).Publish(userRegisteredEvent{UserID: "user_123"}); err != nil {
		t.Fatalf("publish: %v", err)
	}

	select {
	case event := <-received:
		if event.UserID != "user_123" {
			t.Fatalf("user ID = %q, want %q", event.UserID, "user_123")
		}
	case <-time.After(500 * time.Millisecond):
		t.Fatal("timed out waiting for in-process event delivery")
	}
}
```

`NewBus` returns one lifecycle-aware `Bus`. Use `NewManagerWithContext` instead when the test specifically needs to assert manager initialization errors.

## Subscriber Tests

Test subscriber behavior directly when it delegates to a service or dispatches a job.

If the subscriber does durable work, prefer asserting that it dispatches the right job rather than treating the event bus as the retry system.

## Verify

With the events component enabled, run the event-owning package with the in-process driver:

```bash
EVENTS_DRIVER=inproc EVENTS_SUPPORTED_DRIVERS=inproc go test ./internal/events/...
```

Expected result: the package reports `ok` without a broker, and the test fails rather than hanging if delivery does not occur.

## Common Mistakes

::: warning Common mistakes
- Do not assume in-process events cross process boundaries.
- Do not rely on subscriber errors as durable retries unless the driver guarantees that behavior.
- Do not hide critical workflows only in event subscribers.
- Do not test event transport when the target is service behavior.
:::

## Next Steps

- [Events](/async/events) explains event design.
- [Event Subscribers](/async/event-subscribers) explains handler boundaries.
- [Jobs](/async/jobs) explains durable work.
