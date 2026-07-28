#!/usr/bin/env node
// Counts real test functions across the GoForj first-party libraries and
// writes docs/.vitepress/data/proof-stats.json, which the landing page
// proof band and /numbers page read at build time.
//
// Run from the docs repo root, with sibling library repos checked out
// next to it (the standard layout):
//   node bin/collect-proof-stats.mjs [path-to-repos-root]
//
// Methodology (documented publicly on /numbers):
// - "unit tests" / "integration tests" = the executed-count badges each
//   library publishes in its README (img.shields.io/badge/unit_tests-N,
//   integration_tests-N). These are executed test cases, including
//   driver-matrix subtests, and are what each repo publicly claims.
// - "test functions" / "benchmarks" = mechanical counts of
//   `func Test...` / `func Benchmark...` declarations in *_test.go files,
//   reported per repo as a secondary, independently checkable number.
// - Driver counts are the published driver matrices of each primitive
//   (see /drivers), kept in this file so the landing page and the matrix
//   cannot drift apart.

import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(process.argv[2] || path.join(process.cwd(), '..'))
const outFile = path.join(process.cwd(), 'docs', '.vitepress', 'data', 'proof-stats.json')

const LIBS = [
  'atlas', 'cache', 'collection', 'console', 'crypt', 'env', 'events', 'execx', 'godump',
  'httpx', 'mail', 'metrics', 'queue', 'scheduler', 'storage', 'str',
  'web', 'wire'
]

// discoverEventDrivers derives available event backends from the root
// constructors and independently published driver modules. Planned backends
// have no module and therefore cannot inflate the public availability count.
const discoverEventDrivers = (reposRoot) => {
  const eventsRoot = path.join(reposRoot, 'events')
  const rootDriverSource = fs.readFileSync(path.join(eventsRoot, 'eventscore', 'driver.go'), 'utf8')
  const rootDrivers = [
    ['sync', /\bDriverSync\s+Driver\s*=/],
    ['null', /\bDriverNull\s+Driver\s*=/]
  ].flatMap(([name, pattern]) => pattern.test(rootDriverSource) ? [name] : [])

  if (rootDrivers.length !== 2) {
    throw new Error('events: expected sync and null root drivers in eventscore/driver.go')
  }

  const moduleRoot = path.join(eventsRoot, 'driver')
  const moduleDrivers = fs.readdirSync(moduleRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(moduleRoot, entry.name, 'go.mod')))
    .map((entry) => {
      if (!entry.name.endsWith('events')) {
        throw new Error(`events: cannot derive driver name from module ${entry.name}`)
      }
      const name = entry.name.slice(0, -'events'.length)
      return name === 'natsjetstream' ? 'jetstream' : name
    })

  const available = new Set([...rootDrivers, ...moduleDrivers])
  const displayOrder = ['sync', 'null', 'nats', 'jetstream', 'redis', 'kafka', 'sns', 'gcppubsub']
  const ordered = displayOrder.filter((name) => available.delete(name))
  if (available.size > 0) {
    throw new Error(`events: add display names for discovered drivers: ${[...available].sort().join(', ')}`)
  }
  if (ordered.length !== rootDrivers.length + moduleDrivers.length) {
    throw new Error('events: duplicate driver names discovered')
  }
  return ordered
}

// Published driver matrices per swap primitive. Event availability is
// discovered because its README also shows planned capability rows.
const DRIVERS = {
  queue: ['null', 'sync', 'workerpool', 'mysql', 'postgres', 'sqlite', 'redis', 'nats', 'sqs', 'rabbitmq'],
  events: discoverEventDrivers(root),
  cache: ['null', 'file', 'memory', 'memcached', 'redis', 'nats', 'dynamodb', 'sqlite', 'postgres', 'mysql'],
  storage: ['local', 'memory', 'redis', 'ftp', 'sftp', 's3', 'gcs', 'dropbox', 'rclone'],
  mail: ['smtp', 'resend', 'postmark', 'mailgun', 'sendgrid', 'ses', 'log', 'fake'],
  database: ['sqlite', 'postgres', 'mysql']
}

const walkGoTestFiles = (dir, files = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'vendor' || entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkGoTestFiles(full, files)
    else if (entry.name.endsWith('_test.go')) files.push(full)
  }
  return files
}

const isIntegration = (filePath, content) =>
  /(^|\/)integration(\/|_)/.test(filePath.replace(root, ''))
  || content.includes('testcontainers')
  || /^\/\/go:build .*integration/m.test(content)

const count = (content, re) => (content.match(re) || []).length

const badgeCount = (readme, kind) => {
  const match = readme.match(new RegExp(`badge/${kind}_tests-(\\d+)-`))
  return match ? Number(match[1]) : null
}

const repos = []
for (const lib of LIBS) {
  const dir = path.join(root, lib)
  if (!fs.existsSync(dir)) {
    console.error(`skip ${lib}: not found at ${dir}`)
    continue
  }
  let testFns = 0
  let benchmarks = 0
  for (const file of walkGoTestFiles(dir)) {
    const content = fs.readFileSync(file, 'utf-8')
    testFns += count(content, /^func Test/gm)
    benchmarks += count(content, /^func Benchmark/gm)
  }
  const readmePath = path.join(dir, 'README.md')
  const readme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf-8') : ''
  repos.push({
    repo: lib,
    unit: badgeCount(readme, 'unit'),
    integration: badgeCount(readme, 'integration'),
    testFns,
    benchmarks
  })
}

const totals = repos.reduce(
  (acc, r) => ({
    unit: acc.unit + (r.unit ?? 0),
    integration: acc.integration + (r.integration ?? 0),
    testFns: acc.testFns + r.testFns,
    benchmarks: acc.benchmarks + r.benchmarks
  }),
  { unit: 0, integration: 0, testFns: 0, benchmarks: 0 }
)

const driverCount = Object.values(DRIVERS).reduce((acc, list) => acc + list.length, 0)

const stats = {
  generatedAt: new Date().toISOString().slice(0, 10),
  totals: {
    unitTests: totals.unit,
    integrationTests: totals.integration,
    testFunctions: totals.testFns,
    benchmarks: totals.benchmarks,
    drivers: driverCount,
    libraries: repos.length
  },
  drivers: DRIVERS,
  repos
}

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, JSON.stringify(stats, null, 2) + '\n')
console.log(`wrote ${outFile}`)
console.log(stats.totals)
