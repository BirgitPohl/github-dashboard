<script setup lang="ts">
definePageMeta({
  name: 'RepositoriesOverview'
})

useHead({
  title: 'Repositories - GitHub Dashboard'
})

interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  language: string
  is_private: boolean
  stars: number
  forks: number
  issues: number
  updated_at: string
  created_at: string
  html_url: string
  topics: string[]
  size: number
  default_branch: string
  category: string
  tech_stack: string[]
}

const { data: repositories, pending, error, refresh } = await useFetch<Repository[]>('/api/repositories')

// Category stats
const categoryStats = computed(() => {
  if (!repositories.value) return {}
  
  const stats: Record<string, number> = {}
  for (const repository of repositories.value) {
    stats[repository.category] = (stats[repository.category] || 0) + 1
  }
  
  return stats
})

// Total stats
const totalStats = computed(() => {
  if (!repositories.value) return { totalRepos: 0, totalStars: 0, totalForks: 0 }
  
  return {
    totalRepos: repositories.value.length,
    totalStars: repositories.value.reduce((sum: number, repo: Repository) => sum + repo.stars, 0),
    totalForks: repositories.value.reduce((sum: number, repo: Repository) => sum + repo.forks, 0)
  }
})
</script>

<template>
  <div class="repositories-page">
    <PageHeader
      title="Repositories Dashboard"
      description="Overview of all repositories and their details"
    />

    <!-- Loading State -->
    <div v-if="pending" class="loading-state">
      <LoadingSpinner message="Loading repositories..." />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <ErrorBoxErrorBox 
        :error="error"
        title="Failed to load repositories"
        @retry="refresh"
      />
    </div>

    <!-- Content -->
    <div v-else-if="repositories">
      <!-- Stats Overview -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalStats.totalRepos }}</div>
            <div class="stat-label">Total Repositories</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalStats.totalStars }}</div>
            <div class="stat-label">Total Stars</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🍴</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalStats.totalForks }}</div>
            <div class="stat-label">Total Forks</div>
          </div>
        </div>
      </div>

      <!-- Category Distribution -->
      <div class="category-overview">
        <TypographyHeader 
          :level="2" 
          size="xl" 
          variant="primary"
        >
          Repository Categories
        </TypographyHeader>
        <div class="category-grid">
          <div 
            v-for="(count, category) in categoryStats" 
            :key="category"
            class="category-stat"
          >
            <span class="category-name">{{ category }}</span>
            <span class="category-count">{{ count }}</span>
          </div>
        </div>
      </div>

      <!-- Repositories Grid -->
      <div class="repositories-section">
        <TypographyHeader 
          :level="2" 
          size="xl" 
          variant="primary"
        >
          All Repositories
        </TypographyHeader>
        <div class="repositories-grid">
          <RepositoryCard 
            v-for="repository in repositories" 
            :key="repository.id"
            :repository="repository"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.repositories-page {
  padding: 20px;
  min-height: 100vh;
  background: #f8fafc;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.error-state {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}

.stats-overview {
  display: flex;
  gap: 20px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  justify-content: center;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-width: 200px;
}

.stat-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.category-overview {
  margin-bottom: 32px;
  text-align: center;
}

.category-overview h2 {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
}

.category-grid {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.category-stat {
  background: white;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.category-name {
  font-size: 14px;
  color: #374151;
}

.category-count {
  background: #3b82f6;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
}

.repositories-section {
  margin-bottom: 32px;
}

.repositories-section h2 {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 20px 0;
  text-align: center;
}

.repositories-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

@media (max-width: 768px) {
  .repositories-page {
    padding: 16px;
  }
  
  .stats-overview {
    gap: 16px;
  }
  
  .stat-card {
    min-width: 160px;
    padding: 20px;
  }
  
  .repositories-grid {
    gap: 16px;
  }
}
</style>