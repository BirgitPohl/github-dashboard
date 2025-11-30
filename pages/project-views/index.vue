<script setup lang="ts">
import type { ProjectV2View } from '../../server/utils/github-graphql'
import type { ViewItem } from '../../composables/useViewFiltering'

definePageMeta({
  name: 'ProjectViewsPage'
})

useHead({
  title: 'Project Views - GitHub Dashboard'
})

// Fetch projects list
const {
  data: projects,
  error: projectsError,
  pending: projectsPending
} = useFetch<Array<{
  id: string
  number: number
  title: string
  viewsCount: number
  views: Array<{ id: string; name: string; number: number; layout: string }>
}>>('/api/project-views', {
  server: false
})

// Selected project
const selectedProjectId = ref<string | null>(null)

// Auto-select first project when projects load
watch(projects, (newProjects) => {
  if (newProjects && newProjects.length > 0 && !selectedProjectId.value) {
    selectedProjectId.value = newProjects[0].id
  }
}, { immediate: true })

// Project selector options
const projectOptions = computed(() => {
  if (!projects.value) return []

  return projects.value.map(p => ({
    value: p.id,
    label: `${p.title} (${p.viewsCount} views)`
  }))
})

// Fetch selected project details (with full view configurations)
const {
  data: projectDetail,
  error: projectDetailError,
  pending: projectDetailPending,
  refresh: refreshProject
} = useFetch<{
  id: string
  title: string
  shortDescription: string | null
  url: string
  views: ProjectV2View[]
}>(
  () => selectedProjectId.value ? `/api/project-views/${selectedProjectId.value}` : null,
  {
    key: () => selectedProjectId.value ? `project-detail-${selectedProjectId.value}` : 'project-detail-null',
    server: false,
    immediate: true,
    watch: false
  }
)

// Fetch items for selected project
const {
  data: items,
  error: itemsError,
  pending: itemsPending,
  refresh: refreshItems
} = useFetch<ViewItem[]>(
  () => selectedProjectId.value ? `/api/project-views/${selectedProjectId.value}/items` : null,
  {
    key: () => selectedProjectId.value ? `project-items-${selectedProjectId.value}` : 'project-items-null',
    server: false,
    immediate: true,
    watch: false
  }
)

// Active view (tab)
const activeViewId = ref<string | null>(null)

// Watch for project changes and refetch data
watch(selectedProjectId, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    await Promise.all([refreshProject(), refreshItems()])
  }
})

// Update active view when project detail loads
watch(projectDetail, (detail) => {
  if (detail && detail.views.length > 0) {
    // Select first view by default
    activeViewId.value = detail.views[0].id
  }
})

// Tab configuration
const tabs = computed(() => {
  if (!projectDetail.value) return []

  return projectDetail.value.views.map(view => ({
    id: view.id,
    label: view.name,
    icon: view.layout === 'BOARD_LAYOUT' ? '📊' : view.layout === 'ROADMAP_LAYOUT' ? '📅' : '📋'
  }))
})

// Current view
const currentView = computed(() => {
  if (!projectDetail.value || !activeViewId.value) return null

  return projectDetail.value.views.find(v => v.id === activeViewId.value) || null
})

// Combined loading state
const isLoading = computed(() => projectDetailPending.value || itemsPending.value)

// Combined error state
const error = computed(() => projectsError.value || projectDetailError.value || itemsError.value)
</script>

<template>
  <div class="project-views-page">
    <PageLayout
      :show-skeleton="false"
      :show-refresh-indicator="false"
      :is-refreshing="false"
      :error="projectsError"
      :data="projects"
      :on-retry="() => {}"
    >
      <template #content>
        <!-- Page Header -->
        <div class="page-header">
          <Header :level="1" size="3xl" variant="primary">
            Project Views
          </Header>
          <Text variant="secondary" size="base">
            Select a project to view its configured views with filters, grouping, and sorting.
          </Text>
        </div>

        <!-- Project Selector -->
        <div class="project-selector">
          <div class="selector-field">
            <label for="project-select" class="selector-label">
              <Text variant="secondary" size="sm" weight="medium">Select Project:</Text>
            </label>
            <select
              id="project-select"
              v-model="selectedProjectId"
              class="selector-input"
              :disabled="projectsPending"
            >
              <option :value="null">-- Choose a project --</option>
              <option v-for="option in projectOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <div v-if="selectedProjectId && projectDetail" class="project-info">
            <Link :href="projectDetail.url" variant="primary" size="sm" external>
              View on GitHub →
            </Link>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-container">
          <LoadingSpinner message="Loading project views..." />
        </div>

        <!-- Error State -->
        <ErrorBox
          v-else-if="error"
          :error="error"
          title="Failed to load project views"
          @retry="() => { refreshProject(); refreshItems(); }"
        />

        <!-- Project Views -->
        <div v-else-if="selectedProjectId && projectDetail && items" class="project-views">
          <!-- Tabs -->
          <Tabs v-if="tabs.length > 0" v-model="activeViewId" :tabs="tabs" />

          <!-- View Renderer -->
          <ProjectViewRenderer
            v-if="currentView"
            :view="currentView"
            :items="items"
          />

          <!-- No views -->
          <EmptyState
            v-else
            icon="📋"
            title="No Views Found"
            message="This project doesn't have any views configured."
            :action-url="projectDetail.url"
            action-label="Configure on GitHub →"
            :action-external="true"
          />
        </div>

        <!-- No project selected -->
        <EmptyState
          v-else-if="!selectedProjectId"
          icon="🎯"
          title="Select a Project"
          message="Choose a project from the dropdown above to view its configured views."
        />
      </template>
    </PageLayout>
  </div>
</template>

<style scoped>
.project-views-page {
  padding: var(--spacing-6);
  min-height: 100vh;
  background: var(--color-slate-50);
}

.page-header {
  margin-bottom: var(--spacing-6);
}

.page-header h1 {
  margin-bottom: var(--spacing-2);
}

.project-selector {
  background: var(--color-white);
  padding: var(--spacing-5);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-6);
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-4);
  flex-wrap: wrap;
}

.selector-field {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.selector-label {
  display: block;
}

.selector-input {
  padding: var(--spacing-3);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  background: var(--color-white);
  cursor: pointer;
  transition: all var(--transition-base);
}

.selector-input:hover {
  border-color: var(--color-primary-500);
}

.selector-input:focus {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
  border-color: var(--color-primary-500);
}

.selector-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.project-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: var(--spacing-15);
}

.project-views {
  background: var(--color-white);
  padding: var(--spacing-5);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 768px) {
  .project-views-page {
    padding: var(--spacing-4);
  }

  .project-selector {
    flex-direction: column;
    align-items: stretch;
  }

  .selector-field {
    min-width: 100%;
  }
}
</style>
