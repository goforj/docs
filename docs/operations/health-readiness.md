---
title: Health and Readiness
description: How generated GoForj Apps expose liveness and readiness checks.
---

# Health and Readiness

Health and readiness answer different operational questions.

Health says the process is alive. Readiness says the App can serve traffic safely.

## Health

```bash
curl http://localhost:3000/-/health
```

For a named app running on its generated local default:

```bash
curl http://localhost:3001/-/health
```

Generated Apps return a fixed `200` response:

```json
{"status":"ok"}
```

Health does not run dependency checks. Use it for container liveness and "is the process answering HTTP?" probes.

## Readiness

```bash
curl http://localhost:3000/-/ready
```

For a named app:

```bash
curl http://localhost:3001/-/ready
```

Generated Apps return:

- `200` with `{"status":"ready"}` when all readiness checks pass
- `503` with `{"status":"not_ready"}` when any readiness check fails

Readiness checks run against the enabled infrastructure components and use a short per-check timeout. Failed readiness checks are logged server-side.

## Authorized Readiness

Detailed readiness output should require:

```text
Authorization: Bearer $APP_DIAG_TOKEN
```

Public readiness omits raw dependency errors and infrastructure details. Authorized readiness includes structured checks with type, name, driver, status, and the raw error for failed checks.

Example authorized failure shape:

```json
{
  "status": "not_ready",
  "checks": [
    {
      "type": "db",
      "name": "default",
      "driver": "mysql",
      "status": "failed",
      "error": "dial tcp 127.0.0.1:3306: connect: connection refused"
    }
  ]
}
```

## Health Command

Generated Apps include a `health` command that queries a live App without booting local runtime dependencies.

```bash
./bin/app health --probe ready --fail
```

The command defaults to `http://127.0.0.1:3000`, uses `ready` by default, and automatically sends `Authorization: Bearer $APP_DIAG_TOKEN` for readiness when the token is configured.

For a named app, use that app's binary:

```bash
./bin/marketplace health --probe ready --fail
```

If you override the app's HTTP port, pass the matching base URL or full probe URL as the command's URL argument.

```bash
./bin/marketplace health http://127.0.0.1:3100 --probe ready --fail
```

## What To Check

Readiness can cover:

- database connectivity
- required storage disks
- required cache accessors
- queue backend readiness
- event backend readiness
- generated component state

Optional facilities should report degraded state instead of crashing unrelated runtimes when the App is designed to tolerate degradation.

## Common Mistakes

::: warning Common mistakes
- Do not expose raw dependency errors publicly.
- Do not use health checks for expensive dependency probes.
- Do not mark the App ready before required dependencies are available.
- Do not hide degraded optional resources as silent emptiness.
:::

## Next Steps

- [HTTP Server](/operations/http-server)
- [Production Checklist](/operations/production-checklist)
