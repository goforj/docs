// projectionTravelContains protects the path from a source chip to every choice in its catalog.
export function projectionTravelContains(point, source, catalog) {
  const margin = 12
  if (point.x >= catalog.left - margin && point.x <= catalog.right + margin &&
    point.y >= catalog.top - margin && point.y <= catalog.bottom + margin) return true
  const end = catalog.bottom + margin
  if (end >= source.bottom || point.y < end || point.y > source.bottom) return false
  const progress = (source.bottom - point.y) / (source.bottom - end)
  const left = source.left + (catalog.left - margin - source.left) * progress
  const right = source.right + (catalog.right + margin - source.right) * progress
  return point.x >= left && point.x <= right
}
