---
title: ExecX
---

<p align="center">
  <img src="https://raw.githubusercontent.com/goforj/execx/main/docs/images/logo.png?v=2" width="400" alt="str logo">
</p>

<p align="center">
    execx is an ergonomic, fluent wrapper around Go’s `os/exec` package.
</p>

<p align="center">
    <a href="https://pkg.go.dev/github.com/goforj/execx"><img src="https://pkg.go.dev/badge/github.com/goforj/execx.svg" alt="Go Reference"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
    <a href="https://github.com/goforj/execx/actions"><img src="https://github.com/goforj/execx/actions/workflows/test.yml/badge.svg" alt="Go Test"></a>
    <a href="https://golang.org"><img src="https://img.shields.io/badge/go-1.23+-blue?logo=go" alt="Go version"></a>
    <img src="https://img.shields.io/github/v/tag/goforj/execx?label=version&sort=semver" alt="Latest tag"> 
    <a href="https://codecov.io/gh/goforj/execx" ><img src="https://codecov.io/github/goforj/execx/graph/badge.svg?token=RBB8T6WQ0U"/></a>
<!-- test-count:embed:start -->
    <img src="https://img.shields.io/badge/tests-142-brightgreen" alt="Tests">
<!-- test-count:embed:end -->
    <a href="https://goreportcard.com/report/github.com/goforj/execx"><img src="https://goreportcard.com/badge/github.com/goforj/execx" alt="Go Report Card"></a>
</p>

## What execx is {#what-execx-is}

execx is a small, explicit wrapper around `os/exec`. It keeps the `exec.Cmd` model but adds fluent construction and consistent result handling.

There is no shell interpolation. Arguments, environment, and I/O are set directly, and nothing runs until you call `Run`, `Output`, or `Start`.

## Installation {#installation}

```bash
go get github.com/goforj/execx
```

## Quick Start {#quick-start}

```go
out, _ := execx.Command("echo", "hello").OutputTrimmed()
fmt.Println(out)
// #string hello
```

On Windows, use `cmd /c echo hello` or `powershell -Command "echo hello"` for shell built-ins.

## Basic usage {#basic-usage}

Build a command and run it:

```go
cmd := execx.Command("echo").Arg("hello")
res, _ := cmd.Run()
fmt.Print(res.Stdout)
// hello
```

Arguments are appended deterministically and never shell-expanded.

## Output handling {#output-handling}

Use `Output` variants when you only need stdout:

```go
out, _ := execx.Command("echo", "hello").OutputTrimmed()
fmt.Println(out)
// #string hello
```

`Output`, `OutputBytes`, `OutputTrimmed`, and `CombinedOutput` differ only in how they return data.

## Pipelining {#pipelining}

Pipelines run on all platforms; command availability is OS-specific.

<GoForjExample repo="execx" example="pipe">

```go
// Example: pipe
out, _ := execx.Command("printf", "go").
	Pipe("tr", "a-z", "A-Z").
	OutputTrimmed()
fmt.Println(out)
// #string GO
```

</GoForjExample>

On Windows, use `cmd /c` or `powershell -Command` for shell built-ins.

`PipeStrict` (default) stops at the first failing stage and returns that error.  
`PipeBestEffort` runs all stages, returns the last stage output, and surfaces the first error if any stage failed.

## Context & cancellation {#context-&-cancellation}

<GoForjExample repo="execx" example="withcontext">

```go
// Example: with context
ctx, cancel := context.WithTimeout(context.Background(), time.Second)
defer cancel()
res, _ := execx.Command("go", "env", "GOOS").WithContext(ctx).Run()
fmt.Println(res.ExitCode == 0)
// #bool true
```

</GoForjExample>

## Environment & I/O control {#environment-&-i/o-control}

Environment is explicit and deterministic:

```go
cmd := execx.Command("echo", "hello").Env("MODE=prod")
fmt.Println(strings.Contains(strings.Join(cmd.EnvList(), ","), "MODE=prod"))
// #bool true
```

Standard input is opt-in:

```go
out, _ := execx.Command("cat").
	StdinString("hi").
	OutputTrimmed()
fmt.Println(out)
// #string hi
```

## Advanced features {#advanced-features}

For process control, use `Start` with the `Process` helpers:

<GoForjExample repo="execx" example="start">

```go
// Example: start
proc := execx.Command("go", "env", "GOOS").Start()
res, _ := proc.Wait()
fmt.Println(res.ExitCode == 0)
// #bool true
```

</GoForjExample>

Signals, timeouts, and OS controls are documented in the API section below.

ShadowPrint is available for emitting the command line before and after execution.

## Kitchen Sink Chaining Example {#kitchen-sink-chaining-example}

<GoForjExample repo="execx" example="kitchensink">

```go
ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
defer cancel()

res, err := execx.
	Command("printf", "hello\nworld\n").
	Pipe("tr", "a-z", "A-Z").
	Env("MODE=demo").
	WithContext(ctx).
	OnStdout(func(line string) {
		fmt.Println("OUT:", line)
	}).
	OnStderr(func(line string) {
		fmt.Println("ERR:", line)
	}).
	Run()

if !res.OK() {
	log.Fatalf("command failed: %v", err)
}

fmt.Printf("Stdout: %q\n", res.Stdout)
fmt.Printf("Stderr: %q\n", res.Stderr)
fmt.Printf("ExitCode: %d\n", res.ExitCode)
fmt.Printf("Error: %v\n", res.Err)
fmt.Printf("Duration: %v\n", res.Duration)
// OUT: HELLO
// OUT: WORLD
// Stdout: "HELLO\nWORLD\n"
// Stderr: ""
// ExitCode: 0
// Error: <nil>
// Duration: 10.123456ms
```

</GoForjExample>

## Error handling model {#error-handling-model}

execx returns two error surfaces:

1) `err` (from `Run`, `Output`, `CombinedOutput`, `Wait`, etc) only reports execution failures:
   - start failures (binary not found, not executable, OS start error)
   - context cancellations or timeouts (`WithContext`, `WithTimeout`, `WithDeadline`)
   - pipeline failures based on `PipeStrict` / `PipeBestEffort`

2) `Result.Err` mirrors `err` for convenience; it is not for exit status.

Exit status is always reported via `Result.ExitCode`, even on non-zero exits. A non-zero exit does not automatically produce `err`.

Use `err` when you want to handle execution failures, and check `Result.ExitCode` (or `Result.OK()` / `Result.IsExitCode`) when you care about command success.

## Non-goals and design principles {#non-goals-and-design-principles}

Design principles:

* Explicit over implicit
* No shell interpolation
* Composable, deterministic behavior

Non-goals:

* Shell scripting replacement
* Command parsing or glob expansion
* Task runners or build systems
* Automatic retries or heuristics

All public APIs are covered by runnable examples under `./examples`, and the test suite executes them to keep docs and behavior in sync.

<!-- api:embed:start -->

## API Index {#api-index}

| Group | Functions |
|------:|:-----------|
| **Arguments** | [Arg](#arg) |
| **Construction** | [Command](#command) |
| **Context** | [WithContext](#withcontext) [WithDeadline](#withdeadline) [WithTimeout](#withtimeout) |
| **Debugging** | [Args](#args) [ShellEscaped](#shellescaped) [String](#string) |
| **Decoding** | [Decode](#decode) [DecodeJSON](#decodejson) [DecodeWith](#decodewith) [DecodeYAML](#decodeyaml) [FromCombined](#fromcombined) [FromStderr](#fromstderr) [FromStdout](#fromstdout) [Into](#into) [Trim](#trim) |
| **Environment** | [Env](#env) [EnvAppend](#envappend) [EnvInherit](#envinherit) [EnvList](#envlist) [EnvOnly](#envonly) |
| **Errors** | [Error](#error) [Unwrap](#unwrap) |
| **Execution** | [CombinedOutput](#combinedoutput) [Output](#output) [OutputBytes](#outputbytes) [OutputTrimmed](#outputtrimmed) [Run](#run) [Start](#start) |
| **Input** | [StdinBytes](#stdinbytes) [StdinFile](#stdinfile) [StdinReader](#stdinreader) [StdinString](#stdinstring) |
| **OS Controls** | [CreationFlags](#creationflags) [HideWindow](#hidewindow) [Pdeathsig](#pdeathsig) [Setpgid](#setpgid) [Setsid](#setsid) |
| **Pipelining** | [Pipe](#pipe) [PipeBestEffort](#pipebesteffort) [PipeStrict](#pipestrict) [PipelineResults](#pipelineresults) |
| **Process** | [GracefulShutdown](#gracefulshutdown) [Interrupt](#interrupt) [KillAfter](#killafter) [Send](#send) [Terminate](#terminate) [Wait](#wait) |
| **Results** | [IsExitCode](#isexitcode) [IsSignal](#issignal) [OK](#ok) |
| **Shadow Print** | [ShadowOff](#shadowoff) [ShadowOn](#shadowon) [ShadowPrint](#shadowprint) [WithFormatter](#withformatter) [WithMask](#withmask) [WithPrefix](#withprefix) |
| **Streaming** | [OnStderr](#onstderr) [OnStdout](#onstdout) [StderrWriter](#stderrwriter) [StdoutWriter](#stdoutwriter) |
| **WorkingDir** | [Dir](#dir) |


## Arguments {#arguments}

### Arg {#arg}

Arg appends arguments to the command.

<GoForjExample repo="execx" example="arg">

```go
// Example: add args
cmd := execx.Command("printf").Arg("hello")
out, _ := cmd.Output()
fmt.Print(out)
// hello
```

</GoForjExample>

## Construction {#construction}

### Command {#command}

Command constructs a new command without executing it.

<GoForjExample repo="execx" example="command">

```go
// Example: command
cmd := execx.Command("printf", "hello")
out, _ := cmd.Output()
fmt.Print(out)
// hello
```

</GoForjExample>

## Context {#context}

### WithContext {#withcontext}

WithContext binds the command to a context.



### WithDeadline {#withdeadline}

WithDeadline binds the command to a deadline.

<GoForjExample repo="execx" example="withdeadline">

```go
// Example: with deadline
res, _ := execx.Command("go", "env", "GOOS").WithDeadline(time.Now().Add(2 * time.Second)).Run()
fmt.Println(res.ExitCode == 0)
// #bool true
```

</GoForjExample>

### WithTimeout {#withtimeout}

WithTimeout binds the command to a timeout.

<GoForjExample repo="execx" example="withtimeout">

```go
// Example: with timeout
res, _ := execx.Command("go", "env", "GOOS").WithTimeout(2 * time.Second).Run()
fmt.Println(res.ExitCode == 0)
// #bool true
```

</GoForjExample>

## Debugging {#debugging}

### Args {#args}

Args returns the argv slice used for execution.

<GoForjExample repo="execx" example="args">

```go
// Example: args
cmd := execx.Command("go", "env", "GOOS")
fmt.Println(strings.Join(cmd.Args(), " "))
// #string go env GOOS
```

</GoForjExample>

### ShellEscaped {#shellescaped}

ShellEscaped returns a shell-escaped string for logging only.

<GoForjExample repo="execx" example="shellescaped">

```go
// Example: shell escaped
cmd := execx.Command("echo", "hello world", "it's")
fmt.Println(cmd.ShellEscaped())
// #string echo 'hello world' "it's"
```

</GoForjExample>

### String {#string}

String returns a human-readable representation of the command.

<GoForjExample repo="execx" example="string">

```go
// Example: string
cmd := execx.Command("echo", "hello world", "it's")
fmt.Println(cmd.String())
// #string echo "hello world" it's
```

</GoForjExample>

## Decoding {#decoding}

### Decode {#decode}

Decode configures a custom decoder for this command.
Decoding reads from stdout by default; use FromStdout, FromStderr, or FromCombined to select a source.

<GoForjExample repo="execx" example="decode">

```go
// Example: decode custom
type payload struct {
	Name string
}
decoder := execx.DecoderFunc(func(data []byte, dst any) error {
	out, ok := dst.(*payload)
	if !ok {
		return fmt.Errorf("expected *payload")
	}
	_, val, ok := strings.Cut(string(data), "=")
	if !ok {
		return fmt.Errorf("invalid payload")
	}
	out.Name = val
	return nil
})
var out payload
_ = execx.Command("printf", "name=gopher").
	Decode(decoder).
	Into(&out)
fmt.Println(out.Name)
// #string gopher
```

</GoForjExample>

### DecodeJSON {#decodejson}

DecodeJSON configures JSON decoding for this command.
Decoding reads from stdout by default; use FromStdout, FromStderr, or FromCombined to select a source.

<GoForjExample repo="execx" example="decodejson">

```go
// Example: decode json
type payload struct {
	Name string `json:"name"`
}
var out payload
_ = execx.Command("printf", `{"name":"gopher"}`).
	DecodeJSON().
	Into(&out)
fmt.Println(out.Name)
// #string gopher
```

</GoForjExample>

### DecodeWith {#decodewith}

DecodeWith executes the command and decodes stdout into dst.

<GoForjExample repo="execx" example="decodewith">

```go
// Example: decode with
type payload struct {
	Name string `json:"name"`
}
var out payload
_ = execx.Command("printf", `{"name":"gopher"}`).
	DecodeWith(&out, execx.DecoderFunc(json.Unmarshal))
fmt.Println(out.Name)
// #string gopher
```

</GoForjExample>

### DecodeYAML {#decodeyaml}

DecodeYAML configures YAML decoding for this command.
Decoding reads from stdout by default; use FromStdout, FromStderr, or FromCombined to select a source.

<GoForjExample repo="execx" example="decodeyaml">

```go
// Example: decode yaml
type payload struct {
	Name string `yaml:"name"`
}
var out payload
_ = execx.Command("printf", "name: gopher").
	DecodeYAML().
	Into(&out)
fmt.Println(out.Name)
// #string gopher
```

</GoForjExample>

### FromCombined {#fromcombined}

FromCombined decodes from combined stdout+stderr.

<GoForjExample repo="execx" example="fromcombined">

```go
// Example: decode combined
type payload struct {
	Name string `json:"name"`
}
var out payload
_ = execx.Command("sh", "-c", `printf '{"name":"gopher"}'`).
	DecodeJSON().
	FromCombined().
	Into(&out)
fmt.Println(out.Name)
// #string gopher
```

</GoForjExample>

### FromStderr {#fromstderr}

FromStderr decodes from stderr.

<GoForjExample repo="execx" example="fromstderr">

```go
// Example: decode from stderr
type payload struct {
	Name string `json:"name"`
}
var out payload
_ = execx.Command("sh", "-c", `printf '{"name":"gopher"}' 1>&2`).
	DecodeJSON().
	FromStderr().
	Into(&out)
fmt.Println(out.Name)
// #string gopher
```

</GoForjExample>

### FromStdout {#fromstdout}

FromStdout decodes from stdout (default).

<GoForjExample repo="execx" example="fromstdout">

```go
// Example: decode from stdout
type payload struct {
	Name string `json:"name"`
}
var out payload
_ = execx.Command("printf", `{"name":"gopher"}`).
	DecodeJSON().
	FromStdout().
	Into(&out)
fmt.Println(out.Name)
// #string gopher
```

</GoForjExample>

### Into {#into}

Into executes the command and decodes into dst.

<GoForjExample repo="execx" example="into">

```go
// Example: decode into
type payload struct {
	Name string `json:"name"`
}
var out payload
_ = execx.Command("printf", `{"name":"gopher"}`).
	DecodeJSON().
	Into(&out)
fmt.Println(out.Name)
// #string gopher
```

</GoForjExample>

### Trim {#trim}

Trim trims whitespace before decoding.

<GoForjExample repo="execx" example="trim">

```go
// Example: decode trim
type payload struct {
	Name string `json:"name"`
}
var out payload
_ = execx.Command("printf", "  {\"name\":\"gopher\"}  ").
	DecodeJSON().
	Trim().
	Into(&out)
fmt.Println(out.Name)
// #string gopher
```

</GoForjExample>

## Environment {#environment}

### Env {#env}

Env adds environment variables to the command.

<GoForjExample repo="execx" example="env">

```go
// Example: set env
cmd := execx.Command("go", "env", "GOOS").Env("MODE=prod")
fmt.Println(strings.Contains(strings.Join(cmd.EnvList(), ","), "MODE=prod"))
// #bool true
```

</GoForjExample>

### EnvAppend {#envappend}

EnvAppend merges variables into the inherited environment.

<GoForjExample repo="execx" example="envappend">

```go
// Example: append env
cmd := execx.Command("go", "env", "GOOS").EnvAppend(map[string]string{"A": "1"})
fmt.Println(strings.Contains(strings.Join(cmd.EnvList(), ","), "A=1"))
// #bool true
```

</GoForjExample>

### EnvInherit {#envinherit}

EnvInherit restores default environment inheritance.

<GoForjExample repo="execx" example="envinherit">

```go
// Example: inherit env
cmd := execx.Command("go", "env", "GOOS").EnvInherit()
fmt.Println(len(cmd.EnvList()) > 0)
// #bool true
```

</GoForjExample>

### EnvList {#envlist}

EnvList returns the environment list for execution.

<GoForjExample repo="execx" example="envlist">

```go
// Example: env list
cmd := execx.Command("go", "env", "GOOS").EnvOnly(map[string]string{"A": "1"})
fmt.Println(strings.Join(cmd.EnvList(), ","))
// #string A=1
```

</GoForjExample>

### EnvOnly {#envonly}

EnvOnly ignores the parent environment.

<GoForjExample repo="execx" example="envonly">

```go
// Example: replace env
cmd := execx.Command("go", "env", "GOOS").EnvOnly(map[string]string{"A": "1"})
fmt.Println(strings.Join(cmd.EnvList(), ","))
// #string A=1
```

</GoForjExample>

## Errors {#errors}

### Error {#error}

Error returns the wrapped error message when available.

<GoForjExample repo="execx" example="error">

```go
// Example: error string
err := execx.ErrExec{Err: fmt.Errorf("boom")}
fmt.Println(err.Error())
// #string boom
```

</GoForjExample>

### Unwrap {#unwrap}

Unwrap exposes the underlying error.

<GoForjExample repo="execx" example="unwrap">

```go
// Example: unwrap
err := execx.ErrExec{Err: fmt.Errorf("boom")}
fmt.Println(err.Unwrap() != nil)
// #bool true
```

</GoForjExample>

## Execution {#execution}

### CombinedOutput {#combinedoutput}

CombinedOutput executes the command and returns stdout+stderr and any error.

<GoForjExample repo="execx" example="combinedoutput">

```go
// Example: combined output
out, err := execx.Command("go", "env", "-badflag").CombinedOutput()
fmt.Print(out)
fmt.Println(err == nil)
// flag provided but not defined: -badflag
// usage: go env [-json] [-changed] [-u] [-w] [var ...]
// Run 'go help env' for details.
// false
```

</GoForjExample>

### Output {#output}

Output executes the command and returns stdout and any error.

<GoForjExample repo="execx" example="output">

```go
// Example: output
out, _ := execx.Command("printf", "hello").Output()
fmt.Print(out)
// hello
```

</GoForjExample>

### OutputBytes {#outputbytes}

OutputBytes executes the command and returns stdout bytes and any error.

<GoForjExample repo="execx" example="outputbytes">

```go
// Example: output bytes
out, _ := execx.Command("printf", "hello").OutputBytes()
fmt.Println(string(out))
// #string hello
```

</GoForjExample>

### OutputTrimmed {#outputtrimmed}

OutputTrimmed executes the command and returns trimmed stdout and any error.

<GoForjExample repo="execx" example="outputtrimmed">

```go
// Example: output trimmed
out, _ := execx.Command("printf", "hello\n").OutputTrimmed()
fmt.Println(out)
// #string hello
```

</GoForjExample>

### Run {#run}

Run executes the command and returns the result and any error.

<GoForjExample repo="execx" example="run">

```go
// Example: run
res, _ := execx.Command("go", "env", "GOOS").Run()
fmt.Println(res.ExitCode == 0)
// #bool true
```

</GoForjExample>

### Start {#start}

Start executes the command asynchronously.



## Input {#input}

### StdinBytes {#stdinbytes}

StdinBytes sets stdin from bytes.

<GoForjExample repo="execx" example="stdinbytes">

```go
// Example: stdin bytes
out, _ := execx.Command("cat").
	StdinBytes([]byte("hi")).
	Output()
fmt.Println(out)
// #string hi
```

</GoForjExample>

### StdinFile {#stdinfile}

StdinFile sets stdin from a file.

<GoForjExample repo="execx" example="stdinfile">

```go
// Example: stdin file
file, _ := os.CreateTemp("", "execx-stdin")
_, _ = file.WriteString("hi")
_, _ = file.Seek(0, 0)
out, _ := execx.Command("cat").
	StdinFile(file).
	Output()
fmt.Println(out)
// #string hi
```

</GoForjExample>

### StdinReader {#stdinreader}

StdinReader sets stdin from an io.Reader.

<GoForjExample repo="execx" example="stdinreader">

```go
// Example: stdin reader
out, _ := execx.Command("cat").
	StdinReader(strings.NewReader("hi")).
	Output()
fmt.Println(out)
// #string hi
```

</GoForjExample>

### StdinString {#stdinstring}

StdinString sets stdin from a string.

<GoForjExample repo="execx" example="stdinstring">

```go
// Example: stdin string
out, _ := execx.Command("cat").
	StdinString("hi").
	Output()
fmt.Println(out)
// #string hi
```

</GoForjExample>

## OS Controls {#os-controls}

### CreationFlags {#creationflags}

CreationFlags is a no-op on non-Windows platforms; on Windows it sets process creation flags.

<GoForjExample repo="execx" example="creationflags">

```go
// Example: creation flags
out, _ := execx.Command("printf", "ok").CreationFlags(execx.CreateNewProcessGroup).Output()
fmt.Print(out)
// ok
```

</GoForjExample>

### HideWindow {#hidewindow}

HideWindow is a no-op on non-Windows platforms; on Windows it hides console windows.

<GoForjExample repo="execx" example="hidewindow">

```go
// Example: hide window
out, _ := execx.Command("printf", "ok").HideWindow(true).Output()
fmt.Print(out)
// ok
```

</GoForjExample>

### Pdeathsig {#pdeathsig}

Pdeathsig is a no-op on non-Linux platforms; on Linux it signals the child when the parent exits.

<GoForjExample repo="execx" example="pdeathsig">

```go
// Example: pdeathsig
out, _ := execx.Command("printf", "ok").Pdeathsig(syscall.SIGTERM).Output()
fmt.Print(out)
// ok
```

</GoForjExample>

### Setpgid {#setpgid}

Setpgid places the child in a new process group for group signals.

<GoForjExample repo="execx" example="setpgid">

```go
// Example: setpgid
out, _ := execx.Command("printf", "ok").Setpgid(true).Output()
fmt.Print(out)
// ok
```

</GoForjExample>

### Setsid {#setsid}

Setsid starts the child in a new session, detaching it from the terminal.

<GoForjExample repo="execx" example="setsid">

```go
// Example: setsid
out, _ := execx.Command("printf", "ok").Setsid(true).Output()
fmt.Print(out)
// ok
```

</GoForjExample>

## Pipelining {#pipelining-2}

### Pipe {#pipe}

Pipe appends a new command to the pipeline. Pipelines run on all platforms.



### PipeBestEffort {#pipebesteffort}

PipeBestEffort sets best-effort pipeline semantics (run all stages, surface the first error).

<GoForjExample repo="execx" example="pipebesteffort">

```go
// Example: best effort
res, _ := execx.Command("false").
	Pipe("printf", "ok").
	PipeBestEffort().
	Run()
fmt.Print(res.Stdout)
// ok
```

</GoForjExample>

### PipeStrict {#pipestrict}

PipeStrict sets strict pipeline semantics (stop on first failure).

<GoForjExample repo="execx" example="pipestrict">

```go
// Example: strict
res, _ := execx.Command("false").
	Pipe("printf", "ok").
	PipeStrict().
	Run()
fmt.Println(res.ExitCode != 0)
// #bool true
```

</GoForjExample>

### PipelineResults {#pipelineresults}

PipelineResults executes the command and returns per-stage results and any error.

<GoForjExample repo="execx" example="pipelineresults">

```go
// Example: pipeline results
results, _ := execx.Command("printf", "go").
	Pipe("tr", "a-z", "A-Z").
	PipelineResults()
fmt.Printf("%+v", results)
// [
//	{Stdout:go Stderr: ExitCode:0 Err:<nil> Duration:6.367208ms signal:<nil>}
//	{Stdout:GO Stderr: ExitCode:0 Err:<nil> Duration:4.976291ms signal:<nil>}
// ]
```

</GoForjExample>

## Process {#process}

### GracefulShutdown {#gracefulshutdown}

GracefulShutdown sends a signal and escalates to kill after the timeout.

<GoForjExample repo="execx" example="gracefulshutdown">

```go
// Example: graceful shutdown
proc := execx.Command("sleep", "2").Start()
_ = proc.GracefulShutdown(os.Interrupt, 100*time.Millisecond)
res, _ := proc.Wait()
fmt.Println(res.IsSignal(os.Interrupt))
// #bool true
```

</GoForjExample>

### Interrupt {#interrupt}

Interrupt sends an interrupt signal to the process.

<GoForjExample repo="execx" example="interrupt">

```go
// Example: interrupt
proc := execx.Command("sleep", "2").Start()
_ = proc.Interrupt()
res, _ := proc.Wait()
fmt.Printf("%+v", res)
// {Stdout: Stderr: ExitCode:-1 Err:<nil> Duration:75.987ms signal:interrupt}
```

</GoForjExample>

### KillAfter {#killafter}

KillAfter terminates the process after the given duration.

<GoForjExample repo="execx" example="killafter">

```go
// Example: kill after
proc := execx.Command("sleep", "2").Start()
proc.KillAfter(100 * time.Millisecond)
res, _ := proc.Wait()
fmt.Printf("%+v", res)
// {Stdout: Stderr: ExitCode:-1 Err:<nil> Duration:100.456ms signal:killed}
```

</GoForjExample>

### Send {#send}

Send sends a signal to the process.

<GoForjExample repo="execx" example="send">

```go
// Example: send signal
proc := execx.Command("sleep", "2").Start()
_ = proc.Send(os.Interrupt)
res, _ := proc.Wait()
fmt.Printf("%+v", res)
// {Stdout: Stderr: ExitCode:-1 Err:<nil> Duration:80.123ms signal:interrupt}
```

</GoForjExample>

### Terminate {#terminate}

Terminate kills the process immediately.

<GoForjExample repo="execx" example="terminate">

```go
// Example: terminate
proc := execx.Command("sleep", "2").Start()
_ = proc.Terminate()
res, _ := proc.Wait()
fmt.Printf("%+v", res)
// {Stdout: Stderr: ExitCode:-1 Err:<nil> Duration:70.654ms signal:killed}
```

</GoForjExample>

### Wait {#wait}

Wait waits for the command to complete and returns the result and any error.

<GoForjExample repo="execx" example="wait">

```go
// Example: wait
proc := execx.Command("go", "env", "GOOS").Start()
res, _ := proc.Wait()
fmt.Printf("%+v", res)
// {Stdout:darwin
// Stderr: ExitCode:0 Err:<nil> Duration:1.234ms signal:<nil>}
```

</GoForjExample>

## Results {#results}

### IsExitCode {#isexitcode}

IsExitCode reports whether the exit code matches.

<GoForjExample repo="execx" example="isexitcode">

```go
// Example: exit code
res, _ := execx.Command("go", "env", "GOOS").Run()
fmt.Println(res.IsExitCode(0))
// #bool true
```

</GoForjExample>

### IsSignal {#issignal}

IsSignal reports whether the command terminated due to a signal.

<GoForjExample repo="execx" example="issignal">

```go
// Example: signal
res, _ := execx.Command("go", "env", "GOOS").Run()
fmt.Println(res.IsSignal(os.Interrupt))
// false
```

</GoForjExample>

### OK {#ok}

OK reports whether the command exited cleanly without errors.

<GoForjExample repo="execx" example="ok">

```go
// Example: ok
res, _ := execx.Command("go", "env", "GOOS").Run()
fmt.Println(res.OK())
// #bool true
```

</GoForjExample>

## Shadow Print {#shadow-print}

### ShadowOff {#shadowoff}

ShadowOff disables shadow printing for this command chain, preserving configuration.

<GoForjExample repo="execx" example="shadowoff">

```go
// Example: shadow off
_, _ = execx.Command("printf", "hi").ShadowPrint().ShadowOff().Run()
```

</GoForjExample>

### ShadowOn {#shadowon}

ShadowOn enables shadow printing using the previously configured options.

<GoForjExample repo="execx" example="shadowon">

```go
// Example: shadow on
cmd := execx.Command("printf", "hi").
	ShadowPrint(execx.WithPrefix("run"))
cmd.ShadowOff()
_, _ = cmd.ShadowOn().Run()
// run > printf hi
// run > printf hi (1ms)
```

</GoForjExample>

### ShadowPrint {#shadowprint}

ShadowPrint configures shadow printing for this command chain.


<GoForjExample repo="execx" example="shadowprint">

```go
// Example: shadow print
_, _ = execx.Command("bash", "-c", `echo "hello world"`).
	ShadowPrint().
	OnStdout(func(line string) { fmt.Println(line) }).
	Run()
// execx > bash -c 'echo "hello world"'
//
// hello world
//
// execx > bash -c 'echo "hello world"' (1ms)

// Example: shadow print options
mask := func(cmd string) string {
	return strings.ReplaceAll(cmd, "token", "***")
}
formatter := func(ev execx.ShadowEvent) string {
	return fmt.Sprintf("shadow: %s %s", ev.Phase, ev.Command)
}
_, _ = execx.Command("bash", "-c", `echo "hello world"`).
	ShadowPrint(
		execx.WithPrefix("execx"),
		execx.WithMask(mask),
		execx.WithFormatter(formatter),
	).
	OnStdout(func(line string) { fmt.Println(line) }).
	Run()
// shadow: before bash -c 'echo "hello world"'
// hello world
// shadow: after bash -c 'echo "hello world"'
```

</GoForjExample>




### WithFormatter {#withformatter}

WithFormatter sets a formatter for ShadowPrint output.

<GoForjExample repo="execx" example="withformatter">

```go
// Example: shadow formatter
formatter := func(ev execx.ShadowEvent) string {
	return fmt.Sprintf("shadow: %s %s", ev.Phase, ev.Command)
}
_, _ = execx.Command("printf", "hi").ShadowPrint(execx.WithFormatter(formatter)).Run()
// shadow: before printf hi
// shadow: after printf hi
```

</GoForjExample>

### WithMask {#withmask}

WithMask applies a masker to the shadow-printed command string.

<GoForjExample repo="execx" example="withmask">

```go
// Example: shadow mask
mask := func(cmd string) string {
	return strings.ReplaceAll(cmd, "secret", "***")
}
_, _ = execx.Command("printf", "secret").ShadowPrint(execx.WithMask(mask)).Run()
// execx > printf ***
// execx > printf *** (1ms)
```

</GoForjExample>

### WithPrefix {#withprefix}

WithPrefix sets the shadow print prefix.

<GoForjExample repo="execx" example="withprefix">

```go
// Example: shadow prefix
_, _ = execx.Command("printf", "hi").ShadowPrint(execx.WithPrefix("run")).Run()
// run > printf hi
// run > printf hi (1ms)
```

</GoForjExample>

## Streaming {#streaming}

### OnStderr {#onstderr}

OnStderr registers a line callback for stderr.

<GoForjExample repo="execx" example="onstderr">

```go
// Example: stderr lines
_, err := execx.Command("go", "env", "-badflag").
	OnStderr(func(line string) {
		fmt.Println(line)
	}).
	Run()
fmt.Println(err == nil)
// flag provided but not defined: -badflag
// usage: go env [-json] [-changed] [-u] [-w] [var ...]
// Run 'go help env' for details.
// false
```

</GoForjExample>

### OnStdout {#onstdout}

OnStdout registers a line callback for stdout.

<GoForjExample repo="execx" example="onstdout">

```go
// Example: stdout lines
_, _ = execx.Command("printf", "hi\n").
	OnStdout(func(line string) { fmt.Println(line) }).
	Run()
// hi
```

</GoForjExample>

### StderrWriter {#stderrwriter}

StderrWriter sets a raw writer for stderr.

<GoForjExample repo="execx" example="stderrwriter">

```go
// Example: stderr writer
var out strings.Builder
_, err := execx.Command("go", "env", "-badflag").
	StderrWriter(&out).
	Run()
fmt.Print(out.String())
fmt.Println(err == nil)
// flag provided but not defined: -badflag
// usage: go env [-json] [-changed] [-u] [-w] [var ...]
// Run 'go help env' for details.
// false
```

</GoForjExample>

### StdoutWriter {#stdoutwriter}

StdoutWriter sets a raw writer for stdout.

<GoForjExample repo="execx" example="stdoutwriter">

```go
// Example: stdout writer
var out strings.Builder
_, _ = execx.Command("printf", "hello").
	StdoutWriter(&out).
	Run()
fmt.Print(out.String())
// hello
```

</GoForjExample>

## WorkingDir {#workingdir}

### Dir {#dir}

Dir sets the working directory.

<GoForjExample repo="execx" example="dir">

```go
// Example: change dir
dir := os.TempDir()
out, _ := execx.Command("pwd").
	Dir(dir).
	OutputTrimmed()
fmt.Println(out == dir)
// #bool true
```

</GoForjExample>
<!-- api:embed:end -->
