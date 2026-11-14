---
title: Feature, Search, and Notification Resources
description: Configure named feature evaluators, search indexes, and notification senders through app-owned framework resources.
---

# Feature, Search, and Notification Resources

Use named framework resources to configure feature evaluators, search indexes, and notification senders once, then inject their managers into application services. The app owns driver selection and lifecycle; services use generated accessors.

These optional integrations follow the development line. Check your CLI and Project version before adding their component keys to a released Project. Standalone package APIs remain available independently.

## Enable the Resources You Need

Add the relevant keys to your existing `.goforj.yml` component selection:

```yaml
render:
  components:
    feature: true
    search: true
    notification: true
```

Declare `*_SUPPORTED_DRIVERS` manifests at Project scope. App-prefixed driver settings select active resources, while the Project manifest controls which drivers are compiled.

Render the selected components:

```bash
forj render
```

Expected result: the Project includes the enabled `internal/features`, `internal/searches`, and `internal/notifications` packages and app providers. A disabled component emits no resource package, configuration, or dependency.

| Resource | App access | Application responsibility |
| --- | --- | --- |
| Feature evaluator | `app.Features().Checkout()` | Stable targeting, explicit fallbacks, and request snapshots |
| Search index | `app.Searches().Catalog()` | Schema declarations, indexing, backfill, and visibility policy |
| Notification sender | `app.Notifications().Alerts()` | Message content and deliberate channel or fallback policy |

The example named accessors appear only after declaring those resources and running generation. Creating or removing an app reconciles its feature evaluators, search indexes, notification senders, and app-only accessors automatically. It preserves root settings and other apps' overlays. Inject the relevant manager through the owning app's service Wire set. Use `app/wire/inject_services_app.go` for the default app or `app/<name>/wire/inject_services_app.go` for an additional app.

Environment keys belong to the longest configured App prefix. For an App named `billing-feature`, its checkout evaluator key is `BILLING_FEATURE_FEATURE_CHECKOUT_DRIVER`: the first `FEATURE` is part of the App name, and the second identifies the resource. Keep this prefix when adding or editing an App's resource settings.

## Configure a Feature Evaluator

The generated environment starts with an empty memory evaluator and no inline JSON definition. No flag file is needed to boot, and undefined boolean checks return false. Use a file source for normal flag definitions. `FEATURE_DOCUMENT` remains an optional memory-source override for tests or small fixtures.

For a local file-backed checkout evaluator, put these settings in the app environment:

```dotenv
FEATURE_SUPPORTED_DRIVERS=memory,file
FEATURE_CHECKOUT_DRIVER=file
FEATURE_CHECKOUT_PATH=storage/flags/checkout.json
```

Create `storage/flags/checkout.json`:

```json
{
  "schema": 1,
  "flags": {
    "checkout-v2": {"default": false},
    "receipt-v2": {"default": false}
  }
}
```

Generate the typed accessor and rebuild:

```bash
forj build
```

Expected result: `internal/features/accessors_gen.go` exposes `Checkout()`, and the app builds. Startup loads the source synchronously; an invalid initial document fails initialization.

The lifecycle watches source directories and coalesces file changes in 50ms windows, including atomic replacement. Continuous directory activity does not postpone updates indefinitely.

Healthy watches do not poll. If a watch cannot be established or becomes unavailable, polling and watch retries run every 30s until watching recovers.

Symlinked paths use polling on macOS/BSD, whose watcher cannot reliably report link replacement; supported platforms watch link control directories and follow changed targets. Notification overflow rebuilds notification coverage and refreshes immediately. The optional `FEATURE_REFRESH_INTERVAL` override changes the fallback interval and is omitted from the rendered environment.

Memory sources start no background workers. Shutdown cancels and joins file workers.

In a service that receives `*features.Manager`, a simple boolean check is:

<!-- go-example: illustrative-fragment -->
```go
enabled := manager.Checkout().Enabled(ctx, "checkout-v2")
```

For tenant targeting, bind a stable identity:

<!-- go-example: illustrative-fragment -->
```go
flags := manager.Checkout().For(feature.Target{Key: tenantID})
enabled := flags.Enabled(ctx, "checkout-v2")
```

`Enabled` returns a boolean with a false fallback. Use `Evaluate(ctx, key, fallback)` for an explicit fallback or full decision metadata. Ordinary checks can observe configuration updates independently.

**When related decisions must agree:** capture one snapshot so they share the same configuration revision and evaluation time:

<!-- go-example: illustrative-fragment -->
```go
snapshot, err := manager.Checkout().Snapshot()
if err != nil {
	return err
}
flags := snapshot.For(feature.Target{Key: tenantID})
checkout := flags.Enabled(ctx, "checkout-v2")
receipt := flags.Enabled(ctx, "receipt-v2")
```

`For` alone captures targeting data, not a configuration revision. A snapshot keeps both decisions on one revision and evaluation time. A failed refresh retains valid decisions and keeps readiness usable; `Instances()` exposes refresh status for diagnostics. Feature flags do not replace authorization.

Native memory and file sources are the initial framework drivers. Evaluator resource names identify configuration sources, not individual dynamic flag keys. See [Feature](/feature) for document rules and standalone APIs.

## Declare and Provision a Search Index

Declare domain schemas in the app-owned `SearchDefinitions()` map in `app/search.go`, or the owning additional app's equivalent. Environment settings select backend configuration, not schema fields.

For example, replace the generated empty definition map:

<!-- go-example: illustrative-fragment -->
```go
// SearchDefinitions declares the catalog projection owned by this app.
func SearchDefinitions() map[string]search.Definition {
	return map[string]search.Definition{
		"catalog": {
			Name: "catalog",
			Fields: []search.Field{
				{Name: "title", Type: search.TextField, Searchable: true},
				{Name: "category", Type: search.KeywordField, Filterable: true},
			},
		},
	}
}
```

For a declared `catalog` index:

```dotenv
SEARCH_DRIVER=bleve
SEARCH_PATH=storage/search
SEARCH_CATALOG_DRIVER=bleve
```

Generate `Catalog()`:

```bash
forj generate --search
```

Expected result: `internal/searches/accessors_gen.go` contains the named accessor. A configured index without a matching app definition is an error. An enabled search component with no definitions and no named configuration is inert; there is no implicit default schema.

For an additional App, use its own definitions with `searches.ProvisionForApp(ctx, "ADMIN", admin.SearchDefinitions())`. The prefix must match the App environment prefix; provisioning one App does not require another App's schema.

Before first startup, explicitly provision the declared schemas with `searches.Provision(ctx, app.SearchDefinitions())` from a bounded, application-owned bootstrap program. The generated `internal/searches/README.md` contains a complete `tools/search-provision/main.go` example that loads configuration without initializing the runtime graph. Keep this utility under `tools/`, because `cmd/` directories belong to runtime Apps.

Stop any app owning the same Bleve path, then run the bootstrap:

```bash
go run ./tools/search-provision
```

Expected result: compatible schemas are provisioned and the program releases its backend handles. Ordinary app startup validates schemas; it does not destroy and recreate incompatible indexes. For schema changes, provision a new path or service prefix, rebuild from durable records, and switch deliberately.

Services use the injected manager's `Catalog()` handle. Keep indexing and `Wait` outcome handling explicit before promising that a write is searchable. Bleve requires one process owner per physical index. For multiple replicas, the initial external driver is Meilisearch, selected through the supported-driver manifest and endpoint configuration. See [Search](/search) for portable query and receipt APIs.

## Configure a Notification Sender

Start with local capture:

```dotenv
NOTIFICATION_DRIVER=log
NOTIFICATION_ALERTS_DRIVER=log
```

Generate the accessor and rebuild:

```bash
forj build
```

Expected result: the manager exposes `Alerts()`. The local driver captures acceptance without logging message content or contacting a provider.

In a service that receives `*notifications.Manager`:

<!-- go-example: illustrative-fragment -->
```go
err := manager.Alerts().Send(ctx, notification.Message{
	Title: "Report ready",
	Body:  "Your requested report is ready to download.",
})
```

Handle the returned error through application policy. The initial framework drivers are log and webhook; compiling webhook support requires `NOTIFICATION_SUPPORTED_DRIVERS=log,webhook` and regeneration. Destinations and credentials stay in trusted configuration. App shutdown closes only the transports the manager owns.

A synchronous send adds no automatic retries, background execution, or proof that a recipient received the message. Compose fallback or fanout explicitly, and use a queue job when delivery work must be durable. See [Notification](/notification) and [Events versus Queues](/async/events-vs-queues).

## Verify Ownership and Behavior

Default-app settings use the root prefixes above. Additional apps use the existing environment overlays, such as `ADMIN_FEATURE_CHECKOUT_PATH` or `ADMIN_NOTIFICATION_ALERTS_DRIVER`. Give independent search owners independent physical paths or service prefixes.

From the Project root:

```bash
go test ./...
```

Expected result: tests cover the actual named resource and its failures. Verify retained feature snapshots after refresh errors, search filters and write visibility, and notification error/cancellation behavior. Use fake credentials, recording senders, and local test servers.

Do not edit generated manager or accessor files. Change environment resource declarations, app-owned schemas, and service providers, then regenerate through the normal build workflow. The generated resource READMEs describe the enabled driver limits and configuration keys.
