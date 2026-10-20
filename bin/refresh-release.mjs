#!/usr/bin/env node
// Refresh the published framework version during documentation packaging.
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

export function publishedVersion(release) {
  if (release.draft || release.prerelease || !/^v\d+\.\d+\.\d+$/.test(release.tag_name || '')) {
    throw new Error('Expected a stable published framework release')
  }
  return release.tag_name
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'GoForj-Docs' }
  if (process.env.GH_TOKEN) headers.Authorization = `Bearer ${process.env.GH_TOKEN}`
  const response = await fetch('https://api.github.com/repos/goforj/goforj/releases/latest', {
    headers, signal: AbortSignal.timeout(30_000)
  })
  if (!response.ok) throw new Error(`Release metadata request failed: HTTP ${response.status}`)
  const latest = publishedVersion(await response.json())
  const destination = new URL('../docs/.vitepress/data/release.json', import.meta.url)
  await fs.writeFile(destination, `${JSON.stringify({ latest }, null, 2)}\n`)
  console.log(`Framework release metadata: ${latest}`)
}
