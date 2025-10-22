<template>
  <div class="filters-section">
    <div class="filters-header">
      <h3>Filters</h3>
      <button class="clear-filters-btn" @click="clearFilters">Clear All</button>
    </div>

    <div class="filters-grid">
      <!-- View Selector -->
      <div v-if="views && views.length > 0" class="filter-group">
        <label for="view-filter">View</label>
        <select id="view-filter" :value="selectedView" @change="$emit('update:selectedView', ($event.target as HTMLSelectElement).value)" class="filter-select">
          <option value="">All items</option>
          <option v-for="view in views" :key="view.id" :value="view.id">
            {{ view.name }} ({{ view.layout.replace('_LAYOUT', '').toLowerCase() }})
          </option>
        </select>
      </div>

      <!-- Search -->
      <div class="filter-group">
        <label for="search-filter">Search</label>
        <input
          id="search-filter"
          :value="filters.search"
          @input="updateFilter('search', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Search items..."
          class="filter-input"
        >
      </div>

      <!-- State -->
      <div class="filter-group">
        <label for="state-filter">State</label>
        <select
          id="state-filter"
          :value="filters.state"
          @change="updateFilter('state', ($event.target as HTMLSelectElement).value)"
          class="filter-select"
        >
          <option v-for="option in stateOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Type -->
      <div class="filter-group">
        <label for="type-filter">Type</label>
        <select
          id="type-filter"
          :value="filters.type"
          @change="updateFilter('type', ($event.target as HTMLSelectElement).value)"
          class="filter-select"
        >
          <option v-for="option in typeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Status -->
      <div v-if="statusOptions.length > 1" class="filter-group">
        <label for="status-filter">Status</label>
        <select
          id="status-filter"
          :value="filters.status"
          @change="updateFilter('status', ($event.target as HTMLSelectElement).value)"
          class="filter-select"
        >
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Repository -->
      <div v-if="repositoryOptions.length > 1" class="filter-group">
        <label for="repository-filter">Repository</label>
        <select
          id="repository-filter"
          :value="filters.repository"
          @change="updateFilter('repository', ($event.target as HTMLSelectElement).value)"
          class="filter-select"
        >
          <option v-for="option in repositoryOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Assignee -->
      <div v-if="assigneeOptions.length > 1" class="filter-group">
        <label for="assignee-filter">Assignee</label>
        <select
          id="assignee-filter"
          :value="filters.assignee"
          @change="updateFilter('assignee', ($event.target as HTMLSelectElement).value)"
          class="filter-select"
        >
          <option v-for="option in assigneeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
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
  views?: ProjectView[]
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
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filters-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.clear-filters-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-filters-btn:hover {
  background: #e5e7eb;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.filter-input, .filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.filter-input:focus, .filter-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.results-summary {
  color: #6b7280;
  font-size: 14px;
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.loading-text {
  color: #6b7280;
  font-style: italic;
}

.view-indicator {
  color: #6b7280;
  font-style: italic;
  margin-left: 8px;
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .filters-section {
    padding: 16px;
  }
}
</style>