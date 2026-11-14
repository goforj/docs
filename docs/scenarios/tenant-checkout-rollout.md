---
title: "Tenant Checkout Rollout"
description: "Use a generated evaluator resource for stable, request-consistent checkout decisions."
---

# Tenant Checkout Rollout

::: info Verified Scenario
This page is generated from an executable spec. An automated suite renders a fresh App from the current GoForj templates, applies every step below in order, and runs every verification command. If any step fails, the page does not ship.
:::

Add a tenant rollout through the App-owned Checkout evaluator.

## Prerequisites

Start from the Invoice Domain scenario in a Project whose GoForj version supports the optional feature component. Preparation enables the component for the owning App, declares the Checkout evaluator, and generates its accessor before application changes. Dependency installation and resource generation are supplied by the fixture.

## Golden Path State

Before this scenario, The generated resource owns configuration, but checkout presentation has no rollout behavior.

After this scenario, A registered service captures one configuration revision per request.

## Files

This scenario edits or creates:

```text
internal/checkout/service.go
internal/checkout/service_test.go
app/wire/inject_services_app.go
```

## Starting State

The scenario prepares and verifies this fixture state before the target workflow begins.

### Declare the App-owned Checkout evaluator resource

Append to `.env`:

```
FEATURE_CHECKOUT_DRIVER=memory
```

### Generate the typed evaluator accessor before candidate execution

```bash
forj generate --feature
```

### Prepare the checkout request boundary

Create or replace `internal/checkout/service.go`:

```go
// Package checkout owns request-consistent checkout presentation decisions.
package checkout

import (
	"context"
	"fmt"

	"example.com/invoiceeval/internal/features"
	"github.com/goforj/feature"
)

// Service borrows the configured Checkout evaluator from App-owned resources.
type Service struct{ flags *feature.Features }

// NewService resolves the generated evaluator accessor once without owning its source lifecycle.
func NewService(manager *features.Manager) *Service { return &Service{flags: manager.Checkout()} }

// Request retains one tenant's captured configuration for related decisions.
type Request struct{ flags *feature.Scope }

// Begin captures the complete revision before any request decisions.
func (service *Service) Begin(ctx context.Context, tenant string) (*Request, error) {
	if tenant == "" {
		return nil, fmt.Errorf("tenant is required")
	}
	return &Request{flags: service.flags.For(feature.Target{Key: tenant})}, nil
}

// Checkout applies the conservative fallback when checkout configuration is missing.
func (request *Request) Checkout(ctx context.Context) bool {
	return false
}

// Receipt uses the same captured revision as the checkout decision.
func (request *Request) Receipt(ctx context.Context) bool {
	return false
}
```

The starting state is checked with:

```bash
go test ./internal/checkout
```

```bash
forj build
```

## Step 1: Capture request configuration and evaluate explicit fallback

Create or replace `internal/checkout/service.go`:

```go
// Package checkout owns request-consistent checkout presentation decisions.
package checkout

import (
	"context"
	"fmt"

	"example.com/invoiceeval/internal/features"
	"github.com/goforj/feature"
)

// Service borrows the configured Checkout evaluator from App-owned resources.
type Service struct{ flags *feature.Features }

// NewService resolves the generated evaluator accessor once without owning its source lifecycle.
func NewService(manager *features.Manager) *Service { return &Service{flags: manager.Checkout()} }

// Request retains one tenant's captured configuration for related decisions.
type Request struct{ flags *feature.Scope }

// Begin captures the complete revision before any request decisions.
func (service *Service) Begin(ctx context.Context, tenant string) (*Request, error) {
	if tenant == "" {
		return nil, fmt.Errorf("tenant is required")
	}
	snapshot, err := service.flags.Snapshot()
	if err != nil {
		return nil, err
	}
	return &Request{flags: snapshot.For(feature.Target{Key: tenant})}, nil
}

// Checkout applies the conservative fallback when checkout configuration is missing.
func (request *Request) Checkout(ctx context.Context) bool {
	return request.flags.Evaluate(ctx, "checkout-v2", false).Value
}

// Receipt uses the same captured revision as the checkout decision.
func (request *Request) Receipt(ctx context.Context) bool {
	return request.flags.Evaluate(ctx, "receipt-v2", false).Value
}
```

## Step 2: Test fallback and request validation through the configured evaluator

Create or replace `internal/checkout/service_test.go`:

```go
// Package checkout owns request-consistent checkout presentation decisions.
package checkout

import (
	"context"
	"testing"

	"example.com/invoiceeval/internal/features"
	"github.com/goforj/feature"
)

// TestMissingFlags checks conservative decisions and tenant validation through the generated resource.
func TestMissingFlags(t *testing.T) {
	manager, err := features.NewManager()
	if err != nil {
		t.Fatal(err)
	}
	defer manager.Close()
	service := NewService(manager)
	if _, err := service.Begin(context.Background(), ""); err == nil {
		t.Fatal("empty tenant accepted")
	}
	request, err := service.Begin(context.Background(), "tenant:acme")
	if err != nil {
		t.Fatal(err)
	}
	if request.Checkout(context.Background()) || request.Receipt(context.Background()) {
		t.Fatal("missing flag did not fall back")
	}
}

// unsupportedEvaluator represents an evaluator that cannot freeze definitions.
type unsupportedEvaluator struct{}

// Resolve supplies the portable evaluator contract without snapshot capability.
func (unsupportedEvaluator) Resolve(context.Context, string, bool, feature.Target) feature.Decision {
	return feature.Decision{Value: true}
}

// TestUnsupportedSnapshot requires callers to handle unavailable snapshot capability.
func TestUnsupportedSnapshot(t *testing.T) {
	service := &Service{flags: feature.New(unsupportedEvaluator{})}
	if _, err := service.Begin(context.Background(), "tenant:acme"); err == nil {
		t.Fatal("unsupported snapshot accepted")
	}
}
```

## Step 3: Import the checkout service into the owning App

Update `app/wire/inject_services_app.go` so it includes:

```go
	"example.com/invoiceeval/internal/runtime"
	"example.com/invoiceeval/internal/checkout"
```

## Step 4: Register the accessor-consuming service provider

Update `app/wire/inject_services_app.go` so it includes:

```go
	checkout.NewService,
	app.NewLifecycleRegistry,
```

## Build and Verify

```bash
go test ./internal/checkout
```

```bash
forj build
```

## Troubleshooting

If Checkout is undefined, confirm FEATURE_CHECKOUT_DRIVER is declared in the owning environment and regenerate with forj generate --feature. Resolve initial source errors before startup; an invalid later refresh retains the last valid definition and reports degraded freshness through the manager's detached instance status. A targeting scope alone does not freeze configuration.

## Common Mistakes

::: warning Common mistakes
- Treating a tenant rollout decision as authorization.
- Constructing sources or refresh workers in request handlers.
- Using the default evaluator instead of the configured Checkout resource.
- Reusing an ordinary targeting scope while related decisions observe different revisions.
:::

## Next Steps

- Configure a native file source and exercise valid and invalid refreshes in the owning App.
- Add a checkout HTTP adapter that preserves the captured request snapshot and existing authorization boundary.
