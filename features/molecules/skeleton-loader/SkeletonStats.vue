<script setup lang="ts">
interface Props {
  count?: number
}

withDefaults(defineProps<Props>(), {
  count: 4,
})
</script>

<template>
  <div class="skeleton-stats">
    <div
      v-for="i in count"
      :key="i"
      class="skeleton-stat-card"
    >
      <div class="skeleton-icon" />
      <div class="skeleton-value" />
      <div class="skeleton-label" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-8);
}

.skeleton-stat-card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
}

.skeleton-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--gradient-shimmer);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-value {
  width: 60px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--gradient-shimmer);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-label {
  width: 120px;
  height: 16px;
  border-radius: var(--radius-sm);
  background: var(--gradient-shimmer);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 768px) {
  .skeleton-stats {
    grid-template-columns: 1fr;
  }
}
</style>
