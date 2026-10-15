import * as THREE from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'

export const APP_COMPONENTS = [
  { id: 'database', color: '#508c87' },
  { id: 'cache', color: '#826597' },
  { id: 'storage', color: '#c99145' },
  { id: 'events', color: '#5689a0' },
  { id: 'queue', color: '#db6f3d' },
  { id: 'mail', color: '#ddd7c9' }
]

// createAppPayloadBuilder gives every app container the same casing, component colors, and original mark.
export function createAppPayloadBuilder({ mesh, box, standard, steel, graphite, copperBright, marks }) {
  const shell = standard('#cfb994', .38, .36)
  const front = standard('#26333c', .4, .32)
  const inlay = standard('#ff9b51', .42, .30, { emissive: '#ff873c', emissiveIntensity: .36 })
  const stripeMaterials = APP_COMPONENTS.map(({ color }) => standard(color, .20, .36))
  const paths = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${marks.GOFORJ_OUTER} ${marks.GOFORJ_COUNTER}" fill-rule="evenodd"/></svg>`).paths
  const geometries = paths.flatMap(path => SVGLoader.createShapes(path)).map(shape => {
    const geometry = new THREE.ShapeGeometry(shape)
    geometry.translate(-42.005, -50, 0)
    return geometry
  })

  // buildAppPayload keeps the artifact independent from the central mark's lighting and finishes.
  return function buildAppPayload(parent, { height, position, rotationY = .58 }) {
    const finishes = new Map()
    // finish isolates the container's fade while sharing theme colors with the board's metalwork.
    function finish(material) {
      if (!finishes.has(material)) {
        const copy = material.clone()
        copy.color = material.color
        copy.emissive = material.emissive
        finishes.set(material, copy)
      }
      return finishes.get(material)
    }
    const group = new THREE.Group()
    group.userData.appArtifact = true
    group.position.set(...position)
    group.rotation.y = rotationY
    group.scale.setScalar(height)
    parent.add(group)
    box(1.14, .06, .90, finish(graphite), [0, .06, 0], group, .022)
    box(1.20, 1.00, .96, finish(shell), [0, .53, 0], group, .045)
    box(1.13, .055, .90, finish(steel), [0, 1.052, 0], group, .022)
    for (const x of [-.43, .43]) box(.025, .025, .73, finish(copperBright), [x, 1.09, 0], group, .005)
    const plate = box(.91, .70, .025, finish(front), [0, .60, .491], group, .018)
    for (const geometry of geometries) {
      const mark = mesh(geometry, finish(inlay), plate, [0, 0, .016])
      const scale = .0056
      mark.scale.set(scale, -scale, scale)
    }
    for (const [index, material] of stripeMaterials.entries()) {
      box(.095, .064, .018, finish(material), [(index - 2.5) * .114, .115, .510], group, .004)
    }
    return {
      group,
      // setOpacity hides the reset and prevents a fading container from casting a solid shadow.
      setOpacity(value) {
        group.visible = value > 0
        for (const material of finishes.values()) {
          const transparent = value < 1
          if (material.transparent !== transparent) {
            material.transparent = transparent
            material.needsUpdate = true
          }
          material.opacity = value
          material.depthWrite = !transparent
        }
        group.traverse(object => { if (object.isMesh) object.castShadow = value === 1 })
      }
    }
  }
}
