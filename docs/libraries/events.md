---
title: Events
repoSlug: events
repoUrl: https://github.com/goforj/events
---

<p align="center">
  <img src="https://raw.githubusercontent.com/goforj/events/main/docs/images/logo.png?v=1" width="300" alt="events logo">
</p>

<p align="center">
    events is a typed event bus library for local dispatch and distributed pub/sub.
</p>

<p align="center">
    <a href="https://pkg.go.dev/github.com/goforj/events"><img src="https://pkg.go.dev/badge/github.com/goforj/events.svg" alt="Go Reference"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
    <a href="https://github.com/goforj/events/actions"><img src="https://github.com/goforj/events/actions/workflows/test.yml/badge.svg" alt="Go Test"></a>
    <a href="https://golang.org"><img src="https://img.shields.io/badge/go-1.25+-blue?logo=go" alt="Go version"></a>
    <img src="https://img.shields.io/github/v/tag/goforj/events?label=version&sort=semver" alt="Latest tag">
    <a href="https://goreportcard.com/report/github.com/goforj/events"><img src="https://goreportcard.com/badge/github.com/goforj/events" alt="Go Report Card"></a>
    <a href="https://codecov.io/gh/goforj/events"><img src="https://codecov.io/gh/goforj/events/graph/badge.svg?token=07N6F71OXM" alt="Codecov"></a>
<!-- test-count:embed:start -->
  <img src="https://img.shields.io/badge/unit_tests-25-brightgreen" alt="Unit tests (executed count)">
  <img src="https://img.shields.io/badge/integration_tests-62-blue" alt="Integration tests (executed count)">
<!-- test-count:embed:end -->
</p>

## What events is {#what-events-is}

**events** is a typed event bus for Go and handles **event publication and fan-out**. Durable background work such as retries and worker queues belongs in [`queue`](https://github.com/goforj/queue).

It lets applications publish and subscribe to events using normal Go types, with delivery handled either in-process or through distributed backends like NATS, Redis, Kafka, or Google Pub/Sub.

## Installation {#installation}

```bash
go get github.com/goforj/events
```

## Quick Start {#quick-start}

```go
package main

import (
	"context"
	"fmt"

	"github.com/goforj/events"
)

type UserCreated struct {
	ID string `json:"id"`
}

func main() {
	bus, _ := events.NewSync()
	_, _ = bus.Subscribe(func(ctx context.Context, event UserCreated) error {
		fmt.Println("received", event.ID, ctx != nil)
		return nil
	})
	_ = bus.Publish(UserCreated{ID: "123"})
}
```

## Topic Override {#topic-override}

```go
type UserCreated struct {
	ID string `json:"id"`
}

func (UserCreated) Topic() string { return "users.created" }
```

## Drivers {#drivers}

Optional distributed backends are separate modules. Keep dependencies lean and install only what you use:

```bash
go get github.com/goforj/events/driver/natsevents
go get github.com/goforj/events/driver/redisevents
go get github.com/goforj/events/driver/kafkaevents
go get github.com/goforj/events/driver/natsjetstreamevents
go get github.com/goforj/events/driver/gcppubsubevents
go get github.com/goforj/events/driver/snsevents
```

## Drivers {#drivers-2}

|                                                                                                Driver / Backend | Mode | Fan-out | Durable | Queue Semantics | Notes |
|----------------------------------------------------------------------------------------------------------------:| :--- | :---: | :---: | :---: | :--- |
|      <img src="https://img.shields.io/badge/sync-546E7A?logo=go&logoColor=white" alt="Sync"> | In-process | ✓ | x | x | Root-backed synchronous dispatch in the caller path. |
|     <img src="https://img.shields.io/badge/null-9e9e9e?logo=probot&logoColor=white" alt="Null"> | Drop-only | x | x | x | Root-backed no-op transport for disabled eventing and tests. |
|        <img src="https://img.shields.io/badge/nats-27AAE1?logo=natsdotio&logoColor=white" alt="NATS"> | Distributed pub/sub | ✓ | x | x | Subject-based transport with live integration coverage. |
| <img src="https://img.shields.io/badge/nats%20jetstream-1E88E5?logo=natsdotio&logoColor=white" alt="NATS JetStream"> | Distributed stream | ✓ | Partial | x | Ephemeral JetStream consumers preserve subscribe/close semantics while adding durable stream storage. |
|      <img src="https://img.shields.io/badge/redis-%23DC382D?logo=redis&logoColor=white" alt="Redis"> | Distributed pub/sub | ✓ | x | x | Redis pub/sub transport; Streams are intentionally deferred. |
|      <img src="https://img.shields.io/badge/kafka-231F20?logo=apachekafka&logoColor=white" alt="Kafka"> | Distributed topic/log | ✓ | Partial | x | Current driver validates topic-based fan-out compatibility, not full consumer-group semantics. |
|      <img src="https://img.shields.io/badge/sns-FF9900?logo=buffer&logoColor=white" alt="SNS"> | Distributed topic plus queue | ✓ | Partial | x | SNS fan-out with per-subscription SQS queues to preserve bus-style delivery semantics. |
| <img src="https://img.shields.io/badge/gcp%20pub%2Fsub-4285F4?logo=googlecloud&logoColor=white" alt="Google Pub/Sub"> | Distributed topic/subscription | ✓ | Partial | x | Emulator-backed Google Pub/Sub integration with per-subscription fan-out mapping. |
|          <img src="https://img.shields.io/badge/sqs-232F3E?logo=buffer&logoColor=white" alt="SQS"> | Queue target | Planned | ✓ | ✓ | Deferred until a separate async capability surface is intentionally introduced. |

## Driver Constructor Quick Examples {#driver-constructor-quick-examples}

Use root constructors for local backends, and driver-module constructors for
distributed backends. Driver backends live in separate modules so applications
only import/link the optional dependencies they actually use.

```go
package main

import (
	"context"

	"github.com/goforj/events"
	"github.com/goforj/events/driver/gcppubsubevents"
	"github.com/goforj/events/driver/kafkaevents"
	"github.com/goforj/events/driver/natsjetstreamevents"
	"github.com/goforj/events/driver/natsevents"
	"github.com/goforj/events/driver/redisevents"
	"github.com/goforj/events/driver/snsevents"
)

func main() {
	ctx := context.Background()

	events.NewSync()
	events.NewNull()

	natsevents.New(natsevents.Config{URL: "nats://127.0.0.1:4222"})
	natsjetstreamevents.New(natsjetstreamevents.Config{URL: "nats://127.0.0.1:4222"})
	redisevents.New(redisevents.Config{Addr: "127.0.0.1:6379"})
	kafkaevents.New(kafkaevents.Config{Brokers: []string{"127.0.0.1:9092"}})
	gcppubsubevents.New(ctx, gcppubsubevents.Config{
		ProjectID: "events-project",
		URI:       "127.0.0.1:8085",
	})
	snsevents.New(snsevents.Config{
		Region:   "us-east-1",
		Endpoint: "http://127.0.0.1:4566",
	})
}
```

## Benchmarks {#benchmarks}

To refresh the live benchmark snapshot and regenerate the charts:

```bash
sh scripts/refresh-bench-snapshot.sh
```

<!-- bench:embed:start -->
These charts compare one publish-plus-delivery round trip for `sync` and each enabled distributed driver fixture.

Note: `gcppubsub` is excluded from the default charts because the Pub/Sub emulator is not representative enough for backend latency comparison. Benchmark it explicitly with `INTEGRATION_DRIVER=gcppubsub` when needed.

![Events backend latency chart](https://raw.githubusercontent.com/goforj/events/main/docs/bench/benchmarks_ns.svg)

![Events backend throughput chart](https://raw.githubusercontent.com/goforj/events/main/docs/bench/benchmarks_ops.svg)

![Events backend bytes chart](https://raw.githubusercontent.com/goforj/events/main/docs/bench/benchmarks_bytes.svg)

![Events backend allocations chart](https://raw.githubusercontent.com/goforj/events/main/docs/bench/benchmarks_allocs.svg)
<!-- bench:embed:end -->

These checks are for obvious regression detection, not for noisy micro-optimism
or hard CI performance gates.

<!-- api:embed:start -->

## API Index {#api-index}

| Group | Functions |
|------:|-----------|
| **Bus** | [Driver](#bus-driver) [Ready](#bus-ready) [ReadyContext](#bus-readycontext) |
| **Config** | [Config](#events-config) [gcppubsubevents.Config](#gcppubsubevents-config) [kafkaevents.Config](#kafkaevents-config) [natsevents.Config](#natsevents-config) [natsjetstreamevents.Config](#natsjetstreamevents-config) [redisevents.Config](#redisevents-config) [snsevents.Config](#snsevents-config) |
| **Construction** | [New](#events-new) [NewNull](#events-newnull) [NewSync](#events-newsync) |
| **Driver Constructors** | [gcppubsubevents.New](#gcppubsubevents-new) [kafkaevents.New](#kafkaevents-new) [natsevents.New](#natsevents-new) [natsjetstreamevents.New](#natsjetstreamevents-new) [redisevents.New](#redisevents-new) [snsevents.New](#snsevents-new) |
| **Lifecycle** | [Close](#driver-close) |
| **Options** | [Option](#events-option) [WithCodec](#events-withcodec) |
| **Publish** | [Publish](#bus-publish) [PublishContext](#bus-publishcontext) [TopicEvent](#events-topicevent) |
| **Subscribe** | [Subscribe](#bus-subscribe) [SubscribeContext](#bus-subscribecontext) [Subscription](#events-subscription) |
| **Testing** | [Fake](#events-fake) [Fake.Bus](#fake-bus) [Fake.Count](#fake-count) [Fake.Records](#fake-records) [Fake.Reset](#fake-reset) [NewFake](#events-newfake) [Record](#events-record) |


## Bus {#bus}

### Driver {#bus-driver}

Driver reports the active backend.

```go
bus, _ := events.NewSync()
fmt.Println(bus.Driver())
// Output: sync
```

### Ready {#bus-ready}

Ready reports whether the bus is ready.

```go
bus, _ := events.NewSync()
fmt.Println(bus.Ready() == nil)
// Output: true
```

### ReadyContext {#bus-readycontext}

ReadyContext reports whether the bus is ready.

```go
bus, _ := events.NewSync()
fmt.Println(bus.ReadyContext(context.Background()) == nil)
// Output: true
```

## Config {#config}

### Config {#events-config}

Config configures root bus construction.

_Example: define bus construction config_

```go
cfg := events.Config{Driver: eventscore.DriverSync}
```

_Example: define bus construction config with all fields_

```go
cfg := events.Config{
	Driver:    eventscore.DriverSync, // default: "sync" when empty and no Transport is provided
	Codec:     nil,                   // default: nil uses the built-in JSON codec
	Transport: nil,                   // default: nil keeps dispatch in-process
}
```

### gcppubsubevents.Config {#gcppubsubevents-config}

Config configures Google Pub/Sub transport construction.

_Example: define Google Pub/Sub driver config_

```go
cfg := gcppubsubevents.Config{
	ProjectID: "events-project",
	URI:       "127.0.0.1:8085",
}
```

_Example: define Google Pub/Sub driver config with all fields_

```go
cfg := gcppubsubevents.Config{
	ProjectID: "events-project",
	URI:       "127.0.0.1:8085", // default: "" is invalid unless Client is provided
	Client:    nil,              // default: nil creates a client from ProjectID and URI
}
```

### kafkaevents.Config {#kafkaevents-config}

Config configures Kafka transport construction.

_Example: define Kafka driver config_

```go
cfg := kafkaevents.Config{Brokers: []string{"127.0.0.1:9092"}}
```

_Example: define Kafka driver config with all fields_

```go
cfg := kafkaevents.Config{
	Brokers: []string{"127.0.0.1:9092"},
	Dialer:  nil, // default: nil uses a zero-value kafka.Dialer
	Writer:  nil, // default: nil builds a writer with single-message, auto-topic defaults
}
```

### natsevents.Config {#natsevents-config}

Config configures NATS transport construction.

_Example: define NATS driver config_

```go
cfg := natsevents.Config{URL: "nats://127.0.0.1:4222"}
```

_Example: define NATS driver config with all fields_

```go
cfg := natsevents.Config{
	URL:  "nats://127.0.0.1:4222",
	Conn: nil, // default: nil dials URL instead of reusing an existing connection
}
```

### natsjetstreamevents.Config {#natsjetstreamevents-config}

Config configures NATS JetStream transport construction.

_Example: define NATS JetStream driver config_

```go
cfg := natsjetstreamevents.Config{URL: "nats://127.0.0.1:4222"}
```

_Example: define NATS JetStream driver config with all fields_

```go
cfg := natsjetstreamevents.Config{
	URL:               "nats://127.0.0.1:4222",
	Conn:              nil,                    // default: nil dials URL instead of reusing an existing connection
	SubjectPrefix:     "events.",              // default: "events."
	StreamNamePrefix:  "EVENTS_",              // default: "EVENTS_"
	InactiveThreshold: 30 * time.Second,       // default: 30s
	AckWait:           30 * time.Second,       // default: 30s
	FetchMaxWait:      250 * time.Millisecond, // default: 250ms
	Storage:           jetstream.MemoryStorage,// default: MemoryStorage
}
```

### redisevents.Config {#redisevents-config}

Config configures Redis transport construction.

_Example: define Redis driver config_

```go
cfg := redisevents.Config{Addr: "127.0.0.1:6379"}
```

_Example: define Redis driver config with all fields_

```go
cfg := redisevents.Config{
	Addr:   "127.0.0.1:6379",
	Client: nil, // default: nil constructs a client from Addr
}
```

### snsevents.Config {#snsevents-config}

Config configures SNS transport construction.

_Example: define SNS driver config_

```go
cfg := snsevents.Config{
	Region:   "us-east-1",
	Endpoint: "http://127.0.0.1:4566",
}
```

_Example: define SNS driver config with all fields_

```go
cfg := snsevents.Config{
	Region:            "us-east-1",
	Endpoint:          "http://127.0.0.1:4566", // default: "" uses normal AWS resolution
	SNSClient:         nil,                      // default: nil creates a client from Region and Endpoint
	SQSClient:         nil,                      // default: nil creates a client from Region and Endpoint
	TopicNamePrefix:   "events-",                // default: ""
	QueueNamePrefix:   "events-",                // default: ""
	WaitTimeSeconds:   1,                        // default: 1
	VisibilityTimeout: 30,                       // default: 30
}
```

## Construction {#construction}

### New {#events-new}

New constructs a root bus for the requested driver.

```go
bus, _ := events.New(events.Config{Driver: "sync"})
fmt.Println(bus.Driver())
// Output: sync
```

### NewNull {#events-newnull}

NewNull constructs the root null bus.

```go
bus, _ := events.NewNull()
fmt.Println(bus.Driver())
// Output: null
```

### NewSync {#events-newsync}

NewSync constructs the root sync bus.

```go
bus, _ := events.NewSync()
fmt.Println(bus.Driver())
// Output: sync
```

## Driver Constructors {#driver-constructors}

### gcppubsubevents.New {#gcppubsubevents-new}

New constructs a Google Pub/Sub-backed driver.

```go
driver, _ := gcppubsubevents.New(context.Background(), gcppubsubevents.Config{
	ProjectID: "events-project",
	URI:       "127.0.0.1:8085",
})
```

### kafkaevents.New {#kafkaevents-new}

New constructs a Kafka-backed driver.

```go
driver, _ := kafkaevents.New(kafkaevents.Config{Brokers: []string{"127.0.0.1:9092"}})
```

### natsevents.New {#natsevents-new}

New connects a NATS-backed driver from config.

```go
driver, _ := natsevents.New(natsevents.Config{URL: "nats://127.0.0.1:4222"})
```

### natsjetstreamevents.New {#natsjetstreamevents-new}

New connects a NATS JetStream-backed driver from config.

```go
driver, _ := natsjetstreamevents.New(natsjetstreamevents.Config{URL: "nats://127.0.0.1:4222"})
```

### redisevents.New {#redisevents-new}

New constructs a Redis pub/sub-backed driver.

```go
driver, _ := redisevents.New(redisevents.Config{Addr: "127.0.0.1:6379"})
```

### snsevents.New {#snsevents-new}

New constructs an SNS-backed driver.

```go
driver, _ := snsevents.New(snsevents.Config{
	Region:   "us-east-1",
	Endpoint: "http://127.0.0.1:4566",
})
```

## Lifecycle {#lifecycle}

### Close {#driver-close}

Close closes the underlying Pub/Sub client.

```go
driver, _ := redisevents.New(redisevents.Config{Addr: "127.0.0.1:6379"})
```

## Options {#options}

### Option {#events-option}

Option configures root bus behavior.

### WithCodec {#events-withcodec}

WithCodec overrides the default event codec.

```go
bus, _ := events.NewSync(events.WithCodec(nil))
fmt.Println(bus.Driver())
// Output: sync
```

## Publish {#publish}

### Publish {#bus-publish}

Publish publishes an event using the background context.

```go
type UserCreated struct {
	ID string `json:"id"`
}

bus, _ := events.NewSync()
_, _ = bus.Subscribe(func(event UserCreated) {
	fmt.Println(event.ID)
})
_ = bus.Publish(UserCreated{ID: "123"})
// Output: 123
```

### PublishContext {#bus-publishcontext}

PublishContext publishes an event using the configured codec and dispatch flow.

```go
type UserCreated struct {
	ID string `json:"id"`
}

bus, _ := events.NewSync()
_, _ = bus.Subscribe(func(ctx context.Context, event UserCreated) error {
	fmt.Println(event.ID, ctx != nil)
	return nil
})
_ = bus.PublishContext(context.Background(), UserCreated{ID: "123"})
// Output: 123 true
```

### TopicEvent {#events-topicevent}

TopicEvent overrides the derived topic for an event.

## Subscribe {#subscribe}

### Subscribe {#bus-subscribe}

Subscribe registers a handler using the background context.

```go
type UserCreated struct {
	ID string `json:"id"`
}

bus, _ := events.NewSync()
sub, _ := bus.Subscribe(func(ctx context.Context, event UserCreated) error {
	fmt.Println(event.ID)
	return nil
})
defer sub.Close()
_ = bus.Publish(UserCreated{ID: "123"})
// Output: 123
```

### SubscribeContext {#bus-subscribecontext}

SubscribeContext registers a typed handler.

```go
type UserCreated struct {
	ID string `json:"id"`
}

bus, _ := events.NewSync()
sub, _ := bus.SubscribeContext(context.Background(), func(ctx context.Context, event UserCreated) error {
	fmt.Println(event.ID, ctx != nil)
	return nil
})
defer sub.Close()
_ = bus.PublishContext(context.Background(), UserCreated{ID: "123"})
// Output: 123 true
```

### Subscription {#events-subscription}

Subscription releases a subscription when closed.

```go
type UserCreated struct {
	ID string `json:"id"`
}

bus, _ := events.NewSync()
sub, _ := bus.Subscribe(func(event UserCreated) {
	fmt.Println("received", event.ID)
})
_ = bus.Publish(UserCreated{ID: "123"})
_ = sub.Close()
_ = bus.Publish(UserCreated{ID: "456"})
// Output: received 123
```

## Testing {#testing}

### Fake {#events-fake}

Fake provides a root-package testing helper that records published events.

```go
fake := events.NewFake()
fmt.Println(fake.Count())
// Output: 0
```

### Fake.Bus {#fake-bus}

Bus returns the wrapped API to inject into code under test.

```go
fake := events.NewFake()
bus := fake.Bus()
fmt.Println(bus.Ready() == nil)
// Output: true
```

### Fake.Count {#fake-count}

Count returns the total number of recorded publishes.

```go
type UserCreated struct {
	ID string `json:"id"`
}

fake := events.NewFake()
_ = fake.Bus().Publish(UserCreated{ID: "123"})
fmt.Println(fake.Count())
// Output: 1
```

### Fake.Records {#fake-records}

Records returns a copy of recorded publishes.

```go
type UserCreated struct {
	ID string `json:"id"`
}

fake := events.NewFake()
_ = fake.Bus().Publish(UserCreated{ID: "123"})
fmt.Println(len(fake.Records()))
// Output: 1
```

### Fake.Reset {#fake-reset}

Reset clears recorded publishes.

```go
type UserCreated struct {
	ID string `json:"id"`
}

fake := events.NewFake()
_ = fake.Bus().Publish(UserCreated{ID: "123"})
fake.Reset()
fmt.Println(fake.Count())
// Output: 0
```

### NewFake {#events-newfake}

NewFake creates a new fake event harness backed by the root sync bus.

```go
fake := events.NewFake()
fmt.Println(fake.Count())
// Output: 0
```

### Record {#events-record}

Record captures one published event observed by a Fake bus.

```go
type UserCreated struct {
	ID string `json:"id"`
}

record := events.Record{Event: UserCreated{ID: "123"}}
fmt.Printf("%T\n", record.Event)
// Output: main.UserCreated
```
<!-- api:embed:end -->

## Docs Tooling {#docs-tooling}

The repository includes lightweight docs tooling under `docs/`.

Run the watcher to auto-regenerate docs on file changes:

```bash
sh docs/watcher.sh
```
