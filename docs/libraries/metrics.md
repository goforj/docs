---
title: Metrics
description: "Counters, gauges, histograms, snapshots, and Prometheus-compatible export."
repoSlug: metrics
repoUrl: https://github.com/goforj/metrics
---

<p align="center">
  <img src="https://raw.githubusercontent.com/goforj/metrics/main/docs/assets/logo.png" width="300" alt="metrics logo">
</p>

<p align="center">
  Dependency-free metrics primitives and Prometheus exposition for Go.
</p>

<p align="center">
  <a href="https://pkg.go.dev/github.com/goforj/metrics"><img src="https://pkg.go.dev/badge/github.com/goforj/metrics.svg" alt="Go Reference"></a>
  <a href="https://github.com/goforj/metrics/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
  <a href="https://github.com/goforj/metrics/actions"><img src="https://github.com/goforj/metrics/actions/workflows/test.yml/badge.svg" alt="Go Test"></a>
  <a href="https://go.dev"><img src="https://img.shields.io/badge/go-1.24%2B-blue?logo=go" alt="Go 1.24 or newer"></a>
  <img src="https://img.shields.io/github/v/tag/goforj/metrics?label=version&sort=semver" alt="Latest tag">
  <a href="https://codecov.io/gh/goforj/metrics"><img src="https://codecov.io/gh/goforj/metrics/graph/badge.svg" alt="Coverage"></a>
</p>

`github.com/goforj/metrics` is a small, dependency-free metrics library for GoForj and other Go applications. It provides explicit registries, counters, gauges, fixed-bucket histograms, detached snapshots, and Prometheus text exposition.

The library is deliberately narrow: applications own their registry, registration happens during startup, and metric updates stay inexpensive on hot paths.

## Installation {#installation}

Requires Go 1.24 or newer.

```sh
go get github.com/goforj/metrics
```

## Quick start {#quick-start}

```go
package main

import (
	"log"
	"net/http"
	"time"

	"github.com/goforj/metrics"
)

func main() {
	// Own the registry explicitly so tests and multiple applications do not share metric state.
	registry := metrics.NewRegistry()

	// Register metrics once during startup, then retain these handles for inexpensive updates.
	requests := registry.MustCounter(metrics.Descriptor{
		Name: "http.requests",
		Help: "Total HTTP requests served.",
	})
	latency := registry.MustDurationHistogram(metrics.Descriptor{
		Name: "http.request.duration",
		Help: "HTTP request duration.",
	}, metrics.DefaultDurationBounds())

	http.Handle("/metrics", metrics.Handler(registry))
	http.HandleFunc("/hello", func(response http.ResponseWriter, _ *http.Request) {
		start := time.Now()
		// A deferred observation records latency on every return path through the handler.
		defer latency.ObserveSince(start)

		requests.Inc()
		_, _ = response.Write([]byte("hello"))
	})

	log.Fatal(http.ListenAndServe(":8080", nil))
}
```

This exports `http_requests_total` and the `http_request_duration_seconds` histogram family at `/metrics`.

After starting the program, make one request and inspect the counter:

```console
$ curl --silent http://localhost:8080/hello > /dev/null

$ curl --silent http://localhost:8080/metrics | grep '^http_requests_total'
http_requests_total 1
```

## Model {#model}

Each application creates and wires one or more registries explicitly. There is no package-global registry.

```go
registry := metrics.NewRegistry()
```

The zero value is also usable:

```go
var registry metrics.Registry
requests := registry.MustCounter(metrics.Descriptor{
	Name: "jobs.processed",
	Help: "Jobs processed successfully.",
})
```

Register metrics once during startup and keep the returned handles. An exact repeat registration returns the same handle, which makes independently initialized startup components safe to call more than once. Reusing a name with different metadata, labels, bounds, or kind returns an error. The `Must` variants panic on registration errors and are convenient for static startup declarations.

A descriptor requires a non-blank `Name` and `Help`. `Kind` may be omitted because the registration method supplies it. `Unit` may be `UnitNone`, `UnitSeconds`, `UnitBytes`, or `UnitItems`.

Required collaborators fail fast: for example, `metrics.Handler(nil)` panics while the application is being wired. It does not silently expose an empty registry.

## Metric types {#metric-types}

| Type | Use | Updates |
| --- | --- | --- |
| `Counter` | A monotonically increasing total | `Inc`, `Add` |
| `Gauge` | A signed point-in-time value | `Set`, `Add`, `Sub` |
| `Histogram` | A distribution over fixed, increasing bounds | `Observe`, `ObserveDuration`, `ObserveSince` |

Scalar counters and gauges, and children returned by vectors, update through atomics without a registry lock. Histogram observations also use atomic state. Registration, vector child lookup, and snapshot collection use locks because they change or traverse shared structure.

## Names and units {#names-and-units}

Names can use readable application conventions such as dots. Prometheus output lowercases the name, changes runs outside `[a-z0-9_]` to `_`, trims outer underscores, and prefixes a leading digit with `_`.

Units are appended before the conventional counter suffix:

| Descriptor | Prometheus family |
| --- | --- |
| counter `http.requests` | `http_requests_total` |
| counter `worker.jobs` with `UnitItems` | `worker_jobs_items_total` |
| gauge `queue.depth` | `queue_depth` |
| histogram `http.request.duration` with `UnitSeconds` | `http_request_duration_seconds` |

Registration rejects ambiguous output names. For example, `http.requests` and `http_requests` cannot coexist because both normalize to the same family. Histogram-derived `_bucket`, `_sum`, and `_count` names are reserved too.

## Labels and cardinality {#labels-and-cardinality}

Vectors define a fixed, ordered label-key set and create children with `WithLabelValues`:

```go
requests := registry.MustCounterVec(metrics.Descriptor{
	Name: "http.requests",
	Help: "HTTP requests served.",
}, []string{"method", "route", "status"})

getUserOK := requests.WithLabelValues("GET", "/users/:id", "200")
getUserOK.Inc()
```

Label keys use the Prometheus legacy identifier grammar. Keys beginning with `__` are reserved, and histogram vectors also reserve `le`. Supplying the wrong number of values or a non-UTF-8 value panics because it indicates a programming error.

Every distinct value tuple creates a child that remains for the life of the vector. Keep label values bounded: use route patterns, status classes, queue names, and other controlled dimensions. Do not use request IDs, user IDs, raw URLs, timestamps, or unbounded error text. Cache a frequently updated child handle when practical so the hot path does not repeat the vector lookup.

## Duration histograms {#duration-histograms}

Duration helpers accept `time.Duration` bounds, store observations as nanoseconds, and export Prometheus values in seconds:

```go
latency := registry.MustDurationHistogram(metrics.Descriptor{
	Name: "worker.job.duration",
	Help: "Worker job duration.",
}, []time.Duration{
	10 * time.Millisecond,
	50 * time.Millisecond,
	250 * time.Millisecond,
	time.Second,
})

latency.ObserveDuration(42 * time.Millisecond)
```

Use `DurationHistogram` or `MustDurationHistogram` for scalars and `DurationHistogramVec` or `MustDurationHistogramVec` for vectors. `DefaultDurationBounds` returns an opinionated set of common latency buckets. `DurationBounds` remains available for compatibility but is deprecated.

`Histogram` accepts raw `int64` observations when a domain-specific base unit is more appropriate. Its bounds must be strictly increasing. `ObserveDuration` and `ObserveSince` require a seconds histogram and panic if used with another unit.

Histogram sums use `float64`, matching Prometheus's sample model. This avoids signed `int64` wrap for long-lived, high-rate duration metrics, but totals above `2^53` may no longer preserve single-unit precision. Counts and bucket membership remain exact until their `uint64` counters wrap.

## Snapshots and exposition {#snapshots-and-exposition}

`Registry.Snapshot` returns detached slices in deterministic name-and-label order. Counter and gauge values are atomic observations made during collection; a snapshot is not a transaction spanning every metric. Each histogram snapshot keeps its bucket total and count coherent even while observations continue.

Expose a live registry with:

```go
http.Handle("/metrics", metrics.Handler(registry))
```

`Handler` collects a snapshot, validates it, buffers the encoded body, and serves Prometheus text format 0.0.4 with `metrics.PrometheusContentType`.

Snapshots are public structs so another collector can construct one directly. `EncodePrometheus` validates caller-built snapshots before writing: descriptors, family metadata, labels, ordering, duplicate samples, histogram buckets, and derived-series collisions must all be consistent.

```go
var output bytes.Buffer
if err := metrics.EncodePrometheus(&output, registry.Snapshot()); err != nil {
	return err
}
```

## Concurrency {#concurrency}

Registration, updates, snapshots, and exposition are safe to use concurrently. Keep these boundaries in mind:

- registration locks the registry and should normally finish during startup;
- `WithLabelValues` locks the vector for lookup or child creation;
- updates on the returned counter, gauge, or histogram child do not take the registry or vector lock;
- snapshots are detached and may be retained or modified without changing live metrics.

## Development {#development}

Run the normal validation targets with:

```bash
make test
make test-race
make vet
```

## Upgrading {#upgrading}

The quality-pass contract is stricter than v0.1.0. See [MIGRATING.md](https://github.com/goforj/metrics/blob/main/MIGRATING.md) for the validation, nil-handling, duration, and histogram-sum changes.

## Using with GoForj {#using-with-goforj}

GoForj Apps expose metrics through the observability and HTTP runtime. Keep registration close to the behavior being measured and configure scrape exposure through the App runtime.

For the App workflow, see [Metrics](/operations/metrics).
