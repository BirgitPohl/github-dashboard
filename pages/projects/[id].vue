<script setup lang="ts">
import { useProjectGrouping } from '../../composables/useProjectGrouping'
import { useProjectFilters } from '../../features/project-filters/useProjectFilters'
import ProjectFilters from '../../features/project-filters/ProjectFilters.vue'
import ProjectItemsTable from '../../features/project-items-table/ProjectItemsTable.vue'

definePageMeta({
  name: 'ProjectBoardDetail'
})

// Initialize composables
const { groupItems, sortItemsInGroups } = useProjectGrouping()
const { createFilterOptions, filterItems, createDefaultFilters } = useProjectFilters()

const route = useRoute()
const projectId = route.params.id as string

useHead({
  title: 'Project Board Details - GitHub Dashboard'
})

const { data: project, pending, error, refresh } = useFetch<ProjectDetails>(`/api/projects/${projectId}`, {
  server: false
})

// Selected view
const selectedView = ref<string>('')

// View items state
const viewItemsState = ref<{
  data: ViewData | null
  loading: boolean
} | null>(null)

// Watch for view changes
watch(selectedView, async (newViewId) => {
  if (!newViewId) {
    viewItemsState.value = null
    return
  }

  viewItemsState.value = { data: null, loading: true }

  try {
    const response = await $fetch<ViewData>(`/api/projects/${projectId}/views/${newViewId}`)
    viewItemsState.value = { data: response, loading: false }
  } catch (error) {
    console.error('Failed to fetch view items:', error)
    viewItemsState.value = { data: null, loading: false }
  }
})

// Reactive items based on selected view or project items
const currentItems = computed(() => {
  if (selectedView.value && viewItemsState.value?.data) {
    return viewItemsState.value.data.items
  }
  if (!project.value) return []
  return project.value.items
})

// Current view metadata
const currentView = computed(() => {
  if (selectedView.value && viewItemsState.value?.data) {
    return viewItemsState.value.data.view
  }
  return null
})

// Filters
const filters = ref(createDefaultFilters())

// Filter options using composable
const filterOptions = computed(() => createFilterOptions(currentItems.value))
const stateOptions = computed(() => filterOptions.value.stateOptions.value)
const typeOptions = computed(() => filterOptions.value.typeOptions)
const statusOptions = computed(() => filterOptions.value.statusOptions.value)
const repositoryOptions = computed(() => filterOptions.value.repositoryOptions.value)
const assigneeOptions = computed(() => filterOptions.value.assigneeOptions.value)

// Filtered items using composable
const filteredItems = computed(() => {
  return filterItems(currentItems.value, filters.value)
})

// Grouped items using composable
const groupedItems = computed(() => {
  const items = filteredItems.value
  const view = currentView.value
  const grouped = groupItems(items, view)
  return sortItemsInGroups(grouped, view)
})

// Clear filters
const clearFilters = () => {
  filters.value = createDefaultFilters()
}

// Show status column when status options are available
const showStatusColumn = computed(() => statusOptions.value.length > 1)
</script>

<template>
  <div class="project-detail-page">
    <!-- Loading State -->
    <div v-if="pending" class="loading-state">
      <LoadingSpinner message="Loading project board..." />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <ErrorBox
        :error="error"
        title="Failed to load project board"
        @retry="refresh"
      >
        <template #actions>
          <Text variant="secondary" size="base">Project ID: {{ projectId }}</Text>
          <Link to="/projects" variant="primary" size="base">← Back to Project Boards</Link>
        </template>
      </ErrorBox>
    </div>

    <!-- Content -->
    <div v-else-if="project" class="project-content">

      <!-- Header -->
      <div class="project-header">
        <div class="header-content">
          <Breadcrumbs
            :items="[
              { label: 'Project Boards', to: '/projects' },
              { label: project.title, current: true }
            ]"
          />

          <Header
            :level="1"
            size="3xl"
            variant="primary"
            class="project-title"
          >
            {{ project.title }}
          </Header>
          <Text v-if="project.shortDescription" variant="tertiary" size="base" class="project-description">
            {{ project.shortDescription }}
          </Text>

          <div class="project-meta">
            <Text variant="tertiary" size="sm">{{ project.items.length }} items</Text>
            <Link :href="project.url" variant="primary" size="sm" external>View on GitHub →</Link>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <ProjectFilters
        v-model:filters="filters"
        v-model:selected-view="selectedView"
        :views="project.views"
        :state-options="stateOptions"
        :type-options="typeOptions"
        :status-options="statusOptions"
        :repository-options="repositoryOptions"
        :assignee-options="assigneeOptions"
        :filtered-count="filteredItems.length"
        :total-count="currentItems.length"
        :is-loading="viewItemsState?.loading || false"
        @clear-filters="clearFilters"
      />

      <!-- Items Table -->
      <div class="items-section">
        <div v-if="viewItemsState?.loading" class="loading-items">
          <LoadingSpinner size="sm" message="Loading view items..." />
        </div>

        <div v-else-if="filteredItems.length === 0" class="empty-items">
          <Text variant="tertiary" size="base">No items match the current filters.</Text>
        </div>

        <div v-else class="items-table-container">
          <!-- Show groups when view has grouping, otherwise show flat table -->
          <div v-if="currentView && currentView.groupByFields && currentView.groupByFields.length > 0">
            <div v-for="group in groupedItems" :key="group.name" class="group-section">
              <div class="group-header">
                <Header
                  :level="4"
                  size="base"
                  variant="primary"
                  class="group-title"
                >
                  {{ group.name }}
                </Header>
                <Text variant="tertiary" size="sm" weight="medium">{{ group.count }} items</Text>
              </div>

              <ProjectItemsTable
                :items="group.items"
                :show-status="showStatusColumn"
              />
            </div>
          </div>

          <!-- Flat table when no grouping -->
          <ProjectItemsTable
            v-else
            :items="filteredItems"
            :show-status="showStatusColumn"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Layout structure only - typography and colors handled by atoms */
.project-detail-page {
  padding: var(--spacing-5);
  min-height: 100vh;
  background: var(--color-slate-50);
}

.loading-state, .error-state {
  text-align: center;
  padding: var(--spacing-15) var(--spacing-5);
}

.project-content {
  max-width: 1400px;
  margin: 0 auto;
}

.project-header {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
  box-shadow: var(--shadow-sm);
}

.project-title {
  margin: 0 0 var(--spacing-2) 0;
}

.project-description {
  margin: 0 0 var(--spacing-4) 0;
}

.project-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.items-section {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-sm);
}

.empty-items {
  text-align: center;
  padding: var(--spacing-10);
}

.items-table-container {
  overflow-x: auto;
}

.loading-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-15) var(--spacing-5);
}

.group-section {
  margin-bottom: var(--spacing-8);
}

.group-section:last-child {
  margin-bottom: 0;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--color-slate-100);
  border-bottom: var(--border-width-thin) solid var(--color-slate-200);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.group-title {
  margin: 0;
}

@media (max-width: 768px) {
  .project-detail-page {
    padding: var(--spacing-4);
  }

  .project-header,
  .items-section {
    padding: var(--spacing-4);
  }
}
</style>