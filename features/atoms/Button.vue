<script setup lang="ts">
interface Props {
  /**
   * Button variant for styling
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Disabled state
   */
  disabled?: boolean
  /**
   * Button type attribute
   */
  type?: 'button' | 'submit' | 'reset'
  /**
   * Full width button
   */
  fullWidth?: boolean
  /**
   * Loading state
   */
  loading?: boolean
  /**
   * Custom CSS classes
   */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  type: 'button',
  fullWidth: false,
  loading: false,
  class: ''
})

const buttonClasses = computed(() => {
  const classes = [
    'button',
    `button--${props.variant}`,
    `button--${props.size}`
  ]

  if (props.fullWidth) {
    classes.push('button--full-width')
  }

  if (props.loading) {
    classes.push('button--loading')
  }

  if (props.class) {
    classes.push(props.class)
  }

  return classes.join(' ')
})

const isDisabled = computed(() => props.disabled || props.loading)
</script>

<template>
  <button
    :class="buttonClasses"
    :type="type"
    :disabled="isDisabled"
  >
    <span v-if="loading" class="button__spinner" />
    <span :class="{ 'button__content--loading': loading }">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  font-family: inherit;
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;
  position: relative;
  white-space: nowrap;
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.button:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Size variants */
.button--sm {
  padding: var(--spacing-1-5) var(--spacing-3);
  font-size: var(--font-size-sm);
}

.button--md {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
}

.button--lg {
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-base);
}

/* Variant styles */
.button--primary {
  background: var(--color-primary-600);
  color: var(--color-text-inverse);
}

.button--primary:hover:not(:disabled) {
  background: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.button--primary:active:not(:disabled) {
  transform: translateY(0);
}

.button--secondary {
  background: var(--color-gray-600);
  color: var(--color-text-inverse);
}

.button--secondary:hover:not(:disabled) {
  background: var(--color-gray-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.button--outline {
  background: transparent;
  color: var(--color-primary-600);
  border: var(--border-width-thin) solid var(--color-primary-600);
}

.button--outline:hover:not(:disabled) {
  background: var(--color-primary-50);
  transform: translateY(-1px);
}

.button--ghost {
  background: transparent;
  color: var(--color-text-secondary);
}

.button--ghost:hover:not(:disabled) {
  background: var(--color-gray-100);
  color: var(--color-text-primary);
}

.button--danger {
  background: var(--color-danger-600);
  color: var(--color-text-inverse);
}

.button--danger:hover:not(:disabled) {
  background: var(--color-danger-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Full width */
.button--full-width {
  width: 100%;
}

/* Loading state */
.button--loading {
  cursor: wait;
}

.button__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: var(--radius-full);
  animation: spin 0.6s linear infinite;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

@keyframes spin {
  to {
    transform: translateX(-50%) rotate(360deg);
  }
}

.button__content--loading {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .button--lg {
    padding: var(--spacing-2-5) var(--spacing-5);
    font-size: var(--font-size-sm);
  }
}
</style>
