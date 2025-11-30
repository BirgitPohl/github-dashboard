<script setup lang="ts">
import type { GroupedItems } from '../../../composables/useViewGrouping'
import type { ViewItem } from '../../../composables/useViewFiltering'

interface Props {
  groups: GroupedItems[]
}

defineProps<Props>()

// Get item icon based on type
const getItemIcon = (item: ViewItem): string => {
  if (item.type === 'PULL_REQUEST') return '🔀'
  if (item.type === 'ISSUE') return '📋'
  if (item.type === 'DRAFT_ISSUE') return '📝'
  return '📄'
}

// Get item state color
const getStateColor = (item: ViewItem): string => {
  const state = item.state?.toUpperCase()
  if (state === 'CLOSED' || state === 'MERGED') return 'var(--color-gray-500)'
  if (state === 'OPEN') return 'var(--color-success-500)'
  return 'var(--color-gray-400)'
}

// Map GitHub color names to CSS colors
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
    <div class="board-layout__columns">
      <div v-for="group in groups" :key="group.name" class="board-layout__column">
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
          <a
            v-for="item in group.items"
            :key="item.id"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            class="board-layout__card"
            :style="{ borderLeftColor: getStateColor(item) }"
          >
            <div class="board-layout__card-header">
              <Icon :icon="getItemIcon(item)" size="sm" decorative />
              <Text variant="tertiary" size="xs">
                {{ item.repository || 'Draft' }}
              </Text>
            </div>

            <Text variant="primary" size="sm" weight="medium" class="board-layout__card-title">
              {{ item.title || 'Untitled' }}
            </Text>

            <!-- Labels -->
            <div v-if="item.labels && item.labels.length > 0" class="board-layout__card-labels">
              <LabelBadge
                v-for="label in item.labels.slice(0, 3)"
                :key="label.name"
                :name="label.name"
                :color="label.color"
                size="xs"
              />
            </div>

            <!-- Assignees -->
            <div v-if="item.assignees && item.assignees.length > 0" class="board-layout__card-assignees">
              <UserAvatar
                v-for="assignee in item.assignees.slice(0, 3)"
                :key="assignee.login"
                :src="assignee.avatarUrl"
                :alt="assignee.login"
                :tooltip="assignee.login"
                size="xs"
              />
            </div>

            <!-- Custom Fields (simplified) -->
            <div v-if="Object.keys(item.custom_fields).length > 0" class="board-layout__card-fields">
              <div v-for="(value, key) in item.custom_fields" :key="String(key)" class="board-layout__card-field">
                <Text variant="tertiary" size="xs">{{ key }}:</Text>
                <Text variant="secondary" size="xs" weight="medium">{{ String(value) }}</Text>
              </div>
            </div>
          </a>

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

.board-layout__columns {
  display: flex;
  gap: var(--spacing-4);
  min-width: min-content;
  padding-bottom: var(--spacing-4);
}

.board-layout__column {
  flex: 0 0 320px;
  min-width: 320px;
  max-width: 320px;
  background: var(--color-slate-100);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 300px);
}

.board-layout__column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--color-border-default);
  border-left: 3px solid var(--color-gray-300);
  background: var(--color-white);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
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
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.board-layout__card {
  background: var(--color-white);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);
  border-left: 3px solid var(--color-gray-300);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  cursor: pointer;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.board-layout__card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.board-layout__card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.board-layout__card-title {
  margin: 0;
  line-height: 1.4;
}

.board-layout__card-labels {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}

.board-layout__card-assignees {
  display: flex;
  gap: var(--spacing-1);
  margin-top: var(--spacing-1);
}

.board-layout__card-fields {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  margin-top: var(--spacing-1);
  padding-top: var(--spacing-2);
  border-top: 1px solid var(--color-border-default);
}

.board-layout__card-field {
  display: flex;
  gap: var(--spacing-2);
  align-items: baseline;
}

.board-layout__empty {
  text-align: center;
  padding: var(--spacing-8) var(--spacing-4);
}

@media (max-width: 768px) {
  .board-layout__column {
    flex: 0 0 280px;
    min-width: 280px;
    max-width: 280px;
  }
}
</style>
