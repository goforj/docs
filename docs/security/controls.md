---
title: Security Controls
description: Automated GoForj security controls, the evidence they produce, their limits, and the policies that keep findings actionable.
---

# Security Controls

GoForj uses complementary controls because no single scanner covers source, dependencies, secrets, workflow integrity, and generated artifacts. Each control has a narrow purpose and an explicit limit.

## Control and Evidence Map

| Control | When It Runs | What It Establishes | Important Limit |
| --- | --- | --- | --- |
| Organization-managed CodeQL | On the organization schedule and configured repository events | Enrolled Go source is analyzed with GitHub's maintained queries and findings appear in code scanning | Static analysis is not a penetration test and organization enrollment is an administrator-owned setting |
| govulncheck | Pull requests, default-branch pushes, weekly schedules, and manual runs | Discovered Go packages and test paths are checked against the public Go vulnerability database with reachability analysis | It cannot find private advisories, unknown flaws, or application logic vulnerabilities |
| npm audit | The same security events in repositories with npm lockfiles | Resolved npm dependencies are checked against the configured advisory source | It covers lockfile dependencies, not arbitrary browser or runtime behavior |
| Dependency Review | Pull requests that change dependency resolution | Newly introduced dependency vulnerabilities, licenses, and supply-chain changes are visible before merge | It reviews the pull-request delta and requires the GitHub dependency graph |
| Gitleaks | Pull requests, default-branch pushes, schedules, and manual runs | Complete Git history is checked for known secret patterns and output is redacted | Pattern matching can miss unknown formats and cannot scan external secret stores |
| CycloneDX SBOM | Security and supply-chain workflows | Every discovered manifest has a machine-readable dependency inventory with validated identity and contents | A CI artifact is not a signed release attestation and follows artifact retention policy |
| Dependabot | Weekly | Go modules, npm packages, and GitHub Actions receive update proposals for declared manifests | An update proposal still requires CI and maintainer review |
| Immutable action references | Every workflow run | Third-party workflow code resolves to a reviewed commit instead of a mutable tag | A pinned dependency can later receive an advisory and still needs update monitoring |
| Unit, integration, race, vet, and compatibility checks | Repository-specific CI events | Supported behavior, concurrency, static correctness, and minimum Go claims are exercised where configured | Tests establish only the behavior represented by their cases and environments |
| Container policy checks | Core framework security events | Build images and generated container defaults are checked for vulnerabilities and unsafe exposure policy | Image findings do not prove deployment network or runtime hardening |

## How Findings Stay Actionable

### Scan Real Inputs

Multi-module repositories discover `go.mod` files dynamically. Repositories with frontend assets do the same for `package-lock.json`. SBOM counts and automated-update configuration are compared with those discovered manifests so a new driver, example, integration module, or embedded frontend cannot silently fall outside the baseline.

### Separate Change Gates from Scheduled Detection

Pull-request checks answer whether a proposed change introduces risk. Scheduled checks answer whether new advisory data affects unchanged code. Default-branch checks confirm that the merged source still produces valid evidence.

### Fail on Scanner and Inventory Errors

A failed package listing, incomplete SBOM, mismatched module identity, or scanner execution error fails the job. It is not converted into a successful empty result.

### Keep Exceptions Exact

An unresolved upstream advisory can be recorded only for its exact advisory, module, and applicable path. Exception checks reject unexpected findings and remove entries that no longer match, keeping an allowlist from becoming a broad bypass.

### Keep Ownership Visible

CodeQL default setup and Dependency Review depend on GitHub organization settings. Repository workflows own the remaining automation and link findings to the source revision that produced them. Reviewers should verify both layers when collecting evidence.

## Evidence Locations

For any repository in the [coverage matrix](/security/repository-coverage):

- **Actions** contains workflow logs and downloadable SBOM artifacts.
- **Security > Code scanning** contains CodeQL findings for enrolled repositories.
- **Security > Dependabot** contains dependency alerts and remediation status.
- A dependency-changing pull request contains its Dependency Review result.
- The repository's workflow files show event triggers, tool versions, permissions, and failure policy.

Artifact availability is subject to GitHub retention. Preserve required evidence in the enterprise system of record when a longer retention period is needed.
