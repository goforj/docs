---
title: Quickstart
description: Create, build, and run a generated GoForj App.
---

# Quickstart

This page installs the `forj` CLI, creates a generated GoForj App, builds it, and runs the local runtime.

## Prerequisites

- [Go 1.25 or newer installed](https://go.dev/dl/) for your platform.
- [Docker](https://docs.docker.com/get-docker/) and the `docker-compose` command available if you select Docker-backed components in the project wizard. On macOS, [OrbStack](https://orbstack.dev/) is a recommended Docker-compatible option that is fast and lightweight.

## Install the CLI

Install `forj` with Go:

```bash
go install github.com/goforj/goforj/cmd/forj@latest
```

Make sure your Go binary directory is on your `PATH`. For most local Go installs, that means:

```bash
export PATH="$(go env GOPATH)/bin:$PATH"
```

Verify the CLI:

```bash
forj --help
```

## Create An App

Run the project wizard:

```bash
forj new
```

For a deterministic first App, choose a small HTTP shape:

- select `cli`
- select `web_api`
- leave `web_ui` disabled unless you want a frontend starter kit
- leave database, jobs, scheduler, and distributed infrastructure disabled for the first run

If you keep the wizard defaults instead, the same commands below still apply as long as HTTP is enabled.

The wizard asks for:

- project name
- Go module path
- components to render
- optional starter kit
- project path

The project name becomes `APP_NAME`. The module path becomes the Go module path used by imports in generated code.

After the wizard completes, move into the generated App:

```bash
cd path/to/your-app
```

## Build The App

Run the framework build pipeline:

```bash
forj build
```

`forj build` runs the generated-code pipeline, runs Wire, builds API index artifacts, and then runs `go build`. With no extra arguments, the app binary is written to:

```text
./bin/app
```

You should now have a generated Go project with files such as:

```text
.goforj.yml
.env
main.go
wire/
internal/
bin/app
```

## Run The App

Run the combined local runtime:

```bash
forj run app
```

`app` is the generated App command alias for the combined runtime. It starts the enabled runtimes together in one local process.

Depending on the components you selected, the combined runtime can include:

- HTTP server
- queue workers
- scheduler
- metrics endpoint
- Lighthouse agent/runtime integration

## Inspect The App Commands

Generated Apps expose their own command surface. You can run those commands through `forj run`:

```bash
forj run route:list
```

Common generated commands include:

- `app` starts enabled App runtimes together.
- `api` starts only the HTTP server.
- `route:list` lists HTTP routes.
- `worker` starts queue workers.
- `scheduler` starts the scheduler.
- `migrate` runs database migrations when database support is enabled.

The available commands depend on the components selected in `.goforj.yml`.

## Use Dev Mode

For day-to-day local work, use:

```bash
forj dev
```

`forj dev` reads `.goforj.yml`, runs configured pre-tasks, watches files, rebuilds the app, and restarts the generated binary when needed.

If the generated project starts Docker resources, shut them down with:

```bash
forj down
```

## Verify

After starting the runtime, verify the HTTP surface if HTTP is enabled:

```bash
curl http://localhost:3000/-/health
```

Expected response:

```json
{"status":"ok"}
```

You can also list routes:

```bash
forj run route:list
```

For an HTTP App, the route list should include framework routes such as `/-/health` and `/-/ready`. If the sample controller is enabled, it should also include a generated application route under `/api/v1`.

## Next Steps

- [Project Structure](/getting-started/project-structure) explains where generated App code lives.
- [Configuration](/getting-started/configuration) explains `.goforj.yml`, `.env`, and driver selection.
- [Core Concepts](/core/) explains the App, runtime lifecycle, providers, and generated components.
