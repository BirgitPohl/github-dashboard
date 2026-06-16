<script setup>
// Import design tokens globally
import '~/assets/styles/design-tokens.css'

const brandThemeCss = useBrandThemeCss()
</script>

<template>
  <div class="app">
    <!-- Inline brand-color override. Rendered into <head> via Teleport so it
         sits next to the document head and its :root:root selector beats the
         design-tokens.css defaults regardless of CSS load order. -->
    <Teleport v-if="brandThemeCss" to="head">
      <component :is="'style'" v-html="brandThemeCss" />
    </Teleport>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
/* Global styles - apply font family to all elements */
html,
body {
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
  margin: 0;
  padding: 0;
}
</style>

<style scoped>
.app {
  min-height: 100vh;
  background-color: var(--color-bg-secondary);
}
</style>
