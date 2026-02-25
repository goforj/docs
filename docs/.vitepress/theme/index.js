import DefaultTheme from 'vitepress/theme'
import { useRoute } from 'vitepress'
import { nextTick, onMounted, watch } from 'vue'
import GoForjExample from './components/GoForjExample.vue'
import './custom.css'

const LIGHTBOX_KEY = '__goforjLightboxState'

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
  if (img.closest('.gf-example')) return false
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

export default {
  ...DefaultTheme,
  setup() {
    const route = useRoute()

    const refreshSoon = async () => {
      await nextTick()
      refreshZoomableImages()
      window.setTimeout(refreshZoomableImages, 120)
    }

    onMounted(() => {
      initLightbox()
      refreshSoon()
    })

    watch(() => route.path, () => {
      refreshSoon()
    })
  },
  enhanceApp({ app }) {
    app.component('GoForjExample', GoForjExample)
  }
}
