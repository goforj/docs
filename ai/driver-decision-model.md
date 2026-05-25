# GoForj Driver Decision Model

## Purpose

This file defines how GoForj should document driver selection.

Driver decision docs should help users choose infrastructure without pushing backend complexity into beginner guides.

## Decision Principle

Start with the default recommendation.

Then explain when to choose another driver based on operational needs:

- durability
- throughput
- latency
- locality
- sharing across processes
- cost
- operational complexity
- testing
- production constraints

## Standard Decision Page Structure

Use this structure:

1. `# Choosing A Driver`
2. default recommendation
3. quick comparison table
4. local development choice
5. production choices
6. testing choices
7. migration path
8. operational tradeoffs
9. library matrix or reference link

## Driver Documentation Rules

- Do not put full driver matrices in beginner framework guides.
- Keep full primitive driver matrices in Libraries unless the matrix is specifically about generated App configuration.
- Do not present every driver as equally appropriate.
- Do not hide operational tradeoffs.
- Do not imply swapping drivers has zero deployment impact.
- Keep business logic examples backend-agnostic.
- Keep direct driver imports near provider or configuration examples.
- In standalone library pages, direct driver imports are appropriate.

## Cache Driver Guidance

Default local path:

- memory cache for ephemeral local behavior
- file cache when local persistence matters
- null cache when testing disabled cache behavior

Common production choices:

- Redis for shared cache, locks, counters, and rate limiting
- Memcached for simple shared TTL cache
- SQL-backed cache when operational simplicity matters more than raw throughput
- DynamoDB or NATS when the surrounding infrastructure already standardizes on them

Decision factors:

- shared versus process-local
- lock behavior
- TTL precision
- durability expectations
- operational ownership

## Storage Driver Guidance

Default local path:

- local storage for development
- memory storage for tests

Common production choices:

- S3-compatible object storage for common cloud deployments
- GCS for Google Cloud deployments
- SFTP or FTP for integration with legacy systems
- Redis storage only for explicit temporary distributed blob use
- rclone for broad remote support when its tradeoffs are understood

Decision factors:

- object storage versus filesystem semantics
- public URL support
- temporary URL support
- durability
- latency
- credentials and permissions
- local emulation

## Queue Driver Guidance

Default local path:

- sync queue for deterministic inline behavior
- workerpool queue for local asynchronous behavior
- null queue for disabled or smoke-test modes

Common production choices:

- SQL-backed queues for operational simplicity and durability at moderate throughput
- Redis queue for production worker workloads and queue admin support
- broker-backed queues when infrastructure already exists or throughput demands it
- SQS for AWS-native queue workloads

Decision factors:

- durability
- delay support
- retry support
- admin operations
- concurrency
- throughput
- deployment environment

## Event Driver Guidance

Default local path:

- sync events for in-process fan-out
- null events for disabled eventing and tests

Common production choices:

- NATS for subject-based distributed pub/sub
- Redis pub/sub for simple distributed fan-out
- Kafka for log/topic infrastructure where already standardized
- Google Pub/Sub or SNS for cloud-native event fan-out

Decision factors:

- fan-out semantics
- durability expectations
- subscriber model
- local emulation
- infrastructure ownership

Events are not queues. If the work must be durable, retried, delayed, or worker-managed, use jobs and queues.

## Database Driver Guidance

Database guidance should be honest about what is first-party, generated, recommended, or future.

Decision factors:

- local development
- migrations
- SQL dialect
- transaction behavior
- connection pooling
- generated model/repository support
- production operations

Do not overpromise database abstraction if the framework does not yet own that full layer.

## Migration Path Language

Driver decision docs should include migration expectations:

- dependency additions
- configuration changes
- provider changes
- schema or table setup
- local integration tests
- production rollout considerations

Use the phrase "swap drivers, not business logic" with this concrete explanation. Do not imply backend migration is operationally free.
