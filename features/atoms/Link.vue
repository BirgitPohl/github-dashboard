<script setup lang="ts">
interface Props {
  /**
   * Link destination (can be internal route or external URL)
   */
  to?: string
  /**
   * Link href (for external links)
   */
  href?: string
  /**
   * Visual variant
   */
  variant?: 'primary' | 'secondary' | 'muted' | 'inverse' | 'danger'
  /**
   * Size variant
   */
  size?: 'xs' | 'sm' | 'base' | 'lg'
  /**
   * Whether to show underline
   */
  underline?: boolean | 'hover'
  /**
   * Whether link is external
   */
  external?: boolean
  /**
   * Disabled state
   */
  disabled?: boolean
  /**
   * Custom CSS classes
   */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  to: '',
  href: '',
  variant: 'primary',
  size: 'base',
  underline: 'hover',
  external: false,
  disabled: false,
  class: ''
})

const linkClasses = computed(() => {
  const classes = [
    'link',
    `link--${props.variant}`,
    `link--${props.size}`
  ]

  if (props.underline === true) {
    classes.push('link--underline')
  } else if (props.underline === 'hover') {
    classes.push('link--underline-hover')
  }

  if (props.disabled) {
    classes.push('link--disabled')
  }

  if (props.class) {
    classes.push(props.class)
  }

  return classes.join(' ')
})

// Determine if we should use NuxtLink or regular anchor
const isInternalLink = computed(() => props.to && !props.external)
const linkTarget = computed(() => props.external ? '_blank' : undefined)
const linkRel = computed(() => props.external ? 'noopener noreferrer' : undefined)
</script>

<template>
  <NuxtLink
    v-if="isInternalLink"
    :to="to"
    :class="linkClasses"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <slot />
  </NuxtLink>
  <a
    v-else
    :href="href || to"
    :class="linkClasses"
    :target="linkTarget"
    :rel="linkRel"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <slot />
  </a>
</template>

<style scoped>
.link {
  color: var(--color-blue-600);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-base);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
}

.link:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.link--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Size variants */
.link--xs {
  font-size: var(--font-size-xs);
}

.link--sm {
  font-size: var(--font-size-sm);
}

.link--base {
  font-size: var(--font-size-base);
}

.link--lg {
  font-size: var(--font-size-lg);
}

/* Variant styles */
.link--primary {
  color: var(--color-blue-600);
}

.link--primary:hover:not(.link--disabled) {
  color: var(--color-blue-700);
}

.link--secondary {
  color: var(--color-text-secondary);
}

.link--secondary:hover:not(.link--disabled) {
  color: var(--color-text-primary);
}

.link--muted {
  color: var(--color-text-muted);
}

.link--muted:hover:not(.link--disabled) {
  color: var(--color-text-secondary);
}

.link--inverse {
  color: var(--color-text-inverse);
}

.link--inverse:hover:not(.link--disabled) {
  opacity: 0.9;
}

.link--danger {
  color: var(--color-danger-600);
}

.link--danger:hover:not(.link--disabled) {
  color: var(--color-danger-700);
}

/* Underline styles */
.link--underline {
  text-decoration: underline;
}

.link--underline-hover {
  text-decoration: none;
}

.link--underline-hover:hover:not(.link--disabled) {
  text-decoration: underline;
}
</style>
