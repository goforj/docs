---
title: Inspects
description: Runtime execution records for requests, jobs, scheduler runs, and commands.
---

# Inspects

An Inspect is a captured execution record.

Use inspects to understand requests, jobs, scheduler runs, CLI executions, and related runtime activity.

## Product Naming

Use `inspect` and `inspects` for the product surface.

The correlation field can still be named `trace_id` where the code uses it.

## What Inspects Capture

Inspects can include:

- timeline events
- logs
- HTTP request and response data
- job payloads
- queued child job payloads
- scheduler events
- source runtime identity
- duration and status

In a multi-app Project, inspect records should preserve app identity as well as runtime/source identity. That lets Lighthouse and operators distinguish an `admin` staff-action request from the default app or a `statuspage` scheduler run that publishes current availability.

The source determines the record shape:

| Source | Starts when | Useful evidence |
| --- | --- | --- |
| HTTP | A captured request enters the HTTP Runtime | Timeline, request/response exchange, status, route context, and request-scoped logs. |
| Jobs | A worker executes a registered job | Timeline, job identity, input payload, and job-scoped logs. |
| Scheduler | A registered schedule invokes its task | Timeline, schedule identity, status, and duration. |
| CLI | A command runs through the App command surface | Timeline and command execution evidence. |

An Inspect is execution evidence, not a general event log. Use logs for long-lived operational history and metrics for aggregate rate, error, and latency questions.

## Retention Model

Source runtimes capture running inspects locally.

Finished inspect records are published to Lighthouse through a bounded buffer. Lighthouse owns the retained recent browsing window.

Important controls include:

```text
LIGHTHOUSE_INSPECT_MAX_TOTAL
LIGHTHOUSE_INSPECT_MAX_INFLIGHT
LIGHTHOUSE_INSPECT_MAX_EVENTS
LIGHTHOUSE_INSPECT_SAMPLE_RATE
LIGHTHOUSE_INSPECT_BUFFER_SIZE
LIGHTHOUSE_INSPECT_FLUSH_INTERVAL
LIGHTHOUSE_INSPECT_FLUSH_BATCH_SIZE
```

If the buffer is full or Lighthouse is unavailable, new finished inspects can be dropped. Drop counters and flush metrics should make this visible.

The default delivery buffer is bounded, so capture cannot grow process memory without limit. A full publish buffer or an unavailable Lighthouse drops new *finished* Inspects rather than blocking request, job, or scheduler execution. Treat dropped-Inspect counters as a visibility degradation signal, not proof that the underlying work failed.

## Safe Capture and Sampling

Enable and size Inspect capture according to the sensitivity and traffic of the Runtime:

```text
LIGHTHOUSE_INSPECT_ENABLED=true
LIGHTHOUSE_INSPECT_MAX_INFLIGHT=250
LIGHTHOUSE_INSPECT_MAX_EVENTS=300
LIGHTHOUSE_INSPECT_SAMPLE_RATE=0.10
LIGHTHOUSE_INSPECT_BUFFER_SIZE=4096
LIGHTHOUSE_INSPECT_FLUSH_INTERVAL=1s
LIGHTHOUSE_INSPECT_FLUSH_BATCH_SIZE=100
LIGHTHOUSE_INSPECT_MAX_TOTAL=5000
```

These values are a production-shaped starting point, not a universal retention policy. `MAX_INFLIGHT` protects the source Runtime, `MAX_EVENTS` caps one record, sampling controls source capture probability, and `MAX_TOTAL` bounds Lighthouse's recent browsing window. Increase a limit only after estimating the payload and retention cost.

Do not capture secrets, authentication credentials, or sensitive raw request and job data unless the application has an explicit redaction policy and restricted operator access. If a captured body is truncated, any copy action in Lighthouse copies the truncated stored value.

## Reading an Inspect

Start with App, Runtime source, status, start time, and duration. Then use the timeline to connect log annotations and nested work. For HTTP, inspect request/response evidence; for a job, read the job's own payload rather than treating child jobs queued during the run as its input. A failed Inspect should lead to the corresponding logs, readiness state, and bounded metric series before changing configuration.

## Failure Modes

| Failure | Visibility | Operator action |
| --- | --- | --- |
| Lighthouse unavailable | Source Runtime continues; finished records can be dropped. | Restore Lighthouse connectivity and watch delivery/drop counters. |
| Publish buffer full | New finished Inspects are dropped to protect the Runtime. | Reduce sampling or payload volume, increase capacity only after sizing memory, and investigate the consumer. |
| Record lacks needed detail | Sampling, event cap, or capture policy limited it. | Use logs/metrics for the incident and adjust capture policy for future evidence. |
| Sensitive data appears | The capture/redaction policy is unsafe. | Restrict access, rotate exposed secrets, and remove or redact the source data. |

## Common Mistakes

::: warning Common mistakes
- Do not call the product surface traces in docs.
- Do not treat source runtimes as long-term inspect storage.
- Do not show fake request memory usage.
- Do not put child job payloads in the root job payload tab.
- Do not rely on inspects as the only production observability tool.
- Do not flatten records from different apps into one anonymous runtime stream.
:::

## Production Checklist

- Inspect capture is enabled only with a documented retention and access policy.
- Sampling and caps are sized for the busiest Runtime.
- Drop and flush signals are monitored.
- Operators can correlate an Inspect with App, Runtime, logs, and metrics without exposing secrets.

## Next Steps

- [Lighthouse](/operations/lighthouse)
- [Metrics](/operations/metrics)
- [Logging](/operations/logging)
