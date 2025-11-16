<script setup lang="ts">
interface Props {
  /**
   * Size variant for the spinner
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Optional message to display below the spinner
   */
  message?: string
  /**
   * Color variant
   */
  variant?: 'primary' | 'secondary'
  /**
   * Custom CSS classes
   */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  message: '',
  variant: 'primary',
  class: ''
})

// Compute CSS classes
const containerClasses = computed(() => {
  const classes = ['loading-spinner-container']

  if (props.class) {
    classes.push(props.class)
  }

  return classes.join(' ')
})

const spinnerClasses = computed(() => {
  return [
    'loading-spinner',
    `loading-spinner--${props.size}`,
    `loading-spinner--${props.variant}`
  ].join(' ')
})
</script>

<template>
  <div :class="containerClasses">
    <div :class="spinnerClasses" />
    <span v-if="message" class="loading-message">{{ message }}</span>
  </div>
</template>

<style scoped>
.loading-spinner-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-3);
}

.loading-spinner {
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

/* Size variants */
.loading-spinner--sm {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-gray-200);
  border-top: 2px solid transparent;
}

.loading-spinner--md {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-gray-200);
  border-top: 3px solid transparent;
}

.loading-spinner--lg {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-gray-200);
  border-top: 4px solid transparent;
}

/* Color variants */
.loading-spinner--primary.loading-spinner--sm {
  border-top-color: var(--color-gray-900);
}

.loading-spinner--primary.loading-spinner--md,
.loading-spinner--primary.loading-spinner--lg {
  border-top-color: var(--color-blue-500);
}

.loading-spinner--secondary {
  border-top-color: var(--color-gray-500);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-message {
  color: var(--color-gray-500);
  font-size: var(--font-size-sm);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .loading-spinner-container {
    gap: var(--spacing-2);
  }

  .loading-message {
    font-size: var(--font-size-sm);
  }
}
</style>
