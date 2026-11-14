---
title: "Catalog Search Resource Boundary"
description: "Prepare an App-owned catalog schema and generated named search resource."
---

# Catalog Search Resource Boundary

::: info Verified Scenario
This page is generated from an executable spec. An automated suite renders a fresh App from the current GoForj templates, applies every step below in order, and runs every verification command. If any step fails, the page does not ship.
:::

The database remains durable truth; this local index projects already committed products.

## Prerequisites

Use a GoForj version with the optional Search component. The owning App declares schemas in Go and configures backend locations through Search environment settings. The prepared fixture pins the search root and embedded Bleve module independently at v0.1.1.

## Golden Path State

Before this scenario, the App has no catalog projection.

After this scenario, the App owns a catalog schema, provisioned Bleve backend, and generated Catalog accessor.

## Files

This scenario edits or creates:

```text
internal/catalog/product.go
app/search.go
internal/searches/accessors_gen.go
tools/search-provision/main.go
```

## Step 1: Define the product projection

Create or replace `internal/catalog/product.go`:

```go
// Package catalog owns the rebuildable product search projection.
package catalog

import "github.com/goforj/search"

// Product is a projection of a durable catalog record, not its persistence model.
type Product struct {
	ID          string `json:"id"`
	Description string `json:"description"`
	Category    string `json:"category"`
}

// Definition declares lexical text separately from exact category and stable ordering.
func Definition() search.Definition {
	return search.Definition{Name: "catalog", Fields: []search.Field{
		{Name: "description", Type: search.TextField, Searchable: true},
		{Name: "category", Type: search.KeywordField, Filterable: true},
		{Name: "id", Type: search.KeywordField, Required: true, Sortable: true},
	}, DefaultSearchable: []search.FieldName{"description"}}
}
```

## Step 2: Import the App-owned schema

Update `app/search.go` so it includes:

```go
import ("github.com/goforj/search"; "example.com/invoiceeval/internal/catalog")
```

## Step 3: Bind the logical catalog name to its explicit schema

Update `app/search.go` so it includes:

```go
return map[string]search.Definition{"catalog": catalog.Definition()}
```

## Step 4: Configure the physical index independently from its schema

Append to `.env`:

```
SEARCH_CATALOG_PATH=_data/search/catalog
```

## Step 5: Generate the declared named search accessor

```bash
forj generate --search
```

## Step 6: Add explicit provisioning without initializing the App graph

Create or replace `tools/search-provision/main.go`:

```go
// Package main provisions the App's explicitly declared search projection.
package main

import (
	"context"
	"example.com/invoiceeval/app"
	"example.com/invoiceeval/internal/searches"
	"github.com/goforj/env/v2"
	"log"
	"time"
)

// main provisions before App initialization can require existing index schemas.
func main() {
	if err := env.Load(); err != nil {
		log.Fatal(err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := searches.Provision(ctx, app.SearchDefinitions()); err != nil {
		log.Fatal(err)
	}
}
```

## Step 7: Provision the declared schema before runtime validation

```bash
go run ./tools/search-provision
```

## Build and Verify

```bash
go test ./internal/catalog
```

```bash
forj build
```

## Troubleshooting

An index-not-found startup error means the schema needs explicit provisioning. Stop the Bleve owner before provisioning the same path. Schema drift requires an application-owned rebuild into a new path or service prefix; changing environment variables must not silently recreate existing data. A configured index without an App definition is a composition error.

## Common Mistakes

::: warning Common mistakes
- Do not open backend drivers in catalog services or treat the index as the durable product database.
- Do not initialize the App graph before explicitly provisioning its first index schema.
- Do not report accepted writes as visible without checking the receipt outcome.
:::

## Next Steps

- Backfill the projection from committed database records and retain an explicit update and recovery policy.
- Add App-owned facets and escaped highlight rendering when the product requires them.
