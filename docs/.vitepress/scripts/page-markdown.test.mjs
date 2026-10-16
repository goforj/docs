import assert from 'node:assert/strict'
import test from 'node:test'
import { pageMarkdown, markdownPath } from '../page-markdown.mjs'

test('exports prose without frontmatter or page-only scripts and styles', () => {
  assert.equal(pageMarkdown('---\ntitle: App\n---\n# App\n\n<script setup>\nconst app = 1\n</script>\n<style scoped>p { color: red }</style>\nText.'), '# App\n\nText.\n')
})

test('preserves script and style examples inside either Markdown fence', () => {
  const source = '# Example\n\n````html\n<script>example()</script>\n```\n````\n\n~~~html\n<style>example</style>\n~~~\n'
  assert.equal(pageMarkdown(source), source)
})

test('exports rewritten libraries and section indexes to distinct paths', () => {
  assert.equal(markdownPath('web.md'), 'markdown/web.md')
  assert.equal(markdownPath('core/index.md'), 'markdown/core/index.md')
})
