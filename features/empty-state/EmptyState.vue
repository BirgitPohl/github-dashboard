<script setup lang="ts">
interface Props {
  /**
   * Optional icon or emoji
   */
  icon?: string
  /**
   * Main title/heading
   */
  title: string
  /**
   * Description message
   */
  message?: string
  /**
   * Optional action button label
   */
  actionLabel?: string
  /**
   * Optional action button URL
   */
  actionUrl?: string
  /**
   * Whether the action URL is external
   */
  actionExternal?: boolean
  /**
   * Custom CSS classes
   */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: '',
  message: '',
  actionLabel: '',
  actionUrl: '',
  actionExternal: false,
  class: ''
})

// Compute CSS classes
const containerClasses = computed(() => {
  const classes = ['empty-state']

  if (props.class) {
    classes.push(props.class)
  }

  return classes.join(' ')
})
</script>

<template>
  <div :class="containerClasses">
    <div v-if="icon" class="empty-state__icon">
      {{ icon }}
    </div>

    <TypographyHeader
      :level="3"
      size="lg"
      variant="secondary"
      class="empty-state__title"
    >
      {{ title }}
    </TypographyHeader>

    <p v-if="message" class="empty-state__message">
      {{ message }}
    </p>

    <!-- Slot for custom content -->
    <div v-if="$slots.default" class="empty-state__content">
      <slot />
    </div>

    <!-- Action button -->
    <a
      v-if="actionLabel && actionUrl"
      :href="actionUrl"
      :target="actionExternal ? '_blank' : undefined"
      :rel="actionExternal ? 'noopener noreferrer' : undefined"
      class="empty-state__action"
    >
      {{ actionLabel }}
    </a>

    <!-- Slot for custom actions -->
    <div v-if="$slots.actions" class="empty-state__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: var(--spacing-20) var(--spacing-5);
}

.empty-state__icon {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--spacing-4);
  opacity: 0.8;
}

.empty-state__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-500);
  margin: 0 0 var(--spacing-2) 0;
}

.empty-state__message {
  color: var(--color-gray-500);
  margin: 0 0 var(--spacing-5) 0;
  line-height: var(--line-height-relaxed);
  font-size: var(--font-size-base);
}

.empty-state__content {
  margin: var(--spacing-5) 0;
}

.empty-state__action {
  display: inline-block;
  color: var(--color-blue-600);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-2) var(--spacing-4);
  border: var(--border-width-thin) solid var(--color-blue-600);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  font-size: var(--font-size-sm);
}

.empty-state__action:hover {
  background: var(--color-blue-600);
  color: var(--color-white);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.empty-state__actions {
  margin-top: var(--spacing-5);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .empty-state {
    padding: var(--spacing-15) var(--spacing-4);
  }

  .empty-state__icon {
    font-size: var(--font-size-3xl);
  }

  .empty-state__title {
    font-size: var(--font-size-lg);
  }

  .empty-state__message {
    font-size: var(--font-size-sm);
  }
}
</style>
