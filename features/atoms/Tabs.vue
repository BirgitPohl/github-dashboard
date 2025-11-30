<script setup lang="ts">
export interface Tab {
  id: string
  label: string
  icon?: string
}

interface Props {
  tabs: Tab[]
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectTab = (tabId: string) => {
  emit('update:modelValue', tabId)
}
</script>

<template>
  <div class="tabs">
    <div class="tabs__list" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tabs__tab', { 'tabs__tab--active': modelValue === tab.id }]"
        role="tab"
        :aria-selected="modelValue === tab.id"
        :tabindex="modelValue === tab.id ? 0 : -1"
        @click="selectTab(tab.id)"
      >
        <Icon v-if="tab.icon" :icon="tab.icon" size="sm" decorative class="tabs__icon" />
        <Text variant="secondary" size="base" weight="medium">
          {{ tab.label }}
        </Text>
      </button>
    </div>
  </div>
</template>

<style scoped>
.tabs {
  border-bottom: 2px solid var(--color-border-default);
  margin-bottom: var(--spacing-4);
}

.tabs__list {
  display: flex;
  gap: var(--spacing-2);
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.tabs__tab {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
  flex-shrink: 0;
  position: relative;
  top: 2px; /* Align with border */
}

.tabs__tab:hover {
  background: var(--color-gray-100);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.tabs__tab:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.tabs__tab--active {
  border-bottom-color: var(--color-primary-500);
}

.tabs__tab--active :deep(span) {
  color: var(--color-primary-700);
  font-weight: 600;
}

.tabs__icon {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .tabs__tab {
    padding: var(--spacing-2) var(--spacing-3);
  }
}
</style>
