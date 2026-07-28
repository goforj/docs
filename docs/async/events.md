---
title: Events
description: How GoForj Apps publish typed facts through local or distributed event buses.
---

# Events

An Event is a typed fact that something happened.

Use events for fan-out and decoupled reactions. Use queues and jobs for durable background work, retries, delays, timeouts, and worker lifecycle.

::: info Events library reference
This guide follows events through a GoForj App's publishers, subscribers, and configuration. The [events library page](/events) contains the standalone usage, complete package reference, and distributed-driver matrix.
:::

## When To Use Events

Use an event when something happened and one or more subscribers may react to that fact. Start with `inproc` for same-process fan-out. Choose a transport-backed driver when subscribers must run in other processes or hosts.

Use a queue instead when the work needs durability, retries, delays, timeout policy, queue selection, or independently scaled workers.

## Generate an Event

<MakeCommandTabs name="event">
<template #usage>

Create an event type for the default App:

```bash
forj make:event UserRegistered
```

Use a grouped name to colocate an event with its owning package:

```bash
forj make:event billing:invoice-paid
```

</template>
<template #files>

```text
internal/billing/invoice_paid_event.go    created
```

Events are payload types created at publish time, so generation does not alter Wire or App registration files.

</template>
<template #generated>

The generated type provides a stable topic and a place for the payload:

<CodeFile path="internal/billing/invoice_paid_event.go">

```go
const InvoicePaidEventTopic = "invoicepaid"

type InvoicePaidEvent struct {
	// Add event fields.
}

func (InvoicePaidEvent) Topic() string {
	return InvoicePaidEventTopic
}
```
</CodeFile>

</template>
</MakeCommandTabs>

Create event subscribers separately with the [Event Subscribers](/async/event-subscribers) workflow. Subscribers add App-owned wiring and can target a named bus with `--bus <name>`.

Use `domain.past_tense` topics, such as `users.created` or `invoices.paid`. Review the generated topic constant before other code depends on it. See [Naming Conventions](/core/naming-conventions) for the full naming map.

## Add the Payload

Replace the generated placeholder with the fact subscribers need. The scaffold derives `invoicepaid` from the generated type; choose the stable domain topic before publishers or subscribers depend on it:

```go
type UserRegisteredEvent struct {
	UserID string `json:"user_id"`
}

func (UserRegisteredEvent) Topic() string {
	return "users.registered"
}
```

Topics should be stable when other code or infrastructure depends on them.

## Publishing

Publish through the App's generated event bus:

```go
err := app.Bus().WithContext(ctx).Publish(UserRegisteredEvent{
	UserID: user.ID,
})
```

In services, prefer injecting the event bus or a small publisher wrapper instead of reaching through global state.

## Drivers

Compile-time support:

```text
EVENTS_SUPPORTED_DRIVERS=inproc,redis
```

Runtime selection:

```text
EVENTS_DRIVER=inproc
EVENTS_AUDIT_DRIVER=redis
```

`inproc` is process-local, non-durable, and needs no transport settings. Use distributed drivers when events need to cross process boundaries. See [Environment Reference](/reference/env-vars#events) for each driver's settings.

## Regeneration

After changing supported drivers or named event buses, use the normal build path:

```bash
forj build
```

During `forj dev`, an app listed in `dev.apps` rebuilds automatically. [Generation Commands](/reference/generation-commands) covers focused maintainer workflows.

## Next Steps

- [Event Subscribers](/async/event-subscribers) explains handlers.
- [Events versus Queues](/async/events-vs-queues) explains boundary decisions.
- [Environment Reference](/reference/env-vars#events) lists driver settings.
- [Naming Conventions](/core/naming-conventions) defines stable event topics.
- [Events](/events) covers standalone package details.
