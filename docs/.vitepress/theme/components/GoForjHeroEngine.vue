<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
import GoForjDriverProjection from './GoForjDriverProjection.vue'
import { BUILDING_BLOCK_FAMILIES, driverProjectionLayout } from './goforj-hero-catalog.js'

const { isDark } = useData()
const canvasHost = ref(null)
const visualHost = ref(null)
const ready = ref(false)
const unavailable = ref(false)
const paused = ref(false)
const open = ref(false)
const hotspots = ref([])
const tools = ref([])
const revealed = ref(null)
const automaticReveal = ref(false)
const motionReduced = ref(false)
const motionEnabled = ref(true)
const journeyState = ref('waiting')
const revealedCapability = computed(() => hotspots.value.find(item => item.id === revealed.value))
const projectionSpace = computed(() => revealedCapability.value
  ? driverProjectionLayout(revealedCapability.value.canvasWidth, BUILDING_BLOCK_FAMILIES[revealed.value].length,
    revealedCapability.value.floatingProjection, revealedCapability.value.compactProjection).height : 0)
let scene = null
let disposed = false
let motionObserver = null
let motionQuery = null

// syncMotion honours the same live overrides as the production theme.
function syncMotion() {
  const override = document.documentElement.dataset.gfMotion
  motionReduced.value = override === 'reduced' || (override !== 'on' && motionQuery.matches)
  motionEnabled.value = !paused.value && !motionReduced.value
  scene?.setMotion(motionEnabled.value)
}

// hideProjection removes outgoing links from keyboard navigation as they phase away.
function hideProjection(element) {
  element.inert = true
  element.setAttribute('aria-hidden', 'true')
  if (revealed.value) element.style.transition = 'none'
}

// showProjection restores interaction when a pointer returns during the outgoing fade.
function showProjection(element) {
  element.inert = false
  element.removeAttribute('aria-hidden')
  element.style.transition = ''
}

watch(isDark, value => scene?.setTheme(value), { flush: 'post' })
watch(paused, syncMotion)
watch(open, value => scene?.setOpen(value))
watch(projectionSpace, value => scene?.setProjectionSpace(value), { flush: 'post' })

// keepRevealVisible lets a portrait catalog and its source chip stay together after the canvas grows.
async function keepRevealVisible(id) {
  if (!id || automaticReveal.value || window.innerWidth > 960) return
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  if (disposed || revealed.value !== id) return
  const bounds = visualHost.value.getBoundingClientRect()
  if (bounds.height <= window.innerHeight - 88 && (bounds.top < 76 || bounds.bottom > window.innerHeight - 12)) {
    visualHost.value.scrollIntoView({ block: 'nearest', behavior: 'instant' })
  }
}

watch(revealed, keepRevealVisible)

onMounted(async () => {
  try {
    const { createEngineScene } = await import('./goforj-engine-scene.js')
    if (disposed) return
    scene = createEngineScene(canvasHost.value, {
      dark: isDark.value,
      onReveal: (id, automatic) => { revealed.value = id; automaticReveal.value = automatic },
      onLayout: layout => { hotspots.value = layout },
      onToolsLayout: layout => { tools.value = layout },
      getProjectionBounds: () => visualHost.value.querySelector(`#engine-${revealed.value}-drivers .driver-projection__choices`)?.getBoundingClientRect() || null,
      onJourneyState: value => { journeyState.value = value }
    })
    motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    motionQuery.addEventListener('change', syncMotion)
    motionObserver = new MutationObserver(syncMotion)
    motionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-gf-motion'] })
    syncMotion()
    ready.value = true
  } catch (error) {
    unavailable.value = true
    console.error('The illustration could not initialise.', error)
  }
})

onBeforeUnmount(() => {
  disposed = true
  motionQuery?.removeEventListener('change', syncMotion)
  motionObserver?.disconnect()
  scene?.dispose()
})
</script>

<template>
  <main class="engine-study" :class="{ 'engine-study--motion-disabled': !motionEnabled }">
    <section class="engine-study__hero" aria-labelledby="engine-study-title">
      <div class="engine-study__copy">
        <p class="engine-study__eyebrow">For gophers and agents</p>
        <h1 id="engine-study-title">The composable<br>stack for<br><em>building with Go</em></h1>
        <p class="engine-study__lead">GoForj helps you build and ship Go apps fast, with quality and performance.</p>
        <div class="engine-study__actions">
          <a class="engine-study__primary" href="/getting-started/quickstart">Get started</a>
          <a class="engine-study__secondary" href="/libraries/">Explore libraries</a>
        </div>
        <p class="engine-study__foundation">Code you own <span>·</span> Local-first drivers <span>·</span> One app binary</p>
      </div>
      <div class="engine-study__art" @focusin="event => { if (!event.target.classList.contains('engine-study__hotspot')) scene?.takeControl() }">
        <div ref="visualHost" class="engine-study__visual" :data-journey-state="journeyState" :data-reveal-mode="automaticReveal ? 'automatic' : 'manual'" :style="{ '--driver-space': `${projectionSpace}px` }" @pointermove.capture="scene?.trackProjectionPointer($event)" @pointerleave="event => { if (event.pointerType === 'mouse') scene?.leaveResource() }">
        <div ref="canvasHost" class="engine-study__canvas" :class="{ 'is-ready': ready }" role="img" aria-label="Boxed modules await assembly beside a silver circuit board. Frontend choices, Atlas coding-agent support, and core libraries accompany six infrastructure modules beneath the illuminated GoForj mark. Explore a module to reveal its colored, clickable choices. One app container travels along the conveyor to Harbor, where a crane loads it onto Ship in a quiet berth. Lighthouse returns an inspection signal to the app. See the wiring exposes the infrastructure connections.">
          <p v-if="unavailable" class="engine-study__fallback">This illustration needs WebGL. Frontend, Atlas, libraries, and six infrastructure modules support one app, which travels through Harbor to Ship beside Lighthouse.</p>
        </div>
        <div class="engine-study__tool-labels" aria-hidden="true">
          <svg class="engine-study__tool-leaders" :viewBox="`0 0 ${hotspots[0]?.canvasWidth || 1} ${hotspots[0]?.canvasHeight || 1}`">
            <template v-for="tool in tools.filter(item => item.id === 'lighthouse')" :key="tool.id">
              <path :d="`M${tool.anchorLeft} ${tool.anchorTop} L${tool.left} ${tool.top + (tool.above ? -8 : 5)}`" />
              <circle :cx="tool.anchorLeft" :cy="tool.anchorTop" r="1.5" />
            </template>
          </svg>
          <span v-for="tool in tools" :key="tool.id" class="engine-study__tool-label" :class="{ 'is-above': tool.above, 'is-narrow': tool.narrow, 'is-compact': tool.compact }" :data-tool="tool.id" :style="{ left: `${tool.left}px`, top: `${tool.top}px` }">
            <strong>{{ tool.label }}</strong><span>{{ tool.copy }}</span>
          </span>
        </div>
        <div class="engine-study__hotspots" role="group" aria-label="Explore building blocks">
          <template v-for="item in hotspots" :key="item.id">
            <button class="engine-study__hotspot" :style="{ left: `${item.left}px`, top: `${item.top}px`, width: `${item.width}px`, height: `${item.height}px` }"
              :aria-label="item.exploreLabel || `Explore ${item.label} drivers`" :aria-expanded="revealed === item.id" :aria-controls="revealed === item.id ? `engine-${item.id}-drivers` : 'engine-driver-description'"
              @pointerenter="event => { if (event.pointerType === 'mouse') scene.hoverResource(item.id, event) }"
              @pointerleave="event => { if (event.pointerType === 'mouse') scene.leaveResource(event) }"
              @focus="event => { if (event.target.matches(':focus-visible')) scene.focusResource(item.id) }" @blur="scene.blurResource(item.id)"
              @click="scene.toggleResource(item.id)" @keydown.esc.prevent="scene.dismissResource()"></button>
            <Transition name="engine-projection" :css="motionEnabled" @before-enter="showProjection" @before-leave="hideProjection">
              <GoForjDriverProjection v-if="revealed === item.id" :capability="item" :choices="BUILDING_BLOCK_FAMILIES[item.id]" :motion="motionEnabled"
                @enter="scene.hoverResource(item.id)" @leave="scene.leaveResource()" @focus="scene.focusResource(item.id)" @blur="scene.blurResource(item.id)" @dismiss="scene.dismissResource()" @interact="scene.takeControl()" />
            </Transition>
          </template>
        </div>
        </div>
        <p id="engine-driver-description" class="engine-study__hint" :aria-live="automaticReveal ? 'off' : 'polite'" aria-atomic="true">
          <template v-if="revealedCapability"><strong>{{ revealedCapability.label }}</strong><span aria-hidden="true"> · </span>Explore the {{ revealedCapability.optionNoun || 'drivers' }}</template>
          <template v-else-if="open">Six capabilities, wired into one app.</template>
          <template v-else><span class="engine-study__hover-hint">Hover a block to explore</span><span class="engine-study__touch-hint">Tap a block to explore</span></template>
        </p>
        <div class="engine-study__controls" aria-label="Illustration controls" @pointerenter="scene?.takeControl()">
          <button :aria-pressed="open" :disabled="!ready" @click="open = !open">{{ open ? 'Close the engine' : 'See the wiring' }} <span aria-hidden="true">{{ open ? '−' : '+' }}</span></button>
          <button v-if="!motionReduced" :aria-pressed="paused" :disabled="!ready" @click="paused = !paused">{{ paused ? 'Resume motion' : 'Pause motion' }} <span aria-hidden="true">{{ paused ? '▷' : 'Ⅱ' }}</span></button>
        </div>
      </div>
    </section>
    <div class="engine-study__note">
      <slot />
    </div>
  </main>
</template>

<style scoped>
.engine-study {
  max-width: 1400px;
  margin: 0 auto;
  color: var(--gf-ink, var(--vp-c-text-1));
  font-family: var(--gf-font-sans, var(--vp-font-family-base));
}
.engine-study__hero {
  display: grid;
  grid-template-columns: 38% 62%;
  align-items: center;
  min-height: 620px;
  padding-left: 48px;
  border-bottom: 1px solid var(--gf-line, var(--vp-c-divider));
  overflow: hidden;
}
.engine-study__copy { position: relative; z-index: 1; padding: 30px 0 56px; }
.engine-study__eyebrow {
  color: var(--gf-accent, #ba4027);
  font: 11px var(--gf-font-mono, monospace);
  letter-spacing: .15em;
  text-transform: uppercase;
  margin: 0 0 26px;
}
.engine-study h1 {
  font-size: clamp(38px, 4.2vw, 64px);
  letter-spacing: -.048em;
  line-height: 1.13;
  font-weight: 650;
  margin: 0 0 27px;
}
.engine-study h1 em { color: var(--gf-accent, #ba4027); font-style: normal; }
.engine-study__lead { max-width: 440px; color: var(--gf-ink-2, var(--vp-c-text-2)); font-size: 19px; line-height: 1.6; margin: 0 0 25px; }
.engine-study__actions { display: flex; gap: 12px; }
.engine-study__actions a { display: inline-flex; align-items: center; min-height: 48px; padding: 10px 23px; border-radius: 6px; font-size: 14px; font-weight: 600; }
.engine-study__primary { background: var(--gf-accent, #ba4027); color: var(--gf-on-accent, #fff); }
.engine-study__secondary { border: 1px solid var(--gf-line, var(--vp-c-divider)); }
.engine-study__foundation { display: flex; gap: 12px; flex-wrap: wrap; color: var(--gf-ink-3, var(--vp-c-text-3)); font: 10px var(--gf-font-mono, monospace); margin-top: 25px; }
.engine-study__art { min-width: 0; align-self: stretch; display: flex; flex-direction: column; container: engine-art / inline-size; }
.engine-study__visual { position: relative; min-width: 0; flex: 1; scroll-margin-top: 76px; scroll-margin-bottom: 12px; }
.engine-study__tool-labels { position: absolute; inset: 0; pointer-events: none; }
.engine-study__tool-leaders { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; color: var(--gf-ink-3, var(--vp-c-text-3)); }
.engine-study__tool-leaders path { fill: none; stroke: currentColor; stroke-width: 1; opacity: .45; }
.engine-study__tool-leaders circle { fill: currentColor; opacity: .6; }
.engine-study__tool-label { position: absolute; display: flex; flex-direction: column; align-items: center; gap: 3px; transform: translate(-50%, 8px); white-space: nowrap; padding: 4px 6px; }
.engine-study__tool-label.is-above { transform: translate(-50%, calc(-100% - 8px)); }
.engine-study__tool-label.is-narrow { width: 96px; white-space: normal; text-align: center; }
.engine-study__tool-label.is-compact { width: 96px; white-space: normal; text-align: center; }
.engine-study__tool-label strong { font: 600 13px/16px var(--gf-font-mono, monospace); color: var(--gf-ink, var(--vp-c-text-1)); }
.engine-study__tool-label > span { font: 11px/15px var(--gf-font-mono, monospace); color: var(--gf-ink-2, var(--vp-c-text-2)); }
.engine-study__canvas { width: 100%; height: 750px; opacity: 0; transition: opacity .4s; }
.engine-study__canvas.is-ready { opacity: 1; }
.engine-study__canvas:has(.engine-study__fallback) { opacity: 1; display: grid; place-items: center; padding: 50px; }
.engine-study__canvas :deep(canvas) { display: block; width: 100%; height: 100%; touch-action: pan-y; }
.engine-study__hotspots { position: absolute; inset: 0; pointer-events: none; }
.engine-study__hotspot { position: absolute; z-index: 3; transform: translate(-50%, -50%); pointer-events: auto; border-radius: 8px; background: transparent; }
.engine-study__hint { margin: 7px 14px 0; min-height: 19px; text-align: center; color: var(--gf-ink, var(--vp-c-text-1)); font: 12px/19px var(--gf-font-mono, monospace); pointer-events: none; }
.engine-study__hint strong { font-weight: 500; color: var(--gf-ink-2, var(--vp-c-text-2)); }
.engine-study__touch-hint { display: none; }
.engine-projection-enter-active, .engine-projection-leave-active { transition: opacity .28s ease, transform .28s ease; }
.engine-projection-enter-from, .engine-projection-leave-to { opacity: 0; transform: translateY(4px); }
.engine-study--motion-disabled .engine-projection-enter-active, .engine-study--motion-disabled .engine-projection-leave-active { transition: none; }
@media (hover: none) {
  .engine-study__hover-hint { display: none; }
  .engine-study__touch-hint { display: inline; }
}
.engine-study__controls { display: flex; flex-wrap: wrap; justify-content: center; gap: 0 20px; margin: 10px 14px 18px; }
.engine-study__controls button { display: flex; gap: 15px; align-items: center; color: var(--gf-ink-2, var(--vp-c-text-2)); font: 10px var(--gf-font-mono, monospace); padding: 8px 0; border-bottom: 1px solid var(--gf-line, var(--vp-c-divider)); }
.engine-study__controls button:disabled { opacity: .5; }
.engine-study button { cursor: pointer; }
.engine-study button:focus-visible, .engine-study a:focus-visible { outline: 2px solid var(--gf-accent, #ba4027); outline-offset: 5px; }
.engine-study__note { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; padding: 27px 48px; font-size: 12px; line-height: 1.75; color: var(--gf-ink-3, var(--vp-c-text-3)); }
.engine-study__note :deep(p) { margin: 0; }
.engine-study__note :deep(h2) { font: 10px var(--gf-font-mono, monospace); letter-spacing: .1em; text-transform: uppercase; margin: 0 0 9px; color: var(--gf-ink-2, var(--vp-c-text-2)); }
.engine-study__note :deep(.header-anchor) { display: none; }
@container engine-art (min-width: 800px) {
  .engine-study__canvas { height: 620px; }
}
@media (max-width: 1100px) {
  .engine-study__hero { padding-left: 30px; }
  .engine-study__lead { font-size: 16px; }
  .engine-study__foundation { max-width: 320px; gap: 7px; line-height: 1.7; }
  .engine-study__note { padding-inline: 30px; }
}
@media (max-width: 960px) {
  .engine-study__hero { grid-template-columns: 1fr; padding: 0; }
  .engine-study__copy { padding: 34px 24px 0; }
  .engine-study h1 { font-size: clamp(40px, 7.5vw, 58px); }
  .engine-study__eyebrow { margin-bottom: 19px; }
  .engine-study__lead { max-width: 470px; margin-bottom: 22px; }
  .engine-study__foundation { margin-top: 20px; }
  .engine-study__hint { order: -1; margin: 12px 14px 4px; }
  .engine-study__canvas { height: calc(290px + 24vw); min-height: 365px; }
  .engine-study__visual:has(.driver-projection) .engine-study__canvas { height: calc(var(--driver-space) + 290px + 24vw); }
  .engine-study__hover-hint { display: none; }
  .engine-study__touch-hint { display: inline; }
  .engine-study__note { grid-template-columns: 1fr; gap: 21px; padding: 25px 24px; }
}
@media (max-width: 500px) {
  .engine-study__tool-label:not(.is-above) { transform: translate(-50%, 5px); }
  .engine-study__tool-label { padding: 3px 4px; gap: 1px; }
  .engine-study__tool-label strong { font-size: 11px; line-height: 15px; }
  .engine-study__tool-label > span { font-size: 10px; line-height: 14px; }
}
@media (max-width: 359px) {
  .engine-study__tool-label.is-compact { width: 82px; }
}
</style>
