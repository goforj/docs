---
title: Transactions
description: How to reason about database transaction boundaries in GoForj services.
---

# Transactions

Transactions protect groups of database changes that must succeed or fail together.

In GoForj Apps, transaction policy should live near the service method that owns the workflow.

## Boundary

Put transaction boundaries in services when the workflow spans multiple repository operations:

```go
func (s *Service) Transfer(ctx context.Context, input TransferInput) error {
	return s.repo.WithTransaction(ctx, func(tx *Repository) error {
		if err := tx.Debit(ctx, input.From, input.Amount); err != nil {
			return err
		}
		return tx.Credit(ctx, input.To, input.Amount)
	})
}
```

The exact helper shape can vary by repository design, but the owner should be clear.

## Side Effects

Be deliberate when a transaction also relates to:

- queued jobs
- published events
- cache invalidation
- storage writes
- external API calls

Document ordering and failure behavior. For example, dispatching a job before a transaction commits can expose work that depends on data not yet durable.

## Cache and Transactions

Cache should usually be updated after durable state changes.

Treat cache invalidation as part of the workflow. Cache misses should remain normal and recoverable.

## Storage and Transactions

File/blob storage is not automatically transactional with the database.

If a workflow writes both database state and storage objects, define cleanup and retry behavior explicitly.

## Common Mistakes

- Do not hide transaction boundaries in controllers.
- Do not perform external irreversible side effects inside a transaction without a clear reason.
- Do not assume queue dispatch, event publication, and storage writes roll back with SQL.
- Do not use cache as the consistency authority.
- Do not spread one transaction across unrelated runtime boundaries.

## Next Steps

- [Repositories](/data/repositories) explains persistence methods.
- [Cache Patterns](/data/cache-patterns) explains derived data.
- [Storage Patterns](/data/storage-patterns) explains file/blob consistency.
