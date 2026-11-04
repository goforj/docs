<script setup>
defineProps({ active: { type: Boolean, required: true } })
</script>

<!-- Slots preserve tab content when VitePress strips static HTML from lean page bundles. -->
<template>
  <div v-show="active"><slot /></div>
</template>
