---
title: Versions
description: Public beta status, release versions, and upgrade guidance for GoForj.
---

# Versions

GoForj is in public beta. Install the CLI, build an application, or use the standalone libraries. No invitation is required.

## Public Beta

The framework is available to use while we refine it before `v1.0`. Public beta is an invitation to build with GoForj and share feedback; it is not a promise of stable framework APIs or automatic upgrades.

Before `v1.0`, commands, configuration, generated files, and runtime behavior may change between releases. Read the release notes for the version you are adopting and test upgrades on a branch before applying them to a deployed application. Review render diffs carefully: rendering framework-managed files is not a general merge of application customizations.

For production use, evaluate the drivers, durability, failure behavior, and upgrade requirements your application depends on. Standalone libraries have their own versions and release notes; the framework's beta label does not replace those contracts.

### Build with Us

We are looking for a small group of early adopters to work closely with the maintainer and help shape GoForj. [Tell us what you are building](mailto:chris@milestech.co?subject=GoForj%20early%20adopter). You can also [report a bug or share feedback on GitHub](https://github.com/goforj/goforj/issues).

Start independently with the [Quickstart](/getting-started/quickstart), or explore the [standalone libraries](/libraries/).

## Current Version

`%%LATEST_RELEASE%%` is the latest tagged framework release. The root documentation follows `main` and may describe work that has not reached a tagged release yet.

Use these docs when you are building against the current GoForj framework source. If you use the latest tag instead, see [%%LATEST_RELEASE%%](https://github.com/goforj/goforj/releases/tag/%%LATEST_RELEASE%%) for the released behavior.

Installations using `@latest` select the latest tagged release, not `main`. The [Changelog](/versions/changelog#%%LATEST_RELEASE_ANCHOR%%) summarizes the latest release; its Unreleased section describes development work. The public beta badge describes framework maturity, while this documentation follows the active development line.

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
- make command expansion and App ergonomics
- multi-app project architecture

The library ecosystem is part of the version story. GoForj is not only a renderer around one repository. It is backed by first-party packages for HTTP, queues, events, cache, storage, mail, scheduler, metrics, environment loading, cryptography, command execution, console presentation, strings, collections, debugging output, dependency wiring, and local agent tooling. Many of those packages have their own tagged release lines, driver module tags, examples, integration suites, and documentation generation workflows.

The [Changelog](/versions/changelog) starts with current framework releases, followed by the first-party library history and earlier framework milestones.

See [Changelog](/versions/changelog) for the detailed ledger.

## Versioning Model

Framework versions are cut when user-facing framework behavior changes.

This includes:

- CLI commands
- App structure
- app composition and multi-app behavior
- runtime lifecycle
- provider and dependency injection behavior
- driver selection and named resources
- queue, event, scheduler, storage, cache, metrics, inspect, and Lighthouse integration
- starter kit rendering and frontend ownership
- deployment and operations guidance

Library docs remain first-class documentation for standalone first-party Go packages. They can be referenced from framework guides, but they should not be duplicated into framework pages unless the behavior is specific to a GoForj App.

## Future Snapshots

The root documentation site represents the current active documentation line. When a future stable line needs different documentation, the older line should be frozen under a versioned path before the root moves forward.

A frozen snapshot should preserve:

- framework guide pages
- reference pages
- operational guidance
- examples that depend on GoForj App behavior

The active root docs can then move to the next version.

## Compatibility Notes

Pages should call out version-specific behavior only when it changes how a user builds, configures, runs, tests, or deploys an App.

Do not add version noise for wording changes, formatting changes, or internal documentation maintenance.
