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
  background-color: #f9fafb;
}

.main-content {
  padding: 0;
  padding-top: 73px; /* Height of fixed navigation */
}

@media (max-width: 768px) {
  .main-content {
    padding-top: 120px; /* Taller navigation on mobile */
  }
}
</style>
