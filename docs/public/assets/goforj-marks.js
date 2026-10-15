// The frozen geometry is shared by the logo system and the landing illustration.
export const GOFORJ_OUTER = 'M40.59 0.0 L0.0 25.06 L0.0 74.9 L42.26 100.0 L84.01 75.99 L83.8 29.98 L74.4 24.17 L80.24 21.88 L65.47 12.52 L56.15 18.37 L56.35 9.94 Z'
export const GOFORJ_COUNTER = 'M40.43 17.78 L40.01 22.31 L43.43 24.33 L23.04 36.46 L22.84 60.81 L39.59 71.96 L39.39 45.17 L60.37 32.81 L67.34 37.11 L45.67 50.2 L45.67 62.45 L47.88 63.68 L68.09 51.93 L67.88 65.78 L41.93 81.28 L16.13 65.18 L16.13 32.2 Z'
export const PRODUCT_ICON_RADIUS = .2237

// productGlyph preserves the product silhouettes and stroke weight from the logo system.
export function productGlyph(name, color) {
  const glyphs = {
    harbor: `<g fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><circle cx="50" cy="24" r="8"/><path d="M50 32V84M34 45H66M19 62C22 78 34 87 50 87S78 78 81 62M19 62L29 67M81 62L71 67"/></g>`,
    ship: `<g fill="${color}"><path d="M47 16H53V58H47Z"/><path d="M43 27V54H23Z"/><path d="M57 24V54H79Z"/><path d="M17 59H83L76 76C73 84 66 88 57 88H43C34 88 27 84 24 76Z"/></g>`
  }
  return glyphs[name]
}

// productTile gives the logo lab and physical badges the same plate and safe zone.
export function productTile(name, size, palette, options = {}) {
  const plate = options.plate || palette.accent
  const glyph = options.fill || palette.deep
  const accessibility = options.label ? `role="img" aria-label="${options.label}"` : 'aria-hidden="true" focusable="false"'
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" ${accessibility}>` +
    `<rect width="100" height="100" rx="${100 * (options.radius ?? PRODUCT_ICON_RADIUS)}" fill="${plate}"/>` +
    productGlyph(name, glyph) + '</svg>'
}
