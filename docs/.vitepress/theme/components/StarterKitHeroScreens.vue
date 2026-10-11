<script setup>
import StarterKitImage from './StarterKitImage.vue'
</script>

<template>
  <div class="gf-kits-hero-art" aria-label="Vue starter kit previews">
    <figure class="gf-kits-panel gf-kits-hero-signin">
      <figcaption>Sign in</figcaption>
      <StarterKitImage name="account-login" alt="Vue starter kit sign-in form" width="1148" height="1492" fetchpriority="high" decoding="async" />
    </figure>
    <figure class="gf-kits-panel gf-kits-hero-dashboard">
      <figcaption>Dashboard</figcaption>
      <StarterKitImage name="app-dashboard-shell" alt="Vue dashboard with sidebar navigation and application components" width="2992" height="1876" decoding="async" />
    </figure>
  </div>
</template>
