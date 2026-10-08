---
layout: home
title: GoForj - The composable stack for building with Go
titleTemplate: false
description: Build APIs, workers, CLIs, and full web products in Go. Explicit wiring, interchangeable drivers, and the tools to run it all.
---

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { lucideIconBodies } from 'virtual:goforj-icons'
import FrameworkBlockIcon from './.vitepress/theme/components/FrameworkBlockIcon.vue'
import RuntimeTopology from './.vitepress/theme/components/RuntimeTopology.vue'
import ProjectAppsDiagram from './.vitepress/theme/components/ProjectAppsDiagram.vue'
import DevTerminalPreview from './.vitepress/theme/components/DevTerminalPreview.vue'
import proofStats from './.vitepress/data/proof-stats.json'
import dashboardPreview from './assets/starter-kits/app-dashboard-shell.png'
import signinPreview from './assets/starter-kits/account-login.png'
import settingsPreview from './assets/starter-kits/account-profile-settings.png'

// Proof band numbers are generated, not written. See bin/collect-proof-stats.mjs
// for methodology.
const PROOF = [
  { count: Math.floor(proofStats.totals.testFunctions / 100) * 100, suffix: '+', label: 'test functions in first-party libraries' },
  { count: Math.floor(proofStats.totals.integrationTests / 10) * 10, suffix: '+', label: 'integration test runs against real backends' },
  { count: proofStats.totals.drivers, suffix: '', label: 'drivers across six infrastructure libraries' },
  { count: proofStats.totals.libraries, suffix: '', label: 'libraries you can use independently' }
]
const fmt = (n) => n.toLocaleString('en-US')

const swapMode = ref('local')

// Driver values follow goforj/project/resource_catalog.go and generated env scopes.
const DRIVER_OPTIONS = {
  STORAGE_PHOTOS_DRIVER: ['local', 'memory', 'redis', 'ftp', 'sftp', 's3', 'gcs', 'dropbox', 'rclone'],
  DB_DRIVER: ['sqlite', 'mysql', 'postgres'],
  CACHE_DRIVER: ['memory', 'file', 'null', 'redis', 'memcached', 'dynamodb', 'sqlite', 'postgres', 'mysql', 'nats'],
  QUEUE_DRIVER: ['null', 'sync', 'workerpool', 'redis', 'nats', 'sqs', 'rabbitmq', 'sqlite', 'postgres', 'mysql'],
  EVENTS_DRIVER: ['inproc', 'null', 'redis', 'nats', 'natsjetstream', 'kafka', 'gcppubsub', 'sns'],
  MAIL_DRIVER: ['log', 'smtp', 'resend', 'postmark', 'mailgun', 'sendgrid', 'ses']
}

const SWAP_ENV = {
  local: [
    { key: 'STORAGE_PHOTOS_DRIVER', value: 'local' },
    { key: 'DB_DRIVER', value: 'sqlite' },
    { key: 'CACHE_DRIVER', value: 'memory' },
    { key: 'QUEUE_DRIVER', value: 'workerpool' },
    { key: 'EVENTS_DRIVER', value: 'inproc' },
    { key: 'MAIL_DRIVER', value: 'log' }
  ],
  production: [
    { key: 'STORAGE_PHOTOS_DRIVER', value: 's3' },
    { key: 'DB_DRIVER', value: 'postgres' },
    { key: 'CACHE_DRIVER', value: 'redis' },
    { key: 'QUEUE_DRIVER', value: 'redis' },
    { key: 'EVENTS_DRIVER', value: 'nats' },
    { key: 'MAIL_DRIVER', value: 'smtp' }
  ]
}

const swapEnv = computed(() => SWAP_ENV[swapMode.value])

// GA4 helper: silent unless gtag is loaded (production only).
function track(eventName, params) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', eventName, params)
}

function setSwapMode(mode) {
  if (swapMode.value !== mode) track('swap_toggle', { mode })
  swapMode.value = mode
}

const SWAP_TABS = [
  { id: 'http', label: 'HTTP', file: 'internal/photos/controller.go', href: '/applications/controllers', guide: 'Write a controller' },
  { id: 'database', label: 'Database', file: 'internal/photos/repository.go', env: 'DB_DRIVER', href: '/data/database-strategy', guide: 'Connect a database' },
  { id: 'cache', label: 'Cache', file: 'internal/photos/feed.go', env: 'CACHE_DRIVER', href: '/data/cache-patterns', guide: 'Cache a result' },
  { id: 'queue', label: 'Jobs', file: 'internal/photos/thumbnail_job.go', env: 'QUEUE_DRIVER', href: '/async/jobs', guide: 'Write a queue job' },
  { id: 'events', label: 'Events', file: 'internal/photos/uploaded_subscriber.go', env: 'EVENTS_DRIVER', href: '/async/events', guide: 'Handle an event' },
  { id: 'schedule', label: 'Schedules', file: 'internal/photos/cleanup_schedule.go', href: '/async/scheduler', guide: 'Schedule recurring work' },
  { id: 'command', label: 'Commands', file: 'internal/photos/show_cmd.go', href: '/applications/commands', guide: 'Write an app command' },
  { id: 'storage', label: 'Storage', file: 'internal/photos/service.go', env: 'STORAGE_PHOTOS_DRIVER', href: '/data/storage-patterns', guide: 'Store a file' },
  { id: 'mail', label: 'Mail', file: 'internal/photos/welcome.go', env: 'MAIL_DRIVER', href: '/applications/mail', guide: 'Send a message' },
  { id: 'testing', label: 'Testing', file: 'internal/photos/controller_test.go', href: '/testing/http-tests', guide: 'Test a controller' }
]

const EXAMPLE_DETAILS = {
  http: {
    lead: 'Give your photos an API. Keep the controller small and let your Go services do the work.',
    points: ['Routes and handlers in one controller', 'Constructor injection for your business logic'],
    label: 'Create the controller',
    commands: ['forj make:controller photos']
  },
  database: {
    lead: 'Query your photos with GORM. Use the configured connection and keep database access in a repository.',
    points: ['Context-aware queries', 'SQLite, MySQL, or Postgres'],
    label: 'Create a model from your table',
    commands: ['forj make:model photos --package photos'],
    note: 'Run after the photos table exists. The command reads its schema.'
  },
  cache: {
    lead: 'Keep popular photos close. Load a typed result on a cache miss and reuse it until the TTL expires.',
    points: ['Typed values and explicit expiration', 'Change the driver through configuration'],
    label: 'Configure your cache',
    commands: ['CACHE_DRIVER=memory'],
    note: 'Set in your .env file.'
  },
  queue: {
    lead: 'Move thumbnail processing into the background. Dispatch and handle a typed payload in the same job.',
    points: ['Queue and handler registered by make:job', 'Run workers together with HTTP or separately'],
    label: 'Create the job',
    commands: ['forj make:job photos:thumbnail --queue media']
  },
  events: {
    lead: 'React when a photo is uploaded. A typed subscriber connects the event to your thumbnail workflow.',
    points: ['Typed events with stable topics', 'Subscriber registration handled by make:subscriber'],
    label: 'Create the event and subscriber',
    commands: ['forj make:event photos:uploaded', 'forj make:subscriber photos:uploaded']
  },
  schedule: {
    lead: 'Keep your photo library tidy. Run cleanup on a recurring interval through the same Go service.',
    points: ['A named schedule with an explicit interval', 'Registered with the scheduler by make:schedule'],
    label: 'Create the schedule',
    commands: ['forj make:schedule photos:cleanup --every 24h']
  },
  command: {
    lead: 'Bring your app to the command line. Parse arguments and call the same service used by your HTTP controller.',
    points: ['Arguments, flags, and help with Kong', 'Dependencies supplied through your constructor'],
    label: 'Create it, then run your implementation',
    commands: ['forj make:command photos:show', 'forj photos:show 42']
  },
  testing: {
    lead: 'Test the behavior that matters. Call your controller directly with your photo service and test data.',
    points: ['No HTTP listener required', 'Standard Go tests with webtest request helpers'],
    label: 'Run the photo package tests',
    commands: ['go test ./internal/photos']
  },
  storage: {
    lead: 'Give your photos a home. Write through a named disk and choose the storage driver in configuration.',
    points: ['A storage dependency you can see', 'Local files today, object storage when you need it'],
    label: 'Configure the photos disk',
    commands: ['STORAGE_PHOTOS_DRIVER=local'],
    note: 'Set in your .env file for the configured photos disk.'
  },
  mail: {
    lead: 'Welcome your next user. Compose the message in Go and let the configured mail driver deliver it.',
    points: ['Fluent message composition', 'Log mail locally, configure delivery for production'],
    label: 'Configure local mail',
    commands: ['MAIL_DRIVER=log'],
    note: 'Set in your .env file.'
  }
}
const eventFile = ref('event')
const copiedMakeCommand = ref('')

// copyMakeCommand confirms only successful clipboard writes.
async function copyMakeCommand(command) {
  try {
    await navigator.clipboard.writeText(command)
    copiedMakeCommand.value = command
  } catch {
    copiedMakeCommand.value = ''
  }
}

const swapTab = ref('http')
const activeSwapTab = computed(() => SWAP_TABS.find((tab) => tab.id === swapTab.value))
const activeSwapDetails = computed(() => EXAMPLE_DETAILS[swapTab.value])
const activeSwapEnvKey = computed(() => activeSwapTab.value.env)
const activeConfigDriverOptions = computed(() => {
  const key = activeSwapEnvKey.value
  return key ? DRIVER_OPTIONS[key] : []
})

// setSwapTab keeps example selection and its analytics event together.
function setSwapTab(id) {
  if (swapTab.value !== id) track('swap_primitive', { primitive: id })
  swapTab.value = id
  copiedMakeCommand.value = ''
  nextTick(() => {
    const panels = document.querySelector('.gf-home-swap__panels')
    if (panels) panels.scrollTop = 0
  })
}

// setEventFile switches between the two App-owned event files.
function setEventFile(file) {
  eventFile.value = file
  nextTick(() => {
    const panels = document.querySelector('.gf-home-swap__panels')
    if (panels) panels.scrollTop = 0
  })
}

// onEventFileKeydown follows the keyboard convention for file tabs.
function onEventFileKeydown(event) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const file = event.key === 'Home' ? 'event' : event.key === 'End' ? 'subscriber' : eventFile.value === 'event' ? 'subscriber' : 'event'
  setEventFile(file)
  document.getElementById(`home-event-file-${file}`).focus()
}

// onSwapTabKeydown follows the keyboard convention for a horizontal tab list.
function onSwapTabKeydown(event) {
  const focusedId = event.target.closest('[role=tab]')?.id
  const index = SWAP_TABS.findIndex((tab) => focusedId === `home-example-tab-${tab.id}`)
  if (index < 0) return
  const targets = { ArrowRight: (index + 1) % SWAP_TABS.length, ArrowLeft: (index + SWAP_TABS.length - 1) % SWAP_TABS.length, Home: 0, End: SWAP_TABS.length - 1 }
  if (!(event.key in targets)) return
  event.preventDefault()
  const id = SWAP_TABS[targets[event.key]].id
  setSwapTab(id)
  document.getElementById(`home-example-tab-${id}`).focus()
}

const STARTER_VIEWS = [
  { id: 'signin', src: signinPreview, alt: 'Vue starter kit sign-in page with email and password fields', width: 1148, height: 1492 },
  { id: 'dashboard', src: dashboardPreview, alt: 'Vue starter kit dashboard with navigation and application components', width: 2992, height: 1876 },
  { id: 'settings', src: settingsPreview, alt: 'Vue starter kit profile settings with name and email fields', width: 1248, height: 1000 }
]

const CAPABILITIES = [
  { title: 'HTTP services', icon: 'globe', copy: 'Thin controllers, route groups, and middleware over the web abstraction. Health, readiness, and an OpenAPI reference included.', href: '/applications/http-services' },
  { title: 'Commands', icon: 'terminal', copy: 'First-class CLI entry points with injected dependencies, not shell scripts around your binary.', href: '/applications/commands' },
  { title: 'Queues and jobs', icon: 'rows-3', copy: 'Named, durable background work with typed payloads, retries, timeouts, and worker processes.', href: '/async/queues' },
  { title: 'Events', icon: 'radio', copy: 'Typed facts with local-first fan-out. In-process today, NATS or Kafka when you need it.', href: '/async/events' },
  { title: 'Scheduler', icon: 'clock', copy: 'Declarative recurring work with stable names, overlap control, and operator visibility.', href: '/async/scheduler' },
  { title: 'Database', icon: 'database', copy: 'Named database connections, migrations for each selected driver, and a built-in database shell.', href: '/data/database-strategy' },
  { title: 'Cache', icon: 'database-zap', copy: 'Named accessors with explicit TTLs, locks, counters, and rate limits behind one contract.', href: '/data/cache-patterns' },
  { title: 'Storage', icon: 'hard-drive', copy: 'Named disks for files and blobs. Local in development, object storage in production.', href: '/data/storage-patterns' },
  { title: 'Mail', icon: 'mail', copy: 'Fluent message composition with pluggable delivery: SMTP, Resend, Postmark, SES, and more.', href: '/applications/mail' },
  { title: 'Auth', icon: 'shield-check', copy: 'Server-authoritative sessions, HttpOnly cookies, refresh rotation, reset and verification flows.', href: '/security/auth' },
  { title: 'Metrics and inspects', icon: 'activity', copy: 'Prometheus-compatible metrics with bounded labels, plus execution records for every runtime.', href: '/operations/metrics' },
  { title: 'Lighthouse', icon: 'radar', copy: 'A first-party operator view over routes, inspects, schedules, queues, cache, and storage.', href: '/operations/lighthouse' }
]

function iconBody(name) {
  return lucideIconBodies[name] || ''
}

function motionAllowed() {
  if (typeof window === 'undefined') return false
  const override = document.documentElement.dataset.gfMotion
  if (override === 'on') return true
  if (override === 'reduced') return false
  return !(typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
}

const observers = []

onMounted(() => {
  const root = document.querySelector('.gf-home')
  if (!root || typeof IntersectionObserver === 'undefined') return

  // Analytics: one section_view per section per pageload, fired once a
  // section is meaningfully on screen (35% of it, or 60% of the viewport
  // for sections taller than the screen). Runs regardless of motion mode.
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      const deepEnough = entry.intersectionRatio >= 0.35
        || entry.intersectionRect.height >= window.innerHeight * 0.6
      if (!deepEnough) return
      const cls = [...entry.target.classList].find((c) => c.startsWith('gf-home-') && c !== 'gf-home-section')
      track('section_view', { section_id: cls ? cls.replace('gf-home-', '') : 'unknown' })
      sectionObserver.unobserve(entry.target)
    })
  }, { threshold: [0.15, 0.25, 0.35, 0.5] })
  root.querySelectorAll('.gf-home-section').forEach((el) => sectionObserver.observe(el))
  observers.push(sectionObserver)

  if (!motionAllowed()) return

  root.classList.add('gf-reveal-ready')

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('is-inview')
      revealObserver.unobserve(entry.target)
    })
  }, { rootMargin: '0px 0px 0px 0px', threshold: 0.05 })
  root.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el))
  observers.push(revealObserver)

  root.querySelectorAll('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count)
    if (!Number.isFinite(target) || target <= 0) return
    const suffix = el.dataset.suffix || ''
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        countObserver.disconnect()
        const start = performance.now()
        const duration = 1400
        const step = (now) => {
          const progress = Math.min(1, (now - start) / duration)
          const eased = 1 - Math.pow(1 - progress, 3)
          el.textContent = Math.round(target * eased).toLocaleString('en-US') + suffix
          if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      })
    }, { threshold: 0.5 })
    countObserver.observe(el)
    observers.push(countObserver)
  })
})

onBeforeUnmount(() => {
  observers.forEach((observer) => observer.disconnect())
  observers.length = 0
})
</script>

<section class="gf-home">

<!-- ============ SWAP DRIVERS ============ -->

<section class="gf-home-section gf-home-swap">
<div class="gf-home-section__inner">
<div class="gf-home-swap__grid">
<div class="gf-home-demo__copy" data-reveal>
<p class="gf-home-eyebrow">The code</p>
<h2 class="gf-home-h2">Build more.<br><em>Wire less</em></h2>
<p class="gf-home-lead">{{ activeSwapDetails.lead }}</p>
<ul class="gf-home-points">
<li v-for="point in activeSwapDetails.points" :key="point">{{ point }}</li>
</ul>
<div class="gf-home-make">
<p class="gf-home-make__label">{{ activeSwapDetails.label }}</p>
<div v-for="command in activeSwapDetails.commands" :key="command" class="gf-home-make__row" :data-shell="command.startsWith('forj ') || command.startsWith('go ')">
<code>{{ command }}</code>
<button type="button" @click="copyMakeCommand(command)" :aria-label="`Copy ${command}`">{{ copiedMakeCommand === command ? 'Copied' : 'Copy' }}</button>
</div>
<p v-if="activeSwapDetails.note" class="gf-home-make__note">{{ activeSwapDetails.note }}</p>
<p v-if="activeConfigDriverOptions.length" class="gf-home-make__drivers"><span>Available drivers</span> {{ activeConfigDriverOptions.join(', ') }}</p>
<span class="gf-home-make__status" role="status">{{ copiedMakeCommand ? 'Command copied to clipboard.' : '' }}</span>
</div>
<a class="gf-home-demo__guide" :href="activeSwapTab.href">{{ activeSwapTab.guide }} <span aria-hidden="true">→</span></a>
</div>
<div class="gf-home-swap__code" data-reveal style="--reveal-delay: 0.08s">
<div class="gf-home-swap__tabs" role="tablist" aria-label="Explore GoForj code examples" @keydown="onSwapTabKeydown">
<button
  v-for="tab in SWAP_TABS"
  :key="tab.id"
  :id="`home-example-tab-${tab.id}`"
  type="button"
  role="tab"
  :aria-controls="`home-example-panel-${tab.id}`"
  :tabindex="swapTab === tab.id ? 0 : -1"
  :aria-selected="swapTab === tab.id"
  :class="{ 'is-active': swapTab === tab.id }"
  @click="setSwapTab(tab.id)"
>{{ tab.label }}</button>
</div>
<div class="gf-home-demo__window">
<div v-if="swapTab === 'events'" class="gf-home-code-header gf-home-code-header--files" role="tablist" aria-label="Event example files" @keydown="onEventFileKeydown">
<button v-for="file in ['event', 'subscriber']" :key="file" :id="`home-event-file-${file}`" type="button" role="tab" class="gf-home-code-file" :class="{ 'is-active': eventFile === file }" :title="`internal/photos/uploaded_${file}.go`" :aria-selected="eventFile === file" :aria-controls="`home-event-code-${file}`" :tabindex="eventFile === file ? 0 : -1" @click="setEventFile(file)">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg><span class="gf-home-code-file__name">uploaded_{{ file }}.go</span>
</button>
</div>
<div v-else class="gf-home-code-header"><span class="gf-home-code-file" :title="activeSwapTab.file"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg><span class="gf-home-code-file__name">{{ activeSwapTab.file }}</span></span></div>

<div class="gf-home-swap__panels">

<div id="home-example-panel-http" :class="{ 'is-open': swapTab === 'http' }" :aria-hidden="swapTab !== 'http'" role="tabpanel" aria-labelledby="home-example-tab-http" tabindex="0">

<!-- go-example: illustrative-fragment -->
```go
// Controller exposes photo routes.
type Controller struct {
	service *Service
}

// NewController receives photo lookup through its constructor.
func NewController(service *Service) *Controller {
	return &Controller{service: service}
}

// Routes exposes the photo lookup endpoint.
func (c *Controller) Routes() []web.Route {
	return []web.Route{
		web.NewRoute(http.MethodGet, "/photos/:id", c.Show),
	}
}

// Show delegates lookup to the injected service.
func (c *Controller) Show(ctx web.Context) error {
	photo, err := c.service.Find(ctx.Context(), ctx.Param("id"))
	if err != nil {
		return err
	}
	return ctx.JSON(http.StatusOK, photo)
}
```

</div>


<div id="home-example-panel-storage" :class="{ 'is-open': swapTab === 'storage' }" :aria-hidden="swapTab !== 'storage'" role="tabpanel" aria-labelledby="home-example-tab-storage" tabindex="0">

<!-- go-example: illustrative-fragment -->
```go
// Service writes files through the configured storage driver.
type Service struct {
	disk storage.Storage
}

// NewService receives the application's photo disk.
func NewService(disk storage.Storage) *Service {
	return &Service{disk: disk}
}

// Store writes photo bytes to an application-owned path.
func (s *Service) Store(ctx context.Context, path string, body []byte) error {
	return s.disk.WithContext(ctx).Put(path, body)
}
```

</div>

<div id="home-example-panel-database" :class="{ 'is-open': swapTab === 'database' }" :aria-hidden="swapTab !== 'database'" role="tabpanel" aria-labelledby="home-example-tab-database" tabindex="0">

<!-- go-example: illustrative-fragment -->
```go
// Repository uses the application's database connection.
type Repository struct {
	db *gorm.DB
}

// NewRepository resolves the default connection at startup.
func NewRepository(conns *database.Connections) (*Repository, error) {
	db, err := conns.Default()
	if err != nil {
		return nil, err
	}
	return &Repository{db: db}, nil
}

// Recent returns the newest photos with a bounded query.
func (r *Repository) Recent(ctx context.Context, limit int) ([]Photo, error) {
	var photos []Photo
	err := r.db.WithContext(ctx).
		Order("created_at desc").Limit(limit).Find(&photos).Error
	return photos, err
}
```

</div>

<div id="home-example-panel-cache" :class="{ 'is-open': swapTab === 'cache' }" :aria-hidden="swapTab !== 'cache'" role="tabpanel" aria-labelledby="home-example-tab-cache" tabindex="0">

<!-- go-example: illustrative-fragment -->
```go
// Feed caches rankings through the configured cache driver.
type Feed struct {
	cache *cache.Cache
}

// NewFeed receives the application's cache.
func NewFeed(cache *cache.Cache) *Feed {
	return &Feed{cache: cache}
}

// Trending caches rankings for five minutes, loading on a miss.
func (f *Feed) Trending(ctx context.Context) ([]Photo, error) {
	return f.cache.WithContext(ctx).Remember("photos:trending", 5*time.Minute,
		func() ([]Photo, error) {
			return rankPhotos(), nil
		})
}
```

</div>

<div id="home-example-panel-queue" :class="{ 'is-open': swapTab === 'queue' }" :aria-hidden="swapTab !== 'queue'" role="tabpanel" aria-labelledby="home-example-tab-queue" tabindex="0">

<!-- go-example: illustrative-fragment -->
```go
// ThumbnailJobTypeName identifies the registered job.
const ThumbnailJobTypeName = "photos:thumbnail"

// ThumbnailJobPayload carries the photo to process.
type ThumbnailJobPayload struct {
	Path string `json:"path"`
}

// ThumbnailJob dispatches and handles thumbnail work.
type ThumbnailJob struct {
	queues *queues.Manager
}

// NewThumbnailJob receives the configured queue manager.
func NewThumbnailJob(queues *queues.Manager) *ThumbnailJob {
	return &ThumbnailJob{queues: queues}
}

// Queue dispatches the payload to the media queue.
func (t *ThumbnailJob) Queue(ctx context.Context, p ThumbnailJobPayload) error {
	data, err := json.Marshal(p)
	if err != nil {
		return err
	}
	_, err = t.queues.WithContext(ctx).Dispatch(
		queue.NewJob(ThumbnailJobTypeName).Payload(data).OnQueue("media"),
	)
	return err
}

// HandleTask decodes the payload before processing it.
func (t *ThumbnailJob) HandleTask(ctx context.Context, msg queue.Message) error {
	var p ThumbnailJobPayload
	if err := msg.Bind(&p); err != nil {
		return fmt.Errorf("decode thumbnail payload: %w", err)
	}
	return createThumbnail(ctx, p.Path)
}
```

</div>

<div id="home-example-panel-events" :class="{ 'is-open': swapTab === 'events' }" :aria-hidden="swapTab !== 'events'" role="tabpanel" aria-labelledby="home-example-tab-events" tabindex="0">
<div v-show="eventFile === 'event'" id="home-event-code-event" class="is-open" role="tabpanel" aria-labelledby="home-event-file-event" tabindex="0">

<!-- go-example: illustrative-fragment -->
```go
// UploadedEventTopic is the stable routing key for uploads.
const UploadedEventTopic = "photos.uploaded"

// UploadedEvent carries the uploaded photo's path.
type UploadedEvent struct {
	Path string `json:"path"`
}

// Topic routes uploads to their subscribers.
func (UploadedEvent) Topic() string {
	return UploadedEventTopic
}
```

</div>
<div v-show="eventFile === 'subscriber'" id="home-event-code-subscriber" class="is-open" role="tabpanel" aria-labelledby="home-event-file-subscriber" tabindex="0">

<!-- go-example: illustrative-fragment -->
```go
// UploadedSubscriber handles UploadedEvent messages.
type UploadedSubscriber struct {
	thumbnails *ThumbnailJob
}

// NewUploadedSubscriber receives the thumbnail workflow.
func NewUploadedSubscriber(thumbnails *ThumbnailJob) *UploadedSubscriber {
	return &UploadedSubscriber{thumbnails: thumbnails}
}

// Handle queues a thumbnail when a photo is uploaded.
func (s *UploadedSubscriber) Handle(ctx context.Context, event UploadedEvent) error {
	return s.thumbnails.Queue(ctx, ThumbnailJobPayload{Path: event.Path})
}
```

</div>
</div>

<div id="home-example-panel-schedule" :class="{ 'is-open': swapTab === 'schedule' }" :aria-hidden="swapTab !== 'schedule'" role="tabpanel" aria-labelledby="home-example-tab-schedule" tabindex="0">

<!-- go-example: illustrative-fragment -->
```go
// CleanupSchedule removes expired photos on a recurring interval.
type CleanupSchedule struct {
	service *Service
}

// NewCleanupSchedule receives the photo service.
func NewCleanupSchedule(service *Service) *CleanupSchedule {
	return &CleanupSchedule{service: service}
}

// Name identifies this schedule in logs and inspects.
func (s *CleanupSchedule) Name() string {
	return "photos:cleanup"
}

// Interval sets the time between runs.
func (s *CleanupSchedule) Interval() (time.Duration, error) {
	return time.ParseDuration("24h")
}

// Handle delegates cleanup to the photo service.
func (s *CleanupSchedule) Handle(ctx context.Context) error {
	return s.service.Cleanup(ctx)
}
```

</div>

<div id="home-example-panel-command" :class="{ 'is-open': swapTab === 'command' }" :aria-hidden="swapTab !== 'command'" role="tabpanel" aria-labelledby="home-example-tab-command" tabindex="0">

<!-- go-example: illustrative-fragment -->
```go
// ShowCmd handles the photos:show app command.
type ShowCmd struct {
	ID string `arg:"" help:"Photo ID"`
	service *Service
}

// Signature defines the public command and its help text.
func (*ShowCmd) Signature() string {
	return `name:"photos:show" help:"Show a photo"`
}

// NewShowCmd receives the same service used by HTTP.
func NewShowCmd(service *Service) *ShowCmd {
	return &ShowCmd{service: service}
}

// Run looks up the photo after Kong parses the arguments.
func (c *ShowCmd) Run(ctx context.Context) error {
	photo, err := c.service.Find(ctx, c.ID)
	if err != nil {
		return err
	}
	fmt.Println(photo.Path)
	return nil
}
```

</div>

<div id="home-example-panel-testing" :class="{ 'is-open': swapTab === 'testing' }" :aria-hidden="swapTab !== 'testing'" role="tabpanel" aria-labelledby="home-example-tab-testing" tabindex="0">

<!-- go-example: illustrative-fragment -->
```go
// TestControllerShow checks the photo response without a running server.
func TestControllerShow(t *testing.T) {
	service := newTestPhotoService(t) // Seeds photo 42 for this test.
	controller := NewController(service)

	req := httptest.NewRequest(http.MethodGet, "/photos/42", nil)
	rec := httptest.NewRecorder()
	params := webtest.PathParams{"id": "42"}
	ctx := webtest.NewContext(req, rec, "/photos/:id", params)

	if err := controller.Show(ctx); err != nil {
		t.Fatal(err)
	}

	if rec.Code != http.StatusOK {
		t.Fatalf("status: got %d, want %d", rec.Code, http.StatusOK)
	}

	var photo Photo
	if err := json.NewDecoder(rec.Body).Decode(&photo); err != nil {
		t.Fatal(err)
	}
	if photo.Path != "photos/42.jpg" {
		t.Fatalf("path: got %q, want %q", photo.Path, "photos/42.jpg")
	}
}
```

</div>

<div id="home-example-panel-mail" :class="{ 'is-open': swapTab === 'mail' }" :aria-hidden="swapTab !== 'mail'" role="tabpanel" aria-labelledby="home-example-tab-mail" tabindex="0">

<!-- go-example: illustrative-fragment -->
```go
// Welcome sends onboarding mail through the configured driver.
type Welcome struct {
	mailer *mail.Mailer
}

// NewWelcome receives the application's mailer.
func NewWelcome(mailer *mail.Mailer) *Welcome {
	return &Welcome{mailer: mailer}
}

// Greet sends a welcome message in the caller's context.
func (w *Welcome) Greet(ctx context.Context, user User) error {
	return w.mailer.Message().
		To(user.Email, user.Name).
		Subject("Welcome to photodrop").
		Text("Your photos have a home now.").
		Send(ctx)
}
```

</div>

</div>

</div>
</div>
</div>
<div class="gf-home-swap__env-col" data-reveal>
<div class="gf-home-demo__environment">
<p class="gf-home-eyebrow">Local → production</p>
<h3>Swap drivers. Keep your Go</h3>
<p class="gf-home-demo__driver-note">Choose local backends for development, then configure the drivers your deployment needs.</p>
<div class="gf-home-swap__toggle" role="group" aria-label="Choose environment">
<button type="button" :aria-pressed="swapMode === 'local'" :class="{ 'is-active': swapMode === 'local' }" @click="setSwapMode('local')">Local</button>
<button type="button" :aria-pressed="swapMode === 'production'" :class="{ 'is-active': swapMode === 'production' }" @click="setSwapMode('production')">Production</button>
</div>
<p class="gf-home-demo__driver-note">Configuration selects a compiled-in driver at startup. <a href="/core/drivers-and-adapters">How drivers work →</a></p>
</div>
<div class="gf-home-env" :data-mode="swapMode">
<div class="gf-home-code-header"><span class="gf-home-code-file"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>.env</span></div>
<div class="gf-home-env__body">
<div class="gf-home-env__comment"># {{ swapMode === 'local' ? 'Default local drivers' : 'Example selections; all available values below' }}</div>
<div v-for="line in swapEnv" :key="line.key" class="gf-home-env__setting">
<div class="gf-home-env__line" :class="{ 'is-spotlit': line.key === activeSwapEnvKey }">
<span class="gf-home-env__key">{{ line.key }}</span><span class="gf-home-env__eq">=</span><span class="gf-home-env__value" :key="line.key + ':' + line.value">{{ line.value }}</span>
</div>
<div v-if="swapMode === 'production'" class="gf-home-env__options"># {{ DRIVER_OPTIONS[line.key].join(' | ') }}</div>
</div>
</div>
</div>
</div>
</div>
</section>

<!-- ============ STARTER KITS ============ -->

<section class="gf-home-section gf-home-frontend">
<div class="gf-home-section__inner">
<div class="gf-home-frontend__grid">
<div class="gf-home-frontend__copy" data-reveal>
<p class="gf-home-eyebrow">Starter kits</p>
<h2 class="gf-home-h2">Your next product.<br><em>Already taking shape</em></h2>
<p class="gf-home-lead">Start with sign-in, account settings, and a dashboard. Choose Vue, React, or Go-rendered HTML with templ + htmx. Make the frontend your own.</p>
<div class="gf-home-links"><a href="/starter-kits">Explore starter kits →</a></div>
</div>
<div class="gf-home-gallery" data-reveal>
<figure v-for="view in STARTER_VIEWS" :key="view.id" class="gf-home-frontend__preview" :class="`gf-home-gallery__${view.id}`">
<img :src="view.src" :alt="view.alt" loading="lazy" decoding="async" :width="view.width" :height="view.height">
</figure>
</div>
</div>
<div class="gf-home-frontend__choices" aria-label="Choose a frontend">
<a class="gf-home-frontend__choice--vue" href="/frontend/vue-starter-kit"><span class="gf-home-frontend__brand" aria-hidden="true"><FrameworkBlockIcon framework="vue" /></span><strong>Vue</strong><span>Vue 3 + shadcn-vue</span><span aria-hidden="true">↗</span></a>
<a class="gf-home-frontend__choice--react" href="/frontend/react-starter-kit"><span class="gf-home-frontend__brand" aria-hidden="true"><FrameworkBlockIcon framework="react" /></span><strong>React</strong><span>React + shadcn/ui</span><span aria-hidden="true">↗</span></a>
<a class="gf-home-frontend__choice--templ" href="/frontend/templ-htmx-starter-kit"><span class="gf-home-frontend__brand" aria-hidden="true"><FrameworkBlockIcon framework="templ" /></span><strong>templ + htmx</strong><span>HTML rendered in Go</span><span aria-hidden="true">↗</span></a>
</div>
</div>
</section>

<!-- ============ DEVELOP AND OPERATE ============ -->

<section class="gf-home-section gf-home-workflow gf-home-development">
<div class="gf-home-section__inner">
<div class="gf-home-workflow__start">
<div data-reveal>
<p class="gf-home-eyebrow">Your development loop</p>
<h2 class="gf-home-h2">One command.<br><em>Everything running.</em></h2>
<p class="gf-home-lead"><code>forj dev</code> builds your App, runs migrations, and starts its runtimes. Keep editing. It rebuilds as your code changes.</p>
<div class="gf-home-development__steps">
<div><span>01</span><strong>Choose your stack</strong><code>forj new</code></div>
<div><span>02</span><strong>Start building</strong><code>forj dev</code></div>
</div>
<div class="gf-home-links"><a href="/getting-started/quickstart">Get started →</a><a href="/reference/make-commands">Make commands →</a></div>
<a class="gf-home-workflow__atlas" href="/developer-tools/atlas"><strong>Atlas</strong> Project guidance and tools for your coding agent <span aria-hidden="true">→</span></a>
</div>
<div data-reveal><DevTerminalPreview /></div>
</div>
</div>
</section>

<section class="gf-home-section gf-home-workflow gf-home-lighthouse">
<div class="gf-home-section__inner">
<div class="gf-home-workflow__lighthouse">
<div class="gf-home-workflow__lighthouse-copy" data-reveal>
<p class="gf-home-eyebrow">Lighthouse</p>
<h3>Your app,<br><em>in plain sight</em></h3>
<p>Browse requests, jobs, schedules, logs, and connected resources. Open an inspect record to see what happened during an execution.</p>
<div class="gf-home-links"><a href="/operations/lighthouse">Explore Lighthouse →</a></div>
</div>
<div class="gf-home-workflow__screen" data-reveal>
<img src="/assets/lighthouse/request-inspect.png" alt="Lighthouse request inspect showing a successful HTTP request with seven timeline events, including cache calls, a SQLite query, and the HTTP response" width="2160" height="1050" loading="lazy" decoding="async">
</div>
</div>
</div>
</section>

<section class="gf-home-section gf-home-workflow gf-home-deployment">
<div class="gf-home-section__inner">
<div class="gf-home-workflow__deploy">
<div data-reveal>
<p class="gf-home-eyebrow">Run it your way</p>
<h2 class="gf-home-h2">One CLI.<br><em>Every app</em></h2>
<p class="gf-home-lead">Start together. Scale independently.</p>
<p>Run HTTP, workers, schedules, and your own custom runtimes together, or give each its own process.</p>
<p>Add an app with <code>forj make:app admin</code>. Share your Go code, with separate wiring and a binary for each app.</p>
<div class="gf-home-links"><a href="/core/runtime-topology">Runtime guide →</a><a href="/core/apps">Multi-app Projects →</a></div>
</div>
<div data-reveal><RuntimeTopology /></div>
</div>
<div data-reveal><ProjectAppsDiagram /></div>
</div>
</section>

<!-- ============ CAPABILITIES AND EVIDENCE ============ -->

<section class="gf-home-section gf-home-stack">
<div class="gf-home-section__inner">
<div class="gf-home-section__header" data-reveal>
<p class="gf-home-eyebrow">The foundation</p>
<h2 class="gf-home-h2">The building blocks.<br><em>Already connected</em></h2>
<p class="gf-home-lead">Choose what your app needs. GoForj connects the pieces through shared configuration and explicit wiring.</p>
</div>
<div class="gf-home-grid">
<a v-for="(cap, i) in CAPABILITIES" :key="cap.title" :href="cap.href" class="gf-home-card" data-reveal :style="{ '--reveal-delay': `${(i % 4) * 0.06}s` }">
<span v-if="iconBody(cap.icon)" class="gf-home-card__icon" aria-hidden="true"><svg viewBox="0 0 24 24" v-html="iconBody(cap.icon)"></svg></span>
<h3>{{ cap.title }}</h3><p>{{ cap.copy }}</p>
<span class="gf-home-card__more" aria-hidden="true">→</span>
</a>
</div>
</div>
</section>

<section class="gf-home-section gf-home-proof">
<div class="gf-home-section__inner">
<div class="gf-home-evidence" data-reveal>
<div class="gf-home-evidence__intro"><h3>Tested against real backends</h3><p>First-party libraries are exercised against real services, testcontainers, and emulators.</p></div>
<div class="gf-home-proof__stats">
<div v-for="stat in PROOF" :key="stat.label" class="gf-home-proof__stat"><strong :data-count="stat.count" :data-suffix="stat.suffix">{{ fmt(stat.count) }}{{ stat.suffix }}</strong><span>{{ stat.label }}</span></div>
</div>
<a class="gf-home-text-link" href="https://github.com/goforj/docs/blob/main/bin/collect-proof-stats.mjs" target="_blank" rel="noreferrer noopener">How these numbers are counted →</a>
</div>
</div>
</section>

<!-- ============ START BUILDING ============ -->

<section class="gf-home-section gf-home-close">
<div class="gf-home-section__inner">
<div class="gf-home-close__layout">
<div data-reveal>
<p class="gf-home-eyebrow">Your next application</p>
<h2 class="gf-home-h2">From an idea.<br><em>To your first feature</em></h2>
<p class="gf-home-lead">Choose your stack, run your app, and start building what matters to you.</p>
<pre class="gf-home-close__cmd"><code><span class="t-prompt">$</span> go install github.com/goforj/goforj/cmd/forj@latest
<span class="t-prompt">$</span> forj new</code></pre>
<p class="gf-home-close__version"><a href="/versions/">Unreleased documentation</a><span aria-hidden="true"> · </span><code>@latest</code> installs the latest tagged release.</p>
<div class="gf-home-close__actions"><a class="gf-home-btn gf-home-btn--primary" href="/getting-started/quickstart">Create your app →</a><a class="gf-home-close__github" href="https://github.com/goforj" target="_blank" rel="noreferrer noopener">Explore on GitHub ↗</a></div>
</div>
<nav class="gf-home-close__next" aria-label="Start building with GoForj" data-reveal>
<p class="gf-home-eyebrow">A clear path forward</p>
<a class="gf-home-close__step" href="/getting-started/starter-kits">
<span class="gf-home-close__number" aria-hidden="true">01</span><span><strong>Choose your starting point</strong><span>Vue, React, templ + htmx, or your own frontend.</span></span><span class="gf-home-close__arrow" aria-hidden="true">↗</span>
</a>
<a class="gf-home-close__step" href="/getting-started/quickstart">
<span class="gf-home-close__number" aria-hidden="true">02</span><span><strong>Get it running locally</strong><span>One development loop for your app and services.</span></span><span class="gf-home-close__arrow" aria-hidden="true">↗</span>
</a>
<a class="gf-home-close__step" href="/scenarios/">
<span class="gf-home-close__number" aria-hidden="true">03</span><span><strong>Build your first feature</strong><span>Follow working examples, from routes to jobs.</span></span><span class="gf-home-close__arrow" aria-hidden="true">↗</span>
</a>
</nav>
</div>
</div>
</section>

</section>
