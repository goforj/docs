<script setup>
import { computed, ref } from 'vue'
import evidence from '../../data/performance-stats.json'
import PerformanceLens from './PerformanceLens.vue'
import PerformanceHTTP from './PerformanceHTTP.vue'

const selectedSuite = ref('cache')
const selectedRow = ref('Memory')
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
const category = (kind) =>
  ({ process: 'In process', local: 'Host-local', service: 'Service boundary' })[kind]
const sourceURL = (s) => `https://github.com/goforj/${s.repo}/blob/${s.revision}/${s.path}`
const changeSuite = (id) => {
  selectedSuite.value = id
  selectedRow.value = suites[id].local
}
const service = computed(() => story.value.rows.find((row) => row.label === suite.value.service))
const ratio = computed(() =>
  Math.round(service.value.value / local.value.value).toLocaleString('en-US'),
)
</script>

<template>
  <main class="ps">
    <section class="ps-opening ps-rail">
      <div class="ps-eyebrow">
        <span class="ps-brand-mark" aria-hidden="true">◇</span> GOFORJ / PERFORMANCE
        <span class="ps-edition">THE MEASURED EDITION</span>
      </div>
      <h1>Every boundary<br />has a <em>price.</em></h1>
      <div class="ps-opening-bottom">
        <p>Pay for the ones<br />your application needs.</p>
        <div>
          Start with local drivers. Add infrastructure for shared state, independent workers, or
          different delivery guarantees. Keep your application behind the same library contracts.<a
            href="#latency"
            >See what a boundary costs <span>↓</span></a
          >
        </div>
      </div>
      <div class="ps-orbit" aria-hidden="true">
        <svg viewBox="0 0 750 650" fill="none">
          <defs>
            <linearGradient id="ps-orbit-color">
              <stop stop-color="var(--gf-accent)" stop-opacity="0" />
              <stop offset=".5" stop-color="var(--gf-accent-hi)" />
              <stop offset="1" stop-color="var(--gf-nav)" stop-opacity=".12" />
            </linearGradient>
          </defs>
          <g transform="translate(375 325) rotate(-32)">
            <ellipse
              v-for="i in 19"
              :key="i"
              :rx="80 + i * 12"
              :ry="35 + i * 8"
              stroke="url(#ps-orbit-color)"
              :stroke-width="i === 10 ? 2 : 0.65"
            />
            <path d="M-325 0H325" stroke="var(--gf-line-strong)" />
            <path d="M0-220V220" stroke="var(--gf-line-strong)" />
            <rect
              x="-22"
              y="-22"
              width="44"
              height="44"
              fill="var(--gf-ground-deep)"
              stroke="var(--gf-accent)"
            />
            <path
              d="m-12-5 12-7 12 7v15l-12 7-12-7V-5Zm0 0L0 2l12-7M0 2v15"
              stroke="var(--gf-accent-hi)"
              stroke-width="1.5"
            />
          </g>
          <circle cx="606" cy="182" r="4" fill="var(--gf-nav)" />
          <circle cx="175" cy="428" r="3" fill="var(--gf-accent)" /></svg
        ><span>APPLICATION → DRIVER → INFRASTRUCTURE</span>
      </div>
    </section>
    <nav class="ps-chapters ps-rail" aria-label="Performance chapters">
      <a href="#latency"><span>01</span> Feel the difference</a
      ><a href="#drivers"><span>02</span> Inspect the tradeoff</a
      ><a href="#http"><span>03</span> Follow the request</a>
    </nav>

    <section id="latency" class="ps-section ps-rail">
      <div class="ps-heading">
        <div>
          <p class="ps-kicker">01 / A CLOSER LOOK AT TIME</p>
          <h2>Small numbers.<br /><em>Very different work.</em></h2>
        </div>
        <p>
          A nanosecond is hard to picture. Put two operations on the same clock and the difference
          becomes visible. Zoom in. Zoom out. Replay the recorded timings.
        </p>
      </div>
      <div class="ps-operation-tabs" role="group" aria-label="Choose an operation">
        <button
          v-for="(item, id) in suites"
          :key="id"
          :aria-pressed="selectedSuite === id"
          @click="changeSuite(id)"
        >
          <span>0{{ Object.keys(suites).indexOf(id) + 1 }}</span
          ><strong>{{ item.name }}</strong
          ><small>{{ item.operation }}</small
          ><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path :d="item.icon" /></svg>
        </button>
      </div>
      <PerformanceLens
        :local="local"
        :service="service"
        :operation="suite.operation"
        :local-config="suite.localConfig"
        :service-config="suite.serviceConfig"
      />
      <div class="ps-takeaway">
        <div>
          <span class="ps-kicker">IN THIS RECORDED COMPARISON</span
          ><strong>{{ ratio }}<span>×</span></strong>
          <p>
            the time per operation<br /><span
              >{{ service.label }} compared with {{ local.label }}</span
            >
          </p>
        </div>
        <div>
          <h3>That extra work buys something.</h3>
          <p>{{ suite.limit }}</p>
          <p class="ps-small">
            {{ suite.measurement }} These local harness results describe the fixture, not your
            production network.
          </p>
          <a href="/drivers">Choose the guarantees your app needs ↗</a>
        </div>
      </div>
    </section>

    <section id="drivers" class="ps-section ps-rail ps-drivers">
      <div class="ps-heading">
        <div>
          <p class="ps-kicker">02 / NOTHING HIDDEN IN THE AVERAGE</p>
          <h2>Open the<br /><em>whole picture.</em></h2>
        </div>
        <p>
          Every measured driver in the selected library. Select a row to see its allocation cost and
          exact source. Compare within a suite: each one measures a different operation.
        </p>
      </div>
      <div class="ps-driver-toolbar">
        <label for="ps-library">LIBRARY</label
        ><select id="ps-library" :value="selectedSuite" @change="changeSuite($event.target.value)">
          <option v-for="(item, id) in suites" :key="id" :value="id">
            {{ item.name }} / {{ item.operation }}
          </option></select
        ><span>Time per operation · lower is faster</span>
      </div>
      <div class="ps-driver-layout">
        <div class="ps-driver-plot">
          <div class="ps-log-axis" aria-hidden="true">
            <span v-for="tick in decades" :key="tick" :style="{ left: `${position(tick)}%` }">{{
              time(tick)
            }}</span>
          </div>
          <div role="group" :aria-label="`${suite.name} driver measurements`">
            <button
              v-for="row in rows"
              :key="row.label"
              class="ps-driver-row"
              :class="[`ps-kind--${row.kind}`, { 'is-selected': detail.label === row.label }]"
              :aria-pressed="detail.label === row.label"
              @click="selectedRow = row.label"
            >
              <span>{{ row.label }}</span>
              <div class="ps-driver-track" aria-hidden="true">
                <i v-for="tick in decades" :key="tick" :style="{ left: `${position(tick)}%` }"></i
                ><b :style="{ width: `${position(row.value)}%` }"></b
                ><em :style="{ left: `${position(row.value)}%` }"></em>
              </div>
              <strong>{{ time(row.value) }}</strong>
            </button>
          </div>
          <div class="ps-legend">
            <span class="ps-kind--process"><i></i>In process</span
            ><span class="ps-kind--local"><i></i>Host-local</span
            ><span class="ps-kind--service"><i></i>Service boundary</span>
          </div>
          <p class="ps-chart-note">
            Logarithmic time axis. Each grid interval is 10×. Service fixtures run in local
            containers or emulators.
          </p>
        </div>
        <aside class="ps-inspect" aria-live="polite" aria-atomic="true">
          <p class="ps-kicker">UNDER THE LENS</p>
          <h3>{{ detail.label }}</h3>
          <span class="ps-inspect-kind">{{ category(detail.kind) }}</span>
          <div class="ps-inspect-value">
            {{ latency(detail.value).number }}<span>{{ latency(detail.value).unit }} / op</span>
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
    </section>

    <section id="http" class="ps-section ps-rail ps-http">
      <div class="ps-heading">
        <div>
          <p class="ps-kicker">03 / THE HTTP PATH</p>
          <h2>Your framework<br />shouldn't be<br /><em>the workload.</em></h2>
        </div>
        <div>
          <p>
            GoForj Web measured beside <code>net/http</code> and other Go routers. One harness. Four
            workloads. Every result included.
          </p>
          <p class="ps-small">
            These measure the Web library, not a complete generated application with database
            queries, authentication, and business logic.
          </p>
        </div>
      </div>
      <PerformanceHTTP
        :web="evidence.web"
        :source="sourceURL(evidence.sources.find((s) => s.repo === 'web'))"
      />
    </section>

    <section class="ps-closing ps-rail">
      <p class="ps-kicker">LESS INFRASTRUCTURE UNTIL YOU NEED MORE</p>
      <h2>Start close.<br /><em>Go further.</em></h2>
      <div>
        <p>
          One application model. Local implementations to start. Infrastructure when the work calls
          for it.
        </p>
        <a class="ps-cta" href="/getting-started/quickstart">Build your first app <span>↗</span></a
        ><a href="/drivers">Explore the drivers ↗</a>
      </div>
    </section>
  </main>
</template>
<style scoped>
:global(.VPDoc:has(.ps)) {
  padding: 0 !important;
}
:global(.VPDoc:has(.ps) .container),
:global(.VPDoc:has(.ps) .content),
:global(.VPDoc:has(.ps) .content-container),
:global(.VPDoc:has(.ps) .main),
:global(.VPDoc:has(.ps) .vp-doc) {
  width: 100% !important;
  max-width: none !important;
}
:global(.VPDoc:has(.ps) .container),
:global(.VPDoc:has(.ps) .content) {
  padding: 0 !important;
}
:global(.VPDoc:has(.ps) .VPDocFooter) {
  display: none;
}
.ps {
  --ps-process: var(--gf-nav);
  --ps-local: #8ebfae;
  --ps-service: #b5a2dd;
  background: var(--gf-ground-deep);
  color: var(--gf-ink);
  font-family: var(--gf-font-body);
  overflow: clip;
}
:global(html:not(.dark)) .ps {
  --ps-local: #28745c;
  --ps-service: #735298;
}
.ps *,
.ps *::before,
.ps *::after {
  box-sizing: border-box;
}
.ps h1,
.ps h2,
.ps h3,
.ps p {
  margin: 0;
  padding: 0;
  border: 0;
}
.ps h1,
.ps h2,
.ps h3 {
  font-family: var(--gf-font-display);
  color: var(--gf-ink);
}
.ps a {
  text-decoration: none;
  color: var(--gf-nav);
}
.ps button,
.ps select {
  font: inherit;
}
.ps a:focus-visible,
.ps button:focus-visible,
.ps select:focus-visible,
.ps summary:focus-visible {
  outline: 2px solid var(--gf-nav);
  outline-offset: 5px;
}
.ps em {
  font-style: normal;
  color: var(--gf-accent-hi);
}
.ps code {
  background: none;
  padding: 0;
  color: inherit;
}
.ps-rail {
  position: relative;
  padding-inline: max(28px, calc((100vw - 1240px) / 2));
  border-bottom: 1px solid var(--gf-line);
}
.ps-rail::after {
  position: absolute;
  content: '';
  width: 5px;
  height: 5px;
  background: var(--gf-accent);
  bottom: -3px;
  left: max(25px, calc((100vw - 1246px) / 2));
}
.ps-kicker {
  font: 10px/1.6 var(--gf-font-mono);
  letter-spacing: 0.08em;
  color: var(--gf-reference);
}
.ps-opening {
  position: relative;
  isolation: isolate;
  padding-top: 48px;
  padding-bottom: 62px;
  min-height: 740px;
  overflow: hidden;
  background: radial-gradient(
    ellipse at 80% 50%,
    color-mix(in srgb, var(--gf-accent) 6%, transparent),
    transparent 65%
  );
}
.ps-eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;
  font: 10px var(--gf-font-mono);
  letter-spacing: 0.08em;
  color: var(--gf-reference);
}
.ps-brand-mark {
  font-size: 22px;
  color: var(--gf-accent);
}
.ps-edition {
  margin-left: auto;
  color: var(--gf-ink-2);
  font-size: 9px;
}
.ps-opening h1 {
  font-size: clamp(90px, 9.9vw, 146px);
  font-weight: 500;
  line-height: 0.98;
  letter-spacing: -0.075em;
  margin-top: 60px;
  max-width: 950px;
  position: relative;
  z-index: 1;
}
.ps-opening h1 em {
  color: var(--gf-accent-hi);
}
.ps-opening-bottom {
  display: flex;
  gap: 80px;
  align-items: start;
  margin-top: 45px;
  position: relative;
  z-index: 1;
  max-width: 780px;
}
.ps-opening-bottom > p {
  font: 500 26px/1.25 var(--gf-font-display);
  letter-spacing: -0.04em;
  min-width: 250px;
}
.ps-opening-bottom > div {
  max-width: 380px;
  font-size: 13px;
  line-height: 1.9;
  color: var(--gf-ink-2);
}
.ps-opening-bottom a {
  display: block;
  margin-top: 20px;
  font-size: 11px;
  color: var(--gf-nav);
}
.ps-opening-bottom a span {
  margin-left: 20px;
}
.ps-orbit {
  position: absolute;
  width: 750px;
  right: -140px;
  top: 125px;
  z-index: 0;
  pointer-events: none;
  opacity: 0.7;
}
.ps-orbit svg {
  width: 100%;
  height: auto;
  overflow: visible;
}
.ps-orbit > span {
  position: absolute;
  bottom: 70px;
  left: 220px;
  font: 8px var(--gf-font-mono);
  letter-spacing: 0.12em;
  color: var(--gf-ink-2);
  transform: rotate(-32deg);
}
.ps-chapters {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding-block: 22px;
  gap: 20px;
}
.ps-chapters a {
  font-size: 11px;
  color: var(--gf-ink-2);
  display: flex;
  gap: 15px;
  align-items: center;
}
.ps-chapters a:hover {
  color: var(--gf-ink);
}
.ps-chapters a span {
  font: 10px var(--gf-font-mono);
  color: var(--gf-accent-hi);
}
.ps-section {
  padding-top: 100px;
  padding-bottom: 90px;
  scroll-margin-top: 70px;
}
.ps-heading {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 90px;
  align-items: end;
  margin-bottom: 45px;
}
.ps-heading h2 {
  font-size: clamp(46px, 4.9vw, 70px);
  line-height: 1.05;
  letter-spacing: -0.06em;
  font-weight: 500;
  margin-top: 22px;
}
.ps-heading > p,
.ps-heading > div > p:not(.ps-kicker) {
  font-size: 14px;
  line-height: 1.9;
  color: var(--gf-ink-2);
  max-width: 420px;
}
.ps-heading .ps-small {
  font-size: 11px !important;
  margin-top: 16px !important;
}
.ps-small {
  font-size: 11px !important;
  line-height: 1.85 !important;
  color: var(--gf-ink-2);
}
.ps-operation-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 50px 0 32px;
  border-top: 1px solid var(--gf-line-strong);
  border-bottom: 1px solid var(--gf-line-strong);
}
.ps-operation-tabs button {
  position: relative;
  display: grid;
  grid-template-columns: 25px 1fr;
  gap: 6px;
  padding: 24px 20px;
  text-align: left;
  border-right: 1px solid var(--gf-line);
  cursor: pointer;
  border-top: 2px solid transparent;
  margin-top: -1px;
}
.ps-operation-tabs button:first-child {
  padding-left: 0;
}
.ps-operation-tabs button:last-child {
  border-right: 0;
}
.ps-operation-tabs button[aria-pressed='true'] {
  border-top-color: var(--gf-accent);
  background: linear-gradient(color-mix(in srgb, var(--gf-accent) 6%, transparent), transparent);
}
.ps-operation-tabs button > span {
  font: 9px var(--gf-font-mono);
  color: var(--gf-ink-2);
  padding-top: 5px;
}
.ps-operation-tabs strong {
  font: 500 18px var(--gf-font-display);
}
.ps-operation-tabs small {
  grid-column: 2;
  font: 9px/1.5 var(--gf-font-mono);
  color: var(--gf-ink-2);
}
.ps-operation-tabs svg {
  position: absolute;
  right: 20px;
  top: 27px;
  width: 18px;
  height: 18px;
  stroke: var(--gf-ink-2);
  stroke-width: 1.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ps-operation-tabs button[aria-pressed='true'] svg {
  stroke: var(--gf-accent-hi);
}
.ps-takeaway {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 100px;
  padding-top: 65px;
  margin-top: 35px;
  border-top: 1px solid var(--gf-line);
}
.ps-takeaway > div:first-child > strong {
  display: block;
  font: 500 clamp(85px, 11vw, 154px) / 1.1 var(--gf-font-display);
  letter-spacing: -0.08em;
  color: var(--gf-accent-hi);
  margin-top: 12px;
}
.ps-takeaway > div:first-child > strong > span {
  font-size: 0.45em;
  margin-left: 10px;
}
.ps-takeaway > div:first-child > p {
  font-size: 15px;
  line-height: 1.7;
}
.ps-takeaway > div:first-child > p > span {
  font: 10px var(--gf-font-mono);
  color: var(--gf-ink-2);
}
.ps-takeaway > div:last-child {
  padding-top: 30px;
}
.ps-takeaway h3 {
  font-size: 26px;
  letter-spacing: -0.035em;
  font-weight: 500;
}
.ps-takeaway > div:last-child p {
  color: var(--gf-ink-2);
  font-size: 14px;
  line-height: 1.9;
  margin-top: 20px;
}
.ps-takeaway a {
  font-size: 11px;
  display: inline-block;
  margin-top: 22px;
}
.ps-drivers {
  background: var(--gf-ground-alt);
}
.ps-driver-toolbar {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-block: 20px;
  border-block: 1px solid var(--gf-line-strong);
}
.ps-driver-toolbar label {
  font: 9px var(--gf-font-mono);
  color: var(--gf-ink-2);
}
.ps select {
  border: 1px solid var(--gf-line-strong);
  border-radius: 4px;
  padding: 10px 36px 10px 12px;
  color: var(--gf-ink);
  background: var(--gf-ground-deep);
  font-size: 12px;
  max-width: 100%;
}
.ps-driver-toolbar > span {
  margin-left: auto;
  font: 9px var(--gf-font-mono);
  color: var(--gf-ink-2);
}
.ps-driver-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 45px;
  padding-top: 35px;
}
.ps-driver-plot {
  min-width: 0;
}
.ps-log-axis {
  position: relative;
  height: 30px;
  margin-left: 145px;
  margin-right: 85px;
  font: 8px var(--gf-font-mono);
  color: var(--gf-ink-2);
}
.ps-log-axis > span {
  position: absolute;
  transform: translateX(-50%);
  white-space: nowrap;
}
.ps-log-axis > span:first-child {
  transform: none;
}
.ps-log-axis > span:last-child {
  transform: translateX(-100%);
}
.ps-driver-row {
  display: grid;
  grid-template-columns: 135px 1fr 75px;
  gap: 10px;
  width: 100%;
  align-items: center;
  text-align: left;
  padding: 12px 0;
  border-block: 1px solid transparent;
  cursor: pointer;
  --dot: var(--ps-service);
}
.ps-driver-row:hover {
  background: color-mix(in srgb, var(--gf-ink) 3%, transparent);
}
.ps-kind--process {
  --dot: var(--ps-process);
}
.ps-kind--local {
  --dot: var(--ps-local);
}
.ps-kind--service {
  --dot: var(--ps-service);
}
.ps-driver-row.is-selected {
  background: color-mix(in srgb, var(--dot) 8%, transparent);
  border-block-color: color-mix(in srgb, var(--dot) 15%, transparent);
}
.ps-driver-row > span {
  font-size: 11px;
  padding-left: 10px;
}
.ps-driver-row > strong {
  font: 10px var(--gf-font-mono);
  text-align: right;
  padding-right: 6px;
}
.ps-driver-track {
  position: relative;
  height: 22px;
}
.ps-driver-track > i {
  position: absolute;
  top: -15px;
  bottom: -15px;
  border-left: 1px solid var(--gf-line-strong);
  opacity: 0.6;
}
.ps-driver-track > b {
  position: absolute;
  top: 11px;
  left: 0;
  height: 1px;
  background: var(--dot);
  opacity: 0.5;
}
.ps-driver-track > em {
  position: absolute;
  top: 8px;
  width: 6px;
  height: 6px;
  background: var(--dot);
  border-radius: 50%;
  transform: translateX(-50%);
}
.is-selected .ps-driver-track > em {
  outline: 1px solid var(--dot);
  outline-offset: 4px;
}
.ps-legend {
  display: flex;
  gap: 20px;
  margin-top: 25px;
  font: 9px var(--gf-font-mono);
  color: var(--gf-ink-2);
}
.ps-legend > span {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ps-legend i {
  width: 4px;
  height: 4px;
  background: var(--dot);
  border-radius: 50%;
}
.ps-chart-note {
  font: 9px/1.8 var(--gf-font-mono);
  color: var(--gf-ink-2);
  margin-top: 18px !important;
}
.ps-inspect {
  border-left: 1px solid var(--gf-line-strong);
  padding: 0 0 0 30px;
}
.ps-inspect h3 {
  font-size: 25px;
  letter-spacing: -0.04em;
  font-weight: 500;
  margin-top: 18px;
}
.ps-inspect-kind {
  font: 9px var(--gf-font-mono);
  color: var(--gf-ink-2);
  display: block;
  margin-top: 6px;
}
.ps-inspect-value {
  font: 500 58px/1.1 var(--gf-font-display);
  letter-spacing: -0.065em;
  margin: 30px 0;
}
.ps-inspect-value > span {
  font: 11px var(--gf-font-mono);
  color: var(--gf-ink-2);
  letter-spacing: 0;
  margin-left: 8px;
}
.ps dl {
  margin: 0;
}
.ps dl > div {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  border-bottom: 1px solid var(--gf-line-strong);
  padding: 12px 0;
  font: 10px var(--gf-font-mono);
}
.ps dt {
  color: var(--gf-ink-2);
}
.ps dd {
  margin: 0;
}
.ps-inspect > p:not(.ps-kicker) {
  font-size: 11px;
  line-height: 1.85;
  color: var(--gf-ink-2);
  margin-top: 20px;
}
.ps-inspect > a {
  display: block;
  font: 9px var(--gf-font-mono);
  margin-top: 20px;
}
.ps-http {
  background: radial-gradient(
    ellipse at 0 20%,
    color-mix(in srgb, var(--gf-accent) 5%, transparent),
    transparent 60%
  );
}
.ps-closing {
  padding-block: 80px 90px;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 20px 90px;
  background: var(--gf-ground-alt);
}
.ps-closing > .ps-kicker {
  grid-column: 1/-1;
}
.ps-closing h2 {
  font: 500 clamp(70px, 8vw, 116px) / 0.98 var(--gf-font-display);
  letter-spacing: -0.075em;
}
.ps-closing > div {
  align-self: end;
  padding-bottom: 5px;
}
.ps-closing > div > p {
  font-size: 15px;
  line-height: 1.9;
  color: var(--gf-ink-2);
  max-width: 360px;
}
.ps-closing > div > a {
  display: inline-block;
  font-size: 11px;
  margin-top: 28px;
}
.ps-closing .ps-cta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--gf-accent);
  color: var(--gf-on-accent);
  border-radius: 5px;
  padding: 17px 20px;
  max-width: 280px;
  font-size: 12px;
  font-weight: 600;
}
@media (max-width: 1100px) {
  .ps-orbit {
    right: -280px;
    opacity: 0.45;
  }
  .ps-opening h1 {
    font-size: 112px;
  }
  .ps-heading {
    gap: 40px;
  }
  .ps-driver-layout {
    grid-template-columns: 1fr 230px;
    gap: 25px;
  }
  .ps-driver-row {
    grid-template-columns: 110px 1fr 70px;
  }
  .ps-log-axis {
    margin-left: 120px;
    margin-right: 80px;
  }
  .ps-operation-tabs svg {
    display: none;
  }
  .ps-inspect {
    padding-left: 20px;
  }
  .ps-inspect-value {
    font-size: 48px;
  }
}
@media (max-width: 760px) {
  .ps-rail {
    padding-inline: 24px;
  }
  .ps-opening {
    padding-top: 30px;
    min-height: 0;
    padding-bottom: 45px;
  }
  .ps-edition {
    display: none;
  }
  .ps-opening h1 {
    font-size: clamp(65px, 12vw, 90px);
    margin-top: 40px;
  }
  .ps-opening-bottom {
    display: block;
    margin-top: 30px;
  }
  .ps-opening-bottom > p {
    font-size: 25px;
  }
  .ps-opening-bottom > div {
    margin-top: 22px;
    max-width: 330px;
    font-size: 12px;
  }
  .ps-orbit {
    width: 480px;
    right: -300px;
    top: 110px;
    opacity: 0.25;
  }
  .ps-chapters {
    grid-template-columns: 1fr 1fr;
    gap: 20px 12px;
  }
  .ps-chapters a {
    font-size: 10px;
    gap: 10px;
  }
  .ps-section {
    padding-block: 60px;
  }
  .ps-heading {
    display: block;
    margin-bottom: 30px;
  }
  .ps-heading h2 {
    font-size: 48px;
  }
  .ps-heading > p,
  .ps-heading > div:last-child:not(:first-child) {
    margin-top: 25px;
  }
  .ps-heading > p,
  .ps-heading > div > p:not(.ps-kicker) {
    font-size: 13px;
  }
  .ps-operation-tabs {
    grid-template-columns: 1fr 1fr;
    margin-top: 30px;
  }
  .ps-operation-tabs button {
    padding: 20px 12px;
    border-bottom: 1px solid var(--gf-line);
  }
  .ps-operation-tabs button:first-child {
    padding-left: 12px;
  }
  .ps-operation-tabs button:nth-child(even) {
    border-right: 0;
  }
  .ps-operation-tabs strong {
    font-size: 17px;
  }
  .ps-operation-tabs small {
    font-size: 8px;
  }
  .ps-takeaway {
    grid-template-columns: 1fr;
    gap: 20px;
    padding-top: 40px;
  }
  .ps-takeaway > div:first-child > strong {
    font-size: 110px;
  }
  .ps-takeaway > div:last-child {
    padding-top: 15px;
  }
  .ps-takeaway h3 {
    font-size: 24px;
  }
  .ps-takeaway > div:last-child p {
    font-size: 13px;
  }
  .ps-driver-toolbar {
    gap: 12px;
    flex-wrap: wrap;
  }
  .ps-driver-toolbar > span {
    margin-left: 0;
    width: 100%;
    font-size: 8px;
  }
  .ps-driver-layout {
    display: block;
    padding-top: 25px;
  }
  .ps-driver-row {
    grid-template-columns: 95px 1fr 65px;
    gap: 6px;
  }
  .ps-driver-row > span {
    font-size: 9px;
    padding-left: 5px;
  }
  .ps-driver-row > strong {
    font-size: 8px;
    padding-right: 3px;
  }
  .ps-log-axis {
    margin-left: 101px;
    margin-right: 71px;
    font-size: 6px;
  }
  .ps-legend {
    font-size: 7px;
    gap: 12px;
  }
  .ps-chart-note {
    font-size: 8px;
  }
  .ps-inspect {
    border-left: 0;
    border-top: 1px solid var(--gf-line-strong);
    padding: 25px 0 0;
    margin-top: 30px;
  }
  .ps-inspect-value {
    font-size: 60px;
    margin-block: 20px;
  }
  .ps-closing {
    display: block;
    padding-block: 55px 65px;
  }
  .ps-closing h2 {
    font-size: 76px;
    margin-top: 25px;
  }
  .ps-closing > div {
    margin-top: 30px;
  }
  .ps-closing > div > p {
    font-size: 13px;
  }
  .ps-kicker {
    font-size: 9px;
  }
  .ps-eyebrow {
    font-size: 9px;
  }
}
</style>
