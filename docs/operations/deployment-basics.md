---
title: Deployment Basics
description: Deploy a GoForj App as a supervised, observable production process.
---

# Deployment Basics

A GoForj App deploys as a compiled binary. Build it once, provide its configuration through the process environment, and let a service manager own its lifecycle. The binary is the production command surface; `forj` is the development and generation surface.

This guide uses one Linux host and systemd because it makes process ownership, signals, restarts, and logs explicit. The same binary and commands work in a container or another supervisor.

## Process Model

Choose the topology before creating units:

| Topology | Command | Use when |
| --- | --- | --- |
| Combined | `./bin/app` or `./bin/app run` | One small deployment unit owns HTTP, workers, and schedules. |
| HTTP | `./bin/app api` | HTTP needs independent scaling or restart policy. |
| Workers | `./bin/app worker` | Queued work needs independent capacity or resource limits. |
| Scheduler | `./bin/app scheduler` | Recurring work needs singleton control. |

A runtime-capable App selects `run` when the bare binary is launched. It starts its enabled runtimes together and cancels sibling runtimes if one fails. Split commands start only their named runtime. Changing commands does not make in-memory drivers shared between processes; use cross-process drivers for infrastructure that HTTP and workers must share.

For a staff operations App named `admin`, replace `app` with its name, for example `./bin/admin api`.

## Build an Artifact

Build from the Project root in CI or on a trusted build host:

```bash
forj build
test -x ./bin/app
```

Expected result: `./bin/app` exists and is executable. `forj build` refreshes generated components, runs Wire, indexes APIs, and builds the App binary.

Copy the resulting binary to a versioned release directory. Keep the previous release directory until the new release has passed readiness and a smoke check. For example, the active process can run `/opt/example/releases/2026-07-27/bin/app`; switching the service to a previous release is then a binary rollback rather than a rebuild during an incident.

## Configuration and Secrets

Give the service account a non-secret, readable release directory and a root-owned environment file readable only by that account. Do not bake production values into the binary or commit them with the Project.

An environment file contains ordinary `KEY=value` entries, for example:

```text
APP_ENV=production
APP_URL=https://api.example.com
API_HTTP_HOST=127.0.0.1
API_HTTP_PORT=3000
APP_SHUTDOWN_TIMEOUT=30s
QUEUE_SHUTDOWN_TIMEOUT=30s
HTTP_ACCESS_LOG_ENABLED=true
APP_DIAG_TOKEN=<diagnostic-token-from-your-secret-store>
```

`API_HTTP_HOST` and `API_HTTP_PORT` control the HTTP listener. Bind to `127.0.0.1` when a reverse proxy is on the same host; bind to `0.0.0.0` only when the network policy is intentional. `APP_DIAG_TOKEN` authorizes detailed readiness output, so keep it in the secret delivery mechanism and do not send it to public probes.

Add the driver configuration required by the rendered App (database, queue, cache, storage, events, and Lighthouse if enabled). Required infrastructure should make startup or readiness fail visibly; do not substitute empty credentials or silently switch production to a local driver.

## Run as a Non-Root Service

Create a dedicated, unprivileged account such as `example`. The App does not need root to listen on port 3000, and a reverse proxy can expose ports 80/443.

For a combined deployment, create `/etc/systemd/system/example.service`:

```ini
[Unit]
Description=Example GoForj App
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=example
Group=example
WorkingDirectory=/opt/example/current
EnvironmentFile=/etc/example/app.env
ExecStart=/opt/example/current/bin/app
Restart=on-failure
RestartSec=5
TimeoutStopSec=65
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

`TimeoutStopSec` must exceed the total graceful-stop path, not only one setting: use at least `APP_SHUTDOWN_TIMEOUT + QUEUE_SHUTDOWN_TIMEOUT + margin`. With both values set to `30s`, `65s` leaves a five-second margin. The App handles `SIGINT` and `SIGTERM`; workers wait for active jobs within `QUEUE_SHUTDOWN_TIMEOUT`, and the scheduler and HTTP runtime shut down within their configured budgets.

Load and start the unit:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now example.service
sudo systemctl status example.service
```

Expected result: systemd reports `active (running)`. Read its logs with:

```bash
sudo journalctl -u example.service -f
```

Expected startup logs include the HTTP server address, a route-count summary, and start markers for enabled worker or scheduler runtimes. They should not contain credentials or a full route dump.

For split topology, make separate units with the same account and environment file, changing only `ExecStart`:

```ini
ExecStart=/opt/example/current/bin/app api
```

```ini
ExecStart=/opt/example/current/bin/app worker
```

```ini
ExecStart=/opt/example/current/bin/app scheduler
```

Run one scheduler unit unless schedules are explicitly designed with cross-process locking. HTTP and worker units can be independently replicated or resource-limited; application services and job handlers must not depend on whether they run combined or split.

## Migrations and Backups

Take and verify a recovery point before a schema-changing deployment. Run migrations through a systemd one-shot unit so it inherits the same release directory, service account, and environment file as the runtime:

```ini
# /etc/systemd/system/example-migrate.service
[Unit]
Description=Example GoForj migrations
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=example
Group=example
WorkingDirectory=/opt/example/current
EnvironmentFile=/etc/example/app.env
ExecStart=/opt/example/current/bin/app migrate
```

After creating or changing a unit, run `sudo systemctl daemon-reload`, then start it with `sudo systemctl start example-migrate.service`. Expected result: the unit exits successfully before the new runtime is started. Do not put migrations in every HTTP process startup: concurrent replicas can race, and a failed migration should stop the rollout before traffic changes.

Use the framework backup workflow where it supports the selected resources:

```ini
# /etc/systemd/system/example-backup-create.service
[Unit]
Description=Create an Example GoForj backup
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=example
Group=example
WorkingDirectory=/opt/example/current
EnvironmentFile=/etc/example/app.env
ExecStart=/usr/local/bin/forj backup:create
```

This example assumes the framework CLI is installed at `/usr/local/bin/forj`; use its actual absolute path. Run it with `sudo systemctl start example-backup-create.service`; use an equivalent dedicated oneshot unit for backup verification. Expected result: the selected backup verifies before it becomes the recovery point. See [Backup and Restore](/operations/backups) for supported resource strategies and restore safeguards.

Use an instance unit to verify a specific backup set with the same environment:

```ini
# /etc/systemd/system/example-backup-verify@.service
[Unit]
Description=Verify Example GoForj backup %i

[Service]
Type=oneshot
User=example
Group=example
WorkingDirectory=/opt/example/current
EnvironmentFile=/etc/example/app.env
ExecStart=/usr/local/bin/forj backup:verify --from /opt/example/current/.goforj/backups/%i
```

After creating a backup, pass its directory name as the instance:

```bash
sudo systemctl start example-backup-verify@backup-20260728T120000Z.service
```

Expected result: the verification unit exits successfully before that backup becomes the recovery point.

## Verify the Release

After systemd starts the new process, prove liveness, readiness, routes, and metrics from the appropriate network location:

```bash
curl --fail http://127.0.0.1:3000/-/health
./bin/app health http://127.0.0.1:3000 --probe ready --fail
./bin/app route:list
curl --fail http://127.0.0.1:10000/metrics
```

Expected outcomes:

- Health returns HTTP 200 and `{"status":"ok"}`.
- Readiness exits zero only when required configured dependencies pass their checks; it exits non-zero with `--fail` otherwise.
- `route:list` prints the complete route table without starting the HTTP listener.
- The metrics request returns Prometheus text when the metrics component and endpoint are enabled for that runtime.

Use a probe that does not carry `APP_DIAG_TOKEN` for load-balancer readiness. Run the App `health` command from a restricted operator context when detailed resource failures are needed; it sends the token for readiness when configured.

## Rollout and Rollback

For a single host, a safe release sequence is:

1. Build and stage a new release without replacing the running binary.
2. Check backup freshness and run the migration command if the release needs it.
3. Point `/opt/example/current` at the staged release, then restart the relevant unit or units.
4. Run the verification commands above and watch logs, error rates, queue depth, and readiness.
5. If verification fails, point `current` back to the previous release and restart the affected units.

A binary rollback does not reverse a database migration. Before an incompatible schema change, plan its rollback independently: prefer additive, backward-compatible migrations until the old binaries are no longer serving traffic, or restore only through a tested recovery procedure.

For multiple HTTP replicas, remove one instance from traffic, update and verify it, then continue. Keep scheduler ownership singular during the rollout. Drain or stop workers deliberately when a job-handler change is incompatible with already-enqueued payloads.

## Troubleshooting

| Symptom | Where it appears | Operator action |
| --- | --- | --- |
| Unit restarts immediately | `systemctl status` and journal | Run the exact `ExecStart` as the service account; correct missing configuration or an invalid driver dependency. |
| `/-/health` is 200 but `/-/ready` is 503 | readiness response and server log | Treat the process as alive but not eligible for traffic; inspect the authorized readiness report and repair the failed required resource. |
| Service does not stop before systemd timeout | journal shows worker or scheduler shutdown | Increase the relevant App timeout only when the work has a bounded completion path; otherwise make jobs resumable and retry-safe. |
| Worker jobs are not processed | worker logs, metrics, and Inspects when those components are enabled | Confirm a `worker` or combined runtime is supervised, the intended queue is selected, and the shared queue driver is reachable. |
| Two scheduled runs overlap | scheduler logs, metrics, or Inspects when enabled | Stop accidental duplicate scheduler units; use a shared locker when intentional multi-process scheduling needs non-overlap. |
| Metrics endpoint cannot bind | service log | Assign distinct runtime metrics ports in split topology, or disable the conflicting endpoint according to the rendered App configuration. |

## Production Checklist

### Build and Configuration

- Run `forj build`, verify every expected app binary, and confirm the build refreshed generated app-specific resources.
- Confirm `.goforj.yml`, each additional app under `apps`, and every `*_SUPPORTED_DRIVERS` value describe the intended production components and drivers.
- Deploy a versioned binary under a non-root account.
- Keep secrets outside the artifact, and set `APP_ENV` and `APP_DEBUG` to production-safe values.

### Runtime Ownership

- Choose combined or split ownership deliberately, supervise each required runtime with an explicit command, and use the app-specific binary for each additional app.
- Keep the scheduler singleton unless schedules use deliberate cross-process locking.
- Set App, queue, and scheduler shutdown budgets below the supervisor timeout, then prove each process starts and stops cleanly.

### Data and Recovery

- Run migrations intentionally and, in a multi-App Project, identify the App that owns each migration stream.
- Verify database readiness, storage permissions, and the rule that cache is not source-of-truth storage.
- Run `forj backup:plan`, confirm every discovered database and storage strategy, and verify a recent backup.
- Test restore in an isolated environment, and automate backup creation, verification, retention, and freshness monitoring.

### Observability

- Verify health, readiness, metrics scrape targets, and `APP_DIAG_TOKEN` handling.
- Confirm logs and enabled metrics, Inspects, and Lighthouse preserve App identity without exposing secrets or adding high-cardinality labels.
- Enable Lighthouse only in environments where its access and retention are appropriate.

### Async Work

- Confirm job handlers are registered and workers use the intended queue driver.
- Verify retry, idempotency, queue shutdown, and event-driver behavior for the selected process topology.

### Release Smoke Check

- Run the release smoke tests and inspect `route:list`.
- Exercise one health probe and one readiness probe, inspect metrics output, and confirm the expected queue and scheduler behavior.

## Next Steps

- [Runtime Processes](/operations/runtime-processes)
- [Health and Readiness](/operations/health-readiness)
- [Logging](/operations/logging)
- [Backup and Restore](/operations/backups)
