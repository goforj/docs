<script setup>
import { computed } from 'vue'
import evidence from '../../data/performance-stats.json'
import PerformanceChart from './PerformanceChart.vue'
import PerformanceLogo from './PerformanceLogo.vue'
import cacheLogo from '../../../assets/performance/cache-logo.png'
import queueLogo from '../../../assets/performance/queue-logo.png'
import eventsLogo from '../../../assets/performance/events-logo.png'
import storageLogo from '../../../assets/performance/storage-logo.png'
import webLogo from '../../../assets/performance/web-logo.png'
import mailLogo from '../../../assets/performance/mail-logo.png'
const info = {
  cache: {
    logo: cacheLogo,
    title: 'Cache',
    operation: 'GetBytes',
    note: 'Seeded byte-value reads. NATS KV + TTL is a second configuration of the NATS driver.',
  },
  queue: {
    logo: queueLogo,
    title: 'Queue',
    operation: 'Dispatch return',
    note: 'Producer-side dispatch return, not job completion. Core NATS publish return is not durable acknowledgement.',
  },
  events: {
    logo: eventsLogo,
    title: 'Events',
    operation: 'Publish + handler delivery',
    note: 'Publish plus observed handler delivery, including the service round trip.',
  },
  storage: {
    logo: storageLogo,
    title: 'Storage',
    operation: 'Get small object',
    note: 'Read a previously written object. rclone is measured with a local filesystem remote.',
  },
}
const missingReasons = {
  cache: {
    null: 'No-op driver; not included in the seeded-read benchmark.',
    dynamodb: 'Intentionally omitted: DynamoDB Local timings do not represent real AWS latency.',
  },
  events: { null: 'No-op driver; not included in the publish-and-deliver benchmark.' },
  storage: { dropbox: 'No local emulator or container fixture is configured for Dropbox in this benchmark suite.' },
}
const charts = computed(() =>
  Object.entries(info).map(([id, meta]) => ({
    id,
    ...meta,
    rows: evidence.driverStories.find((s) => s.id === id).rows,
    missing: evidence.driverCoverage
      .find((f) => f.id === id)
      .drivers.filter((d) => !d.results.length)
      .map((driver) => ({ ...driver, reason: missingReasons[id][driver.id] })),
  })),
)
const workloads = {
  path_param_json: 'Path parameter + JSON',
  static_text: 'Static text response',
  middleware_chain: 'Middleware chain',
  live_plain_text: 'HTTP/1.1 loopback',
}
const httpCharts = computed(() => Object.entries(workloads).map(([id, title]) => ({
  id: `http-${id}`,
  title,
  operation: id === 'live_plain_text' ? 'Live HTTP over one connection' : 'In-process handler dispatch',
  rows: evidence.web.scenarios.find(s => s.id === id).rows.map(row => ({...row, driver: row.framework, value: row.nsOp, kind: 'router'})),
  note: id === 'live_plain_text'
    ? 'Warm HTTP/1.1 loopback over one connection. Socket and HTTP work are included. Small differences are not reliable rankings.'
    : 'The same router workload without a socket, network, or application business logic.',
})))
const unmeasured = computed(() =>
  ['mail', 'database'].map((id) => evidence.driverCoverage.find((f) => f.id === id)),
)
const source = (id) => {
  const s = evidence.sources.find((s) => s.repo === id)
  return `https://github.com/goforj/${id}/blob/${s.revision}/${s.path}`
}
</script>
<template>
  <main class="bench-page">
    <header class="bench-page-header">
      <div class="bench-page-brand">
        <img src="/favicon.svg" alt="" width="25" height="25" /><span>GOFORJ / BENCHMARKS</span>
      </div>
      <h1>Performance, <em>by driver.</em></h1>
      <p>
        Cache reads, queue dispatch, event delivery, object storage, and HTTP routing. Every
        recorded result, with the drivers and conditions behind it.
      </p>
      <nav aria-label="Benchmark primitives">
        <a v-for="chart in charts" :key="chart.id" :href="`#bench-${chart.id}`"
          >{{ chart.title }}
          <span>{{ chart.rows.filter((r) => r.kind !== 'noop').length }}</span></a
        ><a href="#bench-http"
          >HTTP <span>7</span></a
        ><a class="bench-nav-pending" href="#bench-other"
          >Mail &amp; database <span>Unmeasured</span></a
        >
      </nav>
    </header>
    <div class="bench-content">
      <div class="bench-reading">
        <span>Every metric. Every recorded driver.</span>
        <p>Compare drivers within each chart. Each primitive measures its own operation.</p>
      </div>
      <div class="bench-gallery">
        <PerformanceChart
          v-for="chart in charts"
          :key="chart.id"
          v-bind="chart"
          :source="source(chart.id)"
        />
      </div>
      <section id="bench-http" class="bench-http">
        <div class="bench-http-heading">
          <div><p>HTTP BENCHMARKS</p><h2>Every workload. Every router.</h2></div>
        </div>
        <div class="bench-gallery">
          <PerformanceChart
            v-for="chart in httpCharts"
            :key="chart.id"
            v-bind="chart"
            :logo="webLogo"
            :source="source('web')"
            http
          />
        </div>
        <p class="bench-http-environment">
          {{ evidence.web.metadata.go_version }} · {{ evidence.web.metadata.goos }}/{{
            evidence.web.metadata.goarch
          }}
          · GOMAXPROCS={{ evidence.web.metadata.gomaxprocs }} ·
          {{ evidence.web.metadata.sample_count }} samples ×
          {{ evidence.web.metadata.benchmark_time }} each
        </p>
      </section>
      <section id="bench-other" class="bench-other">
        <header>
          <h2>Drivers awaiting measurements</h2>
          <p>Mail delivery and database queries have no comparable snapshots in this dataset.</p>
        </header>
        <div class="bench-other-grid">
          <article v-for="family in unmeasured" :key="family.id">
            <img v-if="family.id === 'mail'" class="bench-mail-logo" :src="mailLogo" alt="Mail README logo" width="80" height="80" />
            <h3>{{ family.id === 'mail' ? 'Mail' : 'Database' }}</h3>
            <span>No benchmark snapshot</span>
            <div>
              <span v-for="driver in family.drivers" :key="driver.id"
                ><PerformanceLogo :id="driver.id" />{{ driver.label }}</span
              >
            </div>
          </article>
        </div>
      </section>
      <footer class="bench-page-footer">
        <p>
          These results describe library harnesses and local service fixtures. Measure your own
          payloads, network, concurrency, and delivery requirements before making capacity
          decisions.
        </p>
        <a href="/operations/performance-benchmarks"
          >Benchmark your app in Lighthouse <span>↗</span></a
        ><a href="/drivers">Driver capabilities ↗</a>
      </footer>
    </div>
  </main>
</template>
<style scoped>
:global(.VPDoc:has(.bench-page)) {
  padding: 0 !important;
}
:global(.VPDoc:has(.bench-page) .container),
:global(.VPDoc:has(.bench-page) .content),
:global(.VPDoc:has(.bench-page) .content-container),
:global(.VPDoc:has(.bench-page) .main),
:global(.VPDoc:has(.bench-page) .vp-doc) {
  width: 100% !important;
  max-width: none !important;
}
:global(.VPDoc:has(.bench-page) .container),
:global(.VPDoc:has(.bench-page) .content) {
  padding: 0 !important;
}
:global(.VPDoc:has(.bench-page) .VPDocFooter) {
  display: none;
}
.bench-page {
  background: var(--gf-ground-deep);
  color: var(--gf-ink);
  font-family: var(--gf-font-body);
  min-height: 100vh;
}
.bench-page :deep(*) {
  box-sizing: border-box;
}
.bench-page :deep(button:focus-visible),
.bench-page :deep(a:focus-visible),
.bench-page :deep(select:focus-visible),
.bench-page :deep(summary:focus-visible) {
  outline: 2px solid var(--gf-nav);
  outline-offset: 4px;
}
.bench-page-header,
.bench-content {
  max-width: 1600px;
  padding-inline: 28px;
  margin-inline: auto;
}
.bench-page-header {
  padding-top: 50px;
  padding-bottom: 28px;
}
.bench-page-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font: 9px var(--gf-font-mono);
  letter-spacing: 0.08em;
  color: var(--gf-reference);
}
.bench-page-brand > img {
  display: block;
  margin: 0;
  width: 25px;
  height: 25px;
}
.bench-page h1 {
  font: 500 clamp(38px, 4.4vw, 61px) / 1.12 var(--gf-font-display);
  letter-spacing: -0.055em;
  margin: 24px 0 18px;
  padding: 0;
  border: 0;
  color: var(--gf-ink);
}
.bench-page h1 > em {
  font-style: normal;
  color: var(--gf-accent-hi);
}
.bench-page-header > p {
  max-width: 690px;
  font-size: 14px;
  line-height: 1.85;
  color: var(--gf-ink-2);
  margin: 0;
}
.bench-page-header > nav {
  display: flex;
  gap: 25px;
  flex-wrap: wrap;
  margin-top: 28px;
  align-items: center;
}
.bench-page-header nav > a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--gf-ink-2);
  text-decoration: none;
}
.bench-page-header nav > a:hover {
  color: var(--gf-ink);
}
.bench-page-header nav span {
  font: 8px var(--gf-font-mono);
  color: var(--gf-ink-3);
}
.bench-page-header nav > a.bench-nav-pending {
  margin-left: auto;
  font-size: 10px;
}
.bench-nav-pending > span {
  padding: 4px 6px;
  border: 1px solid var(--gf-line-strong);
  border-radius: 3px;
  font-size: 7px;
}









.bench-reading {
  display: flex;
  justify-content: space-between;
  gap: 30px;
  padding: 22px 0;
  font-size: 10px;
  color: var(--gf-ink-2);
  line-height: 1.8;
}
.bench-reading > span {
  font: 9px/1.8 var(--gf-font-mono);
}
.bench-reading > p {
  margin: 0;
  max-width: 570px;
  text-align: right;
}
.bench-gallery {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
}
.bench-http {
  scroll-margin-top: 90px;
  margin-top: 50px;
}
.bench-http-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
  margin-bottom: 22px;
}
.bench-http-heading > div > p {
  font: 8px var(--gf-font-mono);
  color: var(--gf-reference);
  letter-spacing: 0.06em;
  margin: 0 0 10px;
}
.bench-http-heading h2 {
  font: 500 27px var(--gf-font-display);
  letter-spacing: -0.04em;
  margin: 0;
  color: var(--gf-ink);
  padding: 0;
  border: 0;
}


.bench-http-environment {
  font: 9px/1.9 var(--gf-font-mono);
  color: var(--gf-ink-2);
  margin: 15px 0 0;
}
.bench-other {
  margin-top: 45px;
  padding-top: 28px;
  border-top: 1px solid var(--gf-line-strong);
  scroll-margin-top: 140px;
}
.bench-other > header h2 {
  font: 500 20px var(--gf-font-display);
  letter-spacing: -0.025em;
  margin: 0;
  padding: 0;
  border: 0;
  color: var(--gf-ink);
}
.bench-other > header > p {
  font-size: 11px;
  line-height: 1.8;
  color: var(--gf-ink-2);
  margin: 10px 0 20px;
}
.bench-other-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 24px;
}
.bench-other-grid > article {
  padding: 20px;
  border: 1px solid var(--gf-line);
  border-radius: 8px;
}
.bench-mail-logo {
  float: right;
  width: 80px;
  height: 80px;
  object-fit: contain;
}
.bench-other-grid h3 {
  font: 500 15px var(--gf-font-display);
  display: inline;
  margin: 0;
  color: var(--gf-ink);
}
.bench-other-grid > article > span {
  font: 8px var(--gf-font-mono);
  color: var(--gf-ink-2);
  margin-left: 15px;
}
.bench-other-grid > article > div {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  margin-top: 20px;
}
.bench-other-grid > article > div > span {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 10px;
  color: var(--gf-ink-2);
}
.bench-other :deep(.bench-logo) {
  width: 20px;
  height: 20px;
  color: var(--gf-ink-2);
}
.bench-other :deep(.bench-logo svg),
.bench-other :deep(.bench-logo img) {
  width: 18px;
  height: 18px;
}
.bench-page-footer {
  border-top: 1px solid var(--gf-line-strong);
  margin-top: 35px;
  padding: 25px 0 45px;
  display: flex;
  gap: 30px;
  align-items: center;
}
.bench-page-footer > p {
  font-size: 10px;
  line-height: 1.9;
  color: var(--gf-ink-2);
  margin: 0;
  max-width: 620px;
  margin-right: auto;
}
.bench-page-footer > a {
  font-size: 10px;
  color: var(--gf-nav);
  text-decoration: none;
  white-space: nowrap;
}
@media (max-width: 1000px) {
  .bench-page-header,
  .bench-content {
    padding-inline: 24px;
  }
  .bench-gallery {
    gap: 18px;
  }
  .bench-reading > p {
    max-width: 420px;
  }
  .bench-page-footer {
    flex-wrap: wrap;
  }
  .bench-page-footer > p {
    width: 100%;
    max-width: none;
  }
  .bench-other-grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 800px) {
  .bench-gallery {
    grid-template-columns: 1fr;
  }
  .bench-reading {
    gap: 15px;
    display: block;
  }
  .bench-reading > p {
    text-align: left;
    max-width: none;
    margin-top: 8px;
  }
  .bench-page-header nav > a.bench-nav-pending {
    margin-left: 0;
  }
  .bench-http-heading {
    align-items: start;
  }
  .bench-http-heading h2 {
    font-size: 24px;
  }


  .bench-other-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 520px) {
  .bench-page-header,
  .bench-content {
    padding-inline: 18px;
  }
  .bench-page-header {
    padding-top: 28px;
    padding-bottom: 23px;
  }
  .bench-page h1 {
    font-size: 39px;
    line-height: 1.12;
    margin-top: 22px;
  }
  .bench-page-header > p {
    font-size: 12px;
  }
  .bench-page-header > nav {
    gap: 15px 20px;
    margin-top: 22px;
  }
  .bench-page-header nav > a {
    font-size: 10px;
  }
  .bench-page-header nav > a.bench-nav-pending {
    width: 100%;
    font-size: 9px;
  }






  .bench-reading {
    font-size: 9px;
    padding-block: 18px;
  }
  .bench-reading > span {
    font-size: 8px;
  }
  .bench-http {
    margin-top: 35px;
  }
  .bench-http-heading {
    display: block;
  }
  .bench-http-heading h2 {
    font-size: 25px;
  }


  .bench-http-environment {
    font-size: 8px;
  }
  .bench-other > header h2 {
    font-size: 19px;
  }
  .bench-other > header > p {
    font-size: 10px;
  }
  .bench-other-grid > article {
    padding: 18px;
  }
  .bench-other-grid > article > div {
    gap: 15px;
  }
  .bench-other-grid > article > div > span {
    font-size: 9px;
  }
  .bench-page-footer {
    gap: 18px;
  }
  .bench-page-footer > p {
    font-size: 10px;
  }
  .bench-page-footer > a {
    font-size: 10px;
  }
}
</style>
