<script setup lang="ts">
definePageMeta({
  name: 'RepositoriesOverview'
})

useHead({
  title: 'Repositories - GitHub Dashboard'
})

const {
  data: repositories,
  error,
  refresh,
  isRefreshing,
  lastUpdated,
  showSkeleton,
  showRefreshIndicator
} = useCachedFetch<Repository[]>(
  '/api/repositories',
  {
    key: 'repositories',
    staleTime: 5 * 60 * 1000, // 5 minutes
  }
)

const { computeSum, computeCount } = useStatsAggregation()

// Total stats using the new composable
const totalStats = computed(() => {
  if (!repositories.value) return { totalRepos: 0, totalStars: 0, totalForks: 0 }

  return {
    totalRepos: computeCount(repositories.value),
    totalStars: computeSum(repositories.value, 'stars'),
    totalForks: computeSum(repositories.value, 'forks')
  }
})
</script>

<template>
  <PageLayout
    :show-skeleton="showSkeleton"
    :show-refresh-indicator="showRefreshIndicator"
    :is-refreshing="isRefreshing"
    :last-updated="lastUpdated"
    :error="error"
    :data="repositories"
    :on-retry="refresh"
    :skeleton-count="8"
    :show-stats="true"
  >
    <template #stats>
      <StatsCard
        icon="📊"
        :value="totalStats.totalRepos"
        label="Total Repositories"
      />

      <StatsCard
        icon="⭐"
        :value="totalStats.totalStars"
        label="Total Stars"
        variant="warning"
      />

      <StatsCard
        icon="🍴"
        :value="totalStats.totalForks"
        label="Total Forks"
        variant="info"
      />
    </template>

    <template #content>
      <div class="repositories-grid">
        <RepositoryCard
          v-for="repository in repositories"
          :key="repository.id"
          :repository="repository"
        />
      </div>
    </template>
  </PageLayout>
</template>

<style scoped>
.repositories-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-5);
  justify-content: center;
}

@media (max-width: 768px) {
  .repositories-grid {
    gap: var(--spacing-4);
  }
}
</style>