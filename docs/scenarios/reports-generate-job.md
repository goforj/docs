---
title: Reports Generate Job
description: Dispatch durable reports:generate work from a users.created subscriber and process it with a queue worker.
---

# Reports Generate Job

This scenario turns the `users.created` subscriber into a durable work dispatcher.

The event still announces that a user was created. The subscriber now queues `reports:generate`, and a worker process generates a small report artifact. This keeps fan-out and durable work separate.

## What You Will Build

- `QUEUE_*` config selects a local SQLite queue so API and worker processes can share queued work.
- `STORAGE_REPORTS_*` defines a named disk for generated report artifacts.
- `reports.Service` writes a report file to storage.
- `jobs.GenerateReportJob` owns the queue payload, dispatch shape, and handler.
- `notifications.Service` dispatches the job from the `users.created` subscriber.
- `internal/app/lifecycle_registry.go` registers the job handler before workers start.

## Prerequisites

Complete [Users Created Event](/scenarios/users-created-event) first.

The generated App should have queues, jobs, events, and storage enabled.

Verify these generated packages exist:

```text
internal/events
internal/jobs
internal/queues
internal/storages
```

## Files

This scenario edits or creates:

```text
.env
internal/reports/service.go
internal/reports/service_test.go
internal/jobs/generate_report_job.go
internal/notifications/service.go
internal/app/lifecycle_registry.go
wire/inject_app_services.go
wire/inject_jobs_app.go
```

The queue and storage generators update generated manager/accessor files. Do not edit generated files by hand.

## Step 1: Configure Queue and Storage

Use SQLite for the default local queue:

```dotenv
QUEUE_SUPPORTED_DRIVERS=sqlite
QUEUE_DRIVER=sqlite
QUEUE_DSN=file:storage/queue-default.db?_busy_timeout=5000
QUEUE_DEFAULT_QUEUE=default
QUEUE_WORKERS=2
QUEUE_SHUTDOWN_TIMEOUT=10s
```

Use a named local storage disk for report artifacts:

```dotenv
STORAGE_REPORTS_DRIVER=local
STORAGE_REPORTS_ROOT=storage/app/reports
STORAGE_REPORTS_PREFIX=
```

If your App uses `STORAGE_SUPPORTED_DRIVERS`, make sure `local` is included:

```dotenv
STORAGE_SUPPORTED_DRIVERS=local
```

Run:

```bash
forj build
```

::: info Dev Loop
During `forj dev`, the generated build watcher normally runs `forj build` for you.
:::

After generation, the App should expose:

```go
app.Queue()
app.Storage().Reports()
```

SQLite is intentional here. A `workerpool` queue is process-local, so it is useful for single-process local runtime, but it is not the right default when `forj run api` and `forj run worker` run as separate processes.

## Step 2: Add The Report Service

Create `internal/reports/service.go`:

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

The service writes through `storage.Storage`, not a local filesystem or cloud SDK. The selected driver remains configuration.

## Step 3: Add The Job

You can scaffold the file:

```bash
forj run make:job GenerateReport
```

Then replace `internal/jobs/generate_report_job.go` with:

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

const GenerateReportJobTypeName = "reports:generate"

type GenerateReportPayload struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
}

type GenerateReportJob struct {
	queues  *queues.Manager
	reports *reports.Service
}

func NewGenerateReportJob(queues *queues.Manager, reports *reports.Service) *GenerateReportJob {
	return &GenerateReportJob{
		queues:  queues,
		reports: reports,
	}
}

func (j *GenerateReportJob) Queue(ctx context.Context, userID string, email string) error {
	payload, err := json.Marshal(GenerateReportPayload{
		UserID: userID,
		Email:  email,
	})
	if err != nil {
		return err
	}

	_, err = j.queues.WithContext(ctx).Dispatch(
		queue.NewJob(GenerateReportJobTypeName).
			Payload(payload).
			OnQueue("default").
			Retry(3).
			Timeout(2 * time.Minute),
	)
	return err
}

func (j *GenerateReportJob) HandleTask(ctx context.Context, msg queue.Message) error {
	var payload GenerateReportPayload
	if err := msg.Bind(&payload); err != nil {
		return fmt.Errorf("bind generate report payload: %w", err)
	}

	_, err := j.reports.GenerateForUser(ctx, payload.UserID, payload.Email)
	return err
}
```

The job owns the queue payload and dispatch options. The handler binds the message and delegates business behavior to `reports.Service`.

## Step 4: Dispatch The Job From Notifications

Replace `internal/notifications/service.go`:

```go
package notifications

import (
	"context"

	"your/module/internal/jobs"
)

type Service struct {
	generateReport *jobs.GenerateReportJob
}

func NewService(generateReport *jobs.GenerateReportJob) *Service {
	return &Service{generateReport: generateReport}
}

func (s *Service) SendWelcome(ctx context.Context, userID string, email string) error {
	return s.generateReport.Queue(ctx, userID, email)
}
```

The method name is still intentionally application-facing. The implementation now queues durable work instead of doing it inside the event subscriber.

Your existing `internal/notifications/subscribers.go` can stay the same:

```go
func (s *Subscribers) Register(ctx context.Context, bus events.Bus) (events.Subscription, error) {
	return bus.WithContext(ctx).Subscribe(func(ctx context.Context, event events.UserCreated) error {
		return s.service.SendWelcome(ctx, event.UserID, event.Email)
	})
}
```

The subscriber remains thin: receive event, call service, return errors.

## Step 5: Register The Job Handler

Update `internal/app/lifecycle_registry.go`:

```go
package app

import (
	"context"

	"your/module/internal/events"
	"your/module/internal/jobs"
	"your/module/internal/notifications"
	"your/module/internal/queues"
)

type LifecycleRegistry struct {
	eventManager              *events.Manager
	queues                    *queues.Manager
	generateReportJob         *jobs.GenerateReportJob
	notificationSubscribers   *notifications.Subscribers
	notificationSubscription  events.Subscription
}

func NewLifecycleRegistry(
	eventManager *events.Manager,
	queues *queues.Manager,
	generateReportJob *jobs.GenerateReportJob,
	notificationSubscribers *notifications.Subscribers,
) *LifecycleRegistry {
	return &LifecycleRegistry{
		eventManager:            eventManager,
		queues:                  queues,
		generateReportJob:       generateReportJob,
		notificationSubscribers: notificationSubscribers,
	}
}

func (r *LifecycleRegistry) Register(lifecycle *Lifecycle) {
	lifecycle.On(BeforeStartup, func(ctx context.Context) error {
		r.queues.Register(jobs.GenerateReportJobTypeName, r.generateReportJob.HandleTask)
		return nil
	})

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

This registers the job handler before startup completes. Worker commands start processing after App startup, so the handler is ready before jobs are consumed.

## Step 6: Wire Reports and the Job

Open `wire/inject_app_services.go`.

Add imports:

```go
import (
	"github.com/goforj/storage"

	"your/module/internal/reports"
	"your/module/internal/storages"
)
```

Add providers:

```go
var appSet = wire.NewSet(
	provideCacheManager,
	provideStorageManager,
	provideEventManager,
	provideInspectManager,
	provideReportStorage,
	reports.NewService,
	app.NewLifecycleRegistry,
	// existing providers...
)

func provideReportStorage(manager *storages.Manager) storage.Storage {
	return manager.Reports()
}
```

Open `wire/inject_jobs_app.go`.

Make sure the job constructor is present:

```go
var jobAppSet = wire.NewSet(
	jobs.NewExampleHelloJob,
	jobs.NewExampleHelloJobCmd,
	jobs.NewGenerateReportJob,
	// existing providers...
)
```

If you used `forj run make:job GenerateReport`, the constructor may already be present.

## Step 7: Build

Run:

```bash
forj build
```

This refreshes generated queue and storage support, regenerates Wire, builds API index artifacts, and builds the App.

## Verify

Start a worker in one terminal:

```bash
forj run worker
```

Start the API in another terminal:

```bash
forj run api
```

Create a user:

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Grace Hopper","email":"grace@example.test"}'
```

The API publishes `users.created`. The subscriber dispatches `reports:generate`. The worker consumes the job and writes:

```text
storage/app/reports/users/43/profile.json
```

Production binaries use the same runtime boundary:

```bash
./bin/app worker
```

## Test The Report Service

Create `internal/reports/service_test.go`:

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

Run:

```bash
go test ./...
```

This test verifies the report behavior without starting the queue worker.

## Swap The Driver

To use Redis in production, compile Redis queue support and select it:

```dotenv
QUEUE_SUPPORTED_DRIVERS=sqlite,redis
QUEUE_DRIVER=redis
QUEUE_ADDR=redis:6379
QUEUE_DEFAULT_QUEUE=default
QUEUE_WORKERS=30
```

Then run:

```bash
forj build
```

Business code does not change. `GenerateReportJob` still dispatches `reports:generate`, and workers still run with `forj run worker` or `./bin/app worker`.

## Operations

Queued jobs can be retried and processed outside the HTTP request path. This is the boundary to use for work that sends email, generates reports, calls external APIs, or may need operational recovery.

The job can appear in:

- queue dispatch metrics
- queue processing metrics
- inspect records
- Lighthouse queue views
- worker logs
- driver backend state

Keep job payloads stable and small. Store large artifacts in storage, not inside queue payloads.

## Common Mistakes

- Do not use an in-process queue when API and worker run as separate processes.
- Do not put report generation logic directly inside the event subscriber.
- Do not make HTTP controllers build raw queue jobs.
- Do not register job handlers after workers have started.
- Do not put full report contents into the queue payload.
- Do not assume retries are safe unless the handler is idempotent.

## Next Step

Next, schedule recurring report generation with a `reports:daily` schedule.
