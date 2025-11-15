<script setup lang="ts">
definePageMeta({
  name: 'PullRequestsOverview'
})

useHead({
  title: 'Pull Requests - GitHub Dashboard'
})

const selectedState = ref('open')
const searchQuery = ref('')
const selectedRepository = ref('')

// Fetch data with caching
const {
  data: pullRequestsData,
  pending,
  error,
  refresh,
  isRefreshing,
  lastUpdated
} = useCachedFetch<PullRequestsResponse>(
  '/api/pull-requests',
  {
    key: 'pull-requests',
    staleTime: 5 * 60 * 1000, // 5 minutes
  },
  {
    query: {
      state: selectedState
    },
    watch: [selectedState]
  }
)

const { shouldShowSkeleton, shouldShowRefreshIndicator } = useLoadingState()

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

const showSkeleton = computed(() => shouldShowSkeleton(!!pullRequestsData.value, pending.value))
const showRefreshIndicator = computed(() => shouldShowRefreshIndicator(!!pullRequestsData.value, isRefreshing.value))
</script>

<template>
  <div class="pull-requests-page">
    <div class="container">
      <!-- Refresh Indicator -->
      <RefreshIndicator
        v-if="showRefreshIndicator"
        :is-refreshing="isRefreshing"
        :last-updated="lastUpdated"
      />

      <!-- Skeleton Loading -->
      <template v-if="showSkeleton">
        <SkeletonStats :count="5" />
        <SkeletonGrid :count="6" />
      </template>

      <!-- Content -->
      <template v-else-if="pullRequestsData">
        <!-- Stats Cards -->
        <div class="stats-grid">
        <StatsCard
          icon="📊"
          :value="stats.total"
          label="Total PRs"
        />

        <StatsCard
          icon="🔓"
          :value="stats.open"
          label="Open"
          variant="success"
        />

        <StatsCard
          icon="📝"
          :value="stats.draft"
          label="Draft"
          variant="warning"
        />

        <StatsCard
          icon="📦"
          :value="stats.repositories"
          label="Repositories"
          variant="info"
        />
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="filter-group">
          <label for="state-select" class="filter-label">State</label>
          <select 
            id="state-select"
            v-model="selectedState" 
            class="filter-select"
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="all">All</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="search-input" class="filter-label">Search</label>
          <input
            id="search-input"
            v-model="searchQuery"
            type="text"
            placeholder="Search PRs, authors, or repositories..."
            class="filter-input"
          >
        </div>

        <div class="filter-group">
          <label for="repo-select" class="filter-label">Repository</label>
          <select 
            id="repo-select"
            v-model="selectedRepository" 
            class="filter-select"
          >
            <option value="">All Repositories</option>
            <option 
              v-for="repo in repositoryOptions" 
              :key="repo" 
              :value="repo"
            >
              {{ repo }}
            </option>
          </select>
        </div>

        <button 
          class="refresh-button"
          :disabled="pending"
          @click="refresh()" 
        >
          {{ pending ? 'Loading...' : 'Refresh' }}
        </button>
      </div>

      <!-- Pull Requests List -->
      <div v-if="filteredPullRequests.length > 0" class="pull-requests-list">
        <div class="list-header">
          <Header
            :level="2"
            size="xl"
            variant="primary"
          >
            {{ filteredPullRequests.length }} Pull Request{{ filteredPullRequests.length !== 1 ? 's' : '' }}
          </Header>
        </div>

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

      <!-- Error State -->
      <div v-else-if="error && !pullRequestsData" class="error">
        <ErrorBox
          :error="error"
          title="Failed to load pull requests"
          @retry="refresh"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pull-requests-page {
  min-height: 100vh;
  padding: 32px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.filters {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.filter-select, .filter-input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
}

.filter-select:focus, .filter-input:focus {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
  border-color: #3b82f6;
}

.refresh-button {
  padding: 10px 20px;
  background: #1d4ed8;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  height: fit-content;
}

.refresh-button:hover:not(:disabled) {
  background: #2563eb;
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading, .error {
  background: white;
  padding: 64px 32px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
}



.pull-requests-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.list-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.list-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.pr-list {
  /* Removed max-height and overflow - page is scrollable */
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters {
    flex-direction: column;
  }

  .filter-group {
    min-width: auto;
    width: 100%;
  }
}
</style>