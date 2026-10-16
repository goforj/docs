<script setup>
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { lucideIconBodies, simpleIconBodies } from 'virtual:goforj-icons'
import { BRAND_ICON_KEYS } from './goforj-hero-catalog.js'
import { FOUNDRY_AREAS, FOUNDRY_RESOURCES, FOUNDRY_CHOICES } from './goforj-foundry-catalog.js'

const props = defineProps({ standalone: { type: Boolean, default: true } })

const selected = ref('runtimes')
const hovered = ref(null)
const detailsVisible = ref(false)
const reduced = ref(false)
const environment = ref('local')
const hoveredDriver = ref(null)
const focusedDriver = ref(null)
const exploded = ref(false)
const paused = ref(false)
const installStatus = ref('')
const INSTALL_COMMAND = 'go install github.com/goforj/goforj/cmd/forj@latest'

// copyInstall keeps the landing page's quick start available beside its primary action.
async function copyInstall() {
  try {
    await navigator.clipboard.writeText(INSTALL_COMMAND)
    installStatus.value = 'Copied'
  } catch {
    installStatus.value = 'Select the command to copy it'
  }
}
const modules = [...FOUNDRY_AREAS, ...FOUNDRY_RESOURCES]
const active = computed(() => modules.find(item => item.id === selected.value))
const choices = computed(() => FOUNDRY_CHOICES[selected.value])
const driverPreview = computed(() => active.value.local
  ? hoveredDriver.value || focusedDriver.value || choices.value.find(choice => choice.id === active.value[`${environment.value}Driver`])
  : null)
// syncDriverPreview uses the catalog's existing identity and leaves documentation links intact.
function syncDriverPreview() {
  const choice = driverPreview.value
  scene?.setDriverPreview(selected.value, choice ? { ...choice,
    svg: simpleIconBodies[BRAND_ICON_KEYS[choice.icon] || choice.icon] || lucideIconBodies[choice.icon] || lucideIconBodies.database
  } : null)
}
const { isDark } = useData()
const canvasHost = ref(null)
const detailsHost = ref(null)
const exploreButton = ref(null)
const labels = ref([])
const unavailable = ref(false)
const sceneReady = ref(false)
let scene = null
let revealFrame = 0
let disposed = false
let motionQuery = null
let motionObserver = null

// revealDetails opens the inspector only after an intentional interaction.
function revealDetails() {
  detailsVisible.value = true
}
// toggleDetails keeps dismissal under the reader's control after the first reveal.
function toggleDetails() {
  detailsVisible.value = !detailsVisible.value
}
// selectPart reveals the explanation for a keyboard or touch selection.
function selectPart(id) {
  selected.value = id
  revealDetails()
}
// closeDetails restores the quiet illustration and returns keyboard focus to its discovery control.
function closeDetails() {
  detailsVisible.value = false
  hoveredDriver.value = null
  focusedDriver.value = null
  nextTick(() => exploreButton.value?.focus({ preventScroll: true }))
}

// syncMotion honours the site's live motion preference as well as the operating system.
function syncMotion() {
  const override = document.documentElement.dataset.gfMotion
  reduced.value = override === 'reduced' || (override !== 'on' && motionQuery.matches)
  scene?.setMotion(!reduced.value)
}
watch(isDark, value => scene?.setTheme(value), { flush: 'post' })
watch(selected, value => {
  hoveredDriver.value = null
  focusedDriver.value = null
  scene?.setSelected(value)
})
watch(environment, () => { hoveredDriver.value = null; focusedDriver.value = null })
watch([selected, driverPreview], syncDriverPreview, { flush: 'post' })
watch([detailsVisible, hovered], ([details, hover]) => scene?.setInspecting(details || Boolean(hover)))
watch(exploded, value => scene?.setOpen(value))
watch(paused, value => scene?.setPaused(value))
onMounted(async () => {
  try {
    const { createFoundryScene } = await import('./goforj-foundry-scene.js')
    if (disposed) return
    scene = createFoundryScene(canvasHost.value, {
      modules: FOUNDRY_AREAS, resources: FOUNDRY_RESOURCES, dark: isDark.value,
      onSelect: (id, explicit) => { if (explicit) selectPart(id); else if (!detailsVisible.value) selected.value = id },
      onHover: id => { hovered.value = id },
      onLabels: value => { labels.value = value },
      getInsets: () => ({ top: 28, bottom: 28, left: 12, right: 12, center: true })
    })
    scene.setSelected(selected.value)
    syncDriverPreview()
    motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    motionQuery.addEventListener('change', syncMotion)
    motionObserver = new MutationObserver(syncMotion)
    motionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-gf-motion'] })
    syncMotion()
    scene.setInspecting(detailsVisible.value || Boolean(hovered.value))
    // Reveal after the initialized scene has drawn, keeping the loading gap free of partial frames.
    revealFrame = requestAnimationFrame(() => { sceneReady.value = true })
  } catch (error) {
    unavailable.value = true
    sceneReady.value = true
    detailsVisible.value = true
    console.error('The foundry illustration could not initialize.', error)
  }
})
onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(revealFrame)
  motionQuery?.removeEventListener('change', syncMotion)
  motionObserver?.disconnect()
  scene?.dispose()
})
</script>

<template>
  <component :is="props.standalone ? 'main' : 'section'" class="foundry" :class="{ 'foundry--reduced': reduced, 'foundry--home': !props.standalone }">
    <section class="foundry__hero" aria-labelledby="foundry-title">
      <div class="foundry__sidebar">
      <header class="foundry__intro">
        <p class="foundry__eyebrow">For gophers and agents</p>
        <h1 id="foundry-title">The composable<br> stack for<br> <em>building with Go</em></h1>
        <p class="foundry__lead">Build and ship Go apps. <button class="foundry__atlas-link" aria-controls="foundry-details" @click="selectPart('atlas')">Atlas</button> equips your coding agents with project guidance, skills, and local context.</p>
        <div class="foundry__actions">
          <a href="/getting-started/quickstart" class="foundry__primary">Get started <span aria-hidden="true">↗</span></a>
          <a href="/libraries/">Explore libraries <span aria-hidden="true">→</span></a>
        </div>
        <div class="foundry__install"><span aria-hidden="true">$</span><code>{{ INSTALL_COMMAND }}</code><button @click="copyInstall" :aria-label="installStatus || 'Copy install command'">{{ installStatus === 'Copied' ? 'Copied' : 'Copy' }}</button></div>
        <span class="foundry__sr-only" role="status">{{ installStatus }}</span>
        <p class="foundry__principles">Code you own <i></i> Local-first drivers <i></i> One app binary</p>
      </header>

      </div>

      <div class="foundry__art">
        <section ref="detailsHost" id="foundry-details" class="foundry__details" :class="{ 'is-revealed': detailsVisible }" @keydown.esc.prevent.stop="closeDetails" :aria-hidden="!detailsVisible" :inert="!detailsVisible" aria-label="Explore the selected component" :style="{ '--detail-accent': driverPreview?.color || active.color }">
          <div class="foundry__inspector-heading"><button class="foundry__close" aria-label="Close component details" @click="closeDetails"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>

          <div class="foundry__detail-body">
            <div class="foundry__explanation">
              <div class="foundry__area-picker"><select v-model="selected" aria-label="Explore a framework area"><option v-for="item in FOUNDRY_AREAS" :key="item.id" :value="item.id">{{ item.sceneLabel || item.label }}</option><optgroup label="Infrastructure drivers"><option v-for="item in FOUNDRY_RESOURCES" :key="item.id" :value="item.id">{{ item.label }}</option></optgroup></select><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg></div>
              <h2 class="foundry__sr-only">{{ active.label }}</h2>
              <p aria-live="polite" aria-atomic="true">{{ active.copy }}</p>
              <div v-if="active.local" class="foundry__environment" role="group" aria-label="Example driver configuration"><button v-for="mode in ['local', 'production']" :key="mode" :aria-pressed="environment === mode" @click="environment = mode">{{ mode }}</button></div>
            </div>
            <div class="foundry__catalog">
              <div class="foundry__drivers">
                <component :is="choice.resource ? 'button' : 'a'" v-for="choice in choices" :key="choice.id" :href="choice.resource ? undefined : choice.href" :aria-label="choice.title" :class="{ 'is-previewed': active.local && driverPreview?.id === choice.id }" @pointerenter="active.local && $event.pointerType === 'mouse' && (hoveredDriver = choice)" @pointerleave="hoveredDriver = null" @focus="active.local && (focusedDriver = choice)" @blur="focusedDriver = null" @click="choice.resource && (selected = choice.id)"><svg viewBox="0 0 24 24" aria-hidden="true" :class="{ 'is-outline': !simpleIconBodies[BRAND_ICON_KEYS[choice.icon] || choice.icon] }" :style="{ color: `color-mix(in srgb, ${choice.color} 75%, var(--gf-ink))` }" v-html="simpleIconBodies[BRAND_ICON_KEYS[choice.icon] || choice.icon] || lucideIconBodies[choice.icon] || lucideIconBodies['database']"/><span>{{ choice.title.replace(` ${active.label}`, '') }}</span><span class="foundry__driver-arrow" aria-hidden="true">↗</span></component>
              </div>
              <button v-if="active.local" class="foundry__all-drivers" @click="selected = 'infrastructure'">← All infrastructure</button>
            </div>
          </div>
        </section>
        <button v-if="!detailsVisible" ref="exploreButton" class="foundry__discover" aria-controls="foundry-details" :aria-expanded="detailsVisible" @click="revealDetails">Explore the stack <span aria-hidden="true">+</span></button>
        <div class="foundry__world" :class="{ 'is-ready': sceneReady }" :inert="!sceneReady">
          <div ref="canvasHost" class="foundry__canvas" role="img" aria-label="The GoForj workbench connects frontend choices, Atlas coding agents, standalone libraries, application runtimes, infrastructure drivers, Lighthouse, developer tools, and auth to one app core."></div>
          <div class="foundry__labels" role="group" aria-label="Explore the workbench">
            <button v-for="label in labels" :key="label.id" :class="{ 'is-hovered': hovered === label.id }" :style="{ left: `${label.x}px`, top: `${label.y}px` }" :aria-pressed="selected === label.id" aria-controls="foundry-details" @pointerenter="hovered = label.id" @pointerleave="hovered = null" @focus="selected = label.id" @click="selectPart(label.id)"><i></i>{{ label.label }}</button>
          </div>
          <p v-if="unavailable" class="foundry__fallback">Frontend, Atlas, libraries, runtimes, infrastructure, Lighthouse, developer tools, and auth support one explicitly wired Go app.</p>
        </div>


        <div v-if="props.standalone" class="foundry__controls">
          <span>HOVER OR SELECT A PART TO EXPLORE</span>
          <button class="foundry__explore" :aria-expanded="detailsVisible" aria-controls="foundry-details" @click="toggleDetails">{{ detailsVisible ? 'Hide details −' : 'Explore details +' }}</button>
          <button :aria-pressed="exploded" @click="exploded = !exploded">{{ exploded ? 'Close assembly ↓' : 'Open assembly ↑' }}</button>
          <button :aria-pressed="paused" @click="paused = !paused">{{ paused ? 'Resume ▷' : 'Pause Ⅱ' }}</button>
        </div>
      </div>
    </section>
    <nav v-if="props.standalone" class="foundry__compare" aria-label="Compare illustrations"><span>THE WHOLE FRAMEWORK, EXPLICITLY CONNECTED</span><a href="/hero-original">Original ↗</a><a href="/hero-engine">Engine ↗</a><span aria-current="page">Foundry ●</span></nav>
  </component>
</template>

<style scoped>
.foundry { height:calc(100dvh - var(--vp-nav-height,64px)); max-width:1440px; margin:auto; display:grid; grid-template-rows:minmax(0,1fr) auto; color:var(--gf-ink); font-family:var(--gf-font-sans,var(--vp-font-family-base)); }
.foundry--home { grid-template-rows:minmax(0,1fr); }
.foundry__hero { min-height:0; display:grid; grid-template-columns:37% minmax(0,1fr); }
.foundry__sidebar { grid-column:1; min-width:0; display:flex; align-items:center; padding:30px 20px 30px 48px; }
.foundry__intro { min-width:0; }
.foundry__eyebrow { color:var(--gf-accent); font:10px var(--gf-font-mono,monospace); letter-spacing:.16em; text-transform:uppercase; margin:0 0 27px; }
.foundry h1 { font-size:clamp(40px,4vw,62px); font-weight:650; letter-spacing:-.055em; line-height:1.13; white-space:nowrap; margin:0 0 25px; }
.foundry h1 em { font-style:normal; color:var(--gf-accent-hi,var(--gf-accent)); }
.foundry__lead { max-width:420px; color:var(--gf-ink-2); font-size:17px; line-height:1.65; margin:0 0 26px; }
.foundry__atlas-link { display:inline; padding:0; border:0; background:none; color:var(--gf-ink); font:inherit; font-weight:550; text-decoration:underline; text-decoration-color:var(--gf-line); text-underline-offset:3px; }
.foundry__atlas-link:hover { text-decoration-color:var(--gf-accent); }
.foundry__actions { display:flex; gap:12px; }
.foundry__actions a { display:flex; align-items:center; gap:22px; padding:13px 18px; font-size:13px; font-weight:550; border:1px solid var(--gf-line); border-radius:5px; white-space:nowrap; }
.foundry__actions .foundry__primary { background:var(--gf-accent); color:var(--gf-on-accent,#fff); border-color:transparent; }
.foundry__install { display:flex; align-items:center; gap:10px; max-width:480px; padding:11px 12px; margin-top:17px; border:1px solid var(--gf-line); border-radius:5px; background:color-mix(in srgb,var(--gf-line) 20%,transparent); font:10px var(--gf-font-mono,monospace); }
.foundry__install > span { color:var(--gf-accent); }
.foundry__install code { min-width:0; overflow:auto; white-space:nowrap; color:var(--gf-ink-3); font:inherit; scrollbar-width:none; }
.foundry__install button { margin-left:auto; padding-left:10px; border-left:1px solid var(--gf-line); font-size:9px; color:var(--gf-ink-2); text-transform:uppercase; }
.foundry__principles { display:flex; align-items:center; flex-wrap:wrap; gap:9px; margin:24px 0 0; color:var(--gf-ink-3); font:9px var(--gf-font-mono,monospace); }
.foundry__principles i { width:3px; height:3px; border-radius:50%; background:var(--gf-ink-3); }
.foundry__sr-only { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); }
.foundry__art { grid-column:2; position:relative; min-height:0; min-width:0; display:grid; grid-template-rows:auto minmax(0,1fr) auto; padding-top:0; }
.foundry__world { grid-row:2; position:relative; min-height:0; overflow:clip; isolation:isolate; opacity:0; transition:opacity .65s ease-out; }
.foundry__world.is-ready { opacity:1; }
.foundry--reduced .foundry__world { transition:none; }
.foundry__world::before { content:''; position:absolute; z-index:-1; inset:5% 0; background:radial-gradient(ellipse,rgba(230,116,57,.08),transparent 68%); }
.foundry__canvas,.foundry__labels { position:absolute; inset:0; }
.foundry__canvas :deep(canvas) { display:block; width:100%; height:100%; touch-action:pan-y; }
.foundry__labels { pointer-events:none; }
.foundry__labels button { position:absolute; z-index:1; transform:translate(-50%,0); display:flex; align-items:center; gap:6px; white-space:nowrap; padding:7px 10px; pointer-events:auto; color:var(--gf-ink); background:var(--vp-c-bg); font:10px var(--gf-font-mono,monospace); border:1px solid var(--gf-line); border-radius:5px; opacity:0; transition:opacity .16s ease; box-shadow:0 3px 12px #0002; }
.foundry__labels button i { width:4px; height:4px; border-radius:50%; background:var(--gf-accent); }
.foundry__labels button:is(.is-hovered,:focus-visible) { opacity:1; }
.foundry__labels button:focus-visible { outline:2px solid var(--gf-accent); outline-offset:3px; }
.foundry__fallback { position:absolute; inset:30% 15%; color:var(--gf-ink-2); text-align:center; }
.foundry__discover { position:absolute; z-index:3; left:20px; top:20px; display:flex; align-items:center; gap:16px; padding:9px 12px; border:1px solid var(--gf-line); border-radius:6px; background:color-mix(in srgb,var(--vp-c-bg) 90%,transparent); color:var(--gf-ink-2); font:11px var(--gf-font-mono,monospace); }
.foundry__discover:hover { color:var(--gf-ink); border-color:var(--gf-accent); }
.foundry__discover span { color:var(--gf-accent); font-size:16px; }
.foundry__details { display:none; position:relative; z-index:1; max-width:none; min-width:0; margin:16px 20px 0; width:auto; padding:20px 44px 20px 20px; border:1px solid var(--gf-line); border-radius:6px; background:color-mix(in srgb,var(--vp-c-bg) 97%,transparent);  opacity:0; visibility:hidden; transform:translateY(5px); pointer-events:none; transition:opacity .18s ease,transform .18s ease,visibility .18s; }
.foundry__details.is-revealed { display:block; opacity:1; visibility:visible; transform:none; pointer-events:auto; }
.foundry--reduced .foundry__details { transition:none; }
.foundry__inspector-heading { position:absolute; top:10px; right:10px; }
.foundry__close { display:grid; place-items:center; width:32px; height:32px; margin:0; border-radius:4px; color:var(--gf-ink-2); }
.foundry__close:hover { background:var(--gf-line); color:var(--gf-ink); }
.foundry__close svg,.foundry__area-picker svg { width:18px; height:18px; fill:none; stroke:currentColor; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; }
.foundry__area-picker { position:relative; margin-bottom:12px; width:100%; }
.foundry__area-picker select { appearance:none; width:100%; padding:0 24px 0 0; border:0; background:transparent; color:var(--gf-ink); font:550 24px var(--gf-font-sans,var(--vp-font-family-base)); letter-spacing:-.03em; cursor:pointer; }
.foundry__area-picker option,.foundry__area-picker optgroup { color:var(--gf-ink); background:var(--vp-c-bg); font-size:13px; }
.foundry__area-picker svg { position:absolute; right:0; top:8px; pointer-events:none; color:var(--gf-ink-3); }
.foundry__detail-body { display:grid; grid-template-columns:minmax(0, .8fr) minmax(0, 1.2fr); gap:24px; align-items:start; }
.foundry__explanation p { font-size:15px; line-height:1.55; color:var(--gf-ink-2); margin:0; }
.foundry__environment { display:inline-flex; gap:3px; padding:2px; margin-top:10px; border:1px solid var(--gf-line); border-radius:4px; }
.foundry__environment button { font:12px var(--gf-font-mono,monospace); text-transform:capitalize; padding:6px 10px; border-radius:2px; color:var(--gf-ink-3); }
.foundry__environment button[aria-pressed='true'] { color:var(--gf-ink); background:var(--gf-line); }
.foundry__catalog { min-width:0; margin:0; padding:0; }
.foundry__all-drivers { margin-top:10px; color:var(--gf-ink-2); font-size:12px; }
.foundry__all-drivers:hover { color:var(--gf-accent); }
.foundry__drivers { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:2px 12px; align-content:start; }
.foundry__drivers :is(a,button) { min-width:0; min-height:36px; display:flex; align-items:center; gap:8px; padding:6px 3px; border:0; border-radius:3px; color:var(--gf-ink-2); font-size:14px; line-height:1.35; text-align:left; }
.foundry__drivers :is(a,button).is-previewed { background:color-mix(in srgb,var(--detail-accent) 9%,transparent); color:var(--gf-ink); }
.foundry__drivers :is(a,button):hover { background:color-mix(in srgb,var(--gf-line) 40%,transparent); color:var(--gf-ink); }
.foundry__drivers svg { flex:none; width:16px; height:16px; fill:currentColor; }
.foundry__drivers svg.is-outline { fill:none; stroke:currentColor; stroke-width:1.7; stroke-linecap:round; stroke-linejoin:round; }
.foundry__drivers :is(a,button) > span:first-of-type { min-width:0; overflow-wrap:normal; }
.foundry__driver-arrow { margin-left:auto; opacity:.5; font-size:12px; }
.foundry__controls { display:flex; align-items:center; justify-content:flex-end; gap:20px; padding:10px 25px 12px 15px; font:9px var(--gf-font-mono,monospace); color:var(--gf-ink-3); }
.foundry__controls > span { margin-right:auto; font-size:7px; letter-spacing:.05em; }
.foundry__controls button { padding:4px 0; font:inherit; white-space:nowrap; }
.foundry__controls .foundry__explore { color:var(--gf-ink-2); padding:6px 9px; border:1px solid var(--gf-line); border-radius:4px; }
.foundry__compare { display:flex; justify-content:flex-end; align-items:center; gap:22px; padding:12px 48px; border-top:1px solid var(--gf-line); color:var(--gf-ink-3); font:8px var(--gf-font-mono,monospace); }
.foundry__compare > span:first-child { margin-right:auto; font-size:7px; letter-spacing:.08em; }
.foundry__compare [aria-current] { color:var(--gf-accent); }
.foundry button:focus-visible,.foundry a:focus-visible { outline:2px solid var(--gf-accent); outline-offset:3px; }
@media (max-height:800px) and (min-width:801px) {
  .foundry h1 { font-size:clamp(38px,3.7vw,54px); margin-bottom:18px; }
  .foundry__eyebrow { margin-bottom:20px; }
  .foundry__lead { font-size:15px; margin-bottom:17px; }
  .foundry__principles { margin-top:20px; }
}
@media (max-width:1100px) and (min-width:801px) {
  .foundry__hero { grid-template-columns:38% minmax(0,1fr); }
  .foundry__sidebar { padding-left:28px; padding-right:12px; }
  .foundry h1 { font-size:clamp(28px,3.45vw,38px); }
  .foundry__actions { gap:8px; }
  .foundry__actions a { padding:11px 12px; gap:12px; font-size:12px; }
  .foundry__principles { font-size:8px; gap:5px; }
  .foundry__drivers { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .foundry__controls > span { display:none; }
}
@media (max-width:800px) {
  /* The stacked homepage follows its content instead of stretching across a portrait viewport. */
  .foundry--home,.foundry--home:has(.foundry__details.is-revealed) { height:auto; min-height:0; }
  .foundry--home .foundry__hero { grid-template-rows:auto auto; }
  .foundry--home .foundry__world { height:clamp(260px,70vw,480px); min-height:0; }
  .foundry__hero { grid-template-columns:minmax(0,1fr); grid-template-rows:auto minmax(0,1fr); }
  .foundry__sidebar { grid-column:1; grid-row:1; padding:16px 20px 0; align-self:start; }
  .foundry__eyebrow { font-size:7px; margin-bottom:8px; }
  .foundry h1 { font-size:27px; line-height:1.12; white-space:normal; margin-bottom:12px; max-width:520px; }
  .foundry h1 br { display:none; }
  .foundry__install,.foundry__principles { display:none; }
  .foundry__lead { font-size:12px; line-height:1.5; margin:0 0 14px; max-width:520px; }
  .foundry__actions { gap:9px; }
  .foundry__actions a { padding:8px 12px; font-size:10px; gap:14px; }
  .foundry__art { grid-column:1; grid-row:2; padding-top:0; grid-template-rows:auto minmax(0,1fr) auto; }
  .foundry__world { grid-row:2; }
  .foundry__discover { position:relative; grid-row:1; top:auto; left:auto; justify-self:start; margin:14px 20px 0; font-size:9px; }
  .foundry__details { width:auto; max-width:none; height:auto; margin:14px 20px 0; padding:16px; }
  .foundry:has(.foundry__details.is-revealed) { height:auto; min-height:calc(100dvh - var(--vp-nav-height,64px)); }
  .foundry__world { min-height:310px; }
  .foundry__detail-body { display:block; }
  .foundry__details.is-revealed { display:block; }
  .foundry__area-picker { margin-bottom:6px; width:calc(100% - 28px); }
  .foundry__area-picker select { font-size:22px; }
  .foundry__catalog { margin-top:10px; padding-top:10px; border-top:1px solid var(--gf-line); }
  .foundry__drivers { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .foundry__controls { grid-row:3; }
  .foundry__labels button { font-size:8px; padding:4px; }
  .foundry__labels button[aria-pressed='false'] { display:none; }
  .foundry__explanation p { font-size:14px; line-height:1.55; }
  .foundry__environment { margin-top:7px; }
  .foundry__drivers :is(a,button) { padding:7px 3px; gap:7px; font-size:13px; }
  .foundry__drivers svg { width:16px; height:16px; }
  .foundry__driver-arrow { display:none; }
  .foundry__controls { padding:7px 15px; gap:14px; font-size:9px; }
  .foundry__controls > span { display:none; }
  .foundry__compare { padding:9px 20px; gap:20px; font-size:7px; }
  .foundry__compare > span:first-child { display:none; }
}
</style>
