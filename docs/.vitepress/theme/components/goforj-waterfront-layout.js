export const APP_ARTIFACT_HEIGHT = .58
export const HARBOR_ORIGIN = [-1.06, .01, -.16]
export const CARGO_PICKUP = { x: -.34, y: .359, z: .05 }
export const CARGO_BAY = { x: 2.36, y: .569, z: .52 }

// waterfrontLayout keeps the loading pad, cargo path, and dock in the same physical layout.
export function waterfrontLayout(portrait) {
  return portrait
    ? { position: [2.50, .25, 3.65], scale: .80, yaw: .45 }
    : { position: [5.75, .25, 1.55], scale: .90, yaw: .18 }
}

// loadingPoint transforms the actual pickup surface into the board's coordinate system.
export function loadingPoint(portrait) {
  const { position, scale, yaw } = waterfrontLayout(portrait)
  const x = HARBOR_ORIGIN[0] + CARGO_PICKUP.x
  const y = HARBOR_ORIGIN[1] + CARGO_PICKUP.y
  const z = HARBOR_ORIGIN[2] + CARGO_PICKUP.z
  return [position[0] + scale * (Math.cos(yaw) * x + Math.sin(yaw) * z),
    position[1] + scale * y, position[2] + scale * (-Math.sin(yaw) * x + Math.cos(yaw) * z)]
}
