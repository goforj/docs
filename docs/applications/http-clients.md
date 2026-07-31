---
title: HTTP Clients
description: Build outbound HTTP clients in GoForj Apps with explicit construction, diagnostics, and safe dump behavior.
---

# HTTP Clients

Outbound HTTP clients call services outside your App.

Use `httpx` when application code needs typed request helpers, retries, request options, or diagnostic dumps around outbound HTTP calls.

::: info HTTPX package reference
This page shows how to construct and inject outbound clients in a GoForj App. The [HTTPX library page](/httpx) provides standalone usage and the complete client API reference.
:::

## Where Clients Live

Keep outbound clients in application-owned packages:

```text
internal/billing
internal/notifications
internal/search
```

Construct clients through providers and inject them into services. Do not hide outbound clients behind package globals.

## Client Shape

Create `internal/billing/client.go` as a small typed boundary around `httpx.Client`:

<!-- go-example: illustrative-fragment -->
```go
package billing

import (
	"context"
	"net/url"

	"github.com/goforj/httpx"
)

// Invoice is the billing response used by application services.
type Invoice struct {
	ID     string `json:"id"`
	Status string `json:"status"`
}

// Client owns outbound calls to the billing service.
type Client struct {
	http *httpx.Client
}

// NewClient constructs a billing client for one configured endpoint.
func NewClient(baseURL string) *Client {
	return &Client{
		http: httpx.New(
			httpx.BaseURL(baseURL),
			httpx.UserAgent("my-app/1.0"),
		),
	}
}

// FindInvoice returns one invoice while preserving caller cancellation.
func (c *Client) FindInvoice(ctx context.Context, id string) (Invoice, error) {
	result := httpx.GetCtx[Invoice](
		c.http,
		ctx,
		"/api/v1/invoices/"+url.PathEscape(id),
	)
	return result.Body, result.Err
}
```

Generated GoForj Apps currently pin `github.com/goforj/httpx` v1. Use that module path unless the App's `go.mod` has intentionally been upgraded.

## Configure and Provide the Client

Keep environment lookup at the App composition boundary. Add a focused provider to `app/wire/inject_services_app.go`:

<!-- go-example: illustrative-fragment -->
```go
// provideBillingClient resolves required endpoint configuration when a reachable service needs it.
func provideBillingClient() (*billing.Client, error) {
	baseURL := strings.TrimSpace(os.Getenv("BILLING_API_URL"))
	if baseURL == "" {
		return nil, errors.New("BILLING_API_URL is required")
	}
	return billing.NewClient(baseURL), nil
}

var appSet = wire.NewSet(
	// existing App providers...
	provideBillingClient,
	billing.NewService,
)
```

This is a composition fragment: add the `errors`, `os`, `strings`, and application package imports to the existing file. To make the provider reachable, inject `*billing.Service` into a controller constructor registered in `app/wire/inject_http_controllers_app.go`, or into a command registered in its matching Wire set. Wire evaluates providers only when something in the built graph depends on their result. Configure the endpoint through the runtime environment:

```dotenv
BILLING_API_URL=https://billing.internal
```

The application service receives the typed client rather than constructing HTTP dependencies inside a request or job:

<!-- go-example: illustrative-fragment -->
```go
type Service struct {
	billing *Client
}

// NewService constructs the billing application service.
func NewService(billing *Client) *Service {
	return &Service{billing: billing}
}

// FindInvoice delegates one outbound lookup through the typed billing boundary.
func (s *Service) FindInvoice(ctx context.Context, id string) (Invoice, error) {
	return s.billing.FindInvoice(ctx, id)
}
```

## Make the Service Reachable

An entry point must consume the service before Wire includes its providers. For an HTTP app, inject it into a controller:

<!-- go-example: illustrative-fragment -->
```go
// internal/invoices/controller.go
type Controller struct {
	billing *billing.Service
}

// NewController constructs the invoice HTTP controller.
func NewController(billing *billing.Service) *Controller {
	return &Controller{billing: billing}
}
```

Register that constructor in the HTTP controller set:

<CodeFile path="app/wire/inject_http_controllers_app.go">

<!-- go-example: illustrative-fragment -->
```go
var appHttpControllerSet = wire.NewSet(
	// existing controller providers...
	invoices.NewController,
)
```

</CodeFile>

Now the dependency path is complete:

```text
HTTP routes -> invoices.Controller -> billing.Service -> billing.Client
```

Wire retains every provider in that path. With `BILLING_API_URL` missing, constructing the HTTP runtime returns the provider error before the server starts.

## Test the Boundary

Use `httptest.Server` so the client contract is executable without an external service. Create `internal/billing/client_test.go`:

<!-- go-example: illustrative-fragment -->
```go
package billing

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

// TestClientFindInvoice verifies the outbound method, path, and typed response.
func TestClientFindInvoice(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet || r.URL.Path != "/api/v1/invoices/inv-42" {
			t.Errorf("request = %s %s", r.Method, r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		if _, err := fmt.Fprint(w, `{"id":"inv-42","status":"paid"}`); err != nil {
			t.Errorf("write response: %v", err)
		}
	}))
	defer server.Close()

	invoice, err := NewClient(server.URL).FindInvoice(context.Background(), "inv-42")
	if err != nil {
		t.Fatalf("FindInvoice returned error: %v", err)
	}
	if invoice.ID != "inv-42" || invoice.Status != "paid" {
		t.Fatalf("invoice = %#v", invoice)
	}
}
```

Run:

```bash
go test ./internal/billing
forj build
```

Expected result: the client test passes and `forj build` succeeds. When a registered controller or command depends on `*billing.Service`, a missing `BILLING_API_URL` makes Wire construction fail before that runtime starts; it is not validated merely because the provider appears in `appSet`.

## Environment-Enabled Dumps

`httpx.New()` checks `HTTP_TRACE`. When the variable is present, the client enables request and response dump output for all requests made through that client.

Run a command with dumps enabled:

```bash
HTTP_TRACE=1 forj sync:billing
```

Unset the variable to disable this behavior:

```bash
forj sync:billing
```

`HTTP_TRACE` is useful for local diagnosis and temporary operator debugging. It should not be a normal production setting.

## Request-Scoped Diagnostics

Use request-scoped options when only one call needs detail:

<!-- go-example: illustrative-fragment -->
```go
result := httpx.Get[map[string]any](
	httpx.New(),
	"https://httpbin.org/uuid",
	httpx.Trace(),
	httpx.Dump(),
)
if result.Err != nil {
	return result.Err
}

fmt.Println(result.Body["uuid"])
// 00000000-0000-0000-0000-000000000000
```

Use client-level options when every request from one client needs diagnostic output:

<!-- go-example: illustrative-fragment -->
```go
client := httpx.New(
	httpx.DumpAll(),
	httpx.TraceAll(),
)
```

Prefer the narrowest diagnostic scope that proves the issue.

## Capture Dumps

For tests or command output, capture dumps into a buffer:

<!-- go-example: illustrative-fragment -->
```go
var buf bytes.Buffer

client := httpx.New(httpx.DumpEachRequestTo(&buf))

result := httpx.Get[map[string]any](client, "https://httpbin.org/uuid")
if result.Err != nil {
	return result.Err
}

log.Print(buf.String())
```

Captured output is useful when a test or one-shot command needs to preserve the exact outbound exchange.

## Output Shape

Dump output is intentionally low-level. It shows the outbound request and inbound response:

```text
GET /uuid HTTP/1.1
Host: httpbin.org
User-Agent: my-app/1.0

HTTP/2 200 OK
Content-Type: application/json

{"uuid":"00000000-0000-0000-0000-000000000000"}
```

Actual output can include more headers, redirects, retry attempts, and body content depending on the request and transport.

## Safety

HTTP dumps can expose sensitive data:

- authorization headers
- cookies
- API tokens
- request bodies
- response bodies
- query strings

Do not enable broad dump output in production unless output is controlled, retained safely, and reviewed for secrets. Prefer request-scoped diagnostics when possible.

## Next Steps

- [Application Services](/applications/services) explains where outbound calls belong in workflows.
- [Configuration](/getting-started/configuration) explains runtime environment configuration.
- [HTTPX](/httpx) covers standalone package APIs.
