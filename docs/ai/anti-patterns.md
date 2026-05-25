# GoForj Documentation Anti-Patterns

## Purpose

This file defines patterns that GoForj docs and examples should avoid encouraging.

Anti-patterns are listed here so future documentation stays coherent as the framework grows.

## Architectural Anti-Patterns

### Multiple Official Architectures

Do not present several equivalent ways to structure the same common feature.

GoForj docs should have a golden path. Alternatives belong in advanced pages only when they solve a real constraint.

### Business Logic In Runtime Bootstrap

Do not put business workflows in:

- scheduler bootstrap files
- HTTP server setup
- Wire provider files
- command root setup
- middleware chains
- lifecycle plumbing

Runtime files compose and start systems. Domain-owned services perform work.

### Driver Coupling In Business Logic

Do not show application services importing backend-specific driver packages as the normal path.

Bad default:

- a user service importing Redis cache directly
- an upload service importing S3 directly
- a job handler importing a broker client directly

Good default:

- services depend on app-facing cache, storage, queue, or event contracts
- providers choose drivers

### Events As Durable Jobs

Do not teach events as the way to perform durable background work.

Events are for fan-out. Jobs and queues are for durable work, retries, delays, worker lifecycle, and operational control.

### Cache As Source Of Truth

Do not use cache examples as durable business storage.

Cache examples should show derived data, temporary data, locks, rate-limit state, or performance-oriented reads with explicit TTLs.

### Hidden Dependency Lookup

Do not write docs that imply services should fetch dependencies from a global container or runtime registry.

Use constructor injection and provider wiring.

### Defensive Nil Guards Around Required Wiring

Do not show required injected dependencies as optional unless the design says they are optional.

Bad:

```go
if s.queue == nil {
	return nil
}
```

Good:

```go
func NewService(queue Queue) *Service {
	return &Service{queue: queue}
}
```

Fail fast on bad wiring.

### Premature Distributed Complexity

Do not introduce Redis, Kafka, S3, Kubernetes, or multi-node locking before the reader understands the local app model.

Start local. Then explain when production backends matter.

### Enterprise Layering By Default

Do not invent layers such as managers, interactors, coordinators, gateways, factories, and registries unless they solve a concrete boundary.

Prefer clear Go packages, constructors, services, repositories, and primitive contracts.

## Documentation Anti-Patterns

### README Dumping

Do not make public docs a stitched-together set of package READMEs.

Library reference is useful, but application docs must explain how primitives compose inside a GoForj app.

### Low-Level APIs Too Early

Do not start app docs with:

- raw driver constructors
- adapter internals
- generated template mechanics
- low-level HTTP engine APIs
- custom Wire internals

Start with the generated app extension point and the normal application path.

### Abstract Explanations Without Code

Do not write long conceptual pages that never show how the reader uses the feature.

Every major workflow page needs a concrete example.

### Toy Examples

Avoid examples that feel disposable:

- `foo`
- `bar`
- `doThing`
- `hello world` beyond smoke tests
- fake business workflows with no operational meaning

Use realistic but compact examples.

### Inconsistent Naming

Do not change naming style between pages.

Use stable patterns:

- job names: `emails:send`, `reports:generate`
- event topics: `users.created`, `billing.invoice_paid`
- schedule names: `cleanup:stale-sessions`
- storage disks: `assets`, `uploads`
- cache keys: `users:42:profile`

### Over-Explaining Go Basics

Do not turn GoForj docs into a Go language tutorial.

Explain Go concepts only when GoForj uses them in a specific way, such as `context.Context` in runtime boundaries.

### Marketing Language

Do not use hype to make features sound important.

Replace broad claims with concrete behavior:

- what starts
- what is wired
- what is configured
- what can fail
- what can be inspected

## Onboarding Mistakes

### Starting With Internals

New users should not need to understand templates, generators, or sibling repo boundaries before building their first route or job.

### No Verification Step

Do not end task pages without showing how to confirm the result.

Use:

- `forj run route:list`
- `forj run queue:work`
- HTTP smoke requests
- test commands
- `/metrics`
- Lighthouse views when relevant

### Ignoring Generated App Ownership

Do not tell users to edit random generated files without explaining whether the change is app-owned or framework-owned.

Use documented extension points.

## Abstraction Drift

Watch for concepts that become too broad:

- Service should not mean every object.
- Provider should not mean plugin.
- Driver should not mean any dependency.
- Runtime should not mean source tree.
- Lighthouse should not mean all observability.
- Inspect should not be renamed back to trace.

When a new page uses one of these words, compare it to `terminology.md`.

## Implementation Leakage

Do not leak implementation details unless they affect architecture, operations, testing, or extension.

Examples of leakage to avoid:

- template filenames in beginner docs
- private helper names
- generated code paths that users should not edit
- Echo internals in normal HTTP app docs
- specific metric implementation internals on quickstart pages

## Competing Patterns

Avoid showing both of these as equal defaults:

- direct driver construction inside services and provider-based driver wiring
- controller-heavy business logic and service-owned business logic
- anonymous scheduler callbacks and named domain methods
- event subscribers doing durable work and queued jobs doing durable work
- raw HTTP engine handlers and `web.Context` handlers

Choose the GoForj path. Explain alternatives later if needed.

