---
title: Reports Generate Job
description: Dispatch durable reports:generate work from a users.created subscriber and process it with a queue worker.
---

# Reports Generate Job

::: info Verified Scenario
This page is generated from an executable spec. An automated suite renders a fresh App from the current GoForj templates, applies every step below in order, and runs every verification command. If any step fails, the page does not ship.
:::

Scenario 5 of 7 in the [verified path](/scenarios/). Plan on about 25 minutes.

This scenario turns the `users.created` subscriber into a durable work dispatcher.

The event still announces that a user was created. The subscriber now queues `reports:generate`, and a worker process generates a small report artifact. This keeps fan-out and durable work separate.

## What You Will Build

- `QUEUE_*` config selects the queue backend used by API and worker processes.
- `STORAGE_REPORTS_*` defines a named disk for generated report artifacts.
- `reports.Service` writes a report file to storage.
- `jobs.GenerateJob` owns the queue payload, dispatch shape, and handler.
- `notifications.Service` dispatches the job from the `users.created` subscriber.
- Wire binds the job to a small queueing interface used by notifications.

## Prerequisites

Complete [Users Created Event](/scenarios/users-created-event) first.

The generated App should have queues, jobs, events, and storage enabled.

## Golden Path State

Before this scenario, `users.created` is an in-process fact with a subscriber reaction.

After this scenario, the subscriber dispatches named durable work, workers process `reports:generate`, and generated report files land on the named `reports` storage disk. Event fan-out and job execution are now separate boundaries.

## Files

This scenario edits or creates:

**Configuration**

```text
.env
```

**Reports feature**

```text
internal/reports/service.go
internal/reports/service_test.go
```

**Jobs**

```text
internal/jobs/generate_job.go
app/wire/inject_jobs_app.go
```

**Notifications**

```text
internal/notifications/service.go
```

**App wiring**

```text
app/wire/inject_services_app.go
```

The queue and storage generators update generated manager and accessor files.

```text
internal/queues/manager_gen.go
internal/storages/accessors_gen.go
internal/storages/manager_gen.go
```

Do not edit generated queue or storage files by hand.

## Step 1: Configure Report Storage

Use a named local storage disk for report artifacts. Keep the queue driver shared between API and worker processes.

Append to `.env`:

```dotenv
STORAGE_REPORTS_DRIVER=local
STORAGE_REPORTS_ROOT=storage/app/reports
STORAGE_REPORTS_PREFIX=
```

## Step 2: Enable Memory Storage For Tests

Compile memory storage support for service tests.

Update `.env` so it includes:

```dotenv
STORAGE_SUPPORTED_DRIVERS=local,memory
```

## Step 3: Refresh Generated Resources

Run the build pipeline so the generated App exposes `app.Queue()` and `app.Storage().Reports()`.

```bash
forj build
```

## Step 4: Add The Report Service

Create `internal/reports/service.go`.

The service writes through `storage.Storage`, not a local filesystem or cloud SDK. The selected driver remains configuration.

Create or replace `internal/reports/service.go`:

```go
package reports

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"path"
	"strings"
	"time"

	"github.com/goforj/storage"
)

var (
	ErrUserIDRequired = errors.New("user id is required")
	ErrEmailRequired  = errors.New("email is required")
)

type Service struct {
	disk storage.Storage
}

type ReportQueue interface {
	Queue(ctx context.Context, userID string, email string) error
}

type UserReport struct {
	UserID      string    `json:"user_id"`
	Email       string    `json:"email"`
	GeneratedAt time.Time `json:"generated_at"`
}

func NewService(disk storage.Storage) *Service {
	return &Service{disk: disk}
}

func (s *Service) GenerateForUser(ctx context.Context, userID string, email string) (string, error) {
	userID = safeSegment(userID)
	if userID == "" {
		return "", ErrUserIDRequired
	}

	email = strings.TrimSpace(email)
	if email == "" {
		return "", ErrEmailRequired
	}

	report := UserReport{
		UserID:      userID,
		Email:       email,
		GeneratedAt: time.Now().UTC(),
	}

	body, err := json.MarshalIndent(report, "", "  ")
	if err != nil {
		return "", fmt.Errorf("encode user report: %w", err)
	}

	reportPath := path.Join("users", userID, "profile.json")
	if err := s.disk.WithContext(ctx).Put(reportPath, body); err != nil {
		return "", fmt.Errorf("store user report: %w", err)
	}

	return reportPath, nil
}

func safeSegment(value string) string {
	value = strings.TrimSpace(value)
	value = path.Base(strings.ReplaceAll(value, "\\", "/"))
	value = strings.Trim(value, ".")
	return value
}
```

## Step 5: Generate The Job

Use the generated App's make command to create the job file and add its constructor to job wiring.

```bash
forj make:job reports:generate --output-dir ./internal/jobs
```

## Step 6: Replace The Generated Job

Replace `internal/jobs/generate_job.go`.

The job owns the queue payload and dispatch options. The handler binds the message and delegates business behavior to `reports.Service`.

Create or replace `internal/jobs/generate_job.go`:

```go
package jobs

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/goforj/queue"

	"your/module/internal/queues"
	"your/module/internal/reports"
)

const GenerateJobTypeName = "reports:generate"

type GeneratePayload struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
}

type GenerateJob struct {
	queues  *queues.Manager
	reports *reports.Service
}

func NewGenerateJob(queues *queues.Manager, reports *reports.Service) *GenerateJob {
	return &GenerateJob{
		queues:  queues,
		reports: reports,
	}
}

func (j *GenerateJob) Queue(ctx context.Context, userID string, email string) error {
	payload, err := json.Marshal(GeneratePayload{
		UserID: userID,
		Email:  email,
	})
	if err != nil {
		return err
	}

	_, err = j.queues.WithContext(ctx).Dispatch(
		queue.NewJob(GenerateJobTypeName).
			Payload(payload).
			OnQueue("default").
			Retry(3).
			Timeout(2 * time.Minute),
	)
	return err
}

func (j *GenerateJob) HandleTask(ctx context.Context, msg queue.Message) error {
	var payload GeneratePayload
	if err := msg.Bind(&payload); err != nil {
		return fmt.Errorf("bind generate report payload: %w", err)
	}

	_, err := j.reports.GenerateForUser(ctx, payload.UserID, payload.Email)
	return err
}
```

## Step 7: Remove The Grouped Job Stub

The generator used the grouped name for package placement. Keep the public job in `internal/jobs` so queue wiring does not create an import cycle with application services.

Create or replace `internal/reports/generate_job.go`:

```go
package reports
```

## Step 8: Point Job Wiring At The Jobs Package

Register the job constructor from `internal/jobs`.

Remove from `app/wire/inject_jobs_app.go`:

```go
"your/module/internal/reports"
```

## Step 9: Replace The Generated Job Provider

The App service set owns this job because notifications depend on its queueing interface.

Remove from `app/wire/inject_jobs_app.go`:

```go
reports.NewGenerateJob,
```

## Step 10: Dispatch The Job From Notifications

Replace `internal/notifications/service.go`.

The method name is still intentionally application-facing. The implementation now queues durable work instead of doing it inside the event subscriber.

Create or replace `internal/notifications/service.go`:

```go
package notifications

import (
	"context"

	"your/module/internal/reports"
)

type Service struct {
	generateReport reports.ReportQueue
}

func NewService(generateReport reports.ReportQueue) *Service {
	return &Service{generateReport: generateReport}
}

func (s *Service) SendWelcome(ctx context.Context, userID string, email string) error {
	return s.generateReport.Queue(ctx, userID, email)
}
```

## Step 11: Keep Lifecycle Subscriber Registration

Update `app/lifecycle.go`.

The lifecycle still owns subscriber registration. The subscriber dispatches durable work through the notification service.

Create or replace `app/lifecycle.go`:

```go
package app

import (
	"context"

	"your/module/internal/events"
	"your/module/internal/notifications"
)

type LifecycleRegistry struct {
	eventManager             *events.Manager
	notificationSubscribers  *notifications.Subscribers
	notificationSubscription events.Subscription
}

func NewLifecycleRegistry(
	eventManager *events.Manager,
	notificationSubscribers *notifications.Subscribers,
) *LifecycleRegistry {
	return &LifecycleRegistry{
		eventManager:            eventManager,
		notificationSubscribers: notificationSubscribers,
	}
}

func (r *LifecycleRegistry) Register(lifecycle *Lifecycle) {
	lifecycle.On(Startup, func(ctx context.Context) error {
		subscription, err := r.notificationSubscribers.Register(ctx, r.eventManager.Default())
		if err != nil {
			return err
		}
		r.notificationSubscription = subscription
		return nil
	})

	lifecycle.On(Shutdown, func(ctx context.Context) error {
		return r.notificationSubscription.Close()
	})
}
```

## Step 12: Wire Reports and The Job

Add the report storage provider and report service constructor.

Update `app/wire/inject_services_app.go` so it includes:

```go
import (
        "github.com/goforj/storage"
```

## Step 13: Add Report Imports

Add imports for the report service and generated storage manager.

Update `app/wire/inject_services_app.go` so it includes:

```go
"your/module/internal/jobs"
"your/module/internal/notifications"
"your/module/internal/reports"
"your/module/internal/storages"
```

## Step 14: Add Report Storage Providers

The report service receives the named `reports` storage disk.

Update `app/wire/inject_services_app.go` so it includes:

```go
provideReportStorage,
reports.NewService,
jobs.NewGenerateJob,
wire.Bind(new(reports.ReportQueue), new(*jobs.GenerateJob)),
provideEventBus,
```

## Step 15: Add The Report Storage Provider

`provideReportStorage` selects the generated named storage resource.

Update `app/wire/inject_services_app.go` so it includes:

```go
func provideReportStorage(manager *storages.Manager) storage.Storage {
        return manager.Reports()
}

func provideEventBus(manager *events.Manager) events.Bus {
```

## Step 16: Add A Report Service Test

Create `internal/reports/service_test.go`.

This test verifies the report behavior without starting the queue worker.

Create or replace `internal/reports/service_test.go`:

```go
package reports

import (
	"context"
	"testing"

	"github.com/goforj/storage"
	"github.com/goforj/storage/driver/memorystorage"
)

func TestServiceGeneratesUserReport(t *testing.T) {
	ctx := context.Background()
	disk, err := storage.Build(memorystorage.Config{})
	if err != nil {
		t.Fatalf("build storage: %v", err)
	}

	service := NewService(disk)
	reportPath, err := service.GenerateForUser(ctx, "42", "ada@example.test")
	if err != nil {
		t.Fatalf("generate report: %v", err)
	}
	if reportPath != "users/42/profile.json" {
		t.Fatalf("report path = %q", reportPath)
	}

	body, err := disk.WithContext(ctx).Get(reportPath)
	if err != nil {
		t.Fatalf("read report: %v", err)
	}
	if len(body) == 0 {
		t.Fatal("expected report body")
	}
}

func TestServiceRejectsMissingUserID(t *testing.T) {
	ctx := context.Background()
	disk, err := storage.Build(memorystorage.Config{})
	if err != nil {
		t.Fatalf("build storage: %v", err)
	}

	service := NewService(disk)
	_, err = service.GenerateForUser(ctx, "", "ada@example.test")
	if err == nil {
		t.Fatal("expected error")
	}
}
```

## Build and Verify

```bash
forj build
```

```bash
go test ./...
```

```bash
forj route:list
```

Expected output includes:

- `/api/v1/users`

## Try The Route

Start a worker in one terminal:

```bash
forj worker
```

Start the API in another terminal:

```bash
forj api
```

Create a user:

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Grace Hopper","email":"grace@example.test"}'
```

The API publishes `users.created`. The subscriber dispatches `reports:generate`. The worker consumes the job and writes `storage/app/reports/users/43/profile.json`.

## Operations

Operational notes:

- Queued jobs can be retried and processed outside the HTTP request path.
- Use this boundary for work that sends email, generates reports, calls external APIs, or may need operational recovery.
- The job can appear in queue metrics, inspect records, Lighthouse queue views, worker logs, and driver backend state.
- Keep job payloads stable and small. Store large artifacts in storage, not inside queue payloads.

## Swap The Driver

To use Redis in production, compile Redis queue support and select it:

```dotenv
QUEUE_SUPPORTED_DRIVERS=workerpool,redis
QUEUE_DRIVER=redis
QUEUE_ADDR=redis:6379
QUEUE_NAME=default
QUEUE_WORKERS=30
```

Then run:

```bash
forj build
```

Business code does not change. `GenerateJob` still dispatches `reports:generate`, and workers still run with `forj worker` or `./bin/app worker`.

## Common Mistakes

::: warning Common mistakes
- Do not use an in-process queue when API and worker run as separate processes.
- Do not put report generation logic directly inside the event subscriber.
- Do not make HTTP controllers build raw queue jobs.
- Do not register job handlers after workers have started.
- Do not put full report contents into the queue payload.
- Do not assume retries are safe unless the handler is idempotent.
:::

## Next Steps

- Next, schedule recurring report dispatch with [Reports Daily Schedule](/scenarios/reports-daily-schedule).
