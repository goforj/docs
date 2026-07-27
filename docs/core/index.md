---
title: Core Concepts
description: The framework model behind GoForj Apps, runtimes, providers, drivers, and generated components.
---

# Core Concepts

Core Concepts explains the model shared by every generated GoForj App. Start with the question you need to answer rather than reading the section in order.

## Choose a Concept

| Question | Read |
| --- | --- |
| Where does an App begin and how do named Apps differ? | [Apps](/core/apps) |
| What starts, runs, and shuts down? | [Runtime Lifecycle](/core/runtime-lifecycle) and [Runtime Topology](/core/runtime-topology) |
| How does a constructor become part of the App? | [Dependency Injection](/core/dependency-injection), then [Provider Patterns](/core/provider-patterns) for conditional or shared construction |
| Why did Wire fail? | [Reading Wire Errors](/core/reading-wire-errors) |
| How do I add or remove an application resource? | [Make Commands](/core/make-commands) |
| Which files are regenerated, render-once, or App-owned? | [Code Generation](/core/code-generation) |
| Where does a specific service, controller, job, or command get wired? | [Wiring Recipes](/core/wiring-recipes) |
| How do names map to packages and generated resources? | [Naming Conventions](/core/naming-conventions) and [Named Resources](/core/named-resources) |
| How does runtime configuration select compiled integrations? | [Drivers and Adapters](/core/drivers-and-adapters) |
| How can the same App begin locally and move to shared infrastructure? | [Local-First Development](/core/local-first-development) |

## Related Sections

- [Getting Started](/getting-started/) is the practical entry point.
- [Operations](/operations/) applies the runtime model in production.
