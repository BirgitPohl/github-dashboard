<script setup lang="ts">
interface Props {
  isRefreshing?: boolean
  error?: any
  data?: any
  onRetry?: () => void
  skeletonCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  isRefreshing: false,
  skeletonCount: 6,
})

const hasData = computed(() => props.data != null)
const showSkeleton = computed(() => !hasData.value && props.isRefreshing)
</script>

<template>
  <div class="page-layout">
    <!-- Skeleton Loading (shown on initial load with no cached data) -->
    <SkeletonGrid v-if="showSkeleton" :count="skeletonCount" />

    <!-- Error State -->
    <div v-else-if="error && !data" class="error-state">
      <ErrorBox
        :error="error"
        @retry="onRetry"
      />
    </div>

    <!-- Content (shown when we have data, even if refreshing in background) -->
    <div v-else-if="data" class="content">
      <!-- Filters Section (optional) -->
      <div v-if="$slots.filters" class="filters-section">
        <slot name="filters" />
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <slot name="content" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-layout {
  padding: 0 var(--spacing-2) var(--spacing-2);
  min-height: 100vh;
  background: var(--color-bg-secondary);
}

.error-state {
  max-width: var(--container-max-width);
  margin: 0 auto;
  display: flex;
  justify-content: center;
  padding: var(--spacing-10) 0;
}

.content {
  max-width: var(--container-max-width);
  margin: 0 auto;
}

.filters-section {
  margin-bottom: var(--spacing-3);
}

@media (max-width: 768px) {
  .page-layout {
    padding: 0 var(--spacing-1) var(--spacing-1);
  }
}
</style>
