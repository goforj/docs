---
title: Queue
description: "Queued work, workers, retries, workflows, and pluggable backend drivers."
repoSlug: queue
repoUrl: https://github.com/goforj/queue
noAutoTitle: true
---

<p align="center">
  <img src="https://raw.githubusercontent.com/goforj/queue/main/docs/images/logo.png?v=1" width="300" alt="queue logo">
</p>

<p align="center">
    queue is a queue and workflow library with pluggable backends and runtime extensions.
</p>

<p align="center">
    <a href="https://pkg.go.dev/github.com/goforj/queue"><img src="https://pkg.go.dev/badge/github.com/goforj/queue.svg" alt="Go Reference"></a>
    <a href="https://github.com/goforj/queue/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
    <a href="https://github.com/goforj/queue/actions"><img src="https://github.com/goforj/queue/actions/workflows/test.yml/badge.svg" alt="Go Test"></a>
    <a href="https://golang.org"><img src="https://img.shields.io/badge/go-1.24.4+-blue?logo=go" alt="Go version"></a>
    <img src="https://img.shields.io/github/v/tag/goforj/queue?label=version&sort=semver" alt="Latest tag">
    <a href="https://codecov.io/gh/goforj/queue"><img src="https://codecov.io/gh/goforj/queue/graph/badge.svg?token=40Z5UQATME"/></a>
<!-- test-count:embed:start -->
    <img src="https://img.shields.io/badge/unit_tests-895-brightgreen" alt="Unit tests (executed count)">
    <img src="https://img.shields.io/badge/integration_tests-618-blue" alt="Integration tests (executed count)">
<!-- test-count:embed:end -->
</p>

## Installation {#installation}

```bash
go get github.com/goforj/queue
```

Existing deployments upgrading to application-type direct delivery must replace workers before switching producers. Follow the [direct delivery migration guide](https://github.com/goforj/queue/blob/main/docs/direct-delivery-migration.md), including its SQL schema step and backend-specific rollback constraints.

Applications upgrading from the retired `bus` or `queuefake` packages should follow the [legacy API migration guide](https://github.com/goforj/queue/blob/main/docs/legacy-api-migration.md). The removed Temporal compatibility adapter has no root-package replacement.

The root queue module and non-PostgreSQL driver modules require Go 1.24.4 or newer. The PostgreSQL driver requires Go 1.25 or newer so it can use pgx 5.9.2, the first release containing the [GO-2026-5004 security fix](https://pkg.go.dev/vuln/GO-2026-5004).

## Quick Start {#quick-start}

```go
import (
	"context"
	"fmt"

	"github.com/goforj/queue"
)

func main() {
	q, _ := queue.NewWorkerpool(
		queue.WithWorkers(2), // optional; default: runtime.NumCPU() (min 1)
	)
	type EmailPayload struct {
		To string `json:"to"`
	}

	q.Register("emails:send", func(ctx context.Context, m queue.Message) error {
		var payload EmailPayload
		_ = m.Bind(&payload)
		fmt.Println("send to", payload.To)
		return nil
	})

	_ = q.StartWorkers(context.Background())
	defer q.Shutdown(context.Background())

	_, _ = q.Dispatch(
		queue.NewJob("emails:send").
			Payload(EmailPayload{To: "user@example.com"}),
	)
}
```

## Drivers {#drivers}

Each driver is thoroughly tested against the shared test suite using [testcontainers](https://testcontainers.com/) or emulators where appropriate.

| Driver / Backend | Mode | Notes | Durable | Async | Delay | Unique | Backoff | Timeout | Native Stats | Queue Admin |
| ---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| <img src="https://img.shields.io/badge/null-%23666?style=flat" alt="Null"> | Drop-only | Discards dispatched jobs; useful for disabled queue modes and smoke tests. | - | - | - | Instance | - | - | - | - |
| <img src="https://img.shields.io/badge/sync-%23999999?logo=gnometerminal&logoColor=white" alt="Sync"> | Inline (caller) | Deterministic local execution with no external infra. | - | - | - | Instance | - | ✓ | - | - |
| <img src="https://img.shields.io/badge/workerpool-%23696969?logo=clockify&logoColor=white" alt="Workerpool"> | In-process pool | Local async behavior without external broker/database. | - | ✓ | ✓ | Instance | ✓ | ✓ | - | - |
| <img src="https://img.shields.io/badge/mysql-%234479A1?logo=mysql&logoColor=white" alt="MySQL"> | SQL durable queue | MySQL driver module (`driver/mysqlqueue`) built on shared SQL queue core. | ✓ | ✓ | ✓ | Backend | ✓ | ✓ | ✓ | - |
| <img src="https://img.shields.io/badge/postgres-%23336791?logo=postgresql&logoColor=white" alt="Postgres"> | SQL durable queue | Postgres driver module (`driver/postgresqueue`) built on shared SQL queue core. | ✓ | ✓ | ✓ | Backend | ✓ | ✓ | ✓ | - |
| <img src="https://img.shields.io/badge/sqlite-%23003B57?logo=sqlite&logoColor=white" alt="SQLite"> | SQL durable queue | SQLite driver module (`driver/sqlitequeue`) built on shared SQL queue core. | ✓ | ✓ | ✓ | Backend | ✓ | ✓ | ✓ | - |
| <img src="https://img.shields.io/badge/redis-%23DC382D?logo=redis&logoColor=white" alt="Redis"> | Redis/Asynq | Production Redis backend (Asynq semantics). | ✓ | ✓ | ✓ | Backend | - | ✓ | ✓ | ✓ |
| <img src="https://img.shields.io/badge/nats-%23007ACC?style=flat" alt="NATS"> | Ephemeral broker | Core NATS subject routing; every plain subscription can receive a broadcast copy. | - | ✓ | ✓ | Instance | ✓ | ✓ | - | - |
| <img src="https://img.shields.io/badge/sqs-%23FF9900?style=flat" alt="SQS"> | Broker target | AWS SQS transport with endpoint overrides for localstack/testing. | - | ✓ | ✓ | Instance | ✓ | ✓ | - | - |
| <img src="https://img.shields.io/badge/rabbitmq-%23FF6600?logo=rabbitmq&logoColor=white" alt="RabbitMQ"> | Broker target | RabbitMQ transport and worker consumption. | - | ✓ | ✓ | Instance | ✓ | ✓ | - | - |

> SQL-backed queues (`sqlite`, `mysql`, `postgres`) are durable and convenient, but they trade throughput for operational simplicity. They default to `1` worker, and increasing concurrency may require DB tuning (indexes, connection pool, lock contention). Prefer broker-backed drivers for higher-throughput workloads.
>
> **Unique scope:** `Instance` suppresses duplicates only within one queue runtime instance; `Backend` shares claims through the configured database or Redis service. Identity is the effective queue, logical application job type, and canonical serialized payload. Absent, zero-byte, and exact JSON `null` payloads share one absence identity; generated workflow IDs and delivery options do not change it. See [`docs/backend-guarantees.md`](https://github.com/goforj/queue/blob/main/docs/backend-guarantees.md) for acceptance, rollout, and failure-boundary details.
>
> **Queue Admin status:** the cross-driver admin contract is defined in core (`ListJobs`, `RetryJob`, `CancelJob`, `DeleteJob`, `ClearQueue`, `QueueHistory`), but **full queue admin operations are currently implemented only for Redis**. Other drivers return `ErrQueueAdminUnsupported` for unsupported admin actions.

### Driver constructor quick examples {#driver-constructor-quick-examples}

Use root constructors for in-process backends, and driver-module constructors for external backends. See the `Driver Constructors` API section below for full constructor shapes (`New(...)` and `NewWithConfig(...)`).
Driver backends live in separate packages so applications only import/link the optional backend dependencies they actually use (smaller builds, less dependency overhead, cleaner deploys).

```go
package main

import (
	"github.com/goforj/queue"
	"github.com/goforj/queue/driver/mysqlqueue"
	"github.com/goforj/queue/driver/natsqueue"
	"github.com/goforj/queue/driver/postgresqueue"
	"github.com/goforj/queue/driver/rabbitmqqueue"
	"github.com/goforj/queue/driver/redisqueue"
	"github.com/goforj/queue/driver/sqlitequeue"
	"github.com/goforj/queue/driver/sqsqueue"
)

func main() {
	queue.NewSync()       // in-process sync
	queue.NewWorkerpool() // in-process worker pool
	queue.NewNull()       // drop-only / disabled mode

	sqlitequeue.New("file:queue.db?_busy_timeout=5000") // SQL durable queue (SQLite)
	mysqlqueue.New("user:pass@tcp(127.0.0.1:3306)/app") // SQL durable queue (MySQL)
	postgresqueue.New("postgres://user:pass@127.0.0.1:5432/app?sslmode=disable") // SQL durable queue (Postgres)

	redisqueue.New("127.0.0.1:6379") // Redis/Asynq
	natsqueue.New("nats://127.0.0.1:4222") // NATS
	sqsqueue.New("us-east-1") // SQS
	rabbitmqqueue.New("amqp://guest:guest@127.0.0.1:5672/") // RabbitMQ
}
```

## Quick Start (Advanced: Workflows) {#quick-start-(advanced:-workflows)}

```go
import (
	"context"

	"github.com/goforj/queue"
)

type EmailPayload struct {
	ID int `json:"id"`
}

func main() {
	q, _ := queue.NewWorkerpool()

	q.Register("reports:generate", func(ctx context.Context, m queue.Message) error {
		return nil
	})
	q.Register("reports:upload", func(ctx context.Context, m queue.Message) error {
		var payload EmailPayload
		if err := m.Bind(&payload); err != nil {
			return err
		}
		return nil
	})
	q.Register("users:notify_report_ready", func(ctx context.Context, m queue.Message) error {
		return nil
	})

	_ = q.StartWorkers(context.Background())
	defer q.Shutdown(context.Background())

	chainID, _ := q.Chain(
		// 1) generate report data
		queue.NewJob("reports:generate").Payload(map[string]any{"report_id": "rpt_123"}),
		// 2) upload report artifact after generate succeeds
		queue.NewJob("reports:upload").Payload(EmailPayload{ID: 123}),
		// 3) notify user only after upload succeeds
		queue.NewJob("users:notify_report_ready").Payload(map[string]any{"user_id": 123}),
	).OnQueue("critical").Dispatch(context.Background())
	_ = chainID
}
```

## Run as a Worker Service {#run-as-a-worker-service}

Use `Run(ctx)` for long-lived workers: it starts processing, waits for shutdown signals, and performs graceful termination.

```go
import (
	"context"
	"log"
	"os/signal"
	"syscall"

	"github.com/goforj/queue"
)

func main() {
	q, _ := queue.NewWorkerpool()

	// Register handlers before starting workers.
	q.Register("emails:send", func(ctx context.Context, m queue.Message) error {
		return nil
	})

	// Create a context that is canceled on SIGINT/SIGTERM (Ctrl+C, container stop).
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// Run starts workers, blocks until ctx is canceled, then gracefully shuts down.
	if err := q.Run(ctx); err != nil {
		log.Fatal(err)
	}
}
```

## Core Concepts {#core-concepts}

**Job**: Typed work unit for app handlers.

```go
_, _ = q.Dispatch(
	queue.NewJob("emails:send").Payload(EmailPayload{To: "user@example.com"}),
)
```

**Chain**: Ordered workflow (A then B then C).

```go
_, _ = q.Chain(
	queue.NewJob("reports:generate"),
	queue.NewJob("reports:upload"),
	queue.NewJob("users:notify_report_ready"),
).Dispatch(context.Background())
```

**Batch**: Parallel workflow with callbacks.

```go
_, _ = q.Batch(
	queue.NewJob("emails:send"),
	queue.NewJob("sms:send"),
).Then(func(context.Context, queue.BatchState) error {
	return nil
}).Dispatch(context.Background())
```

**Middleware**: Cross-cutting execution policy.

```go
q, _ := queue.New(
	queue.Config{Driver: queue.DriverWorkerpool},
	queue.WithMiddleware(audit, skipMaintenance, fatalValidation),
)
```

**Events**: Lifecycle hooks and observability.

```go
q, _ := queue.New(
	queue.Config{Driver: queue.DriverWorkerpool},
	queue.WithObserver(queue.NewStatsCollector()),
)
```

**Backends**: Driver/runtime transport selection.

```go
q, _ := queue.NewWorkerpool()
rq, _ := redisqueue.New("127.0.0.1:6379")
_, _ = q, rq
```


## Job builder options {#job-builder-options}

```go
// Define a struct for your job payload.
type EmailPayload struct {
	ID int `json:"id"`
	To string `json:"to"`
}

// Fluent builder pattern for job options.
job := queue.NewJob("emails:send").
	// Payload can be bytes, structs, maps, or JSON-marshalable values.
	// Default payload is empty.
	Payload(EmailPayload{ID: 123, To: "user@example.com"}).
	// OnQueue sets the queue name.
	// Default is empty; broker-style drivers expect an explicit queue.
	OnQueue("default").
	// Timeout sets per-job execution timeout.
	// Default is unset; some drivers may apply driver/runtime defaults.
	Timeout(20 * time.Second).
	// Retry sets max retries.
	// Default is 0, which means one total attempt.
	Retry(3).
	// Backoff sets retry delay.
	// Default is unset; Redis dispatch returns ErrBackoffUnsupported.
	Backoff(500 * time.Millisecond).
	// Delay schedules first execution in the future.
	// Default is 0 (run immediately).
	Delay(2 * time.Second).
	// UniqueFor deduplicates Type+Payload for a TTL window.
	// Default is 0 (no dedupe).
	UniqueFor(45 * time.Second)

// Dispatch the job to the queue.
_, _ = q.Dispatch(job)

// In handlers, use Bind to decode payload into a struct.
q.Register("emails:send", func(ctx context.Context, m queue.Message) error {
	var payload EmailPayload
	if err := m.Bind(&payload); err != nil {
		return err
	}
	return nil
})
```


## Benchmarks {#benchmarks}

Run local + integration-backed benchmarks (requires Docker/testcontainers):

```bash
cd docs && GOWORK=off INTEGRATION_BACKEND=all GOCACHE=/tmp/queue-gocache go test -tags=benchrender ./bench -run '^TestRenderBenchmarks$'
```

<!-- bench:embed:start -->

### Latency (ns/op) {#latency-(ns/op)}

![Queue benchmark latency chart](https://raw.githubusercontent.com/goforj/queue/main/docs/bench/benchmarks_ns.svg)

### Throughput (ops/s) {#throughput-(ops/s)}

![Queue benchmark throughput chart](https://raw.githubusercontent.com/goforj/queue/main/docs/bench/benchmarks_ops.svg)

### Allocated Bytes (B/op) {#allocated-bytes-(b/op)}

![Queue benchmark bytes chart](https://raw.githubusercontent.com/goforj/queue/main/docs/bench/benchmarks_bytes.svg)

### Allocations (allocs/op) {#allocations-(allocs/op)}

![Queue benchmark allocations chart](https://raw.githubusercontent.com/goforj/queue/main/docs/bench/benchmarks_allocs.svg)

### Tables {#tables}

| Class | Driver | ns/op | ops/s | B/op | allocs/op |
|:------|:------|-----:|-----:|-----:|---------:|
| External | nats | 774 | 1291823 | 1258 | 13 |
| External | redis | 95295 | 10494 | 2113 | 33 |
| External | rabbitmq | 165780 | 6032 | 1882 | 57 |
| External | sqlite | 202380 | 4941 | 1931 | 47 |
| External | postgres | 1056731 | 946 | 3809 | 78 |
| External | sqs | 1873911 | 534 | 94784 | 1082 |
| External | mysql | 2286406 | 437 | 3303 | 62 |
| Local | null | 37 | 26673780 | 128 | 1 |
| Local | sync | 282 | 3539823 | 408 | 6 |
| Local | workerpool | 650 | 1538462 | 456 | 7 |

<!-- bench:embed:end -->

## Middleware {#middleware}

Use `queue.WithMiddleware(...)` to apply cross-cutting workflow behavior to workflow job execution (logging, filtering, and error policy).

Common patterns:
- wrap handler execution (before/after logging, timing, tracing)
- skip jobs conditionally (maintenance mode, feature flags)
- convert matched errors into terminal failures (no retry)

```go
var errValidation = errors.New("validation failed")
maintenanceMode := false

audit := queue.MiddlewareFunc(func(ctx context.Context, m queue.Message, next queue.Next) error {
	log.Printf("start job=%s", m.JobType)
	err := next(ctx, m)
	log.Printf("done job=%s err=%v", m.JobType, err)
	return err
})

skipMaintenance := queue.SkipWhen{
	Predicate: func(context.Context, queue.Message) bool {
		return maintenanceMode
	},
}

fatalValidation := queue.FailOnError{
	When: func(err error) bool {
		return errors.Is(err, errValidation)
	},
}

q, _ := queue.New(
	queue.Config{Driver: queue.DriverWorkerpool},
	queue.WithMiddleware(audit, skipMaintenance, fatalValidation),
)
_ = q
```


## Observability {#observability}

Use `queue.Observer` implementations to capture normalized runtime events across drivers.

```go
collector := queue.NewStatsCollector()
observer := queue.MultiObserver(
    collector,
    queue.ObserverFunc(func(_ context.Context, event queue.Event) {
        _ = event.Kind
    }),
)

q, _ := queue.New(
    queue.Config{Driver: queue.DriverWorkerpool},
    queue.WithObserver(observer),
)
_ = q
```

### Distributed counters and source of truth {#distributed-counters-and-source-of-truth}

- `StatsCollector` counters are process-local and event-driven.
- In multi-process deployments, aggregate metrics externally (OTel/Prometheus/etc.).
- Prefer backend-native stats when available.
- `queue.SupportsNativeStats(q)` indicates native driver snapshot support.
- `queue.Snapshot(ctx, q, collector)` merges native + collector where possible.

### Compose observers {#compose-observers}

```go
events := make(chan queue.Event, 100)
collector := queue.NewStatsCollector()
observer := queue.MultiObserver(
    collector,
    queue.ChannelObserver{
        Events:     events,
        DropIfFull: true,
    },
    queue.ObserverFunc(func(_ context.Context, e queue.Event) {
        _ = e
    }),
)

q, _ := queue.New(
    queue.Config{Driver: queue.DriverWorkerpool},
    queue.WithObserver(observer),
)
_ = q
```

### Kitchen sink event logging {#kitchen-sink-event-logging}

Runnable example: `examples/observeall/main.go`

```go
logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
observer := queue.ObserverFunc(func(ctx context.Context, event queue.Event) {
	logger.InfoContext(ctx, "queue event",
		"layer", event.Layer,
		"kind", event.Kind,
		"driver", event.Driver,
		"queue", event.Queue,
		"dispatch_id", event.DispatchID,
		"job_id", event.JobID,
		"chain_id", event.ChainID,
		"batch_id", event.BatchID,
		"job_type", event.JobType,
		"attempt", event.Attempt,
		"max_retry", event.MaxRetry,
		"duration", event.Duration,
		"err", event.Err,
	)
})

q, _ := queue.New(
	queue.Config{Driver: queue.DriverSync},
	queue.WithObserver(observer),
)
_ = q
```

### Events reference {#events-reference}

| Layer | EventKind | Meaning |
| ---: | --- | --- |
| **queue** | dispatch_started | After job validation, the root facade began a public dispatch. |
| **queue** | dispatch_succeeded | The backend accepted the public dispatch; synchronous execution may still return an application error. |
| **queue** | dispatch_failed | Public dispatch ended before backend acceptance. |
| **queue** | enqueue_accepted | The driver confirmed enqueue acceptance. |
| **queue** | enqueue_rejected | The driver rejected enqueue with an error. |
| **queue** | enqueue_duplicate | Uniqueness policy rejected the logical job as a duplicate. |
| **queue** | enqueue_canceled | Context cancellation or deadline expiry prevented enqueue. |
| **worker** | process_started | A physical handler attempt began. |
| **worker** | process_succeeded | Handler success crossed the driver's settlement boundary; runtimes without a settlement hook emit after handler return. |
| **worker** | process_failed | A handler attempt returned an error or panicked. |
| **worker** | process_retried | A numbered application retry attempt began; infrastructure redelivery may repeat the fact. |
| **worker** | process_archived | A SQL driver confirmed its fenced transition to terminal `dead` state; other built-in runtimes omit it. |
| **worker** | process_recovered | SQL bulk recovery requeued one stale in-flight claim; identity fields are unavailable at that boundary. |
| **worker** | republish_failed | An internal delay or retry replacement could not be published. |
| **worker** | settlement_failed | Delivery finalization, acknowledgement, deletion, or negative settlement failed or was ambiguous; redelivery remains possible. |
| **queue** | queue_paused | A supporting driver confirmed queue consumption was paused. |
| **queue** | queue_resumed | A supporting driver confirmed queue consumption was resumed. |
| **workflow** | job_started | A logical execution attempt began before handler lookup. |
| **workflow** | job_succeeded | Logical job success committed; settlement-aware drivers publish the fact only after settlement. |
| **workflow** | job_failed | A logical job reached permanent or exhausted failure. |
| **workflow** | chain_started | A chain record was created and initial dispatch began. |
| **workflow** | chain_advanced | A committed node outcome advanced the chain to its next node. |
| **workflow** | chain_completed | The final chain node committed terminal success. |
| **workflow** | chain_failed | A chain committed terminal failure. |
| **workflow** | batch_started | A batch record was created and initial member dispatch began. |
| **workflow** | batch_progressed | A batch member committed a terminal outcome. |
| **workflow** | batch_completed | Batch reached terminal success (or allowed-failure completion). |
| **workflow** | batch_failed | A non-allowed member failure or initial member dispatch rejection committed terminal batch failure. |
| **workflow** | batch_cancelled | Remaining batch work was cancelled after terminal failure. |
| **workflow** | callback_started | A claimed terminal Catch, Then, or Finally callback began execution. |
| **workflow** | callback_succeeded | Terminal callback success crossed the applicable settlement boundary. |
| **workflow** | callback_failed | A terminal callback was invalid or unavailable, returned an error, or panicked. |

Handler panics now emit `process_failed` before the original panic value is rethrown. This adds truthful failure telemetry without changing backend panic recovery or retry behavior.

Callback lifecycle facts cover terminal Catch, Then, and Finally callbacks. Inline `Batch.Progress` closures do not emit `callback_*` facts.

## Examples {#examples}

Runnable examples live in the separate `examples` module ([`./examples`](https://github.com/goforj/queue/tree/main/examples)).
They are not included when applications import `github.com/goforj/queue`, which keeps dependency graphs and build/link overhead smaller.

## Admin Support {#admin-support}

Queue admin APIs are part of the core contract so additional drivers can implement them over time.
At this time, full admin operations (`ListJobs`, `RetryJob`, `CancelJob`, `DeleteJob`, `ClearQueue`) are Redis-only.
Use `queue.SupportsQueueAdmin(q)` (or handle `queue.ErrQueueAdminUnsupported`) to gate admin workflows per runtime.

## API reference {#api-reference}

The API section below is autogenerated; do not edit between the markers.

<!-- api:embed:start -->

## API Index {#api-index}

| Group | Functions |
|------:|:-----------|
| **Admin** | [CancelJob](#queue-canceljob) · [Queue.CancelJob](#queue-queue-canceljob) · [ClearQueue](#queue-clearqueue) · [Queue.ClearQueue](#queue-queue-clearqueue) · [DeleteJob](#queue-deletejob) · [Queue.DeleteJob](#queue-queue-deletejob) · [History](#queue-queue-history) · [ListJobs](#queue-listjobs) · [Queue.ListJobs](#queue-queue-listjobs) · [Normalize](#queue-listjobsoptions-normalize) · [QueueHistory](#queue-queuehistory) · [RetryJob](#queue-retryjob) · [Queue.RetryJob](#queue-queue-retryjob) · [SinglePointHistory](#queue-singlepointhistory) · [SupportsQueueAdmin](#queue-supportsqueueadmin) · [TimelineHistoryFromSnapshot](#queue-timelinehistoryfromsnapshot) |
| **Constructors** | [New](#queue-new) · [NewMemoryStore](#queue-newmemorystore) · [NewMessage](#queue-newmessage) · [NewNull](#queue-newnull) · [NewSQLStore](#queue-newsqlstore) · [NewSQLStoreWithManagedSchema](#queue-newsqlstorewithmanagedschema) · [NewStatsCollector](#queue-newstatscollector) · [NewSync](#queue-newsync) · [NewWorkerpool](#queue-newworkerpool) |
| **Job** | [Backoff](#queue-job-backoff) · [Bind](#queue-job-bind) · [Delay](#queue-job-delay) · [NewJob](#queue-newjob) · [OnQueue](#queue-job-onqueue) · [Payload](#queue-job-payload) · [PayloadBytes](#queue-job-payloadbytes) · [PayloadJSON](#queue-job-payloadjson) · [Retry](#queue-job-retry) · [Timeout](#queue-job-timeout) · [UniqueFor](#queue-job-uniquefor) |
| **Observability** | [Active](#queue-statssnapshot-active) · [Archived](#queue-statssnapshot-archived) · [Failed](#queue-statssnapshot-failed) · [MultiObserver](#queue-multiobserver) · [ChannelObserver.Observe](#queue-channelobserver-observe) · [Observer.Observe](#queue-observer-observe) · [ObserverFunc.Observe](#queue-observerfunc-observe) · [StatsCollector.Observe](#queue-statscollector-observe) · [Pause](#queue-pause) · [Paused](#queue-statssnapshot-paused) · [Pending](#queue-statssnapshot-pending) · [Processed](#queue-statssnapshot-processed) · [Queue](#queue-statssnapshot-queue) · [Queues](#queue-statssnapshot-queues) · [Ready](#queue-ready) · [Resume](#queue-resume) · [RetryCount](#queue-statssnapshot-retrycount) · [SafeObserve](#queue-safeobserve) · [Scheduled](#queue-statssnapshot-scheduled) · [Snapshot](#queue-snapshot) · [StatsCollector.Snapshot](#queue-statscollector-snapshot) · [SupportsNativeStats](#queue-supportsnativestats) · [SupportsPause](#queue-supportspause) · [Throughput](#queue-statssnapshot-throughput) |
| **Other** | [Acquire](#queue-locker-acquire) · [AdvanceChain](#queue-workflowstore-advancechain) · [Allow](#queue-ratelimiter-allow) · [AllowFailures](#queue-batchbuilder-allowfailures) · [CancelBatch](#queue-workflowstore-cancelbatch) · [BatchBuilder.Catch](#queue-batchbuilder-catch) · [ChainBuilder.Catch](#queue-chainbuilder-catch) · [CreateBatch](#queue-workflowstore-createbatch) · [CreateChain](#queue-workflowstore-createchain) · [BatchBuilder.Dispatch](#queue-batchbuilder-dispatch) · [ChainBuilder.Dispatch](#queue-chainbuilder-dispatch) · [FailChain](#queue-workflowstore-failchain) · [FailChainNode](#queue-workflowoutcomestore-failchainnode) · [BatchBuilder.Finally](#queue-batchbuilder-finally) · [ChainBuilder.Finally](#queue-chainbuilder-finally) · [GetBatch](#queue-workflowstore-getbatch) · [GetChain](#queue-workflowstore-getchain) · [FailOnError.Handle](#queue-failonerror-handle) · [Middleware.Handle](#queue-middleware-handle) · [MiddlewareFunc.Handle](#queue-middlewarefunc-handle) · [RateLimit.Handle](#queue-ratelimit-handle) · [RetryPolicy.Handle](#queue-retrypolicy-handle) · [SkipWhen.Handle](#queue-skipwhen-handle) · [WithoutOverlapping.Handle](#queue-withoutoverlapping-handle) · [MarkBatchJobFailed](#queue-workflowstore-markbatchjobfailed) · [MarkBatchJobStarted](#queue-workflowstore-markbatchjobstarted) · [MarkBatchJobSucceeded](#queue-workflowstore-markbatchjobsucceeded) · [MarkCallbackInvoked](#queue-workflowstore-markcallbackinvoked) · [Name](#queue-batchbuilder-name) · [BatchBuilder.OnQueue](#queue-batchbuilder-onqueue) · [ChainBuilder.OnQueue](#queue-chainbuilder-onqueue) · [PhysicalQueueName](#queue-physicalqueuename) · [PhysicalQueueWeights](#queue-physicalqueueweights) · [Progress](#queue-batchbuilder-progress) · [Prune](#queue-workflowstore-prune) · [Release](#queue-lock-release) · [ResolveObservedJobType](#queue-resolveobservedjobtype) · [SettleBatchJob](#queue-workflowoutcomestore-settlebatchjob) · [Then](#queue-batchbuilder-then) |
| **Queue** | [Batch](#queue-queue-batch) · [Bind](#queue-message-bind) · [Chain](#queue-queue-chain) · [Dispatch](#queue-queue-dispatch) · [Driver](#queue-queue-driver) · [FindBatch](#queue-queue-findbatch) · [FindChain](#queue-queue-findchain) · [IsPermanent](#queue-ispermanent) · [Pause](#queue-queue-pause) · [PayloadBytes](#queue-message-payloadbytes) · [Permanent](#queue-permanent) · [Prune](#queue-queue-prune) · [Ready](#queue-queue-ready) · [Register](#queue-queue-register) · [Resume](#queue-queue-resume) · [Run](#queue-queue-run) · [Shutdown](#queue-queue-shutdown) · [StartWorkers](#queue-queue-startworkers) · [Stats](#queue-queue-stats) · [WithClock](#queue-withclock) · [WithContext](#queue-queue-withcontext) · [WithHandlerContextDecorator](#queue-withhandlercontextdecorator) · [WithLegacyDirectEnvelope](#queue-withlegacydirectenvelope) · [WithMiddleware](#queue-withmiddleware) · [WithObserver](#queue-withobserver) · [WithStore](#queue-withstore) · [WithWorkers](#queue-withworkers) · [Queue.WithWorkers](#queue-queue-withworkers) |
| **Driver Constructors** | [mysqlqueue.New](#mysqlqueue-new) · [mysqlqueue.NewWithConfig](#mysqlqueue-newwithconfig) · [natsqueue.New](#natsqueue-new) · [natsqueue.NewWithConfig](#natsqueue-newwithconfig) · [postgresqueue.New](#postgresqueue-new) · [postgresqueue.NewWithConfig](#postgresqueue-newwithconfig) · [rabbitmqqueue.New](#rabbitmqqueue-new) · [rabbitmqqueue.NewWithConfig](#rabbitmqqueue-newwithconfig) · [redisqueue.New](#redisqueue-new) · [redisqueue.NewWithConfig](#redisqueue-newwithconfig) · [sqlitequeue.New](#sqlitequeue-new) · [sqlitequeue.NewWithConfig](#sqlitequeue-newwithconfig) · [sqsqueue.New](#sqsqueue-new) · [sqsqueue.NewWithConfig](#sqsqueue-newwithconfig) |
| **Testing** | [AssertBatchCount](#queue-fakequeue-assertbatchcount) · [AssertBatched](#queue-fakequeue-assertbatched) · [AssertChained](#queue-fakequeue-assertchained) · [AssertCount](#queue-fakequeue-assertcount) · [AssertDispatched](#queue-fakequeue-assertdispatched) · [AssertDispatchedOn](#queue-fakequeue-assertdispatchedon) · [AssertDispatchedTimes](#queue-fakequeue-assertdispatchedtimes) · [AssertNotDispatched](#queue-fakequeue-assertnotdispatched) · [AssertNothingBatched](#queue-fakequeue-assertnothingbatched) · [AssertNothingDispatched](#queue-fakequeue-assertnothingdispatched) · [Batch](#queue-fakequeue-batch) · [BatchRecords](#queue-fakequeue-batchrecords) · [Chain](#queue-fakequeue-chain) · [ChainRecords](#queue-fakequeue-chainrecords) · [Dispatch](#queue-fakequeue-dispatch) · [Driver](#queue-fakequeue-driver) · [FindBatch](#queue-fakequeue-findbatch) · [FindChain](#queue-fakequeue-findchain) · [NewFake](#queue-newfake) · [Prune](#queue-fakequeue-prune) · [Ready](#queue-fakequeue-ready) · [Records](#queue-fakequeue-records) · [Register](#queue-fakequeue-register) · [Reset](#queue-fakequeue-reset) · [Shutdown](#queue-fakequeue-shutdown) · [StartWorkers](#queue-fakequeue-startworkers) · [WithContext](#queue-fakequeue-withcontext) · [Workers](#queue-fakequeue-workers) |



## API {#api}

#### Admin {#admin}

#### CancelJob {#queue-canceljob}

CancelJob cancels a job when supported.

```go
q, err := redisqueue.New("127.0.0.1:6379")
if err != nil {
	return
}
err = queue.CancelJob(context.Background(), q, "job-id")
_ = err
```

#### Queue.CancelJob {#queue-queue-canceljob}

CancelJob cancels a job via queue admin capability when supported.

```go
q, err := redisqueue.New("127.0.0.1:6379")
if err != nil {
	return
}
if !queue.SupportsQueueAdmin(q) {
	return
}
err = q.CancelJob(context.Background(), "job-id")
_ = err
```

#### ClearQueue {#queue-clearqueue}

ClearQueue clears queue jobs when supported.

```go
q, err := redisqueue.New("127.0.0.1:6379")
if err != nil {
	return
}
err = queue.ClearQueue(context.Background(), q, "default")
_ = err
```

#### Queue.ClearQueue {#queue-queue-clearqueue}

ClearQueue clears queue jobs via queue admin capability when supported.

```go
q, err := redisqueue.New("127.0.0.1:6379")
if err != nil {
	return
}
if !queue.SupportsQueueAdmin(q) {
	return
}
err = q.ClearQueue(context.Background(), "default")
_ = err
```

#### DeleteJob {#queue-deletejob}

DeleteJob deletes a job when supported.

```go
q, err := redisqueue.New("127.0.0.1:6379")
if err != nil {
	return
}
err = queue.DeleteJob(context.Background(), q, "default", "job-id")
_ = err
```

#### Queue.DeleteJob {#queue-queue-deletejob}

DeleteJob deletes a job via queue admin capability when supported.

```go
q, err := redisqueue.New("127.0.0.1:6379")
if err != nil {
	return
}
if !queue.SupportsQueueAdmin(q) {
	return
}
err = q.DeleteJob(context.Background(), "default", "job-id")
_ = err
```

#### History {#queue-queue-history}

History returns queue history points via queue admin capability when supported.

```go
q, err := redisqueue.New("127.0.0.1:6379")
if err != nil {
	return
}
points, err := q.History(context.Background(), "default", queue.QueueHistoryHour)
_ = err
```

#### ListJobs {#queue-listjobs}

ListJobs lists jobs for a queue and state when supported.

```go
q, err := redisqueue.New("127.0.0.1:6379")
if err != nil {
	return
}
_, err = queue.ListJobs(context.Background(), q, queue.ListJobsOptions{
	Queue: "default",
	State: queue.JobStatePending,
})
_ = err
```

#### Queue.ListJobs {#queue-queue-listjobs}

ListJobs lists jobs via queue admin capability when supported.

```go
q, err := redisqueue.New("127.0.0.1:6379")
if err != nil {
	return
}
_, err = q.ListJobs(context.Background(), queue.ListJobsOptions{
	Queue: "default",
	State: queue.JobStatePending,
})
_ = err
```

#### Normalize {#queue-listjobsoptions-normalize}

Normalize returns a safe options payload with defaults applied.

```go
opts := queue.ListJobsOptions{Queue: "", State: "", Page: 0, PageSize: 1000}
normalized := opts.Normalize()
fmt.Println(normalized.Queue, normalized.State, normalized.Page, normalized.PageSize)
// Output: default pending 1 500
```

#### QueueHistory {#queue-queuehistory}

QueueHistory returns queue history points when supported.

```go
q, err := redisqueue.New("127.0.0.1:6379")
if err != nil {
	return
}
_, err = queue.QueueHistory(context.Background(), q, "default", queue.QueueHistoryHour)
_ = err
```

#### RetryJob {#queue-retryjob}

RetryJob retries (runs now) a job when supported.

```go
q, err := redisqueue.New("127.0.0.1:6379")
if err != nil {
	return
}
err = queue.RetryJob(context.Background(), q, "default", "job-id")
_ = err
```

#### Queue.RetryJob {#queue-queue-retryjob}

RetryJob retries (runs now) a job via queue admin capability when supported.

```go
q, err := redisqueue.New("127.0.0.1:6379")
if err != nil {
	return
}
if !queue.SupportsQueueAdmin(q) {
	return
}
err = q.RetryJob(context.Background(), "default", "job-id")
_ = err
```

#### SinglePointHistory {#queue-singlepointhistory}

SinglePointHistory converts a snapshot into a single current-history point.
This helper is intended for driver modules that do not expose historical buckets.

```go
snapshot := queue.StatsSnapshot{
	ByQueue: map[string]queue.QueueCounters{
		"default": {Processed: 12, Failed: 1},
	},
}
points := queue.SinglePointHistory(snapshot, "default")
fmt.Println(len(points), points[0].Processed, points[0].Failed)
// Output: 1 12 1
```

#### SupportsQueueAdmin {#queue-supportsqueueadmin}

SupportsQueueAdmin reports whether queue admin operations are available.

```go
q, err := redisqueue.New("127.0.0.1:6379")
if err != nil {
	return
}
fmt.Println(queue.SupportsQueueAdmin(q))
// Output: true
```

#### TimelineHistoryFromSnapshot {#queue-timelinehistoryfromsnapshot}

TimelineHistoryFromSnapshot records queue counters and returns windowed points.
This is intended for drivers that don't expose native multi-point history.

```go
snapshot := queue.StatsSnapshot{
	ByQueue: map[string]queue.QueueCounters{
		"default": {Processed: 5, Failed: 1},
	},
}
points := queue.TimelineHistoryFromSnapshot(snapshot, "default", queue.QueueHistoryHour)
fmt.Println(len(points) >= 1)
// Output: true
```

#### Constructors {#constructors}

#### queue.New {#queue-new}

New creates the high-level Queue API based on Config.Driver.

```go
q, err := queue.New(queue.Config{Driver: queue.DriverWorkerpool})
if err != nil {
	return
}
type EmailPayload struct {
	ID int `json:"id"`
}
q.Register("emails:send", func(ctx context.Context, m queue.Message) error {
	var payload EmailPayload
	if err := m.Bind(&payload); err != nil {
		return err
	}
	_ = payload
	return nil
})
_ = q.WithWorkers(1).StartWorkers(context.Background()) // optional; default: runtime.NumCPU() (min 1)
defer q.Shutdown(context.Background())
_, _ = q.Dispatch(
	queue.NewJob("emails:send").
		Payload(EmailPayload{ID: 1}).
		OnQueue("default"),
)
```

#### NewMemoryStore {#queue-newmemorystore}

NewMemoryStore creates an in-memory workflow state store. It copies chain
nodes and payload bytes on creation and return so callers retain independent ownership.

#### NewMessage {#queue-newmessage}

NewMessage creates a logical queue message from an application job type and exact payload bytes.
The payload is copied so callers can safely reuse or mutate their input buffer.

#### NewNull {#queue-newnull}

NewNull creates a Queue on the null backend.

```go
q, err := queue.NewNull()
if err != nil {
	return
}
```

#### NewSQLStore {#queue-newsqlstore}

NewSQLStore creates a SQL-backed workflow state store.

#### NewSQLStoreWithManagedSchema {#queue-newsqlstorewithmanagedschema}

NewSQLStoreWithManagedSchema creates a SQL-backed workflow state store
without executing schema DDL. The supplied database must already contain the
dialect-correct workflow tables, including transition receipts.

#### NewStatsCollector {#queue-newstatscollector}

NewStatsCollector creates an event collector for queue counters.

```go
collector := queue.NewStatsCollector()
```

#### NewSync {#queue-newsync}

NewSync creates a Queue on the synchronous in-process backend.

```go
q, err := queue.NewSync()
if err != nil {
	return
}
```

#### NewWorkerpool {#queue-newworkerpool}

NewWorkerpool creates a Queue on the in-process workerpool backend.

```go
q, err := queue.NewWorkerpool()
if err != nil {
	return
}
```

#### Job {#job}

#### Backoff {#queue-job-backoff}

Backoff sets delay between retries.

```go
job := queue.NewJob("emails:send").Backoff(500 * time.Millisecond)
```

#### Job.Bind {#queue-job-bind}

Bind unmarshals job payload JSON into dst.

```go
type EmailPayload struct {
	ID int    `json:"id"`
	To string `json:"to"`
}
job := queue.NewJob("emails:send").Payload(EmailPayload{
	ID: 1,
	To: "user@example.com",
})
var payload EmailPayload
if err := job.Bind(&payload); err != nil {
	return
}
_ = payload.To
```

#### Delay {#queue-job-delay}

Delay defers execution by duration.

```go
job := queue.NewJob("emails:send").Delay(300 * time.Millisecond)
```

#### NewJob {#queue-newjob}

NewJob creates a job value with a required job type.

```go
job := queue.NewJob("emails:send")
```

#### Job.OnQueue {#queue-job-onqueue}

OnQueue sets the target queue name.

```go
job := queue.NewJob("emails:send").OnQueue("critical")
```

#### Payload {#queue-job-payload}

Payload sets job payload from common value types.

_Example: payload bytes_

```go
jobBytes := queue.NewJob("emails:send").Payload([]byte(`{"id":1}`))
```

_Example: payload struct_

```go
type Meta struct {
	Nested bool `json:"nested"`
}
type EmailPayload struct {
	ID   int    `json:"id"`
	To   string `json:"to"`
	Meta Meta   `json:"meta"`
}
jobStruct := queue.NewJob("emails:send").Payload(EmailPayload{
	ID:   1,
	To:   "user@example.com",
	Meta: Meta{Nested: true},
})
```

_Example: payload map_

```go
jobMap := queue.NewJob("emails:send").Payload(map[string]any{
	"id":  1,
	"to":  "user@example.com",
	"meta": map[string]any{"nested": true},
})
```

#### Job.PayloadBytes {#queue-job-payloadbytes}

PayloadBytes returns a copy of job payload bytes.

```go
job := queue.NewJob("emails:send").Payload([]byte(`{"id":1}`))
payload := job.PayloadBytes()
```

#### PayloadJSON {#queue-job-payloadjson}

PayloadJSON marshals payload as JSON.

```go
job := queue.NewJob("emails:send").PayloadJSON(map[string]int{"id": 1})
```

#### Retry {#queue-job-retry}

Retry sets max retry attempts.

```go
job := queue.NewJob("emails:send").Retry(4)
```

#### Timeout {#queue-job-timeout}

Timeout sets per-job execution timeout.

```go
job := queue.NewJob("emails:send").Timeout(10 * time.Second)
```

#### UniqueFor {#queue-job-uniquefor}

UniqueFor enables uniqueness dedupe within the given TTL.

```go
job := queue.NewJob("emails:send").UniqueFor(45 * time.Second)
```

#### Observability {#observability-2}

#### Active {#queue-statssnapshot-active}

Active returns active count for a queue.

```go
snapshot := queue.StatsSnapshot{
	ByQueue: map[string]queue.QueueCounters{
		"default": {Active: 2},
	},
}
fmt.Println(snapshot.Active("default"))
// Output: 2
```

#### Archived {#queue-statssnapshot-archived}

Archived returns archived count for a queue.

```go
snapshot := queue.StatsSnapshot{
	ByQueue: map[string]queue.QueueCounters{
		"default": {Archived: 7},
	},
}
fmt.Println(snapshot.Archived("default"))
// Output: 7
```

#### Failed {#queue-statssnapshot-failed}

Failed returns failed count for a queue.

```go
snapshot := queue.StatsSnapshot{
	ByQueue: map[string]queue.QueueCounters{
		"default": {Failed: 2},
	},
}
fmt.Println(snapshot.Failed("default"))
// Output: 2
```

#### MultiObserver {#queue-multiobserver}

MultiObserver fans out events to multiple observers.

```go
events := make(chan queue.Event, 2)
observer := queue.MultiObserver(
	queue.ChannelObserver{Events: events},
	queue.ObserverFunc(func(context.Context, queue.Event) {}),
)
observer.Observe(context.Background(), queue.Event{Kind: queue.EventEnqueueAccepted})
fmt.Println(len(events))
// Output: 1
```

#### ChannelObserver.Observe {#queue-channelobserver-observe}

Observe forwards an event to the configured channel.

```go
ch := make(chan queue.Event, 1)
observer := queue.ChannelObserver{Events: ch}
observer.Observe(context.Background(), queue.Event{Kind: queue.EventProcessStarted, Queue: "default"})
event := <-ch
```

#### Observer.Observe {#queue-observer-observe}

Observe handles a queue runtime event.

```go
var observer queue.Observer
observer.Observe(context.Background(), queue.Event{
	Kind:   queue.EventEnqueueAccepted,
	Driver: queue.DriverSync,
	Queue:  "default",
})
```

#### ObserverFunc.Observe {#queue-observerfunc-observe}

Observe calls the wrapped function.

```go
logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
observer := queue.ObserverFunc(func(ctx context.Context, event queue.Event) {
	logger.Info("queue event",
		"kind", event.Kind,
		"driver", event.Driver,
		"queue", event.Queue,
		"job_type", event.JobType,
		"attempt", event.Attempt,
		"max_retry", event.MaxRetry,
		"duration", event.Duration,
		"err", event.Err,
	)
})
observer.Observe(context.Background(), queue.Event{
	Kind:     queue.EventProcessSucceeded,
	Driver:   queue.DriverSync,
	Queue:    "default",
	JobType: "emails:send",
})
```

#### StatsCollector.Observe {#queue-statscollector-observe}

Observe records an event and updates normalized counters.

```go
collector := queue.NewStatsCollector()
collector.Observe(context.Background(), queue.Event{
	Kind:   queue.EventEnqueueAccepted,
	Driver: queue.DriverSync,
	Queue:  "default",
	Time:   time.Now(),
})
```

#### Pause {#queue-pause}

Pause pauses queue consumption for drivers that support it.

```go
q, _ := queue.NewSync()
_ = queue.Pause(context.Background(), q, "default")
snapshot, _ := queue.Snapshot(context.Background(), q, nil)
fmt.Println(snapshot.Paused("default"))
// Output: 1
```

#### Paused {#queue-statssnapshot-paused}

Paused returns the observed pause state for a queue as zero or one.

```go
collector := queue.NewStatsCollector()
collector.Observe(context.Background(), queue.Event{
	Kind:   queue.EventQueuePaused,
	Driver: queue.DriverSync,
	Queue:  "default",
	Time:   time.Now(),
})
snapshot := collector.Snapshot()
fmt.Println(snapshot.Paused("default"))
// Output: 1
```

#### Pending {#queue-statssnapshot-pending}

Pending returns pending count for a queue.

```go
snapshot := queue.StatsSnapshot{
	ByQueue: map[string]queue.QueueCounters{
		"default": {Pending: 3},
	},
}
fmt.Println(snapshot.Pending("default"))
// Output: 3
```

#### Processed {#queue-statssnapshot-processed}

Processed returns processed count for a queue.

```go
snapshot := queue.StatsSnapshot{
	ByQueue: map[string]queue.QueueCounters{
		"default": {Processed: 11},
	},
}
fmt.Println(snapshot.Processed("default"))
// Output: 11
```

#### Queue {#queue-statssnapshot-queue}

Queue returns queue counters for a queue name.

```go
collector := queue.NewStatsCollector()
collector.Observe(context.Background(), queue.Event{
	Kind:   queue.EventEnqueueAccepted,
	Driver: queue.DriverSync,
	Queue:  "default",
	Time:   time.Now(),
})
snapshot := collector.Snapshot()
counters, ok := snapshot.Queue("default")
fmt.Println(ok, counters.Pending)
// Output: true 1
```

#### Queues {#queue-statssnapshot-queues}

Queues returns sorted queue names present in the snapshot.

```go
collector := queue.NewStatsCollector()
collector.Observe(context.Background(), queue.Event{
	Kind:   queue.EventEnqueueAccepted,
	Driver: queue.DriverSync,
	Queue:  "critical",
	Time:   time.Now(),
})
snapshot := collector.Snapshot()
names := snapshot.Queues()
fmt.Println(len(names), names[0])
// Output: 1 critical
```

#### Ready {#queue-ready}

Ready validates backend readiness for the provided queue runtime.

```go
q, _ := queue.NewSync()
fmt.Println(queue.Ready(context.Background(), q) == nil)
// true
```

#### Resume {#queue-resume}

Resume resumes queue consumption for drivers that support it.

```go
q, _ := queue.NewSync()
_ = queue.Pause(context.Background(), q, "default")
_ = queue.Resume(context.Background(), q, "default")
snapshot, _ := queue.Snapshot(context.Background(), q, nil)
fmt.Println(snapshot.Paused("default"))
// Output: 0
```

#### RetryCount {#queue-statssnapshot-retrycount}

RetryCount returns retry count for a queue.

```go
snapshot := queue.StatsSnapshot{
	ByQueue: map[string]queue.QueueCounters{
		"default": {Retry: 1},
	},
}
fmt.Println(snapshot.RetryCount("default"))
// Output: 1
```

#### SafeObserve {#queue-safeobserve}

SafeObserve delivers an event to an observer and recovers observer panics.

This is an advanced helper intended for driver-module implementations.

#### Scheduled {#queue-statssnapshot-scheduled}

Scheduled returns scheduled count for a queue.

```go
snapshot := queue.StatsSnapshot{
	ByQueue: map[string]queue.QueueCounters{
		"default": {Scheduled: 4},
	},
}
fmt.Println(snapshot.Scheduled("default"))
// Output: 4
```

#### Snapshot {#queue-snapshot}

Snapshot returns driver-native stats, falling back to collector data.

```go
q, _ := queue.NewSync()
snapshot, _ := q.Stats(context.Background())
_, ok := snapshot.Queue("default")
fmt.Println(ok)
// Output: true
```

#### StatsCollector.Snapshot {#queue-statscollector-snapshot}

Snapshot returns a copy of collected counters.

```go
collector := queue.NewStatsCollector()
collector.Observe(context.Background(), queue.Event{
	Kind:   queue.EventEnqueueAccepted,
	Driver: queue.DriverSync,
	Queue:  "default",
	Time:   time.Now(),
})
collector.Observe(context.Background(), queue.Event{
	Kind:   queue.EventProcessStarted,
	Driver: queue.DriverSync,
	Queue:  "default",
	JobKey: "job-1",
	Time:   time.Now(),
})
collector.Observe(context.Background(), queue.Event{
	Kind:     queue.EventProcessSucceeded,
	Driver:   queue.DriverSync,
	Queue:    "default",
	JobKey:  "job-1",
	Duration: 12 * time.Millisecond,
	Time:     time.Now(),
})
snapshot := collector.Snapshot()
counters, _ := snapshot.Queue("default")
throughput, _ := snapshot.Throughput("default")
fmt.Printf("queues=%v\n", snapshot.Queues())
fmt.Printf("counters=%+v\n", counters)
fmt.Printf("hour=%+v\n", throughput.Hour)
// Output:
// queues=[default]
// counters={Pending:0 Active:0 Scheduled:0 Retry:0 Archived:0 Processed:1 Failed:0 Paused:0 AvgWait:0s AvgRun:12ms}
// hour={Processed:1 Failed:0}
```

#### SupportsNativeStats {#queue-supportsnativestats}

SupportsNativeStats reports whether a queue runtime exposes native stats snapshots.

```go
q, _ := queue.NewSync()
fmt.Println(queue.SupportsNativeStats(q))
// Output: true
```

#### SupportsPause {#queue-supportspause}

SupportsPause reports whether a queue runtime supports Pause/Resume.

```go
q, _ := queue.NewSync()
fmt.Println(queue.SupportsPause(q))
// Output: true
```

#### Throughput {#queue-statssnapshot-throughput}

Throughput returns rolling throughput windows for a queue name.

```go
collector := queue.NewStatsCollector()
collector.Observe(context.Background(), queue.Event{
	Kind:   queue.EventProcessSucceeded,
	Driver: queue.DriverSync,
	Queue:  "default",
	Time:   time.Now(),
})
snapshot := collector.Snapshot()
throughput, ok := snapshot.Throughput("default")
fmt.Printf("ok=%v hour=%+v day=%+v week=%+v\n", ok, throughput.Hour, throughput.Day, throughput.Week)
// Output: ok=true hour={Processed:1 Failed:0} day={Processed:1 Failed:0} week={Processed:1 Failed:0}
```

#### Other {#other}

#### Acquire {#queue-locker-acquire}

Acquire attempts to hold key for ttl.

#### AdvanceChain {#queue-workflowstore-advancechain}

AdvanceChain atomically claims completedNode and returns the current successor.
Repeating the same (chainID, completedNode) claim must not advance again.
When done is true, GetChain must immediately expose Completed or Failed state.

#### Allow {#queue-ratelimiter-allow}

Allow returns whether key may execute and any suggested retry delay.

#### AllowFailures {#queue-batchbuilder-allowfailures}

AllowFailures keeps remaining members active after a terminal member failure.

#### CancelBatch {#queue-workflowstore-cancelbatch}

CancelBatch commits aggregate batch cancellation.

#### BatchBuilder.Catch {#queue-batchbuilder-catch}

Catch registers the explicitly ephemeral batch failure callback.

#### ChainBuilder.Catch {#queue-chainbuilder-catch}

Catch registers the explicitly ephemeral chain failure callback.

#### CreateBatch {#queue-workflowstore-createbatch}

CreateBatch persists a newly accepted batch. BatchID and every JobID must
be non-empty, Jobs must contain at least one entry, and JobIDs must be unique.

#### CreateChain {#queue-workflowstore-createchain}

CreateChain persists a newly accepted chain. ChainID and every NodeID must
be non-empty, Nodes must contain at least one entry, and NodeIDs must be unique.

#### BatchBuilder.Dispatch {#queue-batchbuilder-dispatch}

Dispatch persists and starts the batch workflow.

#### ChainBuilder.Dispatch {#queue-chainbuilder-dispatch}

Dispatch persists and starts the chain workflow.

#### FailChain {#queue-workflowstore-failchain}

FailChain commits terminal failure without replacing completed state.

#### FailChainNode {#queue-workflowoutcomestore-failchainnode}

FailChainNode commits failure only while nodeID is the current unsettled node.
owned remains true on replay while that node's failure owns the chain.

#### BatchBuilder.Finally {#queue-batchbuilder-finally}

Finally registers the explicitly ephemeral batch terminal callback.

#### ChainBuilder.Finally {#queue-chainbuilder-finally}

Finally registers the explicitly ephemeral chain terminal callback.

#### GetBatch {#queue-workflowstore-getbatch}

GetBatch returns current batch state.

#### GetChain {#queue-workflowstore-getchain}

GetChain returns current chain state.

#### FailOnError.Handle {#queue-failonerror-handle}

Handle wraps matched errors as fatal errors to stop retries.

#### Middleware.Handle {#queue-middleware-handle}

Handle wraps the remaining middleware and handler chain.

#### MiddlewareFunc.Handle {#queue-middlewarefunc-handle}

Handle calls the wrapped middleware function.

#### RateLimit.Handle {#queue-ratelimit-handle}

Handle applies limiter checks before executing the next handler.

#### RetryPolicy.Handle {#queue-retrypolicy-handle}

Handle passes execution through without modification.

#### SkipWhen.Handle {#queue-skipwhen-handle}

Handle skips job execution when Predicate returns true.

#### WithoutOverlapping.Handle {#queue-withoutoverlapping-handle}

Handle acquires a lock and prevents concurrent overlap for the same key.

#### MarkBatchJobFailed {#queue-workflowstore-markbatchjobfailed}

MarkBatchJobFailed commits the first outcome for (batchID, jobID).
Duplicate outcomes must return current state without changing counters.

#### MarkBatchJobStarted {#queue-workflowstore-markbatchjobstarted}

MarkBatchJobStarted records that one batch member began execution.

#### MarkBatchJobSucceeded {#queue-workflowstore-markbatchjobsucceeded}

MarkBatchJobSucceeded commits the first outcome for (batchID, jobID).
Duplicate outcomes must return current state without changing counters.

#### MarkCallbackInvoked {#queue-workflowstore-markcallbackinvoked}

MarkCallbackInvoked atomically claims one callback idempotency key.

#### Name {#queue-batchbuilder-name}

Name assigns an application-facing label to the batch.

#### BatchBuilder.OnQueue {#queue-batchbuilder-onqueue}

OnQueue applies a default queue to batch jobs without an explicit target.

#### ChainBuilder.OnQueue {#queue-chainbuilder-onqueue}

OnQueue applies a default queue to chain jobs without an explicit target.

#### PhysicalQueueName {#queue-physicalqueuename}

PhysicalQueueName maps a logical queue name into the physical name used by the backing queue driver.

#### PhysicalQueueWeights {#queue-physicalqueueweights}

PhysicalQueueWeights maps logical weighted queue names into their physical backend names.

#### Progress {#queue-batchbuilder-progress}

Progress registers the explicitly ephemeral batch progress callback.

#### WorkflowStore.Prune {#queue-workflowstore-prune}

Prune removes terminal workflow state older than before.

#### Release {#queue-lock-release}

Release relinquishes the acquired lease.

#### ResolveObservedJobType {#queue-resolveobservedjobtype}

ResolveObservedJobType returns the effective application job type that should
be emitted to observers. External workers may process private workflow delivery
envelopes (for example, "bus:job") whose payload embeds the real application job
type. When possible, this helper unwraps that payload so dashboards and
metrics reflect the user-facing job type instead of the transport wrapper.

#### SettleBatchJob {#queue-workflowoutcomestore-settlebatchjob}

SettleBatchJob returns the first committed outcome for one batch member.
owned remains true on same-outcome replay and false when the opposite outcome won.
Ownership covers the outcome category; BatchState does not retain a per-member cause.

#### Then {#queue-batchbuilder-then}

Then registers the explicitly ephemeral batch success callback.

#### Queue {#queue}

#### Queue.Batch {#queue-queue-batch}

Batch creates a batch builder for fan-out workflow execution.

```go
q, err := queue.NewSync()
if err != nil {
	return
}
q.Register("emails:send", func(ctx context.Context, m queue.Message) error { return nil })
if err := q.StartWorkers(context.Background()); err != nil {
	return
}
defer q.Shutdown(context.Background())
_, _ = q.Batch(
	queue.NewJob("emails:send").Payload(map[string]any{"id": 1}),
	queue.NewJob("emails:send").Payload(map[string]any{"id": 2}),
).Name("send-emails").OnQueue("default").Dispatch(context.Background())
```

#### Message.Bind {#queue-message-bind}

Bind unmarshals the raw job payload into dst.

#### Queue.Chain {#queue-queue-chain}

Chain creates a chain builder for sequential workflow execution.

```go
q, err := queue.NewSync()
if err != nil {
	return
}
q.Register("first", func(ctx context.Context, m queue.Message) error { return nil })
q.Register("second", func(ctx context.Context, m queue.Message) error { return nil })
if err := q.StartWorkers(context.Background()); err != nil {
	return
}
defer q.Shutdown(context.Background())
_, _ = q.Chain(
	queue.NewJob("first"),
	queue.NewJob("second"),
).OnQueue("default").Dispatch(context.Background())
```

#### Queue.Dispatch {#queue-queue-dispatch}

Dispatch enqueues a high-level job using its application type and exact
payload bytes together with the queue's bound context.

```go
q, err := queue.NewSync()
if err != nil {
	return
}
q.Register("emails:send", func(ctx context.Context, m queue.Message) error { return nil })
if err := q.StartWorkers(context.Background()); err != nil {
	return
}
defer q.Shutdown(context.Background())
job := queue.NewJob("emails:send").Payload(map[string]any{"id": 1}).OnQueue("default")
_, _ = q.Dispatch(job)
```

#### Queue.Driver {#queue-queue-driver}

Driver reports the configured backend driver for the underlying queue runtime.

```go
q, err := queue.NewSync()
if err != nil {
	return
}
fmt.Println(q.Driver())
// Output: sync
```

#### Queue.FindBatch {#queue-queue-findbatch}

FindBatch returns current batch state by ID.

```go
q, err := queue.NewSync()
if err != nil {
	return
}
q.Register("emails:send", func(ctx context.Context, m queue.Message) error { return nil })
batchID, err := q.Batch(queue.NewJob("emails:send")).Dispatch(context.Background())
if err != nil {
	return
}
_, _ = q.FindBatch(context.Background(), batchID)
```

#### Queue.FindChain {#queue-queue-findchain}

FindChain returns current chain state by ID.

```go
q, err := queue.NewSync()
if err != nil {
	return
}
q.Register("first", func(ctx context.Context, m queue.Message) error { return nil })
chainID, err := q.Chain(queue.NewJob("first")).Dispatch(context.Background())
if err != nil {
	return
}
_, _ = q.FindChain(context.Background(), chainID)
```

#### IsPermanent {#queue-ispermanent}

IsPermanent reports whether an error requests terminal application settlement.

#### Queue.Pause {#queue-queue-pause}

Pause pauses consumption for a queue when supported by the underlying driver.
See the README "Queue Backends" table for Pause/Resume support and
docs/backend-guarantees.md (Capability Matrix) for broader backend differences.

```go
q, err := queue.NewSync()
if err != nil {
	return
}
if queue.SupportsPause(q) {
	_ = q.Pause(context.Background(), "default")
}
```

#### Message.PayloadBytes {#queue-message-payloadbytes}

PayloadBytes returns an isolated copy of the raw job payload.

#### Permanent {#queue-permanent}

Permanent marks an error as terminal so workers do not spend the remaining application retry budget on it.

#### Queue.Prune {#queue-queue-prune}

Prune deletes old workflow state records.

```go
q, err := queue.NewSync()
if err != nil {
	return
}
_ = q.Prune(context.Background(), time.Now().Add(-24*time.Hour))
```

#### Queue.Ready {#queue-queue-ready}

Ready validates queue backend readiness for dispatch/worker operation.

```go
q, err := queue.NewSync()
if err != nil {
	return
}
fmt.Println(q.Ready(context.Background()) == nil)
// true
```

#### Queue.Register {#queue-queue-register}

Register binds a handler for a high-level job type.

```go
q, err := queue.NewSync()
if err != nil {
	return
}
type EmailPayload struct {
	ID int `json:"id"`
}
q.Register("emails:send", func(ctx context.Context, m queue.Message) error {
	var payload EmailPayload
	if err := m.Bind(&payload); err != nil {
		return err
	}
	_ = payload
	return nil
})
```

#### Queue.Resume {#queue-queue-resume}

Resume resumes consumption for a queue when supported by the underlying driver.

```go
q, err := queue.NewSync()
if err != nil {
	return
}
if queue.SupportsPause(q) {
	_ = q.Resume(context.Background(), "default")
}
```

#### Run {#queue-queue-run}

Run starts worker processing, blocks until ctx is canceled, then gracefully shuts down.

```go
ctx, cancel := context.WithCancel(context.Background())
defer cancel()
q, err := queue.NewWorkerpool()
if err != nil {
	return
}
q.Register("emails:send", func(ctx context.Context, m queue.Message) error { return nil })
go func() {
	time.Sleep(100 * time.Millisecond)
	cancel()
}()
_ = q.Run(ctx)
```

#### Queue.Shutdown {#queue-queue-shutdown}

Shutdown drains workers and closes underlying resources.

```go
q, err := queue.NewWorkerpool()
if err != nil {
	return
}
_ = q.StartWorkers(context.Background())
_ = q.Shutdown(context.Background())
```

#### Queue.StartWorkers {#queue-queue-startworkers}

StartWorkers starts worker processing.

```go
q, err := queue.NewWorkerpool()
if err != nil {
	return
}
_ = q.StartWorkers(context.Background())
```

#### Stats {#queue-queue-stats}

Stats returns a normalized snapshot when supported by the underlying driver.

```go
q, err := queue.NewSync()
if err != nil {
	return
}
if queue.SupportsNativeStats(q) {
	_, _ = q.Stats(context.Background())
}
```

#### WithClock {#queue-withclock}

WithClock overrides the workflow runtime clock.

```go
q, err := queue.New(
	queue.Config{Driver: queue.DriverSync},
	queue.WithClock(func() time.Time { return time.Unix(0, 0) }),
)
if err != nil {
	return
}
```

#### Queue.WithContext {#queue-queue-withcontext}

WithContext returns a derived queue handle bound to ctx.

#### WithHandlerContextDecorator {#queue-withhandlercontextdecorator}

WithHandlerContextDecorator decorates queue handler execution context before
process lifecycle events and handler execution run.

```go
q, err := queue.New(
	queue.Config{Driver: queue.DriverSync},
	queue.WithHandlerContextDecorator(func(ctx context.Context) context.Context {
		return context.WithValue(ctx, "source", "jobs")
	}),
)
if err != nil {
	return
}
```

#### WithLegacyDirectEnvelope {#queue-withlegacydirectenvelope}

WithLegacyDirectEnvelope keeps ordinary dispatches on the version-one
`bus:job` wire route during a workers-first migration. Remove this option only
after every consumer can process canonical direct deliveries. See the
[direct delivery migration guide] for backend-specific rollout and rollback.

[direct delivery migration guide]: https://github.com/goforj/queue/blob/main/docs/direct-delivery-migration.md

#### WithMiddleware {#queue-withmiddleware}

WithMiddleware appends queue workflow middleware.

```go
mw := queue.MiddlewareFunc(func(ctx context.Context, m queue.Message, next queue.Next) error {
	return next(ctx, m)
})
q, err := queue.New(queue.Config{Driver: queue.DriverSync}, queue.WithMiddleware(mw))
if err != nil {
	return
}
```

#### WithObserver {#queue-withobserver}

WithObserver installs one observer for queue, worker, and workflow lifecycle events.

```go
observer := queue.ObserverFunc(func(_ context.Context, event queue.Event) {
	_ = event.Kind
})
q, err := queue.New(queue.Config{Driver: queue.DriverSync}, queue.WithObserver(observer))
if err != nil {
	return
}
```

#### WithStore {#queue-withstore}

WithStore overrides the workflow orchestration store.

```go
var store queue.WorkflowStore
q, err := queue.New(queue.Config{Driver: queue.DriverSync}, queue.WithStore(store))
if err != nil {
	return
}
```

#### WithWorkers {#queue-withworkers}

WithWorkers sets desired worker concurrency before StartWorkers.
It applies to high-level queue constructors (for example NewWorkerpool/New/NewSync).

```go
q, err := queue.NewWorkerpool(
	queue.WithWorkers(4), // optional; default: runtime.NumCPU() (min 1)
)
if err != nil {
	return
}
```

#### Queue.WithWorkers {#queue-queue-withworkers}

WithWorkers sets desired worker concurrency before StartWorkers.

```go
q, err := queue.NewWorkerpool()
if err != nil {
	return
}
q.WithWorkers(4) // optional; default: runtime.NumCPU() (min 1)
```


## Driver Constructors {#driver-constructors}

### mysqlqueue {#mysqlqueue}

#### mysqlqueue.New {#mysqlqueue-new}

New creates a high-level Queue using the MySQL SQL backend.

```go
q, err := mysqlqueue.New(
	"user:pass@tcp(127.0.0.1:3306)/queue?parseTime=true",
	queue.WithWorkers(4), // optional; default: 1 worker
)
if err != nil {
	return
}
```

#### mysqlqueue.NewWithConfig {#mysqlqueue-newwithconfig}

NewWithConfig creates a high-level Queue using an explicit MySQL SQL driver config.

```go
q, err := mysqlqueue.NewWithConfig(
	mysqlqueue.Config{
		DriverBaseConfig: queueconfig.DriverBaseConfig{
			DefaultQueue: "critical", // default if empty: "default"
			Observer:     nil,        // default: nil
		},
		DB: nil, // optional; provide *sql.DB instead of DSN
		DSN: "user:pass@tcp(127.0.0.1:3306)/queue?parseTime=true", // optional if DB is set
		DisableAutoMigrate: false, // set true when schema migrations are managed externally
		ProcessingRecoveryGrace:  2 * time.Second, // default if <=0: 2s
		ProcessingLeaseNoTimeout: 5 * time.Minute, // default if <=0: 5m
	},
	queue.WithWorkers(4), // optional; default: 1 worker
)
if err != nil {
	return
}
```


### natsqueue {#natsqueue}

#### natsqueue.New {#natsqueue-new}

New creates a high-level Queue using the NATS backend.

```go
q, err := natsqueue.New(
	"nats://127.0.0.1:4222",
	queue.WithWorkers(4), // optional; default: runtime.NumCPU() (min 1)
)
if err != nil {
	return
}
```

#### natsqueue.NewWithConfig {#natsqueue-newwithconfig}

NewWithConfig creates a high-level Queue using an explicit NATS driver config.

```go
q, err := natsqueue.NewWithConfig(
	natsqueue.Config{
		DriverBaseConfig: queueconfig.DriverBaseConfig{
			DefaultQueue: "critical", // default if empty: "default"
			Observer:     nil,        // default: nil
		},
		URL: "nats://127.0.0.1:4222", // required
	},
	queue.WithWorkers(4), // optional; default: runtime.NumCPU() (min 1)
)
if err != nil {
	return
}
```


### postgresqueue {#postgresqueue}

#### postgresqueue.New {#postgresqueue-new}

New creates a high-level Queue using the Postgres SQL backend.

```go
q, err := postgresqueue.New(
	"postgres://user:pass@127.0.0.1:5432/queue?sslmode=disable",
	queue.WithWorkers(4), // optional; default: 1 worker
)
if err != nil {
	return
}
```

#### postgresqueue.NewWithConfig {#postgresqueue-newwithconfig}

NewWithConfig creates a high-level Queue using an explicit Postgres SQL driver config.

```go
q, err := postgresqueue.NewWithConfig(
	postgresqueue.Config{
		DriverBaseConfig: queueconfig.DriverBaseConfig{
			DefaultQueue: "critical", // default if empty: "default"
			Observer:     nil,        // default: nil
		},
		DB: nil, // optional; provide *sql.DB instead of DSN
		DSN: "postgres://user:pass@127.0.0.1:5432/queue?sslmode=disable", // optional if DB is set
		DisableAutoMigrate: false, // set true when schema migrations are managed externally
		ProcessingRecoveryGrace:  2 * time.Second, // default if <=0: 2s
		ProcessingLeaseNoTimeout: 5 * time.Minute, // default if <=0: 5m
	},
	queue.WithWorkers(4), // optional; default: 1 worker
)
if err != nil {
	return
}
```


### rabbitmqqueue {#rabbitmqqueue}

#### rabbitmqqueue.New {#rabbitmqqueue-new}

New creates a high-level Queue using the RabbitMQ backend.

```go
q, err := rabbitmqqueue.New(
	"amqp://guest:guest@127.0.0.1:5672/",
	queue.WithWorkers(4), // optional; default: runtime.NumCPU() (min 1)
)
if err != nil {
	return
}
```

#### rabbitmqqueue.NewWithConfig {#rabbitmqqueue-newwithconfig}

NewWithConfig creates a high-level Queue using an explicit RabbitMQ driver config.

```go
q, err := rabbitmqqueue.NewWithConfig(
	rabbitmqqueue.Config{
		DriverBaseConfig: queueconfig.DriverBaseConfig{
			DefaultQueue: "critical", // default if empty: "default"
			Observer:     nil,        // default: nil
		},
		URL: "amqp://guest:guest@127.0.0.1:5672/", // required
	},
	queue.WithWorkers(4), // optional; default: runtime.NumCPU() (min 1)
)
if err != nil {
	return
}
```


### redisqueue {#redisqueue}

#### redisqueue.New {#redisqueue-new}

New creates a high-level Queue using the Redis backend.

```go
q, err := redisqueue.New(
	"127.0.0.1:6379",
	queue.WithWorkers(4), // optional; default: runtime.NumCPU() (min 1)
)
if err != nil {
	return
}
```

#### redisqueue.NewWithConfig {#redisqueue-newwithconfig}

NewWithConfig creates a high-level Queue using an explicit Redis driver config.

```go
q, err := redisqueue.NewWithConfig(
	redisqueue.Config{
		DriverBaseConfig: queueconfig.DriverBaseConfig{
			DefaultQueue: "critical", // default if empty: "default"
			Observer:     nil,        // default: nil
		},
		Addr: "127.0.0.1:6379", // required
		Password: "",           // optional; default empty
		DB: 0,                  // optional; default 0
		Logger: nil,            // optional; default backend logger
		ServerLogLevel: redisqueue.ServerLogLevelDefault, // optional
	},
	queue.WithWorkers(4), // optional; default: runtime.NumCPU() (min 1)
)
if err != nil {
	return
}
```


### sqlitequeue {#sqlitequeue}

#### sqlitequeue.New {#sqlitequeue-new}

New creates a high-level Queue using the SQLite SQL backend.

```go
q, err := sqlitequeue.New(
	"file:queue.db?_busy_timeout=5000",
	queue.WithWorkers(4), // optional; default: 1 worker
)
if err != nil {
	return
}
```

#### sqlitequeue.NewWithConfig {#sqlitequeue-newwithconfig}

NewWithConfig creates a high-level Queue using an explicit SQLite SQL driver config.

```go
q, err := sqlitequeue.NewWithConfig(
	sqlitequeue.Config{
		DriverBaseConfig: queueconfig.DriverBaseConfig{
			DefaultQueue: "critical", // default if empty: "default"
			Observer:     nil,        // default: nil
		},
		DB: nil, // optional; provide *sql.DB instead of DSN
		DSN: "file:queue.db?_busy_timeout=5000", // optional if DB is set
		DisableAutoMigrate: false, // set true when schema migrations are managed externally
		ProcessingRecoveryGrace:  2 * time.Second, // default if <=0: 2s
		ProcessingLeaseNoTimeout: 5 * time.Minute, // default if <=0: 5m
	},
	queue.WithWorkers(4), // optional; default: 1 worker
)
if err != nil {
	return
}
```


### sqsqueue {#sqsqueue}

#### sqsqueue.New {#sqsqueue-new}

New creates a high-level Queue using the SQS backend.

```go
q, err := sqsqueue.New(
	"us-east-1",
	queue.WithWorkers(4), // optional; default: runtime.NumCPU() (min 1)
)
if err != nil {
	return
}
```

#### sqsqueue.NewWithConfig {#sqsqueue-newwithconfig}

NewWithConfig creates a high-level Queue using an explicit SQS driver config.

```go
q, err := sqsqueue.NewWithConfig(
	sqsqueue.Config{
		DriverBaseConfig: queueconfig.DriverBaseConfig{
			DefaultQueue: "critical", // default if empty: "default"
			Observer:     nil,        // default: nil
		},
		Region: "us-east-1", // default if empty: "us-east-1"
		Endpoint: "",        // optional; set for LocalStack/custom endpoint
		AccessKey: "",       // optional; static credentials
		SecretKey: "",       // optional; static credentials
	},
	queue.WithWorkers(4), // optional; default: runtime.NumCPU() (min 1)
)
if err != nil {
	return
}
```


## Testing API {#testing-api}

`queue.NewFake` is a recording fake with its established `Dispatch(any) error` surface. Inject it where `*queue.FakeQueue` or that recording contract is accepted; it is not a drop-in `*queue.Queue`.

Examples in this section assume they are used inside tests and `t` is a `*testing.T` (or `testing.TB`).

#### FakeQueue.AssertBatchCount {#queue-fakequeue-assertbatchcount}

AssertBatchCount fails unless the accepted batch count equals expected.

```go
fake := queue.NewFake()
_, _ = fake.Batch(queue.NewJob("emails:send")).Dispatch(context.Background())
fake.AssertBatchCount(t, 1)
```

#### FakeQueue.AssertBatched {#queue-fakequeue-assertbatched}

AssertBatched fails unless an accepted canonical batch matches predicate.
The predicate runs outside the recorder lock so it may safely inspect the fake.

```go
fake := queue.NewFake()
_, _ = fake.Batch(queue.NewJob("emails:send")).Name("nightly").Dispatch(context.Background())
fake.AssertBatched(t, func(record queue.BatchRecord) bool { return record.Name == "nightly" })
```

#### FakeQueue.AssertChained {#queue-fakequeue-assertchained}

AssertChained fails unless an accepted chain has the expected ordered job types.

```go
fake := queue.NewFake()
_, _ = fake.Chain(
	queue.NewJob("reports:build"),
	queue.NewJob("reports:publish"),
).Dispatch(context.Background())
fake.AssertChained(t, []string{"reports:build", "reports:publish"})
```

#### FakeQueue.AssertCount {#queue-fakequeue-assertcount}

AssertCount fails when the direct dispatch count is not expected.

```go
fake := queue.NewFake()
_ = fake.Dispatch(queue.NewJob("emails:send"))
fake.AssertCount(t, 1)
```

#### FakeQueue.AssertDispatched {#queue-fakequeue-assertdispatched}

AssertDispatched fails when jobType was not dispatched.

```go
fake := queue.NewFake()
_ = fake.Dispatch(queue.NewJob("emails:send"))
fake.AssertDispatched(t, "emails:send")
```

#### FakeQueue.AssertDispatchedOn {#queue-fakequeue-assertdispatchedon}

AssertDispatchedOn fails when jobType was not dispatched on queueName.

```go
fake := queue.NewFake()
_ = fake.Dispatch(
	queue.NewJob("emails:send").
		OnQueue("critical"),
)
fake.AssertDispatchedOn(t, "critical", "emails:send")
```

#### FakeQueue.AssertDispatchedTimes {#queue-fakequeue-assertdispatchedtimes}

AssertDispatchedTimes fails when jobType dispatch count does not match expected.

```go
fake := queue.NewFake()
_ = fake.Dispatch(queue.NewJob("emails:send"))
_ = fake.Dispatch(queue.NewJob("emails:send"))
fake.AssertDispatchedTimes(t, "emails:send", 2)
```

#### FakeQueue.AssertNotDispatched {#queue-fakequeue-assertnotdispatched}

AssertNotDispatched fails when jobType was dispatched.

```go
fake := queue.NewFake()
_ = fake.Dispatch(queue.NewJob("emails:send"))
fake.AssertNotDispatched(t, "emails:cancel")
```

#### FakeQueue.AssertNothingBatched {#queue-fakequeue-assertnothingbatched}

AssertNothingBatched fails when any accepted batch was recorded.

#### FakeQueue.AssertNothingDispatched {#queue-fakequeue-assertnothingdispatched}

AssertNothingDispatched fails when any direct dispatch was recorded.

```go
fake := queue.NewFake()
fake.AssertNothingDispatched(t)
```

#### FakeQueue.Batch {#queue-fakequeue-batch}

Batch creates a fake batch backed by the production workflow builder and
records it only when Dispatch accepts all initial member deliveries. Fluent
function callbacks are accepted for compatibility but are not retained in
fake runtime state or executed.

#### FakeQueue.BatchRecords {#queue-fakequeue-batchrecords}

BatchRecords returns isolated creation records for accepted fake batches.

```go
fake := queue.NewFake()
_, _ = fake.Batch(
	queue.NewJob("emails:first"),
	queue.NewJob("emails:second"),
).Name("nightly").AllowFailures().Dispatch(context.Background())
record := fake.BatchRecords()[0]
fmt.Println(record.Name, len(record.Jobs), record.AllowFailed)
// Output: nightly 2 true
```

#### FakeQueue.Chain {#queue-fakequeue-chain}

Chain creates a fake chain backed by the production workflow builder and
records it only when Dispatch accepts its initial delivery. Fluent function
callbacks are accepted for compatibility but are not retained in fake runtime
state or executed.

#### FakeQueue.ChainRecords {#queue-fakequeue-chainrecords}

ChainRecords returns isolated creation records for accepted fake chains.

```go
fake := queue.NewFake()
_, _ = fake.Chain(
	queue.NewJob("reports:build"),
	queue.NewJob("reports:publish"),
).OnQueue("workflow").Dispatch(context.Background())
record := fake.ChainRecords()[0]
fmt.Println(len(record.Nodes), record.Queue)
// Output: 2 workflow
```

#### FakeQueue.Dispatch {#queue-fakequeue-dispatch}

Dispatch records a typed job payload in-memory using the fake default queue.

```go
fake := queue.NewFake()
err := fake.Dispatch(queue.NewJob("emails:send").OnQueue("default"))
```

#### FakeQueue.Driver {#queue-fakequeue-driver}

Driver returns the active queue driver.

```go
fake := queue.NewFake()
driver := fake.Driver()
```

#### FakeQueue.FindBatch {#queue-fakequeue-findbatch}

FindBatch returns workflow state created by the fake's production engine.

#### FakeQueue.FindChain {#queue-fakequeue-findchain}

FindChain returns workflow state created by the fake's production engine.

#### NewFake {#queue-newfake}

NewFake creates the canonical fake for direct and workflow tests.

```go
fake := queue.NewFake()
_ = fake.Dispatch(
	queue.NewJob("emails:send").
		Payload(map[string]any{"id": 1}).
		OnQueue("critical"),
)
records := fake.Records()
fmt.Println(len(records), records[0].Queue, records[0].Job.Type)
// Output: 1 critical emails:send
```

#### FakeQueue.Prune {#queue-fakequeue-prune}

Prune removes terminal workflow state while retaining fake dispatch records.

#### FakeQueue.Ready {#queue-fakequeue-ready}

Ready validates fake queue readiness.

```go
fake := queue.NewFake()
fmt.Println(fake.Ready(context.Background()) == nil)
// Output: true
```

#### FakeQueue.Records {#queue-fakequeue-records}

Records returns isolated records for accepted direct dispatches.
Chain and batch creation is available through ChainRecords and BatchRecords.

```go
fake := queue.NewFake()
_ = fake.Dispatch(queue.NewJob("emails:send").OnQueue("default"))
records := fake.Records()
fmt.Println(len(records), records[0].Job.Type)
// Output: 1 emails:send
```

#### FakeQueue.Register {#queue-fakequeue-register}

Register is a compatibility no-op because the recording fake never executes handlers.

```go
fake := queue.NewFake()
fake.Register("emails:send", func(context.Context, queue.Job) error { return nil })
```

#### FakeQueue.Reset {#queue-fakequeue-reset}

Reset clears direct dispatches and all workflow records through every fake view.

```go
fake := queue.NewFake()
_ = fake.Dispatch(queue.NewJob("emails:send").OnQueue("default"))
fmt.Println(len(fake.Records()))
fake.Reset()
fmt.Println(len(fake.Records()))
// Output:
// 1
// 0
```

#### FakeQueue.Shutdown {#queue-fakequeue-shutdown}

Shutdown is a compatibility no-op because the recording fake owns no worker resources.

```go
fake := queue.NewFake()
err := fake.Shutdown(context.Background())
```

#### FakeQueue.StartWorkers {#queue-fakequeue-startworkers}

StartWorkers is a compatibility no-op because the recording fake owns no workers.

```go
fake := queue.NewFake()
err := fake.StartWorkers(context.Background())
```

#### FakeQueue.WithContext {#queue-fakequeue-withcontext}

WithContext returns a derived fake queue handle bound to ctx.

#### FakeQueue.Workers {#queue-fakequeue-workers}

Workers preserves fluent lifecycle compatibility without creating workers.

```go
fake := queue.NewFake()
q := fake.Workers(4)
fmt.Println(q != nil)
// Output: true
```
<!-- api:embed:end -->

## Contributing {#contributing}

### Testing {#testing}

Unit tests (root module):

```bash
go test ./...
```

Integration tests (separate `integration` module):

```bash
go test -tags=integration ./integration/...
```

Select specific backends with `INTEGRATION_BACKEND` (comma-separated), for example:

```bash
INTEGRATION_BACKEND=sqlite go test -tags=integration ./integration/...
INTEGRATION_BACKEND=redis,rabbitmq go test -tags=integration ./integration/... -count=1
INTEGRATION_BACKEND=all go test -tags=integration ./integration/... -count=1
```

Matrix status and backend integration notes are tracked in `docs/integration-scenarios.md`.

## Using with GoForj {#using-with-goforj}

GoForj Apps expose named queues through generated accessors. Dispatch jobs through those accessors and keep backend selection in queue configuration.

For the GoForj integration, see [Queues](/async/queues).
