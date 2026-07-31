import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import MiniSearch from 'minisearch'

const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const chunksRoot = path.join(docsRoot, '.vitepress', 'dist', 'assets', 'chunks')
const indexFiles = fs.readdirSync(chunksRoot)
  .filter((name) => name.startsWith('@localSearchIndexroot.') && name.endsWith('.js'))

if (indexFiles.length !== 1) {
  throw new Error(`expected one root local-search index, found ${indexFiles.length}`)
}

const serialized = (await import(pathToFileURL(path.join(chunksRoot, indexFiles[0])).href)).default
const options = {
  fields: ['title', 'titles', 'text'],
  storeFields: ['title', 'titles']
}
const searchOptions = {
  boost: { title: 4, titles: 2, text: 1 },
  prefix: true,
  fuzzy: 0.2
}
const index = MiniSearch.loadJSON(serialized, options)
const expectations = [
  ['add route', ['/applications/routes']],
  ['run worker', ['/async/workers', '/operations/queue-workers']],
  ['choose storage driver', ['/data/driver-selection']],
  ['use Redis cache', ['/data/cache-patterns']],
  ['OpenAPI', ['/applications/api-index']]
]

for (const [query, expectedPaths] of expectations) {
  const [first] = index.search(query, searchOptions)
  const pathMatch = first && expectedPaths.some((expected) => first.id === expected || first.id.startsWith(`${expected}#`))
  if (!pathMatch) {
    throw new Error(`search "${query}" should lead with ${expectedPaths.join(' or ')}, got ${first?.id ?? 'no result'}`)
  }
}

console.log(`search quality audit passed (${expectations.length} representative framework queries).`)
