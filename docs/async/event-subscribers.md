---
title: Event Subscribers
description: How event subscribers react to typed events without becoming hidden workflow containers.
---

# Event Subscribers

Event Subscribers react to typed events.

Subscribers are useful for fan-out, secondary reactions, and integration points. They should stay explicit and observable.

## Generate a Subscriber

<MakeCommandTabs name="subscriber">
<template #usage>

Generate a subscriber from the event name:

```bash
forj make:subscriber billing:invoice-paid
```

Use `--bus` when the subscriber should attach to a named event bus:

```bash
forj make:subscriber billing:invoice-paid --bus audit
```

The named bus must be configured, for example with `EVENTS_AUDIT_DRIVER`.

</template>
<template #files>

```text
internal/billing/invoice_paid_subscriber.go    created
app/wire/inject_subscribers_app.go             provider and subscription added
```

For an additional app, the subscriber remains under `internal/...`; its injector is in the owning app at `app/<name>/wire/inject_subscribers_app.go`.

</template>
<template #generated>

The generated subscriber starts with a typed handler:

<CodeFile path="internal/billing/invoice_paid_subscriber.go">

<!-- go-example: illustrative-fragment -->
```go
// InvoicePaidSubscriber handles InvoicePaidEvent messages from the configured event bus.
type InvoicePaidSubscriber struct{}

// NewInvoicePaidSubscriber constructs the invoice-paid subscriber.
func NewInvoicePaidSubscriber() *InvoicePaidSubscriber {
	return &InvoicePaidSubscriber{}
}

// Handle processes an invoice-paid event.
func (s *InvoicePaidSubscriber) Handle(
	ctx context.Context,
	event InvoicePaidEvent,
) error {
	_ = ctx
	_ = event
	return nil
}
```
</CodeFile>

The App Wire file constructs the subscriber and subscribes it to the selected bus:

<CodeFile path="app/wire/inject_subscribers_app.go">

<!-- go-example: illustrative-fragment -->
```go
// appSubscriberSet contains application-owned event subscriber providers.
var appSubscriberSet = wire.NewSet(
	ProvideEventSubscribers,
	billing.NewInvoicePaidSubscriber, // [!code highlight]
)

// ProvideEventSubscribers registers application subscribers with configured event buses.
func ProvideEventSubscribers(
	eventManager *events.Manager,
	billingInvoicePaidSubscriber *billing.InvoicePaidSubscriber, // [!code highlight]
) (*EventSubscribersReady, error) {
	billingInvoicePaidSubscriberBus := eventManager.Named("audit") // [!code highlight]
	if billingInvoicePaidSubscriberBus == nil { // [!code highlight]
		return nil, fmt.Errorf(`event bus %q is not configured`, "audit") // [!code highlight]
	} // [!code highlight]
	if _, err := billingInvoicePaidSubscriberBus.Subscribe( // [!code highlight]
		billingInvoicePaidSubscriber.Handle, // [!code highlight]
	); err != nil { // [!code highlight]
		return nil, err // [!code highlight]
	} // [!code highlight]
	return &EventSubscribersReady{}, nil
}
```
</CodeFile>

</template>
</MakeCommandTabs>

## Dispatch Durable Follow-up Work

A subscriber can hand retryable work to a generated job:

<!-- go-example: illustrative-fragment -->
```go
_, err := bus.WithContext(ctx).Subscribe(func(ctx context.Context, event UserRegisteredEvent) error {
	return welcomeEmails.Queue(ctx, event.UserID)
})
```

The event announces the fact. If work must be durable or retried, the subscriber can dispatch a job.

## Registration Timing

Register subscribers through generated or documented App registration surfaces before the event runtime starts.

Subscriber registration should be visible in App construction, not hidden in package `init` functions.

The generated-code tab shows the maintained registration path. That App-owned injector is rendered once and preserved across re-renders, so manual subscriber wiring can live beside generated entries.

The event type itself does not belong in the provider graph. The subscriber object or registrar does, because it may need services, repositories, queues, or publishers injected before it subscribes to the bus during App startup.

## Error Handling

Event bus behavior depends on the driver. Do not assume subscriber errors are durable retry signals.

Handle important subscriber failures deliberately:

- return errors when the driver observes them
- log or record metrics where appropriate
- dispatch jobs for retryable work
- make critical reactions explicit instead of best-effort

## Test the Reaction

Test the subscriber as an ordinary Go type: construct it with fakes for its required services, call `Handle` with a typed event, and assert the one intended reaction. Include a dependency-error case and assert the returned error instead of relying on logs.

Then add one App-level test that publishes through the configured in-process bus and proves the generated registration invokes the subscriber. That second test catches a missing provider or `Subscribe` call that a direct handler test cannot see.

For a distributed bus, the release smoke test must cross processes. Publish a non-production event through one deployed process and confirm the intended subscriber process records the stable topic and outcome. A successful publisher call alone does not prove subscription, delivery, or remote credentials.

## Good Uses

Subscribers are a good fit for:

- publishing follow-up events
- dispatching background jobs
- recording audit facts
- updating derived projections
- notifying non-critical integrations

Use queues for durable, retryable, worker-managed work.

## Next Steps

- [Events](/async/events) explains event publishing.
- [Jobs](/async/jobs) explains durable background work.
- [Retries and Idempotency](/async/retries-idempotency) explains safe retry design.
