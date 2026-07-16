import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'

const lucideIconKeys = [
  'activity',
  'app-window',
  'blocks',
  'brain-circuit',
  'clock',
  'database',
  'database-zap',
  'file',
  'git-branch',
  'globe',
  'hard-drive',
  'key-round',
  'mail',
  'package-2',
  'radar',
  'radio',
  'rows-3',
  'server',
  'shield-check',
  'terminal',
  'whole-word'
]

const simpleIconKeys = [
  'vuedotjs',
  'react',
  'openai',
  'anthropic',
  'claude',
  'googlegemini',
  'githubcopilot',
  'redis',
  'natsdotio',
  'apachekafka',
  'rabbitmq',
  'amazonsqs',
  'buffer',
  'sqlite',
  'postgresql',
  'mariadb',
  'amazondynamodb',
  'files',
  'googlecloud',
  'dropbox',
  'rclone',
  'filezilla',
  'gnubash',
  'ollama'
]

type IconCollection = {
  icons: Record<string, { body: string }>
}

const iconSubset = (source: IconCollection, keys: string[]) => Object.fromEntries(
  keys.flatMap((key) => source.icons[key] ? [[key, source.icons[key].body]] : [])
)

const iconSubsetPlugin = {
  name: 'goforj-icon-subset',
  resolveId(id: string) {
    return id === 'virtual:goforj-icons' ? '\0virtual:goforj-icons' : undefined
  },
  load(id: string) {
    if (id !== '\0virtual:goforj-icons') return undefined

    const lucide = JSON.parse(fs.readFileSync(new URL('../node_modules/@iconify-json/lucide/icons.json', import.meta.url), 'utf8')) as IconCollection
    const simple = JSON.parse(fs.readFileSync(new URL('../node_modules/@iconify-json/simple-icons/icons.json', import.meta.url), 'utf8')) as IconCollection
    return [
      `export const lucideIconBodies = ${JSON.stringify(iconSubset(lucide, lucideIconKeys))}`,
      `export const simpleIconBodies = ${JSON.stringify(iconSubset(simple, simpleIconKeys))}`
    ].join('\n')
  }
}

const headingRegex = /<h(\d*).*?>(.*?<a.*? href="#.*?".*?>.*?<\/a>)<\/h\1>/gi
const headingContentRegex = /(.*?)<a.*? href="#(.*?)".*?>.*?<\/a>/i
const h1Regex = /<h1[^>]*>(.*?)<\/h1>/i

const clearHtmlTags = (value: string) => value
  .replace(/<[^>]*>/g, '')
  .replace(/&ZeroWidthSpace;/gi, '')
  .replace(/\u200b/g, '')
const normalizeTitle = (value: string) => clearHtmlTags(value).trim().toLowerCase()
const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
const decodeHtmlEntities = (value: string) => value
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'")
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
const normalizeText = (value: string) => decodeHtmlEntities(clearHtmlTags(value))
  .replace(/\s+/g, ' ')
  .trim()
const truncateDescription = (value: string, max = 180) => {
  const text = normalizeText(value)
  if (text.length <= max) return text
  const trimmed = text.slice(0, max + 1)
  const sentence = trimmed.match(/^(.+?[.!?])\s/)
  if (sentence && sentence[1].length >= 72) return sentence[1]
  const wordBoundary = trimmed.lastIndexOf(' ')
  return `${trimmed.slice(0, wordBoundary > 100 ? wordBoundary : max).trim()}...`
}

const getPageTitle = (path: string, html: string) => {
  const h1Match = h1Regex.exec(html)
  let pageTitle = h1Match ? clearHtmlTags(h1Match[1]).trim() : ''
  if (!pageTitle) {
    const file = path.replace(/\\/g, '/').split('/').pop() || ''
    const base = file.replace(/\.md$/, '')
    pageTitle = base === 'index' ? '' : base
  }
  return pageTitle ? pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1) : ''
}

const splitIntoSections = (path: string, html: string) => {
  const pageTitle = getPageTitle(path, html)
  const result = html.split(headingRegex)
  result.shift()
  let parentTitles: string[] = []
  const sections: { anchor: string; titles: string[]; text: string }[] = []
  for (let i = 0; i < result.length; i += 3) {
    const level = parseInt(result[i], 10) - 1
    const heading = result[i + 1]
    const headingResult = headingContentRegex.exec(heading)
    const title = clearHtmlTags(headingResult?.[1] ?? '').trim()
    const anchor = headingResult?.[2] ?? ''
    const content = result[i + 2]
    if (!title || !content) continue

    let titles = parentTitles.slice(0, level)
    titles[level] = title
    titles = titles.filter(Boolean)
    if (pageTitle && normalizeTitle(titles[0] || '') !== normalizeTitle(pageTitle)) {
      titles = [pageTitle, ...titles]
    }
    const seen = new Set<string>()
    titles = titles.filter((value) => {
      const key = normalizeTitle(value)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    sections.push({ anchor, titles, text: clearHtmlTags(content) })
    if (level === 0) {
      parentTitles = [title]
    } else {
      parentTitles[level] = title
    }
  }

  if (pageTitle) {
    sections.unshift({
      anchor: '',
      titles: [pageTitle],
      text: clearHtmlTags(html)
    })
  }

  return sections
}

const gaMeasurementId = (process.env.GA_MEASUREMENT_ID || '')
  .trim()
  .replace(/^['"]+|['"]+$/g, '')
const isProd = process.env.NODE_ENV === 'production'
const siteUrl = (process.env.SITE_URL || 'https://goforj.dev').replace(/\/+$/, '')
const siteDescription = 'The composable stack for building with Go. Build Go applications with one cohesive application model, explicit wiring, local-first drivers, and production-ready primitives.'
const docsVersion = 'Unreleased'
const faviconVersion = '20260526'
const socialImage = process.env.SOCIAL_IMAGE_URL || `${siteUrl}/assets/goforj-og-20260527.jpg`
const socialIcon = process.env.SOCIAL_ICON_URL || `${siteUrl}/apple-touch-icon.png?v=${faviconVersion}`
const faviconHref = (path: string) => `${path}?v=${faviconVersion}`
const analyticsHead = (isProd && gaMeasurementId)
  ? [
      ['script', { async: '', src: `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}` }],
      ['script', {}, `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaMeasurementId}');`]
    ]
  : []

const deferredHashHead: [string, Record<string, string>, string] = ['script', {}, `(function(){try{if(!location.hash)return;var key='__goforjDeferredHash';var path=location.pathname+location.search;sessionStorage.setItem(key,JSON.stringify({path:path,hash:location.hash}));history.replaceState(history.state||{},'',path);}catch(e){}})();`]
const codeVariantHead: [string, Record<string, string>, string] = ['script', {}, `(function(){try{var key='goforjCodeVariant';var allowed={ink:1,obsidian:1,terminal:1,'desert-dusk':1,'retro-amber-crt':1,'sepia-noir':1,'mono-slate':1,paper:1,chrome:1,'rose-metal':1,'midnight-gold':1,halo:1,glass:1,amber:1,forest:1,sunset:1};var variant=localStorage.getItem(key)||'ink';document.documentElement.dataset.gfCodeVariant=allowed[variant]?variant:'ink';}catch(e){document.documentElement.dataset.gfCodeVariant='ink';}})();`]
const searchHydrationHead: [string, Record<string, string>, string] = ['style', {}, `html:not(.gf-search-ready) .VPNavBarSearch{opacity:0}html.gf-search-ready .VPNavBarSearch{opacity:1;transition:opacity .12s ease}`]
const motionPreferenceHead: [string, Record<string, string>, string] = ['script', {}, `(function(){try{var v=localStorage.getItem('goforjMotion');if(v==='on'||v==='reduced'){document.documentElement.dataset.gfMotion=v;}}catch(e){}})();`]

const pageUrl = (page: string) => {
  const cleanPath = page
    .replace(/(^|\/)index\.md$/, '$1')
    .replace(/\.md$/, '')
    .replace(/\/+$/, '')

  return `${siteUrl}${cleanPath ? `/${cleanPath}` : '/'}`
}

const absoluteUrl = (value: string, page: string) => {
  if (!value) return ''
  if (/^(https?:)?\/\//i.test(value)) {
    return value.startsWith('//') ? `https:${value}` : value
  }
  if (value.startsWith('/')) return `${siteUrl}${value}`

  const cleanPage = page.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
  const basePath = cleanPage.includes('/') ? cleanPage.split('/').slice(0, -1).join('/') : ''
  const resolved = path.posix.normalize(`/${basePath}/${value}`)
  return `${siteUrl}${resolved}`
}

const socialImageType = (value: string) => {
  const clean = value.split(/[?#]/, 1)[0].toLowerCase()
  if (clean.endsWith('.png')) return 'image/png'
  if (clean.endsWith('.webp')) return 'image/webp'
  if (clean.endsWith('.gif')) return 'image/gif'
  if (clean.endsWith('.svg')) return 'image/svg+xml'
  return 'image/jpeg'
}

const frontmatterString = (frontmatter: Record<string, unknown>, names: string[]) => {
  for (const name of names) {
    const value = frontmatter[name]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

const frontmatterNumber = (frontmatter: Record<string, unknown>, names: string[]) => {
  for (const name of names) {
    const value = frontmatter[name]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && /^\d+$/.test(value.trim())) return Number(value.trim())
  }
  return undefined
}

const deriveDescription = (content: string) => {
  const withoutNoise = content
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<pre\b[\s\S]*?<\/pre>/gi, '')
    .replace(/<table\b[\s\S]*?<\/table>/gi, '')
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, '')
  const paragraphMatches = withoutNoise.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi)
  for (const match of paragraphMatches) {
    const text = truncateDescription(match[1])
    if (text.length >= 50 && !/^documentation preview$/i.test(text)) return text
  }
  const fallback = truncateDescription(withoutNoise)
  return fallback.length >= 50 ? fallback : ''
}

const imageAltRegex = /alt=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i
const imageSrcRegex = /src=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i
const imageWidthRegex = /width=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i
const imageHeightRegex = /height=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i
const ignoredImagePattern = /(?:favicon|apple-touch-icon|web-app-manifest|goforj-v7|goforj-full|goforj-letters|goforj-hammer|logo(?:\.[a-z]+)?$)/i

const imageDimensions = (html: string) => {
  const width = html.match(imageWidthRegex)?.slice(1).find(Boolean)
  const height = html.match(imageHeightRegex)?.slice(1).find(Boolean)
  return {
    width: width && /^\d+$/.test(width) ? Number(width) : undefined,
    height: height && /^\d+$/.test(height) ? Number(height) : undefined
  }
}

const deriveImage = (content: string, page: string) => {
  const imageMatches = content.matchAll(/<img\b[^>]*>/gi)
  for (const match of imageMatches) {
    const img = match[0]
    const rawSrc = img.match(imageSrcRegex)?.slice(1).find(Boolean)?.trim() || ''
    if (!rawSrc || rawSrc.startsWith('data:')) continue
    const src = decodeHtmlEntities(rawSrc)
    if (ignoredImagePattern.test(src)) continue

    const rawAlt = img.match(imageAltRegex)?.slice(1).find(Boolean)?.trim() || ''
    return {
      url: absoluteUrl(src, page),
      alt: normalizeText(rawAlt) || 'GoForj documentation preview',
      ...imageDimensions(img)
    }
  }

  return { url: socialImage, alt: 'GoForj documentation preview', width: 1200, height: 630 }
}

const resolvePageSocialMetadata = (context: { page: string; description: string; content: string; pageData: { frontmatter?: Record<string, unknown> } }) => {
  const frontmatter = context.pageData.frontmatter || {}
  const frontmatterDescription = frontmatterString(frontmatter, ['description'])
  const socialDescription = frontmatterDescription || deriveDescription(context.content) || context.description || siteDescription
  const frontmatterImage = frontmatterString(frontmatter, ['image', 'ogImage', 'socialImage'])
  const image = frontmatterImage
    ? {
        url: absoluteUrl(frontmatterImage, context.page),
        alt: frontmatterString(frontmatter, ['imageAlt', 'ogImageAlt', 'socialImageAlt']) || 'GoForj documentation preview',
        width: frontmatterNumber(frontmatter, ['imageWidth', 'ogImageWidth', 'socialImageWidth']),
        height: frontmatterNumber(frontmatter, ['imageHeight', 'ogImageHeight', 'socialImageHeight'])
      }
    : deriveImage(context.content, context.page)

  return {
    description: socialDescription,
    image
  }
}

const libraryRewrites: Record<string, string> = {
  'libraries/collection.md': 'collection.md',
  'libraries/strings.md': 'strings.md',
  'libraries/web.md': 'web.md',
  'libraries/httpx.md': 'httpx.md',
  'libraries/mail.md': 'mail.md',
  'libraries/metrics.md': 'metrics.md',
  'libraries/execx.md': 'execx.md',
  'libraries/console.md': 'console.md',
  'libraries/godump.md': 'godump.md',
  'libraries/env.md': 'env.md',
  'libraries/scheduler.md': 'scheduler.md',
  'libraries/queue.md': 'queue.md',
  'libraries/events.md': 'events.md',
  'libraries/cache.md': 'cache.md',
  'libraries/crypt.md': 'crypt.md',
  'libraries/storage.md': 'storage.md',
  'libraries/wire.md': 'wire.md',
  'libraries/atlas.md': 'atlas.md'
}

const preloadBadgeImagePattern = /(?:shields\.io|pkg\.go\.dev\/badge|goreportcard\.com\/badge|codecov\.io\/[^\s)"']*badge|github\.com\/[^\s)"']*\/actions\/workflows\/[^\s)"']*badge)/i

const resolvePreloadImageUrl = (value: string, page: string) => {
  const src = decodeHtmlEntities(value.trim())
  if (!src || src.startsWith('data:')) return ''
  if (/^https?:\/\//i.test(src)) return src
  if (src.startsWith('//')) return `https:${src}`
  if (src.startsWith('/')) return src

  const route = page.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
  const routeDir = route.includes('/') ? route.split('/').slice(0, -1).join('/') : ''
  return path.posix.normalize(`/${routeDir}/${src}`)
}

const firstLibraryPreloadImage = (source: string, page: string) => {
  const file = new URL(`../${source}`, import.meta.url)
  if (!fs.existsSync(file)) return ''

  const markdown = fs.readFileSync(file, 'utf8')
  const firstSection = markdown.search(/^##\s/m)
  const intro = firstSection === -1 ? markdown : markdown.slice(0, firstSection)
  const candidates: { index: number; src: string }[] = []

  for (const match of intro.matchAll(/<img\b[^>]*>/gi)) {
    const src = match[0].match(imageSrcRegex)?.slice(1).find(Boolean)?.trim() || ''
    if (src) candidates.push({ index: match.index, src })
  }
  for (const match of intro.matchAll(/!\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g)) {
    candidates.push({ index: match.index, src: match[1] })
  }

  candidates.sort((left, right) => left.index - right.index)
  for (const candidate of candidates) {
    const src = resolvePreloadImageUrl(candidate.src, page)
    if (src && !preloadBadgeImagePattern.test(src)) return src
  }
  return ''
}

const pageImagePreloads = Object.fromEntries(
  Object.entries(libraryRewrites).flatMap(([source, page]) => {
    const src = firstLibraryPreloadImage(source, page)
    if (!src) return []
    const route = `/${page.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '').replace(/^\/+|\/+$/g, '')}`
    return [[route === '/' ? route : route.replace(/\/+$/, ''), [src]]]
  })
)

// --- llms.txt generation (https://llmstxt.org) ---
// Emits llms.txt (a linked index) and llms-full.txt (the full docs corpus)
// into the build output so AI tools can consume the docs directly.

const llmsSectionOrder = [
  'about.md',
  'versions/',
  'getting-started/',
  'cookbook.md',
  'drivers.md',
  'core/',
  'applications/',
  'data/',
  'async/',
  'security/',
  'frontend/',
  'starter-kits.md',
  'testing/',
  'scenarios/',
  'operations/',
  'developer-tools/',
  'libraries/',
  'reference/',
  'blog/'
]

const llmsSectionTitles: Record<string, string> = {
  'about.md': 'About',
  'versions/': 'Versions',
  'getting-started/': 'Getting Started',
  'cookbook.md': 'Cookbook',
  'drivers.md': 'Drivers',
  'core/': 'Core Concepts',
  'applications/': 'Building Applications',
  'data/': 'Data and Persistence',
  'async/': 'Async and Workflows',
  'security/': 'Security',
  'frontend/': 'Frontend',
  'starter-kits.md': 'Starter Kits',
  'testing/': 'Testing',
  'scenarios/': 'Verified Scenarios',
  'operations/': 'Operations',
  'developer-tools/': 'Developer Tools',
  'libraries/': 'Libraries',
  'reference/': 'Reference',
  'blog/': 'Blog'
}

const llmsOrderIndex = (rel: string) => {
  const index = llmsSectionOrder.findIndex((prefix) => rel === prefix || rel.startsWith(prefix))
  return index === -1 ? llmsSectionOrder.length : index
}

const collectMarkdownFiles = (dir: string, base = ''): string[] => {
  const files: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
    const rel = base ? `${base}/${entry.name}` : entry.name
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(full, rel))
    } else if (entry.name.endsWith('.md')) {
      files.push(rel)
    }
  }
  return files
}

const llmsFrontmatterField = (raw: string, field: string): string => {
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return ''
  const line = match[1].split('\n').find((entry) => entry.startsWith(`${field}:`))
  if (!line) return ''
  return line.slice(field.length + 1).trim().replace(/^['"]+|['"]+$/g, '')
}

const llmsPageTitleFromBody = (raw: string): string => {
  const heading = raw.match(/^# (.+)$/m)
  return heading ? heading[1].trim() : ''
}

const llmsStripContent = (raw: string): string => {
  let out = raw.replace(/^---\n[\s\S]*?\n---\n?/, '')
  out = out.replace(/<script\b[\s\S]*?<\/script>\n?/gi, '')
  out = out.replace(/<style\b[\s\S]*?<\/style>\n?/gi, '')
  return out.trim()
}

const llmsPageUrl = (rel: string): string => {
  const rewritten = libraryRewrites[rel] || rel
  return pageUrl(rewritten)
}

async function generateLlmsFiles(siteConfig: { srcDir: string; outDir: string }) {
  const files = collectMarkdownFiles(siteConfig.srcDir)
    .filter((rel) => rel !== 'index.md')
    .sort((a, b) => {
      const orderDelta = llmsOrderIndex(a) - llmsOrderIndex(b)
      if (orderDelta !== 0) return orderDelta
      const aKey = a.endsWith('index.md') ? '' : a
      const bKey = b.endsWith('index.md') ? '' : b
      return aKey.localeCompare(bKey)
    })

  const preamble = [
    '# GoForj',
    '',
    `> ${siteDescription}`,
    '',
    'GoForj renders complete Go applications from selected components: HTTP services, CLI commands, queues, events, a scheduler, database, cache, storage, mail, auth, and metrics. Generated code is ordinary Go owned by the application, wired with compile-time dependency injection. The stack is built from standalone libraries that are each useful without the framework.',
    ''
  ].join('\n')

  const indexLines: string[] = [preamble]
  const fullChunks: string[] = [preamble]
  let currentSection = ''

  for (const rel of files) {
    const raw = fs.readFileSync(path.join(siteConfig.srcDir, rel), 'utf-8')
    const title = llmsFrontmatterField(raw, 'title') || llmsPageTitleFromBody(raw) || rel
    const description = llmsFrontmatterField(raw, 'description')
    const url = llmsPageUrl(rel)

    const sectionKey = llmsSectionOrder[llmsOrderIndex(rel)] || 'other'
    if (sectionKey !== currentSection) {
      if (currentSection) indexLines.push('')
      currentSection = sectionKey
      indexLines.push(`## ${llmsSectionTitles[sectionKey] || 'Other'}`, '')
    }
    indexLines.push(`- [${title}](${url})${description ? `: ${description}` : ''}`)

    const body = llmsStripContent(raw)
    if (body) {
      fullChunks.push(`---\n\n# ${title}\n\nURL: ${url}\n\n${body}\n`)
    }
  }

  fs.writeFileSync(path.join(siteConfig.outDir, 'llms.txt'), indexLines.join('\n') + '\n')
  fs.writeFileSync(path.join(siteConfig.outDir, 'llms-full.txt'), fullChunks.join('\n') + '\n')
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "GoForj",
  description: siteDescription,
  cleanUrls: true,
  appearance: 'force-dark',
  vite: {
    plugins: [iconSubsetPlugin],
    build: {
      // The generated local-search index is intentionally the largest chunk; this budget still flags growth beyond the current corpus.
      chunkSizeWarningLimit: 1600
    }
  },
  scrollOffset: {
    selector: '.VPNav',
    padding: 8
  },
  markdown: {
    config(md) {
      const defaultFence = md.renderer.rules.fence
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        const info = token.info.trim().split(/\s+/)[0]
        if (info === 'mermaid') {
          return `<pre class="gf-mermaid mermaid">${escapeHtml(token.content)}</pre>`
        }
        return defaultFence ? defaultFence(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options)
      }

      const defaultTableOpen = md.renderer.rules.table_open
      const defaultTableClose = md.renderer.rules.table_close
      md.renderer.rules.table_open = (tokens, idx, options, env, self) => {
        const table = defaultTableOpen
          ? defaultTableOpen(tokens, idx, options, env, self)
          : self.renderToken(tokens, idx, options)
        return `<div class="gf-table-scroll" tabindex="0">\n${table.replace(' tabindex="0"', '')}`
      }
      md.renderer.rules.table_close = (tokens, idx, options, env, self) => {
        const table = defaultTableClose
          ? defaultTableClose(tokens, idx, options, env, self)
          : self.renderToken(tokens, idx, options)
        return `${table}</div>\n`
      }
    }
  },
  rewrites: libraryRewrites,

  sitemap: {
    hostname: siteUrl
  },

  buildEnd: generateLlmsFiles,

  head: [
    searchHydrationHead,
    codeVariantHead,
    motionPreferenceHead,
    deferredHashHead,
    ['link', { rel: 'icon', type: 'image/png', sizes: '180x180', href: socialIcon }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '96x96', href: socialIcon }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: socialIcon }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: socialIcon }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: socialIcon }],
    ['link', { rel: 'manifest', href: faviconHref('/site.webmanifest') }],
    ['link', { rel: 'shortcut icon', type: 'image/png', href: socialIcon }],
    ...analyticsHead
  ],

  transformHead(context) {
    const { page, title } = context
    const socialTitle = title || 'GoForj'
    const socialMeta = resolvePageSocialMetadata(context)
    const socialDescription = socialMeta.description
    const socialImageUrl = socialMeta.image.url
    const socialImageAlt = socialMeta.image.alt
    const preloadRoute = `/${page.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '').replace(/^\/+|\/+$/g, '')}`
    const preloadImage = pageImagePreloads[preloadRoute]?.[0]
    const imageHead = [
      ['meta', { property: 'og:image', content: socialImageUrl }],
      ['meta', { property: 'og:image:secure_url', content: socialImageUrl }],
      ['meta', { property: 'og:image:type', content: socialImageType(socialImageUrl) }]
    ]

    if (socialMeta.image.width) {
      imageHead.push(['meta', { property: 'og:image:width', content: String(socialMeta.image.width) }])
    }

    if (socialMeta.image.height) {
      imageHead.push(['meta', { property: 'og:image:height', content: String(socialMeta.image.height) }])
    }

    return [
      ['link', { rel: 'canonical', href: pageUrl(page) }],
      ...(preloadImage ? [['link', { rel: 'preload', as: 'image', href: preloadImage, fetchpriority: 'high' }]] : []),
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:site_name', content: 'GoForj' }],
      ['meta', { property: 'og:title', content: socialTitle }],
      ['meta', { property: 'og:description', content: socialDescription }],
      ['meta', { property: 'og:url', content: pageUrl(page) }],
      ...imageHead,
      ['meta', { property: 'og:image:alt', content: socialImageAlt }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: socialTitle }],
      ['meta', { name: 'twitter:description', content: socialDescription }],
      ['meta', { name: 'twitter:image', content: socialImageUrl }],
      ['meta', { name: 'twitter:image:alt', content: socialImageAlt }]
    ]
  },

  themeConfig: {
    docsVersion,
    pageImagePreloads,
    // https://vitepress.dev/reference/default-theme-config
    editLink: {
      pattern: 'https://github.com/goforj/docs/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },
    search: {
      provider: 'local',
      options: {
        _render: (src, env, md) => {
          const frontmatterMatch = src.match(/^---\n[\s\S]*?\n---\n?/)
          let title = ''
          let noAutoTitle = false
          if (frontmatterMatch) {
            noAutoTitle = /^noAutoTitle:\s*true\s*$/m.test(frontmatterMatch[0])
            const titleMatch = frontmatterMatch[0].match(/^title:\s*(.+)$/m)
            if (titleMatch) {
              title = titleMatch[1].trim()
            }
            src = src.slice(frontmatterMatch[0].length)
          }
          if (!title) {
            const file = (env?.relativePath || '').replace(/\\/g, '/').split('/').pop() || ''
            const base = file.replace(/\.md$/, '')
            title = base === 'index' ? '' : base
          }
          if (title && !noAutoTitle) {
            title = title.charAt(0).toUpperCase() + title.slice(1)
            src = `# ${title}\n\n${src}`
          }
          return md.render(src, env)
        },
        miniSearch: {
          _splitIntoSections: splitIntoSections
        }
      }
    },
    logo: '/assets/goforj-v7.png',

    nav: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Overview', link: '/getting-started/' },
          { text: 'Quickstart', link: '/getting-started/quickstart' },
          { text: 'Cookbook', link: '/cookbook' },
          { text: 'What is GoForj?', link: '/about' }
        ]
      },
      { text: 'Core Concepts', link: '/core/' },
      {
        text: 'Build',
        items: [
          { text: 'Applications', link: '/applications/' },
          { text: 'Runnable Scenarios', link: '/scenarios/' },
          { text: 'Data and Persistence', link: '/data/' },
          { text: 'Security', link: '/security/' },
          { text: 'Frontend', link: '/frontend/' },
          { text: 'Testing', link: '/testing/' }
        ]
      },
      {
        text: 'Runtime',
        items: [
          { text: 'Async', link: '/async/' },
          { text: 'Operations', link: '/operations/' },
          { text: 'Developer Tools', link: '/developer-tools/' }
        ]
      },
      {
        text: 'Libraries',
        items: [
          { text: 'Overview', link: '/libraries/' },
          { text: 'Drivers', link: '/drivers' }
        ]
      },
      { text: 'Starter Kits', link: '/starter-kits' },
      { text: 'Blog', link: '/blog/' },
      { text: 'Reference', link: '/reference/' },
      {
        text: docsVersion,
        items: [
          { text: 'Active development', link: '/' },
          { text: 'Latest tag v0.20.0', link: '/versions/changelog' },
          { text: 'Version Policy', link: '/versions/' },
          { text: 'Changelog', link: '/versions/changelog' }
        ]
      }
    ],

    outline: [1, 3],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Overview', link: '/getting-started/' },
          { text: 'Quickstart', link: '/getting-started/quickstart' },
          { text: 'Cookbook', link: '/cookbook' },
          { text: 'Project Structure', link: '/getting-started/project-structure' },
          { text: 'Configuration', link: '/getting-started/configuration' },
          { text: 'Starter Kits', link: '/getting-started/starter-kits' }
        ]
      },
      {
        text: 'Core Concepts',
        items: [
          { text: 'Overview', link: '/core/' },
          { text: 'App', link: '/core/app' },
          { text: 'Apps', link: '/core/apps' },
          { text: 'Runtime Lifecycle', link: '/core/runtime-lifecycle' },
          { text: 'Runtime Topology', link: '/core/runtime-topology' },
          { text: 'Dependency Injection', link: '/core/dependency-injection' },
          { text: 'Providers', link: '/core/providers' },
          { text: 'Provider Patterns', link: '/core/provider-patterns' },
          { text: 'Make Commands', link: '/core/make-commands' },
          { text: 'Organizing Generated Code', link: '/core/organizing-generated-code' },
          { text: 'Naming Conventions', link: '/core/naming-conventions' },
          { text: 'Wiring Recipes', link: '/core/wiring-recipes' },
          { text: 'Reading Wire Errors', link: '/core/reading-wire-errors' },
          { text: 'Generated Components', link: '/core/generated-components' },
          { text: 'Generated Extension Points', link: '/core/generated-extension-points' },
          { text: 'Drivers and Adapters', link: '/core/drivers-and-adapters' },
          { text: 'Named Resources', link: '/core/named-resources' },
          { text: 'Code Generation', link: '/core/code-generation' },
          { text: 'Local-First Development', link: '/core/local-first-development' }
        ]
      },
      {
        text: 'Applications',
        items: [
          { text: 'Overview', link: '/applications/' },
          { text: 'HTTP Services', link: '/applications/http-services' },
          { text: 'Routes', link: '/applications/routes' },
          { text: 'Controllers', link: '/applications/controllers' },
          { text: 'Middleware', link: '/applications/middleware' },
          { text: 'Requests and Validation', link: '/applications/requests-validation' },
          { text: 'Responses and Errors', link: '/applications/responses-errors' },
          { text: 'Application Services', link: '/applications/services' },
          { text: 'HTTP Clients', link: '/applications/http-clients' },
          { text: 'Mail', link: '/applications/mail' },
          { text: 'Commands', link: '/applications/commands' },
          { text: 'API Index', link: '/applications/api-index' },
          { text: 'OpenAPI', link: '/applications/openapi' }
        ]
      },
      {
        text: 'Security',
        items: [
          { text: 'Overview', link: '/security/' },
          { text: 'Auth', link: '/security/auth' },
          { text: 'Sessions and Cookies', link: '/security/sessions-cookies' },
          { text: 'OAuth', link: '/security/oauth' },
          { text: 'Production Hardening', link: '/security/production-hardening' }
        ]
      },
      {
        text: 'Frontend',
        items: [
          { text: 'Overview', link: '/frontend/' },
          { text: 'Vue Starter Kit', link: '/frontend/vue-starter-kit' },
          { text: 'React Starter Kit', link: '/frontend/react-starter-kit' },
          { text: 'templ + htmx Starter Kit', link: '/frontend/templ-htmx-starter-kit' }
        ]
      },
      {
        text: 'Data and Persistence',
        items: [
          { text: 'Overview', link: '/data/' },
          { text: 'Database Strategy', link: '/data/database-strategy' },
          { text: 'Database Shell', link: '/data/database-shell' },
          { text: 'Migrations', link: '/data/migrations' },
          { text: 'Repositories', link: '/data/repositories' },
          { text: 'Transactions', link: '/data/transactions' },
          { text: 'Cache Patterns', link: '/data/cache-patterns' },
          { text: 'Storage Patterns', link: '/data/storage-patterns' },
          { text: 'Driver Selection', link: '/data/driver-selection' }
        ]
      },
      {
        text: 'Async and Workflows',
        items: [
          { text: 'Overview', link: '/async/' },
          { text: 'Events versus Queues', link: '/async/events-vs-queues' },
          { text: 'Queues', link: '/async/queues' },
          { text: 'Jobs', link: '/async/jobs' },
          { text: 'Workers', link: '/async/workers' },
          { text: 'Events', link: '/async/events' },
          { text: 'Event Subscribers', link: '/async/event-subscribers' },
          { text: 'Scheduler', link: '/async/scheduler' },
          { text: 'Retries and Idempotency', link: '/async/retries-idempotency' }
        ]
      },
      {
        text: 'Testing',
        items: [
          { text: 'Overview', link: '/testing/' },
          { text: 'Testing Overview', link: '/testing/overview' },
          { text: 'Unit Tests', link: '/testing/unit-tests' },
          { text: 'HTTP Tests', link: '/testing/http-tests' },
          { text: 'Command Tests', link: '/testing/command-tests' },
          { text: 'Job and Queue Tests', link: '/testing/job-queue-tests' },
          { text: 'Event Tests', link: '/testing/event-tests' },
          { text: 'Cache and Storage Tests', link: '/testing/cache-storage-tests' },
          { text: 'Integration Tests', link: '/testing/integration-tests' },
          { text: 'Rendered App Smoke Tests', link: '/testing/rendered-app-smoke-tests' }
        ]
      },
      {
        text: 'Runnable Scenarios',
        items: [
          { text: 'Overview', link: '/scenarios/' },
          { text: 'JSON API Route', link: '/scenarios/json-api-route' },
          { text: 'Cached User Profile', link: '/scenarios/cached-user-profile' },
          { text: 'File Upload To Storage', link: '/scenarios/file-upload-storage' },
          { text: 'Users Created Event', link: '/scenarios/users-created-event' },
          { text: 'Reports Generate Job', link: '/scenarios/reports-generate-job' },
          { text: 'Reports Daily Schedule', link: '/scenarios/reports-daily-schedule' },
          { text: 'Runtime Observability', link: '/scenarios/runtime-observability' }
        ]
      },
      {
        text: 'Operations',
        items: [
          { text: 'Overview', link: '/operations/' },
          { text: 'Deployment Basics', link: '/operations/deployment-basics' },
          { text: 'Runtime Processes', link: '/operations/runtime-processes' },
          { text: 'HTTP Server', link: '/operations/http-server' },
          { text: 'Queue Workers', link: '/operations/queue-workers' },
          { text: 'Scheduler Processes', link: '/operations/scheduler-processes' },
          { text: 'Health and Readiness', link: '/operations/health-readiness' },
          { text: 'Logging', link: '/operations/logging' },
          { text: 'Metrics', link: '/operations/metrics' },
          { text: 'Inspects', link: '/operations/inspects' },
          { text: 'Lighthouse', link: '/operations/lighthouse' },
          { text: 'Backup and Restore', link: '/operations/backups' },
          { text: 'Standalone versus Distributed', link: '/operations/standalone-vs-distributed' },
          { text: 'Production Checklist', link: '/operations/production-checklist' }
        ]
      },
      {
        text: 'Developer Tools',
        items: [
          { text: 'Overview', link: '/developer-tools/' },
          { text: 'Atlas', link: '/developer-tools/atlas' },
          { text: 'Atlas Debug Recipes', link: '/developer-tools/atlas-debug-recipes' },
          { text: 'forj dev', link: '/developer-tools/forj-dev' },
          { text: 'Opening Generated Files', link: '/developer-tools/editor-open' }
        ]
      },
      {
        text: 'Libraries',
        items: [
          { text: 'Overview', link: '/libraries/' },
          { text: 'Web', link: '/web' },
          { text: 'Cache', link: '/cache' },
          { text: 'Storage', link: '/storage' },
          { text: 'Queue', link: '/queue' },
          { text: 'Events', link: '/events' },
          { text: 'Mail', link: '/mail' },
          { text: 'Scheduler', link: '/scheduler' },
          { text: 'Metrics', link: '/metrics' },
          { text: 'Wire', link: '/wire' },
          { text: 'Atlas', link: '/atlas' },
          { text: 'Env', link: '/env' },
          { text: 'Crypt', link: '/crypt' },
          { text: 'HTTPX', link: '/httpx' },
          { text: 'ExecX', link: '/execx' },
          { text: 'Console', link: '/console' },
          { text: 'Collection', link: '/collection' },
          { text: 'Strings', link: '/strings' },
          { text: 'GoDump', link: '/godump' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Overview', link: '/reference/' },
          { text: 'CLI Reference', link: '/reference/cli' },
          { text: 'Environment Variables', link: '/reference/env-vars' },
          { text: 'Configuration Reference', link: '/reference/configuration' },
          { text: 'Generated Files', link: '/reference/generated-files' },
          { text: 'Generation Commands', link: '/reference/generation-commands' },
          { text: 'Errors', link: '/reference/errors' }
        ]
      },
      {
        text: 'Versions',
        items: [
          { text: 'Active development', link: '/versions/' },
          { text: 'Latest tag v0.20.0', link: '/versions/changelog' },
          { text: 'Changelog', link: '/versions/changelog' }
        ]
      },
      {
        text: 'About',
        items: [
          { text: 'What is GoForj?', link: '/about' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/goforj' }
    ]
  }
})
