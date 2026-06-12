<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

// A replayed real first run, captured 2026-06-11 (goforj-landing-demo log,
// project photodrop, Vue starter kit, full default components). Output lines
// are verbatim from the capture, with these curation choices for pane width:
// the wizard confirm panel is condensed to its Project / Starter kit /
// Components rows, compose progress is shown as its final "[+] up 12/12",
// the VictoriaMetrics link and the HTTP server line's host/port tail are
// omitted, and the Queue worker line keeps driver and workers fields only.
// To refresh from a new capture, update LINES. `cmd` lines are typed
// character by character; `out` lines appear after their delay (ms).
const LINES = [
  { type: 'cmd', text: 'forj new', pause: 700 },
  { type: 'out', delay: 800, parts: [{ c: '', t: 'Project ' }, { c: 't-dim', t: '» ' }, { c: '', t: 'photodrop' }] },
  { type: 'out', delay: 420, parts: [{ c: '', t: 'Starter kit ' }, { c: 't-dim', t: '» ' }, { c: '', t: 'Vue' }] },
  { type: 'out', delay: 420, parts: [{ c: '', t: 'Components ' }, { c: 't-dim', t: '» ' }, { c: '', t: 'CLI, Docker, Mail, Auth, OAuth, Web API, Web UI, Metrics, Observability, Grafana, Database (MySQL), Scheduler, Jobs' }] },
  { type: 'out', delay: 1300, parts: [{ c: 't-ok', t: '✔' }, { c: '', t: ' Project render complete ' }, { c: 't-dim', t: '(created: 736, skipped: 0)' }] },
  { type: 'out', delay: 650, parts: [] },
  { type: 'cmd', text: 'cd photodrop && forj dev', pause: 600 },
  { type: 'out', delay: 1100, parts: [{ c: 't-ok', t: '✔' }, { c: '', t: ' 4/4 go build' }] },
  { type: 'out', delay: 300, parts: [{ c: 't-dim', t: '  Built app in 2s' }] },
  { type: 'out', delay: 500, parts: [{ c: 't-dim', t: '· ' }, { c: '', t: 'Running pre-dev setup' }] },
  { type: 'out', delay: 950, parts: [{ c: 't-dim', t: '[+] ' }, { c: '', t: 'up ' }, { c: 't-ok', t: '12/12' }] },
  { type: 'out', delay: 800, parts: [{ c: 't-ok', t: '✔' }, { c: '', t: ' migrations complete ' }, { c: 't-dim', t: '(7)' }] },
  { type: 'out', delay: 700, parts: [{ c: 't-ok', t: '✔' }, { c: '', t: ' Dev ready' }] },
  { type: 'out', delay: 240, parts: [{ c: '', t: '  ' }, { c: 't-ok', t: '→' }, { c: '', t: ' App: ' }, { c: 't-hl', t: 'http://localhost:3000' }] },
  { type: 'out', delay: 220, parts: [{ c: '', t: '  ' }, { c: 't-ok', t: '→' }, { c: '', t: ' Lighthouse: ' }, { c: 't-hl', t: 'http://localhost:3000/lighthouse' }] },
  { type: 'out', delay: 220, parts: [{ c: '', t: '  ' }, { c: 't-ok', t: '→' }, { c: '', t: ' Swagger: ' }, { c: 't-hl', t: 'http://localhost:3000/swagger' }] },
  { type: 'out', delay: 220, parts: [{ c: '', t: '  ' }, { c: 't-ok', t: '→' }, { c: '', t: ' Mailpit (inbox): ' }, { c: 't-hl', t: 'http://localhost:8025' }] },
  { type: 'out', delay: 220, parts: [{ c: '', t: '  ' }, { c: 't-ok', t: '→' }, { c: '', t: ' Grafana (admin / admin): ' }, { c: 't-hl', t: 'http://localhost:13001' }] },
  { type: 'out', delay: 420, parts: [{ c: 't-dim', t: '23:51:32.257 ' }, { c: 't-step', t: 'HTTP' }, { c: '', t: '       Starting HTTP server ' }, { c: 't-dim', t: '→ addr=0.0.0.0:3000' }] },
  { type: 'out', delay: 260, parts: [{ c: 't-dim', t: '23:51:32.256 ' }, { c: 't-step', t: 'Jobs' }, { c: '', t: '       Queue worker started ' }, { c: 't-dim', t: '→ driver=redis · workers=30' }] },
  { type: 'out', delay: 260, parts: [{ c: 't-dim', t: '23:51:32.256 ' }, { c: 't-step', t: 'Scheduler' }, { c: '', t: '  Scheduler started' }] },
  { type: 'out', delay: 700, parts: [] },
  { type: 'cmd', text: 'curl localhost:3000/-/health', pause: 500 },
  { type: 'out', delay: 500, parts: [{ c: 't-json', t: '{"status":"ok"}' }] }
]

const TYPE_MS = 26
const LOOP_PAUSE_MS = 4600

// SSR and reduced-motion render the full transcript statically.
const visibleCount = ref(LINES.length)
const typingIndex = ref(-1)
const typedChars = ref(0)
const bodyEl = ref(null)
const minHeight = ref('')

let generation = 0
let timers = []

function motionAllowed() {
  if (typeof window === 'undefined') return false
  const override = document.documentElement.dataset.gfMotion
  if (override === 'on') return true
  if (override === 'reduced') return false
  return !(typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
}

function sleep(ms) {
  return new Promise((resolve) => {
    timers.push(window.setTimeout(resolve, ms))
  })
}

async function play(gen) {
  while (gen === generation) {
    visibleCount.value = 0
    typingIndex.value = -1
    typedChars.value = 0
    await sleep(450)
    for (let i = 0; i < LINES.length; i++) {
      if (gen !== generation) return
      const line = LINES[i]
      if (line.type === 'cmd') {
        typingIndex.value = i
        typedChars.value = 0
        visibleCount.value = i + 1
        await sleep(320)
        for (let ch = 0; ch < line.text.length; ch++) {
          if (gen !== generation) return
          typedChars.value = ch + 1
          await sleep(TYPE_MS)
        }
        await sleep(line.pause)
        typingIndex.value = -1
      } else {
        await sleep(line.delay)
        visibleCount.value = i + 1
      }
    }
    await sleep(LOOP_PAUSE_MS)
  }
}

onMounted(() => {
  if (!motionAllowed()) return
  // Reserve the full height before clearing so replay never shifts layout.
  if (bodyEl.value) minHeight.value = `${bodyEl.value.offsetHeight}px`

  const start = () => {
    generation += 1
    play(generation)
  }

  if (typeof IntersectionObserver === 'undefined') {
    start()
    return
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      start()
    })
  }, { threshold: 0.3 })
  if (bodyEl.value) observer.observe(bodyEl.value)
  timers.push(window.setTimeout(() => {}, 0))
  onBeforeUnmount(() => observer.disconnect())
})

onBeforeUnmount(() => {
  generation += 1
  timers.forEach((id) => window.clearTimeout(id))
  timers = []
})

function typedText(line, index) {
  if (typingIndex.value === index) return line.text.slice(0, typedChars.value)
  return line.text
}

function caretOn(index) {
  if (typingIndex.value >= 0) return typingIndex.value === index
  return visibleCount.value > 0 && index === visibleCount.value - 1 && index === LINES.length - 1
}
</script>

<template>
  <div class="gf-home-terminal gf-live-terminal" role="img" aria-label="Creating and running a GoForj App: forj new renders the project, forj dev builds and serves it with App, Lighthouse, and Swagger links, and the health endpoint answers with status ok">
    <div class="gf-home-terminal__bar"><span></span><span></span><span></span><em>photodrop · first run</em></div>
    <pre class="gf-home-terminal__body" ref="bodyEl" :style="minHeight ? { minHeight } : undefined"><code><div
      v-for="(line, i) in LINES"
      v-show="i < visibleCount"
      :key="i"
      class="gf-live-terminal__row"
    ><template v-if="line.type === 'cmd'"><span class="t-prompt">$ </span><span class="t-cmd">{{ typedText(line, i) }}</span></template><template v-else><span v-for="(part, j) in line.parts" :key="j" :class="part.c || undefined">{{ part.t }}</span></template><span v-if="caretOn(i)" class="t-cursor"></span></div></code></pre>
  </div>
</template>

<style scoped>
.gf-live-terminal__row {
  min-height: 1.25em;
  white-space: pre-wrap;
}
</style>
