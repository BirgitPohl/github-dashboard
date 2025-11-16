<script setup lang="ts">
interface Props {
  count?: number
  columns?: number
}

withDefaults(defineProps<Props>(), {
  count: 6,
  columns: 3,
})
</script>

<template>
  <div
    class="skeleton-grid"
    :style="{ gridTemplateColumns: `repeat(auto-fill, minmax(300px, 1fr))` }"
  >
    <SkeletonCard
      v-for="i in count"
      :key="i"
      height="200px"
    />
  </div>
</template>

<style scoped>
.skeleton-grid {
  display: grid;
  gap: var(--spacing-5);
  margin-top: var(--spacing-6);
}

@media (max-width: 768px) {
  .skeleton-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
