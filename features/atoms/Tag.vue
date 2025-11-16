<script setup lang="ts">
interface Props {
  /**
   * Tag label/text
   */
  label: string
  /**
   * Visual variant
   */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Removable tag (shows close button)
   */
  removable?: boolean
  /**
   * Clickable tag (shows hover state)
   */
  clickable?: boolean
  /**
   * Custom CSS classes
   */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  removable: false,
  clickable: false,
  class: ''
})

const emit = defineEmits<{
  click: []
  remove: []
}>()

const tagClasses = computed(() => {
  const classes = [
    'tag',
    `tag--${props.variant}`,
    `tag--${props.size}`
  ]

  if (props.clickable) {
    classes.push('tag--clickable')
  }

  if (props.class) {
    classes.push(props.class)
  }

  return classes.join(' ')
})

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}

const handleRemove = (e: Event) => {
  e.stopPropagation()
  emit('remove')
}
</script>

<template>
  <span
    :class="tagClasses"
    @click="handleClick"
  >
    <span class="tag__label">{{ label }}</span>
    <button
      v-if="removable"
      class="tag__remove"
      type="button"
      aria-label="Remove tag"
      @click="handleRemove"
    >
      ×
    </button>
  </span>
</template>

<style scoped>
.tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  transition: all var(--transition-base);
  border: 1px solid transparent;
}

.tag--clickable {
  cursor: pointer;
}

/* Size variants */
.tag--sm {
  padding: var(--spacing-0-25) var(--spacing-1-5);
  font-size: var(--font-size-2xs);
  border-radius: var(--radius-sm);
}

.tag--md {
  padding: var(--spacing-0-5) var(--spacing-2);
  font-size: var(--font-size-xs);
}

.tag--lg {
  padding: var(--spacing-1) var(--spacing-2-5);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-xl);
}

/* Variant styles */
.tag--default {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  border-color: var(--color-gray-200);
}

.tag--default.tag--clickable:hover {
  background: var(--color-gray-200);
  transform: translateY(-1px);
}

.tag--primary {
  background: var(--color-primary-100);
  color: var(--color-primary-800);
  border-color: var(--color-primary-200);
}

.tag--primary.tag--clickable:hover {
  background: var(--color-primary-200);
  transform: translateY(-1px);
}

.tag--success {
  background: var(--color-success-50);
  color: var(--color-success-700);
  border-color: var(--color-success-200);
}

.tag--success.tag--clickable:hover {
  background: var(--color-success-100);
  transform: translateY(-1px);
}

.tag--warning {
  background: var(--color-warning-50);
  color: var(--color-warning-700);
  border-color: var(--color-warning-200);
}

.tag--warning.tag--clickable:hover {
  background: var(--color-warning-100);
  transform: translateY(-1px);
}

.tag--danger {
  background: var(--color-danger-50);
  color: var(--color-danger-700);
  border-color: var(--color-danger-200);
}

.tag--danger.tag--clickable:hover {
  background: var(--color-danger-100);
  transform: translateY(-1px);
}

.tag--info {
  background: var(--color-info-50);
  color: var(--color-info-700);
  border-color: var(--color-info-200);
}

.tag--info.tag--clickable:hover {
  background: var(--color-info-100);
  transform: translateY(-1px);
}

.tag__label {
  line-height: 1;
}

.tag__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: var(--font-size-lg);
  line-height: 1;
  color: currentColor;
  opacity: 0.7;
  transition: all var(--transition-fast);
}

.tag__remove:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}
</style>
