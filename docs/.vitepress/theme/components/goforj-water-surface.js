import * as THREE from 'three'

// buildWaterSurface gives the waterfront a continuous shoreline shared by its color, ripples, and floor cutout.
export function buildWaterSurface({ assembly, mesh, decal, labelTexture, viewportFade }) {
  const finishes = []

  // optics uses long swells and broken sky reflections at a shared world scale, including inside the berth.
  function optics(width, height, center, mask) {
    const size = 512
    const palettes = [
      { deep: [34, 83, 103], shallow: [93, 151, 169], sky: [200, 228, 231] },
      { deep: [23, 57, 70], shallow: [62, 116, 134], sky: [170, 205, 213] }
    ]
    const normals = new Uint8ClampedArray(size * size * 4)
    const colors = [new Uint8ClampedArray(size * size * 4), new Uint8ClampedArray(size * size * 4)]
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = (x / size - .5) * width + center.x
        const v = (.5 - y / size) * height + center.y
        const bendA = u * 2.7 + v * 1.1, bendB = u * 5.2 - v * .6, bendC = u * 1.4 - v * 2.8
        const phase = v * 16 + Math.sin(bendA) * 1.9 + Math.sin(bendB) * .55 + Math.sin(bendC) * .8
        const detail = u * 8.3 + v * 12.8 + Math.sin(v * 3) * .5
        const swell = Math.sin(phase), cross = Math.sin(detail)
        const phaseX = Math.cos(bendA) * 5.13 + Math.cos(bendB) * 2.86 + Math.cos(bendC) * 1.12
        const phaseY = 16 + Math.cos(bendA) * 2.09 - Math.cos(bendB) * .33 - Math.cos(bendC) * 2.24
        const slopeX = Math.cos(phase) * phaseX * .012 + Math.cos(detail) * .0249
        const slopeY = Math.cos(phase) * phaseY * .012 + Math.cos(detail) * (12.8 + Math.cos(v * 3) * 1.5) * .003
        const offset = (y * size + x) * 4
        normals.set([128 - slopeX * 100, 128 - slopeY * 100, 247, 255], offset)
        const depth = .48 + Math.sin(v * 1.7 + u * .6) * .18 + swell * .10 + cross * .035
        const broken = Math.max(0, Math.sin(u * 2.2 + Math.sin(v * 1.4) * 1.5 + Math.sin(u * 4.1 + v * 3.3) * .4)) ** 5
        const glint = Math.max(0, (swell - .91) / .09) ** 2 * broken * .64
        for (let theme = 0; theme < 2; theme++) {
          const { deep, shallow, sky } = palettes[theme]
          for (let channel = 0; channel < 3; channel++) {
            const base = deep[channel] + (shallow[channel] - deep[channel]) * depth
            colors[theme][offset + channel] = base + (sky[channel] - base) * glint
          }
          colors[theme][offset + 3] = 255
        }
      }
    }
    const normalMap = labelTexture(context => context.putImageData(new ImageData(normals, size, size), 0, 0), size, size)
    normalMap.colorSpace = THREE.NoColorSpace
    const maps = colors.map(pixels => labelTexture(context => {
      context.putImageData(new ImageData(pixels, size, size), 0, 0)
      if (mask) {
        context.globalCompositeOperation = 'destination-in'
        context.drawImage(mask.image, 0, 0, size, size)
      }
    }, size, size))
    const material = new THREE.MeshPhysicalMaterial({ map: maps[0], normalMap,
      normalScale: new THREE.Vector2(.45, .32), roughness: .27, metalness: .08,
      ior: 1.33, clearcoat: .55, clearcoatRoughness: .20, envMapIntensity: .25,
      transparent: true, opacity: .82, depthWrite: false })
    viewportFade.apply(material)
    finishes.push({ material, maps })
    return material
  }
  const outlines = [
    [[2.1, -2.8], [3.35, -2.75], [3.8, -1.65], [4.4, -.55], [6.25, .25], [7.65, 1.1],
      [8.05, 2.15], [7.35, 2.7], [5.7, 2.80], [4.45, 2.45], [3.85, 1.25], [3.35, .1], [2.5, -.85]],
    [[2.1, -2.8], [3.35, -2.75], [3.75, -1.65], [3.75, .2], [4.5, 2.35], [4.75, 4.5],
      [3.5, 5.0], [1.7, 4.8], [.95, 4.25], [1.0, 2.9], [2.8, .2], [2.5, -.85]]
  ]
  const waveSets = [
    [[3.8, -1.6, .55], [4.3, -.5, .45], [5.2, -.2, .60], [7, .8, .45],
      [7.9, 2, .50], [7.5, 2.7, .40], [5.2, 2.9, .60], [3.5, 2.35, .45]],
    [[3.5, -1.6, .4], [3.7, -.4, .45], [4.4, 2.4, .5], [4.4, 4.6, .5],
      [2.8, 5.1, .6], [1.4, 4.8, .5], [1.1, 3, .4]]
  ]

  const surfaces = outlines.map((outline, index) => {
    const points = outline.map(([x, z]) => new THREE.Vector2(x, -z))
    const shape = new THREE.Shape()
    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      const entry = point.clone().lerp(points[(i + points.length - 1) % points.length], .30)
      const exit = point.clone().lerp(points[(i + 1) % points.length], .30)
      if (i === 0) shape.moveTo(entry.x, entry.y)
      else shape.lineTo(entry.x, entry.y)
      shape.quadraticCurveTo(point.x, point.y, exit.x, exit.y)
    }
    shape.closePath()
    const geometry = new THREE.ShapeGeometry(shape, 24)
    geometry.computeBoundingBox()
    const bounds = geometry.boundingBox.clone()
    const width = bounds.max.x - bounds.min.x, height = bounds.max.y - bounds.min.y
    const center = bounds.getCenter(new THREE.Vector3())
    const path = new Path2D()
    shape.getPoints(24).forEach((point, i) => {
      if (i === 0) path.moveTo(point.x, point.y)
      else path.lineTo(point.x, point.y)
    })
    path.closePath()

    // ink shares the actual shoreline with every painted layer, keeping waves and reflections inside the water.
    function ink(draw, feather = .10) {
      return labelTexture((context, pixelsX, pixelsY) => {
        context.setTransform(pixelsX / width, 0, 0, -pixelsY / height,
          -bounds.min.x * pixelsX / width, bounds.max.y * pixelsY / height)
        context.clip(path)
        draw(context)
        context.globalAlpha = 1
        context.globalCompositeOperation = 'destination-out'
        context.shadowColor = '#000'
        context.shadowBlur = 1.5
        context.strokeStyle = '#000'
        context.lineWidth = feather
        context.lineJoin = 'round'
        context.stroke(path)
        context.stroke(path)
        context.shadowBlur = 0
      }, 1024, 1024)
    }
    const mask = ink(context => { context.fillStyle = '#fff'; context.fill(path) }, .16)
    geometry.translate(-center.x, -center.y, 0)
    const positions = geometry.getAttribute('position'), uv = geometry.getAttribute('uv')
    for (let i = 0; i < positions.count; i++) uv.setXY(i, positions.getX(i) / width + .5, positions.getY(i) / height + .5)
    const material = optics(width, height, center, mask)
    const surface = mesh(geometry, material, assembly, [center.x, -.123, -center.y])
    surface.rotation.x = -Math.PI / 2
    surface.castShadow = false
    surface.receiveShadow = true
    surface.userData.excludeFromFraming = true
    surface.userData.goforjEnvironment = 'water'
    surface.userData.surfaceBounds = { width, height }

    const waves = ink(context => {
      context.strokeStyle = '#fff'
      context.lineCap = 'round'
      for (const [x, z, length] of waveSets[index]) {
        const shimmer = context.createLinearGradient(x - length / 2, -z, x + length / 2, -z)
        shimmer.addColorStop(0, 'rgba(255,255,255,0)')
        shimmer.addColorStop(.35, '#fff')
        shimmer.addColorStop(.70, 'rgba(255,255,255,.65)')
        shimmer.addColorStop(1, 'rgba(255,255,255,0)')
        context.strokeStyle = shimmer
        context.lineWidth = .026
        context.beginPath()
        context.moveTo(x - length / 2, -z)
        context.quadraticCurveTo(x, -z - .025, x + length / 2, -z)
        context.stroke()
      }
    })
    const ripples = decal(waves, width, height, [0, 0, .002], [0, 0, 0], surface)
    viewportFade.apply(ripples.material)
    const reflectionInk = ink(context => {
      context.strokeStyle = '#fff'
      context.lineCap = 'round'
      context.lineWidth = .025
      for (let i = 0; i < 10; i++) {
        const x = 3.8 + i * .065, y = .85 - i * .10, length = .16 + Math.sin(i * 1.7) * .06 + i * .014
        context.globalAlpha = .62 - i * .046
        context.beginPath()
        context.moveTo(x - length / 2, y)
        context.quadraticCurveTo(x, y - .025, x + length / 2, y)
        context.stroke()
      }
    })
    const reflection = decal(reflectionInk, width, height, [0, 0, .004], [0, 0, 0], surface)
    viewportFade.apply(reflection.material)
    return { surface, ripples, reflection, mask, width, height }
  })
  let active = surfaces[0]

  return {
    // addBerth shares the open water's ripple scale and reflections at the recessed dock waterline.
    addBerth(parent) {
      const material = optics(2.08, 2.12, new THREE.Vector2(.89, 0), null)
      const berth = mesh(new THREE.PlaneGeometry(2.08, 2.12), material, parent, [.89, .201, 0])
      berth.rotation.x = -Math.PI / 2
      berth.castShadow = false
      berth.receiveShadow = true
      berth.userData.excludeFromFraming = true
      berth.userData.goforjEnvironment = 'berth'
      return berth
    },
    setTheme(dark) {
      for (const { material, maps } of finishes) {
        material.map = maps[dark ? 1 : 0]
        material.opacity = dark ? .94 : .96
      }
      for (const { ripples, reflection } of surfaces) {
        ripples.material.color.set(dark ? '#bad7de' : '#e1f1f2')
        ripples.material.opacity = dark ? .65 : .80
        reflection.material.color.set('#f1ce8d')
        reflection.material.opacity = dark ? .68 : .50
      }
    },
    setLayout(portrait) {
      active = surfaces[portrait ? 1 : 0]
      for (const entry of surfaces) entry.surface.visible = entry === active
    },
    // fit leaves the board's framing intact and sizes only the water using its visible shoreline.
    fit(camera, width, height) {
      const { surface } = active
      surface.scale.setScalar(1)
      surface.updateWorldMatrix(true, false)
      const center = new THREE.Vector3().setFromMatrixPosition(surface.matrixWorld).project(camera)
      const x = (center.x + 1) * width / 2, y = (1 - center.y) * height / 2
      const positions = surface.geometry.getAttribute('position'), point = new THREE.Vector3()
      let scale = 1
      for (let i = 0; i < positions.count; i++) {
        point.fromBufferAttribute(positions, i).applyMatrix4(surface.matrixWorld).project(camera)
        const dx = (point.x - center.x) * width / 2, dy = -(point.y - center.y) * height / 2
        if (dx < 0) scale = Math.min(scale, (x - 12) / -dx)
        if (dx > 0) scale = Math.min(scale, (width - x - 12) / dx)
        if (dy < 0) scale = Math.min(scale, (y - 12) / -dy)
        if (dy > 0) scale = Math.min(scale, (height - y - 12) / dy)
      }
      surface.scale.setScalar(Math.max(0, scale))
      surface.updateWorldMatrix(true, true)
    },
    floorCutout() { return active }
  }
}
