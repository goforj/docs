import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const decode = (s) => s.replaceAll('&amp;', '&').replaceAll('&quot;', '"')
const urls = [...fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]))

test('navbar links are not nested in the server-rendered HTML', () => {
  for (const route of ['index.html', 'versions/index.html', 'getting-started/quickstart.html']) {
    const html = fs.readFileSync(path.join(root, route), 'utf8')
    const navbar = html.match(/<header\b[^>]*class="VPNav"[\s\S]*?<\/header>/)?.[0]
    assert.ok(navbar, route)
    assert.match(navbar, /class="gf-docs-version"/, route)
    let insideLink = false
    for (const [tag] of navbar.matchAll(/<\/?a\b[^>]*>/g)) {
      if (tag.startsWith('</')) insideLink = false
      else {
        assert.equal(insideLink, false, `${route}: nested navbar link`)
        insideLink = true
      }
    }
  }
})

test('every sitemap URL matches its canonical and is indexable', () => {
  assert.ok(urls.length > 100)
  for (const url of urls) {
    const pathname = new URL(url).pathname
    const flat = path.join(root, `${pathname.slice(1)}.html`)
    const html = fs.readFileSync(fs.existsSync(flat) ? flat : path.join(root, pathname, 'index.html'), 'utf8')
    assert.equal(decode(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] || ''), url)
    assert.doesNotMatch(html, /<meta name="robots" content="[^"]*noindex/i, url)
  }
})

test('generated standalone library pages have one H1 and distinct titles', () => {
  const titles = new Set()
  for (const entry of fs.readdirSync(path.join(root, '..', '..', 'libraries'))) {
    if (!entry.endsWith('.md')) continue
    const source = fs.readFileSync(path.join(root, '..', '..', 'libraries', entry), 'utf8')
    if (!/^repoSlug:/m.test(source)) continue
    const route = entry.slice(0, -3)
    const html = fs.readFileSync(path.join(root, `${route}.html`), 'utf8')
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1, route)
    const title = html.match(/<title>(.*?)<\/title>/)?.[1]
    assert.match(title, /Library for Go/, route)
    assert.ok(!titles.has(title), route)
    titles.add(title)
  }
})
