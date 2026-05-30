# GoForj Docs Style Guide

## Purpose

This file defines the structure and formatting rules for GoForj documentation.

Use it when creating or reviewing public docs, internal guides, examples, reference pages, and AI-generated drafts.

## Page Types

### Feature Page

Use a feature page for a major framework capability such as HTTP, queues, events, scheduler, cache, storage, metrics, inspects, or Lighthouse.

Structure:

1. `# Feature Title`
2. short definition
3. when to use it
4. where it lives in a generated App
5. golden-path example
6. configuration
7. testing
8. operations and lifecycle
9. advanced usage
10. common mistakes
11. next steps

Feature pages should teach the App-level workflow before package reference or driver details.

### Concept Page

Use a concept page to explain a mental model.

Structure:

1. `# Title`
2. short definition
3. why it exists
4. how it fits into a GoForj app
5. golden path
6. operational notes
7. common mistakes
8. next steps

Concept pages should be short enough to read in one sitting.

### Task Page

Use a task page to help the reader complete one workflow.

Structure:

1. `# Task Title`
2. outcome statement
3. prerequisites
4. steps
5. runnable example
6. verification command
7. troubleshooting
8. next steps

Task pages should avoid side quests. Link out for optional variants.

### Reference Page

Use a reference page to describe APIs, commands, env vars, drivers, or configuration.

Structure:

1. `# Reference Title`
2. short scope statement
3. quick usage
4. reference table or API groups
5. examples
6. edge cases
7. related pages

Reference pages may be dense, but they should still include a minimal working example.

### Library Page

Use a library page for a first-party GoForj package that can be used independently of the full framework.

Structure:

1. `# Library Name`
2. what the library does
3. installation
4. quick start
5. core concepts
6. drivers, adapters, or backends when relevant
7. standalone usage examples
8. testing
9. production notes
10. API reference
11. using with GoForj

Library pages may show direct package constructors and driver imports. Framework workflow pages should usually not do this until provider or configuration sections.

### Operations Page

Use an operations page for runtime behavior that matters in production.

Structure:

1. `# Operations Topic`
2. what process or runtime boundary is involved
3. command or deployment shape
4. startup behavior
5. shutdown behavior
6. health, readiness, logs, metrics, and inspects
7. failure modes
8. production checklist
9. troubleshooting

Operations pages should be explicit and practical. They should not read like infrastructure marketing.

### Decision Page

Use a decision page when users must choose between drivers, primitives, or patterns.

Structure:

1. `# Decision Title`
2. default recommendation
3. comparison table
4. when to choose each option
5. production tradeoffs
6. migration notes

Always state the default path first.

## Heading Hierarchy

Use one `#` heading per page.

Use `##` for major sections.

Use `###` only when a section has multiple meaningful subtopics.

Avoid `####` unless the page is API reference generated from code.

Headings should be short and concrete:

- Good: `## Register a Job`
- Good: `## Worker Lifecycle`
- Avoid: `## How You Can Start Thinking About Running Background Things`

Use sentence-style titles for public docs navigation, page titles, sidebar labels, and headings.

Lowercase connector words unless they are proper nouns or fixed technical names:

- Good: `Requests and Validation`
- Good: `Drivers and Adapters`
- Good: `Events versus Queues`
- Good: `Health and Readiness`
- Avoid: `Requests And Validation`
- Avoid: `Standalone Versus Distributed`

Keep acronyms and product names in their canonical form: `HTTP`, `OpenAPI`, `Lighthouse`, `GoForj`, `Wire`.

## Paragraph Size

Keep paragraphs short.

Default to one to three sentences. Split longer explanations into a list or another section.

## Code Example Rules

Examples must:

- compile when presented as complete files
- use idiomatic Go
- include `context.Context` where execution may block or cross process boundaries
- handle errors in production-shaped examples
- avoid hidden globals
- match generated app structure when teaching GoForj apps
- avoid low-level `net/http` unless the page is about adapters, primitives, or standard library interop
- use stable, realistic names

Examples may omit error handling only in tiny API reference fragments where the omission is obvious and not the behavior being taught.

Prefer complete snippets for task pages:

```go
package users

type Service struct {
	repo Repository
}
```

Prefer focused fragments for reference pages:

```go
cache.Remember(c, key, ttl, load)
```

## Command Examples

Use fenced `bash` blocks.

Show commands from the project root unless stated otherwise.

Prefer:

```bash
forj route:list
```

For rendered App binaries, prefer production-shaped commands:

```bash
./bin/app run
./bin/app api
./bin/app worker
./bin/app scheduler
```

Use `forj app`, `forj api`, `forj worker`, and `forj scheduler` when documenting development commands inside a generated App. Use `forj run <command>` only when the page is specifically explaining the explicit App-command path or collision escape hatch.

When an operations page lists common runtime processes, show both forms side by side:

| Process | Built binary | Development alias |
| --- | --- | --- |
| Combined runtime | `./bin/app run` | `forj app` |
| HTTP | `./bin/app api` | `forj api` |
| Queue workers | `./bin/app worker` | `forj worker` |
| Scheduler | `./bin/app scheduler` | `forj scheduler` |

When documenting `forj build --auto-run`, describe it as a build-time default launch setting: launching `./bin/app` with no command starts the App runtime, while explicit commands still take precedence.

When showing Go commands in internal maintainer docs, use the GoForj cache environment:

```bash
GOCACHE=/tmp/gocache GOMODCACHE=/tmp/gomodcache go test ./...
```

## Callout Rules

Use callouts sparingly.

Use a note for helpful context that is not required to continue.

Use a warning for behavior that can cause data loss, security issues, broken production behavior, or misleading operational data.

Use a tip only when it materially shortens the workflow.

Do not use callouts to create visual variety.

Use VitePress native custom containers for callouts:

```md
::: info Dev Loop
During `forj dev`, the generated build watcher normally runs `forj build` for you.
:::
```

The current docs theme styles `info` blocks as the standard calm callout. Prefer this for workflow context such as automatic build behavior. Keep the title short and useful.

For repeated `Common Mistakes` sections, keep the `## Common Mistakes` heading for outline/search stability. If extra contrast is needed, wrap the list in a native callout under the heading and test the pattern on one page before applying globally.

## Conceptual Layering

Every major page should follow this order:

1. application-level model
2. generated app extension point
3. primitive contract
4. driver or adapter implementation
5. low-level implementation detail

Do not start with driver constructors when the reader needs to understand how the App uses the primitive.

Library pages are the exception: when the page is explicitly about standalone package use, direct constructors and driver imports are appropriate.

## Standard Feature Flow

Major feature pages should generally flow in this order:

1. What it is.
2. When to use it.
3. Where it lives in a generated App.
4. The simplest correct local-first example.
5. How configuration selects behavior.
6. How dependency injection wires it.
7. How to test it.
8. How to run or observe it in production.
9. How to customize it.
10. Where to read reference details.

This order is the default because it matches how developers build confidence: concept, location, action, verification, then depth.

## Progressive Disclosure

Beginner pages should show:

- the generated file to edit
- the default command to run
- the normal local driver
- the normal test path

Advanced pages may show:

- custom providers
- direct driver construction
- adapter escape hatches
- distributed backends
- performance tuning
- internals

Never mix beginner and advanced paths in the same first example.

## Beginner versus Advanced Pacing

Beginner docs should answer:

- What do I edit?
- What command do I run?
- How do I know it worked?
- What is the next normal step?

Advanced docs should answer:

- Where is the boundary?
- What behavior changes?
- What tradeoffs exist?
- What tests should protect this?
- What operational signals should I watch?

## Implementation Details

Expose implementation details when they affect:

- lifecycle
- performance
- security
- configuration
- testing
- driver tradeoffs
- operator visibility
- extension points

Hide or defer implementation details when they are:

- template mechanics
- generated helper internals
- private package structure
- adapter-specific unless escaping the abstraction
- not required to complete the task

## Markdown Conventions

Use:

- sentence-case paragraphs
- sentence-style headings and navigation labels
- backticks for code identifiers, commands, file paths, env vars, and package names
- fenced code blocks with language identifiers
- simple tables for bounded comparisons
- relative links for docs pages

Avoid:

- raw HTML in Markdown unless VitePress requires it
- decorative punctuation
- repeated bold emphasis
- nested lists unless no alternative is clear
- screenshots as the only source of truth

Prefer maintainable illustrations built from Markdown, tables, ASCII diagrams, or CSS/Vue components before static screenshots. Screenshots are acceptable when they show a real visual surface that cannot be explained otherwise, but they should not be the only documentation of a workflow.

For marketing/showcase pages, use Markdown frontmatter to opt out of normal docs chrome when appropriate:

```md
---
sidebar: false
aside: false
noAutoTitle: true
---
```

Use custom Vue components for animated or stateful visuals. Do not depend on complex raw Markdown image stacks when Vue can make mount timing, animation state, and accessibility clearer.

Display headings on marketing pages should usually not end with periods. Body copy should use normal prose punctuation.

For VitePress site assets, cache-bust favicon and manifest links when changing icons. Chrome can retain stale favicon state for a production origin even when normal page assets refresh correctly.

## API Reference Structure

API reference should group by task, not alphabetically when possible.

Preferred groups:

- Construction
- Configuration
- Registration
- Execution
- Lifecycle
- Observability
- Testing
- Drivers

Each group should include:

- short description
- function/type table when helpful
- one minimal example
- warnings for sharp edges

## How Docs Should Flow

A normal workflow doc should feel like:

1. "Here is the concept."
2. "Here is where it lives in a GoForj app."
3. "Here is the default code."
4. "Here is how to run it."
5. "Here is how to test or inspect it."
6. "Here is when to reach for advanced configuration."

If a page cannot be summarized this way, it is probably too broad.

## Cross-Linking

Cross-link from framework workflow docs to Libraries for standalone primitive detail.

Do not force users to infer app guidance from README-style library pages.

Examples:

- HTTP services page links to the `web` library page.
- Queues page links to the `queue` library page and driver matrix.
- Storage patterns page links to the `storage` library page and driver selection.
- Metrics page links to observability and Lighthouse pages.

## Review Checklist

Before publishing a page, verify:

- The page teaches one main thing.
- The first example is the golden path.
- Terminology matches `terminology.md`.
- Examples match generated app structure.
- Low-level APIs are not shown too early.
- Driver tradeoffs are honest.
- There is a clear verification step.
- The page links to the next likely task.
