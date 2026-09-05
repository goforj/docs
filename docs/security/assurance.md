---
title: Security Assurance
description: GoForj security scope, automated controls, repository coverage, evidence, limitations, and enterprise review guidance.
---

# Security Assurance

This page is the entry point for reviewing security across the maintained GoForj ecosystem. It connects the controls, repository coverage, vulnerability process, and deployment responsibilities that an enterprise reviewer usually needs.

::: info Evidence is the authority
A control applies to a repository only when its configuration is present on the default branch and its latest required run passes. This documentation explains the baseline, but it does not replace workflow logs, Security tab results, dependency graphs, or released source.
:::

## Scope

The assurance baseline covers the GoForj framework, first-party libraries, documentation application, organization policy repository, and demonstration repository. [Repository Coverage](/security/repository-coverage) lists every included repository and links to its evidence.

## Baseline at a Glance

| Review Question | GoForj Evidence |
| --- | --- |
| Is source analyzed? | Organization-managed CodeQL covers enrolled Go repositories, while normal CI runs tests, vet, race checks, and repository-specific validation. |
| Are vulnerable dependencies detected? | govulncheck scans every discovered Go module. npm audit covers discovered npm lockfiles where applicable. |
| Are dependency changes reviewed before merge? | Dependency Review evaluates pull-request dependency deltas and blocks configured severities. |
| Are committed secrets detected? | Gitleaks scans complete Git history with redacted output. |
| Is dependency inventory available? | CI generates and validates a CycloneDX SBOM for every discovered module or application manifest in scope. |
| Can new manifests be missed? | Dynamic discovery and coverage checks compare repository manifests with scans, SBOMs, and Dependabot configuration. |
| Is workflow code controlled? | Third-party actions use immutable commit references and jobs declare narrow permissions. |
| Are known exceptions visible? | Repositories with unresolved upstream advisories use exact applicability records that reject unexpected or stale entries. |

## What the Baseline Establishes

The controls provide repeatable evidence about the source and dependency state that was actually scanned. They are designed to fail closed when a module cannot be analyzed, an inventory is incomplete, an unexpected vulnerability appears, or generated evidence is malformed.

The baseline also revealed and drove fixes for reachable dependency vulnerabilities, encoded static-path traversal, timeout context safety, backup path and deletion boundaries, private backup permissions, generated service network exposure, and mutable workflow inputs. The controls are useful because findings feed remediation, not because a scanner exists.

## What It Does Not Establish

This baseline is not a certification, penetration test, or guarantee that no vulnerability exists.

- CodeQL and govulncheck cannot prove the absence of application-specific logic flaws.
- Dependency Review evaluates changes in a pull request, not all historical dependency debt.
- Gitleaks is pattern-based and cannot find secrets stored outside Git history.
- CI SBOMs are inventories, not signed release attestations.
- Repository files cannot prove organization administrator settings, branch protection, production access control, or incident-response execution.
- GoForj cannot prove the security of an enterprise deployment, its identity provider, network, secrets platform, data classification, or operator access.

[Security Controls](/security/controls) gives the evidence and limits for each control.

## Review Path

1. Use [Repository Coverage](/security/repository-coverage) to confirm that every adopted GoForj repository is in scope.
2. Use [Security Controls](/security/controls) to inspect how findings are produced and kept actionable.
3. Read [Vulnerability Management](/security/vulnerability-management) for private reporting, remediation, disclosure, and exception handling.
4. Complete the [Enterprise Assessment](/security/enterprise-assessment) with the controls owned by your deployment.
5. Review [Production Hardening](/security/production-hardening) before promoting an App.

## Evidence Freshness

Repository workflow runs are the freshest evidence. Scheduled scans detect changes in vulnerability databases even when source does not change, while pull-request scans evaluate proposed changes before merge.

The repository coverage manifest was last reviewed on **September 5, 2026**. Its generator rejects missing, duplicate, or unknown repositories so the published matrix cannot silently drift from the declared scope.

## Security Contact

Report a suspected vulnerability privately through the [GoForj private vulnerability reporting form](https://github.com/goforj/.github/security/advisories/new). If the form is unavailable, email [chris@milestech.co](mailto:chris@milestech.co). Do not disclose vulnerability details in a public issue, discussion, or pull request.
