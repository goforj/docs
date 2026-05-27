---
title: Testing
description: Test GoForj applications, services, commands, queues, events, cache, storage, and rendered Apps.
---

# Testing

Testing is part of the normal GoForj workflow.

Start with normal Go tests for services and handlers. Add runtime, integration, or rendered App tests only when the behavior crosses a runtime boundary or depends on generated wiring.

## Recommended Path

1. [Testing Overview](/testing/overview) explains the test layers.
2. [Unit Tests](/testing/unit-tests) covers service and pure behavior.
3. [HTTP Tests](/testing/http-tests) covers controllers, route groups, and generated HTTP behavior.
4. [Job and Queue Tests](/testing/job-queue-tests) covers background work.
5. [Integration Tests](/testing/integration-tests) covers backend and rendered App boundaries.

## All Testing Pages

- [Testing Overview](/testing/overview)
- [Unit Tests](/testing/unit-tests)
- [HTTP Tests](/testing/http-tests)
- [Command Tests](/testing/command-tests)
- [Job and Queue Tests](/testing/job-queue-tests)
- [Event Tests](/testing/event-tests)
- [Cache and Storage Tests](/testing/cache-storage-tests)
- [Integration Tests](/testing/integration-tests)
- [Rendered App Smoke Tests](/testing/rendered-app-smoke-tests)

## Related Sections

- [Getting Started](/getting-started/) introduces the first local application path.
- [Operations](/operations/) explains runtime behavior that integration tests should verify.
