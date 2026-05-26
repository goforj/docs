---
title: HTTP Server
description: Operational behavior for generated GoForj HTTP runtimes.
---

# HTTP Server

The HTTP runtime serves application routes and framework routes through the generated `internal/http` package and the `web` abstraction.

## Start

```bash
./bin/app api
```

or, in standalone mode:

```bash
./bin/app run
```

## Configuration

Common variables:

```text
API_HTTP_HOST=0.0.0.0
API_HTTP_PORT=3000
HTTP_ACCESS_LOG_ENABLED=true
METRICS_API_PORT=9100
```

## Framework Routes

Common framework-owned routes:

- `/-/health`
- `/-/ready`
- `/swagger`
- `/swagger/doc.json`
- `/metrics` when metrics are enabled
- Lighthouse routes when enabled

Application routes should be registered through `internal/router`, not by editing framework route registration.

## Route Visibility

Startup logs show a route count summary.

Use:

```bash
./bin/app route:list
```

for the full route table.

## Common Mistakes

- Do not print the full route table on every boot.
- Do not rely on low-level HTTP setup when the App uses `web`.
- Do not expose detailed readiness errors publicly.
- Do not let access logs drown out higher-signal runtime logs.

## Next Steps

- [Health and Readiness](/operations/health-readiness)
- [Logging](/operations/logging)
- [HTTP Services](/applications/http-services)
