# Documentation Versioning

This file defines how GoForj documentation versions should work.

## Current State

The public docs describe the current `v0.20` framework line.

The root site is the active documentation line. It should be treated as the current version until the project needs multiple simultaneously published documentation lines.

The version label must be checked against the latest framework release before publication. Internal plans, the VitePress navigation, `/versions/`, and the changelog must not carry different current-version values.

## Versioning Principle

Version docs around user-visible behavior, not internal implementation churn.

Versioned behavior includes:

- CLI command behavior
- generated App structure
- generated extension points
- runtime lifecycle
- provider lifecycle
- dependency injection flow
- configuration keys
- driver names and supported backends
- named resource access
- queue, event, scheduler, storage, cache, metrics, inspect, and Lighthouse behavior
- deployment and operational requirements

Do not version docs because of:

- prose edits
- page ordering changes
- visual design changes
- internal AI documentation updates
- generated README refreshes that do not change framework integration behavior

## Root and Snapshot Model

Use this model:

- `/` is the current active documentation line.
- `/versions/` explains the public version policy.
- `/versions/<version>/` is reserved for frozen historical snapshots.

Do not create a frozen snapshot until there is a second active documentation line. Premature snapshots create duplicate content and stale links without helping users.

## What Gets Snapshotted

Snapshot framework behavior pages:

- Getting Started
- Core Concepts
- Applications
- Data and Persistence
- Async and Workflows
- Testing
- Operations
- Developer Tools
- Framework Reference

Treat Libraries separately.

Library pages are first-class package documentation and may be refreshed from package READMEs. Framework snapshots should link to the library version that matches the framework release when that distinction becomes necessary.

## Link Rules

Active root docs should link to active root docs.

Frozen version docs should link within the same frozen version when the target describes framework behavior.

Frozen version docs may link to live Libraries when the library API is version-compatible and the page clearly describes standalone package behavior.

Avoid absolute root links inside frozen snapshots unless intentionally linking to current docs.

## Release Checklist

Before freezing a documentation version:

- [ ] Set the current root docs version label.
- [ ] Run the VitePress build.
- [ ] Copy versioned framework docs into `/versions/<version>/`.
- [ ] Rewrite internal framework links inside the snapshot to stay inside that version.
- [ ] Verify the snapshot sidebar and nav.
- [ ] Keep Library links intentional.
- [ ] Add migration notes for behavior that changed in the next line.
- [ ] Update `/versions/` to list the frozen version.
- [ ] Update the nav version selector.

## Governance

Every page that mentions version-specific behavior should answer one question:

Would a user on another version build, configure, run, test, or deploy the App differently?

If not, keep the page version-neutral.
