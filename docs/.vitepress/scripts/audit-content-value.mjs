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

const scenarioRoot = path.join(docsRoot, 'scenarios')
for (const entry of fs.readdirSync(scenarioRoot, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md') {
    taskPages.push(path.posix.join('scenarios', entry.name))
  }
}

const failures = []

for (const relativePath of publicMarkdownFiles(docsRoot)) {
  const source = fs.readFileSync(path.join(docsRoot, relativePath), 'utf8')
  const frontmatter = readFrontmatter(source)
  if (!frontmatter.description) {
    failures.push(`${relativePath}: add a concrete frontmatter description`)
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
      failures.push(`${relativePath}: task page needs ${requirement}`)
    }
  }
}

for (const trackedPath of trackedFiles()) {
  if (
    fs.existsSync(path.join(repoRoot, trackedPath)) &&
    (
      trackedPath === 'backend/.env' ||
      trackedPath === 'docs/.env' ||
      trackedPath.includes('.fuse_hidden')
    )
  ) {
    failures.push(`${trackedPath}: local environment or filesystem artifact must not be tracked`)
  }
}

if (fs.existsSync(frameworkRoot)) {
  auditFrameworkContracts()
}

if (fs.existsSync(eventsRoot)) {
  auditEventDriverParity()
}

if (failures.length > 0) {
  console.error('Documentation value audit failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log(`Documentation value audit passed (${taskPages.length} task pages checked).`)

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
      failures.push(`${relativePath}: cannot derive the public command name from Signature`)
      continue
    }
    if (!cliSource.includes(`\`forj ${command}`)) {
      failures.push(`reference/cli.md: document framework command "forj ${command}"`)
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
      failures.push(`${relativePath}: CLI audit source token changed: ${sourceToken}`)
    } else if (!cliSource.includes(`\`${docsToken}\``)) {
      failures.push(`reference/cli.md: document framework option ${docsToken}`)
    }
  }

  const envTemplate = readFramework('templates/.env.tmpl')
  const timezone = envTemplate.match(/^TZ=(.+)$/m)?.[1]?.trim()
  const envReference = readDoc('reference/env-vars.md')
  if (!timezone) {
    failures.push('templates/.env.tmpl: cannot derive the generated TZ default')
  } else if (!envReference.includes(`| \`TZ\` | \`${timezone}\` |`)) {
    failures.push(`reference/env-vars.md: generated TZ default must match ${timezone}`)
  }

  const componentCatalog = readFramework('project/components_catalog.go')
  const defaultDatabase = componentCatalog
    .match(/\{Key: ComponentDatabase(\w+),[^\n]+DefaultSelected: true,[^\n]+ExclusiveGroup: "database"/)?.[1]
    ?.toLowerCase()
  const driversReference = readDoc('drivers.md')
  if (!defaultDatabase) {
    failures.push('project/components_catalog.go: cannot derive the default database component')
  } else {
    const databaseSection = markdownSection(driversReference, 'Database')
    const defaultRow = databaseSection.split('\n').find((line) => line.startsWith(`| \`${defaultDatabase}\` |`))
    if (!defaultRow?.includes('current `forj new` default')) {
      failures.push(`drivers.md: identify ${defaultDatabase} as the current forj new default`)
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
    failures.push(`versions/index.md: latest tagged framework release must match ${latestTag}`)
  }
  if (!config.includes(`Latest tag ${latestTag}`)) {
    failures.push(`.vitepress/config.mts: latest tag navigation must match ${latestTag}`)
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
    failures.push(`.vitepress/data/proof-stats.json: event drivers must match published modules (${sourceDrivers.join(', ')})`)
  }

  const tableDrivers = markdownSection(readDoc('drivers.md'), 'Events')
    .split('\n')
    .map((line) => line.match(/^\| `([^`]+)` \|/)?.[1])
    .filter(Boolean)
    .sort()
  if (proofDrivers.join('\0') !== tableDrivers.join('\0')) {
    failures.push(`drivers.md: event table must match proof data (${proofDrivers.join(', ')})`)
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
