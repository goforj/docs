---
title: Project Structure
description: Learn where GoForj application behavior, app exposure, wiring, configuration, and generated output belong.
---

# Project Structure

A GoForj Project separates application behavior, App wiring and exposure, and process startup.

The default app is named `app`. Most Projects need only this app.

## Three Ownership Rules

1. `internal/` owns behavior. It should not need to know which App or runtime exposes it.
2. `app/` owns wiring and exposure. It connects dependencies and registers routes, commands, schedules, and lifecycle hooks without becoming a business-logic package.
3. `cmd/app/main.go` owns process entry. It starts the default App and is not the normal extension point.

For example, generating a reports controller:

```bash
forj make:controller reports
```

creates the controller under `internal/reports`, adds its constructor to the app's Wire providers, and exposes its routes through `app/routes.go`:

```text
internal/reports/controller.go
app/wire/inject_http_controllers_app.go
app/routes.go
```

The controller implements HTTP behavior. The files under `app/` decide that the default app includes it. See [Controllers](/applications/controllers) and [Routes](/applications/routes) for the complete workflow.

## Default App Layout

The exact tree depends on the components selected when the Project is created. Start with the single-App layout used by most Projects; switch tabs to see how another runnable boundary fits into the same repository.

::: code-group

```text [Single App (most Projects)]
.
├── .goforj.yml                         Project shape and local dev lifecycles
├── .env, .env.host                     Runtime configuration
├── .env.local                          Rendered local-dev overrides
├── go.mod                              Go module and dependencies
│
├── cmd/
│   └── app/
│       ├── main.go                     Framework-managed binary entrypoint
│       └── frontend/                   Starter-kit source and dist output [Web UI]
│
├── app/
│   ├── commands.go                     App-owned command exposure
│   ├── lifecycle.go                    App-owned startup and shutdown hooks
│   ├── routes.go                       App-owned HTTP exposure [Web API or UI]
│   ├── schedules.go                    App-owned schedule registry [Scheduler]
│   ├── root_cmd.go                     Framework-managed command assembly
│   └── wire/
│       ├── inject_services_app.go      App-owned service providers
│       ├── inject_*_app.go             Other app-owned providers
│       ├── inject_*.go                 Framework-managed provider assembly
│       ├── wire.go                     Framework-managed Wire declaration
│       └── wire_gen.go                 Generated dependency graph
│
├── internal/
│   ├── reports/                        Application-owned domain package
│   ├── users/                          Application-owned domain package
│   ├── runtime/                        Framework runtime and lifecycle support
│   ├── http/                           HTTP runtime support [Web API or UI]
│   ├── cmd/                            Ungrouped app commands
│   ├── jobs/                           Worker runtime and ungrouped jobs [Background Jobs]
│   ├── schedules/                      Scheduler support and ungrouped schedules
│   └── caches, queues, storages, ...   Generated resource support [by component]
│
├── migrations/                         Database migrations [Database]
├── build/                              API index and OpenAPI output [generated]
└── bin/                                Compiled app binaries [generated]
```

```diff [Multi-App — highlighted lines differ]
.
├── .goforj.yml                         Project shape, apps, and local dev lifecycles
├── .env, .env.host                     Shared and App-prefixed runtime configuration
├── .env.local                          Rendered local-dev overrides
├── go.mod                              One Go module shared by every App
│
├── cmd/
│   ├── app/
│   │   ├── main.go                     Default App binary entrypoint
│   │   └── frontend/                   Default App starter kit [Web UI]
+│   └── admin/
+│       ├── main.go                     Admin App binary entrypoint
+│       └── frontend/                   Admin App starter kit [Web UI]
│
├── app/
│   ├── commands.go                     Default App command exposure
│   ├── lifecycle.go                    Default App lifecycle hooks
│   ├── routes.go                       Default App HTTP exposure [Web API or UI]
│   ├── schedules.go                    Default App schedule registry [Scheduler]
│   ├── root_cmd.go                     Default App command assembly
│   ├── wire/                           Default App dependency graph
│   │   ├── inject_*_app.go             Default App-owned providers
│   │   ├── inject_*.go                 Framework-managed provider assembly
│   │   ├── wire.go                     Framework-managed Wire declaration
│   │   └── wire_gen.go                 Generated dependency graph
│   │
+│   └── admin/
+│       ├── commands.go                 Admin App command exposure
+│       ├── lifecycle.go                Admin App lifecycle hooks
+│       ├── routes.go                   Admin App HTTP exposure [Web API or UI]
+│       ├── schedules.go                Admin App schedule registry [Scheduler]
+│       ├── root_cmd.go                 Admin App command assembly
+│       └── wire/                       Admin App dependency graph
+│           ├── inject_*_app.go         Admin App-owned providers
+│           ├── inject_*.go             Framework-managed provider assembly
+│           ├── wire.go                 Framework-managed Wire declaration
+│           └── wire_gen.go             Generated dependency graph
│
├── internal/
│   ├── reports/                        Domain behavior shared by either App
│   ├── users/                          Domain behavior shared by either App
│   ├── runtime/                        Framework runtime and lifecycle support
│   ├── http/                           HTTP runtime support [Web API or UI]
│   ├── jobs/                           Worker runtime and job implementations
│   ├── schedules/                      Scheduler runtime and scheduled work
│   └── caches, queues, storages, ...   Generated resource support [by component]
│
├── migrations/
+│   ├── app/default/                    Default App migration stream [Database]
+│   └── admin/default/                  Admin App migration stream [Database]
├── build/                              Per-App API and OpenAPI output [generated]
└── bin/
    ├── app                             Compiled default App binary [generated]
+    └── admin                           Compiled admin App binary [generated]
```

:::

Paths marked with a component appear only when that component is enabled. Generated output appears after the relevant render, generation, frontend, or build step.

The highlighted lines are the additional ownership boundaries introduced by `admin`. Both layouts keep behavior under `internal/`. Each App has its own entrypoint, registration files, lifecycle hooks, Wire graph, API artifacts, and migration streams, so it can expose a different subset of that shared behavior.

## Multiple Apps and SPAs

A common multi-App Project gives its public and administrative Apps separate frontends:

```text
shared internal packages
├── default App → cmd/app/frontend/    public SPA
└── admin App   → cmd/admin/frontend/  administrative SPA
```

Each SPA builds before its owning App is rebuilt, and each App embeds and deploys its own frontend output. A change under `cmd/admin/frontend/` does not need to rebuild the default App.

One App can also coordinate more than one SPA during development:

```yaml
dev:
  apps:
    app:
      spas:
        storefront:
          path: ./cmd/app/frontend
          build: npm run build
        documentation:
          path: ./ui/documentation
          build: npm run build
```

`forj dev` waits for successful SPA builds before replacing the owning App. Additional SPA entries are development build relationships; configure how their output is served or deployed as part of the App's own frontend architecture. See the [default App lifecycle](/developer-tools/forj-dev#default-app-lifecycle).

## Growing the Project

Keeping reusable workflows in `internal/<domain>` makes growth incremental. If both the default and `admin` Apps need reports, they can inject the same `reports.Service` constructor into separate Wire graphs without duplicating the workflow. Each binary receives its own service instance and chooses its own controllers, commands, or schedules.

That boundary also makes a later service split less disruptive: move the domain package behind a new App first, make its inputs and outputs explicit, then extract it into another module or repository only when deployment ownership requires it. The `internal` rule prevents packages outside the Project's module tree from importing the code directly, so extraction is still an intentional move rather than an accidental distributed dependency.

## Where Common Changes Go

Use the owning package for implementation and the app layer for exposure or dependency construction.

| Change | Behavior belongs in | Exposure or wiring |
| --- | --- | --- |
| [HTTP controller](/applications/controllers) | `internal/<domain>/controller.go` | `app/routes.go`, `app/wire/inject_http_controllers_app.go` |
| [Application service](/core/dependency-injection) | `internal/<domain>/service.go` | `app/wire/inject_services_app.go` |
| [Repository or model](/data/repositories) | `internal/models/`, or `internal/<group>/` when grouped | `app/wire/inject_repositories_app.go` |
| [App command](/applications/commands) | `internal/cmd/`, or `internal/<group>/` when grouped | `app/commands.go`, `app/wire/inject_cmd_app.go` |
| [Queue job](/async/jobs) | `internal/jobs/`, or `internal/<group>/` when grouped | `app/wire/inject_jobs_app.go` |
| [Generated schedule](/async/scheduler) | `internal/schedules/`, or `internal/<group>/` when grouped | `app/wire/inject_schedules_app.go` |
| [Custom schedule](/async/scheduler) | The domain method that performs the work | `app/schedules.go` |
| [Startup or shutdown hook](/core/app-lifecycle) | The owning service when behavior is reusable | `app/lifecycle.go` |
| [Starter-kit frontend](/starter-kits) | `cmd/app/frontend/`; `cmd/<app>/frontend/` for an additional App | Embedded by that App's `cmd/<app>/main.go`; review the ownership note below before rerendering |
| [Migration](/data/migrations) | `migrations/`; `migrations/<app>/<connection>/` after multi-App expansion | Run through the owning App's migration commands |

The `forj make:*` commands create the common files and update their registration points together. Use the [Make Command Reference](/reference/make-commands) for exact output and registration changes, including how `--open` and `FORJ_EDITOR` open created source files. The paths above describe files in your Project, while each change type links to the guide that explains how to use it. Framework contributors can inspect the [authoritative GoForj templates](https://github.com/goforj/goforj/tree/main/templates) separately without confusing template source with application-owned files.

## Which Files Can I Edit?

GoForj uses several ownership classes. The distinction matters because some files are preserved for application changes while others are rebuilt from Project configuration.

### Application-Owned Files

Edit these as normal application code:

- domain packages you create under `internal/<domain>/`
- command, job, schedule, and model implementations created with `forj make:*`
- `app/commands.go`
- `app/lifecycle.go`
- `app/routes.go`
- `app/schedules.go`
- provider files ending in `_app.go` under `app/wire/`
- application migrations you create under `migrations/`

GoForj creates the app composition extension files once and preserves them during normal rendering. Make commands may update their imports, fields, or provider sets when registering new behavior.

### Framework-Managed Files

GoForj may refresh these files when the Project is rendered:

- `cmd/app/main.go`
- `app/root_cmd.go`
- base files under `app/wire/` that do not end in `_app.go`
- runtime support packages such as `internal/runtime` and `internal/http`

Change the relevant component or Project configuration instead of treating these files as the primary extension point.

### Starter-Kit and Demo Scaffold

Starter-kit and demo source has a different lifecycle from ordinary application code. A full render with a selected starter kit refreshes `cmd/app/frontend/` from that kit. The templ + htmx kit also refreshes `internal/starterui/`, and demo rendering refreshes its own example packages and migrations.

Review the [Starter Kit Guide](/getting-started/starter-kits) before customizing these paths or running `forj render`. Move durable application behavior into your own packages instead of relying on demo scaffold ownership.

### Tool-Owned and Build Output

Do not edit derived output by hand:

- `app/wire/wire_gen.go`
- generated accessors and managers ending in `_gen.go`
- `build/`
- `bin/`
- frontend `dist/`

Change the source, provider, or configuration and rebuild. [File Ownership](/reference/generated-files) lists the important generated paths and the command that owns each one.

## Configuration at the Project Root

The root configuration files control different stages:

| File | What it controls | When changes take effect |
| --- | --- | --- |
| `.goforj.yml` | Components, app metadata, rendering, local development lifecycles, and renderer-managed module replacements | Run `forj render` for Project-shape changes |
| `.env`, `.env.host` | Runtime defaults and host-specific overrides | Restart the app; `forj dev` handles watched local changes |
| `.env.local` | Local-dev overrides generated from the current Project shape | A full `forj render` refreshes this file |
| `go.mod` | Go dependencies and the replacements emitted from `.goforj.yml` | Run the normal Go module commands, then rebuild |

[Configuration](/getting-started/configuration) explains how Project configuration, runtime environment, and driver selection fit together.

::: warning Keep durable local settings out of `.env.local`
A full render replaces `.env.local`. Treat it as generated local-dev configuration, not as the only copy of a setting you need to preserve.
:::

## Component-Owned Packages

Selected components add focused packages under `internal/`:

| Component | Common paths | Learn the workflow |
| --- | --- | --- |
| Web API or Web UI | `internal/http`, `app/routes.go` | [HTTP Services](/applications/http-services) |
| Web UI starter kit | `cmd/app/frontend/` | [Starter Kit Guide](/getting-started/starter-kits) |
| Database | `internal/database`, `migrations/` | [Database Connections](/data/database-strategy) |
| Cache | `internal/caches` | [Cache Patterns](/data/cache-patterns) |
| File Storage | `internal/storages` | [Storage Patterns](/data/storage-patterns) |
| Background Jobs | `internal/queues`, `internal/jobs` | [Queues](/async/queues) and [Jobs](/async/jobs) |
| Events | `internal/events` | [Events](/async/events) |
| Scheduler | `internal/schedules`, `app/schedules.go` | [Scheduler](/async/scheduler) |
| Mail | `internal/mail` | [Mail](/applications/mail) |

These paths can contain runtime integration, generated accessors, and editable implementations created by ungrouped make commands. Use a grouped name when a command, job, schedule, or model belongs with a domain; for example, `reports:sync` places the generated implementation under `internal/reports/`.

## Additional Apps

Add another app only when the Project needs another runnable binary or deployment boundary. Use `forj make:app` so the entrypoint, composition files, configuration, and Wire graph stay aligned:

```bash
forj make:app admin
```

The Multi-App tab above shows the resulting layout. Both apps can use the same domain packages under `internal/`, while each app chooses its own routes, commands, schedules, lifecycle hooks, and providers. [Apps](/core/apps) explains when another app is appropriate and how app-prefixed commands work.

## Build and Verify Changes

During normal development:

```bash
forj dev
```

The dev loop rebuilds the owning app after watched changes and replaces the running process only after a successful build.

For an explicit build:

```bash
forj build
```

This refreshes generated accessors, runs Wire, updates the API index, and compiles `bin/app`. Use `forj route:list` to verify HTTP exposure and the relevant app command or test to verify the behavior you added.

## Next Steps

- [JSON API Route](/scenarios/json-api-route) applies this structure to a controller, service, provider, route, and test.
- [Configuration](/getting-started/configuration) explains Project and runtime settings.
- [Apps](/core/apps) covers additional runnable apps.
- [File Ownership](/reference/generated-files) identifies ownership and regeneration commands.
- [App Lifecycle](/core/app-lifecycle) explains startup and shutdown.
