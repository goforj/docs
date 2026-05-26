---
title: Retries and Idempotency
description: How to design jobs, subscribers, and schedules that can safely run more than once.
---

# Retries and Idempotency

Any background work that can fail should be designed with retry behavior in mind.

Idempotent work can run more than once without corrupting state or duplicating irreversible side effects.

## Where Retries Appear

Retries can appear in:

- queue drivers
- job handlers
- scheduled work
- external API clients
- database transaction retry loops
- manual operator reruns

Design the workflow, not just the transport.

## Job Idempotency

A job handler should be safe when the same payload is delivered more than once.

Common techniques:

- use stable IDs in payloads
- check current durable state before writing
- record processed operation IDs
- make external calls with idempotency keys when supported
- separate irreversible side effects from retryable preparation work

## Event Subscribers

Do not assume event subscriber errors are durable retry signals.

If a subscriber must perform retryable work, dispatch a job from the subscriber and let the queue own worker lifecycle and retry behavior.

## Scheduled Work

Schedules should tolerate overlap, missed runs, and reruns.

Use stable schedule names and explicit locking or overlap protection when the work must not run concurrently.

## Side Effects

Be explicit when work sends email, charges money, writes files, calls external APIs, or publishes additional events.

Ask:

- What happens if the handler runs twice?
- What happens if the process stops halfway through?
- What durable state proves completion?
- What can be retried safely?
- What must be compensated manually?

## Common Mistakes

::: warning Common mistakes
- Do not assume retries are safe by default.
- Do not use events as the retry system for critical work.
- Do not let anonymous callbacks hide operational identity.
- Do not perform irreversible external side effects before durable state is ready.
- Do not ignore shutdown behavior for long-running jobs.
:::

## Next Steps

- [Jobs](/async/jobs) explains handler structure.
- [Workers](/async/workers) explains worker lifecycle.
- [Scheduler](/async/scheduler) explains recurring work.
