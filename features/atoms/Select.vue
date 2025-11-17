<script setup lang="ts">
interface SelectOption {
  value: string | number
  label: string
}

interface Props {
  /**
   * Select value (v-model support)
   */
  modelValue?: string | number
  /**
   * Select options
   */
  options: SelectOption[]
  /**
   * Placeholder text (shown as first disabled option)
   */
  placeholder?: string
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Disabled state
   */
  disabled?: boolean
  /**
   * Required field
   */
  required?: boolean
  /**
   * Error state
   */
  error?: boolean
  /**
   * Success state
   */
  success?: boolean
  /**
   * Full width select
   */
  fullWidth?: boolean
  /**
   * Select ID (for label association)
   */
  id?: string
  /**
   * Select name attribute
   */
  name?: string
  /**
   * Custom CSS classes
   */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  size: 'md',
  disabled: false,
  required: false,
  error: false,
  success: false,
  fullWidth: false,
  id: '',
  name: '',
  class: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'change': [event: Event]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
}>()

const selectClasses = computed(() => {
  const classes = [
    'select',
    `select--${props.size}`
  ]

  if (props.error) {
    classes.push('select--error')
  } else if (props.success) {
    classes.push('select--success')
  }

  if (props.disabled) {
    classes.push('select--disabled')
  }

  if (props.fullWidth) {
    classes.push('select--full-width')
  }

  if (props.class) {
    classes.push(props.class)
  }

  return classes.join(' ')
})

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
  emit('change', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}
</script>

<template>
  <select
    :id="id"
    :value="modelValue"
    :disabled="disabled"
    :required="required"
    :name="name"
    :class="selectClasses"
    @change="handleChange"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <option v-if="placeholder" value="" disabled>
      {{ placeholder }}
    </option>
    <option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>

<style scoped>
.select {
  font-family: inherit;
  border: var(--border-width-thin) solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: all var(--transition-base);
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 12px;
  padding-right: 2.5rem;
  appearance: none;
}

.select:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

/* Size variants */
.select--sm {
  padding: var(--spacing-1-5) var(--spacing-2-5);
  font-size: var(--font-size-sm);
}

.select--md {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-base);
}

.select--lg {
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-lg);
}

/* State variants */
.select--error {
  border-color: var(--color-danger-500);
}

.select--error:focus {
  border-color: var(--color-danger-500);
  box-shadow: 0 0 0 3px var(--color-danger-100);
}

.select--success {
  border-color: var(--color-success-500);
}

.select--success:focus {
  border-color: var(--color-success-500);
  box-shadow: 0 0 0 3px var(--color-success-100);
}

.select--disabled {
  background: var(--color-gray-100);
  color: var(--color-text-muted);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Full width */
.select--full-width {
  width: 100%;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .select--lg {
    padding: var(--spacing-2-5) var(--spacing-3-5);
    font-size: var(--font-size-base);
  }
}
</style>
