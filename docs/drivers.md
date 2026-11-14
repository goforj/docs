---
title: Drivers
description: Compare GoForj infrastructure drivers and the initial drivers for optional library resources.
---

<script setup>
import proofStats from './.vitepress/data/proof-stats.json'
const driverCount = proofStats.totals.drivers
const eventDriverCount = proofStats.drivers.events.length
</script>

# Drivers

The six established infrastructure families below account for {{ driverCount }} recorded drivers. Configuration selects the driver while application code depends on the contract. The optional feature, search, and notification sections list their initial framework implementations; standalone references describe the broader library inventories.

## Queue

Ten drivers behind one queue API. The first three live in the root module; the rest are optional driver modules you `go get` only if you use them.

| Driver | What it is for |
| --- | --- |
| `workerpool` | In-process async workers, the local-first default |
| `sync` | Inline execution, useful for tests and CLIs |
| `null` | Accepts jobs and drops them, for disabling queues cleanly |
| `redis` | Durable distributed queue with full admin operations |
| `nats` | Queue-subject routing over NATS |
| `rabbitmq` | Broker-backed delivery and workers |
| `sqs` | AWS-native queue transport |
| `postgres` | Durable SQL-backed queue |
| `mysql` | Durable SQL-backed queue |
| `sqlite` | Durable embedded SQL queue |

Details: [queue library](/queue) · [queues in the framework](/async/queues)

## Events

{{ eventDriverCount }} available drivers behind one typed event bus. The standalone library calls its local driver `sync`; GoForj Apps expose the same local role as `inproc`. Apps also use `natsjetstream` where the library matrix uses the shorter `jetstream`.

| Driver | What it is for |
| --- | --- |
| `sync` | In-process dispatch, the local-first default |
| `null` | Drops events, for disabling fan-out cleanly |
| `nats` | Subject-based distributed pub/sub |
| `jetstream` | Durable stream-backed events |
| `redis` | Simple distributed fan-out |
| `kafka` | Topic-based fan-out |
| `sns` | SNS fan-out with SQS delivery |
| `gcppubsub` | Topic and subscription fan-out |

Details: [events library](/events) · [events in the framework](/async/events)

## Cache

Ten drivers behind one cache API with TTLs, locks, counters, and rate limits.

| Driver | What it is for |
| --- | --- |
| `memory` | Fastest in-process cache, the local-first default |
| `file` | Durable single-host cache |
| `null` | No-op cache, for disabling caching cleanly |
| `redis` | Shared cache, locks, and rate limits |
| `memcached` | Simple shared TTL cache |
| `nats` | JetStream KV-backed cache |
| `dynamodb` | DynamoDB-backed shared cache |
| `sqlite` | Durable embedded SQL cache |
| `postgres` | Durable shared SQL cache |
| `mysql` | Durable shared SQL cache |

Details: [cache library](/cache) · [cache in the framework](/data/cache-patterns)

## Storage

Nine drivers behind one storage API for files and blobs.

| Driver | What it is for |
| --- | --- |
| `local` | Local filesystem disks, the local-first default |
| `memory` | In-memory disks for tests |
| `s3` | S3-compatible object storage |
| `gcs` | Google Cloud object storage |
| `sftp` | Remote filesystem over SSH |
| `ftp` | Remote filesystem integration |
| `dropbox` | Dropbox-backed file storage |
| `redis` | Temporary distributed blob storage |
| `rclone` | Any rclone-supported remote |

Details: [storage library](/storage) · [storage in the framework](/data/storage-patterns)

## Mail

Eight drivers behind one fluent message builder.

| Driver | What it is for |
| --- | --- |
| `log` | Writes messages to the log, the local-first default |
| `smtp` | Any SMTP server, including Mailpit locally |
| `resend` | Resend API delivery |
| `postmark` | Postmark API delivery |
| `mailgun` | Mailgun API delivery |
| `sendgrid` | SendGrid API delivery |
| `ses` | Amazon SES delivery |
| `fake` | In-memory capture for tests |

Details: [mail library](/mail)

## Database

Three drivers behind generated connections and the ORM. Dialect differences live in per-driver migration files, rendered for you.

| Driver | What it is for |
| --- | --- |
| `sqlite` | Local-first embedded SQL for Apps that select it |
| `postgres` | Production relational database |
| `mysql` | Production relational database and the current `forj new` default |

Details: [database connections](/data/database-strategy) · [migrations](/data/migrations)

## Feature Evaluators

The optional development-line `feature` component compiles both native sources:

| Driver | What it is for |
| --- | --- |
| `memory` | A startup definition with explicit fallbacks, the default |
| `file` | A validated local definition with lifecycle-owned refresh |

Vendor SDK adapters remain standalone library integrations. Details: [Feature library](/feature) and [named resource workflow](/applications/library-resources).

## Search Indexes

The optional development-line `search` component keeps schema definitions app-owned and provisioning explicit:

| Driver | What it is for |
| --- | --- |
| `bleve` | Embedded local indexes with one process owner per physical path |
| `meilisearch` | An explicitly configured external service for shared deployments |

Bleve is the local baseline; compile Meilisearch through `SEARCH_SUPPORTED_DRIVERS` before switching it at runtime. Other library backends are outside this first framework integration. Details: [Search library](/search) and [named resource workflow](/applications/library-resources).

## Notification Senders

The optional development-line `notification` component supports:

| Driver | What it is for |
| --- | --- |
| `log` | Redacted local capture, the default |
| `webhook` | Synchronous delivery to a trusted configured generic or Slack-compatible destination |

Add webhook support to `NOTIFICATION_SUPPORTED_DRIVERS` and rebuild before selecting it. The manager adds no implicit fallback or queue; other notification drivers remain available through the standalone library. Details: [Notification library](/notification) and [named resource workflow](/applications/library-resources).

## How Selection Works

Driver support is compiled in through `*_SUPPORTED_DRIVERS`, selection happens at runtime through `*_DRIVER` variables, and misconfiguration fails fast at startup instead of failing quietly in production. [Driver selection](/data/driver-selection) covers how to choose; the [swap section on the landing page](/) shows the same service code running against local and production backends.
