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
  border-radius: 12px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.label-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

/* Size variants */
.label-badge--sm {
  padding: 1px 6px;
  font-size: 11px;
  border-radius: 10px;
}

.label-badge--md {
  padding: 2px 8px;
  font-size: 12px;
}

.label-badge--lg {
  padding: 4px 10px;
  font-size: 13px;
  border-radius: 14px;
}
</style>
