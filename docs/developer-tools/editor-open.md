---
title: Opening Generated Files
description: How GoForj make commands open generated files in your editor.
---

# Opening Generated Files

File-generating make commands can open the primary generated file in your editor after the command succeeds.

Use `--open` or `-o` when you want the file opened for this run:

```bash
forj make:controller users --open
forj make:job reports:daily -o
```

For a named app, use the same flag after the app prefix:

```bash
forj marketplace make:controller checkout --open
```

Use `--no-open` when you want to suppress editor opening for this run, even if the App is configured to open generated files automatically:

```bash
forj make:command reports:sync --no-open
```

## Supported Commands

The editor hook is available on make commands that create an editable source file:

| Command | File opened |
| --- | --- |
| `make:controller` | generated controller file |
| `make:command` | generated command file |
| `make:event` | generated event file |
| `make:subscriber` | generated subscriber file |
| `make:job` | generated job file |
| `make:schedule` | generated schedule file |
| `make:model` | generated model file |
| `make:migration` | first generated up migration |

`make:queue` does not use the editor hook because it updates queue configuration instead of creating an editable source file.

## Automatic Opening

Generated Apps include:

```dotenv
FORJ_MAKE_OPEN=auto
FORJ_EDITOR=
```

`FORJ_MAKE_OPEN` controls whether make commands try to open generated files.

| Value | Behavior |
| --- | --- |
| `auto` | Open when the command is running in an interactive terminal and not in CI. |
| `always` | Always try to open after a successful generator run. |
| `never` | Never open unless the command uses `--open` or `-o`. |

In `auto`, GoForj only opens when stdin and stdout are attached to a terminal and `CI` is not set to a truthy value. This keeps scripts and CI jobs quiet.

If automatic opening cannot find an editor, it silently does nothing. If you explicitly pass `--open` or set `FORJ_MAKE_OPEN=always`, GoForj prints a warning when no editor can be resolved.

## Editor Resolution

Set `FORJ_EDITOR` when you want a specific editor command:

```dotenv
FORJ_EDITOR="code --reuse-window --goto {location}"
FORJ_EDITOR="goland --line {line} {file}"
```

Supported placeholders:

| Placeholder | Value |
| --- | --- |
| `{file}` | Absolute generated file path. |
| `{line}` | Line number to open. |
| `{location}` | Absolute file path plus line, such as `/path/to/file.go:1`. |

When `FORJ_EDITOR` is empty, GoForj tries to infer the editor in this order:

1. Terminal hints, such as Cursor, VS Code, Zed, or a JetBrains terminal.
2. Already-running GUI editor processes.
3. Editor commands available on `PATH`.

The editor priority is:

1. GoLand
2. Cursor
3. VS Code
4. Zed
5. IntelliJ IDEA

GoForj prefers a running editor before launching a different editor from `PATH`.

## Related Pages

- [Make Commands](/core/make-commands)
- [CLI Reference](/reference/cli)
- [Environment Reference](/reference/env-vars)
