import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const docsDir = path.resolve(scriptDir, '../..')
const configPath = path.join(docsDir, '.vitepress/config.mts')
const outputDir = path.join(docsDir, 'public/themes')

const config = fs.readFileSync(configPath, 'utf8')

// readPalette keeps editor downloads on the same Ember values used by Shiki.
function readPalette(name) {
  const match = config.match(new RegExp(`const ${name} = \\{([\\s\\S]*?)\\} as const`))
  if (!match) throw new Error(`missing ${name} palette in ${configPath}`)

  const palette = Object.fromEntries(
    [...match[1].matchAll(/(\w+):\s*'(#[0-9A-Fa-f]{6})'/g)]
      .map(([, key, value]) => [key, value.toUpperCase()])
  )
  const required = ['plain', 'comment', 'keyword', 'builtin', 'type', 'func', 'string', 'number', 'verb', 'punct']
  for (const key of required) {
    if (!palette[key]) throw new Error(`${name} is missing ${key}`)
  }
  return palette
}

const ember = readPalette('EMBER')
const surface = {
  background: '#0C0A0E',
  chrome: '#131017',
  surface: '#2C2734',
  line: '#2A2333',
  lineStrong: '#3D3349',
  ink: '#FFFFFF',
  muted: '#A9A1B3',
  faint: '#746C80',
  accent: '#FF5E3A',
  accentHigh: '#FF8257',
  navigation: '#FFC24D',
  navigationHigh: '#FFD37A',
  success: '#5FCFA8',
  warning: '#FFB454',
  danger: '#FF6B85'
}

const json = value => `${JSON.stringify(value, null, 2)}\n`

// vscodeTheme returns the portable color-theme source used by VS Code-family editors.
function vscodeTheme() {
  return json({
    $schema: 'vscode://schemas/color-theme',
    name: 'GoForj Temper - Ember',
    type: 'dark',
    semanticHighlighting: true,
    colors: {
      'editor.background': surface.background,
      'editor.foreground': ember.plain,
      'editorCursor.foreground': surface.accentHigh,
      'editor.lineHighlightBackground': surface.chrome,
      'editor.selectionBackground': surface.lineStrong,
      'editor.inactiveSelectionBackground': surface.surface,
      'editorLineNumber.foreground': surface.faint,
      'editorLineNumber.activeForeground': surface.navigation,
      'editorIndentGuide.background1': surface.line,
      'editorIndentGuide.activeBackground1': surface.lineStrong,
      'editorWhitespace.foreground': surface.lineStrong,
      'editorGutter.background': surface.chrome,
      'editorBracketMatch.background': surface.surface,
      'editorBracketMatch.border': surface.navigation,
      'editor.findMatchBackground': '#594313',
      'editor.findMatchHighlightBackground': '#3A2D15',
      'editorError.foreground': surface.danger,
      'editorWarning.foreground': surface.warning,
      'editorInfo.foreground': ember.type,
      'diffEditor.insertedTextBackground': '#143228AA',
      'diffEditor.removedTextBackground': '#3A1720AA',
      'terminal.background': surface.background,
      'terminal.foreground': ember.plain,
      'terminal.ansiBlack': surface.background,
      'terminal.ansiRed': surface.danger,
      'terminal.ansiGreen': surface.success,
      'terminal.ansiYellow': surface.warning,
      'terminal.ansiBlue': ember.type,
      'terminal.ansiMagenta': ember.keyword,
      'terminal.ansiCyan': ember.builtin,
      'terminal.ansiWhite': ember.plain,
      'terminal.ansiBrightBlack': surface.faint,
      'terminal.ansiBrightRed': surface.accentHigh,
      'terminal.ansiBrightGreen': ember.verb,
      'terminal.ansiBrightYellow': surface.navigationHigh,
      'terminal.ansiBrightBlue': ember.type,
      'terminal.ansiBrightMagenta': ember.keyword,
      'terminal.ansiBrightCyan': ember.builtin,
      'terminal.ansiBrightWhite': surface.ink
    },
    tokenColors: [
      { scope: ['source', 'variable', 'meta.embedded'], settings: { foreground: ember.plain } },
      { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: ember.comment } },
      { scope: ['keyword', 'storage.modifier', 'storage.type.function'], settings: { foreground: ember.keyword } },
      { scope: ['storage.type', 'support.type', 'keyword.type'], settings: { foreground: ember.builtin } },
      { scope: ['entity.name.type', 'entity.name.class', 'entity.name.namespace', 'support.class'], settings: { foreground: ember.type } },
      { scope: ['entity.name.function', 'support.function', 'meta.function-call'], settings: { foreground: ember.func } },
      { scope: ['string', 'string.quoted', 'string.template'], settings: { foreground: ember.string } },
      { scope: ['constant.numeric', 'constant.language', 'variable.language'], settings: { foreground: ember.number } },
      { scope: ['constant.character.escape', 'entity.name.tag', 'support.type.property-name'], settings: { foreground: ember.verb } },
      { scope: ['punctuation', 'meta.brace', 'keyword.operator'], settings: { foreground: ember.punct } },
      { scope: ['markup.inserted'], settings: { foreground: surface.success } },
      { scope: ['markup.deleted', 'invalid'], settings: { foreground: surface.danger } }
    ],
    semanticTokenColors: {
      type: ember.type,
      class: ember.type,
      interface: ember.type,
      namespace: ember.type,
      function: ember.func,
      method: ember.func,
      parameter: ember.plain,
      variable: ember.plain,
      property: ember.plain,
      enumMember: ember.number,
      keyword: ember.keyword,
      string: ember.string,
      number: ember.number,
      regexp: ember.verb,
      comment: ember.comment
    }
  })
}

// sublimeTheme maps TextMate scopes and editor chrome to Sublime's native format.
function sublimeTheme() {
  return json({
    name: 'GoForj Temper - Ember',
    author: 'GoForj',
    variables: { ...ember, ...surface },
    globals: {
      background: 'var(background)',
      foreground: 'var(plain)',
      caret: 'var(accentHigh)',
      line_highlight: 'var(chrome)',
      selection: 'var(lineStrong)',
      selection_border: 'var(navigation)',
      inactive_selection: 'var(surface)',
      misspelling: 'var(danger)',
      shadow: 'var(background)'
    },
    rules: [
      { name: 'Comments', scope: 'comment', foreground: 'var(comment)' },
      { name: 'Keywords', scope: 'keyword, storage.modifier, storage.type.function', foreground: 'var(keyword)' },
      { name: 'Built-in types', scope: 'storage.type, support.type, keyword.type', foreground: 'var(builtin)' },
      { name: 'Types', scope: 'entity.name.type, entity.name.class, entity.name.namespace, support.class', foreground: 'var(type)' },
      { name: 'Functions', scope: 'entity.name.function, support.function, meta.function-call', foreground: 'var(func)' },
      { name: 'Strings', scope: 'string', foreground: 'var(string)' },
      { name: 'Numbers and constants', scope: 'constant.numeric, constant.language, variable.language', foreground: 'var(number)' },
      { name: 'Tags and escapes', scope: 'entity.name.tag, constant.character.escape, support.type.property-name', foreground: 'var(verb)' },
      { name: 'Punctuation', scope: 'punctuation, meta.brace, keyword.operator', foreground: 'var(punct)' },
      { name: 'Inserted', scope: 'markup.inserted', foreground: 'var(success)' },
      { name: 'Deleted and invalid', scope: 'markup.deleted, invalid', foreground: 'var(danger)' }
    ]
  })
}

// vimTheme targets the shared highlight groups supported by Vim and Neovim.
function vimTheme() {
  const hi = (group, foreground, background = 'NONE', style = 'NONE') =>
    `hi ${group} guifg=${foreground} guibg=${background} gui=${style} cterm=${style}`
  return `" GoForj Temper - Ember\n" Generated from the GoForj design-system palette.\nhi clear\nif exists('syntax_on')\n  syntax reset\nendif\nlet g:colors_name = 'goforj-temper-ember'\nset background=dark\n\n${[
    hi('Normal', ember.plain, surface.background),
    hi('NormalFloat', ember.plain, surface.chrome),
    hi('Cursor', surface.background, surface.accentHigh),
    hi('CursorLine', 'NONE', surface.chrome),
    hi('CursorLineNr', surface.navigation, surface.chrome, 'bold'),
    hi('LineNr', surface.faint, surface.chrome),
    hi('SignColumn', surface.faint, surface.chrome),
    hi('Visual', surface.ink, surface.lineStrong),
    hi('Search', surface.ink, '#594313'),
    hi('IncSearch', surface.background, surface.navigation),
    hi('MatchParen', surface.navigation, surface.surface, 'bold'),
    hi('Comment', ember.comment),
    hi('Keyword', ember.keyword), hi('Statement', ember.keyword), hi('Conditional', ember.keyword), hi('Repeat', ember.keyword),
    hi('Type', ember.builtin), hi('Structure', ember.type), hi('Typedef', ember.type),
    hi('Function', ember.func), hi('Identifier', ember.plain),
    hi('String', ember.string), hi('Character', ember.string),
    hi('Number', ember.number), hi('Boolean', ember.number), hi('Constant', ember.number),
    hi('Special', ember.verb), hi('Tag', ember.verb), hi('Operator', ember.punct), hi('Delimiter', ember.punct),
    hi('Error', surface.danger, '#3A1720'), hi('WarningMsg', surface.warning), hi('Todo', surface.warning, 'NONE', 'bold'),
    hi('DiffAdd', surface.success, '#143228'), hi('DiffDelete', surface.danger, '#3A1720'), hi('DiffChange', surface.warning, '#3A2D15')
  ].join('\n')}\n`
}

// helixTheme uses Helix's semantic scopes and UI keys without plugin packaging.
function helixTheme() {
  return `# GoForj Temper - Ember\n# Generated from the GoForj design-system palette.\n\n` +
    `"ui.background" = { bg = "background" }\n` +
    `"ui.text" = { fg = "plain" }\n` +
    `"ui.text.focus" = { fg = "ink", bg = "surface" }\n` +
    `"ui.cursor" = { fg = "background", bg = "accent_high" }\n` +
    `"ui.cursorline.primary" = { bg = "chrome" }\n` +
    `"ui.linenr" = { fg = "faint", bg = "chrome" }\n` +
    `"ui.linenr.selected" = { fg = "navigation", bg = "chrome", modifiers = ["bold"] }\n` +
    `"ui.selection" = { bg = "line_strong" }\n` +
    `"ui.statusline" = { fg = "muted", bg = "chrome" }\n` +
    `"ui.statusline.active" = { fg = "ink", bg = "surface" }\n` +
    `"ui.popup" = { fg = "plain", bg = "surface" }\n` +
    `"ui.window" = { fg = "line" }\n` +
    `"ui.virtual.whitespace" = { fg = "line_strong" }\n` +
    `"ui.virtual.indent-guide" = { fg = "line" }\n` +
    `"diagnostic.error" = { underline = { color = "danger", style = "curl" } }\n` +
    `"diagnostic.warning" = { underline = { color = "warning", style = "curl" } }\n` +
    `"diagnostic.info" = { underline = { color = "type", style = "line" } }\n` +
    `"comment" = "comment"\n` +
    `"keyword" = "keyword"\n"keyword.control" = "keyword"\n"keyword.function" = "keyword"\n` +
    `"type" = "type"\n"type.builtin" = "builtin"\n` +
    `"function" = "func"\n"function.builtin" = "func"\n"function.method" = "func"\n` +
    `"string" = "string"\n"constant.numeric" = "number"\n"constant.builtin" = "number"\n` +
    `"constant.character.escape" = "verb"\n"tag" = "verb"\n"operator" = "punct"\n"punctuation" = "punct"\n` +
    `"diff.plus" = "success"\n"diff.minus" = "danger"\n"diff.delta" = "warning"\n` +
    `\n[palette]\n` +
    Object.entries({
      background: surface.background, chrome: surface.chrome, surface: surface.surface,
      line: surface.line, line_strong: surface.lineStrong, ink: surface.ink,
      muted: surface.muted, faint: surface.faint, accent: surface.accent,
      accent_high: surface.accentHigh, navigation: surface.navigation,
      success: surface.success, warning: surface.warning, danger: surface.danger,
      ...ember
    }).map(([key, value]) => `${key} = "${value}"`).join('\n') + '\n'
}

fs.mkdirSync(outputDir, { recursive: true })
const outputs = {
  'GoForj-Temper-Ember-color-theme.json': vscodeTheme(),
  'GoForj-Temper-Ember.sublime-color-scheme': sublimeTheme(),
  'goforj-temper-ember.vim': vimTheme(),
  'goforj-temper-ember.toml': helixTheme()
}

for (const [name, contents] of Object.entries(outputs)) {
  fs.writeFileSync(path.join(outputDir, name), contents)
}

const jetBrainsPath = path.join(outputDir, 'GoForj-Temper-Ember.icls')
if (!fs.existsSync(jetBrainsPath)) throw new Error(`missing JetBrains scheme: ${jetBrainsPath}`)
const jetBrains = fs.readFileSync(jetBrainsPath, 'utf8')
for (const value of Object.values(ember)) {
  if (!jetBrains.includes(value.slice(1))) {
    throw new Error(`JetBrains scheme does not include Ember color ${value}`)
  }
}

const requiredJetBrainsAttributes = {
  GO_STRING: ember.string,
  GO_PACKAGE: ember.type,
  GO_BUILTIN_TYPE_REFERENCE: ember.builtin,
  GO_BUILTIN_CONSTANT: ember.number,
  GO_EXPORTED_FUNCTION: ember.func,
  GO_LOCAL_FUNCTION: ember.func,
  GO_BUILTIN_FUNCTION_CALL: ember.func,
  GO_EXPORTED_FUNCTION_CALL: ember.func,
  GO_LOCAL_FUNCTION_CALL: ember.func,
  GO_TAG_KEY: ember.verb,
  GO_TAG_VALUE: ember.string
}

for (const [name, value] of Object.entries(requiredJetBrainsAttributes)) {
  const attribute = new RegExp(`<option name="${name}"><value><option name="FOREGROUND" value="${value.slice(1)}"`)
  if (!attribute.test(jetBrains)) {
    throw new Error(`JetBrains scheme does not map ${name} to ${value}`)
  }
}

for (const name of ['DEFAULT_LINE_COMMENT', 'DEFAULT_BLOCK_COMMENT', 'DEFAULT_DOC_COMMENT', 'GO_LINE_COMMENT', 'GO_BLOCK_COMMENT']) {
  const start = jetBrains.indexOf(`<option name="${name}"`)
  const end = jetBrains.indexOf('</value>', start)
  if (start === -1 || end === -1) throw new Error(`JetBrains scheme is missing ${name}`)
  if (jetBrains.slice(start, end).includes('FONT_TYPE')) {
    throw new Error(`JetBrains scheme italicizes ${name}, unlike the docs`)
  }
}

console.log(`[editor-themes] wrote ${Object.keys(outputs).length} formats and verified modern JetBrains mappings`)
