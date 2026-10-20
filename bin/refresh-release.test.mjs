import assert from 'node:assert/strict'
import test from 'node:test'
import { publishedVersion } from './refresh-release.mjs'

test('uses the published stable tag rather than release title or creation date', () => {
  assert.equal(publishedVersion({ tag_name: 'v0.35.0', name: 'OpenAPI upgrades', draft: false, prerelease: false }), 'v0.35.0')
})

test('rejects drafts, prereleases, and malformed tags before replacing metadata', () => {
  for (const release of [
    { tag_name: 'v0.35.0', draft: true },
    { tag_name: 'v0.36.0', prerelease: true },
    { tag_name: 'v0.36.0-rc.1' },
    { tag_name: 'main' },
    {}
  ]) assert.throws(() => publishedVersion(release))
})
