---
title: App
description: The runnable application boundary inside a GoForj Project.
---

# App

A GoForj Project can contain one or more apps. An app is the runnable boundary: it has a binary, command surface, composition files, and runtime defaults.

Most Projects have one app. That default app is named `app`.

## Default App

The default app uses the simplest layout:

```text
cmd/app/main.go
app/
app/wire/
```

`cmd/app/main.go` is the binary entrypoint. It stays small.

`app/` owns composition: routes, commands, schedules, lifecycle hooks, and app-level exposure.

`app/wire/` owns the Wire graph for that app.

Application behavior still belongs under `internal/`.

## Named Apps

Larger Projects can add named apps:

```text
cmd/billing/main.go
app/billing/
app/billing/wire/
```

Use named apps when the Project needs another runnable boundary, such as a billing app, reporting app, or customer portal. Do not add a named app just to organize packages. Normal application code still belongs in `internal/`.

## App versus Runtime

An app can expose multiple runtimes:

- HTTP
- jobs
- scheduler
- CLI commands

For example, the `billing` app can run:

```bash
forj billing api
forj billing worker
forj billing scheduler
```

The app is the boundary. The runtime is the process role running inside that boundary.

## App versus Project

Use this distinction when deciding where code belongs:

| Concern | Belongs In |
| --- | --- |
| Project configuration and selected components | `.goforj.yml` |
| App composition | `app/` or `app/<name>/` |
| App Wire graph | `app/wire/` or `app/<name>/wire/` |
| Binary entrypoint | `cmd/app/` or `cmd/<name>/` |
| Business behavior | `internal/...` |
| Reusable runtime machinery | `internal/runtime`, `internal/http`, `internal/jobs`, `internal/schedules` |

If rerendering should preserve a behavior change for all future Projects, the durable fix belongs in GoForj templates or generators. If the behavior is application-specific, it belongs in the generated Project.

## Extension Points

Common app-owned extension points include:

- `app/lifecycle.go` for startup and shutdown hooks
- `app/routes.go` for route exposure
- `app/commands.go` for command exposure
- `app/schedules.go` for schedule exposure
- `app/wire/...` for app-local provider registration

Named apps use the same files under `app/<name>/`.

## Common Mistakes

::: warning Common mistakes
- Do not put business workflows in `cmd/<app>`, `app/`, or `internal/runtime`.
- Do not create a named app when a package under `internal/` is enough.
- Do not describe named apps as separate modules or microservices by default.
- Do not bypass app composition files with package globals.
:::

## Next Steps

- [Apps](/core/apps) explains the multi-app model.
- [Runtime Lifecycle](/core/runtime-lifecycle) explains startup and shutdown.
- [Dependency Injection](/core/dependency-injection) explains app-local Wire graphs.
