---
title: "Customer Settings Validation"
description: "Update preferences without collapsing omitted, null, zero, or false."
---

# Customer Settings Validation

::: info Verified Scenario
This page is generated from an executable spec. An automated suite renders a fresh App from the current GoForj templates, applies every step below in order, and runs every verification command. If any step fails, the page does not ship.
:::

Implement a presence-aware customer settings PATCH with reusable typed validation.

## Prerequisites

Start from the prepared invoice HTTP application. Keep validation v0.2.0 staged before the network-disabled task, and inspect the existing settings controller, service, and fake initial state.

## Golden Path State

Before this scenario, The registered settings endpoint returns 501; the prepared module already pins validation v0.2.0.

After this scenario, Updates preserve omission, permit nullable notes, and distinguish client issues from operational policy errors.

## Files

This scenario edits or creates:

```text
internal/settings/controller.go
internal/settings/policy.go
internal/settings/policy_test.go
```

## Starting State

The scenario prepares and verifies this fixture state before the target workflow begins.

### Register the prepared settings boundary

```bash
forj make:controller settings
```

### Establish customer preference state

Create or replace `internal/settings/service.go`:

```go
// Package settings owns customer preferences independently from HTTP.
package settings

import "context"

// Settings is the persisted customer preference snapshot.
type Settings struct {
	Name    string  `json:"name"`
	Limit   int     `json:"limit"`
	Enabled bool    `json:"enabled"`
	Note    *string `json:"note"`
}

// NameCheck checks policy using the caller's cancellation boundary.
type NameCheck func(context.Context, string) error

// NewNameCheck supplies the local fixture policy without a remote dependency.
func NewNameCheck() NameCheck { return func(context.Context, string) error { return nil } }

// Service owns preference updates and their reusable validation policy.
type Service struct {
	check   NameCheck
	current Settings
}

// NewService composes policy and deterministic fixture state.
func NewService(check NameCheck) *Service {
	note := "keep me"
	return &Service{check: check, current: Settings{Name: "Existing", Limit: 25, Enabled: true, Note: &note}}
}
```

### Reserve the PATCH boundary

Create or replace `internal/settings/controller.go`:

```go
// Package settings owns customer preferences independently from HTTP.
package settings

import (
	"github.com/goforj/web"
	"net/http"
)

// Controller exposes the prepared settings boundary.
type Controller struct{ service *Service }

// NewController exposes the service dependency to Wire.
func NewController(service *Service) *Controller { return &Controller{service: service} }

// Routes reserves the settings endpoint before update behavior is implemented.
func (controller *Controller) Routes() []web.Route {
	return []web.Route{web.NewRoute(http.MethodPatch, "/customers/settings", controller.Patch)}
}

// Patch marks the unimplemented target behavior.
func (controller *Controller) Patch(request web.Context) error {
	return request.JSON(http.StatusNotImplemented, map[string]string{"error": "not_implemented"})
}
```

### Import settings providers

Update `app/wire/inject_services_app.go` so it includes:

```go
	"example.com/invoiceeval/internal/runtime"
	"example.com/invoiceeval/internal/settings"
```

### Compose settings policy and state

Update `app/wire/inject_services_app.go` so it includes:

```go
	settings.NewNameCheck,
	settings.NewService,
	app.NewLifecycleRegistry,
```

The starting state is checked with:

```bash
forj build
```

```bash
go get github.com/goforj/validation@v0.2.0
```

```bash
go mod download
```

```bash
go test ./...
```

## Step 1: Share normalized application validation

Create or replace `internal/settings/policy.go`:

```go
// Package settings owns customer preferences independently from HTTP.
package settings

import (
	"context"
	"github.com/goforj/validation"
	"strings"
)

// PatchInput preserves omission, null, and supplied zero values across transports.
type PatchInput struct {
	Name    validation.Input[string] `json:"name"`
	Limit   validation.Input[int]    `json:"limit"`
	Enabled validation.Input[bool]   `json:"enabled"`
	Note    validation.Input[string] `json:"note"`
}

// ValidatePatch centralizes rules so HTTP and direct application calls share policy.
func (service *Service) ValidatePatch(ctx context.Context, input PatchInput) error {
	return validation.ValidateContext(ctx,
		validation.Presence("name", input.Name, func(value string) validation.Field {
			return validation.String("", value).Required().Check(service.check)
		}),
		validation.Presence("limit", input.Limit, func(value int) validation.Field { return validation.Number("", value).Min(0).Max(100) }),
		validation.Presence("enabled", input.Enabled, func(value bool) validation.Field { return validation.Bool("", value) }),
		validation.Presence("note", input.Note, func(value string) validation.Field { return validation.String("", value).Max(80) }).Nullable(),
	)
}

// Update validates before changing state so failed patches cannot partially apply.
func (service *Service) Update(ctx context.Context, input PatchInput) (Settings, error) {
	if value, ok := input.Name.Get(); ok {
		input.Name = validation.Provided(strings.TrimSpace(value))
	}
	if err := service.ValidatePatch(ctx, input); err != nil {
		return Settings{}, err
	}
	if value, ok := input.Name.Get(); ok {
		service.current.Name = value
	}
	if value, ok := input.Limit.Get(); ok {
		service.current.Limit = value
	}
	if value, ok := input.Enabled.Get(); ok {
		service.current.Enabled = value
	}
	if input.Note.IsNull() {
		service.current.Note = nil
	} else if value, ok := input.Note.Get(); ok {
		service.current.Note = &value
	}
	return service.current, nil
}
```

## Step 2: Translate stable HTTP errors

Create or replace `internal/settings/controller.go`:

```go
// Package settings owns customer preferences independently from HTTP.
package settings

import (
	"errors"
	"github.com/goforj/validation"
	"github.com/goforj/web"
	"net/http"
)

// Controller translates the settings HTTP contract into service calls.
type Controller struct{ service *Service }

// NewController exposes the service dependency to Wire.
func NewController(service *Service) *Controller { return &Controller{service: service} }

// Routes declares customer preference updates.
func (controller *Controller) Routes() []web.Route {
	return []web.Route{web.NewRoute(http.MethodPatch, "/customers/settings", controller.Patch)}
}

// Patch preserves stable public field codes while operational errors retain their identity.
func (controller *Controller) Patch(request web.Context) error {
	var input PatchInput
	if err := request.Bind(&input); err != nil {
		return request.JSON(http.StatusBadRequest, map[string]string{"error": "invalid_payload"})
	}
	result, err := controller.service.Update(request.Context(), input)
	if err != nil {
		var failures *validation.Errors
		if errors.As(err, &failures) {
			fields := map[string]string{}
			for _, issue := range failures.Issues() {
				if _, exists := fields[issue.Path]; !exists {
					fields[issue.Path] = issue.Code
				}
			}
			return request.JSON(http.StatusUnprocessableEntity, struct {
				Error  string            `json:"error"`
				Fields map[string]string `json:"fields"`
			}{"validation_failed", fields})
		}
		return err
	}
	return request.JSON(http.StatusOK, result)
}
```

## Step 3: Exercise supplied zero and false

Create or replace `internal/settings/policy_test.go`:

```go
// Package settings owns customer preferences independently from HTTP.
package settings

import (
	"context"
	"encoding/json"
	"testing"
)

// TestUpdatePreservesPresence proves zero and false update rather than disappear.
func TestUpdatePreservesPresence(t *testing.T) {
	service := NewService(NewNameCheck())
	var input PatchInput
	if err := json.Unmarshal([]byte(`{"limit":0,"enabled":false,"note":null}`), &input); err != nil {
		t.Fatal(err)
	}
	result, err := service.Update(context.Background(), input)
	if err != nil || result.Name != "Existing" || result.Limit != 0 || result.Enabled || result.Note != nil {
		t.Fatalf("result = %#v, error = %v", result, err)
	}
}
```

## Build and Verify

```bash
go test ./internal/settings
```

```bash
forj build
```

```bash
forj route:list
```

Expected output includes:

```text
PATCH
/api/v1/customers/settings
```

## Troubleshooting

If omission and null behave identically, inspect the JSON input shape and presence rules before changing update logic. Map only structured validation issues to 422 field codes; keep ordinary rule errors and cancellation operational.

## Next Steps

- Replace fixture state with an application-owned repository while preserving atomic patch behavior.
- Extend presence and field-code regression cases when adding settings.
