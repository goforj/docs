<script setup>
import { computed, h, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, withBase } from 'vitepress'
import { simpleIconBodies } from 'virtual:goforj-icons'

const { page, frontmatter } = useData()
const root = ref(null)
const toggle = ref(null)
const menu = ref(null)
const open = ref(false)
const status = ref('')
const copying = ref(false)
let resetTimer
const visible = computed(() => page.value.markdownUrl && frontmatter.value.sidebar !== false)
const markdownUrl = computed(() => withBase(page.value.markdownUrl || '/'))
const prompt = computed(() => `Read ${page.value.canonicalUrl} (Markdown: ${new URL(markdownUrl.value, page.value.canonicalUrl).href}) so I can ask questions about this GoForj documentation page.`)
const chatgptUrl = computed(() => `https://chatgpt.com/?q=${encodeURIComponent(prompt.value)}`)
const claudeUrl = computed(() => `https://claude.ai/new?q=${encodeURIComponent(prompt.value)}`)

const iconPaths = {
  copy: 'M9 9h12v12H9z M15 5V3H3v12h2',
  markdown: 'M3 5h18v14H3z M6 15V9l3 3 3-3v6 M15 12l2 3 2-3 M17 9v6',
  chevron: 'm6 9 6 6 6-6',
  external: 'M7 17 17 7 M7 7h10v10'
}
const Icon = ({ name }) => h('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: iconPaths[name] })])

function close(restoreFocus = false) {
  open.value = false
  if (restoreFocus) toggle.value?.focus()
}

async function showMenu(last = false) {
  open.value = true
  await nextTick()
  const items = menu.value?.querySelectorAll('[role="menuitem"]')
  items?.[last ? items.length - 1 : 0]?.focus()
}

function onMenuKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close(true)
  } else if (event.key === 'Tab') {
    close()
  } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
    event.preventDefault()
    const items = Array.from(menu.value.querySelectorAll('[role="menuitem"]'))
    const current = items.indexOf(document.activeElement)
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
    items[index].focus()
  }
}

async function copyPage() {
  if (copying.value) return
  const url = markdownUrl.value
  copying.value = true
  status.value = ''
  clearTimeout(resetTimer)
  close(open.value)
  try {
    // Safari requires the clipboard write to begin during the original click gesture.
    const markdown = fetch(url).then(async (response) => {
      if (!response.ok || !/^text\/(plain|markdown|x-markdown)(;|$)/i.test(response.headers.get('content-type') || '')) throw new Error('Markdown unavailable')
      return response.text()
    })
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      await navigator.clipboard.write([new ClipboardItem({ 'text/plain': markdown.then((text) => new Blob([text], { type: 'text/plain' })) })])
    } else {
      await navigator.clipboard.writeText(await markdown)
    }
    if (url === markdownUrl.value) status.value = 'Copied!'
  } catch {
    if (url === markdownUrl.value) status.value = 'Copy failed. Use View as Markdown.'
  } finally {
    copying.value = false
    resetTimer = window.setTimeout(() => { status.value = '' }, 5000)
  }
}

function onPointerDown(event) {
  if (!root.value?.contains(event.target)) close()
}

function onFocusOut(event) {
  if (!root.value?.contains(event.relatedTarget)) close()
}

watch(() => page.value.relativePath, () => {
  close()
  status.value = ''
  clearTimeout(resetTimer)
})
onMounted(() => document.addEventListener('pointerdown', onPointerDown))
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  clearTimeout(resetTimer)
})
</script>

<template>
  <div v-if="visible" ref="root" class="gf-page-actions" :class="{ 'gf-page-actions--library': frontmatter.repoUrl && frontmatter.repoSlug }" @focusout="onFocusOut">
    <div class="gf-page-actions__buttons">
      <button class="gf-page-actions__copy" type="button" :disabled="copying" @click="copyPage">
        <Icon name="copy" />
        <span>{{ status === 'Copied!' ? status : copying ? 'Copying...' : 'Copy page' }}</span>
      </button>
      <button ref="toggle" class="gf-page-actions__toggle" type="button" aria-label="Page actions" aria-haspopup="menu" :aria-expanded="open" aria-controls="gf-page-menu" @click="open ? close() : showMenu()" @keydown.down.prevent="showMenu()" @keydown.up.prevent="showMenu(true)">
        <Icon name="chevron" />
      </button>
    </div>
    <span class="gf-page-actions__status" role="status">{{ status }}</span>
    <div v-if="open" id="gf-page-menu" ref="menu" class="gf-page-actions__menu" role="menu" aria-label="Page actions" @keydown="onMenuKeydown">
      <button type="button" role="menuitem" tabindex="-1" @click="copyPage">
        <Icon name="copy" />
        <span><strong>Copy page</strong><small>Copy page as Markdown for LLMs</small></span>
      </button>
      <a :href="markdownUrl" role="menuitem" tabindex="-1" target="_blank" rel="noopener noreferrer" @click="close()">
        <Icon name="markdown" />
        <span><strong>View as Markdown <Icon name="external" /></strong><small>View this page as plain text</small></span>
      </a>
      <a :href="chatgptUrl" role="menuitem" tabindex="-1" target="_blank" rel="noopener noreferrer" @click="close()">
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" v-html="simpleIconBodies.openai" />
        <span><strong>Open in ChatGPT <Icon name="external" /></strong><small>Ask questions about this page</small></span>
      </a>
      <a :href="claudeUrl" role="menuitem" tabindex="-1" target="_blank" rel="noopener noreferrer" @click="close()">
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" v-html="simpleIconBodies.claude" />
        <span><strong>Open in Claude <Icon name="external" /></strong><small>Ask questions about this page</small></span>
      </a>
    </div>
  </div>
</template>

<style scoped>
:global(.VPDoc .content-container) { position: relative; }
.gf-page-actions { position: absolute; top: 4px; right: 0; display: flex; margin: 0; font-size: 13px; line-height: 1.5; z-index: 20; }
/* Keep the copy control below the repository link without reserving content space. */
.gf-page-actions--library { top: 44px; }
.gf-page-actions__buttons { display: inline-flex; border: 1px solid var(--gf-line-strong); border-radius: 8px; background: transparent; overflow: hidden; }
.gf-page-actions button, .gf-page-actions a { color: var(--vp-c-text-1); cursor: pointer; }
.gf-page-actions__copy, .gf-page-actions__toggle { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 7px 12px; font-weight: 500; background: transparent; }
.gf-page-actions__toggle { border-left: 1px solid var(--gf-line); padding: 7px 9px; color: var(--gf-ink-2); }
.gf-page-actions svg { flex-shrink: 0; width: 18px; height: 18px; }
.gf-page-actions__buttons svg { width: 16px; height: 16px; }
.gf-page-actions__toggle[aria-expanded='true'] svg { transform: rotate(180deg); }
.gf-page-actions__menu { position: absolute; top: calc(100% + 8px); right: 0; width: min(330px, calc(100vw - 48px)); padding: 8px; border: 1px solid var(--vp-c-divider); border-radius: 13px; background: var(--vp-c-bg-elv); box-shadow: var(--vp-shadow-3); }
.gf-page-actions__menu > a, .gf-page-actions__menu > button { display: flex; align-items: flex-start; gap: 12px; width: 100%; padding: 12px; text-align: left; text-decoration: none; border-radius: 7px; }
.gf-page-actions__menu > a > svg, .gf-page-actions__menu > button > svg { margin-top: 2px; }
.gf-page-actions strong { display: flex; align-items: center; gap: 6px; font-weight: 500; }
.gf-page-actions strong svg { width: 13px; height: 13px; color: var(--vp-c-text-2); }
.gf-page-actions small { display: block; margin-top: 2px; color: var(--vp-c-text-2); font-size: 12px; }
.gf-page-actions button:hover, .gf-page-actions a:hover { background: var(--vp-c-default-soft); }
.gf-page-actions__buttons button:hover, .gf-page-actions__toggle[aria-expanded='true'] { background: color-mix(in srgb, var(--gf-ink) 6%, transparent); }
.gf-page-actions button:focus-visible, .gf-page-actions a:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: -3px; }
.gf-page-actions button:disabled { cursor: progress; opacity: .7; }
.gf-page-actions__status { position: absolute; top: 100%; right: 0; margin-top: 3px; color: var(--vp-c-text-2); font-size: 11px; }
@media (max-width: 640px) {

  .gf-page-actions__copy > span { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .gf-page-actions__copy { padding: 9px 10px; }
}
</style>
