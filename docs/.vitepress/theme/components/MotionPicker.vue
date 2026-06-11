<script setup>
import { computed, ref } from 'vue'

const MODES = [
  ['auto', 'Auto'],
  ['on', 'On'],
  ['reduced', 'Reduced']
]

const STORAGE_KEY = 'goforjMotion'

const current = ref('auto')

function readCurrent() {
  if (typeof window === 'undefined') return
  const stored = window.localStorage.getItem(STORAGE_KEY)
  current.value = stored === 'on' || stored === 'reduced' ? stored : 'auto'
}

function applyMode(mode) {
  if (typeof window === 'undefined') return
  if (mode === 'auto') {
    delete document.documentElement.dataset.gfMotion
    window.localStorage.removeItem(STORAGE_KEY)
  } else {
    document.documentElement.dataset.gfMotion = mode
    window.localStorage.setItem(STORAGE_KEY, mode)
  }
}

function cycle() {
  const index = MODES.findIndex(([id]) => id === current.value)
  const next = MODES[(index + 1) % MODES.length][0]
  current.value = next
  applyMode(next)
}

const currentLabel = computed(() => MODES.find(([id]) => id === current.value)?.[1] || 'Auto')

const title = computed(() => {
  if (current.value === 'on') return 'Animations always on, overriding the OS reduce-motion setting'
  if (current.value === 'reduced') return 'Animations off, regardless of the OS setting'
  return 'Animations follow your OS reduce-motion setting'
})

readCurrent()
</script>

<template>
  <button
    type="button"
    class="gf-motion-picker"
    :title="title"
    :aria-label="`Motion preference: ${currentLabel}. Click to change.`"
    @click="cycle"
  >
    <span class="gf-motion-picker__dot" :data-mode="current" aria-hidden="true"></span>
    <span class="gf-motion-picker__label">Motion</span>
    <span class="gf-motion-picker__value">{{ currentLabel }}</span>
  </button>
</template>
