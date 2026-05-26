---
title: Environment Variables
description: Framework-level lookup for common GoForj environment variable families.
---

# Environment Variables

Generated Apps use environment variables for runtime behavior.

This page groups the major variable families. Generated component READMEs and workflow pages contain feature-specific detail.

## App

| Variable | Purpose |
| --- | --- |
| `APP_NAME` | App display name. |
| `APP_KEY` | App secret material used by generated runtime features. |
| `APP_ENV` | Environment name such as `local` or `production`. |
| `APP_DEBUG` | Debug behavior toggle. |
| `APP_URL` | Public App URL. |
| `APP_DIAG_TOKEN` | Token for authorized diagnostic endpoints. |
| `APP_SHUTDOWN_TIMEOUT` | Root shutdown budget. |

## HTTP and OpenAPI

| Variable | Purpose |
| --- | --- |
| `API_HTTP_HOST` | HTTP bind host. |
| `API_HTTP_PORT` | HTTP bind port. |
| `API_SWAGGER_ENABLED` | Enables generated API reference routes. |
| `OPENAPI_SPEC_PATH` | Overrides the served OpenAPI JSON path. |

## Driver Families

GoForj separates compile-time support from runtime selection.

| Family | Compile-Time Support | Runtime Selection |
| --- | --- | --- |
| Cache | `CACHE_SUPPORTED_DRIVERS` | `CACHE_DRIVER`, `CACHE_<NAME>_DRIVER` |
| Storage | `STORAGE_SUPPORTED_DRIVERS` | `STORAGE_DRIVER`, `STORAGE_<NAME>_DRIVER` |
| Queue | `QUEUE_SUPPORTED_DRIVERS` | `QUEUE_DRIVER`, `QUEUE_<NAME>_DRIVER` |
| Events | `EVENTS_SUPPORTED_DRIVERS` | `EVENTS_DRIVER`, `EVENTS_<NAME>_DRIVER` |
| Database | `DB_SUPPORTED_DRIVERS` | `DB_DRIVER`, `DB_<NAME>_DRIVER` |
| Mail | `MAIL_SUPPORTED_DRIVERS` | `MAIL_DRIVER`, `MAIL_<NAME>_DRIVER` |

## Metrics

Common metrics variables:

- `METRICS_PORT`
- `METRICS_API_PORT`
- `METRICS_JOBS_PORT`
- `METRICS_SCHEDULER_PORT`
- `METRICS_HTTP_ENABLED`
- `METRICS_CACHE_ENABLED`
- `METRICS_STORAGE_ENABLED`
- `METRICS_EVENTS_ENABLED`
- `METRICS_QUEUE_ENABLED`
- `METRICS_DATABASE_ENABLED`
- `METRICS_AUTH_ENABLED`
- `METRICS_SCHEDULER_ENABLED`

## Lighthouse and Inspects

Common variables:

- `LIGHTHOUSE_ENABLED`
- `LIGHTHOUSE_URL`
- `LIGHTHOUSE_SECRET`
- `LIGHTHOUSE_INSPECT_MAX_TOTAL`
- `LIGHTHOUSE_INSPECT_MAX_INFLIGHT`
- `LIGHTHOUSE_INSPECT_MAX_EVENTS`
- `LIGHTHOUSE_INSPECT_SAMPLE_RATE`
- `LIGHTHOUSE_INSPECT_BUFFER_SIZE`
- `LIGHTHOUSE_INSPECT_FLUSH_INTERVAL`
- `LIGHTHOUSE_INSPECT_FLUSH_BATCH_SIZE`

## Related Pages

- [Configuration](/getting-started/configuration)
- [Generated Components](/core/generated-components)
- [Driver Selection](/data/driver-selection)
