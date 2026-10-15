<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { lucideIconBodies, simpleIconBodies } from 'virtual:goforj-icons'
import { BRAND_ICON_KEYS } from './goforj-hero-catalog.js'
import { FOUNDRY_AREAS, FOUNDRY_RESOURCES, FOUNDRY_CHOICES } from './goforj-foundry-catalog.js'

const selected = ref('runtimes')
const detailsVisible = ref(false)
const reduced = ref(false)
let introFrame = 0
let introElapsed = 0
let introPrevious = 0
const environment = ref('local')
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
const { isDark } = useData()
const canvasHost = ref(null)
const detailsHost = ref(null)
const labels = ref([])
const unavailable = ref(false)
let scene = null
let disposed = false
let motionQuery = null
let motionObserver = null

// revealDetails lets an intentional selection skip the introductory pause.
function revealDetails() {
  cancelAnimationFrame(introFrame)
  detailsVisible.value = true
}
// toggleDetails keeps dismissal under the reader's control after the first reveal.
function toggleDetails() {
  cancelAnimationFrame(introFrame)
  detailsVisible.value = !detailsVisible.value
}
// selectPart reveals the explanation for a keyboard or touch selection.
function selectPart(id) {
  selected.value = id
  revealDetails()
}
// revealAfterIntro counts visible viewing time so background loading cannot consume the first impression.
function revealAfterIntro(time) {
  if (disposed || detailsVisible.value) return
  if (introPrevious && !document.hidden) introElapsed += Math.min(time - introPrevious, 100)
  introPrevious = time
  if (introElapsed >= 4000) {
    detailsVisible.value = true
    return
  }
  introFrame = requestAnimationFrame(revealAfterIntro)
}

// syncMotion honours the site's live motion preference as well as the operating system.
function syncMotion() {
  const override = document.documentElement.dataset.gfMotion
  reduced.value = override === 'reduced' || (override !== 'on' && motionQuery.matches)
  scene?.setMotion(!reduced.value)
}
watch(isDark, value => scene?.setTheme(value), { flush: 'post' })
watch(selected, value => scene?.setSelected(value))
watch(exploded, value => scene?.setOpen(value))
watch(paused, value => scene?.setPaused(value))
onMounted(async () => {
  try {
    const { createFoundryScene } = await import('./goforj-foundry-scene.js')
    if (disposed) return
    scene = createFoundryScene(canvasHost.value, {
      modules: FOUNDRY_AREAS, resources: FOUNDRY_RESOURCES, dark: isDark.value,
      onSelect: (id, explicit) => { selected.value = id; if (explicit) revealDetails() },
      onLabels: value => { labels.value = value },
      getInsets: () => ({
        top: Math.max(0, detailsHost.value.getBoundingClientRect().bottom - canvasHost.value.getBoundingClientRect().top + 10),
        bottom: 26, left: 12, right: 12
      })
    })
    scene.setSelected(selected.value)
    motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    motionQuery.addEventListener('change', syncMotion)
    motionObserver = new MutationObserver(syncMotion)
    motionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-gf-motion'] })
    syncMotion()
    introFrame = requestAnimationFrame(revealAfterIntro)
  } catch (error) {
    unavailable.value = true
    detailsVisible.value = true
    console.error('The foundry illustration could not initialize.', error)
  }
})
onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(introFrame)
  motionQuery?.removeEventListener('change', syncMotion)
  motionObserver?.disconnect()
  scene?.dispose()
})
</script>

<template>
  <main class="foundry" :class="{ 'foundry--reduced': reduced }">
    <section class="foundry__hero" aria-labelledby="foundry-title">
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

      <div class="foundry__art">
        <div class="foundry__world">
          <div ref="canvasHost" class="foundry__canvas" role="img" aria-label="The GoForj workbench connects frontend choices, Atlas coding agents, standalone libraries, application runtimes, infrastructure drivers, Lighthouse, developer tools, and auth to one app core."></div>
          <div class="foundry__labels" role="group" aria-label="Explore the workbench">
            <button v-for="label in labels" :key="label.id" :style="{ left: `${label.x}px`, top: `${label.y}px` }" :aria-pressed="selected === label.id" aria-controls="foundry-details" @click="selectPart(label.id)"><i></i>{{ label.label }}</button>
          </div>
          <p v-if="unavailable" class="foundry__fallback">Frontend, Atlas, libraries, runtimes, infrastructure, Lighthouse, developer tools, and auth support one explicitly wired Go app.</p>
        </div>

        <section ref="detailsHost" id="foundry-details" class="foundry__details" :class="{ 'is-revealed': detailsVisible }" :aria-hidden="!detailsVisible" :inert="!detailsVisible" aria-label="Explore the selected component" :style="{ '--detail-accent': active.color }">
          <nav class="foundry__tabs" aria-label="Framework areas">
            <button v-for="item in FOUNDRY_AREAS" :key="item.id" :aria-pressed="selected === item.id || (item.id === 'infrastructure' && active.local !== undefined)" @click="selected = item.id"><i :style="{ background: item.color }"></i>{{ item.label }}</button>
          </nav>
          <div class="foundry__detail-body">
            <div class="foundry__explanation" aria-live="polite" aria-atomic="true">
              <div class="foundry__detail-title"><h2>{{ active.label }}</h2><span v-if="active.local" class="foundry__driver-value">{{ active[environment] }}</span></div>
              <p>{{ active.copy }}</p>
              <div v-if="active.local" class="foundry__environment" role="group" aria-label="Example driver configuration"><button v-for="mode in ['local', 'production']" :key="mode" :aria-pressed="environment === mode" @click="environment = mode">{{ mode }}</button></div>
            </div>
            <div class="foundry__catalog">
              <div class="foundry__driver-heading"><span>{{ active.noun || 'EXPLORE DRIVERS' }}</span><button v-if="active.local" @click="selected = 'infrastructure'">← All infrastructure</button><span v-else>{{ choices.length }} choices</span></div>
              <div class="foundry__drivers">
                <component :is="choice.resource ? 'button' : 'a'" v-for="choice in choices" :key="choice.id" :href="choice.resource ? undefined : choice.href" :aria-label="choice.title" @click="choice.resource && (selected = choice.id)"><svg viewBox="0 0 24 24" aria-hidden="true" :style="{ color: choice.color }" v-html="simpleIconBodies[BRAND_ICON_KEYS[choice.icon] || choice.icon] || lucideIconBodies[choice.icon] || lucideIconBodies['database']"/><span>{{ choice.title.replace(` ${active.label}`, '') }}</span><span class="foundry__driver-arrow" aria-hidden="true">↗</span></component>
              </div>
            </div>
          </div>
        </section>
        <div class="foundry__controls">
          <span>HOVER OR SELECT A PART TO EXPLORE</span>
          <button class="foundry__explore" :aria-expanded="detailsVisible" aria-controls="foundry-details" @click="toggleDetails">{{ detailsVisible ? 'Hide details −' : 'Explore details +' }}</button>
          <button :aria-pressed="exploded" @click="exploded = !exploded">{{ exploded ? 'Close assembly ↓' : 'Open assembly ↑' }}</button>
          <button :aria-pressed="paused" @click="paused = !paused">{{ paused ? 'Resume ▷' : 'Pause Ⅱ' }}</button>
        </div>
      </div>
    </section>
    <nav class="foundry__compare" aria-label="Compare illustrations"><span>THE WHOLE FRAMEWORK, EXPLICITLY CONNECTED</span><a href="/">Original ↗</a><a href="/hero-engine">Engine ↗</a><span aria-current="page">Foundry ●</span></nav>
  </main>
</template>

<style scoped>
.foundry { height:calc(100dvh - var(--vp-nav-height,64px)); max-width:1440px; margin:auto; display:grid; grid-template-rows:minmax(0,1fr) auto; color:var(--gf-ink); font-family:var(--gf-font-sans,var(--vp-font-family-base)); }
.foundry__hero { min-height:0; display:grid; grid-template-columns:37% minmax(0,1fr); }
.foundry__intro { align-self:center; min-width:0; padding:30px 20px 30px 48px; }
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
.foundry__art { position:relative; min-height:0; min-width:0; display:grid; grid-template-rows:minmax(0,1fr) auto; padding-top:0; }
.foundry__world { position:relative; min-height:0; overflow:clip; isolation:isolate; }
.foundry__world::before { content:''; position:absolute; z-index:-1; inset:5% 0; background:radial-gradient(ellipse,rgba(230,116,57,.08),transparent 68%); }
.foundry__canvas,.foundry__labels { position:absolute; inset:0; }
.foundry__canvas :deep(canvas) { display:block; width:100%; height:100%; touch-action:pan-y; }
.foundry__labels { pointer-events:none; }
.foundry__labels button { position:absolute; transform:translate(-50%,0); display:flex; align-items:center; gap:5px; white-space:nowrap; padding:5px 7px; pointer-events:auto; color:var(--gf-ink-2); font:9px var(--gf-font-mono,monospace); border:1px solid transparent; border-radius:3px; }
.foundry__labels button i { width:3px; height:3px; border-radius:50%; background:var(--gf-ink-3); }
.foundry__labels button[aria-pressed='true'] { color:var(--gf-ink); background:var(--vp-c-bg); border-color:var(--gf-line); }
.foundry__labels button[aria-pressed='true'] i { background:var(--gf-accent); }
.foundry__fallback { position:absolute; inset:30% 15%; color:var(--gf-ink-2); text-align:center; }
.foundry__details { position:absolute; z-index:3; top:12px; left:18px; right:24px; height:148px; min-width:0; margin:0; padding:0 0 8px; border-bottom:1px solid var(--gf-line); background:linear-gradient(var(--vp-c-bg),color-mix(in srgb,var(--vp-c-bg) 94%,transparent) 78%,transparent); }
.foundry__details { opacity:0; visibility:hidden; transform:translateY(-5px); pointer-events:none; transition:opacity .55s ease,transform .55s ease,visibility .55s; }
.foundry__details.is-revealed { opacity:1; visibility:visible; transform:none; pointer-events:auto; }
.foundry--reduced .foundry__details { transition:none; }
.foundry__tabs { display:flex; align-items:center; justify-content:space-between; gap:10px; border-bottom:1px solid var(--gf-line); }
.foundry__tabs button { display:flex; align-items:center; gap:5px; padding:8px 0; color:var(--gf-ink-3); border-bottom:1px solid transparent; margin-bottom:-1px; font:9px var(--gf-font-mono,monospace); white-space:nowrap; }
.foundry__tabs button i { width:4px; height:4px; border-radius:1px; }
.foundry__tabs button[aria-pressed='true'] { color:var(--gf-ink); border-bottom-color:var(--detail-accent); }
.foundry__detail-body { display:grid; grid-template-columns:minmax(0,.85fr) minmax(0,1.3fr); gap:24px; min-height:0; padding-top:10px; }
.foundry__detail-title { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:6px; }
.foundry__explanation h2 { font-size:20px; font-weight:550; letter-spacing:-.035em; line-height:1.2; margin:0; }
.foundry__explanation p { font-size:12px; line-height:1.45; color:var(--gf-ink-2); margin:0; }
.foundry__driver-value { font:9px var(--gf-font-mono,monospace); color:var(--gf-ink-3); white-space:nowrap; }
.foundry__environment { display:inline-flex; gap:3px; padding:2px; margin-top:10px; border:1px solid var(--gf-line); border-radius:3px; }
.foundry__environment button { font:8px var(--gf-font-mono,monospace); text-transform:capitalize; padding:4px 6px; border-radius:2px; color:var(--gf-ink-3); }
.foundry__environment button[aria-pressed='true'] { color:var(--gf-ink); background:var(--gf-line); }
.foundry__catalog { min-width:0; }
.foundry__driver-heading { display:flex; align-items:center; justify-content:space-between; gap:8px; margin:0 0 7px; color:var(--gf-ink-3); font:7px var(--gf-font-mono,monospace); letter-spacing:.05em; }
.foundry__driver-heading button { color:var(--gf-accent); letter-spacing:0; font-size:8px; }
.foundry__drivers { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:5px; align-content:start; }
.foundry__drivers :is(a,button) { min-width:0; display:flex; align-items:center; gap:6px; padding:5px 7px; border:1px solid var(--gf-line); border-radius:3px; color:var(--gf-ink-2); font-size:10px; line-height:1.3; text-align:left; }
.foundry__drivers :is(a,button):hover { border-color:var(--detail-accent); color:var(--gf-ink); }
.foundry__drivers svg { flex:none; width:12px; height:12px; fill:currentColor; }
.foundry__drivers :is(a,button) > span:first-of-type { min-width:0; overflow-wrap:anywhere; }
.foundry__driver-arrow { margin-left:auto; opacity:.35; font-size:9px; }
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
  .foundry__detail-body { min-height:0; padding-top:10px; gap:18px; }
  .foundry__details { height:144px; padding-bottom:8px; }
  .foundry__explanation p { font-size:11px; line-height:1.5; }
  .foundry__drivers :is(a,button) { font-size:9px; padding:5px 6px; }
}
@media (max-width:1100px) and (min-width:801px) {
  .foundry__hero { grid-template-columns:38% minmax(0,1fr); }
  .foundry__intro { padding-left:28px; padding-right:12px; }
  .foundry h1 { font-size:clamp(28px,3.45vw,38px); }
  .foundry__actions { gap:8px; }
  .foundry__actions a { padding:11px 12px; gap:12px; font-size:12px; }
  .foundry__principles { font-size:8px; gap:5px; }
  .foundry__details { left:10px; right:16px; height:174px; }
  .foundry__tabs { gap:7px; flex-wrap:wrap; justify-content:flex-start; }
  .foundry__tabs button { font-size:8px; padding-top:8px; padding-bottom:7px; }
  .foundry__detail-body { grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr); gap:12px; }
  .foundry__drivers { grid-template-columns:repeat(3,minmax(0,1fr)); }
  .foundry__controls > span { display:none; }
}
@media (max-width:800px) {
  .foundry__hero { grid-template-columns:minmax(0,1fr); grid-template-rows:auto minmax(0,1fr); }
  .foundry__intro { padding:16px 20px 0; align-self:start; }
  .foundry__eyebrow { font-size:7px; margin-bottom:8px; }
  .foundry h1 { font-size:27px; line-height:1.12; white-space:normal; margin-bottom:12px; max-width:520px; }
  .foundry h1 br { display:none; }
  .foundry__install,.foundry__principles { display:none; }
  .foundry__lead { font-size:12px; line-height:1.5; margin:0 0 14px; max-width:520px; }
  .foundry__actions { gap:9px; }
  .foundry__actions a { padding:8px 12px; font-size:10px; gap:14px; }
  .foundry__art { padding-top:0; grid-template-rows:216px minmax(0,1fr) auto; }
  .foundry__world { grid-row:2; }
  .foundry__labels button { font-size:8px; padding:4px; }
  .foundry__labels button[aria-pressed='false'] { display:none; }
  .foundry__details { position:relative; grid-row:1; top:auto; left:auto; right:auto; height:216px; margin:0 14px; padding:0 0 10px; }
  .foundry__tabs { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:0 8px; }
  .foundry__tabs button { justify-content:center; font-size:8px; padding:8px 0; gap:4px; }
  .foundry__detail-body { grid-template-columns:minmax(0,.9fr) minmax(0,1.25fr); gap:12px; padding-top:12px; min-height:0; }
  .foundry__detail-title { margin-bottom:5px; }
  .foundry__explanation h2 { font-size:18px; }
  .foundry__explanation p { font-size:10px; line-height:1.45; }
  .foundry__environment { margin-top:7px; }
  .foundry__driver-heading { margin:0 0 7px; font-size:6px; }
  .foundry__drivers { grid-template-columns:repeat(2,minmax(0,1fr)); gap:4px; }
  .foundry__drivers :is(a,button) { padding:5px 4px; gap:4px; font-size:8px; }
  .foundry__drivers svg { width:10px; height:10px; }
  .foundry__driver-arrow { display:none; }
  .foundry__controls { padding:7px 15px; gap:14px; font-size:9px; }
  .foundry__controls > span { display:none; }
  .foundry__compare { padding:9px 20px; gap:20px; font-size:7px; }
  .foundry__compare > span:first-child { display:none; }
}
</style>
