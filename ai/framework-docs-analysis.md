# Framework Documentation Architecture Analysis

## Purpose

This document analyzes what makes mature framework documentation feel cohesive, approachable, production-grade, and scalable.

It is an internal architecture document for GoForj documentation. It is not a comparison article and should not be copied into end-user docs. The goal is to extract durable documentation systems that GoForj can express in its own Go-native voice.

## Source Lens

The analysis used mature framework documentation patterns as reference material, including local framework docs in `/workspace/code/laravel-docs`.

Transferable patterns were evaluated through a GoForj lens:

- explicit dependency flow
- generated app structure
- local-first drivers
- runtime lifecycle
- operational clarity
- composable primitives
- production-grade examples
- strong terminology discipline

The resulting recommendations are for GoForj only.

## 1. What Makes Great Framework Documentation Feel Cohesive

Great framework documentation feels cohesive when every framework page appears to come from the same application model, and every library page clearly presents the standalone primitive it documents.

GoForj has both framework docs and library docs. The reader should understand which projection they are reading: generated App integration or standalone package usage. Both should feel intentional.

### Structural Consistency

Strong docs use recurring page shapes.

Common feature pages usually follow a predictable sequence:

1. introduction
2. configuration or location in the app
3. basic usage
4. common variants
5. operational behavior
6. testing
7. extension points or advanced behavior

This works because readers learn the documentation grammar. Once they understand the shape of one page, they can scan the next page faster.

For GoForj, this means HTTP, queues, events, scheduler, cache, storage, metrics, and Lighthouse docs should share a recognizable structure even when the underlying systems differ.

### Conceptual Reinforcement

Cohesion comes from repeated concepts that become familiar:

- where code lives
- how configuration works
- how lifecycle starts and stops
- how dependencies are wired
- how local defaults become production backends
- how behavior is inspected

The repetition should not feel redundant. It should reinforce the framework's mental model.

For GoForj, the recurring concept should be:

> Use generated structure, explicit providers, and app-facing contracts so infrastructure can change without rewriting business logic.

### Terminology Discipline

Great docs do not casually rename concepts.

If one page says "driver", another page should not call the same thing an adapter, backend, provider, connector, or integration unless those words have distinct meanings.

Terminology discipline lowers cognitive load. Users can build a stable map of the framework because words do not shift under them.

For GoForj, the most important protected terms are:

- App
- Runtime
- Provider
- Driver
- Adapter
- Service
- Resource
- Event
- Job
- Queue
- Scheduler
- Inspect
- Lighthouse

### Narrative Flow

Great framework docs order concepts by dependency.

They do not explain advanced variants before the basic model. They do not explain custom drivers before the reader understands the default driver. They do not explain deployment before the reader can run locally.

This works psychologically because it gives the reader a series of stable shelves. Each new concept has somewhere to attach.

For GoForj, the docs should generally move:

1. what GoForj is
2. generated app structure
3. configuration and environment
4. dependency injection
5. HTTP and commands
6. persistence, cache, and storage
7. events, queues, jobs, and scheduler
8. testing
9. metrics, inspects, Lighthouse, and operations
10. deployment and production drivers

### Onboarding Progression

Good onboarding answers the questions in the order users actually have them:

- What is this?
- Can I run it?
- Where do files go?
- How do I make a route or command?
- How do I connect dependencies?
- How do I persist data?
- How do I run background work?
- How do I test it?
- How do I operate it?

Framework onboarding fails when it starts with exhaustive package reference.

For GoForj framework docs, onboarding should not begin with driver matrices. Driver matrices become powerful after the user understands the App model. In Libraries, driver matrices are appropriate because standalone package users are often choosing a backend directly.

### Confidence-Building Techniques

Framework docs build confidence by making behavior predictable.

Useful techniques:

- show default locations
- show commands to create or run things
- show expected output
- explain lifecycle boundaries
- include testing paths
- include production notes without overwhelming the beginner
- state recommended defaults
- disclose tradeoffs honestly

Confidence is not built by hype. It is built when the docs remove ambiguity.

### Section Hierarchy

Strong docs use hierarchy to control attention.

Top-level sections should represent user tasks or major concepts. Subsections should represent variants, options, or deeper details.

For GoForj, a page such as "Queues" should not be a flat list of API methods. It should have conceptual sections:

- what queues are for
- creating jobs
- dispatching jobs
- running workers
- retries and timeouts
- driver selection
- testing
- operations

### Example Strategy

Examples should form a system.

Good examples:

- reuse familiar domains
- use consistent naming
- grow in complexity
- show realistic code boundaries
- match framework conventions
- include verification

Examples should not be random snippets. Over hundreds of pages, example consistency becomes part of the framework's identity.

### Cognitive Load Management

Docs reduce cognitive load by narrowing choices.

They say:

- start here
- use this file
- run this command
- choose this default
- use this extension point
- read this next

They postpone:

- all available drivers
- custom providers
- internals
- performance tuning
- platform-specific deployment variants

For GoForj, cognitive load reduction means showing one local-first path first, then driver choices later.

### Progressive Complexity Introduction

Great docs add complexity only after the base model is stable.

A mature feature page often flows:

1. simple local example
2. configuration
3. common production variant
4. advanced behavior
5. testing
6. customization

For GoForj, every major primitive should move from generated-app usage to backend details, not the reverse.

## 2. Information Architecture Patterns

## Page Organization

Strong framework docs organize around the developer journey, while library docs organize around package ownership and standalone use.

GoForj should support both paths deliberately:

- Framework path: build and operate a generated GoForj App.
- Libraries path: use first-party Go packages independently.

Recommended GoForj top-level IA:

- Getting Started
- Core Concepts
- Libraries
- Building Applications
- Data and Persistence
- Async and Workflows
- Testing
- Operations
- Lighthouse and Observability
- Reference
- Internals

## Conceptual Grouping

Group pages by the questions developers ask.

Recommended grouping:

- Getting Started: installation, quickstart, project structure, configuration
- Core Concepts: app, runtime, lifecycle, dependency injection, providers, drivers
- Building Applications: HTTP, controllers, middleware, commands, services, validation, error handling
- Data and Persistence: database, repositories, migrations, cache, storage
- Async and Workflows: queues, jobs, events, scheduler, events versus queues
- Testing: unit, HTTP, jobs, events, storage, cache, integration, rendered app smoke tests
- Operations: deployment, workers, schedulers, metrics, logging, health, readiness
- Lighthouse and Observability: inspects, resource explorers, runtime views, local debugging
- Reference: CLI, env vars, generated files, framework configuration
- Libraries: standalone package APIs, driver matrices, primitive examples
- Internals: generated templates, repo boundaries, contribution architecture

## Reference versus Guide Separation

Framework guides teach how to build generated Apps.

Library pages teach how to use first-party primitives independently.

Reference pages define framework-level lookup material.

GoForj should avoid making the first framework experience a library page. A queue driver matrix is valuable, but App users need a guide that explains:

- what a job is
- where jobs live in a generated App
- how handlers register
- how workers start
- how retries behave
- how to test the path

Standalone package users can enter through the queue library page directly.

## Beginner versus Advanced Progression

Beginner pages should show:

- one default path
- local runtime
- generated extension point
- minimal dependencies
- verification

Advanced pages can show:

- custom providers
- direct driver construction
- adapter escape hatches
- distributed backends
- tuning
- internals

The same page may include both, but the first example must be the beginner-safe golden path.

## Discoverability

Discoverability depends on predictable page names and cross-links.

Recommended GoForj page names:

- `getting-started/quickstart.md`
- `getting-started/project-structure.md`
- `core/lifecycle.md`
- `core/dependency-injection.md`
- `core/drivers-and-providers.md`
- `applications/http.md`
- `applications/controllers.md`
- `applications/commands.md`
- `async/queues.md`
- `async/jobs.md`
- `async/events.md`
- `async/scheduler.md`
- `async/events-vs-queues.md`
- `operations/workers.md`
- `operations/metrics.md`
- `operations/inspects.md`
- `operations/lighthouse.md`

## Navigation Hierarchy

Navigation should reflect conceptual dependency order.

Do not put advanced package reference above foundational application pages in the framework path. The nav should also expose Libraries as a first-class top-level path for standalone package users.

The first screen should answer:

- start a project
- learn the structure
- build an HTTP endpoint
- run background work
- test and operate

## Cross-Linking Strategy

Cross-links should connect the next likely task, not every related concept.

Examples:

- HTTP guide links to controllers, middleware, validation, testing HTTP, route list.
- Jobs guide links to queues, events versus queues, testing jobs, workers in production.
- Storage guide links to driver selection and testing storage.
- Metrics guide links to operations and Lighthouse, not every metric primitive API.

Cross-linking should create pathways, not dense link walls.

## Conceptual Dependency Ordering

Some GoForj concepts should always be introduced before others:

- App structure before extension points
- configuration before drivers
- providers before custom driver wiring
- lifecycle before workers and schedulers
- events versus queues before event subscribers doing async work
- metrics semantics before Lighthouse dashboards
- local drivers before distributed drivers

## Recommended GoForj Docs Ecosystem

GoForj should maintain four documentation layers:

- Public workflow docs: user-facing guides that teach the application model.
- Public library docs: standalone first-party package docs, README-slurped pages, package APIs, driver matrices, and primitive examples.
- Public reference docs: CLI, env vars, generated files, and framework configuration.
- Internal AI and maintainer docs: philosophy, terminology, architecture, anti-patterns, review checklists.

The `ai` directory should govern all three.

## 3. Golden Path Reinforcement

## How Great Frameworks Reinforce Intended Architecture

Great docs reduce architectural drift by repeating a small number of patterns:

- generated files have clear responsibilities
- commands create conventional locations
- examples use the same boundaries
- beginner docs do not show advanced alternatives too early
- reference docs explain options after the default path
- tests reflect the same architecture as production code

This prevents users from treating every page as a separate design prompt.

## Reducing User Confusion

Confusion usually comes from:

- too many equivalent options
- unclear ownership boundaries
- missing lifecycle explanations
- examples that skip wiring
- terms that change between pages
- low-level APIs shown before app-level concepts

GoForj should solve this by repeatedly showing:

- generated location
- provider wiring
- runtime boundary
- operational verification

## Runtime Lifecycle

GoForj should reinforce lifecycle as a first-class concept.

Docs should consistently explain:

- which process is running
- what starts during boot
- what registers before start
- how shutdown works
- what is captured by metrics or inspects
- what command runs the surface

HTTP, workers, scheduler, CLI commands, and Lighthouse should each have explicit lifecycle diagrams or short lifecycle sections.

## Application Structure

GoForj should teach generated structure early and revisit it often.

Every workflow page should answer:

- which package owns this code?
- which generated file is the extension point?
- which code should not be edited directly?
- which package owns business logic?

## Infrastructure Abstractions

GoForj should reinforce:

- app-facing contract first
- provider selects driver
- driver imports stay near wiring
- business logic stays backend-agnostic

Docs should show direct driver constructors only in:

- reference pages
- custom wiring pages
- driver selection pages
- primitive package docs

## Local-First Philosophy

Every major feature should begin with a local path.

Examples:

- queue: sync or workerpool
- events: sync
- cache: memory or file
- storage: local or memory
- metrics: local `/metrics`
- scheduler: local process

Production drivers should be introduced as a controlled expansion, not as the default entry point.

## Composable Drivers

Docs should show driver swappability as a provider/configuration concern.

Good page structure:

1. use the default local driver
2. write business code against the contract
3. show provider/config change for production
4. explain tradeoffs and tests

## Operational Clarity

Every long-running feature should include:

- command to run it
- expected startup behavior
- shutdown behavior
- metrics or inspect behavior
- health or readiness considerations
- failure mode notes

This makes GoForj feel production-grade without hype.

## Explicit Dependency Flow

Dependency flow should be visible in examples:

- constructor receives dependencies
- provider creates dependencies
- Wire assembles dependencies
- runtime receives assembled object

Avoid examples where dependencies appear by magic.

## Avoiding Rigidity

GoForj can be opinionated without being dogmatic by separating:

- default path
- supported alternatives
- escape hatches

Docs should say:

- "Use this path by default."
- "Use this alternative when you need this specific tradeoff."
- "This lower-level escape hatch is available, but it changes what you own."

## 4. Example Philosophy

## What Makes Examples Effective

Examples are effective when they answer a real task with minimal noise.

A strong example has:

- realistic domain
- clear file location
- explicit dependencies
- meaningful resource names
- error handling
- verification
- no hidden setup

## Example Sizing

Use three sizes:

- fragment: one API concept
- complete file: one task
- runnable scenario: one workflow across packages

Fragments should not be the main teaching tool for beginner docs.

## Realism

Examples should feel like code a team might keep.

Recommended domains:

- users
- sessions
- reports
- uploads
- billing
- notifications
- monitoring
- cleanup

Avoid random placeholder examples except in API reference where the function itself is the subject.

## Progression

Examples should form a curriculum:

1. route returns JSON
2. controller calls service
3. service uses repository
4. service uses cache
5. service stores a file
6. service publishes event
7. service dispatches job
8. worker handles job
9. scheduler calls domain method
10. metrics and inspects verify behavior

This progression teaches the stack without overwhelming the reader.

## Abstraction Level

Beginner examples should use generated app surfaces.

Reference examples may show primitive packages directly.

Advanced examples may show driver constructors and adapters.

Do not mix all three levels in one first example.

## Readability

Readable examples:

- keep functions short
- use named types
- use obvious constructors
- avoid clever generics unless the feature requires them
- include only imports that matter
- use `context.Context` when crossing runtime boundaries

## Cognitive Density

Each example should teach one new framework idea.

If an example introduces routing, DI, storage, queues, metrics, and Lighthouse in the same block, it should be a full scenario page, not a quickstart.

## Cohesion Across Examples

Use shared naming patterns across pages:

- `UserService`
- `ReportService`
- `UploadService`
- `emails:send`
- `reports:generate`
- `users.created`
- `uploads`
- `assets`
- `cleanup:stale-sessions`

This reduces cognitive load because readers recognize prior concepts.

## Canonical GoForj Example Philosophy

GoForj examples should:

- compile
- be runnable when presented as workflows
- use generated app extension points
- show explicit dependency flow
- use local-first drivers
- keep business logic out of controllers and runtime bootstrap
- name resources operationally
- include verification commands
- include testing guidance where appropriate
- show production driver swaps as configuration/provider changes

## 5. Tone and Writing Style Analysis

## Pacing

Strong docs pace the reader deliberately.

They orient first, then act, then expand.

Recommended GoForj pacing:

1. define the concept in one short paragraph
2. explain when to use it
3. show where it lives
4. show the simplest correct example
5. explain lifecycle or operational behavior
6. show variants and advanced details

## Sentence Structure

Use direct sentences.

Good:

> Register job handlers before the worker starts.

Avoid:

> In order to leverage the extensive capabilities of the worker subsystem, developers may wish to consider registering handlers before execution begins.

## Confidence Level

Docs should make decisions.

Use:

- "Use"
- "Prefer"
- "Register"
- "Keep"
- "Avoid"

Use softer language only for tradeoffs or uncertain future behavior.

## Paragraph Sizing

Short paragraphs create confidence.

Most paragraphs should be one to three sentences. Dense topics should become lists or diagrams.

## Emotional Effect

The reader should feel:

- oriented
- respected
- in control
- aware of tradeoffs
- able to verify behavior

The reader should not feel:

- sold to
- overwhelmed
- forced to trust hidden magic
- unsure which path is official

## How Trust Is Built

Trust comes from:

- commands that work
- examples that compile
- explicit file paths
- clear ownership boundaries
- honest limitations
- production notes
- testing guidance
- consistent terminology

## Communicating Complexity Calmly

When a topic is complex, name the complexity and sequence it.

Good:

> A queue has two separate concerns: dispatching jobs and running workers. Configure the driver first, then register handlers, then start the worker process.

Avoid:

> Queues are easy and powerful.

## Official GoForj Voice

GoForj documentation voice should be:

- calm
- senior
- concise
- explicit
- systems-oriented
- production-aware
- direct

It should avoid:

- hype
- jokes
- excessive enthusiasm
- academic density
- performative cleverness
- vague promises

## 6. Progressive Disclosure Systems

## How Complexity Should Unfold

Each feature should unfold in layers:

1. purpose
2. default generated app usage
3. local runtime behavior
4. configuration
5. production driver or deployment considerations
6. testing
7. extension points
8. internals

This gives beginners a path and gives advanced users depth.

## When Low-Level Details Should Appear

Show low-level details when they affect:

- lifecycle
- security
- data durability
- failure behavior
- performance
- testing
- driver selection
- production operation

Hide low-level details when they are:

- template mechanics
- private helper code
- adapter internals
- implementation accidents
- not needed to complete the task

## Advanced Concepts Build On Earlier Concepts

Examples:

- custom queue drivers require understanding queue contracts
- distributed locks require understanding scheduler overlap behavior
- Lighthouse views require understanding metrics and inspects
- custom providers require understanding default provider wiring
- production deployment requires understanding runtime processes

Docs should not jump directly to advanced concepts.

## Minimize Overwhelm

Use:

- one path first
- short examples
- stable names
- limited option tables
- "Next steps" links
- separate advanced pages

Avoid:

- massive option lists on beginner pages
- driver matrices before basic usage
- reference tables as onboarding
- all-in-one full-stack examples as the first example

## GoForj Progressive Disclosure Recommendations

For every major subsystem:

- Start with generated App usage.
- Show local-first default.
- Show one verification command.
- Add production notes after the first working example.
- Move primitive driver matrices to Libraries or decision pages.
- Move custom provider wiring to advanced pages.
- Link to operations pages for long-running processes.

## 7. Documentation Anti-Patterns

## Confusion Patterns

Avoid:

- pages that start with exhaustive API lists
- examples without file locations
- concepts introduced under multiple names
- feature pages with no lifecycle explanation
- command examples with no expected result
- advanced customization before basic usage

## Abstraction Drift

Avoid broadening terms until they lose meaning.

Examples:

- "provider" should not mean any plugin
- "driver" should not mean any dependency
- "service" should not mean every struct
- "runtime" should not mean the repository
- "inspect" should not be renamed for style

## Inconsistent Terminology

Create review gates for terminology.

Every new page should be checked against `terminology.md`.

## Multiple Competing Architectures

Do not show these as equal defaults:

- handler-only apps and controller-service apps
- driver imports in business services and provider-selected drivers
- anonymous scheduler callbacks and named domain methods
- events as durable background work and jobs as durable background work
- runtime bootstrap as business logic and services as business logic

## Onboarding Friction

Avoid:

- requiring distributed infrastructure to start
- requiring framework internals to build a first route
- requiring package README archaeology
- requiring users to infer generated extension points

## Implementation Leakage

Avoid exposing:

- template internals in beginner docs
- underlying HTTP engine details in normal app docs
- private generated helper names
- internal metric implementation details before metric semantics

## Reference-Heavy Beginner Experiences

Reference is useful after orientation.

Do not make the first queue page a driver table. Do not make the first storage page a backend matrix. Do not make the first DI page a Wire internals page.

## Enterprise Overengineering

Avoid teaching architecture that adds layers without solving a GoForj problem.

Use services, repositories, providers, and runtime boundaries when they clarify ownership. Do not add patterns for their own sake.

## Fragmented Mental Models

Docs become fragmented when each subsystem defines its own style.

Prevent this with shared:

- page structures
- examples
- naming conventions
- review checklists
- IA rules

## 8. Long-Term Consistency Systems

## Terminology Governance

Maintain `terminology.md` as a required source of truth.

Review every new page for:

- term reuse
- term collisions
- new terms that need definitions
- accidental ecosystem-specific terminology

Add new terms only when they represent a real GoForj concept.

## Example Governance

Maintain an example registry or example map.

Each example should record:

- page
- files involved
- primary concept
- dependencies
- runnable command
- verification command
- whether it is a fragment or complete scenario

This prevents examples from drifting into inconsistent architectures.

## Style Governance

Use `tone.md` and `docs-style-guide.md` as review gates.

Review for:

- sentence length
- hype
- over-explaining
- passive voice
- missing verification
- missing next step
- implementation details too early

## Architecture Review Systems

Every new major docs page should answer:

- What generated app location does this use?
- What runtime boundary does this touch?
- What dependencies are injected?
- What driver or provider choices exist?
- What local-first path exists?
- What production behavior matters?
- What should be tested?
- What should be observable?

## Cross-Page Consistency Systems

Use recurring page sections:

- Overview
- When To Use It
- Where It Lives
- Golden Path
- Configuration
- Testing
- Operations
- Advanced Usage
- Common Mistakes
- Next Steps

Not every page needs every section, but major feature pages should feel structurally related.

## Documentation Review Checklists

Create checklists for:

- concept pages
- task pages
- reference pages
- examples
- driver decision pages
- operations pages
- AI-generated drafts

These should live in `ai` and be used before publishing.

## Drift Prevention Systems

Drift prevention should be active, not aspirational.

Recommended systems:

- compile runnable examples in CI where feasible
- keep generated app examples synchronized with templates
- run link checks
- review docs alongside template changes
- require terminology review for new concepts
- require operations notes for long-running runtimes
- keep driver matrices in one canonical location per primitive, usually the Library page
- avoid duplicating reference tables across many pages

## Recommended Additions For GoForj

The current `ai` foundation is strong. To make it more operational, add these next:

1. `information-architecture.md`
   - Canonical public docs sitemap, navigation rules, page grouping, and conceptual dependency order.

2. `page-templates.md`
   - Concrete templates for concept pages, task pages, feature pages, operations pages, driver decision pages, and reference pages.

3. `review-checklists.md`
   - Publish-ready checklists for terminology, architecture, examples, operations, and AI-generated docs.

4. `example-registry.md`
   - A controlled list of canonical example domains, resource names, file locations, runnable commands, and progression paths.

5. `operations-docs-model.md`
   - Specific rules for documenting workers, schedulers, metrics, inspects, health, readiness, logs, Lighthouse, and degraded subsystems.

6. `driver-decision-model.md`
   - A repeatable structure for choosing cache, storage, queue, event, and database drivers without pushing driver matrices into beginner guides.

7. `ai-docs-workflow.md`
   - Instructions for future Codex sessions: what to read first, how to draft, how to verify examples, and how to prevent framework behavior invention.

8. `docs-roadmap.md`
   - Sequenced public docs buildout: first 10 pages, first example scenarios, reference consolidation, and operations docs.

## Immediate GoForj Recommendations

Prioritize these public docs first:

1. Quickstart
2. Project structure
3. Configuration
4. Runtime lifecycle
5. Dependency injection
6. HTTP services
7. Controllers and services
8. Queues and jobs
9. Events versus queues
10. Scheduler
11. Cache patterns
12. Storage patterns
13. Testing
14. Metrics and inspects
15. Workers and schedulers in production

This sequence builds the mental model before deep reference.
