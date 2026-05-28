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
forj run make:event UserRegistered
```

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
EVENTS_INPROC_WORKERS=0
EVENTS_INPROC_BUFFER=1024
```

`inproc` is process-local and non-durable. Use distributed drivers when events need to cross process boundaries.

## Regeneration

After changing supported drivers or named event buses, use the normal build path:

```bash
forj build
```

::: info Dev Loop
During `forj dev`, the generated build watcher normally runs `forj build` for you.
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
- [Events](/events) covers standalone package details.
