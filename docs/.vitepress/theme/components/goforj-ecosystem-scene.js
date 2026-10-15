import * as THREE from 'three'
import { buildWaterSurface } from './goforj-water-surface.js'
import { cargoJourney, CARGO_TIMELINE } from './goforj-cargo-journey.js'
import { APP_ARTIFACT_HEIGHT, CARGO_PICKUP, HARBOR_ORIGIN, waterfrontLayout } from './goforj-waterfront-layout.js'

// buildEcosystemScene carries the same App assembly from the development quay onto the deployment vessel.
export function buildEcosystemScene(kit) {
  const { assembly, box, mesh, cylinder, tube, decal, labelTexture, standard, screw,
    steel, ceramic, graphite, edge, copperBright, light, marks, buildAppPayload, outputAt, viewportFade } = kit
  const harborColor = standard('#587b76', .38, .41)
  const shipColor = standard('#527287', .5, .36)
  const windows = standard('#243b47', .3, .24)
  const channel = standard('#244650', .08, .48)
  const waterfront = new THREE.Group()
  assembly.add(waterfront)

  // One machined dock contains both the raised quay and a recessed berth for the vessel.
  const dock = new THREE.Group()
  waterfront.add(dock)
  box(4.08, .32, 2.38, graphite, [0, -.12, 0], dock, .06)
  box(4.10, .14, 2.40, graphite, [0, .07, 0], dock, .075)
  box(4.04, .035, 2.34, edge, [0, .154, 0], dock, .04)
  box(2.08, .025, 2.12, channel, [.89, .183, 0], dock, .035)
  for (const z of [-1.13, 1.13]) box(4.02, .06, .12, steel, [0, .197, z], dock, .018)
  for (const x of [-1.96, 1.96]) {
    box(.12, .06, 2.18, steel, [x, .197, 0], dock, .018)
    for (const z of [-1.08, 1.08]) screw(x, .238, z, dock)
  }
  box(1.86, .12, 2.18, graphite, [-1.08, .23, 0], dock, .03)
  box(1.80, .025, 2.12, steel, [-1.08, .304, 0], dock, .025)
  box(1.70, .025, 2.02, harborColor, [-1.08, .331, 0], dock, .02)
  for (const z of [-.72, 0, .72]) {
    box(.055, .11, .23, graphite, [-.13, .263, z], dock, .015)
    box(.055, .018, .11, copperBright, [1.87, .236, z], dock, .005)
  }

  const water = buildWaterSurface({ assembly, mesh, decal, labelTexture, viewportFade })
  water.addBerth(waterfront)
  const dockContactTexture = labelTexture((context, width, height) => {
    context.translate(width / 2, height / 2)
    context.scale(1, height / width)
    const fade = context.createRadialGradient(0, 0, width * .20, 0, 0, width * .49)
    fade.addColorStop(0, 'rgba(20,25,29,.32)')
    fade.addColorStop(.70, 'rgba(20,25,29,.18)')
    fade.addColorStop(1, 'rgba(20,25,29,0)')
    context.fillStyle = fade
    context.fillRect(-width / 2, -width / 2, width, width)
  }, 512, 384)
  const dockContact = new THREE.Group()
  dockContact.userData.excludeFromFraming = true
  assembly.add(dockContact)
  decal(dockContactTexture, 4.7, 2.9, [0, 0, 0], [-Math.PI / 2, 0, 0], dockContact)

  const rippleTexture = labelTexture((context, width, height) => {
    context.translate(width / 2, height / 2)
    context.scale(width / 2.08, height / 2.12)
    context.translate(-.89, 0)
    context.strokeStyle = '#fff'
    context.lineCap = 'round'
    // Interrupted contours follow the hull so the vessel visibly displaces the water.
    for (const [offset, alpha] of [[.09, .65], [.20, .33], [.34, .16]]) {
      context.globalAlpha = alpha
      context.lineWidth = .014
      context.beginPath()
      context.moveTo(1.30 - .46 - offset, -.70)
      context.bezierCurveTo(1.30 - .57 - offset, -.32, 1.30 - .57 - offset, .45, 1.30 - .33 - offset, .83)
      context.stroke()
      context.beginPath()
      context.moveTo(1.30 - .20 - offset, .97)
      context.quadraticCurveTo(1.30, 1.08 + offset * .3, 1.30 + .20 + offset, .97)
      context.stroke()
      context.beginPath()
      context.moveTo(1.30 + .50 + offset, .42)
      context.quadraticCurveTo(1.30 + .57 + offset, -.10, 1.30 + .45 + offset, -.65)
      context.stroke()
    }
  }, 512, 512)
  const ripples = decal(rippleTexture, 2.08, 2.12, [.89, .205, 0], [-Math.PI / 2, 0, 0], waterfront)
  ripples.userData.excludeFromFraming = true

  // productBadge paints the exact shared logo artwork onto a manufactured plaque.
  function productBadge(name, parent, position, size, rotation = [0, 0, 0]) {
    const plate = box(size, size, .035, copperBright, position, parent, size * marks.PRODUCT_ICON_RADIUS)
    plate.rotation.set(...rotation)
    const artwork = marks.productTile(name, 512, { accent: '#edb575', deep: '#293640' })
    const svg = new DOMParser().parseFromString(artwork, 'image/svg+xml')
    const texture = labelTexture((ctx, w, h) => {
      ctx.scale(w / 100, h / 100)
      const rect = svg.querySelector('rect')
      ctx.fillStyle = rect.getAttribute('fill')
      ctx.beginPath()
      ctx.roundRect(0, 0, 100, 100, Number(rect.getAttribute('rx')))
      ctx.fill()
      const group = svg.querySelector('g')
      ctx.fillStyle = group.getAttribute('fill') === 'none' ? 'transparent' : group.getAttribute('fill')
      ctx.strokeStyle = group.getAttribute('stroke') || 'transparent'
      ctx.lineWidth = Number(group.getAttribute('stroke-width') || 0)
      ctx.lineCap = group.getAttribute('stroke-linecap') || 'butt'
      ctx.lineJoin = group.getAttribute('stroke-linejoin') || 'miter'
      for (const element of group.children) {
        const path = new Path2D()
        if (element.tagName === 'circle') path.arc(Number(element.getAttribute('cx')), Number(element.getAttribute('cy')), Number(element.getAttribute('r')), 0, Math.PI * 2)
        else path.addPath(new Path2D(element.getAttribute('d')))
        if (group.getAttribute('fill') !== 'none') ctx.fill(path)
        if (group.hasAttribute('stroke')) ctx.stroke(path)
      }
    }, 512, 512)
    decal(texture, size * .99, size * .99, [0, 0, .024], [0, 0, 0], plate)
  }

  const harbor = new THREE.Group()
  harbor.position.set(...HARBOR_ORIGIN)
  waterfront.add(harbor)
  const loadingPad = box(1.02, .026, .95, graphite, [CARGO_PICKUP.x, .346, CARGO_PICKUP.z], harbor, .012)
  loadingPad.userData.loadingPad = true
  const harborStatus = standard('#82bec2', .25, .35, { emissive: '#7cadb2', emissiveIntensity: .12 })
  box(.73, .010, .024, harborStatus, [CARGO_PICKUP.x, .365, CARGO_PICKUP.z + .43], harbor, .004)
  box(.28, .065, .35, graphite, [.52, .375, .36], harbor, .017)
  box(.12, 1.36, .16, steel, [.52, 1.085, .36], harbor, .018)
  box(.032, 1.04, .016, graphite, [.52, 1.10, .451], harbor, .004)
  // The rail reaches both the belt's loading pad and the ship's open bay.
  box(3.28, .13, .22, steel, [1.00, 1.80, .36], harbor, .022)
  box(3.13, .018, .025, copperBright, [1.00, 1.881, .435], harbor, .006)
  productBadge('harbor', harbor, [.52, 1.05, .468], .40)
  for (const x of [-.81, -.55]) {
    cylinder(.038, .13, graphite, [x, .411, .97], harbor, 12)
    cylinder(.06, .025, steel, [x, .484, .97], harbor, 16)
  }
  for (let i = 0; i < 3; i++) box(.045, .02, .10, copperBright, [.26 + i * .16, .35, .97], harbor, .003)

  const ship = new THREE.Group()
  ship.position.set(1.30, -.12, .06)
  waterfront.add(ship)
  const hullShape = new THREE.Shape()
  hullShape.moveTo(-.43, .83)
  hullShape.lineTo(.43, .83)
  hullShape.lineTo(.54, -.48)
  hullShape.quadraticCurveTo(.38, -.83, 0, -1.02)
  hullShape.quadraticCurveTo(-.38, -.83, -.54, -.48)
  hullShape.closePath()
  const hull = mesh(new THREE.ExtrudeGeometry(hullShape, {
    depth: .32, bevelEnabled: true, bevelSize: .022, bevelThickness: .022, bevelSegments: 2, steps: 1, curveSegments: 16
  }), shipColor, ship, [0, .32, 0])
  hull.rotation.x = -Math.PI / 2
  const deck = mesh(new THREE.ExtrudeGeometry(hullShape, {
    depth: .032, bevelEnabled: true, bevelSize: .016, bevelThickness: .016, bevelSegments: 2, steps: 1, curveSegments: 16
  }), steel, ship, [0, .665, 0])
  deck.rotation.x = -Math.PI / 2
  // A raised bridge, bow, and deck rails keep the cargo carrier recognisable at landing-page scale.
  box(.74, .34, .42, ceramic, [0, .87, -.56], ship, .037)
  box(.79, .045, .47, graphite, [0, 1.065, -.56], ship, .023)
  box(.76, .07, .29, steel, [0, 1.12, -.56], ship, .02)
  for (const x of [-.23, 0, .23]) box(.14, .10, .017, windows, [x, .985, -.338], ship, .005)
  box(.02, .11, .27, windows, [.382, .985, -.56], ship, .005)
  productBadge('ship', ship, [.53, .50, .08], .33, [0, Math.PI / 2, 0])
  cylinder(.016, .31, copperBright, [.28, 1.31, -.62], ship, 12)
  mesh(new THREE.SphereGeometry(.024, 12, 8), light, ship, [.28, 1.475, -.62])
  // The forward bay receives the same artifact that leaves the app chassis.
  const deploymentBay = box(.98, .018, .86, graphite, [0, .706, .30], ship, .009)
  deploymentBay.userData.deploymentBay = true
  const shipStatus = standard('#dfa164', .25, .35, { emissive: '#e4a065', emissiveIntensity: .12 })
  box(.70, .010, .024, shipStatus, [0, .725, .71], ship, .004)
  for (const x of [-.43, .43]) box(.044, .021, .68, copperBright, [x, .723, .30], ship, .005)
  for (const x of [-.46, .46]) {
    tube([[x, .745, -.18], [x, .745, .56], [x * .55, .745, .83]], .011, ceramic, ship)
    for (const z of [-.15, .28, .54]) cylinder(.009, .07, graphite, [x, .71, z], ship, 8)
  }
  tube([[-.28, .70, .83], [0, .70, .98], [.28, .70, .83]], .013, copperBright, ship)

  const trolley = new THREE.Group()
  harbor.add(trolley)
  box(.21, .15, 1.10, graphite, [0, 1.94, .36], trolley, .018)
  const hoistHead = box(.64, .045, .17, graphite, [0, 1.90, .77], trolley, .009)
  for (const x of [-.10, .10]) {
    const wheel = cylinder(.043, .023, steel, [x, 1.93, .35], trolley, 12)
    wheel.rotation.z = Math.PI / 2
  }
  const hoistHeight = 1.88
  const payloadHeight = APP_ARTIFACT_HEIGHT
  const payload = buildAppPayload(assembly, { height: payloadHeight, position: [0, 0, 0] })
  const load = payload.group
  const spreader = new THREE.Group()
  // The larger container and lifting frame align with the loading pad and deployment bay.
  spreader.rotation.y = 0
  hoistHead.rotation.y = 0
  harbor.add(spreader)
  for (const z of [-.40, .40]) box(1.02, .025, .035, steel, [0, 0, z], spreader, .007)
  for (const x of [-.49, .49]) box(.035, .025, .84, steel, [x, 0, 0], spreader, .007)
  const cables = [-.24, .24].map(x => cylinder(.009, 1, graphite, [x, 1.5, .77], harbor, 8))
  const localLoad = new THREE.Vector3()
  const frameCorners = [-2.14, 2.14].flatMap(x => [-.32, 2.12].flatMap(y => [-1.23, 1.23].map(z => new THREE.Vector3(x, y, z))))

  // placeJourney uses dock coordinates for the crane while the artifact retains its physical size.
  function placeJourney(seconds, opacity) {
    const state = cargoJourney(seconds, payloadHeight * 1.15 / waterfront.scale.x)
    harborStatus.emissiveIntensity = .12 + state.harborGlow * .90
    shipStatus.emissiveIntensity = .12 + state.shipGlow * .85
    trolley.position.x = state.trolley.x
    hoistHead.position.z = state.trolley.z
    spreader.position.set(state.trolley.x, state.spreaderY, state.trolley.z)
    const length = hoistHeight - state.spreaderY
    for (const [index, cable] of cables.entries()) {
      cable.scale.y = length
      const offset = index ? .24 : -.24
      cable.position.set(state.trolley.x + offset, hoistHeight - length / 2, state.trolley.z)
    }
    payload.setOpacity(opacity)
    if (state.beltProgress !== null) {
      const { point, tangent } = outputAt(state.beltProgress)
      load.position.copy(point)
      load.rotation.y = Math.atan2(tangent.x, tangent.z)
    } else {
      localLoad.set(state.load.x, state.load.y, state.load.z).add(harbor.position).applyMatrix4(waterfront.matrix)
      load.position.copy(localLoad)
      const tangent = outputAt(1).tangent
      load.rotation.y = THREE.MathUtils.lerp(Math.atan2(tangent.x, tangent.z), waterfront.rotation.y, state.turn)
    }
  }

  return {
    // setTheme keeps the water legible as a quiet surface on either page ground.
    setTheme(dark) {
      channel.color.set(dark ? '#244650' : '#517f8b')
      water.setTheme(dark)
      ripples.material.color.set(dark ? '#c4e0e4' : '#eff9f8')
      ripples.material.opacity = .85
    },
    // setLayout carries the app's output rightward on desktop and down toward the quay in portrait.
    setLayout(mobile) {
      const layout = waterfrontLayout(mobile)
      waterfront.position.set(...layout.position)
      waterfront.scale.setScalar(layout.scale)
      waterfront.rotation.y = layout.yaw
      waterfront.updateMatrix()
      water.setLayout(mobile)
      dockContact.position.set(layout.position[0], -.120, layout.position[2])
      dockContact.rotation.y = layout.yaw
      dockContact.scale.setScalar(layout.scale)
    },
    // fitSurroundings sizes the visible shoreline while the equipment keeps its existing framing.
    fitSurroundings(camera, width, height) { water.fit(camera, width, height) },
    floorCutout() { return water.floorCutout() },
    tools: [
      { id: 'harbor', label: 'Harbor', copy: 'Develop locally', group: harbor, anchor: new THREE.Vector3(-.62, .02, 1.70) },
      { id: 'ship', label: 'Ship', copy: 'Deploy and operate', group: ship, anchor: new THREE.Vector3(.50, .15, 1.42) }
    ],
    // framePoints lets the handoff wait for both physical destinations to be on screen.
    framePoints() {
      return frameCorners.map(point => waterfront.localToWorld(point.clone()))
    },
    // update preserves a paused pose and gives reduced-motion visits a still loading scene.
    update(seconds, initialStill, opacity) {
      placeJourney(initialStill ? CARGO_TIMELINE.crossed : seconds, initialStill ? 1 : opacity)
    }
  }
}
