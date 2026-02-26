---
title: Env
---

<p align="center">
  <img src="https://raw.githubusercontent.com/goforj/env/main/docs/images/logo.png?v=2" width="400" alt="goforj/env logo">
</p>

<p align="center">
    Typed environment variables for Go - safe defaults, app env helpers, and zero-ceremony configuration.
</p>

<p align="center">
    <a href="https://pkg.go.dev/github.com/goforj/env/v2"><img src="https://pkg.go.dev/badge/github.com/goforj/env/v2.svg" alt="Go Reference"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
    <a href="https://github.com/goforj/env/actions"><img src="https://github.com/goforj/env/actions/workflows/test.yml/badge.svg" alt="Go Test"></a>
    <a href="https://golang.org"><img src="https://img.shields.io/badge/go-1.18+-blue?logo=go" alt="Go version"></a>
    <img src="https://img.shields.io/github/v/tag/goforj/env?label=version&sort=semver" alt="Latest tag">
    <a href="https://codecov.io/gh/goforj/env" ><img src="https://codecov.io/github/goforj/env/graph/badge.svg?token=M7EFUVV1XW"/></a>
    <a href="https://goreportcard.com/report/github.com/goforj/env/v2"><img src="https://goreportcard.com/badge/github.com/goforj/env/v2" alt="Go Report Card"></a>
</p>

<p align="center">
  <code>env</code> provides strongly-typed access to environment variables with predictable fallbacks.  
  Eliminate string parsing, centralize app environment checks, and keep configuration boring.  
  Designed to feel native to Go - and invisible when things are working.
</p>

# Features {#features}

- **Strongly typed getters** - `int`, `bool`, `float`, `duration`, slices, maps
- **Safe fallbacks** - never panic, never accidentally empty
- **Application environment helpers** - `local`, `staging`, `production`
- **Minimal dependencies** - Pure Go, lightweight, minimal surface area
- **Framework-agnostic** - works with any Go app
- **Enum validation** - constrain values with allowed sets
- **Predictable behavior** - no magic, no global state surprises
- **Composable building block** - ideal for config structs and startup wiring

## Why env? {#why-env?}

Accessing environment variables in Go often leads to:

- Repeated parsing logic
- Unsafe string conversions
- Inconsistent defaults
- Scattered app environment checks

**env** solves this by providing **typed accessors with fallbacks**, so configuration stays boring and predictable.

## Features {#features-2}

- Strongly typed getters (`int`, `bool`, `duration`, slices, maps)
- Safe fallbacks (never panic, never empty by accident)
- App environment helpers (`local`, `staging`, `production`)
- Zero dependencies
- Framework-agnostic

## Installation {#installation}

```bash
go get github.com/goforj/env/v2
````

## Quickstart {#quickstart}

```go
package main

import (
	"log"
	"time"

	"github.com/goforj/env/v2"
)

func init() {
	if err := env.LoadEnvFileIfExists(); err != nil {
		log.Fatalf("load env: %v", err)
	}
}

func main() {
    addr := env.Get("ADDR", "127.0.0.1:8080")
    debug := env.GetBool("DEBUG", "false")
    timeout := env.GetDuration("HTTP_TIMEOUT", "5s")
    
    env.Dump(addr, debug, timeout)
    // #string "127.0.0.1:8080"
    // #bool false
    // #time.Duration 5s
    
    env.Dump("container?", env.IsContainer())
    // #string "container?"
    // #bool false
}
```

### Full kitchen-sink example {#full-kitchen-sink-example}

See [examples/kitchensink/main.go](https://github.com/goforj/env/blob/main/examples/kitchensink/main.go) for a runnable program that exercises almost every helper (env loading, typed getters, must-getters, runtime + container detection, and the `env.Dump` wrapper) with deterministic godump output.

## Environment file loading {#environment-file-loading}

This package uses `github.com/joho/godotenv` for `.env` file loading.

It is intentionally composed into the runtime detection and APP_ENV model rather than reimplemented.

## Runnable examples {#runnable-examples}

Every function has a corresponding runnable example under [`./examples`](https://github.com/goforj/env/tree/main/examples).

These examples are **generated directly from the documentation blocks** of each function, ensuring the docs and code never drift. These are the same examples you see here in the README and GoDoc.

An automated test executes **every example** to verify it builds and runs successfully.

This guarantees all examples are valid, up-to-date, and remain functional as the API evolves.

## Container detection at a glance {#container-detection-at-a-glance}

| Check | True when | Notes |
|-------|-----------|-------|
| `IsDocker` | `/.dockerenv` or Docker cgroup markers | Generic Docker container |
| `IsDockerInDocker` | `/.dockerenv` **and** `docker.sock` | Inner DinD container |
| `IsDockerHost` | `docker.sock` present, no container cgroups | Host or DinD outer acting as host |
| `IsContainer` | Any common container signals (Docker, containerd, kube env/cgroup) | General container detection |
| `IsKubernetes` | `KUBERNETES_SERVICE_HOST` or kubepods cgroup | Inside a Kubernetes pod |

## Environment loading overview {#environment-loading-overview}

LoadEnvFileIfExists layers env files in a predictable order:

- `.env` is loaded first.
- `.env.local`, `.env.staging`, or `.env.production` overlays based on `APP_ENV` (defaults to `local` when unset).
- `.env.testing` overlays when running under tests (APP_ENV=testing or Go test markers).
- `.env.host` overlays when running on the host or DinD to support host-to-container networking.

Later files override earlier values. Subsequent calls are no-ops.

<!-- api:embed:start -->

### Index {#index}

| Group | Functions |
|------:|-----------|
| **Application environment** | [GetAppEnv](#getappenv) [IsAppEnv](#isappenv) [IsAppEnvLocal](#isappenvlocal) [IsAppEnvLocalOrStaging](#isappenvlocalorstaging) [IsAppEnvProduction](#isappenvproduction) [IsAppEnvStaging](#isappenvstaging) [IsAppEnvTesting](#isappenvtesting) [IsAppEnvTestingOrLocal](#isappenvtestingorlocal) [SetAppEnv](#setappenv) [SetAppEnvLocal](#setappenvlocal) [SetAppEnvProduction](#setappenvproduction) [SetAppEnvStaging](#setappenvstaging) [SetAppEnvTesting](#setappenvtesting) |
| **Container detection** | [IsContainer](#iscontainer) [IsDocker](#isdocker) [IsDockerHost](#isdockerhost) [IsDockerInDocker](#isdockerindocker) [IsHostEnvironment](#ishostenvironment) [IsKubernetes](#iskubernetes) |
| **Debugging** | [Dump](#dump) |
| **Environment loading** | [IsEnvLoaded](#isenvloaded) [LoadEnvFileIfExists](#loadenvfileifexists) |
| **Runtime** | [Arch](#arch) [IsBSD](#isbsd) [IsContainerOS](#iscontaineros) [IsLinux](#islinux) [IsMac](#ismac) [IsUnix](#isunix) [IsWindows](#iswindows) [OS](#os) |
| **Typed getters** | [Get](#get) [GetBool](#getbool) [GetDuration](#getduration) [GetEnum](#getenum) [GetFloat](#getfloat) [GetInt](#getint) [GetInt64](#getint64) [GetMap](#getmap) [GetSlice](#getslice) [GetUint](#getuint) [GetUint64](#getuint64) [MustGet](#mustget) [MustGetBool](#mustgetbool) [MustGetInt](#mustgetint) |


## Application environment {#application-environment}

### GetAppEnv · readonly {#getappenv}

GetAppEnv returns the current APP_ENV (empty string if unset).

_Example: simple retrieval_

```go
_ = os.Setenv("APP_ENV", "staging")
env.Dump(env.GetAppEnv())

// #string "staging"
```

### IsAppEnv · readonly {#isappenv}

IsAppEnv checks if APP_ENV matches any of the provided environments.

_Example: match any allowed environment_

```go
_ = os.Setenv("APP_ENV", "staging")
env.Dump(env.IsAppEnv(env.Production, env.Staging))

// #bool true
```

_Example: unmatched environment_

```go
_ = os.Setenv("APP_ENV", "local")
env.Dump(env.IsAppEnv(env.Production, env.Staging))

// #bool false
```

### IsAppEnvLocal · readonly {#isappenvlocal}

IsAppEnvLocal checks if APP_ENV is "local".

```go
_ = os.Setenv("APP_ENV", env.Local)
env.Dump(env.IsAppEnvLocal())

// #bool true
```

### IsAppEnvLocalOrStaging · readonly {#isappenvlocalorstaging}

IsAppEnvLocalOrStaging checks if APP_ENV is either "local" or "staging".

```go
_ = os.Setenv("APP_ENV", env.Local)
env.Dump(env.IsAppEnvLocalOrStaging())

// #bool true
```

### IsAppEnvProduction · readonly {#isappenvproduction}

IsAppEnvProduction checks if APP_ENV is "production".

```go
_ = os.Setenv("APP_ENV", env.Production)
env.Dump(env.IsAppEnvProduction())

// #bool true
```

### IsAppEnvStaging · readonly {#isappenvstaging}

IsAppEnvStaging checks if APP_ENV is "staging".

```go
_ = os.Setenv("APP_ENV", env.Staging)
env.Dump(env.IsAppEnvStaging())

// #bool true
```

### IsAppEnvTesting · readonly {#isappenvtesting}

IsAppEnvTesting reports whether APP_ENV is "testing" or the process looks like `go test`.

_Example: APP_ENV explicitly testing_

```go
_ = os.Setenv("APP_ENV", env.Testing)
env.Dump(env.IsAppEnvTesting())

// #bool true
```

_Example: no test markers_

```go
_ = os.Unsetenv("APP_ENV")
env.Dump(env.IsAppEnvTesting())

// #bool false (outside of test binaries)
```

### IsAppEnvTestingOrLocal · readonly {#isappenvtestingorlocal}

IsAppEnvTestingOrLocal checks if APP_ENV is "testing" or "local".

```go
_ = os.Setenv("APP_ENV", env.Testing)
env.Dump(env.IsAppEnvTestingOrLocal())

// #bool true
```

### SetAppEnv · mutates-process-env {#setappenv}

SetAppEnv sets APP_ENV to a supported value.

_Example: set a supported environment_

```go
_ = env.SetAppEnv(env.Staging)
env.Dump(env.GetAppEnv())

// #string "staging"
```

### SetAppEnvLocal · mutates-process-env {#setappenvlocal}

SetAppEnvLocal sets APP_ENV to "local".

```go
_ = env.SetAppEnvLocal()
env.Dump(env.GetAppEnv())

// #string "local"
```

### SetAppEnvProduction · mutates-process-env {#setappenvproduction}

SetAppEnvProduction sets APP_ENV to "production".

```go
_ = env.SetAppEnvProduction()
env.Dump(env.GetAppEnv())

// #string "production"
```

### SetAppEnvStaging · mutates-process-env {#setappenvstaging}

SetAppEnvStaging sets APP_ENV to "staging".

```go
_ = env.SetAppEnvStaging()
env.Dump(env.GetAppEnv())

// #string "staging"
```

### SetAppEnvTesting · mutates-process-env {#setappenvtesting}

SetAppEnvTesting sets APP_ENV to "testing".

```go
_ = env.SetAppEnvTesting()
env.Dump(env.GetAppEnv())

// #string "testing"
```

## Container detection {#container-detection}

### IsContainer · readonly {#iscontainer}

IsContainer detects common container runtimes (Docker, containerd, Kubernetes, Podman).

_Example: host vs container_

```go
env.Dump(env.IsContainer())

// #bool true  (inside most containers)
// #bool false (on bare-metal/VM hosts)
```

### IsDocker · readonly {#isdocker}

IsDocker reports whether the current process is running in a Docker container.

_Example: typical host_

```go
env.Dump(env.IsDocker())

// #bool false (unless inside Docker)
```

### IsDockerHost · readonly {#isdockerhost}

IsDockerHost reports whether this container behaves like a Docker host.

```go
env.Dump(env.IsDockerHost())

// #bool true  (when acting as Docker host)
// #bool false (for normal containers/hosts)
```

### IsDockerInDocker · readonly {#isdockerindocker}

IsDockerInDocker reports whether we are inside a Docker-in-Docker environment.

```go
env.Dump(env.IsDockerInDocker())

// #bool true  (inside DinD containers)
// #bool false (on hosts or non-DinD containers)
```

### IsHostEnvironment · readonly {#ishostenvironment}

IsHostEnvironment reports whether the process is running *outside* any
container or orchestrated runtime.

```go
env.Dump(env.IsHostEnvironment())

// #bool true  (on bare-metal/VM hosts)
// #bool false (inside containers)
```

### IsKubernetes · readonly {#iskubernetes}

IsKubernetes reports whether the process is running inside Kubernetes.

```go
env.Dump(env.IsKubernetes())

// #bool true  (inside Kubernetes pods)
// #bool false (elsewhere)
```

## Debugging {#debugging}

### Dump · readonly {#dump}

Dump is a convenience function that calls godump.Dump.

_Example: integers_

```go
nums := []int{1, 2, 3}
env.Dump(nums)

// #[]int [
//   0 => 1 #int
//   1 => 2 #int
//   2 => 3 #int
// ]
```

_Example: multiple values_

```go
env.Dump("status", map[string]int{"ok": 1, "fail": 0})

// #string "status"
// #map[string]int [
//   "fail" => 0 #int
//   "ok"   => 1 #int
// ]
```

## Environment loading {#environment-loading}

### IsEnvLoaded · readonly {#isenvloaded}

IsEnvLoaded reports whether LoadEnvFileIfExists was executed in this process.

```go
env.Dump(env.IsEnvLoaded())

// #bool true  (after LoadEnvFileIfExists)
// #bool false (otherwise)
```

### LoadEnvFileIfExists · mutates-process-env {#loadenvfileifexists}

LoadEnvFileIfExists loads .env with optional layering for .env.local/.env.staging/.env.production,
plus .env.testing/.env.host when present.

_Example: test-specific env file_

```go
tmp, _ := os.MkdirTemp("", "envdoc")
_ = os.WriteFile(filepath.Join(tmp, ".env.testing"), []byte("PORT=9090\nENV_DEBUG=0"), 0o644)
_ = os.Chdir(tmp)
_ = os.Setenv("APP_ENV", env.Testing)

_ = env.LoadEnvFileIfExists()
env.Dump(os.Getenv("PORT"))

// #string "9090"
```

_Example: default .env on a host_

```go
_ = os.WriteFile(".env", []byte("SERVICE=api\nENV_DEBUG=3"), 0o644)
_ = env.LoadEnvFileIfExists()
env.Dump(os.Getenv("SERVICE"))

// #string "api"
```

## Runtime {#runtime}

### Arch · readonly {#arch}

Arch returns the CPU architecture the binary is running on.

_Example: print GOARCH_

```go
env.Dump(env.Arch())

// #string "amd64"
// #string "arm64"
```

### IsBSD · readonly {#isbsd}

IsBSD reports whether the runtime OS is any BSD variant.

```go
env.Dump(env.IsBSD())

// #bool true  (on BSD variants)
// #bool false (elsewhere)
```

### IsContainerOS · readonly {#iscontaineros}

IsContainerOS reports whether this OS is *typically* used as a container base.

```go
env.Dump(env.IsContainerOS())

// #bool true  (on Linux)
// #bool false (on macOS/Windows)
```

### IsLinux · readonly {#islinux}

IsLinux reports whether the runtime OS is Linux.

```go
env.Dump(env.IsLinux())

// #bool true  (on Linux)
// #bool false (on other OSes)
```

### IsMac · readonly {#ismac}

IsMac reports whether the runtime OS is macOS (Darwin).

```go
env.Dump(env.IsMac())

// #bool true  (on macOS)
// #bool false (elsewhere)
```

### IsUnix · readonly {#isunix}

IsUnix reports whether the OS is Unix-like.

```go
env.Dump(env.IsUnix())

// #bool true  (on Unix-like OSes)
// #bool false (e.g., on Windows or Plan 9)
```

### IsWindows · readonly {#iswindows}

IsWindows reports whether the runtime OS is Windows.

```go
env.Dump(env.IsWindows())

// #bool true  (on Windows)
// #bool false (elsewhere)
```

### OS · readonly {#os}

OS returns the current operating system identifier.

_Example: inspect GOOS_

```go
env.Dump(env.OS())

// #string "linux"   (on Linux)
// #string "darwin"  (on macOS)
// #string "windows" (on Windows)
```

## Typed getters {#typed-getters}

### Get · readonly {#get}

Get returns the environment variable for key or fallback when empty.

_Example: fallback when unset_

```go
os.Unsetenv("DB_HOST")
host := env.Get("DB_HOST", "localhost")
env.Dump(host)

// #string "localhost"
```

_Example: prefer existing value_

```go
_ = os.Setenv("DB_HOST", "db.internal")
host = env.Get("DB_HOST", "localhost")
env.Dump(host)

// #string "db.internal"
```

### GetBool · readonly {#getbool}

GetBool parses a boolean from an environment variable or fallback string.

_Example: numeric truthy_

```go
_ = os.Setenv("DEBUG", "1")
debug := env.GetBool("DEBUG", "false")
env.Dump(debug)

// #bool true
```

_Example: fallback string_

```go
os.Unsetenv("DEBUG")
debug = env.GetBool("DEBUG", "false")
env.Dump(debug)

// #bool false
```

### GetDuration · readonly {#getduration}

GetDuration parses a Go duration string (e.g. "5s", "10m", "1h").

_Example: override request timeout_

```go
_ = os.Setenv("HTTP_TIMEOUT", "30s")
timeout := env.GetDuration("HTTP_TIMEOUT", "5s")
env.Dump(timeout)

// #time.Duration 30s
```

_Example: fallback when unset_

```go
os.Unsetenv("HTTP_TIMEOUT")
timeout = env.GetDuration("HTTP_TIMEOUT", "5s")
env.Dump(timeout)

// #time.Duration 5s
```

### GetEnum · readonly {#getenum}

GetEnum ensures the environment variable's value is in the allowed list.

_Example: accept only staged environments_

```go
_ = os.Setenv("APP_ENV", "production")
appEnv := env.GetEnum("APP_ENV", "local", []string{"local", "staging", "production"})
env.Dump(appEnv)

// #string "production"
```

_Example: fallback when unset_

```go
os.Unsetenv("APP_ENV")
appEnv = env.GetEnum("APP_ENV", "local", []string{"local", "staging", "production"})
env.Dump(appEnv)

// #string "local"
```

### GetFloat · readonly {#getfloat}

GetFloat parses a float64 from an environment variable or fallback string.

_Example: override threshold_

```go
_ = os.Setenv("THRESHOLD", "0.82")
threshold := env.GetFloat("THRESHOLD", "0.75")
env.Dump(threshold)

// #float64 0.82
```

_Example: fallback with decimal string_

```go
os.Unsetenv("THRESHOLD")
threshold = env.GetFloat("THRESHOLD", "0.75")
env.Dump(threshold)

// #float64 0.75
```

### GetInt · readonly {#getint}

GetInt parses an int from an environment variable or fallback string.

_Example: fallback used_

```go
os.Unsetenv("PORT")
port := env.GetInt("PORT", "3000")
env.Dump(port)

// #int 3000
```

_Example: env overrides fallback_

```go
_ = os.Setenv("PORT", "8080")
port = env.GetInt("PORT", "3000")
env.Dump(port)

// #int 8080
```

### GetInt64 · readonly {#getint64}

GetInt64 parses an int64 from an environment variable or fallback string.

_Example: parse large numbers safely_

```go
_ = os.Setenv("MAX_SIZE", "1048576")
size := env.GetInt64("MAX_SIZE", "512")
env.Dump(size)

// #int64 1048576
```

_Example: fallback when unset_

```go
os.Unsetenv("MAX_SIZE")
size = env.GetInt64("MAX_SIZE", "512")
env.Dump(size)

// #int64 512
```

### GetMap · readonly {#getmap}

GetMap parses key=value pairs separated by commas into a map.

_Example: parse throttling config_

```go
_ = os.Setenv("LIMITS", "read=10, write=5, burst=20")
limits := env.GetMap("LIMITS", "")
env.Dump(limits)

// #map[string]string [
//  "burst" => "20" #string
//  "read"  => "10" #string
//  "write" => "5" #string
// ]
```

_Example: returns empty map when unset or blank_

```go
os.Unsetenv("LIMITS")
limits = env.GetMap("LIMITS", "")
env.Dump(limits)

// #map[string]string []
```

### GetSlice · readonly {#getslice}

GetSlice splits a comma-separated string into a []string with trimming.

_Example: trimmed addresses_

```go
_ = os.Setenv("PEERS", "10.0.0.1, 10.0.0.2")
peers := env.GetSlice("PEERS", "")
env.Dump(peers)

// #[]string [
//  0 => "10.0.0.1" #string
//  1 => "10.0.0.2" #string
// ]
```

_Example: empty becomes empty slice_

```go
os.Unsetenv("PEERS")
peers = env.GetSlice("PEERS", "")
env.Dump(peers)

// #[]string []
```

### GetUint · readonly {#getuint}

GetUint parses a uint from an environment variable or fallback string.

_Example: defaults to fallback when missing_

```go
os.Unsetenv("WORKERS")
workers := env.GetUint("WORKERS", "4")
env.Dump(workers)

// #uint 4
```

_Example: uses provided unsigned value_

```go
_ = os.Setenv("WORKERS", "16")
workers = env.GetUint("WORKERS", "4")
env.Dump(workers)

// #uint 16
```

### GetUint64 · readonly {#getuint64}

GetUint64 parses a uint64 from an environment variable or fallback string.

_Example: high range values_

```go
_ = os.Setenv("MAX_ITEMS", "5000")
maxItems := env.GetUint64("MAX_ITEMS", "100")
env.Dump(maxItems)

// #uint64 5000
```

_Example: fallback when unset_

```go
os.Unsetenv("MAX_ITEMS")
maxItems = env.GetUint64("MAX_ITEMS", "100")
env.Dump(maxItems)

// #uint64 100
```

### MustGet · panic {#mustget}

MustGet returns the value of key or panics if missing/empty.

_Example: required secret_

```go
_ = os.Setenv("API_SECRET", "s3cr3t")
secret := env.MustGet("API_SECRET")
env.Dump(secret)

// #string "s3cr3t"
```

_Example: panic on missing value_

```go
os.Unsetenv("API_SECRET")
secret = env.MustGet("API_SECRET") // panics: env variable missing: API_SECRET
```

### MustGetBool · panic {#mustgetbool}

MustGetBool panics if missing or invalid.

_Example: gate features explicitly_

```go
_ = os.Setenv("FEATURE_ENABLED", "true")
enabled := env.MustGetBool("FEATURE_ENABLED")
env.Dump(enabled)

// #bool true
```

_Example: panic on invalid value_

```go
_ = os.Setenv("FEATURE_ENABLED", "maybe")
_ = env.MustGetBool("FEATURE_ENABLED") // panics when parsing
```

### MustGetInt · panic {#mustgetint}

MustGetInt panics if the value is missing or not an int.

_Example: ensure numeric port_

```go
_ = os.Setenv("PORT", "8080")
port := env.MustGetInt("PORT")
env.Dump(port)

// #int 8080
```

_Example: panic on bad value_

```go
_ = os.Setenv("PORT", "not-a-number")
_ = env.MustGetInt("PORT") // panics when parsing
```
<!-- api:embed:end -->

## Philosophy {#philosophy}

**env** is part of the **GoForj toolchain** - a collection of focused, composable packages designed to make building Go applications *satisfying*.

No magic. No globals. No surprises.

## License {#license}

MIT
