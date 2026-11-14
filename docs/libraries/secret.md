---
title: Secret Library for Go
description: "Read, replace, and delete bound secrets across encrypted local files and managed providers."
repoSlug: secret
repoUrl: https://github.com/goforj/secret
noAutoTitle: true
---

# Secret Library for Go {#secret-library-for-go}

<p align="center">
  <img src="https://raw.githubusercontent.com/goforj/secret/main/docs/assets/logo.png" width="300" alt="secret">
</p>

<p align="center">Read, replace, and delete bound secrets through a small Go API.</p>

<p align="center">
  <a href="https://github.com/goforj/secret/blob/main/LICENSE"><img src="https://raw.githubusercontent.com/goforj/secret/main/docs/assets/badges/summary-license.svg" alt="License: MIT"></a>
  <a href="https://go.dev"><img src="https://raw.githubusercontent.com/goforj/secret/main/docs/assets/badges/summary-go.svg" alt="Go: 1.24.4+"></a>
  <img src="https://raw.githubusercontent.com/goforj/secret/main/docs/assets/badges/summary-status.svg" alt="Status: v0.1.0 candidate">
  <a href="https://app.codecov.io/gh/goforj/secret"><img src="https://raw.githubusercontent.com/goforj/secret/main/docs/assets/badges/summary-coverage.svg" alt="Library unit coverage: 100%"></a>
  <img src="https://raw.githubusercontent.com/goforj/secret/main/docs/assets/badges/summary-tests.svg" alt="Executed library unit tests">
</p>

<p align="center">
  <a href="#features">Features</a> · <a href="#quick-start">Quick Start</a> · <a href="#drivers">Drivers</a> · <a href="#installation">Installation</a> · <a href="#how-it-works">How it works</a> · <a href="#runnable-examples">Examples</a> · <a href="#api-index">API</a>
</p>

Bind names such as `DATABASE_PASSWORD` to encrypted local files, AWS Secrets Manager, Google Secret Manager, Azure Key Vault, or Vault KV v2. Application code reads by name through `secret.Reader`; provider SDKs and resource locations stay in setup code.

Managed drivers also support replacing and deleting existing secrets. You own provisioning, authentication, and access policies.

## Features {#features}

<table>
<thead><tr><th align="left">Feature</th><th align="left">What you get</th></tr></thead>
<tbody>
<tr><td><img src="https://raw.githubusercontent.com/goforj/secret/main/docs/assets/badges/feature-icon-simple.svg" width="22" height="22" alt="" align="absmiddle"> <strong>Small capabilities</strong></td><td>Read, replace, or delete with ordinary strings.</td></tr>
<tr><td><img src="https://raw.githubusercontent.com/goforj/secret/main/docs/assets/badges/feature-icon-bindings.svg" width="22" height="22" alt="" align="absmiddle"> <strong>Explicit bindings</strong></td><td>Choose provider locations once during construction.</td></tr>
<tr><td><img src="https://raw.githubusercontent.com/goforj/secret/main/docs/assets/badges/feature-icon-bytes.svg" width="22" height="22" alt="" align="absmiddle"> <strong>Exact values</strong></td><td>Preserve bytes within each provider&#39;s documented limits.</td></tr>
<tr><td><img src="https://raw.githubusercontent.com/goforj/secret/main/docs/assets/badges/feature-icon-errors.svg" width="22" height="22" alt="" align="absmiddle"> <strong>Safe failures</strong></td><td>Classify driver failures without exposing provider errors.</td></tr>
<tr><td><img src="https://raw.githubusercontent.com/goforj/secret/main/docs/assets/badges/feature-icon-mutations.svg" width="22" height="22" alt="" align="absmiddle"> <strong>Deliberate mutations</strong></td><td>Serialize same-secret writes and report uncertain outcomes.</td></tr>
<tr><td><img src="https://raw.githubusercontent.com/goforj/secret/main/docs/assets/badges/feature-icon-testing.svg" width="22" height="22" alt="" align="absmiddle"> <strong>Isolated testing</strong></td><td>Use a concurrency-safe store for application fixtures.</td></tr>
</tbody>
</table>


## Quick Start {#quick-start}

Encrypt a local secret with AES-256-GCM. The `directory` must already exist; `key` is a random 32-byte key loaded from a separate key manager. The caller owns the key and closes the root.

```go
root, err := os.OpenRoot(directory)
if err != nil {
	panic(err)
}
defer root.Close()

store, err := filesecret.NewStore(root, key, map[string]string{
	"DATABASE_PASSWORD": "database-password.enc",
})
if err != nil {
	panic(err)
}
ctx := context.Background()
if err := store.Set(ctx, "DATABASE_PASSWORD", "public-example-password"); err != nil {
	panic(err)
}
password, err := store.Get(ctx, "DATABASE_PASSWORD")
if err != nil {
	panic(err)
}
// Pass password to your database client instead of logging it.
_ = password
fmt.Println("credential loaded")
// Output: credential loaded

if err := store.Delete(ctx, "DATABASE_PASSWORD"); err != nil {
	panic(err)
}
fmt.Println("credential deleted")
// Output: credential deleted
```

Import `github.com/goforj/secret/driver/filesecret` for this example. The complete [runnable program](https://github.com/goforj/secret/blob/main/examples/encrypted/main.go) uses a disposable key and directory. For persistent data, use the [key-loading and recovery workflow](https://github.com/goforj/secret/blob/main/docs/drivers.md#persistent-keys-and-recovery) and keep the key outside the secret directory. File confinement requires Go 1.25.12+, Go 1.26.5+, or stable Go 1.27+.

`NewStore` encrypts and authenticates values on disk. `New` is a separate, read-only **plaintext** reader for externally managed Docker and Kubernetes mounts. See [file encryption and key management](https://github.com/goforj/secret/blob/main/docs/drivers.md#encrypted-local-files).

For key rotation, `NewStoreWithKeys(root, currentKey, bindings, previousKeys...)` reads with current or previous keys and always writes with the current key. Call `store.Rotate(ctx)` to migrate existing files; [see the example](#rotate-files).

Each `Get` reads one binding. Reuse the reader and context for additional names; the same pattern works with every managed driver. Reads are independent, so values read together are not an atomic snapshot.

Application services can accept `secret.Reader`. Workflows that replace or delete values can accept `secret.Writer`, `secret.Deleter`, or `secret.Store`.

## Drivers {#drivers}

<table>
<thead><tr><th align="left">Driver</th><th align="left">Behavior</th><th align="left">Verification</th></tr></thead>
<tbody>
<tr><td><img src="https://raw.githubusercontent.com/goforj/secret/main/docs/assets/badges/driver-icon-aws.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/secret/tree/main/driver/awssecret"><strong>AWS Secrets Manager</strong></a></td><td>Text or binary; standard recovery window</td><td>Moto 5.1.16 emulator</td></tr>
<tr><td><img src="https://raw.githubusercontent.com/goforj/secret/main/docs/assets/badges/driver-icon-azure.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/secret/tree/main/driver/azuresecret"><strong>Azure Key Vault</strong></a></td><td>UTF-8; vault-configured soft deletion</td><td>Lowkey Vault 7.4.0 emulator</td></tr>
<tr><td><img src="https://raw.githubusercontent.com/goforj/secret/main/docs/assets/badges/driver-icon-files.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/secret/tree/main/driver/filesecret"><strong>Local files</strong></a></td><td>AES-256-GCM store; explicit plaintext mounted-file reader</td><td>Real filesystem, tampering, and projected-volume tests</td></tr>
<tr><td><img src="https://raw.githubusercontent.com/goforj/secret/main/docs/assets/badges/driver-icon-google.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/secret/tree/main/driver/gcpsecret"><strong>Google Secret Manager</strong></a></td><td>Binary values, CRC32C, and ETag deletion</td><td>Google Secret Manager emulator (pinned image)</td></tr>
<tr><td><img src="https://raw.githubusercontent.com/goforj/secret/main/docs/assets/badges/driver-icon-vault.svg" width="22" height="22" alt="" align="absmiddle"> <a href="https://github.com/goforj/secret/tree/main/driver/vaultsecret"><strong>Vault KV v2</strong></a></td><td>Owned scalar paths; CAS and all-version deletion</td><td>Real Vault 1.21.4 server</td></tr>
</tbody>
</table>


Cloud verification uses the listed emulators and real provider SDKs. Hosted AWS, Google, and Azure behavior has not been verified against dedicated accounts. See [provider contracts](https://github.com/goforj/secret/blob/main/docs/drivers.md) for value limits, deletion behavior, construction, and emulator boundaries.

## Installation {#installation}

The first `v0.1.0` release candidate is being verified; version tags have not been published. Run examples against this checkout's local modules. The examples module requires Go 1.26; use Go 1.26.5+ in that branch or stable Go 1.27+ for file examples:

```sh
git clone https://github.com/goforj/secret.git
cd secret
go -C examples run ./encrypted
go -C examples run ./reader
```

The core has no external dependencies and requires Go 1.24.4. Optional modules isolate provider SDKs and their Go requirements:

| Module | Minimum Go | Purpose |
| --- | --- | --- |
| github.com/goforj/secret | 1.24.4 | Reader, Writer, Deleter, Store, Func, and error classifications |
| github.com/goforj/secret/secrettest | 1.24.4 | Map-backed application test fixtures |
| github.com/goforj/secret/driver/awssecret | 1.24.4 | AWS Secrets Manager |
| github.com/goforj/secret/driver/azuresecret | 1.26.0 | Azure Key Vault |
| github.com/goforj/secret/driver/filesecret | 1.25.12 | Encrypted local storage and plaintext mounted-file reads |
| github.com/goforj/secret/driver/gcpsecret | 1.26.0 | Google Secret Manager |
| github.com/goforj/secret/driver/vaultsecret | 1.26.0 | Vault KV v2 |

Import only the capabilities and drivers your application needs. Provider SDK dependencies stay in their driver modules. The file driver requires a patched `os.Root` implementation; Go 1.26.0 through 1.26.4 and prerelease toolchains are unsupported. See [development and releases](https://github.com/goforj/secret/blob/main/docs/development.md) for dependency constraints and publication checks.

## How it works {#how-it-works}

- **Names and bindings.** Names follow `[A-Z][A-Z0-9_]*`, with a maximum of 255 bytes. Use application identifiers such as `DATABASE_PASSWORD`. Drivers copy bindings at construction, and unknown names never reach a provider.

- **Exact values.** Values are ordinary strings. Reads preserve exact bytes within the provider's capabilities, without trimming, JSON parsing, environment fallback, caching, or rotation. Keep returned values out of logs and diagnostics.

- **Writes and deletion.** Managed `Set` publishes a new current value at an existing resource; encrypted-file `Set` can also create a bound file. `Delete` targets the entire resource under the provider's retention policy. Vault deletion is irreversible. File deletion removes ciphertext without promising secure erasure of disk blocks or backups.

- **Concurrency.** Each first-party store serializes mutations to the same binding. Different bindings and reads can proceed concurrently. Mutable resources require [exclusive lifecycle ownership](https://github.com/goforj/secret/blob/main/docs/drivers.md), including across separate store instances.

- **Retries.** Provider SDK retries remain caller-owned except Google version creation, where the driver disables automatic retries.

- **Safe failures.** Errors support `errors.Is` with `ErrInvalid`, `ErrNotFound`, `ErrPermission`, `ErrUnavailable`, and `ErrIndeterminate`. First-party drivers do not retain provider errors or response bodies in returned errors. `secret.Func` returns callback errors unchanged; the callback owns their classification and sanitization.

- **Uncertain writes.** Check `ErrIndeterminate` before cancellation or deadline errors. A canceled mutation may still have committed remotely, so reconcile before retrying. Caller cancellation remains detectable alongside `ErrIndeterminate`. See the [uncertain-write example](#mutation-errors).

- **Client ownership.** Constructing code owns the SDK client or file root. Drivers borrow them and never close them. First-party drivers do not log; review injected client logging separately because it can disclose provider metadata.

## Runnable Examples {#runnable-examples}

Run from the repository root. No credentials required:

```sh
go -C examples run ./encrypted         # Encrypted files
go -C examples run ./rotation          # Encryption key rotation
go -C examples run ./files             # Plaintext mounted files
go -C examples run ./reader            # Reader adapter
go -C examples run ./errors            # Uncertain writes
go -C examples test -run TestStore -v   # Application tests
```

Configured examples: [persistent keys](https://github.com/goforj/secret/blob/main/docs/drivers.md#persistent-keys-and-recovery) · [managed providers](https://github.com/goforj/secret/blob/main/docs/drivers.md#running-provider-examples).

## API Index {#api-index}

| Group | Functions |
| --- | --- |
| Core | [Func.Get](#reader-adapter) · [Reader.Get](#mounted-files) · [Store.Delete](#application-testing) · [Store.Set](#application-testing) · [Writer.Set](#mutation-errors) · [filesecret.Store.Rotate](#rotate-files) |
| Driver Constructors | [awssecret.New](#aws-secrets) · [azuresecret.New](#azure-secrets) · [filesecret.NewStoreWithKeys](#rotate-files) · [filesecret.NewStore](#encrypted-files) · [filesecret.New](#mounted-files) · [gcpsecret.New](#google-secrets) · [vaultsecret.New](#vault-secrets) |
| Errors | [ErrIndeterminate](#mutation-errors) · [ErrNotFound](#reader-adapter) |
| Testing | [secrettest.New](#application-testing) |


## Examples {#examples}

Provider snippets use resource identifiers from your application configuration. The complete programs accept those identifiers as command-line flags.

<a id="encrypted-files"></a>

### Store encrypted files {#store-encrypted-files}

[Complete source](https://github.com/goforj/secret/blob/main/examples/encrypted/main.go)

```go
root, err := os.OpenRoot(directory)
if err != nil {
	panic(err)
}
defer root.Close()

store, err := filesecret.NewStore(root, key, map[string]string{
	"DATABASE_PASSWORD": "database-password.enc",
})
if err != nil {
	panic(err)
}
ctx := context.Background()
if err := store.Set(ctx, "DATABASE_PASSWORD", "public-example-password"); err != nil {
	panic(err)
}
password, err := store.Get(ctx, "DATABASE_PASSWORD")
if err != nil {
	panic(err)
}
// Pass password to your database client instead of logging it.
_ = password
fmt.Println("credential loaded")
// Output: credential loaded

if err := store.Delete(ctx, "DATABASE_PASSWORD"); err != nil {
	panic(err)
}
fmt.Println("credential deleted")
// Output: credential deleted
```

<a id="persistent-keys"></a>

### Load a persistent encryption key {#load-a-persistent-encryption-key}

[Complete source](https://github.com/goforj/secret/blob/main/examples/configured/persistent/main.go)

```go
key, err := loadKey(keyFile)
if err != nil {
	return err
}
root, err := os.OpenRoot(directory)
if err != nil {
	return errors.New("encrypted secret directory unavailable")
}
defer root.Close()
store, err := filesecret.NewStore(root, key, map[string]string{
	"DATABASE_PASSWORD": "database-password.enc",
})
if err != nil {
	return err
}
password, err := store.Get(context.Background(), "DATABASE_PASSWORD")
if err != nil {
	return err
}
// Pass password to your database client instead of logging it.
_ = password
fmt.Println("credential loaded from persistent key")
// Output: credential loaded from persistent key
```

<a id="rotate-files"></a>

### Rotate encryption keys {#rotate-encryption-keys}

[Complete source](https://github.com/goforj/secret/blob/main/examples/rotation/main.go)

```go
store, err := filesecret.NewStoreWithKeys(root, currentKey, bindings, previousKey)
if err != nil {
	panic(err)
}
ctx := context.Background()
if _, err := store.Get(ctx, "DATABASE_PASSWORD"); err != nil {
	panic(err)
}
fmt.Println("old-key credential readable")
// Output: old-key credential readable

if err := store.Rotate(ctx); err != nil {
	panic(err)
}
fmt.Println("files rotated")
// Output: files rotated

currentOnly, err := filesecret.NewStore(root, currentKey, bindings)
if err != nil {
	panic(err)
}
if _, err := currentOnly.Get(ctx, "DATABASE_PASSWORD"); err != nil {
	panic(err)
}
fmt.Println("credential readable without previous key")
// Output: credential readable without previous key
```

<a id="mounted-files"></a>

### Read mounted files {#read-mounted-files}

[Complete source](https://github.com/goforj/secret/blob/main/examples/files/main.go)

```go
root, err := os.OpenRoot(directory)
if err != nil {
	panic(err)
}
defer root.Close()

reader, err := filesecret.New(root, map[string]string{
	"DATABASE_USERNAME": "database-username",
	"DATABASE_PASSWORD": "database-password",
})
if err != nil {
	panic(err)
}

ctx := context.Background()
username, err := reader.Get(ctx, "DATABASE_USERNAME")
if err != nil {
	panic(err)
}
password, err := reader.Get(ctx, "DATABASE_PASSWORD")
if err != nil {
	panic(err)
}
// Pass both values directly to your database client. Keep them out of logs.
_, _ = username, password
fmt.Println("database credentials loaded")
// Output: database credentials loaded
```

<a id="aws-secrets"></a>

### Read from AWS Secrets Manager {#read-from-aws-secrets-manager}

[Complete source](https://github.com/goforj/secret/blob/main/examples/providers/aws/main.go)

```go
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()
cfg, err := config.LoadDefaultConfig(ctx)
if err != nil {
	return err
}
client := secretsmanager.NewFromConfig(cfg)
store, err := awssecret.New(client, map[string]awssecret.Binding{
	"DATABASE_PASSWORD": {ARN: arn, Encoding: awssecret.Text},
})
if err != nil {
	return err
}
password, err := store.Get(ctx, "DATABASE_PASSWORD")
if err != nil {
	return err
}
// Pass password to your database client instead of logging it.
_ = password
fmt.Println("credential loaded")
// Output: credential loaded
```

<a id="google-secrets"></a>

### Read from Google Secret Manager {#read-from-google-secret-manager}

[Complete source](https://github.com/goforj/secret/blob/main/examples/providers/gcp/main.go)

```go
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()
client, err := secretmanager.NewClient(ctx)
if err != nil {
	return err
}
defer client.Close()
store, err := gcpsecret.New(client, parent, map[string]string{
	"DATABASE_PASSWORD": id,
})
if err != nil {
	return err
}
password, err := store.Get(ctx, "DATABASE_PASSWORD")
if err != nil {
	return err
}
// Pass password to your database client instead of logging it.
_ = password
fmt.Println("credential loaded")
// Output: credential loaded
```

<a id="azure-secrets"></a>

### Read from Azure Key Vault {#read-from-azure-key-vault}

[Complete source](https://github.com/goforj/secret/blob/main/examples/providers/azure/main.go)

```go
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()
credential, err := azidentity.NewDefaultAzureCredential(nil)
if err != nil {
	return err
}
client, err := azsecrets.NewClient(vault, credential, nil)
if err != nil {
	return err
}
store, err := azuresecret.New(client, map[string]azuresecret.Binding{
	"DATABASE_PASSWORD": {Name: name},
})
if err != nil {
	return err
}
password, err := store.Get(ctx, "DATABASE_PASSWORD")
if err != nil {
	return err
}
// Pass password to your database client instead of logging it.
_ = password
fmt.Println("credential loaded")
// Output: credential loaded
```

<a id="vault-secrets"></a>

### Read from Vault KV v2 {#read-from-vault-kv-v2}

[Complete source](https://github.com/goforj/secret/blob/main/examples/providers/vault/main.go)

```go
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()
client, err := api.NewClient(nil)
if err != nil {
	return err
}
store, err := vaultsecret.New(client.KVv2(mount), map[string]string{
	"DATABASE_PASSWORD": path,
})
if err != nil {
	return err
}
password, err := store.Get(ctx, "DATABASE_PASSWORD")
if err != nil {
	return err
}
// Pass password to your database client instead of logging it.
_ = password
fmt.Println("credential loaded")
// Output: credential loaded
```

<a id="reader-adapter"></a>

### Adapt an existing reader {#adapt-an-existing-reader}

[Complete source](https://github.com/goforj/secret/blob/main/examples/reader/main.go)

```go
reader := secret.Func(func(ctx context.Context, name string) (string, error) {
	if name != "DATABASE_PASSWORD" {
		return "", secret.ErrNotFound
	}
	return "public-example-password", nil
})

ctx := context.Background()
if _, err := reader.Get(ctx, "DATABASE_PASSWORD"); err != nil {
	panic(err)
}
fmt.Println("credential loaded")
// Output: credential loaded

if _, err := reader.Get(ctx, "UNKNOWN"); !errors.Is(err, secret.ErrNotFound) {
	panic("expected an unknown name to return ErrNotFound")
}
fmt.Println("unknown name rejected")
// Output: unknown name rejected
```

<a id="mutation-errors"></a>

### Handle an uncertain write {#handle-an-uncertain-write}

[Complete source](https://github.com/goforj/secret/blob/main/examples/errors/main.go)

```go
err := writer.Set(context.Background(), "DATABASE_PASSWORD", "public-replacement")
if errors.Is(err, secret.ErrIndeterminate) {
	// Read back or reconcile through provider tooling before attempting another write.
	fmt.Println("check provider state before retrying")
	// Output: check provider state before retrying
} else if err != nil {
	panic(err)
}
fmt.Println("deadline still detectable:", errors.Is(err, context.DeadlineExceeded))
// Output: deadline still detectable: true
```

<a id="application-testing"></a>

### Test replacements and deletion {#test-replacements-and-deletion}

[Complete source](https://github.com/goforj/secret/blob/main/examples/testing_test.go)

```go
store := secrettest.New(t, map[string]string{
	"DATABASE_PASSWORD": "public-test-password",
})
ctx := context.Background()

if err := store.Set(ctx, "DATABASE_PASSWORD", "public-replacement"); err != nil {
	t.Fatal(err)
}
if _, err := store.Get(ctx, "DATABASE_PASSWORD"); err != nil {
	t.Fatal(err)
}
fmt.Println("replacement readable")
// Output: replacement readable

if err := store.Delete(ctx, "DATABASE_PASSWORD"); err != nil {
	t.Fatal(err)
}
if _, err := store.Get(ctx, "DATABASE_PASSWORD"); !errors.Is(err, secret.ErrNotFound) {
	t.Fatal("deleted fixture remains readable")
}
fmt.Println("removed")
// Output: removed
```



## Development {#development}

```sh
make test
make test-race
make vet
make test-integration
make test-coverage
make generate
make check-generated
make modules-check
```

Integration tests require Docker. They use real provider SDKs and isolated public fixtures. Unit coverage is measured independently from integration coverage and enforced at exactly 100% of library statements. Badges are generated from passing test evidence tied to the library source. README snippets come from the example programs.

See [development and releases](https://github.com/goforj/secret/blob/main/docs/development.md) and the [accepted design](https://github.com/goforj/secret/blob/main/docs/design.md) for detailed contracts and verification policy.

## License {#license}

MIT. See [LICENSE](https://github.com/goforj/secret/blob/main/LICENSE).
