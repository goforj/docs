import DefaultTheme from 'vitepress/theme'
import { useData, useRoute } from 'vitepress'
import { defineAsyncComponent, h, nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import LibraryRepoHeader from './components/LibraryRepoHeader.vue'
import ApiIndexJump from './components/ApiIndexJump.vue'
import StarterKitHeroScreens from './components/StarterKitHeroScreens.vue'
import StarterKitOptions from './components/StarterKitOptions.vue'
import SitePreview from './components/SitePreview.vue'
import CodeFile from './components/CodeFile.vue'
import MakeCommandTabs from './components/MakeCommandTabs.vue'
import LighthouseProductView from './components/LighthouseProductView.vue'
import './custom.css'

/* The hero is imported STATICALLY on purpose. As an async component it
   is the one thing on the page guaranteed to be late: the SSR HTML does
   contain the hero, but Vue cannot hydrate an unresolved async subtree,
   so on load it swaps the server markup for a placeholder until the
   52KB chunk arrives. The hero occupies `min-height: calc(100vh - 140px)`,
   so for that window the whole landing page shifts up and the second
   section renders where the hero should be, then everything jumps back.

   Lazy-loading the largest above-the-fold element trades a visible
   layout shift for bytes on secondary pages. It is the wrong trade for
   a hero. GoForjLiveTerminal stays async — it is 5KB and below the fold. */
import GoForjHeroStack from './components/GoForjHeroStack.vue'

const GoForjLiveTerminal = defineAsyncComponent(() => import('./components/GoForjLiveTerminal.vue'))

const LIGHTBOX_KEY = '__goforjLightboxState'
const DEFERRED_HASH_KEY = '__goforjDeferredHash'
const OUTLINE_SCROLL_KEY = '__goforjOutlineScrollState'
const MERMAID_KEY = '__goforjMermaidState'
const PAGE_IMAGE_PRELOAD_INTENT_MS = 80
const attemptedPageImagePreloads = new Set()
const retainedPageImagePreloads = new Map()

function allowsPageImagePreloads() {
  if (typeof navigator === 'undefined') return false
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (!connection) return true
  if (connection.saveData) return false
  return !String(connection.effectiveType || '').toLowerCase().includes('2g')
}

function preloadPageImage(src) {
  if (!src || attemptedPageImagePreloads.has(src) || typeof Image === 'undefined') return
  attemptedPageImagePreloads.add(src)

  const image = new Image()
  image.decoding = 'async'
  image.fetchPriority = 'high'
  retainedPageImagePreloads.set(src, image)

  image.addEventListener('load', () => {
    const decoded = typeof image.decode === 'function' ? image.decode() : Promise.resolve()
    decoded.catch(() => {}).finally(() => {
      window.setTimeout(() => retainedPageImagePreloads.delete(src), 30_000)
    })
  }, { once: true })
  image.addEventListener('error', () => {
    retainedPageImagePreloads.delete(src)
  }, { once: true })
  image.src = src
}

function sidebarLinkFromEvent(event) {
  const target = event.target
  if (!(target instanceof Element)) return null
  const link = target.closest('#VPSidebarNav a[href]')
  return link instanceof HTMLAnchorElement ? link : null
}

function pageRouteForSidebarLink(link) {
  if (typeof window === 'undefined') return ''
  const url = new URL(link.href, window.location.href)
  if (url.origin !== window.location.origin) return ''

  let pathname = url.pathname
  const base = String(import.meta.env.BASE_URL || '/').replace(/\/+$/, '')
  if (base && base !== '/' && pathname === base) {
    pathname = '/'
  } else if (base && base !== '/' && pathname.startsWith(`${base}/`)) {
    pathname = pathname.slice(base.length)
  }

  pathname = pathname
    .replace(/\/index(?:\.html)?$/, '/')
    .replace(/\.html$/, '')
    .replace(/\/+$/, '')
  return pathname || '/'
}

function preloadSidebarLinkImages(link, manifest) {
  if (!allowsPageImagePreloads() || !manifest) return
  const images = manifest[pageRouteForSidebarLink(link)]
  if (!Array.isArray(images)) return
  images.forEach(preloadPageImage)
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
    src.includes('codecov.io')
  )
}

function isZoomableDocImage(img) {
  if (!(img instanceof HTMLImageElement)) return false
  if (!img.closest('.vp-doc')) return false
  if (img.closest('.gf-lightbox-overlay')) return false
  if (img.parentElement?.closest('a[href], button, [role="button"]')) return false
  if (img.dataset.noLightbox === 'true') return false
  if (isBadgeImage(img)) return false
  if (img.width > 0 && img.height > 0 && img.width < 120 && img.height < 120) return false
  return true
}

function removeManagedLightboxAttributes(img) {
  if (img.dataset.lightboxTabindexAdded === 'true') {
    img.removeAttribute('tabindex')
    delete img.dataset.lightboxTabindexAdded
  }
  if (img.dataset.lightboxRoleAdded === 'true') {
    img.removeAttribute('role')
    delete img.dataset.lightboxRoleAdded
  }
  if (img.dataset.lightboxLabelAdded === 'true') {
    img.removeAttribute('aria-label')
    delete img.dataset.lightboxLabelAdded
  }
}

function refreshZoomableImages() {
  if (typeof document === 'undefined') return
  document.querySelectorAll('.vp-doc img').forEach((img) => {
    if (!(img instanceof HTMLImageElement)) return
    const zoomable = isZoomableDocImage(img)
    img.classList.toggle('gf-lightboxable', zoomable)
    if (zoomable) {
      img.setAttribute('data-lightbox-ready', 'true')
      if (!img.hasAttribute('tabindex')) {
        img.tabIndex = 0
        img.dataset.lightboxTabindexAdded = 'true'
      }
      if (!img.hasAttribute('role')) {
        img.setAttribute('role', 'button')
        img.dataset.lightboxRoleAdded = 'true'
      }
      if (!img.hasAttribute('aria-label')) {
        const description = (img.alt || '').trim()
        img.setAttribute('aria-label', description ? `Open full-size image: ${description}` : 'Open full-size image')
        img.dataset.lightboxLabelAdded = 'true'
      }
    } else {
      img.removeAttribute('data-lightbox-ready')
      removeManagedLightboxAttributes(img)
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
    state.caption.textContent = (img.alt || '').trim() || 'Expanded documentation image'
  }
  state.overlay.classList.add('is-open')
  state.overlay.setAttribute('aria-hidden', 'false')
  document.documentElement.classList.add('gf-lightbox-open')
  const closeButton = state.overlay.querySelector('.gf-lightbox-close')
  if (closeButton instanceof HTMLButtonElement) {
    closeButton.focus({ preventScroll: true })
  } else {
    state.overlay.focus({ preventScroll: true })
  }
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
  overlay.setAttribute('aria-labelledby', 'gf-lightbox-caption')
  overlay.tabIndex = -1
  overlay.innerHTML = `
    <button type="button" class="gf-lightbox-close" aria-label="Close image">×</button>
    <figure class="gf-lightbox-figure">
      <img class="gf-lightbox-image" alt="" />
      <figcaption id="gf-lightbox-caption" class="gf-lightbox-caption"></figcaption>
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
    const target = event.target
    const isOpen = overlay.classList.contains('is-open')

    if (!isOpen) {
      if (
        target instanceof HTMLImageElement &&
        isZoomableDocImage(target) &&
        (event.key === 'Enter' || event.key === ' ')
      ) {
        event.preventDefault()
        openLightbox(target)
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      closeLightbox()
      return
    }

    if (event.key === 'Tab') {
      const focusable = Array.from(overlay.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'))
        .filter((element) => element instanceof HTMLElement && element.getClientRects().length > 0)
      if (focusable.length === 0) {
        event.preventDefault()
        overlay.focus({ preventScroll: true })
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
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
          // 'base' rather than 'dark': the dark theme hard-sets its
          // own mainBkg/nodeBorder/nodeTextColor, which beat the
          // primary* variables below — only lineColor was landing,
          // so nodes rendered on stock #1F2020 with #CCC borders.
          // 'base' is the one theme intended to be overridden.
          theme: 'base',
          // These cover the first paint only. The durable styling is
          // the TEMPER — Mermaid block in custom.css, which drives
          // everything from var(--gf-*): mermaid.initialize() runs
          // once per session, so values set here cannot follow a
          // light/dark toggle. Keep the two in agreement.
          themeVariables: {
            background: 'transparent',
            // Flowchart reads these, not primaryColor/primaryBorderColor.
            mainBkg: '#2C2734',
            nodeBorder: '#3D3349',
            nodeTextColor: '#FFFFFF',
            clusterBkg: '#1D1923',
            clusterBorder: '#2A2333',
            edgeLabelBackground: '#131017',
            titleColor: '#FFFFFF',
            primaryColor: '#2C2734',
            primaryTextColor: '#FFFFFF',
            primaryBorderColor: '#3D3349',
            lineColor: '#FFC24D',
            secondaryColor: '#1D1923',
            tertiaryColor: '#131017',
            fontFamily:
              "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
            // Set here, NOT in custom.css. Mermaid measures label text at
            // render time to size every node box and lay out the graph, so
            // a CSS-only bump leaves the boxes at the old dimensions and
            // the text spills out of them. This is the layout-safe knob;
            // the CSS block deliberately sets font-family only.
            fontSize: '18px'
          },
          // The readability problem was never the font size on its own.
          // Mermaid lays the graph out at its own intrinsic width and the
          // SVG is then scaled to fit the reading column: an LR flowchart
          // of five long-labelled nodes came out 1104px wide against a
          // 753px column, so everything rendered at 0.68 scale and a 16px
          // label reached the screen at about 11px.
          //
          // The fix is to make the graph narrower, not the type bigger —
          // tighter wrapping turns wide boxes into taller ones, which
          // costs vertical space the page has and buys back the scale.
          flowchart: {
            curve: 'basis',
            htmlLabels: false,
            nodeSpacing: 26,
            rankSpacing: 34,
            wrappingWidth: 140,
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
    ctx.app.component('StarterKitOptions', StarterKitOptions)
    ctx.app.component('SitePreview', SitePreview)
    ctx.app.component('GoForjLiveTerminal', GoForjLiveTerminal)
    ctx.app.component('CodeFile', CodeFile)
    ctx.app.component('MakeCommandTabs', MakeCommandTabs)
    ctx.app.component('LighthouseProductView', LighthouseProductView)
  },
  Layout: () => {
    const { theme } = useData()
    const docsVersion = theme.value.docsVersion || 'Unreleased'

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
      'doc-before': () => h(LibraryRepoHeader),
      'layout-bottom': () => h(ApiIndexJump)
    })
  },
  setup() {
    const route = useRoute()
    const { theme } = useData()
    let routeHashTimers = []
    let onHashChange = null
    let sidebarImageIntentTimer = 0
    let sidebarImageIntentLink = null
    let onSidebarPointerOver = null
    let onSidebarPointerOut = null
    let onSidebarPointerDown = null
    let onSidebarFocusIn = null

    const clearSidebarImageIntent = () => {
      if (sidebarImageIntentTimer) {
        window.clearTimeout(sidebarImageIntentTimer)
        sidebarImageIntentTimer = 0
      }
      sidebarImageIntentLink = null
    }

    const preloadForSidebarLink = (link) => {
      preloadSidebarLinkImages(link, theme.value.pageImagePreloads)
    }

    const scheduleSidebarImagePreload = (link) => {
      if (sidebarImageIntentLink === link && sidebarImageIntentTimer) return
      clearSidebarImageIntent()
      sidebarImageIntentLink = link
      sidebarImageIntentTimer = window.setTimeout(() => {
        sidebarImageIntentTimer = 0
        sidebarImageIntentLink = null
        preloadForSidebarLink(link)
      }, PAGE_IMAGE_PRELOAD_INTENT_MS)
    }

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

      onSidebarPointerOver = (event) => {
        if (event.pointerType === 'touch') return
        const link = sidebarLinkFromEvent(event)
        if (!link || (event.relatedTarget instanceof Node && link.contains(event.relatedTarget))) return
        scheduleSidebarImagePreload(link)
      }
      onSidebarPointerOut = (event) => {
        const link = sidebarLinkFromEvent(event)
        if (!link || (event.relatedTarget instanceof Node && link.contains(event.relatedTarget))) return
        if (sidebarImageIntentLink === link) clearSidebarImageIntent()
      }
      onSidebarPointerDown = (event) => {
        const link = sidebarLinkFromEvent(event)
        if (!link) return
        clearSidebarImageIntent()
        preloadForSidebarLink(link)
      }
      onSidebarFocusIn = (event) => {
        const link = sidebarLinkFromEvent(event)
        if (!link) return
        clearSidebarImageIntent()
        preloadForSidebarLink(link)
      }

      document.addEventListener('pointerover', onSidebarPointerOver, { passive: true })
      document.addEventListener('pointerout', onSidebarPointerOut, { passive: true })
      document.addEventListener('pointerdown', onSidebarPointerDown, { passive: true })
      document.addEventListener('focusin', onSidebarFocusIn)
    })

    watch(() => route.path, () => {
      resetOutlineScrollerPosition()
      refreshSoon()
      nextTick().then(replayDocEnter)
      scheduleCrossPageHashCorrection()
      window.setTimeout(flashHashTarget, 600)
    })

    onBeforeUnmount(() => {
      clearSidebarImageIntent()
      routeHashTimers.forEach((id) => window.clearTimeout(id))
      routeHashTimers = []
      if (onHashChange) {
        window.removeEventListener('hashchange', onHashChange)
      }
      if (onBannerResize) {
        window.removeEventListener('resize', onBannerResize)
        onBannerResize = null
      }
      if (onSidebarPointerOver) {
        document.removeEventListener('pointerover', onSidebarPointerOver)
      }
      if (onSidebarPointerOut) {
        document.removeEventListener('pointerout', onSidebarPointerOut)
      }
      if (onSidebarPointerDown) {
        document.removeEventListener('pointerdown', onSidebarPointerDown)
      }
      if (onSidebarFocusIn) {
        document.removeEventListener('focusin', onSidebarFocusIn)
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
