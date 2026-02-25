---
title: Queue
---

<p align="center">
  <img src="https://raw.githubusercontent.com/goforj/queue/main/docs/images/logo.png?v=1" width="420" alt="queue logo">
</p>

<p align="center">
    queue is a queue and workflow library with pluggable backends and runtime extensions.
</p>

<p align="center">
    <a href="https://pkg.go.dev/github.com/goforj/queue"><img src="https://pkg.go.dev/badge/github.com/goforj/queue.svg" alt="Go Reference"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
    <a href="https://github.com/goforj/queue/actions"><img src="https://github.com/goforj/queue/actions/workflows/test.yml/badge.svg" alt="Go Test"></a>
    <a href="https://golang.org"><img src="https://img.shields.io/badge/go-1.23+-blue?logo=go" alt="Go version"></a>
    <img src="https://img.shields.io/github/v/tag/goforj/queue?label=version&sort=semver" alt="Latest tag">
    <a href="https://goreportcard.com/report/github.com/goforj/queue"><img src="https://goreportcard.com/badge/github.com/goforj/queue" alt="Go Report Card"></a>
    <a href="https://codecov.io/gh/goforj/queue"><img src="https://codecov.io/gh/goforj/queue/graph/badge.svg?token=40Z5UQATME"/></a>
<!-- test-count:embed:start -->
    <img src="https://img.shields.io/badge/unit_tests-260-brightgreen" alt="Unit tests (executed count)">
    <img src="https://img.shields.io/badge/integration_tests-522-blue" alt="Integration tests (executed count)">
<!-- test-count:embed:end -->
</p>

## Installation {#installation}

```bash
go get github.com/goforj/queue
```

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

| Driver / Backend | Mode | Notes | Durable | Async | Delay | Unique | Backoff | Timeout | Native Stats |
| ---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| <img src="https://img.shields.io/badge/null-%23666?style=flat" alt="Null"> | Drop-only | Discards dispatched jobs; useful for disabled queue modes and smoke tests. | - | - | - | - | - | - | - |
| <img src="https://img.shields.io/badge/sync-%23999999?logo=gnometerminal&logoColor=white" alt="Sync"> | Inline (caller) | Deterministic local execution with no external infra. | - | - | - | ✓ | - | ✓ | - |
| <img src="https://img.shields.io/badge/workerpool-%23696969?logo=clockify&logoColor=white" alt="Workerpool"> | In-process pool | Local async behavior without external broker/database. | - | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| <img src="https://img.shields.io/badge/mysql-%234479A1?logo=mysql&logoColor=white" alt="MySQL"> | SQL durable queue | MySQL driver module (`driver/mysqlqueue`) built on shared SQL queue core. | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| <img src="https://img.shields.io/badge/postgres-%23336791?logo=postgresql&logoColor=white" alt="Postgres"> | SQL durable queue | Postgres driver module (`driver/postgresqueue`) built on shared SQL queue core. | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| <img src="https://img.shields.io/badge/sqlite-%23003B57?logo=sqlite&logoColor=white" alt="SQLite"> | SQL durable queue | SQLite driver module (`driver/sqlitequeue`) built on shared SQL queue core. | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| <img src="https://img.shields.io/badge/redis-%23DC382D?logo=redis&logoColor=white" alt="Redis"> | Redis/Asynq | Production Redis backend (Asynq semantics). | ✓ | ✓ | ✓ | ✓ | - | ✓ | ✓ |
| <img src="https://img.shields.io/badge/NATS-007ACC?style=flat" alt="NATS"> | Broker target | NATS transport with queue-subject routing. | - | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| <img src="https://img.shields.io/badge/SQS-FF9900?style=flat" alt="SQS"> | Broker target | AWS SQS transport with endpoint overrides for localstack/testing. | - | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| <img src="https://img.shields.io/badge/rabbitmq-%23FF6600?logo=rabbitmq&logoColor=white" alt="RabbitMQ"> | Broker target | RabbitMQ transport and worker consumption. | - | ✓ | ✓ | ✓ | ✓ | ✓ | - |

> SQL-backed queues (`sqlite`, `mysql`, `postgres`) are durable and convenient, but they trade throughput for operational simplicity. They default to `1` worker, and increasing concurrency may require DB tuning (indexes, connection pool, lock contention). Prefer broker-backed drivers for higher-throughput workloads.

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
).Then(queue.NewJob("notifications:done")).Dispatch(context.Background())
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
	queue.Config{Driver: queue.DriverWorkerpool, Observer: queue.NewStatsCollector()},
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
    queue.ObserverFunc(func(event queue.Event) {
        _ = event.Kind
    }),
)

q, _ := queue.New(queue.Config{
    Driver:   queue.DriverWorkerpool,
    Observer: observer,
})
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
    queue.ObserverFunc(func(e queue.Event) {
        _ = e
    }),
)

q, _ := queue.New(queue.Config{
    Driver:   queue.DriverWorkerpool,
    Observer: observer,
})
_ = q
```

### Kitchen sink event logging (runtime + workflow) {#kitchen-sink-event-logging-(runtime-+-workflow)}

Runnable example: `examples/observeall/main.go`

<GoForjExample repo="queue" example="observeall">

```go
logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
var flakyAttempts atomic.Int32
ctx := context.Background()

runtimeObserver := queue.ObserverFunc(func(event queue.Event) {
	logger.Info("runtime event",
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

workflowObserver := queue.WorkflowObserverFunc(func(event queue.WorkflowEvent) {
	logger.Info("workflow event",
		"kind", event.Kind,
		"dispatch_id", event.DispatchID,
		"job_id", event.JobID,
		"chain_id", event.ChainID,
		"batch_id", event.BatchID,
		"job_type", event.JobType,
		"queue", event.Queue,
		"attempt", event.Attempt,
		"duration", event.Duration,
		"err", event.Err,
	)
})

q, err := queue.New(
	queue.Config{
		Driver:   queue.DriverWorkerpool,
		Observer: runtimeObserver,
	},
	queue.WithObserver(workflowObserver),
)
if err != nil {
	panic(err)
}

q.Register("emails:send", func(ctx context.Context, m queue.Message) error {
	var payload struct {
		To string `json:"to"`
	}
	if err := m.Bind(&payload); err != nil {
		return err
	}
	fmt.Println("sending", payload.To)
	return nil
})
q.Register("emails:flaky", func(ctx context.Context, m queue.Message) error {
	if flakyAttempts.Add(1) == 1 {
		return errors.New("transient smtp error")
	}
	return nil
})
q.Register("emails:fail", func(ctx context.Context, m queue.Message) error {
	return errors.New("terminal failure")
})

_ = q.StartWorkers(ctx)
defer q.Shutdown(ctx)

_, _ = q.DispatchCtx(
	ctx,
	queue.NewJob("emails:send").
		Payload(map[string]any{"to": "user@example.com"}).
		OnQueue("default").
		Timeout(2*time.Second),
)

dup := queue.NewJob("emails:send").
	Payload(map[string]any{"to": "dupe@example.com"}).
	OnQueue("default").
	UniqueFor(5 * time.Second)
_, _ = q.DispatchCtx(ctx, dup)
_, _ = q.DispatchCtx(ctx, dup)

cancelCtx, cancel := context.WithCancel(ctx)
cancel()
_, _ = q.DispatchCtx(cancelCtx, queue.NewJob("emails:send").OnQueue("default"))

_, _ = q.DispatchCtx(ctx, queue.NewJob("emails:flaky").OnQueue("default").Retry(1))
_, _ = q.DispatchCtx(ctx, queue.NewJob("emails:fail").OnQueue("default").Retry(0))

_, _ = q.Chain(
	queue.NewJob("emails:send").Payload(map[string]any{"to": "chain1@example.com"}).OnQueue("default"),
	queue.NewJob("emails:send").Payload(map[string]any{"to": "chain2@example.com"}).OnQueue("default"),
).Finally(func(ctx context.Context, st queue.ChainState) error {
	return nil
}).Dispatch(ctx)

_, _ = q.Batch(
	queue.NewJob("emails:send").Payload(map[string]any{"to": "batch1@example.com"}).OnQueue("default"),
	queue.NewJob("emails:send").Payload(map[string]any{"to": "batch2@example.com"}).OnQueue("default"),
).Progress(func(ctx context.Context, st queue.BatchState) error {
	return nil
}).Finally(func(ctx context.Context, st queue.BatchState) error {
	return nil
}).Dispatch(ctx)

time.Sleep(500 * time.Millisecond)
```

</GoForjExample>

### Events reference {#events-reference}

| Type | EventKind | Meaning |
| ---: | --- | --- |
| **queue** | enqueue_accepted | Job accepted by driver for enqueue. |
| **queue** | enqueue_rejected | Job enqueue failed. |
| **queue** | enqueue_duplicate | Duplicate job rejected due to uniqueness key. |
| **queue** | enqueue_canceled | Context cancellation prevented enqueue. |
| **queue** | process_started | Worker began processing job. |
| **queue** | process_succeeded | Handler returned success. |
| **queue** | process_failed | Handler returned error. |
| **queue** | process_retried | Driver scheduled retry attempt. |
| **queue** | process_archived | Job moved to terminal failure state. |
| **queue** | queue_paused | Queue was paused (driver supports pause). |
| **queue** | queue_resumed | Queue was resumed. |
| **workflow** | dispatch_started | Workflow runtime accepted a dispatch request and created a dispatch record. |
| **workflow** | dispatch_succeeded | Dispatch was successfully enqueued to the underlying queue runtime. |
| **workflow** | dispatch_failed | Dispatch failed before job execution could start. |
| **workflow** | job_started | A workflow job handler started execution. |
| **workflow** | job_succeeded | A workflow job handler completed successfully. |
| **workflow** | job_failed | A workflow job handler returned an error. |
| **workflow** | chain_started | A chain workflow was created and started. |
| **workflow** | chain_advanced | Chain progressed from one node to the next node. |
| **workflow** | chain_completed | Chain reached terminal success. |
| **workflow** | chain_failed | Chain reached terminal failure. |
| **workflow** | batch_started | A batch workflow was created and started. |
| **workflow** | batch_progressed | Batch state changed as jobs completed/failed. |
| **workflow** | batch_completed | Batch reached terminal success (or allowed-failure completion). |
| **workflow** | batch_failed | Batch reached terminal failure. |
| **workflow** | batch_cancelled | Batch was cancelled before normal completion. |
| **workflow** | callback_started | Chain/batch callback execution started. |
| **workflow** | callback_succeeded | Chain/batch callback completed successfully. |
| **workflow** | callback_failed | Chain/batch callback returned an error. |

## Examples {#examples}

Runnable examples live in the separate `examples` module ([`./examples`](https://github.com/goforj/queue/tree/main/examples)).
They are not included when applications import `github.com/goforj/queue`, which keeps dependency graphs and build/link overhead smaller.

## API reference {#api-reference}

The API section below is autogenerated; do not edit between the markers.

<!-- api:embed:start -->

## API Index {#api-index}

| Group | Functions |
|------:|:-----------|
| **Constructors** | [New](#queue-new) [NewNull](#queue-newnull) [NewStatsCollector](#queue-newstatscollector) [NewSync](#queue-newsync) [NewWorkerpool](#queue-newworkerpool) |
| **Job** | [Backoff](#queue-job-backoff) [Bind](#queue-job-bind) [Delay](#queue-job-delay) [NewJob](#queue-newjob) [OnQueue](#queue-job-onqueue) [Payload](#queue-job-payload) [PayloadBytes](#queue-job-payloadbytes) [PayloadJSON](#queue-job-payloadjson) [Retry](#queue-job-retry) [Timeout](#queue-job-timeout) [UniqueFor](#queue-job-uniquefor) |
| **Observability** | [Active](#queue-statssnapshot-active) [Archived](#queue-statssnapshot-archived) [Failed](#queue-statssnapshot-failed) [MultiObserver](#queue-multiobserver) [ChannelObserver.Observe](#queue-channelobserver-observe) [Observer.Observe](#queue-observer-observe) [ObserverFunc.Observe](#queue-observerfunc-observe) [StatsCollector.Observe](#queue-statscollector-observe) [Pause](#queue-pause) [Paused](#queue-statssnapshot-paused) [Pending](#queue-statssnapshot-pending) [Processed](#queue-statssnapshot-processed) [Queue](#queue-statssnapshot-queue) [Queues](#queue-statssnapshot-queues) [Resume](#queue-resume) [RetryCount](#queue-statssnapshot-retrycount) [SafeObserve](#queue-safeobserve) [Scheduled](#queue-statssnapshot-scheduled) [Snapshot](#queue-snapshot) [StatsCollector.Snapshot](#queue-statscollector-snapshot) [SupportsNativeStats](#queue-supportsnativestats) [SupportsPause](#queue-supportspause) [Throughput](#queue-statssnapshot-throughput) |
| **Queue** | [Batch](#queue-queue-batch) [Chain](#queue-queue-chain) [Dispatch](#queue-queue-dispatch) [DispatchCtx](#queue-queue-dispatchctx) [Driver](#queue-queue-driver) [FindBatch](#queue-queue-findbatch) [FindChain](#queue-queue-findchain) [Pause](#queue-queue-pause) [Prune](#queue-queue-prune) [Register](#queue-queue-register) [Resume](#queue-queue-resume) [Run](#queue-queue-run) [Shutdown](#queue-queue-shutdown) [StartWorkers](#queue-queue-startworkers) [Stats](#queue-queue-stats) [WithClock](#queue-withclock) [WithMiddleware](#queue-withmiddleware) [WithObserver](#queue-withobserver) [WithStore](#queue-withstore) [WithWorkers](#queue-withworkers) [Queue.WithWorkers](#queue-queue-withworkers) |
| **Driver Constructors** | [mysqlqueue.New](#mysqlqueue-new) [mysqlqueue.NewWithConfig](#mysqlqueue-newwithconfig) [natsqueue.New](#natsqueue-new) [natsqueue.NewWithConfig](#natsqueue-newwithconfig) [postgresqueue.New](#postgresqueue-new) [postgresqueue.NewWithConfig](#postgresqueue-newwithconfig) [rabbitmqqueue.New](#rabbitmqqueue-new) [rabbitmqqueue.NewWithConfig](#rabbitmqqueue-newwithconfig) [redisqueue.New](#redisqueue-new) [redisqueue.NewWithConfig](#redisqueue-newwithconfig) [sqlitequeue.New](#sqlitequeue-new) [sqlitequeue.NewWithConfig](#sqlitequeue-newwithconfig) [sqsqueue.New](#sqsqueue-new) [sqsqueue.NewWithConfig](#sqsqueue-newwithconfig) |
| **Testing** | [AssertBatchCount](#queuefake-fake-assertbatchcount) [AssertBatched](#queuefake-fake-assertbatched) [AssertChained](#queuefake-fake-assertchained) [AssertCount](#queuefake-fake-assertcount) [AssertDispatched](#queuefake-fake-assertdispatched) [AssertDispatchedOn](#queuefake-fake-assertdispatchedon) [AssertDispatchedTimes](#queuefake-fake-assertdispatchedtimes) [AssertNotDispatched](#queuefake-fake-assertnotdispatched) [AssertNothingBatched](#queuefake-fake-assertnothingbatched) [AssertNothingDispatched](#queuefake-fake-assertnothingdispatched) [AssertNothingWorkflowDispatched](#queuefake-fake-assertnothingworkflowdispatched) [AssertWorkflowDispatched](#queuefake-fake-assertworkflowdispatched) [AssertWorkflowDispatchedOn](#queuefake-fake-assertworkflowdispatchedon) [AssertWorkflowDispatchedTimes](#queuefake-fake-assertworkflowdispatchedtimes) [AssertWorkflowNotDispatched](#queuefake-fake-assertworkflownotdispatched) [Count](#queuefake-fake-count) [CountJob](#queuefake-fake-countjob) [CountOn](#queuefake-fake-counton) [New](#queuefake-new) [Queue](#queuefake-fake-queue) [Records](#queuefake-fake-records) [Reset](#queuefake-fake-reset) [Workflow](#queuefake-fake-workflow) |



## API {#api}

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

#### NewNull {#queue-newnull}

NewNull creates a Queue on the null backend.

```go
q, err := queue.NewNull()
if err != nil {
	return
}
```

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

#### Bind {#queue-job-bind}

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

#### OnQueue {#queue-job-onqueue}

OnQueue sets the target queue name.

```go
job := queue.NewJob("emails:send").OnQueue("critical")
```

#### Payload {#queue-job-payload}

Payload sets job payload from common value types.


```go
jobBytes := queue.NewJob("emails:send").Payload([]byte(`{"id":1}`))
```


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


```go
jobMap := queue.NewJob("emails:send").Payload(map[string]any{
	"id":  1,
	"to":  "user@example.com",
	"meta": map[string]any{"nested": true},
})
```

#### PayloadBytes {#queue-job-payloadbytes}

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
	queue.ObserverFunc(func(queue.Event) {}),
)
observer.Observe(queue.Event{Kind: queue.EventEnqueueAccepted})
fmt.Println(len(events))
// Output: 1
```

#### ChannelObserver.Observe {#queue-channelobserver-observe}

Observe forwards an event to the configured channel.

```go
ch := make(chan queue.Event, 1)
observer := queue.ChannelObserver{Events: ch}
observer.Observe(queue.Event{Kind: queue.EventProcessStarted, Queue: "default"})
event := <-ch
```

#### Observer.Observe {#queue-observer-observe}

Observe handles a queue runtime event.

```go
var observer queue.Observer
observer.Observe(queue.Event{
	Kind:   queue.EventEnqueueAccepted,
	Driver: queue.DriverSync,
	Queue:  "default",
})
```

#### ObserverFunc.Observe {#queue-observerfunc-observe}

Observe calls the wrapped function.

```go
logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
observer := queue.ObserverFunc(func(event queue.Event) {
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
observer.Observe(queue.Event{
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
collector.Observe(queue.Event{
	Kind:   queue.EventEnqueueAccepted,
	Driver: queue.DriverSync,
	Queue:  "default",
	Time:   time.Now(),
})
```

#### Pause {#queue-pause}

Pause pauses queue consumption for drivers that support it.

<GoForjExample repo="queue" example="queue-pause">

```go
// Example: pause queue
q, err := queue.NewSync()
if err != nil {
	return
}
if queue.SupportsPause(q) {
	_ = q.Pause(context.Background(), "default")
}
```

</GoForjExample>

#### Paused {#queue-statssnapshot-paused}

Paused returns paused count for a queue.

```go
collector := queue.NewStatsCollector()
collector.Observe(queue.Event{
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

#### StatsSnapshot.Queue {#queue-statssnapshot-queue}

Queue returns queue counters for a queue name.

```go
collector := queue.NewStatsCollector()
collector.Observe(queue.Event{
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
collector.Observe(queue.Event{
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

#### Resume {#queue-resume}

Resume resumes queue consumption for drivers that support it.

<GoForjExample repo="queue" example="queue-resume">

```go
// Example: resume queue
q, err := queue.NewSync()
if err != nil {
	return
}
if queue.SupportsPause(q) {
	_ = q.Resume(context.Background(), "default")
}
```

</GoForjExample>

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
collector.Observe(queue.Event{
	Kind:   queue.EventEnqueueAccepted,
	Driver: queue.DriverSync,
	Queue:  "default",
	Time:   time.Now(),
})
collector.Observe(queue.Event{
	Kind:   queue.EventProcessStarted,
	Driver: queue.DriverSync,
	Queue:  "default",
	JobKey: "job-1",
	Time:   time.Now(),
})
collector.Observe(queue.Event{
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
collector.Observe(queue.Event{
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

#### Queue {#queue-2}

#### Batch {#queue-queue-batch}

Batch creates a batch builder for fan-out workflow execution.

```go
q, err := queue.NewSync()
if err != nil {
	return
}
q.Register("emails:send", func(ctx context.Context, m queue.Message) error { return nil })
_, _ = q.Batch(
	queue.NewJob("emails:send").Payload(map[string]any{"id": 1}),
	queue.NewJob("emails:send").Payload(map[string]any{"id": 2}),
).Name("send-emails").OnQueue("default").Dispatch(context.Background())
```

#### Chain {#queue-queue-chain}

Chain creates a chain builder for sequential workflow execution.

```go
q, err := queue.NewSync()
if err != nil {
	return
}
q.Register("first", func(ctx context.Context, m queue.Message) error { return nil })
q.Register("second", func(ctx context.Context, m queue.Message) error { return nil })
_, _ = q.Chain(
	queue.NewJob("first"),
	queue.NewJob("second"),
).OnQueue("default").Dispatch(context.Background())
```

#### Queue.Dispatch {#queue-queue-dispatch}

Dispatch enqueues a high-level job using context.Background.

```go
q, err := queue.NewSync()
if err != nil {
	return
}
q.Register("emails:send", func(ctx context.Context, m queue.Message) error { return nil })
job := queue.NewJob("emails:send").Payload(map[string]any{"id": 1}).OnQueue("default")
_, _ = q.Dispatch(job)
```

#### Queue.DispatchCtx {#queue-queue-dispatchctx}

DispatchCtx enqueues a high-level job using the provided context.

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

#### FindBatch {#queue-queue-findbatch}

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

#### FindChain {#queue-queue-findchain}

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

#### Prune {#queue-queue-prune}

Prune deletes old workflow state records.

```go
q, err := queue.NewSync()
if err != nil {
	return
}
_ = q.Prune(context.Background(), time.Now().Add(-24*time.Hour))
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

WithObserver installs a workflow lifecycle observer.

```go
observer := queue.WorkflowObserverFunc(func(event queue.WorkflowEvent) {
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

<GoForjExample repo="queue" example="queue-withworkers">

```go
// Example: workers
q, err := queue.NewWorkerpool()
if err != nil {
	return
}
q.WithWorkers(4) // optional; default: runtime.NumCPU() (min 1)
```

</GoForjExample>

#### Queue.WithWorkers {#queue-queue-withworkers}

WithWorkers sets desired worker concurrency before StartWorkers.

```go
q, err := queue.NewWorkerpool()
if err != nil {
	return
}
q.WithWorkers(4) // optional; default: runtime.NumCPU() (min 1)
```

#### Testing {#testing}

#### FakeQueue.AssertCount {#queue-fakequeue-assertcount}

AssertCount fails when dispatch count is not expected.

```go
fake := queue.NewFake()
_ = fake.Dispatch(queue.NewJob("emails:send"))
fake.AssertCount(nil, 1)
```

#### FakeQueue.AssertDispatched {#queue-fakequeue-assertdispatched}

AssertDispatched fails when jobType was not dispatched.

```go
fake := queue.NewFake()
_ = fake.Dispatch(queue.NewJob("emails:send"))
fake.AssertDispatched(nil, "emails:send")
```

#### FakeQueue.AssertDispatchedOn {#queue-fakequeue-assertdispatchedon}

AssertDispatchedOn fails when jobType was not dispatched on queueName.

```go
fake := queue.NewFake()
_ = fake.Dispatch(
	queue.NewJob("emails:send").
		OnQueue("critical"),
)
fake.AssertDispatchedOn(nil, "critical", "emails:send")
```

#### FakeQueue.AssertDispatchedTimes {#queue-fakequeue-assertdispatchedtimes}

AssertDispatchedTimes fails when jobType dispatch count does not match expected.

```go
fake := queue.NewFake()
_ = fake.Dispatch(queue.NewJob("emails:send"))
_ = fake.Dispatch(queue.NewJob("emails:send"))
fake.AssertDispatchedTimes(nil, "emails:send", 2)
```

#### FakeQueue.AssertNotDispatched {#queue-fakequeue-assertnotdispatched}

AssertNotDispatched fails when jobType was dispatched.

```go
fake := queue.NewFake()
_ = fake.Dispatch(queue.NewJob("emails:send"))
fake.AssertNotDispatched(nil, "emails:cancel")
```

#### FakeQueue.AssertNothingDispatched {#queue-fakequeue-assertnothingdispatched}

AssertNothingDispatched fails when any dispatch was recorded.

```go
fake := queue.NewFake()
fake.AssertNothingDispatched(nil)
```

#### FakeQueue.Dispatch {#queue-fakequeue-dispatch}

Dispatch records a typed job payload in-memory using the fake default queue.

```go
fake := queue.NewFake()
err := fake.Dispatch(queue.NewJob("emails:send").OnQueue("default"))
```

#### FakeQueue.DispatchCtx {#queue-fakequeue-dispatchctx}

DispatchCtx submits a typed job payload using the provided context.

```go
fake := queue.NewFake()
ctx := context.Background()
err := fake.DispatchCtx(ctx, queue.NewJob("emails:send").OnQueue("default"))
fmt.Println(err == nil)
// Output: true
```

#### FakeQueue.Driver {#queue-fakequeue-driver}

Driver returns the active queue driver.

```go
fake := queue.NewFake()
driver := fake.Driver()
```

#### NewFake {#queue-newfake}

NewFake creates a queue fake that records dispatches and provides assertions.

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

#### FakeQueue.Records {#queue-fakequeue-records}

Records returns a copy of all dispatch records.

```go
fake := queue.NewFake()
_ = fake.Dispatch(queue.NewJob("emails:send").OnQueue("default"))
records := fake.Records()
fmt.Println(len(records), records[0].Job.Type)
// Output: 1 emails:send
```

#### FakeQueue.Register {#queue-fakequeue-register}

Register associates a handler with a job type.

```go
fake := queue.NewFake()
fake.Register("emails:send", func(context.Context, queue.Job) error { return nil })
```

#### FakeQueue.Reset {#queue-fakequeue-reset}

Reset clears all recorded dispatches.

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

Shutdown drains running work and releases resources.

```go
fake := queue.NewFake()
err := fake.Shutdown(context.Background())
```

#### FakeQueue.StartWorkers {#queue-fakequeue-startworkers}

StartWorkers starts worker execution.

```go
fake := queue.NewFake()
err := fake.StartWorkers(context.Background())
```

#### FakeQueue.Workers {#queue-fakequeue-workers}

Workers sets desired worker concurrency before StartWorkers.

```go
fake := queue.NewFake()
q := fake.Workers(4)
fmt.Println(q != nil)
// Output: true
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

#### Fake.AssertBatchCount {#queuefake-fake-assertbatchcount}

AssertBatchCount fails if total recorded workflow batch count does not match n.

<GoForjExample repo="queue" example="queuefake-fake-assertbatchcount">

```go
// Example: assert workflow batch count
f := queuefake.New()
_, _ = f.Workflow().Batch(bus.NewJob("a", nil)).Dispatch(nil)
f.AssertBatchCount(nil, 1)
```

</GoForjExample>

#### Fake.AssertBatched {#queuefake-fake-assertbatched}

AssertBatched fails unless at least one recorded workflow batch matches predicate.

<GoForjExample repo="queue" example="queuefake-fake-assertbatched">

```go
// Example: assert batched jobs by predicate
f := queuefake.New()
_, _ = f.Workflow().Batch(bus.NewJob("a", nil), bus.NewJob("b", nil)).Dispatch(nil)
f.AssertBatched(nil, func(spec bus.BatchSpec) bool { return len(spec.Jobs) == 2 })
```

</GoForjExample>

#### Fake.AssertChained {#queuefake-fake-assertchained}

AssertChained fails if no recorded workflow chain matches expected job type order.

<GoForjExample repo="queue" example="queuefake-fake-assertchained">

```go
// Example: assert chain sequence
f := queuefake.New()
_, _ = f.Workflow().Chain(bus.NewJob("a", nil), bus.NewJob("b", nil)).Dispatch(nil)
f.AssertChained(nil, []string{"a", "b"})
```

</GoForjExample>

#### Fake.AssertCount {#queuefake-fake-assertcount}

AssertCount fails when total dispatch count is not expected.

<GoForjExample repo="queue" example="queuefake-fake-assertcount">

```go
// Example: assert total queue dispatch count
f := queuefake.New()
q := f.Queue()
_ = q.Dispatch(queue.NewJob("a"))
_ = q.Dispatch(queue.NewJob("b"))
f.AssertCount(nil, 2)
```

</GoForjExample>

#### Fake.AssertDispatched {#queuefake-fake-assertdispatched}

AssertDispatched fails when jobType was not dispatched.

<GoForjExample repo="queue" example="queuefake-fake-assertdispatched">

```go
// Example: assert queue dispatch by type
f := queuefake.New()
_ = f.Queue().Dispatch(queue.NewJob("emails:send"))
f.AssertDispatched(nil, "emails:send")
```

</GoForjExample>

#### Fake.AssertDispatchedOn {#queuefake-fake-assertdispatchedon}

AssertDispatchedOn fails when jobType was not dispatched on queueName.

<GoForjExample repo="queue" example="queuefake-fake-assertdispatchedon">

```go
// Example: assert queue dispatch on queue
f := queuefake.New()
_ = f.Queue().Dispatch(queue.NewJob("emails:send").OnQueue("critical"))
f.AssertDispatchedOn(nil, "critical", "emails:send")
```

</GoForjExample>

#### Fake.AssertDispatchedTimes {#queuefake-fake-assertdispatchedtimes}

AssertDispatchedTimes fails when jobType dispatch count does not match expected.

<GoForjExample repo="queue" example="queuefake-fake-assertdispatchedtimes">

```go
// Example: assert queue dispatch count by type
f := queuefake.New()
q := f.Queue()
_ = q.Dispatch(queue.NewJob("emails:send"))
_ = q.Dispatch(queue.NewJob("emails:send"))
f.AssertDispatchedTimes(nil, "emails:send", 2)
```

</GoForjExample>

#### Fake.AssertNotDispatched {#queuefake-fake-assertnotdispatched}

AssertNotDispatched fails when jobType was dispatched.

<GoForjExample repo="queue" example="queuefake-fake-assertnotdispatched">

```go
// Example: assert queue type was not dispatched
f := queuefake.New()
f.AssertNotDispatched(nil, "emails:send")
```

</GoForjExample>

#### Fake.AssertNothingBatched {#queuefake-fake-assertnothingbatched}

AssertNothingBatched fails if any workflow batch was recorded.

<GoForjExample repo="queue" example="queuefake-fake-assertnothingbatched">

```go
// Example: assert no workflow batches
f := queuefake.New()
f.AssertNothingBatched(nil)
```

</GoForjExample>

#### Fake.AssertNothingDispatched {#queuefake-fake-assertnothingdispatched}

AssertNothingDispatched fails when any dispatch was recorded.

<GoForjExample repo="queue" example="queuefake-fake-assertnothingdispatched">

```go
// Example: assert no queue dispatches
f := queuefake.New()
f.AssertNothingDispatched(nil)
```

</GoForjExample>

#### Fake.AssertNothingWorkflowDispatched {#queuefake-fake-assertnothingworkflowdispatched}

AssertNothingWorkflowDispatched fails when any workflow dispatch was recorded.

<GoForjExample repo="queue" example="queuefake-fake-assertnothingworkflowdispatched">

```go
// Example: assert no workflow dispatches
f := queuefake.New()
f.AssertNothingWorkflowDispatched(nil)
```

</GoForjExample>

#### Fake.AssertWorkflowDispatched {#queuefake-fake-assertworkflowdispatched}

AssertWorkflowDispatched fails when jobType was not workflow-dispatched.

<GoForjExample repo="queue" example="queuefake-fake-assertworkflowdispatched">

```go
// Example: assert workflow dispatch by type
f := queuefake.New()
_, _ = f.Workflow().Chain(bus.NewJob("a", nil)).Dispatch(nil)
f.AssertWorkflowDispatched(nil, "a")
```

</GoForjExample>

#### Fake.AssertWorkflowDispatchedOn {#queuefake-fake-assertworkflowdispatchedon}

AssertWorkflowDispatchedOn fails when jobType was not workflow-dispatched on queueName.

<GoForjExample repo="queue" example="queuefake-fake-assertworkflowdispatchedon">

```go
// Example: assert workflow dispatch on queue
f := queuefake.New()
_, _ = f.Workflow().Chain(bus.NewJob("a", nil)).OnQueue("critical").Dispatch(nil)
f.AssertWorkflowDispatchedOn(nil, "critical", "a")
```

</GoForjExample>

#### Fake.AssertWorkflowDispatchedTimes {#queuefake-fake-assertworkflowdispatchedtimes}

AssertWorkflowDispatchedTimes fails when workflow dispatch count for jobType does not match expected.

<GoForjExample repo="queue" example="queuefake-fake-assertworkflowdispatchedtimes">

```go
// Example: assert workflow dispatch count
f := queuefake.New()
wf := f.Workflow()
_, _ = wf.Chain(bus.NewJob("a", nil)).Dispatch(nil)
_, _ = wf.Chain(bus.NewJob("a", nil)).Dispatch(nil)
f.AssertWorkflowDispatchedTimes(nil, "a", 2)
```

</GoForjExample>

#### Fake.AssertWorkflowNotDispatched {#queuefake-fake-assertworkflownotdispatched}

AssertWorkflowNotDispatched fails when jobType was workflow-dispatched.

<GoForjExample repo="queue" example="queuefake-fake-assertworkflownotdispatched">

```go
// Example: assert workflow not dispatched
f := queuefake.New()
f.AssertWorkflowNotDispatched(nil, "emails:send")
```

</GoForjExample>

#### Fake.Count {#queuefake-fake-count}

Count returns the total number of recorded dispatches.

<GoForjExample repo="queue" example="queuefake-fake-count">

```go
// Example: count total dispatches
f := queuefake.New()
q := f.Queue()
_ = q.Dispatch(queue.NewJob("a"))
_ = q.Dispatch(queue.NewJob("b"))
_ = f.Count()
```

</GoForjExample>

#### Fake.CountJob {#queuefake-fake-countjob}

CountJob returns how many times a job type was dispatched.

<GoForjExample repo="queue" example="queuefake-fake-countjob">

```go
// Example: count by job type
f := queuefake.New()
q := f.Queue()
_ = q.Dispatch(queue.NewJob("emails:send"))
_ = q.Dispatch(queue.NewJob("emails:send"))
_ = f.CountJob("emails:send")
```

</GoForjExample>

#### Fake.CountOn {#queuefake-fake-counton}

CountOn returns how many times a job type was dispatched on a queue.

<GoForjExample repo="queue" example="queuefake-fake-counton">

```go
// Example: count by queue and job type
f := queuefake.New()
q := f.Queue()
_ = q.Dispatch(queue.NewJob("emails:send").OnQueue("critical"))
_ = f.CountOn("critical", "emails:send")
```

</GoForjExample>

#### queuefake.New {#queuefake-new}

New creates a fake queue harness backed by queue.NewFake().

<GoForjExample repo="queue" example="queuefake-new">

```go
// Example: queuefake harness
f := queuefake.New()
q := f.Queue()
_ = q.Dispatch(queue.NewJob("emails:send").OnQueue("default"))
f.AssertDispatched(nil, "emails:send")
f.AssertCount(nil, 1)
```

</GoForjExample>

#### Fake.Queue {#queuefake-fake-queue}

Queue returns the queue fake to inject into code under test.

<GoForjExample repo="queue" example="queuefake-fake-queue">

```go
// Example: queue fake
f := queuefake.New()
q := f.Queue()
_ = q.Dispatch(queue.NewJob("emails:send").OnQueue("default"))
```

</GoForjExample>

#### Fake.Records {#queuefake-fake-records}

Records returns a copy of recorded dispatches.

<GoForjExample repo="queue" example="queuefake-fake-records">

```go
// Example: inspect recorded dispatches
f := queuefake.New()
_ = f.Queue().Dispatch(queue.NewJob("emails:send"))
records := f.Records()
_ = records
```

</GoForjExample>

#### Fake.Reset {#queuefake-fake-reset}

Reset clears recorded dispatches.

<GoForjExample repo="queue" example="queuefake-fake-reset">

```go
// Example: reset recorded dispatches
f := queuefake.New()
q := f.Queue()
_ = q.Dispatch(queue.NewJob("emails:send"))
f.Reset()
f.AssertNothingDispatched(nil)
```

</GoForjExample>

#### Fake.Workflow {#queuefake-fake-workflow}

Workflow returns the workflow/orchestration fake for chain/batch assertions.

<GoForjExample repo="queue" example="queuefake-fake-workflow">

```go
// Example: workflow fake
f := queuefake.New()
wf := f.Workflow()
_, _ = wf.Chain(
	bus.NewJob("a", nil),
	bus.NewJob("b", nil),
).Dispatch(context.Background())
f.AssertChained(nil, []string{"a", "b"})
```

</GoForjExample>
<!-- api:embed:end -->

## Contributing {#contributing}

### Testing {#testing-2}

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
