---
title: The composable stack for building with Go
date: 2026-05-26
description: Why GoForj exists, what kind of Go applications it is designed for, and how its framework and libraries fit together.
sidebar: false
aside: false
noAutoTitle: true
---

<article class="gf-blog-post">
  <header class="gf-blog-topbar">
    <div>
      <a href="/blog/">Blog</a>
      <span>/</span>
      <strong>Framework</strong>
    </div>
    <a href="/blog/">All Posts</a>
  </header>

  <div class="gf-blog-visual gf-blog-visual--post" aria-hidden="true">
    <span class="gf-blog-visual__grid"></span>
    <span class="gf-blog-visual__slab"></span>
    <span class="gf-blog-visual__block gf-blog-visual__block--a"></span>
    <span class="gf-blog-visual__block gf-blog-visual__block--b"></span>
    <span class="gf-blog-visual__block gf-blog-visual__block--c"></span>
    <span class="gf-blog-visual__line gf-blog-visual__line--a"></span>
    <span class="gf-blog-visual__line gf-blog-visual__line--b"></span>
  </div>

  <h1>The composable stack for building with Go</h1>

  <div class="gf-blog-post-grid">
    <aside class="gf-blog-post-meta" aria-label="Article metadata">
      <span>Chris Miles</span>
      <span>May 26, 2026</span>
      <span>Framework</span>
      <span>7 min read</span>
    </aside>

GoForj is a composable application stack for Go.

GoForj is not trying to replace Go, hide Go, or turn Go into a dynamic framework language. It exists because many production Go applications eventually need the same set of application primitives: HTTP, commands, queues, jobs, events, scheduling, storage, cache, configuration, metrics, inspections, and operational lifecycle behavior.

Teams can build those pieces themselves. The cost shows up later, when each service has a slightly different shape, local development does not match production behavior, infrastructure decisions leak into business logic, and onboarding requires reading several unrelated internal patterns before a developer can safely ship a change.

Over the last decade, many Go systems optimized hard for infrastructure flexibility and small independent services. That gave teams deployment options, but it often pushed application cohesion, local ergonomics, and operational consistency back onto every product team.

GoForj is designed to make those concerns work as one application system while preserving Go's strengths: explicit code, readable control flow, compiled binaries, small interfaces, and operational clarity.

The operating principle is simple: swap drivers, not business logic.

## Why I Built It

I built GoForj because it is the dream stack I wanted for building my own CLIs, applications, and everything in between.

I LOVE building in Go. I liked how direct the code felt, how simple deployment could be, and how production services could stay understandable for a long time. But I got tired of wiring the same plumbing, scaffolding the same structure, and copy-pasting the same application glue every time a project needed queues, mail, scheduling, storage, cache, commands, or a solid local development loop.

I kept missing the feeling I had in ecosystems like Laravel, where those pieces felt like parts of one application instead of separate decisions to reassemble every time.

I did not want to bring dynamic-language magic into Go. I wanted the full-stack application experience I missed, but built out of things that still felt like Go: explicit wiring, compiled binaries, small interfaces, readable control flow, and clear production behavior.

GoForj is the stack I always wanted.

## What It Feels Like

A developer should be able to start with a real application, not a skeleton that only becomes useful after the infrastructure is assembled.

```bash
forj new app
forj dev
```

From there, the local system should come alive. The app can serve HTTP, dispatch jobs, publish events, run schedules, write to storage, use cache, expose metrics, and give the developer something inspectable while the system is still small.

Later, the same application can move to Redis, object storage, distributed workers, external eventing, or a production database by changing drivers and providers. The service code should not be redesigned because the backing systems changed.

That does not mean every App starts with every GoForj component. During application creation, the owner chooses the surface area they need: CLI commands, Docker support, mail, auth, OAuth, Web API, Web UI, metrics, observability, database dialects, scheduler, jobs, and other framework components. A GoForj App can be a small user-facing CLI, a focused API service, or a larger system with web, workers, schedules, metrics, and storage.

The framework should scale down as well as up. The starting point should match the application being built, and the App can grow by adding components as the system needs them.

## One Application Experience

A GoForj App should be cohesive.

HTTP routes, workers, scheduled tasks, events, cache, storage, and metrics are not separate islands. They are parts of the same application runtime. The framework provides conventions for where code lives, how resources are wired, how runtimes start, and how systems shut down.

The goal is not to create hidden behavior. The goal is to remove incidental glue while keeping the lifecycle visible.

Generated code is part of that model. GoForj uses generation where it makes the application easier to inspect: dependency wiring, runtime hosts, resource managers, and framework integration points. Generated files should make behavior auditable.

## Explicit Wiring, Not Hidden Containers

GoForj favors explicit dependency wiring.

Many application frameworks use runtime containers that resolve dependencies dynamically. That can be convenient, but it also makes behavior harder to reason about when applications grow. GoForj takes a different path: dependencies should be visible, generated wiring should be inspectable, and bad wiring should fail clearly.

In production systems, developers need to know which provider constructed a service, which driver backed a resource, and which runtime owns the lifecycle.

GoForj uses conventions to reduce repetitive setup, but the resulting system should still look like Go.

## Swap Drivers, Not Business Logic

Infrastructure changes. Application behavior should not have to.

A local cache might become Redis. A local queue might become a distributed worker backend. Storage might start on disk and move to object storage. Events might begin in process and later need fan-out through external infrastructure.

Application code should depend on stable framework resources and library interfaces. Drivers and providers adapt those resources to infrastructure.

The framework philosophy is:

- Swap drivers, not business logic.
- Start local, move to distributed infrastructure when needed.
- Keep infrastructure choices explicit and inspectable.

This does not mean all backends are identical. Different systems have different guarantees. GoForj should document those differences clearly instead of hiding them behind vague portability claims.

This is the center of the framework. Local development, production topology, generated wiring, and standalone libraries all support the same idea: infrastructure should be replaceable without forcing the application model to fracture.

## Libraries and Framework Abstractions

GoForj libraries are useful on their own.

A team can use `queue`, `events`, `storage`, `cache`, `web`, `mail`, or another first-party package in an existing Go project without adopting the full framework. The libraries should stand as clean Go packages with their own APIs, examples, tests, and documentation.

Inside a GoForj App, those same libraries can sit underneath framework abstractions. The framework gives them a shared application structure, generated wiring, configuration, lifecycle behavior, and operational surface.

Both paths are valid:

- Use a library directly when you need one focused package.
- Use a GoForj App when you want the cohesive runtime and conventions around the full application.

If you only need one package, start with its library page. If you are building a full App, use the framework guides for configuration, wiring, lifecycle behavior, and runtime integration.

## Local First, Production Ready

GoForj starts local because serious applications are still shaped locally first.

A developer should be able to build the real application before the production topology exists. HTTP, cache, queues, jobs, events, schedules, storage, mail, metrics, and inspections should all have a useful local path. The app should dispatch work, publish events, write files, cache values, execute schedules, and expose operational state without requiring a cloud account or a pile of external services on day one.

That is the difference between local mocks and local infrastructure. GoForj is not trying to fake the application during development. It is trying to give the application real local backing systems with the same framework shape it will use later.

When the application is ready for production, the same code should move to stronger infrastructure through drivers and providers. A local cache can become Redis. Local queue execution can become worker-backed processing. Local storage can move to object storage. In-process events can move to distributed eventing. SQLite or local database setup can move to the production database. The business logic should not be rewritten because the infrastructure changed.

A GoForj App can also run multiple enabled runtimes together for simple deployment, or expose explicit runtime commands when a team wants separate processes. The same application model supports both local development and production topology decisions.

## What GoForj Optimizes For

GoForj optimizes for developer experience without giving up production clarity.

The framework should feel simple to start, ergonomic to use every day, and predictable when the application grows. That means strong conventions, copy-pasteable examples, clear command behavior, generated wiring that can be inspected, and a project structure that makes ownership obvious.

Simplicity should not come from hiding behavior. A developer should know where code belongs, how dependencies are wired, what starts when the app runs, how shutdown works, and what infrastructure backs each resource. The happy path should be small, but the system should remain auditable.

Confidence also comes from the libraries themselves. GoForj libraries are tested as building blocks, not just as public APIs. Core behavior is covered heavily by unit tests, and packages with infrastructure drivers use integration test suites against real backends through containers. Queue, cache, storage, event, mail, and database behavior should be validated against the systems they claim to support.

App owners should be able to trust the primitives underneath their applications. A driver should not only compile. It should prove its behavior against the backend it represents. A library should not only expose a convenient API. It should carry enough test coverage and integration coverage that teams can build on it without treating every framework boundary as unknown risk.

The result should be a Go-native application stack that is approachable, explicit, composable, heavily tested, and cohesive enough to support real production systems without making teams assemble the same foundation again in every service.

## Where to Start

If you want to build a full GoForj App, start with [Getting Started](/getting-started/).

If you want to adopt one package in an existing Go project, start with [Libraries](/libraries/).

If you want the framework mental model first, read [What is GoForj?](/about).

GoForj is built around the idea that production Go applications should feel cohesive without becoming opaque, and powerful without requiring teams to rebuild the same operational foundation in every service.

The goal is not to hide Go. The goal is to make building complete Go applications feel intentional.

  </div>
</article>
