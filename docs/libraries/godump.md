---
title: GoDump
---

<p align="center">
  <img src="https://raw.githubusercontent.com/goforj/godump/main/docs/godump.png" width="600" alt="godump logo – Go pretty printer and Laravel-style dump/dd debugging tool">
</p>

<p align="center">
    <a href="https://pkg.go.dev/github.com/goforj/godump"><img src="https://pkg.go.dev/badge/github.com/goforj/godump.svg" alt="Go Reference"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
    <a href="https://github.com/goforj/godump/actions"><img src="https://github.com/goforj/godump/actions/workflows/test.yml/badge.svg" alt="Go Test"></a>
    <a href="https://golang.org"><img src="https://img.shields.io/badge/go-1.18+-blue?logo=go" alt="Go version"></a>
    <img src="https://img.shields.io/github/v/tag/goforj/godump?label=version&sort=semver" alt="Latest tag">
    <a href="https://goreportcard.com/report/github.com/goforj/godump"><img src="https://goreportcard.com/badge/github.com/goforj/godump" alt="Go Report Card"></a>
    <a href="https://codecov.io/gh/goforj/godump" ><img src="https://codecov.io/gh/goforj/godump/graph/badge.svg?token=ULUTXL03XC"/></a>
<!-- test-count:embed:start -->
    <img src="https://img.shields.io/badge/tests-162-brightgreen" alt="Tests">
<!-- test-count:embed:end -->
    <a href="https://github.com/avelino/awesome-go?tab=readme-ov-file#parsersencodersdecoders"><img src="https://awesome.re/mentioned-badge-flat.svg" alt="Mentioned in Awesome Go"></a>
</p>

<p align="center">
  <code>godump</code> is a developer-friendly, zero-dependency debug dumper for Go. It provides pretty, colorized terminal output of your structs, slices, maps, and more - complete with cyclic reference detection and control character escaping.
    Inspired by Symfony's VarDumper which is used in Laravel's tools like <code>dump()</code> and <code>dd()</code>.
</p>

<p align="center">
<strong>Terminal Output Example (Kitchen Sink)</strong><br>
  <img src="https://raw.githubusercontent.com/goforj/godump/main/docs/demo-terminal-2.png" alt="Terminal output example kitchen sink">
</p>

<p align="center">
<strong>HTML Output Example</strong><br>
  <img src="https://raw.githubusercontent.com/goforj/godump/main/docs/demo-html.png" alt="HTML output example">
</p>


<p align="center">
<strong>godump.Diff(a,b) Output Example</strong><br>
  <img src="https://raw.githubusercontent.com/goforj/godump/main/docs/demo-diff.png" alt="Diff output example">
</p>

## Feature Comparison: `godump` vs `go-spew` vs `pp` {#feature-comparison:-`godump`-vs-`go-spew`-vs-`pp`}

| **Feature**                                                            | **godump** | **go-spew** | **pp** |
|-----------------------------------------------------------------------:|:----------:|:-----------:|:------:|
| **Zero dependencies**                                                   | ✓          | -           | -      |
| **Colorized terminal output**                                           | ✓          | ✓           | ✓      |
| **HTML output**                                                         | ✓          | -           | -      |
| **JSON output helpers** (`DumpJSON`, `DumpJSONStr`)                     | ✓          | -           | -      |
| **Diff output helpers** (`Diff`, `DiffStr`)                             | ✓          | -           | -      |
| **Diff HTML output** (`DiffHTML`)                                       | ✓          | -           | -      |
| **Dump to `io.Writer`**                                                 | ✓          | ✓           | ✓      |
| **Shows file + line number of dump call**                               | ✓          | -           | -      |
| **Cyclic reference detection**                                          | ✓          | ~           | -      |
| **Handles unexported struct fields**                                    | ✓          | ✓           | ✓      |
| **Visibility markers** (`+` / `-`)                                      | ✓          | -           | -      |
| **Max depth control**                                                   | ✓          | -           | -      |
| **Max items (slice/map truncation)**                                    | ✓          | -           | -      |
| **Max string length truncation**                                        | ✓          | -           | -      |
| **Dump & Die** (`dd()` equivalent)                                      | ✓          | -           | -      |
| **Control character escaping**                                          | ✓          | ~           | ~      |
| **Supports structs, maps, slices, pointers, interfaces**                | ✓          | ✓           | ✓      |
| **Pretty type name rendering** (`#package.Type`)                        | ✓          | -           | -      |
| **Builder-style configuration API**                                     | ✓          | -           | -      |
| **Test-friendly string output** (`DumpStr`, `DiffStr`, `DumpJSONStr`) | ✓          | ✓           | ✓      |
| **HTML / Web UI debugging support**                                     | ✓          | -           | -      |

If you'd like to suggest improvements or additional comparisons, feel free to open an issue or PR.

## Installation {#installation}

```bash
go get github.com/goforj/godump
```

## Basic Usage {#basic-usage}

<p> <a href="./examples/basic/main.go"><strong>View Full Runnable Example →</strong></a> </p>

<GoForjExample repo="godump" example="basic">

```go
user := User{
	Name: "Alice",
	Profile: Profile{
		Age:   30,
		Email: "alice@example.com",
	},
}

// Pretty-print to stdout
godump.Dump(user)
// #main.User {
//  +Name    => "Alice" #string
//  +Profile => #main.Profile {
//    +Age   => 30 #int
//    +Email => "alice@example.com" #string
//  }
// }
```

</GoForjExample>

## Extended Usage (Snippets) {#extended-usage-(snippets)}

<GoForjExample repo="godump" example="basic">

```go
user := User{
	Name: "Alice",
	Profile: Profile{
		Age:   30,
		Email: "alice@example.com",
	},
}

// Pretty-print to stdout
godump.Dump(user)
// #main.User {
//  +Name    => "Alice" #string
//  +Profile => #main.Profile {
//    +Age   => 30 #int
//    +Email => "alice@example.com" #string
//  }
// }
```

</GoForjExample>

## Diff Usage {#diff-usage}

<p> <a href="./examples/diff/main.go"><strong>View Diff Example →</strong></a> </p>

<GoForjExample repo="godump" example="diff">

```go
// Example: print diff with a custom dumper
d := godump.NewDumper()
a := map[string]int{"a": 1}
b := map[string]int{"a": 2}
d.Diff(a, b)
// <#diff // path:line
// - #map[string]int {
// -   a => 1 #int
// - }
// + #map[string]int {
// +   a => 2 #int
// + }
```

</GoForjExample>

<p> <a href="./examples/diffextended/main.go"><strong>View Diff Extended Example →</strong></a> </p>

## Builder Options Usage {#builder-options-usage}

`godump` aims for simple usage with sensible defaults out of the box, but also provides a flexible builder-style API for customization.

If you want to heavily customize the dumper behavior, you can create a `Dumper` instance with specific options:

<p> <a href="./examples/builder/main.go"><strong>View Full Runnable Example →</strong></a> </p>

<GoForjExample repo="godump" example="builder">

```go
user := User{
	Name: "Alice",
	Profile: Profile{
		Age:   30,
		Email: "alice@example.com",
	},
}

// Basic pretty-print
godump.Dump(user)
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump as string
strOut := godump.DumpStr(user)
fmt.Println("DumpStr:", strOut)
// DumpStr output:
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump as HTML
htmlOut := godump.DumpHTML(user)
fmt.Println("DumpHTML:", htmlOut)
// <pre class="godump">…formatted HTML output…</pre>

// Dump JSON
godump.DumpJSON(user)
// {"Name":"Alice","Profile":{"Age":30,"Email":"alice@example.com"}}

// Dump to any io.Writer
godump.Fdump(os.Stderr, user)
// (same output as Dump but written to stderr)

// Dump and exit
// godump.Dd(user)
// (prints formatted dump then immediately exits)

// -------------------------------------------------
// Custom Dumper (Builder API)
// -------------------------------------------------

d := godump.NewDumper(
	godump.WithMaxDepth(15),
	godump.WithMaxItems(100),
	godump.WithMaxStringLen(100000),
	godump.WithWriter(os.Stdout),
	godump.WithSkipStackFrames(10),
	godump.WithDisableStringer(false),
	godump.WithoutColor(),
)

// Using the custom dumper
d.Dump(user)
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump to string using custom dumper
out := d.DumpStr(user)
fmt.Println("Custom DumpStr:\n", out)
// Custom DumpStr:
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump to HTML
html := d.DumpHTML(user)
fmt.Println("Custom DumpHTML:\n", html)
// <pre class="godump">…formatted HTML output…</pre>

// JSON as string
jsonStr := d.DumpJSONStr(user)
fmt.Println("Custom JSON:\n", jsonStr)
// {"Name":"Alice","Profile":{"Age":30,"Email":"alice@example.com"}}

// Print JSON directly
d.DumpJSON(user)
// {"Name":"Alice","Profile":{"Age":30,"Email":"alice@example.com"}}

// Dump to a strings.Builder
var sb strings.Builder
custom := godump.NewDumper(godump.WithWriter(&sb))
custom.Dump(user)
fmt.Println("Dump to strings.Builder:\n", sb.String())
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }
```

</GoForjExample>

## Contributing {#contributing}

Ensure that all tests pass, and you run ./docs/generate.sh to update the API index in the README before submitting a PR.

Ensure all public functions have documentation blocks with examples, as these are used to generate runnable examples and the API index.

## Runnable Examples Directory {#runnable-examples-directory}

Every function has a corresponding runnable example under [`./examples`](./examples).

These examples are **generated directly from the documentation blocks** of each function, ensuring the docs and code never drift. These are the same examples you see here in the README and GoDoc.

An automated test executes **every example** to verify it builds and runs successfully.

This guarantees all examples are valid, up-to-date, and remain functional as the API evolves.

<details>
<summary><strong>📘 How to Read the Output</strong></summary>

<br>

`godump` output is designed for clarity and traceability. Here's how to interpret its structure:

### Location Header {#location-header}

<GoForjExample repo="godump" example="builder">

```go
user := User{
	Name: "Alice",
	Profile: Profile{
		Age:   30,
		Email: "alice@example.com",
	},
}

// Basic pretty-print
godump.Dump(user)
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump as string
strOut := godump.DumpStr(user)
fmt.Println("DumpStr:", strOut)
// DumpStr output:
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump as HTML
htmlOut := godump.DumpHTML(user)
fmt.Println("DumpHTML:", htmlOut)
// <pre class="godump">…formatted HTML output…</pre>

// Dump JSON
godump.DumpJSON(user)
// {"Name":"Alice","Profile":{"Age":30,"Email":"alice@example.com"}}

// Dump to any io.Writer
godump.Fdump(os.Stderr, user)
// (same output as Dump but written to stderr)

// Dump and exit
// godump.Dd(user)
// (prints formatted dump then immediately exits)

// -------------------------------------------------
// Custom Dumper (Builder API)
// -------------------------------------------------

d := godump.NewDumper(
	godump.WithMaxDepth(15),
	godump.WithMaxItems(100),
	godump.WithMaxStringLen(100000),
	godump.WithWriter(os.Stdout),
	godump.WithSkipStackFrames(10),
	godump.WithDisableStringer(false),
	godump.WithoutColor(),
)

// Using the custom dumper
d.Dump(user)
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump to string using custom dumper
out := d.DumpStr(user)
fmt.Println("Custom DumpStr:\n", out)
// Custom DumpStr:
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump to HTML
html := d.DumpHTML(user)
fmt.Println("Custom DumpHTML:\n", html)
// <pre class="godump">…formatted HTML output…</pre>

// JSON as string
jsonStr := d.DumpJSONStr(user)
fmt.Println("Custom JSON:\n", jsonStr)
// {"Name":"Alice","Profile":{"Age":30,"Email":"alice@example.com"}}

// Print JSON directly
d.DumpJSON(user)
// {"Name":"Alice","Profile":{"Age":30,"Email":"alice@example.com"}}

// Dump to a strings.Builder
var sb strings.Builder
custom := godump.NewDumper(godump.WithWriter(&sb))
custom.Dump(user)
fmt.Println("Dump to strings.Builder:\n", sb.String())
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }
```

</GoForjExample>

* The first line shows the **file and line number** where `godump.Dump()` was invoked.
* Helpful for finding where the dump happened during debugging.

### Type Names {#type-names}

<GoForjExample repo="godump" example="builder">

```go
user := User{
	Name: "Alice",
	Profile: Profile{
		Age:   30,
		Email: "alice@example.com",
	},
}

// Basic pretty-print
godump.Dump(user)
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump as string
strOut := godump.DumpStr(user)
fmt.Println("DumpStr:", strOut)
// DumpStr output:
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump as HTML
htmlOut := godump.DumpHTML(user)
fmt.Println("DumpHTML:", htmlOut)
// <pre class="godump">…formatted HTML output…</pre>

// Dump JSON
godump.DumpJSON(user)
// {"Name":"Alice","Profile":{"Age":30,"Email":"alice@example.com"}}

// Dump to any io.Writer
godump.Fdump(os.Stderr, user)
// (same output as Dump but written to stderr)

// Dump and exit
// godump.Dd(user)
// (prints formatted dump then immediately exits)

// -------------------------------------------------
// Custom Dumper (Builder API)
// -------------------------------------------------

d := godump.NewDumper(
	godump.WithMaxDepth(15),
	godump.WithMaxItems(100),
	godump.WithMaxStringLen(100000),
	godump.WithWriter(os.Stdout),
	godump.WithSkipStackFrames(10),
	godump.WithDisableStringer(false),
	godump.WithoutColor(),
)

// Using the custom dumper
d.Dump(user)
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump to string using custom dumper
out := d.DumpStr(user)
fmt.Println("Custom DumpStr:\n", out)
// Custom DumpStr:
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump to HTML
html := d.DumpHTML(user)
fmt.Println("Custom DumpHTML:\n", html)
// <pre class="godump">…formatted HTML output…</pre>

// JSON as string
jsonStr := d.DumpJSONStr(user)
fmt.Println("Custom JSON:\n", jsonStr)
// {"Name":"Alice","Profile":{"Age":30,"Email":"alice@example.com"}}

// Print JSON directly
d.DumpJSON(user)
// {"Name":"Alice","Profile":{"Age":30,"Email":"alice@example.com"}}

// Dump to a strings.Builder
var sb strings.Builder
custom := godump.NewDumper(godump.WithWriter(&sb))
custom.Dump(user)
fmt.Println("Dump to strings.Builder:\n", sb.String())
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }
```

</GoForjExample>

* Fully qualified struct name with its package path.

### Visibility Markers {#visibility-markers}

<GoForjExample repo="godump" example="builder">

```go
user := User{
	Name: "Alice",
	Profile: Profile{
		Age:   30,
		Email: "alice@example.com",
	},
}

// Basic pretty-print
godump.Dump(user)
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump as string
strOut := godump.DumpStr(user)
fmt.Println("DumpStr:", strOut)
// DumpStr output:
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump as HTML
htmlOut := godump.DumpHTML(user)
fmt.Println("DumpHTML:", htmlOut)
// <pre class="godump">…formatted HTML output…</pre>

// Dump JSON
godump.DumpJSON(user)
// {"Name":"Alice","Profile":{"Age":30,"Email":"alice@example.com"}}

// Dump to any io.Writer
godump.Fdump(os.Stderr, user)
// (same output as Dump but written to stderr)

// Dump and exit
// godump.Dd(user)
// (prints formatted dump then immediately exits)

// -------------------------------------------------
// Custom Dumper (Builder API)
// -------------------------------------------------

d := godump.NewDumper(
	godump.WithMaxDepth(15),
	godump.WithMaxItems(100),
	godump.WithMaxStringLen(100000),
	godump.WithWriter(os.Stdout),
	godump.WithSkipStackFrames(10),
	godump.WithDisableStringer(false),
	godump.WithoutColor(),
)

// Using the custom dumper
d.Dump(user)
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump to string using custom dumper
out := d.DumpStr(user)
fmt.Println("Custom DumpStr:\n", out)
// Custom DumpStr:
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump to HTML
html := d.DumpHTML(user)
fmt.Println("Custom DumpHTML:\n", html)
// <pre class="godump">…formatted HTML output…</pre>

// JSON as string
jsonStr := d.DumpJSONStr(user)
fmt.Println("Custom JSON:\n", jsonStr)
// {"Name":"Alice","Profile":{"Age":30,"Email":"alice@example.com"}}

// Print JSON directly
d.DumpJSON(user)
// {"Name":"Alice","Profile":{"Age":30,"Email":"alice@example.com"}}

// Dump to a strings.Builder
var sb strings.Builder
custom := godump.NewDumper(godump.WithWriter(&sb))
custom.Dump(user)
fmt.Println("Dump to strings.Builder:\n", sb.String())
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }
```

</GoForjExample>

* `+` → Exported (public) field
* `-` → Unexported (private) field (accessed reflectively)

### Cyclic References {#cyclic-references}

If a pointer has already been printed:

<GoForjExample repo="godump" example="builder">

```go
user := User{
	Name: "Alice",
	Profile: Profile{
		Age:   30,
		Email: "alice@example.com",
	},
}

// Basic pretty-print
godump.Dump(user)
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump as string
strOut := godump.DumpStr(user)
fmt.Println("DumpStr:", strOut)
// DumpStr output:
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump as HTML
htmlOut := godump.DumpHTML(user)
fmt.Println("DumpHTML:", htmlOut)
// <pre class="godump">…formatted HTML output…</pre>

// Dump JSON
godump.DumpJSON(user)
// {"Name":"Alice","Profile":{"Age":30,"Email":"alice@example.com"}}

// Dump to any io.Writer
godump.Fdump(os.Stderr, user)
// (same output as Dump but written to stderr)

// Dump and exit
// godump.Dd(user)
// (prints formatted dump then immediately exits)

// -------------------------------------------------
// Custom Dumper (Builder API)
// -------------------------------------------------

d := godump.NewDumper(
	godump.WithMaxDepth(15),
	godump.WithMaxItems(100),
	godump.WithMaxStringLen(100000),
	godump.WithWriter(os.Stdout),
	godump.WithSkipStackFrames(10),
	godump.WithDisableStringer(false),
	godump.WithoutColor(),
)

// Using the custom dumper
d.Dump(user)
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump to string using custom dumper
out := d.DumpStr(user)
fmt.Println("Custom DumpStr:\n", out)
// Custom DumpStr:
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump to HTML
html := d.DumpHTML(user)
fmt.Println("Custom DumpHTML:\n", html)
// <pre class="godump">…formatted HTML output…</pre>

// JSON as string
jsonStr := d.DumpJSONStr(user)
fmt.Println("Custom JSON:\n", jsonStr)
// {"Name":"Alice","Profile":{"Age":30,"Email":"alice@example.com"}}

// Print JSON directly
d.DumpJSON(user)
// {"Name":"Alice","Profile":{"Age":30,"Email":"alice@example.com"}}

// Dump to a strings.Builder
var sb strings.Builder
custom := godump.NewDumper(godump.WithWriter(&sb))
custom.Dump(user)
fmt.Println("Dump to strings.Builder:\n", sb.String())
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }
```

</GoForjExample>

* Prevents infinite loops in circular structures
* References point back to earlier object instances

### Slices and Maps {#slices-and-maps}

<GoForjExample repo="godump" example="builder">

```go
user := User{
	Name: "Alice",
	Profile: Profile{
		Age:   30,
		Email: "alice@example.com",
	},
}

// Basic pretty-print
godump.Dump(user)
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump as string
strOut := godump.DumpStr(user)
fmt.Println("DumpStr:", strOut)
// DumpStr output:
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump as HTML
htmlOut := godump.DumpHTML(user)
fmt.Println("DumpHTML:", htmlOut)
// <pre class="godump">…formatted HTML output…</pre>

// Dump JSON
godump.DumpJSON(user)
// {"Name":"Alice","Profile":{"Age":30,"Email":"alice@example.com"}}

// Dump to any io.Writer
godump.Fdump(os.Stderr, user)
// (same output as Dump but written to stderr)

// Dump and exit
// godump.Dd(user)
// (prints formatted dump then immediately exits)

// -------------------------------------------------
// Custom Dumper (Builder API)
// -------------------------------------------------

d := godump.NewDumper(
	godump.WithMaxDepth(15),
	godump.WithMaxItems(100),
	godump.WithMaxStringLen(100000),
	godump.WithWriter(os.Stdout),
	godump.WithSkipStackFrames(10),
	godump.WithDisableStringer(false),
	godump.WithoutColor(),
)

// Using the custom dumper
d.Dump(user)
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump to string using custom dumper
out := d.DumpStr(user)
fmt.Println("Custom DumpStr:\n", out)
// Custom DumpStr:
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump to HTML
html := d.DumpHTML(user)
fmt.Println("Custom DumpHTML:\n", html)
// <pre class="godump">…formatted HTML output…</pre>

// JSON as string
jsonStr := d.DumpJSONStr(user)
fmt.Println("Custom JSON:\n", jsonStr)
// {"Name":"Alice","Profile":{"Age":30,"Email":"alice@example.com"}}

// Print JSON directly
d.DumpJSON(user)
// {"Name":"Alice","Profile":{"Age":30,"Email":"alice@example.com"}}

// Dump to a strings.Builder
var sb strings.Builder
custom := godump.NewDumper(godump.WithWriter(&sb))
custom.Dump(user)
fmt.Println("Dump to strings.Builder:\n", sb.String())
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }
```

</GoForjExample>

* Array/slice indices and map keys are shown with `=>` formatting and indentation
* Slices and maps are truncated if `maxItems` is exceeded

### Escaped Characters {#escaped-characters}

<GoForjExample repo="godump" example="builder">

```go
user := User{
	Name: "Alice",
	Profile: Profile{
		Age:   30,
		Email: "alice@example.com",
	},
}

// Basic pretty-print
godump.Dump(user)
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump as string
strOut := godump.DumpStr(user)
fmt.Println("DumpStr:", strOut)
// DumpStr output:
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump as HTML
htmlOut := godump.DumpHTML(user)
fmt.Println("DumpHTML:", htmlOut)
// <pre class="godump">…formatted HTML output…</pre>

// Dump JSON
godump.DumpJSON(user)
// {"Name":"Alice","Profile":{"Age":30,"Email":"alice@example.com"}}

// Dump to any io.Writer
godump.Fdump(os.Stderr, user)
// (same output as Dump but written to stderr)

// Dump and exit
// godump.Dd(user)
// (prints formatted dump then immediately exits)

// -------------------------------------------------
// Custom Dumper (Builder API)
// -------------------------------------------------

d := godump.NewDumper(
	godump.WithMaxDepth(15),
	godump.WithMaxItems(100),
	godump.WithMaxStringLen(100000),
	godump.WithWriter(os.Stdout),
	godump.WithSkipStackFrames(10),
	godump.WithDisableStringer(false),
	godump.WithoutColor(),
)

// Using the custom dumper
d.Dump(user)
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump to string using custom dumper
out := d.DumpStr(user)
fmt.Println("Custom DumpStr:\n", out)
// Custom DumpStr:
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }

// Dump to HTML
html := d.DumpHTML(user)
fmt.Println("Custom DumpHTML:\n", html)
// <pre class="godump">…formatted HTML output…</pre>

// JSON as string
jsonStr := d.DumpJSONStr(user)
fmt.Println("Custom JSON:\n", jsonStr)
// {"Name":"Alice","Profile":{"Age":30,"Email":"alice@example.com"}}

// Print JSON directly
d.DumpJSON(user)
// {"Name":"Alice","Profile":{"Age":30,"Email":"alice@example.com"}}

// Dump to a strings.Builder
var sb strings.Builder
custom := godump.NewDumper(godump.WithWriter(&sb))
custom.Dump(user)
fmt.Println("Dump to strings.Builder:\n", sb.String())
// #main.User {
//   +Name    => "Alice" #string
//   +Profile => #main.Profile {
//     +Age   => 30 #int
//     +Email => "alice@example.com" #string
//   }
// }
```

</GoForjExample>

* Control characters like `\n`, `\t`, `\r`, etc. are safely escaped
* Strings are truncated after `maxStringLen` runes

### Supported Types {#supported-types}

* ✅ Structs (exported & unexported)
* ✅ Pointers, interfaces
* ✅ Maps, slices, arrays
* ✅ Channels, functions
* ✅ time.Time (nicely formatted)

</details>

<!-- api:embed:start -->

## API Index {#api-index}

| Group | Functions |
|------:|-----------|
| **Builder** | [NewDumper](#newdumper) |
| **Diff** | [Diff](#diff) [DiffHTML](#diffhtml) [DiffStr](#diffstr) |
| **Dump** | [Dd](#dd) [Dump](#dump) [DumpStr](#dumpstr) [Fdump](#fdump) |
| **HTML** | [DumpHTML](#dumphtml) |
| **JSON** | [DumpJSON](#dumpjson) [DumpJSONStr](#dumpjsonstr) |
| **Options** | [WithDisableStringer](#withdisablestringer) [WithExcludeFields](#withexcludefields) [WithFieldMatchMode](#withfieldmatchmode) [WithMaxDepth](#withmaxdepth) [WithMaxItems](#withmaxitems) [WithMaxStringLen](#withmaxstringlen) [WithOnlyFields](#withonlyfields) [WithRedactFields](#withredactfields) [WithRedactMatchMode](#withredactmatchmode) [WithRedactSensitive](#withredactsensitive) [WithSkipStackFrames](#withskipstackframes) [WithWriter](#withwriter) [WithoutColor](#withoutcolor) [WithoutHeader](#withoutheader) |


## Builder {#builder}

### NewDumper {#newdumper}

NewDumper creates a new Dumper with the given options applied.
Defaults are used for any setting not overridden.

<GoForjExample repo="godump" example="newdumper">

```go
// Example: build a custom dumper
v := map[string]int{"a": 1}
d := godump.NewDumper(
	godump.WithMaxDepth(10),
	godump.WithWriter(os.Stdout),
)
d.Dump(v)
// #map[string]int {
//   a => 1 #int
// }
```

</GoForjExample>

## Diff {#diff}

### Diff {#diff-2}

Diff prints a diff between two values to stdout.







### DiffHTML {#diffhtml}

DiffHTML returns an HTML diff between two values.


<GoForjExample repo="godump" example="diffhtml">

```go
// Example: HTML diff with a custom dumper
d := godump.NewDumper()
a := map[string]int{"a": 1}
b := map[string]int{"a": 2}
html := d.DiffHTML(a, b)
_ = html
// (html diff)
```

</GoForjExample>




### DiffStr {#diffstr}

DiffStr returns a string diff between two values.


<GoForjExample repo="godump" example="diffstr">

```go
// Example: diff string with a custom dumper
d := godump.NewDumper()
a := map[string]int{"a": 1}
b := map[string]int{"a": 2}
out := d.DiffStr(a, b)
_ = out
// <#diff // path:line
// - #map[string]int {
// -   a => 1 #int
// - }
// + #map[string]int {
// +   a => 2 #int
// + }
```

</GoForjExample>




## Dump {#dump}

### Dd {#dd}

Dd is a debug function that prints the values and exits the program.


<GoForjExample repo="godump" example="dd">

```go
// Example: dump and exit with a custom dumper
d := godump.NewDumper()
v := map[string]int{"a": 1}
d.Dd(v)
// #map[string]int {
//   a => 1 #int
// }
```

</GoForjExample>




### Dump {#dump-2}

Dump prints the values to stdout with colorized output.


<GoForjExample repo="godump" example="dump">

```go
// Example: print with a custom dumper
d := godump.NewDumper()
v := map[string]int{"a": 1}
d.Dump(v)
// #map[string]int {
//   a => 1 #int
// }
```

</GoForjExample>




### DumpStr {#dumpstr}

DumpStr returns a string representation of the values with colorized output.


<GoForjExample repo="godump" example="dumpstr">

```go
// Example: get a string dump with a custom dumper
d := godump.NewDumper()
v := map[string]int{"a": 1}
out := d.DumpStr(v)
_ = out
// "#map[string]int {\n  a => 1 #int\n}" #string
```

</GoForjExample>




### Fdump {#fdump}

Fdump writes the formatted dump of values to the given io.Writer.

<GoForjExample repo="godump" example="fdump">

```go
// Example: dump to writer
var b strings.Builder
v := map[string]int{"a": 1}
godump.Fdump(&b, v)
// outputs to strings builder
```

</GoForjExample>

## HTML {#html}

### DumpHTML {#dumphtml}

DumpHTML dumps the values as HTML with colorized output.


<GoForjExample repo="godump" example="dumphtml">

```go
// Example: dump HTML with a custom dumper
d := godump.NewDumper()
v := map[string]int{"a": 1}
html := d.DumpHTML(v)
_ = html
fmt.Println(html)
// (html output)
```

</GoForjExample>




## JSON {#json}

### DumpJSON {#dumpjson}

DumpJSON prints a pretty-printed JSON string to the configured writer.


<GoForjExample repo="godump" example="dumpjson">

```go
// Example: print JSON
v := map[string]int{"a": 1}
godump.DumpJSON(v)
// {
//   "a": 1
// }
```

</GoForjExample>




### DumpJSONStr {#dumpjsonstr}

DumpJSONStr pretty-prints values as JSON and returns it as a string.


<GoForjExample repo="godump" example="dumpjsonstr">

```go
// Example: JSON string
v := map[string]int{"a": 1}
out := godump.DumpJSONStr(v)
_ = out
// {"a":1}
```

</GoForjExample>




## Options {#options}

### WithDisableStringer {#withdisablestringer}

WithDisableStringer disables using the fmt.Stringer output.
When enabled, the underlying type is rendered instead of String().

<GoForjExample repo="godump" example="withdisablestringer">

```go
// Example: show raw types
// Default: false
v := time.Duration(3)
d := godump.NewDumper(godump.WithDisableStringer(true))
d.Dump(v)
// 3 #time.Duration
```

</GoForjExample>

### WithExcludeFields {#withexcludefields}

WithExcludeFields omits struct fields that match the provided names.

<GoForjExample repo="godump" example="withexcludefields">

```go
// Example: exclude fields
// Default: none
type User struct {
	ID       int
	Email    string
	Password string
}
d := godump.NewDumper(
	godump.WithExcludeFields("Password"),
)
d.Dump(User{ID: 1, Email: "user@example.com", Password: "secret"})
// #godump.User {
//   +ID    => 1 #int
//   +Email => "user@example.com" #string
// }
```

</GoForjExample>

### WithFieldMatchMode {#withfieldmatchmode}

WithFieldMatchMode sets how field names are matched for WithExcludeFields.

<GoForjExample repo="godump" example="withfieldmatchmode">

```go
// Example: use substring matching
// Default: FieldMatchExact
type User struct {
	UserID int
}
d := godump.NewDumper(
	godump.WithExcludeFields("id"),
	godump.WithFieldMatchMode(godump.FieldMatchContains),
)
d.Dump(User{UserID: 10})
// #godump.User {
// }
```

</GoForjExample>

### WithMaxDepth {#withmaxdepth}

WithMaxDepth limits how deep the structure will be dumped.
Param n must be 0 or greater or this will be ignored, and default MaxDepth will be 15.

<GoForjExample repo="godump" example="withmaxdepth">

```go
// Example: limit depth
// Default: 15
v := map[string]map[string]int{"a": {"b": 1}}
d := godump.NewDumper(godump.WithMaxDepth(1))
d.Dump(v)
// #map[string]map[string]int {
//   a => #map[string]int {
//     b => 1 #int
//   }
// }
```

</GoForjExample>

### WithMaxItems {#withmaxitems}

WithMaxItems limits how many items from an array, slice, or map can be printed.
Param n must be 0 or greater or this will be ignored, and default MaxItems will be 100.

<GoForjExample repo="godump" example="withmaxitems">

```go
// Example: limit items
// Default: 100
v := []int{1, 2, 3}
d := godump.NewDumper(godump.WithMaxItems(2))
d.Dump(v)
// #[]int [
//   0 => 1 #int
//   1 => 2 #int
//   ... (truncated)
// ]
```

</GoForjExample>

### WithMaxStringLen {#withmaxstringlen}

WithMaxStringLen limits how long printed strings can be.
Param n must be 0 or greater or this will be ignored, and default MaxStringLen will be 100000.

<GoForjExample repo="godump" example="withmaxstringlen">

```go
// Example: limit string length
// Default: 100000
v := "hello world"
d := godump.NewDumper(godump.WithMaxStringLen(5))
d.Dump(v)
// "hello…" #string
```

</GoForjExample>

### WithOnlyFields {#withonlyfields}

WithOnlyFields limits struct output to fields that match the provided names.

<GoForjExample repo="godump" example="withonlyfields">

```go
// Example: include-only fields
// Default: none
type User struct {
	ID       int
	Email    string
	Password string
}
d := godump.NewDumper(
	godump.WithOnlyFields("ID", "Email"),
)
d.Dump(User{ID: 1, Email: "user@example.com", Password: "secret"})
// #godump.User {
//   +ID    => 1 #int
//   +Email => "user@example.com" #string
// }
```

</GoForjExample>

### WithRedactFields {#withredactfields}

WithRedactFields replaces matching struct fields with a redacted placeholder.

<GoForjExample repo="godump" example="withredactfields">

```go
// Example: redact fields
// Default: none
type User struct {
	ID       int
	Password string
}
d := godump.NewDumper(
	godump.WithRedactFields("Password"),
)
d.Dump(User{ID: 1, Password: "secret"})
// #godump.User {
//   +ID       => 1 #int
//   +Password => <redacted> #string
// }
```

</GoForjExample>

### WithRedactMatchMode {#withredactmatchmode}

WithRedactMatchMode sets how field names are matched for WithRedactFields.

<GoForjExample repo="godump" example="withredactmatchmode">

```go
// Example: use substring matching
// Default: FieldMatchExact
type User struct {
	APIKey string
}
d := godump.NewDumper(
	godump.WithRedactFields("key"),
	godump.WithRedactMatchMode(godump.FieldMatchContains),
)
d.Dump(User{APIKey: "abc"})
// #godump.User {
//   +APIKey => <redacted> #string
// }
```

</GoForjExample>

### WithRedactSensitive {#withredactsensitive}

WithRedactSensitive enables default redaction for common sensitive fields.

<GoForjExample repo="godump" example="withredactsensitive">

```go
// Example: redact common sensitive fields
// Default: disabled
type User struct {
	Password string
	Token    string
}
d := godump.NewDumper(
	godump.WithRedactSensitive(),
)
d.Dump(User{Password: "secret", Token: "abc"})
// #godump.User {
//   +Password => <redacted> #string
//   +Token    => <redacted> #string
// }
```

</GoForjExample>

### WithSkipStackFrames {#withskipstackframes}

WithSkipStackFrames skips additional stack frames for header reporting.
This is useful when godump is wrapped and the actual call site is deeper.

<GoForjExample repo="godump" example="withskipstackframes">

```go
// Example: skip wrapper frames
// Default: 0
v := map[string]int{"a": 1}
d := godump.NewDumper(godump.WithSkipStackFrames(2))
d.Dump(v)
// <#dump // ../../../../usr/local/go/src/runtime/asm_arm64.s:1223
// #map[string]int {
//   a => 1 #int
// }
```

</GoForjExample>

### WithWriter {#withwriter}

WithWriter routes output to the provided writer.

<GoForjExample repo="godump" example="withwriter">

```go
// Example: write to buffer
// Default: stdout
var b strings.Builder
v := map[string]int{"a": 1}
d := godump.NewDumper(godump.WithWriter(&b))
d.Dump(v)
// #map[string]int {
//   a => 1 #int
// }
```

</GoForjExample>

### WithoutColor {#withoutcolor}

WithoutColor disables colorized output for the dumper.

<GoForjExample repo="godump" example="withoutcolor">

```go
// Example: disable colors
// Default: false
v := map[string]int{"a": 1}
d := godump.NewDumper(godump.WithoutColor())
d.Dump(v)
// (prints without color)
// #map[string]int {
//   a => 1 #int
// }
```

</GoForjExample>

### WithoutHeader {#withoutheader}

WithoutHeader disables printing the source location header.

<GoForjExample repo="godump" example="withoutheader">

```go
// Example: disable header
// Default: false
d := godump.NewDumper(godump.WithoutHeader())
d.Dump("hello")
// "hello" #string
```

</GoForjExample>
<!-- api:embed:end -->
