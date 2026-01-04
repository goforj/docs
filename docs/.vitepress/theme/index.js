import DefaultTheme from 'vitepress/theme'
import GoForjExample from './components/GoForjExample.vue'
import './custom.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('GoForjExample', GoForjExample)
  }
}
