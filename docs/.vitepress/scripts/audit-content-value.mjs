import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const repoRoot = path.resolve(docsRoot, '..')
const frameworkRoot = path.resolve(repoRoot, '../goforj')
const eventsRoot = path.resolve(repoRoot, '../events')

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

for (const relativePath of publicMarkdownFiles(docsRoot)) {
  const source = fs.readFileSync(path.join(docsRoot, relativePath), 'utf8')
  const frontmatter = readFrontmatter(source)
  if (!frontmatter.description) {
    editorialFailures.push(`${relativePath}: add a concrete frontmatter description`)
  }
}

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
  process.exit(1)
}

console.log(`Documentation value audit passed (${taskPages.length} task pages checked).`)
console.log('Editorial contract checks: task outcomes, verification evidence, safe examples, command-surface consistency, and snippet consistency passed.')
console.log('Source contract checks: framework, event-source, dependency-path, and local task-import parity passed where source is available.')
console.log('Go snippets are checked for imports and known source contracts, but are not type-checked here. Rendered-app compilation remains an integration-test responsibility.')

// reportFailures keeps editorial guidance separate from source-backed failures so a content edit is not mistaken for executable proof.
function reportFailures(heading, failures) {
  if (failures.length === 0) return
  console.error(`${heading}:`)
  for (const failure of failures) console.error(`- ${failure}`)
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
  }
}

// fencedBlocks returns complete, language-specific fenced blocks and deliberately ignores partial prose snippets.
function fencedBlocks(source, language) {
  const blocks = []
  const expression = new RegExp(`^\`\`\`${escapeRegExp(language)}\\s*\\n([\\s\\S]*?)^\`\`\`\\s*$`, 'gmi')
  for (const match of source.matchAll(expression)) blocks.push({ content: match[1] })
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
  if (!versions.includes(`\`${latestTag}\` is the latest tagged framework release`)) {
    sourceFailures.push(`versions/index.md: latest tagged framework release must match ${latestTag}`)
  }
  if (!config.includes(`Latest tag ${latestTag}`)) {
    sourceFailures.push(`.vitepress/config.mts: latest tag navigation must match ${latestTag}`)
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

  const tableDrivers = markdownSection(readDoc('drivers.md'), 'Events')
    .split('\n')
    .map((line) => line.match(/^\| `([^`]+)` \|/)?.[1])
    .filter(Boolean)
    .sort()
  if (proofDrivers.join('\0') !== tableDrivers.join('\0')) {
    sourceFailures.push(`drivers.md: event table must match proof data (${proofDrivers.join(', ')})`)
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
