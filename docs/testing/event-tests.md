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

## Publish And Subscribe

```go
bus, err := events.NewBus(context.Background())
if err != nil {
	t.Fatalf("new bus: %v", err)
}
defer bus.Close(context.Background())

received := make(chan UserRegisteredEvent, 1)
sub, err := bus.Subscribe(func(ctx context.Context, event UserRegisteredEvent) error {
	received <- event
	return nil
})
if err != nil {
	t.Fatalf("subscribe: %v", err)
}
defer sub.Close()

if err := bus.Publish(UserRegisteredEvent{UserID: "user_123"}); err != nil {
	t.Fatalf("publish: %v", err)
}
```

## Subscriber Tests

Test subscriber behavior directly when it delegates to a service or dispatches a job.

If the subscriber does durable work, prefer asserting that it dispatches the right job rather than treating the event bus as the retry system.

## Common Mistakes

- Do not assume in-process events cross process boundaries.
- Do not rely on subscriber errors as durable retries unless the driver guarantees that behavior.
- Do not hide critical workflows only in event subscribers.
- Do not test event transport when the target is service behavior.

## Next Steps

- [Events](/async/events) explains event design.
- [Event Subscribers](/async/event-subscribers) explains handler boundaries.
- [Jobs](/async/jobs) explains durable work.
