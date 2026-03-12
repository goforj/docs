<script setup>
import { ref, onMounted, computed } from 'vue'
import simpleIconsData from '@iconify-json/simple-icons/icons.json'
import lucideIconsData from '@iconify-json/lucide/icons.json'

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
  react: "M12 10.9a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2zm0-5.7c1.02 0 1.98.14 2.8.4 1.03.33 1.72.82 1.72 1.36 0 .46-.48.92-1.23 1.28.11.53.16 1.05.16 1.56s-.05 1.03-.16 1.56c.75.36 1.23.82 1.23 1.28 0 .54-.69 1.03-1.72 1.36-.82.26-1.78.4-2.8.4s-1.98-.14-2.8-.4c-1.03-.33-1.72-.82-1.72-1.36 0-.46.48-.92 1.23-1.28a7.1 7.1 0 0 1-.16-1.56c0-.51.05-1.03.16-1.56-.75-.36-1.23-.82-1.23-1.28 0-.54.69-1.03 1.72-1.36.82-.26 1.78-.4 2.8-.4zm-2.95 1.44c-.83.29-1.33.64-1.33.95 0 .24.3.51.84.76.4-.93.95-1.73 1.59-2.35-.39.14-.76.35-1.1.64zm5.9 0c-.34-.29-.71-.5-1.1-.64.64.62 1.19 1.42 1.59 2.35.54-.25.84-.52.84-.76 0-.31-.5-.66-1.33-.95zM12 7.1c-.7.61-1.31 1.46-1.73 2.5.42 1.04 1.03 1.89 1.73 2.5.7-.61 1.31-1.46 1.73-2.5-.42-1.04-1.03-1.89-1.73-2.5zm-4.26 6.3c0 .31.5.66 1.33.95.34.29.71.5 1.1.64-.64-.62-1.19-1.42-1.59-2.35-.54.25-.84.52-.84.76zm7.13 1.59c.83-.29 1.33-.64 1.33-.95 0-.24-.3-.51-.84-.76-.4.93-.95 1.73-1.59 2.35.39-.14.76-.35 1.1-.64z",
  go: "M2 12h2v10h12v-10h2v12h-16v-12z M12 2c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6z", 
  storage: "M21 12c0 1.66-4 3-9 3s-9-1.34-9-3 4-3 9-3 9 1.34 9 3z M3 5c0 1.66 4 3 9 3s9-1.34 9-3 M3 19c0 1.66 4 3 9 3s9-1.34 9-3 M3 5v14 M21 5v14",
  queue: "M3 6h18 M3 12h18 M3 18h18 M7 6v12 M17 6v12",
  cache: "M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 17.5zm3 1.5h8m-8 4h5m-5 4h8",
  events: "M12 3v4m0 10v4M5.64 5.64l2.83 2.83m7.06 7.06l2.83 2.83M3 12h4m10 0h4M5.64 18.36l2.83-2.83m7.06-7.06l2.83-2.83",
  sparkles: "M12 3l2.4 4.8 5.3.8-3.8 3.7.9 5.3-4.8-2.5-4.8 2.5.9-5.3-3.8-3.7 5.3-.8L12 3z",
  workflow: "M5 4h8v3H5z M11 17h8v3h-8z M5 10h14v3H5z M7 7v3 M17 13v4",
  interface: "M4 5h16v12H4z M8 19h8 M10 17h4",
  brain: "M9 3c-2.76 0-5 2.24-5 5 0 1.3.5 2.48 1.32 3.37C5.11 11.8 5 12.39 5 13v1c0 .55.45 1 1 1h1v2c0 1.1.9 2 2 2h2v-4H9v-2.4c-.88-.38-1.5-1.26-1.5-2.3 0-1.38 1.12-2.5 2.5-2.5.56 0 1.07.18 1.48.49A3.98 3.98 0 0 1 15 6c0-1.66-1.34-3-3-3-.74 0-1.41.27-1.93.71C9.77 3.25 9.4 3 9 3zm6 4c2.76 0 5 2.24 5 5 0 1.8-.95 3.38-2.38 4.26-.39.24-.62.67-.62 1.13V19h-5v-4h1.5c1.38 0 2.5-1.12 2.5-2.5 0-1.04-.62-1.92-1.5-2.3V8h.5c1.1 0 2-.9 2-2s-.9-2-2-2z"
}

const BRAND_ICON_KEYS = {
  vue: 'vuedotjs',
  react: 'react',
  openai: 'openai',
  anthropic: 'anthropic',
  claude: 'claude',
  gemini: 'googlegemini',
  redis: 'redis',
  nats: 'natsdotio',
  jetstream: 'natsdotio',
  kafka: 'apachekafka',
  rabbitmq: 'rabbitmq',
  sqs: 'amazonsqs',
  sns: 'buffer',
  sqlite: 'sqlite',
  postgres: 'postgresql',
  mysql: 'mariadb',
  dynamodb: 'amazondynamodb',
  s3: 'files',
  gcs: 'googlecloud',
  dropbox: 'dropbox',
  rclone: 'rclone',
  ftp: 'filezilla',
  sftp: 'gnubash',
  local: 'files',
  memory: 'buffer',
  file: 'files',
  memcached: 'buffer',
  ollama: 'ollama'
}

const GROUP_CONFIG = [
  {
    id: 'frontend',
    label: 'FRONTEND',
    icon: 'app-window',
    color: '#2f89ff',
    summary: 'UI surfaces and client delivery',
    title: 'Frontend choices',
    href: '/about',
    row: 'front',
    children: [
      { id: 'frontend-vue', icon: 'vue', color: '#42b883', textColor: '#ffffff', iconColor: '#ffffff', title: 'Vue', href: 'https://vuejs.org/' },
      { id: 'frontend-react', icon: 'react', color: '#61dafb', textColor: '#ffffff', iconColor: '#ffffff', title: 'React', href: 'https://react.dev/' }
    ]
  },
  {
    id: 'infrastructure',
    label: 'BACKEND',
    icon: 'server',
    color: '#f0a423',
    summary: 'Queue, events, cache, and storage backends',
    title: 'Backend libraries and infrastructure',
    href: '/about',
    row: 'back',
    subgroups: [
      {
        id: 'backend-core-libraries',
        label: 'CORE LIBRARIES',
        icon: 'package-2',
        color: '#0ea5a4',
        title: 'Core libraries',
        href: '/libraries/collection',
        children: [
          { id: 'core-collections', icon: 'blocks', color: '#14b8a6', textColor: '#ffffff', iconColor: '#ffffff', title: 'Collections', href: '/libraries/collection' },
          { id: 'core-strings', icon: 'whole-word', color: '#2dd4bf', textColor: '#ffffff', iconColor: '#ffffff', title: 'Strings', href: '/libraries/strings' },
          { id: 'core-httpx', icon: 'globe', color: '#22c55e', textColor: '#ffffff', iconColor: '#ffffff', title: 'HTTPX', href: '/libraries/httpx' },
          { id: 'core-env', icon: 'shield-check', color: '#06b6d4', textColor: '#ffffff', iconColor: '#ffffff', title: 'Env', href: '/libraries/env' },
          { id: 'core-crypt', icon: 'key-round', color: '#0891b2', textColor: '#ffffff', iconColor: '#ffffff', title: 'Crypt', href: '/libraries/crypt' }
        ]
      },
      {
        id: 'backend-queue',
        label: 'QUEUE',
        icon: 'rows-3',
        color: '#f59e0b',
        title: 'Queue library',
        href: '/libraries/queue',
        children: [
          { id: 'queue-redis', icon: 'redis', color: '#dc382d', textColor: '#ffffff', iconColor: '#ffffff', title: 'Redis Queue', href: 'https://redis.io/' },
          { id: 'queue-rabbitmq', icon: 'rabbitmq', color: '#ff6600', textColor: '#ffffff', iconColor: '#ffffff', title: 'RabbitMQ Queue', href: 'https://www.rabbitmq.com/' },
          { id: 'queue-nats', icon: 'nats', color: '#27aae1', textColor: '#ffffff', iconColor: '#ffffff', title: 'NATS Queue', href: 'https://nats.io/' },
          { id: 'queue-sqs', icon: 'sqs', color: '#ff9900', textColor: '#ffffff', iconColor: '#ffffff', title: 'Amazon SQS Queue', href: 'https://aws.amazon.com/sqs/' },
          { id: 'queue-postgres', icon: 'postgres', color: '#336791', textColor: '#ffffff', iconColor: '#ffffff', title: 'Postgres Queue', href: 'https://www.postgresql.org/' },
          { id: 'queue-mysql', icon: 'mysql', color: '#4479a1', textColor: '#ffffff', iconColor: '#ffffff', title: 'MariaDB Queue', href: 'https://mariadb.org/' },
          { id: 'queue-sqlite', icon: 'sqlite', color: '#003b57', textColor: '#ffffff', iconColor: '#ffffff', title: 'SQLite Queue', href: 'https://sqlite.org/' }
        ]
      },
      {
        id: 'backend-events',
        label: 'EVENTS',
        icon: 'git-branch',
        color: '#f0a423',
        title: 'Events library',
        href: '/libraries/events',
        children: [
          { id: 'events-nats', icon: 'nats', color: '#27aae1', textColor: '#ffffff', iconColor: '#ffffff', title: 'NATS Events', href: 'https://nats.io/' },
          { id: 'events-jetstream', icon: 'jetstream', color: '#1e88e5', textColor: '#ffffff', iconColor: '#ffffff', title: 'NATS JetStream Events', href: 'https://docs.nats.io/nats-concepts/jetstream' },
          { id: 'events-redis', icon: 'redis', color: '#dc382d', textColor: '#ffffff', iconColor: '#ffffff', title: 'Redis Events', href: 'https://redis.io/' },
          { id: 'events-kafka', icon: 'kafka', color: '#231f20', textColor: '#ffffff', iconColor: '#ffffff', title: 'Kafka Events', href: 'https://kafka.apache.org/' },
          { id: 'events-sns', icon: 'sns', color: '#ff9900', textColor: '#ffffff', iconColor: '#ffffff', title: 'Amazon SNS Events', href: 'https://aws.amazon.com/sns/' },
          { id: 'events-gcppubsub', icon: 'gcs', color: '#4285f4', textColor: '#ffffff', iconColor: '#ffffff', title: 'Google Pub/Sub Events', href: 'https://cloud.google.com/pubsub' }
        ]
      },
      {
        id: 'backend-storage',
        label: 'STORAGE',
        icon: 'hard-drive',
        color: '#d97706',
        title: 'Storage library',
        href: '/libraries/storage',
        children: [
          { id: 'storage-local', icon: 'local', color: '#4c8eda', textColor: '#ffffff', iconColor: '#ffffff', title: 'Local Storage', href: '/libraries/storage' },
          { id: 'storage-memory', icon: 'memory', color: '#667085', textColor: '#ffffff', iconColor: '#ffffff', title: 'Memory Storage', href: '/libraries/storage' },
          { id: 'storage-redis', icon: 'redis', color: '#cb3837', textColor: '#ffffff', iconColor: '#ffffff', title: 'Redis Storage', href: 'https://redis.io/' },
          { id: 'storage-ftp', icon: 'ftp', color: '#ff8c00', textColor: '#ffffff', iconColor: '#ffffff', title: 'FTP Storage', href: 'https://filezilla-project.org/' },
          { id: 'storage-sftp', icon: 'sftp', color: '#1f6feb', textColor: '#ffffff', iconColor: '#ffffff', title: 'SFTP Storage', href: 'https://www.openssh.com/' },
          { id: 'storage-s3', icon: 's3', color: '#569a31', textColor: '#ffffff', iconColor: '#ffffff', title: 'Amazon S3 Storage', href: 'https://aws.amazon.com/s3/' },
          { id: 'storage-gcs', icon: 'gcs', color: '#4285f4', textColor: '#ffffff', iconColor: '#ffffff', title: 'Google Cloud Storage', href: 'https://cloud.google.com/storage' },
          { id: 'storage-dropbox', icon: 'dropbox', color: '#0061ff', textColor: '#ffffff', iconColor: '#ffffff', title: 'Dropbox Storage', href: 'https://www.dropbox.com/developers' },
          { id: 'storage-rclone', icon: 'rclone', color: '#5a45ff', textColor: '#ffffff', iconColor: '#ffffff', title: 'Rclone Storage', href: 'https://rclone.org/' }
        ]
      },
      {
        id: 'backend-database',
        label: 'DATABASE',
        icon: 'database',
        color: '#c0841a',
        title: 'Database backends',
        href: '/about',
        childMetrics: { size: 0.36, gap: 0.06, height: 0.44, scale: 0.35, columns: 3, rowOffsetY: 0, rowLiftFactor: 1.02, rowInsetX: 0 },
        children: [
          { id: 'database-mysql', icon: 'mysql', color: '#4479a1', textColor: '#ffffff', iconColor: '#ffffff', title: 'MariaDB', href: 'https://mariadb.org/' },
          { id: 'database-postgres', icon: 'postgres', color: '#336791', textColor: '#ffffff', iconColor: '#ffffff', title: 'Postgres', href: 'https://www.postgresql.org/' },
          { id: 'database-sqlite', icon: 'sqlite', color: '#003b57', textColor: '#ffffff', iconColor: '#ffffff', title: 'SQLite', href: 'https://sqlite.org/' }
        ]
      },
      {
        id: 'backend-cache',
        label: 'CACHE',
        icon: 'database-zap',
        color: '#b7791f',
        title: 'Cache library',
        href: '/libraries/cache',
        children: [
          { id: 'cache-file', icon: 'file', color: '#3f51b5', textColor: '#ffffff', iconColor: '#ffffff', title: 'File Cache', href: '/libraries/cache' },
          { id: 'cache-memory', icon: 'memory', color: '#5c5c5c', textColor: '#ffffff', iconColor: '#ffffff', title: 'Memory Cache', href: '/libraries/cache' },
          { id: 'cache-memcached', icon: 'memcached', color: '#0198c4', textColor: '#ffffff', iconColor: '#ffffff', title: 'Memcached Cache', href: 'https://memcached.org/' },
          { id: 'cache-redis', icon: 'redis', color: '#dc382d', textColor: '#ffffff', iconColor: '#ffffff', title: 'Redis Cache', href: 'https://redis.io/' },
          { id: 'cache-nats', icon: 'nats', color: '#27aae1', textColor: '#ffffff', iconColor: '#ffffff', title: 'NATS Cache', href: 'https://nats.io/' },
          { id: 'cache-sqlite', icon: 'sqlite', color: '#003b57', textColor: '#ffffff', iconColor: '#ffffff', title: 'SQLite Cache', href: 'https://sqlite.org/' },
          { id: 'cache-postgres', icon: 'postgres', color: '#336791', textColor: '#ffffff', iconColor: '#ffffff', title: 'Postgres Cache', href: 'https://www.postgresql.org/' },
          { id: 'cache-mysql', icon: 'mysql', color: '#4479a1', textColor: '#ffffff', iconColor: '#ffffff', title: 'MariaDB Cache', href: 'https://mariadb.org/' },
          { id: 'cache-dynamodb', icon: 'dynamodb', color: '#4053d6', textColor: '#ffffff', iconColor: '#ffffff', title: 'DynamoDB Cache', href: 'https://aws.amazon.com/dynamodb/' }
        ]
      }
    ],
    children: []
  },
  {
    id: 'ai-agents',
    label: 'AI AGENTS',
    icon: 'brain-circuit',
    color: '#818cf8',
    summary: 'Agent orchestration and model execution',
    title: 'AI agent providers',
    href: '/about',
    row: 'front',
    children: [
      { id: 'ai-openai', icon: 'openai', color: '#818cf8', textColor: '#ffffff', iconColor: '#ffffff', title: 'OpenAI', href: 'https://openai.com/' },
      { id: 'ai-claude', icon: 'claude', color: '#a78bfa', textColor: '#ffffff', iconColor: '#ffffff', title: 'Claude', href: 'https://www.anthropic.com/claude' },
      { id: 'ai-gemini', icon: 'gemini', color: '#60a5fa', textColor: '#ffffff', iconColor: '#ffffff', title: 'Gemini', href: 'https://deepmind.google/technologies/gemini/' }
    ]
  }
]

const LAYOUT = {
  originX: 0.42,
  originY: 0.42,
  runtimeZ: 0.1,
  coreInsetX: 0.52,
  coreInsetY: 0.4,
  coreHeight: 1.92,
  platformInsetX: 0.22,
  platformInsetY: 0.14,
  platformDepth: 2.18,
  platformHeight: 0.1,
  rearShelfInsetX: 0.12,
  rearShelfDepth: 1.34,
  rearShelfYOffset: -1.08,
  rearShelfLift: 1.28,
  rearShelfHeight: 0.16,
  rearSupportInsetX: 0.16,
  rearSupportDepth: 0.52,
  groupGap: 0.36,
  groupPaddingX: 0.14,
  groupPaddingY: 0.08,
  groupDepth: 1.02,
  groupHeight: 0.58,
  subgroupGap: 0.18,
  subgroupPaddingX: 0.12,
  subgroupDepth: 0.9,
  subgroupHeight: 0.52,
  childGap: 0.12,
  childSize: 0.74,
  childHeight: 0.84,
  runtimeSidePadding: 0.62,
  groundSidePadding: 0.6,
  runtimeDepth: 3.7,
  groundDepth: 4.9,
  groundOpacity: 0.16,
  platformOpacity: 0.24
}

function getAdaptiveChildMetrics(count) {
  if (count >= 9) {
    return { size: 0.32, gap: 0.05, height: 0.4, scale: 0.31, columns: 3, rowOffsetY: 0, rowLiftFactor: 1.02, rowInsetX: 0 }
  }
  if (count >= 7) {
    return { size: 0.36, gap: 0.06, height: 0.44, scale: 0.35, columns: 3, rowOffsetY: 0, rowLiftFactor: 1.02, rowInsetX: 0 }
  }
  if (count >= 5) {
    return { size: 0.4, gap: 0.06, height: 0.48, scale: 0.39, columns: 3, rowOffsetY: 0, rowLiftFactor: 1.02, rowInsetX: 0 }
  }
  return {
    size: LAYOUT.childSize,
    gap: LAYOUT.childGap,
    height: LAYOUT.childHeight,
    scale: 0.64,
    columns: Math.min(3, Math.max(1, count)),
    rowOffsetY: 0,
    rowLiftFactor: 1.02,
    rowInsetX: 0
  }
}

function getRowCounts(count, columns) {
  const rows = Math.ceil(count / columns)
  const base = Math.floor(count / rows)
  const remainder = count % rows
  return Array.from({ length: rows }, (_, index) => base + (index < remainder ? 1 : 0))
}

const scene = computed(() => {
  const groups = GROUP_CONFIG.map((group) => {
    const childCount = group.children.length
    const topMetrics = getAdaptiveChildMetrics(childCount)
    const topRowCounts = getRowCounts(childCount, topMetrics.columns)
    const childSpan = Math.max(
      0,
      ...topRowCounts.map((rowCount) => rowCount * topMetrics.size + Math.max(0, rowCount - 1) * topMetrics.gap)
    )
    // Direct child cubes project beyond the flat span because of isometric depth.
    const childFootprint = childSpan > 0 ? childSpan + (topMetrics.size * 0.7) : 0
    const subgroupDefs = (group.subgroups || []).map((subgroup) => {
      const subgroupChildCount = subgroup.children.length
      const childMetrics = subgroup.childMetrics || getAdaptiveChildMetrics(subgroupChildCount)
      const rowCounts = getRowCounts(subgroupChildCount, childMetrics.columns)
      const subgroupChildSpan = Math.max(
        0,
        ...rowCounts.map((rowCount) => rowCount * childMetrics.size + Math.max(0, rowCount - 1) * childMetrics.gap)
      )
      const width = Math.max(subgroupChildSpan, childMetrics.size * 1.5) + (LAYOUT.subgroupPaddingX * 2)
      return {
        ...subgroup,
        childMetrics,
        rowCounts,
        width
      }
    })
    const subgroupSpan = subgroupDefs.reduce((sum, subgroup) => sum + subgroup.width, 0) + (Math.max(0, subgroupDefs.length - 1) * LAYOUT.subgroupGap)
    const width = Math.max(childFootprint, subgroupSpan) + (LAYOUT.groupPaddingX * 2)
    return {
      ...group,
      subgroups: subgroupDefs,
      width
    }
  })

  const frontGroups = groups.filter((group) => group.row !== 'back')
  const backGroups = groups.filter((group) => group.row === 'back')
  const laneWidth = (items) => items.reduce((sum, group) => sum + group.width, 0) + (Math.max(0, items.length - 1) * LAYOUT.groupGap)
  const frontWidth = laneWidth(frontGroups)
  const backWidth = laneWidth(backGroups)
  const groupsWidth = Math.max(frontWidth, backWidth)
  const runtimeW = groupsWidth + (LAYOUT.runtimeSidePadding * 2)
  const coreW = groupsWidth + (LAYOUT.coreInsetX * 2)
  const groundW = runtimeW + (LAYOUT.groundSidePadding * 2)

  const runtime = {
    x: LAYOUT.originX,
    y: LAYOUT.originY,
    z: LAYOUT.runtimeZ,
    w: runtimeW,
    d: LAYOUT.runtimeDepth,
    h: 0.82
  }

  const core = {
    x: runtime.x + (runtime.w - coreW) / 2,
    y: runtime.y + LAYOUT.coreInsetY,
    z: runtime.z + runtime.h,
    w: coreW,
    d: 2.86,
    h: LAYOUT.coreHeight
  }

  const platform = {
    x: runtime.x + (runtime.w - groupsWidth) / 2 - LAYOUT.platformInsetX,
    y: core.y + LAYOUT.platformInsetY,
    z: core.z + core.h,
    w: groupsWidth + (LAYOUT.platformInsetX * 2),
    d: LAYOUT.platformDepth,
    h: LAYOUT.platformHeight
  }

  const rearShelf = {
    x: runtime.x + (runtime.w - backWidth) / 2 - LAYOUT.rearShelfInsetX,
    y: platform.y + LAYOUT.rearShelfYOffset,
    z: platform.z + platform.h + LAYOUT.rearShelfLift,
    w: backWidth + (LAYOUT.rearShelfInsetX * 2),
    d: LAYOUT.rearShelfDepth,
    h: LAYOUT.rearShelfHeight,
    opacity: 1
  }

  const rearSupport = backGroups.length
    ? {
        id: 'rear-support',
        type: 'block',
        tier: 'rear-support',
        label: '',
        color: '#a97524',
        textColor: '#ffffff',
        x: rearShelf.x + LAYOUT.rearSupportInsetX,
        y: rearShelf.y + rearShelf.d - LAYOUT.rearSupportDepth,
        z: platform.z + platform.h,
        w: rearShelf.w - (LAYOUT.rearSupportInsetX * 2),
        d: LAYOUT.rearSupportDepth,
        h: rearShelf.z - (platform.z + platform.h)
      }
    : null

  const ground = {
    x: runtime.x - LAYOUT.groundSidePadding,
    y: LAYOUT.originY - 0.04,
    z: 0,
    w: groundW,
    d: LAYOUT.groundDepth,
    h: 0.1,
    opacity: LAYOUT.groundOpacity
  }

  let cursorX = platform.x + LAYOUT.platformInsetX
  const tower = [
    { id: 'ground', type: 'shelf', tier: 'ground', color: '#f8fafc', ...ground },
    {
      id: 'runtime',
      type: 'block',
      tier: 'runtime',
      label: 'RUNTIME',
      icon: 'go',
      labelFace: 'left',
      color: '#0f172a',
      textColor: '#93a9cb',
      labelSize: 18,
      iconScale: 1.32,
      ...runtime
    },
    {
      id: 'core',
      type: 'block',
      tier: 'core',
      label: 'CORE',
      imageLabel: '/assets/goforj-letters.png',
      imageIcon: '/assets/goforj-hammer.png',
      labelFace: 'left',
      color: '#ef4444',
      textColor: '#ffffff',
      imageLabelWidth: 168,
      imageLabelHeight: 54,
      imageLabelX: -84,
      imageLabelY: -8,
      imageIconSize: 60,
      ...core
    },
    { id: 'platform-shelf', type: 'shelf', tier: 'platform', color: '#ffffff', opacity: LAYOUT.platformOpacity, ...platform },
    ...(rearSupport ? [rearSupport] : []),
    ...(backGroups.length ? [{ id: 'rear-shelf', type: 'block', tier: 'rear-shelf', label: '', color: '#c9952f', textColor: '#ffffff', ...rearShelf }] : [])
  ]

  const placeLane = (laneGroups, shelf, options = {}) => {
    const {
      blockYOffset = 0,
      childYOffset = 0.08,
      childLift = LAYOUT.groupHeight
    } = options
    let laneCursorX = shelf.x + (shelf.w - laneWidth(laneGroups)) / 2

    laneGroups.forEach((group) => {
      const blockX = laneCursorX
      const blockY = shelf.y + LAYOUT.groupPaddingY + blockYOffset
      const blockZ = shelf.z + shelf.h
      tower.push({
        id: group.id,
        type: 'block',
        tier: 'category',
        label: group.label,
        icon: group.icon,
        color: group.color,
        textColor: '#ffffff',
        labelSize: group.id === 'ai-agents' ? 12 : 10,
        iconScale: 0.72,
        highlight: '',
        highlightSize: 0,
        x: blockX,
        y: blockY,
        z: blockZ,
        w: group.width,
        d: LAYOUT.groupDepth,
        h: LAYOUT.groupHeight,
        labelFace: 'left'
      })

      if (group.subgroups?.length) {
        let subgroupCursorX = blockX + (group.width - (group.subgroups.reduce((sum, subgroup) => sum + subgroup.width, 0) + ((group.subgroups.length - 1) * LAYOUT.subgroupGap))) / 2
        const subgroupY = blockY + 0.12
        const subgroupZ = blockZ + LAYOUT.groupHeight

        group.subgroups.forEach((subgroup) => {
          tower.push({
            id: subgroup.id,
            type: 'block',
            tier: 'category-subgroup',
            label: subgroup.label,
            icon: subgroup.icon,
            color: subgroup.color,
            textColor: '#ffffff',
            labelSize: 9,
            iconScale: 0.64,
            x: subgroupCursorX,
            y: subgroupY,
            z: subgroupZ,
            w: subgroup.width,
            d: LAYOUT.subgroupDepth,
            h: LAYOUT.subgroupHeight,
            labelFace: 'left'
          })

          subgroup.children.forEach((child, index) => {
            const row = subgroup.rowCounts.findIndex((rowCount, rowIndex) => {
              const start = subgroup.rowCounts.slice(0, rowIndex).reduce((sum, value) => sum + value, 0)
              return index >= start && index < start + rowCount
            })
            const rowStart = subgroup.rowCounts.slice(0, row).reduce((sum, value) => sum + value, 0)
            const col = index - rowStart
            const rowCount = subgroup.rowCounts[row]
            const rowSpan = rowCount * subgroup.childMetrics.size + Math.max(0, rowCount - 1) * subgroup.childMetrics.gap
            const rowX = subgroupCursorX + (subgroup.width - rowSpan) / 2 + (row * subgroup.childMetrics.rowInsetX)
            tower.push({
              ...child,
              type: 'block',
              tier: 'category-choice',
              label: '',
              labelFace: 'left',
              iconScale: subgroup.childMetrics.scale,
              frontIcon: true,
              x: rowX + (col * (subgroup.childMetrics.size + subgroup.childMetrics.gap)),
              y: subgroupY + 0.2 - (row * subgroup.childMetrics.rowOffsetY),
              z: subgroupZ + LAYOUT.subgroupHeight + (row * subgroup.childMetrics.height * subgroup.childMetrics.rowLiftFactor),
              w: subgroup.childMetrics.size,
              d: subgroup.childMetrics.size,
              h: subgroup.childMetrics.height
            })
          })

          subgroupCursorX += subgroup.width + LAYOUT.subgroupGap
        })

        const topMetrics = getAdaptiveChildMetrics(group.children.length)
        const topRowCounts = getRowCounts(group.children.length, topMetrics.columns)
        const topChildY = subgroupY + 0.16
        const topChildZ = subgroupZ + LAYOUT.subgroupHeight + 0.74

        group.children.forEach((child, index) => {
          const row = topRowCounts.findIndex((rowCount, rowIndex) => {
            const start = topRowCounts.slice(0, rowIndex).reduce((sum, value) => sum + value, 0)
            return index >= start && index < start + rowCount
          })
          const rowStart = topRowCounts.slice(0, row).reduce((sum, value) => sum + value, 0)
          const col = index - rowStart
          const rowCount = topRowCounts[row]
          const rowSpan = rowCount * topMetrics.size + Math.max(0, rowCount - 1) * topMetrics.gap
          const topChildX = blockX + (group.width - rowSpan) / 2 + (row * topMetrics.rowInsetX)
          tower.push({
            ...child,
            type: 'block',
            tier: 'category-choice',
            label: '',
            labelFace: 'left',
            iconScale: topMetrics.scale,
            frontIcon: true,
            x: topChildX + (col * (topMetrics.size + topMetrics.gap)),
            y: topChildY - (row * topMetrics.rowOffsetY),
            z: topChildZ + (row * topMetrics.height * topMetrics.rowLiftFactor),
            w: topMetrics.size,
            d: topMetrics.size,
            h: topMetrics.height
          })
        })
      } else {
        const childMetrics = getAdaptiveChildMetrics(group.children.length)
        const rowCounts = getRowCounts(group.children.length, childMetrics.columns)
        group.children.forEach((child, index) => {
          const row = rowCounts.findIndex((rowCount, rowIndex) => {
            const start = rowCounts.slice(0, rowIndex).reduce((sum, value) => sum + value, 0)
            return index >= start && index < start + rowCount
          })
          const rowStart = rowCounts.slice(0, row).reduce((sum, value) => sum + value, 0)
          const col = index - rowStart
          const rowCount = rowCounts[row]
          const rowSpan = rowCount * childMetrics.size + Math.max(0, rowCount - 1) * childMetrics.gap
          const childX = blockX + (group.width - rowSpan) / 2
          tower.push({
            ...child,
            type: 'block',
            tier: 'category-choice',
            label: '',
            labelFace: 'left',
            iconScale: childMetrics.scale,
            frontIcon: true,
            x: childX + (col * (childMetrics.size + childMetrics.gap)),
            y: blockY + childYOffset,
            z: blockZ + childLift + (row * childMetrics.height * childMetrics.rowLiftFactor),
            w: childMetrics.size,
            d: childMetrics.size,
            h: childMetrics.height
          })
        })
      }

      laneCursorX += group.width + LAYOUT.groupGap
    })
  }
  placeLane(frontGroups, platform, {
    blockYOffset: 0.7,
    childYOffset: 0.28,
    childLift: LAYOUT.groupHeight
  })
  if (backGroups.length) {
    placeLane(backGroups, rearShelf, {
      blockYOffset: 0.04,
      childYOffset: 0.08,
      childLift: LAYOUT.groupHeight + 0.06
    })
  }

  return {
    tower: tower.sort((a, b) => (a.x + a.y + a.z) - (b.x + b.y + b.z)),
    categories: GROUP_CONFIG
  }
})

function overlapsOnPlane(a, b) {
  const ax2 = a.x + a.w
  const ay2 = a.y + a.d
  const bx2 = b.x + b.w
  const by2 = b.y + b.d

  return a.x < bx2 && ax2 > b.x && a.y < by2 && ay2 > b.y
}

function shouldLiftWithHover(item) {
  if (!hoveredBlock.value) return false

  const hovered = scene.value.tower.find((entry) => entry.id === hoveredBlock.value)
  if (!hovered || item.type !== 'block') return false
  if (item.id === hovered.id) return true

  return item.z > hovered.z && overlapsOnPlane(item, hovered)
}

// PROJECTION
const SCALE = 70 
const ORIGIN_X = 360
const ORIGIN_Y = 468
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

function getShadowOpacity(item) {
  if (item.type !== 'block') return 0
  if (item.id === 'ai-agents') return 0.18
  if (item.id === 'core') return 0.16
  return 0.12
}

function getShadowBlur(item) {
  if (item.id === 'ai-agents') return 16
  if (item.id === 'core') return 18
  return 12
}

function getShadowTransform(item) {
  const center = project(item.x + item.w / 2, item.y + item.d / 2, item.z)
  const width = item.w * SCALE * 0.52
  const height = Math.max(18, item.d * SCALE * 0.18)
  return {
    x: center.x,
    y: center.y + item.h * 12 + 18,
    width,
    height
  }
}

function getFrontIconPlacement(item) {
  const base = Math.min(item.w, item.h)
  const scale = base < 0.5
    ? Math.max(0.72, base * 1.02)
    : Math.max(1.08, base * 1.42)
  return {
    scale,
    x: -11.25 * scale,
    y: -10.2 * scale
  }
}

function getBrandIconBody(icon) {
  const key = BRAND_ICON_KEYS[icon]
  if (!key) return ''
  return simpleIconsData.icons?.[key]?.body || ''
}

function getGenericIconBody(icon) {
  return lucideIconsData.icons?.[icon]?.body || ''
}

function isExternalHref(href) {
  return typeof href === 'string' && /^https?:\/\//.test(href)
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
          High-trust libraries and tools designed for productivity, performance, and total clarity. Batteries-included.
        </p>
        <div class="gf-hero-actions">
          <a href="/collection" class="gf-hero-btn gf-hero-btn--primary">Explore Libraries</a>
          <a href="/about" class="gf-hero-btn gf-hero-btn--secondary">Design Philosophy</a>
        </div>
      </div>

      <div class="gf-hero-graphic" :class="{ 'is-visible': isMounted }">
        <svg class="gf-hero-svg" viewBox="0 0 800 900" preserveAspectRatio="xMidYMid meet">
          <defs>
            <template v-for="item in scene.tower" :key="`grads-${item.id}`">
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
            <radialGradient id="hero-ambient" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stop-color="#7c83ff" stop-opacity="0.26" />
              <stop offset="52%" stop-color="#3b82f6" stop-opacity="0.1" />
              <stop offset="100%" stop-color="#0f172a" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="glass-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6" />
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0.1" />
            </linearGradient>
            <linearGradient id="glass-edge" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05" />
            </linearGradient>
            <filter id="block-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="25" stdDeviation="20" flood-opacity="0.18" />
            </filter>
            <filter id="ambient-blur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="36" />
            </filter>
          </defs>

          <ellipse cx="438" cy="404" rx="180" ry="150" fill="url(#hero-ambient)" filter="url(#ambient-blur)" opacity="0.9" />

          <g class="gf-iso-group" filter="url(#block-shadow)">
            <template v-for="(item, index) in scene.tower" :key="item.id">
              <a
                class="gf-iso-item-wrapper"
                :href="item.href || undefined"
                :target="item.href ? '_blank' : undefined"
                :rel="item.href ? 'noreferrer noopener' : undefined"
                @mouseenter="hoveredBlock = item.id"
                @mouseleave="hoveredBlock = null"
                :style="{
                  transition: 'all 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transitionDelay: `${index * 80}ms`,
                  opacity: isMounted ? (item.opacity || 1) : 0,
                  transform: isMounted
                    ? `translateY(${shouldLiftWithHover(item) ? -20 : 0}px)`
                    : 'translateY(150px)'
                }">
                <title>{{ item.title || item.label || item.id }}</title>
                <g class="gf-iso-item" :class="{ 'gf-iso-item--link': !!item.href }" :style="{ animationDelay: `${index * 250}ms` }">
                  <template v-if="item.type === 'shelf'">
                    <path :d="getFacePath(getBlockGeom(item).top)" fill="url(#glass-sheen)" :fill-opacity="item.opacity" stroke="url(#glass-edge)" stroke-width="1.5" />
                  </template>
                  <template v-else>
                    <ellipse
                      class="gf-block-shadow"
                      :cx="getShadowTransform(item).x"
                      :cy="getShadowTransform(item).y"
                      :rx="getShadowTransform(item).width"
                      :ry="getShadowTransform(item).height"
                      fill="#020617"
                      :opacity="getShadowOpacity(item)"
                      :style="{ filter: `blur(${getShadowBlur(item)}px)` }"
                    />
                    <path :d="getFacePath(getBlockGeom(item).frontLeft)" :fill="`url(#grad-fl-${item.id})`" />
                    <path :d="getFacePath(getBlockGeom(item).frontRight)" :fill="`url(#grad-fr-${item.id})`" />
                    <path :d="getFacePath(getBlockGeom(item).top)" :fill="`url(#grad-top-${item.id})`" />
                    <path class="gf-block-edge" :d="getFacePath(getBlockGeom(item).frontLeft)" />
                    <path class="gf-block-edge" :d="getFacePath(getBlockGeom(item).frontRight)" />
                    <path class="gf-block-edge gf-block-edge--top" :d="getFacePath(getBlockGeom(item).top)" />

                    <!-- ENHANCED ICON OR IMAGE ON TOP FACE -->
                    <g v-if="!item.frontIcon" :transform="`translate(${getBlockGeom(item).topCenter.x}, ${getBlockGeom(item).topCenter.y})`">
                      <g :transform="MATRIX_TOP">
                        <template v-if="item.imageIcon">
                           <image
                             :xlink:href="item.imageIcon"
                             :x="-(item.imageIconSize || 60) / 2"
                             :y="-(item.imageIconSize || 60) / 2"
                             :width="item.imageIconSize || 60"
                             :height="item.imageIconSize || 60"
                             opacity="0.84"
                           />
                        </template>
                        <template v-else-if="item.icon && !item.label">
                          <g :transform="`translate(-18, -18) scale(${item.iconScale || 1.5})`" :style="{ color: item.textColor }">
                            <g v-if="getGenericIconBody(item.icon)" v-html="getGenericIconBody(item.icon)" />
                            <g v-else-if="getBrandIconBody(item.icon)" v-html="getBrandIconBody(item.icon)" />
                            <path v-else :d="ICONS[item.icon]" :fill="item.textColor" fill-opacity="0.7" />
                          </g>
                        </template>
                      </g>
                    </g>

                    <g v-if="item.frontIcon && item.icon" :transform="`translate(${getBlockGeom(item).frontLeftCenter.x}, ${getBlockGeom(item).frontLeftCenter.y})`">
                      <g :transform="MATRIX_DOWN_RIGHT">
                        <g
                          :transform="`translate(${getFrontIconPlacement(item).x}, ${getFrontIconPlacement(item).y}) scale(${getFrontIconPlacement(item).scale})`"
                          :style="{ color: item.iconColor || item.textColor }"
                        >
                          <g v-if="getGenericIconBody(item.icon)" v-html="getGenericIconBody(item.icon)" />
                          <g v-else-if="getBrandIconBody(item.icon)" v-html="getBrandIconBody(item.icon)" />
                          <path v-else :d="ICONS[item.icon]" :fill="item.iconColor || item.textColor" fill-opacity="0.98" />
                        </g>
                      </g>
                    </g>

                    <!-- DYNAMIC LABEL ORIENTATION OR IMAGE LABEL -->
                    <g :transform="`translate(${getBlockGeom(item).frontLeftCenter.x}, ${getBlockGeom(item).frontLeftCenter.y})`">
                      <g :transform="MATRIX_DOWN_RIGHT">
                        <template v-if="item.imageLabel">
                           <text y="-22" text-anchor="middle" :fill="item.textColor" class="iso-label iso-label--core-kicker">CORE</text>
                           <image
                             :xlink:href="item.imageLabel"
                             :x="item.imageLabelX || -60"
                             :y="item.imageLabelY || -20"
                             :width="item.imageLabelWidth || 120"
                             :height="item.imageLabelHeight || 40"
                           />
                        </template>
                        <template v-else-if="item.label && !item.frontIcon">
                          <text v-if="item.topLabel" y="-14" text-anchor="middle" :fill="item.textColor" :font-size="item.topLabelSize || 10" class="iso-label iso-label--category">{{ item.topLabel }}</text>
                          <text text-anchor="middle" :fill="item.textColor" font-weight="800" :font-size="item.labelSize || 11" class="iso-label">{{ item.label }}</text>
                          <text v-if="item.highlight" y="28" text-anchor="middle" :fill="item.textColor" font-weight="900" :font-size="item.highlightSize || (item.id === 'core' ? 42 : 28)" class="iso-highlight">{{ item.highlight }}</text>
                        </template>
                      </g>
                    </g>
                  </template>
                </g>
              </a>
            </template>
          </g>
        </svg>
        <div class="gf-category-row" :class="{ 'is-visible': isMounted }">
          <a
            v-for="category in scene.categories"
            :key="category.id"
            class="gf-category-card"
            :href="category.href || undefined"
            :target="category.href ? '_blank' : undefined"
            :rel="category.href ? 'noreferrer noopener' : undefined"
            :title="category.title || category.label"
            @mouseenter="hoveredBlock = category.id"
            @mouseleave="hoveredBlock = null"
          >
            <svg class="gf-category-card-icon" viewBox="0 0 24 24" aria-hidden="true">
              <g v-if="getGenericIconBody(category.icon)" v-html="getGenericIconBody(category.icon)" :style="{ color: category.color }" />
              <g v-else-if="getBrandIconBody(category.icon)" v-html="getBrandIconBody(category.icon)" :style="{ color: category.color }" />
              <path v-else :d="ICONS[category.icon]" :fill="category.color" />
            </svg>
            <span class="gf-category-card-title">{{ category.label }}</span>
            <span class="gf-category-card-copy">{{ category.summary }}</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gf-home-hero {
  position: relative;
  width: 100%;
  padding: 0.25rem 2rem 5rem;
  overflow: visible;
  background:
    radial-gradient(circle at 76% 32%, rgba(99, 102, 241, 0.12) 0%, transparent 34%),
    radial-gradient(circle at 66% 42%, rgba(59, 130, 246, 0.06) 0%, transparent 28%);
}
.gf-hero-container {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 5rem;
  min-height: calc(100vh - 140px);
}
.gf-hero-content {
  flex: 1.1;
  opacity: 0;
  transform: translateY(22px);
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
  margin-bottom: 2rem;
  font-weight: 450;
}
.gf-hero-story {
  max-width: 560px;
  margin: 0 0 3rem;
  color: rgba(226, 232, 240, 0.72);
  font-size: 0.98rem;
  line-height: 1.7;
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
  transform: translate3d(-80px, -10px, 0);
}
.gf-hero-graphic.is-visible {
  opacity: 1;
  transform: translate3d(-90px, -10px, 0);
}
.gf-hero-svg {
  width: 100%;
  height: auto;
  overflow: visible;
}
.gf-category-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
  margin-top: -0.6rem;
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.gf-category-row.is-visible {
  opacity: 1;
  transform: translateY(0);
}
.gf-category-card {
  display: grid;
  justify-items: start;
  gap: 0.5rem;
  padding: 1rem 1rem 1.05rem;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.64), rgba(8, 14, 30, 0.58));
  text-align: left;
  cursor: default;
  text-decoration: none;
}
.gf-category-card-icon {
  width: 20px;
  height: 20px;
}
.gf-category-card-title {
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 700;
}
.gf-category-card-copy {
  color: rgba(191, 219, 254, 0.72);
  font-size: 0.82rem;
  line-height: 1.5;
}
.gf-iso-item {
  cursor: pointer;
  animation: bob 6s ease-in-out infinite alternate;
}
.gf-iso-item--link {
  cursor: pointer;
}
@keyframes bob {
  0% { transform: translateY(0); }
  100% { transform: translateY(-5px); }
}
.gf-block-edge {
  fill: none;
  stroke: rgba(255, 255, 255, 0.12);
  stroke-width: 1.15;
  vector-effect: non-scaling-stroke;
}
.gf-block-edge--top {
  stroke: rgba(255, 255, 255, 0.18);
}
.gf-block-shadow {
  pointer-events: none;
}
.iso-label {
  user-select: none;
  pointer-events: none;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.iso-highlight {
  user-select: none;
  pointer-events: none;
  letter-spacing: -0.02em;
  paint-order: stroke fill;
  stroke: rgba(79, 70, 229, 0.2);
  stroke-width: 1.4;
}
.iso-label--core-kicker {
  font-size: 12px;
  letter-spacing: 0.24em;
  opacity: 0.82;
}
.iso-label--category {
  opacity: 0.72;
  letter-spacing: 0.18em;
}
@media (max-width: 1024px) {
  .gf-hero-container {
    flex-direction: column;
    text-align: center;
    gap: 3rem;
    min-height: auto;
  }
  .gf-hero-title {
    font-size: 3.8rem;
  }
  .gf-hero-tagline {
    margin-left: auto;
    margin-right: auto;
  }
  .gf-hero-story {
    margin-left: auto;
    margin-right: auto;
  }
  .gf-hero-actions {
    justify-content: center;
  }
  .gf-hero-graphic {
    width: 100%;
    max-width: 760px;
    transform: translate(-60px, -10px);
  }
  .gf-hero-graphic.is-visible {
    transform: translate(-60px, -10px);
  }
  .gf-category-row {
    grid-template-columns: 1fr;
    margin-top: 0.5rem;
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
