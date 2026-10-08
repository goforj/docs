<script setup>
import { onBeforeUnmount, ref } from 'vue'
import FrameworkBlockIcon from './FrameworkBlockIcon.vue'

const copied = ref('')
let copyResetTimer
const kits = [
  { name: 'Vue', id: 'vue', model: 'Client rendering', copy: 'Vue 3, TypeScript, Vite, and Tailwind, with local shadcn-vue components.', href: '/frontend/vue-starter-kit' },
  { name: 'React', id: 'react', model: 'Client rendering', copy: 'React, TypeScript, Vite, and Tailwind, with local shadcn/ui components.', href: '/frontend/react-starter-kit' },
  { name: 'templ + htmx', id: 'templ_htmx', model: 'Server rendering', copy: 'HTML rendered in Go, enhanced with htmx, Tailwind, and Basecoat components.', href: '/frontend/templ-htmx-starter-kit' }
]

// copyCommand copies the wizard entry point shown in the panel.
async function copyCommand(command) {
  try {
    await navigator.clipboard.writeText(command)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = command
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    textarea.remove()
  }
  copied.value = command
  window.clearTimeout(copyResetTimer)
  copyResetTimer = window.setTimeout(() => { copied.value = '' }, 1600)
}

onBeforeUnmount(() => window.clearTimeout(copyResetTimer))
</script>

<template>
  <section class="gf-kits-block gf-kits-options">
    <div class="gf-kits-heading">
      <div>
        <p class="gf-kits-eyebrow">Choose your frontend</p>
        <h2>Different tools.<br><em>The same Go foundation</em></h2>
      </div>
      <div class="gf-kits-command">
        <p>Choose your kit in the wizard. Start development from your new project.</p>
        <div v-for="command in ['forj new', 'forj dev']" :key="command"><span aria-hidden="true">$</span><code>{{ command }}</code><button type="button" :aria-label="`Copy ${command}`" @click="copyCommand(command)">{{ copied === command ? 'Copied' : 'Copy' }}</button></div>
        <span class="gf-kits-command__status" role="status">{{ copied ? 'Command copied to clipboard.' : '' }}</span>
      </div>
    </div>
    <div class="gf-kits-choices">
      <a v-for="kit in kits" :key="kit.id" :href="kit.href" class="gf-kits-choice" :data-kit="kit.id">
        <div class="gf-kits-choice__heading">
          <FrameworkBlockIcon :framework="kit.id === 'templ_htmx' ? 'templ' : kit.id" />
          <div><h3>{{ kit.name }}</h3><span class="gf-kits-choice__model">{{ kit.model }}</span></div>
        </div>
        <p>{{ kit.copy }}</p>
        <span class="gf-kits-choice__link">{{ 'Explore ' + kit.name }} <span aria-hidden="true">↗</span></span>
      </a>
    </div>
    <div class="gf-kits-own"><span>Already have a frontend?</span><a href="/getting-started/starter-kits">Bring your own →</a></div>
    <p class="gf-kits-option-note">Enable Auth for Vue and React authentication. Include the component gallery, or choose a smaller shell. <a href="/getting-started/starter-kits#select-a-kit">See the setup choices →</a></p>
  </section>
</template>
