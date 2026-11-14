---
title: "Partner Payload Encryption Rotation"
description: "Protect stored payloads with authentication while retaining old-key reads."
---

# Partner Payload Encryption Rotation

::: info Verified Scenario
This page is generated from an executable spec. An automated suite renders a fresh App from the current GoForj templates, applies every step below in order, and runs every verification command. If any step fails, the page does not ship.
:::

Encrypt partner payloads before storage while preserving authenticated old-key reads during rotation.

## Prerequisites

Start from the prepared invoice-domain application with crypt v1.2.0. Inspect the fake-key compatibility vector before changing payload handling; its sample keys are only for local tests.

## Golden Path State

Before this scenario, The prepared service stores plaintext; a fake-key compatibility vector describes the established encrypted envelope.

After this scenario, Only authenticated plaintext is returned, previous keys remain read-only fallbacks, and new writes use the current key.

## Files

This scenario edits or creates:

```text
internal/partnerpayloads/service.go
internal/partnerpayloads/cipher.go
internal/partnerpayloads/service_test.go
app/lifecycle.go
app/wire/inject_services_app.go
```

## Starting State

The scenario prepares and verifies this fixture state before the target workflow begins.

### Establish opaque fixture persistence

Create or replace `internal/partnerpayloads/repository.go`:

```go
// Package partnerpayloads protects partner records independently from transport concerns.
package partnerpayloads

import (
	"context"
	"errors"
	"sync"
)

// ErrNotFound identifies a missing payload without exposing record contents.
var ErrNotFound = errors.New("partner payload not found")

// Repository persists opaque strings through the caller's cancellation boundary.
type Repository interface {
	// Put replaces the opaque value associated with an identifier.
	Put(context.Context, string, string) error
	// Get retrieves an opaque value associated with an identifier.
	Get(context.Context, string) (string, error)
}

// memoryRepository provides deterministic fixture persistence without an external service.
type memoryRepository struct {
	mu     sync.Mutex
	values map[string]string
}

// NewRepository supplies the application-owned repository interface to Wire.
func NewRepository() Repository { return &memoryRepository{values: map[string]string{}} }

// Put protects concurrent fixture writes while honoring caller cancellation.
func (repository *memoryRepository) Put(ctx context.Context, id, value string) error {
	if err := ctx.Err(); err != nil {
		return err
	}
	repository.mu.Lock()
	defer repository.mu.Unlock()
	repository.values[id] = value
	return nil
}

// Get preserves not-found and cancellation errors without synthesizing payload contents.
func (repository *memoryRepository) Get(ctx context.Context, id string) (string, error) {
	if err := ctx.Err(); err != nil {
		return "", err
	}
	repository.mu.Lock()
	defer repository.mu.Unlock()
	value, ok := repository.values[id]
	if !ok {
		return "", ErrNotFound
	}
	return value, nil
}
```

### Establish the plaintext service seam

Create or replace `internal/partnerpayloads/service.go`:

```go
// Package partnerpayloads protects partner records independently from transport concerns.
package partnerpayloads

import "context"

// PayloadCipher is the application's authenticated encryption boundary.
type PayloadCipher interface {
	// Encrypt returns an opaque authenticated payload for storage.
	Encrypt(string) (string, error)
	// Decrypt returns plaintext only after authentication succeeds.
	Decrypt(string) (string, error)
}

// Service combines persistence and one immutable startup cipher.
type Service struct {
	repository Repository
	cipher     PayloadCipher
}

// NewService exposes both required collaborators to App composition.
func NewService(repository Repository, cipher PayloadCipher) *Service {
	return &Service{repository: repository, cipher: cipher}
}

// Save retains the prepared plaintext behavior that the target task replaces.
func (service *Service) Save(ctx context.Context, id, payload string) error {
	return service.repository.Put(ctx, id, payload)
}

// Load retains the prepared repository boundary before authenticated reads are implemented.
func (service *Service) Load(ctx context.Context, id string) (string, error) {
	return service.repository.Get(ctx, id)
}
```

### Reserve the application cipher provider

Create or replace `internal/partnerpayloads/cipher.go`:

```go
// Package partnerpayloads protects partner records independently from transport concerns.
package partnerpayloads

import "errors"

// NewCipher reserves the injected encryption provider before the target implementation.
func NewCipher() (PayloadCipher, error) { return nil, errors.New("payload encryption not implemented") }
```

### Provide a fake-key compatibility record

Create or replace `internal/partnerpayloads/testdata/legacy.json`:

```json
{
  "key": "base64:ERERERERERERERERERERERERERERERERERERERERERE=",
  "plaintext": "legacy partner payload",
  "ciphertext": "eyJpdiI6InhGZFhFbVNCaElPdWZrN1QrZ0o4d2c9PSIsInZhbHVlIjoiNVg2cFFsSVdkb2lnVk1JN1JVNWdoekNBdTlCa1hRUzF4MFFRTW5YdTFrRT0iLCJtYWMiOiJjZWM0NjcxY2IyZDA3NGExMThhZmM2ZGVmNzkzZDliZTc1MmRkM2RjM2FmNjg5N2NhYWE2NmQwOTA5MTdlNGZhIiwidGFnIjoiIn0="
}
```

The starting state is checked with:

```bash
forj build
```

```bash
go get github.com/goforj/crypt@v1.2.0
```

```bash
go mod download
```

```bash
go test ./...
```

## Step 1: Freeze the authenticated current and previous keys

Create or replace `internal/partnerpayloads/cipher.go`:

```go
// Package partnerpayloads protects partner records independently from transport concerns.
package partnerpayloads

import "github.com/goforj/crypt"

// NewCipher freezes the current and previous key set before the App becomes ready.
func NewCipher() (PayloadCipher, error) {
	cipher, err := crypt.NewFromEnv()
	if err != nil {
		return nil, err
	}
	return cipher, nil
}
```

## Step 2: Authenticate the service storage boundary

Create or replace `internal/partnerpayloads/service.go`:

```go
// Package partnerpayloads protects partner records independently from transport concerns.
package partnerpayloads

import "context"

// PayloadCipher is the application's authenticated encryption boundary.
type PayloadCipher interface {
	// Encrypt returns an opaque authenticated payload for storage.
	Encrypt(string) (string, error)
	// Decrypt returns plaintext only after authentication succeeds.
	Decrypt(string) (string, error)
}

// Service combines persistence and one immutable startup cipher.
type Service struct {
	repository Repository
	cipher     PayloadCipher
}

// NewService exposes both required collaborators to App composition.
func NewService(repository Repository, cipher PayloadCipher) *Service {
	return &Service{repository: repository, cipher: cipher}
}

// Save encrypts before persistence so a failed cipher cannot write plaintext.
func (service *Service) Save(ctx context.Context, id, payload string) error {
	if err := ctx.Err(); err != nil {
		return err
	}
	ciphertext, err := service.cipher.Encrypt(payload)
	if err != nil {
		return err
	}
	return service.repository.Put(ctx, id, ciphertext)
}

// Load preserves operational error identity and never returns unauthenticated plaintext.
func (service *Service) Load(ctx context.Context, id string) (string, error) {
	if err := ctx.Err(); err != nil {
		return "", err
	}
	ciphertext, err := service.repository.Get(ctx, id)
	if err != nil {
		return "", err
	}
	payload, err := service.cipher.Decrypt(ciphertext)
	if err != nil {
		return "", err
	}
	return payload, nil
}
```

## Step 3: Import the encrypted service providers

Update `app/wire/inject_services_app.go` so it includes:

```go
	"example.com/invoiceeval/internal/runtime"
	"example.com/invoiceeval/internal/partnerpayloads"
```

## Step 4: Compose persistence and one startup cipher

Update `app/wire/inject_services_app.go` so it includes:

```go
	partnerpayloads.NewRepository,
	partnerpayloads.NewCipher,
	partnerpayloads.NewService,
	app.NewLifecycleRegistry,
```

## Step 5: Require valid key configuration before readiness

Create or replace `app/lifecycle.go`:

```go
// Package app owns application composition and lifecycle hooks.
package app

import (
	"context"
	"example.com/invoiceeval/internal/partnerpayloads"
	"example.com/invoiceeval/internal/runtime"
)

// LifecycleRegistry roots the encrypted payload service in the App's startup graph.
type LifecycleRegistry struct{ payloads *partnerpayloads.Service }

// NewLifecycleRegistry requires the configured cipher before readiness can succeed.
func NewLifecycleRegistry(service *partnerpayloads.Service) *LifecycleRegistry {
	return &LifecycleRegistry{payloads: service}
}

// Register preserves the App's cancellable readiness boundary.
func (registry *LifecycleRegistry) Register(lifecycle *runtime.Lifecycle) {
	lifecycle.On(runtime.BeforeStartup, registry.BeforeStartup)
}

// BeforeStartup observes the caller's cancellation after validated graph composition.
func (registry *LifecycleRegistry) BeforeStartup(ctx context.Context) error { return ctx.Err() }
```

## Step 6: Check encrypted storage and round trips

Create or replace `internal/partnerpayloads/service_test.go`:

```go
// Package partnerpayloads protects partner records independently from transport concerns.
package partnerpayloads

import (
	"context"
	"encoding/base64"
	"strings"
	"testing"
)

// TestServiceStoresEncryptedPayload proves plaintext stays outside the repository's opaque value.
func TestServiceStoresEncryptedPayload(t *testing.T) {
	t.Setenv("APP_KEY", "base64:"+base64.StdEncoding.EncodeToString([]byte(strings.Repeat("f", 32))))
	t.Setenv("APP_PREVIOUS_KEYS", "")
	cipher, err := NewCipher()
	if err != nil {
		t.Fatal(err)
	}
	repository := NewRepository()
	service := NewService(repository, cipher)
	if err := service.Save(context.Background(), "payload-1", "fixture plaintext"); err != nil {
		t.Fatal(err)
	}
	stored, err := repository.Get(context.Background(), "payload-1")
	if err != nil {
		t.Fatal(err)
	}
	if stored == "fixture plaintext" {
		t.Fatal("plaintext persisted")
	}
	value, err := service.Load(context.Background(), "payload-1")
	if err != nil || value != "fixture plaintext" {
		t.Fatalf("round trip failed: %v", err)
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

If old records stop decrypting, inspect the configured previous-key list and the existing payload envelope. Authentication failures must return no plaintext. A malformed current or previous key must fail the provider without printing key material.

## Next Steps

- Use the encrypted service behind an application transport boundary without exposing payloads in diagnostics.
- Plan and verify a separate stored-data rewrite before retiring previous keys.
