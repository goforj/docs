<script setup>
import GoForjHeroStack from './GoForjHeroStack.vue'
</script>

<template>
  <main class="gf-site-preview">
    <div class="gf-site-preview__grid" aria-hidden="true"></div>

    <div class="gf-site-preview__brand">
      <img class="gf-site-preview__brand-light" src="/favicon-seam-light.svg" alt="">
      <img class="gf-site-preview__brand-dark" src="/favicon-seam-dark.svg" alt="">
      <span>GoForj</span>
    </div>

    <h1>
      The composable<br>
      stack for<br>
      <em>building with Go</em>
    </h1>

    <div class="gf-site-preview__forge" aria-hidden="true">
      <GoForjHeroStack static-preview />
    </div>
  </main>
</template>

<style scoped>
:global(html:has(.gf-site-preview)),
:global(body:has(.gf-site-preview)),
:global(#app:has(.gf-site-preview)) {
  width: 100%;
  min-width: 100%;
  height: 100%;
  min-height: 100%;
  margin: 0;
  overflow: hidden;
}

.gf-site-preview {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 76% 48%, rgba(255, 94, 58, 0.12), transparent 32%),
    #fff;
  color: #0d0b10;
}

:global(html.dark .gf-site-preview) {
  background:
    radial-gradient(circle at 76% 48%, rgba(255, 94, 58, 0.18), transparent 34%),
    #0c0a0e;
  color: #f8f4f2;
}

.gf-site-preview__grid {
  position: absolute;
  inset: -20%;
  opacity: 0.48;
  background-image:
    linear-gradient(30deg, transparent 49.65%, rgba(83, 68, 94, 0.12) 49.8%, rgba(83, 68, 94, 0.12) 50.2%, transparent 50.35%),
    linear-gradient(150deg, transparent 49.65%, rgba(83, 68, 94, 0.12) 49.8%, rgba(83, 68, 94, 0.12) 50.2%, transparent 50.35%);
  background-size: 88px 50px;
  mask-image: linear-gradient(90deg, rgba(0, 0, 0, 0.8), transparent 78%);
}

:global(html.dark .gf-site-preview__grid) {
  opacity: 0.4;
  background-image:
    linear-gradient(30deg, transparent 49.65%, rgba(193, 174, 207, 0.1) 49.8%, rgba(193, 174, 207, 0.1) 50.2%, transparent 50.35%),
    linear-gradient(150deg, transparent 49.65%, rgba(193, 174, 207, 0.1) 49.8%, rgba(193, 174, 207, 0.1) 50.2%, transparent 50.35%);
}

.gf-site-preview__brand {
  position: absolute;
  z-index: 3;
  top: 8.5%;
  left: 7.2%;
  display: flex;
  align-items: center;
  gap: 0.88rem;
  font-family: var(--gf-font-display);
  font-size: clamp(1.85rem, 2.8vw, 2.75rem);
  font-weight: 700;
  letter-spacing: -0.04em;
}

.gf-site-preview__brand img {
  width: 1.4em;
  height: 1.4em;
}

.gf-site-preview__brand-dark {
  display: none;
}

:global(html.dark .gf-site-preview__brand-light) {
  display: none;
}

:global(html.dark .gf-site-preview__brand-dark) {
  display: block;
}

.gf-site-preview h1 {
  position: absolute;
  z-index: 3;
  left: 7.2%;
  bottom: 11%;
  width: 50%;
  margin: 0;
  font-family: var(--gf-font-display);
  font-size: clamp(3.2rem, 5.25vw, 5.5rem);
  font-weight: 700;
  line-height: 0.94;
  letter-spacing: -0.055em;
}

.gf-site-preview h1 em {
  color: var(--gf-accent);
  font-style: normal;
}

.gf-site-preview__forge {
  position: absolute;
  z-index: 2;
  top: 10.5%;
  right: -1.5%;
  width: 61%;
  height: 93%;
  pointer-events: none;
}

.gf-site-preview__forge :deep(.gf-home-hero) {
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: visible;
  background: none;
}

.gf-site-preview__forge :deep(.gf-hero-container) {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0;
}

.gf-site-preview__forge :deep(.gf-hero-content),
.gf-site-preview__forge :deep(.gf-hero-tip) {
  display: none;
}

.gf-site-preview__forge :deep(.gf-hero-graphic),
.gf-site-preview__forge :deep(.gf-hero-graphic.is-visible) {
  position: absolute;
  inset: 0;
  width: 100%;
  max-width: none;
  opacity: 1;
  transform: none;
  transition: none;
}

.gf-site-preview__forge :deep(.gf-hero-svg) {
  width: 100%;
  height: 100%;
  transform: none !important;
}

.gf-site-preview__forge :deep(*) {
  animation: none !important;
  transition: none !important;
}
</style>
