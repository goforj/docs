<script setup>
import { ref, onMounted, computed } from 'vue'

const isMounted = ref(false)
const hoveredBlock = ref(null)

onMounted(() => {
  setTimeout(() => {
    isMounted.value = true
  }, 100)
})

// PROFESSIONAL SVG ICON PATHS
const ICONS = {
  openai: "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 22.8182a5.9847 5.9847 0 0 0 3.9977-2.9 6.0462 6.0462 0 0 0-.7427-7.0966 5.98 5.98 0 0 0 .511-4.9107 6.051 6.051 0 0 0-6.5146-2.9001",
  vue: "M12 22L0 1.5h4.5L12 18l7.5-16.5H24L12 22z M7.5 1.5L12 10l4.5-8.5H16L12 7.5l-4-6H7.5z",
  go: "M2 12h2v10h12v-10h2v12h-16v-12z M12 2c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6z", 
  storage: "M21 12c0 1.66-4 3-9 3s-9-1.34-9-3 4-3 9-3 9 1.34 9 3z M3 5c0 1.66 4 3 9 3s9-1.34 9-3 M3 19c0 1.66 4 3 9 3s9-1.34 9-3 M3 5v14 M21 5v14",
  queue: "M3 6h18 M3 12h18 M3 18h18 M7 6v12 M17 6v12",
  sparkles: "M12 3l2.4 4.8 5.3.8-3.8 3.7.9 5.3-4.8-2.5-4.8 2.5.9-5.3-3.8-3.7 5.3-.8L12 3z"
}

// REFINED ISOMETRIC DATA
const rawTower = [
  // Foundation Shelf
  { id: 'shelf-0', type: 'shelf', x: 0, y: 0, z: 0, w: 4, d: 4, h: 0.1, color: '#f8fafc', opacity: 0.2 },

  // Runtime - Wide base block
  { id: 'runtime', type: 'block', label: 'RUNTIME', icon: 'go', labelFace: 'left', x: 0.5, y: 0.5, z: 0.1, w: 3, d: 3, h: 0.6, color: '#1e293b', textColor: '#94a3b8' },

  // Core - Large tall red block with Official Logo
  { 
    id: 'core', 
    type: 'block', 
    label: 'CORE', 
    imageLabel: '/assets/goforj-letters.png', 
    imageIcon: '/assets/goforj-hammer.png',
    labelFace: 'left', 
    x: 1, y: 1, z: 0.7, w: 2, d: 2, h: 1.8, 
    color: '#ef4444', 
    textColor: '#ffffff' 
  },

  // Tooling Shelf - Glass
  { id: 'shelf-1', type: 'shelf', x: 0.5, y: 0.5, z: 2.5, w: 3, d: 3, h: 0.1, color: '#ffffff', opacity: 0.3 },

  // Libraries on the shelf
  { id: 'strings', type: 'block', label: 'STRINGS', icon: 'vue', labelFace: 'left', x: 0.7, y: 0.7, z: 2.6, w: 0.8, d: 0.8, h: 0.8, color: '#3b82f6', textColor: '#ffffff' },
  { id: 'queue', type: 'block', label: 'QUEUE', icon: 'queue', labelFace: 'right', x: 2.5, y: 0.7, z: 2.6, w: 0.8, d: 0.8, h: 0.8, color: '#f59e0b', textColor: '#ffffff' },
  { id: 'storage', type: 'block', label: 'STORAGE', icon: 'storage', labelFace: 'left', x: 0.7, y: 2.5, z: 2.6, w: 0.8, d: 0.8, h: 0.8, color: '#10b981', textColor: '#ffffff' },
  { id: 'collection', type: 'block', label: 'COLL', icon: 'sparkles', labelFace: 'right', x: 2.5, y: 2.5, z: 2.6, w: 0.8, d: 0.8, h: 0.8, color: '#8b5cf6', textColor: '#ffffff' },

  // Agents - Top floating block
  { id: 'agents', type: 'block', label: 'AGENTS', highlight: 'AI Ready', icon: 'openai', labelFace: 'left', x: 1.25, y: 1.25, z: 3.8, w: 1.5, d: 1.5, h: 1.4, color: '#6366f1', textColor: '#ffffff' },
]

// DEPTH SORTING
const tower = computed(() => {
  return [...rawTower].sort((a, b) => {
    const depthA = a.x + a.y + a.z
    const depthB = b.x + b.y + b.z
    return depthA - depthB
  })
})

// PROJECTION
const SCALE = 70 
const ORIGIN_X = 400
const ORIGIN_Y = 500
const ISO_X_VECTOR = { x: 0.866, y: 0.5 } 
const ISO_Y_VECTOR = { x: -0.866, y: 0.5 } 
const ISO_Z_VECTOR = { x: 0, y: -1 }      

function project(ix, iy, iz) {
  return {
    x: ORIGIN_X + (ix * ISO_X_VECTOR.x * SCALE) + (iy * ISO_Y_VECTOR.x * SCALE),
    y: ORIGIN_Y + (ix * ISO_X_VECTOR.y * SCALE) + (iy * ISO_Y_VECTOR.y * SCALE) + (iz * ISO_Z_VECTOR.y * SCALE)
  }
}

function getFacePath(pts) {
  return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y} L ${pts[2].x} ${pts[2].y} L ${pts[3].x} ${pts[3].y} Z`
}

function getBlockGeom(block) {
  const { x, y, z, w, d, h } = block
  const v = [
    project(x, y, z), project(x + w, y, z), project(x + w, y + d, z), project(x, y + d, z),
    project(x, y, z + h), project(x + w, y, z + h), project(x + w, y + d, z + h), project(x, y + d, z + h)
  ]
  return {
    top: [v[4], v[5], v[6], v[7]],
    frontRight: [v[1], v[2], v[6], v[5]], 
    frontLeft: [v[3], v[2], v[6], v[7]],  
    frontLeftCenter: project(x + w/2, y + d, z + h/2),
    frontRightCenter: project(x + w, y + d/2, z + h/2),
    topCenter: project(x + w/2, y + d/2, z + h)
  }
}

const MATRIX_DOWN_RIGHT = `matrix(0.866, 0.5, 0, 1, 0, 0)`
const MATRIX_DOWN_LEFT = `matrix(0.866, -0.5, 0, 1, 0, 0)`
const MATRIX_TOP = `matrix(0.866, 0.5, -0.866, 0.5, 0, 0)`

function adjustColor(color, amount) {
  const clamp = (val) => Math.min(255, Math.max(0, val))
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `#${clamp(r + amount).toString(16).padStart(2, '0')}${clamp(g + amount).toString(16).padStart(2, '0')}${clamp(b + amount).toString(16).padStart(2, '0')}`
}
</script>

<template>
  <div class="gf-home-hero">
    <div class="gf-hero-container">
      <div class="gf-hero-content" :class="{ 'is-visible': isMounted }">
        <h1 class="gf-hero-title">
          <span class="gf-hero-brand-mark">GoForj</span><br />
          <span class="gf-hero-headline">The explicit stack for Go services and agents.</span>
        </h1>
        <p class="gf-hero-tagline">
          High-trust libraries and tools designed for productivity, performance, and total clarity. Batteries-included, but never opaque.
        </p>
        <div class="gf-hero-actions">
          <a href="/collection" class="gf-hero-btn gf-hero-btn--primary">Explore Libraries</a>
          <a href="/about" class="gf-hero-btn gf-hero-btn--secondary">Design Philosophy</a>
        </div>
      </div>

      <div class="gf-hero-graphic" :class="{ 'is-visible': isMounted }">
        <svg class="gf-hero-svg" viewBox="0 0 800 900" preserveAspectRatio="xMidYMid meet">
          <defs>
            <template v-for="item in rawTower" :key="`grads-${item.id}`">
              <linearGradient :id="`grad-top-${item.id}`" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" :stop-color="adjustColor(item.color, 35)" />
                <stop offset="100%" :stop-color="item.color" />
              </linearGradient>
              <linearGradient :id="`grad-fr-${item.id}`" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" :stop-color="adjustColor(item.color, -5)" />
                <stop offset="100%" :stop-color="item.color" />
              </linearGradient>
              <linearGradient :id="`grad-fl-${item.id}`" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" :stop-color="adjustColor(item.color, -25)" />
                <stop offset="100%" :stop-color="adjustColor(item.color, -45)" />
              </linearGradient>
            </template>
            <linearGradient id="glass-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6" />
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0.1" />
            </linearGradient>
            <filter id="block-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="25" stdDeviation="20" flood-opacity="0.18" />
            </filter>
          </defs>

          <g class="gf-iso-group" filter="url(#block-shadow)">
            <template v-for="(item, index) in tower" :key="item.id">
              <g class="gf-iso-item-wrapper"
                 @mouseenter="hoveredBlock = item.id"
                 @mouseleave="hoveredBlock = null"
                 :style="{
                   transition: 'all 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)',
                   transitionDelay: `${index * 80}ms`,
                   opacity: isMounted ? (item.opacity || 1) : 0,
                   transform: isMounted
                     ? `translateY(${hoveredBlock === item.id ? -20 : 0}px)`
                     : 'translateY(150px)'
                 }">
                <g class="gf-iso-item" :style="{ animationDelay: `${index * 250}ms` }">
                  <template v-if="item.type === 'shelf'">
                    <path :d="getFacePath(getBlockGeom(item).top)" fill="url(#glass-sheen)" :fill-opacity="item.opacity" stroke="#ffffff" stroke-opacity="0.4" stroke-width="1.5" />
                  </template>
                  <template v-else>
                    <path :d="getFacePath(getBlockGeom(item).frontLeft)" :fill="`url(#grad-fl-${item.id})`" />
                    <path :d="getFacePath(getBlockGeom(item).frontRight)" :fill="`url(#grad-fr-${item.id})`" />
                    <path :d="getFacePath(getBlockGeom(item).top)" :fill="`url(#grad-top-${item.id})`" />

                    <!-- ENHANCED ICON OR IMAGE ON TOP FACE -->
                    <g :transform="`translate(${getBlockGeom(item).topCenter.x}, ${getBlockGeom(item).topCenter.y})`">
                      <g :transform="MATRIX_TOP">
                        <template v-if="item.imageIcon">
                           <image :xlink:href="item.imageIcon" x="-30" y="-30" width="60" height="60" opacity="0.8" />
                        </template>
                        <template v-else-if="item.icon">
                          <g transform="translate(-18, -18) scale(1.5)">
                            <path :d="ICONS[item.icon]" :fill="item.textColor" fill-opacity="0.7" />
                          </g>
                        </template>
                      </g>
                    </g>

                    <!-- DYNAMIC LABEL ORIENTATION OR IMAGE LABEL -->
                    <g :transform="`translate(${item.labelFace === 'right' ? getBlockGeom(item).frontRightCenter.x : getBlockGeom(item).frontLeftCenter.x}, ${item.labelFace === 'right' ? getBlockGeom(item).frontRightCenter.y : getBlockGeom(item).frontLeftCenter.y})`">
                      <g :transform="item.labelFace === 'right' ? MATRIX_DOWN_LEFT : MATRIX_DOWN_RIGHT">
                        <template v-if="item.imageLabel">
                           <image :xlink:href="item.imageLabel" x="-60" y="-20" width="120" height="40" />
                        </template>
                        <template v-else-if="item.label">
                          <text text-anchor="middle" :fill="item.textColor" font-weight="800" font-size="11" class="iso-label">{{ item.label }}</text>
                          <text v-if="item.highlight" y="32" text-anchor="middle" :fill="item.textColor" font-weight="900" :font-size="item.id === 'core' ? 42 : 28" class="iso-highlight">{{ item.highlight }}</text>
                        </template>
                      </g>
                    </g>
                  </template>
                </g>
              </g>
            </template>
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gf-home-hero {
  position: relative;
  width: 100%;
  padding: 1.5rem 2rem 6rem;
  overflow: visible;
  background: radial-gradient(circle at 75% 35%, rgba(99, 102, 241, 0.08) 0%, transparent 55%);
}
.gf-hero-container {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 5rem;
}
.gf-hero-content {
  flex: 1.1;
  opacity: 0;
  transform: translateY(30px);
  transition: all 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.gf-hero-content.is-visible {
  opacity: 1;
  transform: translateY(0);
}
.gf-hero-brand-mark {
  font-size: 1.65rem;
  font-weight: 800;
  color: #6366f1;
  letter-spacing: -0.01em;
  margin-bottom: 1.2rem;
  display: inline-block;
}
.gf-hero-title {
  font-size: 5rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.05em;
  color: var(--vp-c-text-1);
  margin-bottom: 2.5rem;
}
.gf-hero-headline {
  background: linear-gradient(to bottom right, var(--vp-c-text-1) 30%, var(--vp-c-text-2));
  -webkit-background-clip: text;
  background-clip: text;
}
.gf-hero-tagline {
  font-size: 1.35rem;
  line-height: 1.65;
  color: var(--vp-c-text-2);
  max-width: 580px;
  margin-bottom: 3.5rem;
  font-weight: 450;
}
.gf-hero-actions {
  display: flex;
  gap: 1.25rem;
}
.gf-hero-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 2.25rem;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 1.15rem;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.gf-hero-btn--primary {
  background-color: #6366f1;
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}
.gf-hero-btn--primary:hover {
  background-color: #4f46e5;
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 24px rgba(99, 102, 241, 0.4);
}
.gf-hero-btn--secondary {
  background-color: rgba(255, 255, 255, 0.03);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  backdrop-filter: blur(8px);
}
.gf-hero-btn--secondary:hover {
  background-color: rgba(255, 255, 255, 0.08);
  transform: translateY(-3px) scale(1.02);
}
.gf-hero-graphic {
  flex: 1.4;
  position: relative;
  opacity: 0;
  transition: opacity 1.8s ease;
}
.gf-hero-graphic.is-visible {
  opacity: 1;
}
.gf-hero-svg {
  width: 100%;
  height: auto;
  overflow: visible;
}
.gf-iso-item {
  cursor: pointer;
  animation: bob 5s ease-in-out infinite alternate;
}
@keyframes bob {
  0% { transform: translateY(0); }
  100% { transform: translateY(-12px); }
}
.iso-label {
  user-select: none;
  pointer-events: none;
  letter-spacing: 0.1em;
}
.iso-highlight {
  user-select: none;
  pointer-events: none;
  letter-spacing: -0.02em;
}
@media (max-width: 1024px) {
  .gf-hero-container {
    flex-direction: column;
    text-align: center;
    gap: 3rem;
  }
  .gf-hero-title {
    font-size: 3.8rem;
  }
  .gf-hero-tagline {
    margin-left: auto;
    margin-right: auto;
  }
  .gf-hero-actions {
    justify-content: center;
  }
  .gf-hero-graphic {
    width: 100%;
    max-width: 650px;
  }
}
@media (max-width: 640px) {
  .gf-hero-title {
    font-size: 3rem;
  }
  .gf-hero {
    padding-top: 3rem;
  }
  .gf-hero-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
