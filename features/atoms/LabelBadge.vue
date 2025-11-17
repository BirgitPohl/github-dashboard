<script setup lang="ts">
interface Props {
  /**
   * Label name/text
   */
  name: string
  /**
   * Hex color (without #)
   */
  color: string
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Custom CSS classes
   */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  class: ''
})

// Compute CSS classes
const badgeClasses = computed(() => {
  const classes = ['label-badge', `label-badge--${props.size}`]

  if (props.class) {
    classes.push(props.class)
  }

  return classes.join(' ')
})

// Compute background color
const backgroundColor = computed(() => {
  return `#${props.color}`
})

// Calculate brightness to determine text color
const textColor = computed(() => {
  // Convert hex to RGB
  const hex = props.color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Calculate brightness using YIQ formula
  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  // Return black for light backgrounds, white for dark
  return brightness > 128 ? '#000000' : '#FFFFFF'
})
</script>

<template>
  <span
    :class="badgeClasses"
    :style="{
      backgroundColor: backgroundColor,
      color: textColor
    }"
  >
    {{ name }}
  </span>
</template>

<style scoped>
.label-badge {
  display: inline-block;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
  text-shadow: var(--shadow-text);
  white-space: nowrap;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.label-badge:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Size variants */
.label-badge--sm {
  padding: var(--spacing-0-25) var(--spacing-1-5);
  font-size: var(--font-size-xs);
  border-radius: var(--radius-lg);
}

.label-badge--md {
  padding: var(--spacing-0-5) var(--spacing-2);
  font-size: var(--font-size-xs);
}

.label-badge--lg {
  padding: var(--spacing-1) var(--spacing-2-5);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-xl);
}
</style>
