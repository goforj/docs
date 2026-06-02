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

## Logging

| Variable | Purpose |
| --- | --- |
| `APP_LOG_CALLER` | Include caller metadata in logs. |
| `APP_LOG_FORMAT` | Log format, normally `console` or `json`. |
| `APP_LOG_TIME` | Include timestamps in generated App logs. |
| `APP_LOG_DEDUPE_ENABLED` | Coalesce repeated similar log messages. |

## HTTP and OpenAPI

| Variable | Purpose |
| --- | --- |
| `API_HTTP_HOST` | HTTP bind host. |
| `API_HTTP_PORT` | HTTP bind port. |
| `API_SWAGGER_ENABLED` | Enables generated API reference routes. |
| `OPENAPI_SPEC_PATH` | Overrides the served OpenAPI JSON path. |

## HTTP Client Diagnostics

| Variable | Purpose |
| --- | --- |
| `HTTP_TRACE` | Enables `httpx` request and response dump output for clients created with `httpx.New()` when the variable is present. |

## Forj Developer Tools

| Variable | Purpose |
| --- | --- |
| `FORJ_MAKE_OPEN` | Controls whether file-generating make commands open generated files. Values are `auto`, `always`, or `never`. |
| `FORJ_EDITOR` | Optional editor command for opening generated files. Supports `{file}`, `{line}`, and `{location}` placeholders. |

See [Opening Generated Files](/developer-tools/editor-open) for editor detection and examples.

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

| Variable | Purpose |
| --- | --- |
| `METRICS_PORT` | Combined App metrics endpoint port. |
| `METRICS_API_PORT` | HTTP runtime metrics endpoint port. |
| `METRICS_JOBS_PORT` | Jobs runtime metrics endpoint port. |
| `METRICS_SCHEDULER_PORT` | Scheduler runtime metrics endpoint port. |
| `METRICS_HTTP_ENABLED` | Enable HTTP metrics. |
| `METRICS_CACHE_ENABLED` | Enable cache metrics. |
| `METRICS_STORAGE_ENABLED` | Enable storage metrics. |
| `METRICS_EVENTS_ENABLED` | Enable event metrics. |
| `METRICS_MAIL_ENABLED` | Enable mail metrics when mail is rendered. |
| `METRICS_QUEUE_ENABLED` | Enable queue metrics when jobs are rendered. |
| `METRICS_DATABASE_ENABLED` | Enable database metrics when database support is rendered. |
| `METRICS_AUTH_ENABLED` | Enable auth metrics when auth is rendered. |
| `METRICS_SCHEDULER_ENABLED` | Enable scheduler metrics when scheduler is rendered. |
| `METRICS_MONITORING_ENABLED` | Enable demo monitoring metrics when the demo App is rendered. |

## Lighthouse and Inspects

Common variables:

| Variable | Purpose |
| --- | --- |
| `LIGHTHOUSE_ENABLED` | Enable Lighthouse runtime integration. |
| `LIGHTHOUSE_URL` | Lighthouse agent websocket URL. |
| `LIGHTHOUSE_SECRET` | Shared secret for Lighthouse agent/server authentication. |
| `LIGHTHOUSE_INSPECT_ENABLED` | Enable inspect capture. Local overrides usually set this to `true`. |
| `LIGHTHOUSE_INSPECT_MAX_TOTAL` | Maximum retained inspect records. |
| `LIGHTHOUSE_INSPECT_MAX_INFLIGHT` | Maximum in-flight inspect records. |
| `LIGHTHOUSE_INSPECT_MAX_EVENTS` | Maximum events recorded per inspect. |
| `LIGHTHOUSE_INSPECT_SAMPLE_RATE` | Sampling rate for inspect capture. |
| `LIGHTHOUSE_INSPECT_BUFFER_SIZE` | Lighthouse inspect flush buffer size. |
| `LIGHTHOUSE_INSPECT_FLUSH_INTERVAL` | Lighthouse inspect flush interval. |
| `LIGHTHOUSE_INSPECT_FLUSH_BATCH_SIZE` | Lighthouse inspect flush batch size. |

## Auth

Generated auth Apps commonly use:

| Variable | Purpose |
| --- | --- |
| `API_JWT_SECRET_KEY` | JWT signing secret for generated auth. |
| `AUTH_ACCESS_TOKEN_TTL` | Short-lived bearer token lifetime. |
| `AUTH_SESSION_IDLE_TTL` | Inactivity window before sign-in is required again. |
| `AUTH_SESSION_TTL` | Absolute session lifetime. |
| `AUTH_REMEMBER_SESSION_TTL` | Absolute lifetime for remembered sessions. |
| `AUTH_COOKIE_SECURE` | Cookie secure behavior. |
| `AUTH_LOGIN_LOCKOUT_ATTEMPTS` | Failed login attempts before temporary lockout. |
| `AUTH_LOGIN_LOCKOUT_DURATION` | Temporary lockout duration. |
| `AUTH_LOGIN_RATE_LIMIT_ATTEMPTS` | Login rate-limit attempts within the configured window. |
| `AUTH_LOGIN_RATE_LIMIT_DURATION` | Login rate-limit window. |
| `AUTH_BOOTSTRAP_USERNAME` | Bootstrap admin username for generated local auth setup. |
| `AUTH_BOOTSTRAP_EMAIL` | Bootstrap admin email for generated local auth setup. |
| `AUTH_BOOTSTRAP_PASSWORD` | Bootstrap admin password for generated local auth setup. |

## Related Pages

- [Configuration](/getting-started/configuration)
- [Generated Components](/core/generated-components)
- [Opening Generated Files](/developer-tools/editor-open)
- [HTTP Clients](/applications/http-clients)
- [Driver Selection](/data/driver-selection)
