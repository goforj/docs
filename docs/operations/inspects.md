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

In a multi-app Project, inspect records should preserve app identity as well as runtime/source identity. That lets Lighthouse and operators distinguish a `marketplace` HTTP request from the default app or a `backstage` scheduler run.

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

## Common Mistakes

::: warning Common mistakes
- Do not call the product surface traces in docs.
- Do not treat source runtimes as long-term inspect storage.
- Do not show fake request memory usage.
- Do not put child job payloads in the root job payload tab.
- Do not rely on inspects as the only production observability tool.
- Do not flatten records from different apps into one anonymous runtime stream.
:::

## Next Steps

- [Lighthouse](/operations/lighthouse)
- [Metrics](/operations/metrics)
- [Logging](/operations/logging)
