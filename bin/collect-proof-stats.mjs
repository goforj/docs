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
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const check = process.argv.includes('--check')
const rootArg = process.argv.slice(2).find((arg) => arg !== '--check')
const root = path.resolve(rootArg || path.join(docsRoot, '..'))
const outFile = path.join(docsRoot, 'docs', '.vitepress', 'data', 'proof-stats.json')

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

// markdownSection isolates one README section so API tables elsewhere cannot inflate a Driver matrix.
const markdownSection = (source, heading) => {
  const startMarker = `## ${heading}`
  const start = source.indexOf(startMarker)
  if (start === -1) throw new Error(`missing README section ${startMarker}`)
  const bodyStart = start + startMarker.length
  const end = source.indexOf('\n## ', bodyStart)
  return source.slice(bodyStart, end === -1 ? undefined : end)
}

// discoverBadgeTableDrivers reads the published first-column badge labels used by Queue, Cache, and Storage.
const discoverBadgeTableDrivers = (reposRoot, repo, heading) => {
  const readme = fs.readFileSync(path.join(reposRoot, repo, 'README.md'), 'utf8')
  const section = markdownSection(readme, heading)
  const drivers = [...section.matchAll(/<img\b[^>]*\balt="([^"]+)"[^>]*>/gi)]
    .map((match) => match[1].trim().toLowerCase())
  if (drivers.length === 0 || new Set(drivers).size !== drivers.length) {
    throw new Error(`${repo}: published ${heading} table must contain unique Driver badge labels`)
  }
  return drivers
}

// discoverMailDrivers reads the concrete delivery implementations from Mail's published capability matrix.
const discoverMailDrivers = (reposRoot) => {
  const readme = fs.readFileSync(path.join(reposRoot, 'mail', 'README.md'), 'utf8')
  const section = markdownSection(readme, 'Driver Capabilities')
  const drivers = [...section.matchAll(/^\|\s*mail([a-z0-9]+)\s*\|/gmi)].map((match) => match[1])
  if (drivers.length === 0 || new Set(drivers).size !== drivers.length) {
    throw new Error('mail: published Driver Capabilities must contain unique mail Driver rows')
  }
  return drivers
}

// discoverDatabaseDrivers uses the framework component catalog that defines selectable generated database support.
const discoverDatabaseDrivers = (reposRoot) => {
  const source = fs.readFileSync(path.join(reposRoot, 'goforj', 'project', 'components_catalog.go'), 'utf8')
  const drivers = [...source.matchAll(/ComponentDatabase[A-Za-z0-9_]*\s+ComponentKey\s*=\s*"database_([^"]+)"/g)]
    .map((match) => match[1])
  if (drivers.length === 0 || new Set(drivers).size !== drivers.length) {
    throw new Error('goforj: database component catalog must contain unique database Driver keys')
  }
  return drivers
}

// Published Driver matrices are discovered from their owning repositories so a new or removed backend changes proof data.
const DRIVERS = {
  queue: discoverBadgeTableDrivers(root, 'queue', 'Drivers'),
  events: discoverEventDrivers(root),
  cache: discoverBadgeTableDrivers(root, 'cache', 'Drivers'),
  storage: discoverBadgeTableDrivers(root, 'storage', 'Driver Matrix'),
  mail: discoverMailDrivers(root),
  database: discoverDatabaseDrivers(root)
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

// sourceRevision ties the checked-in totals to exact source trees so a normal
// docs build can reject evidence that no longer describes its inputs.
const sourceRevision = (dir) =>
  execFileSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()

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
    benchmarks,
    sourceRevision: sourceRevision(dir)
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

const output = JSON.stringify(stats, null, 2) + '\n'

if (check) {
  const current = JSON.parse(fs.readFileSync(outFile, 'utf8'))
  const expected = JSON.parse(output)
  // The collection date is informational; source revisions and every proof
  // value determine whether the checked-in evidence is current.
  delete current.generatedAt
  delete expected.generatedAt
  if (JSON.stringify(current) !== JSON.stringify(expected)) {
    throw new Error(`proof statistics are stale; run: node bin/collect-proof-stats.mjs ${root}`)
  }
  console.log(`proof statistics are current: ${outFile}`)
} else {
  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, output)
  console.log(`wrote ${outFile}`)
  console.log(stats.totals)
}
