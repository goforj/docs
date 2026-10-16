// pageMarkdown removes page configuration while preserving executable code examples.
export function pageMarkdown(source) {
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '')
  let fence = null
  let hiddenBlock = null
  const lines = []
  for (const line of body.split('\n')) {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/)
    if (!hiddenBlock && marker) {
      if (!fence) fence = marker[1]
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null
      lines.push(line)
      continue
    }
    if (!fence) {
      const start = line.match(/^\s*<(script|style)\b/i)
      if (start) hiddenBlock = start[1].toLowerCase()
      if (hiddenBlock) {
        if (new RegExp(`</${hiddenBlock}>`, 'i').test(line)) hiddenBlock = null
        continue
      }
    }
    lines.push(line)
  }
  return `${lines.join('\n').trim()}\n`
}

// markdownPath keeps each export aligned with the public route, including library rewrites.
export function markdownPath(relativePath) {
  return `markdown/${relativePath}`
}
