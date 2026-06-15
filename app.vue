<script setup>
// Import design tokens globally
import '~/assets/styles/design-tokens.css'

const brandThemeCss = useBrandThemeCss()
if (brandThemeCss) {
  useHead({ style: [{ children: brandThemeCss }] })
}
</script>

<template>
  <div class="app">
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
