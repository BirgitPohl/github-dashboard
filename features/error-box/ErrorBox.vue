<script setup lang="ts">
import { useErrorBox } from './useErrorBox'

type ErrorInput = Error | string | { 
  message?: string
  data?: { message?: string }
  statusCode?: number
  status?: number
  code?: string | number
}

interface Props {
  /**
   * The error to display - can be Error object, string, or API error
   */
  error: unknown
  /**
   * Optional title override
   */
  title?: string
  /**
   * Show retry button
   */
  showRetry?: boolean
  /**
   * Show details section (for development/debugging)
   */
  showDetails?: boolean
  /**
   * Visual variant
   */
  variant?: 'error' | 'warning' | 'info'
  /**
   * Custom CSS classes
   */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showRetry: true,
  showDetails: false,
  variant: undefined,
  class: ''
})

const emit = defineEmits<{
  retry: []
}>()

const { parseError, getErrorVariant, isRetryableError, getErrorActions } = useErrorBox()

// Parse the error
const parsedError = computed(() => parseError(props.error as ErrorInput))

// Determine variant
const errorVariant = computed(() => {
  if (props.variant) return props.variant
  return getErrorVariant(parsedError.value.code)
})

// Check if error is retryable
const canRetry = computed(() => {
  if (!props.showRetry) return false
  return isRetryableError(parsedError.value.code)
})

// Get suggested actions
const suggestedActions = computed(() => getErrorActions(parsedError.value.code))

// Handle retry
const handleRetry = () => {
  emit('retry')
}

// Compute CSS classes
const errorClasses = computed(() => {
  const classes = ['error-box', `error-box--${errorVariant.value}`]
  
  if (props.class) {
    classes.push(props.class)
  }
  
  return classes.join(' ')
})
</script>

<template>
  <div :class="errorClasses">
    <div class="error-content">
      <div class="error-header">
        <h3 class="error-title">
          {{ title || parsedError.title }}
        </h3>
        <span v-if="parsedError.code" class="error-code">
          {{ parsedError.code }}
        </span>
      </div>

      <p class="error-message">
        {{ parsedError.message }}
      </p>

      <div v-if="suggestedActions.length > 0" class="error-actions">
        <p class="actions-title">What you can try:</p>
        <ul class="actions-list">
          <li v-for="action in suggestedActions" :key="action">
            {{ action }}
          </li>
        </ul>
      </div>

      <div class="error-buttons">
        <button 
          v-if="canRetry" 
          type="button" 
          class="retry-button"
          @click="handleRetry"
        >
          Try Again
        </button>
        
        <slot name="actions" :parsed-error="parsedError" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-box {
  padding: var(--spacing-6);
  border-radius: var(--radius-xl);
  border: 1px solid;
  background-color: var(--color-bg-primary);
  max-width: 600px;
}

/* Error variant */
.error-box--error {
  border-color: var(--color-red-50);
  background-color: var(--color-error-50);
}

.error-box--error .error-title {
  color: var(--color-error-600);
}

/* Warning variant */
.error-box--warning {
  border-color: var(--color-orange-100);
  background-color: var(--color-orange-50);
}

.error-box--warning .error-title {
  color: var(--color-orange-500);
}

/* Info variant */
.error-box--info {
  border-color: var(--color-blue-50);
  background-color: var(--color-primary-50);
}

.error-box--info .error-title {
  color: var(--color-primary-600);
}

.error-content {
  width: 100%;
}

.error-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
}

.error-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.error-code {
  padding: var(--spacing-1) var(--spacing-2);
  background-color: var(--color-bg-overlay-dark);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-family: var(--font-family-mono);
  font-weight: var(--font-weight-medium);
}

.error-message {
  margin: 0 0 var(--spacing-4) 0;
  color: var(--color-text-tertiary);
  line-height: var(--line-height-normal);
}

.error-actions {
  margin-bottom: var(--spacing-4);
}

.actions-title {
  margin: 0 0 var(--spacing-2) 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-tertiary);
}

.actions-list {
  margin: 0;
  padding-left: var(--spacing-5);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.actions-list li {
  margin-bottom: var(--spacing-1);
}

.error-details {
  margin-bottom: var(--spacing-4);
}

.error-details summary {
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-2);
}

.error-details pre {
  background-color: var(--color-gray-50);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);
  font-size: var(--font-size-xs);
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}

.error-buttons {
  display: flex;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}

.retry-button {
  padding: var(--spacing-2) var(--spacing-4);
  background-color: var(--color-text-tertiary);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color var(--transition-base);
}

.retry-button:hover {
  background-color: var(--color-text-primary);
}

.retry-button:active {
  transform: translateY(1px);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .error-box {
    padding: var(--spacing-5);
  }

  .error-title {
    font-size: var(--font-size-base);
  }

  .error-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-1);
  }
}
</style>