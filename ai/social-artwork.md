# Foundry Social Artwork

## Scope and Ownership

Use this workflow for GoForj link previews, Twitter/X profile banners, and the static Foundry capture they share. These are browser-rendered compositions of existing Three.js artwork, not AI-generated images. Preserve the live hero and its original counterpart unless the user requests changes to them.

The canonical capture command lives in `docs/.vitepress/scripts/capture-social-previews.mjs`. Edit the composition or scene source, then regenerate its PNG exports. Do not patch the exported images by hand.

## Sources and Exports

Paths below are relative to the repository root.

| Surface | Authoritative source | Export or route |
| --- | --- | --- |
| Foundry scene | `docs/.vitepress/theme/components/goforj-foundry-scene.js`, `GoForjHeroFoundry.vue` | `/hero-foundry` |
| Shared transparent artwork | Capture script with `--refresh-art` | `docs/public/assets/foundry-social.png`, 3000 by 2490 |
| Social preview | `docs/.vitepress/theme/components/SitePreview.vue` | `/site-preview`; `docs/public/assets/goforj-og-20261016.png`, 2400 by 1260 |
| Profile banner | `docs/public/twitter-banner.html` | `docs/public/twitter-banner.png`, 1500 by 500 |
| Comparison page | `docs/public/social-preview-comparison.html` | `/social-preview-comparison.html` |

The social preview uses a 1200 by 630 CSS viewport captured at device scale factor 2. Its larger physical export is deliberate: a 1200px PNG looked soft when enlarged. The banner keeps its standard 1500 by 500 export. The shared artwork is rendered directly at high resolution rather than enlarged from a smaller screenshot.

## Capture

Start the docs development server from `docs/` using `npm run dev`. Its default port is 5190. If another task owns that server, use a free port with `./node_modules/.bin/vitepress dev . --port 5193` from `docs/` and pass that origin explicitly below.

From the repository root:

```bash
node docs/.vitepress/scripts/capture-social-previews.mjs http://localhost:5190
```

This regenerates the two composed exports using the existing transparent artwork. When the illustration itself changed or needs a sharper capture:

```bash
node docs/.vitepress/scripts/capture-social-previews.mjs http://localhost:5190 --refresh-art
```

The refresh step loads `/hero-foundry`, selects reduced motion for a stable scene, renders it at 3000 by 2490, and captures transparency before composing the preview and banner. Playwright and Chrome must be available. The script waits for scene readiness, canvas dimensions, image decoding, and fonts.

## Visual Decisions to Preserve

- Keep the full board inside the frame with breathing room on the top, right, and bottom. Negative offsets previously cropped the right edge of the social preview.
- Keep the tagline left and the Foundry illustration right with a clear gap. Judge the composition at its intended display size as well as at full export resolution.
- Preserve the thin orange logo, white neon bevel, and steady glow. Do not alter live materials or bloom just to adjust a static composition.
- Capture actual alpha transparency, including the light bloom. A screenshot with the page background baked in produces a visible rectangular tint.
- Hide the navbar, controls, labels, and CSS pseudo-elements during the artwork capture. An element screenshot still includes other elements painted over it; the fixed navbar previously appeared inside the exported artwork.
- Keep the social preview independent of the reader's theme. It is a deliberate dark composition. The profile-banner HTML supports a light variant, but the default exported banner is dark.
- The docs reading backdrop is a separate asset, `docs/public/assets/foundry-docs-background.png`, controlled by `.VPDoc.has-sidebar .content-container::before` in `custom.css`. A social-artwork update does not require changing that backdrop.

## Metadata and Cache Refresh

A dated export filename avoids reusing an old cached social image URL. If changing the filename or dimensions, update all consumers together:

- capture outputs in `capture-social-previews.mjs`
- the default `socialImage` and fallback dimensions in `docs/.vitepress/config.mts`
- `ogImage`, `ogImageWidth`, and `ogImageHeight` in `docs/index.md` and `docs/starter-kits.md`
- the comparison page and the export paths documented here

The homepage and starter-kit frontmatter override the default social image. Updating only `socialImage` leaves those pages on their old preview.

Keep Twitter `summary_large_image` and Open Graph metadata aligned on the same image. The October 16 Slack investigation tested placing Twitter metadata first, following Slack's older published guidance, but fresh posted messages still displayed compact thumbnails. Tag order is not a verified fix. Correct generated tags alone do not prove Slack rendered a large card; confirm the result in a fresh posted Slack message or its authenticated unfurl debugger before claiming that behavior is fixed.

The noindex page `/unfurl/slack-photo.html` isolates oEmbed photo discovery from homepage metadata. Its static descriptor, `/unfurl/foundry-photo.json`, is a diagnostic fixture, not a general oEmbed endpoint: it cannot negotiate requested maximum dimensions. Use it to establish whether Slack displays a photo differently before considering a production integration. Keep the homepage and working Discord card unchanged during this experiment.

## Preserve Originals

Keep these existing originals intact, alongside the Foundry versions:

- `GoForjHeroStack.vue` and `/hero-original`
- `SitePreviewOriginal.vue` and `/site-preview-original`
- `docs/public/assets/goforj-og-20260731.png`
- `docs/public/twitter-banner-original.html` and `twitter-banner-original.png`

Do not recapture or overwrite the preserved originals as part of an ordinary Foundry revision. The comparison page shows both generations side by side.

## Verification and Delivery

Open the comparison page and inspect the actual exported PNGs. Confirm transparency in the source artwork, no navbar or controls, full-board framing, clear text, and correct physical dimensions. Check the original preview route still renders.

Run `npm run build` from `docs/`, then inspect the built homepage and starter-kit Open Graph and Twitter metadata. The built-link and search audits run through the normal build hooks. Report any unrelated build blocker rather than silently treating a partial build as a complete pass.

Local capture does not publish the assets, deploy the site, or upload a banner to a social account. Carry out those actions only within the user's requested scope. Report which files were prepared and whether they are committed, deployed, or uploaded.
