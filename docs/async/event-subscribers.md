---
title: Event Subscribers
description: How event subscribers react to typed events without becoming hidden workflow containers.
---

# Event Subscribers

Event Subscribers react to typed events.

Subscribers are useful for fan-out, secondary reactions, and integration points. They should stay explicit and observable.

## Subscriber Shape

Generate a subscriber from the event name:

```bash
forj make:subscriber billing:invoice-paid
```

This creates a colocated subscriber such as:

```text
internal/billing/invoice_paid_subscriber.go
```

It also updates the App-owned subscriber injector:

```text
wire/inject_event_subscribers.go
```

Use `--bus` when the subscriber should attach to a named event bus:

```bash
forj make:subscriber billing:invoice-paid --bus audit
```

The named bus must be configured, for example with `EVENTS_AUDIT_DRIVER`.

```go
_, err := bus.WithContext(ctx).Subscribe(func(ctx context.Context, event UserRegisteredEvent) error {
	return welcomeEmails.Queue(ctx, event.UserID)
})
```

The event announces the fact. If work must be durable or retried, the subscriber can dispatch a job.

## Where To Register

Register subscribers through generated or documented App registration surfaces before the event runtime starts.

Subscriber registration should be visible in App construction, not hidden in package `init` functions.

Generated subscribers are registered in `wire/inject_event_subscribers.go`. The file is rendered once and preserved across re-renders, so App-owned subscriber wiring stays with the App.

The event type itself does not belong in the provider graph. The subscriber object or registrar does, because it may need services, repositories, queues, or publishers injected before it subscribes to the bus during App startup.

## Error Handling

Event bus behavior depends on the driver. Do not assume subscriber errors are durable retry signals.

Handle important subscriber failures deliberately:

- return errors when the driver observes them
- log or record metrics where appropriate
- dispatch jobs for retryable work
- make critical reactions explicit instead of best-effort

## Good Uses

Subscribers are a good fit for:

- publishing follow-up events
- dispatching background jobs
- recording audit facts
- updating derived projections
- notifying non-critical integrations

Use queues for durable, retryable, worker-managed work.

## Common Mistakes

::: warning Common mistakes
- Do not hide critical business workflows only in event subscribers.
- Do not use subscribers as an implicit service locator.
- Do not assume all event drivers handle errors the same way.
- Do not make subscribers depend on HTTP-only types.
- Do not use events to avoid clear service orchestration.
:::

## Next Steps

- [Events](/async/events) explains event publishing.
- [Jobs](/async/jobs) explains durable background work.
- [Retries and Idempotency](/async/retries-idempotency) explains safe retry design.
