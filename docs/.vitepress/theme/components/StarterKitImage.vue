<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

const props = defineProps({ name: { type: String, required: true } })
const { isDark } = useData()
const images = import.meta.glob('../../../assets/starter-kits/*.png', {
  eager: true,
  query: '?url',
  import: 'default'
})
const src = computed(() => images[`../../../assets/starter-kits/${props.name}${isDark.value ? '' : '-light'}.png`])
</script>

<template>
  <img :src="src">
</template>
