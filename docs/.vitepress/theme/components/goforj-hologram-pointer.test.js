import assert from 'node:assert/strict'
import test from 'node:test'
import { projectionTravelContains } from './goforj-hologram-pointer.js'

const source = { left: 400, right: 460, top: 400, bottom: 440 }
const catalog = { left: 20, right: 800, top: 40, bottom: 140 }

test('travel to either outer vendor stays protected while crossing another chip', () => {
  for (const destination of [20, 410, 800]) {
    for (const progress of [.1, .3, .5, .7, .9]) {
      assert.equal(projectionTravelContains({
        x: 430 + (destination - 430) * progress,
        y: 420 + (140 - 420) * progress
      }, source, catalog), true)
    }
  }
})

test('the catalog and a small gap around its edge remain reachable', () => {
  for (const point of [{ x: 20, y: 40 }, { x: 800, y: 140 }, { x: 8, y: 100 }, { x: 812, y: 152 }]) {
    assert.equal(projectionTravelContains(point, source, catalog), true)
  }
})

test('direct movement to adjacent chips and away from the catalog is unprotected', () => {
  for (const point of [{ x: 250, y: 420 }, { x: 550, y: 420 }, { x: 430, y: 460 }, { x: 0, y: 300 }, { x: 430, y: 20 }]) {
    assert.equal(projectionTravelContains(point, source, catalog), false)
  }
})

test('overlapping catalog layouts protect their choices without an inverted travel corridor', () => {
  const overlapping = { left: 20, right: 800, top: 350, bottom: 500 }
  assert.equal(projectionTravelContains({ x: 200, y: 400 }, source, overlapping), true)
  assert.equal(projectionTravelContains({ x: 430, y: 300 }, source, overlapping), false)
})
