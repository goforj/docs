import test from 'node:test'
import assert from 'node:assert/strict'
import { metricValue, measurementAxis } from './performance-measurements.mjs'

test('driver throughput is the reciprocal of the recorded nanoseconds per operation', () => {
  assert.equal(metricValue({ value: 100 }, 'ops'), 10_000_000)
  assert.equal(metricValue({ value: 70 }, 'time'), 70)
})

test('HTTP retains its measured throughput, including zero, instead of recomputing it', () => {
  assert.equal(metricValue({ value: 100, throughput: 123 }, 'ops'), 123)
  assert.equal(metricValue({ value: 100, throughput: 0 }, 'ops'), 0)
})

test('allocation metrics retain fractional measurements', () => {
  assert.equal(metricValue({ allocs: 630.1, bytes: 45419.3 }, 'allocs'), 630.1)
  assert.equal(metricValue({ allocs: 630.1, bytes: 45419.3 }, 'bytes'), 45419.3)
})

test('equal multiplicative differences occupy equal distances on a logarithmic axis', () => {
  const axis = measurementAxis([10, 100, 1000], true)
  assert.deepEqual(axis.ticks, [10, 100, 1000])
  assert.equal(axis.position(10), 0)
  assert.equal(axis.position(100), 50)
  assert.equal(axis.position(1000), 100)
})

test('identical positive results still get a usable logarithmic range', () => {
  const axis = measurementAxis([100, 100], true)
  assert.deepEqual(axis.ticks, [100, 1000])
  assert.equal(axis.position(100), 0)
})

test('linear scales start at zero and do not clip observed samples', () => {
  const axis = measurementAxis([115769, 117923, 119636], false)
  assert.equal(axis.ticks[0], 0)
  assert.equal(axis.position(0), 0)
  assert.ok(axis.ticks.at(-1) >= 119636)
  assert.ok(axis.position(119636) <= 100)
})

test('all-zero allocation results have a finite axis and zero-length bars', () => {
  const axis = measurementAxis([0, 0, 0], false)
  assert.equal(axis.ticks.at(-1), 1)
  assert.ok(axis.ticks.every(Number.isFinite))
  assert.equal(axis.position(0), 0)
})
