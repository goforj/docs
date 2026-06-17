<script setup>
import { ref } from 'vue'

const starterCommand = 'forj new my-app --starter-kit <kit>'
const copiedStarterCommand = ref(false)
let copyResetTimer

async function copyStarterCommand() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    if (!navigator.clipboard) {
      throw new Error('Clipboard API unavailable')
    }

    await navigator.clipboard.writeText(starterCommand)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = starterCommand
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }

  copiedStarterCommand.value = true
  window.clearTimeout(copyResetTimer)
  copyResetTimer = window.setTimeout(() => {
    copiedStarterCommand.value = false
  }, 1600)
}
</script>

<template>
  <section class="gf-starter-section gf-starter-section--supported gf-starter-section--no-rule">
    <div class="gf-starter-support-hero">
      <div>
        <p class="gf-starter-eyebrow">Supported Starter Kits</p>
        <h2>Choose how you want to build your App</h2>
        <p>
          Different teams, different preferences. Every starter kit generates source code directly
          into your App, so the starting point is useful without becoming a hidden runtime.
        </p>
        <div class="gf-starter-pillars" aria-label="Starter kit principles">
          <span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m8 9-4 3 4 3m8-6 4 3-4 3m-2-9-4 12" />
            </svg>
            <span><strong>Source first</strong><em>You own the code.</em></span>
          </span>
          <span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 10V8a5 5 0 0 1 10 0v2m-9 0h8a2 2 0 0 1 2 2v7H6v-7a2 2 0 0 1 2-2Z" />
            </svg>
            <span><strong>No lock-in</strong><em>No hidden runtimes.</em></span>
          </span>
          <span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 7h10l-3-3m3 3-3 3M17 17H7l3 3m-3-3 3-3" />
            </svg>
            <span><strong>Swap later</strong><em>Keep the backend model.</em></span>
          </span>
          <span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 19c2.5-.4 4.4-1.5 5.7-3.2m-2.5-2.5L5 12l2.6-2.6 2.8.6m3.6 5.8.6 2.8L12 21l-1.3-3.2M9.5 14.5 15 9m-1-4h5v5c0 4.4-3.6 8-8 8H8v-3c0-4.4 3.6-8 8-8Z" />
            </svg>
            <span><strong>Built for Go</strong><em>Go stays at the core.</em></span>
          </span>
        </div>
      </div>
      <aside class="gf-starter-command-card">
        <div>
          <p>Create a new App with any starter kit.</p>
          <span>Pick a frontend now, or change it later.</span>
        </div>
        <div class="gf-starter-command-card__command">
          <span aria-hidden="true">$</span>
          <code>{{ starterCommand }}</code>
          <button type="button" :aria-label="copiedStarterCommand ? 'Command copied' : 'Copy command'" @click="copyStarterCommand">
            {{ copiedStarterCommand ? 'Copied' : 'Copy' }}
          </button>
        </div>
        <a href="/reference/cli">View CLI reference -></a>
      </aside>
    </div>

    <div class="gf-starter-kit-grid">
      <article class="gf-starter-kit-card gf-starter-kit-card--react">
        <div class="gf-starter-kit-card__mark" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236a2.236 2.236 0 0 1-2.236-2.236a2.236 2.236 0 0 1 2.235-2.236a2.236 2.236 0 0 1 2.236 2.236m2.648-10.69c-1.346 0-3.107.96-4.888 2.622c-1.78-1.653-3.542-2.602-4.887-2.602c-.41 0-.783.093-1.106.278c-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03c-.704 3.113-.39 5.588.988 6.38c.32.187.69.275 1.102.275c1.345 0 3.107-.96 4.888-2.624c1.78 1.654 3.542 2.603 4.887 2.603c.41 0 .783-.09 1.106-.275c1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032c.704-3.11.39-5.587-.988-6.38a2.17 2.17 0 0 0-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127c.666.382.955 1.835.73 3.704c-.054.46-.142.945-.25 1.44a23.5 23.5 0 0 0-3.107-.534A24 24 0 0 0 12.769 4.7c1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28c-.686.72-1.37 1.537-2.02 2.442a23 23 0 0 0-3.113.538a15 15 0 0 1-.254-1.42c-.23-1.868.054-3.32.714-3.707c.19-.09.4-.127.563-.132zm4.882 3.05q.684.704 1.36 1.564c-.44-.02-.89-.034-1.345-.034q-.691-.001-1.36.034c.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093q.61.874 1.183 1.86q.557.961 1.018 1.946c-.308.655-.646 1.31-1.013 1.95c-.38.66-.773 1.288-1.18 1.87a25.6 25.6 0 0 1-4.412.005a27 27 0 0 1-1.183-1.86q-.557-.961-1.018-1.946a25 25 0 0 1 1.013-1.954c.38-.66.773-1.286 1.18-1.868A25 25 0 0 1 12 8.098zm-3.635.254c-.24.377-.48.763-.704 1.16q-.336.585-.635 1.174c-.265-.656-.49-1.31-.676-1.947c.64-.15 1.315-.283 2.015-.386zm7.26 0q1.044.153 2.006.387c-.18.632-.405 1.282-.66 1.933a26 26 0 0 0-1.345-2.32zm3.063.675q.727.226 1.375.498c1.732.74 2.852 1.708 2.852 2.476c-.005.768-1.125 1.74-2.857 2.475c-.42.18-.88.342-1.355.493a24 24 0 0 0-1.1-2.98c.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98a23 23 0 0 0-1.086 2.964c-.484-.15-.944-.318-1.37-.5c-1.732-.737-2.852-1.706-2.852-2.474s1.12-1.742 2.852-2.476c.42-.18.88-.342 1.356-.494m11.678 4.28c.265.657.49 1.312.676 1.948c-.64.157-1.316.29-2.016.39a26 26 0 0 0 1.341-2.338zm-9.945.02c.2.392.41.783.64 1.175q.345.586.705 1.143a22 22 0 0 1-2.006-.386c.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423c.23 1.868-.054 3.32-.714 3.708c-.147.09-.338.128-.563.128c-1.012 0-2.514-.807-4.11-2.28c.686-.72 1.37-1.536 2.02-2.44c1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532c.66.905 1.345 1.727 2.035 2.446c-1.595 1.483-3.092 2.295-4.11 2.295a1.2 1.2 0 0 1-.553-.132c-.666-.38-.955-1.834-.73-3.703c.054-.46.142-.944.25-1.438zm4.56.64q.661.032 1.345.034q.691.001 1.36-.034c-.44.572-.895 1.095-1.345 1.565q-.684-.706-1.36-1.565" />
          </svg>
        </div>
        <div>
          <h3>React Starter Kit</h3>
          <strong>Rich client applications</strong>
          <p>Build modern SPAs and dashboards with React and a fast developer experience.</p>
          <div class="gf-starter-kit-card__tags"><span>React</span><span>Vite</span><span>shadcn/ui</span></div>
          <p class="gf-starter-kit-card__credit">
            UI base <a href="https://ui.shadcn.com/" target="_blank" rel="noreferrer noopener">shadcn/ui</a>
          </p>
        </div>
        <code>react</code>
        <div class="gf-starter-kit-card__includes">
          <p>Includes</p>
          <ul>
            <li>Web UI with React + Vite</li>
            <li>Tailwind CSS and shadcn/ui</li>
            <li>Example pages and layouts</li>
            <li>TypeScript configuration</li>
            <li>Build and dev scripts</li>
          </ul>
        </div>
      </article>
      <article class="gf-starter-kit-card gf-starter-kit-card--vue">
        <div class="gf-starter-kit-card__mark" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M24 1.61h-9.94L12 5.16L9.94 1.61H0l12 20.78ZM12 14.08L5.16 2.23h4.43L12 6.41l2.41-4.18h4.43Z" />
          </svg>
        </div>
        <div>
          <h3>Vue Starter Kit</h3>
          <strong>Vue-first teams</strong>
          <p>Build modern SPAs with Vue's Composition API and excellent developer experience.</p>
          <div class="gf-starter-kit-card__tags"><span>Vue</span><span>Vite</span><span>shadcn-vue</span></div>
          <p class="gf-starter-kit-card__credit">
            UI base <a href="https://www.shadcn-vue.com/" target="_blank" rel="noreferrer noopener">shadcn-vue</a>
          </p>
        </div>
        <code>vue</code>
        <div class="gf-starter-kit-card__includes">
          <p>Includes</p>
          <ul>
            <li>Web UI with Vue + Vite</li>
            <li>Tailwind CSS and shadcn-vue</li>
            <li>Example pages and layouts</li>
            <li>TypeScript configuration</li>
            <li>Build and dev scripts</li>
          </ul>
        </div>
      </article>
      <article class="gf-starter-kit-card gf-starter-kit-card--templ">
        <div class="gf-starter-kit-card__mark gf-starter-kit-card__mark--combo" aria-hidden="true">
          <span>templ</span>
          <svg viewBox="0 0 24 24">
            <path d="M0 13.01v-2l7.09-2.98l.58 1.94l-5.1 2.05l5.16 2.05l-.63 1.9Zm16.37 1.03l5.18-2l-5.16-2.09l.65-1.88L24 10.95v2.12L17 16zm-2.85-9.98H16l-5.47 15.88H8.05Z" />
          </svg>
        </div>
        <div>
          <h3>templ + htmx Starter Kit</h3>
          <strong>Go-first server rendering</strong>
          <p>Lean, fast, and simple server-rendered screens with progressive enhancement.</p>
          <div class="gf-starter-kit-card__tags"><span>templ</span><span>htmx</span><span>Tailwind</span></div>
          <p class="gf-starter-kit-card__credit">
            UI base <a href="https://basecoatui.com/" target="_blank" rel="noreferrer noopener">Basecoat</a>
          </p>
        </div>
        <code>templ_htmx</code>
        <div class="gf-starter-kit-card__includes">
          <p>Includes</p>
          <ul>
            <li>Server-rendered UI with templ</li>
            <li>htmx progressive enhancement</li>
            <li>Tailwind CSS</li>
            <li>Example pages and layouts</li>
            <li>Build and dev scripts</li>
          </ul>
        </div>
      </article>
      <article class="gf-starter-kit-card gf-starter-kit-card--plain">
        <div class="gf-starter-kit-card__mark gf-starter-kit-card__mark--image" aria-hidden="true">
          <img src="/assets/goforj-v7.png" alt="">
        </div>
        <div>
          <h3>No Starter Kit</h3>
          <strong>Bring your own frontend</strong>
          <p>Start with a clean application shell and add only what the App needs.</p>
          <div class="gf-starter-kit-card__tags"><span>Web UI</span><span>custom frontend</span></div>
          <p class="gf-starter-kit-card__credit">UI base <span>Your choice</span></p>
        </div>
        <code>none</code>
        <div class="gf-starter-kit-card__includes">
          <p>Includes</p>
          <ul>
            <li>Minimal GoForj application</li>
            <li>Routing and handler foundation</li>
            <li>Configuration and env setup</li>
            <li>Build and dev scripts</li>
            <li>Ready for your frontend</li>
          </ul>
        </div>
      </article>
    </div>

    <div class="gf-starter-compare">
      <div>
        <h3>Compare at a glance</h3>
        <p>Pick the model that fits your team and product.</p>
      </div>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>
              <span class="gf-starter-compare-kit gf-starter-compare-kit--react">
                <span class="gf-starter-compare-kit__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="2.2" />
                    <ellipse cx="12" cy="12" rx="9" ry="3.8" />
                    <ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(60 12 12)" />
                    <ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(120 12 12)" />
                  </svg>
                </span>
                <span>React</span>
              </span>
            </th>
            <th>
              <span class="gf-starter-compare-kit gf-starter-compare-kit--vue">
                <span class="gf-starter-compare-kit__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M24 1.61h-9.94L12 5.16L9.94 1.61H0l12 20.78ZM12 14.08L5.16 2.23h4.43L12 6.41l2.41-4.18h4.43Z" />
                  </svg>
                </span>
                <span>Vue</span>
              </span>
            </th>
            <th>
              <span class="gf-starter-compare-kit gf-starter-compare-kit--templ">
                <span class="gf-starter-compare-kit__icon gf-starter-compare-kit__icon--templ" aria-hidden="true">templ</span>
                <span>templ + htmx</span>
              </span>
            </th>
            <th>
              <span class="gf-starter-compare-kit gf-starter-compare-kit--plain">
                <span class="gf-starter-compare-kit__icon gf-starter-compare-kit__icon--image" aria-hidden="true">
                  <img src="/assets/goforj-v7.png" alt="">
                </span>
                <span>None</span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              <span class="gf-starter-compare-row-label">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="8" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3m0 14v3m10-10h-3M5 12H2" />
                </svg>
                <span>Best for</span>
              </span>
            </th>
            <td>Rich client apps and dashboards</td>
            <td>Vue-first teams and ecosystems</td>
            <td>Go-first server-rendered Apps</td>
            <td>Custom frontends or API-first Apps</td>
          </tr>
          <tr>
            <th>
              <span class="gf-starter-compare-row-label">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="4" y="5" width="16" height="12" rx="2" />
                  <path d="M8 21h8m-4-4v4" />
                </svg>
                <span>Rendering model</span>
              </span>
            </th>
            <td>Client-side SPA</td>
            <td>Client-side SPA</td>
            <td>Server-rendered</td>
            <td>Your choice</td>
          </tr>
          <tr>
            <th>
              <span class="gf-starter-compare-row-label">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 8h10M7 12h10M7 16h6" />
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                </svg>
                <span>JavaScript required</span>
              </span>
            </th>
            <td>Yes</td>
            <td>Yes</td>
            <td>Minimal</td>
            <td>Your choice</td>
          </tr>
          <tr>
            <th>
              <span class="gf-starter-compare-row-label">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 13h3l2-4 3 8 2-4h6" />
                  <path d="M4 19h16" />
                </svg>
                <span>Go-centric</span>
              </span>
            </th>
            <td>Medium</td>
            <td>Medium</td>
            <td>High</td>
            <td>High</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="gf-starter-support-cta">
      <div>
        <h3>Not sure which to pick?</h3>
        <p>You can start with any kit and change later. Your code, your choice.</p>
      </div>
      <a href="/getting-started/starter-kits">Read the starter kit guide -></a>
    </div>
  </section>
</template>
