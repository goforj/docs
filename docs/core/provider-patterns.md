---
title: Provider Patterns
description: Practical provider examples for typed configuration, required adapters, optional features, and multiple outbound integrations in GoForj Apps.
---

# Provider Patterns

Provider functions are normal Go constructors.

Use these patterns after the basic [Providers](/core/dependency-injection#providers) and [Dependency Injection](/core/dependency-injection) model is clear. The goal is explicit construction: providers return the domain values the App actually needs, configuration is resolved near the App boundary, required dependencies fail early, and optional behavior is modeled directly.

## Provide the Usable Value

Most providers should return a service, gateway, manager, or adapter. Typed configuration and low-level clients are usually internal construction details, not the things you wire into the App.

Example layout:

```text
internal/billing/gateway.go
internal/billing/provider.go
internal/billing/service.go
app/wire/inject_services_app.go
```

The application package owns the type the rest of the App should use:

```go
// internal/billing/gateway.go
package billing

import "github.com/goforj/httpx/v2"

type Gateway struct {
	http *httpx.Client
}

func NewGateway(client *httpx.Client) *Gateway {
	return &Gateway{http: client}
}
```

The same package can also own the service that depends on that gateway:

```go
// internal/billing/service.go
package billing

type Service struct {
	gateway *Gateway
}

func NewService(gateway *Gateway) *Service {
	return &Service{gateway: gateway}
}
```

The provider constructs the gateway from runtime configuration:

```go
// internal/billing/provider.go
package billing

import (
	"errors"
	"strings"
	"time"

	"github.com/goforj/env/v2"
	"github.com/goforj/httpx/v2"
)

type gatewayConfig struct {
	BaseURL string
	Timeout time.Duration
}

func loadGatewayConfig() gatewayConfig {
	return gatewayConfig{
		BaseURL: env.Get("BILLING_API_URL", ""),
		Timeout: env.GetDuration("BILLING_TIMEOUT", "5s"),
	}
}

func ProvideGateway() (*Gateway, error) {
	cfg := loadGatewayConfig()

	if strings.TrimSpace(cfg.BaseURL) == "" {
		return nil, errors.New("BILLING_API_URL is required")
	}

	client := httpx.New(
		httpx.BaseURL(cfg.BaseURL),
		httpx.Timeout(cfg.Timeout),
	)

	return NewGateway(client), nil
}
```

Then the app's `wire` package imports the application package and adds its providers to the app graph:

```go
// app/wire/inject_services_app.go
package wire

import (
	"github.com/google/wire"

	"myapp/internal/billing"
)

var appServiceSet = wire.NewSet(
	// existing app providers...
	billing.ProvideGateway,
	billing.NewService,
)
```

This wires `*billing.Service` with a `*billing.Gateway`, while keeping the raw HTTP client inside the billing package. The provider returns the domain dependency the rest of the App consumes, and configuration remains typed, local, and easy to test.

The module path and `httpx` version should match the App's `go.mod`.

## Optional Implementations

If a dependency is optional, model the disabled branch explicitly. Keep behavior in domain constructors and methods; the provider only chooses what to construct.

```go
func ProvideGateway() (Gateway, error) {
	cfg := loadFeatureConfig()

	if !cfg.Enabled {
		return NewDisabledGateway(), nil
	}
	if strings.TrimSpace(cfg.BaseURL) == "" {
		return nil, errors.New("BILLING_API_URL is required")
	}

	return NewHTTPGateway(
		httpx.New(
			httpx.BaseURL(cfg.BaseURL),
			httpx.Timeout(cfg.Timeout),
		),
	), nil
}
```

The service that receives `Gateway` does not need to know whether billing is enabled. The provider chooses the implementation from typed configuration, and the required adapter is only constructed when the feature is enabled.

Returning an error from a provider makes bad runtime configuration visible during App construction or command startup. Name the missing resource or environment variable in the error.

## Shared Configuration

Only provide configuration as its own Wire value when more than one provider consumes it.

```go
type Config struct {
	BaseURL       string
	Timeout       time.Duration
	WebhookSecret string
}

func ProvideConfig() Config {
	return Config{
		BaseURL:       env.Get("BILLING_API_URL", ""),
		Timeout:       env.GetDuration("BILLING_TIMEOUT", "5s"),
		WebhookSecret: env.Get("BILLING_WEBHOOK_SECRET", ""),
	}
}

func ProvideGateway(cfg Config) (Gateway, error) {
	// build the outbound billing gateway
}

func ProvideWebhookVerifier(cfg Config) (*WebhookVerifier, error) {
	// build another dependency from the same config
}
```

This is useful when a package has a small configuration surface shared by several dependencies. Avoid exposing config as a provider just because it is convenient to read environment variables in isolation.

## Multiple Integrations

When an App talks to multiple services, give each integration its own domain adapter. Avoid injecting several raw values of the same type, such as multiple `*httpx.Client` values, into the graph.

```go
// internal/billing/gateway.go
package billing

import "github.com/goforj/httpx/v2"

// Gateway adapts the billing service for application code.
type Gateway struct {
	http *httpx.Client
}

// ProvideGateway constructs the billing adapter from billing configuration.
func ProvideGateway() (*Gateway, error) {
	cfg := loadGatewayConfig()
	client := httpx.New(
		httpx.BaseURL(cfg.BaseURL),
		httpx.Timeout(cfg.Timeout),
	)
	return &Gateway{http: client}, nil
}
```

```go
// internal/search/indexer.go
package search

import "github.com/goforj/httpx/v2"

// Indexer adapts the search service for application code.
type Indexer struct {
	http *httpx.Client
}

// ProvideIndexer constructs the search adapter from search configuration.
func ProvideIndexer() (*Indexer, error) {
	cfg := loadIndexerConfig()
	client := httpx.New(
		httpx.BaseURL(cfg.BaseURL),
		httpx.Timeout(cfg.Timeout),
	)
	return &Indexer{http: client}, nil
}
```

The package and type names make the graph readable:

```go
// internal/checkout/service.go
package checkout

import (
	"myapp/internal/billing"
	"myapp/internal/search"
)

// Service coordinates checkout through domain-specific integrations.
type Service struct {
	billing *billing.Gateway
	search  *search.Indexer
}

// NewService constructs a checkout service from its required integrations.
func NewService(billing *billing.Gateway, search *search.Indexer) *Service {
	return &Service{
		billing: billing,
		search:  search,
	}
}
```

`checkout` imports the packages that own the adapters. Register the two providers and the consumer constructor in the App-local Wire set:

```go
// app/wire/inject_services_app.go
package wire

import (
	"github.com/google/wire"

	"myapp/internal/billing"
	"myapp/internal/checkout"
	"myapp/internal/search"
)

var appServiceSet = wire.NewSet(
	// existing App service providers...
	billing.ProvideGateway,
	search.ProvideIndexer,
	checkout.NewService,
)
```

Wire resolves the `*billing.Gateway` and `*search.Indexer` parameters required by `checkout.NewService`. The package dependency direction remains one-way:

```text
app/wire ──> checkout ──> billing
         ├──────────────> billing
         └──────────────> search
```

Application packages do not import `app/wire`; it is the composition root, not a package that owns domain types. That one-way dependency keeps Wire out of application code.

If `billing` also needs checkout behavior, do not make the packages import each other. Define the narrow interface in the consuming package and bind the concrete adapter in `app/wire`. The composition root can reference both packages without creating a package cycle.

This structure also gives each adapter a natural place for service-specific methods, retry policy, headers, dumps, and test doubles.

## Common Mistakes

::: warning Common mistakes
- Do not use package globals to share clients or services.
- Do not read environment variables from every leaf service method.
- Do not provide config as its own Wire value when only one constructor uses it.
- Do not put business workflows in providers.
- Do not return `nil` for required dependencies.
- Do not inject raw clients of the same type when domain adapters would make the graph clearer.
- Do not start long-running goroutines from providers unless the constructed type explicitly owns that lifecycle.
:::

## Next Steps

- [Providers](/core/dependency-injection#providers) explains the underlying constructor model.
- [Dependency Injection](/core/dependency-injection) explains Wire generation and provider sets.
- [Wiring Recipes](/core/wiring-recipes) shows where providers are registered.
- [Reading Wire Errors](/core/reading-wire-errors) explains how to debug missing and duplicate providers.
- [HTTP Clients](/applications/http-clients) shows outbound HTTP client diagnostics and dump behavior.
- [Application Services](/applications/services) shows where application-owned services fit.
