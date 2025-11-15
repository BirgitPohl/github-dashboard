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
  gap: 8px;
  font-size: 14px;
}

.branch-indicator__branch {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  color: #374151;
  transition: background-color 0.2s ease;
}

.branch-indicator__branch:hover {
  background: #e5e7eb;
}

.branch-indicator__arrow {
  color: #9ca3af;
  font-size: 14px;
}

/* Compact variant */
.branch-indicator--compact {
  gap: 6px;
  font-size: 12px;
}

.branch-indicator--compact .branch-indicator__branch {
  padding: 1px 4px;
  font-size: 11px;
  border-radius: 3px;
}

.branch-indicator--compact .branch-indicator__arrow {
  font-size: 12px;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .branch-indicator {
    gap: 6px;
  }

  .branch-indicator__branch {
    padding: 2px 4px;
    font-size: 11px;
  }

  .branch-indicator__arrow {
    font-size: 12px;
  }
}
</style>
