---
title: Command Tests
description: How to test GoForj App commands without turning them into shell-script integration tests.
---

# Command Tests

Commands are App entry points, but command behavior should still delegate to services.

Test command input, output, and service delegation at the command boundary. Test the service workflow separately.

## Command Shape

Commands are constructed through providers and expose a `Run` method.

```go
cmd := NewReconcileReportsCmd(service)
if err := cmd.Run(); err != nil {
	t.Fatalf("run command: %v", err)
}
```

## What To Test

Command tests are a good fit for:

- flag defaults
- input validation
- service invocation
- command output
- error behavior
- generated command registration when needed

## Runtime Commands

Commands such as `api`, `worker`, and `scheduler` are runtime boundaries.

Prefer testing their owned runtime components directly unless the command wiring itself is the target.

For named apps, the prefix is routing, not business behavior. Test command logic at the command type or service boundary; use a rendered smoke test only when you need confidence that `forj marketplace <command>` reaches the marketplace app command tree.

## Verify

Run command-package tests from your App root:

```bash
go test ./internal/cmd/...
```

Expected result: every command package reports `ok`. If the command is registered through App wiring, also run `forj build`; expected result: Wire generation succeeds before the package tests run.

## Next Steps

- [Commands](/applications/commands) explains command structure.
- [Unit Tests](/testing/unit-tests) covers service behavior.
- [Rendered App Smoke Tests](/testing/rendered-app-smoke-tests) covers binary-level confidence.
