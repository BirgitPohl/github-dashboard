<script setup lang="ts">
import type { ViewItem } from '../../../composables/useViewFiltering'

interface Props {
  item: ViewItem
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
</script>

<template>
  <a
    :href="item.url"
    target="_blank"
    rel="noopener noreferrer"
    class="item-card"
    :style="{ borderLeftColor: getStateColor(item) }"
  >
    <div class="item-card__header">
      <Icon :icon="getItemIcon(item)" size="sm" decorative />
    </div>

    <Text variant="primary" size="sm" weight="medium" class="item-card__title">
      {{ item.title || 'Untitled' }}
    </Text>

    <Text variant="tertiary" size="xs" class="item-card__repository">
      {{ item.repository || 'Draft' }}
    </Text>

    <!-- Labels -->
    <div v-if="item.labels && item.labels.length > 0" class="item-card__labels">
      <LabelBadge
        v-for="label in item.labels.slice(0, 3)"
        :key="label.name"
        :name="label.name"
        :color="label.color"
        size="xs"
      />
    </div>

    <!-- Assignees -->
    <div v-if="item.assignees && item.assignees.length > 0" class="item-card__assignees">
      <UserAvatar
        v-for="assignee in item.assignees.slice(0, 3)"
        :key="assignee.login"
        :src="assignee.avatarUrl"
        :alt="assignee.login"
        :tooltip="assignee.login"
        size="xs"
      />
    </div>
  </a>
</template>

<style scoped>
.item-card {
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

.item-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.item-card__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.item-card__title {
  margin: 0;
  line-height: 1.4;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.item-card__repository {
  margin: 0;
}

.item-card__labels {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}

.item-card__assignees {
  display: flex;
  gap: var(--spacing-1);
  margin-top: var(--spacing-1);
}
</style>
