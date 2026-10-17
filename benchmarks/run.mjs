#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const containers = []
const env = { ...process.env, GOWORK: 'off', GOMAXPROCS: '1' }
const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, { cwd: root, env, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, ...options })
  if (result.status !== 0) throw new Error(`${command} ${args[0]} failed: ${result.stderr || result.stdout || result.error}`)
  return result.stdout.trim()
}
const start = (image, port, settings) => {
  const id = run('docker', ['run', '--detach', '--rm', '--publish', `127.0.0.1::${port}`, ...settings.flatMap(value => ['--env', value]), image])
  containers.push(id)
  const address = run('docker', ['port', id, `${port}/tcp`])
  const mapped = address.split(':').at(-1)
  return { id, port: mapped, image, digest: JSON.parse(run('docker', ['image', 'inspect', image]))[0].Id }
}
const ready = async (service, command) => {
  for (let attempt = 0; attempt < 90; attempt++) {
    const result = spawnSync('docker', ['exec', service.id, ...command], { encoding: 'utf8' })
    if (result.status === 0) return
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  throw new Error(`${service.image} readiness timed out`)
}
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')
try {
  const mysql = start('mysql:8.4', 3306, ['MYSQL_ROOT_PASSWORD=local-benchmark', 'MYSQL_DATABASE=benchmark'])
  const postgres = start('postgres:16-alpine', 5432, ['POSTGRES_PASSWORD=local-benchmark', 'POSTGRES_DB=benchmark'])
  await ready(mysql, ['mysqladmin', 'ping', '--host=127.0.0.1', '--user=root', '--password=local-benchmark', '--silent'])
  await ready(postgres, ['pg_isready', '--username=postgres', '--dbname=benchmark'])
  env.FORJ_BENCH_MYSQL_DSN = `root:local-benchmark@tcp(127.0.0.1:${mysql.port})/benchmark?parseTime=true&loc=UTC`
  env.FORJ_BENCH_POSTGRES_DSN = `host=127.0.0.1 port=${postgres.port} user=postgres password=local-benchmark dbname=benchmark sslmode=disable TimeZone=UTC`
  console.log('Running database benchmarks: seven 1s samples per driver, GOMAXPROCS=1.')
  const output = run('go', ['test', '-run=^$', '-bench=^BenchmarkDatabaseRead$', '-benchmem', '-count=7', '-benchtime=1s', '-cpu=1', '-timeout=20m'])
  const samples = []
  for (const line of output.split('\n')) {
    const match = line.match(/^Benchmark(DatabaseRead)\/(\w+)(?:-\d+)?\s+(\d+)\s+([\d.]+) ns\/op\s+([\d.]+) B\/op\s+([\d.]+) allocs\/op/)
    if (match) samples.push({ family: 'database', driver: match[2], iterations: Number(match[3]), ns_op: Number(match[4]), bytes_op: Number(match[5]), allocs_op: Number(match[6]) })
  }
  const expected = { database: ['mysql','postgres','sqlite'] }
  for (const [family, drivers] of Object.entries(expected)) for (const driver of drivers) {
    const rows = samples.filter(row => row.family === family && row.driver === driver)
    if (rows.length !== 7 || rows.some(row => row.ns_op <= 0)) throw new Error(`missing or invalid samples: ${family}/${driver}`)
  }
  if (samples.length !== 21) throw new Error(`unexpected sample count: ${samples.length}`)
  const results = {
    metadata: {
      captured_at: new Date().toISOString(), go_version: run('go', ['version']), goos: run('go', ['env','GOOS']), goarch: run('go',['env','GOARCH']),
      cpu: os.cpus()[0].model, gomaxprocs: 1, sample_count: 7, benchmark_time: '1s',
      packages: { gorm: 'v1.30.0', mysql_driver: 'v1.6.0', postgres_driver: 'v1.6.0', sqlite_driver: 'github.com/glebarez/sqlite v1.11.0' },
      fixtures: [mysql,postgres].map(({image,digest})=>({image,digest})),
      harness_sha256: Object.fromEntries(['database_test.go','go.mod','go.sum','run.mjs'].map(file=>[file,hash(file)])),
      database: 'Warm primary-key reads cycling over 1,000 seeded rows through GORM with GoForj database defaults and one pooled connection. MySQL and PostgreSQL run in local Docker containers; SQLite is a temporary file using the pure-Go driver. Migration, seeding, startup, and connection warmup are outside the timer. These are GORM operation fixtures, not a complete generated application or production database comparison.'
    }, samples
  }
  fs.writeFileSync(path.join(root,'results.json'),JSON.stringify(results,null,2)+'\n')
  fs.writeFileSync(path.join(root,'results.txt'),output+'\n')
  console.log(`Recorded ${samples.length} samples across all three database drivers.`)
} finally {
  for (const id of containers.reverse()) spawnSync('docker',['rm','--force',id],{stdio:'ignore'})
}
