---
title: Quickstart
description: Create and run a generated GoForj Project in two commands.
---

# Quickstart

This page takes you from nothing to a running GoForj App: one command to create the Project, one to run it. A few minutes, most of it module downloads.

## Prerequisites

- Go 1.25 or newer. [Install Go](https://go.dev/doc/install) if you do not have it, and check with `go version`.
- Docker only if you select components that use generated Docker services. [Docker Desktop](https://docs.docker.com/get-started/get-docker/), [OrbStack](https://orbstack.dev/), and [Podman](https://podman.io/) all work. The small HTTP path below needs neither.

## Install the CLI

```bash
go install github.com/goforj/goforj/cmd/forj@latest
```

Verify it:

```bash
forj --help
```

If your shell reports `forj: command not found`, see [troubleshooting](#troubleshooting) below.

## Create a Project

Run the wizard:

```bash
forj new
```

The wizard collects the Project name and module path, the App components you want, presentation choices, the destination path, and optional Atlas agent support.

The Components screen starts with GoForj's common full-stack selection. For this first run, press `c` to clear it back to the required CLI, then enable Web API with the space bar:

```text
$ forj new
✔ Project name · photodrop
✔ Components · CLI, Web API
✔ Atlas - Agent Support · Recommended
```

Database engines, Cache, Events, File Storage, and Background Jobs are component choices on the same screen. GoForj chooses sensible starting drivers for enabled resources, so the wizard does not ask you to design infrastructure. Components and drivers can both change later as the App grows.

Atlas is optional. If you enable it, GoForj installs local guidance for supported AI coding agents so they understand GoForj project structure, make commands, app registration points, and docs context. See [Atlas](/developer-tools/atlas) for details.

When the wizard completes:

```bash
cd photodrop
```

## Run It

```bash
forj dev
```

`forj dev` runs the initial build for every App listed under `dev.apps` whose build lifecycle is enabled: it refreshes generated code, runs Wire, indexes the API surface, and compiles the App. The new-Project wizard lists the runtime-capable default App with its conventional build and run lifecycles, so the normal quickstart starts it and watches for changes.

```text
$ forj dev
· Building app
  Built app in 2.7s
...
✔ Dev ready
  → App: http://localhost:3000
```

Exact setup and service lines depend on selected components. Edit a watched file and save it. The owning App lifecycle rebuilds and replaces its runtime after a successful build.

## Verify

In a second terminal:

```bash
curl http://localhost:3000/-/health
```

Expected response:

```json
{"status":"ok"}
```

List the generated HTTP surface:

```bash
forj route:list
```

You have a running App. The structure for routes, wiring, lifecycle, configuration, and tests already exists; from here you add behavior, not plumbing.

## Everyday Commands

`forj dev` is the development loop. The other commands you will reach for:

Inside a source Project, App commands use the source-aware run path: GoForj refreshes generated code, prepares the API artifacts, compiles an exact temporary App binary, starts it with the command, and publishes the artifacts after the OS accepts the process start. Production and process supervisors run the built binary directly.

- `forj build` builds without watching: generate, Wire, API index, `go build`. The binary lands at `bin/app`.
- `forj app` starts the enabled runtimes together in one process, without the watcher.
- `forj api` starts only the HTTP runtime.
- `forj route:list` lists HTTP routes.
- `forj worker` starts queue workers, when jobs are enabled.
- `forj scheduler` starts the scheduler, when schedules are enabled.
- `forj migrate` runs database migrations, when database support is enabled.

## Troubleshooting

**`forj: command not found` after install.** `go install` places binaries in `$(go env GOPATH)/bin`, which must be on your `PATH`:

```bash
export PATH="$(go env GOPATH)/bin:$PATH"
```

**Go version errors.** GoForj requires Go 1.25 or newer. Check with `go version` and upgrade if needed.

**Port 3000 is already in use.** The HTTP port is configuration. Set it in `.env`:

```bash
API_HTTP_PORT=3001
```

**Wire errors during the first build.** A failed build usually points at a missing or duplicated provider. [Reading Wire errors](/core/reading-wire-errors) explains how to decode them.

**Docker-backed components fail to start.** If you selected components that render Docker services, the Docker daemon must be running. The default `cli` + `web_api` shape does not use Docker.

## Next Steps

The fastest way to learn the framework is to build with it. Seven verified scenarios grow this App from a single route to a fully observable system, and each one is executed against the current templates before it ships:

- [Start the scenario path](/scenarios/) with a [JSON API route](/scenarios/json-api-route).

When you want the map instead of the trail:

- [Project structure](/getting-started/project-structure) explains the generated layout.
- [Configuration](/getting-started/configuration) explains `.goforj.yml` and `.env`.
- [Apps](/core/apps) explains the default app and named apps.
