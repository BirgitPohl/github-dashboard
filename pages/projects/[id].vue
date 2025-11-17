<script setup lang="ts">
import { useProjectGrouping } from '../../composables/useProjectGrouping'
import { useProjectFilters } from '../../features/organisms/project-filters/useProjectFilters'
import ProjectFilters from '../../features/organisms/project-filters/ProjectFilters.vue'
import ProjectItemsTable from '../../features/organisms/project-items-table/ProjectItemsTable.vue'

definePageMeta({
  name: 'ProjectBoardDetail'
})

// Initialize composables
const { groupItems, sortItemsInGroups, getAvailableGroupFields } = useProjectGrouping()
const { createFilterOptions, filterItems, createDefaultFilters } = useProjectFilters()

const route = useRoute()
const projectId = route.params.id as string

useHead({
  title: 'Project Board Details - GitHub Dashboard'
})

const { data: project, pending, error, refresh } = useFetch<ProjectDetails>(`/api/projects/${projectId}`, {
  server: false
})

// Selected grouping
const selectedGroupBy = ref<string>('')

// UI state
const isDescriptionExpanded = ref(false)

// Current items from project (no views)
const currentItems = computed(() => {
  if (!project.value) return []
  return project.value.items
})

// Filters
const filters = ref(createDefaultFilters())

// Filter options using composable
const filterOptions = computed(() => createFilterOptions(currentItems.value))
const stateOptions = computed(() => filterOptions.value.stateOptions.value)
const typeOptions = computed(() => filterOptions.value.typeOptions)
const repositoryOptions = computed(() => filterOptions.value.repositoryOptions.value)
const customFieldOptions = computed(() => filterOptions.value.customFieldOptions.value)

// Filtered items using composable
const filteredItems = computed(() => {
  return filterItems(currentItems.value, filters.value)
})

// Group By options - available grouping fields from items
const groupByOptions = computed(() => {
  const fields = getAvailableGroupFields(currentItems.value)
  return [
    { value: '', label: 'None (flat list)' },
    ...fields.map(field => ({ value: field, label: field }))
  ]
})

// Grouped items using composable with manual grouping (no views)
const groupedItems = computed(() => {
  const items = filteredItems.value
  // Use selectedGroupBy (empty string means no grouping)
  const groupField = selectedGroupBy.value || undefined
  const grouped = groupItems(items, null, groupField)
  return sortItemsInGroups(grouped, null)
})

// Clear filters
const clearFilters = () => {
  filters.value = createDefaultFilters()
}

// Show custom field columns when fields are available in items
const showStatusColumn = computed(() =>
  currentItems.value.some(item => item.custom_fields['Status'])
)
const showPriorityColumn = computed(() =>
  currentItems.value.some(item => item.custom_fields['Priority'])
)
const showSizeColumn = computed(() =>
  currentItems.value.some(item => item.custom_fields['Size'])
)
const showParentIssueColumn = computed(() =>
  currentItems.value.some(item => item.custom_fields['Parent issue'])
)
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

          <div class="title-row">
            <Header
              :level="1"
              size="3xl"
              variant="primary"
              class="project-title"
            >
              {{ project.title }}
            </Header>
            <button
              v-if="project.shortDescription"
              class="tiny-toggle"
              @click="isDescriptionExpanded = !isDescriptionExpanded"
            >
              {{ isDescriptionExpanded ? '▼' : '▶' }}
            </button>
          </div>

          <Text
            v-if="project.shortDescription && isDescriptionExpanded"
            variant="tertiary"
            size="base"
            class="project-description"
          >
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
        v-model:selected-group-by="selectedGroupBy"
        :group-by-options="groupByOptions"
        :state-options="stateOptions"
        :type-options="typeOptions"
        :repository-options="repositoryOptions"
        :custom-field-options="customFieldOptions"
        :filtered-count="filteredItems.length"
        :total-count="currentItems.length"
        @clear-filters="clearFilters"
      />

      <!-- Items Table -->
      <div class="items-section">
        <div v-if="filteredItems.length === 0" class="empty-items">
          <Text variant="tertiary" size="base">No items match the current filters.</Text>
        </div>

        <div v-else class="items-table-container">
          <!-- Show groups when grouping is selected, otherwise show flat table -->
          <div v-if="selectedGroupBy">
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
                :show-priority="showPriorityColumn"
                :show-size="showSizeColumn"
                :show-parent-issue="showParentIssueColumn"
              />
            </div>
          </div>

          <!-- Flat table when no grouping -->
          <ProjectItemsTable
            v-else
            :items="filteredItems"
            :show-status="showStatusColumn"
            :show-priority="showPriorityColumn"
            :show-size="showSizeColumn"
            :show-parent-issue="showParentIssueColumn"
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

.title-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-2);
}

.project-title {
  margin: 0;
}

.tiny-toggle {
  background: none;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-sm);
  padding: 2px 6px;
  font-size: var(--font-size-xs);
  cursor: pointer;
  color: var(--color-gray-600);
  transition: all 0.2s;
  flex-shrink: 0;
}

.tiny-toggle:hover {
  background: var(--color-gray-100);
  border-color: var(--color-gray-400);
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