# GoForj Social Posts

## Wire v1.3.0

- Status: scheduled and verified in the X scheduled-post list, including exact copy, one image, alt text, and October 20 time.
- Account: GoForj, `@goforjdev`, verified in the X composer.
- Intended schedule: Tuesday, October 20, 2026 at 10:30 a.m. `America/Chicago` (CDT, UTC-05:00), `2026-10-20T15:30:00Z`.
- This is a user-requested extra slot. Existing Tuesday/Thursday 10 a.m. entries are preserved.
- Scheduled posts: https://x.com/compose/post/unsent/scheduled
- Public permalink: not available before publication. X's scheduled-post UI does not expose a post ID.
- Uploaded media: https://pbs.twimg.com/media/HU31j3mXoAAR0WB.jpg
- Verified: 2026-10-18T00:26:45.463297+00:00; one Wire scheduled entry remains, and the former November 5 entry is absent.

### Copy

```text
Keep your providers. Let Wire generate the constructor calls.

Wire v1.3.0 fixes stale generation after refactors across Go workspace modules and supports project-owned go tool wire commands.

Go 1.25+
https://github.com/goforj/wire/releases/tag/v1.3.0
```

### Artwork

- HTML source: `docs/public/social-posts/wire-v1.3.0.html`
- Export: `docs/public/social-posts/wire-v1.3.0.png`, 2400 by 2100 pixels.
- Original logo: `goforj/wire` README header, `docs/assets/logo-v2.png`, copied unchanged to `docs/public/social-posts/wire-logo.png`.
- Design system: `docs/public/design-system.html` and `design-system.css`, backed by `.vitepress/theme/custom.css`.
- Capture: see [social-artwork.md](social-artwork.md#library-release-posts).
- Illustration compares manually assembled constructor calls with a Wire injector and its explicit provider registration. The original Wire gopher connects the two. This illustrates Wire's general generation model; the v1.3.0-specific workspace cache and generation-command improvements are labeled separately.

### Alt text

GoForj Wire v1.3.0: more dependencies, less manual wiring. A manual injector calls NewDB, NewCache, NewRepo, NewService, NewAPI, and NewApp, then returns the app. The Wire gopher connects it to an injector containing wire.Build(AppSet) and return nil. AppSet registers those same six constructors with wire.NewSet. Wire generates ordinary Go initialization code from the provider graph. New in v1.3.0: workspace cache fixes and project-owned go tool wire generation. Go 1.25+.

### Sources and checks

- Release: https://github.com/goforj/wire/releases/tag/v1.3.0
- Cache issue: https://github.com/goforj/wire/issues/14
- Cache fix: https://github.com/goforj/wire/pull/27
- Project-owned generation: https://github.com/goforj/wire/pull/26
- README explanation PR: https://github.com/goforj/wire/pull/29
- Published v1.3.0 proxy install and both cache-mode workspace smoke tests passed. The fixture warms both targets, deletes Options and its constructor parameter, regenerates both outputs, and compiles them.
- Manual-versus-generated example compiled and passed equivalence and shared-dependency checks with the published v1.3.0 on Go 1.25.0, with GOWORK=off and no local Wire replacement. Example fixture: /tmp/wire-social-example. Both versions assemble the same six constructors.
- Social capture and JavaScript syntax check passed. At preparation time, the full docs build stopped in the prebuild content audit because release.json did not match expected v0.28.0. The October 18 reconciliation updated the release pointer to the published v0.29.0 release, registered this queue in governance, and passed the full docs build. No global preview metadata or preserved artwork changed.

The artwork source, export, capture extension, runbook, and queue are saved in this docs checkout. The README change is independently tracked in Wire PR #29.
