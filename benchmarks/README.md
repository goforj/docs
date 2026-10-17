# Mail and database benchmark fixtures

These workloads supply the Mail and Database cards on the Performance page. They measure local client operations, not production capacity or cloud-provider delivery speed.

Run the suite with Go 1.26 or later, Node.js, and Docker:

```sh
node benchmarks/run.mjs
node benchmarks/check.mjs
node bin/collect-performance-stats.mjs /path/to/sibling/repos
```

The runner creates disposable MySQL 8.4, PostgreSQL 16, and Mailpit containers on random loopback ports. It removes only those containers when the run finishes. It never uses real provider credentials or sends mail outside the local fixtures. Each driver gets seven one-second samples with `GOMAXPROCS=1`. Container startup, message construction, migrations, seed data, and connection warmup happen outside the timer.

`results.txt` retains Go's original benchmark output. `results.json` retains every sample, the Go and host versions, image IDs, package versions, and source fingerprints. The artifact check fails when the measured harness changes without a fresh run. CI tests and vets the fixtures; documentation builds check the recorded artifacts without rerunning performance measurements on shared runners.

## Mail

All eight drivers send through `mail.New(driver).Send`, using one recipient, text and HTML bodies, and a 4 KiB attachment. The five provider API drivers use local HTTP acceptance fixtures in separate processes. This keeps fixture-server allocations out of client memory measurements. HTTP connections are reused, TLS is absent, and SES includes SDK signing. SMTP sends over plaintext loopback to Mailpit.

The Log driver serializes a JSON record with bodies to `io.Discard`. Fake records messages in memory and resets every 128 sends; that amortized reset cost is included. These local drivers do different work from SMTP and HTTP drivers. The charts describe encoding, transport, acknowledgement, and local recording costs. They do not rank real providers, delivery reliability, or inbox arrival time.

The provider fixtures consume request bodies and acknowledge success in each API's response shape. They do not emulate a provider's full validation, throttling, network, queue, or delivery behavior.

## Database

Each backend executes a warmed GORM primary-key lookup, cycling through 1,000 seeded rows with the same fields. MySQL and PostgreSQL run in local containers. SQLite uses a temporary file and the same pure-Go driver family used by GoForj. One pooled connection is available per backend. The page shows medians and observed ranges across the seven samples.

The GORM version, dialector versions, and configuration match GoForj's database defaults: no default write transaction, no foreign-key creation during migration, silent query logging, and UTC timestamps. This fixture does not include the generated application's connection registry, Inspects, metrics, controllers, authentication, or business logic. It is a GORM operation comparison, not a full GoForj request benchmark or a general database-engine ranking.

The benchmark table lives only in the disposable databases created by the runner. Do not point the benchmark environment variables at an application database.
