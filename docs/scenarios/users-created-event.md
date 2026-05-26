---
title: Users Created Event
description: Publish a typed users.created event and handle it with a lifecycle-registered subscriber.
---

# Users Created Event

This scenario extends the user profile flow with a `POST /api/v1/users` endpoint that publishes a typed `users.created` event after a user is saved.

The event announces that something happened. The subscriber reacts to it. Durable background work, retries, and worker lifecycle belong in a job and queue, which the next scenario introduces.

## What You Will Build

- `EVENTS_*` config selects the local event driver.
- `internal/events.UserCreated` defines the typed event.
- `UserService` publishes through a small application boundary.
- `notifications.Subscribers` reacts to `users.created`.
- `internal/app/lifecycle_registry.go` registers and closes the subscription.
- A service test proves the event is published without starting the App runtime.

## Prerequisites

Complete [Cached User Profile](/scenarios/cached-user-profile) first.

The generated App should have event support enabled. Verify that the generated event package exists:

```text
internal/events
```

## Files

This scenario edits or creates:

```text
.env
internal/events/user_created_event.go
internal/users/repository.go
internal/users/events.go
internal/users/service.go
internal/users/service_test.go
internal/users/controller.go
internal/notifications/service.go
internal/notifications/subscribers.go
internal/app/lifecycle_registry.go
wire/inject_app_services.go
```

The event generator may update generated event manager files. Do not edit generated files by hand.

## Step 1: Configure Events

Use the in-process event driver for local development:

```dotenv
EVENTS_SUPPORTED_DRIVERS=inproc
EVENTS_DRIVER=inproc
EVENTS_INPROC_WORKERS=0
EVENTS_INPROC_BUFFER=1024
```

Run:

```bash
forj build
```

::: info Dev Loop
During `forj dev`, the generated build watcher normally runs `forj build` for you.
:::

The generated App should expose:

```go
app.Bus()
app.Events()
```

## Step 2: Add The Event

Create `internal/events/user_created_event.go`:

```go
package events

const UserCreatedTopic = "users.created"

type UserCreated struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
}

func (UserCreated) Topic() string {
	return UserCreatedTopic
}
```

Events should be small typed facts. They should not carry full domain objects, request payloads, or driver-specific metadata.

## Step 3: Extend The Repository

Replace `internal/users/repository.go` with:

```go
package users

import (
	"context"
	"strconv"
	"sync"
)

type UserRepository interface {
	Find(ctx context.Context, id string) (User, error)
	Save(ctx context.Context, user User) (User, error)
}

type MemoryUserRepository struct {
	mu     sync.Mutex
	nextID int
	users  map[string]User
}

func NewMemoryUserRepository() *MemoryUserRepository {
	return &MemoryUserRepository{
		nextID: 43,
		users: map[string]User{
			"42": {
				ID:    "42",
				Name:  "Ada Lovelace",
				Email: "ada@example.test",
			},
		},
	}
}

func (r *MemoryUserRepository) Find(ctx context.Context, id string) (User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	user, ok := r.users[id]
	if !ok {
		return User{}, ErrUserNotFound
	}
	return user, nil
}

func (r *MemoryUserRepository) Save(ctx context.Context, user User) (User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if user.ID == "" {
		user.ID = strconv.Itoa(r.nextID)
		r.nextID++
	}
	r.users[user.ID] = user
	return user, nil
}
```

The repository still owns source-of-truth storage. This example uses memory so the scenario stays local and runnable.

## Step 4: Add An Event Publisher Boundary

Create `internal/users/events.go`:

```go
package users

import (
	"context"

	"your/module/internal/events"
)

type UserEvents interface {
	PublishCreated(ctx context.Context, user User) error
}

type UserEventPublisher struct {
	bus events.Bus
}

func NewUserEventPublisher(bus events.Bus) *UserEventPublisher {
	return &UserEventPublisher{bus: bus}
}

func (p *UserEventPublisher) PublishCreated(ctx context.Context, user User) error {
	return p.bus.WithContext(ctx).Publish(events.UserCreated{
		UserID: user.ID,
		Email:  user.Email,
	})
}
```

The service will depend on `UserEvents`, not on global App state. That keeps tests direct and keeps the event boundary visible.

## Step 5: Publish From The Service

Replace `internal/users/service.go` with:

```go
package users

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/goforj/cache"
)

var (
	ErrUserNotFound  = errors.New("user not found")
	ErrNameRequired  = errors.New("name is required")
	ErrEmailRequired = errors.New("email is required")
)

const profileCacheTTL = 5 * time.Minute

type User struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type CreateUserInput struct {
	Name  string
	Email string
}

type Service struct {
	repo         UserRepository
	profileCache *cache.Cache
	userEvents   UserEvents
}

func NewService(repo UserRepository, profileCache *cache.Cache, userEvents UserEvents) *Service {
	return &Service{
		repo:         repo,
		profileCache: profileCache,
		userEvents:   userEvents,
	}
}

func (s *Service) Find(ctx context.Context, id string) (User, error) {
	if id == "" {
		return User{}, ErrUserNotFound
	}

	key := profileCacheKey(id)

	user, ok, err := cache.Get[User](s.profileCache.WithContext(ctx), key)
	if err != nil {
		return User{}, fmt.Errorf("read user profile cache: %w", err)
	}
	if ok {
		return user, nil
	}

	user, err = s.repo.Find(ctx, id)
	if err != nil {
		return User{}, err
	}

	if err := cache.Set(s.profileCache.WithContext(ctx), key, user, profileCacheTTL); err != nil {
		return User{}, fmt.Errorf("write user profile cache: %w", err)
	}

	return user, nil
}

func (s *Service) Create(ctx context.Context, input CreateUserInput) (User, error) {
	name := strings.TrimSpace(input.Name)
	if name == "" {
		return User{}, ErrNameRequired
	}

	email := strings.TrimSpace(input.Email)
	if email == "" {
		return User{}, ErrEmailRequired
	}

	user, err := s.repo.Save(ctx, User{
		Name:  name,
		Email: email,
	})
	if err != nil {
		return User{}, fmt.Errorf("save user: %w", err)
	}

	if err := s.userEvents.PublishCreated(ctx, user); err != nil {
		return User{}, fmt.Errorf("publish user created event: %w", err)
	}

	return user, nil
}

func profileCacheKey(id string) string {
	return "users:" + id + ":profile"
}
```

The service owns the application workflow: validate, save, publish. The controller still owns HTTP concerns.

## Step 6: Add The Subscriber

Create `internal/notifications/service.go`:

```go
package notifications

import "context"

type Service struct{}

func NewService() *Service {
	return &Service{}
}

func (s *Service) SendWelcome(ctx context.Context, userID string, email string) error {
	// In a real App this could enqueue an email job.
	return nil
}
```

Create `internal/notifications/subscribers.go`:

```go
package notifications

import (
	"context"

	"your/module/internal/events"
)

type Subscribers struct {
	service *Service
}

func NewSubscribers(service *Service) *Subscribers {
	return &Subscribers{service: service}
}

func (s *Subscribers) Register(ctx context.Context, bus events.Bus) (events.Subscription, error) {
	return bus.WithContext(ctx).Subscribe(func(ctx context.Context, event events.UserCreated) error {
		return s.service.SendWelcome(ctx, event.UserID, event.Email)
	})
}
```

The subscriber reacts to a typed fact. It should not become a hidden replacement for explicit service orchestration.

## Step 7: Register Subscribers In The Lifecycle

Update `internal/app/lifecycle_registry.go`:

```go
package app

import (
	"context"

	"your/module/internal/events"
	"your/module/internal/notifications"
)

type LifecycleRegistry struct {
	eventManager            *events.Manager
	notificationSubscribers *notifications.Subscribers
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

This keeps subscriber registration in the App lifecycle, not in `init`, package globals, or controller constructors.

## Step 8: Update The Controller

Update `internal/users/controller.go` so it supports both `GET /users/:id` and `POST /users`:

```go
package users

import (
	"errors"
	"net/http"

	"github.com/goforj/web"
)

type Controller struct {
	service *Service
}

type CreateRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

func NewController(service *Service) *Controller {
	return &Controller{service: service}
}

func (c *Controller) Routes() []web.Route {
	return []web.Route{
		web.NewRoute(http.MethodGet, "/users/:id", c.Show),
		web.NewRoute(http.MethodPost, "/users", c.Store),
	}
}

func (c *Controller) Show(ctx web.Context) error {
	user, err := c.service.Find(ctx.Context(), ctx.Param("id"))
	if errors.Is(err, ErrUserNotFound) {
		return ctx.JSON(http.StatusNotFound, map[string]string{
			"error": "user not found",
		})
	}
	if err != nil {
		return err
	}

	return ctx.JSON(http.StatusOK, user)
}

func (c *Controller) Store(ctx web.Context) error {
	var req CreateRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "invalid payload",
		})
	}

	user, err := c.service.Create(ctx.Context(), CreateUserInput{
		Name:  req.Name,
		Email: req.Email,
	})
	if errors.Is(err, ErrNameRequired) || errors.Is(err, ErrEmailRequired) {
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
	}
	if err != nil {
		return err
	}

	return ctx.JSON(http.StatusCreated, user)
}
```

## Step 9: Wire the Event Boundary and Subscriber

Open `wire/inject_app_services.go`.

Add imports for notifications and users:

```go
import (
	"your/module/internal/notifications"
	"your/module/internal/users"
)
```

Add providers:

```go
var appSet = wire.NewSet(
	provideCacheManager,
	provideStorageManager,
	provideEventManager,
	provideInspectManager,
	provideEventBus,
	provideUserProfileCache,
	users.NewMemoryUserRepository,
	wire.Bind(new(users.UserRepository), new(*users.MemoryUserRepository)),
	users.NewUserEventPublisher,
	wire.Bind(new(users.UserEvents), new(*users.UserEventPublisher)),
	users.NewService,
	notifications.NewService,
	notifications.NewSubscribers,
	app.NewLifecycleRegistry,
	// existing providers...
)

func provideEventBus(manager *events.Manager) events.Bus {
	return manager.Default()
}
```

If `app.NewLifecycleRegistry` is already in the set, keep only one copy and let Wire satisfy its new constructor parameters.

## Step 10: Build

Run:

```bash
forj build
```

This refreshes generated event support, regenerates Wire, builds API index artifacts, and builds the App.

## Verify

Serve HTTP:

```bash
forj run api
```

Create a user:

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Grace Hopper","email":"grace@example.test"}'
```

Expected response:

```json
{"id":"43","name":"Grace Hopper","email":"grace@example.test"}
```

The service saved the user, published `users.created`, and the lifecycle-registered subscriber handled the event.

## Test The Service

Replace `internal/users/service_test.go` with:

```go
package users

import (
	"context"
	"testing"

	"github.com/goforj/cache"
)

type recordingUserEvents struct {
	created []User
}

func (r *recordingUserEvents) PublishCreated(ctx context.Context, user User) error {
	r.created = append(r.created, user)
	return nil
}

func TestServiceFindsAndCachesUser(t *testing.T) {
	ctx := context.Background()
	profileCache := cache.NewCache(cache.NewMemoryStore(ctx))
	repo := NewMemoryUserRepository()
	events := &recordingUserEvents{}
	service := NewService(repo, profileCache, events)

	user, err := service.Find(ctx, "42")
	if err != nil {
		t.Fatalf("find user: %v", err)
	}
	if user.ID != "42" {
		t.Fatalf("user id = %q, want %q", user.ID, "42")
	}

	cached, ok, err := cache.Get[User](profileCache.WithContext(ctx), "users:42:profile")
	if err != nil {
		t.Fatalf("read cache: %v", err)
	}
	if !ok {
		t.Fatal("expected cached profile")
	}
	if cached.ID != "42" {
		t.Fatalf("cached user id = %q, want %q", cached.ID, "42")
	}
}

func TestServicePublishesUserCreatedEvent(t *testing.T) {
	ctx := context.Background()
	events := &recordingUserEvents{}
	service := NewService(
		NewMemoryUserRepository(),
		cache.NewCache(cache.NewMemoryStore(ctx)),
		events,
	)

	user, err := service.Create(ctx, CreateUserInput{
		Name:  "Grace Hopper",
		Email: "grace@example.test",
	})
	if err != nil {
		t.Fatalf("create user: %v", err)
	}
	if user.ID == "" {
		t.Fatal("expected saved user id")
	}
	if len(events.created) != 1 {
		t.Fatalf("created events = %d, want 1", len(events.created))
	}
	if events.created[0].Email != "grace@example.test" {
		t.Fatalf("created event email = %q", events.created[0].Email)
	}
}

func TestServiceRejectsEmptyID(t *testing.T) {
	ctx := context.Background()
	service := NewService(
		NewMemoryUserRepository(),
		cache.NewCache(cache.NewMemoryStore(ctx)),
		&recordingUserEvents{},
	)

	_, err := service.Find(ctx, "")
	if err == nil {
		t.Fatal("expected error")
	}
}
```

Run:

```bash
go test ./...
```

The test uses a small event boundary fake. It does not need to start the event bus or the App runtime.

## Swap The Driver

To publish through Redis in production, compile Redis event support and select it:

```dotenv
EVENTS_SUPPORTED_DRIVERS=inproc,redis
EVENTS_DRIVER=redis
EVENTS_ADDR=redis:6379
```

Then run:

```bash
forj build
```

Business code does not change. The service still publishes through `UserEvents`, and the subscriber still registers against the generated bus.

## Operations

The `inproc` driver is process-local and non-durable. It is useful for local fan-out and same-process reactions.

Use a distributed event driver when events must cross process boundaries. Use a queue and job when work needs retries, delay, timeout, worker lifecycle, or operational replay.

Published events and subscriber deliveries can appear in:

- event publish metrics
- event subscription metrics
- inspect records
- Lighthouse runtime views
- driver configuration

## Common Mistakes

- Do not use events as a substitute for durable background jobs.
- Do not register subscribers in package `init` functions.
- Do not publish from controllers when the service owns the workflow.
- Do not put full user records, tokens, or request payloads in events.
- Do not assume `inproc` events are visible across processes.
- Do not hide critical business workflows only inside subscribers.

## Next Step

Next, dispatch durable work from an event subscriber with [Reports Generate Job](/scenarios/reports-generate-job).
