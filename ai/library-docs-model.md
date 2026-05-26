# GoForj Library Docs Model

## Purpose

This file defines how GoForj should treat first-party library documentation.

The Libraries section is a first-class part of the docs site. It is not a dumping ground and not merely appendix reference.

## Core Distinction

GoForj has two valid documentation projections:

1. Framework projection
   - how a primitive is used inside a generated GoForj App
   - emphasizes generated structure, providers, lifecycle, configuration, and operations

2. Library projection
   - how a first-party primitive works as an independent Go package
   - emphasizes direct installation, package API, constructors, drivers, examples, tests, and standalone use

Both projections are valid. They answer different questions.

## Libraries Are Products

First-party libraries should be documented as powerful standalone tools.

Examples:

- `cache`
- `storage`
- `queue`
- `events`
- `scheduler`
- `web`
- `metrics`
- `env`
- `crypt`
- `collection`
- `str`
- `execx`
- `godump`
- `wire`

The docs should respect that a user may adopt one library without adopting the full GoForj framework.

## Framework Pages versus Library Pages

### Framework Pages

Framework pages should answer:

- Where does this live in a generated App?
- Which generated extension point should I use?
- How is it configured by the framework?
- How is it wired through providers and Wire?
- What local-first default does the App use?
- What runtime lifecycle is involved?
- How do metrics, inspects, logs, and Lighthouse expose it?
- How do I test it inside an App?

Framework examples should avoid direct driver imports in business code.

### Library Pages

Library pages should answer:

- What does this package do?
- How do I install it independently?
- What are the core interfaces and constructors?
- Which drivers or adapters exist?
- How do I use it outside GoForj?
- How do I test it?
- What are the backend tradeoffs?
- What is the full API surface?

Library examples may show direct constructors and driver packages because that is the point of the library projection.

## Cross-Linking Model

Framework pages should link to library pages for deeper primitive detail.

Library pages should link back to framework pages for generated App integration.

Examples:

- `applications/http-services.md` links to `libraries/web.md`.
- `async/queues.md` links to `libraries/queue.md`.
- `async/events.md` links to `libraries/events.md`.
- `async/scheduler.md` links to `libraries/scheduler.md`.
- `data/cache-patterns.md` links to `libraries/cache.md`.
- `data/storage-patterns.md` links to `libraries/storage.md`.
- `operations/metrics.md` links to `libraries/metrics.md`.

The link text should make the projection clear:

- "For standalone package APIs, see..."
- "For generated App integration, see..."

## Library Page Structure

Readme-slurped library pages can remain strong standalone pages, but should converge toward this shape over time:

1. What the library is
2. Install
3. Quick start
4. Core concepts
5. Drivers, adapters, or backends
6. Common usage
7. Testing
8. Production notes
9. API reference
10. GoForj framework integration link

Do not force every library page into application-guide structure.

## Framework Integration Sections

Each major library page should eventually include a short "Using With GoForj" section.

That section should be concise and should not duplicate framework docs.

It should say:

- generated Apps wire this through framework providers
- app code should usually depend on injected app-facing dependencies
- driver selection belongs in configuration and provider wiring
- link to the relevant framework workflow page

## Library Nav

Libraries should be a top-level navigation section.

Recommended groups:

- Application primitives: `web`, `queue`, `events`, `scheduler`, `cache`, `storage`, `metrics`
- Foundation utilities: `env`, `crypt`, `wire`
- Go utility libraries: `collection`, `str`, `execx`, `godump`

The current slurped README pages should remain available under Libraries and should be linked from framework pages as needed.

## Search and Discovery

Search results should preserve projection context.

A user searching "queue" may want:

- framework queue guide
- queue worker operations
- queue driver decision page
- standalone `queue` library page

Titles and descriptions should distinguish these.

Examples:

- "Queues In GoForj Apps"
- "Queue Workers In Production"
- "Choosing A Queue Driver"
- "Queue Library Reference"

## Duplication Rules

Some duplication is useful:

- short definitions
- canonical resource names
- links to next steps

Avoid duplicating:

- full driver matrices
- full API indexes
- long installation instructions
- complete backend-specific setup

Keep exhaustive primitive detail in library pages. Keep App integration in framework pages.

## Review Checklist

When reviewing a library page:

- It works for a standalone Go user.
- It does not require generated GoForj App knowledge.
- It shows direct package usage clearly.
- It documents drivers or adapters honestly.
- It includes testing guidance.
- It links to generated App integration where relevant.
- It does not import framework-only terminology unless needed.

When reviewing a framework page:

- It explains the generated App projection.
- It links to the library page for standalone details.
- It avoids duplicating the library README.
- It keeps driver imports near configuration or provider examples.
- It preserves the golden path for App users.
