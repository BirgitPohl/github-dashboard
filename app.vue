<script setup>
// Import design tokens globally
import '~/assets/styles/design-tokens.css'
</script>

<template>
  <div class="app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: var(--color-bg-secondary);
}
</style>
