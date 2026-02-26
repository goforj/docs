<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const variants = [
  ['halo', 'Halo'],
  ['glass', 'Glass'],
  ['ink', 'Ink'],
  ['electric', 'Electric'],
  ['uv-glow', 'UV Glow'],
  ['amber', 'Amber'],
  ['forest', 'Forest'],
  ['terminal', 'Terminal'],
  ['plasma', 'Plasma'],
  ['sunset', 'Sunset'],
  ['paper', 'Paper'],
  ['chrome', 'Chrome'],
  ['obsidian', 'Obsidian'],
  ['frost', 'Frost'],
  ['midnight-gold', 'Midnight Gold'],
  ['desert-dusk', 'Desert Dusk'],
  ['retro-amber-crt', 'Retro CRT'],
  ['aurora', 'Aurora'],
  ['rose-metal', 'Rose Metal'],
  ['cobalt-luxe', 'Cobalt Luxe'],
  ['mono-slate', 'Mono Slate'],
  ['mint-neon', 'Mint Neon'],
  ['sepia-noir', 'Sepia Noir']
]

const previewStyles = {
  halo: {
    borderColor: 'rgba(170,188,240,.28)',
    background: 'radial-gradient(70px 20px at 10% 0%, rgba(44,104,255,.22), transparent 60%), linear-gradient(180deg, #171d28, #0f131c)'
  },
  glass: {
    borderColor: 'rgba(210,226,255,.24)',
    background: 'radial-gradient(70px 20px at 20% 0%, rgba(125,186,255,.18), transparent 60%), linear-gradient(180deg, rgba(35,42,56,.85), rgba(22,27,38,.75))'
  },
  ink: {
    borderColor: 'rgba(138,149,177,.22)',
    background: 'linear-gradient(180deg, #151920, #0d1016)'
  },
  electric: {
    borderColor: 'rgba(116,211,255,.28)',
    background: 'radial-gradient(80px 22px at 8% 0%, rgba(0,153,255,.22), transparent 60%), radial-gradient(70px 20px at 90% 0%, rgba(0,255,224,.12), transparent 60%), linear-gradient(180deg, #0d1420, #090d14)'
  },
  'uv-glow': {
    borderColor: 'rgba(140,80,255,.24)',
    background: 'radial-gradient(80px 22px at 10% 0%, rgba(140,80,255,.20), transparent 60%), radial-gradient(80px 22px at 88% 0%, rgba(90,0,180,.14), transparent 62%), linear-gradient(180deg, #151523, #0d0d16)'
  },
  amber: {
    borderColor: 'rgba(255,196,96,.24)',
    background: 'radial-gradient(70px 20px at 10% 0%, rgba(255,176,64,.18), transparent 60%), linear-gradient(180deg, #241b12, #15100c)'
  },
  forest: {
    borderColor: 'rgba(126,223,168,.22)',
    background: 'radial-gradient(70px 20px at 12% 0%, rgba(20,180,120,.16), transparent 60%), linear-gradient(180deg, #132019, #0d1511)'
  },
  terminal: {
    borderColor: 'rgba(78,201,120,.22)',
    background: 'linear-gradient(180deg, #0a120c, #070b08)'
  },
  plasma: {
    borderColor: 'rgba(198,128,255,.24)',
    background: 'radial-gradient(70px 20px at 8% 0%, rgba(174,82,255,.2), transparent 60%), radial-gradient(70px 20px at 92% 0%, rgba(255,74,216,.12), transparent 60%), linear-gradient(180deg, #1b1125, #100b17)'
  },
  sunset: {
    borderColor: 'rgba(255,154,102,.22)',
    background: 'radial-gradient(70px 20px at 6% 0%, rgba(255,99,132,.18), transparent 60%), radial-gradient(70px 20px at 92% 0%, rgba(255,186,86,.14), transparent 60%), linear-gradient(180deg, #23131c, #140f17)'
  },
  paper: {
    borderColor: 'rgba(214,202,173,.20)',
    background: 'linear-gradient(180deg, #2a241d, #1c1813)'
  },
  chrome: {
    borderColor: 'rgba(200,212,236,.24)',
    background: 'linear-gradient(180deg, #2a313d, #171b22)'
  },
  obsidian: {
    borderColor: 'rgba(255,94,94,.18)',
    background: 'radial-gradient(70px 20px at 10% 0%, rgba(255,70,70,.12), transparent 60%), linear-gradient(180deg, #101012, #0a0a0c)'
  },
  frost: {
    borderColor: 'rgba(186,228,255,.22)',
    background: 'radial-gradient(70px 20px at 8% 0%, rgba(120,214,255,.2), transparent 60%), radial-gradient(70px 20px at 92% 0%, rgba(168,233,255,.12), transparent 60%), linear-gradient(180deg, #121b27, #0c121b)'
  },
  'midnight-gold': {
    borderColor: 'rgba(232,192,94,.20)',
    background: 'radial-gradient(70px 20px at 14% 0%, rgba(255,205,92,.14), transparent 60%), linear-gradient(180deg, #171b26, #0d0f16)'
  },
  'desert-dusk': {
    borderColor: 'rgba(205,151,117,.20)',
    background: 'radial-gradient(70px 20px at 10% 0%, rgba(200,118,88,.14), transparent 60%), radial-gradient(70px 20px at 90% 0%, rgba(117,90,154,.12), transparent 60%), linear-gradient(180deg, #251a20, #151116)'
  },
  'retro-amber-crt': {
    borderColor: 'rgba(255,179,70,.24)',
    background: 'repeating-linear-gradient(180deg, rgba(255,173,74,.02) 0px, rgba(255,173,74,.02) 1px, transparent 1px, transparent 3px), linear-gradient(180deg, #151108, #0e0b06)'
  },
  aurora: {
    borderColor: 'rgba(118,240,214,.22)',
    background: 'radial-gradient(70px 20px at 6% 0%, rgba(70,255,196,.16), transparent 60%), radial-gradient(70px 20px at 94% 0%, rgba(96,112,255,.14), transparent 60%), linear-gradient(180deg, #101922, #0a1017)'
  },
  'rose-metal': {
    borderColor: 'rgba(231,172,192,.20)',
    background: 'linear-gradient(180deg, #312831, #1b171d)'
  },
  'cobalt-luxe': {
    borderColor: 'rgba(116,152,246,.22)',
    background: 'radial-gradient(70px 20px at 8% 0%, rgba(88,126,255,.18), transparent 60%), linear-gradient(180deg, #171c2f, #0f1220)'
  },
  'mono-slate': {
    borderColor: 'rgba(164,171,186,.18)',
    background: 'linear-gradient(180deg, #22262d, #15171c)'
  },
  'mint-neon': {
    borderColor: 'rgba(88,255,204,.20)',
    background: 'radial-gradient(70px 20px at 8% 0%, rgba(44,255,172,.18), transparent 60%), radial-gradient(70px 20px at 94% 0%, rgba(0,246,255,.12), transparent 60%), linear-gradient(180deg, #0f191a, #090d10)'
  },
  'sepia-noir': {
    borderColor: 'rgba(172,140,98,.20)',
    background: 'radial-gradient(70px 18px at 12% 0%, rgba(164,110,64,.12), transparent 60%), linear-gradient(180deg, #211a16, #14100e)'
  }
}

const open = ref(false)
const current = ref('ink')
const rootEl = ref(null)
const previewing = ref(null)

function readCurrent() {
  if (typeof window === 'undefined') return
  current.value = document.documentElement?.dataset?.gfCodeVariant || window.localStorage.getItem('goforjCodeVariant') || 'ink'
}

function setVariant(value) {
  if (typeof window === 'undefined') return
  current.value = value
  previewing.value = null
  document.documentElement.dataset.gfCodeVariant = value
  window.localStorage.setItem('goforjCodeVariant', value)
  open.value = false
}

const currentLabel = computed(() => variants.find(([id]) => id === current.value)?.[1] || 'Ink')

function toggleOpen() {
  open.value = !open.value
  if (!open.value) {
    clearPreview()
  }
}

function applyPreview(value) {
  if (typeof window === 'undefined') return
  previewing.value = value
  document.documentElement.dataset.gfCodeVariant = value
}

function clearPreview() {
  if (typeof window === 'undefined') return
  previewing.value = null
  document.documentElement.dataset.gfCodeVariant = current.value
}

function onDocumentClick(event) {
  const root = rootEl.value
  if (!root || !(root instanceof Element)) return
  if (root.contains(event.target)) return
  clearPreview()
  open.value = false
}

function onDocumentKeydown(event) {
  if (event.key === 'Escape') {
    clearPreview()
    open.value = false
  }
}

readCurrent()

onMounted(() => {
  document.addEventListener('click', onDocumentClick, true)
  document.addEventListener('keydown', onDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick, true)
  document.removeEventListener('keydown', onDocumentKeydown)
})
</script>

<template>
  <div ref="rootEl" class="gf-code-variant-picker">
    <button
      type="button"
      class="gf-code-variant-picker__trigger"
      :aria-expanded="open ? 'true' : 'false'"
      aria-haspopup="menu"
      title="Code block theme variants"
      @click="toggleOpen"
    >
      <span class="gf-code-variant-picker__dot" aria-hidden="true"></span>
      <span class="gf-code-variant-picker__label">Code theme</span>
      <span class="gf-code-variant-picker__value">{{ currentLabel }}</span>
    </button>

    <div
      class="gf-code-variant-picker__panel"
      :class="{ 'is-open': open }"
      role="menu"
      @mouseleave="clearPreview"
    >
      <button
        v-for="[id, label] in variants"
        :key="id"
        type="button"
        class="gf-code-variant-picker__item"
        :class="{ 'is-active': current === id, 'is-preview': previewing === id && current !== id }"
        role="menuitemradio"
        :aria-checked="current === id ? 'true' : 'false'"
        @mouseenter="applyPreview(id)"
        @focus="applyPreview(id)"
        @blur="clearPreview"
        @click="setVariant(id)"
      >
        <span
          class="gf-code-variant-picker__swatch"
          :style="previewStyles[id]"
          aria-hidden="true"
        >
          <span class="gf-code-variant-picker__swatch-line"></span>
          <span class="gf-code-variant-picker__swatch-line is-short"></span>
        </span>
        <span class="gf-code-variant-picker__item-name">{{ label }}</span>
        <span class="gf-code-variant-picker__item-id">{{ id }}</span>
      </button>
    </div>
  </div>
</template>
