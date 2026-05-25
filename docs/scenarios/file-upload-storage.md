---
title: File Upload To Storage
description: Add an upload endpoint that writes files to a named GoForj storage disk.
---

# File Upload To Storage

This scenario adds a `POST /api/v1/uploads` endpoint that writes a file to a named `uploads` storage disk.

The example uses a small JSON payload so the page can focus on the GoForj storage boundary. Multipart parsing, streaming uploads, and large object handling are separate HTTP concerns.

## What You Will Build

- `STORAGE_UPLOADS_*` defines a named storage disk.
- `app.Storage().Uploads()` exposes the generated disk accessor.
- `UploadService` validates and writes files.
- `UploadController` binds request input and returns the stored path.
- Wire provides the named disk and service.
- A service test uses memory storage and does not start HTTP.

## Prerequisites

Start from the App used in the previous scenarios.

The generated App should have HTTP and storage support enabled.

## Files

This scenario edits or creates:

```text
.env
internal/uploads/service.go
internal/uploads/service_test.go
internal/uploads/controller.go
wire/inject_app_services.go
wire/inject_http_controllers.go
internal/router/routes_registry.go
```

The storage generator updates:

```text
internal/storages/accessors_gen.go
internal/storages/manager_gen.go
```

Do not edit generated storage files by hand.

## Step 1: Add A Named Storage Disk

Add a named `uploads` disk to `.env`:

```dotenv
STORAGE_UPLOADS_DRIVER=local
STORAGE_UPLOADS_ROOT=storage/app/uploads
STORAGE_UPLOADS_PREFIX=
```

If your App uses `STORAGE_SUPPORTED_DRIVERS`, make sure `local` is included:

```dotenv
STORAGE_SUPPORTED_DRIVERS=local
```

Run:

```bash
forj build
```

::: info Dev Loop
During `forj dev`, the generated build watcher normally runs `forj build` for you.
:::

After generation, the App should expose:

```go
app.Storage().Uploads()
```

## Step 2: Add The Service

Create `internal/uploads/service.go`:

```go
package uploads

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"path"
	"strings"
	"time"

	"github.com/goforj/storage"
)

const maxUploadBytes = 2 * 1024 * 1024

var (
	ErrFilenameRequired = errors.New("filename is required")
	ErrBodyRequired     = errors.New("body is required")
	ErrUploadTooLarge   = errors.New("upload is too large")
)

type Service struct {
	disk storage.Storage
}

type StoreInput struct {
	Filename    string
	ContentType string
	BodyBase64  string
}

type StoredUpload struct {
	Path        string `json:"path"`
	ContentType string `json:"content_type"`
	Size        int    `json:"size"`
}

func NewService(disk storage.Storage) *Service {
	return &Service{disk: disk}
}

func (s *Service) Store(ctx context.Context, input StoreInput) (StoredUpload, error) {
	filename := safeFilename(input.Filename)
	if filename == "" {
		return StoredUpload{}, ErrFilenameRequired
	}
	if strings.TrimSpace(input.BodyBase64) == "" {
		return StoredUpload{}, ErrBodyRequired
	}

	body, err := base64.StdEncoding.DecodeString(input.BodyBase64)
	if err != nil {
		return StoredUpload{}, fmt.Errorf("decode upload body: %w", err)
	}
	if len(body) == 0 {
		return StoredUpload{}, ErrBodyRequired
	}
	if len(body) > maxUploadBytes {
		return StoredUpload{}, ErrUploadTooLarge
	}

	storedPath := path.Join("incoming", time.Now().UTC().Format("20060102"), filename)
	if err := s.disk.WithContext(ctx).Put(storedPath, body); err != nil {
		return StoredUpload{}, fmt.Errorf("store upload: %w", err)
	}

	contentType := strings.TrimSpace(input.ContentType)
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	return StoredUpload{
		Path:        storedPath,
		ContentType: contentType,
		Size:        len(body),
	}, nil
}

func safeFilename(name string) string {
	name = strings.TrimSpace(name)
	name = path.Base(strings.ReplaceAll(name, "\\", "/"))
	name = strings.Trim(name, ".")
	return name
}
```

The service receives `storage.Storage`, not a local filesystem or S3 client.

## Step 3: Add The Controller

Create `internal/uploads/controller.go`:

```go
package uploads

import (
	"errors"
	"net/http"

	"github.com/goforj/web"
)

type Controller struct {
	service *Service
}

type StoreRequest struct {
	Filename    string `json:"filename"`
	ContentType string `json:"content_type"`
	BodyBase64  string `json:"body_base64"`
}

func NewController(service *Service) *Controller {
	return &Controller{service: service}
}

func (c *Controller) Routes() []web.Route {
	return []web.Route{
		web.NewRoute(http.MethodPost, "/uploads", c.Store),
	}
}

func (c *Controller) Store(ctx web.Context) error {
	var req StoreRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": "invalid payload",
		})
	}

	upload, err := c.service.Store(ctx.Context(), StoreInput{
		Filename:    req.Filename,
		ContentType: req.ContentType,
		BodyBase64:  req.BodyBase64,
	})
	if errors.Is(err, ErrFilenameRequired) ||
		errors.Is(err, ErrBodyRequired) ||
		errors.Is(err, ErrUploadTooLarge) {
		return ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
	}
	if err != nil {
		return err
	}

	return ctx.JSON(http.StatusCreated, upload)
}
```

The controller owns request binding and HTTP status decisions. The service owns storage behavior.

## Step 4: Wire The Disk And Service

Open `wire/inject_app_services.go`.

Add imports for storage, the generated storage manager, and uploads:

```go
import (
	"github.com/goforj/storage"

	"your/module/internal/storages"
	"your/module/internal/uploads"
)
```

Add providers:

```go
var appSet = wire.NewSet(
	provideCacheManager,
	provideStorageManager,
	provideEventManager,
	provideInspectManager,
	provideUploadsDisk,
	uploads.NewService,
	// existing providers...
)

func provideUploadsDisk(manager *storages.Manager) storage.Storage {
	return manager.Uploads()
}
```

The App can now provide `UploadService` with the named disk.

## Step 5: Provide The Controller

Open `wire/inject_http_controllers.go`.

Add the package import:

```go
import (
	// existing imports...

	"your/module/internal/uploads"
)
```

Add the controller constructor:

```go
var httpAppControllerSet = wire.NewSet(
	uploads.NewController,
	// existing controllers...
)
```

## Step 6: Register The Route

Open `internal/router/routes_registry.go`.

Add the package import:

```go
import (
	"github.com/goforj/web"

	"your/module/internal/uploads"
)
```

Add the controller to `ProvideAppRoutes`:

```go
func ProvideAppRoutes(
	// existing controllers...
	uploadsController *uploads.Controller,
) *AppRoutes {
	var publicRoutes []web.Route
	var protectedRoutes []web.Route

	publicRoutes = append(publicRoutes, uploadsController.Routes()...)

	// existing route registration...

	return &AppRoutes{
		public:    publicRoutes,
		protected: protectedRoutes,
	}
}
```

Generated Apps mount public routes under `/api/v1`, so the controller route `/uploads` becomes `/api/v1/uploads`.

## Step 7: Build

Run:

```bash
forj build
```

This refreshes storage accessors, regenerates Wire, builds API index artifacts, and builds the App.

## Verify

List routes:

```bash
forj run route:list
```

You should see:

```text
POST /api/v1/uploads
```

Run the HTTP server:

```bash
forj run api
```

Send a small upload:

```bash
curl -X POST http://localhost:3000/api/v1/uploads \
  -H 'Content-Type: application/json' \
  -d '{"filename":"hello.txt","content_type":"text/plain","body_base64":"aGVsbG8="}'
```

Expected response:

```json
{"path":"incoming/20260525/hello.txt","content_type":"text/plain","size":5}
```

The date segment uses the current UTC date.

## Test The Service

Create `internal/uploads/service_test.go`:

```go
package uploads

import (
	"context"
	"testing"

	"github.com/goforj/storage"
	"github.com/goforj/storage/driver/memorystorage"
)

func TestServiceStoresUpload(t *testing.T) {
	ctx := context.Background()
	disk, err := storage.Build(memorystorage.Config{})
	if err != nil {
		t.Fatalf("build storage: %v", err)
	}

	service := NewService(disk)
	upload, err := service.Store(ctx, StoreInput{
		Filename:    "../hello.txt",
		ContentType: "text/plain",
		BodyBase64:  "aGVsbG8=",
	})
	if err != nil {
		t.Fatalf("store upload: %v", err)
	}
	if upload.Path == "" {
		t.Fatal("expected stored path")
	}
	if upload.Size != 5 {
		t.Fatalf("upload size = %d, want 5", upload.Size)
	}

	body, err := disk.WithContext(ctx).Get(upload.Path)
	if err != nil {
		t.Fatalf("read upload: %v", err)
	}
	if string(body) != "hello" {
		t.Fatalf("body = %q, want %q", string(body), "hello")
	}
}

func TestServiceRejectsMissingFilename(t *testing.T) {
	ctx := context.Background()
	disk, err := storage.Build(memorystorage.Config{})
	if err != nil {
		t.Fatalf("build storage: %v", err)
	}

	service := NewService(disk)
	_, err = service.Store(ctx, StoreInput{
		BodyBase64: "aGVsbG8=",
	})
	if err == nil {
		t.Fatal("expected error")
	}
}
```

Run:

```bash
go test ./...
```

The test uses memory storage. It does not create local files and does not require S3.

## Swap The Driver

To use S3 in production, compile S3 support and select it for the named disk:

```dotenv
STORAGE_SUPPORTED_DRIVERS=local,s3
STORAGE_UPLOADS_DRIVER=s3
STORAGE_UPLOADS_BUCKET=my-app-uploads
STORAGE_UPLOADS_REGION=us-east-1
STORAGE_UPLOADS_PREFIX=uploads
```

Then run:

```bash
forj build
```

Business code does not change. The service still receives `storage.Storage`.

## Operations

The `uploads` disk is a named resource.

That means it can appear in:

- generated storage accessors
- storage operation metrics
- inspect records
- Lighthouse runtime views
- driver configuration

Store metadata such as owner, original filename, content type, and retention policy in durable application state when those values matter. Storage paths alone should not be the only source of business truth.

## Common Mistakes

- Do not trust raw user filenames as storage paths.
- Do not import S3, GCS, or local driver packages into `UploadService`.
- Do not edit generated storage accessors by hand.
- Do not forget `forj build` after adding `STORAGE_UPLOADS_*`.
- Do not store ownership, authorization, or lifecycle rules only in object paths.

## Next Step

Next, publish a `users.created` event and handle it with [Users Created Event](/scenarios/users-created-event).
