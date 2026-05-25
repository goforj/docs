---
title: Runnable Scenarios
description: End-to-end GoForj examples that show how generated Apps are built, wired, run, tested, and observed.
---

# Runnable Scenarios

Runnable scenarios show complete framework workflows inside a generated GoForj App.

Use these after the Quickstart when you want to build real application behavior instead of only reading individual feature pages.

## Scenarios

Start here:

- [JSON API Route](/scenarios/json-api-route) builds a route, controller, service, Wire provider, route registration, and service test.
- [Cached User Profile](/scenarios/cached-user-profile) adds a repository and named cache resource.
- [File Upload To Storage](/scenarios/file-upload-storage) writes uploads to a named storage disk.
- [Users Created Event](/scenarios/users-created-event) publishes a typed event and handles it with a lifecycle-registered subscriber.
- [Reports Generate Job](/scenarios/reports-generate-job) dispatches durable work from an event subscriber and processes it with a worker.

Planned later:

- `reports:daily` schedule
- runtime observability with metrics and inspects

These are tracked as action items in the internal docs roadmap. The current scenario set is enough to validate the main application-building path before the publishing quality pass continues.

## How To Read These

Each scenario uses the same small internal reporting app shape.

The examples are intentionally local-first. Production drivers, distributed backends, and operational deployment notes appear only after the local path works.

## Related Pages

- [Quickstart](/getting-started/quickstart)
- [Project Structure](/getting-started/project-structure)
- [Dependency Injection](/core/dependency-injection)
- [Applications](/applications/)
