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
}

const props = withDefaults(defineProps<Props>(), {
  width: '300px',
  borderColor: '#e5e7eb',
  bgColor: 'white'
})

const cardClasses = computed(() => {
  return props.width === 'full' ? 'base-card base-card--full' : 'base-card'
})

const cardStyles = computed(() => ({
  borderColor: props.borderColor,
  backgroundColor: props.bgColor,
  width: props.width === '300px' ? '300px' : '100%'
}))
</script>

<template>
  <div :class="cardClasses" :style="cardStyles">
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
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  flex-shrink: 0;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.base-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.base-card--full {
  width: 100%;
}

.base-card__header {
  margin-bottom: 16px;
}

.base-card__body {
  flex: 1;
}

.base-card__bottom {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .base-card {
    padding: 16px;
  }
}
</style>
