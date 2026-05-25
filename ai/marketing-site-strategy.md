# Marketing Site Strategy

## Purpose

This file captures the current operating model for GoForj's broader public site: documentation, product positioning, showcase pages, and future publishing surfaces.

It is not user-facing copy. It exists to keep future site work coherent as GoForj grows beyond reference documentation.

## Current Direction

Use VitePress as the unified public site until the marketing surface clearly exceeds what custom VitePress layouts can support.

VitePress should own:

- documentation
- homepage
- library pages
- product showcase pages
- lightweight blog or news posts
- version policy and release-facing documentation

This keeps the site cohesive, searchable, fast to iterate on, and close to the docs system while GoForj is still establishing its public documentation identity.

## Content Roles

Docs teach how GoForj works.

Marketing pages explain why GoForj matters.

Showcase pages demonstrate one product capability with a focused narrative, strong visuals, and precise technical grounding.

Blog posts explain releases, design decisions, operational patterns, and framework philosophy over time.

These roles should not collapse into each other. A docs page should not become a sales page. A showcase page should not pretend to be API reference.

## Showcase Pages

Use custom Vue components inside VitePress for product-story pages such as:

- Lighthouse
- `forj dev`
- local-first drivers
- runtime observability
- generated App topology
- driver swappability

Showcase pages may be more visual than normal docs pages, but they should still feel engineering-first. They should be precise, calm, and grounded in real framework behavior.

Good showcase pages:

- tell one product story at a time
- explain the operational value of the capability
- use visuals to clarify systems, not decorate them
- link to the relevant docs path after the concept is understood
- avoid unsupported claims, hype language, and vague comparisons

## Blog

Add a blog only when there are several strong posts ready and a realistic publishing cadence exists.

Good early post categories:

- release notes with migration guidance
- design notes explaining framework decisions
- operational patterns for Go services
- local-first development workflows
- deep dives into specific GoForj systems

A blog should not be added just to create an empty content surface. If the blog becomes a major acquisition or publishing channel, reconsider whether VitePress is still the best platform for that surface.

## When To Stay With VitePress

Stay with VitePress while the main needs are:

- cohesive docs and product messaging
- custom static product pages
- Markdown-driven content
- simple blog or news posts
- local search across docs and libraries
- low operational complexity

## When To Split

Consider Astro, Nuxt, Next, or a separate marketing app only when VitePress blocks important work.

Signals that a split may be justified:

- CMS-backed publishing becomes necessary
- non-doc contributors need a richer editorial workflow
- the blog needs feeds, tags, authors, drafts, and scheduling beyond simple file-based content
- showcase pages require complex interactive demos or heavier application state
- marketing analytics, personalization, or campaign pages become central
- the public site needs a different deployment or ownership model than the docs

Do not split the site only because a marketing page should look more polished. VitePress can support polished product pages through custom layouts and Vue components.

## Navigation Model

The public site should make four paths clear:

- start building a GoForj App
- explore standalone Libraries
- understand product capabilities
- read deeper framework reference

Future showcase or marketing sections should support those paths rather than compete with them.

Suggested top-level surfaces over time:

- Home
- Getting Started
- Core Concepts
- Applications
- Operations
- Libraries
- Showcase
- Blog
- Reference

Add `Showcase` and `Blog` only when there is enough content to justify them.

## Decision Summary

The current default is a unified VitePress site with custom showcase pages as needed.

The site should graduate to a separate marketing stack only when content workflow, interactivity, or organizational needs create real pressure. Until then, keeping docs, libraries, product story, and lightweight publishing in one system is the simpler and more coherent choice.
