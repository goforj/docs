<script setup>
const apps = [
  { name: 'app', run: 'forj app', build: 'forj build', binary: './bin/app' },
  { name: 'admin', run: 'forj admin app', build: 'forj admin build', binary: './bin/admin' }
]
</script>

<template>
  <figure class="gf-project" aria-label="Two Apps share Go packages in one Project. Each App has its own wiring, commands, and standalone binary.">
    <div class="gf-project__intro">
      <span class="gf-project__eyebrow">ONE GO PROJECT</span>
      <strong>Shared code.<br> Independent Apps.</strong>
      <div class="gf-project__source"><span aria-hidden="true">{ }</span><div><code>internal/</code><small>Your shared Go packages</small></div></div>
    </div>
    <div class="gf-project__branches" aria-hidden="true"><span></span><span></span></div>
    <div class="gf-project__apps">
      <div v-for="app in apps" :key="app.name" class="gf-project__app" :class="{ 'gf-project__app--admin': app.name === 'admin' }">
        <header><svg viewBox="0 0 40 44" fill="none" aria-hidden="true"><path d="m4 12 16-9 16 9-16 9Z" fill="currentColor" fill-opacity=".18"/><path d="m4 12 16 9v20L4 32Z" fill="currentColor" fill-opacity=".06"/><path d="m20 21 16-9v20l-16 9Z" fill="currentColor" fill-opacity=".12"/><path d="m4 12 16-9 16 9v20l-16 9L4 32V12Zm0 0 16 9 16-9M20 21v20" stroke="currentColor" stroke-linejoin="round"/></svg><div><strong>{{ app.name }}</strong><small>Own wiring. Own binary.</small></div></header>
        <div class="gf-project__run"><span>RUN SOURCE</span><code>{{ app.run }}</code></div>
        <div class="gf-project__build"><code>{{ app.build }}</code><span aria-hidden="true">→</span><code class="gf-project__binary">{{ app.binary }}</code></div>
      </div>
    </div>
    <figcaption>Use <code>forj</code> to run current source. Build once, then deploy the binary without the CLI.</figcaption>
  </figure>
</template>

<style scoped>
.gf-project { display: grid; grid-template-columns: minmax(180px, .7fr) 60px minmax(0, 2fr); align-items: center; margin: 40px 0 0; padding: 30px; border: 1px solid var(--gf-line); border-radius: 16px; background: var(--gf-code-bg); }
.gf-project__eyebrow { color: var(--gf-ink-2); font-size: 9px; letter-spacing: .12em; }
.gf-project__intro > strong { display: block; margin-top: 10px; color: var(--gf-ink); font-size: 21px; line-height: 1.35; font-weight: 600; }
.gf-project__source { display: flex; align-items: center; gap: 12px; margin-top: 20px; }
.gf-project__source > span { display: grid; place-items: center; width: 36px; height: 36px; border: 1px solid var(--gf-line-strong); color: var(--gf-accent); font-family: var(--vp-font-family-mono); background: var(--gf-code-chrome); border-radius: 6px; }
.gf-project code { padding: 0; background: transparent; color: var(--gf-ink); font-size: 13px; white-space: nowrap; }
.gf-project__source small, .gf-project__app small { display: block; margin-top: 3px; color: var(--gf-ink-2); font-size: 10px; line-height: 1.5; }
.gf-project__branches { position: relative; display: flex; align-items: center; height: 100%; }
.gf-project__branches::before { content: ''; height: 1px; width: 50%; background: var(--gf-line-strong); }
.gf-project__branches > span:first-child { position: absolute; left: 50%; top: 0; bottom: 50%; width: 1px; background: var(--gf-line-strong); }
.gf-project__branches > span:last-child { position: absolute; left: 50%; right: 0; top: 0; height: 1px; background: var(--gf-line-strong); }
.gf-project__branches::after { content: ''; position: absolute; right: -3px; top: -2px; width: 5px; height: 5px; background: var(--gf-accent); }
.gf-project__apps { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; position: relative; padding-top: 24px; }
.gf-project__apps::before { content: ''; position: absolute; top: 0; left: -1px; right: calc(25% - 4.5px); height: 1px; background: var(--gf-line-strong); }
.gf-project__app { position: relative; border: 1px solid var(--gf-line-strong); border-radius: 10px; background: var(--gf-code-bg); --app-color: var(--gf-accent); }
.gf-project__app--admin { --app-color: #b79be1; }
.gf-project__app::before { content: ''; position: absolute; top: -25px; left: 50%; width: 1px; height: 24px; background: var(--gf-line-strong); }
.gf-project__app header { display: flex; gap: 12px; align-items: center; padding: 16px; background: var(--gf-code-chrome); border-bottom: 1px solid var(--gf-line); border-radius: 10px 10px 0 0; }
.gf-project__app header svg { width: 34px; height: 38px; flex-shrink: 0; color: var(--app-color); }
.gf-project__app header strong { color: var(--gf-ink); font-size: 15px; }
.gf-project__run { display: flex; flex-direction: column; gap: 8px; padding: 16px; }
.gf-project__run > span { color: var(--gf-ink-2); font-size: 8px; letter-spacing: .1em; }
.gf-project__build { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--gf-line); }
.gf-project__build code { font-size: 12px; color: var(--gf-ink-2); }
.gf-project__build > span { color: var(--gf-accent); }
.gf-project__build .gf-project__binary { color: var(--gf-ink); }
.gf-project figcaption { grid-column: 1 / -1; margin-top: 22px; color: var(--gf-ink-2); font-size: 12px; line-height: 1.7; }
.gf-project figcaption code { font-size: inherit; }
@media (max-width: 960px) {
 .gf-project { grid-template-columns: minmax(160px, .7fr) 32px minmax(0, 2fr); padding: 22px; }
 .gf-project__apps { gap: 12px; }
 .gf-project__intro > strong { font-size: 19px; }
}
@media (max-width: 640px) {
 .gf-project { grid-template-columns: minmax(0, 1fr); padding: 20px; }
 .gf-project__intro { text-align: center; }
 .gf-project__intro > strong br { display: none; }
 .gf-project__source { justify-content: center; text-align: left; margin-top: 14px; }
 .gf-project__branches { height: 30px; justify-content: center; }
 .gf-project__branches::before { width: 1px; height: 100%; }
 .gf-project__branches > span { display: none; }
 .gf-project__branches::after { right: auto; top: auto; bottom: -3px; }
 .gf-project__apps { padding-top: 15px; }
 .gf-project__apps::before { top: 0; left: calc(25% - 3px); right: calc(25% - 3px); }
 .gf-project__app { overflow: visible; }
 .gf-project__app::before { content: ''; position: absolute; top: -16px; left: 50%; width: 1px; height: 15px; background: var(--gf-line-strong); }
 .gf-project__app header { padding: 14px 10px; border-radius: 10px 10px 0 0; gap: 8px; flex-direction: column; text-align: center; }
 .gf-project__app header svg { width: 25px; height: 30px; }
 .gf-project__app small { font-size: 9px; line-height: 1.5; }
 .gf-project__run, .gf-project__build { padding: 12px 10px; }
 .gf-project code { font-size: 10px; white-space: normal; overflow-wrap: anywhere; }
 .gf-project__build { gap: 5px; }
 .gf-project figcaption { margin-top: 18px; }
}
</style>
