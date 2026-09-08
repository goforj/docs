---
title: Source and Build Integrity
description: Verify an approved GoForj module version, the installed CLI, generated source, and enterprise build artifacts.
---

# Source and Build Integrity

GoForj distributes the `forj` CLI as a Go module. The supported installation
path builds the CLI from a selected module version. GoForj does not currently
publish signed CLI binaries or signed release attestations.

This page shows how to preserve source identity from intake through an
enterprise-controlled application build. It complements the repository
security controls. It does not replace review of application source,
organization settings, or the deployment environment.

## Integrity Boundaries

| Boundary | Evidence | Owner |
| --- | --- | --- |
| GoForj source intake | Exact module version, module checksum, `go.mod` checksum, source commit, and reviewed CI run | Adopting enterprise |
| CLI installation | Embedded module version and checksum in the installed binary | Adopting enterprise build system |
| Application source | Committed generated-source diff, pinned `go.mod` and `go.sum`, and application SBOM | Application team |
| Deployable artifact | Build revision, artifact digest, build provenance, signature, promotion record, and rollback reference | Adopting enterprise build and release systems |

## Verify an Approved GoForj Version

Replace the example version with the version approved through your source
intake process. Keep the resulting JSON with the assessment record.

```bash
FORJ_VERSION=v0.27.1
GOWORK=off go mod download -json \
  "github.com/goforj/goforj@$FORJ_VERSION" > forj-module.json

jq -e --arg version "$FORJ_VERSION" '
  .Version == $version and
  (.Sum | startswith("h1:")) and
  (.GoModSum | startswith("h1:")) and
  .Origin.Ref == ("refs/tags/" + $version) and
  (.Origin.Hash | test("^[0-9a-f]{40}$"))
' forj-module.json
# true
```

`Sum` identifies the module archive and `GoModSum` identifies its `go.mod`.
With the normal public Go configuration, the Go command verifies downloaded
modules against the [Go checksum database](https://go.dev/ref/mod#checksum-database).
An enterprise that replaces `GOPROXY`, `GOSUMDB`, `GONOSUMDB`, or `GOPRIVATE`
must document the equivalent trust and retention controls provided by its
internal module mirror.

The JSON also records the tag's source commit under `Origin.Hash`. Compare that
commit with the reviewed repository revision and its successful required CI
runs. A tag name by itself does not prove that those checks passed.

## Install and Inspect the CLI

Install the approved version, not `@latest`, in controlled builds:

```bash
FORJ_VERSION=v0.27.1
GOWORK=off go install \
  "github.com/goforj/goforj/cmd/forj@$FORJ_VERSION"

go version -m "$(go env GOPATH)/bin/forj" \
  | awk -v version="$FORJ_VERSION" '
      $1 == "mod" &&
      $2 == "github.com/goforj/goforj" &&
      $3 == version &&
      $4 ~ /^h1:/ { print; found=1 }
      END { exit !found }
    '
# mod github.com/goforj/goforj v0.27.1 h1:BnTxi1qbzXAWbCNt+69IRSCeKROgLmKFaaj5OUPQj+E=
```

The `mod` line proves which GoForj module and checksum were embedded in that
binary. Retain the complete `go version -m` output when the compiler version,
transitive dependency graph, and build settings are assessment evidence.

## Preserve the Generated Source Boundary

Treat generation as a reviewed source change:

1. Run the approved CLI version in a clean application branch.
2. Commit generated source, `go.mod`, `go.sum`, frontend lockfiles, and
   application configuration that is safe for source control.
3. Review the complete diff, including authorization, routes, migrations,
   driver selection, network listeners, and deployment defaults.
4. Run the application's tests and security checks against that exact commit.
5. Generate and retain an application SBOM from the resolved dependency graph.

Do not treat GoForj's repository SBOM as the application SBOM. The application
adds its own code, selected GoForj modules, third-party dependencies, frontend
packages, and infrastructure clients.

## Build and Promote the Application

Build from the approved application commit in the enterprise build system.
After `forj build`, record the binary's dependency identity and digest:

```bash
forj build
go version -m ./bin/app > app-build-modules.txt
sha256sum ./bin/app > app.sha256
test -s app-build-modules.txt && test -s app.sha256
# Files contain the build module inventory and artifact digest.
```

The organization should then generate provenance, sign or attest the artifact
as required by policy, and promote that same digest. Rebuilding on a deployment
host or copying an unverified binary breaks the reviewed chain.

## Assessment Record

For each approved release, retain:

- the GoForj version, module checksum, `go.mod` checksum, and source commit
- links or exports for required CI and security checks on that source commit
- the reviewed generated-source and dependency changes in the application
- the application SBOM and vulnerability results
- the builder identity, artifact digest, provenance, and signature or attestation
- the environment approval, promotion record, and rollback artifact

This record demonstrates what was reviewed and deployed. It does not claim
that an unsigned GoForj tag or a passing scanner can certify the resulting
application.
