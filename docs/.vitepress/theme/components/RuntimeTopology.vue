<script setup>
import { ref } from 'vue'
import { lucideIconBodies } from 'virtual:goforj-icons'

const separate = ref(false)

const runtimes = [
  { name: 'HTTP', icon: 'globe', command: 'forj api', color: '#50b6cf' },
  { name: 'Workers', icon: 'rows-3', command: 'forj worker', color: '#b79be1' },
  { name: 'Schedules', icon: 'radar', command: 'forj scheduler', color: '#42b883' },
  { name: 'Your runtime', command: 'Your command', color: '#ff986c', custom: true }
]
</script>

<template>
  <figure class="gf-topology" aria-label="An App can run HTTP, workers, and schedules together or in separate processes. Wire in a custom Runtime to host your own long-running service. Switch between one process and separate processes to see the runtime boundaries.">
    <div class="gf-topology__modes" role="group" aria-label="Runtime process layout">
      <button :aria-pressed="!separate" @click="separate = false">One process</button>
      <button :aria-pressed="separate" @click="separate = true">Separate processes</button>
    </div>
    <div class="gf-topology__app" :class="{ 'is-separate': separate }">
      <header class="gf-topology__header">
        <span><span class="gf-topology__status" aria-hidden="true"></span>app <small>{{ separate ? 'SEPARATE PROCESSES' : 'ONE PROCESS' }}</small></span>
        <code v-if="!separate"><span aria-hidden="true">$ </span>forj app</code><span v-else class="gf-topology__mode-note">Same App. Independent runtimes.</span>
      </header>
      <div class="gf-topology__stage">
        <div class="gf-topology__boundary"><span class="gf-topology__boundary-label">ONE PROCESS</span><div class="gf-topology__runtimes">
          <div v-for="runtime in runtimes" :key="runtime.name" class="gf-topology__runtime" :class="{ 'gf-topology__runtime--custom': runtime.custom }" :style="{ '--runtime-color': runtime.color }">
            <span class="gf-topology__process-label">PROCESS</span>
            <svg viewBox="0 0 80 88" fill="none" aria-hidden="true">
              <path d="m8 23 32-18 32 18-32 18Z" fill="currentColor" fill-opacity=".18" />
              <path d="m8 23 32 18v39L8 62Z" fill="currentColor" fill-opacity=".07" />
              <path d="m40 41 32-18v39L40 80Z" fill="currentColor" fill-opacity=".13" />
              <path d="m8 23 32-18 32 18v39L40 80 8 62V23Zm0 0 32 18 32-18M40 41v39" stroke="currentColor" stroke-opacity=".7" stroke-linejoin="round" />
              <path d="m8 68 32 18 32-18" stroke="currentColor" stroke-opacity=".2" />
              <g v-if="!runtime.custom" transform="matrix(1 -.5625 0 1 44 45)" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" v-html="lucideIconBodies[runtime.icon]" />
              <path v-else d="M56 40v16m-8-3.5 16-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            <strong>{{ runtime.name }}</strong><small class="gf-topology__custom-label" v-if="runtime.custom">Wired by you</small>
            <code class="gf-topology__runtime-command">{{ runtime.command }}</code>
          </div>
        </div></div>
        <div class="gf-topology__connections" aria-hidden="true"><i v-for="runtime in runtimes" :key="runtime.name"></i></div>
        <div class="gf-topology__shared"><span aria-hidden="true">{ }</span> Same Go service code</div>
      </div>
      <div class="gf-topology__caption" aria-live="polite">{{ separate ? 'Each runtime runs independently, using the same App wiring.' : 'Run built-in and custom runtimes together in one process.' }}</div>
      <div class="gf-topology__extension"><strong>Your server belongs here, too.</strong><span>Wire in a game server, FTP server, or another long-running Go service.</span></div>
    </div>
  </figure>
</template>

<style scoped>
.gf-topology { margin: 0; min-width: 0; }
.gf-topology__app { position: relative; border: 1px solid var(--gf-line-strong); border-radius: 18px; background: var(--gf-code-bg); overflow: hidden; }
.gf-topology__header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 19px 24px; border-bottom: 1px solid var(--gf-line); background: var(--gf-code-chrome); }
.gf-topology__header > span { display: flex; align-items: center; gap: 9px; color: var(--gf-ink); font-size: 15px; font-weight: 650; }
.gf-topology__header small { margin-left: 5px; color: var(--gf-ink-2); font-size: 9px; letter-spacing: .08em; font-weight: 500; }
.gf-topology__status { width: 5px; height: 5px; border-radius: 50%; background: var(--gf-ink-3); }
.gf-topology code { padding: 0; background: transparent; color: var(--gf-ink); font-size: 13px; white-space: nowrap; }
.gf-topology code span { color: var(--gf-accent); }
.gf-topology__stage { position: relative; padding: 30px 24px 40px; background: radial-gradient(ellipse at 50% 10%, color-mix(in srgb, var(--gf-accent) 6%, transparent), transparent 75%); }
.gf-topology__stage::before { content: ''; position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(var(--gf-line) 1px, transparent 1px), linear-gradient(90deg, var(--gf-line) 1px, transparent 1px); background-size: 28px 28px; opacity: .25; mask-image: linear-gradient(#000, transparent); }
.gf-topology__runtimes { position: relative; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.gf-topology__runtime { position: relative; display: flex; flex-direction: column; align-items: center; color: var(--runtime-color); }
.gf-topology__runtime svg { display: block; width: 86px; height: 95px; }
.gf-topology__runtime strong { margin-top: 10px; color: var(--gf-ink); font-size: 14px; font-weight: 600; }
.gf-topology__stem { width: 1px; height: 24px; margin-top: 13px; background: linear-gradient(var(--runtime-color), var(--gf-line-strong)); }
.gf-topology__runtimes::after { content: ''; position: absolute; bottom: 0; left: 12.5%; right: 12.5%; height: 1px; background: var(--gf-line-strong); }
.gf-topology__shared { position: relative; display: flex; justify-content: center; align-items: center; gap: 10px; width: fit-content; margin: 0 auto; padding: 14px 24px; border: 1px solid var(--gf-line-strong); border-radius: 8px; background: var(--gf-code-chrome); color: var(--gf-ink); font-size: 13px; }
.gf-topology__shared span { color: var(--gf-accent); font-family: var(--vp-font-family-mono); }

.gf-topology__modes { display: flex; gap: 4px; width: fit-content; margin: 0 0 16px auto; padding: 4px; border: 1px solid var(--gf-line); border-radius: 99px; background: var(--gf-code-bg); }
.gf-topology__modes button { padding: 8px 14px; border: 1px solid transparent; border-radius: 99px; color: var(--gf-ink-2); font-size: 12px; cursor: pointer; }
.gf-topology__modes button[aria-pressed="true"] { color: var(--gf-ink); border-color: var(--gf-line-strong); background: var(--gf-code-chrome); }
.gf-topology__modes button:focus-visible { outline: 2px solid var(--gf-accent); outline-offset: 3px; }
.gf-topology__header .gf-topology__mode-note { color: var(--gf-ink-2); font-size: 11px; font-weight: 400; }
.gf-topology__boundary { position: relative; border: 1px solid var(--gf-line-strong); border-radius: 12px; padding: 24px 8px 16px; }
.gf-topology__boundary-label { position: absolute; top: -8px; left: 16px; padding: 0 8px; color: var(--gf-ink-2); background: var(--gf-code-bg); font-size: 9px; letter-spacing: .1em; }
.gf-topology__runtimes { gap: 12px; }
.gf-topology__runtimes::after { display: none; }
.gf-topology__runtime { padding: 15px 4px; border: 1px solid transparent; border-radius: 8px; }
.gf-topology__process-label { height: 13px; font-size: 8px; letter-spacing: .12em; opacity: 0; }
.gf-topology .gf-topology__runtime-command { margin-top: 8px; font-size: 10px; opacity: 0; }
.is-separate .gf-topology__boundary { border-color: transparent; }
.is-separate .gf-topology__boundary-label { visibility: hidden; }
.is-separate .gf-topology__runtime { border-color: color-mix(in srgb, var(--runtime-color) 45%, transparent); background: color-mix(in srgb, var(--runtime-color) 4%, transparent); }
.is-separate .gf-topology__process-label, .is-separate .gf-topology__runtime-command { opacity: 1; }
.gf-topology__connections { position: relative; display: grid; grid-template-columns: repeat(4, 1fr); height: 36px; margin: 0 8px; }
.gf-topology__connections::after { content: ''; position: absolute; left: 12.5%; right: 12.5%; bottom: 0; height: 1px; background: var(--gf-line-strong); }
.gf-topology__connections i { height: 36px; width: 1px; margin: auto; background: var(--gf-line-strong); }
.gf-topology__custom-label { position: absolute; bottom: -2px; color: var(--runtime-color); font-size: 8px; letter-spacing: .04em; }
.gf-topology__runtime--custom svg { opacity: .85; }
.is-separate .gf-topology__runtime--custom { border-style: dashed; }
.gf-topology__extension { display: flex; flex-direction: column; gap: 5px; padding: 0 24px 24px; color: var(--gf-ink-2); font-size: 11px; line-height: 1.6; }
.gf-topology__extension strong { color: var(--gf-ink); font-size: 12px; font-weight: 600; }
.gf-topology__caption { border-top: 1px solid var(--gf-line); padding: 20px 24px; color: var(--gf-ink-2); font-size: 11px; line-height: 1.6; }
@media (max-width: 640px) {
 .gf-topology__header { padding: 16px; }
 .gf-topology__header small, .gf-topology__header .gf-topology__mode-note { display: none; }
 .gf-topology__stage { padding: 24px 10px 32px; }
 .gf-topology__runtime svg { width: 54px; height: 64px; }
 .gf-topology__runtime strong { font-size: 11px; }
 .gf-topology__runtimes { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 12px; }
 .gf-topology__connections { grid-template-columns: repeat(2, 1fr); }
 .gf-topology__connections i:nth-child(-n+2) { display: none; }
 .gf-topology__connections::after { left: 25%; right: 25%; }
 .gf-topology__extension { padding: 0 16px 22px; }
 .gf-topology__boundary { padding-inline: 0; }
 .gf-topology .gf-topology__runtime-command { font-size: 8px; white-space: normal; text-align: center; }
 .gf-topology__custom-label { position: absolute; bottom: -2px; color: var(--runtime-color); font-size: 8px; letter-spacing: .04em; }
.gf-topology__runtime--custom svg { opacity: .85; }
.is-separate .gf-topology__runtime--custom { border-style: dashed; }
.gf-topology__extension { display: flex; flex-direction: column; gap: 5px; padding: 0 24px 24px; color: var(--gf-ink-2); font-size: 11px; line-height: 1.6; }
.gf-topology__extension strong { color: var(--gf-ink); font-size: 12px; font-weight: 600; }
.gf-topology__caption { padding: 18px 16px; }
}
</style>
