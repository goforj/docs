<script setup>
import { computed, ref } from 'vue'
import evidence from '../../data/performance-stats.json'
import PerformanceArchitecture from './PerformanceArchitecture.vue'

const selectedSuite = ref('cache')
const selectedBoundary = ref('local')
const selectedRow = ref('Memory')
const selectedHTTP = ref('live_plain_text')
const suites = {
  cache: {
    name: 'Cache',
    operation: 'GetBytes',
    local: 'Memory',
    service: 'Redis',
    localConfig: 'CACHE_DRIVER=memory',
    serviceConfig: 'CACHE_DRIVER=redis',
    limit: 'Memory belongs to one process. Redis adds a network boundary and shared state.',
    measurement: 'A seeded byte-value read. The result includes the selected driver call.',
    icon: 'M5 5h14v5H5z M5 14h14v5H5z M8 8h1 M8 17h1',
  },
  queue: {
    name: 'Queue',
    operation: 'Dispatch return',
    local: 'Worker pool',
    service: 'RabbitMQ',
    localConfig: 'QUEUE_DRIVER=workerpool',
    serviceConfig: 'QUEUE_DRIVER=rabbitmq',
    limit:
      'The worker pool runs in this process. A broker lets workers live elsewhere; retries and delivery semantics still depend on the driver and configuration.',
    measurement:
      'Producer-side dispatch return, not job completion. Core NATS publish return is an ephemeral boundary, not a durable broker acknowledgement.',
    icon: 'M4 6h11 M4 12h11 M4 18h11 M17 9l3 3-3 3',
  },
  events: {
    name: 'Events',
    operation: 'Publish + handler delivery',
    local: 'Synchronous',
    service: 'NATS',
    localConfig: 'EVENTS_DRIVER=inproc',
    serviceConfig: 'EVENTS_DRIVER=nats',
    limit:
      'Local handlers share a process. Core NATS crosses that boundary without promising durable delivery; use a durable driver when that is required.',
    measurement:
      'Publish plus observed handler delivery. This includes the round trip, unlike the queue dispatch suite.',
    icon: 'M12 9v6 M9 12h6 M5 5l3 3 M16 16l3 3 M5 19l3-3 M16 8l3-3',
  },
  storage: {
    name: 'Storage',
    operation: 'Get small object',
    local: 'Local',
    service: 'S3',
    localConfig: 'STORAGE_PUBLIC_DRIVER=local',
    serviceConfig: 'STORAGE_PUBLIC_DRIVER=s3',
    limit:
      'Local files belong to a host. S3 adds a service boundary. Check driver capabilities and object semantics.',
    measurement:
      'Read a previously written small object. Service fixtures use local containers or emulators.',
    icon: 'M4 7l8-4 8 4-8 4z M4 7v10l8 4 8-4V7 M12 11v10',
  },
}
const suite = computed(() => suites[selectedSuite.value])
const story = computed(() => evidence.driverStories.find((s) => s.id === selectedSuite.value))
const rows = computed(() => [...story.value.rows].sort((a, b) => a.value - b.value))
const local = computed(() => story.value.rows.find((r) => r.label === suite.value.local))
const detail = computed(() => rows.value.find((r) => r.label === selectedRow.value) || local.value)
const source = computed(() => evidence.sources.find((s) => s.repo === selectedSuite.value))
const decades = computed(() => {
  const min = Math.floor(Math.log10(Math.min(...rows.value.map((r) => r.value))))
  const max = Math.max(min + 1, Math.ceil(Math.log10(Math.max(...rows.value.map((r) => r.value)))))
  return Array.from({ length: max - min + 1 }, (_, i) => 10 ** (min + i))
})
const position = (value) =>
  ((Math.log10(value) - Math.log10(decades.value[0])) /
    (Math.log10(decades.value.at(-1)) - Math.log10(decades.value[0]))) *
  100
const latency = (value) => {
  if (value < 1000) return { number: Number(value.toFixed(value < 100 ? 0 : 1)), unit: 'ns' }
  if (value < 1000000)
    return { number: Number((value / 1000).toFixed(value < 10000 ? 2 : 1)), unit: 'µs' }
  return { number: Number((value / 1000000).toFixed(2)), unit: 'ms' }
}
const time = (value) => `${latency(value).number} ${latency(value).unit}`
const number = (value) => Number(value.toFixed(1)).toLocaleString('en-US')
const rate = (value) =>
  value >= 1e6 ? `${(value / 1e6).toFixed(2)}M` : `${Math.round(value / 1000)}K`
const category = (kind) =>
  ({ process: 'In process', local: 'Host-local', service: 'Service boundary' })[kind]
const sourceURL = (s) => `https://github.com/goforj/${s.repo}/blob/${s.revision}/${s.path}`
const changeSuite = (id) => {
  selectedSuite.value = id
  selectedRow.value = suites[id].local
}
const httpNames = {
  live_plain_text: 'HTTP/1.1 loopback',
  static_text: 'Static response',
  path_param_json: 'Path parameter + JSON',
  middleware_chain: 'Middleware chain',
}
const httpStory = computed(() => evidence.web.scenarios.find((s) => s.id === selectedHTTP.value))
const httpRows = computed(() =>
  [...httpStory.value.rows].sort((a, b) => b.throughput - a.throughput),
)
const httpGoForj = computed(() => httpRows.value.find((r) => r.framework === 'goforj_web'))
const httpStandard = computed(() => httpRows.value.find((r) => r.framework === 'net_http'))
const httpMax = computed(() => {
  const maximum = Math.max(...httpRows.value.map((r) => r.throughput))
  const step = 10 ** Math.floor(Math.log10(maximum)) / 2
  return Math.ceil(maximum / step) * step
})
const httpTicks = computed(() => Array.from({ length: 5 }, (_, i) => (httpMax.value / 4) * i))
const totalRows = evidence.driverStories.reduce((sum, s) => sum + s.rows.length, 0)
const architectureResources = computed(() =>
  Object.entries(suites).map(([id, item]) => ({
    id,
    ...item,
    local: evidence.driverStories.find((s) => s.id === id).rows.find((r) => r.label === item.local),
    service: evidence.driverStories
      .find((s) => s.id === id)
      .rows.find((r) => r.label === item.service),
  })),
)
</script>

<template>
  <main class="pf">
    <section class="pf-hero pf-rail">
      <div class="pf-hero-heading">
        <div>
          <p class="pf-kicker">
            <span class="pf-mark" aria-hidden="true"></span> GoForj / Performance by architecture
          </p>
          <h1>Fast starts with<br /><em>less distance.</em></h1>
        </div>
        <div class="pf-hero-intro">
          <p class="pf-lead">
            Start with one app, local drivers, and no supporting services. Move to shared
            infrastructure when the workload needs it. Your services keep the same library
            contracts.
          </p>
          <p>
            Performance changes with the boundary. So do coordination, persistence, and delivery
            guarantees.
          </p>
          <a href="#compare">Explore the measurements <span aria-hidden="true">↓</span></a>
        </div>
      </div>
      <PerformanceArchitecture
        v-model:mode="selectedBoundary"
        :selected="selectedSuite"
        :resources="architectureResources"
        @select="changeSuite"
      />
    </section>

    <section id="compare" class="pf-section pf-rail">
      <header class="pf-section-head">
        <div>
          <p class="pf-kicker">02 / The cost of a boundary</p>
          <h2>Same operation.<br />Different distance.</h2>
        </div>
        <p>
          Network calls, filesystem access, serialization, and delivery guarantees change the work a
          driver does. Compare the measured cost inside one library, then choose the behavior your
          app needs.
        </p>
      </header>
      <div class="pf-explorer">
        <div class="pf-explorer-tabs" role="group" aria-label="Driver measurements">
          <button
            v-for="(item, id) in suites"
            :key="id"
            :aria-pressed="selectedSuite === id"
            @click="changeSuite(id)"
          >
            <span>0{{ Object.keys(suites).indexOf(id) + 1 }}</span
            >{{ item.name
            }}<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path :d="item.icon" /></svg>
          </button>
        </div>
        <div class="pf-explorer-body">
          <div class="pf-chart">
            <div class="pf-chart-title">
              <div>
                <h3>{{ suite.operation }}</h3>
                <p>Time per operation · lower is faster</p>
              </div>
              <span class="pf-scale-label">LOG SCALE</span>
            </div>
            <div class="pf-axis" aria-hidden="true">
              <div>
                <span
                  v-for="(tick, i) in decades"
                  :key="tick"
                  :class="{ 'is-first': i === 0, 'is-last': i === decades.length - 1 }"
                  :style="{ left: `${position(tick)}%` }"
                  >{{ time(tick) }}</span
                >
              </div>
            </div>
            <div
              class="pf-chart-rows"
              role="group"
              :aria-label="`${suite.name} driver latency; select a row for details`"
            >
              <button
                v-for="row in rows"
                :key="row.label"
                class="pf-chart-row"
                :class="[`pf-kind--${row.kind}`, { 'is-selected': detail.label === row.label }]"
                :aria-pressed="detail.label === row.label"
                @click="selectedRow = row.label"
              >
                <span class="pf-row-name">{{ row.label }}</span
                ><span class="pf-row-track" aria-hidden="true"
                  ><i
                    v-for="tick in decades"
                    :key="tick"
                    class="pf-gridline"
                    :style="{ left: `${position(tick)}%` }"
                  ></i
                  ><span class="pf-row-line" :style="{ width: `${position(row.value)}%` }"></span
                  ><span
                    class="pf-row-dot"
                    :style="{ left: `${position(row.value)}%` }"
                  ></span></span
                ><strong>{{ time(row.value) }}</strong>
              </button>
            </div>
            <div class="pf-chart-legend">
              <span class="pf-kind--process"><i></i>In process</span
              ><span class="pf-kind--local"><i></i>Host-local</span
              ><span class="pf-kind--service"><i></i>Service boundary</span>
            </div>
            <p class="pf-measure-note">
              Each grid interval is 10×. These are local harness results, including container or
              emulator fixtures for service drivers.
            </p>
          </div>
          <aside class="pf-detail" aria-live="polite" aria-atomic="true">
            <span class="pf-mono">Selected measurement</span>
            <h3>{{ detail.label }}</h3>
            <span class="pf-detail-kind" :class="`pf-kind--${detail.kind}`"
              ><i></i>{{ category(detail.kind) }}</span
            >
            <div class="pf-detail-time">
              <strong>{{ latency(detail.value).number }}</strong
              ><span>{{ latency(detail.value).unit }} / op</span>
            </div>
            <dl>
              <div>
                <dt>Allocations / op</dt>
                <dd>{{ number(detail.allocs) }}</dd>
              </div>
              <div>
                <dt>Bytes / op</dt>
                <dd>{{ number(detail.bytes) }}</dd>
              </div>
            </dl>
            <p>{{ suite.measurement }}</p>
            <a :href="sourceURL(source)" target="_blank" rel="noopener noreferrer"
              >{{ selectedSuite }}/{{ source.revision.slice(0, 8) }} ↗</a
            >
          </aside>
        </div>
        <div class="pf-contract-note">
          <span class="pf-kicker">What changes</span>
          <p>{{ suite.limit }}</p>
          <a href="/drivers">Driver capabilities ↗</a>
        </div>
      </div>
    </section>

    <section id="http" class="pf-section pf-http pf-rail">
      <header class="pf-section-head">
        <div>
          <p class="pf-kicker">03 / HTTP routing overhead</p>
          <h2>Stay close to<br /><code>net/http.</code></h2>
        </div>
        <div>
          <p>
            The Web library comparison puts GoForj's HTTP routing in the same harness as other Go
            routers. Switch scenarios to separate socket overhead from in-process dispatch.
          </p>
          <p class="pf-small">
            These are Web library measurements, not a full generated app with database queries,
            authentication, and business logic.
          </p>
        </div>
      </header>
      <div class="pf-http-layout">
        <div class="pf-http-summary">
          <label for="pf-http-scenario" class="pf-mono">Choose a workload</label
          ><select id="pf-http-scenario" v-model="selectedHTTP">
            <option v-for="s in evidence.web.scenarios" :key="s.id" :value="s.id">
              {{ httpNames[s.id] }}
            </option>
          </select>
          <div class="pf-http-number">
            <span>GoForj Web</span
            ><strong
              >{{ rate(httpGoForj.throughput)
              }}<small>{{
                selectedHTTP === 'live_plain_text' ? 'requests / sec' : 'operations / sec'
              }}</small></strong
            >
          </div>
          <div class="pf-http-reference">
            <span>net/http in the same case</span
            ><strong>{{ rate(httpStandard.throughput) }} / sec</strong>
          </div>
          <p>
            {{
              selectedHTTP === 'live_plain_text'
                ? 'Warm HTTP/1.1 loopback over a single connection. Socket and HTTP work dominate this result.'
                : 'In-process handler dispatch. No socket, real network, or application workload is included.'
            }}
          </p>
          <p class="pf-small">
            Median of {{ evidence.web.metadata.sample_count }} samples ×
            {{ evidence.web.metadata.benchmark_time }} each. Small differences are not reliable
            rankings.
          </p>
        </div>
        <div class="pf-http-chart">
          <div class="pf-http-axis" aria-hidden="true">
            <span v-for="(tick, i) in httpTicks" :key="tick" :style="{ left: `${i * 25}%` }">{{
              tick === 0 ? '0' : rate(tick)
            }}</span>
          </div>
          <div
            v-for="row in httpRows"
            :key="row.framework"
            class="pf-http-row"
            :class="{ 'is-goforj': row.framework === 'goforj_web' }"
          >
            <div class="pf-http-row-title">
              <strong>{{ row.label }}</strong
              ><span>{{ number(row.allocs) }} allocs / op</span>
            </div>
            <div class="pf-http-track">
              <span :style="{ width: `${(row.throughput / httpMax) * 100}%` }"></span>
            </div>
            <strong class="pf-http-rate">{{ rate(row.throughput) }}</strong>
          </div>
          <p class="pf-measure-note">
            Linear throughput scale · higher is faster ·
            {{ selectedHTTP === 'live_plain_text' ? 'requests' : 'operations' }} / second
          </p>
        </div>
      </div>
    </section>

    <section id="methodology" class="pf-section pf-method pf-rail">
      <header class="pf-section-head">
        <div>
          <p class="pf-kicker">04 / Check the evidence</p>
          <h2>Numbers you<br />can trace.</h2>
        </div>
        <p>
          Five committed benchmark snapshots feed this page. Each retains a source revision and
          content hash. Open the source to inspect the fixture, result, and measurement conditions.
        </p>
      </header>
      <div class="pf-method-layout">
        <div class="pf-conditions">
          <h3>The HTTP environment</h3>
          <dl>
            <div>
              <dt>Go</dt>
              <dd>{{ evidence.web.metadata.go_version }}</dd>
            </div>
            <div>
              <dt>Platform</dt>
              <dd>{{ evidence.web.metadata.goos }} / {{ evidence.web.metadata.goarch }}</dd>
            </div>
            <div>
              <dt>GOMAXPROCS</dt>
              <dd>{{ evidence.web.metadata.gomaxprocs }}</dd>
            </div>
            <div>
              <dt>Sampling</dt>
              <dd>
                {{ evidence.web.metadata.sample_count }} ×
                {{ evidence.web.metadata.benchmark_time }}
              </dd>
            </div>
          </dl>
          <p>
            Driver suites have their own fixtures and run conditions. Compare within a suite, not by
            adding up results across libraries.
          </p>
          <a href="/operations/performance-benchmarks">Run a workload against your app ↗</a>
        </div>
        <div class="pf-source-list">
          <a
            v-for="s in evidence.sources"
            :key="s.repo"
            :href="sourceURL(s)"
            target="_blank"
            rel="noopener noreferrer"
            ><span class="pf-source-name">{{ s.repo }}</span
            ><span class="pf-source-path">{{ s.path }}</span
            ><code>{{ s.revision.slice(0, 8) }}</code
            ><span aria-hidden="true">↗</span></a
          >
          <details>
            <summary>View source fingerprints</summary>
            <div v-for="s in evidence.sources" :key="s.repo">
              <strong>{{ s.repo }}</strong
              ><code>{{ s.sha256 }}</code>
            </div>
          </details>
        </div>
      </div>
      <div class="pf-limits">
        <span class="pf-mono">What this does not measure</span>
        <p>
          Your production network, service configuration, workload mix, payload sizes, contention,
          and durability requirements. Use these results to understand boundaries and spot
          regressions, then measure your app under representative load.
        </p>
      </div>
    </section>
    <section class="pf-closing pf-rail">
      <div>
        <p class="pf-kicker">Build local. Add infrastructure deliberately.</p>
        <h2>Keep the code.<br />Move the boundary.</h2>
      </div>
      <div>
        <p>
          Choose shared state, durable delivery, or independent workers when you need them. Keep
          business logic behind the same contracts, and review the guarantees of each driver.
        </p>
        <div class="pf-actions">
          <a class="pf-primary" href="/getting-started/quickstart"
            >Get started <span aria-hidden="true">↗</span></a
          ><a href="/drivers">Explore the drivers ↗</a>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
:global(.VPDoc:has(.pf)) {
  padding: 0 !important;
}
:global(.VPDoc:has(.pf) .container),
:global(.VPDoc:has(.pf) .content),
:global(.VPDoc:has(.pf) .content-container),
:global(.VPDoc:has(.pf) .main),
:global(.VPDoc:has(.pf) .vp-doc) {
  width: 100% !important;
  max-width: none !important;
}
:global(.VPDoc:has(.pf) .container),
:global(.VPDoc:has(.pf) .content) {
  padding: 0 !important;
}
:global(.VPDoc:has(.pf) .VPDocFooter) {
  display: none;
}
.pf {
  --pf-process: var(--gf-nav);
  --pf-local: #8ebfae;
  --pf-service: #a89bd4;
  background: var(--gf-ground-deep);
  color: var(--gf-ink);
  font-family: var(--gf-font-body);
  overflow: clip;
}
:global(html:not(.dark)) .pf {
  --pf-local: #28745c;
  --pf-service: #735298;
}
.pf *,
.pf *::before,
.pf *::after {
  box-sizing: border-box;
}
.pf h1,
.pf h2,
.pf h3,
.pf p {
  margin: 0;
  padding: 0;
  border: 0;
}
.pf h1,
.pf h2,
.pf h3 {
  color: var(--gf-ink);
  font-family: var(--gf-font-display);
}
.pf a {
  text-decoration: none;
}
.pf button,
.pf select {
  font: inherit;
}
.pf button {
  cursor: pointer;
}
.pf a:focus-visible,
.pf button:focus-visible,
.pf select:focus-visible,
.pf summary:focus-visible {
  outline: 2px solid var(--gf-nav);
  outline-offset: 5px;
}
.pf-rail {
  position: relative;
  border-bottom: 1px solid var(--gf-line);
  padding-inline: max(28px, calc((100vw - 1240px) / 2));
}
.pf-rail::after {
  position: absolute;
  content: '';
  width: 5px;
  height: 5px;
  background: var(--gf-accent);
  bottom: -3px;
  left: max(24px, calc((100vw - 1260px) / 2));
}
.pf-kicker,
.pf-mono {
  font: 500 10px/1.5 var(--gf-font-mono);
  letter-spacing: 0.09em;
  text-transform: uppercase;
}
.pf-kicker {
  color: var(--gf-nav);
  display: flex;
  align-items: center;
  gap: 10px;
}
.pf-mark {
  width: 8px;
  height: 8px;
  border: 1px solid var(--gf-accent);
  transform: rotate(45deg);
}
.pf-hero {
  display: block;
  padding-top: 55px;
  padding-bottom: 0;
  background: radial-gradient(
    ellipse 50% 70% at 78% 10%,
    color-mix(in srgb, var(--gf-accent) 7%, transparent),
    transparent 80%
  );
}
.pf-hero h1 {
  font-size: clamp(60px, 6.3vw, 88px);
  line-height: 1.02;
  font-weight: 600;
  letter-spacing: -0.065em;
  margin-top: 24px;
}
.pf-hero h1 em {
  color: var(--gf-accent-hi);
  font-style: normal;
}
.pf-lead {
  margin-top: 27px !important;
  max-width: 450px;
  font-size: 16px;
  line-height: 1.8;
  color: var(--gf-ink-2);
}
.pf-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
  margin-top: 28px;
  font-size: 12px;
  font-weight: 600;
}
.pf-actions a {
  color: var(--gf-nav);
  white-space: nowrap;
}
.pf-actions a.pf-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  background: var(--gf-accent);
  color: var(--gf-on-accent);
  padding: 13px 17px;
  border-radius: 6px;
}
.pf-actions a:hover {
  filter: brightness(1.12);
}
.pf-explorer-tabs svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.pf-section {
  padding-block: 76px;
  scroll-margin-top: 100px;
}
.pf-section-head {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 70px;
  align-items: end;
  margin-bottom: 38px;
}
.pf-section h2,
.pf-closing h2 {
  font-size: clamp(36px, 4vw, 55px);
  font-weight: 500;
  letter-spacing: -0.055em;
  line-height: 1.1;
  margin-top: 18px;
}
.pf-section-head > p,
.pf-section-head > div > p:not(.pf-kicker) {
  max-width: 480px;
  color: var(--gf-ink-2);
  font-size: 14px;
  line-height: 1.8;
}
.pf-section-head .pf-small {
  margin-top: 10px !important;
  font-size: 11px !important;
}
.pf-explorer {
  border: 1px solid var(--gf-line-strong);
  border-radius: 14px;
  overflow: hidden;
}
.pf-explorer-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-bottom: 1px solid var(--gf-line);
}
.pf-explorer-tabs button {
  display: flex;
  align-items: center;
  gap: 14px;
  border-right: 1px solid var(--gf-line);
  padding: 20px 24px;
  color: var(--gf-ink-2);
  font-size: 14px;
  border-bottom: 2px solid transparent;
}
.pf-explorer-tabs button:last-child {
  border-right: 0;
}
.pf-explorer-tabs button > span {
  font: 9px var(--gf-font-mono);
  color: var(--gf-ink-2);
}
.pf-explorer-tabs button svg {
  margin-left: auto;
}
.pf-explorer-tabs button[aria-pressed='true'] {
  border-bottom-color: var(--gf-accent);
  color: var(--gf-ink);
  background: var(--gf-nav-soft);
}
.pf-explorer-tabs button[aria-pressed='true'] svg {
  color: var(--gf-nav);
}
.pf-explorer-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
}
.pf-chart {
  min-width: 0;
  padding: 25px 25px 22px;
}
.pf-chart-title {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 12px;
}
.pf-chart-title h3 {
  font: 500 17px var(--gf-font-display);
  letter-spacing: -0.02em;
}
.pf-chart-title p {
  color: var(--gf-ink-2);
  font: 9px var(--gf-font-mono);
  margin-top: 7px;
}
.pf-scale-label {
  color: var(--gf-ink-2);
  border: 1px solid var(--gf-line);
  border-radius: 4px;
  padding: 4px 6px;
  font: 8px var(--gf-font-mono);
}
.pf-axis {
  padding: 0 91px 0 126px;
  height: 38px;
  margin-top: 15px;
}
.pf-axis > div {
  position: relative;
  height: 100%;
}
.pf-axis span {
  position: absolute;
  bottom: 8px;
  transform: translateX(-50%);
  white-space: nowrap;
  color: var(--gf-ink-2);
  font: 8px var(--gf-font-mono);
}
.pf-axis span.is-first {
  transform: none;
}
.pf-axis span.is-last {
  transform: translateX(-100%);
}
.pf-chart-row {
  display: grid;
  grid-template-columns: 115px minmax(0, 1fr) 80px;
  align-items: center;
  gap: 11px;
  width: 100%;
  min-height: 43px;
  text-align: left;
  padding: 0;
  border-top: 1px solid color-mix(in srgb, var(--gf-line) 55%, transparent);
}
.pf-chart-row.is-selected {
  background: var(--gf-nav-soft);
}
.pf-chart-row:hover {
  background: color-mix(in srgb, var(--gf-surface) 60%, transparent);
}
.pf-row-name {
  font-size: 11px;
  padding-left: 8px;
  color: var(--gf-ink-2);
}
.pf-chart-row.is-selected .pf-row-name {
  color: var(--gf-ink);
}
.pf-chart-row > strong {
  font: 10px var(--gf-font-mono);
  text-align: right;
  padding-right: 5px;
  color: var(--gf-ink);
  white-space: nowrap;
}
.pf-row-track {
  position: relative;
  height: 43px;
}
.pf-gridline {
  position: absolute;
  inset-block: 0;
  width: 1px;
  border-left: 1px dashed var(--gf-line);
}
.pf-row-line {
  position: absolute;
  height: 2px;
  left: 0;
  top: 21px;
  opacity: 0.4;
  background: var(--pf-kind);
}
.pf-row-dot {
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  top: 18.5px;
  transform: translateX(-50%);
  background: var(--pf-kind);
  box-shadow: 0 0 0 3px var(--gf-code-well);
}
.pf-chart-row.is-selected .pf-row-dot {
  width: 9px;
  height: 9px;
  top: 17.5px;
  outline: 1px solid var(--pf-kind);
  outline-offset: 3px;
}
.pf-kind--process {
  --pf-kind: var(--pf-process);
}
.pf-kind--local {
  --pf-kind: var(--pf-local);
}
.pf-kind--service {
  --pf-kind: var(--pf-service);
}
.pf-chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 23px;
}
.pf-chart-legend > span {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--gf-ink-2);
  font: 9px var(--gf-font-mono);
}
.pf-chart-legend i,
.pf-detail-kind i {
  width: 5px;
  height: 5px;
  background: var(--pf-kind);
  border-radius: 50%;
}
.pf-measure-note {
  font: 10px/1.75 var(--gf-font-mono);
  color: var(--gf-ink-2);
  margin-top: 16px !important;
}
.pf-detail {
  padding: 27px 25px;
  border-left: 1px solid var(--gf-line);
  background: var(--gf-code-chrome);
}
.pf-detail > .pf-mono {
  font-size: 8px;
  color: var(--gf-ink-2);
}
.pf-detail h3 {
  font: 500 27px var(--gf-font-display);
  margin-top: 16px;
  letter-spacing: -0.04em;
}
.pf-detail-kind {
  display: flex;
  align-items: center;
  gap: 6px;
  font: 9px var(--gf-font-mono);
  color: var(--gf-ink-2);
  margin-top: 10px;
}
.pf-detail-time {
  display: flex;
  align-items: baseline;
  gap: 9px;
  margin-block: 24px;
}
.pf-detail-time strong {
  font: 500 46px var(--gf-font-display);
  letter-spacing: -0.055em;
}
.pf-detail-time > span {
  color: var(--gf-ink-2);
  font: 10px var(--gf-font-mono);
}
.pf dl {
  margin: 0;
}
.pf dl > div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-top: 1px solid var(--gf-line);
  font: 10px/1.5 var(--gf-font-mono);
}
.pf dt {
  color: var(--gf-ink-2);
}
.pf dd {
  margin: 0;
  color: var(--gf-ink);
}
.pf-detail > p {
  color: var(--gf-ink-2);
  font-size: 11px;
  line-height: 1.8;
  margin-top: 20px;
}
.pf-detail > a {
  display: inline-block;
  font: 9px var(--gf-font-mono);
  color: var(--gf-nav);
  margin-top: 16px;
}
.pf-contract-note {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 20px;
  align-items: center;
  border-top: 1px solid var(--gf-line);
  padding: 19px 24px;
  background: color-mix(in srgb, var(--gf-ground-alt) 45%, transparent);
}
.pf-contract-note .pf-kicker {
  font-size: 8px;
}
.pf-contract-note p {
  font-size: 11px;
  line-height: 1.8;
  color: var(--gf-ink-2);
}
.pf-contract-note a {
  font-size: 10px;
  color: var(--gf-nav);
  white-space: nowrap;
}
.pf-http {
  background: var(--gf-code-chrome);
}
.pf-http h2 code {
  font-family: var(--gf-font-mono);
  font-size: 0.87em;
  background: none;
  padding: 0;
  color: var(--gf-reference);
}
.pf-http-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 80px;
}
.pf-http-summary select {
  display: block;
  width: 100%;
  padding: 12px 32px 12px 12px;
  appearance: auto;
  background: var(--gf-ground-alt);
  color: var(--gf-ink);
  border: 1px solid var(--gf-line-strong);
  border-radius: 6px;
  margin-top: 12px;
  font-size: 11px;
}
.pf-http-summary > .pf-mono {
  color: var(--gf-ink-2);
  font-size: 9px;
}
.pf-http-number {
  margin-top: 28px;
}
.pf-http-number > span {
  font: 10px var(--gf-font-mono);
  color: var(--gf-nav);
}
.pf-http-number strong {
  display: block;
  font: 500 65px/1 var(--gf-font-display);
  letter-spacing: -0.06em;
  margin-top: 10px;
}
.pf-http-number small {
  display: block;
  color: var(--gf-ink-2);
  font: 10px/1.6 var(--gf-font-mono);
  margin-top: 8px;
  letter-spacing: 0;
}
.pf-http-reference {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  font: 10px var(--gf-font-mono);
  border-block: 1px solid var(--gf-line);
  padding-block: 15px;
  margin-top: 24px;
}
.pf-http-reference span {
  color: var(--gf-ink-2);
}
.pf-http-summary > p {
  font-size: 12px;
  line-height: 1.8;
  color: var(--gf-ink-2);
  margin-top: 18px;
}
.pf-http-summary > p.pf-small {
  font-size: 10px;
}
.pf-http-chart {
  padding-top: 24px;
  min-width: 0;
}
.pf-http-axis {
  height: 24px;
  position: relative;
  margin: 0 64px 0 145px;
}
.pf-http-axis span {
  position: absolute;
  transform: translateX(-50%);
  color: var(--gf-ink-2);
  font: 8px var(--gf-font-mono);
  white-space: nowrap;
}
.pf-http-axis span:first-child {
  transform: none;
}
.pf-http-axis span:last-child {
  transform: translateX(-100%);
}
.pf-http-row {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr) 50px;
  gap: 15px;
  align-items: center;
  min-height: 55px;
  border-top: 1px solid var(--gf-line);
}
.pf-http-row-title strong {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: var(--gf-ink-2);
}
.pf-http-row-title span {
  font: 8px var(--gf-font-mono);
  color: var(--gf-ink-2);
}
.pf-http-track {
  height: 5px;
  background: var(--gf-line);
}
.pf-http-track > span {
  display: block;
  height: 100%;
  background: var(--gf-ink-3);
}
.pf-http-rate {
  font: 10px var(--gf-font-mono);
  text-align: right;
  color: var(--gf-ink-2);
}
.pf-http-row.is-goforj .pf-http-row-title strong,
.pf-http-row.is-goforj .pf-http-rate {
  color: var(--gf-nav);
}
.pf-http-row.is-goforj .pf-http-track > span {
  background: var(--gf-accent);
  box-shadow: 0 0 18px var(--gf-accent-soft);
}
.pf-http-chart > .pf-measure-note {
  margin-top: 24px !important;
}
.pf-method-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 80px;
}
.pf-conditions h3 {
  font: 500 16px var(--gf-font-display);
  margin-bottom: 20px;
}
.pf-conditions p {
  color: var(--gf-ink-2);
  font-size: 11px;
  line-height: 1.8;
  margin-top: 20px;
}
.pf-conditions > a {
  display: inline-block;
  color: var(--gf-nav);
  font-size: 10px;
  margin-top: 16px;
}
.pf-source-list {
  min-width: 0;
}
.pf-source-list > a {
  display: grid;
  grid-template-columns: 75px 1fr 66px 12px;
  gap: 15px;
  padding: 18px 0;
  align-items: center;
  border-bottom: 1px solid var(--gf-line);
}
.pf-source-name {
  color: var(--gf-ink);
  font: 500 13px var(--gf-font-display);
  text-transform: capitalize;
}
.pf-source-path {
  color: var(--gf-ink-2);
  font: 9px var(--gf-font-mono);
}
.pf-source-list a code {
  color: var(--gf-reference);
  padding: 0;
  background: none;
  font-size: 9px;
}
.pf-source-list a > span:last-child {
  color: var(--gf-nav);
}
.pf-source-list details {
  margin-top: 18px;
}
.pf-source-list summary {
  color: var(--gf-ink-2);
  font: 10px var(--gf-font-mono);
  cursor: pointer;
}
.pf-source-list details > div {
  margin-top: 16px;
}
.pf-source-list details strong {
  font: 10px var(--gf-font-mono);
}
.pf-source-list details code {
  display: block;
  overflow-wrap: anywhere;
  font-size: 9px;
  background: none;
  padding: 5px 0;
  color: var(--gf-ink-2);
}
.pf-limits {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 80px;
  padding-top: 30px;
  margin-top: 35px;
  border-top: 1px solid var(--gf-line);
}
.pf-limits > span {
  color: var(--gf-nav);
  font-size: 9px;
}
.pf-limits p {
  color: var(--gf-ink-2);
  font-size: 11px;
  line-height: 1.8;
}
.pf-closing {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 70px;
  align-items: center;
  padding-block: 65px;
}
.pf-closing h2 {
  margin-top: 15px;
  font-size: 46px;
}
.pf-closing > div > p:not(.pf-kicker) {
  font-size: 13px;
  line-height: 1.9;
  max-width: 480px;
  color: var(--gf-ink-2);
}

.pf-hero-heading {
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;
  gap: 65px;
  align-items: end;
}
.pf-hero-intro {
  padding-bottom: 5px;
}
.pf-hero-intro .pf-lead {
  font-size: 15px;
  line-height: 1.85;
  margin-top: 0 !important;
}
.pf-hero-intro > p:not(.pf-lead) {
  color: var(--gf-ink-2);
  font-size: 12px;
  line-height: 1.85;
  margin-top: 15px;
}
.pf-hero-intro > a {
  display: inline-block;
  margin-top: 20px;
  font-size: 12px;
  color: var(--gf-nav);
}
.pf-hero-intro > a span {
  margin-left: 20px;
}
@media (prefers-reduced-motion: no-preference) {
  :global(html:not([data-gf-motion='reduced'])) .pf-row-dot,
  :global(html:not([data-gf-motion='reduced'])) .pf-row-line {
    transition:
      left 0.25s,
      width 0.25s;
  }
}
:global(html[data-gf-motion='on']) .pf-row-dot,
:global(html[data-gf-motion='on']) .pf-row-line {
  transition:
    left 0.25s,
    width 0.25s;
}
@media (max-width: 1100px) {
  .pf-hero {
    gap: 30px;
  }
  .pf-hero h1 {
    font-size: 65px;
  }
  .pf-explorer-body {
    grid-template-columns: minmax(0, 1fr) 240px;
  }
  .pf-http-layout,
  .pf-method-layout,
  .pf-limits {
    gap: 45px;
    grid-template-columns: 270px 1fr;
  }
  .pf-explorer-tabs button {
    padding: 18px;
  }
  .pf-source-path {
    display: none;
  }
  .pf-source-list > a {
    grid-template-columns: 1fr 80px 12px;
  }
}
@media (max-width: 800px) {
  .pf-hero {
    grid-template-columns: 1fr;
    padding-top: 42px;
    padding-bottom: 40px;
  }
  .pf-hero h1 {
    font-size: 64px;
  }
  .pf-lead {
    max-width: 540px;
  }
  .pf-section {
    padding-block: 48px;
  }
  .pf-section-head {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 30px;
  }
  .pf-section-head > p,
  .pf-section-head > div > p:not(.pf-kicker) {
    max-width: 600px;
  }
  .pf-explorer-body {
    grid-template-columns: 1fr;
  }
  .pf-detail {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 30px;
    padding: 25px;
    border-left: 0;
    border-top: 1px solid var(--gf-line);
  }
  .pf-detail > .pf-mono,
  .pf-detail > p,
  .pf-detail > a {
    grid-column: 1 / -1;
  }
  .pf-detail > h3,
  .pf-detail > .pf-detail-kind {
    grid-column: 1;
  }
  .pf-detail-time {
    grid-column: 2;
    grid-row: 2 / 4;
    margin: 15px 0 0;
  }
  .pf-detail dl {
    grid-column: 1 / -1;
    margin-top: 20px;
  }
  .pf-detail-time strong {
    font-size: 40px;
  }
  .pf-contract-note {
    grid-template-columns: 1fr;
    gap: 9px;
  }
  .pf-http-layout,
  .pf-method-layout,
  .pf-limits {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  .pf-http-summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 35px;
  }
  .pf-http-summary > label,
  .pf-http-summary > select,
  .pf-http-summary > p {
    grid-column: 1 / -1;
  }
  .pf-http-reference {
    display: block;
    align-self: center;
  }
  .pf-http-reference strong {
    display: block;
    margin-top: 10px;
  }
  .pf-http-chart {
    padding-top: 5px;
  }
  .pf-source-path {
    display: inline;
  }
  .pf-source-list > a {
    grid-template-columns: 75px 1fr 66px 12px;
  }
  .pf-closing {
    grid-template-columns: 1fr;
    gap: 25px;
    padding-block: 45px;
  }
}
@media (max-width: 480px) {
  .pf-rail {
    padding-inline: 20px;
  }
  .pf-rail::after {
    left: 17px;
  }
  .pf-hero h1 {
    font-size: 55px;
  }
  .pf-lead {
    font-size: 14px;
  }
  .pf-hero .pf-actions {
    gap: 18px;
    font-size: 11px;
  }
  .pf-hero .pf-primary {
    gap: 15px;
  }
  .pf-section h2 {
    font-size: 38px;
  }
  .pf-explorer-tabs button {
    font-size: 12px;
    gap: 6px;
    padding: 15px 10px;
  }
  .pf-explorer-tabs button > span {
    font-size: 8px;
  }
  .pf-explorer-tabs svg {
    display: none;
  }
  .pf-chart {
    padding: 20px 12px;
  }
  .pf-chart-row {
    grid-template-columns: 88px minmax(0, 1fr) 65px;
    gap: 7px;
    min-height: 45px;
  }
  .pf-row-name {
    font-size: 10px;
    padding-left: 4px;
  }
  .pf-chart-row > strong {
    font-size: 9px;
  }
  .pf-axis {
    padding-left: 95px;
    padding-right: 72px;
  }
  .pf-axis span {
    font-size: 7px;
  }
  .pf-axis span:nth-child(even):not(:last-child) {
    visibility: hidden;
  }
  .pf-chart-title h3 {
    font-size: 15px;
  }
  .pf-chart-legend {
    gap: 12px;
  }
  .pf-chart-legend > span {
    font-size: 8px;
  }
  .pf-detail {
    padding: 22px 18px;
  }
  .pf-http-summary {
    column-gap: 20px;
  }
  .pf-http-number strong {
    font-size: 54px;
  }
  .pf-http-reference {
    font-size: 9px;
  }
  .pf-http-row {
    grid-template-columns: 96px minmax(0, 1fr) 45px;
    gap: 10px;
  }
  .pf-http-row-title strong {
    font-size: 10px;
  }
  .pf-http-row-title span {
    font-size: 7px;
  }
  .pf-http-rate {
    font-size: 9px;
  }
  .pf-http-axis {
    margin-left: 106px;
    margin-right: 55px;
  }
  .pf-http-axis span {
    font-size: 7px;
  }
  .pf-source-path {
    display: none;
  }
  .pf-source-list > a {
    grid-template-columns: 1fr 80px 12px;
  }
  .pf-closing h2 {
    font-size: 38px;
  }
}

@media (max-width: 800px) {
  .pf-hero {
    padding-bottom: 0;
  }
  .pf-hero-heading {
    grid-template-columns: 1fr;
    gap: 25px;
  }
  .pf-hero h1 {
    font-size: 64px;
  }
  .pf-hero-intro {
    max-width: 560px;
  }
}
@media (max-width: 480px) {
  .pf-hero {
    padding-top: 32px;
  }
  .pf-hero h1 {
    font-size: 54px;
  }
  .pf-hero-intro .pf-lead {
    font-size: 14px;
  }
}
</style>
