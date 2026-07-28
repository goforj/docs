---
title: Jobs
description: How to define named queued work with typed payloads and handlers.
---

# Jobs

A Job is a named unit of queued work with a payload and a registered handler.

Jobs make background work explicit, observable, and operable. Retry policy is opt-in: a generated job does not gain application retries until dispatch sets a retry budget.

## When To Use Jobs

| Question | Guidance |
| --- | --- |
| Use this when | Background work needs a stable name, typed payload, handler, retry behavior, or worker lifecycle. |
| Avoid this when | The behavior is just a local function call or a typed fact that subscribers may observe. |
| Start with | A small payload containing IDs and references to source-of-truth data. |
| Upgrade to | Dedicated queues, retry policy, idempotency keys, and worker process planning as operational risk grows. |

## Generate a Job

<MakeCommandTabs name="async-job">
<template #usage>

```bash
forj make:job reports:generate --queue reports
```

For a named App, prefix the generator:

```bash
forj marketplace make:job sync-catalog --queue sync
```

Use `category:action` for job names, such as `emails:send` or `reports:generate`. See [Naming Conventions](/core/naming-conventions) for the full naming map.

</template>
<template #files>

```text
internal/reports/generate_job.go       created
app/wire/inject_jobs_app.go            provider and handler registration added
```

For a named App, the job remains under `internal/...`; its Wire file is `app/<name>/wire/inject_jobs_app.go`.

</template>
<template #generated>

The generated dispatch helper targets the selected queue:

<CodeFile path="internal/reports/generate_job.go">

```go
package reports

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/goforj/queue"
	"myapp/internal/queues"
)

// GenerateJobTypeName is the queue task identifier.
const GenerateJobTypeName = "generate"

// GenerateJobPayload is the payload for the GenerateJob job.
type GenerateJobPayload struct {
	// add your payload fields here
}

// GenerateJob is a queue job.
type GenerateJob struct {
	queues *queues.Manager
}

// NewGenerateJob creates a GenerateJob with the configured queue manager.
func NewGenerateJob(queues *queues.Manager) *GenerateJob {
	return &GenerateJob{queues: queues}
}

// Queue creates and enqueues a task.
func (t *GenerateJob) Queue(ctx context.Context, name string) error {
	var p GenerateJobPayload
	// add your payload fields here
	// p.User = name

	payload, err := json.Marshal(p)
	if err != nil {
		return err
	}
	_, err = t.queues.WithContext(ctx).Dispatch(
		queue.NewJob(GenerateJobTypeName).Payload(payload).OnQueue("reports"),
	)
	return err
}

// HandleTask processes queue payloads.
func (t *GenerateJob) HandleTask(_ context.Context, msg queue.Message) error {
	var p GenerateJobPayload
	if err := msg.Bind(&p); err != nil {
		return fmt.Errorf("json.Unmarshal failed: %w", err)
	}
	return nil
}
```
</CodeFile>

The App Wire file constructs the job and registers its handler before workers start:

<CodeFile path="app/wire/inject_jobs_app.go">

```go
var appJobSet = wire.NewSet(
	registerJobHandlers,
	reports.NewGenerateJob, // [!code highlight]
)

func registerJobHandlers(
	queueManager *queues.Manager,
	reportsGenerateJob *reports.GenerateJob, // [!code highlight]
) *jobHandlerRegistration {
	queueManager.Register( // [!code highlight]
		reports.GenerateJobTypeName, // [!code highlight]
		reportsGenerateJob.HandleTask, // [!code highlight]
	) // [!code highlight]
	return &jobHandlerRegistration{}
}
```
</CodeFile>

</template>
</MakeCommandTabs>

## Implement the Job

The scaffold supplies dispatch and handler seams. Replace its placeholder payload with the smallest source-of-truth references the worker needs.

### Payload and Dependencies

```go
const SendWelcomeEmailTypeName = "emails:welcome"

type SendWelcomeEmailPayload struct {
	UserID string `json:"user_id"`
}

type SendWelcomeEmail struct {
	queues *queues.Manager
	users  *users.Service
}

func NewSendWelcomeEmail(queues *queues.Manager, users *users.Service) *SendWelcomeEmail {
	return &SendWelcomeEmail{queues: queues, users: users}
}
```

Job names should be stable operational identifiers.

### Dispatch

Jobs own their dispatch shape. Add `time` to the file's imports when applying this policy:

```go
func (j *SendWelcomeEmail) Queue(ctx context.Context, userID string) error {
	payload, err := json.Marshal(SendWelcomeEmailPayload{UserID: userID})
	if err != nil {
		return err
	}

	_, err = j.queues.WithContext(ctx).Dispatch(
		queue.NewJob(SendWelcomeEmailTypeName).
				Payload(payload).
				OnQueue("emails").
				Retry(3).
				Backoff(2*time.Second).
				Timeout(30*time.Second),
	)
	return err
}
```

Services can call `job.Queue(ctx, id)` without constructing raw queue messages.

`Retry(3)` permits up to three application retry attempts after the first attempt. `Backoff` delays those retries, and `Timeout` bounds each attempt. Choose values from the side effect and service-level objective rather than copying these example values unchanged.

### Handling

Handlers bind payloads and delegate business behavior:

```go
func (j *SendWelcomeEmail) HandleTask(ctx context.Context, msg queue.Message) error {
	var payload SendWelcomeEmailPayload
	if err := msg.Bind(&payload); err != nil {
		return fmt.Errorf("bind send welcome email payload: %w", err)
	}

	return j.users.SendWelcomeEmail(ctx, payload.UserID)
}
```

Return errors for retryable failures so the queue can apply the policy attached at dispatch. With `errors` imported, return `queue.Permanent(err)` for a terminal failure that should not spend the remaining application retry budget:

```go
if errors.Is(err, users.ErrInvalidEmail) {
	return queue.Permanent(err)
}
return err
```

Broker redelivery after an infrastructure failure is distinct from the application retry budget. Review acknowledgement and durability behavior for the selected driver, and keep handlers idempotent even when `Retry(0)` is intentional.

## Existing Job Registration

The generated-code tab shows the registration path for new jobs. The App-owned `registerJobHandlers` function is also the extension point for a manually written job.

Projects created before this registration seam may already contain custom job constructors that were never registered. Rerender migrates known framework jobs but does not guess whether an arbitrary provider is a job. Add each older custom job as a typed `registerJobHandlers` parameter and register its type name with `queueManager.Register`; future `make:job` calls maintain both entries automatically.

Do not register handlers after workers are already running.

## Common Mistakes

::: warning Common mistakes
- Do not hide job names behind anonymous functions.
- Do not put all business logic in `HandleTask`; delegate to services.
- Do not use untyped `map[string]any` payloads when a typed payload is clearer.
- Do not swallow handler errors that should be retried or observed.
- Do not assume generated jobs retry without an explicit retry budget.
- Do not dispatch jobs from repositories unless persistence code intentionally owns that side effect.
:::

## Next Steps

- [Queues](/async/queues) explains queue configuration.
- [Workers](/async/workers) explains execution lifecycle.
- [Retries and Idempotency](/async/retries-idempotency) explains safe retry behavior.
- [Naming Conventions](/core/naming-conventions) defines stable job names.
