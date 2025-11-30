<script setup lang="ts">
interface Props {
  title: string
  count: number
  isCollapsed: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <div
    class="swimlane-header"
    :class="{ 'swimlane-header--collapsed': isCollapsed }"
    @click="emit('toggle')"
  >
    <div class="swimlane-header__content">
      <span class="swimlane-header__toggle">
        {{ isCollapsed ? '▶' : '▼' }}
      </span>
      <Header :level="3" size="md" variant="primary">
        {{ title }}
      </Header>
    </div>
    <span class="swimlane-header__count">
      {{ count }}
    </span>
  </div>
</template>

<style scoped>
.swimlane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4);
  background: var(--color-white);
  border-bottom: 2px solid var(--color-border-default);
  cursor: pointer;
  transition: background-color var(--transition-base);
  user-select: none;
}

.swimlane-header:hover {
  background: var(--color-gray-50);
}

.swimlane-header--collapsed {
  background: var(--color-gray-50);
}

.swimlane-header__content {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex: 1;
}

.swimlane-header__toggle {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  flex-shrink: 0;
  width: 20px;
  display: inline-block;
  transition: transform var(--transition-base);
}

.swimlane-header__count {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  background: var(--color-gray-200);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-weight: 600;
}
</style>
