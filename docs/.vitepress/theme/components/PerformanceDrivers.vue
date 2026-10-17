<script setup>
import { computed, ref } from 'vue'
const props = defineProps({
  coverage: { type: Array, required: true },
  sources: { type: Array, required: true },
})
const metric = ref('time')
const selected = ref({
  cache: 'Memory',
  queue: 'Worker pool',
  events: 'Synchronous',
  storage: 'Local',
})
const metrics = {
  time: { label: 'Time / op', field: 'value' },
  bytes: { label: 'Bytes / op', field: 'bytes' },
  allocs: { label: 'Allocs / op', field: 'allocs' },
}
const info = {
  cache: {
    name: 'Cache',
    operation: 'GetBytes',
    note: 'Seeded byte-value read.',
    icon: 'M4 5h16v5H4z M4 14h16v5H4z M7 8h1 M7 17h1',
  },
  queue: {
    name: 'Queue',
    operation: 'Dispatch return',
    note: 'Producer return, not job completion. Core NATS publish is not durable acknowledgement.',
    icon: 'M4 6h11 M4 12h11 M4 18h11 M17 9l3 3-3 3',
  },
  events: {
    name: 'Events',
    operation: 'Publish + delivery',
    note: 'Publish plus observed handler delivery.',
    icon: 'M12 3v5 M12 16v5 M3 12h5 M16 12h5 M9 9h6v6H9z',
  },
  storage: {
    name: 'Storage',
    operation: 'Get small object',
    note: 'Read a previously written object. rclone uses a local filesystem remote.',
    icon: 'm4 7 8-4 8 4-8 4z M4 7v10l8 4 8-4V7 M12 11v10',
  },
}
const families = computed(() =>
  Object.entries(info).map(([id, meta]) => {
    const family = props.coverage.find((f) => f.id === id)
    const rows = family.drivers
      .flatMap((d) => d.results)
      .sort((a, b) => (a.kind === 'noop') - (b.kind === 'noop') || a.value - b.value)
    const active = rows.filter((r) => r.kind !== 'noop')
    const values = active.map((r) => r[metrics[metric.value].field])
    const min = metric.value === 'time' ? 10 ** Math.floor(Math.log10(Math.min(...values))) : 0
    const max =
      metric.value === 'time'
        ? 10 ** Math.ceil(Math.log10(Math.max(...values)))
        : Math.max(...values) * 1.1
    const position = (value) =>
      metric.value === 'time'
        ? ((Math.log10(value) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))) * 100
        : (value / max) * 100
    const s = props.sources.find((s) => s.repo === id)
    return {
      id,
      ...meta,
      rows,
      active,
      min,
      max,
      position,
      detail: rows.find((r) => r.label === selected.value[id]),
      source: `https://github.com/goforj/${id}/blob/${s.revision}/${s.path}`,
    }
  }),
)
const unmeasured = computed(() =>
  props.coverage.flatMap((f) =>
    f.drivers.filter((d) => !d.results.length).map((d) => ({ family: f.id, ...d })),
  ),
)
const time = (value) =>
  value < 1000
    ? `${Number(value.toFixed(2))} ns`
    : value < 1e6
      ? `${Number((value / 1000).toFixed(2))} µs`
      : `${Number((value / 1e6).toFixed(2))} ms`
const number = (value) => Number(value.toFixed(1)).toLocaleString('en-US')
const format = (value) =>
  metric.value === 'time'
    ? time(value)
    : metric.value === 'bytes'
      ? `${number(value)} B`
      : number(value)
const kind = (value) =>
  ({
    process: 'In process',
    local: 'Host-local',
    service: 'Service boundary',
    noop: 'Discards jobs',
  })[value]
</script>
<template>
  <div class="profiles">
    <div class="profiles-toolbar">
      <div role="group" aria-label="Measurement">
        <button
          v-for="(item, id) in metrics"
          :key="id"
          :aria-pressed="metric === id"
          @click="metric = id"
        >
          {{ item.label }}
        </button>
      </div>
      <span>Every recorded driver. Select a result to inspect it.</span>
    </div>
    <div class="profiles-grid">
      <section
        v-for="family in families"
        :key="family.id"
        :id="`bench-${family.id}`"
        class="profile"
        :aria-label="`${family.name} benchmarks`"
      >
        <header>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path :d="family.icon" /></svg>
          <h3>{{ family.name }}</h3>
          <p>{{ family.operation }}</p>
        </header>
        <div class="profile-spectrum" aria-hidden="true">
          <div class="profile-spectrum-dots">
            <i
              v-for="(row, i) in family.active"
              :key="row.label"
              :class="[
                `profile-kind--${row.kind}`,
                { 'is-selected': selected[family.id] === row.label },
              ]"
              :style="{
                left: `${family.position(row[metrics[metric].field])}%`,
                top: `${8 + (i % 3) * 8}px`,
              }"
            ></i>
          </div>
          <div class="profile-spectrum-axis">
            <span>{{ format(family.min) }}</span
            ><span>{{ metric === 'time' ? 'LOG' : 'LINEAR' }}</span
            ><span>{{ format(family.max) }}</span>
          </div>
        </div>
        <div class="profile-results" role="group" :aria-label="`${family.name} driver results`">
          <button
            v-for="row in family.rows"
            :key="row.label"
            :class="[
              `profile-kind--${row.kind}`,
              { 'is-selected': selected[family.id] === row.label, 'is-noop': row.kind === 'noop' },
            ]"
            :aria-pressed="selected[family.id] === row.label"
            @click="selected[family.id] = row.label"
          >
            <span><i></i>{{ row.label }}<small v-if="row.kind === 'noop'">discard only</small></span
            ><strong>{{ format(row[metrics[metric].field]) }}</strong>
          </button>
        </div>
        <div class="profile-inspect" aria-live="polite" aria-atomic="true">
          <div>
            <strong>{{ family.detail.label }}</strong
            ><span>{{ kind(family.detail.kind) }}</span>
          </div>
          <p>
            {{ number(family.detail.allocs) }} allocs / op <span>·</span>
            {{ number(family.detail.bytes) }} B / op
          </p>
        </div>
        <footer>
          <p>{{ family.note }}</p>
          <a :href="family.source" target="_blank" rel="noopener noreferrer">Source results ↗</a>
        </footer>
      </section>
    </div>
    <div class="profiles-foot">
      <div class="profiles-legend">
        <span class="profile-kind--process"><i></i>In process</span
        ><span class="profile-kind--local"><i></i>Host-local</span
        ><span class="profile-kind--service"><i></i>Service boundary</span>
      </div>
      <p>
        Compare within a column. Each library measures a different operation. Service fixtures run
        in local containers or emulators.
      </p>
    </div>
    <details class="profiles-gaps">
      <summary>
        <span>Benchmark coverage</span
        ><span
          >{{ unmeasured.length }} drivers without a comparable recorded result
          <b aria-hidden="true">+</b></span
        >
      </summary>
      <p>
        All available measurements appear above. The NATS cache has two measured configurations. The
        drivers below have no result for these workloads; a missing result does not mean zero cost.
      </p>
      <ul>
        <li v-for="driver in unmeasured" :key="`${driver.family}-${driver.id}`">
          <span>{{ driver.family }}</span
          ><strong>{{ driver.label }}</strong>
        </li>
      </ul>
      <p>
        Null cache and events drivers discard work. Mail delivery and database query workloads do
        not have benchmark snapshots feeding this page.
        <a href="/drivers">Full driver capabilities ↗</a>
      </p>
    </details>
  </div>
</template>
<style scoped>
.profiles {
  --profile-process: var(--gf-accent-hi);
  --profile-local: #91baa8;
  --profile-service: #ada2c6;
}
:global(html:not(.dark)) .profiles {
  --profile-local: #28745c;
  --profile-service: #735298;
}
.profiles-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 25px;
  align-items: center;
  border-block: 1px solid var(--gf-line-strong);
  padding-block: 18px;
  margin-bottom: 40px;
}
.profiles-toolbar > div {
  display: flex;
  gap: 4px;
}
.profiles-toolbar button {
  font: 10px var(--gf-font-mono);
  padding: 9px 14px;
  border: 1px solid transparent;
  border-radius: 4px;
  color: var(--gf-ink-2);
  cursor: pointer;
}
.profiles-toolbar button[aria-pressed='true'] {
  color: var(--gf-reference);
  border-color: var(--gf-line-strong);
  background: var(--gf-ground-deep);
}
.profiles-toolbar > span {
  font-size: 10px;
  color: var(--gf-ink-2);
}
.profiles-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;
}
.profile {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 0 25px;
  border-right: 1px solid var(--gf-line-strong);
  scroll-margin-top: 100px;
}
.profile:first-child {
  padding-left: 0;
}
.profile:last-child {
  padding-right: 0;
  border-right: 0;
}
.profile header {
  position: relative;
  padding-top: 35px;
}
.profile header > svg {
  position: absolute;
  width: 20px;
  height: 20px;
  left: 0;
  top: 0;
  stroke: var(--gf-accent-hi);
  stroke-width: 1.25;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.profile h3 {
  font: 500 30px var(--gf-font-display);
  letter-spacing: -0.045em;
  margin: 0;
  color: var(--gf-ink);
}
.profile header > p {
  font: 9px var(--gf-font-mono);
  color: var(--gf-ink-2);
  margin: 10px 0 0;
  min-height: 15px;
}
.profile-spectrum {
  margin: 26px 0 24px;
}
.profile-spectrum-dots {
  height: 40px;
  position: relative;
  border-bottom: 1px solid var(--gf-line-strong);
  margin-inline: 3px;
}
.profile-spectrum-dots > i {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--profile-color);
  transform: translateX(-50%);
}
.profile-spectrum-axis {
  display: flex;
  justify-content: space-between;
  gap: 5px;
  font: 7px var(--gf-font-mono);
  color: var(--gf-ink-2);
  padding-top: 9px;
}
.profile-spectrum-axis > span:nth-child(2) {
  font-size: 6px;
  color: var(--gf-ink-3);
}
.profile-kind--process {
  --profile-color: var(--profile-process);
}
.profile-kind--local {
  --profile-color: var(--profile-local);
}
.profile-kind--service {
  --profile-color: var(--profile-service);
}
.profile-kind--noop {
  --profile-color: var(--gf-ink-3);
}
.profile-results {
  flex: 1;
  min-height: 360px;
}
.profile-results > button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 10px;
  text-align: left;
  border-bottom: 1px solid var(--gf-line);
  padding: 12px 0;
  cursor: pointer;
  position: relative;
  min-height: 40px;
}
.profile-results > button::before {
  content: '';
  position: absolute;
  inset: 0 -8px;
  background: transparent;
  z-index: 0;
}
.profile-results > button:hover::before,
.profile-results > button.is-selected::before {
  background: color-mix(in srgb, var(--profile-color) 7%, transparent);
}
.profile-results > button > span {
  position: relative;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: var(--gf-ink);
  line-height: 1.4;
}
.profile-results i {
  flex-shrink: 0;
  width: 3px;
  height: 3px;
  background: var(--profile-color);
}
.profile-results strong {
  position: relative;
  white-space: nowrap;
  font: 11px var(--gf-font-mono);
  color: var(--gf-ink);
}
.profile-results .is-selected strong {
  color: var(--profile-color);
}
.profile-results .is-noop {
  margin-top: 8px;
  border-top: 1px dashed var(--gf-line-strong);
}
.profile-results .is-noop > span {
  flex-wrap: wrap;
}
.profile-results small {
  width: 100%;
  padding-left: 10px;
  font: 7px var(--gf-font-mono);
  color: var(--gf-ink-2);
}
.profile-inspect {
  border-top: 1px solid var(--gf-line-strong);
  padding-top: 18px;
  margin-top: 22px;
  min-height: 75px;
}
.profile-inspect > div {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}
.profile-inspect strong {
  font-size: 10px;
  font-weight: 500;
}
.profile-inspect > div > span {
  font: 7px var(--gf-font-mono);
  color: var(--gf-ink-2);
}
.profile-inspect > p {
  font: 8px/1.8 var(--gf-font-mono);
  color: var(--gf-reference);
  margin: 9px 0 0;
}
.profile-inspect > p > span {
  color: var(--gf-ink-3);
  margin-inline: 5px;
}
.profile footer > p {
  font-size: 9px;
  line-height: 1.9;
  color: var(--gf-ink-2);
  margin: 15px 0 0;
  min-height: 70px;
}
.profile footer > a {
  display: inline-block;
  margin-top: 12px;
  font-size: 9px;
  color: var(--gf-nav);
  text-decoration: none;
}
.profiles-foot {
  border-top: 1px solid var(--gf-line-strong);
  margin-top: 35px;
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  gap: 30px;
}
.profiles-legend {
  display: flex;
  gap: 20px;
  flex-shrink: 0;
  font: 8px var(--gf-font-mono);
  color: var(--gf-ink-2);
}
.profiles-legend > span {
  display: flex;
  align-items: center;
  gap: 6px;
}
.profiles-legend i {
  width: 4px;
  height: 4px;
  background: var(--profile-color);
  border-radius: 50%;
}
.profiles-foot > p {
  font-size: 9px;
  line-height: 1.8;
  color: var(--gf-ink-2);
  margin: 0;
  max-width: 450px;
}
.profiles .profiles-gaps {
  background: none;
  border: 0;
  border-top: 1px solid var(--gf-line-strong);
  border-radius: 0;
  padding: 0;
  margin-top: 25px;
}
.profiles-gaps summary {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  list-style: none;
  padding: 20px 0;
  cursor: pointer;
  font-size: 10px;
}
.profiles-gaps summary::-webkit-details-marker {
  display: none;
}
.profiles-gaps summary > span:last-child {
  font: 8px var(--gf-font-mono);
  color: var(--gf-ink-2);
  text-align: right;
}
.profiles-gaps summary b {
  font-size: 14px;
  font-weight: 400;
  margin-left: 18px;
  color: var(--gf-accent-hi);
}
.profiles-gaps[open] summary b {
  display: inline-block;
  transform: rotate(45deg);
}
.profiles-gaps > p {
  font-size: 10px;
  line-height: 1.9;
  color: var(--gf-ink-2);
  margin: 12px 0 20px;
  max-width: 800px;
}
.profiles-gaps > ul {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0 30px;
  list-style: none;
  margin: 20px 0;
  padding: 0;
}
.profiles-gaps li {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 9px 0;
  border-bottom: 1px solid var(--gf-line);
  margin: 0;
  font-size: 10px;
}
.profiles-gaps li > span {
  font: 8px var(--gf-font-mono);
  text-transform: capitalize;
  color: var(--gf-ink-2);
  width: 55px;
}
.profiles-gaps li > strong {
  font-weight: 400;
}
.profiles-gaps a {
  color: var(--gf-nav);
  text-decoration: none;
}
@media (max-width: 1100px) {
  .profile {
    padding-inline: 18px;
  }
  .profile-results > button > span,
  .profile-results strong {
    font-size: 9px;
  }
  .profiles-foot {
    display: block;
  }
  .profiles-foot > p {
    margin-top: 15px;
    max-width: none;
  }
  .profiles-toolbar > span {
    font-size: 9px;
    max-width: 230px;
    text-align: right;
  }
}
@media (max-width: 1100px) {
  .profiles-grid {
    grid-template-columns: 1fr 1fr;
    gap: 40px 0;
  }
  .profile {
    padding-inline: 25px;
  }
  .profile:nth-child(odd) {
    padding-left: 0;
  }
  .profile:nth-child(even) {
    padding-right: 0;
    border-right: 0;
  }
  .profile-results > button > span,
  .profile-results strong {
    font-size: 12px;
  }
  .profile-results {
    min-height: 0;
  }
  .profile footer > p {
    min-height: 0;
  }
  .profiles-toolbar > span {
    display: none;
  }
  .profile-inspect {
    margin-top: 25px;
  }
  .profiles-gaps > ul {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 520px) {
  .profiles-toolbar {
    margin-bottom: 30px;
  }
  .profiles-toolbar button {
    font-size: 9px;
    padding: 8px 12px;
  }
  .profiles-grid {
    grid-template-columns: 1fr;
    gap: 38px;
  }
  .profile,
  .profile:first-child,
  .profile:last-child,
  .profile:nth-child(odd),
  .profile:nth-child(even) {
    padding-inline: 0;
    border-right: 0;
    border-bottom: 1px solid var(--gf-line-strong);
    padding-bottom: 30px;
  }
  .profile:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }
  .profile h3 {
    font-size: 30px;
  }
  .profile header {
    padding-top: 0;
    padding-left: 32px;
  }
  .profile header > svg {
    top: 7px;
  }
  .profile-spectrum {
    margin-block: 20px;
  }
  .profile-spectrum-axis {
    font-size: 8px;
  }
  .profile-spectrum-axis > span:nth-child(2) {
    font-size: 7px;
  }
  .profile-results > button {
    padding-block: 12px;
  }
  .profile-results > button > span,
  .profile-results strong {
    font-size: 12px;
  }
  .profile-inspect > div > span {
    font-size: 8px;
  }
  .profile-inspect strong {
    font-size: 12px;
  }
  .profile-inspect > p {
    font-size: 10px;
  }
  .profile footer > p {
    font-size: 10px;
  }
  .profile footer > a {
    font-size: 10px;
  }
  .profiles-legend {
    gap: 15px;
    font-size: 7px;
  }
  .profiles-gaps summary {
    font-size: 10px;
  }
  .profiles-gaps summary > span:last-child {
    font-size: 7px;
    max-width: 180px;
    line-height: 1.7;
  }
  .profiles-gaps > ul {
    grid-template-columns: 1fr;
  }
  .profiles-gaps li {
    font-size: 11px;
  }
  .profiles-gaps li > span {
    font-size: 9px;
  }
}
.profiles button:focus-visible,
.profiles a:focus-visible,
.profiles summary:focus-visible {
  outline: 2px solid var(--gf-nav);
  outline-offset: 3px;
}
.profile-spectrum-dots > i.is-selected {
  outline: 1px solid var(--profile-color);
  outline-offset: 3px;
}
</style>
