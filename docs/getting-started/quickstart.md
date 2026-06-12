---
title: Quickstart
description: Create and run a generated GoForj Project in two commands.
---

# Quickstart

This page takes you from nothing to a running GoForj App: one command to create the Project, one to run it. A few minutes, most of it module downloads.

## Prerequisites

- Go 1.25 or newer. [Install Go](https://go.dev/doc/install) if you do not have it, and check with `go version`.
- Docker only if you select Docker-backed components. [Docker Desktop](https://docs.docker.com/get-started/get-docker/), [OrbStack](https://orbstack.dev/), and [Podman](https://podman.io/) all work. The default path below needs neither.

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

The wizard asks for a project name and a component selection:

```text
$ forj new
✔ Project name · photodrop
✔ Components · cli, web_api
```

For the first run, choose a small HTTP shape:

- enable `cli`
- enable `web_api`
- leave `web_ui`, jobs, scheduler, and database disabled unless you want them now

Components are choices, not commitments. Everything you skip today can be added later as the App grows.

When the wizard completes:

```bash
cd photodrop
```

## Run It

```bash
forj dev
```

`forj dev` runs the initial build for you: it refreshes generated code, runs Wire, indexes the API surface, and compiles the app. Then it starts the enabled runtimes and watches for changes.

```text
$ forj dev
build      generate → wire → api index → go build
http       listening on :3000
ready      · watching for changes
```

Edit a file and save it. The app rebuilds and restarts on its own.

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

App commands delegate to the compiled binary, so `forj api` runs `./bin/app api` under the hood. Production runs the binary directly.

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
