# What is GoForj?

GoForj is a collection of **high-trust Go libraries and developer tools**, built with a focus on explicit behavior, strong ergonomics, and production readiness.

It is **not a framework**.  
There is no required entry point, no global runtime, and no forced architecture.

Each GoForj library is independently useful. Together, they reflect a consistent philosophy about how Go tooling should feel: readable, auditable, predictable, and boring in the best possible way.

## Why GoForj Exists

Go excels at building reliable systems, but many teams end up re-solving the same problems:

- Command execution and process control
- Fluent but explicit data manipulation
- Environment handling and configuration
- Diagnostics, debugging, and developer ergonomics
- Repetitive glue code that obscures intent

GoForj exists to address these gaps with **small, focused tools** that:

- Reduce noise without hiding behavior
- Make common tasks easier without adding magic
- Respect Go’s strengths instead of working around them

The goal is not to abstract Go away - it is to make Go more pleasant to work with at scale.

## Design Principles

These principles apply across the entire GoForj ecosystem and are reflected directly in the APIs, examples, and documentation.

### High trust by default
- Explicit inputs and outputs
- Predictable error models
- No hidden globals or runtime side effects

### Explicit over implicit
- Configuration is visible and inspectable
- Defaults are conservative and overrideable
- Escape hatches are always available

### Production-first
- Examples mirror real usage, not toy snippets
- APIs are designed for long-lived codebases
- Cross-platform behavior is documented honestly

### Performance is intentional
- Allocation behavior is considered and measured
- Benchmarks are included where relevant
- Tradeoffs are documented, not hidden

### Developer experience matters
- Fluent APIs where they reduce noise
- Copy-paste-ready examples that actually run
- Documentation kept in sync with real code

## What GoForj Is Today

Today, GoForj is a growing set of **standalone libraries and tools**, including:

- Command execution and process orchestration
- Fluent data and string helpers
- HTTP and filesystem utilities
- Environment handling and diagnostics helpers

Each project is intentionally scoped, independently versioned, and usable on its own.

There is no required adoption path - use one library or many.

## What GoForj Is Not

- A monolithic framework
- A runtime or DSL
- A replacement for the Go standard library
- A collection of “magic” abstractions
- A promise of future features

If a tool or abstraction does not meet the quality bar, it does not ship.

## What’s Coming Later

GoForj is starting with libraries because **trust is earned at the lowest level**.

A guided project creation experience (including `forj new`) is in active development and will be introduced only once it meets the same standards of clarity, explicitness, and reliability as the existing tools.

It will be **additive**, not required.

Until then, GoForj is about building confidence one tool at a time.

## Who GoForj Is For

- Go developers building CLIs, services, workers, and internal tools
- Teams that value explicit behavior and long-term maintainability
- Engineers who want better ergonomics without giving up control

If you prefer readable Go over clever Go, GoForj is built for you.

## Start Exploring

Browse the available libraries, read the design notes, and run the examples.

Use only what you need - nothing more is required.
