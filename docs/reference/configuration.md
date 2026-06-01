---
title: Configuration Reference
description: Lookup reference for GoForj project configuration and runtime configuration layers.
---

# Configuration Reference

GoForj has two main configuration layers:

- `.goforj.yml` for project rendering and development workflow.
- environment variables for runtime behavior.

## `.goforj.yml`

The project file records render-time choices and local development workflow.

| Key | Purpose |
| --- | --- |
| `project_name` | Generated App name. |
| `module_name` | Go module path. |
| `updated_at` | Timestamp written by rendering workflows. |
| `render.components` | Selected framework components. |
| `render.starter_kit` | Selected starter kit. |
| `render.queue_driver` | Initial queue driver selection. |
| `render.goforj_version` | GoForj version recorded for the rendered App. |
| `render.module_replaces` | Local module replacements for sibling repos. |
| `dev.pre` | Development pre-tasks. |
| `dev.down` | Development teardown tasks. |
| `dev.watches` | `forj dev` watcher definitions. |
| `dev.auto_migrate` | Development auto-migrate behavior. |
| `dev.down_on_exit` | Development cleanup behavior on exit. |
| `dev.sound_on_watch_error` | Optional local feedback when a watcher command fails. |
| `dev.wire_paths` | Wire paths used by development tooling. |

## Development Tasks

Development tasks use this shape:

```yaml
dev:
  pre:
    - name: frontend dependencies
      cmd: cd frontend && npm install
  down:
    - name: stop containers
      cmd: docker-compose down
```

Watchers use this shape:

```yaml
dev:
  watches:
    - name: app
      watch: "-file=.go -xfile=_test.go ."
      exec: forj build
```

## Component Names

Render component keys include:

| Key | Purpose |
| --- | --- |
| `cli` | Generated App command surface. |
| `demo_app` | Demo application surface. |
| `mail` | Generated mail manager and delivery integration. |
| `auth` | Generated auth, session, and account support. |
| `oauth` | OAuth support for generated auth. |
| `web_api` | HTTP API runtime. |
| `web_ui` | Embedded frontend asset support. |
| `metrics` | Metrics manager and export behavior. |
| `observability` | Local observability support files. |
| `grafana` | Grafana provisioning for local observability. |
| `docker` | Local container support. |
| `database_mysql` | MySQL database support. |
| `database_postgres` | PostgreSQL database support. |
| `database_sqlite` | SQLite database support. |
| `scheduler` | Scheduler runtime and registration surface. |
| `jobs` | Queue worker runtime and job support. |
| `stress_test` | Synthetic queue stress tooling. |

Component dependencies are resolved by the renderer. For example, auth requires `web_api` and a database component.

## Module Replaces

Use paths that are stable from the generated project root. For local sibling repositories, prefer a relative path:

```yaml
render:
  module_replaces:
    github.com/goforj/web: ../web
```

Do not use container-specific absolute paths; they only work in one local environment.

## Related Pages

- [Configuration](/getting-started/configuration)
- [Starter Kits](/getting-started/starter-kits)
- [forj dev](/developer-tools/forj-dev)
