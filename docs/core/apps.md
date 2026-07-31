---
title: Apps
description: Understand App identity, ownership, composition, and multi-app relationships in a GoForj Project.
---

# Apps

An App is a runnable application boundary inside a GoForj Project. It owns one binary, one command tree, one dependency graph, and the files that expose application behavior through routes, schedules, lifecycle hooks, and other enabled runtimes.

Every Project has a default app named `app`. Most Projects need only that app.

<span id="apps-and-runtimes"></span>

## Why Apps Exist

An app gives related runtimes one identity and one composition root. The default app can expose HTTP, worker, scheduler, and CLI runtimes without turning each process role into a separate app.

For example:

```bash
forj api
forj worker
forj scheduler
```

These commands select different runtimes inside the same default app. They share its application identity and Wire graph, even when deployed as separate processes.

An additional app creates another binary and composition boundary. It is useful when part of the Project needs independent capabilities, wiring, release ownership, or deployment.

## The Default App

The default app follows the conventional layout:

```text
cmd/app/
app/
app/wire/
internal/
```

- `cmd/app/` owns the small binary entrypoint.
- `app/` owns composition and exposure, such as routes or lifecycle hooks selected for this app.
- `app/wire/` owns the dependency graph.
- `internal/` owns application and domain behavior that one or more apps can use.

The exact composition files under `app/` depend on selected components. Do not assume every Project has routes, schedules, jobs, or their corresponding provider sets.

Keep business workflows out of `cmd/app/` and app registration files. A reports service can live under `internal/reports`, while `app/routes.go`, `app/schedules.go`, or an app-local provider set exposes the parts the default app needs.

<span id="add-a-named-app"></span>
<span id="add-another-app"></span>

## When to Add Another App

Add another app when the Project needs a distinct runnable boundary, such as:

- a separately deployed administration API
- a process with a deliberately smaller capability set
- a separately owned command suite
- an availability or security boundary that needs different wiring

Do not add an app merely to organize packages, run another worker process, or split HTTP from queue work. Packages organize code; runtime commands split process roles.

For example, an `admin` app can reuse `internal/users` and `internal/reports` while owning its own routes and dependency graph:

```text
cmd/admin/
app/admin/
app/admin/wire/
internal/users/
internal/reports/
```

The default app remains directly under `app/`; additional apps use `app/<name>/`.

Use the [`make:app` reference](/reference/make-commands#make-app) for creation flags, generated locations, development enrollment, and removal behavior.

## App Identity and Command Selection

Unprefixed source-aware commands select the default app:

```bash
forj route:list
forj api
```

Prefix a command with an additional app's name to select it:

```bash
forj admin route:list
forj admin api
```

The prefix selects the app for both app commands and app-aware framework commands. It does not change directories or create a package namespace.

Built artifacts preserve the same boundary:

```bash
./bin/app
./bin/admin
```

Runtime-capable binaries default to the combined `run` runtime when launched without arguments. Explicit commands still take precedence, and CLI-only binaries retain root help behavior.

<span id="what-belongs-where"></span>

## App-Owned Composition

Business behavior can be shared inside the Project, but each app decides what it exposes and constructs.

| Concern | Owner |
| --- | --- |
| Binary entrypoint | `cmd/app/` or `cmd/<name>/` |
| Routes, commands, schedules, and lifecycle hooks | `app/` or `app/<name>/` |
| Dependency graph and app-local providers | `app/wire/` or `app/<name>/wire/` |
| Application and domain behavior | `internal/...` |
| Reusable runtime machinery | Component packages such as `internal/runtime` and `internal/http` |
| Render metadata and selected components | `.goforj.yml` |

A generator invoked through an app prefix writes the resource under its owning `internal/...` package and updates that app's registration points:

```bash
forj admin make:controller users
```

The controller remains application code under `internal/users`; the `admin` app receives its route and provider registration. See the [Make Command Reference](/reference/make-commands) for exact output.

## Discovery and Stable Ordering

GoForj always includes the conventional default app first.

Additional apps are discovered from conventional ownership markers:

- `cmd/<name>/main.go`
- recognized composition files or a Wire directory under `app/<name>/`

Top-level `apps` entries in `.goforj.yml` can also contribute app metadata while rendering. Additional app names are ordered alphabetically after the default app. That stable order determines each App's generated index and conventional runtime defaults.

Layout proves that an app exists; top-level `apps` metadata records its selected components, starter kit, and help format. The separate `dev.apps` map decides which apps participate in `forj dev`.

See [Configuration Reference](/reference/configuration#render-metadata-for-apps) for those schemas and [Environment Reference](/reference/env-vars#app-and-runtime) for app-scoped overrides and ports.

<span id="common-mistakes"></span>

## Runtime and Resource Boundaries

Separate app processes do not share in-memory cache, queue, or event state. Use a shared backend when state or work must cross process boundaries.

App code continues to use logical resource names. At backend boundaries where isolation matters, GoForj can apply the additional app's prefix. For example, logical queue `default` in the `admin` app maps to the backend queue name `admin_default`.

Database migration ownership is also an app decision. If two apps share one physical database, choose one app to own that database's migration stream.

<span id="next-steps"></span>

## Related Concepts

- [Runtime Topology](/core/runtime-topology) explains apps, runtimes, and processes.
- [Code Generation](/core/code-generation) explains generated ownership and app extension points.
- [forj dev](/developer-tools/forj-dev) explains development lifecycle participation.
- [Make Command Reference](/reference/make-commands) lists app-aware generation behavior.
- [Migrations](/data/migrations) explains app-owned migration streams.
