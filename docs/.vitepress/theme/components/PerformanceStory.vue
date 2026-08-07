<script setup>
import { computed, ref } from 'vue'
import performance from '../../data/performance-stats.json'

const selectedDriverStoryID = ref('cache')
const selectedWebScenarioID = ref('path_param_json')

const kindOrder = { process: 0, local: 1, service: 2 }
const driverStory = computed(() => performance.driverStories.find((story) => story.id === selectedDriverStoryID.value))
const driverNarratives = {
  cache: {
    local: 'CACHE_DRIVER=memory',
    external: 'CACHE_DRIVER=redis',
    localDriver: 'Memory',
    externalDriver: 'Redis',
    buys: 'Shared cache state across App instances.',
    measurement: 'Seeded GetBytes. Lower is faster.'
  },
  queue: {
    local: 'QUEUE_DRIVER=workerpool',
    external: 'QUEUE_DRIVER=rabbitmq',
    localDriver: 'Worker pool',
    externalDriver: 'RabbitMQ',
    buys: 'Independent workers and broker-backed delivery.',
    measurement: 'Producer-side Dispatch return. Job completion is not included.',
    caveat: 'Core NATS is an ephemeral publish/subscribe adapter. Its Dispatch return does not provide the durability boundary represented by SQL, SQS, or durable brokers.'
  },
  events: {
    local: 'EVENTS_DRIVER=inproc',
    external: 'EVENTS_DRIVER=nats',
    localDriver: 'In process',
    externalDriver: 'NATS',
    buys: 'Event delivery across process boundaries.',
    measurement: 'Publish plus observed handler delivery round trip.'
  },
  storage: {
    local: 'STORAGE_PUBLIC_DRIVER=local',
    external: 'STORAGE_PUBLIC_DRIVER=s3',
    localDriver: 'Local disk',
    externalDriver: 'S3',
    buys: 'Object storage shared beyond one host.',
    measurement: 'Get a previously written small object.'
  }
}
const driverNarrative = computed(() => driverNarratives[selectedDriverStoryID.value])
const driverRows = computed(() => [...driverStory.value.rows].sort((left, right) => {
  const kindDifference = kindOrder[left.kind] - kindOrder[right.kind]
  return kindDifference || left.value - right.value
}))
const webScenario = computed(() => performance.web.scenarios.find((scenario) => scenario.id === selectedWebScenarioID.value))
const webRows = computed(() => webScenario.value.rows
  .filter((row) => row.framework !== 'httprouter')
  .sort((left, right) => right.throughput - left.throughput))
const goforjWeb = computed(() => webScenario.value.rows.find((row) => row.framework === 'goforj_web'))
const liveHTTP = computed(() => performance.web.scenarios.find((scenario) => scenario.id === 'live_plain_text'))
const liveGoforjWeb = computed(() => liveHTTP.value.rows.find((row) => row.framework === 'goforj_web'))
const liveNetHTTP = computed(() => liveHTTP.value.rows.find((row) => row.framework === 'net_http'))
const driverRow = (storyID, label) => performance.driverStories
  .find((story) => story.id === storyID)
  .rows.find((row) => row.label === label)
const performancePairs = [
  {
    id: 'cache',
    title: 'Cache',
    operation: 'Seeded read',
    local: driverRow('cache', 'Memory'),
    production: driverRow('cache', 'Redis'),
    buys: 'Shared cache state across App instances.'
  },
  {
    id: 'queue',
    title: 'Queue',
    operation: 'Dispatch return',
    local: driverRow('queue', 'Worker pool'),
    production: driverRow('queue', 'RabbitMQ'),
    buys: 'Broker-backed delivery to independent workers.'
  },
  {
    id: 'events',
    title: 'Events',
    operation: 'Publish + handle',
    local: driverRow('events', 'Synchronous'),
    production: driverRow('events', 'NATS JetStream'),
    buys: 'Durable event delivery across processes.'
  },
  {
    id: 'storage',
    title: 'Storage',
    operation: 'Small-object read',
    local: driverRow('storage', 'Local'),
    production: driverRow('storage', 'S3'),
    buys: 'Object storage shared beyond one host.'
  }
]

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
const kindLabel = (kind) => ({ process: 'In process', local: 'Host-local', service: 'External boundary' })[kind]
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
        <p class="gf-performance-eyebrow">Performance by architecture</p>
        <h1>Start local.<br><em>Scale without a rewrite.</em></h1>
        <p class="gf-performance-lede">
          GoForj gives cache, queues, events, and storage fast local implementations behind the
          same contracts used by shared backends. Keep work in process while that fits. Move to
          Redis, NATS, SQL, S3, or another service when you need coordination, persistence, or
          distribution—without rewriting the service that uses it.
        </p>
        <div class="gf-performance-actions">
          <a href="#driver-physics">Compare driver costs</a>
          <a href="#methodology">See how these were measured</a>
        </div>
      </div>

      <div class="gf-performance-pairs" aria-label="Local and production-oriented driver performance">
        <div class="gf-performance-pairs__heading">
          <div><span>Start local</span><strong>Fast feedback</strong></div>
          <i aria-hidden="true">same contract</i>
          <div><span>Cross the boundary</span><strong>Production capability</strong></div>
        </div>
        <article v-for="pair in performancePairs" :key="pair.id">
          <div class="gf-performance-pairs__label">
            <strong>{{ pair.title }}</strong>
            <span>{{ pair.operation }}</span>
          </div>
          <div class="gf-performance-pairs__driver is-local">
            <span>{{ pair.local.label }}</span>
            <strong>{{ formatLatency(pair.local.value) }}</strong>
          </div>
          <div class="gf-performance-pairs__bridge" aria-hidden="true"><span></span><i>→</i></div>
          <div class="gf-performance-pairs__driver is-production">
            <span>{{ pair.production.label }}</span>
            <strong>{{ formatLatency(pair.production.value) }}</strong>
          </div>
          <p>{{ pair.buys }}</p>
        </article>
        <small>Measured locally. Each row compares the same library operation; lower is faster.</small>
      </div>
    </section>

    <section class="gf-performance-proof" aria-label="Benchmark evidence summary">
      <div><strong>{{ performance.sources.length }}</strong><span>versioned benchmark datasets</span></div>
      <div><strong>{{ performance.driverStories.length }}</strong><span>same-operation driver suites</span></div>
      <div><strong>1</strong><span>shared HTTP harness</span></div>
      <div><strong>SHA</strong><span>revision and content hash recorded</span></div>
    </section>

    <section class="gf-performance-section gf-performance-contract">
      <header class="gf-performance-section__header">
        <p class="gf-performance-eyebrow">Performance without a fork in the road</p>
        <h2>Your service code stays put.</h2>
        <p>
          Local drivers are not toy substitutes. They implement the contracts your App uses in
          production. Start with fewer processes and faster feedback, then change configuration and
          wiring when a workload needs shared state, independent workers, durable delivery, or
          storage beyond one host.
        </p>
      </header>

      <div class="gf-performance-contract-map">
        <div class="gf-performance-contract-map__service">
          <span>Application service</span>
          <strong>Business logic</strong>
          <code>cache.Get(ctx, key)</code>
          <code>queue.Dispatch(ctx, job)</code>
          <code>events.Publish(ctx, event)</code>
          <code>storage.Get(ctx, path)</code>
          <small>unchanged</small>
        </div>
        <div class="gf-performance-contract-map__contracts">
          <span>GoForj contracts</span>
          <i aria-hidden="true">→</i>
          <strong>Cache · Queue · Events · Storage</strong>
          <i aria-hidden="true">→</i>
        </div>
        <div class="gf-performance-contract-map__modes">
          <div>
            <span>Local profile</span>
            <strong>Memory · Worker pool<br>Synchronous · Disk</strong>
            <small>one command, no supporting services</small>
          </div>
          <div>
            <span>Production profile</span>
            <strong>Redis · RabbitMQ<br>JetStream · S3</strong>
            <small>coordination, durability, distribution</small>
          </div>
        </div>
      </div>
    </section>

    <section id="driver-physics" class="gf-performance-section gf-performance-drivers">
      <div class="gf-performance-drivers__intro">
        <div>
          <p class="gf-performance-eyebrow">Same contract. Different boundary.</p>
          <h2>See the cost. Know what it buys.</h2>
        </div>
        <p>
          Each chart compares one operation inside a GoForj library. Latency changes because the
          work changes: serialization, filesystem access, broker delivery, database commits,
          emulator behavior, and network round trips all have a cost. Choose the guarantees the
          workload needs, then see the local overhead of that choice.
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

      <div class="gf-performance-boundary">
        <div>
          <span>Start here</span>
          <code>{{ driverNarrative.local }}</code>
          <strong>{{ driverNarrative.localDriver }}</strong>
        </div>
        <div class="gf-performance-boundary__bridge">
          <span>same library contract</span>
          <i aria-hidden="true">→</i>
          <small>configuration + wiring</small>
        </div>
        <div>
          <span>Cross the boundary when needed</span>
          <code>{{ driverNarrative.external }}</code>
          <strong>{{ driverNarrative.externalDriver }}</strong>
          <p>{{ driverNarrative.buys }}</p>
        </div>
      </div>

      <div class="gf-performance-chart">
        <div class="gf-performance-chart__topline">
          <div>
            <span>{{ driverStory.operation }}</span>
            <strong>{{ driverStory.title }}</strong>
          </div>
          <div class="gf-performance-legend" aria-label="Driver types">
            <span class="is-process">In process</span>
            <span class="is-local">Host-local</span>
            <span class="is-service">External boundary</span>
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
        <div class="gf-performance-chart__notes">
          <p>{{ driverNarrative.measurement }}</p>
          <p v-if="driverNarrative.caveat">{{ driverNarrative.caveat }}</p>
          <small>Logarithmic latency scale. Compare rows within this suite only. External fixtures run locally in containers or emulators; they are not managed-service forecasts.</small>
        </div>
      </div>
    </section>

    <section class="gf-performance-section gf-performance-web">
      <div class="gf-performance-web__copy">
        <p class="gf-performance-eyebrow">Framework overhead</p>
        <h2>The App stays close to <code>net/http</code>.</h2>
        <p>
          In the shared HTTP/1.1 loopback case, GoForj Web recorded
          <strong>{{ formatRate(liveGoforjWeb.throughput) }}</strong> requests per second versus
          <strong>{{ formatRate(liveNetHTTP.throughput) }}</strong> for <code>net/http</code>. In the
          in-process path-and-JSON case, it recorded <strong>{{ formatRate(goforjWeb.throughput) }}</strong>
          operations per second with <strong>{{ goforjWeb.allocs }}</strong> allocations per operation.
          The useful result is not a benchmark trophy: GoForj's routing and App abstractions remain
          competitive with the underlying Go stack under the same harness.
        </p>
        <p class="gf-performance-web__note">
          Values are medians of {{ performance.web.metadata.sample_count }} samples at
          {{ performance.web.metadata.benchmark_time }} with GOMAXPROCS={{ performance.web.metadata.gomaxprocs }}.
          Small differences are not rankings. The loopback case is a warm single-connection ceiling;
          the other cases measure in-process dispatch. Neither predicts production capacity.
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
        <p class="gf-performance-eyebrow">Traceable measurements</p>
        <h2>Every number points back to a versioned result.</h2>
        <p>
          This page is generated from five benchmark snapshots committed in the Cache, Queue,
          Events, Storage, and Web repositories. The collector records each source revision and
          SHA-256 hash, normalizes the selected rows, and makes the docs build fail when the
          checked-in page data drifts from those sources.
        </p>
        <p>
          Container- and emulator-backed results describe those local fixtures on the recorded
          machine. Production latency depends on network topology, service configuration,
          contention, payloads, and delivery guarantees. Use these results to compare implementation
          boundaries and detect regressions, not to forecast deployed throughput.
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
        <span>{{ performance.totals.benchmarks }} benchmark functions across {{ performance.benchmarkLibraries.length }} libraries</span>
        <div>
          <a v-for="library in performance.benchmarkLibraries" :key="library.repo" :href="libraryLink(library.repo)">
            {{ library.repo }} <small>{{ library.benchmarks }}</small>
          </a>
        </div>
      </div>
    </section>

    <section class="gf-performance-closing">
      <p class="gf-performance-eyebrow">Change the boundary, not the service</p>
      <h2>Keep the contract.<br>Add infrastructure deliberately.</h2>
      <p>
        Run in process or on local storage while those semantics fit. Move to shared, durable, or
        distributed drivers when coordination, persistence, and scale require them. GoForj keeps
        that decision in wiring and configuration instead of spreading it through business logic.
      </p>
      <div class="gf-performance-actions gf-performance-actions--center">
        <a href="/drivers">Compare all {{ performance.totals.drivers }} drivers</a>
        <a href="/getting-started/quickstart">Build a local-first App</a>
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
  grid-template-columns: minmax(0, 0.78fr) minmax(660px, 1.22fr);
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

.gf-performance-pairs {
  padding: clamp(20px, 2.6vw, 34px);
  border: 1px solid rgba(255, 130, 87, 0.22);
  border-radius: 14px;
  background: linear-gradient(145deg, rgba(255, 106, 61, 0.07), var(--perf-panel) 35%);
  box-shadow: 0 40px 120px rgba(0, 0, 0, 0.25);
}

.gf-performance-pairs__heading,
.gf-performance-pairs article {
  display: grid;
  grid-template-columns: minmax(72px, 0.45fr) minmax(126px, 0.8fr) minmax(74px, 0.48fr) minmax(126px, 0.8fr) minmax(160px, 1.2fr);
  gap: 14px;
  align-items: center;
}

.gf-performance-pairs__heading {
  padding: 0 14px 15px;
  border-bottom: 1px solid rgba(166, 156, 176, 0.16);
}

.gf-performance-pairs__heading > div:first-child { grid-column: 2; }
.gf-performance-pairs__heading > i { grid-column: 3; color: var(--gf-ink-2); font-size: 0.64rem; font-style: normal; text-align: center; }
.gf-performance-pairs__heading > div:last-child { grid-column: 4 / 6; }
.gf-performance-pairs__heading div { display: grid; gap: 2px; }
.gf-performance-pairs__heading span,
.gf-performance-pairs > small { color: var(--gf-ink-2); font-size: 0.65rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.gf-performance-pairs__heading strong { color: var(--gf-ink); font-size: 0.82rem; }

.gf-performance-pairs article {
  padding: 17px 14px;
  border-bottom: 1px solid rgba(166, 156, 176, 0.13);
}

.gf-performance-pairs__label,
.gf-performance-pairs__driver { display: grid; gap: 3px; }
.gf-performance-pairs__label strong { color: var(--gf-ink); font-size: 0.88rem; }
.gf-performance-pairs__label span { color: var(--gf-ink-2); font-size: 0.65rem; }
.gf-performance-pairs__driver { padding: 11px 12px; border: 1px solid rgba(183, 164, 255, 0.3); border-radius: 7px; background: rgba(183, 164, 255, 0.07); }
.gf-performance-pairs__driver.is-production { border-color: rgba(103, 199, 255, 0.34); background: rgba(103, 199, 255, 0.07); }
.gf-performance-pairs__driver span { color: var(--gf-ink-2); font-size: 0.66rem; font-weight: 800; text-transform: uppercase; }
.gf-performance-pairs__driver strong { color: var(--gf-ink); font-family: var(--vp-font-family-mono); font-size: 1rem; }
.gf-performance-pairs__bridge { display: flex; align-items: center; color: var(--gf-accent-hi); }
.gf-performance-pairs__bridge span { flex: 1; height: 1px; background: linear-gradient(90deg, rgba(183, 164, 255, 0.5), rgba(103, 199, 255, 0.5)); }
.gf-performance-pairs__bridge i { font-style: normal; }
.gf-performance-pairs article > p { margin: 0; color: var(--gf-ink-2); font-size: 0.72rem; line-height: 1.45; }
.gf-performance-pairs > small { display: block; padding: 15px 14px 0; line-height: 1.5; text-transform: none; }

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

.gf-performance-contract { display: grid; grid-template-columns: minmax(320px, 0.6fr) minmax(660px, 1.4fr); gap: clamp(44px, 7vw, 110px); align-items: center; }
.gf-performance-contract h2 { font-size: clamp(2.8rem, 4.7vw, 5.7rem); }
.gf-performance-contract-map { display: grid; grid-template-columns: minmax(190px, 0.8fr) minmax(180px, 0.7fr) minmax(240px, 1fr); gap: 16px; align-items: stretch; }
.gf-performance-contract-map__service,
.gf-performance-contract-map__modes > div { display: grid; gap: 9px; padding: 24px; border: 1px solid rgba(166, 156, 176, 0.2); border-radius: 10px; background: var(--perf-panel); }
.gf-performance-contract-map__service { position: relative; align-content: center; border-color: rgba(255, 130, 87, 0.38); box-shadow: 0 24px 70px rgba(255, 106, 61, 0.08); }
.gf-performance-contract-map span { color: var(--gf-ink-2); font-size: 0.68rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.gf-performance-contract-map strong { color: var(--gf-ink); }
.gf-performance-contract-map__service > strong { margin-bottom: 8px; font-size: 1.25rem; }
.gf-performance-contract-map__service code { padding: 5px 7px; background: rgba(255, 255, 255, 0.04); color: var(--gf-reference); font-size: 0.7rem; white-space: nowrap; }
.gf-performance-contract-map__service small { position: absolute; top: 14px; right: 14px; padding: 3px 7px; border: 1px solid rgba(115, 226, 196, 0.3); border-radius: 999px; color: var(--perf-mint); font-size: 0.62rem; font-weight: 800; text-transform: uppercase; }
.gf-performance-contract-map__contracts { display: grid; place-content: center; gap: 11px; color: var(--gf-ink); text-align: center; }
.gf-performance-contract-map__contracts strong { font-size: 0.8rem; line-height: 1.7; }
.gf-performance-contract-map__contracts i { color: var(--gf-accent-hi); font-size: 1.6rem; font-style: normal; line-height: 1; }
.gf-performance-contract-map__modes { display: grid; gap: 12px; }
.gf-performance-contract-map__modes > div:first-child { border-color: rgba(183, 164, 255, 0.3); background: linear-gradient(135deg, rgba(183, 164, 255, 0.08), var(--perf-panel)); }
.gf-performance-contract-map__modes > div:last-child { border-color: rgba(103, 199, 255, 0.34); background: linear-gradient(135deg, rgba(103, 199, 255, 0.08), var(--perf-panel)); }
.gf-performance-contract-map__modes strong { font-size: 0.9rem; line-height: 1.55; }
.gf-performance-contract-map__modes small { color: var(--gf-ink-2); font-size: 0.68rem; }

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

.gf-performance-boundary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(170px, 0.38fr) minmax(0, 1fr);
  gap: 18px;
  align-items: stretch;
  margin-bottom: 18px;
}

.gf-performance-boundary > div:not(.gf-performance-boundary__bridge) {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 7px 18px;
  padding: 20px 22px;
  border: 1px solid rgba(166, 156, 176, 0.22);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.025);
}

.gf-performance-boundary > div:last-child {
  border-color: rgba(103, 199, 255, 0.3);
  background: linear-gradient(135deg, rgba(103, 199, 255, 0.08), rgba(255, 255, 255, 0.02));
}

.gf-performance-boundary span {
  color: var(--gf-ink-2);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.gf-performance-boundary code {
  justify-self: end;
  padding: 0;
  background: transparent;
  color: var(--gf-reference);
  font-size: 0.72rem;
}

.gf-performance-boundary strong {
  color: var(--gf-ink);
  font-size: 1.16rem;
}

.gf-performance-boundary p {
  grid-column: 1 / -1;
  margin: 2px 0 0;
  color: var(--gf-ink-2);
  font-size: 0.8rem;
}

.gf-performance-boundary__bridge {
  display: grid;
  place-content: center;
  color: var(--gf-ink-2);
  text-align: center;
}

.gf-performance-boundary__bridge i {
  color: var(--gf-accent-hi);
  font-size: 1.7rem;
  font-style: normal;
  line-height: 1;
}

.gf-performance-boundary__bridge small {
  font-size: 0.66rem;
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
.gf-performance-chart__notes { display: grid; gap: 7px; margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(166, 156, 176, 0.16); }
.gf-performance-chart__notes p { max-width: 920px; margin: 0; color: var(--gf-ink); font-size: 0.76rem; line-height: 1.55; }
.gf-performance-chart__notes p + p { color: var(--gf-ink-2); }
.gf-performance-chart__notes small { color: var(--gf-ink-2); font-size: 0.68rem; line-height: 1.55; }

.gf-performance-web { display: grid; grid-template-columns: minmax(360px, 0.65fr) minmax(560px, 1.1fr); gap: clamp(44px, 7vw, 110px); align-items: center; }
.gf-performance-web__copy code { color: var(--gf-ink); }
.gf-performance-web__copy h2 code { padding: 0; background: transparent; color: var(--gf-reference); font-size: 0.82em; }
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

@media (max-width: 1100px) {
  .gf-performance-hero { grid-template-columns: 1fr; min-height: auto; }
  .gf-performance-pairs { width: 100%; }
  .gf-performance-contract { grid-template-columns: 1fr; }
  .gf-performance-web,
  .gf-performance-methodology { grid-template-columns: 1fr; }
}

@media (max-width: 760px) {
  .gf-performance-hero { padding-top: 56px; }
  .gf-performance-hero h1 { font-size: clamp(3.5rem, 17vw, 5.4rem); }
  .gf-performance-pairs__heading { display: none; }
  .gf-performance-pairs article { grid-template-columns: minmax(80px, 0.65fr) minmax(102px, 1fr) 28px minmax(102px, 1fr); gap: 8px; padding-right: 0; padding-left: 0; }
  .gf-performance-pairs article > p { grid-column: 2 / -1; }
  .gf-performance-pairs__driver { padding: 9px; }
  .gf-performance-pairs__driver strong { font-size: 0.82rem; }
  .gf-performance-pairs__bridge span { display: none; }
  .gf-performance-pairs__bridge { justify-content: center; }
  .gf-performance-proof { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .gf-performance-proof > div:nth-child(2) { border-right: 0; }
  .gf-performance-proof > div:nth-child(-n + 2) { border-bottom: 1px solid rgba(166, 156, 176, 0.16); }
  .gf-performance-contract-map { grid-template-columns: 1fr; }
  .gf-performance-contract-map__contracts { min-height: 110px; }
  .gf-performance-contract-map__contracts i { transform: rotate(90deg); }
  .gf-performance-drivers__intro { grid-template-columns: 1fr; gap: 8px; }
  .gf-performance-boundary { grid-template-columns: 1fr; }
  .gf-performance-boundary__bridge { min-height: 82px; }
  .gf-performance-boundary__bridge i { transform: rotate(90deg); }
  .gf-performance-chart__topline { display: grid; align-items: start; }
  .gf-performance-driver-row { grid-template-columns: 90px minmax(100px, 1fr) 70px; gap: 9px; }
  .gf-performance-driver-row__label span { display: none; }
  .gf-performance-web-row { grid-template-columns: 94px minmax(80px, 1fr) 65px; gap: 8px; padding: 6px 0; }
  .gf-performance-web-row > div:first-child span { display: none; }
  .gf-performance-sources { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .gf-performance-driver-row__bar,
  .gf-performance-web-row__track span { transition: none; }
}
</style>
