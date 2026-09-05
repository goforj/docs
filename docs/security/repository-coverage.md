---
title: Repository Coverage
description: Every repository included in the GoForj security assurance baseline, its control profile, and links to current evidence.
---

# Repository Coverage

This generated matrix declares the complete GoForj security assurance scope reviewed on **September 5, 2026**. Change the authoritative `.vitepress/data/security-coverage.json` manifest, then run `npm run security:refresh` to update this page.

::: info Reading the matrix
A baseline is active only when its configuration is present on the repository default branch. Follow the Evidence link to inspect current runs and artifacts.
:::

## Control Profiles

| Profile | Controls |
| --- | --- |
| Go source | CodeQL, govulncheck, Dependency Review, full-history Gitleaks, CycloneDX SBOMs, Dependabot, and immutable actions |
| Go and npm application | Go source baseline plus npm audit, npm SBOM coverage, and npm dependency updates |
| Framework and generated assets | Go and npm application baseline plus generated asset inventory and container policy checks |

## Included Repositories

| Repository | Role | Baseline | Evidence |
| --- | --- | --- | --- |
| [goforj](https://github.com/goforj/goforj) | Framework, generator, and application templates | Framework and generated assets | [Actions](https://github.com/goforj/goforj/actions) |
| [docs](https://github.com/goforj/docs) | Documentation frontend and Go backend | Go and npm application | [Actions](https://github.com/goforj/docs/actions) |
| [atlas](https://github.com/goforj/atlas) | Documentation indexing and generation | Go source | [Actions](https://github.com/goforj/atlas/actions) |
| [cache](https://github.com/goforj/cache) | Cache contracts and drivers | Go source | [Actions](https://github.com/goforj/cache/actions) |
| [collection](https://github.com/goforj/collection) | Collection helpers | Go source | [Actions](https://github.com/goforj/collection/actions) |
| [console](https://github.com/goforj/console) | Console output | Go source | [Actions](https://github.com/goforj/console/actions) |
| [crypt](https://github.com/goforj/crypt) | Encryption helpers | Go source | [Actions](https://github.com/goforj/crypt/actions) |
| [env](https://github.com/goforj/env) | Environment loading | Go source | [Actions](https://github.com/goforj/env/actions) |
| [events](https://github.com/goforj/events) | Event contracts and drivers | Go source | [Actions](https://github.com/goforj/events/actions) |
| [execx](https://github.com/goforj/execx) | Process execution | Go source | [Actions](https://github.com/goforj/execx/actions) |
| [godump](https://github.com/goforj/godump) | Debug value inspection | Go source | [Actions](https://github.com/goforj/godump/actions) |
| [httpx](https://github.com/goforj/httpx) | Outbound HTTP requests | Go source | [Actions](https://github.com/goforj/httpx/actions) |
| [mail](https://github.com/goforj/mail) | Mail contracts and drivers | Go source | [Actions](https://github.com/goforj/mail/actions) |
| [metrics](https://github.com/goforj/metrics) | Metrics contracts | Go source | [Actions](https://github.com/goforj/metrics/actions) |
| [null](https://github.com/goforj/null) | Nullable value types | Go source | [Actions](https://github.com/goforj/null/actions) |
| [queue](https://github.com/goforj/queue) | Queue contracts and drivers | Go source | [Actions](https://github.com/goforj/queue/actions) |
| [scheduler](https://github.com/goforj/scheduler) | Scheduled task execution | Go source | [Actions](https://github.com/goforj/scheduler/actions) |
| [storage](https://github.com/goforj/storage) | Storage contracts and drivers | Go source | [Actions](https://github.com/goforj/storage/actions) |
| [str](https://github.com/goforj/str) | String helpers | Go source | [Actions](https://github.com/goforj/str/actions) |
| [web](https://github.com/goforj/web) | HTTP contracts, middleware, and adapters | Go source | [Actions](https://github.com/goforj/web/actions) |
| [wire](https://github.com/goforj/wire) | Compile-time dependency injection | Go source | [Actions](https://github.com/goforj/wire/actions) |

## Coverage Maintenance

The generator rejects missing, duplicate, or unknown repositories. Repository workflows independently discover manifests so module-level coverage does not depend on this documentation list.

When the ecosystem scope changes, update the manifest, the generator's expected repository set, and the relevant repository controls in the same reviewed change.
