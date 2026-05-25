# GoForj Information Architecture

## Purpose

This file defines the recommended public documentation structure for GoForj.

It should guide navigation, page creation, cross-linking, and future docs expansion.

## IA Principle

Organize docs around two valid paths:

- building and operating generated GoForj applications
- using first-party GoForj libraries independently

The Libraries section is first-class. It should remain powerful for standalone package users while framework pages explain how those libraries project into generated Apps.

## Top-Level Sections

### Getting Started

Goal: get the reader to a running App with a basic mental model.

Pages:

- What Is GoForj?
- Installation
- Quickstart
- Project Structure
- Configuration
- Local Development
- First Route
- First Command

### Core Concepts

Goal: explain the framework model that every other page depends on.

Pages:

- App
- Runtime Lifecycle
- Dependency Injection
- Providers
- Drivers And Adapters
- Configuration Flow
- Generated Extension Points
- Local-First Development

### Libraries

Goal: document first-party GoForj primitives as standalone Go packages.

Pages:

- Libraries Overview
- Web
- Queue
- Events
- Scheduler
- Cache
- Storage
- Metrics
- Env
- Crypt
- Wire
- Collection
- Strings
- ExecX
- GoDump

Library pages may be generated from READMEs and should remain useful outside the framework. Framework workflow pages should link into them for deeper primitive APIs, driver matrices, and standalone examples.

### Building Applications

Goal: teach normal request and command-driven application work.

Pages:

- HTTP Services
- Routes
- Controllers
- Middleware
- Requests And Validation
- Responses And Errors
- Application Services
- Repositories
- Commands

### Data And Persistence

Goal: teach durable data, derived data, and file/blob storage boundaries.

Pages:

- Database Strategy
- Migrations
- Models And Domain Types
- Repositories
- Transactions
- Seeding And Fixtures
- Cache Patterns
- Storage Patterns
- Driver Selection

### Async And Workflows

Goal: teach work that runs outside the immediate request path.

Pages:

- Events Versus Queues
- Queues
- Jobs
- Workers
- Events
- Event Subscribers
- Scheduler
- Scheduled Work
- Retries And Idempotency

### Testing

Goal: make testing part of the normal GoForj workflow.

Pages:

- Testing Overview
- Unit Tests
- HTTP Tests
- Command Tests
- Job And Queue Tests
- Event Tests
- Cache And Storage Tests
- Integration Tests
- Rendered App Smoke Tests

### Operations

Goal: teach how GoForj apps run in production.

Pages:

- Deployment Basics
- Runtime Processes
- HTTP Server
- Queue Workers
- Scheduler Processes
- Configuration In Production
- Health And Readiness
- Logging
- Metrics
- Failure Handling
- Production Checklist

### Lighthouse And Observability

Goal: teach local and operator-facing runtime visibility.

Pages:

- Observability Overview
- Metrics
- Inspects
- Lighthouse
- Route Visibility
- Queue Visibility
- Scheduler Visibility
- Storage And Cache Visibility
- Debugging Runtime Behavior

### Reference

Goal: provide framework-level lookup material after the reader understands the model.

Pages:

- CLI Reference
- Environment Variables
- Configuration Reference
- Generated Files Reference
- Error Reference

Driver matrices and package API reference usually belong in Libraries unless the material is specifically about generated App configuration.

### Internals And Maintainers

Goal: support contributors and advanced users without polluting beginner paths.

Pages:

- Repo Boundaries
- Template Architecture
- Generator Architecture
- Render And Smoke Workflow
- Sibling Repository Workflow
- Release Workflow

## Conceptual Dependency Order

When ordering nav or tutorials, prefer:

1. What GoForj is
2. Project structure
3. Configuration
4. Runtime lifecycle
5. Dependency injection
6. HTTP and commands
7. Services and repositories
8. Cache and storage
9. Events, queues, jobs, and scheduler
10. Testing
11. Observability
12. Operations
13. Libraries
14. Reference
15. Internals

## Cross-Linking Rules

Link to the next likely task.

Do not turn every page into a link directory.

Good cross-links:

- HTTP Services -> Controllers -> HTTP Tests -> Route Visibility -> Libraries: Web
- Queues -> Jobs -> Workers -> Job Tests -> Worker Operations -> Libraries: Queue
- Events -> Events Versus Queues -> Event Tests -> Libraries: Events
- Scheduler -> Scheduled Work -> Scheduler Operations -> Lighthouse Scheduler Views -> Libraries: Scheduler
- Storage Patterns -> Driver Selection -> Storage Tests -> Libraries: Storage
- Cache Patterns -> Driver Selection -> Cache Tests -> Libraries: Cache
- Metrics -> Operations -> Lighthouse -> Libraries: Metrics

## Reference Placement

Put large tables and exhaustive lists in Libraries or Reference unless they are necessary for the task.

Examples:

- primitive driver matrices usually belong in Libraries or decision pages
- all env vars belong in Reference
- full CLI command lists belong in Reference
- API indexes belong in Libraries

Workflow pages should link to library and reference pages, not duplicate them.

## Navigation Smell Tests

The IA is drifting if:

- users must read library pages before building a generated App route
- library pages stop being useful to standalone Go package users
- driver selection appears before generated App structure
- operations pages are hidden under package reference
- testing is only documented globally and not from feature pages
- Lighthouse appears before metrics and inspects are explained
- internals appear in beginner navigation
- framework pages duplicate entire library READMEs instead of linking to them
