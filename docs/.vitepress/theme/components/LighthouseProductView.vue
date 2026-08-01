<template>
  <figure class="gf-lighthouse" aria-labelledby="gf-lighthouse-caption">
    <div class="gf-lighthouse__chrome">
      <span></span><span></span><span></span>
      <strong>Lighthouse</strong>
      <em>connected</em>
    </div>
    <div class="gf-lighthouse__body">
      <aside class="gf-lighthouse__rail" aria-label="Lighthouse views">
        <b>Overview</b>
        <span>Inspects</span>
        <span>Routes</span>
        <span>Queues</span>
        <span>Schedules</span>
        <span>Cache</span>
        <span>Storage</span>
        <span>Benchmarks</span>
      </aside>
      <div class="gf-lighthouse__workspace">
        <div class="gf-lighthouse__identity">
          <div><small>PROJECT</small><strong>photodrop</strong></div>
          <div><small>APP</small><strong>app</strong></div>
          <div><small>RUNTIME</small><strong>http</strong></div>
          <span>live</span>
        </div>
        <div class="gf-lighthouse__grid">
          <section class="gf-lighthouse__panel gf-lighthouse__panel--wide">
            <header><strong>Recent inspects</strong><small>execution timeline</small></header>
            <div class="gf-lighthouse__inspect">
              <span class="is-method">GET</span><b>/-/health</b><span class="is-ok">OK</span><time>http</time>
            </div>
            <div class="gf-lighthouse__timeline" aria-label="Inspect event timeline">
              <i></i><span>request started</span>
              <i></i><span>route matched</span>
              <i></i><span>response written</span>
            </div>
          </section>
          <section class="gf-lighthouse__panel">
            <header><strong>Routes</strong><small>registered</small></header>
            <p><span class="is-method">GET</span><code>/-/health</code></p>
            <p><span class="is-method is-post">POST</span><code>/api/photos</code></p>
          </section>
          <section class="gf-lighthouse__panel">
            <header><strong>Runtime resources</strong><small>discovered</small></header>
            <p><b>Queues</b><span>default</span></p>
            <p><b>Schedules</b><span>registered</span></p>
            <p><b>Storage</b><span>local</span></p>
          </section>
        </div>
      </div>
    </div>
    <figcaption id="gf-lighthouse-caption">A code-native view of the shipped Lighthouse workspace. The available views follow the components compiled into the selected App.</figcaption>
  </figure>
</template>

<style scoped>
.gf-lighthouse {
  margin: 1.75rem 0 2.25rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 78%, #ffb648 22%);
  border-radius: 18px;
  background: #100d13;
  box-shadow: 0 26px 70px rgb(0 0 0 / 28%);
  color: #eee9f2;
}
.gf-lighthouse__chrome { display: flex; align-items: center; gap: 7px; padding: 11px 14px; border-bottom: 1px solid #2b2431; background: #18131c; }
.gf-lighthouse__chrome > span { width: 8px; height: 8px; border-radius: 50%; background: #665c6d; }
.gf-lighthouse__chrome > span:first-child { background: #ff725e; }
.gf-lighthouse__chrome > span:nth-child(2) { background: #ffc24d; }
.gf-lighthouse__chrome > span:nth-child(3) { background: #5fcfa8; }
.gf-lighthouse__chrome strong { margin-left: 8px; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
.gf-lighthouse__chrome em { margin-left: auto; color: #78dbb8; font-size: 11px; font-style: normal; }
.gf-lighthouse__body { display: grid; grid-template-columns: 142px minmax(0, 1fr); min-height: 390px; }
.gf-lighthouse__rail { display: flex; flex-direction: column; gap: 3px; padding: 17px 10px; border-right: 1px solid #2b2431; color: #9990a1; font-size: 11px; }
.gf-lighthouse__rail span, .gf-lighthouse__rail b { padding: 7px 10px; border-radius: 7px; }
.gf-lighthouse__rail b { background: #2b2231; color: #fff; }
.gf-lighthouse__workspace { min-width: 0; padding: 18px; background: radial-gradient(circle at 75% 5%, rgb(125 72 148 / 13%), transparent 38%), #100d13; }
.gf-lighthouse__identity { display: grid; grid-template-columns: 1.4fr 1fr 1fr auto; gap: 8px; margin-bottom: 12px; }
.gf-lighthouse__identity > div { padding: 9px 11px; border: 1px solid #312838; border-radius: 9px; background: #18141c; }
.gf-lighthouse__identity small { display: block; color: #84798c; font-size: 8px; letter-spacing: .16em; }
.gf-lighthouse__identity strong { display: block; margin-top: 2px; font-size: 12px; }
.gf-lighthouse__identity > span { align-self: center; padding: 4px 9px; border: 1px solid rgb(95 207 168 / 30%); border-radius: 99px; background: rgb(95 207 168 / 9%); color: #78dbb8; font-size: 10px; }
.gf-lighthouse__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.gf-lighthouse__panel { min-width: 0; padding: 13px; border: 1px solid #312838; border-radius: 11px; background: rgb(27 22 31 / 92%); }
.gf-lighthouse__panel--wide { grid-row: span 2; }
.gf-lighthouse__panel header { display: flex; justify-content: space-between; gap: 8px; padding-bottom: 10px; border-bottom: 1px solid #2b2431; font-size: 11px; }
.gf-lighthouse__panel header small { color: #84798c; }
.gf-lighthouse__inspect { display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 8px; margin-top: 11px; padding: 9px; border-radius: 8px; background: #100d13; font-size: 10px; }
.gf-lighthouse__inspect time { color: #84798c; }
.is-method { display: inline-flex; width: max-content; padding: 2px 5px; border: 1px solid rgb(86 170 255 / 35%); border-radius: 5px; color: #8dc6ff; font-size: 9px; font-weight: 700; }
.is-post { border-color: rgb(198 137 255 / 35%); color: #d4a8ff; }
.is-ok { color: #78dbb8; }
.gf-lighthouse__timeline { display: grid; grid-template-columns: 12px 1fr; gap: 13px 8px; margin: 18px 10px; color: #aaa1b1; font-size: 10px; }
.gf-lighthouse__timeline i { position: relative; width: 7px; height: 7px; margin-top: 3px; border: 2px solid #ffc24d; border-radius: 50%; }
.gf-lighthouse__timeline i:not(:last-of-type)::after { content: ''; position: absolute; top: 8px; left: 1px; width: 1px; height: 22px; background: #51405d; }
.gf-lighthouse__panel p { display: flex; align-items: center; gap: 8px; margin: 9px 0 0; color: #aaa1b1; font-size: 10px; }
.gf-lighthouse__panel p span:last-child { margin-left: auto; color: #84798c; }
.gf-lighthouse__panel code { overflow: hidden; color: #d8d0dd; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.gf-lighthouse figcaption { padding: 10px 14px; border-top: 1px solid #2b2431; color: #8f8596; font-size: 10px; line-height: 1.5; }
@media (max-width: 700px) {
  .gf-lighthouse__body { grid-template-columns: 1fr; }
  .gf-lighthouse__rail { flex-direction: row; overflow-x: auto; border-right: 0; border-bottom: 1px solid #2b2431; }
  .gf-lighthouse__rail span, .gf-lighthouse__rail b { white-space: nowrap; }
  .gf-lighthouse__identity { grid-template-columns: 1fr 1fr; }
  .gf-lighthouse__grid { grid-template-columns: 1fr; }
  .gf-lighthouse__panel--wide { grid-row: auto; }
}
</style>
