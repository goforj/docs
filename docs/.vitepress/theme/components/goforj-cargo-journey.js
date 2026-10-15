import { CARGO_BAY, CARGO_PICKUP } from './goforj-waterfront-layout.js'

export const CARGO_TIMELINE = Object.freeze({
  composed: .80, beltStart: 1.05, arrived: 3.00, settled: 3.65, gripped: 4.25,
  lifted: 4.95, crossed: 6.45, landed: 7.25, released: 7.80, complete: 8.80
})

export const CARGO_LOOP_TIMING = Object.freeze({ hold: 3.2, fade: .65, quiet: .45, appear: .25 })
export const CARGO_LOOP_DURATION = CARGO_TIMELINE.complete + CARGO_LOOP_TIMING.hold + CARGO_LOOP_TIMING.fade + CARGO_LOOP_TIMING.quiet

// cargoCycle resets the artifact only after its delivered pose has rested and faded away.
export function cargoCycle(seconds) {
  const elapsed = Math.max(0, seconds)
  const time = elapsed % CARGO_LOOP_DURATION
  const fadeStart = CARGO_TIMELINE.complete + CARGO_LOOP_TIMING.hold
  const ease = value => {
    const t = Math.max(0, Math.min(1, value))
    return t * t * (3 - 2 * t)
  }
  const opacity = time < fadeStart
    ? ease((time - CARGO_TIMELINE.composed) / CARGO_LOOP_TIMING.appear)
    : 1 - ease((time - fadeStart) / CARGO_LOOP_TIMING.fade)
  return {
    journeySeconds: Math.min(time, CARGO_TIMELINE.complete),
    opacity,
    state: elapsed === 0 ? 'waiting' : time < CARGO_TIMELINE.complete ? 'running' : 'complete'
  }
}

// compositionCue lets the capability signals converge before the completed app leaves its socket.
export function compositionCue(seconds) {
  const progress = Math.max(0, Math.min(1, (seconds - .08) / (CARGO_TIMELINE.composed - .08)))
  const fade = Math.max(0, Math.min(1, (seconds - CARGO_TIMELINE.composed) / .55))
  return { progress, glow: Math.sin(progress * Math.PI / 2) * (1 - fade) }
}

// cargoJourney choreographs one artifact through the belt, local quay, crane, and deployment bay.
export function cargoJourney(seconds, spreaderOffset) {
  const time = CARGO_TIMELINE
  const pickup = CARGO_PICKUP
  const bay = CARGO_BAY
  const liftHeight = .88
  const parkedHeight = liftHeight + spreaderOffset
  const between = (start, end, from, to) => {
    const value = Math.max(0, Math.min(1, (seconds - start) / (end - start)))
    if (value === 0) return from
    if (value === 1) return to
    return from + (to - from) * value * value * (3 - 2 * value)
  }
  const crossing = seconds >= time.lifted && seconds < time.released
  const trolleyX = crossing ? between(time.lifted, time.crossed, pickup.x, bay.x)
    : seconds >= time.released ? between(time.released, time.complete, bay.x, pickup.x) : pickup.x
  const trolleyZ = crossing ? between(time.lifted, time.crossed, pickup.z, bay.z)
    : seconds >= time.released ? between(time.released, time.complete, bay.z, pickup.z) : pickup.z
  const loadY = seconds < time.lifted ? between(time.gripped, time.lifted, pickup.y, liftHeight)
    : between(time.crossed, time.landed, liftHeight, bay.y)
  const spreaderY = seconds < time.gripped ? between(time.settled, time.gripped, parkedHeight, pickup.y + spreaderOffset)
    : seconds < time.landed ? loadY + spreaderOffset
      : between(time.landed, time.released, bay.y + spreaderOffset, parkedHeight)
  return {
    beltProgress: seconds < time.arrived ? between(time.beltStart, time.arrived, .03, 1) : null,
    load: seconds < time.arrived ? null : { x: seconds < time.landed ? trolleyX : bay.x, y: loadY, z: seconds < time.landed ? trolleyZ : bay.z },
    trolley: { x: trolleyX, z: trolleyZ },
    spreaderY,
    turn: between(time.arrived, time.settled, 0, 1),
    harborGlow: seconds < time.lifted ? between(time.arrived, time.settled, 0, 1)
      : between(time.lifted, time.crossed, 1, 0),
    shipGlow: seconds < time.released ? between(time.crossed, time.landed, 0, 1)
      : between(time.released, time.complete, 1, .25)
  }
}
