<script setup lang="ts">
import { useProjectGrouping } from '../../composables/useProjectGrouping'
import { useProjectFilters } from '../../composables/useProjectFilters'
import ProjectFilters from '../../components/ProjectFilters.vue'
import ProjectItemsTable from '../../components/ProjectItemsTable.vue'

definePageMeta({
  name: 'ProjectBoardDetail'
})

interface ProjectItem {
  id: string
  type: 'ISSUE' | 'PULL_REQUEST' | 'DRAFT_ISSUE'
  number?: number
  title: string
  url: string
  state: string
  repository: string
  repository_owner: string
  assignees: Array<{
    login: string
    avatarUrl: string
  }>
  labels: Array<{
    name: string
    color: string
  }>
  created_at: string
  updated_at: string
  status?: string
  priority?: string
  custom_fields: Record<string, string>
}

interface ProjectView {
  id: string
  name: string
  number: number
  layout: 'TABLE_LAYOUT' | 'BOARD_LAYOUT' | 'ROADMAP_LAYOUT'
  filter?: string
  groupByFields?: string[]
  sortByFields?: Array<{
    fieldName: string
    direction: 'ASC' | 'DESC'
  }>
  createdAt: string
  updatedAt: string
}

interface ProjectDetails {
  id: string
  title: string
  shortDescription: string | null
  url: string
  views: ProjectView[]
  items: ProjectItem[]
  fields: Array<{
    name: string
    dataType: string
  }>
}

interface ViewData {
  view: {
    id: string
    name: string
    layout: string
    groupByFields?: string[]
    sortByFields?: Array<{
      fieldName: string
      direction: 'ASC' | 'DESC'
    }>
    filter?: string
  }
  items: ProjectItem[]
}

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
      <ErrorBoxErrorBox 
        :error="error"
        title="Failed to load project board"
        @retry="refresh"
      >
        <template #actions>
          <p>Project ID: {{ projectId }}</p>
          <NuxtLink to="/projects" class="back-link">← Back to Project Boards</NuxtLink>
        </template>
      </ErrorBoxErrorBox>
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

          <TypographyHeader 
            :level="1" 
            size="3xl" 
            variant="primary"
            class="project-title"
          >
            {{ project.title }}
          </TypographyHeader>
          <p v-if="project.shortDescription" class="project-description">{{ project.shortDescription }}</p>

          <div class="project-meta">
            <span class="meta-item">{{ project.items.length }} items</span>
            <a :href="project.url" target="_blank" class="meta-link">View on GitHub →</a>
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
          <p>No items match the current filters.</p>
        </div>

        <div v-else class="items-table-container">
          <!-- Show groups when view has grouping, otherwise show flat table -->
          <div v-if="currentView && currentView.groupByFields && currentView.groupByFields.length > 0">
            <div v-for="group in groupedItems" :key="group.name" class="group-section">
              <div class="group-header">
                <TypographyHeader 
                  :level="4" 
                  size="md" 
                  variant="primary"
                  class="group-title"
                >
                  {{ group.name }}
                </TypographyHeader>
                <span class="group-count">{{ group.count }} items</span>
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
.project-detail-page {
  padding: 20px;
  min-height: 100vh;
  background: #f8fafc;
}

.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
}



.back-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}

.project-content {
  max-width: 1400px;
  margin: 0 auto;
}

.project-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.project-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.project-description {
  color: #6b7280;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.project-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.meta-item {
  color: #6b7280;
  font-size: 14px;
}

.meta-link {
  color: #2563eb;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.meta-link:hover {
  text-decoration: underline;
}

.items-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-items {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.items-table-container {
  overflow-x: auto;
}

.loading-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6b7280;
}

.group-section {
  margin-bottom: 32px;
}

.group-section:last-child {
  margin-bottom: 0;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  border-radius: 8px 8px 0 0;
}

.group-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.group-count {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

@media (max-width: 768px) {
  .project-detail-page {
    padding: 16px;
  }

  .project-header,
  .items-section {
    padding: 16px;
  }
}
</style>