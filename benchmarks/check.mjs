import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const data = JSON.parse(fs.readFileSync(path.join(root, 'results.json'), 'utf8'))
const expected = { mail: ['smtp','resend','postmark','mailgun','sendgrid','ses','log','fake'], database: ['mysql','postgres','sqlite'] }
for (const [file, expectedHash] of Object.entries(data.metadata.harness_sha256)) {
  const actual = crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')
  assert.equal(actual, expectedHash, `benchmark source changed: rerun benchmarks/run.mjs (${file})`)
}
assert.equal(data.samples.length, 77)
for (const [family, drivers] of Object.entries(expected)) for (const driver of drivers) {
  const rows = data.samples.filter(row => row.family === family && row.driver === driver)
  assert.equal(rows.length, 7, `${family}/${driver} samples`)
  assert.ok(rows.every(row => Number.isFinite(row.ns_op) && row.ns_op > 0 && row.iterations > 0 && Number.isFinite(row.bytes_op) && row.bytes_op >= 0 && Number.isFinite(row.allocs_op) && row.allocs_op >= 0))
}
const raw = fs.readFileSync(path.join(root,'results.txt'),'utf8')
for (const row of data.samples) {
  const benchmark = row.family === 'mail' ? 'MailSend' : 'DatabaseRead'
  assert.ok(raw.split('\n').some(line => {
    const fields = line.trim().split(/\s+/)
    return fields[0] === `Benchmark${benchmark}/${row.driver}` && Number(fields[1]) === row.iterations && Number(fields[2]) === row.ns_op && Number(fields[4]) === row.bytes_op && Number(fields[6]) === row.allocs_op
  }), `raw benchmark output missing: ${row.family}/${row.driver}`)
}
console.log('Mail and database benchmark artifacts match the harness and all 77 recorded samples.')
