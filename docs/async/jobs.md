---
title: Jobs
description: How to define named queued work with typed payloads and handlers.
---

# Jobs

A Job is a named unit of queued work with a payload and a registered handler.

Jobs make background work explicit, observable, retryable, and operable.

## Generated Package

Job code usually lives in:

```text
internal/jobs
```

Create a job scaffold:

```bash
forj run make:job SendWelcomeEmail
```

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
			OnQueue("default"),
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
