<script setup>
import { computed } from 'vue'
import { lucideIconBodies } from 'virtual:goforj-icons'
import PerformanceLogo from './PerformanceLogo.vue'
import { performanceColors } from './performance-colors.js'
import { metricValue, measurementAxis } from './performance-measurements.mjs'
const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  logo: { type: String, required: true },
  operation: { type: String, required: true },
  rows: { type: Array, required: true },
  missing: { type: Array, default: () => [] },
  source: { type: String, required: true },
  note: { type: String, required: true },
  http: { type: Boolean, default: false },
})
const metrics = [
  { id: 'time', icon: 'clock', title: 'Time / op', direction: 'Lower is faster', log: true },
  { id: 'ops', icon: 'activity', title: 'Operations / sec', direction: 'Higher is faster', log: true },
  { id: 'allocs', icon: 'blocks', title: 'Allocs / op', direction: 'Lower uses less', log: false },
  { id: 'bytes', icon: 'hard-drive', title: 'Bytes / op', direction: 'Lower uses less', log: false },
]
const active = computed(() => props.rows.filter(r => r.kind !== 'noop').sort((a,b) => a.value - b.value))
const noop = computed(() => props.rows.filter(r => r.kind === 'noop'))
const samples = (row, metric) => metric === 'time' ? row.latencySamples : metric === 'ops' ? row.throughputSamples : null
const axes = computed(() => Object.fromEntries(metrics.map(metric => [metric.id, measurementAxis(active.value.flatMap(row => samples(row, metric.id) || [metricValue(row, metric.id)]), metric.log)])))
const position = (value, metric) => axes.value[metric].position(value)
const number = n => Number(n.toFixed(2)).toLocaleString('en-US')
const time = n => n < 1000 ? `${number(n)} ns` : n < 1e6 ? `${number(n / 1000)} µs` : `${number(n / 1e6)} ms`
const rate = n => n >= 1e9 ? `${number(n / 1e9)}B` : n >= 1e6 ? `${number(n / 1e6)}M` : n >= 1000 ? `${number(n / 1000)}K` : number(n)
const format = (n, metric) => metric === 'time' ? time(n) : metric === 'ops' ? rate(n) : metric === 'bytes' ? `${number(n)} B` : number(n)
const color = row => performanceColors[row.driver] || '#B3AEC0'
</script>
<template>
  <article class="bench-chart" :aria-label="`${title} performance chart`" :id="`bench-${id}`">
    <header>
      <div class="bench-chart-heading">
        <img class="bench-library-logo" :src="logo" :alt="`${http ? 'Web' : title} README logo`" width="96" height="96" />
        <div>
          <h2><a class="bench-heading-link" :href="`#bench-${id}`">{{ title }}<span aria-hidden="true">#</span></a></h2>
          <p>{{ operation }}</p>
        </div>
      </div>
      <div class="bench-chart-meta">
        <span>{{ active.length }} {{ http ? 'routers' : 'results' }}</span>
        <a :href="source" target="_blank" rel="noopener noreferrer">Source ↗</a>
      </div>
    </header>
    <table class="bench-table">
      <thead><tr>
        <th scope="col"><span class="bench-column-title"><svg class="bench-metric-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" v-html="lucideIconBodies[http ? 'route' : 'server']"></svg>{{ http ? 'Router' : 'Driver' }}</span></th>
        <th v-for="metric in metrics" :key="metric.id" scope="col">
          <strong class="bench-column-title"><svg class="bench-metric-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" v-html="lucideIconBodies[metric.icon]"></svg>{{ metric.title }}</strong><span>{{ metric.direction }}</span>
          <div class="bench-axis"><span>{{ format(axes[metric.id].ticks[0], metric.id) }}</span><span>{{ format(axes[metric.id].ticks.at(-1), metric.id) }}</span></div>
        </th>
      </tr></thead>
      <tbody>
        <tr v-for="row in active" :key="row.label" class="bench-row" :class="{'is-forj': row.driver === 'goforj_web'}" :style="{'--driver-color': color(row)}">
          <th scope="row"><PerformanceLogo :id="row.driver" /><span>{{ row.label }}</span></th>
          <td v-for="metric in metrics" :key="metric.id">
            <span class="bench-mobile-label"><svg class="bench-metric-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" v-html="lucideIconBodies[metric.icon]"></svg>{{ metric.title }}</span>
            <strong>{{ format(metricValue(row, metric.id), metric.id) }}</strong>
            <span class="bench-track" aria-hidden="true">
              <i v-for="tick in axes[metric.id].ticks" :key="tick" class="bench-gridline" :style="{left: `${position(tick, metric.id)}%`}"></i>
              <b class="bench-bar" :style="{width: `${position(metricValue(row, metric.id), metric.id)}%`}"></b>
              <span v-if="samples(row, metric.id)" class="bench-range" :style="{left: `${position(Math.min(...samples(row, metric.id)), metric.id)}%`, width: `${position(Math.max(...samples(row, metric.id)), metric.id) - position(Math.min(...samples(row, metric.id)), metric.id)}%`}"></span>
              <i class="bench-dot" :style="{left: `${position(metricValue(row, metric.id), metric.id)}%`}"></i>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="noop.length" class="bench-noop">
      <p>DISCARD-ONLY REFERENCE · Jobs are dropped</p>
      <div v-for="row in noop" :key="row.label" class="bench-noop-row">
        <span><PerformanceLogo :id="row.driver" />{{ row.label }}</span>
        <span v-for="metric in metrics" :key="metric.id"><small>{{ metric.title }}</small><strong>{{ format(metricValue(row, metric.id), metric.id) }}</strong></span>
      </div>
    </div>
    <footer>
      <p>{{ note }} <span class="bench-scale-note">Time and throughput use logarithmic axes (each interval is 10×). Allocations and bytes use linear axes from zero. {{ http ? 'Bars show medians; whiskers show the observed range of seven runs.' : 'Throughput is calculated from the recorded time per operation.' }}</span></p>
      <div v-if="missing.length" class="bench-missing">
        <span class="bench-missing-title">Not in this snapshot</span>
        <div v-for="row in missing" :key="row.id" class="bench-missing-driver">
          <span><PerformanceLogo :id="row.id" />{{ row.label }}</span>
          <p>{{ row.reason }}</p>
        </div>
      </div>
    </footer>
  </article>
</template>
<style scoped>
.bench-chart { min-width: 0; padding: 16px 22px; border: 1px solid var(--gf-line); border-radius: 14px; background: var(--gf-ground); scroll-margin-top: 90px; }
.bench-chart > header { display:flex; justify-content:space-between; align-items:start; gap:20px; margin-bottom:12px; }
.bench-chart-heading { display:flex; align-items:center; gap:14px; min-width:0; }
.bench-library-logo { width:64px; height:64px; object-fit:contain; flex-shrink:0; }
.bench-chart h2 { font:500 28px var(--gf-font-display); letter-spacing:-.04em; color:var(--gf-ink); margin:0; border:0; padding:0; }
.bench-heading-link { color:inherit; text-decoration:none; }
.bench-heading-link > span { display:inline-block; margin-left:10px; font:400 16px var(--gf-font-mono); color:var(--gf-ink-3); vertical-align:middle; }
.bench-heading-link:hover > span { color:var(--gf-nav); }
.bench-chart-heading p { font:11px var(--gf-font-mono); color:var(--gf-ink-2); margin:5px 0 0; }
.bench-chart-meta { display:flex; align-items:end; flex-direction:column; gap:8px; font:10px var(--gf-font-mono); color:var(--gf-ink-2); }
.bench-chart-meta a { color:var(--gf-nav); text-decoration:none; }
.bench-page .bench-chart .bench-table { display:table; width:100%; margin:0; border-collapse:collapse; table-layout:fixed; font-size:12px; overflow:visible; border:0; border-radius:0; box-shadow:none; background:transparent; }
.bench-page .bench-chart .bench-table th,.bench-page .bench-chart .bench-table td { text-transform:none; letter-spacing:normal; background:transparent; border:0; border-radius:0; box-shadow:none; font-size:12px; font-weight:400; text-align:left; padding:8px 16px; }
.bench-page .bench-chart .bench-table th:first-child { width:190px; padding-left:0; }
.bench-page .bench-chart .bench-table th:last-child,.bench-page .bench-chart .bench-table td:last-child { padding-right:0; }
.bench-page .bench-chart .bench-table thead th { vertical-align:top; color:var(--gf-ink-2); font-weight:400; padding-top:0; padding-bottom:10px; }
.bench-page .bench-chart .bench-table thead strong { display:block; color:var(--gf-ink); font-size:12px; font-weight:500; }
.bench-page .bench-chart .bench-table thead th > span:not(.bench-column-title) { display:block; margin-top:3px; font-size:10px; }
.bench-metric-icon { width:16px; height:16px; flex-shrink:0; fill:none; stroke:currentColor; stroke-width:1.65; stroke-linecap:round; stroke-linejoin:round; color:var(--gf-ink-2); }
.bench-page .bench-chart .bench-table thead .bench-column-title { display:flex; align-items:center; gap:8px; }
.bench-axis { display:flex; justify-content:space-between; gap:8px; font:8px var(--gf-font-mono); margin-top:10px; color:var(--gf-ink-2); }
.bench-page .bench-chart .bench-table tbody tr { background:transparent; border:0; border-top:1px solid var(--gf-line); }
.bench-page .bench-chart .bench-table tbody tr:nth-child(2n) td { background:transparent; }
.bench-page .bench-chart .bench-table thead tr { border:0; background:transparent; }
.bench-page .bench-chart .bench-table tbody tr:hover { background:color-mix(in srgb,var(--driver-color) 5%,transparent); }
.bench-row th > span { vertical-align:middle; }
.bench-row th { color:var(--gf-ink); font-weight:400; }
.bench-row th .bench-logo { margin-right:9px; vertical-align:middle; }
.bench-row td > strong { display:block; font:11px var(--gf-font-mono); color:var(--gf-ink); margin-bottom:6px; }
.bench-row.is-forj th { color:var(--gf-accent-hi); font-weight:600; }
.bench-track { height:20px; position:relative; display:block; }
.bench-gridline { position:absolute; top:2px; bottom:2px; border-left:1px solid var(--gf-line-strong); opacity:.7; }
.bench-bar { position:absolute; left:0; top:5px; height:10px; background:linear-gradient(90deg,color-mix(in srgb,var(--driver-color) 50%,transparent),var(--driver-color)); border-radius:3px; box-shadow:inset 0 1px 0 color-mix(in srgb,var(--driver-color) 70%,white 30%); }
.bench-dot { position:absolute; top:5px; height:10px; width:3px; border-radius:2px; background:var(--driver-color); transform:translateX(-50%); }
.bench-range { position:absolute; top:1px; height:18px; border-left:1px solid var(--driver-color); border-right:1px solid var(--driver-color); background:color-mix(in srgb,var(--driver-color) 10%,transparent); }
.bench-mobile-label { display:none; }
.bench-chart footer { border-top:1px solid var(--gf-line); padding-top:8px; margin-top:0; }
.bench-chart footer p { font-size:10px; line-height:1.6; color:var(--gf-ink-2); margin:0; }
.bench-missing { display:flex; flex-direction:column; align-items:flex-start; gap:8px; margin-top:14px; font-size:10px; color:var(--gf-ink-2); }
.bench-missing-title { font:9px var(--gf-font-mono); }
.bench-missing-driver { display:flex; align-items:center; flex-wrap:wrap; gap:4px 12px; }
.bench-missing-driver > span { display:flex; align-items:center; gap:5px; white-space:nowrap; }
.bench-chart footer .bench-missing-driver p { margin:0; font-size:10px; max-width:80ch; }
.bench-noop { border-top:1px dashed var(--gf-line-strong); margin-top:12px; padding-top:12px; }
.bench-noop p { font:9px var(--gf-font-mono); color:var(--gf-ink-2); margin:0 0 12px; }
.bench-noop-row { display:grid; grid-template-columns:190px repeat(4,minmax(0,1fr)); gap:0; align-items:center; }
.bench-noop-row > span { padding:0 16px; display:flex; flex-direction:column; gap:4px; }
.bench-noop-row > span:first-child { padding-left:0; flex-direction:row; align-items:center; font-size:12px; }
.bench-noop-row small { font-size:9px; color:var(--gf-ink-2); }
.bench-noop-row strong { font:11px var(--gf-font-mono); color:var(--gf-ink); }
@media(max-width:1000px) { .bench-page .bench-chart .bench-table th:first-child { width:160px; } .bench-page .bench-chart .bench-table th,.bench-page .bench-chart .bench-table td { padding-right:10px; padding-left:10px; } .bench-noop-row { grid-template-columns:160px repeat(4,minmax(0,1fr)); } .bench-noop-row > span { padding:0 10px; } }
@media(max-width:650px) {
 .bench-chart { padding:14px 18px; }
 .bench-library-logo { width:56px; height:56px; }
 .bench-chart-heading { gap:12px; }
 .bench-chart h2 { font-size:25px; }
 .bench-chart-heading p { font-size:9px; }
 .bench-chart-meta { font-size:8px; gap:8px; }
 .bench-chart > header { gap:8px; margin-bottom:10px; }
 .bench-page .bench-chart .bench-table,.bench-page .bench-chart .bench-table tbody { display:block; }
 .bench-page .bench-chart .bench-table thead { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); }
 .bench-page .bench-chart .bench-table .bench-row { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px 22px; padding:12px 0; }
 .bench-page .bench-chart .bench-table .bench-row th { grid-column:1/-1; width:auto; padding:0; font-size:12px; }
 .bench-page .bench-chart .bench-table .bench-row td { padding:0; }
 .bench-mobile-label { display:flex; align-items:center; gap:5px; font-size:9px; color:var(--gf-ink-2); margin-bottom:4px; }
 .bench-mobile-label .bench-metric-icon { width:12px; height:12px; }
 .bench-row td > strong { font-size:11px; }
 .bench-noop-row { grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px 22px; }
 .bench-noop-row > span { padding:0; }
 .bench-noop-row > span:first-child { grid-column:1/-1; }
 .bench-chart footer p { font-size:10px; }
}
</style>
