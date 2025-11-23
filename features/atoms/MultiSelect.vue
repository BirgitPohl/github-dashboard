<script setup lang="ts">
interface SelectOption {
  value: string
  label: string
}

interface Props {
  /**
   * Selected values (v-model support)
   */
  modelValue?: string[]
  /**
   * Select options
   */
  options: SelectOption[]
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
   * Select ID (for label association)
   */
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  placeholder: 'Select...',
  size: 'md',
  disabled: false,
  id: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      searchQuery.value = ''
      nextTick(() => {
        searchInputRef.value?.focus()
      })
    }
  }
}

const isSelected = (value: string): boolean => {
  return props.modelValue?.includes(value) ?? false
}

const toggleOption = (value: string) => {
  const current = props.modelValue || []
  let newValue: string[]

  if (isSelected(value)) {
    newValue = current.filter(v => v !== value)
  } else {
    newValue = [...current, value]
  }

  emit('update:modelValue', newValue)
}

const displayLabel = computed(() => {
  const selected = props.modelValue || []
  if (selected.length === 0) {
    return props.placeholder
  }
  if (selected.length === 1) {
    const option = props.options.find(o => o.value === selected[0])
    return option?.label || selected[0]
  }
  return `${selected.length} selected`
})

const filteredOptions = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.options
  }
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(option =>
    option.label.toLowerCase().includes(query)
  )
})

const triggerClasses = computed(() => {
  const classes = ['multi-select-trigger', `multi-select-trigger--${props.size}`]
  if (props.disabled) {
    classes.push('multi-select-trigger--disabled')
  }
  if (isOpen.value) {
    classes.push('multi-select-trigger--open')
  }
  if ((props.modelValue?.length ?? 0) === 0) {
    classes.push('multi-select-trigger--placeholder')
  }
  return classes.join(' ')
})

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="multi-select" :class="{ 'multi-select--disabled': disabled }">
    <button
      :id="id"
      type="button"
      :class="triggerClasses"
      :disabled="disabled"
      @click="toggleDropdown"
    >
      <span class="multi-select-trigger__label">{{ displayLabel }}</span>
      <span class="multi-select-trigger__icon" :class="{ 'multi-select-trigger__icon--open': isOpen }">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
          <path fill="currentColor" d="M6 9L1 4h10z"/>
        </svg>
      </span>
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="multi-select-dropdown">
        <div class="multi-select-search">
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            class="multi-select-search__input"
            placeholder="Type to filter..."
            @click.stop
          >
        </div>
        <div class="multi-select-options">
          <label
            v-for="option in filteredOptions"
            :key="option.value"
            class="multi-select-option"
            :class="{ 'multi-select-option--selected': isSelected(option.value) }"
          >
            <input
              type="checkbox"
              :checked="isSelected(option.value)"
              class="multi-select-checkbox"
              @change="toggleOption(option.value)"
            >
            <span class="multi-select-option__checkmark">
              <svg v-if="isSelected(option.value)" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
            <span class="multi-select-option__label">{{ option.label }}</span>
          </label>
          <div v-if="filteredOptions.length === 0" class="multi-select-empty">
            No matches found
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.multi-select {
  position: relative;
  width: 100%;
}

.multi-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-family: inherit;
  border: var(--border-width-thin) solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: all var(--transition-base);
  cursor: pointer;
  text-align: left;
}

.multi-select-trigger:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.multi-select-trigger--open {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.multi-select-trigger--placeholder {
  color: var(--color-text-muted);
}

/* Size variants */
.multi-select-trigger--sm {
  padding: var(--spacing-1-5) var(--spacing-2-5);
  font-size: var(--font-size-sm);
}

.multi-select-trigger--md {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-base);
}

.multi-select-trigger--lg {
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-lg);
}

.multi-select-trigger--disabled {
  background: var(--color-gray-100);
  color: var(--color-text-muted);
  cursor: not-allowed;
  opacity: 0.6;
}

.multi-select-trigger__label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.multi-select-trigger__icon {
  margin-left: var(--spacing-2);
  color: var(--color-text-muted);
  transition: transform var(--transition-base);
}

.multi-select-trigger__icon--open {
  transform: rotate(180deg);
}

/* Dropdown panel */
.multi-select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--color-bg-primary);
  border: var(--border-width-thin) solid var(--color-border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

.multi-select-search {
  padding: var(--spacing-2);
  border-bottom: var(--border-width-thin) solid var(--color-border-default);
}

.multi-select-search__input {
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  font-family: inherit;
  border: var(--border-width-thin) solid var(--color-border-default);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: all var(--transition-base);
}

.multi-select-search__input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px var(--color-primary-100);
}

.multi-select-search__input::placeholder {
  color: var(--color-text-muted);
}

.multi-select-options {
  padding: var(--spacing-1);
  max-height: 200px;
  overflow-y: auto;
}

.multi-select-empty {
  padding: var(--spacing-3);
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.multi-select-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--transition-base);
}

.multi-select-option:hover {
  background-color: var(--color-gray-50);
}

.multi-select-option--selected {
  background-color: var(--color-primary-50);
}

.multi-select-option--selected:hover {
  background-color: var(--color-primary-100);
}

.multi-select-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.multi-select-option__checkmark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: var(--border-width-thin) solid var(--color-border-default);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
  color: var(--color-white);
  transition: all var(--transition-base);
}

.multi-select-option--selected .multi-select-option__checkmark {
  background: var(--color-primary-500);
  border-color: var(--color-primary-500);
}

.multi-select-option__label {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
