<script setup lang="ts">
interface Props {
  /**
   * Width variant: '300px' for standard cards, 'full' for full-width cards
   */
  width?: '300px' | 'full'
  /**
   * Border color (hex or rgb)
   */
  borderColor?: string
  /**
   * Background color (hex or rgb)
   */
  bgColor?: string
  /**
   * External link URL - makes the entire card clickable
   */
  href?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '300px',
  borderColor: 'var(--color-border-default)',
  bgColor: 'var(--color-bg-primary)',
  href: ''
})

const cardClasses = computed(() => {
  const classes = ['base-card']
  if (props.width === 'full') {
    classes.push('base-card--full')
  }
  if (props.href) {
    classes.push('base-card--clickable')
  }
  return classes.join(' ')
})

const cardStyles = computed(() => ({
  borderColor: props.borderColor,
  backgroundColor: props.bgColor,
  width: props.width === '300px' ? '300px' : '100%'
}))
</script>

<template>
  <a
    v-if="href"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    :class="cardClasses"
    :style="cardStyles"
  >
    <div v-if="$slots.header" class="base-card__header">
      <slot name="header" />
    </div>

    <div class="base-card__body">
      <slot name="body" />
    </div>

    <div v-if="$slots.bottom" class="base-card__bottom">
      <slot name="bottom" />
    </div>
  </a>
  <div v-else :class="cardClasses" :style="cardStyles">
    <div v-if="$slots.header" class="base-card__header">
      <slot name="header" />
    </div>

    <div class="base-card__body">
      <slot name="body" />
    </div>

    <div v-if="$slots.bottom" class="base-card__bottom">
      <slot name="bottom" />
    </div>
  </div>
</template>

<style scoped>
.base-card {
  background: var(--color-bg-primary);
  border: 2px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
  flex-shrink: 0;
  transition: all var(--transition-base);
  box-sizing: border-box;
}

.base-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.base-card--full {
  width: 100%;
}

.base-card--clickable {
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  display: block;
}

.base-card__header {
  margin-bottom: var(--spacing-4);
}

.base-card__body {
  flex: 1;
}

.base-card__bottom {
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-gray-100);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .base-card {
    padding: var(--spacing-4);
  }
}
</style>
