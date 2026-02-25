<script setup>
import { computed, nextTick, onMounted, ref, useSlots } from 'vue'

const props = defineProps({
  repo: { type: String, required: true },
  example: { type: String, required: true },
  title: { type: String, default: '' }
})

const slots = useSlots()
const hasSlot = computed(() => Boolean(slots.default))

const isLoading = ref(true)
const isRunning = ref(false)
const errorMessage = ref('')
const details = ref(null)
const runResult = ref(null)

const headerTitle = computed(() => {
  if (props.title) {
    return props.title
  }
  if (details.value?.title) {
    return details.value.title
  }
  return 'Example'
})

const apiBaseEnv = import.meta.env.DEV ? (import.meta.env.VITE_GOFORJ_API_BASE || '') : ''
const defaultApiBase = typeof window !== 'undefined' ? window.location.origin : ''
const apiBase = (apiBaseEnv || defaultApiBase).replace(/\/$/, '')

const buildUrl = (path) => `${apiBase}${path}`

const reapplyHashScroll = async () => {
  if (typeof window === 'undefined') {
    return
  }
  const hash = window.location.hash
  if (!hash) {
    return
  }

  await nextTick()

  let attempts = 0
  const maxAttempts = 6
  const tick = () => {
    attempts += 1
    const id = decodeURIComponent(hash.slice(1))
    const target =
      document.getElementById(id) ||
      document.querySelector(hash)
    if (target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ block: 'start' })
    }
    if (attempts < maxAttempts) {
      window.requestAnimationFrame(tick)
    }
  }

  window.requestAnimationFrame(tick)
}

const fetchDetails = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await fetch(buildUrl(`/api/v1/examples/${props.repo}/${props.example}`))
    if (!response.ok) {
      throw new Error(`Example lookup failed (${response.status})`)
    }
    details.value = await response.json()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load example.'
  } finally {
    isLoading.value = false
    reapplyHashScroll()
  }
}

const runExample = async () => {
  isRunning.value = true
  errorMessage.value = ''
  runResult.value = ''
  try {
    const response = await fetch(buildUrl(`/api/v1/examples/${props.repo}/${props.example}/run`), {
      method: 'POST'
    })
    if (!response.ok) {
      throw new Error(`Run failed (${response.status})`)
    }
    runResult.value = await response.json()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to run example.'
  } finally {
    isRunning.value = false
    reapplyHashScroll()
  }
}

const ansiToHtml = (input) => {
  if (!input) {
    return ''
  }
  const escapeHtml = (value) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const sgrRegex = /\u001b\[([0-9;]*)m/g
  let lastIndex = 0
  let match
  let html = ''
  const styleStack = []

  const toColor = (code) => {
    const base = {
      30: '#111827',
      31: '#ef4444',
      32: '#22c55e',
      33: '#f59e0b',
      34: '#3b82f6',
      35: '#d946ef',
      36: '#06b6d4',
      37: '#e5e7eb',
      90: '#6b7280',
      91: '#f87171',
      92: '#4ade80',
      93: '#fbbf24',
      94: '#60a5fa',
      95: '#e879f9',
      96: '#22d3ee',
      97: '#f9fafb'
    }
    return base[code] || ''
  }

  const xtermColor = (value) => {
    if (value < 16) {
      const basic = [
        '#000000', '#800000', '#008000', '#808000',
        '#000080', '#800080', '#008080', '#c0c0c0',
        '#808080', '#ff0000', '#00ff00', '#ffff00',
        '#0000ff', '#ff00ff', '#00ffff', '#ffffff'
      ]
      return basic[value] || ''
    }
    if (value >= 16 && value <= 231) {
      const idx = value - 16
      const r = Math.floor(idx / 36)
      const g = Math.floor((idx % 36) / 6)
      const b = idx % 6
      const toChannel = (v) => (v === 0 ? 0 : 55 + v * 40)
      return `rgb(${toChannel(r)}, ${toChannel(g)}, ${toChannel(b)})`
    }
    if (value >= 232 && value <= 255) {
      const gray = 8 + (value - 232) * 10
      return `rgb(${gray}, ${gray}, ${gray})`
    }
    return ''
  }

  const openSpan = (style) => {
    html += `<span style="${style}">`
    styleStack.push('</span>')
  }

  const closeAll = () => {
    while (styleStack.length > 0) {
      html += styleStack.pop()
    }
  }

  while ((match = sgrRegex.exec(input)) !== null) {
    const chunk = input.slice(lastIndex, match.index)
    html += escapeHtml(chunk)
    lastIndex = match.index + match[0].length

    const codes = match[1] === '' ? [0] : match[1].split(';').map(Number)
    if (codes.includes(0)) {
      closeAll()
      continue
    }

    let style = ''
    for (let i = 0; i < codes.length; i += 1) {
      const code = codes[i]
      if (code === 1) {
        style += 'font-weight: 600;'
      } else if (code === 39) {
        style += 'color: inherit;'
      } else if (code === 38 && codes[i + 1] === 5 && typeof codes[i + 2] === 'number') {
        const color = xtermColor(codes[i + 2])
        if (color) {
          style += `color: ${color};`
        }
        i += 2
      } else if (code >= 30 && code <= 37) {
        const color = toColor(code)
        if (color) {
          style += `color: ${color};`
        }
      } else if (code >= 90 && code <= 97) {
        const color = toColor(code)
        if (color) {
          style += `color: ${color};`
        }
      }
    }

    if (style) {
      openSpan(style)
    }
  }

  html += escapeHtml(input.slice(lastIndex))
  closeAll()
  return html
}

onMounted(() => {
  reapplyHashScroll()
  if (hasSlot.value) {
    isLoading.value = false
    return
  }
  fetchDetails()
})
</script>

<template>
  <section class="gf-example">

    <div class="gf-example__body">
      <div class="gf-example__panel">
        <div v-if="hasSlot" class="gf-example__slot">
          <slot />
        </div>
        <pre class="gf-example__code" v-else-if="details && details.code">
          <code class="language-go">{{ details.code }}</code>
        </pre>
        <p v-else class="gf-example__placeholder">
          {{ isLoading ? 'Loading example…' : 'Code unavailable.' }}
        </p>
        <button
          class="gf-example__run gf-example__run--inline"
          type="button"
          :disabled="isLoading || isRunning"
          @click="runExample"
        >
          {{ isRunning ? 'Running…' : 'Run example' }}
        </button>
      </div>
      <div class="gf-example__panel" v-if="isRunning || runResult">
        <pre class="gf-example__code gf-example_output" v-if="runResult && runResult.stdout"><code v-html="ansiToHtml(runResult.stdout)"></code></pre>
        <p v-else-if="isRunning" class="gf-example__placeholder">Running…</p>
        <p v-if="runResult" class="gf-example__meta-line">
          Exit {{ runResult.exitCode }} · {{ runResult.durationMs }}ms
        </p>
      </div>
    </div>

    <p v-if="errorMessage" class="gf-example__error">{{ errorMessage }}</p>
  </section>
</template>
