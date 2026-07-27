import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const repoRoot = path.resolve(docsRoot, '..')

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

if (failures.length > 0) {
  console.error('Documentation value audit failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log(`Documentation value audit passed (${taskPages.length} task pages checked).`)

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
