import assert from 'node:assert/strict'
import test from 'node:test'
import { cargoJourney, cargoCycle, CARGO_TIMELINE, CARGO_LOOP_TIMING, CARGO_LOOP_DURATION, compositionCue } from './goforj-cargo-journey.js'
import { CARGO_BAY, CARGO_PICKUP, loadingPoint } from './goforj-waterfront-layout.js'

test('capability signals converge before the app leaves, then fade completely', () => {
  assert.deepEqual(compositionCue(0), { progress: 0, glow: 0 })
  assert.deepEqual(compositionCue(CARGO_TIMELINE.composed), { progress: 1, glow: 1 })
  assert.ok(CARGO_TIMELINE.composed < CARGO_TIMELINE.beltStart)
  assert.equal(compositionCue(CARGO_TIMELINE.beltStart).progress, 1)
  assert.ok(compositionCue(CARGO_TIMELINE.beltStart).glow > 0)
  assert.deepEqual(compositionCue(CARGO_TIMELINE.arrived), { progress: 1, glow: 0 })
  assert.deepEqual(compositionCue(CARGO_TIMELINE.complete), { progress: 1, glow: 0 })
  for (const time of [.08, CARGO_TIMELINE.composed, CARGO_TIMELINE.composed + .55]) {
    const before = compositionCue(time - .00001)
    const after = compositionCue(time + .00001)
    assert.ok(Math.abs(before.progress - after.progress) < .0001)
    assert.ok(Math.abs(before.glow - after.glow) < .0001)
  }
})

test('the artifact arrives before the crane picks it up', () => {
  assert.equal(cargoJourney(0, .6).beltProgress, .03)
  assert.equal(cargoJourney(CARGO_TIMELINE.beltStart, .6).load, null)
  assert.ok(cargoJourney(CARGO_TIMELINE.arrived - .0001, .6).beltProgress > .99)
  assert.equal(cargoJourney(CARGO_TIMELINE.arrived, .6).beltProgress, null)
  assert.deepEqual(cargoJourney(CARGO_TIMELINE.arrived, .6).load, CARGO_PICKUP)
  assert.equal(cargoJourney(CARGO_TIMELINE.gripped, .6).spreaderY, CARGO_PICKUP.y + .6)
})

test('Harbor has a settled local-development beat before the crane grips the artifact', () => {
  const arrival = cargoJourney(CARGO_TIMELINE.arrived, .6)
  const settled = cargoJourney(CARGO_TIMELINE.settled, .6)
  assert.deepEqual(arrival.load, CARGO_PICKUP)
  assert.deepEqual(settled.load, CARGO_PICKUP)
  assert.equal(arrival.spreaderY, settled.spreaderY)
  assert.equal(arrival.harborGlow, 0)
  assert.equal(settled.harborGlow, 1)
  assert.equal(cargoJourney(CARGO_TIMELINE.crossed, .6).harborGlow, 0)
})

test('the crane moves across only after the load has cleared the quay', () => {
  const lifted = cargoJourney(CARGO_TIMELINE.lifted, .6)
  assert.equal(lifted.load.x, CARGO_PICKUP.x)
  assert.equal(lifted.load.z, CARGO_PICKUP.z)
  assert.ok(lifted.load.y > CARGO_BAY.y + .25)
  const crossing = cargoJourney((CARGO_TIMELINE.lifted + CARGO_TIMELINE.crossed) / 2, .6)
  assert.ok(crossing.load.x > CARGO_PICKUP.x && crossing.load.x < CARGO_BAY.x)
  assert.ok(crossing.load.z > CARGO_PICKUP.z && crossing.load.z < CARGO_BAY.z)
  assert.equal(crossing.load.y, lifted.load.y)
  assert.deepEqual(cargoJourney(CARGO_TIMELINE.crossed, .6).load, { ...CARGO_BAY, y: lifted.load.y })
})

test('the artifact remains on Ship while the empty crane returns', () => {
  for (const seconds of [CARGO_TIMELINE.landed, CARGO_TIMELINE.released, CARGO_TIMELINE.complete, 20, 200]) {
    assert.deepEqual(cargoJourney(seconds, .6).load, CARGO_BAY)
  }
  assert.deepEqual(cargoJourney(CARGO_TIMELINE.complete, .6).trolley, { x: CARGO_PICKUP.x, z: CARGO_PICKUP.z })
  assert.ok(cargoJourney(CARGO_TIMELINE.released, .6).spreaderY > CARGO_BAY.y + .6)
  assert.ok(CARGO_TIMELINE.complete >= 7 && CARGO_TIMELINE.complete <= 9)
})

test('Ship lights the landing, then keeps a quiet deployed status', () => {
  assert.equal(cargoJourney(CARGO_TIMELINE.lifted, .6).shipGlow, 0)
  assert.equal(cargoJourney(CARGO_TIMELINE.crossed, .6).shipGlow, 0)
  assert.equal(cargoJourney(CARGO_TIMELINE.landed, .6).shipGlow, 1)
  assert.equal(cargoJourney(CARGO_TIMELINE.released, .6).shipGlow, 1)
  assert.equal(cargoJourney(CARGO_TIMELINE.complete, .6).shipGlow, .25)
  assert.equal(cargoJourney(200, .6).shipGlow, .25)
})

test('lifting and release remain continuous at each stage boundary', () => {
  for (const time of [CARGO_TIMELINE.settled, CARGO_TIMELINE.gripped, CARGO_TIMELINE.lifted,
    CARGO_TIMELINE.crossed, CARGO_TIMELINE.landed, CARGO_TIMELINE.released, CARGO_TIMELINE.complete]) {
    const before = cargoJourney(time - .00001, .6)
    const after = cargoJourney(time + .00001, .6)
    assert.ok(Math.abs(before.spreaderY - after.spreaderY) < .0001)
    for (const axis of ['x', 'y', 'z']) assert.ok(Math.abs(before.load[axis] - after.load[axis]) < .0001)
  }
})

test('each dock has its own finite loading point at the shared pickup surface', () => {
  const desktop = loadingPoint(false)
  const portrait = loadingPoint(true)
  assert.ok([...desktop, ...portrait].every(Number.isFinite))
  assert.notDeepEqual(desktop, portrait)
  assert.ok(Math.abs(desktop[1] - .5821) < 1e-10)
  assert.ok(Math.abs(portrait[1] - .5452) < 1e-10)
})

test('a delivered app rests on Ship before fading out at the same stationary pose', () => {
  const fadeStart = CARGO_TIMELINE.complete + CARGO_LOOP_TIMING.hold
  for (const seconds of [CARGO_TIMELINE.complete, fadeStart - .001, fadeStart]) {
    assert.deepEqual(cargoCycle(seconds), { journeySeconds: CARGO_TIMELINE.complete, opacity: 1, state: 'complete' })
  }
  const fading = cargoCycle(fadeStart + CARGO_LOOP_TIMING.fade / 2)
  assert.ok(Math.abs(fading.opacity - .5) < 1e-10)
  assert.deepEqual(cargoJourney(fading.journeySeconds, .6).load, CARGO_BAY)
  assert.equal(fading.state, 'complete')
})

test('the reset stays invisible until the next app forms and fades in before belt motion', () => {
  assert.equal(cargoCycle(CARGO_LOOP_DURATION - .001).opacity, 0)
  assert.deepEqual(cargoCycle(CARGO_LOOP_DURATION), { journeySeconds: 0, opacity: 0, state: 'running' })
  assert.equal(cargoCycle(CARGO_LOOP_DURATION + CARGO_TIMELINE.composed - .001).opacity, 0)
  const forming = cargoCycle(CARGO_LOOP_DURATION + CARGO_TIMELINE.composed + CARGO_LOOP_TIMING.appear / 2)
  assert.ok(Math.abs(forming.opacity - .5) < 1e-10)
  const ready = cargoCycle(CARGO_LOOP_DURATION + CARGO_TIMELINE.beltStart)
  assert.equal(ready.opacity, 1)
  assert.ok(Math.abs(cargoJourney(ready.journeySeconds, .6).beltProgress - .03) < 1e-10)
})

test('multiple cycles and a skipped frame retain the same finite choreography', () => {
  const offset = CARGO_TIMELINE.lifted + .2
  const first = cargoCycle(offset)
  for (const cycles of [1, 2, 10, 1000]) {
    const next = cargoCycle(CARGO_LOOP_DURATION * cycles + offset)
    assert.ok(Math.abs(next.journeySeconds - first.journeySeconds) < 1e-10)
    assert.equal(next.opacity, first.opacity)
    assert.equal(next.state, first.state)
    const pose = cargoJourney(next.journeySeconds, .6)
    assert.ok(Object.values(pose.load).every(Number.isFinite))
    assert.equal(pose.load.y, .88)
  }
})

test('fade boundaries are continuous and restart while both poses are invisible', () => {
  const fadeStart = CARGO_TIMELINE.complete + CARGO_LOOP_TIMING.hold
  for (const time of [CARGO_TIMELINE.composed, CARGO_TIMELINE.composed + CARGO_LOOP_TIMING.appear,
    fadeStart, fadeStart + CARGO_LOOP_TIMING.fade, CARGO_LOOP_DURATION]) {
    const before = cargoCycle(time - .00001)
    const after = cargoCycle(time + .00001)
    assert.ok(Math.abs(before.opacity - after.opacity) < .00001)
    if (time === CARGO_LOOP_DURATION) {
      assert.equal(before.opacity, 0)
      assert.equal(after.opacity, 0)
    } else assert.ok(Math.abs(before.journeySeconds - after.journeySeconds) < .0001)
  }
})

test('an unstarted cycle waits invisibly and clamps negative elapsed time', () => {
  const waiting = { journeySeconds: 0, opacity: 0, state: 'waiting' }
  assert.deepEqual(cargoCycle(0), waiting)
  assert.deepEqual(cargoCycle(-100), waiting)
})
