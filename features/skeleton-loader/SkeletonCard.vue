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
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  border-radius: 4px;
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
