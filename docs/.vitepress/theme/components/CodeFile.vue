<script setup>
defineProps({
  path: {
    type: String,
    required: true
  }
})
</script>

<template>
  <figure class="gf-code-file">
    <figcaption class="gf-code-file__caption">{{ path }}</figcaption>
    <div class="gf-code-file__body">
      <slot></slot>
    </div>
  </figure>
</template>
