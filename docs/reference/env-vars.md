---
title: Environment Reference (.env)
description: Complete GoForj environment reference covering environment variables, env vars, config vars, .env files, dotenv configuration, drivers, runtime, and local services.
pageClass: env-vars-reference
---

# Environment Reference (.env)

Generated .env files are intentionally compact. They contain the values a new App needs to start locally, not every optional override supported by the generated runtime.

Use this page as the complete environment reference when you need to add an override, configure a production driver, or understand a value already present in an .env file. Feature guides explain behavior and deployment tradeoffs; this page owns the exhaustive public variable contract.

::: tip Keep .env Intentional
Add a variable only when the App needs a value different from its runtime fallback or rendered local default. Keep secrets in the deployment environment or secret manager outside local development.
:::

## Resolution and Naming

Generated Apps load .env files before their Wire graph is initialized. See [Configuration](/getting-started/configuration) for file precedence, build-time defaults, and build-time overrides.

GoForj uses two reusable naming patterns:

- App overlay: `<APP>_<KEY>` overrides `<KEY>` for one selected App. For example, `BILLING_APP_URL` overlays `APP_URL`, and `BILLING_CACHE_SESSIONS_DRIVER` overlays `CACHE_SESSIONS_DRIVER` while the `billing` App runs.
- Named resource: `<FAMILY>_<NAME>_<SUFFIX>` configures one generated resource. For example, `CACHE_SESSIONS_DRIVER` selects the `sessions` cache driver and `STORAGE_UPLOADS_BUCKET` configures the `uploads` disk.

The default resource omits `<NAME>`. Unless a section says otherwise, each default variable below also accepts a named form by inserting `<NAME>` after its family prefix.

Driver-backed resources separate build and runtime decisions:

| Pattern | Meaning |
| --- | --- |
| `<FAMILY>_SUPPORTED_DRIVERS` | Comma-separated drivers compiled into the App. Changing this value requires generation and a rebuild. |
| `<FAMILY>_DRIVER` | Active driver for the default resource. |
| `<FAMILY>_<NAME>_DRIVER` | Active driver for one named resource. |

Variables for components that are not selected are not rendered and have no generated owner. Compatibility aliases are identified explicitly. Internal process handoff variables, test-only controls, and accepted settings with no runtime behavior are not configuration options and are not listed as public variables.

## App and Runtime

| Variable | Default | Purpose |
| --- | --- | --- |
| `APP_NAME` | Project name when rendered | App display and service name. |
| `APP_KEY` | Generated `base64:` key | Application encryption key. The standalone Crypt library consumes it through `crypt.NewFromEnv`; generated subsystems do not consume it automatically. Keep it secret and stable. |
| `APP_PREVIOUS_KEYS` | Empty | Comma-separated older `APP_KEY` values used by the Crypt library during key rotation. |
| `APP_ENV` | `local` | Environment name, such as `local`, `staging`, or `production`. |
| `APP_DEBUG` | `0` | Numeric log verbosity from `0` through `3`. |
| `APP_URL` | `http://localhost:3000` when Web API is rendered | Public base URL used by generated browser and runtime features. |
| `APP_DIAG_TOKEN` | Generated when Web API is rendered | Bearer token for protected diagnostic commands and endpoints. |
| `APP_SHUTDOWN_TIMEOUT` | `30s` | Root graceful-shutdown budget. |
| `APP_VERSION` | Empty | Deployment version reported to Lighthouse. |
| `APP_INSTANCE_ID` | Empty | Explicit process or replica identity reported to Lighthouse. When empty, Lighthouse identifies the instance by hostname, then its generated agent ID. |
| `APP_INSTANCE_KIND` | Empty | Optional deployment-specific instance classification reported to Lighthouse. |
| `APP_MODE` | Empty | Optional runtime mode used in generated log labels. Runtime commands normally set their own context. |
| `APP_LOG_PREFIX` | Empty | Optional log-label prefix. Generated runtime commands set this when they need a source label. |

## Logging

| Variable | Default | Purpose |
| --- | --- | --- |
| `APP_LOG_FORMAT` | `console` | Output format: `console` or `json`. |
| `APP_LOG_TIME` | Disabled; rendered `.env` enables it | Include timestamps in generated App logs. Values `0`, `false`, `off`, and `no` disable it. |
| `APP_LOG_CALLER` | Disabled | Include caller metadata. Values `0`, `false`, `off`, and `no` disable it. |
| `APP_LOG_DEDUPE_ENABLED` | `true` | Coalesce repeated similar log messages. |
| `APP_LOG_DEDUPE_WINDOW_MS` | `1200` | Dedupe window in milliseconds. |
| `APP_LOG_DEDUPE_BURST` | `2` | Matching messages emitted before suppression begins within a window. |
| `APP_LOG_DEDUPE_SUMMARY_EVERY` | `1000` | Suppressed occurrences between summary messages. |

See [Logging](/operations/logging) for event shape, output modes, and sensitive-data guidance.

## HTTP and OpenAPI

| Variable | Default | Purpose |
| --- | --- | --- |
| `API_HTTP_HOST` | `0.0.0.0` | HTTP bind host. |
| `API_HTTP_PORT` | Generated App port, starting at `3000` | HTTP bind port. |
| `PORT` | Empty | Compatibility override for the default or selected App HTTP port. When set, it takes precedence over `API_HTTP_PORT`; prefer leaving it unset and configuring `API_HTTP_PORT`. |
| `HTTP_ACCESS_LOG_ENABLED` | `true` | Enable generated HTTP access log events. |
| `HTTP_CORS_ALLOW_ENDPOINTS` | `http://localhost:8080` in `local`; otherwise empty | Comma-separated credentialed CORS origins. Configure production origins explicitly. |
| `API_SWAGGER_ENABLED` | `true` | Enable generated API reference routes. |
| `SWAGGER_ENABLED` | `true` | Compatibility fallback for `API_SWAGGER_ENABLED`. Prefer `API_SWAGGER_ENABLED`. |
| `OPENAPI_SPEC_PATH` | `build/openapi.json`; named Apps use `build/<app>/openapi.json` | Path to the OpenAPI artifact served by the generated API reference routes. |

## Auth

Generated auth has secure runtime fallbacks, so a new .env includes only its generated signing secret and local bootstrap account.

| Variable | Default | Purpose |
| --- | --- | --- |
| `API_JWT_SECRET_KEY` | Empty; generated locally | JWT signing secret. Supply a unique deployment secret outside local development. |
| `AUTH_ACCESS_TOKEN_TTL` | `15m` | Access-token lifetime. |
| `AUTH_SESSION_IDLE_TTL` | `2h` | Maximum session inactivity before sign-in is required. |
| `AUTH_SESSION_TTL` | `24h` | Absolute session lifetime. |
| `AUTH_REMEMBER_SESSION_TTL` | `720h` | Absolute lifetime for remembered sessions. |
| `AUTH_REGISTER_REQUIRES_EMAIL_VERIFICATION` | `false` | Delay session issuance until a new account verifies its email. |
| `AUTH_PASSWORD_MIN_LENGTH` | `8` | Minimum local-password length. |
| `AUTH_PASSWORD_REQUIRE_UPPER` | `true` | Require an uppercase character. |
| `AUTH_PASSWORD_REQUIRE_LOWER` | `false` | Require a lowercase character. |
| `AUTH_PASSWORD_REQUIRE_NUMBER` | `false` | Require a number. |
| `AUTH_PASSWORD_REQUIRE_SYMBOL` | `true` | Require a symbol. |
| `AUTH_COOKIE_SECURE` | `auto` | Secure-cookie policy. `auto` follows the request scheme and enables secure cookies for HTTPS requests. |
| `AUTH_PASSWORD_RESET_TTL` | `1h` | Password-reset token lifetime. |
| `AUTH_PASSWORD_RESET_RETURN_TOKEN` | `true` in `local`; otherwise `false` | Return reset tokens in API responses. Enable outside local development only for a controlled integration. |
| `AUTH_EMAIL_VERIFICATION_TTL` | `24h` | Email-verification token lifetime. |
| `AUTH_EMAIL_VERIFICATION_RETURN_TOKEN` | `true` in `local`; otherwise `false` | Return verification tokens in API responses. Enable outside local development only for a controlled integration. |
| `AUTH_LOGIN_LOCKOUT_ATTEMPTS` | `5` | Failed attempts before temporary account lockout. |
| `AUTH_LOGIN_LOCKOUT_DURATION` | `15m` | Account lockout duration. |
| `AUTH_LOGIN_RATE_LIMIT_ATTEMPTS` | `10` | Login attempts allowed during the rate-limit window. |
| `AUTH_LOGIN_RATE_LIMIT_DURATION` | `15m` | Login rate-limit window. |
| `AUTH_BOOTSTRAP_USERNAME` | Empty; rendered local value is `admin` | Local bootstrap username. Bootstrap is skipped when username or password is empty. |
| `AUTH_BOOTSTRAP_EMAIL` | Derived as `<username>@local.invalid`; rendered local value is `admin@example.com` | Local bootstrap email. |
| `AUTH_BOOTSTRAP_PASSWORD` | Empty; rendered local value is `admin` | Local bootstrap password. Replace or remove it outside local development. |

See [Auth](/security/auth), [Sessions and Cookies](/security/sessions-cookies), and [Production Hardening](/security/production-hardening).

## OAuth

OAuth credential stubs are intentionally absent from generated .env files. A provider remains disabled until every required value is present.

| Provider | Required Variables |
| --- | --- |
| GitHub | `AUTH_OAUTH_GITHUB_CLIENT_ID`, `AUTH_OAUTH_GITHUB_CLIENT_SECRET` |
| Google | `AUTH_OAUTH_GOOGLE_CLIENT_ID`, `AUTH_OAUTH_GOOGLE_CLIENT_SECRET` |
| Microsoft | `AUTH_OAUTH_MICROSOFT_CLIENT_ID`, `AUTH_OAUTH_MICROSOFT_CLIENT_SECRET` |
| Apple | `AUTH_OAUTH_APPLE_CLIENT_ID`, `AUTH_OAUTH_APPLE_TEAM_ID`, `AUTH_OAUTH_APPLE_KEY_ID`, `AUTH_OAUTH_APPLE_PRIVATE_KEY` |

Common and advanced provider settings:

| Variable | Default | Purpose |
| --- | --- | --- |
| `AUTH_OAUTH_STATE_TTL` | `10m` | Lifetime of one-time OAuth state records. |
| `AUTH_OAUTH_MICROSOFT_TENANT` | `common` | Microsoft tenant segment. |
| `AUTH_OAUTH_GITHUB_AUTH_URL` | GitHub authorize endpoint | Advanced authorization endpoint override. |
| `AUTH_OAUTH_GITHUB_TOKEN_URL` | GitHub token endpoint | Advanced token endpoint override. |
| `AUTH_OAUTH_GITHUB_USERINFO_URL` | GitHub user endpoint | Advanced user-info endpoint override. |
| `AUTH_OAUTH_GITHUB_EMAILS_URL` | GitHub email endpoint | Advanced verified-email endpoint override. |
| `AUTH_OAUTH_GOOGLE_AUTH_URL` | Google authorize endpoint | Advanced authorization endpoint override. |
| `AUTH_OAUTH_GOOGLE_TOKEN_URL` | Google token endpoint | Advanced token endpoint override. |
| `AUTH_OAUTH_GOOGLE_USERINFO_URL` | Google OpenID user-info endpoint | Advanced user-info endpoint override. |
| `AUTH_OAUTH_MICROSOFT_AUTH_URL` | Tenant-specific Microsoft authorize endpoint | Advanced authorization endpoint override. |
| `AUTH_OAUTH_MICROSOFT_TOKEN_URL` | Tenant-specific Microsoft token endpoint | Advanced token endpoint override. |
| `AUTH_OAUTH_MICROSOFT_USERINFO_URL` | Microsoft Graph OpenID user-info endpoint | Advanced user-info endpoint override. |
| `AUTH_OAUTH_APPLE_AUTH_URL` | Apple authorize endpoint | Advanced authorization endpoint override. |
| `AUTH_OAUTH_APPLE_TOKEN_URL` | Apple token endpoint | Advanced token endpoint override. |
| `AUTH_OAUTH_APPLE_JWKS_URL` | Apple signing-key endpoint | Advanced JWKS endpoint override. |
| `AUTH_OAUTH_APPLE_RESPONSE_MODE` | `form_post` | Apple callback response mode. |

Endpoint overrides are primarily for provider-compatible gateways, controlled testing, and private identity infrastructure. See [OAuth](/security/oauth) for account-linking and callback behavior.

## Frontend

Only values with an explicit frontend prefix are exposed to generated browser code. Treat every frontend value as public.

| Variable Pattern | Purpose |
| --- | --- |
| `FRONTEND_<KEY>` | Exposes `VITE_<KEY>` to every generated frontend. |
| `<APP>_FRONTEND_<KEY>` | Overrides one App frontend, such as `MARKETPLACE_FRONTEND_BACKEND_URL`. |
| `VITE_BACKEND_URL` | Compatibility fallback for `FRONTEND_BACKEND_URL`. Prefer the GoForj frontend prefix in shared environment files. |
| `FRONTEND_BACKEND_URL` | Backend proxy target. Resolution falls back to `<APP>_APP_URL`, `APP_URL`, then the generated App HTTP port. |
| `FRONTEND_AUTH_PASSWORD_MIN_LENGTH` | Vue password guidance matching `AUTH_PASSWORD_MIN_LENGTH`. |
| `FRONTEND_AUTH_PASSWORD_REQUIRE_UPPER` | Vue password guidance matching `AUTH_PASSWORD_REQUIRE_UPPER`. |
| `FRONTEND_AUTH_PASSWORD_REQUIRE_LOWER` | Vue password guidance matching `AUTH_PASSWORD_REQUIRE_LOWER`. |
| `FRONTEND_AUTH_PASSWORD_REQUIRE_NUMBER` | Vue password guidance matching `AUTH_PASSWORD_REQUIRE_NUMBER`. |
| `FRONTEND_AUTH_PASSWORD_REQUIRE_SYMBOL` | Vue password guidance matching `AUTH_PASSWORD_REQUIRE_SYMBOL`. |

The backend auth policy remains authoritative. The password-policy frontend values are consumed only by the Vue starter.

Generated frontends expose the selected App's `<APP>_APP_ENV`, or the global `APP_ENV`, as `VITE_APP_ENV`.

## Metrics and Runtime Ports

Generated runtime metadata assigns the default App ports `3000`, `10000`, `10001`, and `10002`. Each named App receives the next non-conflicting block.

| Variable | Default App Default | Purpose |
| --- | ---: | --- |
| `METRICS_PORT` | `10000` | Shared App metrics port and canonical HTTP metrics port. |
| `API_METRICS_PORT` | `METRICS_PORT` | Accepted HTTP metrics alias. |
| `METRICS_API_PORT` | `METRICS_PORT` | Compatibility HTTP metrics alias. |
| `SCHEDULER_METRICS_PORT` | `10001` | Accepted scheduler metrics alias. |
| `METRICS_SCHEDULER_PORT` | `10001` | Canonical generated scheduler metrics port. |
| `WORKER_METRICS_PORT` | `10002` | Accepted worker metrics alias. |
| `JOBS_METRICS_PORT` | `10002` | Accepted jobs metrics alias. |
| `METRICS_JOBS_PORT` | `10002` | Canonical generated jobs metrics port. |

Every port key accepts the `<APP>_` overlay. For example, the first named App can use `MARKETPLACE_METRICS_PORT=10010`, `MARKETPLACE_METRICS_SCHEDULER_PORT=10011`, and `MARKETPLACE_METRICS_JOBS_PORT=10012`.

Framework-owned instrumentation toggles all default to `true` when their component exists:

| Variable | Surface |
| --- | --- |
| `METRICS_HTTP_ENABLED` | HTTP requests. |
| `METRICS_CACHE_ENABLED` | Cache operations. |
| `METRICS_STORAGE_ENABLED` | Storage operations. |
| `METRICS_EVENTS_ENABLED` | Event operations. |
| `METRICS_MAIL_ENABLED` | Mail sends. |
| `METRICS_QUEUE_ENABLED` | Queue operations. |
| `METRICS_DATABASE_ENABLED` | Database operations. |
| `METRICS_AUTH_ENABLED` | Auth flows. |
| `METRICS_SCHEDULER_ENABLED` | Scheduler operations. |
| `METRICS_MONITORING_ENABLED` | Monitoring metrics in the generated demo App. |

See [Metrics](/operations/metrics) for endpoints, labels, and scrape topology.

## Lighthouse and Inspects

| Variable | Default | Purpose |
| --- | --- | --- |
| `LIGHTHOUSE_ENABLED` | `true` | Enable Lighthouse runtime integration. |
| `LIGHTHOUSE_URL` | `ws://localhost:3000/lighthouse/ws/agent` | Lighthouse agent websocket URL. |
| `LIGHTHOUSE_SECRET` | Empty; generated locally | Shared agent/server authentication secret. |
| `LIGHTHOUSE_DEBUG` | Disabled | Enable Lighthouse debug output. |
| `LIGHTHOUSE_VSCODE_CMD` | `code` | VS Code command used by Lighthouse source links. |
| `LIGHTHOUSE_GOLAND_CMD` | `goland` | GoLand command used by Lighthouse source links. |
| `LIGHTHOUSE_INSPECT_ENABLED` | `false`; `.env.local` sets `true` | Enable inspect capture. |
| `LIGHTHOUSE_INSPECT_MAX_TOTAL` | `250`; `.env.local` sets `1000` | Maximum retained inspect records. |
| `LIGHTHOUSE_INSPECT_MAX_INFLIGHT` | `100`; `.env.local` sets `250` | Maximum in-flight inspect records. |
| `LIGHTHOUSE_INSPECT_MAX_EVENTS` | `200`; `.env.local` sets `500` | Maximum events recorded per inspect. |
| `LIGHTHOUSE_INSPECT_SAMPLE_RATE` | `1.0` | Capture rate from `0.0` through `1.0`. |
| `LIGHTHOUSE_INSPECT_BUFFER_SIZE` | `4096` | Finished-inspect delivery buffer size. |
| `LIGHTHOUSE_INSPECT_FLUSH_BATCH_SIZE` | `100` | Maximum records per Lighthouse delivery batch. |
| `LIGHTHOUSE_INSPECT_FLUSH_INTERVAL` | `1s` | Maximum delay between delivery flushes. |

See [Lighthouse](/operations/lighthouse) and [Inspects](/operations/inspects).

## Database

Available drivers: `sqlite`, `mysql`, `postgres`.

The default connection uses `DB_<SUFFIX>`. Named connections use `DB_<NAME>_<SUFFIX>`, such as `DB_ANALYTICS_DRIVER`. `DB_SUPPORTED_DRIVERS` is project-wide.

| Variable | Default | Purpose |
| --- | --- | --- |
| `DB_SUPPORTED_DRIVERS` | Active drivers when unset | Comma-separated database drivers compiled into the App. Root key only. |
| `DB_DEFAULT` | `default` | Named connection returned by the default accessor. Root key only. |
| `DB_DRIVER` | `sqlite`; renderer writes the selected driver | Active connection driver. |
| `DB_DSN` | Empty | Complete connection DSN. When set, it takes precedence over individual connection fields. |
| `DB_HOST` | Empty | MySQL or Postgres host. |
| `DB_PORT` | Empty | MySQL or Postgres port. |
| `DB_DATABASE` | `_data/sqlite/app.db` for default SQLite; named SQLite uses its resource name | Database name or SQLite path. |
| `DB_SQLITE_DATABASE` | Empty | SQLite-specific path override when one configuration also carries server-database fields. |
| `DB_USERNAME` | Empty | MySQL or Postgres username. |
| `DB_PASSWORD` | Empty | MySQL or Postgres password. |
| `DB_QUERY_LOGGING` | `false` | Enable GORM query logging for the connection. |
| `DB_SLOW_QUERY_THRESHOLD` | `250ms` | Duration above which an observed query is classified as slow. |
| `DB_MAX_IDLE_CONNECTIONS` | Driver default | Maximum idle connections when greater than zero. |
| `DB_MAX_OPEN_CONNECTIONS` | Driver default | Maximum open connections when greater than zero. |
| `DB_CONN_MAX_LIFETIME_MINUTES` | `3` | Maximum connection lifetime in minutes. |
| `DB_ROOT_PASSWORD` | Empty | Root password used only by the generated local MySQL service. Root key only. |
| `MYSQL_MAX_IDLE_CONNECTIONS` | Driver default | Compatibility fallback for `DB_MAX_IDLE_CONNECTIONS`. Prefer the `DB_` key. |
| `MYSQL_MAX_OPEN_CONNECTIONS` | Driver default | Compatibility fallback for `DB_MAX_OPEN_CONNECTIONS`. Prefer the `DB_` key. |
| `DB_CONNECTIONS`, `DB_SUPPORTED_CONNECTIONS` | Empty | Legacy comma-separated connection-name discovery used by backup commands. New Apps discover `DB_<NAME>_*` directly. |

The renderer supplies usable local MySQL or Postgres connection values when those services are selected. Active driver values also accept the compatibility aliases `sqlite3`, `mariadb`, and `postgresql`; supported-driver lists and new configuration should use the canonical names above. See [Database Strategy](/data/database-strategy) and [Database Shell](/data/database-shell).

## Shared Redis and NATS

Redis-backed Cache, Storage, Events, and Queue resources share the host, port, and password values described below unless their family table says otherwise. Cache, Events, and Queue also use `REDIS_DB`; Storage defaults its scoped `DB` to `0`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `REDIS_HOST` | `redis` in generated runtime fallbacks | Shared Redis host. `.env.host` uses `localhost` for local host commands. |
| `REDIS_PORT` | `6379` | Shared Redis port and generated local-service published port. |
| `REDIS_PASSWORD` | Empty | Shared Redis password. |
| `REDIS_DB` | `0` | Shared Redis database number. |
| `NATS_URL` | `nats://127.0.0.1:4222` | Fallback URL for the NATS cache driver. Other NATS-backed resource families use their scoped `URL` setting. |

## Cache

Available drivers: `memory`, `file`, `null`, `redis`, `memcached`, `dynamodb`, `sqlite`, `postgres`, `mysql`, `nats`.

Use `CACHE_<SUFFIX>` for the default cache and `CACHE_<NAME>_<SUFFIX>` for named caches such as `CACHE_SESSIONS_DRIVER`.

Auth projects render `CACHE_SESSIONS_DRIVER`. The demo App also renders `CACHE_SETTINGS_DRIVER`. Both are ordinary named caches and accept the same named suffixes below.

Common settings:

| Variable | Default | Purpose |
| --- | --- | --- |
| `CACHE_SUPPORTED_DRIVERS` | Active drivers when unset | Comma-separated drivers compiled into the App. Root key only. |
| `CACHE_DRIVER` | `memory` | Active driver. |
| `CACHE_DEFAULT_TTL_SECONDS` | `300` | Default entry lifetime in seconds. |
| `CACHE_PREFIX` | `app` | Backend key prefix. |
| `CACHE_COMPRESSION` | `none` | Value compression: `none` or `gzip`. |
| `CACHE_MAX_VALUE_BYTES` | `0` | Maximum shaped value size in bytes; `0` disables the limit. |
| `CACHE_ENCRYPTION_KEY` | Empty | Raw 16, 24, or 32-byte AES key for cache values. This is not `APP_KEY` format. |

Driver settings:

| Variable | Driver | Default or Format |
| --- | --- | --- |
| `CACHE_MEMORY_CLEANUP_SECONDS` | `memory` | `600` seconds. |
| `CACHE_FILE_DIR` | `file` | Cache-specific directory under the operating-system temp root. |
| `CACHE_ADDRESSES` | `memcached` | Comma-separated `host:port` values. |
| `CACHE_ENDPOINT` | `dynamodb` | Empty provider endpoint override. |
| `CACHE_REGION` | `dynamodb` | `us-east-1`. |
| `CACHE_TABLE` | `dynamodb` | `cache_entries`. |
| `CACHE_DSN` | `sqlite` | Temporary SQLite file for the cache name. |
| `CACHE_TABLE` | `sqlite` | `cache_entries`. |
| `CACHE_DSN` | `postgres`, `mysql` | Required connection DSN. |
| `CACHE_TABLE` | `postgres`, `mysql` | `cache_entries`. |
| `CACHE_URL` | `nats` | `NATS_URL`, then `nats://127.0.0.1:4222`. |
| `CACHE_BUCKET` | `nats` | Derived from the cache name. |
| `CACHE_BUCKET_TTL` | `nats` | `false`; use JetStream bucket TTL mode instead of value-envelope expiration. |
| `CACHE_BUCKET_TTL_SECONDS` | `nats` | `0`; bucket-wide JetStream TTL when provisioning a bucket. `0` disables it. |
| `CACHE_DESCRIPTION` | `nats` | Empty. |
| `CACHE_HISTORY` | `nats` | `1`. |
| `CACHE_MAX_BYTES` | `nats` | `0`. |
| `CACHE_MAX_VALUE_SIZE` | `nats` | `0`. |
| `CACHE_REPLICAS` | `nats` | `1`. |
| `CACHE_STORAGE` | `nats` | `file`. |
| `CACHE_COMPRESSED` | `nats` | `false`. |
| `CACHE_ADDR` | `redis` | `REDIS_HOST:REDIS_PORT`. |
| `CACHE_USERNAME` | `redis` | Empty. |
| `CACHE_PASSWORD` | `redis` | `REDIS_PASSWORD`. |
| `CACHE_DB` | `redis` | `REDIS_DB`. |
| `CACHE_TLS` | `redis` | `false`. |
| `CACHE_INSECURE_SKIP_VERIFY` | `redis` | `false`; use only in controlled development. |
| None | `null` | No driver-specific settings. |

Compression and encryption change the persisted value envelope. See [Cache Patterns](/data/cache-patterns) before changing them in a mixed-version deployment.

## File Storage

Available drivers: `local`, `memory`, `redis`, `ftp`, `sftp`, `s3`, `gcs`, `dropbox`, `rclone`.

Use `STORAGE_<SUFFIX>` for the default disk and `STORAGE_<NAME>_<SUFFIX>` for named disks such as `STORAGE_PUBLIC_ROOT`.

Generated projects render `STORAGE_PUBLIC_DRIVER` and `STORAGE_PUBLIC_ROOT`. The demo App also renders `STORAGE_FAVICONS_DRIVER` and `STORAGE_FAVICONS_ROOT`. These are ordinary named disks and accept the same named suffixes below.

Common settings:

| Variable | Default | Purpose |
| --- | --- | --- |
| `STORAGE_SUPPORTED_DRIVERS` | Active drivers when unset | Comma-separated drivers compiled into the App. Root key only. |
| `STORAGE_DRIVER` | `local` | Active driver. |
| `STORAGE_PREFIX` | Empty | Backend object-key prefix. |

Driver settings:

| Variable | Driver | Default or Format |
| --- | --- | --- |
| `STORAGE_ROOT` | `local` | `storage/app/private` for the default disk; named disks default to `storage/app/<name>`, including the rendered public disk. |
| None | `memory` | No driver-specific settings. |
| `STORAGE_ADDR` | `redis` | `REDIS_HOST:REDIS_PORT`. |
| `STORAGE_USERNAME` | `redis` | Empty. |
| `STORAGE_PASSWORD` | `redis` | `REDIS_PASSWORD`. |
| `STORAGE_DB` | `redis` | `0`. |
| `STORAGE_HOST` | `ftp` | Required host. |
| `STORAGE_PORT` | `ftp` | `21`. |
| `STORAGE_USER`, `STORAGE_PASSWORD` | `ftp` | Empty credentials. |
| `STORAGE_TLS` | `ftp` | `false`. |
| `STORAGE_INSECURE_SKIP_VERIFY` | `ftp` | `false`; use only in controlled development. |
| `STORAGE_HOST` | `sftp` | Required host. |
| `STORAGE_PORT` | `sftp` | `22`. |
| `STORAGE_USER` | `sftp` | `root`. |
| `STORAGE_PASSWORD` | `sftp` | Empty. |
| `STORAGE_KEY_PATH` | `sftp` | Empty private-key path. |
| `STORAGE_KNOWN_HOSTS_PATH` | `sftp` | Empty known-hosts path. |
| `STORAGE_INSECURE_IGNORE_HOST_KEY` | `sftp` | `false`; use only in controlled development. |
| `STORAGE_BUCKET` | `s3` | Required bucket. |
| `STORAGE_ENDPOINT` | `s3` | Empty provider endpoint override. |
| `STORAGE_REGION` | `s3` | `us-east-1`. |
| `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY` | `s3` | Empty credentials. |
| `STORAGE_USE_PATH_STYLE` | `s3` | `false`. |
| `STORAGE_UNSIGNED_PAYLOAD` | `s3` | `false`. |
| `STORAGE_BUCKET` | `gcs` | Required bucket. |
| `STORAGE_CREDENTIALS_JSON` | `gcs` | Empty JSON credential string. |
| `STORAGE_ENDPOINT` | `gcs` | Empty provider endpoint override. |
| `STORAGE_TOKEN` | `dropbox` | Required access token. |
| `STORAGE_REMOTE` | `rclone` | Required remote name. |
| `STORAGE_RCLONE_CONFIG_PATH` | `rclone` | Empty config-file path. |
| `STORAGE_RCLONE_CONFIG_DATA` | `rclone` | Empty inline config data. |

See [Storage Patterns](/data/storage-patterns) for path and durability guidance.

## Events

Available drivers: `inproc`, `null`, `redis`, `nats`, `natsjetstream`, `kafka`, `gcppubsub`, `sns`.

Use `EVENTS_<SUFFIX>` for the default bus and `EVENTS_<NAME>_<SUFFIX>` for named buses.

| Variable | Driver | Default or Format |
| --- | --- | --- |
| `EVENTS_SUPPORTED_DRIVERS` | All | Active drivers when unset. Root key only. |
| `EVENTS_DRIVER` | All | `inproc`. |
| None | `inproc`, `null` | No driver-specific runtime settings. |
| `EVENTS_ADDR` | `redis` | `REDIS_HOST:REDIS_PORT`; authentication uses shared `REDIS_PASSWORD` and `REDIS_DB`. |
| `EVENTS_URL` | `nats` | `nats://127.0.0.1:4222`. |
| `EVENTS_URL` | `natsjetstream` | `nats://127.0.0.1:4222`. |
| `EVENTS_SUBJECT_PREFIX` | `natsjetstream` | `events.`. |
| `EVENTS_STREAM_NAME_PREFIX` | `natsjetstream` | `EVENTS_`. |
| `EVENTS_INACTIVE_THRESHOLD_SECONDS` | `natsjetstream` | `30`. |
| `EVENTS_ACK_WAIT_SECONDS` | `natsjetstream` | `30`. |
| `EVENTS_FETCH_MAX_WAIT_MS` | `natsjetstream` | `250`. |
| `EVENTS_STORAGE` | `natsjetstream` | `memory`. |
| `EVENTS_BROKERS` | `kafka` | Comma-separated brokers; default `127.0.0.1:9092`. |
| `EVENTS_PROJECT_ID` | `gcppubsub` | Required project ID. |
| `EVENTS_URI` | `gcppubsub` | Optional emulator or provider URI. |
| `EVENTS_REGION` | `sns` | `us-east-1`. |
| `EVENTS_ENDPOINT` | `sns` | Empty provider endpoint override. |
| `EVENTS_TOPIC_NAME_PREFIX`, `EVENTS_QUEUE_NAME_PREFIX` | `sns` | Empty. |
| `EVENTS_WAIT_TIME_SECONDS` | `sns` | `1`. |
| `EVENTS_VISIBILITY_TIMEOUT_SECONDS` | `sns` | `30`. |

See [Events](/async/events) for delivery and durability differences.

## Queue

Available drivers: `null`, `sync`, `workerpool`, `redis`, `nats`, `sqs`, `rabbitmq`, `sqlite`, `postgres`, `mysql`.

Use `QUEUE_<SUFFIX>` for the default queue and `QUEUE_<NAME>_<SUFFIX>` for named queues.

Common settings:

| Variable | Default | Purpose |
| --- | --- | --- |
| `QUEUE_SUPPORTED_DRIVERS` | Active drivers when unset | Comma-separated drivers compiled into the App. Root key only. |
| `QUEUE_DRIVER` | `workerpool` | Active driver. |
| `QUEUE_WORKERS` | `30` | Worker count. Named queues inherit the root value when unset. |
| `QUEUE_NAME` | `default`; named resources use their resource name | Physical backend queue name before App namespacing. |
| `QUEUE_DEFAULT_QUEUE` | `QUEUE_NAME` | Compatibility alias for `QUEUE_NAME`. Prefer `QUEUE_NAME`. |
| `QUEUE_SHUTDOWN_TIMEOUT` | `10s` | Queue driver shutdown budget. |
| `QUEUE_WORKERPOOL_WORKERS` | `30` | Compatibility fallback used only when `QUEUE_WORKERS` is non-positive. Prefer `QUEUE_WORKERS`. |

Driver settings:

| Variable | Driver | Default or Format |
| --- | --- | --- |
| None | `null`, `sync`, `workerpool` | No driver-specific runtime settings. |
| `QUEUE_ADDR` | `redis` | `REDIS_HOST:REDIS_PORT`. |
| `QUEUE_PASSWORD` | `redis` | `REDIS_PASSWORD`. |
| `QUEUE_DB` | `redis` | `REDIS_DB`. |
| `QUEUE_QUEUES` | `redis` | Comma-separated `queue=weight` map; the configured default queue gets weight `1`. |
| `QUEUE_SERVER_LOG_LEVEL` | `redis` | Backend default; accepted values include `debug`, `info`, `warn`, `error`, and `fatal`. |
| `QUEUE_URL` | `nats` | `nats://127.0.0.1:4222`. |
| `QUEUE_REGION` | `sqs` | `us-east-1`. |
| `QUEUE_ENDPOINT` | `sqs` | Empty provider endpoint override. |
| `QUEUE_ACCESS_KEY`, `QUEUE_SECRET_KEY` | `sqs` | Empty credentials. |
| `QUEUE_URL` | `rabbitmq` | `amqp://guest:guest@127.0.0.1:5672/`. |
| `QUEUE_DSN` | `sqlite` | Temporary SQLite file per queue. |
| `QUEUE_DSN` | `postgres`, `mysql` | Required connection DSN. |
| `QUEUE_PROCESSING_RECOVERY_GRACE_SECONDS` | `sqlite`, `postgres`, `mysql` | `2`. |
| `QUEUE_PROCESSING_LEASE_NO_TIMEOUT_SECONDS` | `sqlite`, `postgres`, `mysql` | `300`. |

See [Queues](/async/queues) for selection and dispatch, and [Queue Workers](/operations/queue-workers) for lifecycle and scaling.

## Mail

Available drivers: `log`, `smtp`, `resend`, `postmark`, `mailgun`, `sendgrid`, `ses`.

Use `MAIL_<SUFFIX>` for the default mailer and `MAIL_<NAME>_<SUFFIX>` for named mailers.

| Variable | Driver | Default or Format |
| --- | --- | --- |
| `MAIL_SUPPORTED_DRIVERS` | All | Active drivers when unset. Root key only. |
| `MAIL_DRIVER` | All | `log`; rendered Docker projects use `smtp`. |
| `MAIL_FROM_ADDRESS` | All | `no-reply@example.com`. |
| `MAIL_FROM_NAME` | All | `APP_NAME`; the renderer writes the project name. |
| `MAIL_LOG_BODIES` | `log` | `false`. |
| `MAIL_SMTP_HOST` | `smtp` | Required host. Docker projects render `mailpit`. |
| `MAIL_SMTP_PORT` | `smtp` | `587`; Mailpit projects render `1025`. |
| `MAIL_SMTP_USERNAME`, `MAIL_SMTP_PASSWORD`, `MAIL_SMTP_IDENTITY` | `smtp` | Empty. |
| `MAIL_SMTP_FORCE_TLS` | `smtp` | `false`. |
| `MAIL_RESEND_API_KEY` | `resend` | Required API key. |
| `MAIL_RESEND_ENDPOINT` | `resend` | Provider default. |
| `MAIL_POSTMARK_SERVER_TOKEN` | `postmark` | Required server token. |
| `MAIL_POSTMARK_ENDPOINT` | `postmark` | Provider default. |
| `MAIL_POSTMARK_MESSAGE_STREAM` | `postmark` | Empty. |
| `MAIL_MAILGUN_DOMAIN`, `MAIL_MAILGUN_API_KEY` | `mailgun` | Required provider values. |
| `MAIL_MAILGUN_ENDPOINT` | `mailgun` | Provider default. |
| `MAIL_SENDGRID_API_KEY` | `sendgrid` | Required API key. |
| `MAIL_SENDGRID_ENDPOINT` | `sendgrid` | Provider default. |
| `MAIL_SES_REGION` | `ses` | Empty. |
| `MAIL_SES_ACCESS_KEY_ID`, `MAIL_SES_SECRET_ACCESS_KEY`, `MAIL_SES_SESSION_TOKEN` | `ses` | Empty credentials. |
| `MAIL_SES_ENDPOINT` | `ses` | AWS SDK default. |
| `MAIL_SES_CONFIGURATION_SET` | `ses` | Empty. |

See [Mail](/applications/mail) for local delivery, named mailers, and production guidance.

## Scheduler and Process Shutdown

| Variable | Default | Purpose |
| --- | --- | --- |
| `SCHEDULER_COMMAND_TIMEOUT` | `10m` | Maximum runtime for a command launched by a scheduled task. |
| `SCHEDULER_SUBPROCESS_SHUTDOWN_TIMEOUT` | `APP_SHUTDOWN_TIMEOUT`; rendered as `90s` | Grace period for scheduler-owned subprocesses. |
| `QUEUE_SHUTDOWN_TIMEOUT` | `10s` | Queue shutdown budget, also listed with Queue settings. |

## Local Observability

These values configure generated local VictoriaMetrics and Grafana infrastructure. Production observability may use different deployment configuration.

| Variable | Default | Purpose |
| --- | --- | --- |
| `OBSERVABILITY_VM_PORT` | `8428` | Published VictoriaMetrics HTTP port. |
| `GRAFANA_PORT` | `13001` | Published Grafana HTTP port. |
| `GRAFANA_ADMIN_USER` | `admin` | Local Grafana administrator username. |
| `GRAFANA_ADMIN_PASSWORD` | `admin` | Local Grafana administrator password. Change it before network exposure. |
| `OBSERVABILITY_METRICS_TARGET_MODE` | `auto`, resolved to `local-single` | Target topology: `auto`, `local-single`, `local-multi`, `compose`, or `disabled`. |
| `OBSERVABILITY_METRICS_TARGET_HOST` | `host.docker.internal` | Host used by local generated scrape targets. An explicitly empty value preserves the existing target file. |
| `OBSERVABILITY_API_METRICS_HOST` | `api` | HTTP role host in `compose` mode. Empty omits the role target. |
| `OBSERVABILITY_JOBS_METRICS_HOST` | `jobs` | Jobs role host in `compose` mode. Empty omits the role target. |
| `OBSERVABILITY_SCHEDULER_METRICS_HOST` | `scheduler` | Scheduler role host in `compose` mode. Empty omits the role target. |

## Local Services and Docker

| Variable | Default | Purpose |
| --- | --- | --- |
| `IP_ADDRESS` | `0.0.0.0` | Host address used for generated Compose port publishing. |
| `COMPOSE_PROFILES` | Empty | Compose profiles to activate. The renderer uses `redis` when a local optional Redis service is selected. |
| `MAILPIT_SMTP_PORT` | `1025` | Published Mailpit SMTP port. |
| `MAILPIT_HTTP_PORT` | `8025` | Published Mailpit inbox port. |
| `DB_MYSQL_PORT` | `DB_PORT`, then `3306` | Published local MySQL port without changing the App connection port. |
| `DB_POSTGRES_PORT` | `DB_PORT`, then `5432` | Published local Postgres port without changing the App connection port. |
| `INNODB_BUFFER_POOL_SIZE` | `512MB` | Build setting for the generated local MariaDB image. |
| `TZ` | `US/Central` | Time zone passed to generated local database services. |

## Backups

| Variable | Default | Purpose |
| --- | --- | --- |
| `BACKUP_PATH` | `.goforj/backups` | Default local backup root. |
| `APP_BACKUP_DRIVER` | `local` | Backup repository driver: `local`, `s3`, or `b2-s3`. |
| `APP_BACKUP_S3_BUCKET` | Empty | S3-compatible repository bucket. |
| `APP_BACKUP_S3_ENDPOINT` | Empty | S3-compatible endpoint override. |
| `APP_BACKUP_S3_REGION` | Empty | S3-compatible region. |
| `APP_BACKUP_S3_ACCESS_KEY_ID` | Empty | Repository access key. |
| `APP_BACKUP_S3_SECRET_ACCESS_KEY` | Empty | Repository secret key. |
| `APP_BACKUP_S3_USE_PATH_STYLE` | `false` | Enable path-style S3 addressing. |
| `APP_BACKUP_S3_PREFIX` | Empty | Object prefix for completed backup sets. |
| `APP_BACKUP_KEEP_DAILY` | `14` | Completed sets retained in recent daily buckets when calendar retention is enabled. |
| `APP_BACKUP_KEEP_WEEKLY` | `4` | Completed sets retained in weekly buckets when calendar retention is enabled. |
| `APP_BACKUP_KEEP_MONTHLY` | `6` | Completed sets retained in monthly buckets when calendar retention is enabled. |

S3-backed `STORAGE_<NAME>_*` resources can be inventoried as backup inputs, but they are separate from the `APP_BACKUP_S3_*` repository that stores completed backup sets. See [Backup and Restore](/operations/backups).

## Forj Developer Tools

| Variable | Default | Purpose |
| --- | --- | --- |
| `FORJ_APP` | `app` | Select the active App for source-mode commands. Prefer `forj <app> <command>` in normal workflows. |
| `FORJ_MAKE_OPEN` | `auto` | Generated-file opening policy: `auto`, `always`, or `never`. |
| `FORJ_EDITOR` | Auto-detected | Editor command for generated files. Supports `{file}`, `{line}`, and `{location}` placeholders. |
| `FORJ_DEV_PLAIN` | Disabled | Use plain `forj dev` output instead of the interactive terminal UI. |
| `FORJ_DEBUG` | Disabled | Enable additional CLI and generated-console diagnostics. |
| `FORJ_DEV` | Disabled | Show developer and maintainer commands in CLI help. |
| `FORJ_RENDER_TIMINGS` | Disabled | Print render timing summaries. |
| `FORJ_RENDER_DEBUG_TIMINGS` | Disabled | Print detailed render timing diagnostics. |
| `FORJ_BUILD_PROFILE_LOG` | Empty | File path for compile profile records written by profiled builds. |

`FORJ_COMMAND_*`, `FORJ_SUBPROCESS`, `FORJ_NATIVE_COMMAND_NAMES`, `FORJ_MULTI_APP_HELP`, and `FORJ_BUILD_PROGRESS` are reserved process-handoff variables. Do not set them in App configuration.

See [Opening Generated Files](/developer-tools/editor-open) and [forj dev](/developer-tools/forj-dev).

## Generated Demo App

These controls exist only when the demo monitoring and Lighthouse benchmark surfaces are rendered.

| Variable | Default | Purpose |
| --- | --- | --- |
| `MONITOR_POLL_INTERVAL_SECONDS` | `30` | Demo monitor polling schedule interval. |
| `BENCHMARK_HTTP_URL` | `APP_URL`, then `http://localhost:3000` | Base URL for the Lighthouse HTTP benchmark. |
| `BENCHMARK_HTTP_PATH` | `/-/health` | Request path for the Lighthouse HTTP benchmark. |
| `BENCHMARK_QUEUE_PREFILL_COUNT` | `100000` | Queue jobs prepared for a benchmark run. |
| `BENCHMARK_QUEUE_DRAIN_TIMEOUT_MS` | Derived from run duration, bounded from 45 seconds to 3 minutes | Queue benchmark drain timeout in milliseconds. |

## Standalone Library Diagnostics

| Variable | Purpose |
| --- | --- |
| `HTTP_TRACE` | Enables `httpx` request and response dump output for clients created with `httpx.New()` when the variable is present. Treat output as sensitive. |

## Related Pages

- [Configuration](/getting-started/configuration)
- [Driver Selection](/data/driver-selection)
- [Generated Components](/core/generated-components)
- [Named Resources](/core/named-resources)
- [Production Hardening](/security/production-hardening)
