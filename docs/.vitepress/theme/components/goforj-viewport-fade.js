import * as THREE from 'three'

// createViewportFade lets decorative surfaces fade before the canvas edge throughout parallax.
export function createViewportFade() {
  const viewport = { value: new THREE.Vector2(1, 1) }
  const margin = { value: 24 }
  return {
    apply(material) {
      material.onBeforeCompile = shader => {
        shader.uniforms.goforjViewport = viewport
        shader.uniforms.goforjMargin = margin
        shader.fragmentShader = `uniform vec2 goforjViewport;\nuniform float goforjMargin;\n${shader.fragmentShader}`
          .replace('#include <opaque_fragment>', `
            vec2 goforjEdge = min(gl_FragCoord.xy, goforjViewport - gl_FragCoord.xy);
            diffuseColor.a *= smoothstep(0.0, goforjMargin, min(goforjEdge.x, goforjEdge.y));
            #include <opaque_fragment>`)
      }
      material.customProgramCacheKey = () => 'goforj-viewport-fade-1'
    },
    resize(renderer) {
      renderer.getDrawingBufferSize(viewport.value)
      margin.value = 24 * renderer.getPixelRatio()
    }
  }
}
