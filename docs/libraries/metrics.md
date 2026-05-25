---
title: Metrics
repoSlug: metrics
repoUrl: https://github.com/goforj/metrics
---

# Metrics

`github.com/goforj/metrics` provides a small in-memory metrics primitive for GoForj and other Go applications.

It is intentionally narrow:

- counters, gauges, and fixed-bucket histograms
- lock-free hot-path updates
- snapshot-based export
- Prometheus-compatible text exposition
- no global singleton requirement

## Using With GoForj

Generated GoForj Apps use metrics through generated observability and HTTP runtime code. When metrics are enabled, the App can expose a Prometheus scrape endpoint such as `GET /metrics` alongside health and readiness routes.

Keep metric registration explicit and close to the service or runtime component that owns the behavior being measured. Use generated App guides for where metrics are mounted and how HTTP exposure is configured. Use this page for the standalone registry, metric types, naming model, and Prometheus exporter behavior.

## Install

```bash
go get github.com/goforj/metrics
```

## Quick Start

```go
package main

import (
	"log"
	"net/http"
	"time"

	"github.com/goforj/metrics"
)

func main() {
	reg := metrics.NewRegistry()

	requests := reg.MustCounter(metrics.Descriptor{
		Name: "http.requests",
		Help: "Total HTTP requests served.",
		Kind: metrics.KindCounter,
	})

	latency := reg.MustHistogram(metrics.Descriptor{
		Name: "http.request.duration",
		Help: "HTTP request latency.",
		Kind: metrics.KindHistogram,
		Unit: metrics.UnitSeconds,
	}, metrics.DurationBounds(metrics.DefaultDurationBounds()))

	http.Handle("/metrics", metrics.Handler(reg))
	http.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		defer latency.ObserveSince(start)

		requests.Inc()
		_, _ = w.Write([]byte("hello"))
	})

	log.Fatal(http.ListenAndServe(":8080", nil))
}
```

## Model

Register metrics once during startup. Update metrics on hot paths with atomic operations. Export a point-in-time snapshot when Prometheus scrapes `/metrics`.

The exporter writes Prometheus text exposition from an immutable snapshot, so exporters do not touch live metric state directly.

## Metric Names

Use dotted names internally for readability and hierarchy.

Examples:

- `http.requests`
- `http.request.duration`
- `jobs.processed`
- `scheduler.run.duration`

Prometheus output normalizes dotted names to underscore-separated metric names and appends conventional suffixes such as `_total`.

## Units

Supported units:

- `metrics.UnitNone`
- `metrics.UnitSeconds`
- `metrics.UnitBytes`
- `metrics.UnitItems`

Duration histograms should use `metrics.UnitSeconds` and observe durations with `Histogram.ObserveSince`.

## API Reference

The package API is available on [pkg.go.dev/github.com/goforj/metrics](https://pkg.go.dev/github.com/goforj/metrics).
