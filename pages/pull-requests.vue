<script setup lang="ts">
definePageMeta({
  name: 'PullRequestsOverview'
})

useHead({
  title: 'Pull Requests - GitHub Dashboard'
})

interface PullRequest {
  id: number
  number: number
  title: string
  state: 'open' | 'closed' | 'merged'
  html_url: string
  created_at: string
  updated_at: string
  closed_at: string | null
  merged_at: string | null
  draft: boolean
  user: {
    login: string
    avatar_url: string
    html_url: string
  }
  assignees: Array<{
    login: string
    avatar_url: string
  }>
  labels: Array<{
    name: string
    color: string
  }>
  head: {
    ref: string
    repo: {
      name: string
      full_name: string
    } | null
  }
  base: {
    ref: string
  }
  repository: {
    name: string
    full_name: string
  }
  additions?: number
  deletions?: number
  changed_files?: number
}

interface PullRequestsResponse {
  pull_requests: PullRequest[]
  stats: {
    total: number
    open: number
    closed: number
    merged: number
    draft: number
    repositories: number
  }
}

const selectedState = ref('open')
const searchQuery = ref('')
const selectedRepository = ref('')

// Fetch data reactively based on state
const { data: pullRequestsData, pending, error, refresh } = await useLazyFetch<PullRequestsResponse>('/api/pull-requests', {
  query: {
    state: selectedState
  }
})

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

// Format relative time
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return date.toLocaleDateString()
}

// Get state styling
function getStateClass(pr: PullRequest): string {
  if (pr.merged_at) return 'state-merged'
  if (pr.state === 'open' && pr.draft) return 'state-draft'
  if (pr.state === 'open') return 'state-open'
  return 'state-closed'
}

function getStateIcon(pr: PullRequest): string {
  if (pr.merged_at) return '✅'
  if (pr.state === 'open' && pr.draft) return '📝'
  if (pr.state === 'open') return '🔓'
  return '❌'
}

// Watch for state changes and refresh data
watch(selectedState, () => {
  refresh()
})
</script>

<template>
  <div class="pull-requests-page">
    <div class="container">
      <div class="page-header">
        <TypographyHeader 
          :level="1" 
          size="3xl" 
          variant="primary"
          class="page-title"
        >
          Pull Requests
        </TypographyHeader>
        <p class="page-description">
          Overview of pull requests across all repositories
        </p>
      </div>

      <!-- Stats Cards -->
      <div v-if="!pending" class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Total PRs</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.open }}</div>
          <div class="stat-label">Open</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.merged }}</div>
          <div class="stat-label">Merged</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.draft }}</div>
          <div class="stat-label">Draft</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.repositories }}</div>
          <div class="stat-label">Repositories</div>
        </div>
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

      <!-- Loading State -->
      <div v-if="pending" class="loading">
        <div class="loading-spinner" />
        <p>Loading pull requests...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error">
        <ErrorBoxErrorBox 
          :error="error"
          title="Failed to load pull requests"
          @retry="refresh"
        />
      </div>

      <!-- Pull Requests List -->
      <div v-else-if="filteredPullRequests.length > 0" class="pull-requests-list">
        <div class="list-header">
          <TypographyHeader 
            :level="2" 
            size="xl" 
            variant="primary"
          >
            {{ filteredPullRequests.length }} Pull Request{{ filteredPullRequests.length !== 1 ? 's' : '' }}
          </TypographyHeader>
        </div>

        <div class="pr-list">
          <div 
            v-for="pr in filteredPullRequests" 
            :key="pr.id" 
            class="pr-item"
            :class="getStateClass(pr)"
          >
            <div class="pr-header">
              <div class="pr-status">
                <span class="pr-icon">{{ getStateIcon(pr) }}</span>
                <span class="pr-number">#{{ pr.number }}</span>
              </div>
              <div class="pr-repository">
                {{ pr.repository.name }}
              </div>
            </div>

            <div class="pr-content">
              <TypographyHeader 
                :level="3" 
                size="md" 
                variant="primary"
                class="pr-title"
              >
                <a :href="pr.html_url" target="_blank" rel="noopener noreferrer">
                  {{ pr.title }}
                </a>
              </TypographyHeader>
              
              <div class="pr-meta">
                <div class="pr-author">
                  <img 
                    :src="pr.user.avatar_url" 
                    :alt="pr.user.login"
                    class="author-avatar"
                  >
                  <span class="author-name">{{ pr.user.login }}</span>
                </div>
                
                <div class="pr-branch-info">
                  <span class="branch">{{ pr.head.ref }}</span>
                  <span class="arrow">→</span>
                  <span class="branch">{{ pr.base.ref }}</span>
                </div>
                
                <div class="pr-time">
                  {{ formatTimeAgo(pr.updated_at) }}
                </div>
              </div>

              <div v-if="pr.labels.length > 0" class="pr-labels">
                <span
                  v-for="label in pr.labels"
                  :key="label.name"
                  class="pr-label"
                  :style="{ backgroundColor: `#${label.color}` }"
                >
                  {{ label.name }}
                </span>
              </div>

              <div v-if="pr.assignees.length > 0" class="pr-assignees">
                <span class="assignees-label">Assigned to:</span>
                <div class="assignees-list">
                  <img
                    v-for="assignee in pr.assignees"
                    :key="assignee.login"
                    :src="assignee.avatar_url"
                    :alt="assignee.login"
                    :title="assignee.login"
                    class="assignee-avatar"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <TypographyHeader 
          :level="3" 
          size="lg" 
          variant="secondary"
        >
          No pull requests found
        </TypographyHeader>
        <p>
          {{ selectedState === 'open' ? 'No open pull requests' : 
             selectedState === 'closed' ? 'No closed pull requests' : 
             'No pull requests match your current filters' }}
        </p>
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

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
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

.loading, .error, .empty-state {
  background: white;
  padding: 64px 32px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-left: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
  max-height: 800px;
  overflow-y: auto;
}

.pr-item {
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
}

.pr-item:hover {
  background: #f9fafb;
}

.pr-item:last-child {
  border-bottom: none;
}

.pr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.pr-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pr-icon {
  font-size: 16px;
}

.pr-number {
  font-weight: 600;
  color: #6b7280;
}

.pr-repository {
  font-size: 14px;
  color: #374151;
  background: #e5e7eb;
  padding: 4px 8px;
  border-radius: 6px;
}

.pr-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.pr-title a {
  color: #111827;
  text-decoration: none;
}

.pr-title a:hover {
  text-decoration: underline;
}

.pr-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #6b7280;
}

.pr-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.pr-branch-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.branch {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}

.arrow {
  color: #9ca3af;
}

.pr-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.pr-label {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.pr-assignees {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.assignees-list {
  display: flex;
  gap: 4px;
}

.assignee-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

/* State-specific styling */
.state-open {
  border-left: 4px solid #10b981;
}

.state-draft {
  border-left: 4px solid #f59e0b;
}

.state-merged {
  border-left: 4px solid #8b5cf6;
}

.state-closed {
  border-left: 4px solid #ef4444;
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .filter-group {
    min-width: auto;
    width: 100%;
  }
  
  .pr-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .pr-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>