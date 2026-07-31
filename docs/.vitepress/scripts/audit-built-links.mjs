import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const distRoot = path.join(docsRoot, '.vitepress', 'dist')
const htmlFiles = []

const visit = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) visit(absolutePath)
    else if (entry.name.endsWith('.html')) htmlFiles.push(absolutePath)
  }
}
visit(distRoot)

const htmlByPath = new Map()
for (const absolutePath of htmlFiles) {
  const relativePath = path.relative(distRoot, absolutePath).split(path.sep).join('/')
  const route = relativePath === 'index.html'
    ? '/'
    : `/${relativePath.replace(/\/index\.html$/, '/').replace(/\.html$/, '')}`
  htmlByPath.set(route.replace(/\/$/, '') || '/', fs.readFileSync(absolutePath, 'utf8'))
}

const failures = []
for (const [sourceRoute, source] of htmlByPath) {
  for (const match of source.matchAll(/\bhref="([^"]+)"/g)) {
    const href = match[1].replace(/&amp;/g, '&')
    if (/^(?:https?:|mailto:|tel:|javascript:)/i.test(href)) continue
    const resolved = new URL(href, `https://docs.goforj.dev${sourceRoute === '/' ? '/' : `${sourceRoute}/`}`)
    const targetRoute = resolved.pathname.replace(/\/$/, '') || '/'
    const target = htmlByPath.get(targetRoute)
    if (!target) {
      if (!path.posix.extname(resolved.pathname) && !resolved.pathname.startsWith('/assets/')) {
        failures.push(`${sourceRoute}: ${href} points to missing page ${targetRoute}`)
      }
      continue
    }
    const anchor = decodeURIComponent(resolved.hash.slice(1))
    if (!anchor) continue
    const htmlAnchor = anchor
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    const escaped = htmlAnchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (!new RegExp(`\\bid="${escaped}"(?:\\s|>)`).test(target)) {
      failures.push(`${sourceRoute}: ${href} points to missing anchor #${anchor}`)
    }
  }
}

if (failures.length > 0) {
  console.error('Built-link audit failed:')
  for (const failure of [...new Set(failures)].sort()) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`built-link audit passed (${htmlByPath.size} rendered pages checked).`)
