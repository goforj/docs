---
title: Cache
---

<p align="center">
  <img src="https://raw.githubusercontent.com/goforj/cache/main/docs/images/logo.png?v=1" width="420" alt="cache logo">
</p>

<p align="center">
    cache gives your services one cache API with multiple backend options. Swap drivers without refactoring.
</p>

<p align="center">
    <a href="https://pkg.go.dev/github.com/goforj/cache"><img src="https://pkg.go.dev/badge/github.com/goforj/cache.svg" alt="Go Reference"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
    <a href="https://golang.org"><img src="https://img.shields.io/badge/go-1.24+-blue?logo=go" alt="Go version"></a>
    <img src="https://img.shields.io/github/v/tag/goforj/cache?label=version&sort=semver" alt="Latest tag">
    <a href="https://goreportcard.com/report/github.com/goforj/cache"><img src="https://goreportcard.com/badge/github.com/goforj/cache" alt="Go Report Card"></a>
    <a href="https://codecov.io/gh/goforj/cache"><img src="https://codecov.io/gh/goforj/cache/graph/badge.svg?token=B6ROULLKWU"/></a>
<!-- test-count:embed:start -->
    <img src="https://img.shields.io/badge/unit_tests-186-brightgreen" alt="Unit tests (executed count)">
    <img src="https://img.shields.io/badge/integration_tests-113-blue" alt="Integration tests (executed count)">
<!-- test-count:embed:end -->
</p>

## What cache is {#what-cache-is}
 
An explicit cache abstraction with a minimal Store interface and ergonomic Cache helpers. Drivers are chosen when you construct the store, so swapping backends is a dependency-injection change instead of a refactor.

## Installation {#installation}

```bash
go get github.com/goforj/cache
```

Optional backends are separate modules. Install only what you use:

```bash
go get github.com/goforj/cache/driver/rediscache
go get github.com/goforj/cache/driver/memcachedcache
go get github.com/goforj/cache/driver/natscache
go get github.com/goforj/cache/driver/dynamocache
go get github.com/goforj/cache/driver/sqlitecache
go get github.com/goforj/cache/driver/postgrescache
go get github.com/goforj/cache/driver/mysqlcache
```
 
## Drivers {#drivers}

|                                                                                             Driver / Backend | Mode | Shared | Durable | TTL | Counters | Locks | RateLimit | Prefix | Batch | Shaping | Notes |
|-------------------------------------------------------------------------------------------------------------:| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
|                  <img src="https://img.shields.io/badge/null-9e9e9e?logo=probot&logoColor=white" alt="Null"> | No-op | - | - | - | - | No-op | No-op | ✓ | ✓ | ✓ | Great for tests: cache calls are no-ops and never persist. |
|                   <img src="https://img.shields.io/badge/file-3f51b5?logo=files&logoColor=white" alt="File"> | Local filesystem | - | ✓ | ✓ | ✓ | Local | Local | - | ✓ | ✓ | Simple durability on a single host; set `StoreConfig.FileDir` (or use `NewFileStore`). |
|              <img src="https://img.shields.io/badge/memory-5c5c5c?logo=cachet&logoColor=white" alt="Memory"> | In-process | - | - | ✓ | ✓ | Local | Local | - | ✓ | ✓ | Fastest; per-process only, best for single-node or short-lived data. |
|        <img src="https://img.shields.io/badge/memcached-0198c4?logo=buffer&logoColor=white" alt="Memcached"> | Networked | ✓ | - | ✓ | ✓ | Shared | Shared | ✓ | ✓ | ✓ | TTL resolution is 1s; configure addresses via `memcachedcache.Config.Addresses`. |
|              <img src="https://img.shields.io/badge/redis-%23DC382D?logo=redis&logoColor=white" alt="Redis"> | Networked | ✓ | - | ✓ | ✓ | Shared | Shared | ✓ | ✓ | ✓ | Full feature set; counters refresh TTL (Redis counter TTL granularity currently 1s). |
|                <img src="https://img.shields.io/badge/nats-27AAE1?logo=natsdotio&logoColor=white" alt="NATS"> | Networked | ✓ | - | ✓ | ✓ | Shared | Shared | ✓ | ✓ | ✓ | JetStream KV-backed driver; inject an existing bucket via `natscache.Config.KeyValue`. |
| <img src="https://img.shields.io/badge/dynamodb-4053D6?logo=amazon-dynamodb&logoColor=white" alt="DynamoDB"> | Networked | ✓ | ✓ | ✓ | ✓ | Shared | Shared | ✓ | ✓ | ✓ | Backed by DynamoDB (supports localstack/dynamodb-local). |
|    <img src="https://img.shields.io/badge/sqlite-003B57?logo=sqlite&logoColor=white" alt="SQLite"> | Local / file | - | ✓ | ✓ | ✓ | Local | Local | ✓ | ✓ | ✓ | `sqlitecache` (via `sqlcore`); great for embedded/local durable cache. |
|    <img src="https://img.shields.io/badge/postgres-336791?logo=postgresql&logoColor=white" alt="Postgres"> | Networked | ✓ | ✓ | ✓ | ✓ | Shared | Shared | ✓ | ✓ | ✓ | `postgrescache` (via `sqlcore`); good shared durable backend. |
|    <img src="https://img.shields.io/badge/mysql-4479A1?logo=mysql&logoColor=white" alt="MySQL"> | Networked | ✓ | ✓ | ✓ | ✓ | Shared | Shared | ✓ | ✓ | ✓ | `mysqlcache` (via `sqlcore`); good shared durable backend. |

## Driver constructor quick examples {#driver-constructor-quick-examples}

Use root constructors for in-process backends, and driver-module constructors for external backends.
Driver backends live in separate modules so applications only import/link the optional backend dependencies they actually use.

```go
package main

import (
	"context"
	"fmt"
	"time"

	"github.com/goforj/cache"
	"github.com/goforj/cache/cachecore"
	"github.com/goforj/cache/driver/dynamocache"
	"github.com/goforj/cache/driver/memcachedcache"
	"github.com/goforj/cache/driver/mysqlcache"
	"github.com/goforj/cache/driver/natscache"
	"github.com/goforj/cache/driver/postgrescache"
	"github.com/goforj/cache/driver/rediscache"
	"github.com/goforj/cache/driver/sqlitecache"
)

func main() {
	ctx := context.Background()
	base := cachecore.BaseConfig{DefaultTTL: 5 * time.Minute, Prefix: "app"}

	cache.NewMemoryStore(ctx)               // in-process memory
	cache.NewFileStore(ctx, "./cache-data") // local file-backed
	cache.NewNullStore(ctx)                 // disabled / drop-only

	// Redis (driver-owned connection config; no direct redis client required)
	redisStore := rediscache.New(rediscache.Config{BaseConfig: base, Addr: "127.0.0.1:6379"})
	_ = redisStore

	// Memcached (one or more server addresses)
	memcachedStore := memcachedcache.New(memcachedcache.Config{
		BaseConfig: base,
		Addresses:  []string{"127.0.0.1:11211"},
	})
	_ = memcachedStore

	// NATS JetStream KV (inject a bucket from your NATS setup)
	var kv natscache.KeyValue // create via your NATS JetStream setup
	natsStore := natscache.New(natscache.Config{BaseConfig: base, KeyValue: kv})
	_ = natsStore

	// DynamoDB (auto-creates client when Client is nil)
	dynamoStore, err := dynamocache.New(ctx, dynamocache.Config{
		BaseConfig: base,
		Region:     "us-east-1",
		Table:      "cache_entries",
	})
	fmt.Println(dynamoStore, err)

	// SQLite (via sqlcore)
	sqliteStore, err := sqlitecache.New(sqlitecache.Config{
		BaseConfig: base,
		DSN:        "file::memory:?cache=shared",
		Table:      "cache_entries",
	})
	fmt.Println(sqliteStore, err)

	// Postgres (via sqlcore)
	postgresStore, err := postgrescache.New(postgrescache.Config{
		BaseConfig: base,
		DSN:        "postgres://user:pass@127.0.0.1:5432/app?sslmode=disable",
		Table:      "cache_entries",
	})
	fmt.Println(postgresStore, err)

	// MySQL (via sqlcore)
	mysqlStore, err := mysqlcache.New(mysqlcache.Config{
		BaseConfig: base,
		DSN:        "user:pass@tcp(127.0.0.1:3306)/app?parseTime=true",
		Table:      "cache_entries",
	})
	fmt.Println(mysqlStore, err)
}
```

## Module Layout {#module-layout}

| Category | Module | Purpose |
| --- | --- | --- |
| Core | [github.com/goforj/cache](https://github.com/goforj/cache/tree/main) | Cache API and root-backed stores (memory, file, null) |
| Core | [github.com/goforj/cache/cachecore](https://github.com/goforj/cache/tree/main/cachecore) | Shared contracts, types, and base config |
| Core | [github.com/goforj/cache/cachetest](https://github.com/goforj/cache/tree/main/cachetest) | Shared store contract test harness |
| Optional drivers | [github.com/goforj/cache/driver/*cache](https://github.com/goforj/cache/tree/main/driver) | Backend driver modules |
| Optional drivers | [github.com/goforj/cache/driver/sqlcore](https://github.com/goforj/cache/tree/main/driver/sqlcore) | Shared SQL implementation for dialect wrappers |
| Testing and tooling | [github.com/goforj/cache/integration](https://github.com/goforj/cache/tree/main/integration) | Integration suites (root, all) |
| Testing and tooling | [github.com/goforj/cache/docs](https://github.com/goforj/cache/tree/main/docs) | Docs + benchmark tooling |

## Quick Start {#quick-start}

```go
import (
    "context"
    "fmt"
    "time"

    "github.com/goforj/cache"
    "github.com/goforj/cache/cachecore"
    "github.com/goforj/cache/driver/rediscache"
)

func main() {
    ctx := context.Background()

    store := cache.NewMemoryStoreWithConfig(ctx, cache.StoreConfig{
        BaseConfig: cachecore.BaseConfig{DefaultTTL: 5 * time.Minute},
    })
    c := cache.NewCache(store)

    type Profile struct { Name string `json:"name"` }

    // Typed lifecycle (generic helpers): set -> get -> delete
    _ = cache.Set(c, "user:42:profile", Profile{Name: "Ada"}, time.Minute)
    profile, ok, err := cache.Get[Profile](c, "user:42:profile")
    fmt.Println(err == nil, ok, profile.Name) // true true Ada
    _ = c.Delete("user:42:profile")

    // String lifecycle: set -> get -> delete
    _ = c.SetString("settings:mode", "dark", time.Minute)
    mode, ok, err := c.GetString("settings:mode")
    fmt.Println(err == nil, ok, mode) // true true dark
    _ = c.Delete("settings:mode")

    // Remember pattern.
    profile, err := cache.Remember[Profile](c, "user:42:profile", time.Minute, func() (Profile, error) {
        return Profile{Name: "Ada"}, nil
    })
    fmt.Println(profile.Name) // Ada

    // Switch to Redis (dependency injection, no code changes below).
    store = rediscache.New(rediscache.Config{
        BaseConfig: cachecore.BaseConfig{
            Prefix:     "app",
            DefaultTTL: 5 * time.Minute,
        },
        Addr: "127.0.0.1:6379",
    })
    c = cache.NewCache(store)
}
```

## Config Options {#config-options}

Cache uses explicit config structs throughout, with shared fields embedded via `cachecore.BaseConfig`.

Shared config (embedded by root stores and optional drivers):

```go
type BaseConfig struct {
	DefaultTTL    time.Duration
	Prefix        string
	Compression   CompressionCodec
	MaxValueBytes int
	EncryptionKey []byte
}
```

Root-backed stores use `cache.StoreConfig`:

```go
type StoreConfig struct {
	cachecore.BaseConfig
	MemoryCleanupInterval time.Duration
	FileDir               string
}
```

Typical root constructor usage:

```go
store := cache.NewMemoryStoreWithConfig(ctx, cache.StoreConfig{
	BaseConfig: cachecore.BaseConfig{
		DefaultTTL: 5 * time.Minute,
		Prefix:     "app",
	},
	MemoryCleanupInterval: time.Minute,
})
```

Optional backends use driver-local config types that embed the same `cachecore.BaseConfig` plus backend-specific fields.

Example shapes:

```go
// rediscache.Config (abridged)
type Config struct {
	cachecore.BaseConfig
	Client rediscache.Client
}
```

```go
// sqlitecache.Config (abridged)
type Config struct {
	cachecore.BaseConfig
	DSN   string
	Table string
}
```

See the [API Index](#api-index) `Driver Configs` section for per-driver defaults and compile-checked examples for:
`rediscache`, `memcachedcache`, `natscache`, `dynamocache`, `sqlitecache`, `postgrescache`, `mysqlcache`, and `sqlcore`.

## Behavior Semantics {#behavior-semantics}

For precise runtime semantics, see [Behavior Semantics](https://github.com/goforj/cache/blob/main/docs/behavior-semantics.md):

- TTL/default-TTL matrix by operation/helper
- stale and refresh-ahead behavior and edge cases
- lock and rate-limit guarantees (process-local vs distributed scope)

## Production Guidance {#production-guidance}

For deployment defaults and operational patterns, see [Production Guide](https://github.com/goforj/cache/blob/main/docs/production-guide.md):

- recommended defaults and tuning
- key naming/versioning conventions
- TTL jitter and miss-storm mitigation
- observability instrumentation patterns

## Memoized reads {#memoized-reads}

Wrap any store with `NewMemoStore` to memoize reads within the process; cache is invalidated automatically on write paths.

```go
memoStore := cache.NewMemoStore(store)
memoRepo := cache.NewCache(memoStore)
```

**Staleness note:** memoization is per-process only. Writes that happen in *other* processes (or outside your app) will not invalidate this memo cache. Use it when local staleness is acceptable, or scope it narrowly (e.g., per-request) if multiple writers exist.

## Testing {#testing}

Unit tests cover the public helpers. Shared cross-driver integration coverage runs from the `integration` module (with `testcontainers-go` for container-backed backends):

```bash
cd integration
go test -tags=integration ./all
```

Use `INTEGRATION_DRIVER=sqlitecache` (comma-separated) to select which fixtures run, or use the repo helper:

```bash
bash scripts/test-all-modules.sh
```

## Benchmarks {#benchmarks}

```bash
cd docs
go test -tags benchrender ./bench -run TestRenderBenchmarks -count=1 -v
```

Note: NATS numbers can look slower than Redis/memory because the NATS driver preserves per-operation TTL semantics by storing per-key expiry metadata (envelope encode/decode) and may do extra compare/update steps for some operations.
Generic helper benchmarks (`Get[T]` / `Set[T]`) use the default JSON codec, so compare them against `GetBytes` / `SetBytes` (and `GetString` / `SetString`) when evaluating convenience vs raw-path performance.

<!-- bench:embed:start -->

Note: DynamoDB is intentionally omitted from these local charts because emulator-based numbers are not representative of real AWS latency.

NATS variants in these charts:

- `nats`: per-key TTL semantics using a binary envelope (`magic/expiresAt/value`). This preserves per-key expiry parity with other drivers, with modest metadata overhead.
- `nats_bucket_ttl`: bucket-level TTL mode (`WithNATSBucketTTL(true)`), raw value path; faster but different expiry semantics.

### Latency (ns/op) {#latency-(ns/op)}

![Cache benchmark latency chart](https://raw.githubusercontent.com/goforj/cache/main/docs/bench/benchmarks_ns.svg)

### Iterations (N) {#iterations-(n)}

![Cache benchmark iteration chart](https://raw.githubusercontent.com/goforj/cache/main/docs/bench/benchmarks_ops.svg)

### Allocated Bytes (B/op) {#allocated-bytes-(b/op)}

![Cache benchmark bytes chart](https://raw.githubusercontent.com/goforj/cache/main/docs/bench/benchmarks_bytes.svg)

### Allocations (allocs/op) {#allocations-(allocs/op)}

![Cache benchmark allocs chart](https://raw.githubusercontent.com/goforj/cache/main/docs/bench/benchmarks_allocs.svg)

<!-- bench:embed:end -->

## API reference {#api-reference}

The API section below is autogenerated; do not edit between the markers.

<!-- api:embed:start -->

## API Index {#api-index}

| Group | Functions |
|------:|:-----------|
| **Constructors** | [NewFileStore](#newfilestore) [NewFileStoreWithConfig](#newfilestorewithconfig) [NewMemoryStore](#newmemorystore) [NewMemoryStoreWithConfig](#newmemorystorewithconfig) [NewNullStore](#newnullstore) [NewNullStoreWithConfig](#newnullstorewithconfig) |
| **Core** | [Driver](#cache-driver) [NewCache](#newcache) [NewCacheWithTTL](#newcachewithttl) [Store](#cache-store) |
| **Driver Configs** | [Shared BaseConfig](#driver-configs-shared-baseconfig) [DynamoDB Config](#driver-config-dynamocache) [Memcached Config](#driver-config-memcachedcache) [MySQL Config](#driver-config-mysqlcache) [NATS Config](#driver-config-natscache) [Postgres Config](#driver-config-postgrescache) [Redis Config](#driver-config-rediscache) [SQL Core Config](#driver-config-sqlcore) [SQLite Config](#driver-config-sqlitecache) |
| **Invalidation** | [Delete](#cache-delete) [DeleteMany](#cache-deletemany) [Flush](#cache-flush) [Pull](#pull) [PullBytes](#cache-pullbytes) |
| **Locking** | [Acquire](#lockhandle-acquire) [Block](#lockhandle-block) [Lock](#cache-lock) [LockCtx](#cache-lockctx) [LockHandle.Get](#lockhandle-get) [NewLockHandle](#cache-newlockhandle) [Release](#lockhandle-release) [TryLock](#cache-trylock) [Unlock](#cache-unlock) |
| **Memoization** | [NewMemoStore](#newmemostore) |
| **Observability** | [OnCacheOp](#observerfunc-oncacheop) [WithObserver](#cache-withobserver) |
| **Rate Limiting** | [RateLimit](#cache-ratelimit) |
| **Read Through** | [Remember](#remember) [RememberBytes](#cache-rememberbytes) [RememberStale](#rememberstale) [RememberStaleBytes](#cache-rememberstalebytes) [RememberStaleCtx](#rememberstalectx) |
| **Reads** | [BatchGetBytes](#cache-batchgetbytes) [Get](#get) [GetBytes](#cache-getbytes) [GetJSON](#getjson) [GetString](#cache-getstring) |
| **Refresh Ahead** | [RefreshAhead](#refreshahead) [RefreshAheadBytes](#cache-refreshaheadbytes) [RefreshAheadValueWithCodec](#refreshaheadvaluewithcodec) |
| **Testing Helpers** | [AssertCalled](#fake-assertcalled) [AssertNotCalled](#fake-assertnotcalled) [AssertTotal](#fake-asserttotal) [Cache](#fake-cache) [Count](#fake-count) [New](#new) [Reset](#fake-reset) [Total](#fake-total) |
| **Writes** | [Add](#cache-add) [BatchSetBytes](#cache-batchsetbytes) [Decrement](#cache-decrement) [Increment](#cache-increment) [Set](#set) [SetBytes](#cache-setbytes) [SetJSON](#setjson) [SetString](#cache-setstring) |


_Examples assume `ctx := context.Background()` and `c := cache.NewCache(cache.NewMemoryStore(ctx))` unless shown otherwise._

## Constructors {#constructors}

### NewFileStore {#newfilestore}

NewFileStore is a convenience for a filesystem-backed store.

```go
store := cache.NewFileStore(ctx, "/tmp/my-cache")
fmt.Println(store.Driver()) // file
```

### NewFileStoreWithConfig {#newfilestorewithconfig}

NewFileStoreWithConfig builds a filesystem-backed store using explicit root config.

```go
store := cache.NewFileStoreWithConfig(ctx, cache.StoreConfig{
	BaseConfig: cachecore.BaseConfig{
		EncryptionKey: []byte("01234567890123456789012345678901"),
		MaxValueBytes: 4096,
		Compression:   cache.CompressionGzip,
	},
	FileDir: "/tmp/my-cache",
})
fmt.Println(store.Driver()) // file
```

### NewMemoryStore {#newmemorystore}

NewMemoryStore is a convenience for an in-process store using defaults.

```go
store := cache.NewMemoryStore(ctx)
fmt.Println(store.Driver()) // memory
```

### NewMemoryStoreWithConfig {#newmemorystorewithconfig}

NewMemoryStoreWithConfig builds an in-process store using explicit root config.

```go
store := cache.NewMemoryStoreWithConfig(ctx, cache.StoreConfig{
	BaseConfig: cachecore.BaseConfig{
		DefaultTTL:  30 * time.Second,
		Compression: cache.CompressionGzip,
	},
	MemoryCleanupInterval: 5 * time.Minute,
})
fmt.Println(store.Driver()) // memory
```

### NewNullStore {#newnullstore}

NewNullStore is a no-op store useful for tests where caching should be disabled.

```go
store := cache.NewNullStore(ctx)
fmt.Println(store.Driver()) // null
```

### NewNullStoreWithConfig {#newnullstorewithconfig}

NewNullStoreWithConfig builds a null store with shared wrappers (compression/encryption/limits).

```go
store := cache.NewNullStoreWithConfig(ctx, cache.StoreConfig{
	BaseConfig: cachecore.BaseConfig{
		Compression:   cache.CompressionGzip,
		MaxValueBytes: 1024,
	},
})
fmt.Println(store.Driver()) // null
```

## Core {#core}

### Driver {#cache-driver}

Driver reports the underlying store driver.

### NewCache {#newcache}

NewCache creates a cache facade bound to a concrete store.

```go
s := cache.NewMemoryStore(ctx)
c := cache.NewCache(s)
fmt.Println(c.Driver()) // memory
```

### NewCacheWithTTL {#newcachewithttl}

NewCacheWithTTL lets callers override the default TTL applied when ttl <= 0.

```go
s := cache.NewMemoryStore(ctx)
c := cache.NewCacheWithTTL(s, 2*time.Minute)
fmt.Println(c.Driver(), c != nil) // memory true
```

### Store {#cache-store}

Store returns the underlying store implementation.

```go
fmt.Println(c.Store().Driver()) // memory
```

## Driver Configs {#driver-configs}

Optional backend config examples (compile-checked from generated examples and driver `New(...)` docs).

### Shared `cachecore.BaseConfig` {#driver-configs-shared-baseconfig}

Shared fields are embedded via `cachecore.BaseConfig` on every driver config:

- `DefaultTTL`: defaults to `5*time.Minute` when zero in all optional drivers
- `Prefix`: defaults to `"app"` when empty in all optional drivers
- `Compression`: default zero value (`cachecore.CompressionNone`) unless set
- `MaxValueBytes`: default `0` (no limit) unless set
- `EncryptionKey`: default `nil` (disabled) unless set

### DynamoDB {#driver-config-dynamocache}

Defaults:
- Region: "us-east-1" when empty
- Table: "cache_entries" when empty
- DefaultTTL: 5*time.Minute when zero
- Prefix: "app" when empty
- Client: auto-created when nil (uses Region and optional Endpoint)
- Endpoint: empty by default (normal AWS endpoint resolution)

```go
ctx := context.Background()
store, err := dynamocache.New(ctx, dynamocache.Config{
	BaseConfig: cachecore.BaseConfig{
		DefaultTTL: 5 * time.Minute,
		Prefix:     "app",
	},
	Region: "us-east-1",
	Table:  "cache_entries",
})
if err != nil {
	panic(err)
}
fmt.Println(store.Driver()) // dynamo
```

### Memcached {#driver-config-memcachedcache}

Defaults:
- Addresses: []string{"127.0.0.1:11211"} when empty
- DefaultTTL: 5*time.Minute when zero
- Prefix: "app" when empty

```go
store := memcachedcache.New(memcachedcache.Config{
	BaseConfig: cachecore.BaseConfig{
		DefaultTTL: 5 * time.Minute,
		Prefix:     "app",
	},
	Addresses: []string{"127.0.0.1:11211"},
})
fmt.Println(store.Driver()) // memcached
```

### MySQL {#driver-config-mysqlcache}

Defaults:
- DefaultTTL: 5*time.Minute when zero
- Prefix: "app" when empty
- Table: "cache_entries" when empty
- DSN: required

```go
store, err := mysqlcache.New(mysqlcache.Config{
	BaseConfig: cachecore.BaseConfig{
		DefaultTTL: 5 * time.Minute,
		Prefix:     "app",
	},
	DSN:   "user:pass@tcp(127.0.0.1:3306)/app?parseTime=true",
	Table: "cache_entries",
})
if err != nil {
	panic(err)
}
fmt.Println(store.Driver()) // sql
```

### NATS {#driver-config-natscache}

Defaults:
- DefaultTTL: 5*time.Minute when zero
- Prefix: "app" when empty
- BucketTTL: false (TTL enforced in value envelope metadata)
- KeyValue: required for real operations (nil allowed, operations return errors)

```go
var kv natscache.KeyValue // provided by your NATS setup
store := natscache.New(natscache.Config{
	BaseConfig: cachecore.BaseConfig{
		DefaultTTL: 5 * time.Minute,
		Prefix:     "app",
	},
	KeyValue:  kv,
	BucketTTL: false,
})
fmt.Println(store.Driver()) // nats
```

### Postgres {#driver-config-postgrescache}

Defaults:
- DefaultTTL: 5*time.Minute when zero
- Prefix: "app" when empty
- Table: "cache_entries" when empty
- DSN: required

```go
store, err := postgrescache.New(postgrescache.Config{
	BaseConfig: cachecore.BaseConfig{
		DefaultTTL: 5 * time.Minute,
		Prefix:     "app",
	},
	DSN:   "postgres://user:pass@localhost:5432/app?sslmode=disable",
	Table: "cache_entries",
})
if err != nil {
	panic(err)
}
fmt.Println(store.Driver()) // sql
```

### Redis {#driver-config-rediscache}

Defaults:
- DefaultTTL: 5*time.Minute when zero
- Prefix: "app" when empty
- Addr: empty by default (no client auto-created unless Addr is set)
- Client: optional advanced override (takes precedence when set)
- If neither Client nor Addr is set, operations return errors until a client is provided

```go
store := rediscache.New(rediscache.Config{
	BaseConfig: cachecore.BaseConfig{
		DefaultTTL: 5 * time.Minute,
		Prefix:     "app",
	},
	Addr: "127.0.0.1:6379",
})
fmt.Println(store.Driver()) // redis
```

### SQL Core (advanced/shared implementation) {#driver-config-sqlcore}

Defaults:
- Table: "cache_entries" when empty
- DefaultTTL: 5*time.Minute when zero
- Prefix: "app" when empty
- DriverName: required
- DSN: required

```go
store, err := sqlcore.New(sqlcore.Config{
	BaseConfig: cachecore.BaseConfig{
		DefaultTTL: 5 * time.Minute,
		Prefix:     "app",
	},
	DriverName: "sqlite",
	DSN:        "file::memory:?cache=shared",
	Table:      "cache_entries",
})
if err != nil {
	panic(err)
}
fmt.Println(store.Driver()) // sql
```

### SQLite {#driver-config-sqlitecache}

Defaults:
- DefaultTTL: 5*time.Minute when zero
- Prefix: "app" when empty
- Table: "cache_entries" when empty
- DSN: required

```go
store, err := sqlitecache.New(sqlitecache.Config{
	BaseConfig: cachecore.BaseConfig{
		DefaultTTL: 5 * time.Minute,
		Prefix:     "app",
	},
	DSN:   "file::memory:?cache=shared",
	Table: "cache_entries",
})
if err != nil {
	panic(err)
}
fmt.Println(store.Driver()) // sql
```


## Invalidation {#invalidation}

### Delete (+Ctx) {#cache-delete}

Delete removes a single key.

```go
_ = c.SetBytes("a", []byte("1"), time.Minute)
fmt.Println(c.Delete("a") == nil) // true
```

### DeleteMany (+Ctx) {#cache-deletemany}

DeleteMany removes multiple keys.

```go
fmt.Println(c.DeleteMany("a", "b") == nil) // true
```

### Flush (+Ctx) {#cache-flush}

Flush clears all keys for this store scope.

```go
_ = c.SetBytes("a", []byte("1"), time.Minute)
fmt.Println(c.Flush() == nil) // true
```

### Pull (+Ctx) {#pull}

Pull returns a typed value for key and removes it, using the default codec (JSON).

```go
type Token struct { Value string `json:"value"` }
ctx := context.Background()
c := cache.NewCache(cache.NewMemoryStore(ctx))
_ = cache.Set(c, "reset:token:42", Token{Value: "abc"}, time.Minute)
tok, ok, err := cache.Pull[Token](c, "reset:token:42")
fmt.Println(err == nil, ok, tok.Value) // true true abc
```

### PullBytes (+Ctx) {#cache-pullbytes}

PullBytes returns value and removes it from cache.

```go
_ = c.SetString("reset:token:42", "abc", time.Minute)
body, ok, _ := c.PullBytes("reset:token:42")
fmt.Println(ok, string(body)) // true abc
```

## Locking {#locking}

### Acquire (+Ctx) {#lockhandle-acquire}

Acquire attempts to acquire the lock once (non-blocking).

```go
lock := c.NewLockHandle("job:sync", 10*time.Second)
locked, err := lock.Acquire()
fmt.Println(err == nil, locked) // true true
```

### Block (+Ctx) {#lockhandle-block}

Block waits up to timeout to acquire the lock, runs fn if acquired, then releases.

retryInterval <= 0 falls back to the cache default lock retry interval.

```go
lock := c.NewLockHandle("job:sync", 10*time.Second)
locked, err := lock.Block(500*time.Millisecond, 25*time.Millisecond, func() error {
	// do protected work
	return nil
})
fmt.Println(err == nil, locked) // true true
```

### Lock {#cache-lock}

Lock waits until the lock is acquired or timeout elapses.

```go
locked, err := c.Lock("job:sync", 10*time.Second, time.Second)
fmt.Println(err == nil, locked) // true true
```

### LockCtx {#cache-lockctx}

LockCtx retries lock acquisition until success or context cancellation.

### LockHandle.Get (+Ctx) {#lockhandle-get}

Get acquires the lock once, runs fn if acquired, then releases automatically.

```go
lock := c.NewLockHandle("job:sync", 10*time.Second)
locked, err := lock.Get(func() error {
	// do protected work
	return nil
})
fmt.Println(err == nil, locked) // true true
```

### NewLockHandle {#cache-newlockhandle}

NewLockHandle creates a reusable lock handle for a key/ttl pair.

```go
lock := c.NewLockHandle("job:sync", 10*time.Second)
locked, err := lock.Acquire()
fmt.Println(err == nil, locked) // true true
if locked {
	_ = lock.Release()
}
```

### Release (+Ctx) {#lockhandle-release}

Release unlocks the key if this handle previously acquired it.

It is safe to call multiple times; repeated calls become no-ops after the first
successful release.

```go
lock := c.NewLockHandle("job:sync", 10*time.Second)
locked, _ := lock.Acquire()
if locked {
	_ = lock.Release()
}
```

### TryLock (+Ctx) {#cache-trylock}

TryLock acquires a short-lived lock key when not already held.

```go
locked, _ := c.TryLock("job:sync", 10*time.Second)
fmt.Println(locked) // true
```

### Unlock (+Ctx) {#cache-unlock}

Unlock releases a previously acquired lock key.

```go
locked, _ := c.TryLock("job:sync", 10*time.Second)
if locked {
	_ = c.Unlock("job:sync")
}
```

## Memoization {#memoization}

### NewMemoStore {#newmemostore}

NewMemoStore decorates store with per-process read memoization.

Behavior:
- First Get hits the backing store, clones the value, and memoizes it in-process.
- Subsequent Get for the same key returns the memoized clone (no backend call).
- Any write/delete/flush invalidates the memo entry so local reads stay in sync
with changes made through this process.
- Memo data is per-process only; other processes or external writers will not
invalidate it. Use only when that staleness window is acceptable.

```go
base := cache.NewMemoryStore(ctx)
memo := cache.NewMemoStore(base)
c := cache.NewCache(memo)
fmt.Println(c.Driver()) // memory
```

## Observability {#observability}

### OnCacheOp {#observerfunc-oncacheop}

OnCacheOp implements Observer.

```go
obs := cache.ObserverFunc(func(ctx context.Context, op, key string, hit bool, err error, dur time.Duration, driver cachecore.Driver) {
	fmt.Println(op, key, hit, err == nil, driver)
	_ = ctx
	_ = dur
})
obs.OnCacheOp(context.Background(), "get", "user:42", true, nil, time.Millisecond, cachecore.DriverMemory)
```

### WithObserver {#cache-withobserver}

WithObserver attaches an observer to receive operation events.

```go
c = c.WithObserver(cache.ObserverFunc(func(ctx context.Context, op, key string, hit bool, err error, dur time.Duration, driver cachecore.Driver) {
	// See docs/production-guide.md for a real metrics recipe.
	fmt.Println(op, driver, hit, err == nil)
	_ = ctx
	_ = key
	_ = dur
}))
_, _, _ = c.GetBytes("profile:42")
```

## Rate Limiting {#rate-limiting}

### RateLimit (+Ctx) {#cache-ratelimit}

RateLimit increments a fixed-window counter and returns allowance metadata.

```go
res, err := c.RateLimit("rl:api:ip:1.2.3.4", 100, time.Minute)
fmt.Println(err == nil, res.Allowed, res.Count, res.Remaining, !res.ResetAt.IsZero())
// Output: true true 1 99 true
```

## Read Through {#read-through}

### Remember (+Ctx) {#remember}

Remember is the ergonomic, typed remember helper using JSON encoding by default.

```go
type Profile struct { Name string `json:"name"` }
ctx := context.Background()
c := cache.NewCache(cache.NewMemoryStore(ctx))
profile, err := cache.Remember[Profile](c, "profile:42", time.Minute, func() (Profile, error) {
	return Profile{Name: "Ada"}, nil
})
fmt.Println(err == nil, profile.Name) // true Ada
```

### RememberBytes (+Ctx) {#cache-rememberbytes}

RememberBytes returns key value or computes/stores it when missing.

```go
data, err := c.RememberBytes("dashboard:summary", time.Minute, func() ([]byte, error) {
	return []byte("payload"), nil
})
fmt.Println(err == nil, string(data)) // true payload
```

### RememberStale {#rememberstale}

RememberStale returns a typed value with stale fallback semantics using JSON encoding by default.

```go
type Profile struct { Name string `json:"name"` }
ctx := context.Background()
c := cache.NewCache(cache.NewMemoryStore(ctx))
profile, usedStale, err := cache.RememberStale[Profile](c, "profile:42", time.Minute, 10*time.Minute, func() (Profile, error) {
	return Profile{Name: "Ada"}, nil
})
fmt.Println(err == nil, usedStale, profile.Name) // true false Ada
```

### RememberStaleBytes (+Ctx) {#cache-rememberstalebytes}

RememberStaleBytes returns a fresh value when available, otherwise computes and caches it.
If computing fails and a stale value exists, it returns the stale value.
The returned bool is true when a stale fallback was used.

```go
body, usedStale, err := c.RememberStaleBytes("profile:42", time.Minute, 10*time.Minute, func() ([]byte, error) {
	return []byte(`{"name":"Ada"}`), nil
})
fmt.Println(err == nil, usedStale, len(body) > 0)
```

### RememberStaleCtx {#rememberstalectx}

RememberStaleCtx returns a typed value with stale fallback semantics using JSON encoding by default.

```go
type Profile struct { Name string `json:"name"` }
ctx := context.Background()
c := cache.NewCache(cache.NewMemoryStore(ctx))
profile, usedStale, err := cache.RememberStaleCtx[Profile](ctx, c, "profile:42", time.Minute, 10*time.Minute, func(ctx context.Context) (Profile, error) {
	return Profile{Name: "Ada"}, nil
})
fmt.Println(err == nil, usedStale, profile.Name) // true false Ada
```

## Reads {#reads}

### BatchGetBytes (+Ctx) {#cache-batchgetbytes}

BatchGetBytes returns all found values for the provided keys.
Missing keys are omitted from the returned map.

```go
_ = c.SetBytes("a", []byte("1"), time.Minute)
_ = c.SetBytes("b", []byte("2"), time.Minute)
values, err := c.BatchGetBytes("a", "b", "missing")
fmt.Println(err == nil, string(values["a"]), string(values["b"])) // true 1 2
```

### Get (+Ctx) {#get}

Get returns a typed value for key using the default codec (JSON) when present.

```go
type Profile struct { Name string `json:"name"` }
ctx := context.Background()
c := cache.NewCache(cache.NewMemoryStore(ctx))
_ = cache.Set(c, "profile:42", Profile{Name: "Ada"}, time.Minute)
_ = cache.Set(c, "settings:mode", "dark", time.Minute)
profile, ok, err := cache.Get[Profile](c, "profile:42")
mode, ok2, err2 := cache.Get[string](c, "settings:mode")
fmt.Println(err == nil, ok, profile.Name, err2 == nil, ok2, mode) // true true Ada true true dark
```

### GetBytes (+Ctx) {#cache-getbytes}

GetBytes returns raw bytes for key when present.

```go
s := cache.NewMemoryStore(ctx)
c := cache.NewCache(s)
_ = c.SetBytes("user:42", []byte("Ada"), 0)
value, ok, _ := c.GetBytes("user:42")
fmt.Println(ok, string(value)) // true Ada
```

### GetJSON (+Ctx) {#getjson}

GetJSON decodes a JSON value into T when key exists, using background context.

```go
type Profile struct { Name string `json:"name"` }
ctx := context.Background()
c := cache.NewCache(cache.NewMemoryStore(ctx))
_ = cache.SetJSON(c, "profile:42", Profile{Name: "Ada"}, time.Minute)
profile, ok, err := cache.GetJSON[Profile](c, "profile:42")
fmt.Println(err == nil, ok, profile.Name) // true true Ada
```

### GetString (+Ctx) {#cache-getstring}

GetString returns a UTF-8 string value for key when present.

```go
_ = c.SetString("user:42:name", "Ada", 0)
name, ok, _ := c.GetString("user:42:name")
fmt.Println(ok, name) // true Ada
```

## Refresh Ahead {#refresh-ahead}

### RefreshAhead (+Ctx) {#refreshahead}

RefreshAhead returns a typed value and refreshes asynchronously when near expiry.

```go
type Summary struct { Text string `json:"text"` }
ctx := context.Background()
c := cache.NewCache(cache.NewMemoryStore(ctx))
s, err := cache.RefreshAhead[Summary](c, "dashboard:summary", time.Minute, 10*time.Second, func() (Summary, error) {
	return Summary{Text: "ok"}, nil
})
fmt.Println(err == nil, s.Text) // true ok
```

### RefreshAheadBytes (+Ctx) {#cache-refreshaheadbytes}

RefreshAheadBytes returns cached value immediately and refreshes asynchronously when near expiry.
On miss, it computes and stores synchronously.

```go
body, err := c.RefreshAheadBytes("dashboard:summary", time.Minute, 10*time.Second, func() ([]byte, error) {
	return []byte("payload"), nil
})
fmt.Println(err == nil, len(body) > 0) // true true
```

### RefreshAheadValueWithCodec {#refreshaheadvaluewithcodec}

RefreshAheadValueWithCodec allows custom encoding/decoding for typed refresh-ahead operations.

## Testing Helpers {#testing-helpers}

### AssertCalled {#fake-assertcalled}

AssertCalled verifies key was touched by op the expected number of times.

```go
f := cachefake.New()
c := f.Cache()
_ = c.SetString("settings:mode", "dark", 0)
t := &testing.T{}
f.AssertCalled(t, cachefake.OpSet, "settings:mode", 1)
```

### AssertNotCalled {#fake-assertnotcalled}

AssertNotCalled ensures key was never touched by op.

```go
f := cachefake.New()
t := &testing.T{}
f.AssertNotCalled(t, cachefake.OpDelete, "settings:mode")
```

### AssertTotal {#fake-asserttotal}

AssertTotal ensures the total call count for an op matches times.

```go
f := cachefake.New()
c := f.Cache()
_ = c.Delete("a")
_ = c.Delete("b")
t := &testing.T{}
f.AssertTotal(t, cachefake.OpDelete, 2)
```

### Cache {#fake-cache}

Cache returns the cache facade to inject into code under test.

```go
f := cachefake.New()
c := f.Cache()
_, _, _ = c.GetBytes("settings:mode")
```

### Count {#fake-count}

Count returns calls for op+key.

```go
f := cachefake.New()
c := f.Cache()
_ = c.SetString("settings:mode", "dark", 0)
n := f.Count(cachefake.OpSet, "settings:mode")
_ = n
```

### New {#new}

New creates a Fake using an in-memory store.

```go
f := cachefake.New()
c := f.Cache()
_ = c.SetString("settings:mode", "dark", 0)
```

### Reset {#fake-reset}

Reset clears recorded counts.

```go
f := cachefake.New()
_ = f.Cache().SetString("settings:mode", "dark", 0)
f.Reset()
```

### Total {#fake-total}

Total returns total calls for an op across keys.

```go
f := cachefake.New()
c := f.Cache()
_ = c.Delete("a")
_ = c.Delete("b")
n := f.Total(cachefake.OpDelete)
_ = n
```

## Writes {#writes}

### Add (+Ctx) {#cache-add}

Add writes value only when key is not already present.

```go
created, _ := c.Add("boot:seeded", []byte("1"), time.Hour)
fmt.Println(created) // true
```

### BatchSetBytes (+Ctx) {#cache-batchsetbytes}

BatchSetBytes writes many key/value pairs using a shared ttl.

```go
err := c.BatchSetBytes(map[string][]byte{
	"a": []byte("1"),
	"b": []byte("2"),
}, time.Minute)
fmt.Println(err == nil) // true
```

### Decrement (+Ctx) {#cache-decrement}

Decrement decrements a numeric value and returns the result.

```go
val, _ := c.Decrement("rate:login:42", 1, time.Minute)
fmt.Println(val) // -1
```

### Increment (+Ctx) {#cache-increment}

Increment increments a numeric value and returns the result.

```go
val, _ := c.Increment("rate:login:42", 1, time.Minute)
fmt.Println(val) // 1
```

### Set (+Ctx) {#set}

Set encodes value with the default codec (JSON) and writes it to key.

```go
type Settings struct { Enabled bool `json:"enabled"` }
ctx := context.Background()
c := cache.NewCache(cache.NewMemoryStore(ctx))
err := cache.Set(c, "settings:alerts", Settings{Enabled: true}, time.Minute)
err2 := cache.Set(c, "settings:mode", "dark", time.Minute)
fmt.Println(err == nil, err2 == nil) // true true
```

### SetBytes (+Ctx) {#cache-setbytes}

SetBytes writes raw bytes to key.

```go
fmt.Println(c.SetBytes("token", []byte("abc"), time.Minute) == nil) // true
```

### SetJSON (+Ctx) {#setjson}

SetJSON encodes value as JSON and writes it to key using background context.

```go
type Settings struct { Enabled bool `json:"enabled"` }
ctx := context.Background()
c := cache.NewCache(cache.NewMemoryStore(ctx))
err := cache.SetJSON(c, "settings:alerts", Settings{Enabled: true}, time.Minute)
fmt.Println(err == nil) // true
```

### SetString (+Ctx) {#cache-setstring}

SetString writes a string value to key.

```go
fmt.Println(c.SetString("user:42:name", "Ada", time.Minute) == nil) // true
```
<!-- api:embed:end -->

### Payload size caps (effective bytes written) {#payload-size-caps-(effective-bytes-written)}

| Driver | Hard / default cap | Configurable | Notes |
| ---: | :--- | :---: | :--- |
| **Null** | N/A | N/A | No persistence. |
| **Memory** | Process memory | - | No backend hard cap. |
| **File** | Disk / filesystem | - | No backend hard cap. |
| **Redis** | Backend practical (memory/SLO) | Server-side | No commonly hit low per-value hard cap in app use. |
| **NATS** | Server/bucket payload limits | Server-side | Depends on NATS/JetStream config. |
| **Memcached** | ~1 MiB per item (default) | ✓ (server `-I`) | Backend-enforced item limit. |
| **DynamoDB** | 400 KB item hard cap | No | Includes key/metadata overhead, so usable value bytes are lower. |
| **SQL** | DB/engine config dependent | Server-side | Blob/row/packet limits vary by engine and deployment. |

`StoreConfig.MaxValueBytes` (root-backed stores) is the uniform application-level cap, and it applies to post-shaping bytes (after compression/encryption overhead).

## Integration Coverage {#integration-coverage}

| **Area** | What is validated | Scope |
| ---: | :--- | :--- |
| Core store contract | `Set/Get`, TTL expiry, `Add`, counters, `Delete/DeleteMany`, `Flush`, typed `Remember` | All drivers |
| Option contracts | `prefix`, `compression`, `encryption`, `prefix+compression+encryption`, `max_value_bytes`, `default_ttl` | All drivers (per option case) |
| Locking | single-winner contention, timeout/cancel, TTL expiry reacquire, unlock safety | All drivers |
| Rate limiting | monotonic counts, `remaining >= 0`, window rollover reset | All drivers |
| Refresh-ahead | miss/hit behavior, async refresh success/error, malformed metadata handling | All drivers |
| Remember stale | stale fallback semantics, TTL interactions, stale/fresh independent expiry, joined errors | All drivers |
| Batch ops | partial misses, empty input behavior, default TTL application | All drivers |
| Counter semantics | signed deltas, zero delta, TTL refresh extension | All drivers |
| Context cancellation | `GetCtx/SetCtx/LockCtx/RefreshAheadCtx/Remember*Ctx` prompt return + driver-aware cancel semantics | All drivers (driver-aware assertions) |
| Latency / transient faults | injected slow `Get/Add/Increment`, timeout propagation, no hidden retries for `RefreshAhead/Remember*/LockCtx/RateLimit*` | All drivers (integration wrappers over real stores) |
| Prefix isolation | `Delete/Flush` isolation + helper-generated keys (`__lock:`, `:__refresh_exp`, `:__stale`, rate-limit buckets) | Shared/prefixed backends |
| Payload shaping / corruption | compression+encryption round-trips, corrupted compressed/encrypted payload errors | Shared/persistent backends |
| Payload size limits | large binary payload round-trips; backend-specific near/over-limit checks (Memcached, DynamoDB) | Driver-specific where meaningful |
| Cross-store scope | shared vs local semantics across store instances (e.g. rate-limit counters) | Driver-specific expectations |
| Backend fault / recovery | backend restart mid-suite, outage errors, post-recovery round-trip/lock/refresh/stale flows | Container-backed drivers (runs automatically when container-backed fixtures are selected) |
| Observer metadata | op names, hit/miss flags, propagated errors, driver labels | Unit contract tests (integration helper paths exercise emissions indirectly) |
| Memo store caveats | per-process memoization, local-only invalidation, cross-process staleness behavior | Unit tests |

Default integration runs cover the contract suite above. Fault/recovery restart tests run automatically when the selected integration suite includes container-backed fixtures.

## Contributing (README updates) {#contributing-(readme-updates)}

README content is a mix of generated sections and manual sections.

- API reference (`<!-- api:embed:start --> ... <!-- api:embed:end -->`) is generated.
- Test badges are updated separately.
- Sections like driver notes and the integration coverage table are manual.

### Update generated API docs {#update-generated-api-docs}

```bash
go run ./docs/readme/main.go
```

### Update test badges {#update-test-badges}

Static counts (fast, watcher-friendly; counts top-level `Test*` funcs):

```bash
go run ./docs/readme/main.go
```

Executed counts (runs tests and counts real `go test -json` test/subtest starts):

```bash
go run ./docs/readme/testcounts/main.go
```

### Watch mode {#watch-mode}

```bash
./docs/watcher.sh
```

Notes:

- The badge watcher runs real tests, so it is slower than API/example regeneration.
- Fault/recovery integration tests run with the integration suite when container-backed fixtures are selected.
