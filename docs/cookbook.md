---
title: Cookbook
description: A task index for GoForj. Find the page that answers a "how do I" question without reading the whole manual.
---

# Cookbook

Every entry answers one "how do I" question and links to the page that owns the answer. For a guided path instead of a lookup table, start with the [Quickstart](/getting-started/quickstart) and build through the [verified scenarios](/scenarios/).

## Project Setup

- Create a new Project: `forj new`. [Quickstart](/getting-started/quickstart)
- Understand the generated layout. [Project Structure](/getting-started/project-structure)
- Add or remove components after the first render. [Configuration](/getting-started/configuration)
- Change ports, drivers, or settings. [Configuration](/getting-started/configuration) and [Environment Variables](/reference/env-vars)
- Start with a frontend included. [Starter Kits](/getting-started/starter-kits)
- Add a second deployable app: `forj make:app billing`. [Apps](/core/apps)

## HTTP

- Build a JSON route end to end. [JSON API Route](/scenarios/json-api-route)
- Create a controller: `forj make:controller users`. [Controllers](/applications/controllers)
- Register routes and route groups. [Routes](/applications/routes)
- Validate request input. [Requests and Validation](/applications/requests-validation)
- Shape JSON responses and errors. [Responses and Errors](/applications/responses-errors)
- Add middleware to a route or group. [Middleware](/applications/middleware)
- See every route the App serves: `forj route:list`. [Routes](/applications/routes)
- Serve Swagger and OpenAPI. [OpenAPI](/applications/openapi)
- Call an external API with a typed client. [HTTP Clients](/applications/http-clients)
- Add health and readiness checks. [Health and Readiness](/operations/health-readiness)

## Background Work

- Move work to the background: `forj make:job emails:send --queue default`. [Jobs](/async/jobs)
- Dispatch a durable job from an event. [Reports Generate Job](/scenarios/reports-generate-job)
- Set retries, timeouts, and idempotency. [Retries and Idempotency](/async/retries-idempotency)
- Run workers for one queue: `forj worker --queue reports`. [Workers](/async/workers)
- Add a second named queue. [Queues](/async/queues)
- Run something every night: `forj make:schedule reports:daily --every 24h`. [Scheduler](/async/scheduler)
- Announce a fact other code reacts to. [Events](/async/events) and [Event Subscribers](/async/event-subscribers)
- Decide between an event and a job. [Events versus Queues](/async/events-vs-queues)

## Data

- Choose a database and driver. [Database Strategy](/data/database-strategy)
- Decide local versus production drivers for any primitive. [Driver Selection](/data/driver-selection)
- Write and run migrations: `forj migrate`. [Migrations](/data/migrations)
- Put reads and writes behind a boundary. [Repositories](/data/repositories)
- Use transactions safely. [Transactions](/data/transactions)
- Cache an expensive read. [Cached User Profile](/scenarios/cached-user-profile) and [Cache Patterns](/data/cache-patterns)
- Add locks, counters, or rate limits. [Cache Patterns](/data/cache-patterns)
- Accept file uploads. [File Upload Storage](/scenarios/file-upload-storage)
- Add a named storage disk. [Storage Patterns](/data/storage-patterns)
- Query the database from a shell: `forj db`. [Database Shell](/data/database-shell)

## CLI and Wiring

- Add a CLI command. [Commands](/applications/commands)
- Keep business logic out of controllers. [Services](/applications/services)
- Provide a new dependency. [Dependency Injection](/core/dependency-injection) and [Providers](/core/providers)
- Copy a known-good wiring shape. [Wiring Recipes](/core/wiring-recipes)
- Decode a Wire build failure. [Reading Wire Errors](/core/reading-wire-errors)
- See every generator, or undo one with `--remove`. [Make Commands](/core/make-commands)
- Keep a feature's files together. [Organizing Generated Code](/core/organizing-generated-code)
- Name things the way the framework expects. [Naming Conventions](/core/naming-conventions)

## Email and Security

- Send and preview email. [Mail](/mail)
- Add login, sessions, and password reset. [Auth](/security/auth)
- Encrypt values with key rotation. [Crypt](/crypt)

## Operations

- Run everything as one process. [Standalone versus Distributed](/operations/standalone-vs-distributed)
- Split into separate processes for scale. [Runtime Processes](/operations/runtime-processes)
- Expose Prometheus metrics. [Metrics](/operations/metrics)
- See what a request, job, or schedule run actually did. [Inspects](/operations/inspects)
- Watch the App from a first-party UI. [Lighthouse](/operations/lighthouse)
- Configure logging. [Logging](/operations/logging)
- Keep workers healthy in production. [Queue Workers](/operations/queue-workers)
- Ship a binary to a server. [Deployment Basics](/operations/deployment-basics)
- Check readiness before launch. [Production Checklist](/operations/production-checklist)

## Testing

- Decide what kind of test to write. [Testing Overview](/testing/overview)
- Test a route without starting a browser. [HTTP Tests](/testing/http-tests)
- Test jobs and queues. [Job and Queue Tests](/testing/job-queue-tests)
- Test event publish and subscribe. [Event Tests](/testing/event-tests)
- Test CLI commands. [Command Tests](/testing/command-tests)
- Test against real backends in containers. [Integration Tests](/testing/integration-tests)

## Debugging

- Dump any value, readable and colorized. [godump](/godump)
- Inspect an outbound HTTP call. [HTTP Clients](/applications/http-clients)
- Run the rebuild-and-restart loop: `forj dev`. [forj dev](/developer-tools/forj-dev)

If a task you expected is missing here, that is a gap worth telling us about. The sidebar holds the full map, and every page ends with next steps.
