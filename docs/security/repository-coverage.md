---
title: Repository Coverage
description: Every repository included in the GoForj security assurance baseline, its control profile, and links to current evidence.
---

# Repository Coverage

This generated matrix declares the complete GoForj security assurance scope reviewed on **September 8, 2026**. Change the authoritative `.vitepress/data/security-coverage.json` manifest, then run `npm run security:refresh` to update this page.

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
| [goforj](https://github.com/goforj/goforj) | Framework, generator, and application templates | Framework and generated assets | [Actions](https://github.com/goforj/goforj/actions?query=branch%3Amain), [Dependabot](https://github.com/goforj/goforj/security/dependabot), [Code scanning](https://github.com/goforj/goforj/security/code-scanning) |
| [docs](https://github.com/goforj/docs) | Documentation frontend and Go backend | Go and npm application | [Actions](https://github.com/goforj/docs/actions?query=branch%3Amain), [Dependabot](https://github.com/goforj/docs/security/dependabot), [Code scanning](https://github.com/goforj/docs/security/code-scanning) |
| [atlas](https://github.com/goforj/atlas) | Documentation indexing and generation | Go source | [Actions](https://github.com/goforj/atlas/actions?query=branch%3Amain), [Dependabot](https://github.com/goforj/atlas/security/dependabot), [Code scanning](https://github.com/goforj/atlas/security/code-scanning) |
| [cache](https://github.com/goforj/cache) | Cache contracts and drivers | Go source | [Actions](https://github.com/goforj/cache/actions?query=branch%3Amain), [Dependabot](https://github.com/goforj/cache/security/dependabot), [Code scanning](https://github.com/goforj/cache/security/code-scanning) |
| [collection](https://github.com/goforj/collection) | Collection helpers | Go source | [Actions](https://github.com/goforj/collection/actions?query=branch%3Amain), [Dependabot](https://github.com/goforj/collection/security/dependabot), [Code scanning](https://github.com/goforj/collection/security/code-scanning) |
| [console](https://github.com/goforj/console) | Console output | Go source | [Actions](https://github.com/goforj/console/actions?query=branch%3Amain), [Dependabot](https://github.com/goforj/console/security/dependabot), [Code scanning](https://github.com/goforj/console/security/code-scanning) |
| [crypt](https://github.com/goforj/crypt) | Encryption helpers | Go source | [Actions](https://github.com/goforj/crypt/actions?query=branch%3Amain), [Dependabot](https://github.com/goforj/crypt/security/dependabot), [Code scanning](https://github.com/goforj/crypt/security/code-scanning) |
| [env](https://github.com/goforj/env) | Environment loading | Go source | [Actions](https://github.com/goforj/env/actions?query=branch%3Amain), [Dependabot](https://github.com/goforj/env/security/dependabot), [Code scanning](https://github.com/goforj/env/security/code-scanning) |
| [events](https://github.com/goforj/events) | Event contracts and drivers | Go source | [Actions](https://github.com/goforj/events/actions?query=branch%3Amain), [Dependabot](https://github.com/goforj/events/security/dependabot), [Code scanning](https://github.com/goforj/events/security/code-scanning) |
| [execx](https://github.com/goforj/execx) | Process execution | Go source | [Actions](https://github.com/goforj/execx/actions?query=branch%3Amain), [Dependabot](https://github.com/goforj/execx/security/dependabot), [Code scanning](https://github.com/goforj/execx/security/code-scanning) |
| [godump](https://github.com/goforj/godump) | Debug value inspection | Go source | [Actions](https://github.com/goforj/godump/actions?query=branch%3Amain), [Dependabot](https://github.com/goforj/godump/security/dependabot), [Code scanning](https://github.com/goforj/godump/security/code-scanning) |
| [httpx](https://github.com/goforj/httpx) | Outbound HTTP requests | Go source | [Actions](https://github.com/goforj/httpx/actions?query=branch%3Amain), [Dependabot](https://github.com/goforj/httpx/security/dependabot), [Code scanning](https://github.com/goforj/httpx/security/code-scanning) |
| [mail](https://github.com/goforj/mail) | Mail contracts and drivers | Go source | [Actions](https://github.com/goforj/mail/actions?query=branch%3Amain), [Dependabot](https://github.com/goforj/mail/security/dependabot), [Code scanning](https://github.com/goforj/mail/security/code-scanning) |
| [metrics](https://github.com/goforj/metrics) | Metrics contracts | Go source | [Actions](https://github.com/goforj/metrics/actions?query=branch%3Amain), [Dependabot](https://github.com/goforj/metrics/security/dependabot), [Code scanning](https://github.com/goforj/metrics/security/code-scanning) |
| [null](https://github.com/goforj/null) | Nullable value types | Go source | [Actions](https://github.com/goforj/null/actions?query=branch%3Amain), [Dependabot](https://github.com/goforj/null/security/dependabot), [Code scanning](https://github.com/goforj/null/security/code-scanning) |
| [queue](https://github.com/goforj/queue) | Queue contracts and drivers | Go source | [Actions](https://github.com/goforj/queue/actions?query=branch%3Amain), [Dependabot](https://github.com/goforj/queue/security/dependabot), [Code scanning](https://github.com/goforj/queue/security/code-scanning) |
| [scheduler](https://github.com/goforj/scheduler) | Scheduled task execution | Go source | [Actions](https://github.com/goforj/scheduler/actions?query=branch%3Amain), [Dependabot](https://github.com/goforj/scheduler/security/dependabot), [Code scanning](https://github.com/goforj/scheduler/security/code-scanning) |
| [storage](https://github.com/goforj/storage) | Storage contracts and drivers | Go source | [Actions](https://github.com/goforj/storage/actions?query=branch%3Amain), [Dependabot](https://github.com/goforj/storage/security/dependabot), [Code scanning](https://github.com/goforj/storage/security/code-scanning) |
| [str](https://github.com/goforj/str) | String helpers | Go source | [Actions](https://github.com/goforj/str/actions?query=branch%3Amain), [Dependabot](https://github.com/goforj/str/security/dependabot), [Code scanning](https://github.com/goforj/str/security/code-scanning) |
| [web](https://github.com/goforj/web) | HTTP contracts, middleware, and adapters | Go source | [Actions](https://github.com/goforj/web/actions?query=branch%3Amain), [Dependabot](https://github.com/goforj/web/security/dependabot), [Code scanning](https://github.com/goforj/web/security/code-scanning) |
| [wire](https://github.com/goforj/wire) | Compile-time dependency injection | Go source | [Actions](https://github.com/goforj/wire/actions?query=branch%3Amain), [Dependabot](https://github.com/goforj/wire/security/dependabot), [Code scanning](https://github.com/goforj/wire/security/code-scanning) |

## Coverage Maintenance

The generator rejects missing, duplicate, or unknown repositories. Repository workflows independently discover manifests so module-level coverage does not depend on this documentation list.

When the ecosystem scope changes, update the manifest, the generator's expected repository set, and the relevant repository controls in the same reviewed change.
