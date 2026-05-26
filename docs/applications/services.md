---
title: Application Services
description: How to organize business behavior behind controllers, commands, jobs, events, and schedules.
---

# Application Services

Application Services own business behavior.

Controllers, commands, jobs, events, and schedules should call services rather than each reimplementing workflows at their own runtime boundary.

## Service Shape

```go
package reports

type Service struct {
	repo   *Repository
	queue  Queue
	cache  Cache
	events Events
}

func NewService(repo *Repository, queue Queue, cache Cache, events Events) *Service {
	return &Service{
		repo:   repo,
		queue:  queue,
		cache:  cache,
		events: events,
	}
}
```

Required dependencies stay required. Optional dependencies should be modeled explicitly.

## Inputs and Outputs

Use typed inputs for service operations:

```go
type CreateReportInput struct {
	Name      string
	OwnerID   string
	Immediate bool
}

func (s *Service) Create(ctx context.Context, input CreateReportInput) (Report, error) {
	// ...
}
```

This keeps service APIs independent from HTTP request structs, CLI flag structs, and queue payload structs.

## Runtime Boundaries

Multiple runtime surfaces may call the same service:

- HTTP controller
- CLI command
- queue job handler
- event subscriber
- scheduler entry

The service should not need to know which surface called it unless that is part of the business behavior.

## Infrastructure Access

Services should receive infrastructure through constructor injection.

Prefer generated App accessors and interfaces at the consumer boundary:

- cache accessors for derived data
- storage disks for files and blobs
- queues for background work
- event buses for fan-out
- repositories for persistence
- metrics wrappers for application metrics

Avoid importing backend driver packages into services.

## Transactions and Consistency

Keep consistency decisions close to the service method that owns the workflow.

If a workflow writes to the database, dispatches a job, updates cache, and publishes an event, document the ordering and failure behavior in the service or feature docs. Do not hide consistency policy in controllers or middleware.

## Common Mistakes

::: warning Common mistakes
- Do not put business workflows in controllers, middleware, runtime bootstrap, or provider functions.
- Do not read environment variables repeatedly inside services when configuration can be injected.
- Do not make services depend on HTTP-only types.
- Do not use package globals as an infrastructure shortcut.
- Do not swallow dependency errors that should fail fast.
:::

## Next Steps

- [Controllers](/applications/controllers) explains HTTP callers.
- [Commands](/applications/commands) explains CLI callers.
- [Events versus Queues](/async/events-vs-queues) explains async callers.
