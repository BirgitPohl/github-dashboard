<script setup lang="ts">
definePageMeta({
  name: 'PullRequestsOverview'
})

const { public: { githubOwner } } = useRuntimeConfig()

useHead({
  title: `Pull Requests - ${githubOwner}`
})

const selectedState = ref('open')
const searchQuery = ref('')
const selectedRepository = ref('')

const {
  data: pullRequestsData,
  error,
  refresh,
  isRefreshing,
} = useResource<PullRequestsResponse>(
  () => `pull-requests:${selectedState.value}`,
  () => `/api/pull-requests?state=${selectedState.value}`,
  { staleTime: 5 * 60 * 1000 },
)

// Computed properties for filtering and stats
const filteredPullRequests = computed(() => {
  if (!pullRequestsData.value?.pull_requests) return []
  
  let filtered = pullRequestsData.value.pull_requests
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(pr => 
      pr.title.toLowerCase().includes(query) ||
      pr.user.login.toLowerCase().includes(query) ||
      pr.repository.name.toLowerCase().includes(query)
    )
  }
  
  // Filter by repository
  if (selectedRepository.value && selectedRepository.value !== '') {
    filtered = filtered.filter(pr => pr.repository.name === selectedRepository.value)
  }
  
  return filtered
})

const repositoryOptions = computed(() => {
  if (!pullRequestsData.value?.pull_requests) return []
  
  const repos = [...new Set(pullRequestsData.value.pull_requests.map(pr => pr.repository.name))]
  return repos.sort()
})

const stats = computed(() => pullRequestsData.value?.stats || {
  total: 0,
  open: 0,
  closed: 0,
  merged: 0,
  draft: 0,
  repositories: 0
})

const headerStats = useHeaderStats()
watchEffect(() => {
  headerStats.set([
    { label: 'Total PRs', value: stats.value.total },
    { label: 'Open', value: stats.value.open, variant: 'success' },
    { label: 'Draft', value: stats.value.draft, variant: 'warning' },
    { label: 'Repos', value: stats.value.repositories, variant: 'info' },
  ])
})
onBeforeUnmount(() => headerStats.clear())

const filtersOpen = ref(false)
const hasActiveFilters = computed(() =>
  selectedState.value !== 'open' || searchQuery.value.trim() !== '' || selectedRepository.value !== '',
)

const headerActions = useHeaderActions()
watchEffect(() => {
  headerActions.set([
    {
      id: 'pr-filters',
      icon: '🔍',
      label: filtersOpen.value ? 'Hide filters' : 'Show filters',
      active: filtersOpen.value,
      dot: hasActiveFilters.value,
      onClick: () => { filtersOpen.value = !filtersOpen.value },
    },
  ])
})
onBeforeUnmount(() => headerActions.clear())
</script>

<template>
  <PageLayout
    :is-refreshing="isRefreshing"
    :error="error"
    :data="pullRequestsData"
    :on-retry="refresh"
    :skeleton-count="6"
  >
    <template #filters>
      <div v-if="filtersOpen" id="pr-filters-panel" class="filters">
        <div class="filter-group">
          <label for="state-select" class="filter-label">State</label>
          <Select
            id="state-select"
            v-model="selectedState"
            :options="[
              { value: 'open', label: 'Open' },
              { value: 'closed', label: 'Closed' },
              { value: 'all', label: 'All' }
            ]"
          />
        </div>

        <div class="filter-group">
          <label for="search-input" class="filter-label">Search</label>
          <Input
            id="search-input"
            v-model="searchQuery"
            type="search"
            placeholder="Search PRs, authors, or repositories..."
          />
        </div>

        <div class="filter-group">
          <label for="repo-select" class="filter-label">Repository</label>
          <Select
            id="repo-select"
            v-model="selectedRepository"
            :options="[
              { value: '', label: 'All Repositories' },
              ...repositoryOptions.map(r => ({ value: r, label: r }))
            ]"
          />
        </div>

        <Button
          variant="primary"
          :disabled="isRefreshing"
          class="refresh-button"
          @click="refresh()"
        >
          {{ isRefreshing ? 'Loading...' : 'Refresh' }}
        </Button>
      </div>
    </template>

    <template #content>
      <div v-if="filteredPullRequests.length > 0" class="pull-requests-list">
        <div class="pr-list">
          <PullRequestCard
            v-for="pr in filteredPullRequests"
            :key="pr.id"
            :pull-request="pr"
          />
        </div>
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else
        title="No pull requests found"
        :message="selectedState === 'open' ? 'No open pull requests' :
                  selectedState === 'closed' ? 'No closed pull requests' :
                  'No pull requests match your current filters'"
      />
    </template>
  </PageLayout>
</template>

<style scoped>
.filters {
  background: var(--color-white);
  padding: var(--spacing-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-4);
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
  margin-bottom: var(--spacing-2);
}

.refresh-button {
  height: fit-content;
}

.pull-requests-list {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.pr-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }

  .filter-group {
    min-width: auto;
    width: 100%;
  }
}
</style>