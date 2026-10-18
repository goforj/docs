<script setup>
import evidence from '../../data/performance-stats.json'
import PerformanceLogo from './PerformanceLogo.vue'
import { performanceColors } from './performance-colors.js'
import web from '../../../assets/performance/web-logo.png'
import cache from '../../../assets/performance/cache-logo.png'
import queue from '../../../assets/performance/queue-logo.png'
import events from '../../../assets/performance/events-logo.png'
import storage from '../../../assets/performance/storage-logo.png'
import mail from '../../../assets/performance/mail-logo.png'

const rows = [...evidence.web.scenarios.find(scenario => scenario.id === 'path_param_json').rows]
  .sort((a, b) => a.nsOp - b.nsOp)
const maximum = Math.max(...rows.map(row => row.nsOp))
const libraries = [
  { name: 'HTTP', logo: web }, { name: 'Cache', logo: cache },
  { name: 'Queue', logo: queue }, { name: 'Events', logo: events },
  { name: 'Storage', logo: storage }, { name: 'Mail', logo: mail },
  { name: 'Database', logo: '/favicon.svg' },
]
</script>

<template>
  <main class="gf-performance-preview">
    <header>
      <div class="preview-brand"><img src="/favicon.svg" alt="" /><span>GoForj</span></div>
      <span class="preview-eyebrow">ENGINEERING / BENCHMARKS</span>
    </header>
    <div class="preview-intro">
      <h1>Performance,<br /><em>backed by<br />evidence.</em></h1>
      <p>Latency. Throughput.<br />Allocations. Memory.</p>
    </div>
    <section class="preview-chart" aria-label="Recorded HTTP benchmark results">
      <div class="preview-chart-heading"><span>HTTP ROUTING</span><span>7 routers / 7 runs</span></div>
      <h2>Read an ID from the URL</h2>
      <p>Time per operation · lower is faster</p>
      <div v-for="row in rows" :key="row.framework" class="preview-row" :style="{ '--row-color': performanceColors[row.framework] }">
        <span class="preview-driver"><PerformanceLogo :id="row.framework" />{{ row.label }}</span>
        <span class="preview-track"><i :style="{ width: `${row.nsOp / maximum * 100}%` }"></i></span>
        <strong>{{ row.nsOp }} <small>ns</small></strong>
      </div>
      <div class="preview-chart-note">In-process dispatch · medians of seven run averages</div>
    </section>
    <div class="preview-libraries">
      <span v-for="library in libraries" :key="library.name"><img :src="library.logo" alt="" />{{ library.name }}</span>
    </div>
    <footer><span>goforj.dev/performance</span><span>Published workloads. Reproducible results.</span></footer>
  </main>
</template>

<style scoped>
:global(html:has(.gf-performance-preview)), :global(body:has(.gf-performance-preview)), :global(#app:has(.gf-performance-preview)) { margin:0; width:100%; height:100%; overflow:hidden; }
.gf-performance-preview { position:relative; box-sizing:border-box; width:1200px; height:630px; overflow:hidden; color:#fff; background:radial-gradient(ellipse at 80% 35%,#ff5e3a0d,transparent 65%),#0c0a0e; font-family:var(--gf-font-display,'Space Grotesk',sans-serif); }
.gf-performance-preview * { box-sizing:border-box; }
.gf-performance-preview header { position:absolute; inset:36px 48px auto; display:flex; align-items:center; justify-content:space-between; }
.preview-brand { display:flex; align-items:center; gap:12px; font-size:28px; font-weight:600; letter-spacing:-1px; }
.preview-brand img { width:34px; height:34px; }
.preview-eyebrow { color:#a9a1b3; font:11px var(--gf-font-mono,monospace); letter-spacing:2px; }
.preview-intro { position:absolute; left:48px; top:129px; }
.preview-intro h1 { margin:0; color:#fff; font-size:66px; line-height:1.04; font-weight:600; letter-spacing:-3.4px; }
.preview-intro h1 em { font-style:normal; color:#ff8257; }
.preview-intro p { margin:27px 0 0; color:#a9a1b3; font-size:19px; line-height:1.65; letter-spacing:-.3px; }
.preview-chart { position:absolute; top:115px; right:48px; width:568px; padding:20px 25px 14px; border:1px solid #3d3349; border-radius:16px; background:#1a1620; box-shadow:0 22px 70px #0005; }
.preview-chart-heading { display:flex; justify-content:space-between; color:#a9a1b3; font:10px var(--gf-font-mono,monospace); letter-spacing:1px; }
.preview-chart-heading > span:first-child { color:#ff8257; }
.preview-chart h2 { margin:13px 0 0; border:0; padding:0; color:#fff; font-size:23px; line-height:1.2; font-weight:500; letter-spacing:-.6px; }
.preview-chart > p { margin:7px 0 17px; color:#a9a1b3; font-size:12px; line-height:1.3; }
.preview-row { display:grid; grid-template-columns:143px 1fr 68px; align-items:center; gap:12px; height:30px; }
.preview-driver { display:flex; align-items:center; gap:8px; color:#e6e0ec; font-size:13px; }
.preview-driver :deep(.bench-logo) { width:18px; height:18px; color:var(--row-color); }
.preview-track { height:8px; border-radius:2px; background:#302838; overflow:hidden; }
.preview-track i { display:block; height:100%; border-radius:2px; background:var(--row-color); }
.preview-row strong { text-align:right; font:13px var(--gf-font-mono,monospace); color:#e6e0ec; }
.preview-row strong small { color:#a9a1b3; font-size:11px; }
.preview-chart-note { margin-top:10px; padding-top:10px; border-top:1px solid #3d3349; color:#a9a1b3; font:10px var(--gf-font-mono,monospace); }
.preview-libraries { position:absolute; left:48px; right:48px; bottom:84px; display:flex; align-items:center; justify-content:space-between; }
.preview-libraries > span { display:flex; align-items:center; gap:9px; color:#d5cfdd; font-size:14px; }
.preview-libraries img { width:32px; height:36px; object-fit:contain; }
.gf-performance-preview footer { position:absolute; left:48px; right:48px; bottom:30px; display:flex; justify-content:space-between; align-items:center; padding-top:18px; border-top:1px solid #302838; font:11px var(--gf-font-mono,monospace); color:#a9a1b3; }
.gf-performance-preview footer > span:first-child { color:#ff8257; }
</style>
