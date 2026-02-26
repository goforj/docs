---
title: Crypt
---

<p align="center">
  <img src="https://raw.githubusercontent.com/goforj/crypt/main/docs/images/logo.png?v=2" width="400" alt="crypt logo">
</p>

<p align="center">
    Laravel-compatible symmetric encryption for Go - AES-128/256 CBC with HMAC, key rotation, and portable payloads.
</p>

<p align="center">
    <a href="https://pkg.go.dev/github.com/goforj/crypt"><img src="https://pkg.go.dev/badge/github.com/goforj/crypt.svg" alt="Go Reference"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
    <a href="https://github.com/goforj/crypt/actions"><img src="https://github.com/goforj/crypt/actions/workflows/test.yml/badge.svg" alt="Go Test"></a>
    <a href="https://golang.org"><img src="https://img.shields.io/badge/go-1.18+-blue?logo=go" alt="Go version"></a>
    <img src="https://img.shields.io/github/v/tag/goforj/crypt?label=version&sort=semver" alt="Latest tag">
    <a href="https://codecov.io/gh/goforj/crypt" ><img src="https://codecov.io/github/goforj/crypt/graph/badge.svg?token=Z8NM86Q50C"/></a>
    <a href="https://goreportcard.com/report/github.com/goforj/crypt"><img src="https://goreportcard.com/badge/github.com/goforj/crypt" alt="Go Report Card"></a>
</p>

<p align="center">
  <code>crypt</code> mirrors Laravel's encryption format so Go services can read and write the same ciphertext as PHP apps. It signs every payload with an HMAC and supports graceful key rotation via <code>APP_PREVIOUS_KEYS</code>.
</p>

# Features {#features}

- AES-128 / AES-256 encryption compatible with Laravel
- Authenticated encryption (AES-CBC + HMAC)
- Transparent key rotation via `APP_PREVIOUS_KEYS`
- Zero dependencies (stdlib only)
- Deterministic, testable API
- Safe defaults with explicit failure modes

## Install {#install}

```bash
go get github.com/goforj/crypt
```

## Quickstart {#quickstart}

```go
package main

import (
	"fmt"
	"os"

	"github.com/goforj/crypt"
)

func main() {
	// Typical Laravel-style key: base64 + 32 bytes (AES-256) or 16 bytes (AES-128).
	if err := os.Setenv("APP_KEY", "base64:..."); err != nil {
		panic(err)
	}

	ciphertext, err := crypt.Encrypt("secret")
	if err != nil {
		panic(err)
	}

	plaintext, err := crypt.Decrypt(ciphertext)
	if err != nil {
		panic(err)
	}

	fmt.Println(plaintext) // "secret"
}
```

Here’s a cleaner, tighter rewrite that keeps the same meaning but reads more confidently and fluently:

## Key format & rotation {#key-format-&-rotation}

`crypt` follows Laravel’s key format and rotation model.

* **`APP_KEY`** must be prefixed with `base64:` and decode to either **16 bytes (AES-128)** or **32 bytes (AES-256)**.
* **`APP_PREVIOUS_KEYS`** is optional and may contain a comma-separated list of older keys in the same format.
* During decryption, the current key is tried first, followed by any previous keys.
* Encryption **always** uses the current `APP_KEY`; previous keys are never used for encryption.

### Example {#example}

```bash
export APP_KEY="base64:J63qRTDLub5NuZvP+kb8YIorGS6qFYHKVo6u7179stY="
export APP_PREVIOUS_KEYS="base64:2nLsGFGzyoae2ax3EF2Lyq/hH6QghBGLIq5uL+Gp8/w="
```

## CLI helpers {#cli-helpers}

Generate a Laravel-style key:

```go
k, _ := crypt.GenerateAppKey()
fmt.Println(k) // base64:...
```

Parse an existing key string:

```go
keyBytes, err := crypt.ReadAppKey("base64:...") // len == 16 or 32
```

## Runnable examples {#runnable-examples}

Every function has a corresponding runnable example under [`./examples`](https://github.com/goforj/crypt/tree/main/examples).

These examples are **generated directly from the documentation blocks** of each function, ensuring the docs and code never drift. These are the same examples you see here in the README and GoDoc.

An automated test executes **every example** to verify it builds and runs successfully.

This guarantees all examples are valid, up-to-date, and remain functional as the API evolves.

<!-- api:embed:start -->

## API Index {#api-index}

| Group | Functions |
|------:|-----------|
| **Encryption** | [Decrypt](#decrypt) [Encrypt](#encrypt) |
| **Key management** | [GenerateAppKey](#generateappkey) [GenerateKeyToEnv](#generatekeytoenv) [GetAppKey](#getappkey) [GetPreviousAppKeys](#getpreviousappkeys) [ReadAppKey](#readappkey) [RotateKeyInEnv](#rotatekeyinenv) |


## Encryption {#encryption}

### Decrypt · readonly {#decrypt}

Decrypt decrypts an encrypted payload using the APP_KEY from environment.
Falls back to APP_PREVIOUS_KEYS when the current key cannot decrypt.


<GoForjExample repo="crypt" example="decrypt">

```go
// Example: decrypt using current key
keyStr, _ := crypt.GenerateAppKey()
_ = os.Setenv("APP_KEY", keyStr)
c, _ := crypt.Encrypt("secret")
p, _ := crypt.Decrypt(c)
godump.Dump(p)

// #string "secret"

// Example: decrypt ciphertext encrypted with a previous key
oldKeyStr, _ := crypt.GenerateAppKey()
newKeyStr, _ := crypt.GenerateAppKey()
_ = os.Setenv("APP_KEY", oldKeyStr)
oldCipher, _ := crypt.Encrypt("rotated")
_ = os.Setenv("APP_KEY", newKeyStr)
_ = os.Setenv("APP_PREVIOUS_KEYS", oldKeyStr)
plain, err := crypt.Decrypt(oldCipher)
godump.Dump(plain, err)

// #string "rotated"
// #error <nil>
```

</GoForjExample>


<GoForjExample repo="crypt" example="decrypt">

```go
// Example: decrypt using current key
keyStr, _ := crypt.GenerateAppKey()
_ = os.Setenv("APP_KEY", keyStr)
c, _ := crypt.Encrypt("secret")
p, _ := crypt.Decrypt(c)
godump.Dump(p)

// #string "secret"

// Example: decrypt ciphertext encrypted with a previous key
oldKeyStr, _ := crypt.GenerateAppKey()
newKeyStr, _ := crypt.GenerateAppKey()
_ = os.Setenv("APP_KEY", oldKeyStr)
oldCipher, _ := crypt.Encrypt("rotated")
_ = os.Setenv("APP_KEY", newKeyStr)
_ = os.Setenv("APP_PREVIOUS_KEYS", oldKeyStr)
plain, err := crypt.Decrypt(oldCipher)
godump.Dump(plain, err)

// #string "rotated"
// #error <nil>
```

</GoForjExample>

### Encrypt · readonly {#encrypt}

Encrypt encrypts a plaintext using the APP_KEY from environment.

<GoForjExample repo="crypt" example="encrypt">

```go
// Example: encrypt with current APP_KEY
keyStr, _ := crypt.GenerateAppKey()
_ = os.Setenv("APP_KEY", keyStr)
ciphertext, err := crypt.Encrypt("secret")
godump.Dump(err == nil, ciphertext != "")

// #bool true
// #bool true
```

</GoForjExample>

## Key management {#key-management}

### GenerateAppKey · readonly {#generateappkey}

GenerateAppKey generates a random base64 app key prefixed with "base64:".

<GoForjExample repo="crypt" example="generateappkey">

```go
// Example: generate an AES-256 key
key, _ := crypt.GenerateAppKey()
godump.Dump(key)

// #string "base64:..."
```

</GoForjExample>

### GenerateKeyToEnv · mutates-filesystem {#generatekeytoenv}

GenerateKeyToEnv mimics Laravel's key:generate.
It generates a new APP_KEY and writes it to the provided .env path.
Other keys are preserved; APP_KEY is replaced/added.

<GoForjExample repo="crypt" example="generatekeytoenv">

```go
// Example: generate and write APP_KEY to a temp .env
tmp := filepath.Join(os.TempDir(), ".env")
key, err := crypt.GenerateKeyToEnv(tmp)
godump.Dump(err, key)

// #error <nil>
// #string "base64:..."
```

</GoForjExample>

### GetAppKey · readonly {#getappkey}

GetAppKey retrieves the APP_KEY from the environment and parses it.

<GoForjExample repo="crypt" example="getappkey">

```go
// Example: read APP_KEY and ensure the correct size
keyStr, _ := crypt.GenerateAppKey()
_ = os.Setenv("APP_KEY", keyStr)
key, err := crypt.GetAppKey()
godump.Dump(len(key), err)

// #int 32
// #error <nil>
```

</GoForjExample>

### GetPreviousAppKeys · readonly {#getpreviousappkeys}

GetPreviousAppKeys retrieves and parses APP_PREVIOUS_KEYS from the environment.
Keys are expected to be comma-delimited and prefixed with "base64:".

<GoForjExample repo="crypt" example="getpreviousappkeys">

```go
// Example: parse two previous keys (mixed AES-128/256)
k1, _ := crypt.GenerateAppKey()
k2, _ := crypt.GenerateAppKey()
_ = os.Setenv("APP_PREVIOUS_KEYS", k1+", "+k2)
keys, err := crypt.GetPreviousAppKeys()
godump.Dump(len(keys), err)

// #int 2
// #error <nil>
```

</GoForjExample>

### ReadAppKey · readonly {#readappkey}

ReadAppKey parses a base64 encoded app key with "base64:" prefix.
Accepts 16-byte keys (AES-128) or 32-byte keys (AES-256) after decoding.

<GoForjExample repo="crypt" example="readappkey">

```go
// Example: parse AES-128 and AES-256 keys
key128raw := make([]byte, 16)
_, _ = rand.Read(key128raw)
key128str := "base64:" + base64.StdEncoding.EncodeToString(key128raw)

key256str, _ := crypt.GenerateAppKey()

key128, _ := crypt.ReadAppKey(key128str)
key256, _ := crypt.ReadAppKey(key256str)
godump.Dump(len(key128), len(key256))

// #int 16
// #int 32
```

</GoForjExample>

### RotateKeyInEnv · mutates-filesystem {#rotatekeyinenv}

RotateKeyInEnv mimics Laravel's key:rotate.
It moves the current APP_KEY into APP_PREVIOUS_KEYS (prepended) and writes a new APP_KEY.

<GoForjExample repo="crypt" example="rotatekeyinenv">

```go
// Example: rotate APP_KEY and prepend old key to APP_PREVIOUS_KEYS
tmp := filepath.Join(os.TempDir(), ".env")
oldKey, _ := crypt.GenerateAppKey()
_ = os.WriteFile(tmp, []byte("APP_KEY="+oldKey+"\n"), 0o644)
newKey, err := crypt.RotateKeyInEnv(tmp)
godump.Dump(err == nil, newKey != "")

// #bool true
// #bool true
```

</GoForjExample>
<!-- api:embed:end -->
