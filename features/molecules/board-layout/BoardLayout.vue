<script setup lang="ts">
import { computed, ref } from 'vue'
import SwimlaneHeader from '../../atoms/swimlane-header/SwimlaneHeader.vue'
import KanbanColumn from '../../atoms/kanban-column/KanbanColumn.vue'
import ItemCard from '../../atoms/item-card/ItemCard.vue'
import type { GroupedItems } from '../../../composables/useViewGrouping'

interface Props {
  groups: GroupedItems[]
}

const props = defineProps<Props>()

// Track which swimlanes are collapsed (by swimlane name)
const collapsedSwimlanes = ref<Set<string>>(new Set())

// Toggle swimlane collapsed state
const toggleSwimlane = (swimlaneName: string) => {
  if (collapsedSwimlanes.value.has(swimlaneName)) {
    collapsedSwimlanes.value.delete(swimlaneName)
  } else {
    collapsedSwimlanes.value.add(swimlaneName)
  }
  // Trigger reactivity
  collapsedSwimlanes.value = new Set(collapsedSwimlanes.value)
}

// Check if swimlane is collapsed
const isSwimlaneCollapsed = (swimlaneName: string) => {
  return collapsedSwimlanes.value.has(swimlaneName)
}

// Compute all unique swimlanes across all columns
const allSwimlanes = computed(() => {
  if (props.groups.length === 0 || !props.groups[0].subgroups) {
    return []
  }

  // Collect all unique swimlane names from all columns
  const swimlaneMap = new Map<string, GroupedItems>()

  for (const column of props.groups) {
    if (!column.subgroups) continue

    for (const swimlane of column.subgroups) {
      if (!swimlaneMap.has(swimlane.name)) {
        swimlaneMap.set(swimlane.name, swimlane)
      }
    }
  }

  // Sort swimlanes - numeric prefixes first (01, 02, etc), then alphabetically
  return Array.from(swimlaneMap.values()).sort((a, b) => {
    // Extract leading numbers if they exist
    const aMatch = a.name.match(/^(\d+)/)
    const bMatch = b.name.match(/^(\d+)/)

    // Both have numeric prefixes
    if (aMatch && bMatch) {
      const aNum = parseInt(aMatch[1])
      const bNum = parseInt(bMatch[1])
      if (aNum !== bNum) {
        return aNum - bNum
      }
      // If numbers are equal, fall through to string comparison
    }

    // Only a has numeric prefix - a comes first
    if (aMatch && !bMatch) return -1

    // Only b has numeric prefix - b comes first
    if (!aMatch && bMatch) return 1

    // Neither has numeric prefix, or numbers were equal - alphabetical sort
    return a.name.localeCompare(b.name)
  })
})

// Map GitHub color names to CSS colors (for non-swimlane layout)
const mapGitHubColor = (color: string | undefined): string => {
  if (!color) return 'var(--color-gray-500)'

  const colorMap: Record<string, string> = {
    GRAY: '#6e7781',
    BLUE: '#0969da',
    GREEN: '#1a7f37',
    YELLOW: '#d29922',
    ORANGE: '#bc4c00',
    RED: '#cf222e',
    PINK: '#bf3989',
    PURPLE: '#8250df'
  }

  return colorMap[color.toUpperCase()] || 'var(--color-gray-500)'
}
</script>

<template>
  <div class="board-layout">
    <!-- Swimlane layout (columns with subgroups) -->
    <template v-if="allSwimlanes.length > 0">
      <div class="board-layout__swimlanes">
        <!-- Iterate through all unique swimlanes -->
        <div
          v-for="swimlane in allSwimlanes"
          :key="swimlane.name"
          class="board-layout__swimlane"
        >
          <!-- Full-width parent header -->
          <SwimlaneHeader
            :title="swimlane.name"
            :count="swimlane.count"
            :is-collapsed="isSwimlaneCollapsed(swimlane.name)"
            @toggle="toggleSwimlane(swimlane.name)"
          />

          <!-- Kanban columns for this swimlane -->
          <div
            v-if="!isSwimlaneCollapsed(swimlane.name)"
            class="board-layout__columns"
          >
            <KanbanColumn
              v-for="column in groups"
              :key="column.name"
              :title="column.name"
              :count="column.subgroups?.find(s => s.name === swimlane.name)?.count || 0"
              :color="column.color"
            >
              <ItemCard
                v-for="item in column.subgroups?.find(s => s.name === swimlane.name)?.items || []"
                :key="item.id"
                :item="item"
              />
            </KanbanColumn>
          </div>
        </div>
      </div>
    </template>

    <!-- Regular column layout (no swimlanes) -->
    <div v-else class="board-layout__columns board-layout__columns--no-swimlanes">
      <div v-for="group in groups" :key="group.name" class="board-layout__column-standalone">
        <!-- Column Header -->
        <div
          class="board-layout__column-header"
          :style="{ borderLeftColor: mapGitHubColor(group.color) }"
        >
          <div class="board-layout__column-title-wrapper">
            <span
              class="board-layout__column-indicator"
              :style="{ backgroundColor: mapGitHubColor(group.color) }"
            />
            <Header :level="4" size="sm" variant="primary" class="board-layout__column-title">
              {{ group.name }}
            </Header>
          </div>
          <span class="board-layout__column-count">
            {{ group.count }}
          </span>
        </div>

        <!-- Column Items -->
        <div class="board-layout__column-items">
          <ItemCard
            v-for="item in group.items"
            :key="item.id"
            :item="item"
          />

          <!-- Empty state -->
          <div v-if="group.items.length === 0" class="board-layout__empty">
            <Text variant="tertiary" size="sm">No items</Text>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board-layout {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

/* Swimlane layout */
.board-layout__swimlanes {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.board-layout__swimlane {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  background: var(--color-white);
  overflow: hidden;
}

.board-layout__columns {
  display: flex;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(--color-gray-300) transparent;
}

.board-layout__columns::-webkit-scrollbar {
  height: 8px;
}

.board-layout__columns::-webkit-scrollbar-track {
  background: transparent;
}

.board-layout__columns::-webkit-scrollbar-thumb {
  background: var(--color-gray-300);
  border-radius: var(--radius-full);
}

.board-layout__columns::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-400);
}

.board-layout__columns--no-swimlanes {
  gap: var(--spacing-4);
  padding: 0;
  padding-bottom: var(--spacing-4);
}

/* Standalone columns (no swimlanes) */
.board-layout__column-standalone {
  flex: 0 0 320px;
  min-width: 320px;
  max-width: 320px;
  background: var(--color-slate-100);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
}

.board-layout__column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--color-border-default);
  background: var(--color-white);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  border-left: 3px solid var(--color-gray-300);
}

.board-layout__column-title-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.board-layout__column-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-gray-400);
}

.board-layout__column-title {
  margin: 0;
}

.board-layout__column-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  background: var(--color-gray-200);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-weight: 600;
}

.board-layout__column-items {
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  min-height: 100px;
}

.board-layout__empty {
  text-align: center;
  padding: var(--spacing-8) var(--spacing-4);
}

@media (max-width: 768px) {
  .board-layout__column-standalone {
    flex: 0 0 280px;
    min-width: 280px;
    max-width: 280px;
  }
}
</style>
