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
    <a href="https://pkg.go.dev/github.com/goforj/env"><img src="https://pkg.go.dev/badge/github.com/goforj/env.svg" alt="Go Reference"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
    <a href="https://github.com/goforj/env/actions"><img src="https://github.com/goforj/env/actions/workflows/test.yml/badge.svg" alt="Go Test"></a>
    <a href="https://golang.org"><img src="https://img.shields.io/badge/go-1.18+-blue?logo=go" alt="Go version"></a>
    <img src="https://img.shields.io/github/v/tag/goforj/env?label=version&sort=semver" alt="Latest tag">
    <a href="https://codecov.io/gh/goforj/env" ><img src="https://codecov.io/github/goforj/env/graph/badge.svg?token=M7EFUVV1XW"/></a>
    <a href="https://goreportcard.com/report/github.com/goforj/env"><img src="https://goreportcard.com/badge/github.com/goforj/env" alt="Go Report Card"></a>
</p>

<p align="center">
  <code>env</code> provides strongly-typed access to environment variables with predictable fallbacks.  
  Eliminate string parsing, centralize app environment checks, and keep configuration boring.  
  Designed to feel native to Go - and invisible when things are working.
</p>

# Features {#features}

- 🔐 **Strongly typed getters** - `int`, `bool`, `float`, `duration`, slices, maps
- 🧯 **Safe fallbacks** - never panic, never accidentally empty
- 🌎 **Application environment helpers** - `dev`, `local`, `prod`
- 🧩 **Minimal dependencies** - Pure Go, lightweight, minimal surface area
- 🧭 **Framework-agnostic** - works with any Go app
- 📐 **Enum validation** - constrain values with allowed sets
- 🧼 **Predictable behavior** - no magic, no global state surprises
- 🧱 **Composable building block** - ideal for config structs and startup wiring

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
- App environment helpers (`dev`, `local`, `prod`)
- Zero dependencies
- Framework-agnostic

## Installation {#installation}

```bash
go get github.com/goforj/env
```

## Quickstart {#quickstart}

```go
package main

import (
	"log"
	"time"

	"github.com/goforj/env"
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

<!-- api:embed:start -->

### Index {#index}

| Group | Functions |
|------:|-----------|
| **Application environment** | [GetAppEnv](#getappenv) [IsAppEnv](#isappenv) [IsAppEnvDev](#isappenvdev) [IsAppEnvLocal](#isappenvlocal) [IsAppEnvLocalOrStaging](#isappenvlocalorstaging) [IsAppEnvProduction](#isappenvproduction) [IsAppEnvStaging](#isappenvstaging) [IsAppEnvTesting](#isappenvtesting) [IsAppEnvTestingOrLocal](#isappenvtestingorlocal) |
| **Container detection** | [IsContainer](#iscontainer) [IsDocker](#isdocker) [IsDockerHost](#isdockerhost) [IsDockerInDocker](#isdockerindocker) [IsHostEnvironment](#ishostenvironment) [IsKubernetes](#iskubernetes) |
| **Debugging** | [Dump](#dump) |
| **Environment loading** | [IsEnvLoaded](#isenvloaded) [LoadEnvFileIfExists](#loadenvfileifexists) |
| **Runtime** | [Arch](#arch) [IsBSD](#isbsd) [IsContainerOS](#iscontaineros) [IsLinux](#islinux) [IsMac](#ismac) [IsUnix](#isunix) [IsWindows](#iswindows) [OS](#os) |
| **Typed getters** | [Get](#get) [GetBool](#getbool) [GetDuration](#getduration) [GetEnum](#getenum) [GetFloat](#getfloat) [GetInt](#getint) [GetInt64](#getint64) [GetMap](#getmap) [GetSlice](#getslice) [GetUint](#getuint) [GetUint64](#getuint64) [MustGet](#mustget) [MustGetBool](#mustgetbool) [MustGetInt](#mustgetint) |


## Application environment {#application-environment}

### GetAppEnv · readonly {#getappenv}

GetAppEnv returns the current APP_ENV (empty string if unset).


<GoForjExample repo="env" example="getappenv">

```go
// Example: simple retrieval
_ = os.Setenv("APP_ENV", "staging")
env.Dump(env.GetAppEnv())

// #string "staging"
```

</GoForjExample>

### IsAppEnv · readonly {#isappenv}

IsAppEnv checks if APP_ENV matches any of the provided environments.


<GoForjExample repo="env" example="isappenv">

```go
// Example: match any allowed environment
_ = os.Setenv("APP_ENV", "staging")
env.Dump(env.IsAppEnv(env.Production, env.Staging))

// #bool true

// Example: unmatched environment
_ = os.Setenv("APP_ENV", "local")
env.Dump(env.IsAppEnv(env.Production, env.Staging))

// #bool false
```

</GoForjExample>




### IsAppEnvDev · readonly {#isappenvdev}

IsAppEnvDev checks if APP_ENV is "dev".

<GoForjExample repo="env" example="isappenvdev">

```go
_ = os.Setenv("APP_ENV", env.Dev)
env.Dump(env.IsAppEnvDev())

// #bool true
```

</GoForjExample>

### IsAppEnvLocal · readonly {#isappenvlocal}

IsAppEnvLocal checks if APP_ENV is "local".

<GoForjExample repo="env" example="isappenvlocal">

```go
_ = os.Setenv("APP_ENV", env.Local)
env.Dump(env.IsAppEnvLocal())

// #bool true
```

</GoForjExample>

### IsAppEnvLocalOrStaging · readonly {#isappenvlocalorstaging}

IsAppEnvLocalOrStaging checks if APP_ENV is either "local" or "staging".

<GoForjExample repo="env" example="isappenvlocalorstaging">

```go
_ = os.Setenv("APP_ENV", env.Local)
env.Dump(env.IsAppEnvLocalOrStaging())

// #bool true
```

</GoForjExample>

### IsAppEnvProduction · readonly {#isappenvproduction}

IsAppEnvProduction checks if APP_ENV is "production".

<GoForjExample repo="env" example="isappenvproduction">

```go
_ = os.Setenv("APP_ENV", env.Production)
env.Dump(env.IsAppEnvProduction())

// #bool true
```

</GoForjExample>

### IsAppEnvStaging · readonly {#isappenvstaging}

IsAppEnvStaging checks if APP_ENV is "staging".

<GoForjExample repo="env" example="isappenvstaging">

```go
_ = os.Setenv("APP_ENV", env.Staging)
env.Dump(env.IsAppEnvStaging())

// #bool true
```

</GoForjExample>

### IsAppEnvTesting · readonly {#isappenvtesting}

IsAppEnvTesting reports whether APP_ENV is "testing" or the process looks like `go test`.


<GoForjExample repo="env" example="isappenvtesting">

```go
// Example: APP_ENV explicitly testing
_ = os.Setenv("APP_ENV", env.Testing)
env.Dump(env.IsAppEnvTesting())

// #bool true

// Example: no test markers
_ = os.Unsetenv("APP_ENV")
env.Dump(env.IsAppEnvTesting())

// #bool false (outside of test binaries)
```

</GoForjExample>




### IsAppEnvTestingOrLocal · readonly {#isappenvtestingorlocal}

IsAppEnvTestingOrLocal checks if APP_ENV is "testing" or "local".

<GoForjExample repo="env" example="isappenvtestingorlocal">

```go
_ = os.Setenv("APP_ENV", env.Testing)
env.Dump(env.IsAppEnvTestingOrLocal())

// #bool true
```

</GoForjExample>

## Container detection {#container-detection}

### IsContainer · readonly {#iscontainer}

IsContainer detects common container runtimes (Docker, containerd, Kubernetes, Podman).


<GoForjExample repo="env" example="iscontainer">

```go
// Example: host vs container
env.Dump(env.IsContainer())

// #bool true  (inside most containers)
// #bool false (on bare-metal/VM hosts)
```

</GoForjExample>

### IsDocker · readonly {#isdocker}

IsDocker reports whether the current process is running in a Docker container.


<GoForjExample repo="env" example="isdocker">

```go
// Example: typical host
env.Dump(env.IsDocker())

// #bool false (unless inside Docker)
```

</GoForjExample>

### IsDockerHost · readonly {#isdockerhost}

IsDockerHost reports whether this container behaves like a Docker host.

<GoForjExample repo="env" example="isdockerhost">

```go
env.Dump(env.IsDockerHost())

// #bool true  (when acting as Docker host)
// #bool false (for normal containers/hosts)
```

</GoForjExample>

### IsDockerInDocker · readonly {#isdockerindocker}

IsDockerInDocker reports whether we are inside a Docker-in-Docker environment.

<GoForjExample repo="env" example="isdockerindocker">

```go
env.Dump(env.IsDockerInDocker())

// #bool true  (inside DinD containers)
// #bool false (on hosts or non-DinD containers)
```

</GoForjExample>

### IsHostEnvironment · readonly {#ishostenvironment}

IsHostEnvironment reports whether the process is running *outside* any
container or orchestrated runtime.

<GoForjExample repo="env" example="ishostenvironment">

```go
env.Dump(env.IsHostEnvironment())

// #bool true  (on bare-metal/VM hosts)
// #bool false (inside containers)
```

</GoForjExample>

### IsKubernetes · readonly {#iskubernetes}

IsKubernetes reports whether the process is running inside Kubernetes.

<GoForjExample repo="env" example="iskubernetes">

```go
env.Dump(env.IsKubernetes())

// #bool true  (inside Kubernetes pods)
// #bool false (elsewhere)
```

</GoForjExample>

## Debugging {#debugging}

### Dump · readonly {#dump}

Dump is a convenience function that calls godump.Dump.


<GoForjExample repo="env" example="dump">

```go
// Example: integers
nums := []int{1, 2, 3}
env.Dump(nums)

// #[]int [
//   0 => 1 #int
//   1 => 2 #int
//   2 => 3 #int
// ]

// Example: multiple values
env.Dump("status", map[string]int{"ok": 1, "fail": 0})

// #string "status"
// #map[string]int [
//   "fail" => 0 #int
//   "ok"   => 1 #int
// ]
```

</GoForjExample>




## Environment loading {#environment-loading}

### IsEnvLoaded · readonly {#isenvloaded}

IsEnvLoaded reports whether LoadEnvFileIfExists was executed in this process.

<GoForjExample repo="env" example="isenvloaded">

```go
env.Dump(env.IsEnvLoaded())

// #bool true  (after LoadEnvFileIfExists)
// #bool false (otherwise)
```

</GoForjExample>

### LoadEnvFileIfExists · mutates-process-env {#loadenvfileifexists}

LoadEnvFileIfExists loads .env/.env.testing/.env.host when present.


<GoForjExample repo="env" example="loadenvfileifexists">

```go
// Example: test-specific env file
tmp, _ := os.MkdirTemp("", "envdoc")
_ = os.WriteFile(filepath.Join(tmp, ".env.testing"), []byte("PORT=9090\nAPP_DEBUG=0"), 0o644)
_ = os.Chdir(tmp)
_ = os.Setenv("APP_ENV", env.Testing)

_ = env.LoadEnvFileIfExists()
env.Dump(os.Getenv("PORT"))

// #string "9090"

// Example: default .env on a host
_ = os.WriteFile(".env", []byte("SERVICE=api\nAPP_DEBUG=3"), 0o644)
_ = env.LoadEnvFileIfExists()
env.Dump(os.Getenv("SERVICE"))

// #string "api"
```

</GoForjExample>




## Runtime {#runtime}

### Arch · readonly {#arch}

Arch returns the CPU architecture the binary is running on.


<GoForjExample repo="env" example="arch">

```go
// Example: print GOARCH
env.Dump(env.Arch())

// #string "amd64"
// #string "arm64"
```

</GoForjExample>

### IsBSD · readonly {#isbsd}

IsBSD reports whether the runtime OS is any BSD variant.

<GoForjExample repo="env" example="isbsd">

```go
env.Dump(env.IsBSD())

// #bool true  (on BSD variants)
// #bool false (elsewhere)
```

</GoForjExample>

### IsContainerOS · readonly {#iscontaineros}

IsContainerOS reports whether this OS is *typically* used as a container base.

<GoForjExample repo="env" example="iscontaineros">

```go
env.Dump(env.IsContainerOS())

// #bool true  (on Linux)
// #bool false (on macOS/Windows)
```

</GoForjExample>

### IsLinux · readonly {#islinux}

IsLinux reports whether the runtime OS is Linux.

<GoForjExample repo="env" example="islinux">

```go
env.Dump(env.IsLinux())

// #bool true  (on Linux)
// #bool false (on other OSes)
```

</GoForjExample>

### IsMac · readonly {#ismac}

IsMac reports whether the runtime OS is macOS (Darwin).

<GoForjExample repo="env" example="ismac">

```go
env.Dump(env.IsMac())

// #bool true  (on macOS)
// #bool false (elsewhere)
```

</GoForjExample>

### IsUnix · readonly {#isunix}

IsUnix reports whether the OS is Unix-like.

<GoForjExample repo="env" example="isunix">

```go
env.Dump(env.IsUnix())

// #bool true  (on Unix-like OSes)
// #bool false (e.g., on Windows or Plan 9)
```

</GoForjExample>

### IsWindows · readonly {#iswindows}

IsWindows reports whether the runtime OS is Windows.

<GoForjExample repo="env" example="iswindows">

```go
env.Dump(env.IsWindows())

// #bool true  (on Windows)
// #bool false (elsewhere)
```

</GoForjExample>

### OS · readonly {#os}

OS returns the current operating system identifier.


<GoForjExample repo="env" example="os">

```go
// Example: inspect GOOS
env.Dump(env.OS())

// #string "linux"   (on Linux)
// #string "darwin"  (on macOS)
// #string "windows" (on Windows)
```

</GoForjExample>

## Typed getters {#typed-getters}

### Get · readonly {#get}

Get returns the environment variable for key or fallback when empty.


<GoForjExample repo="env" example="get">

```go
// Example: fallback when unset
os.Unsetenv("DB_HOST")
host := env.Get("DB_HOST", "localhost")
env.Dump(host)

// #string "localhost"

// Example: prefer existing value
_ = os.Setenv("DB_HOST", "db.internal")
host = env.Get("DB_HOST", "localhost")
env.Dump(host)

// #string "db.internal"
```

</GoForjExample>




### GetBool · readonly {#getbool}

GetBool parses a boolean from an environment variable or fallback string.


<GoForjExample repo="env" example="getbool">

```go
// Example: numeric truthy
_ = os.Setenv("DEBUG", "1")
debug := env.GetBool("DEBUG", "false")
env.Dump(debug)

// #bool true

// Example: fallback string
os.Unsetenv("DEBUG")
debug = env.GetBool("DEBUG", "false")
env.Dump(debug)

// #bool false
```

</GoForjExample>




### GetDuration · readonly {#getduration}

GetDuration parses a Go duration string (e.g. "5s", "10m", "1h").


<GoForjExample repo="env" example="getduration">

```go
// Example: override request timeout
_ = os.Setenv("HTTP_TIMEOUT", "30s")
timeout := env.GetDuration("HTTP_TIMEOUT", "5s")
env.Dump(timeout)

// #time.Duration 30s

// Example: fallback when unset
os.Unsetenv("HTTP_TIMEOUT")
timeout = env.GetDuration("HTTP_TIMEOUT", "5s")
env.Dump(timeout)

// #time.Duration 5s
```

</GoForjExample>




### GetEnum · readonly {#getenum}

GetEnum ensures the environment variable's value is in the allowed list.


<GoForjExample repo="env" example="getenum">

```go
// Example: accept only staged environments
_ = os.Setenv("APP_ENV", "prod")
appEnv := env.GetEnum("APP_ENV", "dev", []string{"dev", "staging", "prod"})
env.Dump(appEnv)

// #string "prod"

// Example: fallback when unset
os.Unsetenv("APP_ENV")
appEnv = env.GetEnum("APP_ENV", "dev", []string{"dev", "staging", "prod"})
env.Dump(appEnv)

// #string "dev"
```

</GoForjExample>




### GetFloat · readonly {#getfloat}

GetFloat parses a float64 from an environment variable or fallback string.


<GoForjExample repo="env" example="getfloat">

```go
// Example: override threshold
_ = os.Setenv("THRESHOLD", "0.82")
threshold := env.GetFloat("THRESHOLD", "0.75")
env.Dump(threshold)

// #float64 0.82

// Example: fallback with decimal string
os.Unsetenv("THRESHOLD")
threshold = env.GetFloat("THRESHOLD", "0.75")
env.Dump(threshold)

// #float64 0.75
```

</GoForjExample>




### GetInt · readonly {#getint}

GetInt parses an int from an environment variable or fallback string.


<GoForjExample repo="env" example="getint">

```go
// Example: fallback used
os.Unsetenv("PORT")
port := env.GetInt("PORT", "3000")
env.Dump(port)

// #int 3000

// Example: env overrides fallback
_ = os.Setenv("PORT", "8080")
port = env.GetInt("PORT", "3000")
env.Dump(port)

// #int 8080
```

</GoForjExample>




### GetInt64 · readonly {#getint64}

GetInt64 parses an int64 from an environment variable or fallback string.


<GoForjExample repo="env" example="getint64">

```go
// Example: parse large numbers safely
_ = os.Setenv("MAX_SIZE", "1048576")
size := env.GetInt64("MAX_SIZE", "512")
env.Dump(size)

// #int64 1048576

// Example: fallback when unset
os.Unsetenv("MAX_SIZE")
size = env.GetInt64("MAX_SIZE", "512")
env.Dump(size)

// #int64 512
```

</GoForjExample>




### GetMap · readonly {#getmap}

GetMap parses key=value pairs separated by commas into a map.


<GoForjExample repo="env" example="getmap">

```go
// Example: parse throttling config
_ = os.Setenv("LIMITS", "read=10, write=5, burst=20")
limits := env.GetMap("LIMITS", "")
env.Dump(limits)

// #map[string]string [
//  "burst" => "20" #string
//  "read"  => "10" #string
//  "write" => "5" #string
// ]

// Example: returns empty map when unset or blank
os.Unsetenv("LIMITS")
limits = env.GetMap("LIMITS", "")
env.Dump(limits)

// #map[string]string []
```

</GoForjExample>




### GetSlice · readonly {#getslice}

GetSlice splits a comma-separated string into a []string with trimming.


<GoForjExample repo="env" example="getslice">

```go
// Example: trimmed addresses
_ = os.Setenv("PEERS", "10.0.0.1, 10.0.0.2")
peers := env.GetSlice("PEERS", "")
env.Dump(peers)

// #[]string [
//  0 => "10.0.0.1" #string
//  1 => "10.0.0.2" #string
// ]

// Example: empty becomes empty slice
os.Unsetenv("PEERS")
peers = env.GetSlice("PEERS", "")
env.Dump(peers)

// #[]string []
```

</GoForjExample>




### GetUint · readonly {#getuint}

GetUint parses a uint from an environment variable or fallback string.


<GoForjExample repo="env" example="getuint">

```go
// Example: defaults to fallback when missing
os.Unsetenv("WORKERS")
workers := env.GetUint("WORKERS", "4")
env.Dump(workers)

// #uint 4

// Example: uses provided unsigned value
_ = os.Setenv("WORKERS", "16")
workers = env.GetUint("WORKERS", "4")
env.Dump(workers)

// #uint 16
```

</GoForjExample>




### GetUint64 · readonly {#getuint64}

GetUint64 parses a uint64 from an environment variable or fallback string.


<GoForjExample repo="env" example="getuint64">

```go
// Example: high range values
_ = os.Setenv("MAX_ITEMS", "5000")
maxItems := env.GetUint64("MAX_ITEMS", "100")
env.Dump(maxItems)

// #uint64 5000

// Example: fallback when unset
os.Unsetenv("MAX_ITEMS")
maxItems = env.GetUint64("MAX_ITEMS", "100")
env.Dump(maxItems)

// #uint64 100
```

</GoForjExample>




### MustGet · panic {#mustget}

MustGet returns the value of key or panics if missing/empty.


<GoForjExample repo="env" example="mustget">

```go
// Example: required secret
_ = os.Setenv("API_SECRET", "s3cr3t")
secret := env.MustGet("API_SECRET")
env.Dump(secret)

// #string "s3cr3t"

// Example: panic on missing value
os.Unsetenv("API_SECRET")
secret = env.MustGet("API_SECRET") // panics: env variable missing: API_SECRET
```

</GoForjExample>




### MustGetBool · panic {#mustgetbool}

MustGetBool panics if missing or invalid.


<GoForjExample repo="env" example="mustgetbool">

```go
// Example: gate features explicitly
_ = os.Setenv("FEATURE_ENABLED", "true")
enabled := env.MustGetBool("FEATURE_ENABLED")
env.Dump(enabled)

// #bool true

// Example: panic on invalid value
_ = os.Setenv("FEATURE_ENABLED", "maybe")
_ = env.MustGetBool("FEATURE_ENABLED") // panics when parsing
```

</GoForjExample>




### MustGetInt · panic {#mustgetint}

MustGetInt panics if the value is missing or not an int.


<GoForjExample repo="env" example="mustgetint">

```go
// Example: ensure numeric port
_ = os.Setenv("PORT", "8080")
port := env.MustGetInt("PORT")
env.Dump(port)

// #int 8080

// Example: panic on bad value
_ = os.Setenv("PORT", "not-a-number")
_ = env.MustGetInt("PORT") // panics when parsing
```

</GoForjExample>



<!-- api:embed:end -->

## Philosophy {#philosophy}

**env** is part of the **GoForj toolchain** - a collection of focused, composable packages designed to make building Go applications *satisfying*.

No magic. No globals. No surprises.

## License {#license}

MIT
