<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
const props = defineProps({
  local: { type: Object, required: true },
  service: { type: Object, required: true },
  operation: { type: String, required: true },
  localConfig: { type: String, required: true },
  serviceConfig: { type: String, required: true },
})
const exponent = ref(5)
const replayed = ref(false)
const progress = ref(0)
let frame
let started
const windowNS = computed(() => 10 ** exponent.value)
const format = (value) =>
  value < 1000
    ? `${Number(value.toFixed(1))} ns`
    : value < 1e6
      ? `${Number((value / 1000).toFixed(1))} µs`
      : `${Number((value / 1e6).toFixed(1))} ms`
const fit = (value) => Math.max(2, Math.min(8, Math.ceil(Math.log10(value * 1.15))))
const lanes = computed(() => [props.local, props.service])
const elapsed = computed(() => progress.value * windowNS.value)
const stop = () => {
  if (frame) cancelAnimationFrame(frame)
  replayed.value = false
  progress.value = 0
}
const replay = () => {
  stop()
  replayed.value = true
  const motion = document.documentElement.dataset.gfMotion
  if (
    motion === 'reduced' ||
    (motion !== 'on' && matchMedia('(prefers-reduced-motion: reduce)').matches)
  ) {
    progress.value = 1
    return
  }
  started = performance.now()
  const tick = (now) => {
    progress.value = Math.min(1, (now - started) / 3500)
    if (progress.value < 1) frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
}
const zoom = (value) => {
  stop()
  exponent.value = fit(value)
}
watch(
  () => props.service,
  (value) => zoom(value.value),
  { immediate: true },
)
onBeforeUnmount(stop)
</script>
<template>
  <div class="lens">
    <div class="lens-top">
      <span><i></i> THE LATENCY LENS</span><span>One operation. One shared clock.</span>
    </div>
    <div class="lens-viewport">
      <div class="lens-ruler" aria-hidden="true">
        <span v-for="i in 5" :key="i" :style="{ left: `${(i - 1) * 25}%` }">{{
          format((windowNS * (i - 1)) / 4)
        }}</span>
      </div>
      <div class="lens-grid" aria-hidden="true">
        <i v-for="i in 21" :key="i" :style="{ left: `${(i - 1) * 5}%` }"></i>
      </div>
      <div
        v-for="(row, index) in lanes"
        :key="row.label"
        class="lens-lane"
        :class="{ 'lens-lane--service': index === 1 }"
      >
        <div class="lens-lane-label">
          <span>{{ index === 0 ? 'LOCAL PATH' : 'SERVICE PATH' }}</span
          ><strong>{{ row.label }}</strong
          ><span v-if="replayed" class="lens-status">{{
            elapsed >= row.value ? 'COMPLETE' : 'IN PROGRESS'
          }}</span>
        </div>
        <div class="lens-number">
          {{ format(row.value).split(' ')[0] }}<span>{{ format(row.value).split(' ')[1] }}</span>
        </div>
        <div class="lens-trace" aria-hidden="true">
          <div
            class="lens-beam"
            :style="{ width: `${Math.min(100, (row.value / windowNS) * 100)}%` }"
          >
            <i></i><span v-if="row.value > windowNS">continues beyond view →</span>
          </div>
          <div class="lens-track"></div>
        </div>
        <code>{{ index === 0 ? localConfig : serviceConfig }}</code>
      </div>
      <div v-if="replayed" class="lens-playhead" :style="{ left: `${progress * 100}%` }">
        <span>{{ format(elapsed) }}</span>
      </div>
    </div>
    <div class="lens-controls">
      <div class="lens-zoom">
        <span>ZOOM TO</span
        ><button @click="zoom(local.value)" :aria-pressed="exponent === fit(local.value)">
          {{ local.label }}</button
        ><button @click="zoom(service.value)" :aria-pressed="exponent === fit(service.value)">
          {{ service.label }}
        </button>
      </div>
      <button class="lens-play" @click="replay">
        <span aria-hidden="true">▷</span> Replay the difference
      </button>
    </div>
    <p class="lens-footnote">
      {{ operation }} · Linear time scale · Replay stretches this window to 3.5 seconds. An
      illustration of recorded timings, not a live benchmark.
    </p>
  </div>
</template>
<style scoped>
.lens {
  position: relative;
  --lens-local: var(--gf-accent-hi);
  --lens-service: var(--gf-nav);
  border-top: 1px solid var(--gf-line-strong);
}
.lens-top {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 0;
  font: 10px var(--gf-font-mono);
  letter-spacing: 0.06em;
  color: var(--gf-ink-2);
}
.lens-top > span:first-child {
  color: var(--gf-reference);
  display: flex;
  align-items: center;
  gap: 10px;
}
.lens-top i {
  width: 5px;
  height: 5px;
  background: var(--gf-accent);
}
.lens-viewport {
  position: relative;
  padding-top: 45px;
  padding-bottom: 15px;
  isolation: isolate;
  overflow: hidden;
}
.lens-ruler {
  position: absolute;
  top: 5px;
  inset-inline: 0;
  height: 20px;
  font: 10px var(--gf-font-mono);
  color: var(--gf-ink-2);
}
.lens-ruler span {
  position: absolute;
  transform: translateX(-50%);
  white-space: nowrap;
}
.lens-ruler span:first-child {
  transform: none;
}
.lens-ruler span:last-child {
  transform: translateX(-100%);
}
.lens-grid {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}
.lens-grid i {
  position: absolute;
  inset-block: 0;
  border-left: 1px solid var(--gf-line);
  opacity: 0.5;
}
.lens-grid i:nth-child(5n + 1) {
  opacity: 1;
}
.lens-lane {
  position: relative;
  padding: 20px 0 28px;
  --beam: var(--lens-local);
}
.lens-lane--service {
  --beam: var(--lens-service);
}
.lens-lane-label {
  display: flex;
  align-items: center;
  gap: 15px;
  font: 9px var(--gf-font-mono);
  color: var(--gf-ink-2);
  letter-spacing: 0.06em;
}
.lens-lane-label strong {
  font: 500 16px var(--gf-font-body);
  color: var(--gf-ink);
}
.lens-status {
  margin-left: auto;
  color: var(--beam);
  background: var(--gf-ground-deep);
  padding: 6px;
}
.lens-number {
  font: 500 clamp(76px, 10vw, 148px) / 1 var(--gf-font-display);
  letter-spacing: -0.075em;
  color: var(--beam);
  padding-block: 12px 20px;
  font-variant-numeric: tabular-nums;
}
.lens-number > span {
  font-size: 0.34em;
  letter-spacing: -0.04em;
  margin-left: 12px;
}
.lens-trace {
  height: 22px;
  position: relative;
  margin-bottom: 14px;
}
.lens-track {
  position: absolute;
  inset: 10px 0 auto;
  height: 1px;
  background: var(--gf-line-strong);
}
.lens-beam {
  position: absolute;
  height: 3px;
  top: 9px;
  left: 0;
  background: var(--beam);
  box-shadow: 0 0 16px color-mix(in srgb, var(--beam) 40%, transparent);
  z-index: 1;
}
.lens-beam::before {
  content: '';
  position: absolute;
  inset: -18px 0;
  background: linear-gradient(
    0deg,
    transparent,
    color-mix(in srgb, var(--beam) 6%, transparent),
    transparent
  );
}
.lens-beam i {
  position: absolute;
  right: -1px;
  top: -5px;
  height: 13px;
  width: 3px;
  background: var(--beam);
  box-shadow: 0 0 14px var(--beam);
}
.lens-beam > span {
  position: absolute;
  right: 6px;
  top: -25px;
  font: 9px var(--gf-font-mono);
  color: var(--gf-ink-2);
}
.lens-lane code {
  font: 10px var(--gf-font-mono);
  color: var(--gf-ink-2);
  background: var(--gf-ground-deep);
  padding: 2px 0;
}
.lens-playhead {
  position: absolute;
  top: 30px;
  bottom: 0;
  width: 1px;
  background: var(--gf-ink);
  pointer-events: none;
  z-index: 2;
}
.lens-playhead > span {
  position: absolute;
  top: -25px;
  right: 5px;
  white-space: nowrap;
  color: var(--gf-ink);
  font: 10px var(--gf-font-mono);
  background: var(--gf-ground-deep);
  padding: 4px;
}
.lens-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-block: 1px solid var(--gf-line);
  padding: 18px 0;
  gap: 20px;
}
.lens-zoom {
  display: flex;
  align-items: center;
  gap: 5px;
}
.lens-zoom > span {
  font: 9px var(--gf-font-mono);
  color: var(--gf-ink-2);
  margin-right: 12px;
}
.lens-controls button {
  border: 1px solid var(--gf-line-strong);
  padding: 9px 14px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
}
.lens-zoom button[aria-pressed='true'] {
  color: var(--gf-reference);
  border-color: var(--gf-accent);
  background: var(--gf-accent-soft);
}
.lens-controls .lens-play {
  color: var(--gf-on-accent);
  background: var(--gf-accent);
  border-color: var(--gf-accent);
  padding-inline: 18px;
}
.lens-play > span {
  margin-right: 8px;
  color: inherit;
}
.lens-footnote {
  color: var(--gf-ink-2);
  font: 10px/1.7 var(--gf-font-mono);
  max-width: 710px;
  padding-top: 14px;
}
@media (prefers-reduced-motion: no-preference) {
  :global(html:not([data-gf-motion='reduced'])) .lens-beam {
    transition: width 0.85s cubic-bezier(0.22, 1, 0.36, 1);
  }
}
:global(html[data-gf-motion='on']) .lens-beam {
  transition: width 0.85s cubic-bezier(0.22, 1, 0.36, 1);
}
@media (max-width: 600px) {
  .lens-top > span:last-child {
    display: none;
  }
  .lens-number {
    font-size: 90px;
  }
  .lens-controls {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
  }
  .lens-status {
    font-size: 7px;
  }
  .lens-lane-label {
    gap: 8px;
  }
  .lens-lane-label strong {
    font-size: 13px;
  }
  .lens-lane code {
    font-size: 9px;
  }
  .lens-footnote {
    font-size: 9px;
  }
  .lens-ruler {
    font-size: 8px;
  }
}
</style>
