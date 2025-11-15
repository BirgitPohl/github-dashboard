<script setup lang="ts">
interface Props {
  showSkeleton?: boolean
  showRefreshIndicator?: boolean
  isRefreshing?: boolean
  lastUpdated?: number
  error?: any
  data?: any
  onRetry?: () => void
  skeletonCount?: number
  showStats?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSkeleton: false,
  showRefreshIndicator: false,
  isRefreshing: false,
  skeletonCount: 6,
  showStats: false
})
</script>

<template>
  <div class="page-layout">
    <!-- Refresh Indicator (shown when refreshing with cached data) -->
    <RefreshIndicator
      v-if="showRefreshIndicator"
      :is-refreshing="isRefreshing"
      :last-updated="lastUpdated"
    />

    <!-- Skeleton Loading (shown on initial load with no cached data) -->
    <template v-if="showSkeleton">
      <SkeletonStats v-if="showStats" :count="3" />
      <SkeletonGrid :count="skeletonCount" />
    </template>

    <!-- Error State -->
    <div v-else-if="error && !data" class="error-state">
      <ErrorBox
        :error="error"
        @retry="onRetry"
      />
    </div>

    <!-- Content (shown when we have data, even if refreshing in background) -->
    <div v-else-if="data" class="content">
      <!-- Stats Section (optional) -->
      <div v-if="$slots.stats" class="stats-section">
        <slot name="stats" />
      </div>

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
  padding: 32px;
  min-height: 100vh;
  background: #f8fafc;
}

.error-state {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-section {
  display: flex;
  gap: 20px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  justify-content: center;
}

.filters-section {
  margin-bottom: 32px;
}

.main-content {
  /* Child components define their own layout */
}

@media (max-width: 768px) {
  .page-layout {
    padding: 16px;
  }

  .stats-section {
    gap: 16px;
  }
}
</style>
