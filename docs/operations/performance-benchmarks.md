---
title: Performance Benchmarks
description: Run and interpret Lighthouse browser benchmarks for HTTP, cache, queues, storage, and databases.
---

# Performance Benchmarks

Lighthouse can send controlled workload through a connected App and compare HTTP or configured infrastructure resources from the browser.

Use this page to establish a reproducible baseline, compare an intentional driver or configuration change, or find the point where higher concurrency stops helping. These benchmarks measure the selected suite under the selected conditions; they do not predict whole-application capacity or define a service-level objective.

## What Lighthouse Can Measure

The Benchmarks view asks a connected benchmark-capable agent for its catalog. The available rows follow the components compiled into that App and the resource instances its Runtime discovers.

| Suite | Target | Work performed |
| --- | --- | --- |
| HTTP | Configured benchmark URL and path | Repeated `GET` requests over the configured duration. |
| Cache | One configured cache instance | Benchmark-owned keys and payloads against that Driver. |
| Queue | One configured queue instance | Benchmark jobs dispatched and drained through the selected queue. |
| Storage | One configured storage disk | Benchmark-owned paths and payloads against that Driver. |
| Database | One configured connection | Operations against a benchmark table created when needed. |

Lighthouse does not show a cache, storage, or database suite merely because the UI knows its name. The App must compile the component and expose a usable instance. Queue is part of the benchmark runner, but a meaningful queue run also needs workers consuming the selected benchmark queue.

## Before You Run

Treat a benchmark as an operator change, not a read-only diagnostic.

1. Prefer an isolated or representative environment with the same topology you want to compare.
2. Select the exact App, Runtime agent, resource instance, and Driver.
3. Confirm the HTTP URL and path or queue name before sending work.
4. Record the release, agent instance, duration, concurrency, payload size, sweep limit, and surrounding load.
5. Watch normal CPU, memory, network, connection-pool, broker, database, storage, error, and saturation signals during the run.

::: warning Active workload
The HTTP suite repeatedly sends `GET` requests. Do not point it at a route that mutates data or triggers expensive side effects. Resource suites use run-scoped benchmark keys, paths, jobs, and records and attempt cleanup, but a crash, cancellation, backend error, or unavailable cleanup operation can leave data or queued work behind. The database suite can create its benchmark table.
:::

## Run a Baseline in Lighthouse

Open **Benchmarks** in Lighthouse, then:

1. Confirm the selected agent. Lighthouse prefers a connected jobs Runtime when one is available because the generated benchmark runner lives with App job infrastructure.
2. Select one target first. Each configured cache, queue, storage, or database instance appears as its own target.
3. Keep the initial duration, concurrency, and payload settings unchanged so the first result is a baseline rather than a tuning experiment.
4. Select **Run Baseline** and keep the page attached until the target finishes.
5. Save the target identity, system baseline, result details, and any errors with your change record.

Expected result: the page reports the suite and Driver, configured duration and concurrency, actual elapsed time, operation count, operations per second, errors, and p50, p95, and p99 latency. Suite-specific detail and system information appear with the report.

If the target does not appear, confirm that the component and resource instance belong to the selected App. If a queue run stalls, confirm workers are consuming the selected queue before increasing the drain timeout or concurrency.

## Repeat the Baseline from the Artifact

The built App exposes the same generated runner for repeatable release checks. For an HTTP-only baseline:

```bash
./bin/app benchmark:run \
  --suites http \
  --duration-ms 15000 \
  --concurrency 8 \
  --payload-size 512
```

Expected result: the command prints the system baseline, one HTTP result row, and suite details with throughput, operation count, errors, p50, p95, p99, and elapsed time. Add `--json` when a comparison pipeline needs structured output. The command runs the same App-owned suite as Lighthouse; it does not make a production target safer.

## Compare One Change

Change one material variable at a time: release, Driver, backend location, pool size, payload, or concurrency. Keep the remaining conditions stable and repeat enough runs to distinguish a durable change from environmental noise.

Use a concurrency sweep to explore where throughput stops improving or errors and tail latency begin to rise. A sweep is still a synthetic comparison: it does not model production request mixes, think time, cache warmth, or contention from unrelated workloads.

## Interpret the Report

Read the result as one evidence bundle:

- `ops/sec` is achieved throughput for that suite, target, and configuration—not an App-wide total, capacity guarantee, or SLO.
- p50, p95, and p99 describe the observed successful timing distribution. Read them with operation count and errors; a low percentile does not excuse failed work.
- elapsed time can differ from configured duration because setup, drain, cleanup, or backend behavior belongs to the run.
- Driver and instance identity matter. Results from two differently located backends are not interchangeable even when their logical resource name matches.
- the system baseline matters. CPU topology, memory, virtualization, co-located work, and network distance can dominate a small code change.

Do not add operations-per-second values from different targets and call the sum application throughput. The suites run distinct operations against distinct resources.

## Confirm with Production-Shaped Evidence

Use Lighthouse benchmarks to form or reject a focused hypothesis. Before changing capacity, timeouts, or service objectives, confirm the conclusion with production-shaped load testing and the App's ordinary metrics, logs, readiness, and Inspects.

After a production-authorized run, inspect the selected backend for benchmark records or queued work that cleanup could not remove.

## Related

- [Lighthouse](/operations/lighthouse)
- [Metrics](/operations/metrics)
- [Inspects](/operations/inspects)
- [Queue Workers](/operations/queue-workers)
- [Environment Reference](/reference/env-vars#demo-app)
