---
title: "Add a Database-Backed Resource"
description: "Follow the schema-first workflow from migration through a generated model, registered repository, and application-owned query."
---

# Add a Database-Backed Resource

::: info Verified Scenario
This page is generated from an executable spec. An automated suite renders a fresh App from the current GoForj templates, applies every step below in order, and runs every verification command. If any step fails, the page does not ship.
:::

This scenario uses photos as a concrete example of adding a database-backed resource without hand-writing the persistence layer.

The order matters. The database schema must exist before `make:model` can inspect it and generate the matching model, repository, and Wire registration. Application-specific queries are added only after that framework-owned shape exists.

## What You Will Build

- A reversible migration creates the domain-native `photos` table.
- `forj make:model` derives `Photo` and `PhotoRepo` from the applied schema.
- The generated repository constructor is registered with the App through Wire.
- `FindReady` extends the repository package with application-specific lookup behavior.

## Prerequisites

Start from a GoForj App with SQLite database support enabled. Run the workflow from the Project root so `forj migrate` and `make:model` use the App's configured database.

## Golden Path State

Before this scenario, the App has database support but no photos table, model, repository, or repository registration.

After this scenario, the App has an applied photos schema, a schema-derived model and repository, Wire registration, and an application-owned query that propagates context into the database operation.

## Files

This scenario edits or creates:

**Database schema**

```text
migrations/2026_08_20_000001_create_photos.up.sql
migrations/2026_08_20_000001_create_photos.down.sql
```

**Photos data boundary**

```text
internal/photos/photo.go
```

**App wiring**

```text
app/wire/inject_repositories_app.go
```

## Starting State

The scenario prepares and verifies this fixture state before the target workflow begins.

The starting state is checked with:

```bash
forj build
```

## Step 1: Add the photos schema

Create or replace `migrations/2026_08_20_000001_create_photos.up.sql`:

```sql
CREATE TABLE photos (
    id INTEGER PRIMARY KEY,
    storage_key TEXT NOT NULL,
    created_at DATETIME NOT NULL
);
```

## Step 2: Add the photos rollback

Create or replace `migrations/2026_08_20_000001_create_photos.down.sql`:

```sql
DROP TABLE photos;
```

## Step 3: Apply the photos schema

```bash
forj migrate
```

## Step 4: Generate the photo model and repository

```bash
forj make:model photos --package photos --no-open
```

## Step 5: Add the application query

Append to `internal/photos/photo.go`:

```go
// FindReady returns photos available to application workflows in newest-first order.
func (r *PhotoRepo) FindReady(ctx context.Context) ([]Photo, error) {
        connection, err := r.WithContext(ctx).Builder()
        if err != nil {
                return nil, err
        }
        var photos []Photo
        if err := connection.Order("created_at DESC").Find(&photos).Error; err != nil {
                return nil, err
        }
        return photos, nil
}
```

## Build and Verify

```bash
forj build
```

```bash
go test ./...
```

## Common Mistakes

::: warning Common mistakes
- Do not hand-create a GORM model or repository when `make:model` applies.
- Do not run `make:model` before applying the migration; the command derives its output from the live schema.
- Do not prefix `photos` with the Project name unless an existing schema or explicit requirement calls for that convention.
- Do not move application queries into controllers or services; keep persistence access inside the repository package.
:::

## Next Steps

- Add relationships in `.db-relationships.yaml` before regenerating models that depend on related tables.
- [Repositories](/data/repositories) explains schema-derived generation and application-owned query methods in depth.
- [Database Migrations](/data/migrations) covers connection-specific migration workflows.
