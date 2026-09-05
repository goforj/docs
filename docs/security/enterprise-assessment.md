---
title: Enterprise Assessment
description: A practical evidence checklist for evaluating GoForj and separating ecosystem controls from deployment responsibilities.
---

# Enterprise Assessment

An enterprise review should evaluate both the GoForj source baseline and the system your organization builds with it. GoForj can provide evidence for the first boundary. Your application and platform teams own the second.

## Start with the Adoption Scope

List the exact GoForj repositories and versions the application uses. Compare them with [Repository Coverage](/security/repository-coverage), then retain the dependency graph or SBOM produced for the reviewed revision.

For Apps created by GoForj, include the framework version, selected first-party libraries and drivers, starter kit, generated source committed to the application, and any application-owned modifications.

## Assessed Repository Estate

The baseline covers all 21 repositories below. The grouping makes the reviewed security boundaries visible, while [Repository Coverage](/security/repository-coverage) maps each repository to its exact control profile and current evidence.

<!-- security-coverage:assessment:start -->
<!-- This section is generated from .vitepress/data/security-coverage.json. -->

| Reviewed Area | Primary Security Focus | Repositories |
| --- | --- | --- |
| Framework and applications | Generation, templates, application dependencies, and workflow examples | [goforj](https://github.com/goforj/goforj), [docs](https://github.com/goforj/docs) |
| Data and workflows | Drivers, remote services, credentials, retries, and distributed coordination | [cache](https://github.com/goforj/cache), [events](https://github.com/goforj/events), [metrics](https://github.com/goforj/metrics), [queue](https://github.com/goforj/queue), [scheduler](https://github.com/goforj/scheduler), [storage](https://github.com/goforj/storage) |
| Network and process boundaries | HTTP behavior, redirects, headers, command execution, mail, and transport security | [execx](https://github.com/goforj/execx), [httpx](https://github.com/goforj/httpx), [mail](https://github.com/goforj/mail), [web](https://github.com/goforj/web) |
| Configuration and sensitive values | Encryption, environment secrets, serialization, and safe defaults | [crypt](https://github.com/goforj/crypt), [env](https://github.com/goforj/env), [null](https://github.com/goforj/null) |
| Generation and developer tooling | Remote repository input, generated code, terminal output, diagnostics, and helper behavior | [atlas](https://github.com/goforj/atlas), [collection](https://github.com/goforj/collection), [console](https://github.com/goforj/console), [godump](https://github.com/goforj/godump), [str](https://github.com/goforj/str), [wire](https://github.com/goforj/wire) |

<!-- security-coverage:assessment:end -->

## Evidence Checklist

| Assessment Area | GoForj Evidence | Enterprise Evidence |
| --- | --- | --- |
| Source governance | Public source, pull requests, immutable workflow references, and repository history | Approved source intake, ownership, change control, and internal review records |
| Static analysis | CodeQL findings for enrolled repositories plus vet and repository-specific checks | Analysis of application-owned code and organization-specific rules |
| Dependency risk | govulncheck, npm audit, Dependency Review, Dependabot, and documented exact exceptions | Approved versions, internal advisory feeds, remediation policy, and patch deployment records |
| Inventory | Validated CycloneDX CI SBOMs for discovered manifests | Application and release SBOM retention, signing, and asset inventory |
| Secrets | Full-history Gitleaks scanning | Secrets manager, rotation, access review, and production leak detection |
| Runtime security | Hardened framework behavior and [Production Hardening](/security/production-hardening) guidance | Network policy, identity, authorization, encryption, logging, backups, and operator controls |
| Incident response | Private reporting policy and coordinated disclosure process | Internal triage, escalation, notification, forensics, recovery, and exercise evidence |
| Release integrity | Tagged public source and CI results | Approved build system, artifact signing, provenance, promotion, and rollback controls |

## Questions the Baseline Can Answer

- Which GoForj repositories are included?
- Which automated controls run against each repository?
- Does scanning discover nested modules and lockfiles?
- What evidence does each control produce?
- What limitations and unresolved upstream exceptions are documented?
- Which compatibility changes were necessary to select fixed dependencies?

## Questions the Adopting Enterprise Must Answer

- Which source revision and generated output were approved?
- Who can change dependencies, workflows, branch rules, and releases?
- Where are application secrets stored and how are they rotated?
- Which routes, diagnostics, metrics, databases, queues, caches, and storage systems are network-accessible?
- How are identity, authorization, tenant isolation, audit retention, and data classification implemented?
- How are build artifacts signed, promoted, deployed, rolled back, and retained?
- How quickly must dependency and application findings be remediated?
- How is incident response tested?

## Suggested Review Package

Provide reviewers with:

1. This [Security Assurance](/security/assurance) entry point.
2. The [control definitions and limits](/security/controls).
3. The [repository coverage matrix](/security/repository-coverage) filtered to adopted components.
4. The application dependency graph and retained SBOMs.
5. Links or exports for the latest successful required workflows and open security findings.
6. The application's threat model, data-flow diagram, deployment architecture, and production hardening record.
7. The enterprise exception register and remediation owners.

## Interpreting the Result

A green workflow is evidence that a defined check passed for one revision. It is not an enterprise approval by itself. Approval should combine this evidence with the application's architecture, deployment controls, data sensitivity, and the enterprise's own risk criteria.
