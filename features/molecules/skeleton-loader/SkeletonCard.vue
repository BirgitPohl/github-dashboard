<script setup lang="ts">
interface Props {
  height?: string
  width?: string
}

withDefaults(defineProps<Props>(), {
  height: '120px',
  width: '100%',
})
</script>

<template>
  <div
    class="skeleton-card"
    :style="{ height, width }"
  >
    <div class="skeleton-content">
      <div class="skeleton-line skeleton-title" />
      <div class="skeleton-line skeleton-text" />
      <div class="skeleton-line skeleton-text short" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.skeleton-line {
  height: 16px;
  background: var(--gradient-shimmer);
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: shimmer 1.5s infinite;
}

.skeleton-title {
  height: 24px;
  width: 60%;
}

.skeleton-text {
  width: 100%;
}

.skeleton-text.short {
  width: 40%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
