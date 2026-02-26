import DefaultTheme from 'vitepress/theme'
import { useRoute } from 'vitepress'
import { h, nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import LibraryRepoHeader from './components/LibraryRepoHeader.vue'
import CodeVariantPicker from './components/CodeVariantPicker.vue'
import './custom.css'

const LIGHTBOX_KEY = '__goforjLightboxState'
const CODE_VARIANT_KEY = 'goforjCodeVariant'
const DEFERRED_HASH_KEY = '__goforjDeferredHash'

function getLightboxState() {
  if (typeof window === 'undefined') return null
  if (!window[LIGHTBOX_KEY]) {
    window[LIGHTBOX_KEY] = {
      initialized: false,
      overlay: null,
      image: null,
      caption: null,
      lastActive: null
    }
  }
  return window[LIGHTBOX_KEY]
}

function isBadgeImage(img) {
  const src = (img.getAttribute('src') || '').toLowerCase()
  return (
    src.includes('shields.io') ||
    src.includes('/badge/') ||
    src.includes('pkg.go.dev/badge') ||
    src.includes('goreportcard.com/badge') ||
    src.includes('codecov.io')
  )
}

function isZoomableDocImage(img) {
  if (!(img instanceof HTMLImageElement)) return false
  if (!img.closest('.vp-doc')) return false
  if (img.closest('.gf-lightbox-overlay')) return false
  if (img.closest('a[href^="#"]')) return false
  if (img.dataset.noLightbox === 'true') return false
  if (isBadgeImage(img)) return false
  if (img.width > 0 && img.height > 0 && img.width < 120 && img.height < 120) return false
  return true
}

function refreshZoomableImages() {
  if (typeof document === 'undefined') return
  document.querySelectorAll('.vp-doc img').forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return
    const zoomable = isZoomableDocImage(img)
    img.classList.toggle('gf-lightboxable', zoomable)
    if (zoomable) {
      img.setAttribute('data-lightbox-ready', 'true')
    } else {
      img.removeAttribute('data-lightbox-ready')
    }
  })
}

function closeLightbox() {
  const state = getLightboxState()
  if (!state || !state.overlay) return
  state.overlay.classList.remove('is-open')
  state.overlay.setAttribute('aria-hidden', 'true')
  if (state.image) {
    state.image.removeAttribute('src')
    state.image.alt = ''
  }
  if (state.caption) {
    state.caption.textContent = ''
  }
  document.documentElement.classList.remove('gf-lightbox-open')
  if (state.lastActive && typeof state.lastActive.focus === 'function') {
    state.lastActive.focus({ preventScroll: true })
  }
  state.lastActive = null
}

function openLightbox(img) {
  const state = getLightboxState()
  if (!state || !state.overlay || !state.image) return

  const src = img.currentSrc || img.src
  if (!src) return

  state.lastActive = document.activeElement
  state.image.src = src
  state.image.alt = img.alt || ''
  if (state.caption) {
    state.caption.textContent = img.alt || ''
  }
  state.overlay.classList.add('is-open')
  state.overlay.setAttribute('aria-hidden', 'false')
  document.documentElement.classList.add('gf-lightbox-open')
  state.overlay.focus({ preventScroll: true })
}

function initLightbox() {
  const state = getLightboxState()
  if (!state || state.initialized) return
  state.initialized = true

  const overlay = document.createElement('div')
  overlay.className = 'gf-lightbox-overlay'
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-modal', 'true')
  overlay.setAttribute('aria-hidden', 'true')
  overlay.tabIndex = -1
  overlay.innerHTML = `
    <button type="button" class="gf-lightbox-close" aria-label="Close image">×</button>
    <figure class="gf-lightbox-figure">
      <img class="gf-lightbox-image" alt="" />
      <figcaption class="gf-lightbox-caption"></figcaption>
    </figure>
  `

  const onOverlayClick = (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    if (target.classList.contains('gf-lightbox-overlay') || target.classList.contains('gf-lightbox-close')) {
      closeLightbox()
    }
  }

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      closeLightbox()
    }
  }

  const onDocClick = (event) => {
    const target = event.target
    if (!(target instanceof HTMLImageElement)) return
    if (!isZoomableDocImage(target)) return
    event.preventDefault()
    event.stopPropagation()
    openLightbox(target)
  }

  overlay.addEventListener('click', onOverlayClick)
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('click', onDocClick, true)

  document.body.appendChild(overlay)
  state.overlay = overlay
  state.image = overlay.querySelector('.gf-lightbox-image')
  state.caption = overlay.querySelector('.gf-lightbox-caption')
}

function stickyOffset() {
  if (typeof document === 'undefined') return 0
  const nav = document.querySelector('.VPNav')
  const localNav = document.querySelector('.VPLocalNav')
  const navBottom = nav ? nav.getBoundingClientRect().bottom : 0
  const localNavBottom = localNav ? localNav.getBoundingClientRect().bottom : 0
  const offset = Math.max(navBottom > 0 ? navBottom : 0, localNavBottom > 0 ? localNavBottom : 0)
  return Math.ceil(offset) + 8
}

function getHashTarget(hash) {
  if (typeof document === 'undefined' || !hash) return null
  const id = decodeURIComponent(hash.replace(/^#/, ''))
  if (!id) return null
  return document.getElementById(id)
}

function desiredHashTop(target) {
  return Math.max(0, window.scrollY + target.getBoundingClientRect().top - stickyOffset())
}

function scrollToHashWithOffset(hash, behavior = 'auto') {
  if (typeof window === 'undefined' || !hash) return
  const target = getHashTarget(hash)
  if (!target) return
  const top = desiredHashTop(target)
  if (Math.abs(window.scrollY - top) < 18) return
  window.scrollTo({ left: 0, top, behavior })
}

function isHashTargetMisaligned(hash) {
  if (typeof window === 'undefined' || !hash) return false
  const target = getHashTarget(hash)
  if (!target) return false
  const desiredTop = desiredHashTop(target)
  const distance = Math.abs(window.scrollY - desiredTop)
  const rectTop = target.getBoundingClientRect().top
  const hiddenBehindNav = rectTop < (stickyOffset() - 4)
  return hiddenBehindNav || distance >= 18
}

function scheduleHashSettlePasses(hash, timers) {
  if (typeof window === 'undefined' || !hash) return
  const delays = [
    { ms: 140, behavior: 'smooth', always: true },
    { ms: 320, behavior: 'auto', always: false },
    { ms: 560, behavior: 'auto', always: false },
    { ms: 840, behavior: 'auto', always: false }
  ]

  delays.forEach(({ ms, behavior, always }) => {
    const timer = window.setTimeout(() => {
      if (window.location.hash !== hash) return
      if (!always && !isHashTargetMisaligned(hash)) return
      scrollToHashWithOffset(hash, behavior)
    }, ms)
    timers.push(timer)
  })
}

function restoreDeferredInitialHash() {
  if (typeof window === 'undefined') return
  try {
    const raw = window.sessionStorage.getItem(DEFERRED_HASH_KEY)
    if (!raw) return
    window.sessionStorage.removeItem(DEFERRED_HASH_KEY)
    const payload = JSON.parse(raw)
    const currentPath = `${window.location.pathname}${window.location.search}`
    if (!payload || payload.path !== currentPath || !payload.hash) return
    history.replaceState(history.state || {}, '', `${currentPath}${payload.hash}`)
    const timers = []
    scheduleHashSettlePasses(payload.hash, timers)
  } catch {
    // no-op
  }
}

function applyCodeVariantPreference() {
  if (typeof window === 'undefined') return
  const allowed = new Set([
    'halo',
    'glass',
    'ink',
    'electric',
    'uv-glow',
    'amber',
    'forest',
    'terminal',
    'plasma',
    'sunset',
    'paper',
    'chrome',
    'obsidian',
    'frost',
    'midnight-gold',
    'desert-dusk',
    'retro-amber-crt',
    'aurora',
    'rose-metal',
    'cobalt-luxe',
    'mono-slate',
    'mint-neon',
    'sepia-noir'
  ])
  let variant = window.localStorage.getItem(CODE_VARIANT_KEY) || 'ink'
  if (!allowed.has(variant)) variant = 'ink'
  document.documentElement.dataset.gfCodeVariant = variant
}

export default {
  ...DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'doc-before': () => h(LibraryRepoHeader),
      'layout-bottom': () => h(CodeVariantPicker)
    }),
  setup() {
    const route = useRoute()
    let routeHashTimers = []
    let onHashChange = null

    const refreshSoon = async () => {
      await nextTick()
      refreshZoomableImages()
      window.setTimeout(refreshZoomableImages, 120)
    }

    const scheduleCrossPageHashCorrection = () => {
      if (typeof window === 'undefined' || !window.location.hash) return
      routeHashTimers.forEach((id) => window.clearTimeout(id))
      routeHashTimers = []

      // VitePress does the initial hash scroll first. Do one smooth settle pass,
      // then guarded verification passes only if still misaligned.
      const hash = window.location.hash
      scheduleHashSettlePasses(hash, routeHashTimers)
    }

    onMounted(() => {
      applyCodeVariantPreference()
      initLightbox()
      refreshSoon()
      restoreDeferredInitialHash()

      onHashChange = () => {
        if (typeof window === 'undefined' || !window.location.hash) return
        routeHashTimers.forEach((id) => window.clearTimeout(id))
        routeHashTimers = []
        scheduleHashSettlePasses(window.location.hash, routeHashTimers)
      }
      window.addEventListener('hashchange', onHashChange)
    })

    watch(() => route.path, () => {
      applyCodeVariantPreference()
      refreshSoon()
      scheduleCrossPageHashCorrection()
    })

    onBeforeUnmount(() => {
      routeHashTimers.forEach((id) => window.clearTimeout(id))
      routeHashTimers = []
      if (onHashChange) {
        window.removeEventListener('hashchange', onHashChange)
      }
    })
  }
}
