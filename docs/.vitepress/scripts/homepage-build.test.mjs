import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')

test('both homepage bundles contain valid JavaScript', () => {
  const assets = path.join(dist, 'assets')
  const bundles = fs.readdirSync(assets).filter((file) => /^index\.md\..+\.js$/.test(file))
  assert.ok(bundles.some((file) => file.endsWith('.lean.js')), 'missing lean homepage bundle')
  assert.ok(bundles.some((file) => !file.endsWith('.lean.js')), 'missing full homepage bundle')
  for (const file of bundles) {
    execFileSync(process.execPath, ['--check', path.join(assets, file)], { stdio: 'pipe' })
  }
})

test('every homepage example includes code for lean-bundle hydration', () => {
  const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
  for (const name of ['http', 'storage', 'database', 'cache', 'queue', 'events', 'schedule', 'command', 'testing', 'mail']) {
    const start = html.indexOf(`id="home-example-panel-${name}"`)
    assert.ok(start >= 0, `missing ${name} panel`)
    const next = html.indexOf('id="home-example-panel-', start + 1)
    const panel = html.slice(start, next < 0 ? undefined : next)
    assert.match(panel, /<pre\b/, `${name} panel is missing its rendered example`)
  }
  for (const name of ['event', 'subscriber']) {
    const start = html.indexOf(`id="home-event-code-${name}"`)
    assert.ok(start >= 0, `missing ${name} example`)
    const next = html.indexOf('id="home-', start + 1)
    const panel = html.slice(start, next < 0 ? undefined : next)
    assert.match(panel, /<pre\b/, `${name} example is missing its rendered code`)
  }
})
