# GoForj Documentation Review Checklists

## Purpose

This file defines practical review checklists for maintaining documentation quality over time.

Use these checklists before publishing new docs, reviewing AI-generated drafts, or changing examples.

## Universal Checklist

- The page has one primary purpose.
- The first example follows the GoForj golden path.
- Terminology matches `terminology.md`.
- Titles, headings, nav labels, and sidebar labels use Title Case with lowercase connector words.
- The page uses a calm, direct voice.
- The page avoids hype and vague claims.
- The page identifies the generated App location when relevant.
- The page distinguishes app code, framework policy, primitive contracts, and drivers.
- The page includes a verification step when it teaches a task.
- The page links to the next likely task.
- The page does not expose internals before the reader needs them.

## Architecture Checklist

- The page states which runtime boundary is involved.
- Required dependencies are constructor-injected.
- Providers and Wire are described as explicit construction, not runtime lookup.
- Business logic stays in services, jobs, subscribers, or domain-owned methods.
- Runtime bootstrap does not become a business-logic location.
- Driver-specific imports stay near provider or configuration examples unless the page is reference.
- Local-first defaults appear before distributed infrastructure.
- Production tradeoffs are stated honestly.

## Terminology Checklist

- `App` means the generated GoForj application.
- `Runtime` means executing process or execution surface.
- `Provider` means explicit dependency construction.
- `Driver` means swappable backend implementation.
- `Adapter` means contract translation.
- `Service` means application-owned behavior.
- `Inspect` is the product feature name.
- `trace_id` appears only as a correlation field.
- `Lighthouse` means the operator/runtime visibility surface.
- No new term is introduced without a clear need.

## Example Checklist

- The example compiles or is clearly marked as a fragment.
- Runnable examples include commands.
- The example has realistic names.
- The example teaches one primary concept.
- The example uses generated App extension points.
- Dependencies are explicit.
- Errors are handled in production-shaped code.
- Resource names are stable and operationally meaningful.
- The example avoids direct driver coupling in business logic.
- The example includes testing or smoke verification when appropriate.

## Feature Page Checklist

- The page starts with what the feature is and when to use it.
- The page names where the feature lives in the generated App.
- The page shows the local-first golden path before advanced variants.
- Configuration appears before driver matrices.
- Testing appears before advanced customization.
- Operations and lifecycle are covered for long-running features.
- Common mistakes are specific and actionable.
- Reference links are present but not used as onboarding.

## Library Page Checklist

- The page works for a standalone Go package user.
- Installation and direct package usage are clear.
- Driver constructors and backend setup are accurate.
- API reference or README-slurped content remains useful.
- The page does not require generated App knowledge.
- A concise "Using With GoForj" section links to framework integration docs when relevant.
- The page does not duplicate full framework workflow guidance.
- Framework-specific terminology is used only when explaining framework integration.

## Operations Checklist

- The process or command is named.
- Development commands and built binary commands are not conflated.
- Bare runtime binary behavior is documented when topology pages discuss standalone App deployment.
- Startup behavior is described.
- Shutdown behavior is described.
- Health or readiness behavior is described when relevant.
- Metrics are described with bounded-label expectations.
- Inspect behavior is described when relevant.
- Logs are described at the right level of detail.
- Degraded optional subsystem behavior is explicit.
- Production failure modes are named.

## AI Draft Checklist

- The draft does not invent GoForj behavior.
- The draft uses existing source context for commands, file paths, and APIs.
- Unverified commands are marked or removed.
- Generated internal AI context is not placed under the public docs tree.
- The draft follows the page type structure in `docs-style-guide.md`.
- The draft reinforces `golden-paths.md`.
- The draft avoids anti-patterns listed in `anti-patterns.md`.
- The draft does not copy another framework's wording or terminology.
- The draft is concise enough for a human maintainer to review.
