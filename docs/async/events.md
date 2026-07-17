---
title: Events
description: How generated GoForj Apps publish typed facts through local or distributed event buses.
---

# Events

An Event is a typed fact that something happened.

Use events for fan-out and decoupled reactions. Use queues and jobs for durable background work, retries, delays, timeouts, and worker lifecycle.

## When To Use Events

| Question | Guidance |
| --- | --- |
| Use this when | Something happened and one or more subscribers may react to that fact. |
| Avoid this when | The work needs durability, retries, queue selection, delays, timeout policy, or worker scaling. |
| Start with | `inproc` events for local same-process fan-out. |
| Upgrade to | Transport-backed events when subscribers must run in other processes or hosts. |

## Generated Package

Generated event code lives in:

```text
internal/events
```

Create an event type:

```bash
forj make:event UserRegistered
```

`make:event` generates a plain payload type and topic constant. It does not add a Wire provider because event payloads are created at publish time, not constructed once as App dependencies.

Create subscribers separately:

```bash
forj make:subscriber users:registered
```

`make:subscriber` creates a handler object and registers it in the App-owned event subscriber injector. Use `--bus <name>` when the subscriber should listen on a named bus configured by `EVENTS_<NAME>_DRIVER`.

Use `domain.past_tense` topics, such as `users.created` or `invoices.paid`. Review the generated topic constant before other code depends on it. See [Naming Conventions](/core/naming-conventions) for the full naming map.

## Event Shape

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

Publish through the generated App event bus:

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

::: info Dev Loop
When this App is listed in `dev.apps`, its build lifecycle normally runs `forj build` for you.
:::

Use focused generation only when you intentionally want to refresh events without a full build:

```bash
forj generate --events
```

## Common Mistakes

::: warning Common mistakes
- Do not use events as durable job transport.
- Do not assume in-process events are visible across processes.
- Do not publish events for every private method call.
- Do not use unstable topic names.
- Do not make subscribers silently swallow important failures.
:::

## Next Steps

- [Event Subscribers](/async/event-subscribers) explains handlers.
- [Events versus Queues](/async/events-vs-queues) explains boundary decisions.
- [Environment Reference](/reference/env-vars#events) lists driver settings.
- [Naming Conventions](/core/naming-conventions) defines stable event topics.
- [Events](/events) covers standalone package details.
