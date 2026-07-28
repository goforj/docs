# GoForj Docs Constitution

## Purpose

This is the highest-level governing document for GoForj documentation.

When documentation choices conflict, follow this file first.

## Prime Directive

GoForj docs optimize for developer trust.

Trust comes from accurate examples, explicit behavior, consistent terminology, honest tradeoffs, and a coherent application model.

## Immutable Principles

### Teach Developers What They Build

The docs must show what developers can build with GoForj and how they do it, not only how packages work or how the framework is organized.

Every important capability should eventually answer:

- which file or package owns it
- how it is configured
- how it is wired
- how it is tested
- how it is operated
- which driver choices exist

### One Golden Path First

For common tasks, teach one official path before alternatives.

Alternatives are allowed only after the reader understands the default architecture.

Golden path does not mean every deployment looks identical. It means the docs present one way to complete the task first, then explain deployment, packaging, and driver choices as explicit variations.

### Go-Native Always

Docs must preserve Go's strengths:

- explicit dependencies
- readable code
- package boundaries
- context-aware execution
- compiled binaries
- table-driven tests
- clear errors
- simple interfaces

Do not teach patterns that only make sense in dynamic-language frameworks.

### Generated Code Has Clear Ownership

Generated code is ordinary Go that developers read and maintain.

Use "generated" when ownership, safe edits, rerendering, or regeneration affects the task. Otherwise, name the file, provider, manager, binary, or command directly. If generated code would be embarrassing to document, the code should improve.

Local READMEs created with a project may be more ownership-oriented than public docs, but they must still be simple, accurate, and pleasant to read.

### Swap Drivers, Not Business Logic

Docs must consistently reinforce infrastructure swappability.

Application behavior should depend on contracts and injected dependencies. Providers and configuration select drivers.

### Local First, Production Honest

Start with local development paths that run without external infrastructure.

Then explain production tradeoffs clearly:

- durability
- throughput
- locking
- retries
- storage semantics
- operational visibility
- failure modes

### Lifecycle Must Be Visible

Startup, shutdown, workers, schedules, background processes, and runtime boundaries must be explained explicitly where relevant.

Hidden lifecycle behavior erodes trust.

Runtime-capable app binaries use a stable default: launching the binary without arguments selects the standalone `run` runtime. Explicit commands remain explicit, and CLI-only binaries retain their normal root help behavior. Document this as command behavior, not as a build flag or hidden runtime discovery.

### Observability Is Core

Logs, metrics, inspects, route lists, health checks, and Lighthouse are part of the framework model.

Docs should make runtime visibility normal, not optional polish.

### Examples Must Earn Trust

Examples should compile, run, and feel realistic.

An example that cannot be run should be clearly marked as a fragment. A fragment should not carry the main teaching burden of a task page.

When examples produce useful output, include the expected value in comments or verification text. Readers should not have to infer what success looks like.

## What Great GoForj Docs Feel Like

Great GoForj docs feel:

- calm
- precise
- senior
- practical
- Go-native
- production-aware
- internally consistent
- easy to scan

They do not feel:

- breathless
- magical
- vague
- copied from another ecosystem
- overloaded with options
- indifferent to operations
- disconnected from the files and commands developers use

## Onboarding Objective

The onboarding experience should take a developer from zero to a running application with a stable mental model.

By the end of onboarding, the developer should know:

- what GoForj is
- what the project structure means and which files they own
- where to add routes, commands, jobs, events, schedules, cache, and storage
- how configuration flows
- how dependencies are wired
- how to run and test the app
- how to inspect behavior
- how local drivers differ from production drivers

Onboarding should not require reading package READMEs as archaeology.

## What Must Never Happen

Docs must never:

- present fake or non-compiling code as the main path
- encourage hidden global dependency lookup
- blur events and queues
- treat cache as durable storage
- show secrets in logs, metrics, or inspects
- use unbounded metric labels
- add defensive nil guards around required injected dependencies
- reintroduce `trace` as the product name for inspects
- imply distributed infrastructure is required for first use
- document implementation accidents as framework principles
- offer three architectures when one should exist
- let generated AI context files leak into the public docs index or search
- treat visual styling as decoration when it does not clarify the system

## Evolution Rules

Documentation should evolve with the framework in this order:

1. update the mental model when behavior changes
2. update golden-path examples
3. update workflow docs
4. update reference pages
5. update advanced and edge-case docs

When a new capability or driver appears, do not only add reference docs. Show the task it enables and where developers configure, call, test, and operate it.

## AI Generation Rules

Future AI-assisted documentation should:

- read these AI files before generating public docs
- use `terminology.md` as the naming source of truth
- use `golden-paths.md` for examples
- use `docs-style-guide.md` for page structure
- use `anti-patterns.md` as a review checklist
- avoid inventing framework behavior not present in source context
- mark uncertainty rather than presenting guesses as facts

AI output should be treated as a draft until examples and commands are verified.
