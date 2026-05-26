# GoForj Documentation Tone

## Purpose

This file defines the official voice for GoForj documentation.

The docs should sound like a senior Go engineer explaining a production framework clearly.

## Voice

GoForj documentation should be:

- calm
- concise
- direct
- technically precise
- practical
- production-aware
- confident without exaggeration

The docs should not sound like marketing copy, a launch announcement, or an academic paper.

## Sentence Style

Prefer short, declarative sentences.

Good:

> A job is a named unit of queued work. Register the handler before the worker starts.

Avoid:

> With GoForj's powerful and elegant job system, you can effortlessly unlock asynchronous workflows.

Use active voice when possible.

Good:

> Register routes in the generated route surface.

Avoid:

> Routes should be able to be registered by users in various locations.

## Pacing

Docs should move from orientation to action:

1. State what the feature is.
2. Explain when to use it.
3. Show the golden path.
4. Explain operational behavior.
5. Link to reference or advanced customization.

Do not start beginner pages with internals. Do not bury the normal path under every possible option.

## Confidence Level

Be opinionated where GoForj has a preferred path.

Good:

> Put scheduled work in `internal/scheduler/scheduler_registry.go` and call domain-owned methods from the registry.

Avoid:

> You may want to consider putting scheduled work somewhere in your application, depending on your preferences.

Be honest where behavior is a tradeoff.

Good:

> SQL-backed queues are convenient and durable, but high-throughput workloads usually need broker-backed drivers.

Avoid:

> SQL queues are perfect for any workload.

## Teaching Philosophy

Teach through real application flow.

Prefer:

- generated app structure
- controllers calling services
- services dispatching jobs or publishing events
- jobs using injected services
- schedules calling domain-owned methods
- storage/cache through named dependencies
- tests using fakes or local drivers

Avoid:

- isolated snippets with no application context
- toy names that do not map to real work
- examples that depend on hidden globals
- examples that skip errors in production paths
- examples that show multiple architectures at once

## Formatting Tone

Formatting should support scanning.

Use:

- short sections
- compact lists
- code blocks that compile
- small tables only when they clarify decisions
- callouts sparingly

Avoid:

- long uninterrupted essays
- decorative formatting
- excessive admonitions
- emojis
- exclamation points
- repeated slogans

## Title Tone

Use calm sentence-style titles in public docs.

Prefer:

- `Requests and Validation`
- `Drivers and Adapters`
- `Events versus Queues`

Avoid title-case connector words such as `And`, `Or`, and `Versus` unless they are part of a proper noun.

This keeps the docs from feeling generated or over-formal.

## Visual Tone

Visuals should clarify system relationships.

Use diagrams, callouts, cards, and custom VitePress components when they make a concept easier to understand. Do not add imagery only to make a page feel more designed.

When possible, prefer maintainable, code-native visuals over static screenshots. This keeps docs easier to update as the framework changes.

## Example Tone

Examples should feel like code a team might keep.

Use names such as:

- `users.created`
- `emails:send`
- `reports:generate`
- `billing:reconcile`
- `uploads`
- `assets`
- `cleanup:stale-sessions`

Avoid nonsense names that make the framework feel unserious unless the page is explicitly a minimal smoke test.

## Words To Avoid

Avoid:

- revolutionary
- magical
- effortless
- blazing fast
- enterprise-grade
- cutting-edge
- seamless unless the integration is genuinely invisible
- simply when the step may not be simple
- just when the step hides important behavior

Use precise alternatives:

- explicit
- conventional
- local
- durable
- in-process
- distributed
- generated
- configured
- wired
- observed

## Comparisons

Comparisons to other ecosystems should be rare and brief.

It is acceptable to say GoForj offers a cohesive framework experience for Go. Avoid writing public docs as if every concept must be justified by another framework.

Do not copy wording, naming conventions, or page structure from other frameworks unless the concept is already idiomatic in GoForj.
