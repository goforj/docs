<script setup>
import { computed } from 'vue'
const props = defineProps({
  coverage: { type: Array, required: true },
  sources: { type: Array, required: true },
})
const info = {
  cache: {
    name: 'Cache',
    operation: 'GetBytes',
    note: 'Seeded byte-value reads. The NATS KV + TTL row is a second configuration of the NATS driver.',
    link: '/cache',
  },
  queue: {
    name: 'Queue',
    operation: 'Dispatch return',
    note: 'Producer-side return, not job completion. Null drops jobs; Core NATS publish return is not durable acknowledgement.',
    link: '/queue',
  },
  events: {
    name: 'Events',
    operation: 'Publish + handler delivery',
    note: 'Publish plus observed handler delivery. Null drops events, so it cannot complete this round-trip workload.',
    link: '/events',
  },
  storage: {
    name: 'Storage',
    operation: 'Get small object',
    note: 'Read a previously written object. rclone is measured with a local filesystem remote.',
    link: '/storage',
  },
  mail: {
    name: 'Mail',
    operation: 'No recorded delivery suite',
    note: 'No comparable per-driver delivery benchmark snapshot is available for this page.',
    link: '/mail',
  },
  database: {
    name: 'Database',
    operation: 'No recorded query suite',
    note: 'No comparable query benchmark snapshot is available. SQL-backed cache and queue results measure those library operations, not database query performance.',
    link: '/data/database-strategy',
  },
}
const families = computed(() =>
  ['cache', 'queue', 'events', 'storage', 'mail', 'database'].map((id) => {
    const family = props.coverage.find((c) => c.id === id)
    return {
      ...family,
      ...info[id],
      measured: family.drivers.filter((d) => d.results.length).length,
      rows: family.drivers.flatMap((d) =>
        d.results.length
          ? d.results.map((result) => ({ ...result, id: d.id, measured: true }))
          : [{ id: d.id, label: d.label, measured: false }],
      ),
    }
  }),
)
const total = computed(() => families.value.reduce((n, f) => n + f.drivers.length, 0))
const measured = computed(() => families.value.reduce((n, f) => n + f.measured, 0))
const time = (value) =>
  value < 1000
    ? `${Number(value.toFixed(2))} ns`
    : value < 1e6
      ? `${Number((value / 1000).toFixed(2))} µs`
      : `${Number((value / 1e6).toFixed(2))} ms`
const number = (value) => Number(value.toFixed(1)).toLocaleString('en-US')
const sourceURL = (id) => {
  const s = props.sources.find((s) => s.repo === id)
  return `https://github.com/goforj/${s.repo}/blob/${s.revision}/${s.path}`
}
const missing = (family, driver) =>
  driver === 'null'
    ? 'No comparable result; no-op driver'
    : family === 'mail' || family === 'database'
      ? 'No benchmark snapshot'
      : 'Not in the recorded snapshot'
</script>
<template>
  <div class="da">
    <div class="da-summary">
      <strong
        >{{ measured }}<span> / {{ total }}</span></strong
      >
      <p>
        drivers with recorded measurements<span
          >All {{ total }} supported drivers are listed below. NATS cache includes two measured
          configurations.</span
        >
      </p>
    </div>
    <nav class="da-index" aria-label="Driver families">
      <a v-for="family in families" :key="family.id" :href="`#bench-${family.id}`"
        ><strong>{{ family.name }}</strong
        ><span>{{ family.measured }} / {{ family.drivers.length }} measured</span
        ><b aria-hidden="true">↓</b></a
      >
    </nav>
    <div class="da-grid">
      <section
        v-for="family in families"
        :key="family.id"
        :id="`bench-${family.id}`"
        class="da-family"
      >
        <header>
          <div>
            <h3>{{ family.name }}</h3>
            <span>{{ family.operation }}</span>
          </div>
          <span>{{ family.measured }} / {{ family.drivers.length }}</span>
        </header>
        <div class="da-table-scroll">
          <table :aria-label="`${family.name} driver benchmark results`">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Time / op</th>
                <th>Allocs</th>
                <th>Bytes</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in family.rows"
                :key="`${row.id}-${row.label}`"
                :class="{ 'da-missing': !row.measured, 'da-noop': row.id === 'null' }"
              >
                <th>
                  {{ row.label
                  }}<span v-if="row.id === 'null' && row.measured">Drops jobs, discard only</span>
                </th>
                <template v-if="row.measured"
                  ><td>{{ time(row.value) }}</td>
                  <td>{{ number(row.allocs) }}</td>
                  <td>{{ number(row.bytes) }}</td></template
                >
                <td v-else colspan="3">{{ missing(family.id, row.id) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>{{ family.note }}</p>
        <footer>
          <a :href="family.link">{{ family.name }} driver details ↗</a
          ><a
            v-if="family.measured"
            :href="sourceURL(family.id)"
            target="_blank"
            rel="noopener noreferrer"
            >Recorded results ↗</a
          >
        </footer>
      </section>
    </div>
    <p class="da-scope">
      Lower time is faster within the same operation. Allocations and bytes are per operation.
      Service results use local containers or emulators, not a production network. Missing results
      are not zero-cost operations.
    </p>
  </div>
</template>
<style scoped>
.da-summary {
  display: flex;
  align-items: center;
  gap: 25px;
  padding-block: 22px;
  border-top: 1px solid var(--gf-line-strong);
}
.da-summary > strong {
  font: 500 56px/1 var(--gf-font-display);
  letter-spacing: -0.055em;
  color: var(--gf-accent-hi);
}
.da-summary > strong > span {
  font-size: 30px;
  color: var(--gf-ink-3);
}
.da-summary > p {
  margin: 0;
  font-size: 13px;
  line-height: 1.8;
}
.da-summary > p > span {
  display: block;
  color: var(--gf-ink-2);
  font-size: 10px;
  margin-top: 3px;
}
.da-index {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  border-block: 1px solid var(--gf-line-strong);
  margin-bottom: 45px;
}
.da-index > a {
  position: relative;
  display: block;
  padding: 18px 12px;
  border-right: 1px solid var(--gf-line);
  text-decoration: none;
  color: var(--gf-ink);
}
.da-index > a:first-child {
  padding-left: 0;
}
.da-index > a:last-child {
  border-right: 0;
}
.da-index strong {
  font: 500 14px var(--gf-font-display);
}
.da-index span {
  display: block;
  font: 8px var(--gf-font-mono);
  color: var(--gf-ink-2);
  margin-top: 8px;
}
.da-index b {
  position: absolute;
  right: 10px;
  top: 20px;
  font-size: 10px;
  font-weight: 400;
  color: var(--gf-accent-hi);
}
.da-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px 65px;
}
.da-family {
  min-width: 0;
  scroll-margin-top: 100px;
}
.da-family > header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  border-bottom: 1px solid var(--gf-line-strong);
  padding-bottom: 18px;
}
.da-family h3 {
  font: 500 28px var(--gf-font-display);
  letter-spacing: -0.04em;
  margin: 0;
  color: var(--gf-ink);
}
.da-family > header > div > span {
  display: block;
  font: 9px var(--gf-font-mono);
  margin-top: 8px;
  color: var(--gf-ink-2);
}
.da-family > header > span {
  font: 10px var(--gf-font-mono);
  color: var(--gf-accent-hi);
}
.da-table-scroll {
  overflow-x: auto;
}
.da table {
  display: table;
  width: 100%;
  margin: 0;
  border-collapse: collapse;
  font: 10px var(--gf-font-mono);
  white-space: nowrap;
}
.da th,
.da td {
  text-align: right;
  padding: 12px 8px;
  border: 0;
  border-bottom: 1px solid var(--gf-line);
  background: none;
}
.da th:first-child {
  padding-left: 0;
  text-align: left;
  font-weight: 400;
}
.da th:last-child,
.da td:last-child {
  padding-right: 0;
}
.da thead th {
  font-size: 8px;
  color: var(--gf-ink-2);
  font-weight: 400;
  padding-top: 18px;
}
.da tbody tr {
  background: none;
}
.da tbody th {
  text-transform: none;
  letter-spacing: normal;
  color: var(--gf-ink);
  font-family: var(--gf-font-body);
  font-size: 11px;
}
.da tbody td:nth-child(2) {
  color: var(--gf-reference);
}
.da tbody td:not(:nth-child(2)) {
  color: var(--gf-ink-2);
}
.da tbody .da-missing td {
  font-size: 8px;
  color: var(--gf-ink-2);
  white-space: normal;
  line-height: 1.6;
}
.da tbody th > span {
  display: block;
  font: 8px/1.6 var(--gf-font-mono);
  color: var(--gf-ink-2);
  margin-top: 4px;
}
.da-family > p {
  font-size: 10px;
  line-height: 1.9;
  color: var(--gf-ink-2);
  margin: 17px 0 0;
}
.da-family > footer {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding-top: 15px;
  font-size: 9px;
}
.da a {
  color: var(--gf-nav);
  text-decoration: none;
}
.da-scope {
  font: 9px/1.9 var(--gf-font-mono);
  color: var(--gf-ink-2);
  padding-top: 30px;
  border-top: 1px solid var(--gf-line-strong);
  margin: 40px 0 0;
}
@media (max-width: 1000px) {
  .da-grid {
    gap: 40px 30px;
  }
  .da-index {
    grid-template-columns: repeat(3, 1fr);
  }
  .da-index > a:nth-child(3) {
    border-right: 0;
  }
  .da-index > a:nth-child(4) {
    padding-left: 0;
  }
}
@media (max-width: 760px) {
  .da-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .da-summary {
    gap: 18px;
  }
  .da-summary > strong {
    font-size: 45px;
    white-space: nowrap;
  }
  .da-summary > strong > span {
    font-size: 24px;
  }
  .da-summary > p {
    font-size: 11px;
  }
  .da-summary > p > span {
    font-size: 9px;
  }
  .da-index {
    margin-bottom: 30px;
  }
  .da-index strong {
    font-size: 12px;
  }
  .da-index span {
    font-size: 7px;
  }
  .da-index b {
    display: none;
  }
  .da-family h3 {
    font-size: 26px;
  }
  .da table {
    font-size: 9px;
  }
  .da th,
  .da td {
    padding: 12px 5px;
  }
  .da tbody th {
    font-size: 10px;
  }
  .da thead th {
    font-size: 7px;
  }
  .da-scope {
    font-size: 8px;
  }
}
</style>
