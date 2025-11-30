<script setup lang="ts">
import type { ViewItem } from '../../../composables/useViewFiltering'
import { useViewFiltering } from '../../../composables/useViewFiltering'
import { useViewGrouping } from '../../../composables/useViewGrouping'
import { useViewSorting } from '../../../composables/useViewSorting'
import type { ProjectV2View } from '../../../server/utils/github-graphql'

interface Props {
  view: ProjectV2View
  items: ViewItem[]
}

const props = defineProps<Props>()

const { filterItems } = useViewFiltering()
const { groupItems } = useViewGrouping()
const { sortItemsMultiple } = useViewSorting()

// Apply view configuration to items
const processedItems = computed(() => {
  let result = props.items

  // 1. Apply filters
  if (props.view.filter) {
    result = filterItems(result, props.view.filter)
  }

  // 2. Apply sorting
  if (props.view.sortByFields.nodes.length > 0) {
    const sortConfigs = props.view.sortByFields.nodes.map(sort => ({
      field: sort.field.name,
      direction: sort.direction
    }))
    result = sortItemsMultiple(result, sortConfigs)
  }

  return result
})

// Group items (after filtering and sorting)
const groupedItems = computed(() => {
  // Board layouts use verticalGroupByFields, other layouts use groupByFields
  const groupByField = props.view.layout === 'BOARD_LAYOUT'
    ? props.view.verticalGroupByFields.nodes[0]?.name
    : props.view.groupByFields.nodes[0]?.name

  return groupItems(processedItems.value, groupByField)
})

// Extract visible fields from view
const visibleFields = computed(() => {
  return props.view.fields.nodes.map(f => f.name)
})
</script>

<template>
  <div class="project-view-renderer">
    <!-- View Info -->
    <div class="view-info">
      <div class="view-info__header">
        <Header :level="3" size="lg" variant="primary">
          {{ view.name }}
        </Header>
        <span class="view-info__badge">
          {{ view.layout.replace('_LAYOUT', '').toLowerCase() }}
        </span>
      </div>

      <div class="view-info__stats">
        <Text variant="tertiary" size="sm">
          {{ processedItems.length }} {{ processedItems.length === 1 ? 'item' : 'items' }}
        </Text>
        <Text v-if="view.filter" variant="tertiary" size="sm">•</Text>
        <Text v-if="view.filter" variant="tertiary" size="sm" class="view-info__filter">
          Filter: {{ view.filter }}
        </Text>
      </div>
    </div>

    <!-- Layout-specific rendering -->
    <div class="view-content">
      <!-- Table Layout -->
      <TableLayout
        v-if="view.layout === 'TABLE_LAYOUT'"
        :groups="groupedItems"
        :visible-fields="visibleFields"
      />

      <!-- Board Layout -->
      <BoardLayout
        v-else-if="view.layout === 'BOARD_LAYOUT'"
        :groups="groupedItems"
      />

      <!-- Roadmap Layout -->
      <RoadmapLayout
        v-else-if="view.layout === 'ROADMAP_LAYOUT'"
        :groups="groupedItems"
      />

      <!-- Fallback -->
      <div v-else class="view-content__unsupported">
        <Text variant="secondary" size="base">
          Layout type "{{ view.layout }}" is not yet supported.
        </Text>
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-view-renderer {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.view-info {
  background: var(--color-white);
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.view-info__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-2);
}

.view-info__badge {
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: capitalize;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  background: var(--color-primary-100);
  color: var(--color-primary-700);
}

.view-info__stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.view-info__filter {
  font-family: monospace;
  background: var(--color-gray-100);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.view-content {
  min-height: 200px;
}

.view-content__unsupported {
  padding: var(--spacing-10);
  text-align: center;
  background: var(--color-gray-50);
  border-radius: var(--radius-md);
}
</style>
