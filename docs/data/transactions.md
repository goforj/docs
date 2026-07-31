---
title: Transactions
description: How to reason about database transaction boundaries in GoForj services.
---

# Transactions

Transactions protect groups of database changes that must succeed or fail together.

In GoForj Apps, transaction policy should live near the service method that owns the workflow.

## Repository Transaction Helper

The generated database accessor returns `*gorm.DB`. A repository can preserve its normal methods while rebinding them to GORM's transaction handle:

<!-- go-example: illustrative-fragment -->
```go
package accounts

import (
	"context"
	"errors"
	"fmt"

	"gorm.io/gorm"
	"myapp/internal/database"
)

// ErrAccountNotFound reports that a transfer referenced an unknown account.
var ErrAccountNotFound = errors.New("account not found")

// Account is the persisted balance used by this transaction example.
type Account struct {
	ID           string `gorm:"primaryKey"`
	BalanceCents int64
}

// Repository owns account persistence through one database handle.
type Repository struct {
	db *gorm.DB
}

// NewRepository resolves the generated default database connection.
func NewRepository(conns *database.Connections) (*Repository, error) {
	db, err := conns.Default()
	if err != nil {
		return nil, err
	}
	return &Repository{db: db}, nil
}

// WithTransaction rebinds repository methods to one GORM transaction.
func (r *Repository) WithTransaction(ctx context.Context, fn func(*Repository) error) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		return fn(&Repository{db: tx})
	})
}

// AdjustBalance changes one balance and rejects missing accounts.
func (r *Repository) AdjustBalance(ctx context.Context, id string, delta int64) error {
	result := r.db.WithContext(ctx).
		Model(&Account{}).
		Where("id = ?", id).
		UpdateColumn("balance_cents", gorm.Expr("balance_cents + ?", delta))
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected != 1 {
		return fmt.Errorf("%w: %s", ErrAccountNotFound, id)
	}
	return nil
}
```

Replace `myapp` with the generated module path. `WithTransaction` creates a repository bound to GORM's transaction handle; returning an error from the callback rolls back every write made through that bound repository.

## Service Boundary

The service owns the workflow and decides which repository calls are atomic:

<!-- go-example: illustrative-fragment -->
```go
// Service owns account workflows.
type Service struct {
	accounts *Repository
}

// NewService creates the account service with its required repository.
func NewService(accounts *Repository) *Service {
	return &Service{accounts: accounts}
}

// Transfer moves a positive amount between two accounts atomically.
func (s *Service) Transfer(ctx context.Context, fromID, toID string, amountCents int64) error {
	if amountCents <= 0 {
		return errors.New("transfer amount must be positive")
	}
	return s.accounts.WithTransaction(ctx, func(tx *Repository) error {
		if err := tx.AdjustBalance(ctx, fromID, -amountCents); err != nil {
			return err
		}
		return tx.AdjustBalance(ctx, toID, amountCents)
	})
}
```

Test the failure branch by making the credit fail and then reading both balances through a fresh connection. Expected result: neither balance changes, proving the debit used the same transaction and rolled back.

Keep that test at the service boundary and use the production database engine in integration coverage when isolation, locking, or SQL dialect affects the workflow. Also test the success path and a canceled `context.Context`; a passing rollback test alone does not prove that commit and cancellation behave correctly.

## Side Effects

Be deliberate when a transaction also relates to:

- queued jobs
- published events
- cache invalidation
- storage writes
- external API calls

Dispatching a job before commit can expose work that depends on data not yet durable. For best-effort follow-up work, return successfully from `WithTransaction` first, then dispatch or publish.

When the database change and asynchronous follow-up must succeed as one durable workflow, use an outbox:

1. write the business rows and an outbox row in the same database transaction
2. commit
3. let a worker publish or dispatch pending outbox rows
4. mark an outbox row delivered only after the queue or event operation succeeds
5. make the dispatcher idempotent because it can stop after dispatch and before marking delivery

An outbox closes the commit-versus-dispatch gap; an ordinary after-commit call does not.

For an outbox deployment, the operational handoff is not complete until one row is observed through its full lifecycle: committed with the business change, dispatched by the worker, and marked delivered. Alert on the age and count of undelivered rows; HTTP readiness alone cannot reveal a stalled dispatcher.

## Cache and Transactions

Cache should usually be updated after durable state changes.

Treat cache invalidation as part of the workflow. Cache misses should remain normal and recoverable.

## Storage and Transactions

File/blob storage is not automatically transactional with the database.

If a workflow writes both database state and storage objects, define cleanup and retry behavior explicitly.

## Common Mistakes

::: warning Common mistakes
- Do not hide transaction boundaries in controllers.
- Do not perform external irreversible side effects inside a transaction without a clear reason.
- Do not assume queue dispatch, event publication, and storage writes roll back with SQL.
- Do not call the root repository from inside `WithTransaction`; use the transaction-bound callback value.
- Do not use cache as the consistency authority.
- Do not spread one transaction across unrelated runtime boundaries.
:::

## Next Steps

- [Repositories](/data/repositories) explains persistence methods.
- [Cache Patterns](/data/cache-patterns) explains derived data.
- [Storage Patterns](/data/storage-patterns) explains file/blob consistency.
