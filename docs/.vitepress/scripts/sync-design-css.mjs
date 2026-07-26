/*
  Copies the live theme stylesheet next to the standalone design system page.

  The point of the design system page is that its swatches and plane readouts
  are computed from the ACTUAL tokens the site runs on, not from a table of
  hexes someone typed. To do that from a standalone file in public/, the file
  needs to be able to link the real stylesheet — and public/ is served flat,
  so the theme CSS has to be copied in.

  Runs on predev and prebuild. If it ever fails, the page will render without
  the theme and the failure is obvious rather than silent.
*/
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const src = resolve(here, '../theme/custom.css')
const dest = resolve(here, '../../public/design-system.css')

mkdirSync(dirname(dest), { recursive: true })
copyFileSync(src, dest)
console.log(`[design-system] synced theme css -> public/design-system.css`)
