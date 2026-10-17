<script setup>
import { computed, ref } from 'vue'
const props = defineProps({
  web: { type: Object, required: true },
  source: { type: String, required: true },
})
const selected = ref('live_plain_text')
const workloads = [
  {
    id: 'live_plain_text',
    name: 'Across a socket',
    detail: 'HTTP/1.1 loopback',
    description:
      'A warm HTTP/1.1 connection, one request at a time. This includes socket and HTTP work.',
  },
  {
    id: 'static_text',
    name: 'A simple response',
    detail: 'In-process dispatch',
    description: 'Dispatch a static text response directly to the handler. No socket or network.',
  },
  {
    id: 'path_param_json',
    name: 'Parameters + JSON',
    detail: 'In-process dispatch',
    description:
      'Route a path parameter and return JSON directly through the handler. No socket or network.',
  },
  {
    id: 'middleware_chain',
    name: 'Through middleware',
    detail: 'In-process dispatch',
    description: 'Dispatch through the benchmark middleware chain. No socket or network.',
  },
]
const workload = computed(() => workloads.find((w) => w.id === selected.value))
const scenario = computed(() => props.web.scenarios.find((s) => s.id === selected.value))
const pair = computed(() =>
  ['goforj_web', 'net_http'].map((id) => scenario.value.rows.find((r) => r.framework === id)),
)
const rows = computed(() => [...scenario.value.rows].sort((a, b) => b.throughput - a.throughput))
const domain = computed(() => {
  const samples = pair.value.flatMap((r) => r.throughputSamples)
  const min = Math.min(...samples),
    max = Math.max(...samples)
  const pad = (max - min) * 0.15
  return [min - pad, max + pad]
})
const position = (value) => ((value - domain.value[0]) / (domain.value[1] - domain.value[0])) * 100
const ticks = computed(() =>
  Array.from(
    { length: 5 },
    (_, i) => domain.value[0] + ((domain.value[1] - domain.value[0]) * i) / 4,
  ),
)
const rate = (value) =>
  value >= 1e6 ? `${(value / 1e6).toFixed(2)}M` : `${(value / 1000).toFixed(1)}K`
const integer = (value) => Math.round(value).toLocaleString('en-US')
const latency = (value) =>
  value >= 1000 ? `${(value / 1000).toFixed(2)} µs` : `${Number(value.toFixed(1))} ns`
const delta = computed(() => (pair.value[0].throughput / pair.value[1].throughput - 1) * 100)
</script>
<template>
  <div class="hc">
    <div class="hc-workloads" role="group" aria-label="HTTP workload">
      <button
        v-for="(w, i) in workloads"
        :key="w.id"
        :aria-pressed="selected === w.id"
        @click="selected = w.id"
      >
        <span>0{{ i + 1 }}</span
        ><strong>{{ w.name }}</strong
        ><small>{{ w.detail }}</small
        ><b aria-hidden="true">↗</b>
      </button>
    </div>
    <div class="hc-comparison">
      <header>
        <span>{{ workload.name }}</span>
        <p>{{ workload.description }}</p>
      </header>
      <div class="hc-pair">
        <div v-for="(row, i) in pair" :key="row.framework" :class="{ 'hc-forj': i === 0 }">
          <span class="hc-name">{{ row.label }}</span
          ><strong>{{ rate(row.throughput) }}<span>/ sec</span></strong>
          <p>
            {{ latency(row.nsOp) }} per {{ selected === 'live_plain_text' ? 'request' : 'operation'
            }}<span>{{ row.allocs }} allocs / op</span>
          </p>
        </div>
      </div>
      <div class="hc-difference">
        <strong>{{ delta > 0 ? '+' : '' }}{{ delta.toFixed(1) }}%</strong
        ><span
          >GoForj median throughput relative to net/http.<br />Observed difference in this run, not
          a claim of statistical significance.</span
        >
      </div>
      <div class="hc-samples">
        <div class="hc-samples-heading">
          <span>ALL {{ web.metadata.sample_count }} SAMPLES</span
          ><span>Dot = one run · diamond = median</span>
        </div>
        <div class="hc-sample-axis" aria-hidden="true">
          <span v-for="tick in ticks" :key="tick" :style="{ left: `${position(tick)}%` }">{{
            rate(tick)
          }}</span>
        </div>
        <div
          v-for="(row, i) in pair"
          :key="row.framework"
          class="hc-sample-row"
          :class="{ 'hc-forj': i === 0 }"
        >
          <strong>{{ row.label }}</strong>
          <div
            class="hc-sample-track"
            :aria-label="`${row.label}: ${row.throughputSamples.map(integer).join(', ')} per second; median ${integer(row.throughput)}`"
            role="img"
          >
            <span
              class="hc-range"
              :style="{
                left: `${position(Math.min(...row.throughputSamples))}%`,
                width: `${position(Math.max(...row.throughputSamples)) - position(Math.min(...row.throughputSamples))}%`,
              }"
            ></span
            ><i
              v-for="(sample, j) in row.throughputSamples"
              :key="j"
              :style="{ left: `${position(sample)}%`, top: `${11 + (j % 3) * 7}px` }"
              ><span>{{ integer(sample) }} / sec</span></i
            ><b :style="{ left: `${position(row.throughput)}%` }"></b>
          </div>
        </div>
        <p>
          Zoomed throughput axis, not zero-based. {{ web.metadata.sample_count }} runs ×
          {{ web.metadata.benchmark_time }} each. Higher is faster.
        </p>
      </div>
    </div>
    <details class="hc-all">
      <summary>
        <span>Compare all {{ rows.length }} routers</span
        ><span>Medians, allocations, and bytes ↗</span>
      </summary>
      <div class="hc-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Router</th>
              <th>{{ selected === 'live_plain_text' ? 'Requests' : 'Operations' }} / sec</th>
              <th>Time / op</th>
              <th>Allocs / op</th>
              <th>Bytes / op</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rows"
              :key="row.framework"
              :class="{ 'hc-forj': row.framework === 'goforj_web' }"
            >
              <th>{{ row.label }}</th>
              <td>{{ integer(row.throughput) }}</td>
              <td>{{ latency(row.nsOp) }}</td>
              <td>{{ row.allocs }}</td>
              <td>{{ integer(row.bytes) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
    <footer>
      <span
        >{{ web.metadata.go_version }} · {{ web.metadata.goos }}/{{ web.metadata.goarch }} ·
        GOMAXPROCS={{ web.metadata.gomaxprocs }}</span
      ><a :href="source" target="_blank" rel="noopener noreferrer">Benchmark artifact ↗</a>
    </footer>
  </div>
</template>
<style scoped>
.hc {
  margin-top: 55px;
}
.hc-workloads {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-block: 1px solid var(--gf-line-strong);
}
.hc-workloads button {
  position: relative;
  padding: 20px 22px;
  text-align: left;
  display: grid;
  grid-template-columns: 20px 1fr;
  gap: 8px 10px;
  border-right: 1px solid var(--gf-line);
  border-top: 2px solid transparent;
  cursor: pointer;
  margin-top: -1px;
}
.hc-workloads button:first-child {
  padding-left: 0;
}
.hc-workloads button:last-child {
  border-right: 0;
}
.hc-workloads button[aria-pressed='true'] {
  border-top-color: var(--gf-accent);
  background: linear-gradient(color-mix(in srgb, var(--gf-accent) 7%, transparent), transparent);
}
.hc-workloads button > span {
  font: 9px var(--gf-font-mono);
  color: var(--gf-ink-2);
  padding-top: 4px;
}
.hc-workloads strong {
  font: 500 14px var(--gf-font-display);
}
.hc-workloads small {
  grid-column: 2;
  font: 8px var(--gf-font-mono);
  color: var(--gf-ink-2);
}
.hc-workloads button > b {
  position: absolute;
  right: 15px;
  top: 22px;
  color: var(--gf-ink-3);
  font-weight: 400;
  font-size: 11px;
}
.hc-workloads button[aria-pressed='true'] > b {
  color: var(--gf-accent-hi);
}
.hc-comparison {
  padding-top: 35px;
}
.hc-comparison > header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 40px;
}
.hc-comparison > header > span {
  font: 10px var(--gf-font-mono);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gf-ink-2);
  padding-top: 4px;
}
.hc-comparison > header > p {
  font-size: 12px;
  line-height: 1.8;
  color: var(--gf-ink-2);
  max-width: 440px;
  margin: 0;
}
.hc-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  padding: 35px 0;
}
.hc-pair > div {
  min-width: 0;
}
.hc-pair > div + div {
  border-left: 1px solid var(--gf-line-strong);
  padding-left: 60px;
}
.hc-name {
  font: 500 18px var(--gf-font-display);
}
.hc-pair > div > strong {
  display: block;
  font: 500 clamp(64px, 7.5vw, 108px) / 1.15 var(--gf-font-display);
  letter-spacing: -0.075em;
  color: var(--gf-ink);
  margin-top: 12px;
}
.hc-pair > div > strong > span {
  font: 11px var(--gf-font-mono);
  letter-spacing: 0;
  color: var(--gf-ink-2);
  margin-left: 15px;
}
.hc-pair > .hc-forj > strong,
.hc-forj .hc-name {
  color: var(--gf-accent-hi);
}
.hc-pair p {
  font: 10px/1.8 var(--gf-font-mono);
  color: var(--gf-ink-2);
  margin: 10px 0 0;
}
.hc-pair p > span {
  margin-left: 25px;
}
.hc-difference {
  display: flex;
  align-items: center;
  gap: 25px;
  border-block: 1px solid var(--gf-line);
  padding: 18px 0;
}
.hc-difference > strong {
  font: 500 29px var(--gf-font-display);
  letter-spacing: -0.04em;
  color: var(--gf-accent-hi);
}
.hc-difference > span {
  font-size: 10px;
  line-height: 1.8;
  color: var(--gf-ink-2);
}
.hc-samples {
  margin-top: 30px;
}
.hc-samples-heading {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  font: 9px var(--gf-font-mono);
  color: var(--gf-ink-2);
  margin-bottom: 25px;
}
.hc-sample-axis {
  position: relative;
  margin-left: 150px;
  height: 25px;
  font: 8px var(--gf-font-mono);
  color: var(--gf-ink-2);
}
.hc-sample-axis > span {
  position: absolute;
  transform: translateX(-50%);
  white-space: nowrap;
}
.hc-sample-axis > span:first-child {
  transform: none;
}
.hc-sample-axis > span:last-child {
  transform: translateX(-100%);
}
.hc-sample-row {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 20px;
  align-items: center;
  --sample: var(--gf-ink-2);
}
.hc-sample-row.hc-forj {
  --sample: var(--gf-accent-hi);
}
.hc-sample-row > strong {
  font-size: 12px;
  font-weight: 500;
  color: var(--sample);
}
.hc-sample-track {
  height: 48px;
  position: relative;
}
.hc-range {
  position: absolute;
  top: 21px;
  height: 9px;
  background: color-mix(in srgb, var(--sample) 13%, transparent);
}
.hc-sample-track > i {
  position: absolute;
  width: 5px;
  height: 5px;
  background: var(--sample);
  border-radius: 50%;
  transform: translateX(-50%);
}
.hc-sample-track > i > span {
  display: none;
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  background: var(--gf-ground-alt);
  border: 1px solid var(--gf-line-strong);
  padding: 6px;
  font: 9px var(--gf-font-mono);
  color: var(--gf-ink);
  z-index: 3;
}
.hc-sample-track > i:hover > span {
  display: block;
}
.hc-sample-track > b {
  position: absolute;
  top: 31px;
  width: 7px;
  height: 7px;
  transform: translateX(-50%) rotate(45deg);
  background: var(--sample);
}
.hc-samples > p {
  font: 9px/1.8 var(--gf-font-mono);
  color: var(--gf-ink-2);
  margin: 15px 0 0;
}
.hc .hc-all {
  background: transparent;
  border-radius: 0;
  padding: 0;
  border-inline: 0;
  border-block: 1px solid var(--gf-line-strong);
  margin-top: 30px;
}
.hc-all summary {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  cursor: pointer;
  padding: 20px 0;
  font-size: 12px;
  list-style: none;
}
.hc-all summary::-webkit-details-marker {
  display: none;
}
.hc-all summary > span:last-child {
  font: 9px var(--gf-font-mono);
  color: var(--gf-ink-2);
}
.hc-all[open] summary > span:last-child {
  color: var(--gf-accent-hi);
}
.hc-table-scroll {
  overflow-x: auto;
}
.hc table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 20px;
  display: table;
  font: 10px var(--gf-font-mono);
  white-space: nowrap;
}
.hc th,
.hc td {
  padding: 12px 14px;
  text-align: right;
  border: 0;
  border-bottom: 1px solid var(--gf-line);
}
.hc th:first-child {
  text-align: left;
  padding-left: 0;
}
.hc thead th {
  font-weight: 400;
  color: var(--gf-ink-2);
  font-size: 9px;
}
.hc tbody th {
  font-weight: 400;
}
.hc tbody tr {
  background: none;
}
.hc tbody .hc-forj {
  color: var(--gf-accent-hi);
}
.hc footer {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding-top: 20px;
  font: 9px/1.8 var(--gf-font-mono);
  color: var(--gf-ink-2);
}
.hc footer a {
  color: var(--gf-nav);
}
@media (max-width: 760px) {
  .hc {
    margin-top: 30px;
  }
  .hc-workloads {
    grid-template-columns: 1fr 1fr;
  }
  .hc-workloads button,
  .hc-workloads button:first-child {
    padding: 17px 12px;
    gap: 7px;
  }
  .hc-workloads button:nth-child(even) {
    border-right: 0;
  }
  .hc-workloads strong {
    font-size: 12px;
  }
  .hc-workloads button > b {
    display: none;
  }
  .hc-workloads small {
    font-size: 7px;
  }
  .hc-comparison > header {
    display: block;
  }
  .hc-comparison > header > p {
    margin-top: 15px;
    font-size: 11px;
  }
  .hc-pair {
    gap: 20px;
    padding-block: 25px;
  }
  .hc-pair > div + div {
    padding-left: 20px;
  }
  .hc-name {
    font-size: 14px;
  }
  .hc-pair > div > strong {
    font-size: clamp(38px, 9vw, 65px);
    letter-spacing: -0.06em;
  }
  .hc-pair > div > strong > span {
    display: block;
    font-size: 9px;
    margin: 8px 0 0;
  }
  .hc-pair p {
    font-size: 8px;
  }
  .hc-pair p > span {
    display: block;
    margin: 4px 0 0;
  }
  .hc-difference {
    gap: 15px;
  }
  .hc-difference > span {
    font-size: 9px;
  }
  .hc-samples-heading {
    font-size: 7px;
    gap: 15px;
  }
  .hc-sample-axis {
    margin-left: 80px;
    font-size: 7px;
  }
  .hc-sample-row {
    grid-template-columns: 70px 1fr;
    gap: 10px;
  }
  .hc-sample-row > strong {
    font-size: 10px;
  }
  .hc-samples > p {
    font-size: 8px;
  }
  .hc-all summary {
    font-size: 11px;
  }
  .hc-all summary > span:last-child {
    font-size: 8px;
    max-width: 120px;
    text-align: right;
    line-height: 1.6;
  }
  .hc footer {
    font-size: 8px;
    display: block;
  }
  .hc footer a {
    display: block;
    margin-top: 12px;
  }
}
</style>
