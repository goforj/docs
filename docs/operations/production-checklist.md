---
title: Production Checklist
description: A practical checklist before running a generated GoForj App in production.
---

# Production Checklist

Use this checklist before production deployment.

## Build and Configuration

- Run `forj build`.
- Confirm `.goforj.yml` matches intended components.
- Confirm named apps listed under `apps` have the intended component choices.
- Confirm `*_SUPPORTED_DRIVERS` includes all runtime drivers.
- Confirm secrets are provided by the deployment environment.
- Confirm `APP_ENV` and `APP_DEBUG` are production-safe.

## Runtime Topology

- Choose standalone or split runtime processes.
- Run HTTP, workers, and scheduler through explicit commands.
- For named apps, run the app-specific binary such as `./bin/marketplace api`.
- Ensure scheduler singleton or locking behavior is correct.
- Set shutdown timeouts deliberately.

## Data

- Run migrations intentionally.
- In multi-app Projects, confirm which app owns each migration stream.
- Verify database readiness.
- Confirm cache is not source-of-truth storage.
- Confirm storage disks and object storage permissions.
- Verify `forj build` has refreshed generated named resources.

## Observability

- Verify health and readiness endpoints.
- Configure `APP_DIAG_TOKEN`.
- Verify metrics scrape targets.
- Confirm metrics, logs, inspects, and Lighthouse preserve app identity.
- Confirm high-cardinality labels are not introduced.
- Confirm logs are high-signal and secrets are not logged.
- Enable Lighthouse only where appropriate.

## Async

- Confirm job handlers are registered.
- Confirm workers use the intended queue driver.
- Confirm retry and idempotency behavior.
- Confirm queue shutdown timeout.
- Confirm event drivers match process topology.

## Final Check

- Run smoke tests.
- Inspect `route:list`.
- Validate one health check.
- Validate one readiness check.
- Validate metrics output.
- Validate expected runtime processes start and stop cleanly.

## Next Steps

- [Deployment Basics](/operations/deployment-basics)
- [Runtime Processes](/operations/runtime-processes)
- [Testing Overview](/testing/overview)
