<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

const { frontmatter } = useData()
const route = useRoute()

const visible = ref(false)

const isLibraryPage = computed(() => Boolean(String(frontmatter.value?.repoSlug || '').trim()))

function headingTop(el) {
  return window.scrollY + el.getBoundingClientRect().top
}

function getApiIndexEl() {
  const api = document.getElementById('api-index')
  return api instanceof HTMLElement ? api : null
}

function getApiIndexTop() {
  const api = getApiIndexEl()
  if (!api) return null
  return headingTop(api)
}

function getFirstHeadingAfterApiIndexTop() {
  const api = getApiIndexEl()
  if (!api) return null
  const headings = Array.from(document.querySelectorAll('.vp-doc :is(h1,h2,h3,h4,h5,h6)'))
  const idx = headings.indexOf(api)
  if (idx === -1) return null
  for (let i = idx + 1; i < headings.length; i += 1) {
    const el = headings[i]
    if (el instanceof HTMLElement) return headingTop(el)
  }
  return null
}

function refreshVisibility() {
  if (typeof window === 'undefined' || !isLibraryPage.value) {
    visible.value = false
    return
  }
  const apiTop = getApiIndexTop()
  if (apiTop == null) {
    visible.value = false
    return
  }
  const nextHeadingTop = getFirstHeadingAfterApiIndexTop()
  const probeY = window.scrollY + 120
  // Prefer showing once the API Index table/section is out of view (next heading reached).
  if (nextHeadingTop != null) {
    visible.value = probeY >= (nextHeadingTop - 12)
    return
  }
  visible.value = probeY >= (apiTop + 24)
}

function goToApiIndex(event) {
  if (event) event.preventDefault()
  const el = document.getElementById('api-index')
  if (!(el instanceof HTMLElement)) return
  history.replaceState(history.state || {}, '', `${window.location.pathname}${window.location.search}#api-index`)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

let onScroll = null
let onResize = null
let onKeyDown = null
let keyBound = false

function bindHotkey() {
  if (typeof window === 'undefined' || keyBound || !onKeyDown) return
  window.addEventListener('keydown', onKeyDown)
  keyBound = true
}

function unbindHotkey() {
  if (typeof window === 'undefined' || !keyBound || !onKeyDown) return
  window.removeEventListener('keydown', onKeyDown)
  keyBound = false
}

onMounted(() => {
  onScroll = () => refreshVisibility()
  onResize = () => refreshVisibility()
  onKeyDown = (event) => {
    if (!visible.value || !isLibraryPage.value) return
    if (isTypingTarget(event.target)) return
    if (!event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey && event.key.toLowerCase() === 'i') {
      event.preventDefault()
      goToApiIndex()
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  requestAnimationFrame(refreshVisibility)
  window.setTimeout(refreshVisibility, 120)
})

watch(() => route.path, () => {
  visible.value = false
  requestAnimationFrame(refreshVisibility)
  window.setTimeout(refreshVisibility, 180)
})

watch(isLibraryPage, () => {
  requestAnimationFrame(refreshVisibility)
})

watch(visible, (isVisible) => {
  if (isVisible) {
    bindHotkey()
  } else {
    unbindHotkey()
  }
})

onBeforeUnmount(() => {
  if (onScroll) window.removeEventListener('scroll', onScroll)
  if (onResize) window.removeEventListener('resize', onResize)
  unbindHotkey()
})
</script>

<template>
  <div v-if="visible" class="gf-api-index-jump">
    <a href="#api-index" class="gf-api-index-jump__link" @click="goToApiIndex">
      <span class="gf-api-index-jump__label">API</span>
      <span>Back to API Index</span>
      <span class="gf-api-index-jump__kbd" aria-hidden="true">
        <svg viewBox="0 0 16 16" focusable="false" aria-hidden="true">
          <path fill="currentColor" d="M2.5 3A1.5 1.5 0 0 0 1 4.5v7A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 13.5 3h-11Zm0 1h11a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5Zm1 1.25a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm2 0a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm2 0a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm2 0a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm2 0a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM3.5 8.75a.75.75 0 1 0 0 1.5h6a.75.75 0 1 0 0-1.5h-6Zm7.75 0a.75.75 0 1 0 0 1.5h1.25a.75.75 0 1 0 0-1.5h-1.25Z"/>
        </svg>
        <span>i</span>
      </span>
    </a>
  </div>
</template>
