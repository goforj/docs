---
title: Generated Extension Points
description: Where to add application behavior in a generated GoForj App without fighting generated code.
---

# Generated Extension Points

Generated extension points are App-owned files or surfaces where users add behavior while preserving the generated framework shape.

They exist so Apps can be customized without editing framework-owned runtime glue.

## Ownership Model

Generated App files fall into three broad groups:

| Type | Meaning |
| --- | --- |
| Regenerated files | Owned by GoForj generation and safe to overwrite. |
| Render-once files | Created by GoForj, then owned by the App. |
| App-owned files | Created and maintained by the App owner. |

When in doubt, check file headers, generated comments, and local component READMEs.

## Lifecycle Hooks

Use:

```text
internal/app/lifecycle_registry.go
```

Add startup and shutdown behavior here.

```go
func (r *LifecycleRegistry) Register(lifecycle *Lifecycle) {
	lifecycle.On(Startup, func(ctx context.Context) error {
		return r.reports.WarmCache(ctx)
	})
}
```

The registry is built by Wire, so it can receive injected services.

## Routes

Use generated route registration surfaces, usually under:

```text
internal/router
```

Controllers should live in feature packages. Route registries should compose routes; they should not become business-logic containers.

## Commands

Custom commands belong in generated command registration surfaces.

Use commands for explicit operator or developer actions. Avoid shell wrappers around application internals when a command should be part of the App.

## Schedules

Use:

```text
internal/scheduler/scheduler_registry.go
```

Keep the scheduler registry declarative:

```go
s.Every(30).Seconds().Name("monitor:poll").Do(s.monitorCheckJob.RunScheduledPoll)
```

Prefer direct calls into owning domain types. Avoid growing scheduler runtime files into business-logic buckets.

## Jobs and Events

Job handlers and event subscribers should be registered through generated or documented registration surfaces.

Use stable names and typed payloads. Keep registration visible before workers or event runtimes start.

## Lighthouse and Operator Glue

Operator-facing integration can belong in runtime-specific Lighthouse files when the concern is presentation, operator commands, or UI metadata.

Examples:

- schedule listing and control payloads
- route discovery
- cache and storage operator commands
- CLI command exposure

Do not force operator translation into low-level runtime files just to reduce file count.

## When To Change The Framework

Change GoForj templates or generators when:

- the extension point is missing for all Apps
- rerendering should preserve the behavior for future Apps
- a generated file has the wrong ownership boundary
- generated discovery, accessors, or provider wiring are wrong

Change only the App when the behavior is application-specific.

## Common Mistakes

::: warning Common mistakes
- Do not edit `wire_gen.go` by hand.
- Do not edit generated managers to add named resources manually.
- Do not put App-specific behavior into framework templates.
- Do not put framework-wide fixes only in a rendered App.
- Do not hide important runtime behavior in anonymous callbacks.
:::

## Next Steps

- [App](/core/app) explains the App boundary.
- [Code Generation](/core/code-generation) explains generated file ownership.
- [Runtime Lifecycle](/core/runtime-lifecycle) explains lifecycle hook timing.
