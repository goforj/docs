import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js'
import { simpleIconBodies } from 'virtual:goforj-icons'

const MARK = 'M40.59 0 0 25.06V74.9L42.26 100 84.01 75.99 83.8 29.98 74.4 24.17 80.24 21.88 65.47 12.52 56.15 18.37 56.35 9.94ZM40.43 17.78 40.01 22.31 43.43 24.33 23.04 36.46 22.84 60.81 39.59 71.96 39.39 45.17 60.37 32.81 67.34 37.11 45.67 50.2V62.45L47.88 63.68 68.09 51.93 67.88 65.78 41.93 81.28 16.13 65.18V32.2Z'

// createReferenceMarkGeometry gives the logo system's keyline contours a shallow physical edge and an open center.
function createReferenceMarkGeometry(paths) {
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

// createFoundryScene builds a small manufactured world around the app's shared core.
export function createFoundryScene(host, { modules, resources, dark, onSelect, onLabels, getInsets }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.25
  host.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, .1, 80)
  camera.position.set(8, 7, 10)
  camera.lookAt(0, 1, 0)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const environment = pmrem.fromScene(room, .04)
  scene.environment = environment.texture
  scene.environmentIntensity = .65
  room.dispose()
  pmrem.dispose()
  const assembly = new THREE.Group()
  assembly.rotation.y = -.13
  scene.add(assembly)
  const geometrySet = new Set(), materialSet = new Set(), textures = new Set()
  const targets = [], stations = [], signals = []
  let width = 1, height = 1, frame = 0, elapsed = 0, previous = 0
  let motion = true, paused = false, open = false, selected = 'runtimes', visible = true, disposed = false
  let lastLabels = ''

  // finish keeps reflections soft enough to read as ceramic and machined metal.
  function finish(color, metalness = .25, roughness = .3, extra = {}) {
    const material = new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra })
    materialSet.add(material)
    return material
  }
  const ivory = finish('#d7d5cf', .35, .3)
  const white = finish('#e9e4d8', .18, .3)
  const steel = finish('#adb6bf', .85, .25)
  const graphite = finish('#24282e', .65, .28)
  const charcoal = finish('#41464e', .55, .34)
  const copper = finish('#cf7342', .78, .25)
  const orange = finish('#f36335', .35, .28)
  const brandFace = new THREE.MeshBasicMaterial({ color: '#ff6738', toneMapped: false, side: THREE.DoubleSide })
  materialSet.add(brandFace)
  const amber = finish('#ffb776', .15, .22, { emissive: '#ff762f', emissiveIntensity: .9 })

  // mesh tracks shared resources so route navigation can dispose the whole illustration.
  function mesh(geometry, material, position = [0, 0, 0], parent = assembly) {
    geometrySet.add(geometry)
    const result = new THREE.Mesh(geometry, material)
    result.position.set(...position)
    result.castShadow = true
    result.receiveShadow = true
    parent.add(result)
    return result
  }
  // box rounds visible edges to catch the studio lighting.
  function box(w, h, d, material, position, parent = assembly, radius = .04) {
    return mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(radius, h / 3, w / 3, d / 3)), material, position, parent)
  }
  // cylinder represents turned metal, with enough segments for a clean silhouette.
  function cylinder(radius, height, material, position, parent = assembly) {
    return mesh(new THREE.CylinderGeometry(radius, radius, height, 64), material, position, parent)
  }
  // tube follows an explicit connection between a capability and the app.
  function tube(points, material, radius = .018, parent = assembly) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)))
    mesh(new THREE.TubeGeometry(curve, 36, radius, 8, false), material, [0, 0, 0], parent)
    return curve
  }
  // ring adds the thin metallic trims of the core's machined housing.
  function ring(radius, thickness, material, y, parent = assembly) {
    const result = mesh(new THREE.TorusGeometry(radius, thickness, 12, 96), material, [0, y, 0], parent)
    result.rotation.x = Math.PI / 2
    return result
  }
  // print seats sharp physical lettering on a component without adding DOM chrome.
  function print(text, color, position, size, parent = assembly, vertical = false) {
    const canvas = document.createElement('canvas')
    canvas.width = 768; canvas.height = 128
    const context = canvas.getContext('2d')
    context.font = '500 51px monospace'
    context.fillStyle = color
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(text, 384, 64)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
    textures.add(texture)
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false })
    materialSet.add(material)
    const object = mesh(new THREE.PlaneGeometry(size, size / 6), material, position, parent)
    object.castShadow = false
    if (!vertical) object.rotation.x = -Math.PI / 2
    return object
  }

  scene.add(new THREE.HemisphereLight('#e5efff', '#8b6d55', 2.1))
  const key = new THREE.DirectionalLight('#fff2df', 3.2)
  key.position.set(-4, 9, 6)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: .1, far: 30 })
  key.shadow.normalBias = .03
  key.shadow.bias = -.00015
  key.shadow.radius = 4
  scene.add(key)
  const rim = new THREE.DirectionalLight('#c6e6ff', 2.2)
  rim.position.set(5, 5, -6)
  scene.add(rim)
  const coreLight = new THREE.PointLight('#fff1e5', 8, 6, 2)
  coreLight.position.set(0, 2.2, 0)
  assembly.add(coreLight)

  const groundMaterial = new THREE.ShadowMaterial({ opacity: .15 })
  materialSet.add(groundMaterial)
  const ground = mesh(new THREE.PlaneGeometry(200, 200), groundMaterial, [0, -.26, 0], scene)
  ground.rotation.x = -Math.PI / 2
  ground.castShadow = false

  // The workshop separates infrastructure from the framework's app, UI, and operational tools.
  box(8.2, .18, 6.7, graphite, [0, -.10, 0], assembly, .08)
  box(8.12, .045, 6.62, copper, [0, .015, 0], assembly, .015)
  box(8.2, .14, 6.7, ivory, [0, .10, 0], assembly, .045)
  box(7.98, .035, 6.48, charcoal, [0, .187, 0], assembly, .012)
  for (const x of [-3.86, 3.86]) for (const z of [-3.12, 3.12]) {
    cylinder(.045, .012, graphite, [x, .211, z])
    box(.055, .004, .008, steel, [x, .219, z], assembly, .001)
  }
  print('GOFORJ / APPLICATION WORKSHOP', '#989c9e', [-1.6, .21, 3.06], 2.1)
  print('CODE YOU OWN', '#c9a485', [2.5, .21, 3.06], 1.15)
  ring(1.28, .025, copper, .23)
  cylinder(1.19, .16, graphite, [0, .25, 0])
  cylinder(1.11, .16, steel, [0, .40, 0])
  cylinder(1.03, .24, charcoal, [0, .59, 0])
  for (let n = 0; n < 36; n++) {
    const angle = n / 36 * Math.PI * 2
    const fin = box(.035, .27, .15, steel, [Math.cos(angle) * 1.02, .59, Math.sin(angle) * 1.02])
    fin.rotation.y = -angle
  }
  ring(1.05, .025, amber, .74)
  cylinder(1.09, .07, ivory, [0, .80, 0])

  const crown = new THREE.Group()
  assembly.add(crown)
  cylinder(.89, .1, copper, [0, 1.17, 0], crown)
  cylinder(.84, .08, graphite, [0, 1.25, 0], crown)
  ring(.77, .015, amber, 1.30, crown)
  for (const angle of [Math.PI / 4, Math.PI * .75, Math.PI * 1.25, Math.PI * 1.75]) {
    const x = Math.cos(angle) * .66, z = Math.sin(angle) * .66
    cylinder(.035, .35, steel, [x, .98, z])
    cylinder(.065, .045, copper, [x, .85, z])
  }
  print('GOFORJ / APP CORE', '#aca8a0', [0, 1.295, .55], 1.05, crown)

  const logo = new THREE.Group()
  logo.position.set(0, 1.35, .08)
  logo.rotation.y = .58
  logo.scale.set(.0192, -.0192, -.0192)
  crown.add(logo)
  const paths = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${MARK}" fill="none" stroke="#000" stroke-width="4.2" stroke-linejoin="round"/></svg>`).paths
  brandFace.side = THREE.FrontSide
  const markSide = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })
  materialSet.add(markSide)
  const signBody = mesh(createReferenceMarkGeometry(paths), [brandFace, markSide], [0, 0, 0], logo)
  signBody.layers.enable(2)

  // contourLight gives the reference sign a luminous bevel that alone contributes to bloom.
  function contourLight() {
    const canvas = document.createElement('canvas')
    canvas.width = 832; canvas.height = 960
    const context = canvas.getContext('2d')
    context.scale(canvas.width / 104.01, canvas.height / 120)
    context.translate(10, 10)
    context.lineJoin = 'round'
    context.lineCap = 'round'
    context.strokeStyle = '#fff'
    const contour = new Path2D(MARK)
    context.lineWidth = 4.6
    context.stroke(contour)
    context.globalCompositeOperation = 'destination-out'
    context.lineWidth = 3
    context.stroke(contour)
    const texture = new THREE.CanvasTexture(canvas)
    texture.flipY = false
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
    textures.add(texture)
    const material = new THREE.MeshBasicMaterial({ map: texture, color: new THREE.Color(4, 4, 4), transparent: true,
      depthWrite: false, toneMapped: false, side: THREE.DoubleSide })
    materialSet.add(material)
    const light = mesh(new THREE.PlaneGeometry(104.01, 120), material, [0, -50, -.08], logo)
    light.castShadow = false
    light.receiveShadow = false
    light.renderOrder = 2
    light.layers.enable(1)
  }
  contourLight()
  const glow = cylinder(.49, .012, amber, [0, 1.32, 0], crown)
  glow.material = amber

  resources.forEach((item, index) => {
    const x = -3.08 + index % 2 * .85
    const z = -.68 + Math.floor(index / 2) * .80
    const station = new THREE.Group()
    station.position.set(x, .32, z)
    station.scale.setScalar(.63)
    station.userData.capability = item.id
    assembly.add(station)
    const pigment = finish(item.color, .35, .3)
    const inlay = finish(item.color, .2, .25, { emissive: item.color, emissiveIntensity: .12 })
    box(1.05, .10, 1.02, graphite, [0, .01, 0], station)
    box(1.00, .035, .97, copper, [0, .08, 0], station)
    box(.98, .15, .93, white, [0, .17, 0], station)
    box(.82, .03, .72, pigment, [0, .26, -.035], station)
    for (const a of [-.34, .34]) for (const b of [-.34, .34]) {
      cylinder(.025, .008, steel, [a, .254, b], station)
    }
    print(item.label.toUpperCase(), '#686967', [0, .251, .37], .72, station)
    const indicator = box(.33, .025, .025, inlay, [0, .19, .475], station)
    if (item.id === 'database') {
      for (const y of [.34, .46, .58]) { cylinder(.28, .095, steel, [0, y, -.03], station); cylinder(.275, .018, pigment, [0, y - .057, -.03], station) }
      cylinder(.23, .008, ivory, [0, .632, -.03], station)
    } else if (item.id === 'cache') {
      for (const zz of [-.20, 0, .20]) {
        box(.70, .36, .055, graphite, [0, .47, zz], station)
        for (const xx of [-.23, 0, .23]) box(.18, .24, .068, pigment, [xx, .49, zz], station)
        box(.69, .025, .058, steel, [0, .66, zz], station)
      }
    } else if (item.id === 'storage') {
      cylinder(.30, .05, steel, [0, .32, 0], station)
      cylinder(.26, .012, graphite, [0, .353, 0], station)
      cylinder(.21, .018, steel, [0, .369, 0], station)
      cylinder(.055, .025, copper, [0, .391, 0], station)
      tube([[.30, .39, .2], [.14, .40, -.10], [0, .40, -.13]], pigment, .025, station)
    } else if (item.id === 'queue') {
      box(.72, .08, .59, graphite, [0, .33, 0], station)
      for (let n = 0; n < 7; n++) {
        const roller = mesh(new THREE.CylinderGeometry(.035, .035, .57, 16), steel, [0, .38, -.24 + n * .08], station)
        roller.rotation.z = Math.PI / 2
      }
      for (let n = 0; n < 3; n++) box(.17, .16, .17, n === 1 ? orange : pigment, [0, .48, -.20 + n * .20], station)
    } else if (item.id === 'events') {
      for (const [xx, zz] of [[-.24, .16], [0, -.20], [.24, .16]]) {
        tube([[0, .31, 0], [xx, .31, zz]], copper, .012, station)
        cylinder(.07, .12, steel, [xx, .37, zz], station)
        cylinder(.05, .025, inlay, [xx, .45, zz], station)
      }
      cylinder(.1, .16, pigment, [0, .40, 0], station)
      cylinder(.024, .33, steel, [0, .62, 0], station)
      cylinder(.05, .06, amber, [0, .80, 0], station)
    } else {
      for (let n = 0; n < 3; n++) {
        const letter = box(.62, .045, .40, n === 2 ? white : steel, [0, .33+n*.07, n*.015], station)
        letter.rotation.y = -.12 + n*.08
      }
      tube([[-.27,.50,-.16],[0,.50,.05],[.27,.50,-.16]], copper,.012,station)
    }
    const from = [x + .32, .25, z], to = [-1.18, .25, z * .25]
    tube([from, [(from[0]+to[0])/2, .225, (from[2]+to[2])/2], to], copper, .025)
    const signal = mesh(new THREE.SphereGeometry(.035, 12, 12), inlay, from)
    signals.push({ id: item.id, object: signal, from: new THREE.Vector3(...from), to: new THREE.Vector3(...to), index })
    targets.push(...station.children.filter(child => child.isMesh))
    stations.push({ item, resource: true, group: station, indicator, inlay, label: new THREE.Vector3(x, .5, z) })
  })

  // vendorMark carries the established vendor identities onto the physical frontend and agent panels.
  function vendorMark(name, position, size, parent, horizontal = false) {
    const source = simpleIconBodies[name]
    if (!source) return
    const badge = new THREE.Group()
    badge.position.set(...position)
    badge.scale.set(size / 24, -size / 24, size / 24)
    if (horizontal) badge.rotation.x = -Math.PI / 2
    parent.add(badge)
    const paths = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${source.replaceAll('currentColor', '#fff')}</svg>`).paths
    for (const path of paths) for (const shape of SVGLoader.createShapes(path)) {
      const geometry = new THREE.ShapeGeometry(shape)
      geometry.translate(-12, -12, 0)
      const mark = mesh(geometry, white, [0, 0, 0], badge)
      mark.material = symbolWhite
      mark.castShadow = false
    }
  }
  const symbolWhite = new THREE.MeshBasicMaterial({ color: '#f2eee5', side: THREE.DoubleSide, toneMapped: false })
  materialSet.add(symbolWhite)
  const panelTeal = finish('#5b9994', .3, .35)
  const panelLavender = finish('#a38fa9', .3, .35)
  const panelGold = finish('#c4aa65', .3, .35)
  modules.forEach((item, index) => {
    const group = new THREE.Group()
    group.position.set(item.x, .23, item.z)
    group.userData.capability = item.id
    assembly.add(group)
    const pigment = finish(item.color, .3, .3)
    const inlay = finish(item.color, .1, .25, { emissive: item.color, emissiveIntensity: .12 })
    const isInfrastructure = item.id === 'infrastructure'
    const w = isInfrastructure ? 2.08 : item.id === 'runtimes' ? 1.7 : 1.4
    const d = isInfrastructure ? 2.45 : 1.1
    box(w, .07, d, graphite, [0, 0, 0], group)
    box(w - .04, .018, d - .04, copper, [0, .045, 0], group, .005)
    if (!isInfrastructure) box(w - .08, .08, d - .08, white, [0, .10, 0], group)
    const indicator = box(.4, .018, .025, inlay, [0, .11, d / 2 + .01], group)

    if (item.id === 'frontend') {
      box(.38, .035, .34, steel, [0, .17, 0], group)
      box(.055, .30, .05, steel, [0, .32, -.12], group)
      box(1.22, .83, .07, steel, [0, .83, -.18], group)
      box(1.11, .72, .012, graphite, [0, .83, -.138], group)
      for (const [xx, material] of [[-.37, panelTeal], [0, panelLavender], [.37, orange]]) {
        box(.31, .43, .016, material, [xx, .83, -.124], group)
        box(.24, .018, .018, white, [xx, 1.00, -.110], group)
      }
      vendorMark('vuedotjs', [-.37, .83, -.108], .18, group)
      vendorMark('react', [0, .83, -.108], .19, group)
      print('templ', '#fff5e5', [.37, .83, -.108], .27, group, true)
      print('YOUR FRONTEND', '#777a78', [0, .149, .39], .95, group)
    } else if (item.id === 'atlas') {
      const agentConsole = new THREE.Group()
      agentConsole.position.set(0, .19, -.08)
      agentConsole.rotation.x = -.12
      group.add(agentConsole)
      box(1.28, .91, .09, steel, [0, .57, 0], agentConsole, .045)
      box(1.19, .82, .025, graphite, [0, .57, .056], agentConsole, .025)
      print('ATLAS', '#f2e9df', [0, .88, .075], .60, agentConsole, true)
      for (let n = 0; n < 4; n++) {
        const x = -.45 + n * .30
        box(.255, .30, .018, [panelTeal, copper, panelLavender, graphite][n], [x, .60, .076], agentConsole, .015)
        vendorMark(['openai', 'claude', 'googlegemini', 'githubcopilot'][n], [x, .60, .09], .18, agentConsole)
      }
      print('GUIDANCE / SKILLS / MCP', '#b9c8c1', [0, .34, .075], 1.05, agentConsole, true)
      for (const x of [-.46, .46]) box(.04, .28, .04, copper, [x, .23, -.12], group)
      box(1.20, .035, .30, steel, [0, .19, .28], group)
      for (let n = 0; n < 6; n++) box(.10, .009, .09, graphite, [-.43 + n * .17, .213, .28], group, .002)
      print('ATLAS / AGENT TOOLING', '#777a78', [0, .149, .46], 1.18, group)
    } else if (item.id === 'libraries') {
      for (let n = 0; n < 5; n++) {
        const x = -.44 + n * .22
        const h = [.52, .65, .57, .72, .61][n]
        box(.17, h, .51, [panelTeal, pigment, copper, panelGold, panelTeal][n % 5], [x, .16 + h / 2, 0], group)
        for (const y of [.22, h + .09]) box(.12, .014, .015, white, [x, y, .264], group)
      }
      print('STANDALONE GO LIBRARIES', '#777a78', [0, .149, .41], 1.1, group)
    } else if (item.id === 'runtimes') {
      for (let n = 0; n < 4; n++) {
        const x = -.54 + n * .36
        box(.29, .58, .58, steel, [x, .47, 0], group)
        box(.25, .47, .02, [panelTeal, panelGold, panelLavender, graphite][n], [x, .49, .304], group)
        for (let line = 0; line < 3; line++) box(.15, .016, .012, white, [x, .59 - line * .055, .318], group)
        print(['HTTP','JOBS','SCHED','CLI'][n], '#f4efe5', [x, .34, .32], .23, group, true)
        cylinder(.018, .01, inlay, [x, .765, 0], group)
      }
      print('ONE APP / EXPLICIT WIRING', '#777a78', [0, .149, .43], 1.34, group)
    } else if (item.id === 'lighthouse') {
      cylinder(.31, .12, graphite, [0, .20, 0], group)
      mesh(new THREE.CylinderGeometry(.13, .24, 1.02, 32), white, [0, .76, 0], group)
      for (const x of [-.16, .16]) for (const z of [-.16, .16]) box(.018, .28, .018, steel, [x, 1.41, z], group)
      cylinder(.25, .035, steel, [0, 1.27, 0], group)
      cylinder(.26, .035, graphite, [0, 1.56, 0], group)
      cylinder(.075, .18, amber, [0, 1.40, 0], group)
      mesh(new THREE.ConeGeometry(.30, .17, 32), graphite, [0, 1.66, 0], group)
      box(.42, .30, .045, graphite, [.42, .35, .25], group)
      for (let n = 0; n < 4; n++) box(.22, .012, .008, panelTeal, [.42, .43 - n * .045, .278], group)
      tube([[0,.17,.25],[0,.17,.41],[.42,.17,.41]], pigment,.014,group)
    } else if (item.id === 'development') {
      box(1.12, .07, .64, steel, [0, .20, 0], group)
      const screen = new THREE.Group()
      screen.position.set(0, .26, -.22)
      screen.rotation.x = -.12
      group.add(screen)
      box(1.11, .69, .05, steel, [0, .33, 0], screen)
      box(1.02, .60, .012, graphite, [0, .33, .033], screen)
      print('> forj dev', '#e9b578', [0, .44, .043], .85, screen, true)
      for (let n = 0; n < 3; n++) box(.65 - n * .12, .017, .009, panelTeal, [-.1, .29 - n * .065, .044], screen)
      for (let row = 0; row < 3; row++) for (let key = 0; key < 8; key++) box(.09, .01, .06, graphite, [-.4 + key * .115, .24, .01 + row * .085], group, .002)
    } else if (item.id === 'auth') {
      const shield = new THREE.Shape()
      shield.moveTo(0,.82); shield.lineTo(.38,.66); shield.lineTo(.34,.28); shield.quadraticCurveTo(.27,.06,0,-.06)
      shield.quadraticCurveTo(-.27,.06,-.34,.28); shield.lineTo(-.38,.66); shield.closePath()
      mesh(new THREE.ExtrudeGeometry(shield, { depth:.065, bevelEnabled:true, bevelSize:.015, bevelThickness:.015, bevelSegments:2 }), pigment, [0,.26,0], group)
      mesh(new THREE.CircleGeometry(.075, 24), graphite, [0,.77,.085], group)
      box(.045,.14,.012,graphite,[0,.67,.09],group)
      cylinder(.35,.035,steel,[0,.18,0],group)
      print('AUTH / SESSIONS', '#777a78', [0,.149,.40], 1.02, group)
    }
    if (item.id !== 'infrastructure') {
      const from = new THREE.Vector3(item.x * .78, .225, item.z * .78)
      const to = new THREE.Vector3(item.x * .34, .225, item.z * .34)
      tube([from.toArray(), [from.x, .225, to.z], to.toArray()], copper, .018)
      const pulse = mesh(new THREE.SphereGeometry(.032,12,12), inlay, from.toArray())
      signals.push({ id:item.id, object:pulse, from, to, index:index + 6 })
    }
    group.traverse(child => { if (child.isMesh) targets.push(child) })
    stations.push({ item, group, inlay, indicator, label:new THREE.Vector3(item.x * 1.13, .35, item.z * 1.13) })
  })

  // The outgoing app follows one visible belt from the shared core to the edge.
  box(.57, .06, 1.46, graphite, [0, .25, 2.12])
  for (let n = 0; n < 13; n++) {
    const roller = mesh(new THREE.CylinderGeometry(.025, .025, .47, 12), steel, [0, .29, 1.52 + n * .10])
    roller.rotation.z = Math.PI / 2
  }
  for (const x of [-.29, .29]) box(.026, .025, 1.5, copper, [x, .30, 2.12])
  const output = new THREE.Group()
  output.position.set(0, 0, 2.84)
  assembly.add(output)
  box(.44, .34, .36, orange, [0, .49, 0], output)
  for (const x of [-.16, -.08, 0, .08, .16]) box(.012, .26, .01, copper, [x, .49, .186], output)
  print('APP', '#ffe5c4', [0, .49, .193], .32, output, true)

  // setTheme keeps the object lit consistently while changing the backdrop's contact shadow.
  function setTheme(isDark) {
    const brandColor = getComputedStyle(document.documentElement).getPropertyValue('--gf-accent').trim()
    brandFace.color.set(brandColor || '#ff5e3a')
    markSide.color.copy(brandFace.color)
    bloomPass.strength = isDark ? 1.2 : .75
    groundMaterial.opacity = isDark ? .17 : .12
    scene.environmentIntensity = isDark ? .55 : .7
    renderer.toneMappingExposure = isDark ? 1.12 : 1.25
  }
  // setSelected adds a quiet lamp rather than changing every material on hover.
  function setSelected(id) {
    selected = id
    for (const station of stations) station.inlay.emissiveIntensity = (station.item.id === id || (id === 'infrastructure' && station.resource)) ? 1.3 : .12
  }
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2()
  // hit resolves decorative meshes back to their owning capability.
  function hit(event) {
    const bounds = host.getBoundingClientRect()
    pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1)
    raycaster.setFromCamera(pointer, camera)
    const intersection = raycaster.intersectObjects(targets)[0]
    let object = intersection?.object
    while (object && !object.userData.capability) object = object.parent
    return object?.userData.capability
  }
  // move previews the pointed module while keeping the composition stationary.
  function move(event) {
    const id = hit(event)
    host.style.cursor = id ? 'pointer' : 'default'
    if (id && event.pointerType === 'mouse') onSelect(id, false)
  }
  // click supports touch selection of the same physical components.
  function click(event) { const id = hit(event); if (id) onSelect(id, true) }
  host.addEventListener('pointermove', move)
  host.addEventListener('click', click)

  // layout projects labels from actual module positions after resizing.
  function layout() {
    assembly.updateMatrixWorld()
    const labels = stations.filter(station => !station.resource || station.item.id === selected).map(station => {
      const projected = station.label.clone().applyMatrix4(assembly.matrixWorld).project(camera)
      return { id: station.item.id, label: station.item.sceneLabel || station.item.label, x: Math.max(48, Math.min(width - 48, (projected.x + 1) * width / 2)), y: (-projected.y + 1) * height / 2 }
    })
    const stamp = labels.map(item => `${Math.round(item.x)},${Math.round(item.y)}`).join(';')
    if (stamp !== lastLabels) { onLabels(labels); lastLabels = stamp }
  }
  const bloomComposer = new EffectComposer(renderer)
  bloomComposer.renderToScreen = false
  bloomComposer.addPass(new RenderPass(scene, camera))
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 1.2, 0, .8)
  bloomComposer.addPass(bloomPass)
  bloomPass.compositeMaterial.uniforms.bloomFactors.value = [1, .35, .10, .02, 0]
  const faceMask = new THREE.WebGLRenderTarget(1, 1)
  const faceMaskMaterial = new THREE.MeshBasicMaterial({ color: '#fff', side: THREE.DoubleSide, toneMapped: false })
  const bloomOverlayMaterial = new THREE.ShaderMaterial({
    uniforms: { bloomTexture: { value: bloomPass.renderTargetsHorizontal[0].texture }, faceMask: { value: faceMask.texture } },
    vertexShader: 'varying vec2 bloomUv; void main() { bloomUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform sampler2D bloomTexture;
      uniform sampler2D faceMask;
      varying vec2 bloomUv;
      void main() {
        vec3 radiance = max(texture2D(bloomTexture, bloomUv).rgb - vec3(.012), vec3(0.0));
        float protection = 1.0 - texture2D(faceMask, bloomUv).r * .92;
        gl_FragColor = vec4((vec3(1.0) - exp(-radiance * .48)) * protection, 1.0);
        #include <colorspace_fragment>
        gl_FragColor.a = max(max(gl_FragColor.r, gl_FragColor.g), gl_FragColor.b);
      }`,
    transparent: true, depthTest: false, depthWrite: false, toneMapped: false,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
    blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor
  })
  const bloomOverlay = new FullScreenQuad(bloomOverlayMaterial)

  // draw isolates the hot white bevel, then adds its light without blooming the orange face or scenery.
  function draw() {
    camera.layers.set(2)
    scene.overrideMaterial = faceMaskMaterial
    renderer.setRenderTarget(faceMask)
    renderer.render(scene, camera)
    renderer.setRenderTarget(null)
    scene.overrideMaterial = null
    camera.layers.set(1)
    bloomComposer.render()
    camera.layers.set(0)
    renderer.render(scene, camera)
    renderer.autoClear = false
    bloomOverlay.render(renderer)
    renderer.autoClear = true
  }
  // fitBounds measures the actual workbench in camera space at either assembly height.
  function fitBounds(crownHeight) {
    const bounds = new THREE.Box2()
    const point = new THREE.Vector3()
    const crownY = crown.position.y
    crown.position.y = crownHeight
    assembly.updateMatrixWorld(true)
    camera.updateMatrixWorld(true)
    assembly.traverse(object => {
      if (!object.isMesh) return
      if (!object.geometry.boundingBox) object.geometry.computeBoundingBox()
      const local = object.geometry.boundingBox
      for (const x of [local.min.x, local.max.x]) {
        for (const y of [local.min.y, local.max.y]) {
          for (const z of [local.min.z, local.max.z]) {
            point.set(x, y, z).applyMatrix4(object.matrixWorld).applyMatrix4(camera.matrixWorldInverse)
            bounds.expandByPoint(new THREE.Vector2(point.x, point.y))
          }
        }
      }
    })
    crown.position.y = crownY
    assembly.updateMatrixWorld(true)
    return bounds
  }
  const closedFraming = fitBounds(0)
  const openFraming = fitBounds(.65)

  // resize uses the overhead explanation's real bounds so the enlarged assembly stays completely visible.
  function resize() {
    width = Math.max(1, host.clientWidth); height = Math.max(1, host.clientHeight)
    renderer.setSize(width, height)
    bloomComposer.setSize(width, height)
    faceMask.setSize(Math.round(width * renderer.getPixelRatio()), Math.round(height * renderer.getPixelRatio()))
    const inset = getInsets()
    const availableWidth = Math.max(120, width - inset.left - inset.right)
    const availableHeight = Math.max(120, height - inset.top - inset.bottom)
    const framing = open ? openFraming : closedFraming
    const size = framing.getSize(new THREE.Vector2())
    const center = framing.getCenter(new THREE.Vector2())
    const scale = Math.min(availableWidth / size.x, availableHeight / size.y) * .99
    const halfWidth = width / scale / 2, halfHeight = height / scale / 2
    const centerX = center.x + (inset.right - inset.left) / (2 * scale)
    // Width-limited scenes sit directly below the explanation instead of centering in unused height.
    const spareHeight = width > 800 ? Math.max(0, availableHeight - size.y * scale) : 0
    const centerY = center.y + (inset.top - inset.bottom - spareHeight) / (2 * scale)
    camera.left = centerX - halfWidth; camera.right = centerX + halfWidth
    camera.top = centerY + halfHeight; camera.bottom = centerY - halfHeight
    camera.updateProjectionMatrix()
    layout()
    draw()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(host)
  const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting })
  intersection.observe(host)
  // render freezes time when motion is disabled and avoids offscreen GPU work.
  function render(time) {
    if (disposed) return
    frame = requestAnimationFrame(render)
    const delta = previous ? Math.min((time - previous) / 1000, .05) : 0
    previous = time
    if (!visible || document.hidden) return
    if (motion && !paused) elapsed += delta
    const target = open ? .65 : 0
    if (!paused) {
      crown.position.y = motion ? THREE.MathUtils.damp(crown.position.y, target, 5, delta) : target
    }
    for (const signal of signals) {
      const t = (elapsed * .24 + signal.index / 6) % 1
      signal.object.position.lerpVectors(signal.from, signal.to, t)
      signal.object.visible = signal.id === selected || (selected === 'infrastructure' && resources.some(item => item.id === signal.id))
    }
    if (!paused) {
      const journey = Math.min((elapsed % 9) / 4.5, 1)
      output.position.z = motion ? 1.42 + journey * 1.42 : 2.84
    }
    coreLight.intensity = 7 + (motion && !paused ? Math.sin(elapsed * 1.4) * .5 : 0)
    layout()
    draw()
  }
  setTheme(dark)
  setSelected(selected)
  resize()
  frame = requestAnimationFrame(render)
  return {
    setTheme, setSelected,
    setMotion(value) { motion = value },
    setPaused(value) { paused = value },
    setOpen(value) { open = value; resize() },
    dispose() {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect(); intersection.disconnect()
      host.removeEventListener('pointermove', move)
      host.removeEventListener('click', click)
      for (const geometry of geometrySet) geometry.dispose()
      for (const material of materialSet) material.dispose()
      for (const texture of textures) texture.dispose()
      environment.dispose()
      faceMask.dispose()
      faceMaskMaterial.dispose()
      bloomPass.dispose()
      bloomComposer.dispose()
      bloomOverlayMaterial.dispose()
      bloomOverlay.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }
}
