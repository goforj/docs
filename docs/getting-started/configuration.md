---
title: Configuration
description: Learn which GoForj configuration layer to change and when an App needs a restart or rebuild.
---

# Configuration

GoForj separates Project configuration from runtime environment configuration.

- `.goforj.yml` describes what the Project contains and how local development runs it.
- `.env` files and process environment variables describe how an app behaves when it starts.

Most first changes belong in `.env`. Change `.goforj.yml` when you are changing the Project itself.

## Change a Runtime Setting

Set the default app's HTTP port in `.env`:

```dotenv
API_HTTP_PORT=3001
```

Start the HTTP runtime:

```bash
forj api
```

In another terminal, verify the change:

```bash
curl http://localhost:3001/-/health
```

Expected result: the API listens on port `3001` and the health request succeeds.

Runtime settings are read during startup. Restart a running app after changing its environment; this port change does not require regeneration or a rebuild.

## Choose the Right Layer

| Change | Owner | What to do next |
| --- | --- | --- |
| Port, URL, secret, active driver, or connection value | `.env` or process environment | Restart the affected process. |
| Supported driver set or named generated resource | Environment configuration plus generated code | Run `forj build`, then restart. |
| Selected component, starter kit, additional-app metadata, or render option | `.goforj.yml` | Render or build as directed by the feature guide. |
| App development lifecycle | `.goforj.yml` under `dev.apps` | Restart `forj dev`. |
| Independent local watch command | `.goforj.yml` under `dev.watches` | Restart `forj dev`. |

Use configuration for deployment policy and infrastructure choices. Keep business behavior in services, routes, jobs, schedules, or lifecycle hooks.

## Edit Local Environment

A Project can include:

- `.env` for the main local configuration
- `.env.local` for local environment overrides
- `.env.host` for host-specific local infrastructure values
- `.env.example` for the safe, committed inventory

Local environment files are ignored by Git; `.env.example` is the deliberate exception. Commit that inventory with secrets blank or replaced by safe placeholders, and supply deployment secrets through the process environment or a secret manager.

The [Environment Reference](/reference/env-vars) owns the complete variable list and naming rules. [Configuration Reference](/reference/configuration#environment-file-resolution) defines file precedence and process-environment behavior.

## Select a Driver

Driver-backed resources separate compiled support from the active runtime choice:

```dotenv
CACHE_SUPPORTED_DRIVERS=memory,redis
CACHE_DRIVER=memory
```

`CACHE_SUPPORTED_DRIVERS` determines which cache drivers are compiled into the app. `CACHE_DRIVER` chooses one of those drivers at startup.

Changing only `CACHE_DRIVER` to a driver already in the supported set needs a restart, not regeneration. Adding a driver to `CACHE_SUPPORTED_DRIVERS` changes generated imports and requires:

```bash
forj build
```

The same pattern applies to storage, queues, events, mail, and databases. See [Environment Reference](/reference/env-vars#resolution-and-naming) for the complete contract.

## Change the Project

`.goforj.yml` records durable Project choices such as selected components and additional-app metadata:

```yaml
render:
  starter_kit: none
  components: [cli, web_api, database_mysql, scheduler, jobs]
```

It also owns `forj dev` lifecycle configuration. Do not copy watcher or lifecycle recipes from this beginner page: use [forj dev](/developer-tools/forj-dev) for the workflow and [Configuration Reference](/reference/configuration) for every accepted key.

## When to Rebuild or Restart

Use this rule:

- Restart when a startup-time value changes.
- Rebuild when the change affects generated Go code, compiled drivers, named generated accessors, or Wire inputs.
- Restart `forj dev` when its `.goforj.yml` lifecycle graph changes.

During a normal `forj dev` session, configured app builds run automatically after matching source or environment changes. Use `forj build` when working outside that loop or when you want one explicit generation, Wire, API index, and binary build.

## Next Steps

- [Configuration Reference](/reference/configuration) lists `.goforj.yml`, environment resolution, and build-time configuration behavior.
- [Environment Reference](/reference/env-vars) lists every public environment variable.
- [forj dev](/developer-tools/forj-dev) explains local build, frontend, runtime, and custom-watch lifecycles.
- [Code Generation](/core/code-generation) explains generated ownership and rebuild boundaries.
