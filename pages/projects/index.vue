<script setup lang="ts">
definePageMeta({
  name: 'ProjectsOverview'
})

useHead({
  title: 'Project Boards - GitHub Dashboard'
})

const {
  data: projects,
  error,
  refresh,
  isRefreshing,
  lastUpdated,
  showSkeleton,
  showRefreshIndicator
} = useCachedFetch<Project[]>(
  '/api/projects',
  {
    key: 'projects',
    staleTime: 5 * 60 * 1000, // 5 minutes
  }
)
</script>

<template>
  <PageLayout
    :show-skeleton="showSkeleton"
    :show-refresh-indicator="showRefreshIndicator"
    :is-refreshing="isRefreshing"
    :last-updated="lastUpdated"
    :error="error"
    :data="projects"
    :on-retry="refresh"
    :skeleton-count="4"
  >
    <template #content>
      <template v-if="projects && projects.length > 0">
        <div class="projects-grid">
          <ProjectCard
            v-for="project in projects"
            :key="project.id"
            :project="project"
          />
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
    </template>
  </PageLayout>
</template>

<style scoped>
.projects-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

@media (max-width: 768px) {
  .projects-grid {
    gap: 16px;
  }
}
</style>