import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptRoot = path.dirname(fileURLToPath(import.meta.url))
const docsRoot = path.resolve(scriptRoot, '../..')
const manifestPath = path.join(docsRoot, '.vitepress', 'data', 'security-coverage.json')
const outputPath = path.join(docsRoot, 'security', 'repository-coverage.md')
const assessmentPath = path.join(docsRoot, 'security', 'enterprise-assessment.md')
const check = process.argv.includes('--check')
const assessmentStart = '<!-- security-coverage:assessment:start -->'
const assessmentEnd = '<!-- security-coverage:assessment:end -->'

const expectedRepositories = [
  '.github', 'atlas', 'cache', 'collection', 'console', 'crypt', 'demo-repository', 'docs',
  'env', 'events', 'execx', 'godump', 'goforj', 'httpx', 'mail', 'metrics', 'null', 'queue',
  'scheduler', 'storage', 'str', 'web', 'wire'
]
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

validateManifest(manifest)
const output = renderCoverage(manifest)
const assessment = renderAssessment(manifest, fs.readFileSync(assessmentPath, 'utf8'))

if (check) {
  if (
    !fs.existsSync(outputPath) ||
    fs.readFileSync(outputPath, 'utf8') !== output ||
    fs.readFileSync(assessmentPath, 'utf8') !== assessment
  ) {
    throw new Error('security repository coverage is stale; run npm run security:refresh')
  }
  console.log(`security repository coverage is current: ${outputPath}`)
} else {
  fs.writeFileSync(outputPath, output)
  fs.writeFileSync(assessmentPath, assessment)
  console.log(`wrote ${outputPath}`)
  console.log(`updated ${assessmentPath}`)
}

function validateManifest(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.reviewed)) {
    throw new Error('security coverage reviewed date must use YYYY-MM-DD')
  }

  const profileNames = new Set(Object.keys(value.profiles ?? {}))
  if (profileNames.size === 0) throw new Error('security coverage must define profiles')
  const groupNames = new Set(Object.keys(value.groups ?? {}))
  if (groupNames.size === 0) throw new Error('security coverage must define assessment groups')

  const actualRepositories = value.repositories.map((repository) => repository.name)
  assertUnique(actualRepositories, 'included repository')
  assertExactSet(actualRepositories, expectedRepositories, 'included repositories')

  for (const repository of value.repositories) {
    if (!repository.role?.trim()) throw new Error(`${repository.name}: role is required`)
    if (!profileNames.has(repository.profile)) {
      throw new Error(`${repository.name}: unknown profile ${repository.profile}`)
    }
    if (!groupNames.has(repository.group)) {
      throw new Error(`${repository.name}: unknown assessment group ${repository.group}`)
    }
  }

  for (const [name, profile] of Object.entries(value.profiles)) {
    if (!profile.name?.trim() || !profile.controls?.trim()) {
      throw new Error(`${name}: profile name and controls are required`)
    }
  }

  for (const [name, group] of Object.entries(value.groups)) {
    if (!group.name?.trim() || !group.focus?.trim()) {
      throw new Error(`${name}: assessment group name and focus are required`)
    }
    if (!value.repositories.some((repository) => repository.group === name)) {
      throw new Error(`${name}: assessment group must contain a repository`)
    }
  }
}

function assertUnique(values, label) {
  if (new Set(values).size !== values.length) throw new Error(`${label} names must be unique`)
}

function assertExactSet(actual, expected, label) {
  const sortedActual = [...actual].sort()
  const sortedExpected = [...expected].sort()
  if (JSON.stringify(sortedActual) !== JSON.stringify(sortedExpected)) {
    throw new Error(`${label} must match the declared ecosystem scope`)
  }
}

function renderCoverage(value) {
  const reviewed = new Date(`${value.reviewed}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
  })
  const lines = [
    '---',
    'title: Repository Coverage',
    'description: Every repository included in the GoForj security assurance baseline, its control profile, and links to current evidence.',
    '---',
    '',
    '# Repository Coverage',
    '',
    `This generated matrix declares the complete GoForj security assurance scope reviewed on **${reviewed}**. Change the authoritative \`.vitepress/data/security-coverage.json\` manifest, then run \`npm run security:refresh\` to update this page.`,
    '',
    '::: info Reading the matrix',
    'A baseline is active only when its configuration is present on the repository default branch. Follow the Evidence link to inspect current runs and artifacts.',
    ':::',
    '',
    '## Control Profiles',
    '',
    '| Profile | Controls |',
    '| --- | --- |'
  ]

  for (const profile of Object.values(value.profiles)) {
    lines.push(`| ${profile.name} | ${profile.controls} |`)
  }

  lines.push('', '## Included Repositories', '', '| Repository | Role | Baseline | Evidence |', '| --- | --- | --- | --- |')
  for (const repository of value.repositories) {
    const repositoryURL = `https://github.com/goforj/${repository.name}`
    const evidenceURL = repository.profile === 'policy' ? `${repositoryURL}/blob/main/SECURITY.md` : `${repositoryURL}/actions`
    const evidenceLabel = repository.profile === 'policy' ? 'Policy' : 'Actions'
    lines.push(`| [${repository.name}](${repositoryURL}) | ${repository.role} | ${value.profiles[repository.profile].name} | [${evidenceLabel}](${evidenceURL}) |`)
  }

  lines.push(
    '',
    '## Coverage Maintenance',
    '',
    'The generator rejects missing, duplicate, or unknown repositories. Repository workflows independently discover manifests so module-level coverage does not depend on this documentation list.',
    '',
    'When the ecosystem scope changes, update the manifest, the generator\'s expected repository set, and the relevant repository controls in the same reviewed change.',
    ''
  )

  return lines.join('\n')
}

function renderAssessment(value, source) {
  const start = source.indexOf(assessmentStart)
  const end = source.indexOf(assessmentEnd)
  if (start === -1 || end === -1 || end < start) {
    throw new Error('enterprise assessment must contain one ordered security coverage marker pair')
  }
  if (source.indexOf(assessmentStart, start + assessmentStart.length) !== -1 || source.indexOf(assessmentEnd, end + assessmentEnd.length) !== -1) {
    throw new Error('enterprise assessment must contain exactly one security coverage marker pair')
  }

  const lines = [
    assessmentStart,
    '<!-- This section is generated from .vitepress/data/security-coverage.json. -->',
    '',
    '| Reviewed Area | Primary Security Focus | Repositories |',
    '| --- | --- | --- |'
  ]
  for (const [groupName, group] of Object.entries(value.groups)) {
    const repositories = value.repositories
      .filter((repository) => repository.group === groupName)
      .map((repository) => `[${repository.name}](https://github.com/goforj/${repository.name})`)
      .join(', ')
    lines.push(`| ${group.name} | ${group.focus} | ${repositories} |`)
  }

  lines.push('', assessmentEnd)

  return `${source.slice(0, start)}${lines.join('\n')}${source.slice(end + assessmentEnd.length)}`
}
