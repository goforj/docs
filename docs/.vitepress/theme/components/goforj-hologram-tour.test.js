import assert from 'node:assert/strict'
import test from 'node:test'
import { BUILDING_BLOCK_FAMILIES } from './goforj-hero-catalog.js'
import { createHologramTour, HOLOGRAM_TOUR_ORDER, HOLOGRAM_TOUR_TIMING } from './goforj-hologram-tour.js'

const { delay, visible, quiet } = HOLOGRAM_TOUR_TIMING
const interval = visible + quiet

test('the tour covers every building-block family with its complete catalog', () => {
  assert.equal(new Set(HOLOGRAM_TOUR_ORDER).size, HOLOGRAM_TOUR_ORDER.length)
  assert.deepEqual([...HOLOGRAM_TOUR_ORDER].sort(), Object.keys(BUILDING_BLOCK_FAMILIES).sort())
})

test('the first reveal waits for eligible visible time', () => {
  const tour = createHologramTour()
  assert.equal(tour.advance(90, false), null)
  assert.equal(tour.advance(delay - .01, true), null)
  assert.equal(tour.advance(.02, true), 'frontend')
})

test('every family has a readable dwell followed by a quiet interval', () => {
  for (const [index, id] of HOLOGRAM_TOUR_ORDER.entries()) {
    const tour = createHologramTour()
    assert.equal(tour.advance(delay + index * interval + .01, true), id)
    assert.equal(tour.advance(visible - .02, true), id)
    assert.equal(tour.advance(.02, true), null)
    assert.equal(tour.advance(quiet, true), HOLOGRAM_TOUR_ORDER[(index + 1) % HOLOGRAM_TOUR_ORDER.length])
  }
})

test('the last family cycles back to the first after its quiet interval', () => {
  const tour = createHologramTour()
  assert.equal(tour.advance(delay + HOLOGRAM_TOUR_ORDER.length * interval + .01, true), 'frontend')
})

test('pausing or hiding the illustration preserves the remaining dwell', () => {
  const tour = createHologramTour()
  tour.advance(delay + 2, true)
  assert.equal(tour.advance(300, false), 'frontend')
  assert.equal(tour.advance(visible - 2 - .01, true), 'frontend')
  assert.equal(tour.advance(.02, true), null)
})

test('a backwards clock sample does not shorten the initial wait', () => {
  const tour = createHologramTour()
  assert.equal(tour.advance(-10, true), null)
  assert.equal(tour.advance(delay + .01, true), 'frontend')
})

test('interaction preserves the current family for its caller and prevents all future automatic reveals', () => {
  const tour = createHologramTour()
  tour.advance(delay + interval + .01, true)
  assert.equal(tour.takeOver(), 'atlas')
  assert.equal(tour.controlled, true)
  assert.equal(tour.advance(1000, true), null)
  assert.equal(tour.advance(1000, false), null)
  assert.equal(tour.takeOver(), null)
})

test('interaction before the tour starts prevents the first reveal', () => {
  const tour = createHologramTour()
  assert.equal(tour.takeOver(), null)
  assert.equal(tour.advance(1000, true), null)
})
