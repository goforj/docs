# Database benchmark fixtures

These workloads supply the Database card on the Performance page. They measure warmed GORM reads against local database fixtures.

Run the suite with Go 1.26 or later, Node.js, and Docker:

```sh
node benchmarks/run.mjs
node benchmarks/check.mjs
node bin/collect-performance-stats.mjs /path/to/sibling/repos
```

The runner creates disposable MySQL 8.4 and PostgreSQL 16 containers on random loopback ports. It removes only those containers when the run finishes. Each driver gets seven one-second samples with `GOMAXPROCS=1`. Container startup, migrations, seed data, and connection warmup happen outside the timer.

`results.txt` retains Go's original benchmark output. `results.json` retains every sample, the Go and host versions, image IDs, package versions, and source fingerprints. Mail benchmarks are maintained in the [Mail repository](https://github.com/goforj/mail/tree/main/docs/bench) and imported from its committed artifact.

The artifact check fails when the measured harness changes without a fresh run. CI tests and vets the fixtures; documentation builds check the recorded artifacts without rerunning performance measurements on shared runners.

Each backend executes a warmed GORM primary-key lookup, cycling through 1,000 seeded rows with the same fields. MySQL and PostgreSQL run in local containers. SQLite uses a temporary file and the same pure-Go driver family used by GoForj. One pooled connection is available per backend. The page shows medians and observed ranges across the seven samples.

The fixture pins patched pgx v5.9.2. The GORM version, dialector versions, and configuration match GoForj's database defaults: no default write transaction, no foreign-key creation during migration, silent query logging, and UTC timestamps. This fixture does not include the generated application's connection registry, Inspects, metrics, controllers, authentication, or business logic. It is a GORM operation comparison, not a full GoForj request benchmark or a general database-engine ranking.

The benchmark table lives only in the disposable databases created by the runner. Do not point the benchmark environment variables at an application database.
