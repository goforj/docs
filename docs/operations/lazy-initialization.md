---
title: Lazy Initialization
description: How GoForj uses lazy resource initialization while keeping required dependencies explicit.
---

# Lazy Initialization

Lazy initialization delays backend connection work until a resource is used.

This is useful when an App supports a component but a specific command does not need that backend.

## What Can Be Lazy

Generated managers can construct lightweight handles and open backend resources on first use.

Examples:

- database connections
- cache stores
- storage disks
- event buses
- named resources

## What Should Not Be Lazy

Required wiring should remain explicit.

Lazy initialization can delay backend connection work, but it should not make required dependencies appear optional.

## Commands

A short command should not need every backend live just because the App supports them.

For example, `route:list` should not require a database connection unless route construction actually needs database-backed dependencies.

## Readiness

Readiness is where required backend availability should become operationally visible.

Lazy construction does not mean production can ignore dependency readiness.

## Common Mistakes

::: warning Common mistakes
- Do not confuse lazy backend connection with optional dependency injection.
- Do not make required resources appear optional.
- Do not make every command eagerly connect to every backend.
- Do not hide degraded optional resources from operators.
:::

## Next Steps

- [Health and Readiness](/operations/health-readiness)
- [Generated Components](/core/generated-components)
- [Dependency Injection](/core/dependency-injection)
