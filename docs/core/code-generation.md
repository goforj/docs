---
title: Code Generation
description: Generate framework-owned App code, choose safe extension points, and keep runtime support in sync.
---

# Code Generation

GoForj generates ordinary Go glue for commands, managers, runtime packages, drivers, accessors, and Wire providers. The result stays readable and testable without runtime reflection or hidden registration.

## Choose the generated Project shape

`forj new` writes the durable rendering contract to `.goforj.yml`:

```yaml
render:
  starter_kit: none
  components: [cli, web_api, database_mysql, scheduler, jobs]
```

Component selection determines which packages, commands, Wire sets, and environment entries GoForj emits. Resource components own their complete generated surface:

| Component | Generated surface |
| --- | --- |
| Cache | Cache manager, accessors, providers, drivers, and environment entries |
| Events | Event bus manager, accessors, providers, drivers, and environment entries |
| File Storage | Storage manager, accessors, providers, drivers, and environment entries |
| Background Jobs | Queue manager, job support, worker runtime, providers, drivers, and environment entries |

Cache, Events, File Storage, and Background Jobs start selected in `forj new`, but each can be deselected. Database is a separate choice between MySQL, Postgres, and SQLite. Higher-level components can require another component; Auth, for example, includes Cache.

Components disabled across every App do not leave placeholder resource packages behind. Shared support is derived from all App selections, while each App receives only its selected APIs and wiring.

`.goforj.yml` also records the module path, starter kit choices, App development lifecycles, custom watches, Wire paths, and module replacements. Driver selection and named resource scopes remain environment configuration rather than part of this durable render contract.

Depending on those inputs, GoForj also emits environment-backed configuration, driver factories, Wire injectors, route and API indexes, observability metadata, local component READMEs, and command, job, event, and scheduler surfaces.

## Run generation

Use the normal build path when source and binary output should agree:

```bash
forj build
```

`forj build` runs:

1. generated component refresh
2. Wire generation
3. API indexing
4. `go build`

::: info Dev Loop
When this App is listed in `dev.apps`, its build lifecycle normally runs `forj build` for you.
:::

Use focused generation only when you intentionally want to refresh one family without running the full build:

```bash
forj generate --cache
forj generate --storage
forj generate --queue
forj generate --events
forj generate --db
forj generate --observability
```

Running `forj generate` without flags refreshes the available generators for the current App. An explicit focused command for a disabled component fails instead of recreating a resource outside the Project contract.

## Use generated resources

Generated managers expose stable App access to infrastructure selected for the Project. Each method exists only when its owning component is enabled:

```go
app.Cache()
app.Caches()
app.Storage()
app.Events()
app.Bus()
app.Queue()
app.Queues()
app.DB()
```

Managers are App surfaces, not dependency injection concepts. Wire can construct them, but backend connections should happen at the appropriate lifecycle or first-use boundary rather than making manager construction expensive.

Several primitives derive named resources from environment scopes:

```text
CACHE_DRIVER=memory
CACHE_SESSIONS_DRIVER=redis

STORAGE_DRIVER=local
STORAGE_PUBLIC_DRIVER=local
STORAGE_UPLOADS_DRIVER=s3

QUEUE_DRIVER=workerpool
QUEUE_CRITICAL_DRIVER=redis

EVENTS_DRIVER=inproc
EVENTS_AUDIT_DRIVER=redis
```

Generation can then expose stable accessors:

```go
app.Caches().Sessions()
app.Storage().Public()
app.Storage().Uploads()
app.Queues().Critical()
app.Events().Audit()
```

These accessors are generated invariants. If environment scopes and generated code disagree, rebuild the App; it should fail fast rather than pretend a named resource exists.

## Compile driver support

Generation separates compiled support from runtime selection:

```text
STORAGE_SUPPORTED_DRIVERS=local,s3
STORAGE_DRIVER=local
STORAGE_UPLOADS_DRIVER=s3
```

`STORAGE_SUPPORTED_DRIVERS` causes local and S3 factories to be compiled into the App. `STORAGE_DRIVER` selects the default disk at runtime, and `STORAGE_UPLOADS_DRIVER` selects S3 for the named `uploads` disk.

The same distinction applies to the other resource families. Do not select a runtime driver that is absent from its `*_SUPPORTED_DRIVERS` list.

## Choose a safe extension point

Generated App files have three ownership models:

| Type | How to treat it |
| --- | --- |
| Regenerated files, including files marked `DO NOT EDIT` | Change inputs or templates, then regenerate |
| Render-once files | Edit as App-owned extension points after the initial render |
| App-owned files | Create and maintain as application code |

Check file headers, generated comments, and local component READMEs when ownership is unclear. `wire_gen.go` is always generated output; change providers and rebuild instead of editing it.

Common render-once extension points include:

| Concern | App-owned surface |
| --- | --- |
| Startup and shutdown hooks | `app/lifecycle.go` |
| Route composition | `app/routes.go` |
| App command exposure | `app/commands.go` |
| Schedule composition | `app/schedules.go` |
| App-local providers | `app/wire/inject_*_app.go` |

Named Apps use the same files under `app/<name>/`.

Keep registries declarative and put behavior in the owning feature package. For example:

```go
func (r *LifecycleRegistry) Register(lifecycle *Lifecycle) {
	lifecycle.On(Startup, func(ctx context.Context) error {
		return r.reports.WarmCache(ctx)
	})
}
```

```go
s.Every(30).Seconds().Name("monitor:poll").Do(s.monitorCheckJob.RunScheduledPoll)
```

Controllers belong in feature packages while `app/routes.go` composes their routes. Job handlers and event subscribers use their generated registration surfaces and should be visible before worker or event runtimes start.

Operator-facing translation can remain in runtime-specific Lighthouse files when the concern is route discovery, schedule control payloads, cache or storage operator commands, CLI exposure, or UI metadata. It does not need to move into low-level runtime files merely to reduce file count.

## Decide whether to change the App or framework

Change GoForj templates or generators when:

- an extension point is missing for every App
- rerendering should preserve the behavior in future Projects
- a generated file has the wrong ownership boundary
- generated discovery, accessors, or provider wiring are incorrect

Change only the generated Project when the behavior is application-specific.

## Regenerate after input changes

Refresh generated code after changing:

- selected components in `.goforj.yml`
- supported driver lists
- named cache, storage, queue, event, mail, or database scopes
- provider sets or generated Wire inputs
- observability App and runtime configuration

Use `forj build` when unsure.

## Common Mistakes

::: warning Common mistakes
- Do not edit generated accessors or managers to add named resources manually.
- Do not edit `wire_gen.go`.
- Do not assume every generated file is safe to overwrite.
- Do not put business logic in generated framework glue or App registries.
- Do not put App-specific behavior in framework templates.
- Do not forget regeneration after changing named resource environment variables.
:::

## Next Steps

- [Configuration](/getting-started/configuration) explains environment and driver selection.
- [Dependency Injection](/core/dependency-injection) explains Wire generation and provider ownership.
- [Runtime Lifecycle](/core/runtime-lifecycle) explains lifecycle hook timing.
