<script setup lang="ts">
interface Props {
  /**
   * Text variant for styling
   */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'muted' | 'inverse' | 'success' | 'warning' | 'danger' | 'info'
  /**
   * Font size
   */
  size?: '2xs' | 'xs' | 'sm' | 'base' | 'lg' | 'xl'
  /**
   * Font weight
   */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  /**
   * Line height
   */
  lineHeight?: 'tight' | 'snug' | 'base' | 'normal' | 'relaxed'
  /**
   * HTML tag to render as
   */
  as?: 'p' | 'span' | 'div' | 'label'
  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right'
  /**
   * Truncate text with ellipsis
   */
  truncate?: boolean
  /**
   * Line clamp (multiline truncate)
   */
  lineClamp?: 1 | 2 | 3
  /**
   * Custom CSS classes
   */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'base',
  weight: 'normal',
  lineHeight: 'normal',
  as: 'p',
  align: 'left',
  truncate: false,
  class: ''
})

const textClasses = computed(() => {
  const classes = [
    'text',
    `text--${props.variant}`,
    `text--${props.size}`,
    `text--weight-${props.weight}`,
    `text--line-height-${props.lineHeight}`,
    `text--align-${props.align}`
  ]

  if (props.truncate) {
    classes.push('text--truncate')
  }

  if (props.lineClamp) {
    classes.push(`text--line-clamp-${props.lineClamp}`)
  }

  if (props.class) {
    classes.push(props.class)
  }

  return classes.join(' ')
})
</script>

<template>
  <component :is="as" :class="textClasses">
    <slot />
  </component>
</template>

<style scoped>
.text {
  margin: 0;
}

/* Color variants */
.text--primary {
  color: var(--color-text-primary);
}

.text--secondary {
  color: var(--color-text-secondary);
}

.text--tertiary {
  color: var(--color-text-tertiary);
}

.text--muted {
  color: var(--color-text-muted);
}

.text--inverse {
  color: var(--color-text-inverse);
}

.text--success {
  color: var(--color-success-700);
}

.text--warning {
  color: var(--color-warning-700);
}

.text--danger {
  color: var(--color-danger-700);
}

.text--info {
  color: var(--color-info-700);
}

/* Size variants */
.text--2xs {
  font-size: var(--font-size-2xs);
}

.text--xs {
  font-size: var(--font-size-xs);
}

.text--sm {
  font-size: var(--font-size-sm);
}

.text--base {
  font-size: var(--font-size-base);
}

.text--lg {
  font-size: var(--font-size-lg);
}

.text--xl {
  font-size: var(--font-size-xl);
}

/* Weight variants */
.text--weight-normal {
  font-weight: var(--font-weight-normal);
}

.text--weight-medium {
  font-weight: var(--font-weight-medium);
}

.text--weight-semibold {
  font-weight: var(--font-weight-semibold);
}

.text--weight-bold {
  font-weight: var(--font-weight-bold);
}

/* Line height variants */
.text--line-height-tight {
  line-height: var(--line-height-tight);
}

.text--line-height-snug {
  line-height: var(--line-height-snug);
}

.text--line-height-base {
  line-height: var(--line-height-base);
}

.text--line-height-normal {
  line-height: var(--line-height-normal);
}

.text--line-height-relaxed {
  line-height: var(--line-height-relaxed);
}

/* Alignment */
.text--align-left {
  text-align: left;
}

.text--align-center {
  text-align: center;
}

.text--align-right {
  text-align: right;
}

/* Truncate */
.text--truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Line clamp */
.text--line-clamp-1,
.text--line-clamp-2,
.text--line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.text--line-clamp-1 {
  -webkit-line-clamp: var(--line-clamp-1);
  line-clamp: var(--line-clamp-1);
}

.text--line-clamp-2 {
  -webkit-line-clamp: var(--line-clamp-2);
  line-clamp: var(--line-clamp-2);
}

.text--line-clamp-3 {
  -webkit-line-clamp: var(--line-clamp-3);
  line-clamp: var(--line-clamp-3);
}
</style>
