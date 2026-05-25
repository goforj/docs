# GoForj Examples Strategy

## Purpose

This directory defines the strategy for future GoForj examples.

Do not generate many examples here yet. Use this file to guide example design across docs, repositories, and future runnable sample apps.

## What Makes A Good Example

A good GoForj example:

- compiles
- can be run or tested
- maps to generated app structure
- shows one clear concept
- uses realistic names
- handles errors when showing production-shaped code
- uses explicit dependencies
- reinforces driver swappability
- includes a verification step
- avoids unnecessary infrastructure
- teaches operational visibility when relevant

## Example Types

### Fragment

A fragment shows a small API shape.

Use fragments only when the surrounding page already explains where the code lives.

### Complete File

A complete file includes package, imports, types, and functions.

Use complete files for task pages and golden-path examples.

### Runnable App Example

A runnable app example is a small application or generated app scenario that can be copied, run, and tested.

Use runnable examples for onboarding, HTTP services, workers, scheduler, storage/cache, and full application flows.

## Naming Conventions

Use realistic names:

- users
- accounts
- reports
- invoices
- uploads
- notifications
- sessions
- monitor checks

Use stable operational identifiers:

- event topics: `users.created`, `billing.invoice_paid`
- job names: `emails:send`, `reports:generate`
- schedule names: `cleanup:stale-sessions`, `reports:daily`
- queue names: `default`, `critical`, `emails`
- storage disks: `assets`, `uploads`
- cache keys: `users:42:profile`

Avoid:

- `foo`
- `bar`
- `baz`
- `doThing`
- generic `Process`
- artificial examples that cannot exist in a real app

## Realism Expectations

Examples should be small but not fake.

A realistic example may use:

- a user registration flow
- a report generation job
- an upload storage flow
- an email notification job
- a cleanup schedule
- a cached profile lookup
- a domain event after a write
- a metrics counter for app-specific work

Do not invent complex business domains. Use simple domains with real operational shape.

## Complexity Rules

Each example should teach one primary idea.

If an example needs more than three major concepts, split it.

Progression should be:

1. local HTTP route or command
2. service with dependency injection
3. repository or persistence boundary
4. cache or storage
5. event publication
6. queued background job
7. scheduled recurring work
8. metrics and inspections
9. production driver configuration

Do not start with the full stack.

## Formatting Rules

Use fenced code blocks with language identifiers.

For Go examples:

```go
package users
```

For commands:

```bash
forj run route:list
```

Every runnable example should include:

- files changed or generated location
- command to run
- expected result
- test or smoke verification

## Golden-Path Reinforcement

Examples should reinforce:

- generated app extension points
- explicit provider wiring
- service-owned business logic
- controller-thin HTTP boundaries
- named jobs and schedules
- typed events
- named storage disks
- explicit cache TTLs
- bounded metrics
- local-first drivers

Examples should not teach:

- direct driver imports inside business services as the default
- raw HTTP engine APIs in normal app docs
- hidden dependency containers
- anonymous schedules for meaningful work
- event subscribers as durable job processors
- cache as source of truth

## Runnable Verification

Prefer examples that can be validated with:

```bash
GOCACHE=/tmp/gocache GOMODCACHE=/tmp/gomodcache go test ./...
```

For generated app examples, include the relevant `forj` command:

```bash
forj run route:list
forj run queue:work
forj run schedule:run
```

Use the actual command names only after confirming them from the current framework source.

## Example Review Checklist

Before publishing an example, verify:

- It has one teaching goal.
- It compiles or is clearly marked as a fragment.
- It follows generated app structure.
- It uses canonical terminology.
- It avoids low-level APIs too early.
- It names resources operationally.
- It handles errors where appropriate.
- It shows how to verify behavior.
- It does not introduce a competing architecture.
