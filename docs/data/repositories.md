---
title: Repositories
description: How repositories isolate persistence behavior from services and runtime boundaries.
---

# Repositories

A Repository owns persistence behavior for a feature or aggregate.

Services call repositories. Controllers, commands, jobs, events, and schedules should call services instead of reaching into persistence directly.

## Repository Shape

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

```go
func (s *Service) Find(ctx context.Context, id string) (User, error) {
	return s.repo.Find(ctx, id)
}
```

Keep service inputs independent from database model structs unless that type is intentionally the application model.

## Named Connections

Use named connections when a feature has a real persistence boundary:

```go
analytics, err := conns.Analytics()
```

Do not create named connections just to organize code. Names should reflect operationally meaningful resources.

## Testing

Repository tests can use local database drivers such as SQLite when behavior is driver-independent.

Use driver-specific integration tests when SQL behavior depends on MySQL or Postgres.

## Common Mistakes

- Do not query the database from controllers.
- Do not make repositories depend on HTTP or CLI types.
- Do not import database driver packages into normal repository code.
- Do not hide retries, job dispatch, or event publication in repositories unless the repository explicitly owns that persistence side effect.
- Do not use cache as a repository substitute.

## Next Steps

- [Transactions](/data/transactions) explains consistency boundaries.
- [Application Services](/applications/services) explains service orchestration.
- [Database Strategy](/data/database-strategy) explains generated connections.
