import { defineConfig } from 'vitepress'

const headingRegex = /<h(\d*).*?>(.*?<a.*? href="#.*?".*?>.*?<\/a>)<\/h\1>/gi
const headingContentRegex = /(.*?)<a.*? href="#(.*?)".*?>.*?<\/a>/i
const h1Regex = /<h1[^>]*>(.*?)<\/h1>/i

const clearHtmlTags = (value: string) => value.replace(/<[^>]*>/g, '')

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
    if (pageTitle && titles[0] !== pageTitle) {
      titles = [pageTitle, ...titles]
    }

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

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "GoForj",
  description: "Build faster. Ship smarter. Go development tools forged for productivity.",
  appearance: 'force-dark',
  rewrites: {
    'libraries/collection.md': 'collection.md'
  },

  head: [['link', { rel: 'icon', href: '../assets/goforj-hammer.png' }]],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: 'local',
      options: {
        _render: (src, env, md) => {
          const frontmatterMatch = src.match(/^---\n[\s\S]*?\n---\n/)
          let title = ''
          if (frontmatterMatch) {
            const titleMatch = frontmatterMatch[0].match(/^title:\s*(.+)$/m)
            if (titleMatch) {
              title = titleMatch[1].trim()
            }
          }
          if (!title) {
            const file = (env?.relativePath || '').replace(/\\/g, '/').split('/').pop() || ''
            const base = file.replace(/\.md$/, '')
            title = base === 'index' ? '' : base
          }
          if (title) {
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
    logo: '../assets/goforj-letters.png',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Libraries', link: '/collection' },
      { text: 'What is GoForj?', link: '/about' }
    ],

    outline: [1, 3],

    sidebar: [
      {
        text: 'Docs',
        items: [
          { text: 'collection', link: '/collection' },
          { text: 'About', link: '/about' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
