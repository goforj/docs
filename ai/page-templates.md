# GoForj Page Templates

## Purpose

This file provides reusable templates for future GoForj documentation pages.

Templates are starting points. Adjust them when the page type requires it, but preserve the conceptual order.

## Feature Page Template

Use for HTTP, queues, events, scheduler, cache, storage, metrics, inspects, and Lighthouse.

```markdown
# Feature Name

One short paragraph defining the feature.

## When To Use It

Explain the problem this feature solves and when not to use it.

## Where It Lives

Name the generated App package, file, or extension point.

## Golden Path

Show the simplest correct local-first example.

## Configuration

Explain the configuration surface and default behavior.

## Dependency Wiring

Show how dependencies are provided or injected when relevant.

## Testing

Show the normal test strategy.

## Operations

Explain lifecycle, commands, metrics, logs, inspects, and failure behavior.

## Advanced Usage

Show optional customization, driver swaps, or escape hatches.

## Common Mistakes

List concrete mistakes and corrections.

## Next Steps

Link to the next likely workflow or reference page.
```

## Task Page Template

Use when the reader wants to accomplish one task.

```markdown
# Task Title

State the outcome.

## Prerequisites

List required components, files, or commands.

## Step 1: First Action

Show the code or command.

## Step 2: Second Action

Show the next code or command.

## Verify

Show how to confirm the behavior.

## Troubleshooting

Cover the most likely failure modes.

## Next Steps

Link to the next task.
```

## Concept Page Template

Use for mental models such as lifecycle, providers, drivers, and local-first development.

```markdown
# Concept Name

Define the concept in one paragraph.

## Why It Exists

Explain the problem it solves.

## How It Fits In GoForj

Place it in the App, Framework, Stack, or primitive layer.

## Golden Path

State the default way to use the concept.

## Boundaries

Explain what this concept is and is not.

## Common Mistakes

List common misunderstandings.

## Related Concepts

Link to adjacent concepts.
```

## Operations Page Template

Use for production runtime behavior.

```markdown
# Operations Topic

State what runtime boundary the page covers.

## Process Model

Explain what process or command runs.

## Startup

Explain what starts and what must be registered first.

## Shutdown

Explain graceful shutdown and timeout behavior.

## Configuration

List relevant production configuration.

## Observability

Cover logs, metrics, inspects, health, readiness, and Lighthouse.

## Failure Modes

Explain common failures and how they appear.

## Deployment Notes

Give production guidance.

## Checklist

Provide a concise production checklist.
```

## Decision Page Template

Use for choosing drivers, deployment shapes, or architectural options.

```markdown
# Decision Title

State the default recommendation first.

## Default Recommendation

Explain what most apps should choose.

## Options

Provide a compact comparison table.

## Choose This When

Explain each option by scenario.

## Tradeoffs

Discuss durability, latency, throughput, cost, complexity, and operations.

## Migration Path

Explain how to change later.

## Related Reference

Link to the full reference matrix.
```

## Reference Page Template

Use for exhaustive lookup pages.

```markdown
# Reference Title

Define the scope.

## Quick Usage

Show the smallest useful example.

## Reference

List commands, env vars, APIs, drivers, or options.

## Examples

Show focused examples grouped by use case.

## Edge Cases

Document sharp edges.

## Related Guides

Link back to workflow docs.
```

