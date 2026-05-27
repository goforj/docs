<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const visual = ref(null)
const animationFrames = new Set()
let timeouts = []

const visibleTransform = 'rotateX(6deg) rotateY(2deg) rotateZ(3.5deg)'
const cards = [
  { selector: '.gf-starter-hero__card--primary', x: 180, y: 78, delay: 220 },
  { selector: '.gf-starter-hero__card--overlay', x: 220, y: 98, delay: 760 },
  { selector: '.gf-starter-hero__card--command', x: 260, y: 118, delay: 1300 },
]

function hiddenTransform(card) {
  return `translate3d(${card.x}px, ${card.y}px, 0) ${visibleTransform} scale(0.9)`
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

function setCardState(image, card, progress) {
  const eased = easeOutExpo(progress)
  const x = card.x * (1 - eased)
  const y = card.y * (1 - eased)
  const scale = 0.9 + (0.1 * eased)
  const blur = 12 * (1 - eased)

  image.style.opacity = String(eased)
  image.style.filter = `blur(${blur}px)`
  image.style.setProperty('transform', `translate3d(${x}px, ${y}px, 0) ${visibleTransform} scale(${scale})`, 'important')
}

function animateCard(image, card) {
  const duration = 1200
  const start = performance.now()
  let frame = 0

  function tick(now) {
    animationFrames.delete(frame)

    const progress = Math.min((now - start) / duration, 1)
    setCardState(image, card, progress)

    if (progress < 1) {
      frame = requestAnimationFrame(tick)
      animationFrames.add(frame)
    }
  }

  frame = requestAnimationFrame(tick)
  animationFrames.add(frame)
}

onMounted(async () => {
  await nextTick()

  const cardImages = cards
    .map((card) => ({
      card,
      image: visual.value?.querySelector(card.selector),
    }))
    .filter(({ image }) => image instanceof HTMLImageElement)

  cardImages.forEach(({ image, card }) => {
    image.style.opacity = '0'
    image.style.filter = 'blur(12px)'
    image.style.setProperty('transform', hiddenTransform(card), 'important')
  })

  const images = cardImages.map(({ image }) => image)
  await Promise.all(images.map(imageReady))

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      cardImages.forEach(({ image, card }) => {
        const timeout = window.setTimeout(() => animateCard(image, card), card.delay)
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
      class="gf-starter-hero__primary gf-starter-hero__card gf-starter-hero__card--primary"
      src="/assets/starter-kits/browser-navigation-patterns.png"
      alt="Starter kit navigation component reference inside a browser frame"
    >
    <div class="gf-starter-hero__mini">
      <img
        class="gf-starter-hero__card gf-starter-hero__card--overlay"
        src="/assets/starter-kits/browser-overlay-patterns.png"
        alt="Starter kit overlay component reference inside a browser frame"
      >
      <img
        class="gf-starter-hero__card gf-starter-hero__card--command"
        src="/assets/starter-kits/browser-command-palette.png"
        alt="Starter kit command palette inside a browser frame"
      >
    </div>
  </div>
</template>
