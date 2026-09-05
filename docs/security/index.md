---
title: Security
description: Authentication, sessions, cookies, refresh behavior, and security-sensitive GoForj application behavior.
---

# Security

Security covers both the GoForj software supply chain and application behavior that affects identity, sessions, authorization, secrets, and runtime safety.

Enterprise reviewers can start with [Security Assurance](/security/assurance) for the ecosystem scope, controls, evidence, and stated limits. Application teams should start with [Auth](/security/auth) when the App includes generated account and session support.

## Pages

- [Auth](/security/auth)
- [Sessions and Cookies](/security/sessions-cookies)
- [OAuth](/security/oauth)
- [Production Hardening](/security/production-hardening)

## Assurance and Review

- [Security Assurance](/security/assurance) provides the single entry point for a security review.
- [Security Controls](/security/controls) explains what each automated control proves and does not prove.
- [Repository Coverage](/security/repository-coverage) maps every in-scope repository to its baseline and evidence.
- [Vulnerability Management](/security/vulnerability-management) explains reporting, remediation, and exceptions.
- [Enterprise Assessment](/security/enterprise-assessment) separates GoForj evidence from deployment-owned controls.

## Related Sections

- [HTTP Services](/applications/http-services) explains protected routes and middleware.
- [Inspects](/operations/inspects) explains request-scoped runtime diagnostics.
- [Health and Readiness](/operations/health-readiness) explains diagnostic token behavior.
