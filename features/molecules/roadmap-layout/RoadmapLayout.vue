<script setup lang="ts">
import type { GroupedItems } from '../../../composables/useViewGrouping'

interface Props {
  groups: GroupedItems[]
}

defineProps<Props>()

// Get iteration/milestone info from item
const getTimelineInfo = (item: any): string => {
  // Check for iteration field
  for (const [key, value] of Object.entries(item.custom_fields)) {
    if (typeof value === 'object' && value !== null && 'title' in value) {
      return (value as { title: string }).title
    }
  }

  // Fallback to dates
  if (item.created_at) {
    const date = new Date(item.created_at)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return 'No Date'
}
</script>

<template>
  <div class="roadmap-layout">
    <div class="roadmap-layout__info">
      <Icon icon="📅" size="base" decorative />
      <Text variant="tertiary" size="sm">
        Roadmap view shows items grouped by iteration or milestone. Drag functionality coming soon.
      </Text>
    </div>

    <div class="roadmap-layout__timeline">
      <div v-for="group in groups" :key="group.name" class="roadmap-layout__group">
        <div class="roadmap-layout__group-header">
          <Header :level="4" size="base" variant="primary">
            {{ group.name }}
          </Header>
          <Text variant="tertiary" size="sm">
            {{ group.count }} {{ group.count === 1 ? 'item' : 'items' }}
          </Text>
        </div>

        <div class="roadmap-layout__items">
          <a
            v-for="item in group.items"
            :key="item.id"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            class="roadmap-layout__item"
          >
            <div class="roadmap-layout__item-marker">
              <Icon :icon="item.type === 'PULL_REQUEST' ? '🔀' : '📋'" size="sm" decorative />
            </div>

            <div class="roadmap-layout__item-content">
              <Text variant="primary" size="sm" weight="medium">
                {{ item.title || 'Untitled' }}
              </Text>
              <div class="roadmap-layout__item-meta">
                <Text variant="tertiary" size="xs">
                  {{ item.repository || 'Draft' }}
                </Text>
                <Text variant="tertiary" size="xs">•</Text>
                <Text variant="tertiary" size="xs">
                  {{ getTimelineInfo(item) }}
                </Text>
              </div>

              <!-- Labels -->
              <div v-if="item.labels && item.labels.length > 0" class="roadmap-layout__item-labels">
                <LabelBadge
                  v-for="label in item.labels.slice(0, 5)"
                  :key="label.name"
                  :name="label.name"
                  :color="label.color"
                  size="xs"
                />
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.roadmap-layout {
  width: 100%;
}

.roadmap-layout__info {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--color-info-100);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-4);
  border-left: 3px solid var(--color-info-500);
}

.roadmap-layout__timeline {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.roadmap-layout__group {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  box-shadow: var(--shadow-sm);
}

.roadmap-layout__group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 2px solid var(--color-border-default);
}

.roadmap-layout__items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  position: relative;
}

/* Timeline line */
.roadmap-layout__items::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-border-default);
}

.roadmap-layout__item {
  display: flex;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all var(--transition-base);
  position: relative;
}

.roadmap-layout__item:hover {
  background: var(--color-gray-50);
}

.roadmap-layout__item-marker {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background: var(--color-white);
  border: 2px solid var(--color-primary-500);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.roadmap-layout__item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.roadmap-layout__item-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.roadmap-layout__item-labels {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
  margin-top: var(--spacing-1);
}

@media (max-width: 768px) {
  .roadmap-layout__group {
    padding: var(--spacing-3);
  }

  .roadmap-layout__item {
    padding: var(--spacing-2);
  }
}
</style>
