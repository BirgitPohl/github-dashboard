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
    <Icon
      v-if="icon"
      :icon="icon"
      size="4xl"
      color="muted"
      class="empty-state__icon"
      decorative
    />

    <Header
      :level="3"
      size="lg"
      variant="secondary"
      class="empty-state__title"
    >
      {{ title }}
    </Header>

    <Text
      v-if="message"
      variant="secondary"
      size="base"
      line-height="relaxed"
      class="empty-state__message"
    >
      {{ message }}
    </Text>

    <!-- Slot for custom content -->
    <div v-if="$slots.default" class="empty-state__content">
      <slot />
    </div>

    <!-- Action button -->
    <Button
      v-if="actionLabel && actionUrl"
      variant="outline"
      :class="'empty-state__action'"
      @click="() => actionExternal ? window.open(actionUrl, '_blank') : $router.push(actionUrl)"
    >
      {{ actionLabel }}
    </Button>

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
  margin-bottom: var(--spacing-4);
  opacity: 0.8;
}

.empty-state__title {
  margin: 0 0 var(--spacing-2) 0;
}

.empty-state__message {
  margin: 0 0 var(--spacing-5) 0;
}

.empty-state__content {
  margin: var(--spacing-5) 0;
}

.empty-state__action {
  /* Styling provided by Button atom */
}

.empty-state__actions {
  margin-top: var(--spacing-5);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .empty-state {
    padding: var(--spacing-15) var(--spacing-4);
  }

  /* Responsive sizing handled by atomic components */
}
</style>
