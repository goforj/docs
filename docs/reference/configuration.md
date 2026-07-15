---
title: Configuration Reference
description: Lookup reference for GoForj project configuration and runtime configuration layers.
---

# Configuration Reference

GoForj has two main configuration layers:

- `.goforj.yml` for project rendering and development workflow.
- environment variables for runtime behavior.

## `.goforj.yml`

The project file records render-time choices and local development workflow.

| Key | Purpose |
| --- | --- |
| `project_name` | Generated Project display name. |
| `module_name` | Go module path. |
| `updated_at` | Timestamp written by rendering workflows. |
| `render.components` | Selected framework components. |
| `render.starter_kit` | Selected starter kit. |
| `render.help_format` | Default app CLI help presentation. |
| `render.goforj_version` | GoForj version recorded for the rendered App. |
| `render.module_replaces` | Local module replacements for sibling repos. |
| `apps` | Optional render metadata for named apps. |
| `dev.pre` | Development pre-tasks. |
| `dev.down` | Development teardown tasks. |
| `dev.apps` | App-aware build, run, and SPA lifecycle configuration. |
| `dev.watches` | Independent custom watcher commands. |
| `dev.auto_migrate` | Development auto-migrate behavior. |
| `dev.down_on_exit` | Development cleanup behavior on exit. |
| `dev.sound_on_watch_error` | Optional local feedback when a watcher command fails. |
| `dev.wire_paths` | Wire paths used by development tooling. |

Driver configuration is environment-backed rather than stored in `.goforj.yml`. `forj new` derives active and supported drivers from the selected components without adding a separate driver screen. When Background Jobs is selected, it starts with `QUEUE_DRIVER=workerpool` and compiles workerpool and Redis support. Change those environment variables after Project creation.

The legacy `render.queue_driver` key remains accepted as migration input and is removed when GoForj next rewrites the Project configuration.

## Development Tasks

Development tasks use this shape:

```yaml
dev:
  pre:
    - name: frontend dependencies
      cmd: cd cmd/app/frontend && npm install --no-audit --no-fund --loglevel=error
  down:
    - name: stop containers
      cmd: docker-compose down
```

## App Development Lifecycles

`dev.apps` is the modern allowlist for App-aware local development. Each listed App can own a build, a runtime process, and one or more frontend SPA builds:

```yaml
dev:
  apps:
    app:
      build:
        exec: forj build -o ./bin/app
        watch: [.go, .env, .env.*]
        ignore: [forj, _data, wire_gen.go, .git, .hg, .svn, .idea, .vscode, .settings, node_modules]
        root: .
        postpone: true
      run:
        exec: ./bin/app
      spas:
        frontend:
          path: ./cmd/app/frontend
          build: npm run build -s -- --logLevel silent
          watch: [.ts, .tsx, .js, .jsx, .vue, .css, .html, package.json, package-lock.json]
          ignore: [_data, node_modules, dist]
```

These are lifecycle graphs rather than flat watcher entries. A successful SPA build requests its owning App build, and a successful App build requests runtime replacement. Failures do not traverse those success edges. The generated bare-binary runtime uses validated executable snapshots so a failed build cannot replace a healthy process.

### App Participation

| Shape | Behavior |
| --- | --- |
| App omitted | Do not manage that App in the modern dev graph. |
| `app: true` | Use the conventional build and runtime when the App has a runtime. |
| `app: false` | Invalid. Omit the App instead. |
| `dev.apps: {}` | Use native dev mode with no managed Apps. |
| Entire `dev.apps` key omitted | Retain legacy discovery and watcher compatibility. |

Runtime-capable means the App has Web API, Web UI, Scheduler, or Jobs support. Generated CLI-only Apps are omitted from `dev.apps` by default because they do not need a long-running runtime. Listing a CLI-only App with `true` enrolls its conventional build without starting a runtime; set `run` to a command string or mapping when the dev loop should invoke a specific command.

App names must be safe lowercase slugs. `wire` is reserved by the generated layout.

### Build and Run Commands

`build` and `run` accept `true`, `false`, a command string, or an expanded mapping.

| Shape | Build behavior | Run behavior |
| --- | --- | --- |
| Omitted or `true` | Use the conventional App build. | Run the bare App binary when runtime-capable. |
| `false` | Disable the App build. | Keep the build graph but disable the runtime. |
| String | Use the string as the complete build command. | Append the string as arguments to `./bin/<app>`. |
| Mapping | Override build fields; `exec` may be omitted to retain the conventional command. | Use `exec` as the complete process command; `exec` is required. |

Expanded command fields are:

| Key | Purpose |
| --- | --- |
| `exec` | Shell command. |
| `watch` | Native file matcher list. A non-empty build list replaces conventional include matchers. |
| `ignore` | Exclusion matcher list. App build values extend conventional safety exclusions. |
| `root` | Directory against which watch paths are resolved. |
| `workdir` | Working directory for the command. A nested directory requires explicit `exec`. |
| `env` | Command-specific environment values. |
| `debounce` | Change coalescing duration, such as `300ms`. |
| `poll` | A positive duration forces polling. Omission or `0s` uses filesystem notifications with polling fallback. |
| `postpone` | Do not run this watcher node immediately when the watcher session starts. Build defaults to `true`; run defaults to `false`. The supervisor's startup build and reconciliation still run. |

`restart`, `exit`, and `stdin` are custom-watch controls. They are not App build or run fields.

Structured App build and run commands always receive the correct `FORJ_APP` and `FORJ_COMMAND_PREFIX`, overriding configured values for those reserved keys.

Only a run mapping containing the exact generated `exec: ./bin/<app>` and no other controls retains managed binary snapshot behavior. Adding environment, matcher, path, or timing controls makes it a complete process override. A scalar run command remains the concise App-command form:

```yaml
dev:
  apps:
    app:
      run: worker --queue reports
```

This runs `./bin/app worker --queue reports`.

A mapped runtime gets a direct filesystem subscription only when `run.watch` is non-empty. Without it, `run.root`, `run.ignore`, `run.debounce`, and `run.poll` have no watcher effect, although `workdir`, `env`, and `postpone` still affect the process lifecycle. When the App has a managed build, a matcher equal to `./bin/<app>` is removed because successful build publication already owns that restart edge.

### SPA Fields

An SPA can be a conventional path string or an expanded mapping:

```yaml
dev:
  apps:
    app:
      spas:
        frontend: ./cmd/app/frontend
        admin:
          path: ./cmd/app/admin
          build: npm run build
          watch: [.ts, .css]
          ignore: [node_modules, dist]
```

SPA map keys must be safe lowercase slugs. An SPA value accepts a path string or mapping; `false` is invalid. Remove the SPA key to exclude it from the lifecycle.

Expanded SPAs support only `path`, `build`, `watch`, and `ignore`. `path` is required and is both the watch root and command working directory. An empty or omitted `build` selects the conventional build command. Empty or omitted `watch` and `ignore` lists use conventional SPA defaults; non-empty lists replace their respective defaults.

## Custom Watches

Use sibling `dev.watches` entries for arbitrary commands that do not own an App lifecycle:

```yaml
dev:
  watches:
    - name: Generate API Client
      exec: go generate ./internal/client
      watch: [.graphql, .json]
      ignore: [generated, node_modules]
      root: .
      postpone: true
```

Custom watches coexist with `dev.apps` but have no implicit edge into an App build or runtime restart.

Watch roots default to `.`. Every outermost physical root must exist, must be a directory, and must not be a symbolic link when the watcher starts. Native custom watches have no implicit exclusions for hidden paths, version-control metadata, editor metadata, or `node_modules`; list every exclusion the command needs.

| Key | Purpose |
| --- | --- |
| `name` | Display name. Omission uses `Watch N`. |
| `exec` | Required shell command. |
| `watch` | Native matcher list. Omission accepts every non-excluded file. |
| `include` | Compatibility alias for a native matcher list. Do not combine it with `watch`. |
| `ignore` | File exclusions that also prune matching directories. |
| `root` / `roots` | One watch root or a list of roots. Do not set both. |
| `workdir` | Command working directory, independent of watch roots. |
| `files.include` | Additional file inclusion matchers. |
| `files.exclude` | Additional exclusions that also participate in directory pruning. |
| `dirs.include` / `dirs.exclude` | Directory restrictions and exclusions. |
| `env` | Command-specific environment values. |
| `debounce` | Change coalescing duration. The default is `300ms`. |
| `poll` | A positive duration forces polling. Omission or `0s` uses filesystem notifications with polling fallback. |
| `postpone` | Do not run the custom command immediately; wait for the first matching change. This does not suppress supervisor startup build or reconciliation. |
| `restart` | Interrupt an active custom command when another change arrives. |
| `exit` | End the dev session when this command completes. |
| `stdin` | Attach standard input to the command. |

`debounce` and `poll` use Go duration syntax and reject invalid or negative values. An explicit `debounce: 0s` disables change coalescing. An omitted or empty native `watch` list watches every non-excluded file; it does not disable the watcher.

### Native Matcher Syntax

Matchers are relative to each configured root:

| Value | Behavior |
| --- | --- |
| `.go` | Match a filename suffix. |
| `.env` | Match the exact basename. |
| `.env.*` | Match a basename prefix such as `.env.local`. |
| `package.json` | Match the exact basename. |
| `./schemas/api.json` | Match an exact root-relative path. |
| `re:^schemas/.+\.json$` | Match an explicit Go regular expression. |

Exclusions take precedence over inclusions. Empty string matcher elements and invalid regular expressions fail configuration compilation.

Both compact flow sequences such as `watch: [.go, .env]` and block sequences are standard YAML and decode to the same string lists.

### Legacy Watch Compatibility

A scalar `watch` value selects GoForj's supported legacy wgo-style flag subset:

```yaml
dev:
  watches:
    - name: Legacy Build
      watch: -file .go -xdir node_modules -postpone
      exec: forj build
```

GoForj parses this syntax internally and does not invoke an external `wgo` process. Supported flags are `-root`, `-cd`, `-file`, `-dir`, `-xfile`, `-xdir`, `-debounce`, `-poll`, `-postpone`, `-exit`, `-stdin`, `-verbose`, `-exec-log`, `-exec-msg`, and `-log-prefix`. Unsupported flags fail configuration compilation.

With a scalar `watch`, the scalar grammar owns matcher, root, working-directory, timing, and process controls. Do not mix it with native `include`, `ignore`, `root`, `roots`, `workdir`, `files`, `dirs`, `debounce`, `poll`, `postpone`, `restart`, `exit`, or `stdin` fields. The entry's `name`, `exec`, and `env` fields still apply. Use list-shaped `watch` values for new configuration.

Legacy custom watcher commands always use restart-on-change behavior: a new event interrupts an active command. There is no supported scalar `-restart` flag.

Historical `dev.run` maps remain accepted as legacy App-command allowlists. New configuration should express participation and commands under `dev.apps`.

During render, GoForj conservatively migrates a complete, recognized, unmodified historical `Build App` and `Run App` pair when its legacy `dev.run` map is valid. Otherwise, it leaves the legacy lifecycle untouched. Modified and custom entries are preserved.

## Render Metadata for Apps

Top-level `apps` and `dev.apps` have different responsibilities:

| Key | Responsibility |
| --- | --- |
| `apps` | Per-App render components, starter kit, and help-format metadata. |
| `dev.apps` | Participation and lifecycle behavior under `forj dev`. |

Named apps are discovered from layout:

```text
cmd/marketplace/main.go
app/marketplace/
```

When a named app has App-specific render choices, `.goforj.yml` records them under `apps`:

```yaml
apps:
  marketplace:
    components: [web_api, jobs]
    starter_kit: none
    help_format: guided
```

`render.components` describes the default App and Project-owned tooling. Named App selections stay under `apps`; when shared generated packages need the combined capability set, the renderer derives that union in memory without rewriting the default App selection.

Component lists contain explicitly enabled component names. Each name must match a supported component key and may appear only once. Short lists use compact sequence syntax; long lists are written as multiline YAML. At Project render scope, an empty list enables no components. At named App scope, it records no raw selections, but effective App normalization still adds mandatory `cli`. Dependencies are resolved for the effective render without expanding the persisted raw selection.

Modern configuration does not need or write `component_contract`. GoForj still reads the retired marker and legacy boolean component maps long enough to migrate them, then writes only the component sequence. Migrating a versionless boolean map enables Cache, Events, and File Storage to preserve resources that were implicit before those components became optional.

`forj new` starts with Cache, Events, File Storage, and Background Jobs selected. It also starts with MySQL as the one selected database engine. These are saved as ordinary component names, so deselecting one has the same meaning as omitting it from the list.

Adding a component and rerendering creates its framework-owned support. Removing a component is conservative: the renderer deletes only verified framework output, refuses unsafe transitions before mutation, and does not delete runtime or resource data. Reconcile the path named by the error before retrying. Active and supported drivers remain environment configuration rather than component names.

## Component Names

Render component keys include:

| Key | Purpose |
| --- | --- |
| `cli` | Generated App command surface. |
| `demo_app` | Demo application surface. |
| `mail` | Generated mail manager and delivery integration. |
| `auth` | Generated auth, session, and account support. |
| `oauth` | OAuth support for generated auth. |
| `web_api` | HTTP API runtime. |
| `web_ui` | Embedded frontend asset support. |
| `metrics` | Metrics manager and export behavior. |
| `observability` | Local observability support files. |
| `grafana` | Grafana provisioning for local observability. |
| `docker` | Local container support. |
| `database_mysql` | MySQL database support. |
| `database_postgres` | PostgreSQL database support. |
| `database_sqlite` | SQLite database support. |
| `scheduler` | Scheduler runtime and registration surface. |
| `cache` | Generated cache manager, accessors, and drivers. |
| `events` | Generated event bus manager, accessors, and drivers. |
| `storage` | Generated file and object storage manager, accessors, and drivers. |
| `jobs` | Queue manager, job support, and worker runtime. |
Catalog dependencies are resolved in memory by the renderer. For example, metrics enables `web_api`, while auth enables mail, web API, and cache. Those effective dependencies are not added to the saved list. Render-contract validation still requires an auth selection to include one database component explicitly.

## Module Replaces

Use paths that are stable from the generated project root. For local sibling repositories, prefer a relative path:

```yaml
render:
  module_replaces:
    github.com/goforj/web: ../web
```

Do not use container-specific absolute paths; they only work in one local environment.

## Related Pages

- [Configuration](/getting-started/configuration)
- [Starter Kits](/getting-started/starter-kits)
- [forj dev](/developer-tools/forj-dev)
