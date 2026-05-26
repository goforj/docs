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

## Common Mistakes

::: warning Common mistakes
- Do not duplicate service workflow tests in command tests.
- Do not shell out to the binary when a direct command test is enough.
- Do not use package globals to bypass command injection.
- Do not turn every command test into a full rendered App integration test.
:::

## Next Steps

- [Commands](/applications/commands) explains command structure.
- [Unit Tests](/testing/unit-tests) covers service behavior.
- [Rendered App Smoke Tests](/testing/rendered-app-smoke-tests) covers binary-level confidence.
