---
title: Configuration Reference
description: Lookup reference for GoForj project configuration and runtime configuration layers.
---

# Configuration Reference

GoForj has two main configuration layers:

- `.goforj.yml` for project rendering and development workflow.
- environment variables for runtime behavior.

## `.goforj.yml`

Common areas:

| Area | Purpose |
| --- | --- |
| `project_name` | Generated App name. |
| `module_name` | Go module path. |
| `render.components` | Selected framework components. |
| `render.starter_kit` | Selected starter kit. |
| `render.queue_driver` | Initial queue driver selection. |
| `render.module_replaces` | Local module replacements for sibling repos. |
| `dev.pre` | Development pre-tasks. |
| `dev.watches` | `forj dev` watcher definitions. |
| `dev.auto_migrate` | Development auto-migrate behavior. |
| `dev.down_on_exit` | Development cleanup behavior on exit. |
| `dev.wire_paths` | Wire paths used by development tooling. |

## Component Names

Common render component keys include:

- `cli`
- `docker`
- `auth`
- `web_api`
- `web_ui`
- `database_mysql`
- `database_postgres`
- `database_sqlite`
- `scheduler`
- `jobs`
- `stress_test`

Available components can change as the framework evolves.

## Module Replaces

Use absolute paths:

```yaml
render:
  module_replaces:
    github.com/goforj/web: /workspace/code/web
```

Do not use `~`. Do not assume relative paths are stable across tools.

## Related Pages

- [Configuration](/getting-started/configuration)
- [Starter Kits](/getting-started/starter-kits)
- [forj dev](/developer-tools/forj-dev)
