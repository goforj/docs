<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const visual = ref(null)
const mounted = ref(false)
const animationFrames = new Set()
let timeouts = []

const visibleTransform = 'rotateX(6deg) rotateY(2deg) rotateZ(3.5deg)'
const cards = [
  { selector: '.gf-starter-hero__card--primary', delay: 80 },
  { selector: '.gf-starter-hero__card--overlay', delay: 220 },
  { selector: '.gf-starter-hero__card--command', delay: 360 },
]

function hiddenTransform() {
  return visibleTransform
}

function initialStyle() {
  return {
    opacity: '0',
    visibility: 'hidden',
    filter: 'none',
    clipPath: 'inset(0 100% 0 0 round 12px)',
    transform: hiddenTransform(),
  }
}

function imageReady(image) {
  if (image.complete) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    image.addEventListener('load', resolve, { once: true })
    image.addEventListener('error', resolve, { once: true })
  })
}

function easeOutExpo(value) {
  return value === 1 ? 1 : 1 - Math.pow(2, -10 * value)
}

function setCardState(image, progress) {
  const eased = easeOutExpo(progress)
  const hiddenWidth = 100 * (1 - eased)

  image.style.visibility = 'visible'
  image.style.opacity = String(eased)
  image.style.filter = 'none'
  image.style.clipPath = `inset(0 ${hiddenWidth}% 0 0 round 12px)`
  image.style.setProperty('transform', visibleTransform, 'important')
}

function animateCard(image) {
  const duration = 760
  const start = performance.now()
  let frame = 0

  setCardState(image, 0)

  function tick(now) {
    animationFrames.delete(frame)

    const progress = Math.min((now - start) / duration, 1)
    setCardState(image, progress)

    if (progress < 1) {
      frame = requestAnimationFrame(tick)
      animationFrames.add(frame)
    }
  }

  frame = requestAnimationFrame(tick)
  animationFrames.add(frame)
}

onMounted(async () => {
  mounted.value = true
  await nextTick()

  const cardImages = cards
    .map((card) => ({
      card,
      image: visual.value?.querySelector(card.selector),
    }))
    .filter(({ image }) => image instanceof HTMLImageElement)

  cardImages.forEach(({ image }) => {
    image.style.opacity = '0'
    image.style.visibility = 'hidden'
    image.style.filter = 'none'
    image.style.clipPath = 'inset(0 100% 0 0 round 12px)'
    image.style.setProperty('transform', hiddenTransform(), 'important')
  })

  const images = cardImages.map(({ image }) => image)
  await Promise.all(images.map(imageReady))

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      cardImages.forEach(({ image, card }) => {
        image.style.visibility = 'hidden'
        const timeout = window.setTimeout(() => animateCard(image), card.delay)
        timeouts.push(timeout)
      })
    })
  })
})

onBeforeUnmount(() => {
  timeouts.forEach((timeout) => window.clearTimeout(timeout))
  timeouts = []

  animationFrames.forEach((frame) => cancelAnimationFrame(frame))
  animationFrames.clear()
})
</script>

<template>
  <div
    ref="visual"
    class="gf-starter-hero__visual"
    aria-label="GoForj starter kit application shell screenshots"
  >
    <img
      v-if="mounted"
      class="gf-starter-hero__primary gf-starter-hero__card gf-starter-hero__card--primary"
      src="/assets/starter-kits/browser-navigation-patterns.png"
      alt="Starter kit navigation component reference inside a browser frame"
      :style="initialStyle()"
      loading="eager"
      decoding="async"
    >
    <div v-if="mounted" class="gf-starter-hero__mini">
      <img
        class="gf-starter-hero__card gf-starter-hero__card--overlay"
        src="/assets/starter-kits/browser-overlay-patterns.png"
        alt="Starter kit overlay component reference inside a browser frame"
        :style="initialStyle()"
        loading="eager"
        decoding="async"
      >
      <img
        class="gf-starter-hero__card gf-starter-hero__card--command"
        src="/assets/starter-kits/browser-command-palette.png"
        alt="Starter kit command palette inside a browser frame"
        :style="initialStyle()"
        loading="eager"
        decoding="async"
      >
    </div>
  </div>
</template>
