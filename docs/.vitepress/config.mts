import { defineConfig } from 'vitepress'

const headingRegex = /<h(\d*).*?>(.*?<a.*? href="#.*?".*?>.*?<\/a>)<\/h\1>/gi
const headingContentRegex = /(.*?)<a.*? href="#(.*?)".*?>.*?<\/a>/i
const h1Regex = /<h1[^>]*>(.*?)<\/h1>/i

const clearHtmlTags = (value: string) => value
  .replace(/<[^>]*>/g, '')
  .replace(/&ZeroWidthSpace;/gi, '')
  .replace(/\u200b/g, '')
const normalizeTitle = (value: string) => clearHtmlTags(value).trim().toLowerCase()

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
const siteDescription = 'The composable stack for building with Go. Build Go applications with one cohesive runtime, explicit wiring, local-first drivers, and production-ready primitives.'
const docsVersion = 'v0.9'
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

const pageUrl = (page: string) => {
  const cleanPath = page
    .replace(/(^|\/)index\.md$/, '$1')
    .replace(/\.md$/, '')
    .replace(/\/+$/, '')

  return `${siteUrl}${cleanPath ? `/${cleanPath}` : '/'}`
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "GoForj",
  description: siteDescription,
  cleanUrls: true,
  appearance: 'force-dark',
  scrollOffset: {
    selector: '.VPNav',
    padding: 8
  },
  rewrites: {
    'libraries/collection.md': 'collection.md',
    'libraries/strings.md': 'strings.md',
    'libraries/web.md': 'web.md',
    'libraries/httpx.md': 'httpx.md',
    'libraries/mail.md': 'mail.md',
    'libraries/metrics.md': 'metrics.md',
    'libraries/execx.md': 'execx.md',
    'libraries/godump.md': 'godump.md',
    'libraries/env.md': 'env.md',
    'libraries/scheduler.md': 'scheduler.md',
    'libraries/queue.md': 'queue.md',
    'libraries/events.md': 'events.md',
    'libraries/cache.md': 'cache.md',
    'libraries/crypt.md': 'crypt.md',
    'libraries/storage.md': 'storage.md',
    'libraries/wire.md': 'wire.md'
  },

  head: [
    searchHydrationHead,
    codeVariantHead,
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

  transformHead({ page, title, description }) {
    const socialTitle = title || 'GoForj'
    const socialDescription = description || siteDescription

    return [
      ['link', { rel: 'canonical', href: pageUrl(page) }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:site_name', content: 'GoForj' }],
      ['meta', { property: 'og:title', content: socialTitle }],
      ['meta', { property: 'og:description', content: socialDescription }],
      ['meta', { property: 'og:url', content: pageUrl(page) }],
      ['meta', { property: 'og:image', content: socialImage }],
      ['meta', { property: 'og:image:secure_url', content: socialImage }],
      ['meta', { property: 'og:image:type', content: 'image/jpeg' }],
      ['meta', { property: 'og:image:width', content: '1200' }],
      ['meta', { property: 'og:image:height', content: '630' }],
      ['meta', { property: 'og:image:alt', content: 'GoForj documentation preview' }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: socialTitle }],
      ['meta', { name: 'twitter:description', content: socialDescription }],
      ['meta', { name: 'twitter:image', content: socialImage }],
      ['meta', { name: 'twitter:image:alt', content: 'GoForj documentation preview' }]
    ]
  },

  themeConfig: {
    docsVersion,
    // https://vitepress.dev/reference/default-theme-config
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
      { text: 'Libraries', link: '/libraries/' },
      { text: 'Starter Kits', link: '/starter-kits' },
      { text: 'Blog', link: '/blog/' },
      { text: 'Reference', link: '/reference/' },
      {
        text: docsVersion,
        items: [
          { text: `${docsVersion} Current`, link: '/' },
          { text: 'Version Policy', link: '/versions/' }
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
          { text: 'Runtime Lifecycle', link: '/core/runtime-lifecycle' },
          { text: 'Runtime Topology', link: '/core/runtime-topology' },
          { text: 'Dependency Injection', link: '/core/dependency-injection' },
          { text: 'Providers', link: '/core/providers' },
          { text: 'Provider Patterns', link: '/core/provider-patterns' },
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
          { text: 'Commands', link: '/applications/commands' },
          { text: 'API Index', link: '/applications/api-index' },
          { text: 'OpenAPI', link: '/applications/openapi' }
        ]
      },
      {
        text: 'Security',
        items: [
          { text: 'Overview', link: '/security/' },
          { text: 'Auth', link: '/security/auth' }
        ]
      },
      {
        text: 'Frontend',
        items: [
          { text: 'Overview', link: '/frontend/' },
          { text: 'Vue Starter Kit', link: '/frontend/vue-starter-kit' }
        ]
      },
      {
        text: 'Data and Persistence',
        items: [
          { text: 'Overview', link: '/data/' },
          { text: 'Database Strategy', link: '/data/database-strategy' },
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
          { text: 'Reports Generate Job', link: '/scenarios/reports-generate-job' }
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
          { text: 'Standalone versus Distributed', link: '/operations/standalone-vs-distributed' },
          { text: 'Lazy Initialization', link: '/operations/lazy-initialization' },
          { text: 'Production Checklist', link: '/operations/production-checklist' }
        ]
      },
      {
        text: 'Developer Tools',
        items: [
          { text: 'Overview', link: '/developer-tools/' },
          { text: 'forj dev', link: '/developer-tools/forj-dev' }
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
          { text: 'Env', link: '/env' },
          { text: 'Crypt', link: '/crypt' },
          { text: 'HTTPX', link: '/httpx' },
          { text: 'ExecX', link: '/execx' },
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
          { text: `${docsVersion} Current`, link: '/versions/' }
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
