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

```go
out, _ := execx.Command("printf", "go").
	Pipe("tr", "a-z", "A-Z").
	OutputTrimmed()
fmt.Println(out)
// #string GO
```

On Windows, use `cmd /c` or `powershell -Command` for shell built-ins.

`PipeStrict` (default) stops at the first failing stage and returns that error.  
`PipeBestEffort` runs all stages, returns the last stage output, and surfaces the first error if any stage failed.

## Context & cancellation {#context-&-cancellation}

```go
ctx, cancel := context.WithTimeout(context.Background(), time.Second)
defer cancel()
res, _ := execx.Command("go", "env", "GOOS").WithContext(ctx).Run()
fmt.Println(res.ExitCode == 0)
// #bool true
```

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

```go
proc := execx.Command("go", "env", "GOOS").Start()
res, _ := proc.Wait()
fmt.Println(res.ExitCode == 0)
// #bool true
```

Signals, timeouts, and OS controls are documented in the API section below.

ShadowPrint is available for emitting the command line before and after execution.

## Kitchen Sink Chaining Example {#kitchen-sink-chaining-example}

```go
// Run executes the command and returns the result and any error.

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
| **Execution** | [CombinedOutput](#combinedoutput) [Output](#output) [OutputBytes](#outputbytes) [OutputTrimmed](#outputtrimmed) [Run](#run) [Start](#start) [OnExecCmd](#onexeccmd) |
| **Input** | [StdinBytes](#stdinbytes) [StdinFile](#stdinfile) [StdinReader](#stdinreader) [StdinString](#stdinstring) |
| **OS Controls** | [CreationFlags](#creationflags) [HideWindow](#hidewindow) [Pdeathsig](#pdeathsig) [Setpgid](#setpgid) [Setsid](#setsid) |
| **Pipelining** | [Pipe](#pipe) [PipeBestEffort](#pipebesteffort) [PipeStrict](#pipestrict) [PipelineResults](#pipelineresults) |
| **Process** | [GracefulShutdown](#gracefulshutdown) [Interrupt](#interrupt) [KillAfter](#killafter) [Send](#send) [Terminate](#terminate) [Wait](#wait) |
| **Results** | [IsExitCode](#isexitcode) [IsSignal](#issignal) [OK](#ok) |
| **Shadow Print** | [ShadowOff](#shadowoff) [ShadowOn](#shadowon) [ShadowPrint](#shadowprint) [WithFormatter](#withformatter) [WithMask](#withmask) [WithPrefix](#withprefix) |
| **Streaming** | [OnStderr](#onstderr) [OnStdout](#onstdout) [StderrWriter](#stderrwriter) [StdoutWriter](#stdoutwriter) [WithPTY](#withpty) |
| **WorkingDir** | [Dir](#dir) |


## Arguments {#arguments}

### Arg {#arg}

Arg appends arguments to the command.

```go
cmd := execx.Command("printf").Arg("hello")
out, _ := cmd.Output()
fmt.Print(out)
// hello
```

## Construction {#construction}

### Command {#command}

Command constructs a new command without executing it.

```go
cmd := execx.Command("printf", "hello")
out, _ := cmd.Output()
fmt.Print(out)
// hello
```

## Context {#context}

### WithContext {#withcontext}

WithContext binds the command to a context.

```go
ctx, cancel := context.WithTimeout(context.Background(), time.Second)
defer cancel()
res, _ := execx.Command("go", "env", "GOOS").WithContext(ctx).Run()
fmt.Println(res.ExitCode == 0)
// #bool true
```

### WithDeadline {#withdeadline}

WithDeadline binds the command to a deadline.

```go
res, _ := execx.Command("go", "env", "GOOS").WithDeadline(time.Now().Add(2 * time.Second)).Run()
fmt.Println(res.ExitCode == 0)
// #bool true
```

### WithTimeout {#withtimeout}

WithTimeout binds the command to a timeout.

```go
res, _ := execx.Command("go", "env", "GOOS").WithTimeout(2 * time.Second).Run()
fmt.Println(res.ExitCode == 0)
// #bool true
```

## Debugging {#debugging}

### Args {#args}

Args returns the argv slice used for execution.

```go
cmd := execx.Command("go", "env", "GOOS")
fmt.Println(strings.Join(cmd.Args(), " "))
// #string go env GOOS
```

### ShellEscaped {#shellescaped}

ShellEscaped returns a shell-escaped string for logging only.

```go
cmd := execx.Command("echo", "hello world", "it's")
fmt.Println(cmd.ShellEscaped())
// #string echo 'hello world' "it's"
```

### String {#string}

String returns a human-readable representation of the command.

```go
cmd := execx.Command("echo", "hello world", "it's")
fmt.Println(cmd.String())
// #string echo "hello world" it's
```

## Decoding {#decoding}

### Decode {#decode}

Decode configures a custom decoder for this command.
Decoding reads from stdout by default; use FromStdout, FromStderr, or FromCombined to select a source.

```go
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

### DecodeJSON {#decodejson}

DecodeJSON configures JSON decoding for this command.
Decoding reads from stdout by default; use FromStdout, FromStderr, or FromCombined to select a source.

```go
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

### DecodeWith {#decodewith}

DecodeWith executes the command and decodes stdout into dst.

```go
type payload struct {
	Name string `json:"name"`
}
var out payload
_ = execx.Command("printf", `{"name":"gopher"}`).
	DecodeWith(&out, execx.DecoderFunc(json.Unmarshal))
fmt.Println(out.Name)
// #string gopher
```

### DecodeYAML {#decodeyaml}

DecodeYAML configures YAML decoding for this command.
Decoding reads from stdout by default; use FromStdout, FromStderr, or FromCombined to select a source.

```go
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

### FromCombined {#fromcombined}

FromCombined decodes from combined stdout+stderr.

```go
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

### FromStderr {#fromstderr}

FromStderr decodes from stderr.

```go
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

### FromStdout {#fromstdout}

FromStdout decodes from stdout (default).

```go
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

### Into {#into}

Into executes the command and decodes into dst.

```go
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

### Trim {#trim}

Trim trims whitespace before decoding.

```go
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

## Environment {#environment}

### Env {#env}

Env adds environment variables to the command.

```go
cmd := execx.Command("go", "env", "GOOS").Env("MODE=prod")
fmt.Println(strings.Contains(strings.Join(cmd.EnvList(), ","), "MODE=prod"))
// #bool true
```

### EnvAppend {#envappend}

EnvAppend merges variables into the inherited environment.

```go
cmd := execx.Command("go", "env", "GOOS").EnvAppend(map[string]string{"A": "1"})
fmt.Println(strings.Contains(strings.Join(cmd.EnvList(), ","), "A=1"))
// #bool true
```

### EnvInherit {#envinherit}

EnvInherit restores default environment inheritance.

```go
cmd := execx.Command("go", "env", "GOOS").EnvInherit()
fmt.Println(len(cmd.EnvList()) > 0)
// #bool true
```

### EnvList {#envlist}

EnvList returns the environment list for execution.

```go
cmd := execx.Command("go", "env", "GOOS").EnvOnly(map[string]string{"A": "1"})
fmt.Println(strings.Join(cmd.EnvList(), ","))
// #string A=1
```

### EnvOnly {#envonly}

EnvOnly ignores the parent environment.

```go
cmd := execx.Command("go", "env", "GOOS").EnvOnly(map[string]string{"A": "1"})
fmt.Println(strings.Join(cmd.EnvList(), ","))
// #string A=1
```

## Errors {#errors}

### Error {#error}

Error returns the wrapped error message when available.

```go
err := execx.ErrExec{Err: fmt.Errorf("boom")}
fmt.Println(err.Error())
// #string boom
```

### Unwrap {#unwrap}

Unwrap exposes the underlying error.

```go
err := execx.ErrExec{Err: fmt.Errorf("boom")}
fmt.Println(err.Unwrap() != nil)
// #bool true
```

## Execution {#execution}

### CombinedOutput {#combinedoutput}

CombinedOutput executes the command and returns stdout+stderr and any error.

```go
out, err := execx.Command("go", "env", "-badflag").CombinedOutput()
fmt.Print(out)
fmt.Println(err == nil)
// flag provided but not defined: -badflag
// usage: go env [-json] [-changed] [-u] [-w] [var ...]
// Run 'go help env' for details.
// false
```

### Output {#output}

Output executes the command and returns stdout and any error.

```go
out, _ := execx.Command("printf", "hello").Output()
fmt.Print(out)
// hello
```

### OutputBytes {#outputbytes}

OutputBytes executes the command and returns stdout bytes and any error.

```go
out, _ := execx.Command("printf", "hello").OutputBytes()
fmt.Println(string(out))
// #string hello
```

### OutputTrimmed {#outputtrimmed}

OutputTrimmed executes the command and returns trimmed stdout and any error.

```go
out, _ := execx.Command("printf", "hello\n").OutputTrimmed()
fmt.Println(out)
// #string hello
```

### Run {#run}

Run executes the command and returns the result and any error.

```go
res, _ := execx.Command("go", "env", "GOOS").Run()
fmt.Println(res.ExitCode == 0)
// #bool true
```

### Start {#start}

Start executes the command asynchronously.

```go
proc := execx.Command("go", "env", "GOOS").Start()
res, _ := proc.Wait()
fmt.Println(res.ExitCode == 0)
// #bool true
```

### OnExecCmd {#onexeccmd}

OnExecCmd registers a callback to mutate the underlying exec.Cmd before start.

```go
_, _ = execx.Command("printf", "hi").
	OnExecCmd(func(cmd *exec.Cmd) {
		cmd.Env = append(cmd.Env, "EXAMPLE=1")
	}).
	Run()
```

## Input {#input}

### StdinBytes {#stdinbytes}

StdinBytes sets stdin from bytes.

```go
out, _ := execx.Command("cat").
	StdinBytes([]byte("hi")).
	Output()
fmt.Println(out)
// #string hi
```

### StdinFile {#stdinfile}

StdinFile sets stdin from a file.

```go
file, _ := os.CreateTemp("", "execx-stdin")
_, _ = file.WriteString("hi")
_, _ = file.Seek(0, 0)
out, _ := execx.Command("cat").
	StdinFile(file).
	Output()
fmt.Println(out)
// #string hi
```

### StdinReader {#stdinreader}

StdinReader sets stdin from an io.Reader.

```go
out, _ := execx.Command("cat").
	StdinReader(strings.NewReader("hi")).
	Output()
fmt.Println(out)
// #string hi
```

### StdinString {#stdinstring}

StdinString sets stdin from a string.

```go
out, _ := execx.Command("cat").
	StdinString("hi").
	Output()
fmt.Println(out)
// #string hi
```

## OS Controls {#os-controls}

### CreationFlags {#creationflags}

CreationFlags is a no-op on non-Windows platforms; on Windows it sets process creation flags.

```go
out, _ := execx.Command("printf", "ok").CreationFlags(execx.CreateNewProcessGroup).Output()
fmt.Print(out)
// ok
```

### HideWindow {#hidewindow}

HideWindow is a no-op on non-Windows platforms; on Windows it hides console windows.

```go
out, _ := execx.Command("printf", "ok").HideWindow(true).Output()
fmt.Print(out)
// ok
```

### Pdeathsig {#pdeathsig}

Pdeathsig is a no-op on non-Linux platforms; on Linux it signals the child when the parent exits.

```go
out, _ := execx.Command("printf", "ok").Pdeathsig(syscall.SIGTERM).Output()
fmt.Print(out)
// ok
```

### Setpgid {#setpgid}

Setpgid places the child in a new process group for group signals.

```go
out, _ := execx.Command("printf", "ok").Setpgid(true).Output()
fmt.Print(out)
// ok
```

### Setsid {#setsid}

Setsid starts the child in a new session, detaching it from the terminal.

```go
out, _ := execx.Command("printf", "ok").Setsid(true).Output()
fmt.Print(out)
// ok
```

## Pipelining {#pipelining-2}

### Pipe {#pipe}

Pipe appends a new command to the pipeline. Pipelines run on all platforms.

```go
out, _ := execx.Command("printf", "go").
	Pipe("tr", "a-z", "A-Z").
	OutputTrimmed()
fmt.Println(out)
// #string GO
```

### PipeBestEffort {#pipebesteffort}

PipeBestEffort sets best-effort pipeline semantics (run all stages, surface the first error).

```go
res, _ := execx.Command("false").
	Pipe("printf", "ok").
	PipeBestEffort().
	Run()
fmt.Print(res.Stdout)
// ok
```

### PipeStrict {#pipestrict}

PipeStrict sets strict pipeline semantics (stop on first failure).

```go
res, _ := execx.Command("false").
	Pipe("printf", "ok").
	PipeStrict().
	Run()
fmt.Println(res.ExitCode != 0)
// #bool true
```

### PipelineResults {#pipelineresults}

PipelineResults executes the command and returns per-stage results and any error.

```go
results, _ := execx.Command("printf", "go").
	Pipe("tr", "a-z", "A-Z").
	PipelineResults()
fmt.Printf("%+v", results)
// [
//	{Stdout:go Stderr: ExitCode:0 Err:<nil> Duration:6.367208ms signal:<nil>}
//	{Stdout:GO Stderr: ExitCode:0 Err:<nil> Duration:4.976291ms signal:<nil>}
// ]
```

## Process {#process}

### GracefulShutdown {#gracefulshutdown}

GracefulShutdown sends a signal and escalates to kill after the timeout.

```go
proc := execx.Command("sleep", "2").Start()
_ = proc.GracefulShutdown(os.Interrupt, 100*time.Millisecond)
res, _ := proc.Wait()
fmt.Println(res.IsSignal(os.Interrupt))
// #bool true
```

### Interrupt {#interrupt}

Interrupt sends an interrupt signal to the process.

```go
proc := execx.Command("sleep", "2").Start()
_ = proc.Interrupt()
res, _ := proc.Wait()
fmt.Printf("%+v", res)
// {Stdout: Stderr: ExitCode:-1 Err:<nil> Duration:75.987ms signal:interrupt}
```

### KillAfter {#killafter}

KillAfter terminates the process after the given duration.

```go
proc := execx.Command("sleep", "2").Start()
proc.KillAfter(100 * time.Millisecond)
res, _ := proc.Wait()
fmt.Printf("%+v", res)
// {Stdout: Stderr: ExitCode:-1 Err:<nil> Duration:100.456ms signal:killed}
```

### Send {#send}

Send sends a signal to the process.

```go
proc := execx.Command("sleep", "2").Start()
_ = proc.Send(os.Interrupt)
res, _ := proc.Wait()
fmt.Printf("%+v", res)
// {Stdout: Stderr: ExitCode:-1 Err:<nil> Duration:80.123ms signal:interrupt}
```

### Terminate {#terminate}

Terminate kills the process immediately.

```go
proc := execx.Command("sleep", "2").Start()
_ = proc.Terminate()
res, _ := proc.Wait()
fmt.Printf("%+v", res)
// {Stdout: Stderr: ExitCode:-1 Err:<nil> Duration:70.654ms signal:killed}
```

### Wait {#wait}

Wait waits for the command to complete and returns the result and any error.

```go
proc := execx.Command("go", "env", "GOOS").Start()
res, _ := proc.Wait()
fmt.Printf("%+v", res)
// {Stdout:darwin
// Stderr: ExitCode:0 Err:<nil> Duration:1.234ms signal:<nil>}
```

## Results {#results}

### IsExitCode {#isexitcode}

IsExitCode reports whether the exit code matches.

```go
res, _ := execx.Command("go", "env", "GOOS").Run()
fmt.Println(res.IsExitCode(0))
// #bool true
```

### IsSignal {#issignal}

IsSignal reports whether the command terminated due to a signal.

```go
res, _ := execx.Command("go", "env", "GOOS").Run()
fmt.Println(res.IsSignal(os.Interrupt))
// false
```

### OK {#ok}

OK reports whether the command exited cleanly without errors.

```go
res, _ := execx.Command("go", "env", "GOOS").Run()
fmt.Println(res.OK())
// #bool true
```

## Shadow Print {#shadow-print}

### ShadowOff {#shadowoff}

ShadowOff disables shadow printing for this command chain, preserving configuration.

```go
_, _ = execx.Command("printf", "hi").ShadowPrint().ShadowOff().Run()
```

### ShadowOn {#shadowon}

ShadowOn enables shadow printing using the previously configured options.

```go
cmd := execx.Command("printf", "hi").
	ShadowPrint(execx.WithPrefix("run"))
cmd.ShadowOff()
_, _ = cmd.ShadowOn().Run()
// run > printf hi
// run > printf hi (1ms)
```

### ShadowPrint {#shadowprint}

ShadowPrint configures shadow printing for this command chain.

_Example: shadow print_

```go
_, _ = execx.Command("bash", "-c", `echo "hello world"`).
	ShadowPrint().
	OnStdout(func(line string) { fmt.Println(line) }).
	Run()
// execx > bash -c 'echo "hello world"'
//
// hello world
//
// execx > bash -c 'echo "hello world"' (1ms)
```

_Example: shadow print options_

```go
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

### WithFormatter {#withformatter}

WithFormatter sets a formatter for ShadowPrint output.

```go
formatter := func(ev execx.ShadowEvent) string {
	return fmt.Sprintf("shadow: %s %s", ev.Phase, ev.Command)
}
_, _ = execx.Command("printf", "hi").ShadowPrint(execx.WithFormatter(formatter)).Run()
// shadow: before printf hi
// shadow: after printf hi
```

### WithMask {#withmask}

WithMask applies a masker to the shadow-printed command string.

```go
mask := func(cmd string) string {
	return strings.ReplaceAll(cmd, "secret", "***")
}
_, _ = execx.Command("printf", "secret").ShadowPrint(execx.WithMask(mask)).Run()
// execx > printf ***
// execx > printf *** (1ms)
```

### WithPrefix {#withprefix}

WithPrefix sets the shadow print prefix.

```go
_, _ = execx.Command("printf", "hi").ShadowPrint(execx.WithPrefix("run")).Run()
// run > printf hi
// run > printf hi (1ms)
```

## Streaming {#streaming}

### OnStderr {#onstderr}

OnStderr registers a line callback for stderr.

```go
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

### OnStdout {#onstdout}

OnStdout registers a line callback for stdout.

```go
_, _ = execx.Command("printf", "hi\n").
	OnStdout(func(line string) { fmt.Println(line) }).
	Run()
// hi
```

### StderrWriter {#stderrwriter}

StderrWriter sets a raw writer for stderr.

When the writer is a terminal and no line callbacks or combined output are enabled, execx passes stderr through directly and does not buffer it for results.

```go
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

### StdoutWriter {#stdoutwriter}

StdoutWriter sets a raw writer for stdout.

When the writer is a terminal and no line callbacks or combined output are enabled, execx passes stdout through directly and does not buffer it for results.

```go
var out strings.Builder
_, _ = execx.Command("printf", "hello").
	StdoutWriter(&out).
	Run()
fmt.Print(out.String())
// hello
```

### WithPTY {#withpty}

WithPTY attaches stdout/stderr to a pseudo-terminal.

Output is combined; OnStdout and OnStderr receive the same lines, and Result.Stderr remains empty.
Platforms without PTY support return an error when the command runs.

```go
_, _ = execx.Command("printf", "hi").
	WithPTY().
	OnStdout(func(line string) { fmt.Println(line) }).
	Run()
// hi
```

## WorkingDir {#workingdir}

### Dir {#dir}

Dir sets the working directory.

```go
dir := os.TempDir()
out, _ := execx.Command("pwd").
	Dir(dir).
	OutputTrimmed()
fmt.Println(out == dir)
// #bool true
```
<!-- api:embed:end -->
