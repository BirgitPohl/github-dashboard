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
  padding: 24px;
  border-radius: 12px;
  border: 1px solid;
  background-color: #fff;
  max-width: 600px;
}

/* Error variant */
.error-box--error {
  border-color: #fecaca;
  background-color: #fef2f2;
}

.error-box--error .error-title {
  color: #dc2626;
}

/* Warning variant */
.error-box--warning {
  border-color: #fed7aa;
  background-color: #fff7ed;
}

.error-box--warning .error-title {
  color: #ea580c;
}

/* Info variant */
.error-box--info {
  border-color: #bfdbfe;
  background-color: #eff6ff;
}

.error-box--info .error-title {
  color: #2563eb;
}

.error-content {
  width: 100%;
}

.error-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.error-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
}

.error-code {
  padding: 2px 8px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
  font-weight: 500;
}

.error-message {
  margin: 0 0 16px 0;
  color: #374151;
  line-height: 1.5;
}

.error-actions {
  margin-bottom: 16px;
}

.actions-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.actions-list {
  margin: 0;
  padding-left: 20px;
  color: #6b7280;
  font-size: 14px;
}

.actions-list li {
  margin-bottom: 4px;
}

.error-details {
  margin-bottom: 16px;
}

.error-details summary {
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
}

.error-details pre {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  font-size: 12px;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}

.error-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.retry-button {
  padding: 8px 16px;
  background-color: #374151;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.retry-button:hover {
  background-color: #111827;
}

.retry-button:active {
  transform: translateY(1px);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .error-box {
    padding: 20px;
  }
  
  .error-title {
    font-size: 16px;
  }
  
  .error-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>