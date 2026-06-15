---
title: Jobs
description: How to define named queued work with typed payloads and handlers.
---

# Jobs

A Job is a named unit of queued work with a payload and a registered handler.

Jobs make background work explicit, observable, retryable, and operable.

## When To Use Jobs

| Question | Guidance |
| --- | --- |
| Use this when | Background work needs a stable name, typed payload, handler, retry behavior, or worker lifecycle. |
| Avoid this when | The behavior is just a local function call or a typed fact that subscribers may observe. |
| Start with | A small payload containing IDs and references to source-of-truth data. |
| Upgrade to | Dedicated queues, retry policy, idempotency keys, and worker process planning as operational risk grows. |

## Generated Package

Job code usually lives in:

```text
internal/jobs
```

Create a job:

```bash
forj make:job SendWelcomeEmail
```

Stamp a generated dispatch helper with a named queue when the job belongs to a specific operational lane:

```bash
forj make:job reports:generate --queue reports
```

For a named app, run the make command through that app:

```bash
forj marketplace make:job sync-catalog --queue sync
```

The app prefix routes the generated provider into the selected app's Wire files. In this example, GoForj updates `app/marketplace/wire/inject_jobs_app.go` instead of the default app's `app/wire/inject_jobs_app.go`.

Use `category:action` for job names, such as `emails:send` or `reports:generate`. See [Naming Conventions](/core/naming-conventions) for the full naming map.

## Job Shape

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

## Dispatch

Jobs own their dispatch shape:

```go
func (j *SendWelcomeEmail) Queue(ctx context.Context, userID string) error {
	payload, err := json.Marshal(SendWelcomeEmailPayload{UserID: userID})
	if err != nil {
		return err
	}

	_, err = j.queues.WithContext(ctx).Dispatch(
		queue.NewJob(SendWelcomeEmailTypeName).
				Payload(payload).
				OnQueue("emails"),
	)
	return err
}
```

Services can call `job.Queue(ctx, id)` without constructing raw queue messages.

## Handling

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

Return errors when the job should fail and let queue behavior handle retry policy.

## Registration

Generated App construction registers framework-owned job handlers before workers start.

App-owned jobs should be registered through generated or documented App extension points before workers start.
Generated job providers live in `app/wire/inject_jobs_app.go`, or `app/<name>/wire/inject_jobs_app.go` for a named app.

Do not register handlers after workers are already running.

## Common Mistakes

::: warning Common mistakes
- Do not hide job names behind anonymous functions.
- Do not put all business logic in `HandleTask`; delegate to services.
- Do not use untyped `map[string]any` payloads when a typed payload is clearer.
- Do not swallow handler errors that should be retried or observed.
- Do not dispatch jobs from repositories unless persistence code intentionally owns that side effect.
:::

## Next Steps

- [Queues](/async/queues) explains queue configuration.
- [Workers](/async/workers) explains execution lifecycle.
- [Retries and Idempotency](/async/retries-idempotency) explains safe retry behavior.
- [Naming Conventions](/core/naming-conventions) defines stable job names.
