---
title: Requests and Validation
description: How controllers bind, normalize, validate, and pass request input into services.
---

# Requests and Validation

Request handling should make invalid input visible at the HTTP boundary before application services perform business behavior. Controllers own HTTP translation; services own application behavior.

## Map Binding and Validation Separately

`web.Context.Bind` asks the active Web adapter to decode the request into the target value. A bind error means the payload could not be decoded. It is different from a decoded payload that fails application input rules.

Keep those failures distinct in the public response:

| Failure | Status | Stable error code | Field errors |
| --- | ---: | --- | --- |
| `ctx.Bind` cannot decode the payload | `400 Bad Request` | `invalid_payload` | none |
| Decoded input fails request validation | `422 Unprocessable Entity` | `validation_failed` | stable field name-to-code map |
| The service fails | application error policy | service-owned | service-owned |

Do not return `err.Error()` from `Bind`. Its text belongs to the active binder, can expose parsing details, and is not a stable API contract.

## Define the Service Input

Keep the service input independent from JSON field names. In `internal/users/service.go`:

<!-- go-example: illustrative-fragment -->
```go
// Package users owns user application behavior and its HTTP adapter.
package users

import "context"

// CreateUserInput is the normalized input accepted by the user service.
type CreateUserInput struct {
	DisplayName string
	Email       string
	Password    string
}

// User is the public result of creating a user.
type User struct {
	ID          string `json:"id"`
	DisplayName string `json:"display_name"`
	Email       string `json:"email"`
}

// Service owns user application behavior.
type Service struct{}

// NewService constructs the user service.
func NewService() *Service {
	return &Service{}
}

// Create creates a user from normalized input.
func (*Service) Create(_ context.Context, input CreateUserInput) (User, error) {
	return User{
		ID:          "user_123",
		DisplayName: input.DisplayName,
		Email:       input.Email,
	}, nil
}
```

The fixed result keeps this example focused on the request boundary. A real service can enforce business rules and call its injected repository without changing the controller contract.

## Bind, Normalize, and Validate

Use a request-only type for JSON binding and a stable response type for validation failures. In `internal/users/controller.go`:

<!-- go-example: illustrative-fragment -->
```go
package users

import (
	"context"
	"net/http"
	"net/mail"
	"strings"
	"unicode/utf8"

	"github.com/goforj/web"
)

const (
	errorInvalidPayload   = "invalid_payload"
	errorValidationFailed = "validation_failed"
	fieldInvalidFormat    = "invalid_format"
	fieldRequired         = "required"
	fieldTooShort         = "too_short"
)

type createUserRequest struct {
	DisplayName string `json:"display_name"`
	Email       string `json:"email"`
	Password    string `json:"password"`
}

type errorResponse struct {
	Error  string            `json:"error"`
	Fields map[string]string `json:"fields,omitempty"`
}

type userCreator interface {
	Create(context.Context, CreateUserInput) (User, error)
}

// Controller translates user HTTP requests into service calls.
type Controller struct {
	service userCreator
}

// NewController constructs the user HTTP adapter.
func NewController(service *Service) *Controller {
	return &Controller{service: service}
}

// Routes declares the user endpoints owned by this controller.
func (c *Controller) Routes() []web.Route {
	return []web.Route{
		web.NewRoute(http.MethodPost, "/users", c.Store),
	}
}

// Store validates a create-user request before calling the service.
func (c *Controller) Store(ctx web.Context) error {
	var request createUserRequest
	if err := ctx.Bind(&request); err != nil {
		return ctx.JSON(http.StatusBadRequest, errorResponse{
			Error: errorInvalidPayload,
		})
	}

	input, fields := request.input()
	if len(fields) != 0 {
		return ctx.JSON(http.StatusUnprocessableEntity, errorResponse{
			Error:  errorValidationFailed,
			Fields: fields,
		})
	}

	user, err := c.service.Create(ctx.Context(), input)
	if err != nil {
		return err
	}

	return ctx.JSON(http.StatusCreated, user)
}

// input normalizes user-facing identifiers and reports stable validation codes.
func (r createUserRequest) input() (CreateUserInput, map[string]string) {
	displayName := strings.TrimSpace(r.DisplayName)
	email := strings.ToLower(strings.TrimSpace(r.Email))
	fields := make(map[string]string)

	if displayName == "" {
		fields["display_name"] = fieldRequired
	}
	if email == "" {
		fields["email"] = fieldRequired
	} else if !validEmail(email) {
		fields["email"] = fieldInvalidFormat
	}
	if r.Password == "" {
		fields["password"] = fieldRequired
	} else if utf8.RuneCountInString(r.Password) < 12 {
		fields["password"] = fieldTooShort
	}

	return CreateUserInput{
		DisplayName: displayName,
		Email:       email,
		Password:    r.Password,
	}, fields
}

// validEmail accepts a plain mailbox while rejecting display-name forms.
func validEmail(value string) bool {
	address, err := mail.ParseAddress(value)
	return err == nil && address.Address == value
}
```

Display names and email addresses are normalized because surrounding whitespace is not meaningful for those fields. The password is intentionally not trimmed: whitespace can be part of a credential, and silently changing it can make the password a user supplied differ from the password the service stores. This example counts every password rune, including whitespace, toward the minimum. If an application rejects all-whitespace passwords or applies another password policy, make that a separate explicit rule while still passing the original value onward.

The field keys match the JSON request fields, and the values are machine-readable codes rather than prose. Clients can translate those codes without coupling themselves to server wording. Each field receives one deterministic code because the checks prioritize `required` before format or length rules.

## Test Invalid and Valid Requests

Controller tests should prove malformed JSON, stable field errors, normalization, and password preservation. Create `internal/users/controller_test.go`:

<!-- go-example: illustrative-fragment -->
```go
package users

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"reflect"
	"strings"
	"testing"

	"github.com/goforj/web/webtest"
)

type recordingCreator struct {
	input CreateUserInput
}

// Create records the service input received from the controller.
func (c *recordingCreator) Create(_ context.Context, input CreateUserInput) (User, error) {
	c.input = input
	return User{
		ID:          "user_123",
		DisplayName: input.DisplayName,
		Email:       input.Email,
	}, nil
}

// TestControllerStoreRejectsMalformedPayload verifies bind failures use the public payload error.
func TestControllerStoreRejectsMalformedPayload(t *testing.T) {
	controller := &Controller{service: &recordingCreator{}}
	req := httptest.NewRequest(http.MethodPost, "/users", strings.NewReader(`{"email":`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	ctx := webtest.NewContext(req, rec, "/users", nil)

	if err := controller.Store(ctx); err != nil {
		t.Fatalf("store user: %v", err)
	}

	var response errorResponse
	if err := json.NewDecoder(rec.Body).Decode(&response); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusBadRequest)
	}
	if response.Error != errorInvalidPayload || len(response.Fields) != 0 {
		t.Fatalf("response = %#v", response)
	}
}

// TestControllerStoreReportsStableFieldErrors verifies decoded invalid input maps to field codes.
func TestControllerStoreReportsStableFieldErrors(t *testing.T) {
	controller := &Controller{service: &recordingCreator{}}
	body := `{"display_name":"  ","email":"not-an-email","password":"short"}`
	req := httptest.NewRequest(http.MethodPost, "/users", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	ctx := webtest.NewContext(req, rec, "/users", nil)

	if err := controller.Store(ctx); err != nil {
		t.Fatalf("store user: %v", err)
	}

	var response errorResponse
	if err := json.NewDecoder(rec.Body).Decode(&response); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	wantFields := map[string]string{
		"display_name": fieldRequired,
		"email":        fieldInvalidFormat,
		"password":     fieldTooShort,
	}
	if rec.Code != http.StatusUnprocessableEntity {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusUnprocessableEntity)
	}
	if response.Error != errorValidationFailed || !reflect.DeepEqual(response.Fields, wantFields) {
		t.Fatalf("response = %#v, want fields %#v", response, wantFields)
	}
}

// TestControllerStoreNormalizesInputWithoutChangingPassword verifies the successful boundary.
func TestControllerStoreNormalizesInputWithoutChangingPassword(t *testing.T) {
	creator := &recordingCreator{}
	controller := &Controller{service: creator}
	password := "  correct horse battery staple  "
	body := `{"display_name":"  Ada Lovelace  ","email":"  ADA@EXAMPLE.TEST  ","password":"` + password + `"}`
	req := httptest.NewRequest(http.MethodPost, "/users", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	ctx := webtest.NewContext(req, rec, "/users", nil)

	if err := controller.Store(ctx); err != nil {
		t.Fatalf("store user: %v", err)
	}

	wantInput := CreateUserInput{
		DisplayName: "Ada Lovelace",
		Email:       "ada@example.test",
		Password:    password,
	}
	if rec.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusCreated)
	}
	if !reflect.DeepEqual(creator.input, wantInput) {
		t.Fatalf("service input = %#v, want %#v", creator.input, wantInput)
	}
}
```

Run the App test suite from its root:

```bash
go test ./...
```

Expected result: all three controller paths pass, and the service receives normalized display and email fields with the password unchanged.

## Validation Boundary

Validate transport-level requirements such as required fields, basic shapes, allowed values, and path or query parameter presence before calling the service. Leave rules that require persistence, permissions, workflows, or domain decisions to the service.

Limit payload size before binding by following the [body-limit middleware guidance](/applications/middleware#common-middleware-needs). Keeping admission control with route setup avoids duplicating body-reading policy in controllers.

Always pass `ctx.Context()` into the service so request cancellation and deadlines continue through repositories, queues, caches, storage, and events.

## Next Steps

- [JSON API Route](/scenarios/json-api-route) provides a complete generate, build, test, and request workflow.
- [Controllers](/applications/controllers) explains request handler structure.
- [Responses and Errors](/applications/responses-errors) explains application error policy.
- [Application Services](/applications/services) explains service inputs.
