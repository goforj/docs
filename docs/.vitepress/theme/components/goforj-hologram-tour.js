export const HOLOGRAM_TOUR_ORDER = Object.freeze([
  'frontend', 'atlas', 'database', 'cache', 'storage', 'queue', 'events', 'mail', 'libraries'
])

export const HOLOGRAM_TOUR_TIMING = Object.freeze({ delay: 1.8, visible: 5.5, quiet: 1.5 })

// createHologramTour counts visible time and permanently hands its reveal to direct interaction.
export function createHologramTour() {
  let elapsed = 0
  let controlled = false

  // current leaves a quiet interval between families so the complete illustration can breathe.
  function current() {
    if (controlled || elapsed < HOLOGRAM_TOUR_TIMING.delay) return null
    const time = elapsed - HOLOGRAM_TOUR_TIMING.delay
    const interval = HOLOGRAM_TOUR_TIMING.visible + HOLOGRAM_TOUR_TIMING.quiet
    if (time % interval >= HOLOGRAM_TOUR_TIMING.visible) return null
    return HOLOGRAM_TOUR_ORDER[Math.floor(time / interval) % HOLOGRAM_TOUR_ORDER.length]
  }

  return {
    // advance freezes the current family while motion or the full illustration is unavailable.
    advance(seconds, eligible) {
      if (eligible && !controlled) elapsed += Math.max(0, seconds)
      return current()
    },
    // takeOver returns the current family so controls can preserve it without scheduling another reveal.
    takeOver() {
      const id = current()
      controlled = true
      return id
    },
    get controlled() { return controlled }
  }
}
