import * as THREE from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { APP_COMPONENTS } from './goforj-app-payload.js'
import { loadingPoint } from './goforj-waterfront-layout.js'
import { compositionCue } from './goforj-cargo-journey.js'

// createMarkGeometry gives the logo system's keyline contours a shallow physical edge and an open center.
function createMarkGeometry(paths) {
  const caps = [], walls = []
  const depth = 1.25
  for (const path of paths) {
    for (const contour of path.subPaths) {
      const stroke = SVGLoader.pointsToStroke(contour.getPoints(), path.userData.style, 6)
      const positions = stroke.getAttribute('position')
      for (let i = 0; i < positions.count; i += 3) {
        for (const index of [i + 2, i + 1, i]) caps.push(positions.getX(index), positions.getY(index), 0)
        for (const index of [i, i + 1, i + 2]) caps.push(positions.getX(index), positions.getY(index), depth)
      }
      const edges = new THREE.EdgesGeometry(stroke)
      const boundary = edges.getAttribute('position')
      for (let i = 0; i < boundary.count; i += 2) {
        const ax = boundary.getX(i), ay = boundary.getY(i)
        const bx = boundary.getX(i + 1), by = boundary.getY(i + 1)
        walls.push(ax, ay, 0, bx, by, 0, ax, ay, depth,
          bx, by, 0, bx, by, depth, ax, ay, depth)
      }
      edges.dispose()
      stroke.dispose()
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([...caps, ...walls], 3))
  geometry.addGroup(0, caps.length / 3, 0)
  geometry.addGroup(caps.length / 3, walls.length / 3, 1)
  geometry.computeVertexNormals()
  const normals = geometry.getAttribute('normal')
  const colors = new Float32Array(normals.count * 3)
  const lightDirection = new THREE.Vector3(-.55, -.70, -.45).normalize()
  const normal = new THREE.Vector3()
  // Neutral shading adds depth without letting scene lighting tint the contour edges.
  for (let i = 0; i < normals.count; i++) {
    normal.fromBufferAttribute(normals, i)
    const shade = .65 + .20 * Math.max(0, normal.dot(lightDirection)) + .15 * Math.abs(normal.z)
    colors.set([shade, shade, shade], i * 3)
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.translate(-42.005, -100, 0)
  return geometry
}

// buildAppCore connects the capabilities to a continuous GoForj mark and its outgoing app containers.
export function buildAppCore(kit) {
  const { assembly, mesh, box, tube, screw, standard, labelTexture, graphite, copperBright, steel,
    resources, connectResource, marks } = kit
  const core = new THREE.Group()
  core.position.set(.55, 0, -.85)
  core.rotation.y = .58
  core.updateMatrix()
  assembly.add(core)

  const bed = standard('#58646e', .65, .30)
  // The keyline spends brand color on the contours while leaving the machinery visible through the mark.
  const face = new THREE.MeshBasicMaterial({ toneMapped: false })
  const side = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })
  const belt = standard('#1d282f', .08, .72)
  box(2.65, .10, 2.08, graphite, [0, .545, .15], core, .045)
  box(2.50, .045, 1.95, steel, [0, .617, .15], core, .025)
  box(2.35, .025, 1.79, bed, [0, .656, .15], core, .022)
  for (const x of [-1.08, 1.08]) {
    box(.035, .018, 1.58, copperBright, [x, .683, .15], core, .006)
    for (const z of [-.57, .87]) screw(x, .679, z, core)
  }

  const paths = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${marks.GOFORJ_OUTER} ${marks.GOFORJ_COUNTER}" fill="none" stroke="#000" stroke-width="4.2" stroke-linejoin="round"/></svg>`).paths
  const mark = new THREE.Group()
  const markScale = .0192
  mark.position.set(0, .64, .08)
  mark.scale.set(markScale, -markScale, -markScale)
  core.add(mark)
  const body = mesh(createMarkGeometry(paths), [face, side], mark)
  body.userData.goforjMark = true
  body.layers.enable(2)

  const contour = new Path2D(`${marks.GOFORJ_OUTER} ${marks.GOFORJ_COUNTER}`)
  const glowWidth = 104.01, glowHeight = 120
  // contourTexture uses Foundry's crisp white bevel around the orange tube face.
  function contourTexture() {
    const texture = labelTexture((context, width, height) => {
      context.scale(width / glowWidth, height / glowHeight)
      context.translate(10, 10)
      context.lineJoin = 'round'
      context.lineCap = 'round'
      context.strokeStyle = '#fff'
      context.lineWidth = 4.6
      context.stroke(contour)
      context.globalCompositeOperation = 'destination-out'
      context.lineWidth = 3
      context.stroke(contour)
    }, 832, 960)
    texture.flipY = false
    return texture
  }

  const rim = new THREE.MeshBasicMaterial({ map: contourTexture(), color: new THREE.Color(4, 4, 4),
    side: THREE.DoubleSide, transparent: true, depthWrite: false, toneMapped: false })
  const bevel = mesh(new THREE.PlaneGeometry(glowWidth, glowHeight), rim, mark, [0, -50, -.08])
  bevel.castShadow = false
  bevel.receiveShadow = false
  bevel.renderOrder = 2
  bevel.userData.excludeFromFraming = true
  bevel.userData.goforjNeon = 'rim'
  bevel.layers.enable(1)
  let darkTheme = true

  // Angled jaws follow the mark's lower edges so the socket visibly supports its continuous silhouette.
  box(1.24, .045, .28, graphite, [0, .683, 0], core, .012)
  for (const direction of [-1, 1]) {
    const x = direction * .464
    const slope = direction < 0 ? 25.10 / 42.26 : 24.01 / 41.75
    const edgeY = .64 + Math.abs(x - (42.26 - 42.005) * markScale) * slope
    const angle = direction * Math.atan(slope)
    const supportHeight = edgeY - .765
    box(.145, supportHeight, .18, graphite, [x, .70 + supportHeight / 2, 0], core, .010)
    const jaw = box(.368, .056, .22, graphite, [x, edgeY - .046, 0], core, .010)
    jaw.rotation.z = angle
    const lip = box(.376, .014, .020, steel, [x, edgeY - .023, .113], core, .005)
    lip.rotation.z = angle
  }
  box(1.98, .021, .38, graphite, [0, .682, .73], core, .012)
  const bus = standard('#dfa164', .55, .30, { emissive: '#d9823d', emissiveIntensity: .20 })
  tube([[-.95, .716, .93], [0, .716, .93], [.95, .716, .93]], .022, bus, core)
  tube([[0, .716, .93], [0, .716, 1.12]], .033, bus, core)
  for (const x of [-.36, .36]) box(.025, .04, .28, steel, [x, .703, 1.08], core, .006)

  const warmth = new THREE.PointLight('#fff', .16, 2, 2)
  warmth.position.set(0, 1.25, .42)
  core.add(warmth)
  const inspection = new THREE.Group()
  core.add(inspection)
  const contacts = new Map()
  const ports = [
    [-1.34, .53, -.43], [-.55, .53, -.84], [-1.34, .53, .15],
    [1.34, .53, -.29], [-.75, .53, .84], [.25, .53, .84]
  ]
  for (const [index, resource] of resources.entries()) {
    const port = ports[index]
    box(.105, .022, .080, copperBright, port, core, .006)
    connectResource(resource.id, new THREE.Vector3(...port).applyMatrix4(core.matrix).toArray(), index)
    const color = APP_COMPONENTS[index].color
    const indicatorMaterial = standard(color, .30, .36, { emissive: color, emissiveIntensity: .12 })
    const socket = [(index - 2.5) * .30, .706, .73]
    box(.17, .022, .075, indicatorMaterial, socket, core, .006)
    const material = standard(color, .30, .36, { emissive: color, emissiveIntensity: .18, transparent: true, opacity: .62 })
    tube([socket, [socket[0] * .65, .716, .91], [(index - 2.5) * .025, .716, 1.06]], .014, material, inspection)
    contacts.set(resource.id, { indicatorMaterial, material })
  }

  // transportTrack gives the completed app a physical handoff from the forge to the development quay.
  function transportTrack(points) {
    const group = new THREE.Group()
    assembly.add(group)
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)), false, 'centripetal')
    const vertices = [], indices = [], edgePoints = [[], []]
    const count = 48
    for (let i = 0; i <= count; i++) {
      const point = curve.getPointAt(i / count)
      const tangent = curve.getTangentAt(i / count)
      const normal = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize()
      for (const side of [-1, 1]) {
        const edge = point.clone().addScaledVector(normal, side * .36)
        vertices.push(edge.x, edge.y, edge.z, edge.x, edge.y - .038, edge.z)
        edgePoints[side === -1 ? 0 : 1].push([edge.x, edge.y + .013, edge.z])
      }
      if (i < count) {
        const a = i * 4, b = a + 4
        indices.push(a, b, a + 2, a + 2, b, b + 2)
        indices.push(a, b, a + 1, a + 1, b, b + 1)
        indices.push(a + 2, a + 3, b + 2, a + 3, b + 3, b + 2)
      }
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    mesh(geometry, belt, group)
    for (const points of edgePoints) tube(points, .011, steel, group)
    for (const t of [.28, .52, .76]) {
      const point = curve.getPointAt(t), tangent = curve.getTangentAt(t)
      const strip = box(.68, .008, .022, steel, [point.x, point.y + .006, point.z], group, .004)
      strip.rotation.y = Math.atan2(tangent.x, tangent.z)
    }
    for (const t of [.20, .86]) {
      const point = curve.getPointAt(t)
      point.y += .016
      const forward = curve.getTangentAt(t)
      forward.y = 0
      forward.normalize()
      const across = new THREE.Vector3(forward.z, 0, -forward.x)
      const tip = point.clone().addScaledVector(forward, .07)
      const tail = point.clone().addScaledVector(forward, -.07)
      tube([tail.clone().addScaledVector(across, .08), tip, tail.clone().addScaledVector(across, -.08)]
        .map(vertex => vertex.toArray()), .009, copperBright, group)
    }
    return { group, curve }
  }

  const exit = new THREE.Vector3(0, .716, 1.12).applyMatrix4(core.matrix).toArray()
  const tracks = {
    desktop: transportTrack([exit, [1.75, .68, .65], [2.80, .63, 1.55], loadingPoint(false)]),
    mobile: transportTrack([exit, [2.16, .66, .94], [2.36, .60, 2.40], [1.40, .55, 3.18], loadingPoint(true)])
  }
  let currentTrack = tracks.desktop

  return {
    // setBrandColor carries the theme's exact logo token across the keyline and its shallow edges.
    setBrandColor(color, dark) {
      darkTheme = dark
      face.color.set(color)
      side.color.set(color)
    },
    // setLayout keeps the app output connected as the shipping scene folds into portrait.
    setLayout(mobile) {
      tracks.desktop.group.visible = !mobile
      tracks.mobile.group.visible = mobile
      currentTrack = mobile ? tracks.mobile : tracks.desktop
    },
    // outputAt keeps the moving artifact on the same physical track as the visible belt.
    outputAt(value) {
      return { point: currentTrack.curve.getPointAt(value), tangent: currentTrack.curve.getTangentAt(value) }
    },
    inspectionPort: new THREE.Vector3(-.55, .710, .95).applyMatrix4(core.matrix),
    // update keeps the mark intact while inspection and hover expose the capability connections at its base.
    update(openValue, phase = 0, motion = false, activeId = 'app', journeySeconds = 0) {
      const glow = motion || journeySeconds > 0 ? compositionCue(journeySeconds).glow : 0
      for (const [id, contact] of contacts) {
        const active = id === activeId
        contact.indicatorMaterial.emissiveIntensity = active ? .75 : .12 + openValue * .24 + glow * .80
        contact.material.opacity = active ? .94 : .62 + openValue * .16 + glow * .16
        contact.material.emissiveIntensity = .18 + glow * .65
      }
      bus.emissiveIntensity = .26 + openValue * .12 + glow * .85
      rim.opacity = .95 + glow * .05
      warmth.intensity = (darkTheme ? .16 : .08) + glow * (darkTheme ? .20 : .10)
    }
  }
}
