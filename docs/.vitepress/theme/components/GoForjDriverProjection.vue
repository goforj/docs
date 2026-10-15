<script setup>
import { computed, onMounted, ref, useId, watch } from 'vue'
import { useData } from 'vitepress'
import { lucideIconBodies, simpleIconBodies } from 'virtual:goforj-icons'
import { BRAND_ICON_KEYS, driverProjectionLayout } from './goforj-hero-catalog.js'

const props = defineProps({
  capability: { type: Object, required: true },
  choices: { type: Array, required: true },
  motion: { type: Boolean, default: true }
})
const emit = defineEmits(['enter', 'leave', 'focus', 'blur', 'dismiss', 'interact'])
const { isDark } = useData()
const projectionId = useId().replace(/:/g, '')
const iconViewBoxes = ref({})
const iconElements = new Map()
const projectionElement = ref(null)
const activeDriver = ref(null)
const activeAnchor = ref(null)
const layout = computed(() => driverProjectionLayout(props.capability.canvasWidth, props.choices.length, props.capability.floatingProjection, props.capability.compactProjection))
const blockWidth = computed(() => layout.value.blockWidth)
const width = computed(() => layout.value.width)
const left = computed(() => Math.max(12, Math.min(props.capability.canvasWidth - width.value - 12, props.capability.left - width.value / 2)))
const bottom = computed(() => layout.value.bottom)
const source = computed(() => props.capability.emitter || { x: props.capability.left, y: props.capability.top - 8 })
const familyTint = computed(() => !isDark.value && props.capability.id === 'mail' ? '#827867' : props.capability.color)
const projectionTint = computed(() => activeDriver.value ? projectionColor(activeDriver.value) : familyTint.value)
const beam = computed(() => `${left.value + width.value * .18},${bottom.value} ${left.value + width.value * .82},${bottom.value} ${source.value.x + 6},${source.value.y} ${source.value.x - 6},${source.value.y}`)
const hub = computed(() => ({ x: left.value + 7, y: layout.value.top + 8 }))
// tether reaches the family title outside the vendor grid, so no implementation appears selected at rest.
const tether = computed(() => {
  const rail = left.value - 5
  return `M${source.value.x} ${source.value.y} C${source.value.x} ${source.value.y - 32} ${rail} ${bottom.value + 32} ${rail} ${bottom.value + 8} L${rail} ${hub.value.y + 8} Q${rail} ${hub.value.y} ${hub.value.x} ${hub.value.y}`
})
const thread = computed(() => {
  if (!activeAnchor.value) return ''
  const { x, y } = activeAnchor.value
  return `M${x} ${y + 9} L${x} ${y}`
})
const sourceFrame = computed(() => props.capability.emitter?.corners.map(point => `${point.x},${point.y}`).join(' '))

// exploreDriver matches the selected hologram's accent to the source without a line across the scene.
function exploreDriver(item, element) {
  const rootBounds = projectionElement.value.getBoundingClientRect()
  const bounds = element.getBoundingClientRect()
  activeDriver.value = item
  activeAnchor.value = { x: bounds.left + bounds.width / 2 - rootBounds.left, y: bounds.top + layout.value.graphicHeight - 6 - rootBounds.top }
}

// leaveDriver keeps keyboard selection visible when the pointer crosses another part of the projection.
function leaveDriver(event) {
  const focused = event.currentTarget.querySelector(':focus-visible')
  if (focused) {
    const item = props.choices.find(choice => choice.id === focused.dataset.driver)
    if (item) exploreDriver(item, focused)
    return
  }
  activeDriver.value = null
  activeAnchor.value = null
}

watch(() => [props.capability.canvasWidth, props.capability.canvasHeight], () => {
  if (!activeDriver.value) return
  const element = projectionElement.value.querySelector(`[data-driver="${activeDriver.value.id}"]`)
  if (element) exploreDriver(activeDriver.value, element)
}, { flush: 'post' })

// iconBody uses the same glyph selection as the original forge blocks.
function iconBody(item) {
  if (item.icon === 'templ') return '<text x="1" y="16" font-size="8.5" font-weight="750" font-family="sans-serif" textLength="22" lengthAdjust="spacingAndGlyphs">templ</text>'
  return lucideIconBodies[item.icon] || simpleIconBodies[BRAND_ICON_KEYS[item.icon]] || simpleIconBodies[item.icon] || ''
}

// fitIcons normalises the painted artwork, including stroke padding, instead of its empty 24px canvas.
function fitIcons() {
  const viewBoxes = {}
  for (const [icon, element] of iconElements) {
    const bounds = element.getBBox()
    if (!bounds.width || !bounds.height) continue
    const padding = lucideIconBodies[icon] ? 1.1 : .2
    viewBoxes[icon] = `${bounds.x - padding} ${bounds.y - padding} ${bounds.width + padding * 2} ${bounds.height + padding * 2}`
  }
  iconViewBoxes.value = viewBoxes
}

onMounted(fitIcons)

// label leaves category context in the accessible name while keeping the visible vendor name short.
function label(item) {
  return item.title.replace(/ (Storage|Cache|Queue|Events|Mail)$/, '').replace(/^Amazon /, '').replace('Google Cloud', 'Google').replace('NATS JetStream', 'JetStream').replace('Google Pub/Sub', 'Pub/Sub').replace('Claude Code', 'Claude').replace('Gemini CLI', 'Gemini').replace('GitHub Copilot', 'Copilot')
}

// projectionColor lifts dark vendor pigments while preserving the difference between their channels.
function projectionColor(item) {
  if (!isDark.value) return item.color
  const rgb = [1, 3, 5].map(offset => parseInt(item.color.slice(offset, offset + 2), 16))
  const brightness = rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722
  const lift = Math.max(0, 76 - brightness)
  return `rgb(${rgb.map(channel => Math.round(channel + lift)).join(', ')})`
}

// glyphColor keeps logos readable on saturated pigments in light mode and translucent blocks in dark mode.
function glyphColor(item) {
  if (isDark.value) return '#ffffff'
  const channels = [1, 3, 5].map(offset => parseInt(item.color.slice(offset, offset + 2), 16) / 255)
    .map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4)
  const luminance = channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722
  return luminance > .18 ? '#23323d' : '#ffffff'
}

// leaveFocus keeps the family open when keyboard focus moves between its links.
function leaveFocus(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    activeDriver.value = null
    activeAnchor.value = null
    emit('blur')
  }
}
</script>

<template>
  <div :id="`engine-${capability.id}-drivers`" ref="projectionElement" class="driver-projection" :class="{ 'is-static': !motion, 'is-light': !isDark, 'is-compact': capability.compactProjection }" :style="{ '--projection-tint': projectionTint, '--family-tint': familyTint }" @keydown.esc.prevent="emit('dismiss')" @pointerdown.capture="emit('interact')">
    <svg class="driver-projection__beam" :viewBox="`0 0 ${capability.canvasWidth} ${capability.canvasHeight}`" aria-hidden="true">
      <defs>
        <radialGradient :id="`${projectionId}-source`">
          <stop offset="0" stop-color="var(--projection-tint)" stop-opacity=".25" />
          <stop offset="1" stop-color="var(--projection-tint)" stop-opacity="0" />
        </radialGradient>
        <linearGradient v-if="activeAnchor" :id="`${projectionId}-thread`" gradientUnits="userSpaceOnUse" :x1="activeAnchor.x" :y1="activeAnchor.y + 9" :x2="activeAnchor.x" :y2="activeAnchor.y">
          <stop offset="0" stop-color="var(--projection-tint)" stop-opacity="0" />
          <stop offset="1" stop-color="var(--projection-tint)" stop-opacity=".6" />
        </linearGradient>
      </defs>
      <polygon class="driver-projection__volume" :points="beam" fill="transparent" @pointerenter="event => { if (event.pointerType === 'mouse') emit('enter') }" @pointerleave="event => { if (event.pointerType === 'mouse') emit('leave') }" @click="emit('dismiss')" />
      <path class="driver-projection__tether" :d="tether" />
      <circle class="driver-projection__family-hub" :cx="hub.x" :cy="hub.y" r="2.5" />
      <path v-if="thread" class="driver-projection__thread" :stroke="`url(#${projectionId}-thread)`" :d="thread" />
      <circle v-if="activeAnchor" class="driver-projection__thread-end" :cx="activeAnchor.x" :cy="activeAnchor.y" r="2" />
      <ellipse :cx="source.x" :cy="source.y" rx="32" ry="14" :fill="`url(#${projectionId}-source)`" />
      <polygon v-if="sourceFrame" class="driver-projection__source-frame" :points="sourceFrame" />
      <ellipse class="driver-projection__source-ring" :cx="source.x" :cy="source.y" rx="10" ry="4" />
      <circle class="driver-projection__source" :cx="source.x" :cy="source.y" r="2" />
    </svg>
    <div class="driver-projection__choices" :style="{ left: `${left}px`, top: `${layout.top}px`, width: `${width}px`, '--driver-width': `${blockWidth}px`, '--driver-gap': `${layout.gap}px`, '--driver-height': `${layout.tileHeight}px`, '--driver-graphic-height': `${layout.graphicHeight}px` }" :aria-label="capability.exploreLabel || `${capability.label} drivers`" role="group"
      @pointerenter="event => { if (event.pointerType === 'mouse') emit('enter') }" @pointerleave="event => { if (event.pointerType === 'mouse') { leaveDriver(event); emit('leave') } }"
      @focusin="emit('focus')" @focusout="leaveFocus">
      <p class="driver-projection__title">{{ capability.label }} <span>{{ choices.length }} {{ capability.optionNoun || 'drivers' }}</span></p>
      <a v-for="(item, index) in choices" :key="item.id" :href="item.href" :target="/^https?:/.test(item.href) ? '_blank' : undefined" :rel="/^https?:/.test(item.href) ? 'noopener noreferrer' : undefined"
        class="driver-projection__block" :class="{ 'is-explored': activeDriver?.id === item.id }" :style="{ '--driver-color': projectionColor(item), '--driver-glyph': glyphColor(item), '--phase-delay': `${index * 22}ms` }" :aria-label="`${item.title}${/^https?:/.test(item.href) ? ' (opens in a new tab)' : ''}`" :data-driver="item.id"
        @pointerenter="event => { if (event.pointerType === 'mouse') exploreDriver(item, event.currentTarget) }" @focus="event => exploreDriver(item, event.currentTarget)">
        <svg viewBox="0 -4 100 100" aria-hidden="true">
          <path class="driver-projection__footprint" d="M50 72 89 94 50 116 11 94Z" transform="translate(0 24) scale(1 .65)" />
          <path class="driver-projection__footprint-edge" d="M11 85V89L50 111 89 89V85" transform="translate(0 24) scale(1 .65)" />
          <path class="driver-projection__face driver-projection__face--left" d="M8 30 50 54V84L8 60Z" />
          <path class="driver-projection__face driver-projection__face--right" d="M92 30 50 54V84L92 60Z" />
          <path class="driver-projection__face driver-projection__face--top" d="M50 6 92 30 50 54 8 30Z" />
          <path class="driver-projection__edge" d="M50 6 92 30V60L50 84 8 60V30ZM8 30 50 54 92 30M50 54V84" />
          <path class="driver-projection__light-slices" d="M8 44 50 68 92 44 M8 51 50 75 92 51" />
          <g class="driver-projection__icon" transform="matrix(.875 .5 0 1 29 57)">
            <svg x="-16" y="-10" width="32" height="20" :viewBox="iconViewBoxes[item.icon] || '0 0 24 24'" preserveAspectRatio="xMidYMid meet">
              <g :ref="element => { if (element) iconElements.set(item.icon, element) }" class="driver-projection__glyph">
                <g v-if="iconBody(item)" v-html="iconBody(item)" />
                <text v-else x="12" y="17" text-anchor="middle" font-size="13" font-weight="600">{{ label(item).slice(0, 2) }}</text>
              </g>
            </svg>
          </g>
        </svg>
        <span>{{ label(item) }}</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.driver-projection { position: absolute; inset: 0; pointer-events: none; z-index: 2; }
.driver-projection__beam { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.driver-projection__volume { pointer-events: auto; }
.driver-projection__tether { fill: none; stroke: var(--family-tint); stroke-width: .85; stroke-opacity: .28; stroke-dasharray: 2 5; }
.driver-projection__family-hub { fill: var(--family-tint); }
.driver-projection__thread { fill: none; stroke-width: 1.2; }
.driver-projection__thread-end, .driver-projection__source { fill: var(--projection-tint); }
.driver-projection__source-frame { fill: none; stroke: var(--projection-tint); stroke-width: 1; stroke-opacity: .70; }
.driver-projection__source-ring { fill: none; stroke: var(--projection-tint); stroke-width: 1; stroke-opacity: .85; }
.driver-projection__choices { position: absolute; display: flex; flex-wrap: wrap; justify-content: center; gap: 0 var(--driver-gap); pointer-events: auto; }
.driver-projection__title { flex-basis: 100%; height: 24px; display: flex; justify-content: space-between; padding: 0 7px 7px 18px; margin: 0; font: 12px/17px var(--gf-font-mono, monospace); color: var(--gf-ink-2, var(--vp-c-text-2)); }
.driver-projection__title span { color: var(--gf-ink-3, var(--vp-c-text-3)); }
.driver-projection__block { width: var(--driver-width); height: var(--driver-height); display: flex; flex-direction: column; align-items: center; position: relative; border-radius: 4px; color: var(--gf-ink, var(--vp-c-text-1)); }
.driver-projection__block > svg { display: block; width: min(76px, var(--driver-width)); height: var(--driver-graphic-height); overflow: visible; transition: transform .22s ease; animation: driver-phase .38s ease both; animation-delay: var(--phase-delay); }
.driver-projection__block span { font: 500 12px/18px var(--gf-font-mono, monospace); white-space: nowrap; }
.driver-projection__face { fill: var(--driver-color); transition: fill-opacity .18s ease; }
.driver-projection__face--left { fill-opacity: .56; }
.driver-projection__face--right { fill-opacity: .42; }
.driver-projection__face--top { fill-opacity: .31; }
.driver-projection__edge { fill: none; stroke: var(--driver-color); stroke-opacity: .85; stroke-width: 1.2; stroke-linejoin: round; }
.driver-projection__footprint { fill: var(--driver-color); fill-opacity: .05; stroke: var(--driver-color); stroke-width: .8; stroke-opacity: .3; }
.driver-projection__footprint-edge { fill: none; stroke: var(--driver-color); stroke-width: .8; stroke-opacity: .15; }
.driver-projection__light-slices { fill: none; stroke: #fff; stroke-width: .65; stroke-opacity: .10; }
.driver-projection__icon { color: var(--driver-glyph); fill: currentColor; }
.is-light .driver-projection__face--left { fill-opacity: .92; }
.is-light .driver-projection__face--right { fill-opacity: .82; }
.is-light .driver-projection__face--top { fill-opacity: .66; }
.driver-projection__block:hover > svg, .driver-projection__block:focus-visible > svg { transform: translateY(-3px); }
.driver-projection__block.is-explored .driver-projection__footprint { fill-opacity: .15; stroke-opacity: .75; }
.driver-projection__block.is-explored .driver-projection__footprint-edge { stroke-opacity: .5; }
.driver-projection__block:hover .driver-projection__face--left, .driver-projection__block:focus-visible .driver-projection__face--left { fill-opacity: .90; }
.driver-projection__block:hover .driver-projection__face--right, .driver-projection__block:focus-visible .driver-projection__face--right { fill-opacity: .75; }
.driver-projection__block:hover .driver-projection__face--top, .driver-projection__block:focus-visible .driver-projection__face--top { fill-opacity: .64; }
.driver-projection__block:focus-visible { outline: 2px solid var(--gf-accent, #ba4027); outline-offset: 3px; }
.is-static *, .is-static .driver-projection__block > svg { transition: none; }
.is-static .driver-projection__block > svg { animation: none; }
.is-static .driver-projection__block:hover > svg, .is-static .driver-projection__block:focus-visible > svg { transform: none; }
@keyframes driver-phase {
  from { opacity: 0; clip-path: inset(80% 0 0 0); }
  to { opacity: 1; clip-path: inset(-15% -10% -15% -10%); }
}
@media (hover: none) {
  .driver-projection__volume { pointer-events: none; }
}
</style>
