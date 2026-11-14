---
title: "Incident Notification"
description: "Add conservative incident alert fallback through injected senders."
---

# Incident Notification

::: info Verified Scenario
This page is generated from an executable spec. An automated suite renders a fresh App from the current GoForj templates, applies every step below in order, and runs every verification command. If any step fails, the page does not ship.
:::

Alert operators without duplicating messages whose acceptance is uncertain.

## Prerequisites

Use a GoForj Project with the opt-in notification component enabled for the owning App. The framework integration initially supports log capture and webhook drivers. The prepared scenario compiles notification v0.1.0, webhook support, and primary/secondary named accessors before feature work begins.

## Golden Path State

Before this scenario, The incident data and synchronous sender contract exist, with no delivery policy.

After this scenario, The service composes a primary and fallback without automatic retries.

## Files

This scenario edits or creates:

```text
internal/incidents/alert_service.go
internal/incidents/alert_service_test.go
```

## Starting State

The scenario prepares and verifies this fixture state before the target workflow begins.

### Prepare the supported transport manifest

Update `.env` so it includes:

```dotenv
NOTIFICATION_SUPPORTED_DRIVERS=log,webhook
```

### Prepare explicit local sender names

Append to `.env`:

```dotenv
NOTIFICATION_PRIMARY_DRIVER=log
NOTIFICATION_SECONDARY_DRIVER=log
```

### Compile generated sender accessors before candidate execution

```bash
forj generate --notification
```

### Establish the incident and sender boundary

Create or replace `internal/incidents/incident.go`:

```go
// Package incidents owns operator alert policy without provisioning transports.
package incidents

import "github.com/goforj/notification"

// Incident carries the operator-facing facts needed for one alert.
type Incident struct{ ID, Severity, Summary string }

// Sender is the existing synchronous transport boundary used by incident alerts.
type Sender = notification.Sender
```

The starting state is checked with:

```bash
forj build
```

```bash
go test ./...
```

## Step 1: Compose the incident acceptance policy

Create or replace `internal/incidents/alert_service.go`:

```go
// Package incidents owns operator alert policy without provisioning transports.
package incidents

import (
	"context"
	"example.com/invoiceeval/internal/notifications"
	"github.com/goforj/notification"
)

// AlertService keeps conservative acceptance policy behind injected senders.
type AlertService struct{ sender notification.Sender }

// NewAlertService advances only after a classified definitive rejection.
func NewAlertService(primary, fallback notification.Sender) *AlertService {
	return &AlertService{sender: notification.Fallback(primary, fallback)}
}

// NewConfiguredAlertService selects App-configured senders while keeping fallback policy explicit.
func NewConfiguredAlertService(manager *notifications.Manager) *AlertService {
	return NewAlertService(manager.Primary(), manager.Secondary())
}

// Notify preserves caller context and reports acceptance without claiming receipt.
func (service *AlertService) Notify(ctx context.Context, incident Incident) error {
	return service.sender.Send(ctx, notification.Message{
		Title: "Incident " + incident.ID,
		Body:  incident.Severity + ": " + incident.Summary,
	})
}
```

## Step 2: Record local acceptance without a provider

Create or replace `internal/incidents/alert_service_test.go`:

```go
// Package incidents owns operator alert policy without provisioning transports.
package incidents

import (
	"context"
	"errors"
	"testing"

	"github.com/goforj/notification"
)

// incidentContextKey distinguishes caller propagation from a replacement context.
type incidentContextKey struct{}

// TestIncidentNotificationPolicy records calls without sending real notifications.
func TestIncidentNotificationPolicy(t *testing.T) {
	tests := []struct {
		name         string
		primary      error
		fallback     error
		canceled     bool
		wantPrimary  int
		wantFallback int
		wantError    error
	}{
		{name: "accepted", wantPrimary: 1},
		{name: "permanent fallback", primary: notification.ErrPermanent, wantPrimary: 1, wantFallback: 1},
		{name: "unauthorized fallback", primary: notification.ErrUnauthorized, wantPrimary: 1, wantFallback: 1},
		{name: "render fallback", primary: notification.ErrRender, wantPrimary: 1, wantFallback: 1},
		{name: "both reject", primary: notification.ErrPermanent, fallback: notification.ErrUnauthorized, wantPrimary: 1, wantFallback: 1, wantError: notification.ErrUnauthorized},
		{name: "unknown acceptance", primary: notification.ErrOutcomeUnknown, wantPrimary: 1, wantError: notification.ErrOutcomeUnknown},
		{name: "unclassified acceptance", primary: errors.New("untrusted provider response"), wantPrimary: 1, wantError: notification.ErrOutcomeUnknown},
		{name: "retryable", primary: notification.ErrRetryable, wantPrimary: 1, wantError: notification.ErrRetryable},
		{name: "throttled", primary: notification.ErrThrottled, wantPrimary: 1, wantError: notification.ErrThrottled},
		{name: "canceled during send", primary: context.Canceled, wantPrimary: 1, wantError: context.Canceled},
		{name: "deadline", primary: context.DeadlineExceeded, wantPrimary: 1, wantError: context.DeadlineExceeded},
		{name: "already canceled", canceled: true, wantError: context.Canceled},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			ctx, cancel := context.WithCancel(context.WithValue(context.Background(), incidentContextKey{}, "caller"))
			defer cancel()
			if test.canceled {
				cancel()
			}
			primaryCalls, fallbackCalls := 0, 0
			incident := Incident{ID: "inc-73", Severity: "critical", Summary: "Payments unavailable"}
			want := notification.Message{Title: "Incident inc-73", Body: "critical: Payments unavailable"}
			record := func(calls *int, failure error) notification.Sender {
				return notification.SenderFunc(func(got context.Context, message notification.Message) error {
					*calls++
					if got != ctx || got.Value(incidentContextKey{}) != "caller" {
						t.Error("caller context lost")
					}
					if message != want {
						t.Errorf("message = %#v, want %#v", message, want)
					}
					return failure
				})
			}
			err := NewAlertService(record(&primaryCalls, test.primary), record(&fallbackCalls, test.fallback)).Notify(ctx, incident)
			if test.wantError == nil && err != nil || test.wantError != nil && !errors.Is(err, test.wantError) {
				t.Fatalf("Notify() = %v, want classification %v", err, test.wantError)
			}
			if primaryCalls != test.wantPrimary || fallbackCalls != test.wantFallback {
				t.Fatalf("calls = %d/%d, want %d/%d", primaryCalls, fallbackCalls, test.wantPrimary, test.wantFallback)
			}
		})
	}
}
```

## Step 3: Import the incident feature for App composition

Update `app/wire/inject_services_app.go` so it includes:

```go
	"example.com/invoiceeval/internal/runtime"
	"example.com/invoiceeval/internal/incidents"
```

## Step 4: Register configured sender selection with App Wire

Update `app/wire/inject_services_app.go` so it includes:

```go
	incidents.NewConfiguredAlertService,
	app.NewLifecycleRegistry,
```

## Build and Verify

```bash
go test ./internal/incidents
```

```bash
forj build
```

```bash
go test ./...
```

## Troubleshooting

If a selected driver is not built in, add it to NOTIFICATION_SUPPORTED_DRIVERS, run forj generate --notification, and rebuild. If a typed accessor is missing, declare its named sender configuration before generating. Keep configuration or resource-removal errors explicit; reconcile existing App-owned providers before disabling the component. Run local tests with recording senders or temporary HTTP servers instead of real provider destinations.

## Common Mistakes

::: warning Common mistakes
- Do not construct provider drivers or load credentials inside the incident service; select generated manager accessors at the App provider boundary.
- Do not treat a successful synchronous send as proof of recipient receipt, or automatically fall back after uncertain acceptance.
- Do not use fanout as a substitute for an explicit primary/fallback policy.
:::

## Next Steps

- Configure the selected deployment destinations and credentials through the owning App's existing environment overlay.
- Add durable scheduling or retries through an explicit queue workflow only when the application requires them.
- Review uncertain acceptance and idempotency policy before enabling retries or additional channels.
