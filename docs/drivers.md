---
title: Drivers
description: Every interchangeable driver across GoForj's six swap primitives, in one place.
---

<script setup>
import proofStats from './.vitepress/data/proof-stats.json'
const driverCount = proofStats.totals.drivers
</script>

# Drivers

One contract per primitive, {{ driverCount }} interchangeable backends. Configuration selects the driver; your code depends on the contract. This page is the full matrix. Each library's page documents constructors, configuration, and tradeoffs per driver.

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

Nine drivers behind one typed event bus.

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
| `sqs` | Queue-backed event delivery |

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
| `sqlite` | Local-first embedded SQL, the day-one default |
| `postgres` | Production relational database |
| `mysql` | Production relational database |

Details: [database strategy](/data/database-strategy) · [migrations](/data/migrations)

## How Selection Works

Driver support is compiled in through `*_SUPPORTED_DRIVERS`, selection happens at runtime through `*_DRIVER` variables, and misconfiguration fails fast at startup instead of failing quietly in production. [Driver selection](/data/driver-selection) covers how to choose; the [swap section on the landing page](/) shows the same service code running against local and production backends.
