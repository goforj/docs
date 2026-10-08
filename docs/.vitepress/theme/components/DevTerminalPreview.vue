<!-- Consecutive preparation and startup output captured from the local CLI on
     2026-10-07, using templ + htmx with standalone drivers and SQLite.
     Only the isolated HTTP port 5196 is normalized to the default 3000.
     Terminal control sequences, transient progress frames, and preparation timings are omitted. -->
<template>
  <figure class="gf-dev-terminal" aria-label="Captured forj dev preparation and startup output">
    <div class="gf-dev-terminal__command"><span aria-hidden="true">$</span> forj dev</div>
    <pre class="gf-dev-terminal__output"><code><span class="gf-dev-terminal__rail gf-dev-terminal__rail--start">┏</span> Preparing App
<span class="gf-dev-terminal__rail">┃</span> <span class="t-ok">+</span> Build
<span class="gf-dev-terminal__rail">┃</span> <span class="t-ok">+</span> Migrations <span class="t-dim">· 5</span>
<span class="gf-dev-terminal__rail gf-dev-terminal__rail--end">┗</span> <span class="t-ok">+</span> Prepared</code></pre>
    <div class="gf-dev-terminal__tools"><span class="t-dim">1</span> App <span class="t-dim">2</span> Lighthouse <span class="t-dim">3</span> Swagger</div>
    <pre class="gf-dev-terminal__output"><code><span class="gf-dev-terminal__rail gf-dev-terminal__rail--start">┏</span> App startup <span class="t-dim">· Build App · Run App</span>
<span class="gf-dev-terminal__rail">┃</span> <span class="t-dim">03:18:58.651</span> <span class="t-jobs">Jobs        </span> Queue worker started <span class="t-dim">→ default · 30 workers</span>
<span class="gf-dev-terminal__rail">┃</span> <span class="t-dim">03:18:58.651</span> <span class="t-scheduler">Scheduler   </span> Scheduler started
<span class="gf-dev-terminal__rail">┃</span> <span class="t-dim">03:18:58.652</span> <span class="t-http">HTTP        </span> HTTP server started <span class="t-dim">→ :3000 · 27 routes</span>
<span class="gf-dev-terminal__rail gf-dev-terminal__rail--end">┗</span> <span class="t-ok">+ Ready</span> <span class="t-dim">· App :3000 · 3 resources · 618ms</span></code></pre>
    <div class="gf-dev-terminal__footer"><span><b class="t-ok">●</b> Lighthouse <b class="t-ok">●</b> API <span class="t-dim">○ Query  Debug 0</span></span><span>/ Find  x Command  ? Help</span></div>
  </figure>
</template>

<style scoped>
.gf-dev-terminal { min-width: 0; margin: 0; border: 1px solid var(--gf-line-strong); border-radius: 14px; background: var(--gf-code-bg); overflow: hidden; color: var(--gf-ink); font-family: var(--vp-font-family-mono); }
.gf-dev-terminal__command { padding: 18px 22px 0; font-size: 13px; }
.gf-dev-terminal__command > span { color: var(--gf-accent); margin-right: 5px; }
.gf-dev-terminal__output { margin: 0; padding: 18px 22px; overflow-x: auto; font-size: 11px; line-height: 1.65; background: transparent; }
.gf-dev-terminal__output code { display: block; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; white-space: pre; }
/* Draw the rail across line spacing so terminal glyphs remain connected at any zoom. */
.gf-dev-terminal__rail { display: inline-block; position: relative; width: 1ch; height: 1em; vertical-align: -.1em; color: transparent; }
.gf-dev-terminal__rail::before { content: ''; position: absolute; left: .15ch; top: -.325em; bottom: -.325em; width: 1.5px; background: var(--gf-ink); }
.gf-dev-terminal__rail--start::before { top: 50%; }
.gf-dev-terminal__rail--end::before { bottom: 50%; }
.gf-dev-terminal__rail--start::after, .gf-dev-terminal__rail--end::after { content: ''; position: absolute; top: calc(50% - .75px); left: .15ch; right: 0; height: 1.5px; background: var(--gf-ink); }
.gf-dev-terminal__tools { padding: 10px 22px; border-bottom: 1px solid var(--gf-line); font-size: 10px; white-space: pre; }
.gf-dev-terminal__footer { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px 12px; padding: 10px 22px; border-top: 1px solid var(--gf-line); color: var(--gf-ink-2); font-size: 8px; white-space: pre; }
.gf-dev-terminal__footer b { font-weight: 400; }
.gf-dev-terminal .t-dim { color: var(--gf-ink-2); }
.gf-dev-terminal .t-ok { color: #42b883; }
.gf-dev-terminal .t-jobs { color: #b79be1; }
.gf-dev-terminal .t-scheduler { color: #c49c54; }
.gf-dev-terminal .t-http { color: #50b6cf; }
@media (max-width: 640px) {
 .gf-dev-terminal__command { padding: 16px 16px 0; }
 .gf-dev-terminal__output { padding: 16px; font-size: 10px; }
 .gf-dev-terminal__tools, .gf-dev-terminal__footer { padding: 10px 16px; }
}
</style>
