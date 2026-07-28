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

GoForj helps developers build complete Go applications without assembling the same foundation for every project.

GoForj is not trying to replace Go, hide Go, or turn Go into a dynamic framework language. It exists because production applications repeatedly need HTTP routes, commands, queue workers, events, schedules, storage, cache, configuration, metrics, inspections, and reliable startup and shutdown.

Teams can build those pieces themselves. The cost shows up later, when each service wires them differently, local development does not match production, infrastructure decisions leak into business logic, and a new developer must learn several internal conventions before safely shipping a change.

Over the last decade, many Go systems optimized hard for infrastructure flexibility and small independent services. That gave teams deployment options, but it often pushed application cohesion, local ergonomics, and operational consistency back onto every product team.

GoForj gives those concerns one project structure, configuration path, dependency graph, and set of commands while preserving Go's strengths: explicit code, readable control flow, compiled binaries, small interfaces, and operational clarity.

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
forj new
forj dev
```

From there, the app can serve HTTP, dispatch jobs, publish events, run schedules, write files, cache values, expose metrics, and record executions for inspection.

Later, the same application can move to Redis, object storage, distributed workers, external eventing, or a production database by changing drivers and providers. The service code should not be redesigned because the backing systems changed.

That does not mean every app starts with every GoForj component. During project creation, the owner chooses CLI commands, Docker support, mail, auth, OAuth, an HTTP API, a web UI, metrics, database drivers, schedules, jobs, and other needed capabilities. The result can be a small user-facing CLI, a focused API service, or a larger product with web pages, workers, schedules, metrics, and storage.

The framework should scale down as well as up. The starting project should match what is being built, and the app can add capabilities as requirements grow.

## One Application Experience

A GoForj app should feel like one application.

HTTP routes, workers, scheduled tasks, events, cache, storage, and metrics are not separate islands. The framework defines where their code lives, how their dependencies are wired, which processes start, and how those processes shut down.

The goal is not to create hidden behavior. The goal is to remove incidental glue while keeping the lifecycle visible.

GoForj generates repetitive integration code where ownership and inspection matter: dependency wiring, runtime hosts, cache and storage managers, and framework registration. Those files are ordinary Go so developers can audit how the application works.

## Explicit Wiring, Not Hidden Containers

GoForj favors explicit dependency wiring.

Many application frameworks use runtime containers that resolve dependencies dynamically. That can be convenient, but it also makes behavior harder to reason about when applications grow. GoForj takes a different path: dependencies should be visible, generated wiring should be inspectable, and bad wiring should fail clearly.

In production systems, developers need to know which provider constructed a service, which driver backs its cache or queue, and which process starts and stops it.

GoForj uses conventions to reduce repetitive setup, but the resulting system should still look like Go.

## Swap Drivers, Not Business Logic

Infrastructure changes. Application behavior should not have to.

A local cache might become Redis. A local queue might become a distributed worker backend. Storage might start on disk and move to object storage. Events might begin in process and later need fan-out through external infrastructure.

Application code should depend on stable interfaces for cache, queues, storage, mail, and events. Drivers and providers connect those interfaces to infrastructure.

The framework philosophy is:

- Swap drivers, not business logic.
- Start local, move to distributed infrastructure when needed.
- Keep infrastructure choices explicit and inspectable.

This does not mean all backends are identical. Different systems have different guarantees. GoForj should document those differences clearly instead of hiding them behind vague portability claims.

This is the center of the framework. Local development, production processes, dependency wiring, and standalone libraries all support the same idea: infrastructure should be replaceable without forcing service code to change.

## Libraries and Framework Abstractions

GoForj libraries are useful on their own.

A team can use `queue`, `events`, `storage`, `cache`, `web`, `mail`, or another first-party package in an existing Go project without adopting the full framework. The libraries should stand as clean Go packages with their own APIs, examples, tests, and documentation.

Inside a GoForj app, those same libraries use the project's configuration, Wire graph, startup and shutdown hooks, logs, metrics, and inspects.

Both paths are valid:

- Use a library directly when you need one focused package.
- Use the GoForj framework when you want one set of conventions for the full application.

If you only need one package, start with its library page. If you are building a full app, use the framework guides for configuration, wiring, startup, shutdown, and process commands.

## Local First, Production Ready

GoForj starts local because developers need to run the real application before production infrastructure is ready.

A developer should be able to build the real application before the production topology exists. HTTP, cache, queues, jobs, events, schedules, storage, mail, metrics, and inspections should all have a useful local path. The app should dispatch work, publish events, write files, cache values, execute schedules, and expose operational state without requiring a cloud account or a pile of external services on day one.

That is the difference between local mocks and local infrastructure. GoForj is not trying to fake the application during development. It supplies working local backends behind the same cache, queue, storage, event, database, and mail APIs used in production.

When the application is ready for production, the same code should move to stronger infrastructure through drivers and providers. A local cache can become Redis. Local queue execution can become worker-backed processing. Local storage can move to object storage. In-process events can move to distributed eventing. SQLite or local database setup can move to the production database. The business logic should not be rewritten because the infrastructure changed.

An app can run HTTP, workers, and schedules together for a simple deployment, or run them as separate processes when a team needs independent scaling. The same binary supports both choices.

## What GoForj Optimizes For

GoForj optimizes for developer experience without giving up production clarity.

The framework should feel simple to start, ergonomic to use every day, and predictable when the application grows. That means strong conventions, copy-pasteable examples, clear command behavior, generated wiring that can be inspected, and a project structure that makes ownership obvious.

Simplicity should not come from hiding behavior. A developer should know where code belongs, how dependencies are wired, what starts when the app runs, how shutdown works, and what infrastructure backs each resource. The happy path should be small, but the system should remain auditable.

Confidence also comes from the libraries themselves. GoForj libraries are tested as building blocks, not just as public APIs. Core behavior is covered heavily by unit tests, and packages with infrastructure drivers use integration test suites against real backends through containers. Queue, cache, storage, event, mail, and database behavior should be validated against the systems they claim to support.

Application teams should be able to trust the libraries underneath their code. A Redis, Postgres, NATS, or S3 driver should not only compile; its tests should exercise the backend it represents. A library should carry enough unit and integration coverage that teams can use it without revalidating every framework boundary themselves.

The result should be a Go-native way to build applications that is approachable, explicit, heavily tested, and cohesive enough for production without making teams assemble the same foundation in every service.

## Where to Start

If you want to build a full app with GoForj, start with [Getting Started](/getting-started/).

If you want to adopt one package in an existing Go project, start with [Libraries](/libraries/).

If you want the framework mental model first, read [What is GoForj?](/about).

GoForj is built around the idea that production Go applications should feel cohesive without becoming opaque, and powerful without requiring teams to rebuild the same operational foundation in every service.

The goal is not to hide Go. The goal is to make building complete Go applications feel intentional.

  </div>
</article>
