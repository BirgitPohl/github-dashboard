<script setup lang="ts">
interface Props {
  /**
   * The main heading text
   */
  title: string
  /**
   * Optional description/subtitle text
   */
  description?: string
  /**
   * Alignment of the header content
   */
  align?: 'left' | 'center' | 'right'
  /**
   * Custom CSS classes
   */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  align: 'center',
  class: ''
})

// Compute CSS classes
const headerClasses = computed(() => {
  const classes = ['page-header', `page-header--${props.align}`]

  if (props.class) {
    classes.push(props.class)
  }

  return classes.join(' ')
})
</script>

<template>
  <header :class="headerClasses">
    <div class="page-header__content">
      <TypographyHeader
        :level="1"
        size="3xl"
        variant="primary"
        class="page-header__title"
      >
        {{ title }}
      </TypographyHeader>

      <p v-if="description" class="page-header__description">
        {{ description }}
      </p>

      <!-- Slot for additional actions or content -->
      <div v-if="$slots.actions" class="page-header__actions">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.page-header {
  margin-bottom: 32px;
}

.page-header--left {
  text-align: left;
}

.page-header--center {
  text-align: center;
}

.page-header--right {
  text-align: right;
}

.page-header__content {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header__title {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.page-header__description {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.page-header__actions {
  margin-top: 16px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-header {
    margin-bottom: 24px;
  }

  .page-header__title {
    font-size: 24px;
  }

  .page-header__description {
    font-size: 14px;
  }
}
</style>
