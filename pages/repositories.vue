<script setup lang="ts">
definePageMeta({
  name: 'RepositoriesOverview'
})

const { public: { githubOwner } } = useRuntimeConfig()

useHead({
  title: `Repositories - ${githubOwner}`
})

const {
  data: repositories,
  error,
  refresh,
  isRefreshing,
} = useResource<Repository[]>('repositories', '/api/repositories', {
  staleTime: 5 * 60 * 1000,
})

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

const headerStats = useHeaderStats()
watchEffect(() => {
  headerStats.set([
    { label: 'Repos', value: totalStats.value.totalRepos },
    { label: 'Stars', value: totalStats.value.totalStars, variant: 'warning' },
    { label: 'Forks', value: totalStats.value.totalForks, variant: 'info' },
  ])
})
onBeforeUnmount(() => headerStats.clear())
</script>

<template>
  <PageLayout
    :is-refreshing="isRefreshing"
    :error="error"
    :data="repositories"
    :on-retry="refresh"
    :skeleton-count="8"
  >
    <template #content>
      <div class="repositories-list">
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
/* Parent grid declares the column tracks; every repository row inherits
 * them via subgrid so icon, name, category, language, individual stat
 * columns (stars · forks · issues) and the updated-time column line up
 * across the whole list. */
.repositories-list {
  display: grid;
  /* icon · name · category · lang · stars · forks · issues · updated */
  grid-template-columns: auto 1fr auto minmax(0, 8ch) auto auto auto auto;
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.repositories-list > :last-child {
  border-bottom: 0;
}
</style>