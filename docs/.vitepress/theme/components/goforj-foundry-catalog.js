import { BUILDING_BLOCK_FAMILIES } from './goforj-hero-catalog.js'

export const FOUNDRY_RESOURCES = [
  { id: 'database', label: 'Database', color: '#a7a0cb', local: 'SQLite', production: 'Postgres', copy: 'Your data. Your choice of database.' },
  { id: 'queue', label: 'Queue', color: '#d5b77c', local: 'Workerpool', production: 'Redis', copy: 'Background work, with explicit workers and retries.' },
  { id: 'events', label: 'Events', color: '#81b9b1', local: 'In-process', production: 'NATS', copy: 'Typed events, with local or distributed fan-out.' },
  { id: 'storage', label: 'Storage', color: '#81acbf', local: 'Local disk', production: 'S3', copy: 'Named disks, from your filesystem to object storage.' },
  { id: 'cache', label: 'Cache', color: '#b9bd8c', local: 'Memory', production: 'Redis', copy: 'Temporary data behind a swappable store.' },
  { id: 'mail', label: 'Mail', color: '#d29d83', local: 'Log', production: 'SMTP', copy: 'Develop with logged mail. Deliver through your provider.' }
]

export const FOUNDRY_AREAS = [
  { id: 'atlas', label: 'Atlas', sceneLabel: 'Atlas · Agent tooling', color: '#bc9aaf', x: 1.45, z: 2.55, copy: 'First-class agent support for Codex, Claude Code, Gemini CLI, and GitHub Copilot. Project guidance, skills, and local MCP context.', noun: 'FIRST-CLASS AGENT TOOLING', context: 'GUIDANCE · SKILLS · LOCAL MCP' },
  { id: 'frontend', label: 'Frontend', color: '#76bba0', x: -1.55, z: 2.55, copy: 'Vue, React, or templ. Start with an app shell you own, then make it yours.', noun: 'FRONTEND CHOICES', context: 'YOUR UI · YOUR SOURCE' },
  { id: 'libraries', label: 'Libraries', color: '#82b8b2', x: 2.45, z: -2.6, copy: 'Use first-party Go libraries inside your app or independently. Small packages, explicit contracts.', noun: 'CORE LIBRARIES', context: 'USE WITH OR WITHOUT GOFORJ' },
  { id: 'runtimes', label: 'Runtimes', sceneLabel: 'Runtimes', color: '#f39266', x: 2.65, z: 1.2, copy: 'HTTP, workers, schedules, and CLI commands. Run them together or as separate processes, with explicit wiring and lifecycle.', noun: 'APPLICATION RUNTIMES', context: 'ONE APP · MULTIPLE PROCESS ROLES' },
  { id: 'infrastructure', label: 'Drivers', sceneLabel: 'Infrastructure', color: '#aba3c7', x: -2.65, z: .1, copy: 'Six infrastructure libraries with interchangeable backends. Start local, then choose the drivers your deployment needs.', noun: 'INFRASTRUCTURE LIBRARIES', context: 'SWAP DRIVERS · KEEP YOUR LOGIC' },
  { id: 'lighthouse', label: 'Lighthouse', color: '#90c9c4', x: 3, z: -.65, copy: 'See inside your running app: requests, jobs, logs, routes, resources, and runtime state in one operator UI.', noun: 'RUNTIME VISIBILITY', context: 'UNDERSTAND WHAT YOUR APP IS DOING' },
  { id: 'development', label: 'Dev tools', sceneLabel: 'Developer tools', color: '#d4bc80', x: -3.3, z: -1.7, copy: 'A coordinated development loop, scaffolding, compile-time wiring, and an API index. Work in ordinary Go source.', noun: 'DEVELOPER WORKFLOW', context: 'BUILD · WIRE · RUN · REPEAT' },
  { id: 'auth', label: 'Auth', color: '#a1b88b', x: .25, z: -2.65, copy: 'App-owned authentication, sessions, cookies, and OAuth integration. Clear ownership from the UI to the backend.', noun: 'AUTHENTICATION', context: 'APPLICATION CODE YOU CAN READ' }
]

// link names existing documentation without inventing commands or configuration.
function link(id, title, icon, href, color = '#7fa6ac') { return { id, title, icon, href, color } }

export const FOUNDRY_CHOICES = {
  ...BUILDING_BLOCK_FAMILIES,
  infrastructure: FOUNDRY_RESOURCES.map(item => ({ ...item, title: item.label, icon: { database: 'database', queue: 'rows-3', events: 'radio', storage: 'hard-drive', cache: 'blocks', mail: 'mail' }[item.id], resource: true })),
  runtimes: [
    link('runtime-http', 'HTTP', 'globe', '/operations/http-server'),
    link('runtime-workers', 'Workers', 'rows-3', '/operations/queue-workers'),
    link('runtime-schedules', 'Scheduler', 'clock', '/operations/scheduler-processes'),
    link('runtime-cli', 'CLI', 'terminal', '/applications/commands'),
    link('runtime-lifecycle', 'Lifecycle', 'activity', '/operations/runtime-processes'),
    link('runtime-wiring', 'Explicit wiring', 'git-branch', '/developer-tools/wiring-recipes')
  ],
  lighthouse: [
    link('observe-ui', 'Lighthouse UI', 'radar', '/operations/lighthouse'),
    link('observe-inspects', 'Inspects', 'activity', '/operations/inspects'),
    link('observe-logs', 'Logs', 'terminal', '/operations/logging'),
    link('observe-metrics', 'Metrics', 'activity', '/operations/metrics'),
    link('observe-health', 'Health', 'shield-check', '/operations/health-readiness'),
    link('observe-routes', 'Routes', 'git-branch', '/applications/routes')
  ],
  development: [
    link('dev-loop', 'forj dev', 'terminal', '/developer-tools/forj-dev'),
    link('dev-scaffold', 'Scaffolding', 'blocks', '/developer-tools/'),
    link('dev-wire', 'Wiring', 'git-branch', '/developer-tools/wiring-recipes'),
    link('dev-api', 'API index', 'globe', '/applications/api-index'),
    link('dev-config', 'Configuration', 'file', '/getting-started/configuration'),
    link('dev-project', 'Project structure', 'package-2', '/getting-started/project-structure')
  ],
  auth: [
    link('auth-overview', 'Authentication', 'shield-check', '/security/auth'),
    link('auth-sessions', 'Sessions', 'key-round', '/security/sessions-cookies'),
    link('auth-oauth', 'OAuth', 'key-round', '/security/oauth'),
    link('auth-starters', 'Starter kits', 'app-window', '/starter-kits')
  ]
}
