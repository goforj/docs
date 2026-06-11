<script setup>
import { nextTick, onMounted, ref } from 'vue'

// The hidden state, visible state, stagger, and reduced-motion fallback
// all live in CSS (custom.css). This component only decides *when* to
// reveal: after mount, once the card images have loaded.
const visual = ref(null)
const mounted = ref(false)
const revealed = ref(false)

function imageReady(image) {
  if (image.complete) return Promise.resolve()
  return new Promise((resolve) => {
    image.addEventListener('load', resolve, { once: true })
    image.addEventListener('error', resolve, { once: true })
  })
}

onMounted(async () => {
  mounted.value = true
  await nextTick()
  const images = [...(visual.value?.querySelectorAll('img') || [])]
  await Promise.all(images.map(imageReady))
  // Two frames so the hidden state is painted before the transition starts.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      revealed.value = true
    })
  })
})
</script>

<template>
  <div
    ref="visual"
    class="gf-starter-hero__visual"
    :class="{ 'is-revealed': revealed }"
    aria-label="GoForj starter kit application shell screenshots"
  >
    <img
      v-if="mounted"
      class="gf-starter-hero__primary gf-starter-hero__card gf-starter-hero__card--primary"
      src="/assets/starter-kits/browser-navigation-patterns.png"
      alt="Starter kit navigation component reference inside a browser frame"
      loading="eager"
      decoding="async"
    >
    <div v-if="mounted" class="gf-starter-hero__mini">
      <img
        class="gf-starter-hero__card gf-starter-hero__card--overlay"
        src="/assets/starter-kits/browser-overlay-patterns.png"
        alt="Starter kit overlay component reference inside a browser frame"
        loading="eager"
        decoding="async"
      >
      <img
        class="gf-starter-hero__card gf-starter-hero__card--command"
        src="/assets/starter-kits/browser-command-palette.png"
        alt="Starter kit command palette inside a browser frame"
        loading="eager"
        decoding="async"
      >
    </div>
  </div>
</template>
