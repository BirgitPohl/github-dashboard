<script setup lang="ts">
interface Props {
  /**
   * Input value (v-model support)
   */
  modelValue?: string | number
  /**
   * Input type
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url'
  /**
   * Placeholder text
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
   * Readonly state
   */
  readonly?: boolean
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
   * Full width input
   */
  fullWidth?: boolean
  /**
   * Input ID (for label association)
   */
  id?: string
  /**
   * Input name attribute
   */
  name?: string
  /**
   * Autocomplete attribute
   */
  autocomplete?: string
  /**
   * Custom CSS classes
   */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  size: 'md',
  disabled: false,
  readonly: false,
  required: false,
  error: false,
  success: false,
  fullWidth: false,
  id: '',
  name: '',
  autocomplete: '',
  class: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'input': [event: Event]
  'change': [event: Event]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const slots = useSlots()

const hasTrailing = computed(() => !!slots.trailing)

const inputClasses = computed(() => {
  const classes = [
    'input',
    `input--${props.size}`
  ]

  if (props.error) {
    classes.push('input--error')
  } else if (props.success) {
    classes.push('input--success')
  }

  if (props.disabled) {
    classes.push('input--disabled')
  }

  if (props.fullWidth) {
    classes.push('input--full-width')
  }

  if (props.class) {
    classes.push(props.class)
  }

  return classes.join(' ')
})

const wrapperClasses = computed(() => {
  const classes = [
    'input-wrapper',
    `input-wrapper--${props.size}`
  ]

  if (props.error) {
    classes.push('input-wrapper--error')
  } else if (props.success) {
    classes.push('input-wrapper--success')
  }

  if (props.disabled) {
    classes.push('input-wrapper--disabled')
  }

  if (props.class) {
    classes.push(props.class)
  }

  return classes.join(' ')
})

// Expose input ref for parent components to focus
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  inputRef
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('input', event)
}

const handleChange = (event: Event) => {
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
  <div v-if="hasTrailing" :class="wrapperClasses">
    <input
      :id="id"
      ref="inputRef"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :name="name"
      :autocomplete="autocomplete"
      class="input-field"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
    >
    <span class="input-trailing">
      <slot name="trailing" />
    </span>
  </div>
  <input
    v-else
    :id="id"
    ref="inputRef"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    :name="name"
    :autocomplete="autocomplete"
    :class="inputClasses"
    @input="handleInput"
    @change="handleChange"
    @focus="handleFocus"
    @blur="handleBlur"
  >
</template>

<style scoped>
/* Wrapper for input with trailing icon */
.input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  border: var(--border-width-thin) solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  transition: all var(--transition-base);
  box-sizing: border-box;
}

.input-wrapper:focus-within {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.input-wrapper--sm {
  padding: var(--spacing-1-5) var(--spacing-2-5);
}

.input-wrapper--md {
  padding: var(--spacing-2) var(--spacing-3);
}

.input-wrapper--lg {
  padding: var(--spacing-3) var(--spacing-4);
}

.input-wrapper--error {
  border-color: var(--color-danger-500);
}

.input-wrapper--error:focus-within {
  border-color: var(--color-danger-500);
  box-shadow: 0 0 0 3px var(--color-danger-100);
}

.input-wrapper--success {
  border-color: var(--color-success-500);
}

.input-wrapper--success:focus-within {
  border-color: var(--color-success-500);
  box-shadow: 0 0 0 3px var(--color-success-100);
}

.input-wrapper--disabled {
  background: var(--color-gray-100);
  opacity: 0.6;
}

.input-field {
  flex: 1;
  border: none;
  background: transparent;
  font-family: inherit;
  color: var(--color-text-primary);
  outline: none;
  width: 100%;
  padding: 0;
}

.input-wrapper--sm .input-field {
  font-size: var(--font-size-sm);
}

.input-wrapper--md .input-field {
  font-size: var(--font-size-base);
}

.input-wrapper--lg .input-field {
  font-size: var(--font-size-lg);
}

.input-field::placeholder {
  color: var(--color-text-muted);
}

.input-field:disabled {
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.input-trailing {
  display: flex;
  align-items: center;
  margin-left: var(--spacing-2);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

/* Standalone input (no trailing slot) */
.input {
  font-family: inherit;
  border: var(--border-width-thin) solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: all var(--transition-base);
  width: 100%;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.input::placeholder {
  color: var(--color-text-muted);
}

/* Size variants */
.input--sm {
  padding: var(--spacing-1-5) var(--spacing-2-5);
  font-size: var(--font-size-sm);
}

.input--md {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-base);
}

.input--lg {
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-lg);
}

/* State variants */
.input--error {
  border-color: var(--color-danger-500);
}

.input--error:focus {
  border-color: var(--color-danger-500);
  box-shadow: 0 0 0 3px var(--color-danger-100);
}

.input--success {
  border-color: var(--color-success-500);
}

.input--success:focus {
  border-color: var(--color-success-500);
  box-shadow: 0 0 0 3px var(--color-success-100);
}

.input--disabled {
  background: var(--color-gray-100);
  color: var(--color-text-muted);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Full width */
.input--full-width {
  width: 100%;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .input--lg {
    padding: var(--spacing-2-5) var(--spacing-3-5);
    font-size: var(--font-size-base);
  }
}
</style>
