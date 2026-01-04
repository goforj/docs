import { defineConfig } from 'vitepress'

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
      provider: 'local'
    },
    logo: '../assets/goforj-letters.png',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Libraries', link: '/collection' },
      { text: 'What is GoForj?', link: '/about' }
    ],

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
