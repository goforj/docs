#!/usr/bin/env node

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const check = process.argv.includes('--check')
const rootArg = process.argv.slice(2).find((arg) => arg !== '--check')
const reposRoot = path.resolve(rootArg || path.join(docsRoot, '..'))
const outputFile = path.join(docsRoot, 'docs', '.vitepress', 'data', 'performance-stats.json')
const proofFile = path.join(docsRoot, 'docs', '.vitepress', 'data', 'proof-stats.json')

const benchmarkFile = (repo) => path.join(reposRoot, repo, 'docs', 'bench', 'benchmarks_rows.json')
const readJSON = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const required = (value, description) => {
  if (value === undefined || value === null) throw new Error(`missing benchmark row: ${description}`)
  return value
}
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}
const labels = {
  ftp: 'FTP',
  gcppubsub: 'Google Pub/Sub',
  gcs: 'GCS',
  mysql: 'MySQL',
  nats: 'NATS',
  nats_bucket_ttl: 'NATS KV + TTL',
  natsjetstream: 'NATS JetStream',
  postgres: 'PostgreSQL',
  rabbitmq: 'RabbitMQ',
  rclone_local: 'rclone local',
  sftp: 'SFTP',
  sns: 'SNS',
  sqs: 'SQS',
  sqlite: 'SQLite',
  workerpool: 'Worker pool'
}
const title = (value) => {
  const normalized = value.replace(/^sql_/, '')
  return labels[normalized] || normalized
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

// source records the exact committed benchmark artifact consumed by the page.
const source = (repo) => {
  const file = benchmarkFile(repo)
  const relative = path.relative(path.join(reposRoot, repo), file)
  return {
    repo,
    path: relative,
    revision: execFileSync('git', ['-C', path.join(reposRoot, repo), 'log', '-1', '--format=%H', '--', relative], { encoding: 'utf8' }).trim(),
    sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
  }
}

const cacheRaw = readJSON(benchmarkFile('cache'))
const queueRaw = readJSON(benchmarkFile('queue'))
const eventsRaw = readJSON(benchmarkFile('events'))
const storageRaw = readJSON(benchmarkFile('storage'))
const webRaw = readJSON(benchmarkFile('web'))
const proof = readJSON(proofFile)

const cacheRows = required(cacheRaw.get_bytes, 'cache get_bytes').map((row) => ({
  label: title(row.Driver),
  value: row.NsOp,
  bytes: row.BytesOp,
  allocs: row.AllocsOp,
  kind: row.Driver === 'memory' ? 'process' : ['file', 'sql_sqlite'].includes(row.Driver) ? 'local' : 'service'
}))

const queueRows = queueRaw
  .filter((row) => row.driver !== 'null')
  .map((row) => ({
    label: title(row.driver),
    value: row.ns_op,
    bytes: row.b_op,
    allocs: row.allocs_op,
    kind: ['sync', 'workerpool'].includes(row.driver) ? 'process' : row.driver === 'sqlite' ? 'local' : 'service'
  }))

const eventRows = eventsRaw
  .filter((row) => row.name === 'SyncPublishRoundTrip' || row.set === 'Integration')
  .map((row) => {
    const driver = row.name.includes('/') ? row.name.split('/').at(-1) : 'sync'
    return {
      label: driver === 'sync' ? 'Synchronous' : title(driver),
      value: row.ns_op,
      bytes: row.b_op,
      allocs: row.allocs_op,
      kind: driver === 'sync' ? 'process' : 'service'
    }
  })

const storageRows = required(storageRaw.get_small, 'storage get_small').map((row) => ({
  label: title(row.driver),
  value: row.ns_op,
  bytes: row.bytes_op,
  allocs: row.allocs_op,
  kind: row.driver === 'memory' ? 'process' : ['local', 'rclone_local'].includes(row.driver) ? 'local' : 'service'
}))

const webScenarios = ['live_plain_text', 'static_text', 'path_param_json', 'middleware_chain'].map((scenario) => {
  const samples = webRaw.samples.filter((sample) => sample.scenario === scenario)
  const frameworks = [...new Set(samples.map((sample) => sample.framework))]
  return {
    id: scenario,
    rows: frameworks.map((framework) => {
      const rows = samples.filter((sample) => sample.framework === framework)
      return {
        label: {
          goforj_web: 'GoForj Web',
          net_http: 'net/http',
          gorilla_mux: 'Gorilla Mux',
          httprouter: 'httprouter'
        }[framework] || title(framework),
        framework,
        throughput: median(rows.map((row) => row.throughput_per_second)),
        nsOp: median(rows.map((row) => row.nanoseconds_per_op)),
        bytes: median(rows.map((row) => row.bytes_per_op)),
        allocs: median(rows.map((row) => row.allocs_per_op))
      }
    })
  }
})

const findRow = (rows, label) => required(rows.find((row) => row.label === label), label)

const stats = {
  generatedAt: new Date().toISOString().slice(0, 10),
  totals: proof.totals,
  highlights: [
    { library: 'Cache', label: 'Memory GetBytes', value: findRow(cacheRows, 'Memory').value, unit: 'ns/op' },
    { library: 'Queue', label: 'Synchronous Dispatch return', value: findRow(queueRows, 'Sync').value, unit: 'ns/op' },
    { library: 'Events', label: 'Publish + handler round trip', value: findRow(eventRows, 'Synchronous').value, unit: 'ns/op' },
    { library: 'Storage', label: 'Memory small-object Get', value: findRow(storageRows, 'Memory').value, unit: 'ns/op' }
  ],
  driverStories: [
    { id: 'cache', title: 'Cache reads', operation: 'GetBytes', rows: cacheRows },
    { id: 'queue', title: 'Queue dispatch', operation: 'Queue', rows: queueRows },
    { id: 'events', title: 'Event round trips', operation: 'Publish + handle', rows: eventRows },
    { id: 'storage', title: 'Small-file reads', operation: 'Get', rows: storageRows }
  ],
  web: {
    metadata: webRaw.metadata,
    scenarios: webScenarios
  },
  benchmarkLibraries: proof.repos
    .filter((repo) => repo.benchmarks > 0)
    .map((repo) => ({ repo: repo.repo, benchmarks: repo.benchmarks })),
  sources: ['cache', 'events', 'queue', 'storage', 'web'].map(source)
}

const output = JSON.stringify(stats, null, 2) + '\n'

if (check) {
  const current = readJSON(outputFile)
  const expected = JSON.parse(output)
  delete current.generatedAt
  delete expected.generatedAt
  if (JSON.stringify(current) !== JSON.stringify(expected)) {
    throw new Error(`performance statistics are stale; run: node bin/collect-performance-stats.mjs ${reposRoot}`)
  }
  console.log(`performance statistics are current: ${outputFile}`)
} else {
  fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  fs.writeFileSync(outputFile, output)
  console.log(`wrote ${outputFile}`)
  console.log({ highlights: stats.highlights, driverStories: stats.driverStories.length })
}
