import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const librariesRoot = path.join(docsRoot, 'libraries')
const distRoot = path.join(docsRoot, '.vitepress', 'dist')

const decodeHtmlEntities = (value) => value
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')

const imageSrc = (source) => {
  const introEnd = source.search(/^##\s/m)
  const intro = introEnd === -1 ? source : source.slice(0, introEnd)
  const htmlImage = intro.match(/<img\b[^>]*\bsrc=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i)
  return decodeHtmlEntities(htmlImage?.slice(1).find(Boolean)?.trim() || '')
}

const metaContent = (html, key, value) => {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = new Map()
    for (const attribute of match[0].matchAll(/([\w:-]+)="([^"]*)"/g)) {
      attributes.set(attribute[1], decodeHtmlEntities(attribute[2]))
    }
    if (attributes.get(key) === value) return attributes.get('content') || ''
  }
  return ''
}

const libraryFiles = fs.readdirSync(librariesRoot)
  .filter((name) => name.endsWith('.md'))
  .sort()

for (const name of libraryFiles) {
  const source = fs.readFileSync(path.join(librariesRoot, name), 'utf8')
  if (!/^repoSlug:\s*\S+/m.test(source)) continue

  test(`${name} publishes its library logo as social metadata`, () => {
    const expectedLogo = imageSrc(source)
    assert.ok(expectedLogo, `${name} must provide a leading library logo`)

    const outputName = `${path.basename(name, '.md')}.html`
    const outputPath = path.join(distRoot, outputName)
    assert.ok(fs.existsSync(outputPath), `${outputName} must exist in the built site`)

    const html = fs.readFileSync(outputPath, 'utf8')
    assert.equal(metaContent(html, 'property', 'og:image'), expectedLogo)
    assert.equal(metaContent(html, 'property', 'og:image:secure_url'), expectedLogo)
    assert.equal(metaContent(html, 'name', 'twitter:image'), expectedLogo)
  })
}

test('performance publishes its dedicated benchmark card instead of the first library logo', () => {
  const html = fs.readFileSync(path.join(distRoot, 'performance.html'), 'utf8')
  const imagePath = '/assets/goforj-performance-og-20261017-r2.png'
  const expected = `https://goforj.dev${imagePath}`
  assert.equal(metaContent(html, 'property', 'og:image'), expected)
  assert.equal(metaContent(html, 'property', 'og:image:secure_url'), expected)
  assert.equal(metaContent(html, 'name', 'twitter:image'), expected)
  assert.equal(metaContent(html, 'name', 'twitter:card'), 'summary_large_image')
  assert.equal(metaContent(html, 'property', 'og:image:width'), '2400')
  assert.equal(metaContent(html, 'property', 'og:image:height'), '1260')
  assert.ok(metaContent(html, 'property', 'og:image:alt').includes('performance benchmarks'))
  const png = fs.readFileSync(path.join(distRoot, imagePath.slice(1)))
  assert.equal(png.readUInt32BE(16), 2400)
  assert.equal(png.readUInt32BE(20), 1260)
})
