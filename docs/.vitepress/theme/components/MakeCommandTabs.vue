<script setup>
import { ref } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

const tabs = [
  { key: 'usage', label: 'Usage' },
  { key: 'files', label: 'Files touched' },
  { key: 'generated', label: 'Generated code' }
]

const activeTab = ref('usage')

function tabID(key) {
  return `make-${props.name}-${key}-tab`
}

function panelID(key) {
  return `make-${props.name}-${key}-panel`
}

function selectAdjacentTab(event, index) {
  let nextIndex = index
  if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length
  if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length
  if (event.key === 'Home') nextIndex = 0
  if (event.key === 'End') nextIndex = tabs.length - 1
  if (nextIndex === index && !['Home', 'End'].includes(event.key)) return

  event.preventDefault()
  activeTab.value = tabs[nextIndex].key
  const buttons = event.currentTarget.parentElement?.querySelectorAll('[role="tab"]')
  buttons?.[nextIndex]?.focus()
}
</script>

<template>
  <div class="gf-make-command-tabs">
    <div class="gf-make-command-tabs__list" role="tablist" :aria-label="`${name} details`">
      <button
        v-for="(tab, index) in tabs"
        :id="tabID(tab.key)"
        :key="tab.key"
        class="gf-make-command-tabs__tab"
        :class="{ 'is-active': activeTab === tab.key }"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab.key ? 'true' : 'false'"
        :aria-controls="panelID(tab.key)"
        :tabindex="activeTab === tab.key ? 0 : -1"
        @click="activeTab = tab.key"
        @keydown="selectAdjacentTab($event, index)"
      >
        {{ tab.label }}
      </button>
    </div>

    <section
      v-for="tab in tabs"
      v-show="activeTab === tab.key"
      :id="panelID(tab.key)"
      :key="tab.key"
      class="gf-make-command-tabs__panel"
      role="tabpanel"
      :aria-labelledby="tabID(tab.key)"
    >
      <p v-if="tab.key === 'generated'" class="gf-make-command-tabs__legend">
        In existing-file excerpts, highlighted lines are injected by this command.
      </p>
      <slot :name="tab.key"></slot>
    </section>
  </div>
</template>
