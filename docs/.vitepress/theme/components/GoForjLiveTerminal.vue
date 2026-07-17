<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

// A replayed real first run, captured 2026-06-11 (goforj-landing-demo log,
// project photodrop, Vue starter kit, full default components). Output lines
// are verbatim from the capture, with these curation choices for pane width:
// the wizard confirm panel is condensed to its Project / Starter kit /
// Components rows, compose progress is shown as its final "[+] up 12/12",
// the VictoriaMetrics link and the HTTP server line's host/port tail are
// omitted, and the Queue worker line keeps driver and workers fields only.
// To refresh from a new capture, update LINES. Commands type character by
// character, while each command's captured result appears as one block.
const LINES = [
  { type: 'cmd', text: 'forj new', pause: 100, resultPause: 1300 },
  { type: 'out', parts: [{ c: '', t: 'Project ' }, { c: 't-dim', t: '» ' }, { c: '', t: 'photodrop' }] },
  { type: 'out', parts: [{ c: '', t: 'Starter kit ' }, { c: 't-dim', t: '» ' }, { c: '', t: 'Vue' }] },
  { type: 'out', parts: [{ c: '', t: 'Components ' }, { c: 't-dim', t: '» ' }, { c: '', t: 'CLI, Docker, Mail, Auth, OAuth, Web API, Web UI, Metrics, Observability, Grafana, Database (MySQL), Scheduler, Jobs' }] },
  { type: 'out', parts: [{ c: 't-ok', t: '✔' }, { c: '', t: ' Project render complete ' }, { c: 't-dim', t: '(created: 736, skipped: 0)' }] },
  { type: 'out', parts: [] },
  { type: 'cmd', text: 'cd photodrop && forj dev', pause: 100, resultPause: 1800 },
  { type: 'out', parts: [{ c: 't-ok', t: '✔' }, { c: '', t: ' 4/4 go build' }] },
  { type: 'out', parts: [{ c: 't-dim', t: '  Built app in 2s' }] },
  { type: 'out', parts: [{ c: 't-dim', t: '· ' }, { c: '', t: 'Running pre-dev setup' }] },
  { type: 'out', parts: [{ c: 't-dim', t: '[+] ' }, { c: '', t: 'up ' }, { c: 't-ok', t: '12/12' }] },
  { type: 'out', parts: [{ c: 't-ok', t: '✔' }, { c: '', t: ' migrations complete ' }, { c: 't-dim', t: '(7)' }] },
  { type: 'out', parts: [{ c: 't-ok', t: '✔' }, { c: '', t: ' Dev ready' }] },
  { type: 'out', parts: [{ c: '', t: '  ' }, { c: 't-ok', t: '→' }, { c: '', t: ' App: ' }, { c: 't-hl', t: 'http://localhost:3000' }] },
  { type: 'out', parts: [{ c: '', t: '  ' }, { c: 't-ok', t: '→' }, { c: '', t: ' Lighthouse: ' }, { c: 't-hl', t: 'http://localhost:3000/lighthouse' }] },
  { type: 'out', parts: [{ c: '', t: '  ' }, { c: 't-ok', t: '→' }, { c: '', t: ' Swagger: ' }, { c: 't-hl', t: 'http://localhost:3000/swagger' }] },
  { type: 'out', parts: [{ c: '', t: '  ' }, { c: 't-ok', t: '→' }, { c: '', t: ' Mailpit (inbox): ' }, { c: 't-hl', t: 'http://localhost:8025' }] },
  { type: 'out', parts: [{ c: '', t: '  ' }, { c: 't-ok', t: '→' }, { c: '', t: ' Grafana (admin / admin): ' }, { c: 't-hl', t: 'http://localhost:13001' }] },
  { type: 'out', parts: [{ c: 't-dim', t: '23:51:32.257 ' }, { c: 't-step', t: 'HTTP' }, { c: '', t: '       Starting HTTP server ' }, { c: 't-dim', t: '→ addr=0.0.0.0:3000' }] },
  { type: 'out', parts: [{ c: 't-dim', t: '23:51:32.256 ' }, { c: 't-step', t: 'Jobs' }, { c: '', t: '       Queue worker started ' }, { c: 't-dim', t: '→ driver=redis · workers=30' }] },
  { type: 'out', parts: [{ c: 't-dim', t: '23:51:32.256 ' }, { c: 't-step', t: 'Scheduler' }, { c: '', t: '  Scheduler started' }] },
  { type: 'out', parts: [] },
  { type: 'cmd', text: 'curl localhost:3000/-/health', pause: 100, resultPause: 0 },
  { type: 'out', parts: [{ c: 't-json', t: '{"status":"ok"}' }] }
]

const TYPE_MS = 18

// SSR and reduced-motion render the full transcript statically.
const visibleCount = ref(LINES.length)
const typingIndex = ref(-1)
const typedChars = ref(0)
const bodyEl = ref(null)
const isPlaying = ref(false)

let generation = 0
let observer = null
let timerID = null
let finishWait = null
let hasStarted = false

function motionAllowed() {
  if (typeof window === 'undefined') return false
  const override = document.documentElement.dataset.gfMotion
  if (override === 'on') return true
  if (override === 'reduced') return false
  return !(typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
}

function wait(ms) {
  return new Promise((resolve) => {
    const finish = () => {
      timerID = null
      finishWait = null
      resolve()
    }
    finishWait = finish
    timerID = window.setTimeout(finish, ms)
  })
}

function clearWait() {
  if (timerID !== null) window.clearTimeout(timerID)
  if (finishWait) finishWait()
}

function settle() {
  visibleCount.value = LINES.length
  typingIndex.value = -1
  typedChars.value = 0
  isPlaying.value = false
}

function stop({ settleTranscript = true } = {}) {
  generation += 1
  clearWait()
  if (settleTranscript) settle()
  else isPlaying.value = false
}

async function play(gen) {
  visibleCount.value = 0
  typingIndex.value = -1
  typedChars.value = 0
  isPlaying.value = true

  await wait(220)
  for (let i = 0; i < LINES.length; i++) {
    if (gen !== generation) return
    const line = LINES[i]
    if (line.type === 'cmd') {
      typingIndex.value = i
      typedChars.value = 0
      visibleCount.value = i + 1
      await wait(140)
      for (let ch = 0; ch < line.text.length; ch++) {
        if (gen !== generation) return
        typedChars.value = ch + 1
        await wait(TYPE_MS)
      }
      if (gen !== generation) return
      await wait(line.pause)
      typingIndex.value = -1

      let resultEnd = i
      while (resultEnd + 1 < LINES.length && LINES[resultEnd + 1].type === 'out') {
        resultEnd += 1
      }
      visibleCount.value = resultEnd + 1
      await wait(line.resultPause)
      i = resultEnd
    }
  }

  if (gen !== generation) return
  settle()
  observer?.disconnect()
}

function start() {
  if (hasStarted) return
  hasStarted = true
  generation += 1
  void play(generation)
}

function stopWhenHidden() {
  if (document.hidden && isPlaying.value) {
    stop()
    observer?.disconnect()
  }
}

onMounted(() => {
  if (!motionAllowed()) return

  // The SSR transcript stays useful without JavaScript, but animated clients
  // must hide it before intersection so readers never see the payoff first.
  visibleCount.value = 0
  document.addEventListener('visibilitychange', stopWhenHidden)
  if (typeof IntersectionObserver === 'undefined') {
    start()
    return
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) start()
      else if (isPlaying.value) {
        stop()
        observer?.disconnect()
      }
    })
  }, { threshold: 0.3 })
  if (bodyEl.value) observer.observe(bodyEl.value)
})

onBeforeUnmount(() => {
  stop({ settleTranscript: false })
  observer?.disconnect()
  document.removeEventListener('visibilitychange', stopWhenHidden)
})

function typedText(line, index) {
  if (typingIndex.value === index) return line.text.slice(0, typedChars.value)
  return line.text
}

function caretOn(index) {
  return isPlaying.value && typingIndex.value === index
}
</script>

<template>
  <div class="gf-home-terminal gf-live-terminal" role="img" aria-label="Captured GoForj first run: forj new renders the photodrop Project with the Vue starter kit and full default components; forj dev builds the App, starts its services and HTTP, Jobs, and Scheduler runtimes, and exposes App, Lighthouse, Swagger, Mailpit, and Grafana links; the health endpoint responds with status ok">
    <div class="gf-home-terminal__bar"><span></span><span></span><span></span><em>photodrop · first run</em></div>
    <pre class="gf-home-terminal__body" ref="bodyEl"><code><div
      v-for="(line, i) in LINES"
      :key="i"
      class="gf-live-terminal__row"
      :class="{ 'is-pending': i >= visibleCount }"
    ><template v-if="line.type === 'cmd'"><span class="t-prompt">$ </span><span class="t-cmd">{{ typedText(line, i) }}</span></template><template v-else><span v-for="(part, j) in line.parts" :key="j" :class="part.c || undefined">{{ part.t }}</span></template><span v-if="caretOn(i)" class="t-cursor"></span></div></code></pre>
  </div>
</template>

<style scoped>
.gf-live-terminal__row {
  min-height: 1.25em;
  white-space: pre-wrap;
}

.gf-live-terminal__row.is-pending {
  visibility: hidden;
}
</style>
