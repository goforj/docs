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
Detected agents: Codex, Claude Code
Install: Recommended
```

Recommended is meant to be safe for most projects. It installs guidance for the detected agents and enables local docs context where supported.

## Install later

From a GoForj project:

```bash
forj atlas:install
```

Choose individual agents and surfaces when you want a smaller or more explicit install:

```bash
forj atlas:install --agent codex --agent copilot --guidelines --skills --mcp
```

## Supported agents

Atlas is designed around local project files and editor-readable instructions, so the same project can support multiple agents:

- Codex
- Claude Code
- GitHub Copilot

If an agent is not detected, you can still choose it during custom installation.

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
forj atlas:list-skills
forj atlas:make-skill checkout-rules
forj atlas:mcp
```

## Related

- [Quickstart](/getting-started/quickstart)
- [Make Commands](/core/make-commands)
- [Apps](/core/apps)
- [Organizing Generated Code](/core/organizing-generated-code)
