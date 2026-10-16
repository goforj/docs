<script setup>
import SitePreviewOriginal from './SitePreviewOriginal.vue'
defineProps({ original: { type: Boolean, default: false } })
</script>

<template>
  <SitePreviewOriginal v-if="original" />
  <main v-else class="gf-foundry-preview">
    <div class="gf-foundry-preview__brand"><img src="/favicon-seam-dark.svg" alt=""><span>GoForj</span></div>
    <h1>The composable<br>stack for<br><em>building with Go</em></h1>
    <p>For gophers and agents</p>
    <img class="gf-foundry-preview__art" src="/assets/foundry-social.png" alt="GoForj Foundry connects the application stack around one Go app">
    <span class="gf-foundry-preview__url">goforj.dev</span>
  </main>
</template>

<style scoped>
:global(html:has(.gf-foundry-preview)),:global(body:has(.gf-foundry-preview)),:global(#app:has(.gf-foundry-preview)) { margin:0; width:100%; height:100%; overflow:hidden; }
.gf-foundry-preview { position:relative; isolation:isolate; width:100vw; height:100vh; overflow:hidden; background:radial-gradient(ellipse at 77% 48%,#ff5e3a12,transparent 60%),#0c0a0e; color:#fff; font-family:var(--gf-font-sans,var(--vp-font-family-base)); }
.gf-foundry-preview__brand { position:absolute; left:6%; top:8%; display:flex; align-items:center; gap:12px; font-size:30px; font-weight:650; letter-spacing:-.04em; }
.gf-foundry-preview__brand img { width:36px; height:36px; }
.gf-foundry-preview h1 { position:absolute; z-index:1; left:6%; top:29%; margin:0; font-size:clamp(40px,4.5vw,68px); line-height:1.06; font-weight:650; letter-spacing:-.055em; }
.gf-foundry-preview h1 em { color:#ff8257; font-style:normal; }
.gf-foundry-preview p { position:absolute; left:6%; top:70%; margin:0; color:#a9a1b3; font:13px var(--gf-font-mono,monospace); letter-spacing:.1em; text-transform:uppercase; }
.gf-foundry-preview__art { position:absolute; z-index:0; width:59%; height:100%; right:2%; top:4%; object-fit:contain; }
.gf-foundry-preview__url { position:absolute; left:6%; bottom:8%; color:#a9a1b3; font:13px var(--gf-font-mono,monospace); }
</style>
