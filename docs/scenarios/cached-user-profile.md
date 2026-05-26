---
title: Cached User Profile
description: Add a repository and named cache resource to the JSON API route scenario.
---

# Cached User Profile

This scenario extends the JSON API route with a repository and a named cache resource.

The repository remains the source of truth. The cache stores short-lived derived user profile data so the service can avoid repeated repository reads.

## What You Will Build

- `UserRepository` owns source-of-truth reads.
- `UserService` checks `app.Caches().Profiles()` before reading the repository.
- `CACHE_PROFILES_*` defines the named cache resource.
- Wire provides the repository, named cache, and service.
- A service test proves cache-aside behavior without starting HTTP.

## Prerequisites

Complete [JSON API Route](/scenarios/json-api-route) first.

The generated App should have cache support enabled. Verify that the default cache manager exists:

```text
internal/caches
```

## Files

This scenario edits or creates:

```text
.env
internal/users/repository.go
internal/users/service.go
internal/users/service_test.go
wire/inject_app_services.go
```

The cache generator updates:

```text
internal/caches/accessors_gen.go
internal/caches/manager_gen.go
```

Do not edit generated cache files by hand.

## Step 1: Add A Named Cache

Add a named `profiles` cache to `.env`:

```dotenv
CACHE_PROFILES_DRIVER=memory
CACHE_PROFILES_DEFAULT_TTL_SECONDS=300
CACHE_PROFILES_PREFIX=profiles
```

If your App uses `CACHE_SUPPORTED_DRIVERS`, make sure `memory` is included:

```dotenv
CACHE_SUPPORTED_DRIVERS=memory
```

Run the build pipeline:

```bash
forj build
```

::: info Dev Loop
During `forj dev`, the generated build watcher normally runs `forj build` for you.
:::

After generation, the App should expose:

```go
app.Caches().Profiles()
```

## Step 2: Add The Repository

Create `internal/users/repository.go`:

```go
package users

import "context"

type UserRepository interface {
	Find(ctx context.Context, id string) (User, error)
}

type MemoryUserRepository struct {
	users map[string]User
}

func NewMemoryUserRepository() *MemoryUserRepository {
	return &MemoryUserRepository{
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
	user, ok := r.users[id]
	if !ok {
		return User{}, ErrUserNotFound
	}
	return user, nil
}
```

This keeps persistence behind a repository boundary. A later database-backed repository can replace it without changing the controller.

## Step 3: Use Cache In The Service

Replace `internal/users/service.go` with:

```go
package users

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/goforj/cache"
)

var ErrUserNotFound = errors.New("user not found")

const profileCacheTTL = 5 * time.Minute

type User struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type Service struct {
	repo         UserRepository
	profileCache *cache.Cache
}

func NewService(repo UserRepository, profileCache *cache.Cache) *Service {
	return &Service{
		repo:         repo,
		profileCache: profileCache,
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

func profileCacheKey(id string) string {
	return "users:" + id + ":profile"
}
```

The service still owns the workflow. The controller continues to call `service.Find`.

## Step 4: Wire the Repository and Cache

Open `wire/inject_app_services.go`.

Add imports for cache manager and users:

```go
import (
	"github.com/goforj/cache"

	"your/module/internal/caches"
	"your/module/internal/users"
)
```

Add the providers:

```go
var appSet = wire.NewSet(
	provideCacheManager,
	provideStorageManager,
	provideEventManager,
	provideInspectManager,
	provideUserProfileCache,
	users.NewMemoryUserRepository,
	wire.Bind(new(users.UserRepository), new(*users.MemoryUserRepository)),
	users.NewService,
	// existing providers...
)

func provideUserProfileCache(manager *caches.Manager) *cache.Cache {
	return manager.Profiles()
}
```

The service depends on `*cache.Cache`, not a Redis, file, or memory driver. Driver choice stays in configuration.

## Step 5: Build

Run:

```bash
forj build
```

This refreshes named cache accessors, regenerates Wire, builds API index artifacts, and builds the App.

## Verify

Run:

```bash
forj run route:list
```

Then serve HTTP:

```bash
forj run api
```

Request the profile twice:

```bash
curl http://localhost:3000/api/v1/users/42
curl http://localhost:3000/api/v1/users/42
```

Both responses should return:

```json
{"id":"42","name":"Ada Lovelace","email":"ada@example.test"}
```

The first request reads from the repository and writes the cache. The second request can return from `profiles` cache.

## Test The Service

Replace `internal/users/service_test.go` with:

```go
package users

import (
	"context"
	"testing"

	"github.com/goforj/cache"
)

func TestServiceFindsAndCachesUser(t *testing.T) {
	ctx := context.Background()
	profileCache := cache.NewCache(cache.NewMemoryStore(ctx))
	repo := NewMemoryUserRepository()
	service := NewService(repo, profileCache)

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

func TestServiceRejectsEmptyID(t *testing.T) {
	ctx := context.Background()
	service := NewService(
		NewMemoryUserRepository(),
		cache.NewCache(cache.NewMemoryStore(ctx)),
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

The test uses the same cache package as the App, but it does not start the runtime or require Redis.

## Swap The Driver

To use Redis in production, compile Redis support and select it for the named cache:

```dotenv
CACHE_SUPPORTED_DRIVERS=memory,redis
CACHE_PROFILES_DRIVER=redis
CACHE_PROFILES_ADDR=redis:6379
```

Then run:

```bash
forj build
```

Business code does not change. The service still receives `*cache.Cache`.

## Operations

The `profiles` cache is a named resource.

That means it can appear in:

- generated cache accessors
- cache operation metrics
- inspect records
- Lighthouse runtime views
- driver configuration

Keep cache keys bounded and predictable. Use IDs inside keys when needed, but do not use raw emails, tokens, arbitrary request payloads, or unbounded values as resource names or metric labels.

## Common Mistakes

- Do not treat cache as source-of-truth storage.
- Do not import Redis, Memcached, or SQL cache drivers into `UserService`.
- Do not edit generated cache accessors by hand.
- Do not forget `forj build` after adding `CACHE_PROFILES_*`.
- Do not hide repository behavior inside the controller.

## Next Step

Next, add [File Upload To Storage](/scenarios/file-upload-storage) with a named storage disk.
