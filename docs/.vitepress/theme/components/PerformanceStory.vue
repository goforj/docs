<script setup>
import { computed, ref } from 'vue'
import performance from '../../data/performance-stats.json'

const selectedDriverStoryID = ref('cache')
const selectedWebScenarioID = ref('path_param_json')

const kindOrder = { process: 0, local: 1, service: 2 }
const driverStory = computed(() => performance.driverStories.find((story) => story.id === selectedDriverStoryID.value))
const driverRows = computed(() => [...driverStory.value.rows].sort((left, right) => {
  const kindDifference = kindOrder[left.kind] - kindOrder[right.kind]
  return kindDifference || left.value - right.value
}))
const webScenario = computed(() => performance.web.scenarios.find((scenario) => scenario.id === selectedWebScenarioID.value))
const webRows = computed(() => [...webScenario.value.rows].sort((left, right) => right.throughput - left.throughput))
const goforjWeb = computed(() => webScenario.value.rows.find((row) => row.framework === 'goforj_web'))
const highlight = (library) => performance.highlights.find((item) => item.library === library)

const driverWidth = (value) => {
  const values = driverRows.value.map((row) => row.value)
  const minimum = Math.log10(Math.min(...values))
  const maximum = Math.log10(Math.max(...values))
  if (maximum === minimum) return 100
  return 8 + ((Math.log10(value) - minimum) / (maximum - minimum)) * 92
}

const webWidth = (value) => value / Math.max(...webRows.value.map((row) => row.throughput)) * 100
const formatLatency = (value) => {
  if (value < 1_000) return `${Number(value.toFixed(value < 100 ? 0 : 1))} ns`
  if (value < 1_000_000) return `${Number((value / 1_000).toFixed(value < 10_000 ? 1 : 0))} µs`
  return `${Number((value / 1_000_000).toFixed(value < 10_000_000 ? 2 : 1))} ms`
}
const formatRate = (value) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`
  return Math.round(value).toLocaleString()
}
const formatHighlight = (item) => item.unit === 'ops/s' ? formatRate(item.value) : formatLatency(item.value).replace(' ', '')
const kindLabel = (kind) => ({ process: 'In process', local: 'Local durable', service: 'Service-backed' })[kind]
const scenarioLabel = (id) => ({
  live_plain_text: 'HTTP loopback',
  static_text: 'Static response',
  path_param_json: 'Path + JSON',
  middleware_chain: 'Middleware chain'
})[id]
const libraryLink = (repo) => `/${repo === 'str' ? 'strings' : repo}`
</script>

<template>
  <main class="gf-performance-page">
    <section class="gf-performance-hero">
      <div class="gf-performance-hero__copy">
        <p class="gf-performance-eyebrow">Measured performance</p>
        <h1>Fast enough to <em>disappear.</em></h1>
        <p class="gf-performance-lede">
          GoForj keeps local work close to your code. Cache reads, job dispatch, event delivery,
          and HTTP routing stay in the nanosecond range until your architecture asks for a network,
          durable storage, or another process.
        </p>
        <div class="gf-performance-actions">
          <a href="#driver-physics">Compare drivers</a>
          <a href="#methodology">Read the methodology</a>
        </div>
      </div>

      <div class="gf-performance-radar" aria-label="Selected GoForj benchmark results">
        <div class="gf-performance-radar__grid" aria-hidden="true"></div>
        <div class="gf-performance-radar__core">
          <span>{{ highlight('Cache').label }}</span>
          <strong>{{ formatHighlight(highlight('Cache')).replace('ns', '') }}<small>ns</small></strong>
        </div>
        <div class="gf-performance-radar__node gf-performance-radar__node--queue">
          <span>Queue</span><strong>{{ formatLatency(highlight('Queue').value) }}</strong>
        </div>
        <div class="gf-performance-radar__node gf-performance-radar__node--events">
          <span>Events</span><strong>{{ formatLatency(highlight('Events').value) }}</strong>
        </div>
        <div class="gf-performance-radar__node gf-performance-radar__node--web">
          <span>Web</span><strong>{{ formatRate(highlight('Web').value) }}/s</strong>
        </div>
        <div class="gf-performance-radar__sweep" aria-hidden="true"></div>
      </div>
    </section>

    <section class="gf-performance-proof" aria-label="Benchmark evidence summary">
      <div><strong>{{ performance.totals.benchmarks }}</strong><span>benchmark functions</span></div>
      <div><strong>{{ performance.totals.libraries }}</strong><span>first-party libraries inspected</span></div>
      <div><strong>{{ performance.sources.length }}</strong><span>committed benchmark datasets</span></div>
      <div><strong>JSON</strong><span>source-backed, checked at build time</span></div>
    </section>

    <section class="gf-performance-section gf-performance-local">
      <header class="gf-performance-section__header">
        <p class="gf-performance-eyebrow">The local fast path</p>
        <h2>Your development loop should feel immediate.</h2>
        <p>
          Local drivers avoid a network hop without replacing the library contract. Start with an
          in-process queue, memory cache, or synchronous event bus. Move to shared infrastructure
          when the workload needs coordination or durability.
        </p>
      </header>

      <div class="gf-performance-highlights">
        <article v-for="item in performance.highlights" :key="item.library">
          <div class="gf-performance-highlights__beam" aria-hidden="true"></div>
          <p>{{ item.library }}</p>
          <strong>{{ formatHighlight(item) }}</strong>
          <span>{{ item.label }}</span>
          <small>{{ item.unit }}</small>
        </article>
      </div>
    </section>

    <section id="driver-physics" class="gf-performance-section gf-performance-drivers">
      <div class="gf-performance-drivers__intro">
        <div>
          <p class="gf-performance-eyebrow">One API. Different physics.</p>
          <h2>Choose the semantics. See the cost.</h2>
        </div>
        <p>
          These logarithmic charts compare the same operation inside each library. The distance is
          the story: an in-process driver is nearly free, while production-capable drivers pay for
          transport, serialization, durability, or coordination.
        </p>
      </div>

      <div class="gf-performance-tabs" role="tablist" aria-label="Driver benchmark suites">
        <button
          v-for="story in performance.driverStories"
          :key="story.id"
          type="button"
          role="tab"
          :aria-selected="selectedDriverStoryID === story.id"
          :class="{ 'is-active': selectedDriverStoryID === story.id }"
          @click="selectedDriverStoryID = story.id"
        >
          {{ story.title }}
        </button>
      </div>

      <div class="gf-performance-chart">
        <div class="gf-performance-chart__topline">
          <div>
            <span>{{ driverStory.operation }}</span>
            <strong>{{ driverStory.title }}</strong>
          </div>
          <div class="gf-performance-legend" aria-label="Driver types">
            <span class="is-process">In process</span>
            <span class="is-local">Local durable</span>
            <span class="is-service">Service-backed</span>
          </div>
        </div>

        <div class="gf-performance-driver-rows">
          <div v-for="row in driverRows" :key="row.label" class="gf-performance-driver-row">
            <div class="gf-performance-driver-row__label">
              <strong>{{ row.label }}</strong>
              <span>{{ kindLabel(row.kind) }}</span>
            </div>
            <div class="gf-performance-driver-row__track">
              <span
                class="gf-performance-driver-row__bar"
                :class="`is-${row.kind}`"
                :style="{ width: `${driverWidth(row.value)}%` }"
              ></span>
            </div>
            <strong class="gf-performance-driver-row__value">{{ formatLatency(row.value) }}</strong>
          </div>
        </div>
        <p class="gf-performance-chart__scale">Logarithmic latency scale · lower is faster</p>
      </div>
    </section>

    <section class="gf-performance-section gf-performance-web">
      <div class="gf-performance-web__copy">
        <p class="gf-performance-eyebrow">HTTP without the tax</p>
        <h2>Routing overhead stays out of your way.</h2>
        <p>
          The shared <code>net/http</code> suite measures complete route and handler dispatch. On
          the path-and-JSON case, GoForj Web clears <strong>{{ formatRate(goforjWeb.throughput) }}</strong>
          operations per second with <strong>{{ goforjWeb.allocs }}</strong> allocations per operation.
        </p>
        <p class="gf-performance-web__note">
          Each value is the median of {{ performance.web.metadata.sample_count }} samples at
          {{ performance.web.metadata.benchmark_time }} with GOMAXPROCS={{ performance.web.metadata.gomaxprocs }}.
          This is an in-process ceiling, not a production capacity forecast.
        </p>
      </div>

      <div class="gf-performance-web__panel">
        <div class="gf-performance-tabs gf-performance-tabs--compact" role="tablist" aria-label="HTTP benchmark scenarios">
          <button
            v-for="scenario in performance.web.scenarios"
            :key="scenario.id"
            type="button"
            role="tab"
            :aria-selected="selectedWebScenarioID === scenario.id"
            :class="{ 'is-active': selectedWebScenarioID === scenario.id }"
            @click="selectedWebScenarioID = scenario.id"
          >
            {{ scenarioLabel(scenario.id) }}
          </button>
        </div>

        <div class="gf-performance-web-rows">
          <div
            v-for="row in webRows"
            :key="row.framework"
            class="gf-performance-web-row"
            :class="{ 'is-goforj': row.framework === 'goforj_web' }"
          >
            <div><strong>{{ row.label }}</strong><span>{{ row.allocs }} allocs/op</span></div>
            <div class="gf-performance-web-row__track">
              <span :style="{ width: `${webWidth(row.throughput)}%` }"></span>
            </div>
            <strong>{{ formatRate(row.throughput) }}/s</strong>
          </div>
        </div>
      </div>
    </section>

    <section id="methodology" class="gf-performance-section gf-performance-methodology">
      <div class="gf-performance-methodology__copy">
        <p class="gf-performance-eyebrow">Read the receipts</p>
        <h2>The numbers are committed, not typed into this page.</h2>
        <p>
          Library benchmark suites emit JSON. The docs normalize those files into the charts above,
          record their source revisions and hashes, and reject stale output during the docs build.
        </p>
        <p>
          Service-backed rows generally run against local containers or emulators. They are useful
          for comparing driver overhead under controlled conditions. Real production latency also
          includes your network, topology, service configuration, contention, and payloads.
        </p>
      </div>

      <div class="gf-performance-sources">
        <a
          v-for="source in performance.sources"
          :key="source.repo"
          :href="`https://github.com/goforj/${source.repo}/blob/${source.revision}/${source.path}`"
          target="_blank"
          rel="noreferrer noopener"
        >
          <span>{{ source.repo }}</span>
          <strong>benchmark JSON</strong>
          <small>{{ source.revision.slice(0, 8) }} ↗</small>
        </a>
      </div>

      <div class="gf-performance-library-strip">
        <span>Benchmark functions in source</span>
        <div>
          <a v-for="library in performance.benchmarkLibraries" :key="library.repo" :href="libraryLink(library.repo)">
            {{ library.repo }} <small>{{ library.benchmarks }}</small>
          </a>
        </div>
      </div>
    </section>

    <section class="gf-performance-closing">
      <p class="gf-performance-eyebrow">Start local. Scale deliberately.</p>
      <h2>Keep the App shape.<br>Swap the physics.</h2>
      <p>
        GoForj drivers let you optimize for a fast local loop today and choose shared,
        durable infrastructure when the system actually needs it.
      </p>
      <div class="gf-performance-actions gf-performance-actions--center">
        <a href="/drivers">Explore the driver catalog</a>
        <a href="/getting-started/quickstart">Build an App</a>
      </div>
    </section>
  </main>
</template>

<style scoped>
:global(.VPDoc:has(.gf-performance-page)) {
  padding: 0 !important;
}

:global(.VPDoc:has(.gf-performance-page) .container),
:global(.VPDoc:has(.gf-performance-page) .content),
:global(.VPDoc:has(.gf-performance-page) .content-container),
:global(.VPDoc:has(.gf-performance-page) .main),
:global(.VPDoc:has(.gf-performance-page) .vp-doc) {
  width: 100% !important;
  max-width: none !important;
}

:global(.VPDoc:has(.gf-performance-page) .container),
:global(.VPDoc:has(.gf-performance-page) .content) {
  padding: 0 !important;
}

:global(.VPDoc .content-container:has(.gf-performance-page) .VPDocFooter) {
  display: none;
}

.gf-performance-page {
  --perf-coral: #ff6a3d;
  --perf-gold: #ffc24d;
  --perf-mint: #73e2c4;
  --perf-violet: #b7a4ff;
  --perf-cyan: #67c7ff;
  --perf-faint: rgba(255, 255, 255, 0.06);
  --perf-panel: rgba(14, 12, 16, 0.65);
  --perf-track: rgba(255, 255, 255, 0.045);
  width: 100%;
  overflow: hidden;
  color: var(--gf-ink);
  background:
    radial-gradient(1000px 760px at 92% 5%, rgba(255, 106, 61, 0.14), transparent 72%),
    radial-gradient(1100px 780px at 5% 42%, rgba(103, 199, 255, 0.09), transparent 72%),
    radial-gradient(1200px 800px at 85% 72%, rgba(183, 164, 255, 0.10), transparent 74%),
    var(--gf-ground-deep);
}

:global(html:not(.dark) .gf-performance-page) {
  --perf-faint: rgba(12, 10, 14, 0.07);
  --perf-panel: rgba(255, 255, 255, 0.66);
  --perf-track: rgba(12, 10, 14, 0.065);
}

.gf-performance-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(520px, 1.1fr);
  gap: clamp(30px, 6vw, 110px);
  align-items: center;
  min-height: calc(100vh - var(--vp-nav-height));
  padding: clamp(70px, 8vw, 132px) clamp(28px, 7vw, 132px);
}

.gf-performance-hero::before {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(255, 130, 87, 0.028) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 130, 87, 0.024) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(180deg, #000, transparent 92%);
  content: "";
  pointer-events: none;
}

.gf-performance-hero > * {
  position: relative;
  z-index: 1;
}

.gf-performance-eyebrow {
  margin: 0 0 16px;
  color: var(--gf-accent-hi);
  font-size: 0.76rem;
  font-weight: 850;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.gf-performance-hero h1,
.gf-performance-section h2,
.gf-performance-closing h2 {
  margin: 0;
  border: 0;
  padding: 0;
  color: var(--gf-ink);
  letter-spacing: -0.06em;
}

.gf-performance-hero h1 {
  max-width: 820px;
  font-size: clamp(4.25rem, 7.3vw, 8.6rem);
  line-height: 0.9;
}

.gf-performance-hero h1 em {
  color: var(--perf-coral);
  font-style: normal;
}

.gf-performance-lede {
  max-width: 690px;
  margin: 30px 0 0;
  color: var(--gf-ink-2);
  font-size: clamp(1.02rem, 1.35vw, 1.2rem);
  line-height: 1.72;
}

.gf-performance-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 13px;
  margin-top: 34px;
}

.gf-performance-actions a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 21px;
  border: 1px solid rgba(255, 194, 77, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.045);
  color: var(--gf-ink);
  font-weight: 800;
  text-decoration: none !important;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}

.gf-performance-actions a:first-child {
  border-color: rgba(255, 130, 87, 0.78);
  background: linear-gradient(180deg, #ff7048, #d53b21);
  box-shadow: 0 18px 46px rgba(214, 53, 26, 0.22);
}

.gf-performance-actions a:hover {
  transform: translateY(-2px);
  border-color: var(--perf-gold);
}

.gf-performance-radar {
  position: relative;
  aspect-ratio: 1;
  width: min(100%, 720px);
  margin: auto;
  border: 1px solid rgba(255, 130, 87, 0.17);
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(255, 106, 61, 0.13) 0 1px, transparent 2px),
    radial-gradient(circle, transparent 0 24%, var(--perf-faint) 24.2% 24.5%, transparent 24.8% 49%, var(--perf-faint) 49.2% 49.5%, transparent 49.8% 74%, var(--perf-faint) 74.2% 74.5%, transparent 74.8%),
    var(--gf-code-well);
  background-size: 18px 18px, 100% 100%, 100% 100%;
  box-shadow: inset 0 0 100px rgba(255, 106, 61, 0.06), 0 40px 120px rgba(0, 0, 0, 0.22);
}

.gf-performance-radar__grid {
  position: absolute;
  inset: 8%;
  border: 1px solid var(--perf-faint);
  border-radius: 50%;
}

.gf-performance-radar__grid::before,
.gf-performance-radar__grid::after {
  position: absolute;
  background: var(--perf-faint);
  content: "";
}

.gf-performance-radar__grid::before { top: 50%; left: 0; width: 100%; height: 1px; }
.gf-performance-radar__grid::after { top: 0; left: 50%; width: 1px; height: 100%; }

.gf-performance-radar__sweep {
  position: absolute;
  inset: 8%;
  overflow: hidden;
  border-radius: 50%;
  animation: gf-performance-sweep 8s linear infinite;
}

.gf-performance-radar__sweep::before {
  position: absolute;
  inset: 0 50% 50% 0;
  background: conic-gradient(from 270deg at 100% 100%, transparent 0deg, rgba(255, 106, 61, 0.18) 52deg, transparent 54deg);
  content: "";
  transform-origin: 100% 100%;
}

.gf-performance-radar__core {
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 50%;
  display: grid;
  width: 38%;
  aspect-ratio: 1;
  place-content: center;
  border: 1px solid rgba(255, 130, 87, 0.44);
  border-radius: 50%;
  background: radial-gradient(circle at 50% 38%, rgba(255, 106, 61, 0.28), var(--gf-code-well) 68%);
  box-shadow: 0 0 80px rgba(255, 106, 61, 0.18), inset 0 1px rgba(255, 255, 255, 0.08);
  text-align: center;
  transform: translate(-50%, -50%);
}

.gf-performance-radar__core span,
.gf-performance-radar__node span {
  color: var(--gf-ink-2);
  font-size: 0.72rem;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.gf-performance-radar__core strong {
  color: var(--gf-ink);
  font-size: clamp(2.8rem, 5vw, 5.8rem);
  letter-spacing: -0.08em;
  line-height: 0.95;
}

.gf-performance-radar__core small {
  margin-left: 4px;
  color: var(--perf-coral);
  font-size: 0.34em;
  letter-spacing: -0.03em;
}

.gf-performance-radar__node {
  position: absolute;
  z-index: 4;
  display: grid;
  gap: 2px;
  min-width: 112px;
  padding: 11px 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 7px;
  background: var(--gf-code-chrome);
  box-shadow: 0 14px 42px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(14px);
}

.gf-performance-radar__node strong { color: var(--gf-ink); font-size: 1rem; }
.gf-performance-radar__node--queue { top: 16%; right: 4%; border-color: rgba(103, 199, 255, 0.38); }
.gf-performance-radar__node--events { right: 0; bottom: 22%; border-color: rgba(183, 164, 255, 0.42); }
.gf-performance-radar__node--web { bottom: 6%; left: 10%; border-color: rgba(115, 226, 196, 0.4); }

.gf-performance-proof {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid rgba(166, 156, 176, 0.2);
  border-bottom: 1px solid rgba(166, 156, 176, 0.2);
  background: rgba(255, 255, 255, 0.022);
}

.gf-performance-proof > div {
  display: grid;
  gap: 5px;
  padding: 28px clamp(18px, 3vw, 44px);
  border-right: 1px solid rgba(166, 156, 176, 0.16);
}

.gf-performance-proof > div:last-child { border-right: 0; }
.gf-performance-proof strong { color: var(--gf-ink); font-size: clamp(1.7rem, 2.8vw, 2.8rem); letter-spacing: -0.045em; }
.gf-performance-proof span { color: var(--gf-ink-2); font-size: 0.8rem; }

.gf-performance-section,
.gf-performance-closing {
  padding: clamp(72px, 9vw, 140px) clamp(28px, 7vw, 132px);
  border-bottom: 1px solid rgba(166, 156, 176, 0.18);
}

.gf-performance-section h2,
.gf-performance-closing h2 {
  max-width: 940px;
  font-size: clamp(2.8rem, 5.4vw, 6.4rem);
  line-height: 0.96;
}

.gf-performance-section__header > p:last-child,
.gf-performance-drivers__intro > p,
.gf-performance-web__copy > p,
.gf-performance-methodology__copy > p,
.gf-performance-closing > p:not(.gf-performance-eyebrow) {
  max-width: 720px;
  margin: 24px 0 0;
  color: var(--gf-ink-2);
  font-size: 1.04rem;
  line-height: 1.72;
}

.gf-performance-highlights {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 15px;
  margin-top: 54px;
}

.gf-performance-highlights article {
  position: relative;
  display: grid;
  min-height: 250px;
  overflow: hidden;
  padding: clamp(22px, 2.8vw, 34px);
  border: 1px solid rgba(166, 156, 176, 0.2);
  border-radius: 10px;
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.065), rgba(255, 255, 255, 0.018));
}

.gf-performance-highlights__beam {
  position: absolute;
  right: -30%;
  bottom: -50%;
  width: 110%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 106, 61, 0.18), transparent 68%);
}

.gf-performance-highlights article:nth-child(2) .gf-performance-highlights__beam { background: radial-gradient(circle, rgba(103, 199, 255, 0.16), transparent 68%); }
.gf-performance-highlights article:nth-child(3) .gf-performance-highlights__beam { background: radial-gradient(circle, rgba(183, 164, 255, 0.17), transparent 68%); }
.gf-performance-highlights article:nth-child(4) .gf-performance-highlights__beam { background: radial-gradient(circle, rgba(115, 226, 196, 0.17), transparent 68%); }
.gf-performance-highlights p { position: relative; margin: 0; color: var(--gf-ink-2); font-size: 0.78rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
.gf-performance-highlights strong { position: relative; align-self: end; color: var(--gf-ink); font-size: clamp(2.7rem, 4vw, 5rem); letter-spacing: -0.075em; line-height: 1; }
.gf-performance-highlights span { position: relative; margin-top: 12px; color: var(--gf-ink); font-weight: 750; }
.gf-performance-highlights small { position: relative; margin-top: 4px; color: var(--gf-ink-2); }

.gf-performance-drivers { background: rgba(255, 255, 255, 0.012); }
.gf-performance-drivers__intro { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(360px, 0.65fr); gap: 48px; align-items: end; }
.gf-performance-drivers__intro > p { margin-bottom: 4px; }

.gf-performance-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 46px 0 18px;
}

.gf-performance-tabs button {
  padding: 10px 15px;
  border: 1px solid rgba(166, 156, 176, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.025);
  color: var(--gf-ink-2);
  font: inherit;
  font-size: 0.84rem;
  font-weight: 800;
  cursor: pointer;
}

.gf-performance-tabs button:hover,
.gf-performance-tabs button.is-active {
  border-color: rgba(255, 130, 87, 0.58);
  background: rgba(255, 106, 61, 0.11);
  color: var(--gf-ink);
}

.gf-performance-chart,
.gf-performance-web__panel {
  padding: clamp(22px, 3.2vw, 42px);
  border: 1px solid rgba(166, 156, 176, 0.22);
  border-radius: 12px;
  background: var(--perf-panel);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.18);
}

.gf-performance-chart__topline { display: flex; justify-content: space-between; gap: 28px; align-items: end; margin-bottom: 34px; }
.gf-performance-chart__topline > div:first-child { display: grid; gap: 4px; }
.gf-performance-chart__topline > div:first-child span { color: var(--gf-accent-hi); font-family: var(--vp-font-family-mono); font-size: 0.76rem; }
.gf-performance-chart__topline > div:first-child strong { color: var(--gf-ink); font-size: 1.3rem; }
.gf-performance-legend { display: flex; flex-wrap: wrap; gap: 14px; }
.gf-performance-legend span { display: inline-flex; align-items: center; gap: 7px; color: var(--gf-ink-2); font-size: 0.74rem; }
.gf-performance-legend span::before { width: 8px; height: 8px; border-radius: 50%; background: var(--perf-coral); content: ""; }
.gf-performance-legend .is-local::before { background: var(--perf-violet); }
.gf-performance-legend .is-service::before { background: var(--perf-cyan); }

.gf-performance-driver-rows { display: grid; gap: 13px; }
.gf-performance-driver-row { display: grid; grid-template-columns: minmax(116px, 0.17fr) minmax(180px, 1fr) minmax(82px, auto); gap: 18px; align-items: center; }
.gf-performance-driver-row__label { display: grid; gap: 2px; min-width: 0; }
.gf-performance-driver-row__label strong { overflow: hidden; color: var(--gf-ink); font-size: 0.85rem; text-overflow: ellipsis; white-space: nowrap; }
.gf-performance-driver-row__label span { color: var(--gf-ink-2); font-size: 0.68rem; }
.gf-performance-driver-row__track { height: 16px; overflow: hidden; border-radius: 3px; background: var(--perf-track); }
.gf-performance-driver-row__bar { display: block; height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--perf-coral), var(--perf-gold)); box-shadow: 0 0 24px rgba(255, 106, 61, 0.23); transition: width 420ms cubic-bezier(0.22, 1, 0.36, 1); }
.gf-performance-driver-row__bar.is-local { background: linear-gradient(90deg, #7869d8, var(--perf-violet)); box-shadow: 0 0 24px rgba(183, 164, 255, 0.18); }
.gf-performance-driver-row__bar.is-service { background: linear-gradient(90deg, #277da8, var(--perf-cyan)); box-shadow: 0 0 24px rgba(103, 199, 255, 0.18); }
.gf-performance-driver-row__value { color: var(--gf-ink); font-family: var(--vp-font-family-mono); font-size: 0.78rem; text-align: right; }
.gf-performance-chart__scale { margin: 22px 0 0; color: var(--gf-ink-2); font-size: 0.7rem; text-align: right; }

.gf-performance-web { display: grid; grid-template-columns: minmax(360px, 0.65fr) minmax(560px, 1.1fr); gap: clamp(44px, 7vw, 110px); align-items: center; }
.gf-performance-web__copy code { color: var(--gf-ink); }
.gf-performance-web__note { font-size: 0.84rem !important; }
.gf-performance-tabs--compact { margin: 0 0 30px; }
.gf-performance-tabs--compact button { padding: 8px 12px; font-size: 0.74rem; }
.gf-performance-web-rows { display: grid; gap: 12px; }
.gf-performance-web-row { display: grid; grid-template-columns: minmax(104px, 0.22fr) minmax(180px, 1fr) minmax(74px, auto); gap: 14px; align-items: center; padding: 8px 10px; border: 1px solid transparent; border-radius: 7px; }
.gf-performance-web-row.is-goforj { border-color: rgba(255, 130, 87, 0.32); background: rgba(255, 106, 61, 0.07); }
.gf-performance-web-row > div:first-child { display: grid; gap: 2px; }
.gf-performance-web-row > div:first-child strong { color: var(--gf-ink); font-size: 0.78rem; }
.gf-performance-web-row > div:first-child span { color: var(--gf-ink-2); font-size: 0.65rem; }
.gf-performance-web-row__track { height: 13px; overflow: hidden; border-radius: 3px; background: var(--perf-track); }
.gf-performance-web-row__track span { display: block; height: 100%; border-radius: 3px; background: rgba(166, 156, 176, 0.5); transition: width 420ms cubic-bezier(0.22, 1, 0.36, 1); }
.gf-performance-web-row.is-goforj .gf-performance-web-row__track span { background: linear-gradient(90deg, var(--perf-coral), var(--perf-gold)); box-shadow: 0 0 20px rgba(255, 106, 61, 0.22); }
.gf-performance-web-row > strong { color: var(--gf-ink); font-family: var(--vp-font-family-mono); font-size: 0.72rem; text-align: right; }

.gf-performance-methodology { background: rgba(255, 255, 255, 0.014); }
.gf-performance-methodology { display: grid; grid-template-columns: minmax(360px, 0.72fr) minmax(520px, 1fr); gap: clamp(46px, 8vw, 120px); }
.gf-performance-methodology__copy h2 { font-size: clamp(2.7rem, 4.7vw, 5.7rem); }
.gf-performance-sources { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; align-content: start; }
.gf-performance-sources a { display: grid; gap: 5px; padding: 18px 20px; border: 1px solid rgba(166, 156, 176, 0.2); border-radius: 8px; background: rgba(255, 255, 255, 0.025); text-decoration: none !important; transition: border-color 160ms ease, transform 160ms ease; }
.gf-performance-sources a:hover { transform: translateY(-2px); border-color: rgba(255, 130, 87, 0.5); }
.gf-performance-sources span { color: var(--gf-accent-hi); font-size: 0.72rem; font-weight: 850; text-transform: uppercase; }
.gf-performance-sources strong { color: var(--gf-ink); }
.gf-performance-sources small { color: var(--gf-ink-2); font-family: var(--vp-font-family-mono); }
.gf-performance-library-strip { grid-column: 1 / -1; display: grid; gap: 16px; margin-top: 24px; padding-top: 28px; border-top: 1px solid rgba(166, 156, 176, 0.18); }
.gf-performance-library-strip > span { color: var(--gf-ink-2); font-size: 0.76rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.gf-performance-library-strip > div { display: flex; flex-wrap: wrap; gap: 8px; }
.gf-performance-library-strip a { padding: 7px 10px; border: 1px solid rgba(166, 156, 176, 0.18); border-radius: 5px; color: var(--gf-ink); font-family: var(--vp-font-family-mono); font-size: 0.72rem; text-decoration: none !important; }
.gf-performance-library-strip small { margin-left: 5px; color: var(--gf-accent-hi); }

.gf-performance-closing { display: grid; justify-items: center; padding-top: clamp(90px, 11vw, 170px); padding-bottom: clamp(100px, 13vw, 190px); text-align: center; background: radial-gradient(900px 420px at 50% 100%, rgba(255, 106, 61, 0.15), transparent 72%); }
.gf-performance-closing h2 { max-width: 1000px; }
.gf-performance-closing > p:not(.gf-performance-eyebrow) { margin-right: auto; margin-left: auto; }
.gf-performance-actions--center { justify-content: center; }

@keyframes gf-performance-sweep {
  to { transform: rotate(360deg); }
}

@media (max-width: 1100px) {
  .gf-performance-hero { grid-template-columns: 1fr; min-height: auto; }
  .gf-performance-radar { width: min(100%, 620px); }
  .gf-performance-highlights { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .gf-performance-web,
  .gf-performance-methodology { grid-template-columns: 1fr; }
}

@media (max-width: 760px) {
  .gf-performance-hero { padding-top: 56px; }
  .gf-performance-hero h1 { font-size: clamp(3.5rem, 17vw, 5.4rem); }
  .gf-performance-radar__node { min-width: 96px; padding: 8px 10px; }
  .gf-performance-proof { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .gf-performance-proof > div:nth-child(2) { border-right: 0; }
  .gf-performance-proof > div:nth-child(-n + 2) { border-bottom: 1px solid rgba(166, 156, 176, 0.16); }
  .gf-performance-highlights { grid-template-columns: 1fr; }
  .gf-performance-highlights article { min-height: 205px; }
  .gf-performance-drivers__intro { grid-template-columns: 1fr; gap: 8px; }
  .gf-performance-chart__topline { display: grid; align-items: start; }
  .gf-performance-driver-row { grid-template-columns: 90px minmax(100px, 1fr) 70px; gap: 9px; }
  .gf-performance-driver-row__label span { display: none; }
  .gf-performance-web-row { grid-template-columns: 94px minmax(80px, 1fr) 65px; gap: 8px; padding: 6px 0; }
  .gf-performance-web-row > div:first-child span { display: none; }
  .gf-performance-sources { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .gf-performance-radar__sweep { animation: none; }
  .gf-performance-driver-row__bar,
  .gf-performance-web-row__track span { transition: none; }
}
</style>
