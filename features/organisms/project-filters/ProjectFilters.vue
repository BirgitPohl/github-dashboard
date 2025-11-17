<template>
  <div class="filters-section">
    <div class="filters-header">
      <h3>Filters</h3>
      <Button variant="ghost" size="sm" @click="clearFilters">Clear All</Button>
    </div>

    <div class="filters-grid">
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

      <!-- Dynamic Custom Field Filters -->
      <template v-if="customFieldOptions">
        <div
          v-for="(options, fieldName) in customFieldOptions"
          :key="fieldName"
          class="filter-group"
        >
          <template v-if="options.length > 0">
            <label :for="`${fieldName}-filter`">{{ fieldName }}</label>
            <UPopover :id="`${fieldName}-filter`" :ui="{ width: 'w-full max-w-xs' }">
              <template #default="{ open }">
                <UButton
                  color="white"
                  variant="solid"
                  :label="getMultiSelectLabel(fieldName, options)"
                  trailing-icon="i-heroicons-chevron-down-20-solid"
                  class="multi-select-trigger"
                  block
                />
              </template>

              <template #panel>
                <div class="multi-select-panel">
                  <div
                    v-for="option in options"
                    :key="option.value"
                    class="multi-select-option"
                  >
                    <UCheckbox
                      :model-value="isOptionSelected(fieldName, option.value)"
                      :label="option.label"
                      @update:model-value="toggleOption(fieldName, option.value, $event)"
                    />
                  </div>
                </div>
              </template>
            </UPopover>
          </template>
        </div>
      </template>
    </div>

    <div class="results-summary">
      <span>Showing {{ filteredCount }} of {{ totalCount }} items</span>
    </div>
  </div>
</template>

<script setup lang="ts">

interface FilterOptions {
  search: string
  state: string
  type: string
  repository: string
  [key: string]: string | string[]
}

interface SelectOption {
  value: string
  label: string
}

interface Props {
  filters: FilterOptions
  selectedGroupBy: string
  groupByOptions: SelectOption[]
  stateOptions: SelectOption[]
  typeOptions: SelectOption[]
  repositoryOptions: SelectOption[]
  customFieldOptions: Record<string, SelectOption[]>
  filteredCount: number
  totalCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:filters': [filters: FilterOptions]
  'update:selectedGroupBy': [groupField: string]
  'clear-filters': []
}>()


const updateFilter = (key: string, value: string | string[]) => {
  emit('update:filters', {
    ...props.filters,
    [key]: value
  })
}

const clearFilters = () => {
  emit('clear-filters')
}

// Multi-select helper methods
const isOptionSelected = (fieldName: string, value: string): boolean => {
  const fieldValue = props.filters[fieldName]
  if (Array.isArray(fieldValue)) {
    return fieldValue.includes(value)
  }
  return false
}

const toggleOption = (fieldName: string, value: string, checked: boolean) => {
  const currentValue = props.filters[fieldName] || []
  const valueArray = Array.isArray(currentValue) ? currentValue : []

  let newValue: string[]
  if (checked) {
    newValue = [...valueArray, value]
  } else {
    newValue = valueArray.filter(v => v !== value)
  }

  updateFilter(fieldName, newValue)
}

const getMultiSelectLabel = (fieldName: string, options: SelectOption[]): string => {
  const fieldValue = props.filters[fieldName]
  if (!fieldValue || !Array.isArray(fieldValue) || fieldValue.length === 0) {
    return `Select ${fieldName}...`
  }

  if (fieldValue.length === 1) {
    return fieldValue[0]
  }

  return `${fieldValue.length} selected`
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

.multi-select-trigger {
  justify-content: space-between;
  text-align: left;
}

.multi-select-panel {
  max-height: 250px;
  overflow-y: auto;
  padding: var(--spacing-2);
}

.multi-select-option {
  padding: var(--spacing-2);
  border-radius: var(--radius-sm);
}

.multi-select-option:hover {
  background-color: var(--color-gray-50);
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