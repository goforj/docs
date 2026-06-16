---
title: Versions
description: Version policy and historical milestone model for GoForj.
---

# Versions

These docs currently describe GoForj `v0.18`.

GoForj is still pre-`v1.0`, but the project has a real development history. The version line is used to mark meaningful framework milestones: generated App structure, CLI behavior, runtime lifecycle, starter kits, observability, local development, and first-party library integration.

## Current Version

`v0.18` is the current documentation line.

Use these docs when you are building against the current GoForj framework, CLI, generated App structure, multi-app architecture, and first-party library integration model.

## Historical Milestones

Earlier pre-`v1.0` versions include retrospective milestone tags. These tags are not padded release marketing. They mark commits where substantial framework layers became coherent enough to describe as a versioned step in the project history.

That matters because GoForj has evolved through several real layers:

- renderer and generator foundation
- standalone first-party libraries
- project creation and command UX
- database, migrations, repositories, and model generation
- generated logging and local development runtime
- dev console, Lighthouse, and operational visibility
- queues, events, cache, storage, lifecycle hooks, API index, and OpenAPI
- generated auth, mail, web, and frontend starter kits
- metrics, inspects, runtime attribution, and performance hardening
- make command expansion and generated app ergonomics
- multi-app project architecture

The library ecosystem is part of the version story. GoForj is not only a renderer around one repository. It is backed by first-party packages for HTTP, queues, events, cache, storage, mail, scheduler, metrics, environment loading, cryptography, execution helpers, strings, collections, debugging output, and dependency wiring. Many of those packages have their own tagged release lines, driver module tags, examples, integration suites, and documentation generation workflows.

The [Changelog](/versions/changelog) starts with a dedicated first-party library history before the framework milestone ledger.

See [Changelog](/versions/changelog) for the detailed ledger.

## Versioning Model

Framework versions are cut when user-facing framework behavior changes.

This includes:

- CLI commands
- generated App structure
- app composition and multi-app behavior
- runtime lifecycle
- provider and dependency injection behavior
- driver selection and named resources
- queue, event, scheduler, storage, cache, metrics, inspect, and Lighthouse integration
- starter kit rendering and frontend ownership
- deployment and operations guidance

Library docs remain first-class documentation for standalone first-party Go packages. They can be referenced from framework guides, but they should not be duplicated into framework pages unless the behavior is specific to a generated GoForj App.

## Future Snapshots

The root documentation site represents the current active documentation line. When a future stable line needs different documentation, the older line should be frozen under a versioned path before the root moves forward.

A frozen snapshot should preserve:

- framework guide pages
- reference pages
- operational guidance
- examples that depend on generated App behavior

The active root docs can then move to the next version.

## Compatibility Notes

Pages should call out version-specific behavior only when it changes how a user builds, configures, runs, tests, or deploys an App.

Do not add version noise for wording changes, formatting changes, or internal documentation maintenance.
