---
title: Atlas Debug Recipes
description: Evidence-first Atlas workflows for common GoForj debugging tasks.
---

# Atlas Debug Recipes

Use these recipes when an agent or a human needs to debug a GoForj project without guessing ports, editing generated files, or jumping straight into code changes.

## Route not found

Atlas tools:

```text
application-info
runtime-snapshot app="app" runtime="http" path="/users"
debug-plan app="app" runtime="http" path="/users"
route-list app="app"
get-absolute-url app="app" path="/users"
```

GoForj commands:

```bash
forj route:list
forj build
```

Expected evidence:

- selected app is correct
- route appears in `route-list`
- absolute URL uses the reported local app URL
- no planned edit points at `wire_gen.go`

Validation:

- rerun `forj route:list`
- hit the URL reported by `get-absolute-url`

## API error

Atlas tools:

```text
runtime-snapshot app="app" runtime="http" path="/api/v1/users"
last-error
read-log-entries app="app" limit=50
database-connections
database-schema connection="default"
```

GoForj commands:

```bash
forj build
GOCACHE=/tmp/gocache GOMODCACHE=/tmp/gomodcache go test ./...
```

Expected evidence:

- latest error log points at the failing handler or service
- database connection and schema match the repository expectation
- controller remains thin and delegates to a service

Validation:

- focused Go test for the service or repository
- route/API smoke after `forj build`

## Browser console error

Atlas tools:

```text
runtime-snapshot app="app" runtime="http" path="/dashboard"
browser-logs app="app" limit=50
get-absolute-url app="app" path="/dashboard"
resource-inventory
generated-file-policy path="cmd/app/frontend/src/App.vue"
```

GoForj commands:

```bash
forj build
```

Expected evidence:

- browser logs show the client-side failure
- frontend file is app-owned
- resource inventory shows the local app URL

Validation:

- reload the URL from `get-absolute-url`
- confirm browser logs no longer show the error

## Wire failure

Atlas tools:

```text
wire-diagnostics output="<forj build output>"
registration-points app="app"
generated-file-policy path="app/wire/wire_gen.go"
docs-section-pack workflow_id="goforj-wire-repair"
```

GoForj commands:

```bash
forj build
GOCACHE=/tmp/gocache GOMODCACHE=/tmp/gomodcache go test ./...
```

Expected evidence:

- diagnostic identifies missing or duplicate provider shape
- fix belongs in an `inject_*_app.go` provider set
- `wire_gen.go` is generated and not editable

Validation:

- `forj build` regenerates Wire output
- Go tests pass

## Job not running

Atlas tools:

```text
workflow-plan task="debug reports job not running"
resource-inventory
read-log-entries app="app" limit=50
last-error
```

GoForj commands:

```bash
forj worker
forj build
```

Expected evidence:

- queue resource is visible in `resource-inventory`
- worker runtime logs show startup or job failure
- job handler delegates to a service and uses a small typed payload

Validation:

- worker starts cleanly
- test covers the job handler or delegated service

## Schedule not firing

Atlas tools:

```text
schedule-list app="app"
runtime-snapshot app="app" runtime="scheduler"
read-log-entries app="app" limit=50
```

GoForj commands:

```bash
forj scheduler
forj build
```

Expected evidence:

- schedule appears in `schedule-list`
- scheduler runtime starts
- long-running or retryable work is dispatched to a job, not performed inline

Validation:

- scheduler startup logs are clean
- schedule registration remains in app-owned composition files

## Migration mismatch

Atlas tools:

```text
database-connections
database-schema connection="default"
generated-file-policy path="migrations/app/default/001_change.sql"
workflow-plan task="add repository and migration"
```

GoForj commands:

```bash
forj make:migration <name>
forj build
GOCACHE=/tmp/gocache GOMODCACHE=/tmp/gomodcache go test ./...
```

Expected evidence:

- migration path is migration-owned
- schema inspection confirms the current table shape
- repository code matches the schema that actually exists

Validation:

- migration applies in the expected environment
- repository/service tests pass

## Named-app confusion

Atlas tools:

```text
application-info
workflow-plan app="marketplace" task="add checkout route"
registration-points app="marketplace"
generated-file-policy path="app/marketplace/routes.go"
generated-file-policy path="app/routes.go"
```

GoForj commands:

```bash
forj marketplace make:controller checkout
forj marketplace route:list
forj marketplace build
```

Expected evidence:

- selected app is `marketplace`
- registration points live under `app/marketplace`
- default app files are not part of the planned edit

Validation:

- `forj marketplace route:list`
- `forj marketplace build`
