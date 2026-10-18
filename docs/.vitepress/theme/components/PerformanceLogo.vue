<script setup>
import { computed } from 'vue'
import { simpleIconBodies, lucideIconBodies } from 'virtual:goforj-icons'
import chi from '../../../assets/performance/chi.png'
import echo from '../../../assets/performance/echo.png'
import gorilla from '../../../assets/performance/gorilla.png'
import memcachedBanner from '../../../assets/performance/memcached-banner.jpg'
const props = defineProps({ id: { type: String, required: true } })
const images = { chi, echo, gorilla_mux: gorilla, goforj_web: '/favicon.svg' }
const brands = {
  redis: 'redis',
  nats: 'natsdotio',
  jetstream: 'natsdotio',
  natsjetstream: 'natsdotio',
  postgres: 'postgresql',
  mysql: 'mysql',
  sqlite: 'sqlite',
  kafka: 'apachekafka',
  rabbitmq: 'rabbitmq',
  sqs: 'amazonsqs',
  sns: 'amazonwebservices',
  s3: 'amazons3',
  gcs: 'googlecloudstorage',
  gcppubsub: 'googlepubsub',
  dynamodb: 'amazondynamodb',
  dropbox: 'dropbox',
  rclone: 'rclone',
  resend: 'resend',
  mailgun: 'mailgun',
  sendgrid: 'sendgrid',
  ses: 'amazonsimpleemailservice',
  net_http: 'go',
  gin: 'gin',
}
const generic = {
  memory: 'cpu',
  file: 'file',
  local: 'hard-drive',
  workerpool: 'rows-3',
  sync: 'zap',
  null: 'circle-off',
  ftp: 'hard-drive',
  sftp: 'hard-drive',
  smtp: 'mail',
  log: 'terminal',
  fake: 'mail',
  postmark: 'mail',
  httprouter: 'route',
}
const body = computed(() =>
  brands[props.id]
    ? simpleIconBodies[brands[props.id]]
    : lucideIconBodies[generic[props.id] || 'database'],
)
</script>
<template>
  <span class="bench-logo" aria-hidden="true"
    ><svg v-if="id === 'memcached'" viewBox="30 22 62 58">
      <image :href="memcachedBanner" width="785" height="145" /></svg
    ><img v-else-if="images[id]" :src="images[id]" alt="" width="24" height="24" /><svg
      v-else
      viewBox="0 0 24 24"
      :class="{ 'bench-logo-line': !brands[id] }"
      v-html="body"
    ></svg
  ></span>
</template>
<style scoped>
.bench-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  color: var(--driver-color, var(--gf-accent-hi));
}
.bench-logo > img {
  display: block;
  object-fit: contain;
  width: 24px;
  height: 24px;
}
.bench-logo > svg {
  width: 21px;
  height: 21px;
  fill: currentColor;
}
.bench-logo > svg.bench-logo-line {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
