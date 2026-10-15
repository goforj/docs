import * as THREE from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { lucideIconBodies } from 'virtual:goforj-icons'
import { APP_COMPONENTS } from './goforj-app-payload.js'
import { buildModuleDetail } from './goforj-module-details.js'

// buildCapabilityBoard connects the infrastructure and companion modules while their choices live in the projection.
export function buildCapabilityBoard(kit) {
  const { assembly, box, mesh, tube, standard,
    steel, ceramic, graphite, copperBright, darkInsert, light,
    targets, cartridges, circuitMaterials, circuitPulses, themeSurfaces } = kit
  const resources = [
    { id: 'database', label: 'Database', icon: 'database', x: -2.40, z: -1.20 },
    { id: 'cache', label: 'Cache', icon: 'zap', x: -2.50, z: .20 },
    { id: 'storage', label: 'Storage', icon: 'hard-drive', x: -1.90, z: 1.60 },
    { id: 'events', label: 'Events', icon: 'git-branch', x: 2.25, z: -.70 },
    { id: 'queue', label: 'Queue', icon: 'rows-3', x: -.40, z: 1.90 },
    { id: 'mail', label: 'Mail', icon: 'mail', x: 1.10, z: 1.78 }
  ].map((resource, index) => ({ ...resource, color: APP_COMPONENTS[index].color }))
  const devices = [
    { id: 'frontend', label: 'Frontend', optionNoun: 'choices', exploreLabel: 'Explore frontend choices', color: '#619992', x: -3.40, z: -2.25 },
    { id: 'atlas', label: 'Atlas', optionNoun: 'agents', exploreLabel: 'Explore Atlas coding agents', color: '#ad7e9a', x: -3.70, z: -.70 },
    { id: 'libraries', label: 'Libraries', optionNoun: 'libraries', exploreLabel: 'Explore core libraries', color: '#9ea785', x: -3.75, z: .60 }
  ]
  const explorable = [...resources, ...devices]
  const groove = standard('#364850', .18, .50)
  const cutEdge = standard('#9aabb4', .65, .30)
  const inlay = standard('#40535b', .32, .52)
  themeSurfaces.push([groove, '#364850', '#273941'], [inlay, '#40535b', '#34454d'])

  // engraveSymbol fits the shared vector artwork to the lid and gives its channels a fine metal lip.
  function engraveSymbol(icon, parent, lift = 0, span = .65) {
    const paths = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${lucideIconBodies[icon].replaceAll('currentColor', '#ffffff')}</svg>`).paths
    const layers = [
      { width: 3.20, material: groove, height: .2085, offset: 0 },
      { width: 2.95, material: cutEdge, height: .2095, offset: .003 },
      { width: 2.35, material: inlay, height: .2105, offset: 0 }
    ]
    let center
    let scale
    for (const layer of layers) {
      const strokes = []
      for (const path of paths) {
        for (const subpath of path.subPaths) {
          const geometry = SVGLoader.pointsToStroke(subpath.getPoints(12), { ...path.userData.style, strokeWidth: layer.width }, 8, .0001)
          if (geometry) strokes.push(geometry)
        }
      }
      const geometry = mergeGeometries(strokes)
      for (const stroke of strokes) stroke.dispose()
      if (!center) {
        geometry.computeBoundingBox()
        center = geometry.boundingBox.getCenter(new THREE.Vector3())
        const size = geometry.boundingBox.getSize(new THREE.Vector3())
        scale = span / Math.max(size.x, size.y)
      }
      geometry.translate(-center.x, -center.y, 0)
      geometry.scale(scale, scale, scale)
      geometry.rotateX(Math.PI / 2)
      // Stroke joins can contain both windings, so every face must point toward the viewer above the lid.
      const indices = []
      const positions = geometry.attributes.position
      for (let index = 0; index < positions.count; index += 3) {
        const ax = positions.getX(index), az = positions.getZ(index)
        const bx = positions.getX(index + 1) - ax, bz = positions.getZ(index + 1) - az
        const cx = positions.getX(index + 2) - ax, cz = positions.getZ(index + 2) - az
        if (bz * cx - bx * cz < 0) indices.push(index, index + 2, index + 1)
        else indices.push(index, index + 1, index + 2)
      }
      geometry.setIndex(indices)
      geometry.computeVertexNormals()
      const symbol = mesh(geometry, layer.material, parent, [layer.offset, layer.height + lift, -.025 + layer.offset])
      symbol.castShadow = false
    }
  }

  // route gives each capability a continuous copper path into the core socket.
  function route(id, points, phase) {
    const material = standard('#bd7544', .55, .32, { emissive: '#ed8f40', emissiveIntensity: .10 })
    circuitMaterials.set(id, material)
    tube(points.map(([x, y, z]) => [x, y - .029, z]), .031, darkInsert)
    const curve = tube(points, .021, material)
    const color = resources.find(resource => resource.id === id).color
    const pulseMaterial = standard(color, .12, .30, { emissive: color, emissiveIntensity: 1.1 })
    const pulse = mesh(new THREE.SphereGeometry(.039, 12, 8), pulseMaterial)
    circuitPulses.push({ object: pulse, curve, phase, id })
  }

  for (const resource of explorable) {
    const device = Boolean(resource.optionNoun)
    // The contact fingers extend beyond the casing so its socket is readable before the wiring lifts.
    box(1.28, .055, device ? .93 : 1.20, graphite, [resource.x, .536, resource.z], assembly, .025)
    box(1.16, .016, device ? .81 : 1.02, steel, [resource.x, .574, resource.z], assembly, .008)
    for (const x of [-.33, -.11, .11, .33]) {
      for (const z of device ? [-.36, .36] : [-.48, .48]) box(.085, .024, .20, copperBright, [resource.x + x, .594, resource.z + z], assembly, .006)
    }
    const cover = new THREE.Group()
    cover.position.set(resource.x, .61, resource.z)
    assembly.add(cover)
    box(1.05, .025, device ? .61 : .81, graphite, [0, .0125, 0], cover, .010)
    const body = box(1.12, .165, device ? .70 : .90, ceramic, [0, .1075, 0], cover, .032)
    body.userData.resource = resource.id
    targets.push(body)
    box(1.01, .016, device ? .57 : .77, steel, [0, .198, -.015], cover, .016)
    const pigment = standard(resource.color, .26, .34)
    box(1.05, .009, .048, pigment, [0, .196, device ? .316 : .416], cover, .004)
    box(1.05, .035, .018, pigment, [0, .178, device ? .351 : .451], cover, .005)
    const previousChildren = new Set()
    cover.traverse(child => previousChildren.add(child))
    buildModuleDetail(resource.id, cover, { box, mesh, tube, steel, graphite, copperBright, inlay, pigment, engraveSymbol })
    cover.traverse(detail => {
      if (detail.isMesh && !previousChildren.has(detail)) {
        detail.userData.resource = resource.id
        targets.push(detail)
      }
    })
    for (const x of [-.475, .475]) {
      mesh(new THREE.CylinderGeometry(.025, .025, .009, 12), steel, cover, [x, .207, device ? -.245 : -.345])
      box(.026, .003, .005, graphite, [x, .213, device ? -.245 : -.345], cover, .001)
    }
    const indicator = mesh(new THREE.SphereGeometry(.021, 12, 8), light, cover, [.435, .108, device ? .355 : .455])
    const hitY = { frontend: .48, cache: .32, atlas: .31, libraries: .39 }[resource.id] ?? .23
    cartridges.set(resource.id, { group: cover, indicator, baseY: .61, openLift: device ? .12 : .32,
      hitY, surfaceY: .211, halfWidth: .56, halfDepth: device ? .35 : .45, emitterZ: device ? .316 : .416 })
    if (device) {
      const material = standard('#718087', .45, .44, { emissive: resource.color, emissiveIntensity: .025 })
      circuitMaterials.set(resource.id, material)
      tube([[resource.x, .528, resource.z + .47], [resource.x, .528, -2.37]], .014, material)
    }
  }

  return {
    resources,
    explorable,
    // connectResource leaves the chip from the edge closest to its matching input on the forge.
    connectResource(id, port, index) {
      const resource = resources.find(item => item.id === id)
      const dx = port[0] - resource.x, dz = port[2] - resource.z
      const horizontal = Math.abs(dx) > Math.abs(dz)
      const x = resource.x + (horizontal ? Math.sign(dx) * .65 : 0)
      const z = resource.z + (horizontal ? 0 : Math.sign(dz) * .61)
      route(id, [[x, .528, z], [horizontal ? port[0] : x, .528, horizontal ? z : port[2]], port], index * .17)
    }
  }
}
