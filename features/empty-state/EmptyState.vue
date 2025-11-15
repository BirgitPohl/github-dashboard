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
  padding: 80px 20px;
}

.empty-state__icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.8;
}

.empty-state__title {
  font-size: 20px;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.empty-state__message {
  color: #6b7280;
  margin: 0 0 20px 0;
  line-height: 1.5;
  font-size: 15px;
}

.empty-state__content {
  margin: 20px 0;
}

.empty-state__action {
  display: inline-block;
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border: 1px solid #2563eb;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 14px;
}

.empty-state__action:hover {
  background: #2563eb;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.empty-state__actions {
  margin-top: 20px;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .empty-state {
    padding: 60px 16px;
  }

  .empty-state__icon {
    font-size: 40px;
  }

  .empty-state__title {
    font-size: 18px;
  }

  .empty-state__message {
    font-size: 14px;
  }
}
</style>
