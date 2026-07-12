---
title: Atlas
description: Agent support for GoForj projects, including local guidance, skills, and MCP context.
---

# Atlas

Atlas gives AI coding agents enough local project context to work inside a GoForj App without guessing at framework conventions.

It is optional, but first-class. During `forj new`, the `Atlas - Agent Support` step can install agent guidance for the tools you use. Atlas can also be added later from an existing project.

## What Atlas adds

Atlas installs lightweight project files that teach agents the GoForj way to build:

- prefer `forj make:*` commands over hand-created framework files
- keep business code package-scoped under `internal/`
- register routes, commands, jobs, schedules, subscribers, and providers through the generated app composition points
- use the selected app when a project has named apps
- read local docs and project metadata before changing code

The goal is not to make agents louder. The goal is to make them less surprising.

## Project-owned skills

Atlas ships with built-in GoForj skills, but your project can add its own.

Put repo-owned skills under `.ai/skills`:

```text
.ai/
  skills/
    checkout-rules/
      SKILL.md
    support-runbook.md
```

You can scaffold the directory and starter file:

```bash
forj atlas:make-skill checkout-rules
```

Then sync Atlas skills:

```bash
forj atlas:update --skills
```

Atlas copies those skills into each selected agent's native location:

```text
.agents/skills/checkout-rules/SKILL.md             # Codex
.claude/skills/checkout-rules/SKILL.md             # Claude Code
.github/instructions/checkout-rules.instructions.md # GitHub Copilot
.gemini/skills/checkout-rules/GEMINI.md            # Gemini CLI
```

Use project-owned skills for conventions that only exist in your repo: package boundaries, domain naming, deployment rules, generated file ownership, review expectations, or local testing habits.

Keep them short and specific. A good project skill tells the agent what to do differently in this codebase.

Example:

```md
# Checkout Rules

Use this skill when changing checkout, cart, payment, or order creation code.

Rules:

- Keep payment provider calls behind `internal/checkout.PaymentGateway`.
- Use `forj marketplace make:*` for generated marketplace entry points.
- Run `forj marketplace test:checkout` before marking checkout work done.
- Do not add direct provider SDK calls inside HTTP controllers.
```

Atlas guidance also tells agents to notice durable repo knowledge. When you teach an agent a convention, workflow, command, or review expectation that is likely to matter again, the agent should briefly ask whether it belongs in `.ai/skills/<name>/SKILL.md`.

That suggestion should be rare and practical. It is for repeated project knowledge, not one-off preferences or temporary debugging steps.

## Install during project creation

Run the wizard:

```bash
forj new
```

When the wizard reaches `Atlas - Agent Support`, choose how much support to install:

```text
Atlas - Agent Support
Detected agents: Codex, Claude Code, Gemini CLI
Install: Recommended
```

Recommended is meant to be safe for most projects. It installs guidance for the detected agents and enables local docs context where supported.

## Install later

From a GoForj project:

```bash
forj atlas:install
```

Preview the files Atlas would manage without changing the project:

```bash
forj atlas:install --dry-run
forj atlas:update --dry-run
```

Choose individual agents and surfaces when you want a smaller or more explicit install:

```bash
forj atlas:install --agent codex --agent copilot --agent gemini --guidelines --skills --mcp
```

## Supported agents

Atlas is designed around local project files and editor-readable instructions, so the same project can support multiple agents:

- Codex
- Claude Code
- GitHub Copilot
- Gemini CLI

If an agent is not detected, you can still choose it during custom installation.

Atlas writes each agent's native project files:

| Agent | Guidance | Skills | MCP config |
| --- | --- | --- | --- |
| Codex | `AGENTS.md` | `.agents/skills/*/SKILL.md` | `.codex/config.toml` |
| Claude Code | `CLAUDE.md` | `.claude/skills/*/SKILL.md` | `.mcp.json` |
| GitHub Copilot | `.github/copilot-instructions.md` | `.github/instructions/*.instructions.md` | `.vscode/mcp.json` |
| Gemini CLI | `GEMINI.md` | `.gemini/skills/*/GEMINI.md` | `.gemini/settings.json` |

## MCP context

Atlas can expose GoForj context through an MCP server. The MCP server loads docs and project metadata locally, then serves focused slices of context to the agent.

The server is run by the GoForj CLI:

```bash
forj atlas:mcp
```

Atlas keeps the docs in a local cache and updates them from the GoForj docs repository. If you are working from a local docs checkout, point Atlas at it:

```bash
GOFORJ_DOCS_PATH=/path/to/goforj-docs/docs forj atlas:mcp
```

To use cached hosted docs from a branch, tag, or commit, select the repository and ref before starting MCP:

```bash
GOFORJ_ATLAS_DOCS_REPO=https://github.com/goforj/docs.git \
GOFORJ_ATLAS_DOCS_REF=main \
forj atlas:mcp
```

Use a tag or commit only when that ref exists in the docs repository. Framework release tags and docs repository refs are separate namespaces.

Atlas reports the active docs version and revision through `application-info` and `docs-section-pack`, so an agent can tell which docs bundle it used.

Use `version-alignment` when an agent needs to compare the project GoForj version, Atlas version, and active docs bundle before following docs from a branch or release.

## Workflow skills

Atlas installs workflow skills for high-leverage GoForj changes. They are short, task-focused guides that tell an agent which app owns the change, which `forj make:*` command to prefer, which generated files not to edit by hand, which docs sections to read, and which validation commands prove the work.

Built-in workflow skills cover:

- HTTP routes, controllers, and services
- app-owned CLI commands
- queued jobs and worker behavior
- scheduler registrations
- events and subscribers
- repositories, migrations, caches, storage, and named data resources
- Wire repair
- runtime debugging with logs, routes, URLs, browser logs, metrics, and Lighthouse context
- multi-app changes
- validation planning

Atlas also includes starter-kit overlays for Vue, React, and templ/htmx projects. When a frontend task touches pages, screens, dashboards, login, auth, or UI behavior, the workflow plan can point the agent at the matching starter-kit skill so edits stay in the owning app's frontend tree.

## Agent workflow examples

Agents should use Atlas tools together instead of reading the whole docs site or guessing from filenames.

For a route change:

```text
workflow-plan task="add users route"
docs-section-pack workflow_id="goforj-add-http-route"
generated-file-policy path="app/routes.go"
command-advice task="add users route" resource="users"
validation-plan task="add users route"
```

That sequence gives the agent the preferred command, app registration points, focused route/controller/Wire docs, file ownership guidance, and the checks that prove the route is registered.

For a named app job:

```text
workflow-plan app="marketplace" task="add sync catalog job"
docs-section-pack workflow_id="goforj-add-job"
resource-inventory
command-advice app="marketplace" task="add sync catalog job" resource="sync-catalog"
validation-plan app="marketplace" task="add sync catalog job"
```

That should lead to `forj marketplace make:job sync-catalog`, app-scoped Wire registration, small typed queue payloads, and worker validation rather than an untracked goroutine or anonymous queue callback.

For a Wire failure:

```text
wire-diagnostics output="<forj build output>"
registration-points
docs-section-pack workflow_id="goforj-wire-repair"
generated-file-policy path="app/wire/wire_gen.go"
validation-plan task="fix wire missing provider"
```

That keeps the fix in the provider set that owns the dependency and reminds the agent not to edit `wire_gen.go` or hide required constructor dependencies behind nil guards.

For runtime debugging:

```text
workflow-plan task="debug dashboard 500"
resource-inventory
runtime-snapshot app="app" runtime="http" path="/dashboard"
debug-plan app="app" runtime="http" path="/dashboard"
get-absolute-url app="app" path="/dashboard"
read-log-entries app="app" limit=50
last-error
metrics-metadata app="app" runtime="http"
browser-logs app="app" limit=50
```

That gives the agent app/runtime identity, local URLs, recent logs, metrics labels, browser errors, and known operator resources before code changes begin.

For human-readable versions of common evidence loops, see [Atlas Debug Recipes](/developer-tools/atlas-debug-recipes).

`runtime-snapshot` and `debug-plan` are evidence tools. They report missing logs, URLs, routes, browser entries, metrics targets, or resource links instead of inventing values.

`generated-file-policy` reports classification, preferred action, and ownership for generated files, app-owned files, named-app files, migrations, frontend files, config, docs, and unknown paths. Projects can override ownership rules in `.goforj/atlas.json`.

## Daily use

Most users do not need to run Atlas commands every day. Once installed, your agent reads the local guidance files and, when configured, asks the MCP server for focused docs context.

Reach for Atlas commands when:

- you add or remove an agent
- you want to refresh installed skills or instructions
- you want to point MCP at a local docs checkout
- you want agents to understand a newly rendered GoForj project

Useful commands:

```bash
forj atlas:install
forj atlas:update
forj atlas:doctor
forj atlas:list-skills
forj atlas:make-skill checkout-rules
forj atlas:mcp
```

`forj atlas:doctor` reports whether Atlas is installed, which agents are configured, whether generated skills look stale, and which MCP/guidance files are present.

## Related

- [Quickstart](/getting-started/quickstart)
- [Make Commands](/core/make-commands)
- [Apps](/core/apps)
- [Organizing Generated Code](/core/organizing-generated-code)
