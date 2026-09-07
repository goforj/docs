---
title: Repositories
description: How repositories isolate persistence behavior from services and runtime boundaries.
---

# Repositories

A Repository owns persistence behavior for a feature or aggregate.

Services call repositories. Controllers, commands, jobs, events, and schedules should call services instead of reaching into persistence directly.

## Repository Shape

<!-- go-example: illustrative-fragment -->
```go
package users

type Repository struct {
	db *gorm.DB
}

func NewRepository(conns *database.Connections) (*Repository, error) {
	db, err := conns.Default()
	if err != nil {
		return nil, err
	}
	return &Repository{db: db}, nil
}
```

Use the database accessors generated for your App. Keep backend connection selection outside business logic.

Register repository constructors through `app/wire/inject_repositories_app.go`. Additional apps use the owning app's `app/<name>/wire/inject_repositories_app.go`.

## Responsibilities

Repositories should own:

- query construction
- persistence-specific models
- transaction participation
- mapping between database rows and application types
- database error interpretation

Repositories should not own HTTP behavior, CLI output, queue dispatch policy, event fan-out policy, or scheduler behavior.

## Service Boundary

Services should call repositories through clear methods:

<!-- go-example: illustrative-fragment -->
```go
func (s *Service) Find(ctx context.Context, id string) (User, error) {
	return s.repo.Find(ctx, id)
}
```

Keep service inputs independent from database model structs unless that type is intentionally the application model.

## Relationships

Use `forj make:model <table> --package <package>` when an existing table needs the conventional schema-derived model and repository scaffold. Inspect the real table, foreign keys, and nearby package ownership first. The generator derives columns from the selected table and reads supported relationship declarations from `.db-relationships.yaml`.

For example, this declaration gives generated users their related posts while keeping the key mapping explicit and schema-validated:

```yaml
users:
  - "1-many id->posts:user_id"
```

Generate the referenced model in the same package before the model that exposes it:

```bash
forj make:model posts --package content
forj make:model users --package content
```

The generated user model receives the relationship field and reports its eager-loading path through `Relationships()`.

The config owns the generated relationship fields. Repositories still own persistence-specific joins, preloads, and mapping across related rows. Return a domain or application result that expresses what the caller needs rather than making controllers, commands, jobs, or frontend code navigate database relationships directly.

For example, a billing repository can return `InvoiceDetails` containing an invoice and its line items. Whether that query uses a join, preload, or separate bounded reads stays behind the repository method and can change without rewriting its callers.

## Named Connections

Use named connections when a feature has a real persistence boundary:

<!-- go-example: illustrative-fragment -->
```go
analytics, err := conns.Analytics()
```

Do not create named connections just to organize code. Names should reflect operationally meaningful resources.

## Testing

Repository tests can use local database drivers such as SQLite when behavior is driver-independent.

Use driver-specific integration tests when SQL behavior depends on MySQL or Postgres.

Run the focused package test before the full suite:

```bash
go test ./internal/users
go test ./...
```

Success means the focused repository behavior and every package using its service contract pass. When SQL semantics depend on the production Driver, add the corresponding container-backed case described in [Integration Tests](/testing/integration-tests) rather than treating SQLite as equivalent.

## Next Steps

- [Transactions](/data/transactions) explains consistency boundaries.
- [Application Services](/applications/services) explains service orchestration.
- [Database Connections](/data/database-strategy) explains generated connections.
- [Integration Tests](/testing/integration-tests) covers Driver-specific persistence behavior.
