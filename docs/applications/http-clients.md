---
title: HTTP Clients
description: Build outbound HTTP clients in GoForj Apps with explicit construction, diagnostics, and safe dump behavior.
---

# HTTP Clients

Outbound HTTP clients call services outside your App.

Use `httpx` when application code needs typed request helpers, retries, request options, or diagnostic dumps around outbound HTTP calls.

## Where Clients Live

Keep outbound clients in application-owned packages:

```text
internal/billing
internal/notifications
internal/search
```

Construct clients through providers and inject them into services. Do not hide outbound clients behind package globals.

## Client Shape

Create a small client type around `httpx.Client`:

```go
package billing

import "github.com/goforj/httpx/v2"

type Client struct {
	http *httpx.Client
}

func NewClient(baseURL string) *Client {
	return &Client{
		http: httpx.New(
			httpx.BaseURL(baseURL),
			httpx.UserAgent("my-app/1.0"),
		),
	}
}
```

Then inject that client into the service that owns the workflow:

```go
type Service struct {
	billing *Client
}

func NewService(billing *Client) *Service {
	return &Service{billing: billing}
}
```

The module path and `httpx` version should match the App's `go.mod`.

## Environment-Enabled Dumps

`httpx.New()` checks `HTTP_TRACE`. When the variable is present, the client enables request and response dump output for all requests made through that client.

Run a command with dumps enabled:

```bash
HTTP_TRACE=1 forj run sync:billing
```

Unset the variable to disable this behavior:

```bash
forj run sync:billing
```

`HTTP_TRACE` is useful for local diagnosis and temporary operator debugging. It should not be a normal production setting.

## Request-Scoped Diagnostics

Use request-scoped options when only one call needs detail:

```go
response, err := httpx.Get[map[string]any](
	httpx.New(),
	"https://httpbin.org/uuid",
	httpx.Trace(),
	httpx.EnableDump(),
)
if err != nil {
	return err
}

httpx.Dump(response)
// #map[string]interface {} {
//   uuid => "00000000-0000-0000-0000-000000000000" #string
// }
```

Use client-level options when every request from one client needs diagnostic output:

```go
client := httpx.New(
	httpx.DumpAll(),
	httpx.TraceAll(),
)
```

Prefer the narrowest diagnostic scope that proves the issue.

## Capture Dumps

For tests or command output, capture dumps into a buffer:

```go
var buf bytes.Buffer

client := httpx.New(httpx.DumpEachRequestTo(&buf))

_, err := httpx.Get[map[string]any](client, "https://httpbin.org/uuid")
if err != nil {
	return err
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

## Common Mistakes

::: warning Common mistakes
- Do not use `HTTP_TRACE` as a permanent production setting.
- Do not log dumps from requests that carry secrets unless redaction is handled.
- Do not create outbound clients in leaf methods on every request.
- Do not hide clients in package globals when providers can inject them explicitly.
- Do not put business retry decisions in HTTP diagnostics code.
:::

## Next Steps

- [Application Services](/applications/services) explains where outbound calls belong in workflows.
- [Configuration](/getting-started/configuration) explains runtime environment configuration.
- [HTTPX](/httpx) covers standalone package APIs.
