<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'

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
const { hash: routeHash } = useData()
let stopHashWatch

function cardID() {
  return `make-${props.name}-card`
}

function tabID(key) {
  return `make-${props.name}-${key}-tab`
}

function panelID(key) {
  return `make-${props.name}-${key}-panel`
}

function tabAnchorID(key) {
  return `${cardID()}-${key}`
}

function tabHash(key) {
  return key === 'usage' ? `#${cardID()}` : `#${tabAnchorID(key)}`
}

function selectTab(key, updateURL = true) {
  if (!tabs.some((tab) => tab.key === key)) return

  activeTab.value = key
  if (!updateURL || typeof window === 'undefined') return

  const hash = tabHash(key)
  if (window.location.hash === hash) return

  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${window.location.search}${hash}`
  )
}

function syncTabFromHash(hash) {
  if (typeof window === 'undefined') return

  const selectedHash = hash || window.location.hash
  if (selectedHash === `#${cardID()}` || selectedHash === `#${tabID('usage')}` || selectedHash === `#${panelID('usage')}`) {
    selectTab('usage', false)
    return
  }

  for (const tab of tabs) {
    if (selectedHash === tabHash(tab.key) || selectedHash === `#${tabID(tab.key)}` || selectedHash === `#${panelID(tab.key)}`) {
      selectTab(tab.key, false)
      return
    }
  }
}

function selectAdjacentTab(event, index) {
  let nextIndex = index
  if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length
  if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length
  if (event.key === 'Home') nextIndex = 0
  if (event.key === 'End') nextIndex = tabs.length - 1
  if (nextIndex === index && !['Home', 'End'].includes(event.key)) return

  event.preventDefault()
  selectTab(tabs[nextIndex].key)
  const buttons = event.currentTarget.parentElement?.querySelectorAll('[role="tab"]')
  buttons?.[nextIndex]?.focus()
}

onMounted(() => {
  stopHashWatch = watch(routeHash, syncTabFromHash, {
    immediate: true,
    flush: 'post'
  })
  window.requestAnimationFrame(() => syncTabFromHash())
})

onBeforeUnmount(() => {
  stopHashWatch?.()
})
</script>

<template>
  <div :id="cardID()" class="gf-make-command-tabs">
    <span
      v-for="tab in tabs.slice(1)"
      :id="tabAnchorID(tab.key)"
      :key="`${tab.key}-anchor`"
      class="gf-make-command-tabs__anchor"
      aria-hidden="true"
    ></span>
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
        @click="selectTab(tab.key)"
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
