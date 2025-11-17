<script setup lang="ts">
interface Props {
  /**
   * Icon character/emoji
   */
  icon: string
  /**
   * Size variant
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  /**
   * Color variant
   */
  color?: 'primary' | 'secondary' | 'tertiary' | 'muted' | 'success' | 'warning' | 'danger' | 'info' | 'inherit'
  /**
   * Optional aria-label for accessibility
   */
  ariaLabel?: string
  /**
   * Whether the icon is decorative (hidden from screen readers)
   */
  decorative?: boolean
  /**
   * Custom CSS classes
   */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'inherit',
  ariaLabel: '',
  decorative: false,
  class: ''
})

const iconClasses = computed(() => {
  const classes = [
    'icon',
    `icon--${props.size}`,
    `icon--${props.color}`
  ]

  if (props.class) {
    classes.push(props.class)
  }

  return classes.join(' ')
})
</script>

<template>
  <span
    :class="iconClasses"
    :aria-label="ariaLabel || undefined"
    :aria-hidden="decorative ? 'true' : undefined"
    role="img"
  >
    {{ icon }}
  </span>
</template>

<style scoped>
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  flex-shrink: 0;
  user-select: none;
}

/* Size variants */
.icon--xs {
  font-size: var(--font-size-xs);
}

.icon--sm {
  font-size: var(--font-size-sm);
}

.icon--md {
  font-size: var(--font-size-base);
}

.icon--lg {
  font-size: var(--font-size-lg);
}

.icon--xl {
  font-size: var(--font-size-xl);
}

.icon--2xl {
  font-size: var(--font-size-2xl);
}

.icon--3xl {
  font-size: var(--font-size-3xl);
}

.icon--4xl {
  font-size: var(--font-size-4xl);
}

/* Color variants */
.icon--primary {
  color: var(--color-text-primary);
}

.icon--secondary {
  color: var(--color-text-secondary);
}

.icon--tertiary {
  color: var(--color-text-tertiary);
}

.icon--muted {
  color: var(--color-text-muted);
}

.icon--success {
  color: var(--color-success-700);
}

.icon--warning {
  color: var(--color-warning-700);
}

.icon--danger {
  color: var(--color-danger-700);
}

.icon--info {
  color: var(--color-info-700);
}

.icon--inherit {
  color: inherit;
}
</style>
