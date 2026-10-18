import test from 'node:test'
import assert from 'node:assert/strict'
import { comparablePerformanceData } from './performance-data.mjs'

const snapshot = () => ({ generatedAt: '2026-10-17', sources: [{repo:'database',revision:'before-merge',sha256:'artifact-content'}], rows:[{value:100}] })

test('identical artifacts stay current when squash merging changes their containing commit', () => {
  const before=snapshot(),after=snapshot()
  after.generatedAt='2026-10-18'
  after.sources[0].revision='squash-commit'
  assert.deepEqual(comparablePerformanceData(before),comparablePerformanceData(after))
  assert.equal(before.sources[0].revision,'before-merge')
})

test('changed artifact bytes and measurements still make snapshots stale', () => {
  const before=snapshot(),changedArtifact=snapshot(),changedValue=snapshot()
  changedArtifact.sources[0].sha256='new-artifact-content'
  changedValue.rows[0].value=200
  assert.notDeepEqual(comparablePerformanceData(before),comparablePerformanceData(changedArtifact))
  assert.notDeepEqual(comparablePerformanceData(before),comparablePerformanceData(changedValue))
})
