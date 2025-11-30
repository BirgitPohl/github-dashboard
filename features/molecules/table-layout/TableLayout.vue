<script setup lang="ts">
import type { GroupedItems } from '../../../composables/useViewGrouping'

interface Props {
  groups: GroupedItems[]
  visibleFields?: string[]
}

defineProps<Props>()

// For now, show all custom field columns
// In future, can filter based on visibleFields prop
const showStatus = ref(true)
const showPriority = ref(true)
const showSize = ref(true)
const showParentIssue = ref(true)
const showSubIssues = ref(true)
</script>

<template>
  <div class="table-layout">
    <div v-if="groups.length === 1" class="table-layout__single">
      <!-- Single group (no grouping) - just show table -->
      <ProjectItemsTable
        :items="groups[0].items"
        :show-status="showStatus"
        :show-priority="showPriority"
        :show-size="showSize"
        :show-parent-issue="showParentIssue"
        :show-sub-issues-progress="showSubIssues"
      />
    </div>

    <div v-else class="table-layout__grouped">
      <!-- Multiple groups - show each group with header -->
      <div v-for="group in groups" :key="group.name" class="table-layout__group">
        <div class="table-layout__group-header">
          <Header :level="4" size="base" variant="primary" class="table-layout__group-title">
            {{ group.name }}
          </Header>
          <Text variant="tertiary" size="sm" weight="medium">
            {{ group.count }} {{ group.count === 1 ? 'item' : 'items' }}
          </Text>
        </div>

        <ProjectItemsTable
          :items="group.items"
          :show-status="showStatus"
          :show-priority="showPriority"
          :show-size="showSize"
          :show-parent-issue="showParentIssue"
          :show-sub-issues-progress="showSubIssues"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-layout {
  width: 100%;
}

.table-layout__grouped {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.table-layout__group {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.table-layout__group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--color-slate-100);
  border-bottom: 1px solid var(--color-border-default);
}

.table-layout__group-title {
  margin: 0;
}
</style>
