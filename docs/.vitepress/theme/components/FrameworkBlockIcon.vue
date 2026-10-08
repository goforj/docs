<script setup>
import { simpleIconBodies } from 'virtual:goforj-icons'

defineProps({ framework: { type: String, required: true } })
</script>

<template>
  <svg class="gf-framework-block" viewBox="0 0 72 80" fill="none" aria-hidden="true">
    <path d="M8 20 36 4 64 20 36 36Z" fill="currentColor" fill-opacity=".15" />
    <path d="M8 20 36 36V72L8 56Z" fill="currentColor" fill-opacity=".06" />
    <path d="M36 36 64 20V56L36 72Z" fill="currentColor" fill-opacity=".1" />
    <path d="M8 20 36 4 64 20V56L36 72 8 56V20ZM8 20 36 36 64 20M36 36V72" stroke="currentColor" stroke-opacity=".65" stroke-width="1.5" stroke-linejoin="round" />
    <path d="m12 61 24 14 28-16" stroke="currentColor" stroke-opacity=".2" stroke-width="1.5" />
    <g transform="matrix(.85 -.486 0 .85 40 40)" fill="currentColor">
      <text v-if="framework === 'templ'" x="0" y="15" font-size="8.5" font-weight="750" font-family="sans-serif" textLength="23" lengthAdjust="spacingAndGlyphs">templ</text>
      <g v-else v-html="simpleIconBodies[framework === 'vue' ? 'vuedotjs' : 'react']" />
    </g>
  </svg>
</template>

<style scoped>
.gf-framework-block { display: block; width: 64px; height: 72px; overflow: visible; }
</style>
