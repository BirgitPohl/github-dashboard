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
  background: var(--color-neutral-bright);
  color: var(--color-text-tertiary);
  border-color: var(--color-border-default);
}

.tag--default.tag--clickable:hover {
  background: var(--color-border-default);
  transform: translateY(-1px);
}

.tag--primary {
  background: var(--color-primary-bright);
  color: var(--color-primary-dark);
  border-color: var(--color-primary);
}

.tag--primary.tag--clickable:hover {
  background: var(--color-primary);
  color: var(--color-on-primary);
  transform: translateY(-1px);
}

.tag--success {
  background: var(--color-success-bright);
  color: var(--color-success-dark);
  border-color: var(--color-success);
}

.tag--success.tag--clickable:hover {
  background: var(--color-success);
  color: var(--color-on-success);
  transform: translateY(-1px);
}

.tag--warning {
  background: var(--color-warning-bright);
  color: var(--color-warning-dark);
  border-color: var(--color-warning);
}

.tag--warning.tag--clickable:hover {
  background: var(--color-warning);
  color: var(--color-on-warning);
  transform: translateY(-1px);
}

.tag--danger {
  background: var(--color-error-bright);
  color: var(--color-error-dark);
  border-color: var(--color-error);
}

.tag--danger.tag--clickable:hover {
  background: var(--color-error);
  color: var(--color-on-error);
  transform: translateY(-1px);
}

.tag--info {
  background: var(--color-info-bright);
  color: var(--color-info-dark);
  border-color: var(--color-info);
}

.tag--info.tag--clickable:hover {
  background: var(--color-info);
  color: var(--color-on-info);
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
  background: var(--color-bg-overlay-dark);
}
</style>
