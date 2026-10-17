// comparablePerformanceData checks measured content while preserving recorded source provenance.
export function comparablePerformanceData(data) {
  const comparable = structuredClone(data)
  delete comparable.generatedAt
  // Squash merges can change the containing commit without changing an artifact's bytes.
  for (const source of comparable.sources) delete source.revision
  return comparable
}
