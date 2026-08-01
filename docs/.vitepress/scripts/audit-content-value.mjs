import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const repoRoot = path.resolve(docsRoot, '..')
const frameworkRoot = path.resolve(repoRoot, '../goforj')
const eventsRoot = path.resolve(repoRoot, '../events')
const qualityManifest = readJSON(path.join(docsRoot, '.vitepress', 'data', 'content-quality.json'))
const governanceManifest = readJSON(path.join(repoRoot, 'ai', 'governance.json'))

const taskPages = [
  'getting-started/quickstart.md',
  'operations/backups.md',
  'operations/deployment-basics.md'
]

const sourceCheckedExamplePages = [
  'applications/http-clients.md',
  'applications/middleware.md',
  'async/retries-idempotency.md',
  'operations/queue-workers.md',
  'testing/event-tests.md'
]

const scenarioRoot = path.join(docsRoot, 'scenarios')
for (const entry of fs.readdirSync(scenarioRoot, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md') {
    taskPages.push(path.posix.join('scenarios', entry.name))
  }
}

const editorialFailures = []
const sourceFailures = []
const exampleCounts = new Map()
const pageTypeCounts = new Map()
const reviewTermCounts = new Map()

for (const relativePath of publicMarkdownFiles(docsRoot)) {
  const source = fs.readFileSync(path.join(docsRoot, relativePath), 'utf8')
  const frontmatter = readFrontmatter(source)
  if (!frontmatter.description) {
    editorialFailures.push(`${relativePath}: add a concrete frontmatter description`)
  }
}

auditPageClassification()
auditExampleClassification()
auditHeadingStyle()
auditCanonicalPaths()
auditNavigationLinks()
auditReviewTerms()
auditGovernance()

for (const relativePath of taskPages) {
  const source = fs.readFileSync(path.join(docsRoot, relativePath), 'utf8')
  const body = stripFrontmatter(source)
  const checks = [
    ['an outcome statement', firstProseParagraph(body).length >= 40],
    ['prerequisite or process context', /^## (Prerequisites|Before You Start|Process Model|Safe Workflow)/im.test(body)],
    ['an executable command or program', /^```(?:bash|go)\b/m.test(body)],
    ['a verification section', /^## .*\b(Verify|Verification|Try|Test)\b/im.test(body)],
    ['a likely-failure section or warning', /^## (Troubleshooting|Common Mistakes|Failure Modes)/im.test(body) || /^::: warning\b/m.test(body)],
    ['next-step guidance', /^## Next Steps\b/im.test(body)]
  ]

  for (const [requirement, passed] of checks) {
    if (!passed) {
      editorialFailures.push(`${relativePath}: task page needs ${requirement}`)
    }
  }

  auditTaskVerification(relativePath, body)
  auditTaskSnippets(relativePath, body)
}

for (const relativePath of sourceCheckedExamplePages) {
  auditTaskSnippets(relativePath, stripFrontmatter(readDoc(relativePath)))
}

auditForbiddenPatterns()
auditDriverTableParity()

for (const trackedPath of trackedFiles()) {
  if (
    fs.existsSync(path.join(repoRoot, trackedPath)) &&
    (
      trackedPath === 'backend/.env' ||
      trackedPath === 'docs/.env' ||
      trackedPath.includes('.fuse_hidden')
    )
  ) {
    sourceFailures.push(`${trackedPath}: local environment or filesystem artifact must not be tracked`)
  }
}

if (fs.existsSync(frameworkRoot)) {
  auditFrameworkContracts()
}

if (fs.existsSync(eventsRoot)) {
  auditEventDriverParity()
}

if (editorialFailures.length > 0 || sourceFailures.length > 0) {
  console.error('Documentation value audit failed:')
  reportFailures('Editorial contract checks', editorialFailures)
  reportFailures('Source contract checks', sourceFailures)
  reportExampleCounts()
  reportReviewTermCounts()
  process.exit(1)
}

const classifiedPages = [...pageTypeCounts.values()].reduce((total, count) => total + count, 0)
console.log(`Documentation value audit passed (${classifiedPages} pages classified; ${taskPages.length} workflow task pages deep-checked).`)
console.log('Editorial contract checks: task outcomes, verification evidence, safe examples, command-surface consistency, and snippet consistency passed.')
console.log('Source contract checks: framework, event-source, dependency-path, and local task-import parity passed where source is available.')
reportExampleCounts()
reportReviewTermCounts()
console.log('Declared compilable files are type-checked, source-backed excerpts are matched exactly, and rendered scenarios retain end-to-end compilation ownership.')

// reportFailures keeps editorial guidance separate from source-backed failures so a content edit is not mistaken for executable proof.
function reportFailures(heading, failures) {
  if (failures.length === 0) return
  console.error(`${heading}:`)
  for (const failure of failures) console.error(`- ${failure}`)
}

// reportExampleCounts makes classification coverage visible in both successful and failing audit runs.
function reportExampleCounts() {
  console.log(`Go example inventory: ${[...exampleCounts.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([kind, count]) => `${kind}=${count}`).join(', ')}.`)
}

// reportReviewTermCounts keeps the contextual vocabulary review visible without replacing precise uses mechanically.
function reportReviewTermCounts() {
  console.log(`Editorial review terms: ${[...reviewTermCounts.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([term, count]) => `${term}=${count}`).join(', ')}.`)
}

// auditTaskVerification requires each task page to show a command that produces observable evidence, rather than only promising verification in prose.
function auditTaskVerification(relativePath, body) {
  const verificationSections = markdownSections(body, /^(?:Build and )?Verify\b|^Try\b|^Check\b/i)
  if (verificationSections.length === 0) return

  const hasExecutableEvidence = verificationSections.some((section) => {
    const commands = fencedBlocks(section, 'bash').map(({ content }) => content)
    return commands.some((command) => /\S/.test(command))
  })
  if (!hasExecutableEvidence) {
    editorialFailures.push(`${relativePath}: verification guidance must include an executable bash command`)
  }
}

// auditTaskSnippets catches mistakes that prose review can miss without pretending that partial snippets are complete rendered applications.
function auditTaskSnippets(relativePath, body) {
  for (const [index, block] of fencedBlocks(body, 'go').entries()) {
    const imports = goImports(block.content)
    const withoutImports = block.content.replace(/import\s*(?:\(\s*[\s\S]*?\s*\)|"[^"\n]+")/g, '')
    for (const imported of imports) {
      auditLocalGoForjImport(relativePath, imported.path)
      if (imported.alias === '_' || imported.alias === '.') continue
      if (!new RegExp(`\\b${escapeRegExp(imported.alias)}\\s*\\.`).test(withoutImports)) {
        editorialFailures.push(`${relativePath}: Go snippet ${index + 1} imports ${imported.path} but does not use ${imported.alias}`)
      }
    }
  }
}

// auditLocalGoForjImport verifies task imports against sibling module metadata when those source repositories are present.
function auditLocalGoForjImport(relativePath, importPath) {
  const match = importPath.match(/^github\.com\/goforj\/([^/]+)/)
  if (!match) return

  const moduleRoot = path.resolve(repoRoot, '..', match[1])
  const goModPath = path.join(moduleRoot, 'go.mod')
  if (!fs.existsSync(goModPath)) return

  const moduleName = fs.readFileSync(goModPath, 'utf8').match(/^module\s+(\S+)$/m)?.[1]
  if (!moduleName || (importPath !== moduleName && !importPath.startsWith(`${moduleName}/`))) {
    const generatedDependencies = fs.existsSync(path.join(frameworkRoot, 'internal/coredeps/modules.go'))
      ? readFramework('internal/coredeps/modules.go')
      : ''
    if (generatedDependencies.includes(`"${importPath}"`)) return
    sourceFailures.push(`${relativePath}: import ${importPath} does not match local module ${moduleName ?? goModPath}`)
    return
  }

  const packagePath = importPath.slice(moduleName.length).replace(/^\//, '')
  if (!fs.existsSync(path.join(moduleRoot, packagePath))) {
    sourceFailures.push(`${relativePath}: imported GoForj package ${importPath} is absent from the local module source`)
  }
}

// auditForbiddenPatterns blocks unsafe shell examples and command-surface ambiguity that would make readers choose between different lifecycle intents.
function auditForbiddenPatterns() {
  for (const relativePath of publicMarkdownFiles(docsRoot)) {
    const source = fs.readFileSync(path.join(docsRoot, relativePath), 'utf8')
    if (/\b(?:curl|wget)\b[^\n]*\|\s*(?:sh|bash)\b/i.test(source)) {
      editorialFailures.push(`${relativePath}: do not pipe curl or wget output directly into sh or bash`)
    }
    if (
      /#\s*(?:or|→)\s+\.\/bin\//i.test(source) ||
      /`forj[^`\n]*`\s+or\s+`\.\/bin\//i.test(source) ||
      /\bforj[^\n`]*\s+or\s+\.\/bin\//i.test(source)
    ) {
      editorialFailures.push(`${relativePath}: choose the source-aware forj surface or the built-artifact binary surface from the page intent instead of presenting an inline alternative`)
    }
    if (relativePath.startsWith('operations/') && /\|\s*Development alias\s*\|/i.test(source)) {
      editorialFailures.push(`${relativePath}: operations pages must lead with supervised binary commands; link to development guidance instead of adding an alias column`)
    }
    if (/\bgenerated\s+(?:Apps?|applications?)\b/i.test(source)) {
      editorialFailures.push(`${relativePath}: call the runnable boundary an App; attach generated to the specific file, accessor, provider, or output instead`)
    }
  }
}

// auditPageClassification makes page intent explicit before applying only the contract that suits that intent.
function auditPageClassification() {
  const allowed = new Set(qualityManifest.pageTypes.allowed)
  for (const relativePath of publicMarkdownFiles(docsRoot)) {
    const pageType = classify(relativePath, qualityManifest.pageTypes.rules)
    if (!pageType) {
      editorialFailures.push(`${relativePath}: add a page-type rule to .vitepress/data/content-quality.json`)
      continue
    }
    if (!allowed.has(pageType)) {
      editorialFailures.push(`${relativePath}: page type ${pageType} is not recognized`)
      continue
    }
    pageTypeCounts.set(pageType, (pageTypeCounts.get(pageType) ?? 0) + 1)

    const required = qualityManifest.pageTypes.contracts[pageType] ?? []
    const source = readDoc(relativePath)
    const body = stripFrontmatter(source)
    if (required.includes('concrete-description') && !readFrontmatter(source).description) {
      editorialFailures.push(`${relativePath}: ${pageType} pages need a concrete frontmatter description`)
    }
    if (required.includes('outcome') && firstProseParagraph(body).length < 25) {
      editorialFailures.push(`${relativePath}: ${pageType} pages need a concrete opening outcome or mental model`)
    }
    if (required.includes('structured-content') && !/^##\s+\S/m.test(body)) {
      editorialFailures.push(`${relativePath}: ${pageType} pages need scannable level-two sections`)
    }
    if (
      required.includes('actionable-evidence') &&
      !/^```(?:bash|go|text|yaml|dotenv)\b/m.test(body) &&
      !/\]\(\/scenarios\/[^)]*\)/.test(body)
    ) {
      editorialFailures.push(`${relativePath}: ${pageType} pages need an actionable example or a runnable-scenario handoff`)
    }
    if (
      required.includes('verification-handoff') &&
      !/^##\s+.*\b(?:Verify|Verification|Test|Try|Check)\b/im.test(body) &&
      !/\]\(\/(?:testing|scenarios)\/[^)]*\)/.test(body) &&
      !/\b(?:Expected result|Success means|Verify|Confirm|Assert)\b/i.test(body)
    ) {
      editorialFailures.push(`${relativePath}: ${pageType} pages need verification guidance or an exact testing/scenario handoff`)
    }
  }
}

// auditExampleClassification keeps every Go fence in a known verification category without claiming fragments are standalone programs.
function auditExampleClassification() {
  const allowed = new Set(qualityManifest.examples.allowed)
  const compilableFiles = new Map((qualityManifest.examples.compilableFiles ?? []).map((example) => [exampleKey(example), example]))
  const sourceBackedExcerpts = new Map((qualityManifest.examples.sourceBackedExcerpts ?? []).map((example) => [exampleKey(example), example]))
  const classifiedExamples = new Set()
  for (const relativePath of publicMarkdownFiles(docsRoot)) {
    const source = readDoc(relativePath)
    const blocks = fencedBlocks(source, 'go')
    if (blocks.length === 0) continue
    for (const [index, block] of blocks.entries()) {
      const classification = classifyGoExample(relativePath, source, block)
      const key = exampleKey({ page: relativePath, example: index + 1 })
      classifiedExamples.add(key)
      exampleCounts.set(classification, (exampleCounts.get(classification) ?? 0) + 1)
      if (!allowed.has(classification)) {
        editorialFailures.push(`${relativePath}: Go example ${index + 1} classification ${classification} is not recognized`)
      }
      if (
        classification === 'illustrative-fragment' &&
        /(?:^|\n)\s*(?:(?:\/\/\s*)?\.\.\.|[A-Za-z_]\w*\s*:\s*\.\.\.)/m.test(block.content)
      ) {
        const context = source.slice(Math.max(0, block.index - 320), block.index)
        if (!/\b(?:excerpt|fragment|illustrative|omits?|omitted|partial|shape)\b/i.test(context)) {
          editorialFailures.push(`${relativePath}: label Go example ${index + 1} as an excerpt or explain what its ellipsis omits`)
        }
      }
      if (classification === 'compilable-file') {
        const specification = compilableFiles.get(key)
        if (!specification) {
          editorialFailures.push(`${relativePath}: Go example ${index + 1} is compilable-file but has no compilation specification`)
        } else {
          auditCompilableGoExample(relativePath, index + 1, block.content, specification)
        }
      }
      if (classification === 'source-backed-excerpt') {
        const specification = sourceBackedExcerpts.get(key)
        if (!specification) {
          editorialFailures.push(`${relativePath}: Go example ${index + 1} is source-backed-excerpt but has no source specification`)
        } else {
          auditSourceBackedGoExcerpt(relativePath, index + 1, block.content, specification)
        }
      }
    }
  }
  for (const [key, specification] of compilableFiles) {
    if (!classifiedExamples.has(key)) editorialFailures.push(`${specification.page}: compilation specification points to a missing Go example ${specification.example}`)
  }
  for (const [key, specification] of sourceBackedExcerpts) {
    if (!classifiedExamples.has(key)) editorialFailures.push(`${specification.page}: source specification points to a missing Go example ${specification.example}`)
  }
}

// exampleKey gives checked-in example specifications a stable identity even when several Go fences share a page.
function exampleKey({ page, example }) {
  return `${page}#${example}`
}

// auditCompilableGoExample proves that a complete, dependency-declared file type-checks outside the documentation site.
function auditCompilableGoExample(relativePath, index, content, specification) {
  if (!/^package\s+\w+/m.test(content)) {
    sourceFailures.push(`${relativePath}: compilable Go example ${index} must declare a package`)
    return
  }
  if (!specification.file || !specification.module || !specification.goVersion) {
    sourceFailures.push(`${relativePath}: compilable Go example ${index} needs file, module, and goVersion metadata`)
    return
  }

  const temporaryDirectory = fs.mkdtempSync(path.join('/tmp', 'goforj-doc-example-'))
  try {
    const requirements = specification.requires ?? []
    const moduleSource = [
      `module ${specification.module}`,
      '',
      `go ${specification.goVersion}`,
      '',
      ...requirements.map(({ module, version }) => `require ${module} ${version}`),
      '',
      ...requirements
        .filter(({ replace }) => replace)
        .map(({ module, replace }) => `replace ${module} => ${path.resolve(repoRoot, replace)}`),
      ''
    ].join('\n')
    fs.writeFileSync(path.join(temporaryDirectory, 'go.mod'), moduleSource)
    fs.writeFileSync(path.join(temporaryDirectory, specification.file), content)
    execFileSync('go', ['test', '-mod=mod', '.'], {
      cwd: temporaryDirectory,
      encoding: 'utf8',
      stdio: 'pipe',
      env: {
        ...process.env,
        GOCACHE: process.env.GOCACHE ?? '/tmp/gocache',
        GOMODCACHE: process.env.GOMODCACHE ?? '/tmp/gomodcache'
      }
    })
  } catch (error) {
    const output = [error.stdout, error.stderr].filter(Boolean).join('\n').trim()
    sourceFailures.push(`${relativePath}: compilable Go example ${index} failed go test${output ? `: ${output}` : ''}`)
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true })
  }
}

// auditSourceBackedGoExcerpt requires an excerpt to remain an exact contiguous slice of its declared executable scenario.
function auditSourceBackedGoExcerpt(relativePath, index, content, specification) {
  if (!specification.source || !specification.source.startsWith('scenarios/')) {
    sourceFailures.push(`${relativePath}: source-backed Go example ${index} must name a scenario source`)
    return
  }
  const sourcePath = path.join(docsRoot, specification.source)
  if (!fs.existsSync(sourcePath)) {
    sourceFailures.push(`${relativePath}: source-backed Go example ${index} source ${specification.source} is missing`)
    return
  }
  if (!fs.readFileSync(sourcePath, 'utf8').includes(content.trim())) {
    sourceFailures.push(`${relativePath}: source-backed Go example ${index} no longer exactly matches ${specification.source}`)
  }
}

// auditHeadingStyle enforces sentence-case connector words on hand-written pages while generated projections keep their source-owned headings.
function auditHeadingStyle() {
  const connectors = new Set(qualityManifest.headingStyle.lowercaseConnectors)
  const generatedPageTypes = new Set(qualityManifest.headingStyle.generatedPageTypes)
  for (const relativePath of publicMarkdownFiles(docsRoot)) {
    if (generatedPageTypes.has(classify(relativePath, qualityManifest.pageTypes.rules))) continue
    const source = stripFrontmatter(readDoc(relativePath))
    for (const match of source.matchAll(/^#{1,6}\s+(.+?)\s*$/gm)) {
      const heading = match[1].replace(/\s+\{#[^}]+\}$/, '')
      const words = [...heading.matchAll(/(?:^|\s)([A-Za-z]+)\b/g)].map((word) => word[1])
      for (let index = 1; index < words.length; index += 1) {
        const word = words[index]
        if (!connectors.has(word.toLowerCase()) || word !== word[0].toUpperCase() + word.slice(1)) continue
        editorialFailures.push(`${relativePath}: write connector "${word}" in sentence case in heading "${heading}"`)
      }
    }
  }
}

// auditCanonicalPaths catches the finite set of renamed URLs that otherwise look valid to Markdown and VitePress.
function auditCanonicalPaths() {
  const stalePaths = Object.entries(qualityManifest.canonicalPaths)
  for (const [relativePath, source] of auditableMarkdownSources()) {
    for (const [stalePath, canonicalPath] of stalePaths) {
      const expression = new RegExp(`(?<![A-Za-z0-9_/-])/?${escapeRegExp(stalePath)}(?:\\.md)?(?=[#)\\]\\s'"` + '`' + `]|$)`, 'g')
      if (expression.test(source)) {
        editorialFailures.push(`${relativePath}: replace stale canonical path ${stalePath} with ${canonicalPath}`)
      }
    }
  }
}

// auditNavigationLinks validates configured destinations before VitePress performs its rendered-link pass.
function auditNavigationLinks() {
  const config = fs.readFileSync(path.join(docsRoot, '.vitepress', 'config.mts'), 'utf8')
  const routes = new Set(['/'])
  for (const relativePath of publicMarkdownFiles(docsRoot)) {
    if (relativePath === 'index.md') continue
    const route = `/${relativePath.replace(/(?:^|\/)index\.md$/, '').replace(/\.md$/, '')}`.replace(/\/$/, '')
    routes.add(route || '/')
  }
  for (const match of config.matchAll(/'libraries\/[^']+\.md':\s*'([^']+)\.md'/g)) {
    routes.add(`/${match[1]}`)
  }

  const checked = new Set()
  for (const match of config.matchAll(/\blink:\s*'([^']+)'/g)) {
    const target = match[1]
    if (!target.startsWith('/')) continue
    const route = target.split('#')[0].replace(/\/$/, '') || '/'
    if (checked.has(route)) continue
    checked.add(route)
    if (!routes.has(route)) {
      editorialFailures.push(`.vitepress/config.mts: navigation target ${target} does not resolve to a public page`)
    }
  }
}

// auditReviewTerms flags growth in ambiguous vocabulary so authors review context before accepting a higher budget.
function auditReviewTerms() {
  for (const term of Object.keys(qualityManifest.reviewTerms ?? {})) reviewTermCounts.set(term, 0)
  for (const relativePath of publicMarkdownFiles(docsRoot)) {
    const pageType = classify(relativePath, qualityManifest.pageTypes.rules)
    if (pageType === 'generated-library' || pageType === 'generated-scenario') continue
    const prose = stripFrontmatter(readDoc(relativePath))
      .replace(/^```[\s\S]*?^```\s*$/gm, '')
      .replace(/`[^`\n]+`/g, '')
    for (const term of Object.keys(qualityManifest.reviewTerms ?? {})) {
      const count = prose.match(new RegExp(`\\b${escapeRegExp(term)}s?\\b`, 'gi'))?.length ?? 0
      reviewTermCounts.set(term, (reviewTermCounts.get(term) ?? 0) + count)
    }
  }
  for (const [term, maximum] of Object.entries(qualityManifest.reviewTerms ?? {})) {
    if ((reviewTermCounts.get(term) ?? 0) > maximum) {
      editorialFailures.push(`content-quality.json: review new uses of ambiguous term "${term}" and raise its budget only when each use is precise`)
    }
  }
}

// auditGovernance keeps current authoring guidance separate from historical plans, which are retained only as records.
function auditGovernance() {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(governanceManifest.activeAsOf ?? '')) {
    editorialFailures.push('ai/governance.json: activeAsOf must use YYYY-MM-DD')
  }
  const active = new Set(governanceManifest.active ?? [])
  const historical = new Set(governanceManifest.historical ?? [])
  const supporting = new Set(governanceManifest.supporting ?? [])
  for (const relativePath of [...active, ...historical, ...supporting]) {
    if (!fs.existsSync(path.join(repoRoot, relativePath))) {
      editorialFailures.push(`ai/governance.json: listed document ${relativePath} is missing`)
    }
  }
  for (const relativePath of active) {
    const source = fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
    for (const reference of governanceManifest.forbiddenActiveReferences ?? []) {
      if (source.includes(reference)) {
        editorialFailures.push(`${relativePath}: active governance must not reference stale ${reference}`)
      }
    }
  }
  for (const relativePath of aiMarkdownFiles()) {
    if (!active.has(relativePath) && !historical.has(relativePath) && !supporting.has(relativePath)) {
      editorialFailures.push(`ai/governance.json: classify ${relativePath} as active, supporting, or historical`)
    }
  }
}

// auditableMarkdownSources includes public docs and current authoring guidance, but intentionally leaves historical decision records untouched.
function auditableMarkdownSources() {
  const sources = publicMarkdownFiles(docsRoot).map((relativePath) => [relativePath, readDoc(relativePath)])
  for (const relativePath of governanceManifest.active ?? []) {
    sources.push([relativePath, fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')])
  }
  return sources
}

// aiMarkdownFiles returns the governance documents that must have an explicit status.
function aiMarkdownFiles() {
  return fs.readdirSync(path.join(repoRoot, 'ai'), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => path.posix.join('ai', entry.name))
}

// classify resolves the first matching path rule so specific categories can precede a broad fallback.
function classify(relativePath, rules) {
  for (const [pattern, value] of rules) {
    if (globMatches(relativePath, pattern)) return value
  }
  return ''
}

// classifyGoExample requires hand-written examples to declare their intent while generated projections inherit their source-owned category.
function classifyGoExample(relativePath, pageSource, block) {
  const override = classify(relativePath, qualityManifest.examples.rules)
  if (override) return override
  const context = pageSource.slice(Math.max(0, block.index - 120), block.index)
  return context.match(/<!--\s*go-example:\s*([a-z-]+)\s*-->\s*$/)?.[1] ?? 'unclassified'
}

// globMatches supports the small path-pattern vocabulary used by the checked-in quality manifest.
function globMatches(relativePath, pattern) {
  const expression = escapeRegExp(pattern)
    .replace(/\\\{([^}]+)\\\}/g, (_, entries) => `(${entries.split(',').map(escapeRegExp).join('|')})`)
    .replace(/\\\*\\\*\//g, '(?:.*/)?')
    .replace(/\\\*\\\*/g, '.*')
    .replace(/\\\*/g, '[^/]*')
  return new RegExp(`^${expression}$`).test(relativePath)
}

// fencedBlocks returns complete, language-specific fenced blocks and deliberately ignores partial prose snippets.
function fencedBlocks(source, language) {
  const blocks = []
  const expression = new RegExp(`^\`\`\`${escapeRegExp(language)}\\s*\\n([\\s\\S]*?)^\`\`\`\\s*$`, 'gmi')
  for (const match of source.matchAll(expression)) blocks.push({ content: match[1], index: match.index })
  return blocks
}

// goImports extracts imports from a complete Go snippet without requiring that a pedagogical fragment compile as a standalone file.
function goImports(source) {
  const imports = []
  const declaration = /import\s*(?:\(\s*([\s\S]*?)\s*\)|("[^"\n]+"))/g
  for (const match of source.matchAll(declaration)) {
    const entries = match[1] ?? match[2]
    for (const line of entries.split('\n')) {
      const imported = line.match(/^\s*(?:(\.|_|[A-Za-z_]\w*)\s+)?"([^"\n]+)"\s*(?:\/\/.*)?$/)
      if (!imported) continue
      const importPath = imported[2]
      const pathParts = importPath.split('/').filter(Boolean)
      const packageName = pathParts.at(-1)
      imports.push({
        alias: imported[1] ?? (/^v\d+$/.test(packageName) ? pathParts.at(-2) : packageName),
        path: importPath
      })
    }
  }
  return imports
}

// markdownSections returns level-two sections whose headings match expression, including their contents up to the next peer heading.
function markdownSections(source, expression) {
  const sections = []
  const headings = [...source.matchAll(/^##\s+(.+)$/gm)]
  for (const [index, match] of headings.entries()) {
    if (!expression.test(match[1])) continue
    const end = headings[index + 1]?.index ?? source.length
    sections.push(source.slice(match.index, end))
  }
  return sections
}

// escapeRegExp makes source-derived names safe when testing their use in a snippet.
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// auditFrameworkContracts catches documentation drift at the source surfaces that define public defaults and commands.
function auditFrameworkContracts() {
  const cliSource = readDoc('reference/cli.md')
  const makeCommandSource = readDoc('reference/make-commands.md')
  const publicCommandSources = [
    'internal/build/build_cmd.go',
    'internal/build/run_cmd.go',
    'internal/apiindex/cmd.go',
    'internal/generate/cmd.go',
    'internal/forj/new_project_cmd.go',
    'internal/forj/dev_cmd.go',
    'internal/forj/down_cmd.go',
    'internal/forj/project_describe_cmd.go',
    'internal/forj/makeapp/cmd.go',
    'internal/forj/atlas/install.go',
    'internal/forj/atlas/update.go',
    'internal/forj/atlas/doctor.go',
    'internal/forj/atlas/list_skills.go',
    'internal/forj/atlas/make_skill.go',
    'internal/backup/plan_cmd.go',
    'internal/backup/list_cmd.go',
    'internal/backup/create_cmd.go',
    'internal/backup/verify_cmd.go',
    'internal/backup/restore_cmd.go',
    'internal/backup/prune_cmd.go',
    'internal/backup/status_cmd.go'
  ]

  for (const relativePath of publicCommandSources) {
    const source = readFramework(relativePath)
    const command = source.match(/return `name:"([^"]+)"\s+help:/)?.[1]
    if (!command) {
      sourceFailures.push(`${relativePath}: cannot derive the public command name from Signature`)
      continue
    }
    if (!cliSource.includes(`\`forj ${command}`)) {
      sourceFailures.push(`reference/cli.md: document framework command "forj ${command}"`)
    }
  }

  const optionContracts = [
    ['internal/forj/new_project_cmd.go', 'name:"allow-non-empty"', '--allow-non-empty'],
    ['internal/build/build_cmd.go', 'APIIndexStrict bool', '--api-index-strict'],
    ['internal/build/build_cmd.go', 'EnvDefaults    string', '--env-defaults'],
    ['internal/build/build_cmd.go', 'EnvOverrides   string', '--env-overrides'],
    ['internal/apiindex/cmd.go', 'Strict bool', '--strict'],
    ['internal/apiindex/cmd.go', 'Tags   string', '--tags'],
    ['internal/generate/cmd.go', 'Observability bool', '--observability'],
    ['internal/forj/makeapp/cmd.go', 'name:"starter-kit"', '--starter-kit'],
    ['internal/forj/makeapp/cmd.go', 'name:"remove"', '--remove'],
    ['internal/forj/project_describe_cmd.go', 'name:"json"', '--json'],
    ['internal/forj/atlas/options.go', 'AllAgents     bool', '--all-agents'],
    ['internal/forj/atlas/options.go', 'NoInteraction bool', '--no-interaction'],
    ['internal/forj/atlas/options.go', 'DryRun        bool', '--dry-run']
  ]

  for (const [relativePath, sourceToken, docsToken] of optionContracts) {
    if (!readFramework(relativePath).includes(sourceToken)) {
      sourceFailures.push(`${relativePath}: CLI audit source token changed: ${sourceToken}`)
    } else if (!cliSource.includes(`\`${docsToken}\``)) {
      sourceFailures.push(`reference/cli.md: document framework option ${docsToken}`)
    }
  }

  auditMakeCommandReference(makeCommandSource)

  const envTemplate = readFramework('templates/.env.tmpl')
  const timezone = envTemplate.match(/^TZ=(.+)$/m)?.[1]?.trim()
  const envReference = readDoc('reference/env-vars.md')
  if (!timezone) {
    sourceFailures.push('templates/.env.tmpl: cannot derive the generated TZ default')
  } else if (!envReference.includes(`| \`TZ\` | \`${timezone}\` |`)) {
    sourceFailures.push(`reference/env-vars.md: generated TZ default must match ${timezone}`)
  }

  const componentCatalog = readFramework('project/components_catalog.go')
  const defaultDatabase = componentCatalog
    .match(/\{Key: ComponentDatabase(\w+),[^\n]+DefaultSelected: true,[^\n]+ExclusiveGroup: "database"/)?.[1]
    ?.toLowerCase()
  const driversReference = readDoc('drivers.md')
  if (!defaultDatabase) {
    sourceFailures.push('project/components_catalog.go: cannot derive the default database component')
  } else {
    const databaseSection = markdownSection(driversReference, 'Database')
    const defaultRow = databaseSection.split('\n').find((line) => line.startsWith(`| \`${defaultDatabase}\` |`))
    if (!defaultRow?.includes('current `forj new` default')) {
      sourceFailures.push(`drivers.md: identify ${defaultDatabase} as the current forj new default`)
    }
  }

  const coreDependencies = readFramework('internal/coredeps/modules.go')
  const httpxModule = coreDependencies.match(/"github\.com\/goforj\/httpx(?:\/v\d+)?"\s*:\s*"([^"]+)"/)?.[0]
  const httpClientGuide = readDoc('applications/http-clients.md')
  if (!httpxModule) {
    sourceFailures.push('internal/coredeps/modules.go: cannot derive the generated App HTTPX module')
  } else {
    const generatedImport = httpxModule.match(/"([^"]+)"/)?.[1]
    if (!httpClientGuide.includes(`"${generatedImport}"`)) {
      sourceFailures.push(`applications/http-clients.md: import ${generatedImport} to match generated App dependencies`)
    }
  }

  auditLatestFrameworkTag()
}

// auditMakeCommandReference derives the generated App command surface from its
// templates so the exhaustive reference cannot silently drift as generators evolve.
function auditMakeCommandReference(reference) {
  const commandSources = [
    ['internal/forj/makeapp/cmd.go', 'make:app'],
    ['templates/internal/makecmd/make_controller_cmd.go.tmpl', 'make:controller'],
    ['templates/internal/makecmd/make_command_cmd.go.tmpl', 'make:command'],
    ['templates/internal/makecmd/make_job_cmd.go.tmpl', 'make:job'],
    ['templates/internal/makecmd/make_queue_cmd.go.tmpl', 'make:queue'],
    ['templates/internal/makecmd/make_schedule_cmd.go.tmpl', 'make:schedule'],
    ['templates/internal/makecmd/make_event_cmd.go.tmpl', 'make:event'],
    ['templates/internal/makecmd/make_subscriber_cmd.go.tmpl', 'make:subscriber'],
    ['templates/internal/makecmd/make_model_cmd.go.tmpl', 'make:model'],
    ['templates/internal/makecmd/make_migration_cmd.go.tmpl', 'make:migration']
  ]

  for (const [relativePath, expectedCommand] of commandSources) {
    const source = readFramework(relativePath)
    const command = source.match(/return `name:"([^"]+)"\s+help:/)?.[1]
    if (command !== expectedCommand) {
      sourceFailures.push(`${relativePath}: expected ${expectedCommand} Signature, found ${command ?? 'none'}`)
      continue
    }
    if (!reference.includes(`### \`${command}\``)) {
      sourceFailures.push(`reference/make-commands.md: document generated command ${command}`)
    }

    for (const match of source.matchAll(/^\s*(\w+)\s+[^`\n]+`([^`]+)`/gm)) {
      const [, field, tags] = match
      if (/\bhidden:"/.test(tags) || !/\b(?:name|short):"/.test(tags)) continue
      const longName = tags.match(/\bname:"([^"]+)"/)?.[1] ?? kebabCase(field)
      const shortName = tags.match(/\bshort:"([^"]+)"/)?.[1]
      if (
        !reference.includes(`--${longName}`) &&
        (!shortName || !new RegExp(`(?:^|[\\s,\`])-${escapeRegExp(shortName)}(?:[\\s,\`]|$)`, 'm').test(reference))
      ) {
        sourceFailures.push(`reference/make-commands.md: document ${command} option --${longName}`)
      }
    }

    for (const defaultPath of source.matchAll(/\bdefault:"(\.\/[^"]+)"/g)) {
      if (!reference.includes(defaultPath[1])) {
        sourceFailures.push(`reference/make-commands.md: document ${command} default output path ${defaultPath[1]}`)
      }
    }
  }

  const outputContracts = [
    ['templates/internal/makecmd/make_controller_cmd.go.tmpl', 'controller.go'],
    ['templates/internal/makecmd/make_command_cmd.go.tmpl', 'inject_cmd_app.go'],
    ['templates/internal/makecmd/make_job_cmd.go.tmpl', 'inject_jobs_app.go'],
    ['templates/internal/makecmd/make_schedule_cmd.go.tmpl', 'schedules.go'],
    ['templates/internal/makecmd/make_subscriber_cmd.go.tmpl', 'inject_subscribers_app.go'],
    ['templates/internal/makecmd/make_model_cmd.go.tmpl', 'inject_repositories_app.go'],
    ['templates/internal/makecmd/make_migration_cmd.go.tmpl', '.up.sql']
  ]
  for (const [relativePath, outputToken] of outputContracts) {
    if (!readFramework(relativePath).includes(outputToken)) {
      sourceFailures.push(`${relativePath}: make-command output contract changed: ${outputToken}`)
    } else if (!reference.includes(outputToken)) {
      sourceFailures.push(`reference/make-commands.md: document generated output ${outputToken}`)
    }
  }
}

// kebabCase mirrors Kong's field-name convention for options whose templates
// specify only a short form.
function kebabCase(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

// auditLatestFrameworkTag keeps release-facing labels tied to the framework repository without changing the main-branch navbar label.
function auditLatestFrameworkTag() {
  if (!fs.existsSync(path.join(frameworkRoot, '.git'))) return

  let latestTag = ''
  try {
    latestTag = execFileSync('git', ['-C', frameworkRoot, 'tag', '--sort=-version:refname'], { encoding: 'utf8' })
      .split('\n')
      .find(Boolean) ?? ''
  } catch {
    return
  }
  if (!latestTag) return

  const versions = readDoc('versions/index.md')
  const config = fs.readFileSync(path.join(docsRoot, '.vitepress', 'config.mts'), 'utf8')
  const releasePath = path.join(docsRoot, '.vitepress', 'data', 'release.json')
  const release = JSON.parse(fs.readFileSync(releasePath, 'utf8'))
  if (release.latest !== latestTag) {
    sourceFailures.push(`.vitepress/data/release.json: latest release must match ${latestTag}`)
  }
  if (!new RegExp(`^## ${escapeRegExp(release.latest)}$`, 'm').test(readDoc('versions/changelog.md'))) {
    sourceFailures.push(`versions/changelog.md: add a heading for latest release ${release.latest}`)
  }
  if (!versions.includes('`%%LATEST_RELEASE%%` is the latest tagged framework release') || !versions.includes('#%%LATEST_RELEASE_ANCHOR%%')) {
    sourceFailures.push('versions/index.md: latest tagged framework release must use .vitepress/data/release.json')
  }
  if (
    !config.includes("import release from './data/release.json'") ||
    !config.includes('Latest tag ${release.latest}') ||
    !config.includes('expandReleaseTokens') ||
    !config.includes('const releaseAnchor = release.latest')
  ) {
    sourceFailures.push('.vitepress/config.mts: latest tag navigation must use .vitepress/data/release.json')
  }
}

// auditEventDriverParity compares checked-in proof data and the public table with independently publishable event modules.
function auditEventDriverParity() {
  const rootDriverSource = fs.readFileSync(path.join(eventsRoot, 'eventscore', 'driver.go'), 'utf8')
  const drivers = []
  for (const [name, pattern] of [
    ['sync', /\bDriverSync\s+Driver\s*=/],
    ['null', /\bDriverNull\s+Driver\s*=/]
  ]) {
    if (pattern.test(rootDriverSource)) drivers.push(name)
  }

  const driverModules = fs.readdirSync(path.join(eventsRoot, 'driver'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(eventsRoot, 'driver', entry.name, 'go.mod')))
    .map((entry) => entry.name.replace(/events$/, ''))
    .map((name) => name === 'natsjetstream' ? 'jetstream' : name)
  const sourceDrivers = [...new Set([...drivers, ...driverModules])].sort()

  const proofStats = JSON.parse(
    fs.readFileSync(path.join(docsRoot, '.vitepress', 'data', 'proof-stats.json'), 'utf8')
  )
  const proofDrivers = [...proofStats.drivers.events].sort()
  if (sourceDrivers.join('\0') !== proofDrivers.join('\0')) {
    sourceFailures.push(`.vitepress/data/proof-stats.json: event drivers must match published modules (${sourceDrivers.join(', ')})`)
  }

}

// auditDriverTableParity keeps the public decision matrix tied to the source-discovered proof data for every swap category.
function auditDriverTableParity() {
  const proofStats = readJSON(path.join(docsRoot, '.vitepress', 'data', 'proof-stats.json'))
  const headings = { queue: 'Queue', events: 'Events', cache: 'Cache', storage: 'Storage', mail: 'Mail', database: 'Database' }
  for (const [category, heading] of Object.entries(headings)) {
    const proofDrivers = [...(proofStats.drivers[category] ?? [])].sort()
    const tableDrivers = markdownSection(readDoc('drivers.md'), heading)
      .split('\n')
      .map((line) => line.match(/^\| `([^`]+)` \|/)?.[1])
      .filter(Boolean)
      .sort()
    if (proofDrivers.join('\0') !== tableDrivers.join('\0')) {
      sourceFailures.push(`drivers.md: ${category} table must match source-discovered proof data (${proofDrivers.join(', ')})`)
    }
  }
}

// markdownSection returns the body of one level-two Markdown section.
function markdownSection(source, heading) {
  const marker = `## ${heading}`
  const start = source.indexOf(marker)
  if (start === -1) return ''
  const bodyStart = start + marker.length
  const next = source.indexOf('\n## ', bodyStart)
  return source.slice(bodyStart, next === -1 ? undefined : next)
}

// readDoc loads one path relative to the public documentation root.
function readDoc(relativePath) {
  return fs.readFileSync(path.join(docsRoot, relativePath), 'utf8')
}

// readFramework loads one authoritative framework source file.
function readFramework(relativePath) {
  return fs.readFileSync(path.join(frameworkRoot, relativePath), 'utf8')
}

// readJSON loads small checked-in manifests whose data is part of the documentation contract.
function readJSON(absolutePath) {
  return JSON.parse(fs.readFileSync(absolutePath, 'utf8'))
}

// publicMarkdownFiles returns site pages while excluding dependencies and build output.
function publicMarkdownFiles(root) {
  const files = []
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.vitepress') {
        continue
      }
      const absolutePath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        visit(absolutePath)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(path.relative(root, absolutePath).split(path.sep).join('/'))
      }
    }
  }
  visit(root)
  return files.sort()
}

// readFrontmatter returns the small scalar metadata surface used by this audit.
function readFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---(?:\n|$)/)
  if (!match) return {}

  const values = {}
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':')
    if (separator === -1) continue
    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/, '$2')
    values[key] = value
  }
  return values
}

// stripFrontmatter keeps content checks independent from metadata wording.
function stripFrontmatter(source) {
  return source.replace(/^---\n[\s\S]*?\n---(?:\n|$)/, '')
}

// firstProseParagraph finds the task outcome without counting headings or markup.
function firstProseParagraph(source) {
  for (const block of source.split(/\n\s*\n/)) {
    const value = block.trim()
    if (
      value &&
      !value.startsWith('#') &&
      !value.startsWith('<') &&
      !value.startsWith('```') &&
      !value.startsWith(':::')
    ) {
      return value
    }
  }
  return ''
}

// trackedFiles allows source archives without Git metadata while protecting repository builds.
function trackedFiles() {
  if (!fs.existsSync(path.join(repoRoot, '.git'))) return []
  return execFileSync('git', ['-C', repoRoot, 'ls-files', '-z'], { encoding: 'utf8' })
    .split('\0')
    .filter(Boolean)
}
