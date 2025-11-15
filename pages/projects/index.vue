<script setup lang="ts">
definePageMeta({
  name: 'ProjectsOverview'
})

useHead({
  title: 'Project Boards - GitHub Dashboard'
})

interface Project {
  id: string
  title: string
  description: string
  url: string
  created_at: string
  updated_at: string
  status: 'open' | 'closed'
  items_count: number
}

const {
  data: projects,
  pending,
  error,
  refresh,
  isRefreshing,
  lastUpdated
} = useCachedFetch<Project[]>(
  '/api/projects',
  {
    key: 'projects',
    staleTime: 5 * 60 * 1000, // 5 minutes
  }
)

const { shouldShowSkeleton, shouldShowRefreshIndicator } = useLoadingState()

// Total stats
const totalStats = computed(() => {
  if (!projects.value) return { totalProjects: 0, totalItems: 0 }

  return {
    totalProjects: projects.value.length,
    totalItems: projects.value.reduce((sum: number, project: Project) => sum + project.items_count, 0)
  }
})

const showSkeleton = computed(() => shouldShowSkeleton(!!projects.value, pending.value))
const showRefreshIndicator = computed(() => shouldShowRefreshIndicator(!!projects.value, isRefreshing.value))
</script>

<template>
  <div class="projects-page">
    <!-- Refresh Indicator -->
    <RefreshIndicator
      v-if="showRefreshIndicator"
      :is-refreshing="isRefreshing"
      :last-updated="lastUpdated"
    />

    <!-- Skeleton Loading -->
    <template v-if="showSkeleton">
      <SkeletonStats :count="2" />
      <SkeletonGrid :count="4" />
    </template>

    <!-- Content -->
    <template v-else-if="projects && projects.length > 0">
      <!-- Stats Overview -->
      <div class="stats-overview">
        <StatsCard
          icon="📋"
          :value="totalStats.totalProjects"
          label="Project Boards"
          variant="primary"
        />

        <StatsCard
          icon="📝"
          :value="totalStats.totalItems"
          label="Total Items"
          variant="success"
        />
      </div>

      <!-- Projects Grid -->
      <div class="projects-section">
        <TypographyHeader 
          :level="2" 
          size="xl" 
          variant="primary"
        >
          All Project Boards
        </TypographyHeader>
        <div class="projects-grid">
          <ProjectCard 
            v-for="project in projects" 
            :key="project.id"
            :project="project"
          />
        </div>
      </div>
    </template>

    <!-- Empty State -->
    <EmptyState
      v-else-if="projects && projects.length === 0"
      icon="📋"
      title="No Project Boards Found"
      message="This organization doesn't have any GitHub Project Boards yet."
      action-label="Create First Project Board →"
      action-url="https://github.com/orgs/Oracommit/projects"
      :action-external="true"
    />

    <!-- Error State -->
    <div v-else-if="error && !projects" class="error-state">
      <ErrorBox
        :error="error"
        title="Failed to load project boards"
        @retry="refresh"
      />

      <div class="error-details">
        <!-- Special handling for scope errors -->
        <div v-if="error.statusCode === 403" class="scope-error">
          <TypographyHeader
            :level="4"
            size="md"
            variant="primary"
          >
            🔑 Token Scope Issue
          </TypographyHeader>
          <p>Your GitHub token needs additional permissions to access Project Boards.</p>
          <div class="scope-instructions">
            <p><strong>To fix this:</strong></p>
            <ol>
              <li>Go to <a href="https://github.com/settings/tokens" target="_blank">GitHub Token Settings</a></li>
              <li>Edit your existing token or create a new one</li>
              <li>Add the <code>read:project</code> scope</li>
              <li>Update your <code>.env</code> file with the new token</li>
              <li>Restart the development server</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.projects-page {
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
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  max-width: 600px;
  margin: 0 auto;
  gap: 24px;
}

.error-details p {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #6b7280;
}

.scope-error {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  text-align: left;
}

.scope-error h4 {
  color: #92400e;
  margin: 0 0 12px 0;
  font-size: 16px;
}

.scope-error p {
  color: #92400e;
  margin: 0 0 12px 0;
}

.scope-instructions {
  background: white;
  border-radius: 6px;
  padding: 16px;
  margin-top: 12px;
}

.scope-instructions ol {
  margin: 8px 0 0 0;
  padding-left: 20px;
  color: #374151;
}

.scope-instructions code {
  background: #f3f4f6;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.scope-instructions a {
  color: #2563eb;
  text-decoration: underline;
}

.stats-overview {
  display: flex;
  gap: 20px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  justify-content: center;
}

.projects-section {
  margin-bottom: 32px;
}

.projects-section h2 {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 20px 0;
  text-align: center;
}

.projects-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

@media (max-width: 768px) {
  .projects-page {
    padding: 16px;
  }

  .stats-overview {
    gap: 16px;
  }

  .projects-grid {
    gap: 16px;
  }
}
</style>