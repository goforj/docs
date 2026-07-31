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

## Configure Job Retries

Application retries are opt-in on each queued job:

<!-- go-example: illustrative-fragment -->
```go
job := queue.NewJob("reports:generate").
	Payload(payload).
	OnQueue("reports").
	Retry(2).
	Backoff(500 * time.Millisecond).
	Timeout(20 * time.Second)
```

`Retry(2)` allows two retries after the initial attempt. `Backoff` controls the delay between application attempts, and `Timeout` bounds one attempt. A job without `Retry` has no application retry budget; a broker can still redeliver work after an acknowledgement or connection failure, so the handler must remain safe to run more than once.

Use `queue.Permanent(err)` when retrying a known terminal error would waste the remaining budget:

<!-- go-example: illustrative-fragment -->
```go
if errors.Is(err, ErrInvalidReport) {
	return queue.Permanent(err)
}
return err
```

Retry, delay, acknowledgement, and restart durability vary by driver. Prove the behavior against the production backend when those guarantees matter.

## Test Retry Policy

This focused test uses the synchronous local driver to prove the application retry budget without a broker:

<!-- go-example: illustrative-fragment -->
```go
package reports

import (
	"context"
	"errors"
	"sync/atomic"
	"testing"
	"time"

	"github.com/goforj/queue"
)

// TestGenerateReportRetriesTwice pins the configured application retry budget.
func TestGenerateReportRetriesTwice(t *testing.T) {
	q, err := queue.NewSync()
	if err != nil {
		t.Fatalf("new sync queue: %v", err)
	}

	var attempts atomic.Int32
	q.Register("reports:generate", func(context.Context, queue.Message) error {
		if attempts.Add(1) < 3 {
			return errors.New("temporary report service failure")
		}
		return nil
	})
	if err := q.StartWorkers(context.Background()); err != nil {
		t.Fatalf("start workers: %v", err)
	}
	t.Cleanup(func() { _ = q.Shutdown(context.Background()) })

	_, err = q.Dispatch(
		queue.NewJob("reports:generate").
			Retry(2).
			Backoff(time.Millisecond).
			Timeout(time.Second),
	)
	if err != nil {
		t.Fatalf("dispatch: %v", err)
	}
	if got := attempts.Load(); got != 3 {
		t.Fatalf("attempts = %d, want 3", got)
	}
}
```

Run the owning package:

```bash
go test ./internal/reports -run TestGenerateReportRetriesTwice
```

Expected result: the package reports `ok`, proving one initial attempt and two configured retries. Add a backend integration test when restart recovery, acknowledgement, delay durability, or dead-job state matters.

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
- Do not assume a handler error creates an application retry budget.
- Do not use events as the retry system for critical work.
- Do not let anonymous callbacks hide operational identity.
- Do not perform irreversible external side effects before durable state is ready.
- Do not ignore shutdown behavior for long-running jobs.
:::

## Next Steps

- [Jobs](/async/jobs) explains handler structure.
- [Workers](/async/workers) explains worker lifecycle.
- [Scheduler](/async/scheduler) explains recurring work.
