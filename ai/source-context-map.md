# GoForj Source Context Map

## Purpose

This file maps GoForj source-context documents to documentation work.

Use it before writing or revising public docs so source context is loaded deliberately.

## Primary Context Sources

### General Context

Read:

- `/workspace/code/goforj/docs/context/index.md`
- `/workspace/code/goforj/docs/context/working-in-goforj-and-related-repos.md`

Use for:

- choosing which context to load
- understanding repo ownership
- avoiding broad context loading

### Generated App Architecture

Read:

- `/workspace/code/goforj/docs/context/runtime-architecture.md`
- `/workspace/code/goforj/docs/context/generated-app-extension-points.md`

Use for:

- project structure
- lifecycle docs
- extension points
- scheduler registry docs
- generated App ownership

### Runtime and Operations

Read:

- `/workspace/code/goforj/docs/context/runtime-architecture.md`
- `/workspace/code/goforj/docs/context/observability.md`
- `/workspace/code/goforj/docs/designs/completed/app-run-single-process-design.md`
- `/workspace/code/goforj/docs/designs/cli-lazy-infrastructure-initialization-design.md`

Use for:

- runtime topology
- infrastructure startup and readiness behavior
- operations docs
- metrics and logging behavior
- standalone versus distributed behavior

### Rendering and Validation

Read:

- `/workspace/code/goforj/docs/context/rendering-and-smoke-workflow.md`
- `/workspace/code/goforj/docs/context/practical-workflows.md`
- `/workspace/code/goforj/internal/scenarios`
- `/workspace/code/goforj/internal/scenarios/specs`

Use for:

- contributor docs
- generated app smoke testing
- template change validation
- `forj render` and `forj generate` behavior
- executable scenario docs
- generated scenario markdown

### Runnable Scenarios

Read:

- `/workspace/code/goforj-docs/ai/runnable-scenarios.md`
- `/workspace/code/goforj/internal/scenarios/scenarios.go`
- `/workspace/code/goforj/internal/scenarios/specs/*.yaml`
- `/workspace/code/goforj/internal/forj/scenario_cmd.go`

Use for:

- `docs/scenarios/*.md`
- runnable examples
- scenario diagrams
- scenario command shapes
- automated docs validation

Generated scenario markdown is derived from specs. Change specs first, then regenerate docs.

### Repo Boundaries

Read:

- `/workspace/code/goforj/docs/context/repo-boundaries-and-ownership.md`
- `/workspace/code/goforj/docs/context/web-boundary.md`
- `/workspace/code/goforj/docs/context/releasing-sibling-repos.md`

Use for:

- library versus framework projection
- sibling repo docs
- release and dependency guidance

### Observability and Lighthouse

Read:

- `/workspace/code/goforj/docs/context/observability.md`
- `/workspace/code/goforj/docs/context/lighthouse-inspects.md`
- `/workspace/code/goforj/docs/designs/metrics-design.md`
- `/workspace/code/goforj/docs/designs/lighthouse-execution-inspection-design.md`

Use for:

- metrics
- inspects
- Lighthouse
- logs
- dashboard and operator visibility

### Auth

Read:

- `/workspace/code/goforj/docs/context/auth.md`
- `/workspace/code/goforj/docs/designs/completed/generated-auth.md`
- `/workspace/code/goforj/templates/internal/auth/README.md.tmpl`

Use for:

- auth docs
- security model
- sessions and cookies
- OAuth layering
- auth debug/inspect behavior

### Generated Component READMEs

Read relevant files under:

- `/workspace/code/goforj/templates/internal/*/README.md.tmpl`
- `/workspace/code/goforj/templates/internal/database/README.md`
- `/workspace/code/goforj/templates/internal/modelgen/README.md`

Use for:

- generated package docs
- env var reference
- codegen accessors
- named resources
- component-specific behavior

### Frontend and Starter Kits

Read:

- `/workspace/code/goforj/docs/designs/completed/starter-kits-design.md`
- `/workspace/code/goforj/templates/demo/frontend/README.md`

Use for:

- starter kit docs
- frontend app shell docs
- generated UI ownership

### Future Product Surfaces

Read:

- `/workspace/code/goforj/docs/designs/forj-extension-design.md`
- `/workspace/code/goforj/docs/designs/forj-api-index-design.md`
- `/workspace/code/goforj/docs/designs/forj-dev-tui-design.md`
- `/workspace/code/goforj/docs/designs/console-package-handoff.md`

Use for:

- proposed features
- future docs planning
- not current public behavior unless implementation exists

## Context Loading Rule

Load the smallest set of files that answers the task.

Do not bulk-load all context files unless the task is explicitly broad architecture work.
