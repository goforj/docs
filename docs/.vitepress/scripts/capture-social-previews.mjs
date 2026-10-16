import { chromium } from 'playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const docsRoot = fileURLToPath(new URL('../..', import.meta.url))
const origin = process.argv.slice(2).find(argument => /^https?:/.test(argument)) || 'http://localhost:5190'
const refreshArt = process.argv.includes('--refresh-art')
const captures = [
  { route: '/site-preview', selector: '.gf-foundry-preview', width: 1200, height: 630, scale: 2, output: 'public/assets/goforj-og-20261016.png' },
  { route: '/twitter-banner.html', selector: '.banner', width: 1500, height: 500, scale: 2, output: 'public/twitter-banner.png' }
]
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: refreshArt ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [] })
try {
  if (refreshArt) {
    const page = await browser.newPage({ viewport: { width: 1500, height: 1245 }, deviceScaleFactor: 2 })
    await page.goto(new URL('/hero-foundry', origin).href)
    await page.locator('.foundry__world.is-ready').waitFor()
    await page.evaluate(() => { document.documentElement.dataset.gfMotion = 'reduced' })
    await page.locator('.foundry--reduced').waitFor()
    if (!await page.locator('html').evaluate(element => element.classList.contains('dark'))) {
      await page.locator('.VPSwitchAppearance:visible').click()
    }
    await page.mouse.move(10, 10)
    await page.addStyleTag({ content: `
      * { background: transparent !important; background-image: none !important; }
      *::before, *::after { visibility: hidden !important; }
      .VPNav, .VPLocalNav, .VPNavScreen, .foundry__discover, .foundry__labels, .foundry__sidebar, .foundry__controls, .foundry__compare { display: none !important; }
      .foundry { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100vh !important; max-width: none !important; }
      .foundry__hero, .foundry__art, .foundry__world { display: block !important; width: 100% !important; height: 100% !important; }
    ` })
    await page.waitForFunction(() => {
      const canvas = document.querySelector('.foundry canvas')
      return canvas.width === 3000 && canvas.height === 2490
    })
    await page.locator('.foundry__canvas').screenshot({ path: path.join(docsRoot, 'public/assets/foundry-social.png'), omitBackground: true })
    await page.close()
    console.log('Captured transparent Foundry artwork at 3000x2490')
  }
  for (const capture of captures) {
    const page = await browser.newPage({ viewport: { width: capture.width, height: capture.height }, deviceScaleFactor: capture.scale })
    await page.goto(new URL(capture.route, origin).href)
    await page.locator(capture.selector).waitFor()
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all([...document.querySelectorAll('main img[src]')].map(image => image.decode()))
    })
    await page.locator(capture.selector).screenshot({ path: path.join(docsRoot, capture.output) })
    console.log(`Captured ${capture.width * capture.scale}x${capture.height * capture.scale}: ${capture.output}`)
    await page.close()
  }
} finally {
  await browser.close()
}
