---
layout: home
description: The composable stack for building with Go. One cohesive runtime, explicit wiring, local-first drivers, and production-ready primitives.
---

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import lucideIconsData from '@iconify-json/lucide/icons.json'
import proofStats from './.vitepress/data/proof-stats.json'

// Proof band numbers are generated, not written. See bin/collect-proof-stats.mjs
// for methodology.
const PROOF = [
  { count: Math.floor(proofStats.totals.testFunctions / 100) * 100, suffix: '+', label: 'test functions across the first-party libraries' },
  { count: Math.floor(proofStats.totals.integrationTests / 10) * 10, suffix: '+', label: 'integration test runs against real backends in containers' },
  { count: proofStats.totals.drivers, suffix: '', label: 'interchangeable drivers across queue, events, cache, storage, database, and mail' },
  { count: proofStats.totals.libraries, suffix: '', label: 'standalone libraries, each useful without the framework' }
]
const fmt = (n) => n.toLocaleString('en-US')

const swapMode = ref('local')

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
  { id: 'storage', label: 'Storage', env: 'STORAGE_PHOTOS_DRIVER' },
  { id: 'database', label: 'Database', env: 'DB_DRIVER' },
  { id: 'cache', label: 'Cache', env: 'CACHE_DRIVER' },
  { id: 'queue', label: 'Queue', env: 'QUEUE_DRIVER' },
  { id: 'events', label: 'Events', env: 'EVENTS_DRIVER' },
  { id: 'mail', label: 'Mail', env: 'MAIL_DRIVER' }
]

const swapTab = ref('storage')
const activeSwapEnvKey = computed(() => SWAP_TABS.find((tab) => tab.id === swapTab.value)?.env)

function setSwapTab(id) {
  if (swapTab.value !== id) track('swap_primitive', { primitive: id })
  swapTab.value = id
}

const BIN_TABS = [
  { id: 'cli', label: 'CLI tool', chips: ['CLI commands', 'Typed configuration', 'Structured logging'] },
  { id: 'api', label: 'API service', chips: ['HTTP server', 'Routes and middleware', 'CLI commands', 'Health endpoints'] },
  { id: 'web', label: 'Web app', chips: ['Vue frontend', 'HTTP server', 'API routes', 'CLI commands'] },
  { id: 'full', label: 'API + Scheduler + Jobs', chips: ['HTTP server', 'Queue workers', 'Scheduler', 'CLI commands', 'Migrations', 'Drivers', 'Health and metrics', 'Lighthouse UI'] }
]

const binTab = ref('full')
const activeBinChips = computed(() => BIN_TABS.find((tab) => tab.id === binTab.value)?.chips || [])

function setBinTab(id) {
  if (binTab.value !== id) track('binary_shape', { shape: id })
  binTab.value = id
}

const CAPABILITIES = [
  { title: 'HTTP services', icon: 'globe', copy: 'Thin controllers, route groups, and middleware over the web abstraction. Health, readiness, and Swagger included.', href: '/applications/http-services' },
  { title: 'Commands', icon: 'terminal', copy: 'First-class CLI entry points with injected dependencies, not shell scripts around your binary.', href: '/applications/commands' },
  { title: 'Queues and jobs', icon: 'rows-3', copy: 'Named, durable background work with typed payloads, retries, timeouts, and worker processes.', href: '/async/queues' },
  { title: 'Events', icon: 'radio', copy: 'Typed facts with local-first fan-out. In-process today, NATS or Kafka when you need it.', href: '/async/events' },
  { title: 'Scheduler', icon: 'clock', copy: 'Declarative recurring work with stable names, overlap control, and operator visibility.', href: '/async/scheduler' },
  { title: 'Database', icon: 'database', copy: 'Generated connections, named resources, per-driver migrations, and a built-in db shell.', href: '/data/database-strategy' },
  { title: 'Cache', icon: 'database-zap', copy: 'Named accessors with explicit TTLs, locks, counters, and rate limits behind one contract.', href: '/data/cache-patterns' },
  { title: 'Storage', icon: 'hard-drive', copy: 'Named disks for files and blobs. Local in development, object storage in production.', href: '/data/storage-patterns' },
  { title: 'Mail', icon: 'mail', copy: 'Fluent message composition with pluggable delivery: SMTP, Resend, Postmark, SES, and more.', href: '/mail' },
  { title: 'Auth', icon: 'shield-check', copy: 'Server-authoritative sessions, HttpOnly cookies, refresh rotation, reset and verification flows.', href: '/security/auth' },
  { title: 'Metrics and inspects', icon: 'activity', copy: 'Prometheus-compatible metrics with bounded labels, plus execution records for every runtime.', href: '/operations/metrics' },
  { title: 'Lighthouse', icon: 'radar', copy: 'A first-party operator view over routes, inspects, schedules, queues, cache, and storage.', href: '/operations/lighthouse' }
]

const SCENARIOS = [
  { label: 'JSON API route', href: '/scenarios/json-api-route' },
  { label: 'Cached profile', href: '/scenarios/cached-user-profile' },
  { label: 'File upload', href: '/scenarios/file-upload-storage' },
  { label: 'users.created event', href: '/scenarios/users-created-event' },
  { label: 'reports:generate job', href: '/scenarios/reports-generate-job' },
  { label: 'reports:daily schedule', href: '/scenarios/reports-daily-schedule' },
  { label: 'Runtime observability', href: '/scenarios/runtime-observability' }
]

function iconBody(name) {
  return lucideIconsData.icons?.[name]?.body || ''
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

<!-- ============ A REAL APPLICATION IN TWO COMMANDS ============ -->

<section class="gf-home-section gf-home-start">
<div class="gf-home-section__inner gf-home-split">
<div class="gf-home-split__copy" data-reveal>
<p class="gf-home-eyebrow">Start</p>
<h2 class="gf-home-h2">A real application in <em>two commands</em></h2>
<p class="gf-home-lead"><code>forj new</code> renders a complete Go project - the components you choose, nothing more. <code>forj dev</code> brings it alive. Built for Go developers shipping services, workers, CLIs, and full products.</p>
<div class="gf-home-shapes" aria-label="What a GoForj App can be">
<span>A focused CLI</span>
<span>An API service</span>
<span>Workers and schedules</span>
<span>A full product with auth and a Vue frontend</span>
</div>
<ul class="gf-home-points">
<li><strong>Components are choices.</strong> Auth, mail, database, metrics, Docker, frontend - picked at <code>forj new</code>, added later as the App grows.</li>
<li><strong>The structure is already there.</strong> Routes, wiring, lifecycle, configuration, and tests have a place before you write a line.</li>
<li><strong>It runs before you configure anything.</strong> Local drivers back every primitive, so day one needs no cloud account and no docker-compose archaeology.</li>
</ul>
<div class="gf-home-links">
<a href="/getting-started/quickstart">Follow the Quickstart →</a>
<span class="gf-home-links__note">a few minutes to a running App</span>
</div>
</div>
<div class="gf-home-split__visual" data-reveal style="--reveal-delay: 0.12s">
<GoForjLiveTerminal />
</div>
</div>
</section>

<!-- ============ SWAP DRIVERS ============ -->

<section class="gf-home-section gf-home-swap">
<div class="gf-home-section__inner">
<div class="gf-home-section__header" data-reveal>
<p class="gf-home-eyebrow">Infrastructure</p>
<h2 class="gf-home-h2">Swap drivers, <em>not business logic</em></h2>
<p class="gf-home-lead">Services depend on contracts. Configuration selects the backend. When infrastructure changes, your code does not.</p>
</div>
<div class="gf-home-swap__grid">
<div class="gf-home-swap__code" data-reveal style="--reveal-delay: 0.08s">
<div class="gf-home-swap__tabs" role="tablist" aria-label="Pick a primitive">
<button
  v-for="tab in SWAP_TABS"
  :key="tab.id"
  type="button"
  role="tab"
  :aria-selected="swapTab === tab.id"
  :class="{ 'is-active': swapTab === tab.id }"
  @click="setSwapTab(tab.id)"
>{{ tab.label }}</button>
</div>
<p class="gf-home-swap__label">Your service · the same file in every environment</p>

<div class="gf-home-swap__panels">

<div :class="{ 'is-open': swapTab === 'storage' }" :aria-hidden="swapTab !== 'storage'" role="tabpanel">

```go
// internal/photos/service.go
type Service struct {
	disk storage.Storage
}

func NewService(disk storage.Storage) *Service {
	return &Service{disk: disk}
}

func (s *Service) Store(ctx context.Context, in UploadInput) (Photo, error) {
	path := photoPath(in)
	if err := s.disk.WithContext(ctx).Put(path, in.Body); err != nil {
		return Photo{}, fmt.Errorf("store photo: %w", err)
	}
	return Photo{Path: path}, nil
}
```

</div>

<div :class="{ 'is-open': swapTab === 'database' }" :aria-hidden="swapTab !== 'database'" role="tabpanel">

```go
// internal/photos/repository.go
type Repository struct {
	db *gorm.DB
}

func NewRepository(conns *database.Connections) (*Repository, error) {
	db, err := conns.Default()
	if err != nil {
		return nil, err
	}
	return &Repository{db: db}, nil
}

func (r *Repository) Recent(ctx context.Context, limit int) ([]Photo, error) {
	var photos []Photo
	err := r.db.WithContext(ctx).
		Order("created_at desc").Limit(limit).Find(&photos).Error
	return photos, err
}
```

</div>

<div :class="{ 'is-open': swapTab === 'cache' }" :aria-hidden="swapTab !== 'cache'" role="tabpanel">

```go
// internal/photos/feed.go
type Feed struct {
	cache *cache.Cache
}

func NewFeed(cache *cache.Cache) *Feed {
	return &Feed{cache: cache}
}

func (f *Feed) Trending(ctx context.Context) ([]Photo, error) {
	c := f.cache.WithContext(ctx)
	photos, ok, err := cache.Get[[]Photo](c, "photos:trending")
	if err != nil || ok {
		return photos, err
	}
	photos = rankPhotos()
	return photos, cache.Set(c, "photos:trending", photos, 5*time.Minute)
}
```

</div>

<div :class="{ 'is-open': swapTab === 'queue' }" :aria-hidden="swapTab !== 'queue'" role="tabpanel">

```go
// internal/photos/thumbnails.go
type Thumbnails struct {
	queues *queues.Manager
}

func NewThumbnails(queues *queues.Manager) *Thumbnails {
	return &Thumbnails{queues: queues}
}

func (t *Thumbnails) Enqueue(ctx context.Context, photo Photo) error {
	payload, err := json.Marshal(ThumbnailPayload{Path: photo.Path})
	if err != nil {
		return err
	}
	job := queue.NewJob("photos:thumbnail").
		Payload(payload).OnQueue("media").Retry(3)
	_, err = t.queues.WithContext(ctx).Dispatch(job)
	return err
}
```

</div>

<div :class="{ 'is-open': swapTab === 'events' }" :aria-hidden="swapTab !== 'events'" role="tabpanel">

```go
// internal/photos/publisher.go
type Publisher struct {
	bus events.Bus
}

func NewPublisher(bus events.Bus) *Publisher {
	return &Publisher{bus: bus}
}

func (p *Publisher) PhotoUploaded(ctx context.Context, photo Photo) error {
	return p.bus.WithContext(ctx).Publish(events.PhotoUploaded{
		Path:       photo.Path,
		UploadedBy: photo.OwnerID,
	})
}
```

</div>

<div :class="{ 'is-open': swapTab === 'mail' }" :aria-hidden="swapTab !== 'mail'" role="tabpanel">

```go
// internal/photos/welcome.go
type Welcome struct {
	mailer *mail.Mailer
}

func NewWelcome(mailer *mail.Mailer) *Welcome {
	return &Welcome{mailer: mailer}
}

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
<div class="gf-home-swap__env-col" data-reveal style="--reveal-delay: 0.16s">
<p class="gf-home-swap__label">Your environment · the only thing that changes</p>
<div class="gf-home-swap__toggle" role="group" aria-label="Choose environment">
<button type="button" :class="{ 'is-active': swapMode === 'local' }" @click="setSwapMode('local')">Local</button>
<button type="button" :class="{ 'is-active': swapMode === 'production' }" @click="setSwapMode('production')">Production</button>
</div>
<div class="gf-home-env" :data-mode="swapMode">
<div v-for="line in swapEnv" :key="line.key" class="gf-home-env__line" :class="{ 'is-spotlit': line.key === activeSwapEnvKey }">
<span class="gf-home-env__key">{{ line.key }}</span><span class="gf-home-env__eq">=</span><span class="gf-home-env__value" :key="line.key + ':' + line.value">{{ line.value }}</span>
</div>
</div>
<div class="gf-home-swap__zero">
<strong>0</strong>
<span>lines of Go changed</span>
</div>
<div class="gf-home-swap__after">
<span class="gf-home-swap__after-cmd"><span class="t-prompt">$</span> forj build</span>
<span class="gf-home-swap__after-note">Driver support is compiled in, selection happens at runtime, and misconfiguration fails fast instead of failing quietly.</span>
</div>
</div>
</div>
<p class="gf-home-swap__all" data-reveal><strong>Every primitive works this way.</strong> Cache, storage, queue, events, database, mail - each runs on in-process or local drivers in a standalone binary, then swaps to real infrastructure in production. No code changes.</p>
</div>
</section>

<!-- ============ CAPABILITY GRID ============ -->

<section class="gf-home-section gf-home-stack">
<div class="gf-home-section__inner">
<div class="gf-home-section__header" data-reveal>
<p class="gf-home-eyebrow">The stack</p>
<h2 class="gf-home-h2">Everything an application needs, in <em>one model</em></h2>
<p class="gf-home-lead">The foundation teams rebuild in every service - already built, already coherent. One runtime, one configuration story, one operational surface.</p>
</div>
<div class="gf-home-grid">
<a
  v-for="(cap, i) in CAPABILITIES"
  :key="cap.title"
  class="gf-home-card"
  :href="cap.href"
  data-reveal
  :style="{ '--reveal-delay': `${(i % 4) * 0.06 + Math.floor(i / 4) * 0.05}s` }"
>
<span v-if="iconBody(cap.icon)" class="gf-home-card__icon" aria-hidden="true"><svg viewBox="0 0 24 24" v-html="iconBody(cap.icon)"></svg></span>
<h3>{{ cap.title }}</h3>
<p>{{ cap.copy }}</p>
<span class="gf-home-card__more" aria-hidden="true">→</span>
</a>
</div>
</div>
</section>

<!-- ============ GENERATED CODE YOU OWN ============ -->

<section class="gf-home-section gf-home-gen">
<div class="gf-home-section__inner gf-home-split gf-home-split--reverse">
<div class="gf-home-split__copy" data-reveal>
<p class="gf-home-eyebrow">Generators</p>
<h2 class="gf-home-h2">Generated code <em>you own</em></h2>
<p class="gf-home-lead">Make commands create the file and the wiring: providers, routes, schedules, subscriptions. No annotations, no reflection container, no hidden registration.</p>
<ul class="gf-home-points">
<li><strong>Organized by package, not by file type.</strong> A feature's HTTP, CLI, queue, scheduler, and event entry points live beside the service that owns the work.</li>
<li><strong>Reversible.</strong> <code>--remove</code> deletes the file and undoes the wiring the generator manages. <code>--dry-run</code> shows you first.</li>
<li><strong>Readable output.</strong> Generated wiring is ordinary Go you can read, debug, and step through. If it would be embarrassing to look at, it does not ship.</li>
</ul>
<div class="gf-home-links">
<a href="/core/make-commands">Make commands →</a>
<a href="/core/organizing-generated-code">Organizing generated code →</a>
</div>
</div>
<div class="gf-home-split__visual" data-reveal style="--reveal-delay: 0.12s">
<div class="gf-home-terminal" aria-label="Make commands and the package they build">
<div class="gf-home-terminal__bar"><span></span><span></span><span></span><em>one feature · four entry points</em></div>
<pre class="gf-home-terminal__body"><code><span class="t-prompt">$</span> <span class="t-cmd">forj make:controller photos</span>
<span class="t-prompt">$</span> <span class="t-cmd">forj make:job photos:thumbnail --queue media</span>
<span class="t-prompt">$</span> <span class="t-cmd">forj make:schedule photos:digest --every 24h</span>
<span class="t-prompt">$</span> <span class="t-cmd">forj make:subscriber photos:photo-uploaded</span>
<span></span>
<span class="t-tree">internal/photos/</span>
<span class="t-tree">├──</span> controller.go                 <span class="t-dim"># HTTP entry point</span>
<span class="t-tree">├──</span> thumbnail_job.go              <span class="t-dim"># queue entry point</span>
<span class="t-tree">├──</span> digest_schedule.go            <span class="t-dim"># scheduler entry point</span>
<span class="t-tree">├──</span> photo_uploaded_subscriber.go  <span class="t-dim"># event entry point</span>
<span class="t-tree">└──</span> service.go                    <span class="t-hl"># your workflow code</span></code></pre>
</div>
</div>
</div>
</section>

<!-- ============ RUN IT, SEE IT ============ -->

<section class="gf-home-section gf-home-ops">
<div class="gf-home-section__inner">
<div class="gf-home-section__header" data-reveal>
<p class="gf-home-eyebrow">Operations</p>
<h2 class="gf-home-h2">Run it your way. See <em>everything</em> it does</h2>
<p class="gf-home-lead">One binary hosts everything locally, or splits into explicit processes when production needs to scale. Build one artifact, then run the entry point your environment needs.</p>
</div>
<div class="gf-home-ops__binary">
<h3 class="gf-home-ops__binary-title" data-reveal>Your entire App is one file</h3>
<div class="gf-home-swap__tabs gf-home-ops__binary-tabs" role="tablist" aria-label="Pick an App shape" data-reveal>
<button
  v-for="tab in BIN_TABS"
  :key="tab.id"
  type="button"
  role="tab"
  :aria-selected="binTab === tab.id"
  :class="{ 'is-active': binTab === tab.id }"
  @click="setBinTab(tab.id)"
>{{ tab.label }}</button>
</div>
<div class="gf-home-ops__binary-copy" data-reveal>
<p>Whatever shape you choose, <code>forj build</code> compiles it into one static binary: under 60 MB with everything enabled, nothing extra to install beside it.</p>
<p class="gf-home-ops__binary-inside">Ships inside</p>
<div class="gf-home-shapes gf-home-ops__binary-chips" :key="binTab" aria-label="What ships inside this binary shape">
<span v-for="chip in activeBinChips" :key="chip">{{ chip }}</span>
</div>
</div>
<div class="gf-home-ops__binary-visual" data-reveal style="--reveal-delay: 0.1s">
<div class="gf-home-swap__panels">
<div :class="{ 'is-open': binTab === 'cli' }" :aria-hidden="binTab !== 'cli'" role="tabpanel">
<div class="gf-home-terminal" aria-label="Running a CLI tool from one binary">
<div class="gf-home-terminal__bar"><span></span><span></span><span></span><em>bin/app · cli</em></div>
<pre class="gf-home-terminal__body"><code><span class="t-prompt">$</span> <span class="t-cmd">forj new</span>  <span class="t-dim"># components · cli</span>
<span class="t-prompt">$</span> <span class="t-cmd">forj make:command invoices:export</span>
<span class="t-prompt">$</span> <span class="t-cmd">forj build</span>
<span></span>
<span class="t-prompt">$</span> <span class="t-cmd">./bin/app invoices:export --month 2026-05</span>
<span class="t-ok">✔</span> invoices:export <span class="t-dim">· 1,204 invoices → exports/2026-05.csv</span></code></pre>
</div>
</div>
<div :class="{ 'is-open': binTab === 'api' }" :aria-hidden="binTab !== 'api'" role="tabpanel">
<div class="gf-home-terminal" aria-label="Running an API service from one binary">
<div class="gf-home-terminal__bar"><span></span><span></span><span></span><em>bin/app · api</em></div>
<pre class="gf-home-terminal__body"><code><span class="t-prompt">$</span> <span class="t-cmd">forj new</span>  <span class="t-dim"># components · cli, web_api</span>
<span class="t-prompt">$</span> <span class="t-cmd">forj build</span>
<span></span>
<span class="t-prompt">$</span> <span class="t-cmd">./bin/app api</span>
<span class="t-step">http</span>       listening on <span class="t-hl">:3000</span></code></pre>
</div>
</div>
<div :class="{ 'is-open': binTab === 'web' }" :aria-hidden="binTab !== 'web'" role="tabpanel">
<div class="gf-home-terminal" aria-label="Running a web app with its frontend from one binary">
<div class="gf-home-terminal__bar"><span></span><span></span><span></span><em>bin/app · web</em></div>
<pre class="gf-home-terminal__body"><code><span class="t-prompt">$</span> <span class="t-cmd">forj new</span>  <span class="t-dim"># components · cli, web_api, web_ui · vue kit</span>
<span class="t-prompt">$</span> <span class="t-cmd">forj build</span>
<span class="t-step">frontend</span>   built from <span class="t-hl">cmd/app/frontend</span>
<span class="t-step">binary</span>     wrote <span class="t-hl">bin/app</span> with embedded assets
<span></span>
<span class="t-prompt">$</span> <span class="t-cmd">./bin/app run</span>
<span class="t-step">http</span>       serving <span class="t-hl">/</span> and <span class="t-hl">/api</span> on <span class="t-hl">:3000</span>
<span class="t-step">frontend</span>   Vue app served by the same process</code></pre>
</div>
</div>
<div :class="{ 'is-open': binTab === 'full' }" :aria-hidden="binTab !== 'full'" role="tabpanel">
<div class="gf-home-terminal" aria-label="Running a full GoForj App from one binary">
<div class="gf-home-terminal__bar"><span></span><span></span><span></span><em>bin/app · everything</em></div>
<pre class="gf-home-terminal__body"><code><span class="t-prompt">$</span> <span class="t-cmd">forj new</span>  <span class="t-dim"># components · all of them</span>
<span class="t-prompt">$</span> <span class="t-cmd">forj build</span>
<span class="t-prompt">$</span> <span class="t-cmd">ls -lh bin/app</span>
-rwxr-xr-x  1 you  staff  <span class="t-hl">57M</span>  bin/app
<span></span>
<span class="t-prompt">$</span> <span class="t-cmd">./bin/app run</span>
<span class="t-dim">23:51:32.256</span> <span class="t-step">Scheduler</span>  Scheduler started
<span class="t-dim">23:51:32.256</span> <span class="t-step">Jobs</span>       Queue worker started <span class="t-dim">→ workers=30</span>
<span class="t-dim">23:51:32.257</span> <span class="t-step">HTTP</span>       Listening <span class="t-dim">→ addr=</span><span class="t-hl">0.0.0.0:3000</span></code></pre>
</div>
</div>
</div>
</div>
</div>
<div class="gf-home-ops__topology">
<div class="gf-home-ops__shape" data-reveal>
<p class="gf-home-ops__shape-title">Standalone</p>
<pre class="gf-home-ops__shape-body"><code><span class="t-prompt">$</span> <span class="t-cmd">forj app</span>  <span class="t-dim"># → ./bin/app run</span>
<span class="t-dim">one process:</span> http <span class="t-dim">+</span> jobs <span class="t-dim">+</span> scheduler</code></pre>
</div>
<div class="gf-home-ops__shape" data-reveal style="--reveal-delay: 0.1s">
<p class="gf-home-ops__shape-title">Distributed</p>
<pre class="gf-home-ops__shape-body"><code><span class="t-prompt">$</span> <span class="t-cmd">forj api</span>  <span class="t-dim"># → ./bin/app api</span>
<span class="t-prompt">$</span> <span class="t-cmd">forj worker --queue media</span>
<span class="t-prompt">$</span> <span class="t-cmd">forj scheduler</span></code></pre>
</div>
</div>
<div class="gf-home-ops__surfaces">
<div class="gf-home-ops__surface" data-reveal>
<h3>Route lists</h3>
<p><code>forj route:list</code> is the source of truth for the HTTP surface, not a scroll through startup logs.</p>
</div>
<div class="gf-home-ops__surface" data-reveal style="--reveal-delay: 0.07s">
<h3>Health and readiness</h3>
<p><code>/-/health</code> and <code>/-/ready</code> ship generated, with token-gated structured diagnostics.</p>
</div>
<div class="gf-home-ops__surface" data-reveal style="--reveal-delay: 0.14s">
<h3>Metrics</h3>
<p>Prometheus-compatible series with bounded labels: route patterns, queue names, job names, schedule names.</p>
</div>
<div class="gf-home-ops__surface" data-reveal style="--reveal-delay: 0.21s">
<h3>Inspects and Lighthouse</h3>
<p>Execution records for every request, job, schedule run, and command, browsable in a first-party operator UI.</p>
</div>
</div>
<div class="gf-home-links gf-home-links--center" data-reveal>
<a href="/operations/">Operations guide →</a>
<a href="/operations/lighthouse">Lighthouse →</a>
</div>
</div>
</section>

<!-- ============ SCALE: ONE APP TO MANY ============ -->

<section class="gf-home-section gf-home-scale">
<div class="gf-home-section__inner gf-home-split">
<div class="gf-home-split__copy" data-reveal>
<p class="gf-home-eyebrow">Scale</p>
<h2 class="gf-home-h2">Start with one App. <em>Grow into many</em></h2>
<p class="gf-home-lead">Most products live their whole life as a single App - and that is the golden path. When a Project outgrows it, one command adds another runnable app in the same repo: shared code, separate wiring, separate binaries, separate scaling.</p>
<ul class="gf-home-points">
<li><strong>Apps are boundaries, not microservices.</strong> Named apps share one repo, one Go module, and everything under <code>internal/</code>. No RPC ceremony, no duplicated plumbing.</li>
<li><strong>Each app deploys on its own terms.</strong> Its own binary, ports, wiring, and runtime identity in logs, metrics, and Lighthouse - scale <code>marketplace</code> without touching the rest.</li>
<li><strong>Nothing changes until you need it.</strong> A single-App Project never pays for this. Multi-app is a fan-out path for larger systems, teams, and monorepos - not a new architecture to learn on day one.</li>
</ul>
<div class="gf-home-links">
<a href="/core/apps">Apps →</a>
<a href="/core/runtime-topology">Runtime topology →</a>
</div>
</div>
<div class="gf-home-split__visual" data-reveal style="--reveal-delay: 0.12s">
<div class="gf-home-terminal" aria-label="Adding a named app to a GoForj Project">
<div class="gf-home-terminal__bar"><span></span><span></span><span></span><em>one project · many apps</em></div>
<pre class="gf-home-terminal__body"><code><span class="t-prompt">$</span> <span class="t-cmd">forj make:app marketplace</span>
<span class="t-prompt">$</span> <span class="t-cmd">forj marketplace make:controller checkout</span>
<span class="t-prompt">$</span> <span class="t-cmd">forj marketplace route:list</span>
<span class="t-prompt">$</span> <span class="t-cmd">forj dev</span>  <span class="t-dim"># orchestrates app + marketplace</span>
<span></span>
<span class="t-tree">photodrop/</span>
<span class="t-tree">├──</span> cmd/app/         <span class="t-dim"># default app</span>
<span class="t-tree">├──</span> cmd/marketplace/ <span class="t-dim"># named app binary</span>
<span class="t-tree">├──</span> app/marketplace/ <span class="t-dim"># routes, commands, wiring</span>
<span class="t-tree">└──</span> internal/        <span class="t-hl"># shared behavior, one module</span>
<span></span>
<span class="t-prompt">$</span> <span class="t-cmd">forj api</span>             <span class="t-dim"># → ./bin/app api</span>
<span class="t-prompt">$</span> <span class="t-cmd">forj marketplace worker</span> <span class="t-dim"># → ./bin/marketplace worker</span></code></pre>
</div>
</div>
</div>
</section>

<!-- ============ PROOF BAND ============ -->

<section class="gf-home-section gf-home-proof">
<div class="gf-home-section__inner">
<div class="gf-home-section__header" data-reveal>
<p class="gf-home-eyebrow">Tested foundation</p>
<h2 class="gf-home-h2">Primitives that <em>prove themselves</em></h2>
<p class="gf-home-lead">A driver should not only compile - it should prove its behavior against the backend it claims to support.</p>
</div>
<div class="gf-home-proof__stats">
<div
  v-for="(stat, i) in PROOF"
  :key="stat.label"
  class="gf-home-proof__stat"
  data-reveal
  :style="i ? { '--reveal-delay': `${i * 0.08}s` } : undefined"
><strong :data-count="stat.count" :data-suffix="stat.suffix">{{ fmt(stat.count) }}{{ stat.suffix }}</strong><span>{{ stat.label }}</span></div>
</div>
<p class="gf-home-proof__note" data-reveal>Driver suites run against Redis, Postgres, MySQL, NATS, Kafka, MinIO, SQS, and more through testcontainers and emulators. These numbers are generated from the repositories, not written by hand: <a href="https://github.com/goforj/docs/blob/main/bin/collect-proof-stats.mjs" target="_blank" rel="noreferrer noopener">see how they are counted →</a></p>
</div>
</section>

<!-- ============ VERIFIED SCENARIOS ============ -->

<section class="gf-home-section gf-home-scenarios">
<div class="gf-home-section__inner">
<div class="gf-home-section__header" data-reveal>
<p class="gf-home-eyebrow">Verified scenarios</p>
<h2 class="gf-home-h2">Learn it by <em>building it</em></h2>
<p class="gf-home-lead">Seven scenarios grow one small App from a single route to a fully observable system. Each ships only after it executes against the current templates - the tutorial cannot drift from the framework.</p>
</div>
<ol class="gf-home-path">
<li
  v-for="(s, i) in SCENARIOS"
  :key="s.href"
  class="gf-home-path__step"
  data-reveal
  :style="{ '--reveal-delay': `${i * 0.045}s` }"
>
<a :href="s.href"><span class="gf-home-path__num">{{ i + 1 }}</span><span class="gf-home-path__label">{{ s.label }}</span></a>
</li>
</ol>
<div class="gf-home-links gf-home-links--center" data-reveal style="--reveal-delay: 0.3s">
<a href="/scenarios/">Start the scenario path →</a>
</div>
</div>
</section>

<!-- ============ FIT ============ -->

<section class="gf-home-section gf-home-fit">
<div class="gf-home-section__inner">
<div class="gf-home-section__header" data-reveal>
<p class="gf-home-eyebrow">Fit</p>
<h2 class="gf-home-h2">Is GoForj <em>for you?</em></h2>
<p class="gf-home-lead">A framework should say who it serves and who it does not. Here is the honest version.</p>
</div>
<div class="gf-home-fit__grid">
<div class="gf-home-fit__card" data-reveal>
<h3>Reach for GoForj when</h3>
<ul>
<li>You are building services, APIs, workers, schedulers, CLIs, or full products in Go.</li>
<li>You want the foundation every service repeats, wiring, queues, cache, auth, observability, built and tested before day one.</li>
<li>You want infrastructure to be a configuration decision instead of an architecture rewrite.</li>
</ul>
</div>
<div class="gf-home-fit__card gf-home-fit__card--alt" data-reveal style="--reveal-delay: 0.1s">
<h3>Reach for something else when</h3>
<ul>
<li>You want a thin router and nothing more. A minimal mux and hand-picked libraries will be lighter.</li>
<li>Your team rules out code generation. GoForj's model is rendered code you own, and that is not negotiable.</li>
<li>You are building a library, not an application. Use the <a href="/libraries/">standalone libraries</a> instead.</li>
</ul>
</div>
</div>
<div class="gf-home-fit__eject" data-reveal style="--reveal-delay: 0.18s">
<h3>If you outgrow it, you keep everything</h3>
<p>A rendered App is ordinary Go: explicit wiring, readable files, standard modules. Stop running <code>forj</code> tomorrow and your application still builds, tests, and deploys. The framework earns its place in your workflow, not in your lock-in.</p>
</div>
</div>
</section>

<!-- ============ MANIFESTO ============ -->

<section class="gf-home-section gf-home-manifesto">
<div class="gf-home-section__inner" data-reveal>
<blockquote class="gf-home-manifesto__quote">
<p>I love building in Go. I love how direct it feels, how simple it is to ship, and how long production services can stay understandable. But I got tired of rebuilding the same application foundation every time: commands, queues, schedules, cache, storage, mail, metrics, wiring, local dev. GoForj is the stack I wanted for complete Go applications: cohesive, explicit, compiled, and still recognizably Go.</p>
<footer>
<strong>Chris Miles</strong>
<span>Creator of GoForj</span>
</footer>
</blockquote>
<div class="gf-home-links gf-home-links--center">
<a href="/blog/the-composable-stack-for-building-with-go">Read why GoForj exists →</a>
</div>
</div>
</section>

<!-- ============ CLOSING ============ -->

<section class="gf-home-section gf-home-close">
<div class="gf-home-section__inner">
<div class="gf-home-close__paths">
<a class="gf-home-close__path" href="/getting-started/quickstart" data-reveal>
<p class="gf-home-eyebrow">For your next application</p>
<h3>Build a GoForj App</h3>
<p>Runtime orchestration, explicit wiring, local-first drivers - and an optional Vue starter kit with auth, settings, and dashboard screens already shaped.</p>
<span class="gf-home-close__cta">Quickstart →</span>
</a>
<a class="gf-home-close__path" href="/libraries/" data-reveal style="--reveal-delay: 0.1s">
<p class="gf-home-eyebrow">For your existing services</p>
<h3>Adopt one library</h3>
<p>Queue, events, cache, storage, web, mail, scheduler, and more - standalone Go packages with their own APIs, drivers, and test suites.</p>
<span class="gf-home-close__cta">Browse libraries →</span>
</a>
</div>
<div class="gf-home-close__final" data-reveal>
<h2 class="gf-home-h2"><em>Start building</em></h2>
<pre class="gf-home-close__cmd"><code><span class="t-prompt">$</span> go install github.com/goforj/goforj/cmd/forj@latest
<span class="t-prompt">$</span> forj new</code></pre>
<div class="gf-home-close__actions">
<a class="gf-home-btn gf-home-btn--primary" href="/getting-started/quickstart">Read the Quickstart</a>
<a class="gf-home-btn" href="/about">What is GoForj?</a>
<a class="gf-home-btn" href="https://github.com/goforj" target="_blank" rel="noreferrer noopener">GitHub</a>
</div>
</div>
</div>
</section>

</section>
