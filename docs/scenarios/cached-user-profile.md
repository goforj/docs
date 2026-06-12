---
title: Cached User Profile
description: Add a repository and named cache resource to the JSON API route scenario.
---

# Cached User Profile

::: info Verified Scenario
This page is generated from an executable spec. An automated suite renders a fresh App from the current GoForj templates, applies every step below in order, and runs every verification command. If any step fails, the page does not ship.
:::

Scenario 2 of 7 in the [verified path](/scenarios/). Plan on about 15 minutes.

This scenario extends the JSON API route with a repository and a named cache resource.

The source repository remains the source of truth. A cached repository wrapper owns the cache-aside access pattern so the service can keep depending on the `UserRepository` contract.

## What You Will Build

- `MemoryUserRepository` owns source-of-truth reads.
- `CachedUserRepository` checks the named `profiles` cache before reading the source repository.
- `CACHE_PROFILES_*` defines the named cache resource.
- Wire provides the source repository, named cache, cached repository, and service.
- A repository test proves cache-aside behavior without starting HTTP.

## Prerequisites

Complete [JSON API Route](/scenarios/json-api-route) first.

The generated App should have cache support enabled. Verify that the default cache manager exists:

```text
internal/caches
```

## Golden Path State

Before this scenario, `GET /api/v1/users/:id` returns a hard-coded user through a service.

After this scenario, user lookup has a repository boundary and a named `profiles` cache. The controller still depends only on the service, and the service remains testable without starting HTTP.

## Files

This scenario edits or creates:

**Configuration**

```text
.env
```

**Users feature**

```text
internal/users/repository.go
internal/users/repository_test.go
internal/users/service.go
internal/users/service_test.go
```

**App wiring**

```text
app/wire/inject_services_app.go
```

The cache generator updates:

```text
internal/caches/accessors_gen.go
internal/caches/manager_gen.go
```

Do not edit generated cache files by hand.

## Step 1: Add A Named Cache

Add a named `profiles` cache to `.env`, then run the build pipeline so the generated App exposes `app.Caches().Profiles()`.

Append to `.env`:

```dotenv
CACHE_PROFILES_DRIVER=memory
CACHE_PROFILES_DEFAULT_TTL_SECONDS=300
CACHE_PROFILES_PREFIX=profiles
```

```bash
forj build
```

## Step 2: Add The Repository

Create `internal/users/repository.go`.

This keeps persistence and cache-aside reads behind a repository boundary. A later database-backed source repository can replace `MemoryUserRepository` without changing the controller or service.

Create or replace `internal/users/repository.go`:

```go
package users

import (
	"context"
	"fmt"
	"time"

	"github.com/goforj/cache"
)

const profileCacheTTL = 5 * time.Minute

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

type CachedUserRepository struct {
	source       UserRepository
	profileCache *cache.Cache
}

func NewCachedUserRepository(source UserRepository, profileCache *cache.Cache) *CachedUserRepository {
	return &CachedUserRepository{
		source:       source,
		profileCache: profileCache,
	}
}

func (r *CachedUserRepository) Find(ctx context.Context, id string) (User, error) {
	key := profileCacheKey(id)

	user, ok, err := cache.Get[User](r.profileCache.WithContext(ctx), key)
	if err != nil {
		return User{}, fmt.Errorf("read user profile cache: %w", err)
	}
	if ok {
		return user, nil
	}

	user, err = r.source.Find(ctx, id)
	if err != nil {
		return User{}, err
	}

	if err := cache.Set(r.profileCache.WithContext(ctx), key, user, profileCacheTTL); err != nil {
		return User{}, fmt.Errorf("write user profile cache: %w", err)
	}

	return user, nil
}

func profileCacheKey(id string) string {
	return "users:" + id + ":profile"
}
```

## Step 3: Use The Repository In The Service

Replace `internal/users/service.go`.

The service owns user behavior. The repository owns read access, including cache-aside lookup. The controller continues to call `service.Find`.

Create or replace `internal/users/service.go`:

```go
package users

import (
	"context"
	"errors"
)

var ErrUserNotFound = errors.New("user not found")

type User struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type Service struct {
	repo UserRepository
}

func NewService(repo UserRepository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Find(ctx context.Context, id string) (User, error) {
	if id == "" {
		return User{}, ErrUserNotFound
	}

	return s.repo.Find(ctx, id)
}
```

## Step 4: Wire The Repository and Cache

Open `app/wire/inject_services_app.go`.

The service depends only on `users.UserRepository`. The provider composes the source repository with the cached repository. The cached repository depends on `*cache.Cache`, not a Redis, file, or memory driver. Driver choice stays in configuration.

Update `app/wire/inject_services_app.go` so it includes:

```go
import (
        "github.com/goforj/cache"
```

## Step 5: Add Repository Providers

Add the source repository, cached repository provider, and named cache provider.

Update `app/wire/inject_services_app.go` so it includes:

```go
provideUserProfileCache,
users.NewMemoryUserRepository,
provideUserRepository,
users.NewService,
```

## Step 6: Add Provider Functions

`provideUserProfileCache` selects the named resource. `provideUserRepository` keeps the service wired to the repository interface.

Update `app/wire/inject_services_app.go` so it includes:

```go
func provideUserRepository(source *users.MemoryUserRepository, profileCache *cache.Cache) users.UserRepository {
        return users.NewCachedUserRepository(source, profileCache)
}

func provideUserProfileCache(manager *caches.Manager) *cache.Cache {
        return manager.Profiles()
}

func provideInspectManager(caches *caches.Manager) *inspects.Manager {
```

## Step 7: Add Repository Tests

Create `internal/users/repository_test.go`.

The repository test uses the same cache package as the App, but it does not start the runtime or require Redis.

Create or replace `internal/users/repository_test.go`:

```go
package users

import (
	"context"
	"testing"

	"github.com/goforj/cache"
)

func TestCachedUserRepositoryFindsAndCachesUser(t *testing.T) {
	ctx := context.Background()
	profileCache := cache.NewCache(cache.NewMemoryStore(ctx))
	repo := NewCachedUserRepository(NewMemoryUserRepository(), profileCache)

	user, err := repo.Find(ctx, "42")
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
```

## Step 8: Update The Service Test

Keep the service test focused on service behavior.

Create or replace `internal/users/service_test.go`:

```go
package users

import (
	"context"
	"testing"
)

func TestServiceRejectsEmptyID(t *testing.T) {
	ctx := context.Background()
	service := NewService(NewMemoryUserRepository())

	_, err := service.Find(ctx, "")
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

- `/api/v1/users/:id`

## Try The Route

Run the HTTP server:

```bash
forj api
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

## Operations

Operational notes:

- `profiles` is a named cache resource and appears in generated cache accessors.
- Cache operation metrics and inspect records can use the named resource.
- Keep cache keys bounded and predictable; do not use raw emails, tokens, or arbitrary request payloads as resource names or metric labels.
- Keep cache-aside behavior in the repository layer when it is part of read access.

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

Business code does not change. The service still receives `UserRepository`; the cached repository receives `*cache.Cache`.

## Common Mistakes

::: warning Common mistakes
- Do not treat cache as source-of-truth storage.
- Do not import Redis, Memcached, or SQL cache drivers into repositories or services.
- Do not make `UserService` know about cache-aside reads when the repository can own that access pattern.
- Do not edit generated cache accessors by hand.
- Do not forget `forj build` after adding `CACHE_PROFILES_*`.
- Do not hide repository behavior inside the controller.
:::

## Next Steps

- Next, add [File Upload To Storage](/scenarios/file-upload-storage) with a named storage disk.
