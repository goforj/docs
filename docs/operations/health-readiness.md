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

Health should stay lightweight.

## Readiness

```bash
curl http://localhost:3000/-/ready
```

Readiness can check dependencies and return `503` when the App is not ready.

## Authorized Readiness

Detailed readiness output should require:

```text
Authorization: Bearer $APP_DIAG_TOKEN
```

Public readiness should avoid leaking raw infrastructure errors.

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

- Do not expose raw dependency errors publicly.
- Do not use health checks for expensive dependency probes.
- Do not mark the App ready before required dependencies are available.
- Do not hide degraded optional resources as silent emptiness.

## Next Steps

- [HTTP Server](/operations/http-server)
- [Lazy Initialization](/operations/lazy-initialization)
- [Production Checklist](/operations/production-checklist)
