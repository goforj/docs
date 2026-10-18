<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import evidence from '../../data/performance-stats.json'
import PerformanceChart from './PerformanceChart.vue'
import cacheLogo from '../../../assets/performance/cache-logo.png'
import queueLogo from '../../../assets/performance/queue-logo.png'
import eventsLogo from '../../../assets/performance/events-logo.png'
import storageLogo from '../../../assets/performance/storage-logo.png'
import webLogo from '../../../assets/performance/web-logo.png'
import mailLogo from '../../../assets/performance/mail-logo.png'
const environmentFor = id => {
  const snapshot = evidence.sources.find(source => source.repo === id)
  const metadata = { web: evidence.web.metadata, mail: evidence.mail.metadata, database: evidence.local.metadata }[id]
  const revision = `Snapshot ${snapshot.revision.slice(0, 7)}`
  if (!metadata) return `${revision} · Capture date, environment, and repeated-run details were not recorded.`
  const date = metadata.captured_at?.slice(0, 10) || 'Capture date not recorded'
  return `${revision} · ${date} · ${metadata.go_version.replace('go version ', '')} · ${metadata.goos}/${metadata.goarch} · ${metadata.cpu} · GOMAXPROCS=${metadata.gomaxprocs} · ${metadata.sample_count} runs × ${metadata.benchmark_time}`
}
const info = {
  cache: {
    logo: cacheLogo,
    title: 'Cache',
    operation: 'GetBytes',
    note: 'Seeded byte-value reads across in-process, filesystem, and local service fixtures. NATS KV + TTL is a second configuration of the NATS driver.',
  },
  queue: {
    logo: queueLogo,
    title: 'Queue',
    operation: 'Dispatch return',
    note: 'Producer-side dispatch return across local fixtures, not job completion. Core NATS publish return is not durable acknowledgement.',
  },
  events: {
    logo: eventsLogo,
    title: 'Events',
    operation: 'Publish + handler delivery',
    note: 'Publish plus observed handler delivery across in-process and local service fixtures, including the service round trip.',
  },
  storage: {
    logo: storageLogo,
    title: 'Storage',
    operation: 'Get small object',
    note: 'Read a previously written object across in-process, filesystem, and local service fixtures. rclone uses a local filesystem remote.',
  },
  mail: {
    logo: mailLogo,
    title: 'Mail',
    operation: 'Client send return · one recipient + 4 KiB attachment',
    note: 'Local client costs, not real provider latency or inbox delivery. API drivers use HTTP acceptance fixtures in separate processes without TLS; SMTP uses Mailpit. Log writes to io.Discard; Fake resets every 128 sends.',
  },
  database: {
    logo: '/favicon.svg',
    title: 'Database',
    operation: 'Read one row by primary key · GORM',
    note: 'Warm lookups across 1,000 rows with one pooled connection and GoForj database defaults. MySQL and PostgreSQL use local containers; SQLite uses a temporary file. Measures the GORM operation, without generated-app instrumentation.',
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
    environment: environmentFor(id),
    rows: evidence.driverStories.find((s) => s.id === id).rows,
    missing: evidence.driverCoverage
      .find((f) => f.id === id)
      .drivers.filter((d) => !d.results.length)
      .map((driver) => ({ ...driver, reason: missingReasons[id][driver.id] })),
  })),
)
const workloads = {
  path_param_json: 'Read an ID from the URL',
  static_text: 'Return a text response',
  middleware_chain: 'Run request middleware',
}
const httpCharts = computed(() => Object.entries(workloads).map(([id, title]) => ({
  id: `http-${id}`,
  title: `HTTP: ${title}`,
  operation: { path_param_json: 'Return the ID in a JSON response', static_text: 'Return fixed text without middleware', middleware_chain: 'Set request state, add a header, validate the request' }[id],
  rows: evidence.web.scenarios.find(s => s.id === id).rows.map(row => ({...row, driver: row.framework, value: row.nsOp, kind: 'router'})),
  note: 'The same in-process router workload, without a socket, network, or application business logic.',
  environment: environmentFor('web'),
})))
const source = (id, reproduce = false) => {
  const s = evidence.sources.find((s) => s.repo === id)
  const instructions = id === 'database' ? 'benchmarks/README.md' : ['mail', 'web'].includes(id) ? 'docs/bench/README.md' : 'README.md#benchmarks'
  return `https://github.com/${s.repository || `goforj/${id}`}/blob/${s.revision}/${reproduce ? instructions : s.path}`
}
const activeBenchmark = ref('')
let scrollFrame = 0
let benchmarkSections = []
let disposed = false
let benchmarkPath = ''

// updateBenchmarkLink replaces the current URL so scrolling does not fill browser history.
const updateBenchmarkLink = () => {
  scrollFrame = 0
  if (disposed || window.location.pathname !== benchmarkPath) return
  const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
  const current = atBottom ? benchmarkSections.at(-1) : benchmarkSections.filter(section => section.getBoundingClientRect().top <= 110).at(-1)
  const id = current?.id || ''
  activeBenchmark.value = id
  if (window.location.hash === (id ? `#${id}` : '')) return
  if (!id && !window.location.hash.startsWith('#bench-')) return
  const url = new URL(window.location.href)
  url.hash = id
  window.history.replaceState(window.history.state, '', url)
}

// scheduleBenchmarkLink batches scroll and resize events into one layout read per frame.
const scheduleBenchmarkLink = () => {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateBenchmarkLink)
}

onMounted(async () => {
  benchmarkPath = window.location.pathname
  // Let VitePress restore its route and fonts settle before tracking the first position.
  await document.fonts.ready
  await new Promise(window.requestAnimationFrame)
  await new Promise(window.requestAnimationFrame)
  if (disposed) return
  const initialHash = window.location.hash
  benchmarkSections = [...document.querySelectorAll('.bench-chart[id], #bench-http')]
  const initial = benchmarkSections.find(section => `#${section.id}` === initialHash)
  if (initial) initial.scrollIntoView({ behavior: 'instant', block: 'start' })
  window.addEventListener('scroll', scheduleBenchmarkLink, { passive: true })
  window.addEventListener('resize', scheduleBenchmarkLink)
  scheduleBenchmarkLink()
})

onBeforeUnmount(() => {
  disposed = true
  window.removeEventListener('scroll', scheduleBenchmarkLink)
  window.removeEventListener('resize', scheduleBenchmarkLink)
  window.cancelAnimationFrame(scrollFrame)
})
</script>
<template>
  <main class="bench-page">
    <header class="bench-page-header">
      <div class="bench-page-brand">
        <img src="/favicon.svg" alt="" width="25" height="25" /><span>GOFORJ / BENCHMARKS</span>
      </div>
      <h1>Performance, <em>backed by evidence.</em></h1>
      <p>
        Benchmarking is a first-class part of how we engineer for performance and stability. We aim for 100% code
        coverage, test integrations against real services, containers, and emulators, and
        maintain performance benchmarks alongside our libraries.
      </p>
      <p>
        Compare latency, throughput, and allocation costs before choosing what runs in your
        app. Published workloads, source data, and environment details let you inspect the
        conditions behind each result, reproduce the measurements, and test your own workloads.
      </p>
      <nav aria-label="Benchmark primitives">
        <a href="#bench-http" :aria-current="activeBenchmark.startsWith('bench-http') ? 'location' : undefined">
          <img :src="webLogo" alt="" width="40" height="40" />
          <span class="bench-nav-label"><strong>HTTP</strong><small>7 routers · 3 workloads</small></span>
          <span class="bench-nav-arrow" aria-hidden="true">↓</span>
        </a>
        <a v-for="chart in charts" :key="chart.id" :href="`#bench-${chart.id}`" :aria-current="activeBenchmark === `bench-${chart.id}` ? 'location' : undefined">
          <img :src="chart.logo" alt="" width="40" height="40" />
          <span class="bench-nav-label"><strong>{{ chart.title }}</strong><small>{{ chart.rows.filter(r => r.kind !== 'noop').length }} driver results</small></span>
          <span class="bench-nav-arrow" aria-hidden="true">↓</span>
        </a>
      </nav>
    </header>
    <div class="bench-content">
      <section id="bench-http" class="bench-http">
        <div class="bench-http-heading">
          <h2><a class="bench-section-link" href="#bench-http">Compare HTTP routers.<span aria-hidden="true">#</span></a></h2>
          <p>Same endpoint workload, different request pipelines. httprouter focuses on routing; GoForj Web includes Echo's context and response handling plus a bridge for Web middleware.</p>
        </div>
        <div class="bench-gallery">
          <PerformanceChart
            v-for="chart in httpCharts"
            :key="chart.id"
            v-bind="chart"
            :logo="webLogo"
            :source="source('web')"
            :reproduce="source('web', true)"
            http
          />
        </div>
      </section>
      <div class="bench-gallery">
        <PerformanceChart
          v-for="chart in charts"
          :key="chart.id"
          v-bind="chart"
          :source="source(chart.id)"
          :reproduce="source(chart.id, true)"
        />
      </div>
      <footer class="bench-page-footer">
        <p>
          These results describe library harnesses and local service fixtures. Allocations measure
          the benchmarked Go process, not backend memory usage. Measure your own
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
.bench-section-link { color:inherit; text-decoration:none; }
.bench-section-link > span { margin-left:10px; font-size:.6em; color:var(--gf-ink-3); }
.bench-section-link:hover > span { color:var(--gf-nav); }
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
  padding-inline: 96px;
  margin-inline: auto;
}
.bench-page-header {
  padding-top: 50px;
  padding-bottom: 24px;
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
  font-size: 14px;
  line-height: 1.85;
  color: var(--gf-ink-2);
  margin: 0;
}
.bench-page-header > p + p {
  margin-top: 10px;
}
.bench-page-header > nav {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
  margin-top: 26px;
}
.bench-page-header nav > a {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 12px;
  background: var(--gf-ground);
  border: 1px solid var(--gf-line);
  border-radius: 10px;
  color: var(--gf-ink);
  text-decoration: none;
  transition: border-color .15s, background-color .15s;
}
.bench-page-header nav > a:hover,
.bench-page-header nav > a[aria-current='location'] {
  border-color: var(--gf-accent-hi);
  background: var(--gf-ground-alt);
}
.bench-page-header nav > a > img { width:40px; height:40px; object-fit:contain; flex-shrink:0; margin:0; }
.bench-nav-label { min-width:0; }
.bench-nav-label strong { display:block; font:500 14px var(--gf-font-display); line-height:1.35; }
.bench-nav-label small { display:block; margin-top:4px; font:9px var(--gf-font-body); line-height:1.4; color:var(--gf-ink-2); }
.bench-nav-arrow { margin-left:auto; font:14px var(--gf-font-mono); color:var(--gf-ink-3); }
.bench-page-header nav > a:hover .bench-nav-arrow { color:var(--gf-accent-hi); }

.bench-gallery {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
}
.bench-http {
  scroll-margin-top: 90px;
  margin-top: 0;
  margin-bottom: 28px;
}
.bench-http-heading {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin-bottom: 14px;
}
.bench-http-heading > p {
  flex-basis: 100%;
  font-size: 12px;
  line-height: 1.6;
  color: var(--gf-ink-2);
  margin: 0;
}
.bench-http-heading h2 {
  font: 500 27px var(--gf-font-display);
  letter-spacing: -0.04em;
  margin: 0;
  color: var(--gf-ink);
  padding: 0;
  border: 0;
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
@media (max-width: 1200px) {
  .bench-page-header,
  .bench-content {
    padding-inline: 48px;
  }
  .bench-page-header > nav { grid-template-columns:repeat(4,minmax(0,1fr)); }
}
@media (max-width: 1000px) {
  .bench-page-header,
  .bench-content {
    padding-inline: 24px;
  }
  .bench-gallery {
    gap: 18px;
  }
  .bench-page-footer {
    flex-wrap: wrap;
  }
  .bench-page-footer > p {
    width: 100%;
    max-width: none;
  }
}
@media (max-width: 800px) {
  .bench-gallery {
    grid-template-columns: 1fr;
  }
  .bench-http-heading {
    align-items: start;
  }
  .bench-http-heading h2 {
    font-size: 24px;
  }


}
@media (max-width: 520px) {
  .bench-page-header,
  .bench-content {
    padding-inline: 18px;
  }
  .bench-page-header {
    padding-top: 28px;
    padding-bottom: 20px;
  }
  .bench-page h1 {
    font-size: 39px;
    line-height: 1.12;
    margin-top: 22px;
  }
  .bench-page-header > p {
    font-size: 12px;
  }
  .bench-page-header > nav { grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; margin-top:22px; }
  .bench-page-header nav > a { gap:8px; padding:10px; }
  .bench-page-header nav > a > img { width:32px; height:32px; }
  .bench-nav-label strong { font-size:12px; }
  .bench-nav-label small { font-size:8px; }
  .bench-nav-arrow { display:none; }
  .bench-page-header nav > a:last-child { grid-column:1 / -1; }

  .bench-http-heading h2 {
    font-size: 25px;
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
