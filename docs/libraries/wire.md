---
title: Wire
repoUrl: https://github.com/goforj/goforj/tree/main/wire
---

# Wire

`goforj/wire` is the dependency wiring layer used by GoForj applications and tooling.

It builds on top of Google Wire and keeps composition explicit: providers are grouped into focused sets, the application root is assembled in one place, and generated injectors stay easy to audit.

## Package

```go
import "github.com/goforj/goforj/wire"
```

## What It Provides

- Application assembly through a typed `App` root
- Focused provider sets for commands and shared services
- Explicit generated injectors instead of runtime service location

## Example

```go
app, err := wire.InitializeApplication()
if err != nil {
    return err
}

return app.RootCmd().Run()
```

## Source

- Repo: [github.com/goforj/goforj](https://github.com/goforj/goforj)
- Package: [github.com/goforj/goforj/tree/main/wire](https://github.com/goforj/goforj/tree/main/wire)
