---
title: Versions
description: Version policy for the GoForj documentation.
---

# Versions

These docs currently describe GoForj `v0.9`.

The root documentation site represents the current active documentation line. When a future stable line needs different documentation, the older line should be frozen under a versioned path before the root moves forward.

## Current Version

`v0.9` is the current documentation line.

Use these docs when you are building against the current GoForj framework, CLI, generated App structure, and first-party library integration model.

## Versioning Model

Framework docs are versioned when framework behavior changes.

This includes:

- CLI commands
- generated App structure
- runtime lifecycle
- provider and dependency injection behavior
- driver selection and named resources
- queue, event, scheduler, storage, cache, metrics, inspect, and Lighthouse integration
- deployment and operations guidance

Library docs remain first-class documentation for standalone first-party Go packages. They can be referenced from framework guides, but they should not be duplicated into framework pages unless the behavior is specific to a generated GoForj App.

## Future Snapshots

When a new documentation line is introduced, the previous line should be copied into a frozen versioned path such as `/versions/v0.9/`.

The frozen snapshot should preserve:

- framework guide pages
- reference pages
- operational guidance
- examples that depend on generated App behavior

The active root docs can then move to the next version.

## Compatibility Notes

Pages should call out version-specific behavior only when it changes how a user builds, configures, runs, tests, or deploys an App.

Do not add version noise for wording changes, formatting changes, or internal documentation maintenance.

