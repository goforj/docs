---
title: Database Shell
description: How to open interactive and non-interactive database shells for generated GoForj App connections.
---

# Database Shell

Database-enabled GoForj Apps include a generated shell command for opening configured database connections.

Use it when you want to inspect a local database, run one-off SQL, verify a named connection, or pass native client arguments without copying connection details out of App configuration.

## Open A Connection

Open the default connection:

```bash
forj db
```

Use the canonical command when you want the full command name:

```bash
forj db:shell
```

The command is also available on the built App binary:

```bash
./bin/app db
```

For a named app, use the app prefix during development or the named app binary after build:

```bash
forj marketplace db # or ./bin/marketplace db
```

## Named Connections

Pass a connection name when the App has multiple database connections:

```bash
forj db analytics
forj db --connection analytics
```

For a named app:

```bash
forj marketplace db analytics # or ./bin/marketplace db analytics
```

Connection names match the generated App resource names. For example, `DB_ANALYTICS_*` configuration maps to `analytics`.

When multiple shellable connections are available and the command runs in an interactive terminal, GoForj can show a compact selector if no connection name is provided. In scripts, pass the connection name explicitly when you do not want the default connection.

## Launch Method

By default, GoForj tries to use a local database client first, such as `mysql`, `psql`, or `sqlite3`. If the client is missing and a generated Docker Compose service exists, it falls back to Compose.

Choose a method explicitly when you want predictable behavior:

```bash
forj db --method local
forj db --method compose
```

Use `--print` to inspect the command before running it. Secrets are masked:

```bash
forj db --print
forj db analytics --method local --print
```

## Non-Interactive SQL

Use `--exec` to run a single SQL string:

```bash
forj db --exec "select count(*) from users"
forj db analytics --exec "select count(*) from events"
```

The same command works through the built binary:

```bash
./bin/app db --exec "select 1"
```

## Client Arguments

Use `--` to pass arguments directly to the underlying client:

```bash
forj db -- --batch -e "select count(*) from users"
forj db analytics -- -c "select count(*) from events"
forj db --connection analytics -- -c "select now()"
```

GoForj adds configured connection arguments first, then appends the arguments after `--`.

This keeps common access simple while still allowing client-specific flags for scripts, exports, batch output, and maintenance commands.

## Notes

- `forj db` is a generated App command. It is available only in Apps with database support.
- `forj db:shell` is the canonical command name; `forj db` is the preferred day-to-day alias.
- Local MySQL connections use TCP so the client does not fall back to a local socket unexpectedly.
- Use `--print` when debugging which client, host, port, database, and connection method will be used.
