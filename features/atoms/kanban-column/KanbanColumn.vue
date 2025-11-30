<script setup lang="ts">
interface Props {
  title: string
  count: number
  color?: string
}

defineProps<Props>()

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
  <div class="kanban-column">
    <div
      class="kanban-column__header"
      :style="{ borderLeftColor: mapGitHubColor(color) }"
    >
      <div class="kanban-column__title-wrapper">
        <span
          class="kanban-column__indicator"
          :style="{ backgroundColor: mapGitHubColor(color) }"
        />
        <Header :level="5" size="xs" variant="primary">
          {{ title }}
        </Header>
      </div>
      <span class="kanban-column__count">
        {{ count }}
      </span>
    </div>

    <div class="kanban-column__items">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.kanban-column {
  flex: 0 0 280px;
  min-width: 280px;
  max-width: 280px;
  display: flex;
  flex-direction: column;
}

.kanban-column__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-2);
  border-left: 3px solid var(--color-gray-300);
  background: var(--color-gray-50);
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-2);
}

.kanban-column__title-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.kanban-column__indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-gray-400);
}

.kanban-column__count {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  background: var(--color-gray-200);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-weight: 600;
}

.kanban-column__items {
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  min-height: 100px;
}
</style>
