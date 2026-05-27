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

Marketing pages explain where GoForj fits, what problems it solves, and which tradeoffs shaped the product.

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
- Starter Kits

Showcase pages may be more visual than normal docs pages, but they should still feel engineering-first. They should be precise, calm, and grounded in real framework behavior.

Good showcase pages:

- tell one product story at a time
- explain the operational value of the capability
- use visuals to clarify systems, not decorate them
- link to the relevant docs path after the concept is understood
- avoid unsupported claims, hype language, and vague comparisons

## Starter Kits Showcase

Starter Kits is a top-level product surface, not only a getting-started docs page.

The public showcase page should feel like a marketing/product page built inside VitePress:

- full-width layout, not constrained to the normal documentation column
- strong real-product screenshots from generated Apps
- screenshots copied into `docs/assets/starter-kits/` with descriptive names
- large product headlines without terminal periods
- concise body copy that explains generated ownership and practical value
- direct calls to create an App and read the starter kit docs
- no image captions unless the caption adds information the surrounding copy cannot carry
- no placeholder, planned, or "coming soon" cards in the public surface

The showcase page should sell the experience of starting from source that already has shape: auth surfaces, settings screens, dashboard structure, component references, backend integration points, and frontend patterns that live in the user's App.

The docs page should stay separate at `getting-started/starter-kits.md`. It should explain what is generated, what the App owns, which components are optional, and how to adapt or remove the generated code. Do not make the docs page carry the visual marketing burden.

For animated screenshot stacks, prefer a real Vue component registered in the VitePress theme over raw Markdown/CSS tricks. If animation does not appear in dev, debug component mount, selector matching, reduced-motion state, and browser-applied transforms before adding more CSS.

## Blog

The blog may live inside VitePress while it remains lightweight and file-based.

The blog index should feel like a real publication surface, not a page explaining what a blog is. Feature published posts. Do not show planned or placeholder posts publicly.

Good early post categories:

- release notes with migration guidance
- design notes explaining framework decisions
- operational patterns for Go services
- local-first development workflows
- deep dives into specific GoForj systems

A blog should not be added just to create an empty content surface. If the blog becomes a major acquisition or publishing channel, reconsider whether VitePress is still the best platform for that surface.

Do not show planned or placeholder posts on the public blog index. Empty future-topic cards make the site feel unfinished. Keep topic ideas in internal planning notes until a post is real enough to publish.

Current internal topic backlog:

- Lighthouse and operational visibility: inspections, health, metrics, runtime state, and operator-facing confidence without hiding production behavior.
- Runtime topology for local and production systems: standalone binaries, distributed runtime commands, `forj build --auto-run`, and the relationship between local development and process boundaries.
- Migration strategy across database dialects: raw SQL, dialect variants, translation, validation, and testcontainer-backed correctness checks for multi-dialect teams.

The visual card treatment used for future-topic cards can be reused later for real posts, series landing pages, or related-post blocks. Do not expose it as "planned" content.

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
