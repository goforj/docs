---
title: Quickstart
description: Create, build, and run a generated GoForj Project.
---

# Quickstart

This page creates a GoForj Project, builds the default app, and runs it locally.

## Prerequisites

- Go 1.25 or newer.
- Docker and `docker-compose` if you select Docker-backed components.

## Install The CLI

```bash
go install github.com/goforj/goforj/cmd/forj@latest
```

Verify it:

```bash
forj --help
```

## Create A Project

Run the wizard:

```bash
forj new
```

For the first run, choose a small HTTP shape:

- enable `cli`
- enable `web_api`
- leave `web_ui`, jobs, scheduler, and database disabled unless you want them now

After the wizard completes:

```bash
cd path/to/your-project
```

## Build The Default App

```bash
forj build
```

This refreshes generated code, runs Wire, indexes the API surface, and builds the default app binary:

```text
bin/app
```

The generated Project should include:

```text
.goforj.yml
.env
cmd/app/main.go
app/
app/wire/
internal/
bin/app
```

## Run Locally

Start the combined local runtime:

```bash
forj app
```

Depending on selected components, this can host HTTP, jobs, scheduler, metrics, and Lighthouse integration in one local process.

## Inspect Commands

List routes when HTTP is enabled:

```bash
forj route:list
```

Common generated commands include:

- `app` starts enabled runtimes together.
- `api` starts only the HTTP runtime.
- `route:list` lists HTTP routes.
- `worker` starts queue workers.
- `scheduler` starts the scheduler.
- `migrate` runs database migrations when database support is enabled.

## Develop

Use the watcher loop:

```bash
forj dev
```

`forj dev` reads `.goforj.yml`, runs configured setup tasks, watches files, rebuilds, and restarts the app when needed.

## Verify

If HTTP is enabled:

```bash
curl http://localhost:3000/-/health
```

Expected response:

```json
{"status":"ok"}
```

## Next Steps

- [Project Structure](/getting-started/project-structure) explains the generated layout.
- [Apps](/core/apps) explains the default app and named apps.
- [Configuration](/getting-started/configuration) explains `.goforj.yml` and `.env`.
