<template>
  <div class="filters-section">
    <div class="filters-header">
      <h3>Filters</h3>
      <Button variant="ghost" size="sm" @click="clearFilters">Clear All</Button>
    </div>

    <div class="filters-grid">
      <!-- View Selector -->
      <div v-if="views && views.length > 0" class="filter-group">
        <label for="view-filter">View</label>
        <Select
          id="view-filter"
          :model-value="selectedView"
          :options="[
            { value: '', label: 'All items' },
            ...views.map(v => ({ value: v.id, label: `${v.name} (${v.layout.replace('_LAYOUT', '').toLowerCase()})` }))
          ]"
          @update:model-value="$emit('update:selectedView', $event)"
        />
      </div>

      <!-- Group By Selector -->
      <div class="filter-group">
        <label for="group-by-filter">Group By</label>
        <Select
          id="group-by-filter"
          :model-value="selectedGroupBy"
          :options="groupByOptions"
          @update:model-value="$emit('update:selectedGroupBy', $event)"
        />
      </div>

      <!-- Search -->
      <div class="filter-group">
        <label for="search-filter">Search</label>
        <Input
          id="search-filter"
          :model-value="filters.search"
          type="search"
          placeholder="Search items..."
          @update:model-value="updateFilter('search', $event)"
        />
      </div>

      <!-- State -->
      <div class="filter-group">
        <label for="state-filter">State</label>
        <Select
          id="state-filter"
          :model-value="filters.state"
          :options="stateOptions"
          @update:model-value="updateFilter('state', $event)"
        />
      </div>

      <!-- Type -->
      <div class="filter-group">
        <label for="type-filter">Type</label>
        <Select
          id="type-filter"
          :model-value="filters.type"
          :options="typeOptions"
          @update:model-value="updateFilter('type', $event)"
        />
      </div>

      <!-- Status -->
      <div v-if="statusOptions.length > 1" class="filter-group">
        <label for="status-filter">Status</label>
        <Select
          id="status-filter"
          :model-value="filters.status"
          :options="statusOptions"
          @update:model-value="updateFilter('status', $event)"
        />
      </div>

      <!-- Repository -->
      <div v-if="repositoryOptions.length > 1" class="filter-group">
        <label for="repository-filter">Repository</label>
        <Select
          id="repository-filter"
          :model-value="filters.repository"
          :options="repositoryOptions"
          @update:model-value="updateFilter('repository', $event)"
        />
      </div>

      <!-- Assignee -->
      <div v-if="assigneeOptions.length > 1" class="filter-group">
        <label for="assignee-filter">Assignee</label>
        <Select
          id="assignee-filter"
          :model-value="filters.assignee"
          :options="assigneeOptions"
          @update:model-value="updateFilter('assignee', $event)"
        />
      </div>
    </div>

    <div class="results-summary">
      <span v-if="isLoading" class="loading-text">Loading view items...</span>
      <span v-else>Showing {{ filteredCount }} of {{ totalCount }} items</span>
      <span v-if="selectedView" class="view-indicator">
        ({{ currentViewName || 'Custom view' }})
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
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

interface FilterOptions {
  search: string
  state: string
  type: string
  status: string
  assignee: string
  repository: string
}

interface SelectOption {
  value: string
  label: string
}

interface Props {
  filters: FilterOptions
  selectedView: string
  selectedGroupBy: string
  views?: ProjectView[]
  groupByOptions: SelectOption[]
  stateOptions: SelectOption[]
  typeOptions: SelectOption[]
  statusOptions: SelectOption[]
  repositoryOptions: SelectOption[]
  assigneeOptions: SelectOption[]
  filteredCount: number
  totalCount: number
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
})

const emit = defineEmits<{
  'update:filters': [filters: FilterOptions]
  'update:selectedView': [viewId: string]
  'update:selectedGroupBy': [groupField: string]
  'clear-filters': []
}>()

const currentViewName = computed(() => {
  if (!props.selectedView || !props.views) return null
  return props.views.find(v => v.id === props.selectedView)?.name
})

const updateFilter = (key: keyof FilterOptions, value: string) => {
  emit('update:filters', {
    ...props.filters,
    [key]: value
  })
}

const clearFilters = () => {
  emit('clear-filters')
}
</script>

<style scoped>
.filters-section {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
  box-shadow: var(--shadow-sm);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.filters-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-900);
  margin: 0;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.filter-group label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
}

.results-summary {
  color: var(--color-gray-500);
  font-size: var(--font-size-sm);
  text-align: center;
  padding-top: var(--spacing-4);
  border-top: var(--border-width-thin) solid var(--color-gray-100);
}

.loading-text {
  color: var(--color-gray-500);
  font-style: italic;
}

.view-indicator {
  color: var(--color-gray-500);
  font-style: italic;
  margin-left: var(--spacing-2);
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .filters-section {
    padding: var(--spacing-4);
  }
}
</style>