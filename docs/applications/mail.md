---
title: Mail
description: Send application and auth email through generated default and named GoForj mailers.
---

# Mail

The Mail component gives a generated App one portable message API with local and production delivery drivers.

Use it for account email, invitations, receipts, reports, and other outbound messages. Application code composes message intent; generated providers choose the transport.

## Generated Ownership

Generated mail integration lives in:

```text
internal/mail/
app/wire/inject_managers.go
```

`internal/mail` owns the generated manager, driver construction, named accessors, auth delivery integration, and observability hooks. App services should use that manager instead of importing SMTP or provider SDKs.

The underlying portable message API comes from [`github.com/goforj/mail`](/mail).

## Local-First Configuration

Without Docker, the generated fallback is the `log` driver:

```dotenv
MAIL_DRIVER=log
MAIL_SUPPORTED_DRIVERS=log
MAIL_FROM_ADDRESS=no-reply@example.com
MAIL_FROM_NAME=Example App
MAIL_LOG_BODIES=false
```

The log driver writes delivery metadata to application output. Message bodies stay hidden unless `MAIL_LOG_BODIES=true`.

When local Docker support is selected, generated Apps can use SMTP with Mailpit:

```dotenv
MAIL_DRIVER=smtp
MAIL_SUPPORTED_DRIVERS=smtp
MAIL_SMTP_HOST=mailpit
MAIL_SMTP_PORT=1025
MAILPIT_HTTP_PORT=8025
```

Mailpit provides a local inbox at `http://localhost:8025` without delivering messages to real recipients.

## Send a Message

Inject the generated manager into the service that owns the workflow:

```go
package notifications

import (
	"context"

	"your/module/internal/mail"
)

// WelcomeService owns welcome-message delivery for new users.
type WelcomeService struct {
	mail *mail.Manager
}

// NewWelcomeService creates a welcome-message service.
func NewWelcomeService(mailManager *mail.Manager) *WelcomeService {
	return &WelcomeService{mail: mailManager}
}

// Send delivers one welcome message through the default mailer.
func (s *WelcomeService) Send(ctx context.Context, email, name string) error {
	return s.mail.Default().
		Message().
		To(email, name).
		Subject("Welcome").
		Text("Your account is ready.").
		HTML("<p>Your account is ready.</p>").
		Send(ctx)
}
```

Add `notifications.NewWelcomeService` to the owning App's service provider set, then run:

```bash
forj build
```

## Named Mailers

Use a named mailer when one App needs distinct senders or providers:

```dotenv
MAIL_TRANSACTIONAL_DRIVER=resend
MAIL_TRANSACTIONAL_FROM_ADDRESS=transactions@example.com
MAIL_TRANSACTIONAL_FROM_NAME=Example Transactions
MAIL_TRANSACTIONAL_RESEND_API_KEY=secret
```

After generation, use the typed accessor:

```go
err := manager.Transactional().
	Message().
	To("alice@example.com", "Alice").
	Subject("Receipt ready").
	Text("Your receipt is ready.").
	Send(ctx)
```

`manager.Named("transactional")` is available for dynamic operator-oriented lookup. Business code should prefer generated typed accessors when the mailer name is known at compile time.

## Auth Integration

Auth implies Mail. Generated password-reset and email-verification delivery uses the default mailer automatically.

Keep auth message construction in the generated auth and mail integration. Changing the transport should be an environment and supported-driver change, not a rewrite of auth workflows.

## Driver Selection

`MAIL_SUPPORTED_DRIVERS` controls which transports are compiled into the App. `MAIL_DRIVER` and `MAIL_<NAME>_DRIVER` select among those compiled drivers at runtime.

Supported framework drivers include:

- `log`
- `smtp`
- `resend`
- `postmark`
- `mailgun`
- `sendgrid`
- `ses`

Use the [Mail library page](/mail) for transport capabilities and provider-specific settings.

## Testing

For generated App integration, use the `log` driver and capture output or exercise the owning service with a local manager.

For isolated service tests, place a narrow mail boundary around the workflow and use the library's `mailfake` driver. Assert recipient, subject, body, and send count without contacting a provider.

Keep live provider credentials out of normal unit and integration suites.

## Operations

Generated mail sends emit observer events used by logs, metrics, and inspects when those components are enabled.

In production:

- compile only the providers the deployment uses
- inject credentials through the deployment environment
- verify sender domains and provider authentication
- keep message bodies and recipient data out of default logs
- monitor send failures by bounded mailer and driver names
- use provider dashboards for delivery, bounce, and complaint state

## Common Mistakes

::: warning Common mistakes
- Do not import provider SDKs into application services.
- Do not enable real delivery for local tests.
- Do not log message bodies or provider credentials by default.
- Do not add a named mailer without regenerating typed accessors.
- Do not treat successful provider submission as proof of inbox delivery.
:::

## Next Steps

- [Mail Library](/mail) covers message composition and transport APIs.
- [Named Resources](/core/named-resources) explains generated accessors.
- [Driver Selection](/data/driver-selection) explains compile-time support and runtime selection.
- [Auth](/security/auth) explains generated account email flows.
