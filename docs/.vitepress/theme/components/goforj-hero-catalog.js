// The forge and engine studies share the same vendor identity and link inventory.
export const BRAND_ICON_KEYS = {
  vue: 'vuedotjs',
  react: 'react',
  openai: 'openai',
  anthropic: 'anthropic',
  claude: 'claude',
  gemini: 'googlegemini',
  copilot: 'githubcopilot',
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

const COOL_1 = '#4FB8A6'
const COOL_2 = '#2F9A8B'
const COOL_3 = '#2A8A93'
const COOL_4 = '#2E7A8E'
const COOL_5 = '#2C6478'
const GOLD = '#C98F2B'
const KHAKI = '#9E9440'

export const GROUP_CONFIG = [
  {
    id: 'frontend',
    label: 'FRONTEND',
    icon: 'app-window',
    color: '#5B5562',
    summary: 'UI surfaces and client delivery',
    title: 'Frontend choices',
    href: '/frontend/',
    row: 'front',
    children: [
      { id: 'frontend-vue', icon: 'vue', color: '#42b883', textColor: '#ffffff', iconColor: '#ffffff', title: 'Vue', href: 'https://vuejs.org/' },
      { id: 'frontend-react', icon: 'react', color: COOL_3, textColor: '#ffffff', iconColor: '#ffffff', title: 'React', href: 'https://react.dev/' },
      { id: 'frontend-templ', icon: 'templ', color: '#f97316', textColor: '#ffffff', iconColor: '#ffffff', title: 'templ', href: 'https://templ.guide/' }
    ]
  },
    {
    id: 'infrastructure',
    label: 'BACKEND',
    icon: 'server',
    color: '#68616E',
    summary: 'Queue, events, cache, and storage backends',
    title: 'Backend libraries and infrastructure',
    href: '/drivers',
    row: 'back',
    subgroups: [
      {
        id: 'backend-core-libraries',
        label: 'CORE LIBRARIES',
        icon: 'package-2',
        color: '#0ea5a4',
        title: 'Core libraries',
        href: '/libraries/',
        children: [
          { id: 'core-collections', icon: 'blocks', color: '#14b8a6', textColor: '#ffffff', iconColor: '#ffffff', title: 'Collections', href: '/collection' },
          { id: 'core-strings', icon: 'whole-word', color: '#2dd4bf', textColor: '#ffffff', iconColor: '#ffffff', title: 'Strings', href: '/strings' },
          { id: 'core-httpx', icon: 'globe', color: '#22c55e', textColor: '#ffffff', iconColor: '#ffffff', title: 'HTTPX', href: '/httpx' },
          { id: 'core-env', icon: 'shield-check', color: '#FF5E3A', textColor: '#ffffff', iconColor: '#ffffff', title: 'Env', href: '/env' },
          { id: 'core-crypt', icon: 'key-round', color: GOLD, textColor: '#ffffff', iconColor: '#ffffff', title: 'Crypt', href: '/crypt' },
          { id: 'core-console', icon: 'terminal', color: KHAKI, textColor: '#ffffff', iconColor: '#ffffff', title: 'Console', href: '/console' }
        ]
      },
      {
        id: 'backend-queue',
        label: 'QUEUE',
        icon: 'rows-3',
        color: '#776D82',
        title: 'Queue library',
        href: '/queue',
        children: [
          { id: 'queue-redis', icon: 'redis', color: '#dc382d', textColor: '#ffffff', iconColor: '#ffffff', title: 'Redis Queue', href: 'https://redis.io/' },
          { id: 'queue-rabbitmq', icon: 'rabbitmq', color: '#ff6600', textColor: '#ffffff', iconColor: '#ffffff', title: 'RabbitMQ Queue', href: 'https://www.rabbitmq.com/' },
          { id: 'queue-nats', icon: 'nats', color: COOL_2, textColor: '#ffffff', iconColor: '#ffffff', title: 'NATS Queue', href: 'https://nats.io/' },
          { id: 'queue-sqs', icon: 'sqs', color: '#ff9900', textColor: '#ffffff', iconColor: '#ffffff', title: 'Amazon SQS Queue', href: 'https://aws.amazon.com/sqs/' },
          { id: 'queue-postgres', icon: 'postgres', color: '#62487C', textColor: '#ffffff', iconColor: '#ffffff', title: 'Postgres Queue', href: 'https://www.postgresql.org/' },
          { id: 'queue-mysql', icon: 'mysql', color: '#72598C', textColor: '#ffffff', iconColor: '#ffffff', title: 'MariaDB Queue', href: 'https://mariadb.org/' },
          { id: 'queue-sqlite', icon: 'sqlite', color: '#2B183F', textColor: '#ffffff', iconColor: '#ffffff', title: 'SQLite Queue', href: 'https://sqlite.org/' }
        ]
      },
      {
        id: 'backend-events',
        label: 'EVENTS',
        icon: 'git-branch',
        color: '#685E72',
        title: 'Events library',
        href: '/events',
        children: [
          { id: 'events-nats', icon: 'nats', color: COOL_2, textColor: '#ffffff', iconColor: '#ffffff', title: 'NATS Events', href: 'https://nats.io/' },
          { id: 'events-jetstream', icon: 'jetstream', color: COOL_1, textColor: '#ffffff', iconColor: '#ffffff', title: 'NATS JetStream Events', href: 'https://docs.nats.io/nats-concepts/jetstream' },
          { id: 'events-redis', icon: 'redis', color: '#dc382d', textColor: '#ffffff', iconColor: '#ffffff', title: 'Redis Events', href: 'https://redis.io/' },
          { id: 'events-kafka', icon: 'kafka', color: '#231f20', textColor: '#ffffff', iconColor: '#ffffff', title: 'Kafka Events', href: 'https://kafka.apache.org/' },
          { id: 'events-sns', icon: 'sns', color: '#ff9900', textColor: '#ffffff', iconColor: '#ffffff', title: 'Amazon SNS Events', href: 'https://aws.amazon.com/sns/' },
          { id: 'events-gcppubsub', icon: 'gcs', color: COOL_4, textColor: '#ffffff', iconColor: '#ffffff', title: 'Google Pub/Sub Events', href: 'https://cloud.google.com/pubsub' }
        ]
      },
      {
        id: 'backend-storage',
        label: 'STORAGE',
        icon: 'hard-drive',
        color: '#57505E',
        title: 'Storage library',
        href: '/storage',
        children: [
          { id: 'storage-local', icon: 'local', color: '#FF5E3A', textColor: '#ffffff', iconColor: '#ffffff', title: 'Local Storage', href: '/storage' },
          { id: 'storage-memory', icon: 'memory', color: '#766D7E', textColor: '#ffffff', iconColor: '#ffffff', title: 'Memory Storage', href: '/storage' },
          { id: 'storage-redis', icon: 'redis', color: '#cb3837', textColor: '#ffffff', iconColor: '#ffffff', title: 'Redis Storage', href: 'https://redis.io/' },
          { id: 'storage-ftp', icon: 'ftp', color: '#ff8c00', textColor: '#ffffff', iconColor: '#ffffff', title: 'FTP Storage', href: 'https://filezilla-project.org/' },
          { id: 'storage-sftp', icon: 'sftp', color: COOL_2, textColor: '#ffffff', iconColor: '#ffffff', title: 'SFTP Storage', href: 'https://www.openssh.com/' },
          { id: 'storage-s3', icon: 's3', color: '#569a31', textColor: '#ffffff', iconColor: '#ffffff', title: 'Amazon S3 Storage', href: 'https://aws.amazon.com/s3/' },
          { id: 'storage-gcs', icon: 'gcs', color: COOL_4, textColor: '#ffffff', iconColor: '#ffffff', title: 'Google Cloud Storage', href: 'https://cloud.google.com/storage' },
          { id: 'storage-dropbox', icon: 'dropbox', color: COOL_5, textColor: '#ffffff', iconColor: '#ffffff', title: 'Dropbox Storage', href: 'https://www.dropbox.com/developers' },
          { id: 'storage-rclone', icon: 'rclone', color: COOL_1, textColor: '#ffffff', iconColor: '#ffffff', title: 'Rclone Storage', href: 'https://rclone.org/' }
        ]
      },
      {
        id: 'backend-database',
        label: 'DATABASE',
        icon: 'database',
        color: '#6D6574',
        title: 'Database backends',
        href: '/drivers',
        childMetrics: { size: 0.36, gap: 0.06, height: 0.44, scale: 0.35, columns: 3, rowOffsetY: 0, rowLiftFactor: 1.02, rowInsetX: 0 },
        children: [
          { id: 'database-mysql', icon: 'mysql', color: '#72598C', textColor: '#ffffff', iconColor: '#ffffff', title: 'MariaDB', href: 'https://mariadb.org/' },
          { id: 'database-postgres', icon: 'postgres', color: '#62487C', textColor: '#ffffff', iconColor: '#ffffff', title: 'Postgres', href: 'https://www.postgresql.org/' },
          { id: 'database-sqlite', icon: 'sqlite', color: '#2B183F', textColor: '#ffffff', iconColor: '#ffffff', title: 'SQLite', href: 'https://sqlite.org/' }
        ]
      },
      {
        id: 'backend-cache',
        label: 'CACHE',
        icon: 'database-zap',
        color: '#584F61',
        title: 'Cache library',
        href: '/cache',
        children: [
          { id: 'cache-file', icon: 'file', color: GOLD, textColor: '#ffffff', iconColor: '#ffffff', title: 'File Cache', href: '/cache' },
          { id: 'cache-memory', icon: 'memory', color: '#5c5c5c', textColor: '#ffffff', iconColor: '#ffffff', title: 'Memory Cache', href: '/cache' },
          { id: 'cache-memcached', icon: 'memcached', color: COOL_3, textColor: '#ffffff', iconColor: '#ffffff', title: 'Memcached Cache', href: 'https://memcached.org/' },
          { id: 'cache-redis', icon: 'redis', color: '#dc382d', textColor: '#ffffff', iconColor: '#ffffff', title: 'Redis Cache', href: 'https://redis.io/' },
          { id: 'cache-nats', icon: 'nats', color: COOL_2, textColor: '#ffffff', iconColor: '#ffffff', title: 'NATS Cache', href: 'https://nats.io/' },
          { id: 'cache-sqlite', icon: 'sqlite', color: '#2B183F', textColor: '#ffffff', iconColor: '#ffffff', title: 'SQLite Cache', href: 'https://sqlite.org/' },
          { id: 'cache-postgres', icon: 'postgres', color: '#62487C', textColor: '#ffffff', iconColor: '#ffffff', title: 'Postgres Cache', href: 'https://www.postgresql.org/' },
          { id: 'cache-mysql', icon: 'mysql', color: '#72598C', textColor: '#ffffff', iconColor: '#ffffff', title: 'MariaDB Cache', href: 'https://mariadb.org/' },
          { id: 'cache-dynamodb', icon: 'dynamodb', color: COOL_5, textColor: '#ffffff', iconColor: '#ffffff', title: 'DynamoDB Cache', href: 'https://aws.amazon.com/dynamodb/' }
        ]
      }
    ],
    children: []
  },
  {
    id: 'ai-agents',
    label: 'ATLAS',
    icon: 'brain-circuit',
    color: '#665F6D',
    summary: 'Local guidance, skills, and MCP context for coding agents',
    title: 'Atlas coding-agent support',
    href: '/developer-tools/atlas',
    row: 'front',
    children: [
      { id: 'ai-openai', icon: 'openai', color: '#10a37f', textColor: '#ffffff', iconColor: '#ffffff', title: 'Codex' },
      { id: 'ai-claude', icon: 'claude', color: '#d97757', textColor: '#ffffff', iconColor: '#ffffff', title: 'Claude Code' },
      { id: 'ai-gemini', icon: 'gemini', color: COOL_3, textColor: '#ffffff', iconColor: '#ffffff', title: 'Gemini CLI' },
      { id: 'ai-copilot', icon: 'copilot', color: '#2A262D', textColor: '#ffffff', iconColor: '#ffffff', title: 'GitHub Copilot' }
    ]
  }
]

// localChoice fills the local implementations omitted from the original vendor overview.
function localChoice(id, title, icon, color, href) {
  return { id, title, icon, color, href, textColor: '#ffffff', iconColor: '#ffffff' }
}

const backendGroups = GROUP_CONFIG.find(group => group.id === 'infrastructure').subgroups
const choices = id => backendGroups.find(group => group.id === `backend-${id}`).children

// DRIVER_FAMILIES preserves every original vendor block and adds the complete current resource catalog.
export const DRIVER_FAMILIES = {
  database: choices('database'),
  cache: [
    ...choices('cache'),
    localChoice('cache-null', 'Null Cache', 'shield-check', '#766d7e', '/cache')
  ],
  storage: choices('storage'),
  queue: [
    localChoice('queue-workerpool', 'Workerpool Queue', 'rows-3', '#766d7e', '/queue'),
    ...choices('queue'),
    localChoice('queue-sync', 'Sync Queue', 'activity', GOLD, '/queue'),
    localChoice('queue-null', 'Null Queue', 'shield-check', '#5c5c5c', '/queue')
  ],
  events: [
    localChoice('events-inproc', 'In-process Events', 'git-branch', '#766d7e', '/events'),
    ...choices('events'),
    localChoice('events-null', 'Null Events', 'shield-check', '#5c5c5c', '/events')
  ],
  mail: [
    localChoice('mail-log', 'Log Mail', 'terminal', '#766d7e', '/mail#logging'),
    localChoice('mail-smtp', 'SMTP', 'mail', COOL_3, '/mail#smtp'),
    localChoice('mail-resend', 'Resend', 'resend', '#403a46', '/mail#resend'),
    localChoice('mail-postmark', 'Postmark', 'mail', GOLD, '/mail#postmark'),
    localChoice('mail-mailgun', 'Mailgun', 'mailgun', '#cb3837', '/mail#mailgun'),
    localChoice('mail-sendgrid', 'SendGrid', 'sendgrid', COOL_4, '/mail#sendgrid'),
    localChoice('mail-ses', 'Amazon SES', 'amazonsimpleemailservice', '#ff9900', '/mail#ses')
  ]
}

const frontendGroup = GROUP_CONFIG.find(group => group.id === 'frontend')
const atlasGroup = GROUP_CONFIG.find(group => group.id === 'ai-agents')

// BUILDING_BLOCK_FAMILIES restores the original app-building choices alongside the complete driver catalog.
export const BUILDING_BLOCK_FAMILIES = {
  ...DRIVER_FAMILIES,
  frontend: frontendGroup.children,
  atlas: atlasGroup.children.map(choice => ({ ...choice, href: choice.href || atlasGroup.href })),
  libraries: backendGroups.find(group => group.id === 'backend-core-libraries').children
}

// driverProjectionLayout keeps canvas framing and the visible catalog on the same dimensions.
export function driverProjectionLayout(canvasWidth, count, floating = false, compact = false) {
  const wide = floating && canvasWidth >= 800
  const limit = compact ? (canvasWidth < 360 || count <= 8 ? 4 : 5)
    : wide ? 10 : floating ? (count > 8 ? 5 : 4) : canvasWidth < 360 ? 3 : canvasWidth < 500 ? 4 : count > 8 ? 5 : 4
  const columns = Math.min(limit, count)
  const gap = compact || wide ? 8 : 12
  const availableWidth = floating && !wide ? Math.min(420, canvasWidth) : canvasWidth
  const blockWidth = Math.min(compact || wide ? 72 : 78, (availableWidth - 24 - (columns - 1) * gap) / columns)
  const width = columns * blockWidth + (columns - 1) * gap
  const top = compact ? 10 : canvasWidth < 500 ? 12 : 20
  const tileHeight = compact ? 78 : wide ? 84 : 88
  const graphicHeight = compact ? 60 : wide ? 64 : 68
  const bottom = top + 24 + Math.ceil(count / columns) * tileHeight
  return { columns, gap, blockWidth, width, top, bottom, tileHeight, graphicHeight, height: bottom + (compact ? 10 : 16) }
}
