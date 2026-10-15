import * as THREE from 'three'
import { APP_COMPONENTS } from './goforj-app-payload.js'

// buildEngineSurroundings gives the assembly a receiving dock and a fading workshop floor.
export function buildEngineSurroundings({ assembly, box, decal, labelTexture, standard, steel, graphite, viewportFade }) {
  const floorTexture = labelTexture((context, width, height) => {
    for (let x = 0; x <= width; x += 64) {
      const major = x % 256 === 0
      context.strokeStyle = major ? '#fff' : 'rgba(255,255,255,.65)'
      context.lineWidth = major ? 2.75 : 2
      context.beginPath()
      context.moveTo(x, 0)
      context.lineTo(x, height)
      context.stroke()
    }
    for (let y = 0; y <= height; y += 64) {
      const major = y % 256 === 0
      context.strokeStyle = major ? '#fff' : 'rgba(255,255,255,.65)'
      context.lineWidth = major ? 2.75 : 2
      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(width, y)
      context.stroke()
    }
    context.globalCompositeOperation = 'destination-in'
    context.translate(width / 2, height / 2)
    context.scale(1, height / width)
    const fade = context.createRadialGradient(0, 0, width * .18, 0, 0, width * .49)
    fade.addColorStop(0, '#fff')
    fade.addColorStop(.65, 'rgba(255,255,255,.75)')
    fade.addColorStop(1, 'rgba(255,255,255,0)')
    context.fillStyle = fade
    context.fillRect(-width / 2, -width / 2, width, width)
  }, 1024, 768)
  const floor = decal(floorTexture, 14.5, 9, [.50, -.128, .70], [-Math.PI / 2, 0, 0])
  floor.userData.excludeFromFraming = true
  floor.userData.goforjEnvironment = 'grid'
  viewportFade.apply(floor.material)
  const gridInk = document.createElement('canvas')
  gridInk.width = floorTexture.image.width
  gridInk.height = floorTexture.image.height
  gridInk.getContext('2d').drawImage(floorTexture.image, 0, 0)

  const contactTexture = labelTexture((context, width, height) => {
    context.translate(width / 2, height / 2)
    context.scale(1, height / width)
    const fade = context.createRadialGradient(0, 0, width * .18, 0, 0, width * .49)
    fade.addColorStop(0, 'rgba(20,25,29,.34)')
    fade.addColorStop(.65, 'rgba(20,25,29,.16)')
    fade.addColorStop(1, 'rgba(20,25,29,0)')
    context.fillStyle = fade
    context.fillRect(-width / 2, -width / 2, width, width)
  }, 512, 384)
  const stagingContact = decal(contactTexture, 1.65, 1.50, [0, -.122, 0], [-Math.PI / 2, 0, 0])
  stagingContact.userData.excludeFromFraming = true

  const staging = new THREE.Group()
  staging.userData.excludeFromFraming = true
  staging.userData.goforjEnvironment = 'staging'
  assembly.add(staging)
  box(1.14, .13, 1.13, graphite, [0, .14, 0], staging, .035)
  box(1.16, .04, 1.15, steel, [0, .225, 0], staging, .018)
  box(1.06, .015, 1.05, graphite, [0, .255, 0], staging, .012)
  for (const x of [-.40, .40]) box(.09, .29, .65, graphite, [x, -.07, 0], staging, .008)
  const strap = standard('#a4acaa', .25, .55)
  for (const [index, position] of [[0, [-.23, .435, -.19]], [2, [.20, .435, -.19]], [4, [-.23, .435, .22]]]) {
    const pigment = standard(APP_COMPONENTS[index].color, .12, .55)
    const [x, y, z] = position
    box(.33, .33, .33, pigment, position, staging, .012)
    box(.026, .007, .332, strap, [x + .065, y + .168, z], staging, .002)
    box(.026, .31, .005, strap, [x + .065, y, z + .167], staging, .001)
  }

  const ramp = new THREE.Group()
  ramp.userData.excludeFromFraming = true
  ramp.userData.goforjEnvironment = 'input-ramp'
  assembly.add(ramp)
  box(1, .025, .43, graphite, [0, 0, 0], ramp, .008)
  for (const z of [-.20, .20]) box(1, .012, .016, steel, [0, .016, z], ramp, .004)

  return {
    // setWaterline erases the floor using the same fitted shoreline that paints the water.
    setWaterline({ surface, mask, width, height }) {
      const canvas = floorTexture.image, context = canvas.getContext('2d')
      context.resetTransform()
      context.globalCompositeOperation = 'source-over'
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(gridInk, 0, 0)
      floor.updateWorldMatrix(true, false)
      const texel = (x, y) => {
        const point = floor.worldToLocal(surface.localToWorld(new THREE.Vector3(x, y, 0)))
        return { x: (point.x / 14.5 + .5) * canvas.width, y: (.5 - point.y / 9) * canvas.height }
      }
      const origin = texel(-width / 2, height / 2)
      const right = texel(width / 2, height / 2), bottom = texel(-width / 2, -height / 2)
      context.setTransform((right.x - origin.x) / mask.image.width, (right.y - origin.y) / mask.image.width,
        (bottom.x - origin.x) / mask.image.height, (bottom.y - origin.y) / mask.image.height, origin.x, origin.y)
      context.globalCompositeOperation = 'destination-out'
      // Repeated compositing keeps the grid from showing through the translucent water.
      context.drawImage(mask.image, 0, 0)
      context.drawImage(mask.image, 0, 0)
      floorTexture.needsUpdate = true
    },
    // setTheme keeps the floor below the visual contrast of the actual equipment.
    setTheme(dark) {
      floor.material.color.set(dark ? '#95a7af' : '#708594')
      floor.material.opacity = dark ? .20 : .48
    },
    // setLayout fits the receiving dock into the spare space beside the existing portrait frame.
    setLayout(portrait) {
      const scale = portrait ? .82 : 1
      staging.scale.setScalar(scale)
      staging.position.set(portrait ? -5.15 : -5.40, .09, portrait ? -.10 : .25)
      stagingContact.position.set(staging.position.x, -.122, staging.position.z)
      stagingContact.scale.setScalar(scale)
      const startX = staging.position.x + .58 * scale
      const startY = staging.position.y + .263 * scale
      const endX = -4.48, endY = .49
      ramp.position.set((startX + endX) / 2, (startY + endY) / 2, staging.position.z)
      ramp.scale.set(Math.hypot(endX - startX, endY - startY), 1, scale)
      ramp.rotation.z = Math.atan2(endY - startY, endX - startX)
    }
  }
}
