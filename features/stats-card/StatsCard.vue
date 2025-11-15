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
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stats-card__icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stats-card__content {
  flex: 1;
}

.stats-card__value {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
  margin-bottom: 4px;
}

.stats-card__label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

/* Variant styles */
.stats-card--primary .stats-card__icon {
  background: #dbeafe;
  color: #1e40af;
}

.stats-card--primary .stats-card__value {
  color: #1e40af;
}

.stats-card--success .stats-card__icon {
  background: #d1fae5;
  color: #065f46;
}

.stats-card--success .stats-card__value {
  color: #065f46;
}

.stats-card--warning .stats-card__icon {
  background: #fef3c7;
  color: #92400e;
}

.stats-card--warning .stats-card__value {
  color: #92400e;
}

.stats-card--info .stats-card__icon {
  background: #e0e7ff;
  color: #3730a3;
}

.stats-card--info .stats-card__value {
  color: #3730a3;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .stats-card {
    min-width: 160px;
    padding: 20px;
  }

  .stats-card__icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .stats-card__value {
    font-size: 20px;
  }

  .stats-card__label {
    font-size: 13px;
  }
}
</style>
