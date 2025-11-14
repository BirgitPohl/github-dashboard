<script setup lang="ts">
interface Props {
  /**
   * The heading level (h1, h2, h3, h4, h5, h6)
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6
  /**
   * Visual variant for styling
   */
  variant?: 'primary' | 'secondary'
  /**
   * Size variant (independent of heading level for accessibility)
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  /**
   * Custom classes to apply
   */
  class?: string
  /**
   * Whether to add margin bottom
   */
  marginBottom?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  level: 1,
  variant: 'primary',
  size: 'lg',
  class: '',
  marginBottom: true
})

// Compute the HTML tag based on level
const tag = computed(() => `h${props.level}`)

// Compute classes for styling
const headerClasses = computed(() => {
  const classes = [
    'typography-header',
    `typography-header--${props.size}`,
    `typography-header--${props.variant}`
  ]
  
  // Margin bottom
  if (props.marginBottom) {
    classes.push('typography-header--margin-bottom')
  }
  
  // Custom classes
  if (props.class) {
    classes.push(props.class)
  }
  
  return classes.join(' ')
})
</script>

<template>
  <component 
    :is="tag" 
    :class="headerClasses"
  >
    <slot />
  </component>
</template>

<style scoped>
/* Base header styles */
.typography-header {
  font-weight: 600;
  line-height: 1.2;
  color: #111827;
  transition: color 0.2s ease-in-out;
}

/* Margin bottom */
.typography-header--margin-bottom {
  margin-bottom: 0.5em;
}

/* Size variants */
.typography-header--xs {
  font-size: 0.75rem; /* 12px */
}

.typography-header--sm {
  font-size: 0.875rem; /* 14px */
}

.typography-header--md {
  font-size: 1rem; /* 16px */
}

.typography-header--lg {
  font-size: 1.125rem; /* 18px */
}

.typography-header--xl {
  font-size: 1.25rem; /* 20px */
}

.typography-header--2xl {
  font-size: 1.5rem; /* 24px */
}

.typography-header--3xl {
  font-size: 1.875rem; /* 30px */
  font-weight: bold;
}

/* Variant styles */
.typography-header--primary {
  color: #111827;
}

.typography-header--secondary {
  color: #6b7280;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .typography-header--3xl {
    font-size: 1.5rem; /* 24px on mobile */
  }
  
  .typography-header--2xl {
    font-size: 1.25rem; /* 20px on mobile */
  }
}
</style>