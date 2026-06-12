import DefaultTheme from 'vitepress/theme'
import { useData, useRoute } from 'vitepress'
import { h, nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import LibraryRepoHeader from './components/LibraryRepoHeader.vue'
import CodeVariantPicker from './components/CodeVariantPicker.vue'
import ApiIndexJump from './components/ApiIndexJump.vue'
import GoForjHeroStack from './components/GoForjHeroStack.vue'
import StarterKitHeroScreens from './components/StarterKitHeroScreens.vue'
import GoForjLiveTerminal from './components/GoForjLiveTerminal.vue'
import MotionPicker from './components/MotionPicker.vue'
import './custom.css'

const LIGHTBOX_KEY = '__goforjLightboxState'
const CODE_VARIANT_KEY = 'goforjCodeVariant'
const DEFERRED_HASH_KEY = '__goforjDeferredHash'
const OUTLINE_SCROLL_KEY = '__goforjOutlineScrollState'
const MERMAID_KEY = '__goforjMermaidState'

function DocsPreviewBanner() {
  return h('div', { class: 'gf-docs-preview-banner', role: 'note' }, [
    h('div', { class: 'gf-docs-preview-banner-inner' }, [
      h('span', { class: 'gf-docs-preview-banner-label' }, 'Documentation preview'),
      h('span', { class: 'gf-docs-preview-banner-text' }, 'These docs are actively being built. Some pages may change as the framework and examples are finalized.')
    ])
  ])
}

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

function getOutlineScrollState() {
  if (typeof window === 'undefined') return null
  if (!window[OUTLINE_SCROLL_KEY]) {
    window[OUTLINE_SCROLL_KEY] = {
      initialized: false,
      observer: null,
      container: null,
      rafId: 0
    }
  }
  return window[OUTLINE_SCROLL_KEY]
}

function getMermaidState() {
  if (typeof window === 'undefined') return null
  if (!window[MERMAID_KEY]) {
    window[MERMAID_KEY] = {
      mermaid: null,
      loading: null,
      initialized: false
    }
  }
  return window[MERMAID_KEY]
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

function scrollActiveOutlineLinkIntoView() {
  if (typeof document === 'undefined') return
  const outline = document.querySelector('.VPDocAsideOutline')
  if (!(outline instanceof HTMLElement)) return
  const scroller = outline.closest('.aside-container')
  if (!(scroller instanceof HTMLElement)) {
    const active = outline.querySelector('.outline-link.active')
    if (!(active instanceof HTMLElement)) return
    active.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' })
    return
  }

  const marker = outline.querySelector('.outline-marker')
  const active = outline.querySelector('.outline-link.active')
  const targetEl =
    marker instanceof HTMLElement && marker.style.opacity !== '0'
      ? marker
      : (active instanceof HTMLElement ? active : null)
  if (!targetEl) return

  const activeRect = targetEl.getBoundingClientRect()
  const scrollerRect = scroller.getBoundingClientRect()
  const scrollerStyles = getComputedStyle(scroller)
  const scrollerContentTopInset = parseFloat(scrollerStyles.paddingTop || '0') || 0
  const topPadding = 12
  const bottomPadding = 24
  const visibleTop = scrollerRect.top + scrollerContentTopInset + topPadding
  const visibleBottom = scrollerRect.bottom - bottomPadding
  const overTop = activeRect.top - visibleTop
  const overBottom = activeRect.bottom - visibleBottom

  if (overTop < 0) {
    scroller.scrollTop += overTop
    return
  }
  if (overBottom > 0) {
    scroller.scrollTop += overBottom
  }
}

function refreshOutlineAutoScroll() {
  const state = getOutlineScrollState()
  if (!state) return

  const container = document.querySelector('.VPDocAsideOutline')
  if (!(container instanceof HTMLElement)) {
    if (state.observer) {
      state.observer.disconnect()
      state.observer = null
    }
    state.container = null
    return
  }

  if (state.container !== container) {
    if (state.observer) {
      state.observer.disconnect()
      state.observer = null
    }
    state.container = container

    state.observer = new MutationObserver(() => {
      if (state.rafId) {
        cancelAnimationFrame(state.rafId)
        state.rafId = 0
      }
      state.rafId = requestAnimationFrame(() => {
        state.rafId = 0
        scrollActiveOutlineLinkIntoView()
      })
    })

    state.observer.observe(container, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    })
  }

  // Initial alignment when the page/route first renders.
  requestAnimationFrame(scrollActiveOutlineLinkIntoView)
}

function scrollActiveSidebarItemIntoView() {
  if (typeof document === 'undefined') return
  const nav = document.querySelector('#VPSidebarNav')
  if (!(nav instanceof HTMLElement)) return

  const scroller = nav.closest('.VPSidebar')
  if (!(scroller instanceof HTMLElement)) return

  const active = nav.querySelector('.VPSidebarItem.is-active > .item')
  if (!(active instanceof HTMLElement)) return

  const activeRect = active.getBoundingClientRect()
  const scrollerRect = scroller.getBoundingClientRect()
  const scrollerStyles = getComputedStyle(scroller)
  const topInset = parseFloat(scrollerStyles.paddingTop || '0') || 0
  const bottomInset = parseFloat(scrollerStyles.paddingBottom || '0') || 0
  const visibleTop = scrollerRect.top + topInset + 16
  const visibleBottom = scrollerRect.bottom - bottomInset - 24

  if (activeRect.top >= visibleTop && activeRect.bottom <= visibleBottom) return

  const targetTop = scroller.scrollTop + activeRect.top - scrollerRect.top - (scroller.clientHeight * 0.42)
  scroller.scrollTop = Math.max(0, targetTop)
}

function refreshSidebarAutoScroll() {
  requestAnimationFrame(() => {
    scrollActiveSidebarItemIntoView()
  })
}

function resetOutlineScrollerPosition() {
  if (typeof document === 'undefined') return
  const scroller = document.querySelector('.VPDoc .aside-container')
  if (scroller instanceof HTMLElement) {
    scroller.scrollTop = 0
  }
}

function stickyOffset(extraPadding = 0) {
  if (typeof document === 'undefined') return 0
  const nav = document.querySelector('.VPNav')
  const navBar = document.querySelector('.VPNavBar')
  const localNav = document.querySelector('.VPLocalNav')
  const navBottom = nav ? nav.getBoundingClientRect().bottom : 0
  const navBarHeight = navBar ? navBar.getBoundingClientRect().height : 0
  const localNavBottom = localNav ? localNav.getBoundingClientRect().bottom : 0
  const cssNavHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--vp-nav-height') || '',
    10
  ) || 64
  const banner = document.querySelector('.gf-docs-preview-banner')
  const bannerBottom = banner ? banner.getBoundingClientRect().bottom : 0
  const navFloor = Math.max(cssNavHeight, Math.ceil(navBarHeight))
  const navOffset = Math.max(navBottom > 0 ? navBottom : 0, navFloor)
  const offset = Math.max(
    navOffset,
    localNavBottom > 0 ? localNavBottom : 0,
    bannerBottom > 0 ? bannerBottom : 0
  )
  return Math.ceil(offset) + 16 + extraPadding
}

function getHashTarget(hash) {
  if (typeof document === 'undefined' || !hash) return null
  const id = decodeURIComponent(hash.replace(/^#/, ''))
  if (!id) return null
  return document.getElementById(id)
}

function desiredHashTop(target, extraPadding = 0) {
  return Math.max(0, window.scrollY + target.getBoundingClientRect().top - stickyOffset(extraPadding))
}

function scrollToHashWithOffset(hash, behavior = 'auto', extraPadding = 0) {
  if (typeof window === 'undefined' || !hash) return
  const target = getHashTarget(hash)
  if (!target) return
  const top = desiredHashTop(target, extraPadding)
  if (Math.abs(window.scrollY - top) < 18) return
  window.scrollTo({ left: 0, top, behavior })
}

function isHashTargetMisaligned(hash, extraPadding = 0) {
  if (typeof window === 'undefined' || !hash) return false
  const target = getHashTarget(hash)
  if (!target) return false
  const desiredTop = desiredHashTop(target, extraPadding)
  const distance = Math.abs(window.scrollY - desiredTop)
  const rectTop = target.getBoundingClientRect().top
  const hiddenBehindNav = rectTop < (stickyOffset(extraPadding) - 4)
  return hiddenBehindNav || distance >= 18
}

function scheduleHashSettlePasses(hash, timers, options = {}) {
  if (typeof window === 'undefined' || !hash) return
  const {
    smoothFirst = true,
    verifyDelays = [320, 560, 840],
    extraPadding = 0
  } = options
  const delays = [
    ...(smoothFirst ? [{ ms: 140, behavior: 'smooth', always: true }] : []),
    ...(smoothFirst ? [] : [{ ms: 140, behavior: 'auto', always: false }]),
    ...verifyDelays.map((ms) => ({ ms, behavior: 'auto', always: false }))
  ]

  delays.forEach(({ ms, behavior, always }) => {
    const timer = window.setTimeout(() => {
      if (window.location.hash !== hash) return
      if (!always && !isHashTargetMisaligned(hash, extraPadding)) return
      scrollToHashWithOffset(hash, behavior, extraPadding)
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
    scheduleHashSettlePasses(payload.hash, timers, {
      smoothFirst: false,
      verifyDelays: [320, 560, 840, 1200],
      extraPadding: 6
    })
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
    'amber',
    'forest',
    'terminal',
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

function flashHashTarget() {
  if (typeof window === 'undefined' || !window.location.hash) return
  const target = getHashTarget(window.location.hash)
  if (!target) return
  const heading = target.matches('h1, h2, h3, h4, h5, h6')
    ? target
    : target.querySelector('h1, h2, h3, h4, h5, h6')
  if (!heading) return
  heading.classList.remove('gf-hash-glow')
  void heading.offsetWidth
  heading.classList.add('gf-hash-glow')
  window.setTimeout(() => heading.classList.remove('gf-hash-glow'), 1800)
}

function updateBannerOffsetVar() {
  if (typeof document === 'undefined') return
  const banner = document.querySelector('.gf-docs-preview-banner')
  const height = banner ? Math.ceil(banner.getBoundingClientRect().height) : 0
  document.documentElement.style.setProperty('--gf-banner-height', `${height}px`)
}

function replayDocEnter() {
  if (typeof document === 'undefined') return
  const el = document.documentElement
  el.classList.remove('gf-doc-enter')
  // Force a style flush so removing and re-adding the class restarts the animation.
  // Synchronous on purpose: rAF is throttled in background tabs and the class
  // would never come back.
  void document.body.offsetHeight
  el.classList.add('gf-doc-enter')
}

function revealNavbarSearch() {
  if (typeof document === 'undefined') return
  requestAnimationFrame(() => {
    document.documentElement.classList.add('gf-search-ready')
  })
}

async function refreshMermaidDiagrams() {
  if (typeof document === 'undefined') return
  const diagrams = Array.from(document.querySelectorAll('.gf-mermaid'))
    .filter((node) => node instanceof HTMLElement)
  if (!diagrams.length) return

  const state = getMermaidState()
  if (!state) return

  if (!state.mermaid) {
    if (!state.loading) {
      state.loading = import('mermaid').then((mod) => {
        const mermaid = mod.default || mod
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'dark',
          themeVariables: {
            background: 'transparent',
            primaryColor: '#172033',
            primaryTextColor: '#e5edf7',
            primaryBorderColor: '#5f7fb5',
            lineColor: '#8aa4d6',
            secondaryColor: '#1f2937',
            tertiaryColor: '#111827',
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            fontSize: '14px'
          },
          flowchart: {
            curve: 'basis',
            htmlLabels: false,
            nodeSpacing: 34,
            rankSpacing: 42,
            padding: 8
          }
        })
        state.initialized = true
        state.mermaid = mermaid
        return mermaid
      })
    }
    await state.loading
  }

  await state.mermaid.run({ nodes: diagrams })
}

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp?.(ctx)
    ctx.app.component('StarterKitHeroScreens', StarterKitHeroScreens)
    ctx.app.component('GoForjLiveTerminal', GoForjLiveTerminal)
  },
  Layout: () => {
    const { theme } = useData()
    const docsVersion = theme.value.docsVersion || 'v0.9'

    return h(DefaultTheme.Layout, null, {
      'not-found': () => h('div', { class: 'gf-notfound' }, [
        h('p', { class: 'gf-notfound__kicker' }, 'Page not found'),
        h('h1', { class: 'gf-notfound__code' }, '404'),
        h('p', { class: 'gf-notfound__text' }, 'This page does not exist or has moved. The links below lead back to solid ground.'),
        h('div', { class: 'gf-notfound__actions' }, [
          h('a', { class: 'gf-notfound__link is-primary', href: '/' }, 'Go to the docs home'),
          h('a', { class: 'gf-notfound__link', href: '/getting-started/quickstart' }, 'Start the quickstart')
        ])
      ]),
      'nav-bar-title-after': () => h('span', { class: 'gf-docs-version' }, docsVersion),
      'home-hero-before': () => h(GoForjHeroStack),
      'layout-top': () => h(DocsPreviewBanner),
      'doc-before': () => h(LibraryRepoHeader),
      'layout-bottom': () => [h(ApiIndexJump), h(CodeVariantPicker), h(MotionPicker)]
    })
  },
  setup() {
    const route = useRoute()
    let routeHashTimers = []
    let onHashChange = null

    const refreshSoon = async () => {
      await nextTick()
      refreshZoomableImages()
      refreshMermaidDiagrams()
      refreshOutlineAutoScroll()
      refreshSidebarAutoScroll()
      window.setTimeout(refreshZoomableImages, 120)
      window.setTimeout(refreshMermaidDiagrams, 120)
      window.setTimeout(refreshOutlineAutoScroll, 120)
      window.setTimeout(refreshSidebarAutoScroll, 120)
      window.setTimeout(refreshSidebarAutoScroll, 360)
    }

    const scheduleCrossPageHashCorrection = () => {
      if (typeof window === 'undefined' || !window.location.hash) return
      routeHashTimers.forEach((id) => window.clearTimeout(id))
      routeHashTimers = []

      // VitePress does the initial hash scroll first. Do one smooth settle pass,
      // then guarded verification passes only if still misaligned.
      const hash = window.location.hash
      scheduleHashSettlePasses(hash, routeHashTimers, {
        smoothFirst: true,
        verifyDelays: [320, 560, 840, 1200]
      })
    }

    let onBannerResize = null

    onMounted(() => {
      applyCodeVariantPreference()
      revealNavbarSearch()
      initLightbox()
      updateBannerOffsetVar()
      onBannerResize = () => updateBannerOffsetVar()
      window.addEventListener('resize', onBannerResize)
      refreshSoon()
      nextTick().then(replayDocEnter)
      restoreDeferredInitialHash()
      window.setTimeout(flashHashTarget, 700)

      onHashChange = () => {
        if (typeof window === 'undefined' || !window.location.hash) return
        routeHashTimers.forEach((id) => window.clearTimeout(id))
        routeHashTimers = []
        flashHashTarget()
        // Same-page hash clicks/TOC jumps: avoid adding another smooth jump.
        scheduleHashSettlePasses(window.location.hash, routeHashTimers, {
          smoothFirst: false,
          verifyDelays: [320, 560, 840]
        })
      }
      window.addEventListener('hashchange', onHashChange)
    })

    watch(() => route.path, () => {
      applyCodeVariantPreference()
      resetOutlineScrollerPosition()
      refreshSoon()
      nextTick().then(replayDocEnter)
      scheduleCrossPageHashCorrection()
      window.setTimeout(flashHashTarget, 600)
    })

    onBeforeUnmount(() => {
      routeHashTimers.forEach((id) => window.clearTimeout(id))
      routeHashTimers = []
      if (onHashChange) {
        window.removeEventListener('hashchange', onHashChange)
      }
      if (onBannerResize) {
        window.removeEventListener('resize', onBannerResize)
        onBannerResize = null
      }
      const outlineState = getOutlineScrollState()
      if (outlineState?.observer) {
        outlineState.observer.disconnect()
        outlineState.observer = null
      }
      if (outlineState?.rafId) {
        cancelAnimationFrame(outlineState.rafId)
        outlineState.rafId = 0
      }
    })
  }
}
