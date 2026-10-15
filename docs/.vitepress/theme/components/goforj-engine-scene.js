import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import * as marks from 'virtual:goforj-marks'
import { createNeonBloom } from './goforj-neon-bloom.js'
import { buildAppCore } from './goforj-app-core.js'
import { createAppPayloadBuilder } from './goforj-app-payload.js'
import { buildCapabilityBoard } from './goforj-capability-board.js'
import { buildEcosystemScene } from './goforj-ecosystem-scene.js'
import { buildEngineSurroundings } from './goforj-engine-surroundings.js'
import { CARGO_TIMELINE, cargoCycle, compositionCue } from './goforj-cargo-journey.js'
import { BUILDING_BLOCK_FAMILIES, driverProjectionLayout } from './goforj-hero-catalog.js'
import { createHologramTour } from './goforj-hologram-tour.js'
import { projectionTravelContains } from './goforj-hologram-pointer.js'
import { createViewportFade } from './goforj-viewport-fade.js'

// createEngineScene owns the illustration's WebGL resources and interactive capability layout.
export function createEngineScene(host, { dark, onReveal, onLayout, onToolsLayout, onJourneyState, getProjectionBounds }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, 2), 3))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, .1, 80)
  camera.position.set(9, 7.5, 11)

  camera.lookAt(-.5, 1.20, .7)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const environment = pmrem.fromScene(room, .04)
  scene.environment = environment.texture
  scene.environmentIntensity = .68
  room.dispose()
  pmrem.dispose()

  const assembly = new THREE.Group()
  assembly.rotation.y = -.16
  scene.add(assembly)
  const neonBloom = createNeonBloom(renderer, scene, camera)
  const geometries = new Set()
  const materials = new Set()
  const textures = new Set()
  const targets = []
  const cartridges = new Map()
  const circuitPulses = []
  const circuitMaterials = new Map()
  const themeSurfaces = []
  const viewportFade = createViewportFade()
  const largestCatalog = Math.max(...Object.values(BUILDING_BLOCK_FAMILIES).map(choices => choices.length))

  // standard keeps material roughness consistent across manufactured parts.
  function standard(color, metalness = .45, roughness = .32, extra = {}) {
    const material = new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra })
    materials.add(material)
    return material
  }

  const steel = standard('#b7bcc2', .7, .24)
  const ceramic = standard('#eeece7', .13, .22)
  const graphite = standard('#30343a', .6, .33)
  const edge = standard('#717880', .7, .3)
  const copper = standard('#c8713b', .7, .25)
  const copperBright = standard('#e8a060', .65, .25)
  const light = standard('#ffcd85', .15, .24, { emissive: '#ffaf55', emissiveIntensity: 1.3 })
  const darkInsert = standard('#343a43', .2, .44)
  const boardFinish = standard('#c6c9cb', .22, .34)
  themeSurfaces.push([steel, '#b7bcc2', '#a8aeb5'], [ceramic, '#eeece7', '#c6c9cb'],
    [edge, '#717880', '#657078'], [boardFinish, '#d2d5d6', '#bac0c6'])

  // mesh records disposable geometry once even when small hardware shares it.
  function mesh(geometry, material, parent = assembly, position = [0, 0, 0]) {
    geometries.add(geometry)
    for (const finish of Array.isArray(material) ? material : [material]) materials.add(finish)
    const object = new THREE.Mesh(geometry, material)
    object.position.set(...position)
    object.castShadow = true
    object.receiveShadow = true
    parent.add(object)
    return object
  }

  // box uses bevels rather than layered silhouettes so highlights stay smooth at hero scale.
  function box(w, h, d, material, position, parent = assembly, radius = .035) {
    return mesh(new RoundedBoxGeometry(w, h, d, 3, radius), material, parent, position)
  }

  // cylinder aligns circular machining and connector pieces with the board's normal.
  function cylinder(radius, height, material, position, parent = assembly, sides = 64) {
    return mesh(new THREE.CylinderGeometry(radius, radius, height, sides), material, parent, position)
  }

  // tube makes every visible copper connection follow its actual 3D route.
  function tube(points, radius, material, parent = assembly) {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)), false, 'centripetal')
    mesh(new THREE.TubeGeometry(curve, 48, radius, 8, false), material, parent)
    return curve
  }

  // labelTexture makes original vector-style instrument printing without network assets.
  function labelTexture(draw, width = 512, height = 256) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    draw(context, width, height)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8)
    textures.add(texture)
    return texture
  }

  // decal stays slightly above the host surface to avoid depth flicker.
  function decal(texture, w, h, position, rotation, parent = assembly) {
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false })
    materials.add(material)
    const object = mesh(new THREE.PlaneGeometry(w, h), material, parent, position)
    object.rotation.set(...rotation)
    object.castShadow = false
    object.receiveShadow = false
    return object
  }

  // screw adds a restrained scale cue to the enclosure, not a decorative wireframe.
  function screw(x, y, z, parent = assembly) {
    cylinder(.047, .022, edge, [x, y, z], parent, 16)
    box(.048, .007, .009, graphite, [x, y + .014, z], parent, .002)
  }

  const ambient = new THREE.HemisphereLight('#fff5e8', '#596375', .70)
  scene.add(ambient)
  const key = new THREE.DirectionalLight('#fff7ed', 3.3)
  key.position.set(-3, 8, 5)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.camera.left = -6
  key.shadow.camera.right = 6
  key.shadow.camera.top = 6
  key.shadow.camera.bottom = -6
  key.shadow.camera.near = .1
  key.shadow.camera.far = 24
  key.shadow.normalBias = .010
  key.shadow.bias = -.00012
  scene.add(key)
  const fill = new THREE.DirectionalLight('#e4eafa', .85)
  fill.position.set(5, 4, -6)
  scene.add(fill)
  const coreLight = new THREE.PointLight('#ffd3b7', 6, 5, 2)
  coreLight.position.set(.15, 2.7, 1.5)
  assembly.add(coreLight)

  const groundMaterial = new THREE.ShadowMaterial({ opacity: .08 })
  materials.add(groundMaterial)
  const ground = mesh(new THREE.PlaneGeometry(20, 20), groundMaterial, assembly, [0, -.14, 0])
  ground.rotation.x = -Math.PI / 2
  ground.castShadow = false
  ground.userData.excludeFromFraming = true
  {
    const contactTexture = labelTexture((ctx, w, h) => {
      const gradient = ctx.createRadialGradient(w / 2, h / 2, 35, w / 2, h / 2, w / 2)
      gradient.addColorStop(0, 'rgba(28, 24, 21, .26)')
      gradient.addColorStop(.65, 'rgba(28, 24, 21, .10)')
      gradient.addColorStop(1, 'rgba(28, 24, 21, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, w, h)
    }, 512, 512)
    const contact = decal(contactTexture, 8.8, 6.4, [0, -.135, 0], [-Math.PI / 2, 0, 0])
    contact.userData.excludeFromFraming = true
  }

  // One connected foundation holds the forge and its capabilities, then steps down into the shipping quay.
  const boardProfile = new THREE.Shape()
  for (const [index, [x, z]] of [[-4.55, -2.90], [2.20, -2.90], [3.12, -1.87], [3.12, 1.60], [1.87, 2.47], [-2.65, 2.47], [-4.55, 1.25]].entries()) {
    if (index === 0) boardProfile.moveTo(x, -z)
    else boardProfile.lineTo(x, -z)
  }
  boardProfile.closePath()
  for (const [y, depth, bevel, material] of [[.06, .27, .05, graphite], [.345, .065, .026, edge], [.425, .055, .025, boardFinish]]) {
    const foundation = mesh(new THREE.ExtrudeGeometry(boardProfile, {
      depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, steps: 1
    }), material, assembly, [0, y, 0])
    foundation.rotation.x = -Math.PI / 2
  }
  for (const [x, z] of [[-3.06, -2.55], [1.78, -2.55], [-2.54, 2.21], [1.69, 2.21]]) {
    cylinder(.11, .12, graphite, [x, .035, z])
    screw(x, .505, z)
  }

  const surroundings = buildEngineSurroundings({ assembly, box, decal, labelTexture, standard, steel, graphite, viewportFade })

  // The App core uses the same machined layers as its capabilities.
  const buildAppPayload = createAppPayloadBuilder({ mesh, box, standard, steel, graphite, copperBright, marks })
  const capabilityBoard = buildCapabilityBoard({ assembly, box, mesh, tube, decal, labelTexture, standard, screw,
    steel, ceramic, graphite, copperBright, darkInsert, light,
    targets, cartridges, circuitMaterials, circuitPulses, themeSurfaces })
  const appCore = buildAppCore({ assembly, mesh, box, tube, screw, standard, labelTexture,
    graphite, copper, copperBright, steel, targets, marks, buildAppPayload, resources: capabilityBoard.resources, connectResource: capabilityBoard.connectResource })

  let beaconMaterial = null
  let lighthouse
  {
    // Lighthouse has its own tower silhouette so observability reads without a tiny screen.
    lighthouse = new THREE.Group()
    lighthouse.position.set(2.22, .51, -1.72)
    lighthouse.scale.setScalar(.76)
    assembly.add(lighthouse)
    cylinder(.43, .07, graphite, [0, .015, 0], lighthouse)
    cylinder(.37, .08, steel, [0, .09, 0], lighthouse)
    const tower = mesh(new THREE.CylinderGeometry(.22, .34, 1.25, 32), ceramic, lighthouse, [0, .755, 0])
    tower.userData.resource = 'lighthouse'
    targets.push(tower)
    cylinder(.33, .06, edge, [0, .18, 0], lighthouse)
    cylinder(.24, .045, copper, [0, 1.37, 0], lighthouse)
    cylinder(.35, .055, graphite, [0, 1.425, 0], lighthouse)
    box(.09, .27, .025, graphite, [0, .69, .29], lighthouse, .02)
    const nameplate = box(.79, .15, .045, graphite, [0, .23, .335], lighthouse, .02)
    const towerLabel = labelTexture((ctx, w, h) => {
      ctx.fillStyle = '#e9dfcc'
      ctx.font = '500 49px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('LIGHTHOUSE', w / 2, h * .66)
    }, 512, 128)
    decal(towerLabel, .73, .13, [0, 0, .027], [0, 0, 0], nameplate)

    const glass = new THREE.MeshPhysicalMaterial({
      color: '#ffe1a7', metalness: .05, roughness: .08,
      transparent: true, opacity: .14, depthWrite: false, side: THREE.DoubleSide
    })
    materials.add(glass)
    const lantern = mesh(new THREE.CylinderGeometry(.278, .278, .37, 32, 1, true), glass, lighthouse, [0, 1.65, 0])
    lantern.castShadow = false
    lantern.userData.resource = 'lighthouse'
    targets.push(lantern)
    beaconMaterial = standard('#ffd184', .1, .2, { emissive: '#ffb85e', emissiveIntensity: 1.4 })
    cylinder(.108, .26, beaconMaterial, [0, 1.65, 0], lighthouse, 32)
    for (let i = 0; i < 8; i++) {
      const angle = Math.PI * i / 4
      cylinder(.014, .39, graphite, [Math.sin(angle) * .284, 1.65, Math.cos(angle) * .284], lighthouse, 8)
    }
    cylinder(.34, .055, graphite, [0, 1.858, 0], lighthouse)
    cylinder(.29, .023, copperBright, [0, 1.895, 0], lighthouse)
    const roof = mesh(new THREE.ConeGeometry(.41, .20, 32), graphite, lighthouse, [0, 2.005, 0])
    roof.userData.resource = 'lighthouse'
    targets.push(roof)
    cylinder(.025, .10, copperBright, [0, 2.15, 0], lighthouse, 16)
    const rail = mesh(new THREE.TorusGeometry(.385, .012, 8, 64), steel, lighthouse, [0, 1.49, 0])
    rail.rotation.x = Math.PI / 2
    for (let i = 0; i < 8; i++) {
      const angle = Math.PI * i / 4
      cylinder(.009, .08, steel, [Math.sin(angle) * .385, 1.475, Math.cos(angle) * .385], lighthouse, 8)
    }
    const beaconLight = new THREE.PointLight('#ffbd73', 1.0, 2.1, 2)
    beaconLight.position.set(0, 1.65, 0)
    lighthouse.add(beaconLight)
    const route = [appCore.inspectionPort.toArray(), [1.20, .70, .25], [1.50, .535, .28], [3.04, .535, .28], [3.04, .535, -1.80], [2.57, .535, -1.80]]
    const routeMaterial = standard('#82bec2', .35, .36, { emissive: '#6ea8ad', emissiveIntensity: .30 })
    themeSurfaces.push([routeMaterial, '#33777c', '#82bec2'])
    circuitMaterials.set('lighthouse', routeMaterial)
    const curve = tube(route, .028, routeMaterial)
    for (const point of [route[0], route[route.length - 1]]) cylinder(.052, .02, routeMaterial, point)
    const returnLight = standard('#b6e1df', .1, .25, { emissive: '#8cc8c8', emissiveIntensity: .9 })
    const pulse = mesh(new THREE.SphereGeometry(.036, 12, 8), returnLight)
    circuitPulses.push({ object: pulse, curve, phase: .18, id: 'lighthouse', returning: true })
  }

  const ecosystemScene = buildEcosystemScene({ assembly, box, mesh, cylinder, tube, decal, labelTexture, standard, screw,
    steel, ceramic, graphite, edge, copperBright, light, marks, buildAppPayload, outputAt: appCore.outputAt, viewportFade })
  const toolAnchors = [...ecosystemScene.tools, {
    id: 'lighthouse', label: 'Lighthouse', copy: 'Observe and inspect', group: lighthouse,
    anchor: new THREE.Vector3(0, 2.22, 0)
  }]

  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  let hovered = null
  let allowMotion = true
  let openTarget = 0
  let openValue = 0
  let phase = 0
  let journeyElapsed = 0
  let journeySeconds = 0
  let cargoOpacity = 0
  let journeyState = 'waiting'
  let lastTime = 0
  let raf = 0
  let visible = true
  let destroyed = false
  let needsRender = true
  let focused = null
  let pinned = null
  let revealedResource = null
  let revealedAutomatically = false
  let automaticResource = null
  const hologramTour = createHologramTour()
  let hoverDismiss = 0
  let hoverSwitch = 0
  let pendingHover = null
  let lastMousePoint = null
  let focusDismiss = 0
  let lastLayout = []
  let lastToolsLayout = []
  let projectionSpace = 0
  let portrait = false

  // publishJourneyState reports meaningful handoff boundaries without per-frame Vue updates.
  function publishJourneyState(value) {
    if (value === journeyState) return
    journeyState = value
    onJourneyState(value)
  }

  // journeyInView pauses the handoff when either its source or destination leaves view.
  function journeyInView() {
    const rect = host.getBoundingClientRect()
    const points = ecosystemScene.framePoints()
    points.push(assembly.localToWorld(appCore.outputAt(0).point))
    return points.every(point => {
      point.project(camera)
      const x = rect.left + (point.x + 1) * rect.width / 2
      const y = rect.top + (1 - point.y) * rect.height / 2
      return x >= 0 && x <= window.innerWidth && y >= 68 && y <= window.innerHeight - 8
    })
  }

  // tourInView uses the stable desktop catalog space and pauses before either the choices or board leave view.
  function tourInView() {
    const rect = host.getBoundingClientRect()
    return !portrait && rect.width > 680 && rect.top + 20 >= 68 && rect.bottom <= window.innerHeight - 8
  }

  // claimTour gives direct interaction ownership without briefly closing the family being explored.
  function claimTour(preserve = false) {
    if (hologramTour.controlled) return
    if (preserve && automaticResource) pinned = automaticResource
    hologramTour.takeOver()
    automaticResource = null
  }

  // refreshReveal keeps hover, keyboard focus, and touch selection on one revealed capability.
  function refreshReveal() {
    const manual = capabilityBoard.explorable.some(resource => resource.id === hovered) ? hovered : focused || pinned
    const id = manual || automaticResource
    // Quiet gaps belong to the tour too, so they do not announce a fresh hint to screen readers.
    const automatic = !manual && !hologramTour.controlled && (revealedAutomatically || Boolean(automaticResource))
    if (id !== revealedResource || automatic !== revealedAutomatically) {
      revealedResource = id
      revealedAutomatically = automatic
      onReveal(id, automatic)
    }
    needsRender = true
    schedule()
  }

  // clearHoverSwitch prevents a crossed chip from opening after the pointer reaches the catalog.
  function clearHoverSwitch() {
    clearTimeout(hoverSwitch)
    pendingHover = null
  }

  // towardProjection uses the actual catalog bounds, including both outermost vendor choices.
  function towardProjection(event) {
    const source = lastLayout.find(item => item.id === revealedResource)
    const catalog = getProjectionBounds()
    if (!source || !catalog) return false
    const bounds = host.getBoundingClientRect()
    return projectionTravelContains({ x: event.clientX, y: event.clientY }, {
      left: bounds.left + source.left - source.width / 2,
      right: bounds.left + source.left + source.width / 2,
      top: bounds.top + source.top - source.height / 2,
      bottom: bounds.top + source.top + source.height / 2
    }, catalog)
  }

  // deferHoverSwitch lets a deliberate pause on another chip take over a protected travel path.
  function deferHoverSwitch(id) {
    clearTimeout(hoverSwitch)
    pendingHover = id
    hoverSwitch = setTimeout(() => {
      hovered = pendingHover
      pendingHover = null
      refreshReveal()
    }, 320)
  }

  // trackProjectionPointer preserves the current family while moving through its travel corridor.
  function trackProjectionPointer(event) {
    if (event.pointerType !== 'mouse') return
    const moved = !lastMousePoint || Math.hypot(event.clientX - lastMousePoint.x, event.clientY - lastMousePoint.y) > 1
    lastMousePoint = { x: event.clientX, y: event.clientY }
    if (!revealedResource) return
    if (towardProjection(event)) {
      clearTimeout(hoverDismiss)
      if (pendingHover && moved) deferHoverSwitch(pendingHover)
    } else if (pendingHover) {
      hovered = pendingHover
      clearHoverSwitch()
      refreshReveal()
    }
  }

  // hoverResource keeps incidental crossings from replacing the family whose choices are being approached.
  function hoverResource(id, event) {
    claimTour()
    clearTimeout(hoverDismiss)
    if (event && revealedResource && id !== revealedResource) {
      // Camera reflow can move a different chip under a stationary pointer.
      if (event.type === 'pointerenter' && lastMousePoint &&
        Math.hypot(event.clientX - lastMousePoint.x, event.clientY - lastMousePoint.y) <= 1) return
      if (towardProjection(event)) { deferHoverSwitch(id); return }
    }
    clearHoverSwitch()
    hovered = id

    refreshReveal()
  }

  // leaveResource gives the pointer time to cross the gap into the revealed objects.
  function leaveResource(event) {
    clearTimeout(hoverDismiss)
    clearHoverSwitch()
    if (event && towardProjection(event)) return
    hoverDismiss = setTimeout(() => {
      hovered = null

      refreshReveal()
    }, 180)
  }

  // toggleResource lets touch users open and close the same in-scene driver reveal.
  function toggleResource(id) {
    claimTour()
    clearHoverSwitch()
    if (pinned === id) {
      pinned = null
      focused = null
      hovered = null
    } else { pinned = id; focused = null; hovered = null }
    clearTimeout(hoverDismiss)
    refreshReveal()
  }

  // dismissResource closes a pinned or focused reveal without moving keyboard focus.
  function dismissResource() {
    claimTour()
    clearTimeout(hoverDismiss)
    clearTimeout(focusDismiss)
    clearHoverSwitch()
    hovered = null
    focused = null
    pinned = null

    refreshReveal()
  }

  // hitResource limits interactions to selectable parts and avoids touch hover state.
  function hitResource(event) {
    const rect = renderer.domElement.getBoundingClientRect()
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1)
    raycaster.setFromCamera(pointer, camera)
    const visibleTargets = targets.filter(target => {
      for (let object = target; object; object = object.parent) if (!object.visible) return false
      return true
    })
    return raycaster.intersectObjects(visibleTargets, false)[0]?.object.userData.resource || null
  }

  // pointerMove tracks selectable parts while keeping the composition stationary.
  function pointerMove(event) {
    if (event.pointerType !== 'mouse') return
    const id = hitResource(event)
    {
      if (id) hoverResource(id, event)
      else leaveResource(event)
      renderer.domElement.style.cursor = id && capabilityBoard.explorable.some(resource => resource.id === id) ? 'pointer' : 'default'
    }
    needsRender = true
    schedule()
  }

  // pointerLeave clears hover state after leaving the scene.
  function pointerLeave(event) {
    leaveResource(event)
    needsRender = true
    schedule()
  }

  // pointerClick shares selection with the visible keyboard-accessible buttons.
  function pointerClick(event) {
    const id = hitResource(event)
    {
      if (capabilityBoard.explorable.some(resource => resource.id === id)) toggleResource(id)
      else dismissResource()
    }
  }

  // keyDown dismisses a projection even when hover opened it without moving focus.
  function keyDown(event) {
    if (event.key === 'Escape' && (revealedResource || revealedAutomatically)) dismissResource()
  }

  // resize fits the visible geometry to the usable frame and gives portrait its own dock and camera.
  function resize() {
    const { width, height } = host.getBoundingClientRect()
    if (!width || !height) return
    const pixelRatio = Math.min(Math.max(window.devicePixelRatio, 2), 3)
    if (renderer.getPixelRatio() !== pixelRatio) renderer.setPixelRatio(pixelRatio)
    renderer.setSize(width, height, false)
    neonBloom.resize(width, height)
    viewportFade.resize(renderer)
    portrait = window.innerWidth <= 960
    surroundings.setLayout(portrait)
    appCore.setLayout(portrait)
    ecosystemScene.setLayout(portrait)
    ecosystemScene.update(journeySeconds, !allowMotion && journeyElapsed === 0, cargoOpacity)
    camera.position.set(portrait ? 7.3 : 9, portrait ? 10.4 : 7.5, portrait ? 13.5 : 11)
    camera.lookAt(0, .85, .5)
    camera.updateMatrixWorld(true)
    assembly.updateMatrixWorld(true)
    const bounds = new THREE.Box3()
    const point = new THREE.Vector3()
    assembly.traverse(object => {
      if (!object.isMesh || object.userData.excludeFromFraming) return
      for (let ancestor = object; ancestor; ancestor = ancestor.parent) if (!ancestor.visible || ancestor.userData.excludeFromFraming) return
      if (!object.geometry.boundingBox) object.geometry.computeBoundingBox()
      const box = object.geometry.boundingBox
      for (const x of [box.min.x, box.max.x]) {
        for (const y of [box.min.y, box.max.y]) {
          for (const z of [box.min.z, box.max.z]) {
            bounds.expandByPoint(point.set(x, y, z).applyMatrix4(object.matrixWorld).applyMatrix4(camera.matrixWorldInverse))
          }
        }
      }
    })
    // Reserve the actual catalog height so wide desktop views can bring the scene up without moving it on hover.
    const catalogPadding = driverProjectionLayout(width, largestCatalog, true).bottom + 12
    const topPadding = portrait ? projectionSpace + 10 : width > 680 ? catalogPadding : projectionSpace ? projectionSpace + 12 : 42
    const bottomPadding = 60
    const scale = Math.min((width - 22) / (bounds.max.x - bounds.min.x),
      (height - topPadding - bottomPadding) / (bounds.max.y - bounds.min.y))
    const centerX = (bounds.min.x + bounds.max.x) / 2
    const centerY = (bounds.min.y + bounds.max.y) / 2 + (topPadding - bottomPadding) / (2 * scale)
    camera.left = centerX - width / (2 * scale)
    camera.right = centerX + width / (2 * scale)
    camera.top = centerY + height / (2 * scale)
    camera.bottom = centerY - height / (2 * scale)
    camera.updateProjectionMatrix()
    ecosystemScene.fitSurroundings(camera, width, height)
    surroundings.setWaterline(ecosystemScene.floorCutout())
    publishLayout()
    needsRender = true
    schedule()
  }

  // schedule stops work off screen and restarts only when motion or state needs a frame.
  function schedule() {
    if (!raf && visible && !document.hidden && !destroyed) raf = requestAnimationFrame(render)
  }

  // publishLayout aligns semantic buttons with the actual projected blocks as the viewport changes.
  function publishLayout() {
    const { width, height } = host.getBoundingClientRect()
    const layout = capabilityBoard.explorable.map(resource => {
      const part = cartridges.get(resource.id)
      const cover = part.group
      const point = cover.localToWorld(new THREE.Vector3(0, part.hitY, 0)).project(camera)
      const corners = [[-part.halfWidth, -part.halfDepth], [part.halfWidth, -part.halfDepth],
        [-part.halfWidth, part.halfDepth], [part.halfWidth, part.halfDepth]].map(([x, z]) =>
        cover.localToWorld(new THREE.Vector3(x, part.surfaceY, z)).project(camera).x)
      const chipWidth = (Math.max(...corners) - Math.min(...corners)) * width / 2
      // projectEmitter keeps the hologram source on the physical lid while the engine moves.
      const projectEmitter = (x, z) => {
        const projected = cover.localToWorld(new THREE.Vector3(x, part.surfaceY, z)).project(camera)
        return { x: (projected.x + 1) * width / 2, y: (1 - projected.y) * height / 2 }
      }
      return { ...resource, left: (point.x + 1) * width / 2, top: (1 - point.y) * height / 2,
        emitter: { ...projectEmitter(0, part.emitterZ), corners: [[-.22, part.emitterZ - .07], [.22, part.emitterZ - .07],
          [.22, part.emitterZ + .02], [-.22, part.emitterZ + .02]].map(([x, z]) => projectEmitter(x, z)) },
        canvasWidth: width, canvasHeight: height, floatingProjection: !portrait && width > 680, compactProjection: portrait,
        width: portrait ? 44 : Math.max(44, Math.min(72, chipWidth * .58)), height: 44 }
    })
    if (layout.some((item, index) => {
      const previous = lastLayout[index]
      return !previous || Math.abs(item.left - previous.left) > .75 || Math.abs(item.top - previous.top) > .75 || item.width !== previous.width ||
        item.canvasWidth !== previous.canvasWidth || item.canvasHeight !== previous.canvasHeight ||
        Math.abs(item.emitter.x - previous.emitter.x) > .75 || Math.abs(item.emitter.y - previous.emitter.y) > .75
    })) {
      lastLayout = layout
      onLayout(layout)
    }
    {
      const tools = toolAnchors.map(({ id, label, copy, group, anchor, portraitAnchor }) => {
        const compact = portrait && id === 'lighthouse'
        const point = group.localToWorld((portrait && portraitAnchor ? portraitAnchor : anchor).clone()).project(camera)
        const narrow = !portrait && width <= 680 && id === 'lighthouse'
        const inset = compact ? (width < 360 ? 41 : 48) : narrow ? 54 : portrait ? 62 : 78
        const anchorLeft = (point.x + 1) * width / 2
        const anchorTop = (1 - point.y) * height / 2
        return { id, label, copy, above: id === 'lighthouse', compact, narrow, anchorLeft, anchorTop,
          left: Math.max(inset, Math.min(width - inset, anchorLeft + (compact ? 64 : id === 'lighthouse' ? 28 : 0))),
          top: anchorTop + (compact && width < 360 ? -8 : id === 'ship' ? (portrait ? (width < 360 ? 26 : 4) : width <= 680 ? 12 : 0) : 0) }
      })
      if (tools.some((tool, index) => !lastToolsLayout[index] || tool.above !== lastToolsLayout[index].above || tool.compact !== lastToolsLayout[index].compact || tool.narrow !== lastToolsLayout[index].narrow ||
        Math.abs(tool.left - lastToolsLayout[index].left) > .75 || Math.abs(tool.top - lastToolsLayout[index].top) > .75 ||
        Math.abs(tool.anchorLeft - lastToolsLayout[index].anchorLeft) > .75 || Math.abs(tool.anchorTop - lastToolsLayout[index].anchorTop) > .75)) {
        lastToolsLayout = tools
        onToolsLayout(tools)
      }
    }
  }

  // render settles each physical part from its base position, so repeated toggles never drift.
  function render(time) {
    raf = 0
    if (destroyed || !visible || document.hidden) return
    const elapsed = (time - (lastTime || time)) / 1000
    const delta = Math.min(elapsed, .04)
    lastTime = time
    if (allowMotion) phase += delta
    // Elapsed time keeps a slower renderer from stretching the cargo handoff.
    if (allowMotion && journeyInView()) {
      journeyElapsed += elapsed
      const cycle = cargoCycle(journeyElapsed)
      journeySeconds = cycle.journeySeconds
      cargoOpacity = cycle.opacity
      publishJourneyState(cycle.state)
    }
    const canTour = tourInView()
    const nextAutomatic = hologramTour.advance(elapsed, allowMotion && canTour)
    const automatic = canTour ? nextAutomatic : null
    if (automatic !== automaticResource) {
      automaticResource = automatic
      refreshReveal()
    }
    const smoothing = 1 - Math.exp(-delta * 7)
    openValue = allowMotion ? THREE.MathUtils.lerp(openValue, openTarget, smoothing) : openTarget
    const resting = Math.abs(openValue - openTarget) < .001
    if (resting) openValue = openTarget
    const settling = !resting
    const activeResource = revealedResource || hovered || 'app'
    const composition = compositionCue(journeySeconds)
    const composing = journeySeconds > 0 && journeySeconds < CARGO_TIMELINE.composed
    appCore.update(openValue, phase, allowMotion, activeResource, journeySeconds)
    ecosystemScene.update(journeySeconds, !allowMotion && journeyElapsed === 0, cargoOpacity)
    {
      const lighthouseActive = activeResource === 'lighthouse'
      beaconMaterial.emissiveIntensity = lighthouseActive ? 2.1 : 1.4
      circuitMaterials.get('lighthouse').emissiveIntensity = lighthouseActive ? .65 : .30
    }
    for (const [id, part] of cartridges) {
      const active = activeResource === id
      part.group.position.y = part.baseY + openValue * part.openLift + (active ? .045 : 0)
      part.indicator.scale.setScalar(active ? 1.4 : 1)
      if (!revealedResource && activeResource === 'app' && id === 'queue') {
        part.indicator.scale.setScalar(1 + (allowMotion ? .12 * (1 + Math.sin(phase * .85)) : .12))
      }
      {
        const resource = capabilityBoard.explorable.find(resource => resource.id === id)
        const composingDriver = composing && !resource.optionNoun
        const color = active || composingDriver || openValue > .01 ? resource.color : resource.optionNoun ? '#718087' : '#9f805f'
        const material = circuitMaterials.get(id)
        material.color.set(color)
        material.emissive.set(color)
        material.emissiveIntensity = active ? .65 : openValue * .30 + .025 + (composingDriver ? composition.glow * .45 : 0)
      }
    }
    for (const pulse of circuitPulses) {
      const t = composing && !pulse.returning ? composition.progress : (phase * (pulse.returning ? .12 : .20) + pulse.phase) % 1
      pulse.object.position.copy(pulse.curve.getPointAt(pulse.returning ? 1 - t : t))
      pulse.object.visible = allowMotion && (pulse.returning || composing || activeResource === pulse.id || (activeResource === 'app' && openValue > .05))
      pulse.object.scale.setScalar(Math.sin(t * Math.PI))
    }
    if (allowMotion || needsRender || settling) neonBloom.draw()
    publishLayout()
    needsRender = false
    if (allowMotion || settling) schedule()
  }

  // setTheme changes material values while retaining one consistent lighting model.
  function setTheme(value) {
    dark = value
    neonBloom.setTheme(value)
    surroundings.setTheme(value)
    ecosystemScene.setTheme(value)
    appCore.setBrandColor(getComputedStyle(host).getPropertyValue('--gf-accent').trim(), value)
    for (const [material, lightColor, darkColor] of themeSurfaces) material.color.set(value ? darkColor : lightColor)
    groundMaterial.opacity = value ? .10 : .055
    renderer.toneMappingExposure = value ? .91 : .92
    coreLight.intensity = value ? 6 : 4
    needsRender = true
    schedule()
  }

  // visibilityChange resets frame time after tab suspension to prevent animation jumps.
  function visibilityChange() {
    lastTime = 0
    if (!document.hidden) {
      needsRender = true
      schedule()
    }
  }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host)
  const intersectionObserver = new IntersectionObserver(entries => {
    if (visible !== entries[0].isIntersecting) lastTime = 0
    visible = entries[0].isIntersecting
    lastTime = 0
    if (visible) { needsRender = true; schedule() }
  })
  intersectionObserver.observe(host)
  renderer.domElement.addEventListener('pointermove', pointerMove)
  renderer.domElement.addEventListener('pointerleave', pointerLeave)
  renderer.domElement.addEventListener('click', pointerClick)
  document.addEventListener('keydown', keyDown)
  document.addEventListener('visibilitychange', visibilityChange)
  window.addEventListener('resize', resize)
  setTheme(dark)
  resize()

  return {
    setTheme,
    // setProjectionSpace only reframes layouts whose catalog consumes new space, keeping desktop reveals still.
    setProjectionSpace(value) {
      if (projectionSpace === value) return
      projectionSpace = value
      if (portrait || host.getBoundingClientRect().width <= 680) resize()
    },
    setOpen(value) { claimTour(true); refreshReveal(); openTarget = value ? 1 : 0; needsRender = true; schedule() },
    setMotion(value) { allowMotion = value; needsRender = true; lastTime = 0; schedule() },
    hoverResource,
    leaveResource,
    trackProjectionPointer,
    toggleResource,
    dismissResource,
    takeControl() { claimTour(true); refreshReveal() },
    focusResource(id) { claimTour(); clearTimeout(hoverDismiss); clearTimeout(focusDismiss); clearHoverSwitch(); hovered = null; focused = id; if (pinned !== id) pinned = null; refreshReveal() },
    // Keyboard focus reaches the next link after blur, so defer dismissal until that handoff completes.
    blurResource(id) {
      clearTimeout(focusDismiss)
      focusDismiss = setTimeout(() => {
        if (focused === id) focused = null
        refreshReveal()
      }, 0)
    },
    dispose() {
      destroyed = true
      cancelAnimationFrame(raf)
      clearTimeout(hoverDismiss)
      clearTimeout(focusDismiss)
      clearHoverSwitch()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', visibilityChange)
      window.removeEventListener('resize', resize)
      renderer.domElement.removeEventListener('pointermove', pointerMove)
      renderer.domElement.removeEventListener('pointerleave', pointerLeave)
      renderer.domElement.removeEventListener('click', pointerClick)
      document.removeEventListener('keydown', keyDown)
      for (const geometry of geometries) geometry.dispose()
      for (const material of materials) material.dispose()
      for (const texture of textures) texture.dispose()
      neonBloom.dispose()
      environment.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }
}
