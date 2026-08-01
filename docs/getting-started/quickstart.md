---
title: Quickstart
description: Create, run, request, and test a new GoForj Project.
---

# Quickstart

Follow this page from top to bottom to generate a small HTTP app, start it, make a request, and run its tests.

## Prerequisites

- Go 1.25 or newer. [Install Go](https://go.dev/doc/install) if needed.
- A shell with `$(go env GOPATH)/bin` on its `PATH`.

This path uses only the CLI and Web API components, so it does not require Docker.

## Install GoForj

```bash
go install github.com/goforj/goforj/cmd/forj@latest
forj --help
```

The help output confirms that the CLI is installed. If your shell reports `forj: command not found`, add Go's binary directory to your current shell:

```bash
export PATH="$(go env GOPATH)/bin:$PATH"
```

## Generate the Project

Start the Project wizard:

```bash
forj new
```

Use `photodrop` for the Project name and accept its suggested module path. On the Components screen, press `c` to clear the selection, then select **CLI** and **Web API**. Accept the remaining defaults and use `photodrop` as the destination.

When rendering finishes, enter the Project and confirm that its configuration exists:

```bash
cd photodrop
test -f .goforj.yml && echo "Project generated"
# Project generated
```

## Start the App

From the Project root, start the development loop:

```bash
forj dev
```

::: warning Port 3000
This path expects port 3000 to be available. If another process owns it, stop that process before continuing so the verification commands match the generated configuration.
:::

The first build downloads Go modules before compiling the app. Continue when the output shows:

```text
✔ Dev ready
  → App: http://localhost:3000
```

Leave `forj dev` running.

## Make the First Request

In a second terminal, from the same Project root:

```bash
curl http://localhost:3000/-/health
# {"status":"ok"}
```

The response proves that the HTTP runtime is accepting requests.

## Run the First Test

Keep the app running and use the second terminal:

```bash
go test ./...
```

A successful run ends with `ok` lines or `[no test files]` for each generated package and no `FAIL` line.

You now have a GoForj Project, a running App, a verified HTTP endpoint, and a passing test suite.

## Next Steps

Choose one direction:

- [Extend the app](/getting-started/project-structure) to learn where routes, services, configuration, and wiring belong.
- [Run the JSON API scenario](/scenarios/json-api-route) to follow a verified route from generation through request testing.
