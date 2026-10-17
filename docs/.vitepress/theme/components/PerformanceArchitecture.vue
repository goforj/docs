<script setup>
import { computed } from 'vue'

const props = defineProps({
  mode: { type: String, required: true },
  selected: { type: String, required: true },
  resources: { type: Array, required: true },
})
const emit = defineEmits(['update:mode', 'select'])
const nodes = [
  { id: 'cache', x: 480, y: 100 },
  { id: 'queue', x: 795, y: 255 },
  { id: 'storage', x: 480, y: 410 },
  { id: 'events', x: 165, y: 255 },
]
const resource = (id) => props.resources.find((item) => item.id === id)
const activeDriver = (id) => (props.mode === 'local' ? resource(id).local : resource(id).service)
const time = (value) => {
  if (value < 1000) return `${Number(value.toFixed(value < 100 ? 0 : 1))} ns`
  if (value < 1000000) return `${Number((value / 1000).toFixed(value < 10000 ? 2 : 1))} µs`
  return `${Number((value / 1000000).toFixed(2))} ms`
}
const boundary = computed(() =>
  props.mode === 'local' ? 'M480 10 950 255 480 500 10 255Z' : 'M480 155 670 255 480 355 290 255Z',
)
const connection = (node) => {
  if (node.id === 'cache') return 'M480 202V110'
  if (node.id === 'storage') return 'M480 310V375'
  return `M${node.id === 'queue' ? 565 : 395} 255H${node.x}`
}
</script>

<template>
  <div class="pa">
    <div class="pa-toolbar">
      <span class="pa-label"><i></i> One application. Two topologies.</span>
      <div class="pa-modes" role="group" aria-label="Application topology">
        <button :aria-pressed="mode === 'local'" @click="emit('update:mode', 'local')">
          Keep it local
        </button>
        <button :aria-pressed="mode === 'service'" @click="emit('update:mode', 'service')">
          Add infrastructure <span aria-hidden="true">↗</span>
        </button>
      </div>
    </div>
    <div class="pa-scene" :class="`pa-scene--${mode}`">
      <div class="pa-scene-caption">
        <span class="pa-step">{{ mode === 'local' ? '01' : '02' }}</span>
        <div>
          <strong>{{
            mode === 'local' ? 'One process. Short paths.' : 'Same contracts. Wider reach.'
          }}</strong>
          <p>
            {{
              mode === 'local'
                ? 'Memory, worker pool, synchronous events, local disk.'
                : 'Shared state, independent workers, cross-process events, object storage.'
            }}
          </p>
        </div>
      </div>
      <svg class="pa-diagram" viewBox="0 0 960 515" fill="none" aria-hidden="true">
        <defs>
          <pattern
            id="pf-architecture-grid"
            width="48"
            height="24"
            patternUnits="userSpaceOnUse"
            patternTransform="matrix(1 .52 -1 .52 480 0)"
          >
            <path d="M48 0H0V24" class="pa-grid" />
          </pattern>
          <radialGradient id="pf-architecture-glow">
            <stop stop-color="var(--gf-accent)" stop-opacity=".13" />
            <stop offset="1" stop-color="var(--gf-accent)" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="pf-architecture-face" x1="0" y1="0" x2="1" y2="1">
            <stop stop-color="var(--gf-surface)" />
            <stop offset="1" stop-color="var(--gf-ground-alt)" />
          </linearGradient>
        </defs>
        <ellipse cx="480" cy="255" rx="350" ry="220" fill="url(#pf-architecture-glow)" />
        <path d="M480 10 950 255 480 500 10 255Z" fill="url(#pf-architecture-grid)" />
        <path :d="boundary" class="pa-boundary" />
        <text
          class="pa-boundary-label"
          :x="mode === 'local' ? 660 : 605"
          :y="mode === 'local' ? 100 : 175"
          :transform="mode === 'local' ? 'rotate(27 660 100)' : 'rotate(27 605 175)'"
        >
          APP PROCESS
        </text>
        <g
          v-for="node in nodes"
          :key="`connection-${node.id}`"
          :class="{ 'pa-focus': selected === node.id }"
        >
          <path :d="connection(node)" class="pa-wire" />
          <path :d="connection(node)" class="pa-wire-bright" />
          <circle
            :cx="
              node.id === 'cache' || node.id === 'storage' ? 480 : node.id === 'queue' ? 650 : 310
            "
            :cy="node.id === 'cache' ? 155 : node.id === 'storage' ? 345 : 255"
            r="3"
            class="pa-contact"
          />
        </g>
        <g
          v-for="node in nodes"
          :key="node.id"
          :transform="`translate(${node.x} ${node.y})`"
          class="pa-resource"
          :class="{ 'pa-focus': selected === node.id }"
        >
          <path d="M0-49 108 7 0 63-108 7Z" class="pa-resource-base" />
          <path d="M-43-13 0 9 43-13V26L0 49-43 26Z" class="pa-resource-front" />
          <path d="M0 9 43-13V26L0 49Z" class="pa-resource-side" />
          <path d="M0-36 43-13 0 9-43-13Z" class="pa-resource-top" />
          <path d="m-15-13 15-8 15 8-15 8Z" class="pa-resource-mark" />
          <text
            :x="node.id === 'cache' ? -115 : node.id === 'storage' ? 115 : 0"
            :y="node.id === 'cache' ? -26 : node.id === 'storage' ? -5 : -66"
            :text-anchor="node.id === 'cache' ? 'end' : node.id === 'storage' ? 'start' : 'middle'"
            class="pa-resource-title"
          >
            {{ resource(node.id).name }}
          </text>
          <text
            :x="node.id === 'cache' ? -115 : node.id === 'storage' ? 115 : 0"
            :y="node.id === 'cache' ? -5 : node.id === 'storage' ? 17 : 83"
            :text-anchor="node.id === 'cache' ? 'end' : node.id === 'storage' ? 'start' : 'middle'"
            class="pa-driver"
          >
            {{ activeDriver(node.id).label }}
          </text>
        </g>
        <g class="pa-app" transform="translate(480 245)">
          <path d="M0-42 104 12 0 67-104 12Z" class="pa-app-shadow" />
          <path d="M-87-18 0 28 87-18V5L0 51-87 5Z" class="pa-app-bottom" />
          <path d="M-87-45 0 1 87-45V-22L0 24-87-22Z" class="pa-app-middle" />
          <path d="M-87-72 0-26 87-72V-49L0-3-87-49Z" class="pa-app-front" />
          <path d="M0-118 87-72 0-26-87-72Z" class="pa-app-top" />
          <path d="m-15-80 15-8 15 8v20l-15 9-15-9v-20Zm0 0 15 8 15-8M0-72v21" class="pa-forge" />
          <text x="0" y="88" text-anchor="middle" class="pa-app-title">YOUR APPLICATION</text>
          <text x="0" y="108" text-anchor="middle" class="pa-app-subtitle">
            services · handlers · repositories
          </text>
        </g>
      </svg>
      <div class="pa-unchanged">
        <span class="pa-unchanged-dot"></span><span>Application code stays in place</span
        ><span class="pa-unchanged-check">✓</span>
      </div>
      <div class="pa-scene-note">
        <span>Architecture illustration</span><span>Values are independent library operations</span>
      </div>
    </div>
    <div class="pa-measurements" role="group" aria-label="Select a resource measurement">
      <button
        v-for="item in resources"
        :key="item.id"
        :aria-pressed="selected === item.id"
        @click="emit('select', item.id)"
      >
        <span class="pa-measurement-name"
          >{{ item.name
          }}<span>{{ mode === 'local' ? item.local.label : item.service.label }}</span></span
        ><strong>{{ time((mode === 'local' ? item.local : item.service).value) }}</strong
        ><code class="pa-config"
          ><span
            >{{ (mode === 'local' ? item.localConfig : item.serviceConfig).split('=')[0] }}=</span
          ><span>{{
            (mode === 'local' ? item.localConfig : item.serviceConfig).split('=')[1]
          }}</span></code
        ><span class="pa-operation">{{ item.operation }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.pa {
  margin-top: 38px;
}
.pa-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-block: 1px solid var(--gf-line);
  padding: 15px 0;
  gap: 20px;
}
.pa-label {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font: 10px var(--gf-font-mono);
  color: var(--gf-ink-2);
}
.pa-label i {
  width: 5px;
  height: 5px;
  background: var(--gf-nav);
}
.pa-modes {
  display: flex;
  padding: 3px;
  background: var(--gf-code-chrome);
  border: 1px solid var(--gf-line);
  border-radius: 6px;
}
.pa-modes button {
  font: 11px var(--gf-font-body);
  padding: 9px 14px;
  color: var(--gf-ink-2);
  cursor: pointer;
  border-radius: 3px;
}
.pa-modes button[aria-pressed='true'] {
  color: var(--gf-on-accent);
  background: var(--gf-accent);
}
.pa-modes button span {
  margin-left: 8px;
}
.pa-modes button:focus-visible,
.pa-measurements button:focus-visible {
  outline: 2px solid var(--gf-nav);
  outline-offset: 4px;
}
.pa-scene {
  position: relative;
}
.pa-scene-caption {
  position: absolute;
  top: 30px;
  left: 0;
  display: flex;
  gap: 16px;
  max-width: 260px;
}
.pa-step {
  color: var(--gf-accent-hi);
  font: 26px var(--gf-font-display);
  letter-spacing: -0.06em;
  line-height: 1.1;
}
.pa-scene-caption strong {
  font: 500 14px var(--gf-font-display);
  letter-spacing: -0.02em;
  color: var(--gf-ink);
}
.pa-scene-caption p {
  font: 11px/1.7 var(--gf-font-body);
  color: var(--gf-ink-2);
  margin: 6px 0 0;
}
.pa-diagram {
  display: block;
  width: min(100%, 920px);
  margin: 0 auto;
  overflow: visible;
  padding-top: 28px;
  padding-bottom: 28px;
}
.pa-grid {
  stroke: var(--gf-line);
  stroke-width: 0.75;
}
.pa-boundary {
  stroke: var(--gf-nav);
  stroke-opacity: 0.4;
  stroke-dasharray: 4 5;
  stroke-width: 1;
  fill: color-mix(in srgb, var(--gf-nav) 2%, transparent);
}
.pa-boundary-label {
  font: 8px var(--gf-font-mono);
  letter-spacing: 0.12em;
  fill: var(--gf-ink-2);
}
.pa-wire {
  stroke: var(--gf-line-strong);
  stroke-width: 1.5;
}
.pa-wire-bright {
  stroke: var(--gf-nav);
  stroke-width: 1.3;
  opacity: 0.3;
}
.pa-scene--service .pa-wire-bright {
  stroke-dasharray: 3 5;
}
.pa-contact {
  fill: var(--gf-ground-deep);
  stroke: var(--gf-ink-2);
  stroke-width: 1;
}
.pa-focus .pa-wire-bright {
  opacity: 1;
  stroke: var(--gf-accent-hi);
  stroke-width: 2;
}
.pa-focus .pa-contact {
  fill: var(--gf-accent-hi);
  stroke: none;
}
.pa-resource-base {
  fill: var(--gf-ground-deep);
  stroke: var(--gf-line);
  stroke-width: 0.8;
}
.pa-resource-front {
  fill: var(--gf-ground-alt);
  stroke: var(--gf-line-strong);
}
.pa-resource-side {
  fill: var(--gf-surface);
  fill-opacity: 0.6;
  stroke: var(--gf-line-strong);
}
.pa-resource-top {
  fill: url(#pf-architecture-face);
  stroke: var(--gf-line-strong);
}
.pa-resource-mark {
  fill: none;
  stroke: var(--gf-ink-2);
  stroke-width: 0.7;
}
.pa-focus .pa-resource-front,
.pa-focus .pa-resource-side,
.pa-focus .pa-resource-top {
  stroke: var(--gf-nav);
}
.pa-focus .pa-resource-mark {
  stroke: var(--gf-nav);
  fill: var(--gf-nav-soft);
}
.pa-resource-title {
  font: 9px var(--gf-font-mono);
  letter-spacing: 0.12em;
  fill: var(--gf-ink-2);
  text-transform: uppercase;
}
.pa-driver {
  font: 500 13px var(--gf-font-display);
  fill: var(--gf-ink);
}
.pa-latency {
  font: 11px var(--gf-font-mono);
  fill: var(--gf-nav);
}
.pa-latency tspan {
  fill: var(--gf-ink-2);
  font-size: 8px;
}
.pa-app-shadow {
  fill: var(--gf-accent);
  fill-opacity: 0.07;
}
.pa-app-bottom,
.pa-app-middle,
.pa-app-front {
  stroke: var(--gf-accent);
  stroke-opacity: 0.7;
  fill: var(--gf-ground-alt);
}
.pa-app-middle {
  fill: color-mix(in srgb, var(--gf-accent) 12%, var(--gf-ground-alt));
}
.pa-app-front {
  fill: color-mix(in srgb, var(--gf-accent) 20%, var(--gf-ground-alt));
}
.pa-app-top {
  fill: color-mix(in srgb, var(--gf-accent) 8%, var(--gf-code-well));
  stroke: var(--gf-accent-hi);
}
.pa-forge {
  stroke: var(--gf-accent-hi);
  stroke-width: 1.3;
}
.pa-app-title {
  font: 9px var(--gf-font-mono);
  letter-spacing: 0.14em;
  fill: var(--gf-ink);
}
.pa-app-subtitle {
  font: 8px var(--gf-font-mono);
  fill: var(--gf-ink-2);
}
.pa-unchanged {
  position: absolute;
  top: 30px;
  right: 0;
  display: flex;
  align-items: center;
  gap: 9px;
  font: 9px var(--gf-font-mono);
  color: var(--gf-ink-2);
  padding: 9px 12px;
  border: 1px solid var(--gf-line);
  border-radius: 4px;
}
.pa-unchanged-dot {
  width: 4px;
  height: 4px;
  background: var(--gf-nav);
  border-radius: 50%;
}
.pa-unchanged-check {
  color: var(--gf-nav);
}
.pa-scene-note {
  position: absolute;
  bottom: 12px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  gap: 15px;
  font: 8px var(--gf-font-mono);
  color: var(--gf-ink-2);
}
.pa-measurements {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-block: 1px solid var(--gf-line);
}
.pa-measurements button {
  min-width: 0;
  padding: 22px 24px;
  text-align: left;
  border-right: 1px solid var(--gf-line);
  border-top: 2px solid transparent;
  cursor: pointer;
}
.pa-measurements button:first-child {
  padding-left: 0;
}
.pa-measurements button:last-child {
  border-right: 0;
}
.pa-measurements button[aria-pressed='true'] {
  border-top-color: var(--gf-accent);
}
.pa-measurement-name {
  display: flex;
  align-items: baseline;
  gap: 9px;
  color: var(--gf-ink);
  font: 500 12px var(--gf-font-display);
}
.pa-measurement-name > span {
  font: 9px var(--gf-font-mono);
  color: var(--gf-ink-2);
}
.pa-measurements strong {
  display: block;
  color: var(--gf-ink);
  font: 500 32px var(--gf-font-display);
  letter-spacing: -0.05em;
  margin-top: 12px;
}
.pa-operation {
  display: block;
  color: var(--gf-ink-2);
  font: 9px/1.5 var(--gf-font-mono);
  margin-top: 6px;
}
@media (prefers-reduced-motion: no-preference) {
  :global(html:not([data-gf-motion='reduced'])) .pa-boundary {
    transition: d 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }
}
:global(html[data-gf-motion='on']) .pa-boundary {
  transition: d 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
@media (max-width: 800px) {
  .pa-scene-caption {
    max-width: 200px;
    top: 15px;
  }
  .pa-unchanged {
    display: none;
  }
  .pa-diagram {
    padding-top: 60px;
  }
  .pa-measurements button {
    padding: 20px 15px;
  }
  .pa-measurement-name {
    display: block;
  }
  .pa-measurement-name > span {
    display: block;
    margin-top: 5px;
  }
}
@media (max-width: 520px) {
  .pa-toolbar {
    display: block;
    padding-block: 15px;
  }
  .pa-modes {
    margin-top: 15px;
    display: inline-flex;
  }
  .pa-modes button {
    font-size: 11px;
    padding: 10px 12px;
  }
  .pa-label {
    font-size: 9px;
  }
  .pa-scene-caption {
    position: static;
    max-width: none;
    padding-top: 25px;
  }
  .pa-step {
    font-size: 24px;
  }
  .pa-diagram {
    padding-top: 15px;
    padding-bottom: 20px;
    width: 100%;
  }
  .pa-scene-note {
    position: static;
    font-size: 7px;
    padding-bottom: 15px;
  }
  .pa-scene-note > span:last-child {
    max-width: 140px;
    text-align: right;
  }
  .pa-measurements {
    grid-template-columns: 1fr 1fr;
  }
  .pa-measurements button {
    padding: 17px 14px;
    border-bottom: 1px solid var(--gf-line);
  }
  .pa-measurements button:first-child {
    padding-left: 14px;
  }
  .pa-measurements button:nth-child(even) {
    border-right: 0;
  }
  .pa-measurements strong {
    font-size: 28px;
  }
  .pa-operation {
    font-size: 8px;
  }
  .pa-driver,
  .pa-latency {
    display: none;
  }
  .pa-resource-title {
    font-size: 17px;
  }
  .pa-app-title {
    font-size: 13px;
  }
  .pa-app-subtitle {
    display: none;
  }
}

.pa-config {
  display: block;
  color: var(--gf-reference);
  font: 9px/1.6 var(--gf-font-mono);
  background: none;
  padding: 0;
  margin-top: 9px;
  overflow-wrap: anywhere;
}
@media (max-width: 520px) {
  .pa-config {
    font-size: 8px;
  }
  .pa-config > span {
    display: block;
  }
}
</style>
