---
title: Starter Kits
description: How GoForj starter kits relate to generated components, frontend scaffolds, and App ownership.
---

# Starter Kits

Starter kits are optional generated scaffolds that help an App start with a working surface.

They are not separate frameworks. After generation, their files belong to the App.

For the visual overview, see the [Starter Kits showcase](/starter-kits).

## When Starter Kits Apply

Starter kit selection appears during `forj new` when the selected components support it.

Current important rule:

- Web UI enabled: starter kit selection can appear.
- Web UI disabled: starter kit selection is skipped.
- Demo App selected: the demo owns its generated frontend, so normal starter kit selection is cleared.

## Current Starter Kit

The current first-party starter kit is:

- [Vue Starter Kit](/frontend/vue-starter-kit)

It creates a `frontend/` project for Apps with Web UI enabled.

## Generated Ownership

Starter kit files are generated into the App and then become App-owned.

Use the generated code as a starting point. Do not treat starter kit files as immutable framework internals.

## Development Tasks

Starter kits can add development setup tasks.

For the Vue starter kit, generated dev setup can include:

```bash
cd frontend && npm install
```

and a frontend watcher under `forj dev`.

## Compatibility

Starter kits compose with selected App components. They should not require unrelated infrastructure just to run the first local path.

When a starter kit requires Web UI, the generator should make that dependency explicit through the wizard and render contract.

## Common Mistakes

::: warning Common mistakes
- Do not select a starter kit over an existing custom frontend unless replacement is intended.
- Do not treat starter kit code as framework-owned after generation.
- Do not assume Web API and Web UI are the same component.
- Do not add production-only infrastructure requirements to starter kit first-run docs.
:::

## Next Steps

- [Vue Starter Kit](/frontend/vue-starter-kit)
- [forj dev](/developer-tools/forj-dev)
- [Project Structure](/getting-started/project-structure)
