---
title: "Dispatch Startup Configuration"
description: "Validate a typed startup snapshot with process precedence and safe diagnostics."
---

# Dispatch Startup Configuration

::: info Verified Scenario
This page is generated from an executable spec. An automated suite renders a fresh App from the current GoForj templates, applies every step below in order, and runs every verification command. If any step fails, the page does not ship.
:::

Configure the dispatch service at startup using a typed, validated snapshot.

## Prerequisites

Start from the prepared invoice-domain application with its existing env/v2 v2.6.1 dependency. The fixture supplies fake DISPATCH_TOKEN and DISPATCH_WORKERS values; use no real deployment credentials.

## Golden Path State

Before this scenario, The dispatch service has a placeholder configuration provider and is not yet rooted in App composition.

After this scenario, Invalid required configuration blocks composition, process settings override files, and diagnostics redact credentials.

## Files

This scenario edits or creates:

```text
internal/dispatch/config.go
internal/dispatch/config_test.go
app/lifecycle.go
app/wire/inject_services_app.go
```

## Starting State

The scenario prepares and verifies this fixture state before the target workflow begins.

### Reserve the typed provider boundary

Create or replace `internal/dispatch/config.go`:

```go
// Package dispatch owns outbound dispatch policy independently from process configuration.
package dispatch

import "time"

// Config is the typed startup snapshot consumed by the dispatch service.
type Config struct {
	Token   string
	Workers int
	Timeout time.Duration
	Enabled bool
	Region  string
}

// LoadConfig reserves the application-owned provider before configuration behavior is implemented.
func LoadConfig() (Config, error) { return Config{}, nil }
```

### Establish an immutable service dependency

Create or replace `internal/dispatch/service.go`:

```go
// Package dispatch owns outbound dispatch policy independently from process configuration.
package dispatch

// Service consumes a validated immutable startup configuration.
type Service struct{ config Config }

// NewService keeps configuration loading outside request and delivery paths.
func NewService(config Config) *Service { return &Service{config: config} }

// Snapshot returns the configured policy without rereading process variables.
func (service *Service) Snapshot() Config { return service.config }
```

### Provide fake local startup values

Append to `.env`:

```dotenv
DISPATCH_TOKEN=fixture-token
DISPATCH_WORKERS=4
```

The starting state is checked with:

```bash
forj build
```

```bash
go mod download
```

```bash
go test ./...
```

## Step 1: Load and validate the startup snapshot

Create or replace `internal/dispatch/config.go`:

```go
// Package dispatch owns outbound dispatch policy independently from process configuration.
package dispatch

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/goforj/env/v2"
)

// Config is one validated startup snapshot; Token is intentionally excluded from diagnostics.
type Config struct {
	Token   string
	Workers int
	Timeout time.Duration
	Enabled bool
	Region  string
}

// LoadConfig resolves process-over-file settings and rejects invalid required values before composition completes.
func LoadConfig() (Config, error) {
	if err := env.Load(); err != nil {
		return Config{}, errors.New("load dispatch environment")
	}
	scope := env.WithPrefix("DISPATCH")
	config := Config{Token: scope.Get("TOKEN", ""), Workers: scope.GetInt("WORKERS", "0"), Timeout: scope.GetDuration("TIMEOUT", "2s"), Enabled: scope.GetBool("ENABLED", "true"), Region: scope.Get("REGION", "local")}
	if strings.TrimSpace(config.Token) == "" {
		return Config{}, errors.New("DISPATCH_TOKEN is required")
	}
	if config.Workers < 1 || config.Workers > 64 {
		return Config{}, errors.New("DISPATCH_WORKERS must be an integer from 1 to 64")
	}
	if config.Timeout <= 0 {
		return Config{}, errors.New("DISPATCH_TIMEOUT must be positive")
	}
	return config, nil
}

// String permits operational diagnostics without retaining the credential in the rendered output.
func (config Config) String() string {
	return fmt.Sprintf("dispatch workers=%d timeout=%s enabled=%t region=%s token=[redacted]", config.Workers, config.Timeout, config.Enabled, config.Region)
}

// GoString keeps Go-syntax diagnostics subject to the same redaction policy.
func (config Config) GoString() string { return config.String() }
```

## Step 2: Import application configuration providers

Update `app/wire/inject_services_app.go` so it includes:

```go
	"example.com/invoiceeval/internal/runtime"
	"example.com/invoiceeval/internal/dispatch"
```

## Step 3: Register the validated service graph

Update `app/wire/inject_services_app.go` so it includes:

```go
	dispatch.LoadConfig,
	dispatch.NewService,
	app.NewLifecycleRegistry,
```

## Step 4: Require configured dispatch before readiness

Create or replace `app/lifecycle.go`:

```go
// Package app owns application composition and lifecycle hooks.
package app

import (
	"context"
	"example.com/invoiceeval/internal/dispatch"
	"example.com/invoiceeval/internal/runtime"
)

// LifecycleRegistry roots the configured dispatch service in the App graph before readiness.
type LifecycleRegistry struct{ dispatch *dispatch.Service }

// NewLifecycleRegistry requires validated dispatch configuration during Wire composition.
func NewLifecycleRegistry(service *dispatch.Service) *LifecycleRegistry {
	return &LifecycleRegistry{dispatch: service}
}

// Register attaches the App readiness boundary to its runtime.
func (registry *LifecycleRegistry) Register(lifecycle *runtime.Lifecycle) {
	lifecycle.On(runtime.BeforeStartup, registry.BeforeStartup)
}

// BeforeStartup preserves cancellation after the validated graph has been composed.
func (registry *LifecycleRegistry) BeforeStartup(ctx context.Context) error { return ctx.Err() }
```

## Step 5: Check required values and typed fallbacks

Create or replace `internal/dispatch/config_test.go`:

```go
// Package dispatch owns outbound dispatch policy independently from process configuration.
package dispatch

import (
	"strings"
	"testing"
	"time"
)

// TestLoadConfigRejectsMissingToken proves required credentials fail before startup.
func TestLoadConfigRejectsMissingToken(t *testing.T) {
	t.Setenv("DISPATCH_TOKEN", "")
	t.Setenv("DISPATCH_WORKERS", "4")
	if _, err := LoadConfig(); err == nil || !strings.Contains(err.Error(), "DISPATCH_TOKEN") {
		t.Fatalf("error = %v", err)
	}
}

// TestLoadConfigUsesTypedFallbacks proves optional parse failures follow the selected library contract.
func TestLoadConfigUsesTypedFallbacks(t *testing.T) {
	t.Setenv("DISPATCH_TOKEN", "fixture-token")
	t.Setenv("DISPATCH_WORKERS", "4")
	t.Setenv("DISPATCH_TIMEOUT", "not-a-duration")
	t.Setenv("DISPATCH_ENABLED", "not-a-bool")
	config, err := LoadConfig()
	if err != nil || config.Timeout != 2*time.Second || !config.Enabled {
		t.Fatalf("config = %v, error = %v", config, err)
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

## Troubleshooting

If bad required settings do not stop startup, verify that the Config provider and dispatch service are rooted in the App Wire graph. Typed getter fallbacks for malformed optional values are intentional; missing required integers must still fail application range checks.

## Next Steps

- Inject the validated snapshot into a real dispatch client instead of reading process variables per request.
- Document deployment-specific settings with fake values and preserve process-over-file precedence.
