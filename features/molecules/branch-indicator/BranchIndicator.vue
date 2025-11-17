<script setup lang="ts">
interface Props {
  /**
   * Source branch name
   */
  sourceBranch: string
  /**
   * Target/base branch name
   */
  targetBranch: string
  /**
   * Display variant
   */
  variant?: 'default' | 'compact'
  /**
   * Custom CSS classes
   */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  class: ''
})

// Compute CSS classes
const containerClasses = computed(() => {
  const classes = ['branch-indicator', `branch-indicator--${props.variant}`]

  if (props.class) {
    classes.push(props.class)
  }

  return classes.join(' ')
})
</script>

<template>
  <div :class="containerClasses">
    <span class="branch-indicator__branch branch-indicator__source">
      {{ sourceBranch }}
    </span>
    <span class="branch-indicator__arrow">→</span>
    <span class="branch-indicator__branch branch-indicator__target">
      {{ targetBranch }}
    </span>
  </div>
</template>

<style scoped>
.branch-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
}

.branch-indicator__branch {
  background: var(--color-gray-100);
  padding: var(--spacing-0-5) var(--spacing-1-5);
  border-radius: var(--radius-sm);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--color-gray-700);
  transition: background-color var(--transition-base);
}

.branch-indicator__branch:hover {
  background: var(--color-gray-200);
}

.branch-indicator__arrow {
  color: var(--color-gray-400);
  font-size: var(--font-size-sm);
}

/* Compact variant */
.branch-indicator--compact {
  gap: var(--spacing-1-5);
  font-size: var(--font-size-xs);
}

.branch-indicator--compact .branch-indicator__branch {
  padding: var(--spacing-0-25) var(--spacing-1);
  font-size: var(--font-size-xs);
  border-radius: var(--radius-sm);
}

.branch-indicator--compact .branch-indicator__arrow {
  font-size: var(--font-size-xs);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .branch-indicator {
    gap: var(--spacing-1-5);
  }

  .branch-indicator__branch {
    padding: var(--spacing-0-5) var(--spacing-1);
    font-size: var(--font-size-xs);
  }

  .branch-indicator__arrow {
    font-size: var(--font-size-xs);
  }
}
</style>
