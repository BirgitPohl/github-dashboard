<script setup>
// Import design tokens globally
import '~/assets/styles/design-tokens.css'
</script>

<template>
  <div class="app">
    <Navigation />

    <main class="main-content">
      <NuxtPage />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: var(--color-bg-secondary);
}

.main-content {
  padding: 0;
  padding-top: var(--nav-height);
}

@media (max-width: 768px) {
  .main-content {
    padding-top: var(--nav-height-mobile);
  }
}
</style>
