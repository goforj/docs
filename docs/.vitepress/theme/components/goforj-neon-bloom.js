import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js'

// createNeonBloom mirrors Foundry's white bevel glow while preserving the brand-colored face.
export function createNeonBloom(renderer, scene, camera) {
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
  return {
    draw,
    setTheme(dark) { bloomPass.strength = dark ? 1.2 : .75 },
    resize(width, height) {
      bloomComposer.setPixelRatio(renderer.getPixelRatio())
      bloomComposer.setSize(width, height)
      faceMask.setSize(Math.round(width * renderer.getPixelRatio()), Math.round(height * renderer.getPixelRatio()))
    },
    dispose() {
      faceMask.dispose()
      faceMaskMaterial.dispose()
      bloomPass.dispose()
      bloomComposer.dispose()
      bloomOverlayMaterial.dispose()
      bloomOverlay.dispose()
    }
  }
}
