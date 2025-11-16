<script setup lang="ts">
interface Props {
  /**
   * The icon or emoji to display
   */
  icon: string
  /**
   * The main value/statistic
   */
  value: string | number
  /**
   * The label describing the statistic
   */
  label: string
  /**
   * Visual variant for styling
   */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info'
  /**
   * Custom CSS classes
   */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  class: ''
})

// Compute CSS classes
const cardClasses = computed(() => {
  const classes = ['stats-card', `stats-card--${props.variant}`]

  if (props.class) {
    classes.push(props.class)
  }

  return classes.join(' ')
})
</script>

<template>
  <div :class="cardClasses">
    <div class="stats-card__icon">
      {{ icon }}
    </div>
    <div class="stats-card__content">
      <div class="stats-card__value">{{ value }}</div>
      <div class="stats-card__label">{{ label }}</div>
    </div>
  </div>
</template>

<style scoped>
.stats-card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  box-shadow: var(--shadow-sm);
  min-width: 200px;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stats-card__icon {
  font-size: var(--font-size-2xl);
  width: 48px;
  height: 48px;
  background: var(--color-gray-100);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stats-card__content {
  flex: 1;
}

.stats-card__value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
  margin-bottom: var(--spacing-1);
}

.stats-card__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

/* Variant styles */
.stats-card--primary .stats-card__icon {
  background: var(--color-primary-100);
  color: var(--color-primary-800);
}

.stats-card--primary .stats-card__value {
  color: var(--color-primary-800);
}

.stats-card--success .stats-card__icon {
  background: var(--color-success-50);
  color: var(--color-success-700);
}

.stats-card--success .stats-card__value {
  color: var(--color-success-700);
}

.stats-card--warning .stats-card__icon {
  background: var(--color-warning-50);
  color: var(--color-warning-700);
}

.stats-card--warning .stats-card__value {
  color: var(--color-warning-700);
}

.stats-card--info .stats-card__icon {
  background: var(--color-info-50);
  color: var(--color-info-700);
}

.stats-card--info .stats-card__value {
  color: var(--color-info-700);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .stats-card {
    min-width: 160px;
    padding: var(--spacing-5);
  }

  .stats-card__icon {
    width: 40px;
    height: 40px;
    font-size: var(--font-size-xl);
  }

  .stats-card__value {
    font-size: var(--font-size-xl);
  }

  .stats-card__label {
    font-size: var(--font-size-xs);
  }
}
</style>
