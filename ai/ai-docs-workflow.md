# GoForj AI Docs Workflow

## Purpose

This file defines how future AI-assisted documentation sessions should work.

The goal is to produce accurate, cohesive GoForj docs without inventing behavior or drifting from framework philosophy.

## Read Order

For any substantial docs task, read:

1. `ai/docs-constitution.md`
2. `ai/terminology.md`
3. `ai/golden-paths.md`
4. `ai/docs-style-guide.md`
5. the specific operating file for the task:
   - `information-architecture.md`
   - `page-templates.md`
   - `example-registry.md`
   - `operations-docs-model.md`
   - `driver-decision-model.md`
   - `library-docs-model.md`
   - `generated-components-model.md`
   - `runtime-topology-model.md`
   - `product-surfaces-model.md`
   - `source-context-map.md`
   - `review-checklists.md`

Then read the relevant source context:

- `goforj/docs/context/*`
- generated templates under `goforj/templates`
- sibling repo README or docs for the primitive being documented
- existing public docs under `goforj-docs/docs`

Do not load the entire context tree by default. Choose the smallest set needed.

## Drafting Workflow

1. Identify the page type.
2. Pick the relevant template from `page-templates.md`.
3. Identify whether the page is a framework projection or a library projection.
4. Identify the generated App location for framework pages.
5. Identify the standalone package entrypoint for library pages.
6. Identify the runtime boundary if one exists.
7. Identify the local-first path.
8. Identify the production tradeoff.
9. Draft the golden path before alternatives.
10. Add verification.
11. Add common mistakes.
12. Link to next steps, Libraries, and Reference as appropriate.

## Accuracy Rules

- Do not invent command names.
- Do not invent generated file paths.
- Do not invent APIs.
- Do not assume a feature exists because another framework has it.
- Do not present future plans as current behavior.
- Mark uncertainty or inspect source before writing.

For commands, verify in:

- `goforj/templates/internal/cmd/root_cmd.go.tmpl`
- `goforj/internal/forj`
- generated app templates

For primitives, verify in sibling repos:

- `web`
- `queue`
- `events`
- `scheduler`
- `cache`
- `storage`
- `metrics`

For library pages, preserve standalone package accuracy even when adding framework integration notes.

## Example Workflow

Before writing an example:

1. Choose a canonical domain from `example-registry.md`.
2. Decide whether the example is a fragment, complete file, or runnable scenario.
3. Use generated App extension points.
4. Keep business logic out of runtime bootstrap.
5. Keep driver imports out of business services.
6. Include verification.
7. Confirm commands and package APIs.

## Review Workflow

Before finalizing:

1. Run terminology review.
2. Run architecture review.
3. Run example review.
4. Run operations review if a runtime is involved.
5. Check for ASCII unless the file already requires Unicode.
6. Run docs build if dependencies are usable.
7. Note any build or verification blockers.

Use `review-checklists.md`.

## Verification Commands

For docs site:

```bash
npm run build
```

Run from:

```bash
/workspace/code/goforj-docs/docs
```

For Go examples or generated app checks, use the repository's Go cache defaults:

```bash
GOCACHE=/tmp/gocache GOMODCACHE=/tmp/gomodcache go test ./...
```

For GoForj framework/template work, prefer focused checks first:

```bash
GOCACHE=/tmp/gocache GOMODCACHE=/tmp/gomodcache go test ./internal/generate -count=1
GOCACHE=/tmp/gocache GOMODCACHE=/tmp/gomodcache go test ./internal/forj -count=1
```

## AI Failure Modes

Watch for:

- mimicking another framework's terminology
- treating README reference as application guidance
- showing low-level driver APIs too early
- inventing a runtime container
- adding nil guards around required dependencies
- using events as durable jobs
- using cache as source of truth
- omitting verification
- writing a page that sounds correct but cannot be mapped to generated code

## Final Response Expectations

When reporting docs work:

- list added or changed files
- summarize the operating purpose of each file
- state verification performed
- state verification blockers
- mention unrelated dirty worktree files only when relevant
