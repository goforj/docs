<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()

const repoUrl = computed(() => String(frontmatter.value?.repoUrl || '').trim())
const repoSlug = computed(() => String(frontmatter.value?.repoSlug || '').trim())

const githubRepo = computed(() => {
  const url = repoUrl.value
  if (!url) return null
  const match = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)\/?$/i)
  if (!match) return null
  return { owner: match[1], repo: match[2] }
})

const shouldShow = computed(() => Boolean(repoUrl.value && repoSlug.value && githubRepo.value))
</script>

<template>
  <div v-if="shouldShow" class="gf-library-repo-header">
    <span class="gf-library-repo-cta-text">Support this library</span>
    <a class="gf-library-repo-star-link" :href="repoUrl" target="_blank" rel="noreferrer">
      <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
      </svg>
      <span>Star on GitHub</span>
    </a>
  </div>
</template>
