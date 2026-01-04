---
title: Scheduler
---

<p align="center">
  <img src="https://raw.githubusercontent.com/goforj/scheduler/main/docs/images/logo.png?v=2" width="400" alt="scheduler logo">
</p>

<p align="center">
    A fluent, Laravel-inspired scheduler for Go that wraps gocron with expressive APIs for defining, filtering, and controlling scheduled jobs.
</p>

<p align="center">
    <a href="https://pkg.go.dev/github.com/goforj/scheduler"><img src="https://pkg.go.dev/badge/github.com/goforj/scheduler.svg" alt="Go Reference"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
    <a href="https://github.com/goforj/scheduler/actions"><img src="https://github.com/goforj/scheduler/actions/workflows/test.yml/badge.svg" alt="Go Test"></a>
    <a href="https://golang.org"><img src="https://img.shields.io/badge/go-1.18+-blue?logo=go" alt="Go version"></a>
    <img src="https://img.shields.io/github/v/tag/goforj/scheduler?label=version&sort=semver" alt="Latest tag">
    <a href="https://codecov.io/gh/goforj/scheduler" ><img src="https://codecov.io/github/goforj/scheduler/graph/badge.svg?token=9KT46ZORP3"/></a>
<!-- test-count:embed:start -->
    <img src="https://img.shields.io/badge/tests-191-brightgreen" alt="Tests">
<!-- test-count:embed:end -->
    <a href="https://goreportcard.com/report/github.com/goforj/scheduler"><img src="https://goreportcard.com/badge/github.com/goforj/scheduler" alt="Go Report Card"></a>
</p>

## Features {#features}

- Fluent, chainable API for intervals, cron strings, and calendar helpers (daily/weekly/monthly).
- Overlap protection with optional distributed locking plus per-job tags and metadata.
- Filters (weekdays/weekends/time windows) and hooks (before/after/success/failure) keep jobs predictable.
- Command execution helper for running CLI tasks with background mode and env-aware tagging.
- Auto-generated, compile-tested examples ensure docs and behavior stay in sync.

## Why scheduler? {#why-scheduler?}

Go has excellent low-level scheduling libraries, but defining real-world schedules often turns into a maze of cron strings, conditionals, and glue code.

`scheduler` provides a Laravel-style fluent API on top of gocron that lets you describe **when**, **how**, and **under what conditions** a job should run - without hiding what’s actually happening.

Everything remains explicit, testable, and inspectable, while staying pleasant to read and maintain.

## Example {#example}

```go
scheduler.NewJobBuilder(s).
    Name("reports:generate").
    Weekdays().
    Between("09:00", "17:00").
    WithoutOverlapping().
    DailyAt("10:30").
    Do(func() {
    generateReports()
})
```

## List jobs as an ASCII table {#list-jobs-as-an-ascii-table}

```go
package main

import (
	"github.com/go-co-op/gocron/v2"
	"github.com/goforj/scheduler"
)

func main() {
	s, _ := gocron.NewScheduler()
	s.Start()
	defer s.Shutdown()

	scheduler.NewJobBuilder(s).
		EveryMinute().
		Name("cleanup").
		Do(func() {})

	scheduler.NewJobBuilder(s).PrintJobsList()
}
```

Example output:

```
+--------------------------------------------------------------------------------------+
| Scheduler Jobs › (3)
+----------------+----------+----------------+---------+--------+----------------------+
| Name           | Type     | Schedule       | Handler | Next   | Tags                 |
+----------------+----------+----------------+---------+--------+----------------------+
| hello:world    | command  | cron 0 0 * * 0 | -       | in 3d  | env=dev, args="w"    |
| hello:world    | command  | every 1h       | -       | in 1h  | env=dev, args="hour" |
| cleanup        | function | every 1m       | cleanup | in 1m  | env=dev              |
+----------------+----------+----------------+---------+--------+----------------------+
```

## Runnable examples {#runnable-examples}

Every function has a corresponding runnable example under [`./examples`](./examples).

These examples are **generated directly from the documentation blocks** of each function, ensuring the docs and code never drift. These are the same examples you see here in the README and GoDoc.

An automated test executes **every example** to verify it builds and runs successfully.

This guarantees all examples are valid, up-to-date, and remain functional as the API evolves.

<!-- api:embed:start -->

## API Index {#api-index}

| Group | Functions |
|------:|-----------|
| **Adapters** | [Lock](#lock) [Run](#run) [Unlock](#unlock) |
| **Commands** | [Command](#command) |
| **Concurrency** | [WithoutOverlapping](#withoutoverlapping) [WithoutOverlappingWithLocker](#withoutoverlappingwithlocker) |
| **Configuration** | [Timezone](#timezone) [WithCommandRunner](#withcommandrunner) [WithNowFunc](#withnowfunc) |
| **Construction** | [NewJobBuilder](#newjobbuilder) |
| **Diagnostics** | [CronExpr](#cronexpr) [Error](#error) [Job](#job) [PrintJobsList](#printjobslist) |
| **Execution** | [RunInBackground](#runinbackground) |
| **Filters** | [Between](#between) [Days](#days) [Environments](#environments) [Fridays](#fridays) [Mondays](#mondays) [Saturdays](#saturdays) [Skip](#skip) [Sundays](#sundays) [Thursdays](#thursdays) [Tuesdays](#tuesdays) [UnlessBetween](#unlessbetween) [Wednesdays](#wednesdays) [Weekdays](#weekdays) [Weekends](#weekends) [When](#when) |
| **Hooks** | [After](#after) [Before](#before) [OnFailure](#onfailure) [OnSuccess](#onsuccess) |
| **Locking** | [NewRedisLocker](#newredislocker) |
| **Metadata** | [JobMetadata](#jobmetadata) [Name](#name) |
| **Scheduling** | [Cron](#cron) [Daily](#daily) [DailyAt](#dailyat) [DaysOfMonth](#daysofmonth) [Do](#do) [Every](#every) [EveryFifteenMinutes](#everyfifteenminutes) [EveryFifteenSeconds](#everyfifteenseconds) [EveryFiveMinutes](#everyfiveminutes) [EveryFiveSeconds](#everyfiveseconds) [EveryFourHours](#everyfourhours) [EveryFourMinutes](#everyfourminutes) [EveryMinute](#everyminute) [EveryOddHour](#everyoddhour) [EverySecond](#everysecond) [EverySixHours](#everysixhours) [EveryTenMinutes](#everytenminutes) [EveryTenSeconds](#everytenseconds) [EveryThirtyMinutes](#everythirtyminutes) [EveryThirtySeconds](#everythirtyseconds) [EveryThreeHours](#everythreehours) [EveryThreeMinutes](#everythreeminutes) [EveryTwentySeconds](#everytwentyseconds) [EveryTwoHours](#everytwohours) [EveryTwoMinutes](#everytwominutes) [EveryTwoSeconds](#everytwoseconds) [Hourly](#hourly) [HourlyAt](#hourlyat) [Hours](#hours) [LastDayOfMonth](#lastdayofmonth) [Minutes](#minutes) [Monthly](#monthly) [MonthlyOn](#monthlyon) [Quarterly](#quarterly) [QuarterlyOn](#quarterlyon) [Seconds](#seconds) [TwiceDaily](#twicedaily) [TwiceDailyAt](#twicedailyat) [TwiceMonthly](#twicemonthly) [Weekly](#weekly) [WeeklyOn](#weeklyon) [Yearly](#yearly) [YearlyOn](#yearlyon) |
| **State management** | [RetainState](#retainstate) |


## Adapters {#adapters}

### Lock {#lock}

Lock invokes the underlying function.

<GoForjExample repo="scheduler" example="lock">

```go
// Example: acquire a lock
client := redis.NewClient(&redis.Options{})
locker := scheduler.NewRedisLocker(client, time.Minute)
lock, _ := locker.Lock(context.Background(), "job")
_ = lock.Unlock(context.Background())
```

</GoForjExample>

### Run {#run}

Run executes the underlying function.

<GoForjExample repo="scheduler" example="run">

```go
// Example: execute the wrapped function
runner := scheduler.CommandRunnerFunc(func(ctx context.Context, exe string, args []string) error {
	return nil
})
_ = runner.Run(context.Background(), "echo", []string{"hi"})
```

</GoForjExample>

### Unlock {#unlock}

Unlock invokes the underlying function.

## Commands {#commands}

### Command {#command}

Command executes the current binary with the given subcommand and variadic args.

<GoForjExample repo="scheduler" example="command">

```go
// Example: run a CLI subcommand on schedule
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

scheduler.NewJobBuilder(s).
	Cron("0 0 * * *").
	Command("jobs:purge", "--force")
```

</GoForjExample>

## Concurrency {#concurrency}

### WithoutOverlapping {#withoutoverlapping}

WithoutOverlapping ensures the job does not run concurrently.

<GoForjExample repo="scheduler" example="withoutoverlapping">

```go
// Example: prevent overlapping runs of a slow task
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

scheduler.NewJobBuilder(s).
	WithoutOverlapping().
	EveryFiveSeconds().
	Do(func() { time.Sleep(7 * time.Second) })
```

</GoForjExample>

### WithoutOverlappingWithLocker {#withoutoverlappingwithlocker}

WithoutOverlappingWithLocker ensures the job does not run concurrently across distributed systems using the provided locker.

<GoForjExample repo="scheduler" example="withoutoverlappingwithlocker">

```go
// Example: use a distributed locker
locker := scheduler.LockerFunc(func(ctx context.Context, key string) (gocron.Lock, error) {
	return scheduler.LockFunc(func(context.Context) error { return nil }), nil
})

s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

scheduler.NewJobBuilder(s).
	WithoutOverlappingWithLocker(locker).
	EveryMinute().
	Do(func() {})
```

</GoForjExample>

## Configuration {#configuration}

### Timezone {#timezone}

Timezone sets a timezone string for the job (not currently applied to gocron Scheduler).

<GoForjExample repo="scheduler" example="timezone">

```go
// Example: tag jobs with a timezone
scheduler.NewJobBuilder(nil).
	Timezone("America/New_York").
	Daily()
```

</GoForjExample>

### WithCommandRunner {#withcommandrunner}

WithCommandRunner overrides command execution (default: exec.CommandContext).

<GoForjExample repo="scheduler" example="withcommandrunner">

```go
// Example: swap in a custom runner
runner := scheduler.CommandRunnerFunc(func(_ context.Context, exe string, args []string) error {
	fmt.Println(exe, args)
	return nil
})

builder := scheduler.NewJobBuilder(nil).
	WithCommandRunner(runner)
fmt.Printf("%T\n", builder)
```

</GoForjExample>

### WithNowFunc {#withnowfunc}

WithNowFunc overrides current time (default: time.Now). Useful for tests.

<GoForjExample repo="scheduler" example="withnowfunc">

```go
// Example: freeze time for predicates
fixed := func() time.Time { return time.Unix(0, 0) }
scheduler.NewJobBuilder(nil).WithNowFunc(fixed)
```

</GoForjExample>

## Construction {#construction}

### NewJobBuilder {#newjobbuilder}

NewJobBuilder creates a new JobBuilder with the provided scheduler.

<GoForjExample repo="scheduler" example="newjobbuilder">

```go
// Example: create a builder and schedule a heartbeat
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()
scheduler.NewJobBuilder(s).EverySecond().Do(func() {})
```

</GoForjExample>

## Diagnostics {#diagnostics}

### CronExpr {#cronexpr}

CronExpr returns the cron expression string configured for this job.

<GoForjExample repo="scheduler" example="cronexpr">

```go
// Example: inspect the stored cron expression
builder := scheduler.NewJobBuilder(nil).Cron("0 9 * * *")
fmt.Println(builder.CronExpr())
```

</GoForjExample>

### Error {#error}

Error returns the error if any occurred during job scheduling.

<GoForjExample repo="scheduler" example="error">

```go
// Example: validate a malformed schedule
builder := scheduler.NewJobBuilder(nil).DailyAt("bad")
fmt.Println(builder.Error())
```

</GoForjExample>

### Job {#job}

Job returns the last scheduled gocron.Job instance, if available.

<GoForjExample repo="scheduler" example="job">

```go
// Example: capture the last job handle
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

b := scheduler.NewJobBuilder(s).EverySecond().Do(func() {})
fmt.Println(b.Job() != nil)
```

</GoForjExample>

### PrintJobsList {#printjobslist}

PrintJobsList renders and prints the scheduler job table to stdout.

<GoForjExample repo="scheduler" example="printjobslist">

```go
// Example: print current jobs
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

scheduler.NewJobBuilder(s).
	EverySecond().
	Name("heartbeat").
	Do(func() {})

scheduler.NewJobBuilder(s).PrintJobsList()
```

</GoForjExample>

## Execution {#execution}

### RunInBackground {#runinbackground}

RunInBackground runs command/exec tasks in a goroutine.

<GoForjExample repo="scheduler" example="runinbackground">

```go
// Example: allow command jobs to run async
scheduler.NewJobBuilder(nil).
	RunInBackground().
	Command("noop")
```

</GoForjExample>

## Filters {#filters}

### Between {#between}

Between limits the job to run between the provided HH:MM times (inclusive).

<GoForjExample repo="scheduler" example="between">

```go
// Example: allow execution during business hours
scheduler.NewJobBuilder(nil).
	Between("09:00", "17:00").
	EveryMinute()
```

</GoForjExample>

### Days {#days}

Days limits the job to a specific set of weekdays.

<GoForjExample repo="scheduler" example="days">

```go
// Example: pick custom weekdays
scheduler.NewJobBuilder(nil).
	Days(time.Monday, time.Wednesday, time.Friday).
	DailyAt("07:00")
```

</GoForjExample>

### Environments {#environments}

Environments restricts job registration to specific environment names (e.g. "production", "staging").

<GoForjExample repo="scheduler" example="environments">

```go
// Example: only register in production
scheduler.NewJobBuilder(nil).Environments("production").Daily()
```

</GoForjExample>

### Fridays {#fridays}

Fridays limits the job to Fridays.

<GoForjExample repo="scheduler" example="fridays">

```go
// Example: run only on Fridays
scheduler.NewJobBuilder(nil).Fridays().DailyAt("09:00")
```

</GoForjExample>

### Mondays {#mondays}

Mondays limits the job to Mondays.

<GoForjExample repo="scheduler" example="mondays">

```go
// Example: run only on Mondays
scheduler.NewJobBuilder(nil).Mondays().DailyAt("09:00")
```

</GoForjExample>

### Saturdays {#saturdays}

Saturdays limits the job to Saturdays.

<GoForjExample repo="scheduler" example="saturdays">

```go
// Example: run only on Saturdays
scheduler.NewJobBuilder(nil).Saturdays().DailyAt("09:00")
```

</GoForjExample>

### Skip {#skip}

Skip prevents scheduling the job if the provided condition returns true.

<GoForjExample repo="scheduler" example="skip">

```go
// Example: suppress jobs based on a switch
enabled := false
scheduler.NewJobBuilder(nil).
	Skip(func() bool { return !enabled }).
	Daily()
```

</GoForjExample>

### Sundays {#sundays}

Sundays limits the job to Sundays.

<GoForjExample repo="scheduler" example="sundays">

```go
// Example: run only on Sundays
scheduler.NewJobBuilder(nil).Sundays().DailyAt("09:00")
```

</GoForjExample>

### Thursdays {#thursdays}

Thursdays limits the job to Thursdays.

<GoForjExample repo="scheduler" example="thursdays">

```go
// Example: run only on Thursdays
scheduler.NewJobBuilder(nil).Thursdays().DailyAt("09:00")
```

</GoForjExample>

### Tuesdays {#tuesdays}

Tuesdays limits the job to Tuesdays.

<GoForjExample repo="scheduler" example="tuesdays">

```go
// Example: run only on Tuesdays
scheduler.NewJobBuilder(nil).Tuesdays().DailyAt("09:00")
```

</GoForjExample>

### UnlessBetween {#unlessbetween}

UnlessBetween prevents the job from running between the provided HH:MM times.

<GoForjExample repo="scheduler" example="unlessbetween">

```go
// Example: pause execution overnight
scheduler.NewJobBuilder(nil).
	UnlessBetween("22:00", "06:00").
	EveryMinute()
```

</GoForjExample>

### Wednesdays {#wednesdays}

Wednesdays limits the job to Wednesdays.

<GoForjExample repo="scheduler" example="wednesdays">

```go
// Example: run only on Wednesdays
scheduler.NewJobBuilder(nil).Wednesdays().DailyAt("09:00")
```

</GoForjExample>

### Weekdays {#weekdays}

Weekdays limits the job to run only on weekdays (Mon-Fri).

<GoForjExample repo="scheduler" example="weekdays">

```go
// Example: weekday-only execution
scheduler.NewJobBuilder(nil).Weekdays().DailyAt("09:00")
```

</GoForjExample>

### Weekends {#weekends}

Weekends limits the job to run only on weekends (Sat-Sun).

<GoForjExample repo="scheduler" example="weekends">

```go
// Example: weekend-only execution
scheduler.NewJobBuilder(nil).Weekends().DailyAt("10:00")
```

</GoForjExample>

### When {#when}

When only schedules the job if the provided condition returns true.

<GoForjExample repo="scheduler" example="when">

```go
// Example: guard scheduling with a flag
flag := true
scheduler.NewJobBuilder(nil).
	When(func() bool { return flag }).
	Daily()
```

</GoForjExample>

## Hooks {#hooks}

### After {#after}

After sets a hook to run after task execution.

<GoForjExample repo="scheduler" example="after">

```go
// Example: add an after hook
scheduler.NewJobBuilder(nil).
	After(func() { println("after") }).
	Daily()
```

</GoForjExample>

### Before {#before}

Before sets a hook to run before task execution.

<GoForjExample repo="scheduler" example="before">

```go
// Example: add a before hook
scheduler.NewJobBuilder(nil).
	Before(func() { println("before") }).
	Daily()
```

</GoForjExample>

### OnFailure {#onfailure}

OnFailure sets a hook to run after failed task execution.

<GoForjExample repo="scheduler" example="onfailure">

```go
// Example: record failures
scheduler.NewJobBuilder(nil).
	OnFailure(func() { println("failure") }).
	Daily()
```

</GoForjExample>

### OnSuccess {#onsuccess}

OnSuccess sets a hook to run after successful task execution.

<GoForjExample repo="scheduler" example="onsuccess">

```go
// Example: record success
scheduler.NewJobBuilder(nil).
	OnSuccess(func() { println("success") }).
	Daily()
```

</GoForjExample>

## Locking {#locking}

### NewRedisLocker {#newredislocker}

NewRedisLocker creates a RedisLocker with a client and TTL.

<GoForjExample repo="scheduler" example="newredislocker">

```go
// Example: create a redis-backed locker
client := redis.NewClient(&redis.Options{}) // replace with your client
locker := scheduler.NewRedisLocker(client, time.Minute)
_, _ = locker.Lock(context.Background(), "job")
```

</GoForjExample>

## Metadata {#metadata}

### JobMetadata {#jobmetadata}

JobMetadata returns a copy of the tracked job metadata keyed by job ID.

<GoForjExample repo="scheduler" example="jobmetadata">

```go
// Example: inspect scheduled jobs
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

b := scheduler.NewJobBuilder(s).EverySecond().Do(func() {})
for id, meta := range b.JobMetadata() {
	_ = id
	_ = meta.Name
}
```

</GoForjExample>

### Name {#name}

Name sets an explicit job name.

<GoForjExample repo="scheduler" example="name">

```go
// Example: label a job for logging
scheduler.NewJobBuilder(nil).
	Name("cache:refresh").
	HourlyAt(15)
```

</GoForjExample>

## Scheduling {#scheduling}

### Cron {#cron}

Cron sets the cron expression for the job.

<GoForjExample repo="scheduler" example="cron">

```go
// Example: configure a cron expression
builder := scheduler.NewJobBuilder(nil).Cron("15 3 * * *")
fmt.Println(builder.CronExpr())
```

</GoForjExample>

### Daily {#daily}

Daily schedules the job to run once per day at midnight.

<GoForjExample repo="scheduler" example="daily">

```go
// Example: nightly task
scheduler.NewJobBuilder(nil).Daily()
```

</GoForjExample>

### DailyAt {#dailyat}

DailyAt schedules the job to run daily at a specific time (e.g., "13:00").

<GoForjExample repo="scheduler" example="dailyat">

```go
// Example: run at lunch time daily
scheduler.NewJobBuilder(nil).DailyAt("12:30")
```

</GoForjExample>

### DaysOfMonth {#daysofmonth}

DaysOfMonth schedules the job to run on specific days of the month at a given time.

<GoForjExample repo="scheduler" example="daysofmonth">

```go
// Example: run on the 5th and 20th of each month
scheduler.NewJobBuilder(nil).DaysOfMonth([]int{5, 20}, "07:15")
```

</GoForjExample>

### Do {#do}

Do schedules the job with the provided task function.

<GoForjExample repo="scheduler" example="do">

```go
// Example: create a named cron job
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

scheduler.NewJobBuilder(s).
Name("cleanup").
Cron("0 0 * * *").
Do(func() {})
```

</GoForjExample>

### Every {#every}

Every schedules a job to run every X seconds, minutes, or hours.

<GoForjExample repo="scheduler" example="every">

```go
// Example: fluently choose an interval
scheduler.NewJobBuilder(nil).
	Every(10).
	Minutes()
```

</GoForjExample>

### EveryFifteenMinutes {#everyfifteenminutes}

EveryFifteenMinutes schedules the job to run every 15 minutes.

<GoForjExample repo="scheduler" example="everyfifteenminutes">

```go
// Example: run every fifteen minutes
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

scheduler.NewJobBuilder(s).EveryFifteenMinutes().Do(func() {})
```

</GoForjExample>

### EveryFifteenSeconds {#everyfifteenseconds}

EveryFifteenSeconds schedules the job to run every 15 seconds.

<GoForjExample repo="scheduler" example="everyfifteenseconds">

```go
// Example: run at fifteen-second cadence
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

scheduler.NewJobBuilder(s).EveryFifteenSeconds().Do(func() {})
```

</GoForjExample>

### EveryFiveMinutes {#everyfiveminutes}

EveryFiveMinutes schedules the job to run every 5 minutes.

<GoForjExample repo="scheduler" example="everyfiveminutes">

```go
// Example: run every five minutes
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

scheduler.NewJobBuilder(s).EveryFiveMinutes().Do(func() {})
```

</GoForjExample>

### EveryFiveSeconds {#everyfiveseconds}

EveryFiveSeconds schedules the job to run every 5 seconds.

<GoForjExample repo="scheduler" example="everyfiveseconds">

```go
// Example: space out work every five seconds
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

scheduler.NewJobBuilder(s).EveryFiveSeconds().Do(func() {})
```

</GoForjExample>

### EveryFourHours {#everyfourhours}

EveryFourHours schedules the job to run every four hours at the specified minute.

<GoForjExample repo="scheduler" example="everyfourhours">

```go
// Example: run every four hours
scheduler.NewJobBuilder(nil).EveryFourHours(25)
```

</GoForjExample>

### EveryFourMinutes {#everyfourminutes}

EveryFourMinutes schedules the job to run every 4 minutes.

<GoForjExample repo="scheduler" example="everyfourminutes">

```go
// Example: run every four minutes
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

scheduler.NewJobBuilder(s).EveryFourMinutes().Do(func() {})
```

</GoForjExample>

### EveryMinute {#everyminute}

EveryMinute schedules the job to run every 1 minute.

<GoForjExample repo="scheduler" example="everyminute">

```go
// Example: run a task each minute
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

scheduler.NewJobBuilder(s).EveryMinute().Do(func() {})
```

</GoForjExample>

### EveryOddHour {#everyoddhour}

EveryOddHour schedules the job to run every odd-numbered hour at the specified minute.

<GoForjExample repo="scheduler" example="everyoddhour">

```go
// Example: run every odd hour
scheduler.NewJobBuilder(nil).EveryOddHour(10)
```

</GoForjExample>

### EverySecond {#everysecond}

EverySecond schedules the job to run every 1 second.

<GoForjExample repo="scheduler" example="everysecond">

```go
// Example: heartbeat job each second
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

scheduler.NewJobBuilder(s).EverySecond().Do(func() {})
```

</GoForjExample>

### EverySixHours {#everysixhours}

EverySixHours schedules the job to run every six hours at the specified minute.

<GoForjExample repo="scheduler" example="everysixhours">

```go
// Example: run every six hours
scheduler.NewJobBuilder(nil).EverySixHours(30)
```

</GoForjExample>

### EveryTenMinutes {#everytenminutes}

EveryTenMinutes schedules the job to run every 10 minutes.

<GoForjExample repo="scheduler" example="everytenminutes">

```go
// Example: run every ten minutes
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

scheduler.NewJobBuilder(s).EveryTenMinutes().Do(func() {})
```

</GoForjExample>

### EveryTenSeconds {#everytenseconds}

EveryTenSeconds schedules the job to run every 10 seconds.

<GoForjExample repo="scheduler" example="everytenseconds">

```go
// Example: poll every ten seconds
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

scheduler.NewJobBuilder(s).EveryTenSeconds().Do(func() {})
```

</GoForjExample>

### EveryThirtyMinutes {#everythirtyminutes}

EveryThirtyMinutes schedules the job to run every 30 minutes.

<GoForjExample repo="scheduler" example="everythirtyminutes">

```go
// Example: run every thirty minutes
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

scheduler.NewJobBuilder(s).EveryThirtyMinutes().Do(func() {})
```

</GoForjExample>

### EveryThirtySeconds {#everythirtyseconds}

EveryThirtySeconds schedules the job to run every 30 seconds.

<GoForjExample repo="scheduler" example="everythirtyseconds">

```go
// Example: execute every thirty seconds
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

scheduler.NewJobBuilder(s).EveryThirtySeconds().Do(func() {})
```

</GoForjExample>

### EveryThreeHours {#everythreehours}

EveryThreeHours schedules the job to run every three hours at the specified minute.

<GoForjExample repo="scheduler" example="everythreehours">

```go
// Example: run every three hours
scheduler.NewJobBuilder(nil).EveryThreeHours(20)
```

</GoForjExample>

### EveryThreeMinutes {#everythreeminutes}

EveryThreeMinutes schedules the job to run every 3 minutes.

<GoForjExample repo="scheduler" example="everythreeminutes">

```go
// Example: run every three minutes
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

scheduler.NewJobBuilder(s).EveryThreeMinutes().Do(func() {})
```

</GoForjExample>

### EveryTwentySeconds {#everytwentyseconds}

EveryTwentySeconds schedules the job to run every 20 seconds.

<GoForjExample repo="scheduler" example="everytwentyseconds">

```go
// Example: run once every twenty seconds
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

scheduler.NewJobBuilder(s).EveryTwentySeconds().Do(func() {})
```

</GoForjExample>

### EveryTwoHours {#everytwohours}

EveryTwoHours schedules the job to run every two hours at the specified minute.

<GoForjExample repo="scheduler" example="everytwohours">

```go
// Example: run every two hours
scheduler.NewJobBuilder(nil).EveryTwoHours(15)
```

</GoForjExample>

### EveryTwoMinutes {#everytwominutes}

EveryTwoMinutes schedules the job to run every 2 minutes.

<GoForjExample repo="scheduler" example="everytwominutes">

```go
// Example: job that runs every two minutes
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

scheduler.NewJobBuilder(s).EveryTwoMinutes().Do(func() {})
```

</GoForjExample>

### EveryTwoSeconds {#everytwoseconds}

EveryTwoSeconds schedules the job to run every 2 seconds.

<GoForjExample repo="scheduler" example="everytwoseconds">

```go
// Example: throttle a task to two seconds
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

scheduler.NewJobBuilder(s).EveryTwoSeconds().Do(func() {})
```

</GoForjExample>

### Hourly {#hourly}

Hourly schedules the job to run every hour.

<GoForjExample repo="scheduler" example="hourly">

```go
// Example: run something hourly
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

scheduler.NewJobBuilder(s).Hourly().Do(func() {})
```

</GoForjExample>

### HourlyAt {#hourlyat}

HourlyAt schedules the job to run every hour at the specified minute.

<GoForjExample repo="scheduler" example="hourlyat">

```go
// Example: run at the 5th minute of each hour
scheduler.NewJobBuilder(nil).HourlyAt(5)
```

</GoForjExample>

### Hours {#hours}

Hours schedules the job to run every X hours.

<GoForjExample repo="scheduler" example="hours">

```go
// Example: build an hourly cadence
scheduler.NewJobBuilder(nil).Every(6).Hours()
```

</GoForjExample>

### LastDayOfMonth {#lastdayofmonth}

LastDayOfMonth schedules the job to run on the last day of each month at a specific time.

<GoForjExample repo="scheduler" example="lastdayofmonth">

```go
// Example: run on the last day of the month
scheduler.NewJobBuilder(nil).LastDayOfMonth("23:30")
```

</GoForjExample>

### Minutes {#minutes}

Minutes schedules the job to run every X minutes.

<GoForjExample repo="scheduler" example="minutes">

```go
// Example: chain a minute-based interval
scheduler.NewJobBuilder(nil).Every(15).Minutes()
```

</GoForjExample>

### Monthly {#monthly}

Monthly schedules the job to run on the first day of each month at midnight.

<GoForjExample repo="scheduler" example="monthly">

```go
// Example: first-of-month billing
scheduler.NewJobBuilder(nil).Monthly()
```

</GoForjExample>

### MonthlyOn {#monthlyon}

MonthlyOn schedules the job to run on a specific day of the month at a given time.

<GoForjExample repo="scheduler" example="monthlyon">

```go
// Example: run on the 15th of each month
scheduler.NewJobBuilder(nil).MonthlyOn(15, "09:30")
```

</GoForjExample>

### Quarterly {#quarterly}

Quarterly schedules the job to run on the first day of each quarter at midnight.

<GoForjExample repo="scheduler" example="quarterly">

```go
// Example: quarterly trigger
scheduler.NewJobBuilder(nil).Quarterly()
```

</GoForjExample>

### QuarterlyOn {#quarterlyon}

QuarterlyOn schedules the job to run on a specific day of each quarter at a given time.

<GoForjExample repo="scheduler" example="quarterlyon">

```go
// Example: quarterly on a specific day
scheduler.NewJobBuilder(nil).QuarterlyOn(3, "12:00")
```

</GoForjExample>

### Seconds {#seconds}

Seconds schedules the job to run every X seconds.

<GoForjExample repo="scheduler" example="seconds">

```go
// Example: run a task every few seconds
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

scheduler.NewJobBuilder(s).
	Every(3).
	Seconds().
	Do(func() {})
```

</GoForjExample>

### TwiceDaily {#twicedaily}

TwiceDaily schedules the job to run daily at two specified hours (e.g., 1 and 13).

<GoForjExample repo="scheduler" example="twicedaily">

```go
// Example: run two times per day
scheduler.NewJobBuilder(nil).TwiceDaily(1, 13)
```

</GoForjExample>

### TwiceDailyAt {#twicedailyat}

TwiceDailyAt schedules the job to run daily at two specified times (e.g., 1:15 and 13:15).

<GoForjExample repo="scheduler" example="twicedailyat">

```go
// Example: run twice daily at explicit minutes
scheduler.NewJobBuilder(nil).TwiceDailyAt(1, 13, 15)
```

</GoForjExample>

### TwiceMonthly {#twicemonthly}

TwiceMonthly schedules the job to run on two specific days of the month at the given time.

<GoForjExample repo="scheduler" example="twicemonthly">

```go
// Example: run on two days each month
scheduler.NewJobBuilder(nil).TwiceMonthly(1, 15, "10:00")
```

</GoForjExample>

### Weekly {#weekly}

Weekly schedules the job to run once per week on Sunday at midnight.

<GoForjExample repo="scheduler" example="weekly">

```go
// Example: weekly maintenance
scheduler.NewJobBuilder(nil).Weekly()
```

</GoForjExample>

### WeeklyOn {#weeklyon}

WeeklyOn schedules the job to run weekly on a specific day of the week and time.
Day uses 0 = Sunday through 6 = Saturday.

<GoForjExample repo="scheduler" example="weeklyon">

```go
// Example: run each Monday at 08:00
scheduler.NewJobBuilder(nil).WeeklyOn(1, "8:00")
```

</GoForjExample>

### Yearly {#yearly}

Yearly schedules the job to run on January 1st every year at midnight.

<GoForjExample repo="scheduler" example="yearly">

```go
// Example: yearly trigger
scheduler.NewJobBuilder(nil).Yearly()
```

</GoForjExample>

### YearlyOn {#yearlyon}

YearlyOn schedules the job to run every year on a specific month, day, and time.

<GoForjExample repo="scheduler" example="yearlyon">

```go
// Example: yearly on a specific date
scheduler.NewJobBuilder(nil).YearlyOn(12, 25, "06:45")
```

</GoForjExample>

## State management {#state-management}

### RetainState {#retainstate}

RetainState allows the job to retain its state after execution.

<GoForjExample repo="scheduler" example="retainstate">

```go
// Example: reuse interval configuration for multiple jobs
s, _ := gocron.NewScheduler()
s.Start()
defer s.Shutdown()

builder := scheduler.NewJobBuilder(s).EverySecond().RetainState()
builder.Do(func() {})
builder.Do(func() {})
```

</GoForjExample>
<!-- api:embed:end -->
